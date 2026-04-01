// frontend/app/epistemic/visualizer/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { deleteJSON, getJSON, imgSrc } from "@/lib/api";
import { useSearchParams } from "next/navigation";
import { PlayBar } from "@/components/PlayBar";
import { RunPicker } from "@/components/RunPicker";

type ListRes = { ids: string[] };
type MetaRes = {
  id: string;
  H: number;
  W: number;
  T: number;
  dt_seconds: number;
  horizon_steps: number;
  crs_code: string;
  cell_size_m: number;
};

type SeriesRes = {
  units?: string | null;
  eps: number;
  residual_driver?: string | null;
  residual_c?: number | null;
  c_arrival?: number | null;
  c_info?: number | null;
  mean_entropy: number[];
  delta_mean_entropy: number[];
  mdc_flag: number[]; // 0/1
  arrival_frac: number[];
  arrived_info_proxy: number[];
  residual_support?: number[];
  residual_arrived_info?: number[];
};

const TILE = 360;
const WARM_N = 10;
const TILE_TITLE_H = 58;
const PRELOAD_AHEAD = 2;

const TILE_BG_DARK = "#0f1115";
const TILE_BG_LIGHT = "#f5f5f5";

function tileBackgroundForTitle(title: string) {
  const s = String(title || "").toLowerCase();
  if (s.includes("entropy change")) return TILE_BG_DARK;
  if (s.includes("entropy")) return TILE_BG_LIGHT;
  return TILE_BG_DARK;
}

function tileBorderForTitle(title: string) {
  const s = String(title || "").toLowerCase();
  if (s.includes("entropy change")) return "1px solid rgba(255,255,255,0.10)";
  if (s.includes("entropy")) return "1px solid rgba(0,0,0,0.12)";
  return "1px solid rgba(0,0,0,0.18)";
}

function tileBoxShadowForTitle(title: string) {
  const s = String(title || "").toLowerCase();
  if (s.includes("entropy change")) return "0 6px 18px rgba(0,0,0,0.18)";
  if (s.includes("entropy")) return "0 6px 18px rgba(0,0,0,0.06)";
  return "0 6px 18px rgba(0,0,0,0.08)";
}

function tileFrameStyle(title: string) {
  return {
    background: tileBackgroundForTitle(title),
    border: tileBorderForTitle(title),
    boxShadow: tileBoxShadowForTitle(title),
  };
}

function entropyTrailOpacities(length: number) {
  if (length <= 1) return [1];
  const vals: number[] = [];
  for (let i = 0; i < length; i++) {
    if (i === 0) {
      vals.push(1.0);
    } else if (i === 1) {
      vals.push(0.75);
    } else if (i === 2) {
      vals.push(0.55);
    } else if (i === 3) {
      vals.push(0.38);
    } else if (i === 4) {
      vals.push(0.26);
    } else {
      vals.push(Math.max(0.14, 0.26 * Math.pow(0.86, i - 4)));
    }
  }
  return vals;
}

function deltaTrailOpacities(length: number) {
  if (length <= 1) return [1];
  const vals: number[] = [];
  for (let i = 0; i < length; i++) {
    if (i === 0) {
      vals.push(1.0);
    } else if (i === 1) {
      vals.push(0.55);
    } else if (i === 2) {
      vals.push(0.28);
    } else if (i === 3) {
      vals.push(0.14);
    } else if (i === 4) {
      vals.push(0.08);
    } else if (i === 5) {
      vals.push(0.05);
    } else {
      vals.push(Math.max(0.02, 0.05 * Math.pow(0.78, i - 5)));
    }
  }
  return vals;
}

function TrailTile({
  title,
  urls,
  opacityMode = "entropy",
}: {
  title: string;
  urls: string[];
  opacityMode?: "entropy" | "delta";
}) {

  const frameStyle = tileFrameStyle(title);
  const opacities =
    opacityMode === "delta"
      ? deltaTrailOpacities(urls.length)
      : entropyTrailOpacities(urls.length);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: TILE }}>
      <div
        className="small"
        style={{
          whiteSpace: "normal",
          overflowWrap: "anywhere",
          lineHeight: 1.25,
          minHeight: TILE_TITLE_H,
          display: "flex",
          alignItems: "flex-end",
          maxWidth: TILE,
        }}
      >
        {title}
      </div>
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: TILE,
          aspectRatio: "1 / 1",
          background: frameStyle.background,
          overflow: "hidden",
          borderRadius: 12,
          border: frameStyle.border,
          boxShadow: frameStyle.boxShadow,
        }}
      >
        {urls
          .slice()
          .reverse()
          .map((src, idxFromBack) => {
            const idx = urls.length - 1 - idxFromBack;
            if (!src) return null;
            return (
              <img
                key={`${title}-${idx}-${src}`}
                decoding="async"
                src={src}
                alt={title}
                draggable={false}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  pointerEvents: "none",
                  transform: "translateZ(0)",
                  imageRendering: "pixelated",
                  opacity: opacities[idx] ?? 0.08,
                }}
              />
            );
          })}
      </div>
    </div>
  );
}

function residualDriverLabel(driver: "support" | "arrived_info") {
  return driver === "support" ? "Support / arrival proxy" : "Arrived information proxy";
}

function delayProfileLabel(eps: number, arrivalIsFlat: boolean) {
  if (arrivalIsFlat) return "stable realized arrival rate";
  if (eps <= 0) return "free-drift diagnostic";
  return "thresholded decrease diagnostic";
}

function fmtNum(x: number | null | undefined, digits = 4) {
  if (typeof x !== "number" || !Number.isFinite(x)) return "—";
  const v = Math.abs(x) < 1e-12 ? 0 : x;
  return v.toFixed(digits);
}

function interpretDecreaseSummary(violationRate: number | null | undefined) {
  if (typeof violationRate !== "number" || !Number.isFinite(violationRate)) {
    return "Decrease interpretation unavailable.";
  }
  if (violationRate <= 0.20) return "Global entropy mostly decreases fast enough to satisfy the threshold.";
  if (violationRate <= 0.50) return "Global entropy sometimes satisfies the threshold, but the decrease is not robust.";
  if (violationRate <= 0.80) return "Global entropy often stalls relative to the thresholded decrease target.";
  return "Global entropy mostly fails to decrease at the thresholded rate.";
}

function interpretResidualSummary(rate: number | null | undefined) {
  if (typeof rate !== "number" || !Number.isFinite(rate)) {
    return "Residual interpretation unavailable.";
  }
  if (rate <= 0.20) return "The chosen residual explains the entropy motion well on most steps.";
  if (rate <= 0.50) return "The chosen residual partly explains the entropy motion, but not consistently.";
  if (rate <= 0.80) return "The chosen residual often fails to explain the entropy motion.";
  return "The chosen residual rarely explains the entropy motion well.";
}

function interpretArrivalProfile(arrivalIsFlat: boolean) {
  return arrivalIsFlat
    ? "Realized arrivals are essentially constant over time."
    : "Realized arrivals vary over time, so channel impairment is shaping what information actually arrives.";
}


function preload(url: string) {
  const im = new Image();
  im.decoding = "async";
  im.src = url;
}

function useAtomicImage(src: string, enabled: boolean = true) {
  const [shown, setShown] = useState<string>("");
  const lastGoodRef = useRef<string>("");

  useEffect(() => {
    if (!enabled) return;
    if (!src) return;
    if (src === lastGoodRef.current) return;

    let alive = true;
    const im = new Image();
    im.decoding = "async";
    im.onload = async () => {
      if (!alive) return;
      try {
        // @ts-ignore
        if (typeof im.decode === "function") await im.decode();
      } catch {}
      if (!alive) return;
      lastGoodRef.current = src;
      setShown(src);
    };
    im.onerror = () => {};
    im.src = src;

    return () => {
      alive = false;
    };
  }, [src, enabled]);

  return shown || lastGoodRef.current;
}

function Tile({ title, src }: { title: string; src: string }) {
  const frameStyle = tileFrameStyle(title);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: TILE }}>
      <div
        className="small"
        style={{
          whiteSpace: "normal",
          overflowWrap: "anywhere",
          lineHeight: 1.25,
          minHeight: TILE_TITLE_H,
          display: "flex",
          alignItems: "flex-end",
          maxWidth: TILE,
        }}
      >
        {title}
      </div>
      <div
        style={{
          width: "100%",
          maxWidth: TILE,
          aspectRatio: "1 / 1",
          background: frameStyle.background,
          overflow: "hidden",
          borderRadius: 12,
          border: frameStyle.border,
          boxShadow: frameStyle.boxShadow,
        }}
      >
        {src ? (
          <img
            decoding="async"
            src={src}
            alt={title}
            draggable={false}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              pointerEvents: "none",
              transform: "translateZ(0)",
              imageRendering: "pixelated",
            }}
          />
        ) : null}
      </div>
    </div>
  );
}

function SparkLine({
  title,
  values,
  cursorT,
  height = 120,
  precision = 4,
  subtitle,
}: {
  title: string;
  values: number[];
  cursorT: number;
  height?: number;
  precision?: number;
  subtitle?: string;
}) {
  const W = 980;
  const H = height;

  const n = values.length;
  const minV = n ? Math.min(...values) : 0;
  const maxV = n ? Math.max(...values) : 1;
  const span = maxV - minV || 1;

  const pts = values
    .map((v, i) => {
      const x = n <= 1 ? 0 : (i / (n - 1)) * (W - 1);
      const y = H - 1 - ((v - minV) / span) * (H - 1);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  const cx = n <= 1 ? 0 : (cursorT / (n - 1)) * (W - 1);
  const labelMin = minV.toFixed(precision);
  const labelMax = maxV.toFixed(precision);

  return (
    <div style={{ marginTop: 10 }}>
      <div className="small" style={{ marginBottom: 6 }}>
        {title}
      </div>
      <div
        style={{
          border: "1px solid rgba(0,0,0,0.12)",
          borderRadius: 10,
          padding: 10,
          background: "#fff",
        }}
      >
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
          <polyline fill="none" stroke="rgba(0,0,0,0.55)" strokeWidth="2" points={pts} />
          <line x1={cx} x2={cx} y1={0} y2={H} stroke="rgba(0,0,0,0.25)" strokeWidth="2" />
          <circle cx={cx} cy={0} r={5} fill="rgba(0,0,0,0.55)" />
        </svg>

        <div className="small" style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          <span>{labelMin}</span>
          <span>t</span>
          <span>{labelMax}</span>
        </div>

        {subtitle ? (
          <div className="small" style={{ marginTop: 6, opacity: 0.75 }}>
            {subtitle}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function EntropyWithMDC({
  units,
  eps,
  meanEntropy,
  mdcFlag,
  cursorT,
  height = 150,
}: {
  units?: string | null;
  eps: number;
  meanEntropy: number[];
  mdcFlag: number[];
  cursorT: number;
  height?: number;
}) {
  const W = 980;
  const H = height;
  const n = meanEntropy.length;

  const minV = n ? Math.min(...meanEntropy) : 0;
  const maxV = n ? Math.max(...meanEntropy) : 1;
  const span = maxV - minV || 1;

  const xOf = (i: number) => (n <= 1 ? 0 : (i / (n - 1)) * (W - 1));
  const yOf = (v: number) => H - 1 - ((v - minV) / span) * (H - 1);

  const cx = xOf(cursorT);

  const segs: { d: string; ok: boolean }[] = [];
  for (let i = 1; i < n; i++) {
    const x0 = xOf(i - 1);
    const y0 = yOf(meanEntropy[i - 1]);
    const x1 = xOf(i);
    const y1 = yOf(meanEntropy[i]);
    const ok = (mdcFlag[i] ?? 0) === 1;
    segs.push({ d: `M ${x0} ${y0} L ${x1} ${y1}`, ok });
  }

  const labelMin = minV.toFixed(5);
  const labelMax = maxV.toFixed(5);
  const unitLabel = units ? ` (${units})` : "";

  return (
    <div style={{ marginTop: 10 }}>
      <div className="small" style={{ marginBottom: 6 }}>
        Global outcome: mean entropy H̄(t){unitLabel}
      </div>

      <div
        style={{
          border: "1px solid rgba(0,0,0,0.12)",
          borderRadius: 10,
          padding: 10,
          background: "#fff",
        }}
      >
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
          {segs.map((s, k) => (
            <path
              key={k}
              d={s.d}
              fill="none"
              stroke={s.ok ? "rgba(0,140,70,0.85)" : "rgba(210,120,0,0.85)"}
              strokeWidth="2.5"
            />
          ))}
          <line x1={cx} x2={cx} y1={0} y2={H} stroke="rgba(0,0,0,0.25)" strokeWidth="2" />
          <circle cx={cx} cy={0} r={5} fill="rgba(0,0,0,0.55)" />
        </svg>

        <div className="small" style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          <span>{labelMin}</span>
          <span>t</span>
          <span>{labelMax}</span>
        </div>

        <div className="small" style={{ marginTop: 6, opacity: 0.8 }}>
          This is the run-level uncertainty outcome. Green segments satisfy the decrease target ΔH̄(t) ≤ −ε; amber segments do not. (ε={eps})
        </div>
      </div>
    </div>
  );
}

function DeltaEntropyDiagnostic({
  units,
  eps,
  deltaMeanEntropy,
  mdcFlag,
  cursorT,
  height = 120,
}: {
  units?: string | null;
  eps: number;
  deltaMeanEntropy: number[];
  mdcFlag: number[];
  cursorT: number;
  height?: number;
}) {
  const W = 980;
  const H = height;

  const n = deltaMeanEntropy.length;
  const unitLabel = units ? ` (${units})` : "";

  // Stable y-range that includes 0 and -eps
  const rawMin = n ? Math.min(...deltaMeanEntropy, -eps, 0) : -1;
  const rawMax = n ? Math.max(...deltaMeanEntropy, -eps, 0) : 1;
  const span0 = rawMax - rawMin || 1;

  const xOf = (i: number) => (n <= 1 ? 0 : (i / (n - 1)) * (W - 1));
  const yOf = (v: number) => H - 1 - ((v - rawMin) / span0) * (H - 1);

  const cx = xOf(cursorT);

  const y0 = yOf(0);
  const yThresh = yOf(-eps);

  // --- NEW: stagnation band [-eps, 0] ---
  const bandTop = Math.min(yThresh, y0);
  const bandBottom = Math.max(yThresh, y0);

  const segs: { d: string; ok: boolean }[] = [];
  for (let i = 1; i < n; i++) {
    const x0 = xOf(i - 1);
    const yA = yOf(deltaMeanEntropy[i - 1]);
    const x1 = xOf(i);
    const yB = yOf(deltaMeanEntropy[i]);
    const ok = (mdcFlag[i] ?? 0) === 1;
    segs.push({ d: `M ${x0} ${yA} L ${x1} ${yB}`, ok });
  }

  const labelMin = rawMin.toFixed(5);
  const labelMax = rawMax.toFixed(5);

  return (
    <div style={{ marginTop: 10 }}>
      <div className="small" style={{ marginBottom: 6 }}>
        Decrease diagnostic: ΔH̄(t){unitLabel} compared to −ε
      </div>

      <div
        style={{
          border: "1px solid rgba(0,0,0,0.12)",
          borderRadius: 10,
          padding: 10,
          background: "#fff",
        }}
      >
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
          {/* stagnation zone band [-eps, 0] */}
          <rect
            x={0}
            y={bandTop}
            width={W}
            height={Math.max(0, bandBottom - bandTop)}
            fill="rgba(210,120,0,0.10)"
          />

          {/* reference lines */}
          <line x1={0} x2={W} y1={y0} y2={y0} stroke="rgba(0,0,0,0.15)" strokeWidth="2" />
          <line
            x1={0}
            x2={W}
            y1={yThresh}
            y2={yThresh}
            stroke="rgba(0,0,0,0.22)"
            strokeWidth="2"
            strokeDasharray="6 6"
          />

          {/* colored segments */}
          {segs.map((s, k) => (
            <path
              key={k}
              d={s.d}
              fill="none"
              stroke={s.ok ? "rgba(0,140,70,0.85)" : "rgba(210,120,0,0.85)"}
              strokeWidth="2.5"
            />
          ))}

          {/* cursor */}
          <line x1={cx} x2={cx} y1={0} y2={H} stroke="rgba(0,0,0,0.25)" strokeWidth="2" />
          <circle cx={cx} cy={0} r={5} fill="rgba(0,0,0,0.55)" />
        </svg>

        <div className="small" style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          <span>{labelMin}</span>
          <span>t</span>
          <span>{labelMax}</span>
        </div>

        <div className="small" style={{ marginTop: 6, opacity: 0.8 }}>
          This plot asks whether entropy is decreasing fast enough. The shaded band [−ε, 0] is a stagnation region; the dashed line is the required threshold −ε. (ε={eps})
        </div>
      </div>
    </div>
  );
}

function ResidualDiagnostic({
  units,
  title,
  eps,
  residual,
  cursorT,
  height = 120,
}: {
  units?: string | null;
  title: string;
  eps: number;
  residual: number[];
  cursorT: number;
  height?: number;
}) {
  const W = 980;
  const H = height;

  const n = residual.length;
  const unitLabel = units ? ` (${units})` : "";

  // Range includes 0 and the "stagnation band" [0, eps] if eps>0 (for residual; violation is >0)
  const rawMin = n ? Math.min(...residual, 0) : -1;
  const rawMax = n ? Math.max(...residual, 0, eps) : 1;
  const span0 = rawMax - rawMin || 1;

  const xOf = (i: number) => (n <= 1 ? 0 : (i / (n - 1)) * (W - 1));
  const yOf = (v: number) => H - 1 - ((v - rawMin) / span0) * (H - 1);

  const cx = xOf(cursorT);
  const y0 = yOf(0);
  const yEps = yOf(eps);

  // Optional "near-zero" band [0, eps] (if eps>0)
  const bandTop = Math.min(y0, yEps);
  const bandBottom = Math.max(y0, yEps);

  const segs: { d: string; ok: boolean }[] = [];
  for (let i = 1; i < n; i++) {
    const x0 = xOf(i - 1);
    const yA = yOf(residual[i - 1]);
    const x1 = xOf(i);
    const yB = yOf(residual[i]);
    // Residual ok means <= 0 (supermartingale-style residual non-positive)
    const ok = (residual[i] ?? 0) <= 0;
    segs.push({ d: `M ${x0} ${yA} L ${x1} ${yB}`, ok });
  }

  const labelMin = rawMin.toFixed(5);
  const labelMax = rawMax.toFixed(5);

  return (
    <div style={{ marginTop: 10 }}>
      <div className="small" style={{ marginBottom: 6 }}>
        Explanatory residual: {title}{unitLabel}
      </div>

      <div
        style={{
          border: "1px solid rgba(0,0,0,0.12)",
          borderRadius: 10,
          padding: 10,
          background: "#fff",
        }}
      >
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
          {/* small neutral band near zero (optional) */}
          {eps > 0 ? (
            <rect
              x={0}
              y={bandTop}
              width={W}
              height={Math.max(0, bandBottom - bandTop)}
              fill="rgba(0,0,0,0.04)"
            />
          ) : null}

          {/* zero line */}
          <line x1={0} x2={W} y1={y0} y2={y0} stroke="rgba(0,0,0,0.15)" strokeWidth="2" />

          {/* colored residual segments */}
          {segs.map((s, k) => (
            <path
              key={k}
              d={s.d}
              fill="none"
              stroke={s.ok ? "rgba(0,140,70,0.85)" : "rgba(210,120,0,0.85)"}
              strokeWidth="2.5"
            />
          ))}

          {/* cursor */}
          <line x1={cx} x2={cx} y1={0} y2={H} stroke="rgba(0,0,0,0.25)" strokeWidth="2" />
          <circle cx={cx} cy={0} r={5} fill="rgba(0,0,0,0.55)" />
        </svg>

        <div className="small" style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          <span>{labelMin}</span>
          <span>t</span>
          <span>{labelMax}</span>
        </div>

        <div className="small" style={{ marginTop: 6, opacity: 0.8 }}>
          This plot asks whether the chosen arrival-based explanation accounts for the entropy motion. Green means residual ≤ 0; amber means the explanation is insufficient on that step.
        </div>
      </div>
    </div>
  );
}

export default function BeliefLabVisualizerPage() {
  const searchParams = useSearchParams();
  const qid = searchParams.get("id") || "";

  const [ids, setIds] = useState<string[]>([]);
  const [id, setId] = useState("");
  const [meta, setMeta] = useState<MetaRes | null>(null);

  const [t, setT] = useState(0);
  const [loop, setLoop] = useState(true);

  const [series, setSeries] = useState<SeriesRes | null>(null);

  const [busyDelete, setBusyDelete] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState<string>("");

  const warmedKeyRef = useRef<string>("");

  const [showTemporalTrail, setShowTemporalTrail] = useState(true);
  const [trailLength, setTrailLength] = useState(6);

  // MDC residual driver choice
  const [residualDriver, setResidualDriver] = useState<"support" | "arrived_info">("support");


  useEffect(() => {
    getJSON<ListRes>("/epistemic/list")
      .then((r) => setIds(r.ids))
      .catch(console.error);
  }, []);

  // If opened with ?id=epi-..., preselect it and auto-load.
  useEffect(() => {
    if (!qid) return;
    setId(qid);
  }, [qid]);

  useEffect(() => {
    if (!id) {
      setMeta(null);
      setSeries(null);
      return;
    }

    setDeleteMsg("");

    getJSON<MetaRes>(`/epistemic/${id}/meta`)
      .then((m) => {
        setMeta(m);
        setT(0);
      })
      .catch(console.error);

    getJSON<SeriesRes>(`/epistemic/${id}/series`)
      .then((s) => setSeries(s))
      .catch((e) => {
        console.error(e);
        setSeries(null);
      });
  }, [id]);

  const T = meta?.T ?? 1;
  const tt = meta ? Math.min(t, Math.max(0, meta.T - 1)) : 0;

  // Raw URLs for current t
  const beliefUrl = id && meta ? imgSrc(`/epistemic/${id}/t/${tt}/belief.png`) : "";
  const entropyUrl = id && meta ? imgSrc(`/epistemic/${id}/t/${tt}/entropy.png`) : "";
  const dHUrl = id && meta ? imgSrc(`/epistemic/${id}/t/${tt}/delta_entropy_sign.png`) : "";
  const supportUrl = id && meta ? imgSrc(`/epistemic/${id}/t/${tt}/support_mask.png`) : "";
  const arrivedUrl = id && meta ? imgSrc(`/epistemic/${id}/t/${tt}/arrived_on_support.png`) : "";


  // Atomic swap display sources
  const shownBelief = useAtomicImage(beliefUrl, !!(id && meta));
  const shownEntropy = useAtomicImage(entropyUrl, !!(id && meta));
  const shownDH = useAtomicImage(dHUrl, !!(id && meta));
  const shownSupport = useAtomicImage(supportUrl, !!(id && meta));
  const shownArrived = useAtomicImage(arrivedUrl, !!(id && meta));

  const entropyTrailUrls = useMemo(() => {
    if (!id || !meta) return [];
    const n = Math.max(1, Math.min(trailLength, tt + 1));
    const urls: string[] = [];
    for (let k = 0; k < n; k++) {
      const tBack = tt - k;
      if (tBack < 0) break;
      urls.push(imgSrc(`/epistemic/${id}/t/${tBack}/entropy.png`));
    }
    return urls;
  }, [id, meta, tt, trailLength]);

  const deltaEntropyTrailUrls = useMemo(() => {
    if (!id || !meta) return [];
    const n = Math.max(1, Math.min(trailLength, tt + 1));
    const urls: string[] = [];
    for (let k = 0; k < n; k++) {
      const tBack = tt - k;
      if (tBack < 0) break;
      urls.push(imgSrc(`/epistemic/${id}/t/${tBack}/delta_entropy_sign.png`));
    }
    return urls;
  }, [id, meta, tt, trailLength]);

  // Warm cache first N frames (and legends)
  useEffect(() => {
    if (!id || !meta) return;
    const warmN = Math.min(meta.T, WARM_N);

    const warmKey = `${id}|T=${meta.T}`;
    if (warmedKeyRef.current === warmKey) return;
    warmedKeyRef.current = warmKey;

    const doWarm = () => {
      for (let k = 0; k < warmN; k++) {
        preload(imgSrc(`/epistemic/${id}/t/${k}/belief.png`));
        preload(imgSrc(`/epistemic/${id}/t/${k}/entropy.png`));
        preload(imgSrc(`/epistemic/${id}/t/${k}/delta_entropy_sign.png`));
        preload(imgSrc(`/epistemic/${id}/t/${k}/support_mask.png`));
        preload(imgSrc(`/epistemic/${id}/t/${k}/arrived_on_support.png`));
      }
      preload(imgSrc(`/epistemic/${id}/legend/belief.png`));
      preload(imgSrc(`/epistemic/${id}/legend/entropy.png`));
      preload(imgSrc(`/epistemic/${id}/legend/delta_entropy_sign.png`));
      preload(imgSrc(`/epistemic/${id}/legend/support_mask.png`));
      preload(imgSrc(`/epistemic/${id}/legend/arrived_mask.png`));
    };

    // @ts-ignore
    if (typeof requestIdleCallback !== "undefined") requestIdleCallback(doWarm);
    else setTimeout(doWarm, 0);
  }, [id, meta?.T]);

  // Rolling preload ahead
  useEffect(() => {
    if (!id || !meta) return;
    if (meta.T <= 1) return;

    for (let k = 1; k <= PRELOAD_AHEAD; k++) {
      const nextT = tt + k < meta.T ? tt + k : loop ? (tt + k) % meta.T : tt;
      if (nextT === tt) continue;

      preload(imgSrc(`/epistemic/${id}/t/${nextT}/belief.png`));
      preload(imgSrc(`/epistemic/${id}/t/${nextT}/entropy.png`));
      preload(imgSrc(`/epistemic/${id}/t/${nextT}/delta_entropy_sign.png`));
      preload(imgSrc(`/epistemic/${id}/t/${nextT}/support_mask.png`));
      preload(imgSrc(`/epistemic/${id}/t/${nextT}/arrived_on_support.png`));
    }

    for (let k = 1; k <= Math.max(0, trailLength); k++) {
      const prevT = tt - k;
      if (prevT < 0) break;
      preload(imgSrc(`/epistemic/${id}/t/${prevT}/entropy.png`));
      preload(imgSrc(`/epistemic/${id}/t/${prevT}/delta_entropy_sign.png`));
    }
  }, [id, meta, tt, loop, trailLength]);

  async function onDelete() {
    if (!id || busyDelete) return;
    const ok = window.confirm(`Delete Belief Lab run ${id}?\nThis removes manifest, fields, renders, and metrics.`);
    if (!ok) return;

    setBusyDelete(true);
    setDeleteMsg("");

    try {
      await deleteJSON(`/epistemic/${id}`);
      setDeleteMsg(`Deleted ${id}.`);
      const r = await getJSON<ListRes>("/epistemic/list");
      setIds(r.ids);
      setId("");
      setMeta(null);
      setSeries(null);
    } catch (e: any) {
      // If backend returns 409 with dependents / analysis references, offer a warning confirm then retry with force=true.
      const status = e?.status;
      const detail = e?.detail;
      const dependents: string[] =
        status === 409 && detail && Array.isArray(detail.dependents) ? (detail.dependents as string[]) : [];
      const anaRefs: string[] =
        status === 409 && detail && Array.isArray(detail.referenced_by_ana) ? (detail.referenced_by_ana as string[]) : [];

      if (status === 409 && (dependents.length || anaRefs.length)) {
        const sections: string[] = [];
        if (dependents.length) {
          sections.push(
            `This Belief Lab run (${id}) is referenced by ${dependents.length} operational run(s):\n\n` +
              dependents.map((x) => `• ${x}`).join("\n")
          );
        }
        if (anaRefs.length) {
          sections.push(
            `It is also referenced by ${anaRefs.length} analysis stud${anaRefs.length === 1 ? "y" : "ies"}:\n\n` +
              anaRefs.map((x) => `• ${x}`).join("\n")
          );
        }

        const msg =
          sections.join("\n\n") +
          `\n\nDeleting the Belief Lab run will NOT delete those dependent artifacts.\n` +
          `They may remain partially viewable, but provenance links to the Belief Lab source will be gone.\n\n` +
          `Delete anyway?`;

        const okForce = window.confirm(msg);
        if (!okForce) {
          setDeleteMsg("");
          return;
        }

        try {
          await deleteJSON(`/epistemic/${id}?force=true`);
          setDeleteMsg(`Deleted ${id}.`);
          const r = await getJSON<ListRes>("/epistemic/list");
          setIds(r.ids);
          setId("");
          setMeta(null);
          setSeries(null);
          return;
        } catch (e2: any) {
          console.error(e2);
          setDeleteMsg(e2?.message ?? "Delete failed.");
          return;
        }
      }

      console.error(e);
      setDeleteMsg(e?.message ?? "Delete failed.");
    } finally {
      setBusyDelete(false);
    }
  }

  const canPlot = !!(series && series.mean_entropy && series.mean_entropy.length > 0);

  const arrivalIsFlat = useMemo(() => {
    if (!series) return false;
    const a = series.arrival_frac;
    if (!a?.length) return false;
    const mn = Math.min(...a);
    const mx = Math.max(...a);
    return Math.abs(mx - mn) < 1e-12;
  }, [series]);

  // --- NEW: violation-rate summary ---
  const violationSummary = useMemo(() => {
    if (!series) return null;
    const eps = series.eps ?? 0;
    const d = series.delta_mean_entropy ?? [];
    if (!d.length) return null;

    // consider all indices 1..(T-1) as “steps”; ignore any leading padding if present
    let count = 0;
    let viol = 0;

    for (let i = 0; i < d.length; i++) {
      const v = d[i];
      if (!Number.isFinite(v)) continue;
      count += 1;
      if (v > -eps) viol += 1;
    }

    if (count === 0) return null;

    const violRate = viol / count;
    const okRate = 1 - violRate;

    return {
      count,
      viol,
      violRate,
      okRate,
      eps,
    };
  }, [series]);

  const residual = useMemo(() => {
    if (!series) return null;
    if (residualDriver === "support") return series.residual_support ?? null;
    return series.residual_arrived_info ?? null;
  }, [series, residualDriver]);

  const residualTitle = useMemo(() => {
    const c = residualDriver === "support" ? series?.c_arrival : series?.c_info;
    const cStr = Number.isFinite(c) ? ` (c=${Number(c).toFixed(4)})` : "";
    if (residualDriver === "support") {
      return `Residual r(t)=ΔH̄(t)+c·a(t)${cStr}`;
    }
    return `Residual r(t)=ΔH̄(t)+c·Ĩ(t)${cStr}`;
  }, [series, residualDriver]);

  const residualViolationSummary = useMemo(() => {
    if (!residual?.length) return null;
    let count = 0;
    let viol = 0;
    for (let i = 0; i < residual.length; i++) {
      const v = residual[i];
      if (!Number.isFinite(v)) continue;
      count += 1;
      if (v > 0) viol += 1;
    }
    if (!count) return null;
    return { count, viol, rate: viol / count };
  }, [residual]);

  const cursorSummary = useMemo(() => {
    if (!series) return null;
    const at = (arr?: number[]) => {
      if (!arr?.length) return null;
      const i = Math.min(tt, arr.length - 1);
      const v = arr[i];
      return Number.isFinite(v) ? v : null;
    };
    return {
      meanEntropy: at(series.mean_entropy),
      deltaMeanEntropy: at(series.delta_mean_entropy),
      arrivalFrac: at(series.arrival_frac),
      arrivedInfoProxy: at(series.arrived_info_proxy),
      residualSupport: at(series.residual_support),
      residualArrivedInfo: at(series.residual_arrived_info),
    };
  }, [series, tt]);

  const visualizerInterpretation = useMemo(() => {
    if (!series) return "Belief Lab shows support, arrivals, belief, entropy, and residual diagnostics without deployment policy.";
    return `This run emphasizes ${residualDriverLabel(residualDriver).toLowerCase()} with ${delayProfileLabel(series.eps ?? 0, arrivalIsFlat)}.`;
  }, [series, residualDriver, arrivalIsFlat]);

  const interpretationBlock = useMemo(() => {
    if (!series) return null;

    const decreaseText = interpretDecreaseSummary(violationSummary?.violRate ?? null);
    const residualText = interpretResidualSummary(residualViolationSummary?.rate ?? null);
    const arrivalText = interpretArrivalProfile(arrivalIsFlat);

    const meanArrival =
      series.arrival_frac?.length > 0
        ? series.arrival_frac.reduce((a, b) => a + b, 0) / series.arrival_frac.length
        : null;
    const meanInfo =
      series.arrived_info_proxy?.length > 0
        ? series.arrived_info_proxy.reduce((a, b) => a + b, 0) / series.arrived_info_proxy.length
        : null;

    return {
      decreaseText,
      residualText,
      arrivalText,
      meanArrival,
      meanInfo,
    };
  }, [series, violationSummary, residualViolationSummary, arrivalIsFlat]);

  // Keep all line-plot SVGs the same height for a clean grid
  const PLOT_H = 150;

  // Match Operational Visualizer behavior: show delete failures in red.
  const deleteIsError =
    !!deleteMsg &&
    (deleteMsg.startsWith("DELETE ") ||
      deleteMsg.toLowerCase().includes("failed") ||
      deleteMsg.toLowerCase().includes("conflict") ||
      deleteMsg.includes("409"));

  return (
    <div className="card">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <h2 style={{ marginTop: 0 }}>Belief Lab Visualizer</h2>
      </div>
      <div aria-hidden className="section-stripe section-stripe--epistemic" style={{ marginTop: 0 }} />
      <div className="small" style={{ opacity: 0.86, lineHeight: 1.45, marginTop: 8 }}>
        Belief Lab visualizes policy-free support, impairments, arrived observations,
        belief evolution, entropy evolution, and MDC-style residual diagnostics using
        the same belief/update semantics that Operational uses internally.
      </div>
      <div className="card" style={{ marginTop: 10 }}>
        <h2 style={{ marginTop: 0 }}>What this visualizer is for</h2>
        <div className="small" style={{ opacity: 0.86, lineHeight: 1.5 }}>
          Use this page to inspect whether the prescribed support actually produces arrivals,
          how those arrivals change belief and entropy, and whether the resulting entropy
          trend satisfies your chosen decrease threshold.
        </div>
        <div className="small" style={{ opacity: 0.78, lineHeight: 1.45, marginTop: 6 }}>
          It is most useful for questions like:
          {" "}“is the channel degrading information delivery?”,
          {" "}“does this support geometry keep entropy moving downward?”,
          {" "}and “how different are the support-proxy and arrived-information residual views?”
        </div>
        <div className="small" style={{ opacity: 0.82, marginTop: 8 }}>
          Current interpretation: <b>{visualizerInterpretation}</b>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          marginTop: 0,
        }}
      >
        <div style={{ flex: "1 1 420px", minWidth: 320 }}>
          <RunPicker label="Select Belief Lab Run" ids={ids} value={id} onChange={setId} />
        </div>

        <button onClick={onDelete} disabled={!id || busyDelete} style={{ height: 34 }}>
          {busyDelete ? "Deleting…" : "Delete Run"}
        </button>
      </div>

      {deleteMsg ? (
        deleteIsError ? (
          <div className="card" style={{ border: "1px solid #f3c1c1", marginTop: 8 }}>
            <h2 style={{ marginTop: 0 }}>Delete failed</h2>
            <pre style={{ whiteSpace: "pre-wrap", margin: 0, color: "crimson", fontSize: 12 }}>
              {deleteMsg}
            </pre>
          </div>
        ) : (
          <div className="small" style={{ marginTop: 8, opacity: 0.8 }}>
            {deleteMsg}
          </div>
        )
      ) : null}

      {meta ? (
        <>
          <div className="small">
            Grid {meta.H}×{meta.W}, T={meta.T}
          </div>

          {/* Play bar row + residual driver control (same line to save vertical space) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
              marginTop: 6,
            }}
          >
            <div style={{ flex: "1 1 520px", minWidth: 320 }}>
              <PlayBar t={t} setT={setT} T={T} loop={loop} setLoop={setLoop} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <label className="small" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={showTemporalTrail}
                  onChange={(e) => setShowTemporalTrail(e.target.checked)}
                />
                <span>Hold and fade entropy fields</span>
              </label>

              {showTemporalTrail ? (
                <label className="small" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span>trail frames</span>
                  <input
                    type="range"
                    min={2}
                    max={8}
                    step={1}
                    value={trailLength}
                    onChange={(e) => setTrailLength(parseInt(e.target.value, 10) || 4)}
                  />
                  <span>{trailLength}</span>
                </label>
              ) : null}
            </div>
            {canPlot ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, flex: "0 0 auto" }}>
                <div className="small" style={{ opacity: 0.85 }}>
                  Residual driver:
                </div>
                <select
                  value={residualDriver}
                  onChange={(e) => setResidualDriver(e.target.value as "support" | "arrived_info")}
                  style={{ padding: "6px 8px", borderRadius: 8, border: "1px solid rgba(0,0,0,0.18)" }}
                >
                  <option value="support">Support / arrival proxy a(t)</option>
                  <option value="arrived_info">Arrived information proxy Ĩ(t)</option>
                </select>
              </div>
            ) : null}
          </div>
          {cursorSummary ? (
            <div className="card" style={{ marginTop: 12 }}>
              <h2 style={{ marginTop: 0 }}>Current frame summary</h2>
              <div className="small" style={{ lineHeight: 1.45 }}>
                <div>
                  step=<b>{tt}</b>
                  {" "}· mean entropy=<b>{fmtNum(cursorSummary.meanEntropy, 5)}</b>
                  {" "}· Δ mean entropy=<b>{fmtNum(cursorSummary.deltaMeanEntropy, 6)}</b>
                </div>
                <div>
                  arrived fraction=<b>{fmtNum(cursorSummary.arrivalFrac, 4)}</b>
                  {" "}· arrived information proxy=<b>{fmtNum(cursorSummary.arrivedInfoProxy, 4)}</b>
                </div>
                <div>
                  support-proxy residual=<b>{fmtNum(cursorSummary.residualSupport, 6)}</b>
                  {" "}· information residual=<b>{fmtNum(cursorSummary.residualArrivedInfo, 6)}</b>
                </div>
                <div style={{ marginTop: 6, opacity: 0.8 }}>
                  Read the image row together with this summary:
                  prescribed support shows where sensing was requested,
                  arrived mask shows what actually arrived after impairment,
                  and the plots show how realized arrivals propagate into information delivery, entropy outcome, and residual diagnostics.
                </div>
              </div>
            </div>
          ) : null}

          {canPlot ? (
            <>
              {/* summary line (small, publication-friendly) */}
              {violationSummary ? (
                <div className="small" style={{ marginTop: 8, opacity: 0.85 }}>
                  MDC violation rate:{" "}
                  <b>{(violationSummary.violRate * 100).toFixed(1)}%</b> ({violationSummary.viol}/
                  {violationSummary.count}) where ΔH̄(t) &gt; −ε. &nbsp;|&nbsp; Satisfied:{" "}
                  <b>{(violationSummary.okRate * 100).toFixed(1)}%</b>. (ε={violationSummary.eps})
                </div>
              ) : null}

              {interpretationBlock ? (
                <div className="card" style={{ marginTop: 10 }}>
                  <h2 style={{ marginTop: 0 }}>How to read this run</h2>
                  <div className="small" style={{ lineHeight: 1.5 }}>
                    <div>
                      <b>Realized channel rate:</b>{" "}
                      {interpretationBlock.arrivalText}
                      {" "}Mean arrived fraction = <b>{fmtNum(interpretationBlock.meanArrival, 4)}</b>.
                    </div>
                    <div style={{ marginTop: 6 }}>
                      <b>Useful delivered information:</b>{" "}
                      Mean arrived information proxy = <b>{fmtNum(interpretationBlock.meanInfo, 3)}</b>.
                    </div>
                    <div style={{ marginTop: 6 }}>
                      <b>Decrease interpretation:</b> {interpretationBlock.decreaseText}
                    </div>
                    <div style={{ marginTop: 6 }}>
                      <b>Residual interpretation:</b> {interpretationBlock.residualText}
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Residual quick summary (kept, but now compact and no longer needs its own control row) */}
              {residualViolationSummary ? (
                <div className="small" style={{ marginTop: 6, opacity: 0.85 }}>
                  Residual violation rate:{" "}
                  <b>{(residualViolationSummary.rate * 100).toFixed(1)}%</b> ({residualViolationSummary.viol}/
                  {residualViolationSummary.count}) where r(t) &gt; 0.
                </div>
              ) : (
                <div className="small" style={{ marginTop: 6, opacity: 0.7 }}>
                  {residual ? null : "(Residual not available for this run yet.)"}
                </div>
              )}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: 14,
                  marginTop: 6,
                  alignItems: "start",
                }}
              >
                <EntropyWithMDC
                  units={series?.units ?? null}
                  eps={series!.eps}
                  meanEntropy={series!.mean_entropy}
                  mdcFlag={series!.mdc_flag}
                  cursorT={Math.min(tt, series!.mean_entropy.length - 1)}
                  height={PLOT_H}
                />

                <SparkLine
                  title="Realized channel rate: arrived fraction over grid"
                  values={series!.arrival_frac}
                  cursorT={Math.min(tt, series!.arrival_frac.length - 1)}
                  height={PLOT_H}
                  precision={4}
                  subtitle={
                    arrivalIsFlat
                      ? "Realized arrivals are nearly constant on each step."
                      : undefined
                  }
                />

                <SparkLine
                  title="Useful delivered information: arrived information proxy"
                  values={series!.arrived_info_proxy}
                  cursorT={Math.min(tt, series!.arrived_info_proxy.length - 1)}
                  height={PLOT_H}
                  precision={3}
                  subtitle="Sum of positive entropy drops on cells whose observations actually arrive at time t."
                />

                <DeltaEntropyDiagnostic
                  units={series?.units ?? null}
                  eps={series!.eps}
                  deltaMeanEntropy={series!.delta_mean_entropy}
                  mdcFlag={series!.mdc_flag}
                  cursorT={Math.min(tt, series!.delta_mean_entropy.length - 1)}
                  height={PLOT_H}
                />

                {/* Residual plot */}
                {residual?.length ? (
                  <ResidualDiagnostic
                    units={series?.units ?? null}
                    title={residualTitle}
                    eps={series!.eps}
                    residual={residual}
                    cursorT={Math.min(tt, residual.length - 1)}
                    height={PLOT_H}
                  />
                ) : null}

                {/* empty slot to balance layout (we have 5 plots in a 3-col grid) */}
                <div />

              </div>
            </>
          ) : (
            <div className="small" style={{ marginTop: 10 }}>
              (Time-series not available yet — run Belief Lab to generate series.)
            </div>
          )}

          {/* --- 5 tiles --- */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 14,
              marginTop: 12,
              alignItems: "flex-start",
            }}
          >
            <Tile title="Belief field — what does the posterior currently lean toward? (blue = lower fire belief, green = higher fire belief; colors may stay biased even while entropy rises again)" src={shownBelief} />

            {showTemporalTrail ? (
              <TrailTile
                title="Entropy field — where am I currently more or less uncertain? (black = lower uncertainty, white = higher uncertainty)"
                urls={entropyTrailUrls}
                opacityMode="entropy"
              />
            ) : (
              <Tile title="Entropy field — where am I currently more or less uncertain? (black = lower uncertainty, white = higher uncertainty)" src={shownEntropy} />
            )}
            {showTemporalTrail ? (
              <TrailTile
                title="Entropy change field — where did uncertainty just go down or up? (blue = uncertainty decreased, red = uncertainty increased)"
                urls={deltaEntropyTrailUrls}
                opacityMode="delta"
              />
            ) : (
              <Tile title="Entropy change field — where did uncertainty just go down or up? (blue = uncertainty decreased, red = uncertainty increased)" src={shownDH} />
            )}
            <Tile title="Prescribed support mask" src={shownSupport} />
            <Tile title="Arrivals over prescribed support (white on gray)" src={shownArrived} />
          </div>
        </>
      ) : (
        <div className="small">No run selected yet.</div>
      )}
    </div>
  );
}
