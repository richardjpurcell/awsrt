"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { deleteJSON, getJSON, imgSrc } from "@/lib/api";
import { PlayBar } from "@/components/PlayBar";
import { RunPicker } from "@/components/RunPicker";
import { useRouter, useSearchParams } from "next/navigation";

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

type ManifestRes = {
  network?: {
    policy?: string;
  };
};

type SeriesRes = {
  // Detection semantics
  true_detections_any?: number[];
  arrived_detections_any?: number[];
  detections_any?: number[];
  coverage_frac?: number[];
  new_coverage_frac?: number[];
  movement_l1_mean?: number[];
  overlap_fire_sensors?: number[];
  overlap_front_sensors?: number[];
  mean_entropy?: number[];
  delta_mean_entropy?: number[];
  arrivals_frac?: number[];
  detections_arrived_frac?: number[];
  obs_generation_step?: number[];
  obs_delivery_step?: number[];
  obs_age_steps?: number[];
  loss_frac?: number[];
  usefulness_gap?: number[];
  misleading_activity?: number[];
  recent_obs_age_mean_valid?: number[];
  recent_misleading_activity_mean?: number[];
  recent_misleading_activity_pos_frac?: number[];
  recent_driver_info_true_mean?: number[];
  usefulness_regime_state?: number[];
  usefulness_trigger_recover?: number[];
  usefulness_trigger_caution?: number[];
  usefulness_trigger_recover_from_caution?: number[];
  usefulness_trigger_exploit?: number[];
  usefulness_recover_counter?: number[];
  usefulness_caution_counter?: number[];
  usefulness_recover_exit_counter?: number[];
  usefulness_exploit_counter?: number[];
  driver_info_true?: number[];
  residual_cov?: number[];
  residual_info?: number[];
  regime_utilization?: number[];
  regime_strict_drift_proxy?: number[];
  regime_local_drift_rate?: number[];
  regime_cumulative_exposure?: number[];
  regime_state?: number[];
  regime_trigger_downshift?: number[];
  regime_trigger_switch_to_certified?: number[];
  regime_trigger_recovery?: number[];
  regime_certified_stage_index?: number[];
  regime_opportunistic_level_index?: number[];
  regime_advisory_stage_eta?: number[];
  regime_active_state?: number[];
  regime_active_certified_stage_index?: number[];
  regime_active_opportunistic_level_index?: number[];
  regime_active_transition_event?: number[];
  regime_effective_eta?: number[];
  regime_effective_move_budget_cells?: number[];
  debug_down_utilization_margin?: number[];
  debug_down_strict_margin?: number[];
  debug_down_utilization_threshold?: number[];
  debug_down_strict_threshold?: number[];
  debug_down_hysteresis?: number[];
  debug_trig_down_utilization_component?: number[];
  debug_trig_down_strict_component?: number[];
  debug_trig_down_final?: number[];
  debug_switch_utilization_margin?: number[];
  debug_switch_strict_margin?: number[];
  debug_switch_utilization_threshold?: number[];
  debug_switch_strict_threshold?: number[];
  debug_switch_hysteresis?: number[];
  debug_trig_switch_utilization_component?: number[];
  debug_trig_switch_strict_component?: number[];
  debug_trig_switch_local_component?: number[];
  debug_trig_switch_exposure_component?: number[];
  debug_trig_switch_final?: number[];
  debug_recovery_utilization_margin?: number[];
  debug_recovery_strict_margin?: number[];
  debug_recovery_utilization_threshold?: number[];
  debug_recovery_strict_threshold?: number[];
  debug_recovery_hysteresis?: number[];
  debug_down_counter?: number[];
  debug_switch_counter?: number[];
  debug_recovery_counter?: number[];
  debug_recovery_block_counter?: number[];
  debug_leave_certified_counter?: number[];
  debug_trig_leave_certified_final?: number[];
  debug_active_downshift_support_score?: number[];
  debug_active_downshift_support_breadth?: number[];
  debug_trig_down_weak_support_component?: number[];
  debug_active_corruption_guard_score?: number[];
  debug_active_corruption_guard_breadth?: number[];
  debug_corruption_guard_counter?: number[];
  debug_trig_down_corruption_guard_component?: number[];
  debug_trig_down_corruption_led_final?: number[];

  // Scalars (from summary.json via /series payload)
  eps_ref?: number | null;
  eps_ref_eff_cov?: number | null;
  source_phy_horizon_steps?: number | null;
  local_operational_horizon_steps?: number | null;
  execution_window_enabled?: boolean;
  execution_window_start_step?: number | null;
  execution_window_end_step_exclusive?: number | null;
  eps_ref_eff_info?: number | null;
  ttfd?: number | null;
  ttfd_true?: number | null;
  ttfd_arrived?: number | null;
  detections_any_semantics?: string | null;

  residual_cov_pos_frac?: number | null;
  residual_info_pos_frac?: number | null;
  residual_cov_in_band_frac?: number | null;
  residual_info_in_band_frac?: number | null;  
  residual_cov_min?: number | null;
  residual_cov_max?: number | null;
  residual_info_min?: number | null;
  residual_info_max?: number | null;

  driver_info_true_kind?: string | null;
  residual_info_driver?: string | null;
  residual_cov_driver?: string | null;
  usefulness_proto_enabled?: boolean;
  usefulness_regime_state_last?: number | null;
  usefulness_regime_state_exploit_frac?: number | null;
  usefulness_regime_state_recover_frac?: number | null;
  usefulness_regime_state_caution_frac?: number | null;
  usefulness_trigger_recover_hits?: number | null;
  usefulness_trigger_caution_hits?: number | null;
  usefulness_trigger_recover_from_caution_hits?: number | null;
  usefulness_trigger_exploit_hits?: number | null;
  recent_obs_age_mean_valid_last?: number | null;
  recent_obs_age_mean_valid_max?: number | null;
  recent_misleading_activity_mean_last?: number | null;
  recent_misleading_activity_mean_max?: number | null;
  recent_misleading_activity_pos_frac_last?: number | null;
  recent_driver_info_true_mean_last?: number | null;
  regime_enabled?: boolean;
  regime_mode?: string | null;
  regime_stage_ids?: string[];
  regime_opportunistic_level_ids?: string[];
  regime_utilization_mean?: number | null;
  regime_strict_drift_proxy_mean?: number | null;
  regime_local_drift_rate_mean?: number | null;
  regime_cumulative_exposure_final?: number | null;
  regime_advisory_downshift_trigger_hits?: number | null;
  regime_advisory_switch_to_certified_trigger_hits?: number | null;
  regime_advisory_recovery_trigger_hits?: number | null;
  regime_last_state?: number | null;
  regime_last_certified_stage_index?: number | null;
  regime_last_opportunistic_level_index?: number | null;
  regime_last_certified_stage_id?: string | null;
  regime_advisory_stage_eta_mean?: number | null;
  regime_advisory_stage_eta_last?: number | null;
  regime_advisory_last_certified_stage_eta?: number | null;
  regime_last_opportunistic_level_id?: string | null;
  regime_active_enabled?: boolean;
  regime_active_transition_count?: number | null;
  regime_active_last_state?: number | null;
  regime_active_last_certified_stage_index?: number | null;
  regime_active_last_opportunistic_level_index?: number | null;
  regime_active_last_certified_stage_id?: string | null;
  regime_active_last_opportunistic_level_id?: string | null;
  regime_effective_eta_mean?: number | null;
  regime_effective_move_budget_cells_mean?: number | null;
  regime_effective_eta_last?: number | null;
  regime_effective_move_budget_cells_last?: number | null;
  regime_active_state_disabled_frac?: number | null;
  regime_active_state_nominal_frac?: number | null;
  regime_active_state_downshift_frac?: number | null;
  regime_active_state_certified_frac?: number | null;
  regime_active_state_disabled_steps?: number | null;
  regime_active_state_nominal_steps?: number | null;
  regime_active_state_downshift_steps?: number | null;
  regime_active_state_certified_steps?: number | null;
  debug_down_utilization_margin_min?: number | null;
  debug_down_utilization_margin_max?: number | null;
  debug_switch_utilization_margin_min?: number | null;
  debug_switch_utilization_margin_max?: number | null;
  debug_recovery_utilization_margin_min?: number | null;
  debug_recovery_utilization_margin_max?: number | null;
  debug_leave_certified_counter_max?: number | null;
  debug_leave_certified_trigger_hits?: number | null;
  debug_active_downshift_support_score_mean?: number | null;
  debug_active_downshift_support_score_min?: number | null;
  debug_active_downshift_weak_support_hits?: number | null;
  debug_active_corruption_guard_score_mean?: number | null;
  debug_active_corruption_guard_score_min?: number | null;
  debug_active_corruption_guard_hits?: number | null;
  debug_active_corruption_led_downshift_hits?: number | null;
  debug_corruption_guard_counter_max?: number | null;
  regime_mechanism_audit_available?: boolean;
};

const WARM_N = 10;
const PRELOAD_AHEAD = 2;

function preload(url: string) {
  const im = new Image();
  im.decoding = "async";
  im.src = url;
}

/**
 * Keep rendering the previous image until the next src is fully loaded.
 * This prevents flicker during playback.
 */
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
    im.onerror = () => {
      // Keep lastGoodRef shown (no blanking).
    };
    im.src = src;

    return () => {
      alive = false;
    };
  }, [src, enabled]);

  return shown || lastGoodRef.current;
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function regimeStateLabel(code: number | null | undefined): string {
  switch (Number(code)) {
    case 0:
      return "disabled";
    case 1:
      return "opportunistic_nominal";
    case 2:
      return "opportunistic_downshift";
    case 3:
      return "certified_descent";
    case 4:
      return "recovery_ready";
    default:
      return "—";
  }
}

function activeRegimeStateLabel(code: number | null | undefined): string {
  switch (Number(code)) {
    case 0:
      return "disabled";
    case 1:
      return "opportunistic_nominal";
    case 2:
      return "opportunistic_downshift";
    case 3:
      return "certified_descent";
    default:
      return "—";
  }
}

function usefulnessStateLabel(code: number | null | undefined): string {
  switch (Number(code)) {
    case 0:
      return "exploit";
    case 1:
      return "recover";
    case 2:
      return "caution";
    default:
      return "—";
  }
}

function fmtNum(x: number | null | undefined, digits = 4): string {
  return typeof x === "number" && Number.isFinite(x) ? x.toFixed(digits) : "—";
}

function fmtInt(x: number | null | undefined): string {
  return typeof x === "number" && Number.isFinite(x) ? String(Math.round(x)) : "—";
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card" style={{ marginTop: 12 }}>
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      {subtitle ? (
        <div className="small" style={{ opacity: 0.82, marginTop: -4, marginBottom: 8, lineHeight: 1.4 }}>
          {subtitle}
        </div>
      ) : null}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 14,
          alignItems: "start",
        }}
      >
        {children}
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
  include0 = false,
  include01 = false,
  refLines,
  subtitle,
}: {
  title: string;
  values: number[];
  cursorT: number;
  height?: number;
  precision?: number;
  include0?: boolean; // include 0 in y-range
  include01?: boolean; // include [0,1] in y-range (good for fractions)
  refLines?: { y: number; dashed?: boolean; label?: string }[];
  subtitle?: string;
}) {
  const W = 980;
  const H = height;

  const cleaned = values.map((v) => (Number.isFinite(v) ? Number(v) : NaN));
  const finiteVals = cleaned.filter((v) => Number.isFinite(v));
  const n = cleaned.length;
  const hasFinite = finiteVals.length > 0;

  const rawMin = hasFinite ? Math.min(...finiteVals) : 0;
  const rawMax = hasFinite ? Math.max(...finiteVals) : 1;

  let minV = Math.min(rawMin, include01 ? 0 : rawMin, include0 ? 0 : rawMin);
  let maxV = Math.max(rawMax, include01 ? 1 : rawMax, include0 ? 0 : rawMax);

  // Visual padding so flat / boundary-hugging traces do not disappear into
  // the frame edge or the zero/one reference lines.
  if (maxV === minV) {
    const pad = Math.abs(maxV) > 1e-12 ? 0.08 * Math.abs(maxV) : 0.5;
    minV -= pad;
    maxV += pad;
  } else {
    const pad = 0.06 * (maxV - minV);
    minV -= pad;
    maxV += pad;
  }

  // Preserve the semantic anchors after padding.
  if (include0) minV = Math.min(minV, 0);
  if (include01) {
    minV = Math.min(minV, 0);
    maxV = Math.max(maxV, 1);
  }
  const span = maxV - minV;

  // Break the line across NaN runs instead of poisoning the whole plot.
  const segments: string[] = [];
  let curSeg: string[] = [];
  cleaned.forEach((v, i) => {
    const x = n <= 1 ? 0 : (i / (n - 1)) * (W - 1);
    if (!Number.isFinite(v)) {
      if (curSeg.length) {
        segments.push(curSeg.join(" "));
        curSeg = [];
      }
      return;
    }
    const y = H - 1 - ((v - minV) / span) * (H - 1);
    curSeg.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  });
  if (curSeg.length) {
    segments.push(curSeg.join(" "));
  }

  const iCur = clamp(cursorT, 0, Math.max(0, n - 1));
  const cx = n <= 1 ? 0 : (iCur / (n - 1)) * (W - 1);

  const y0 = include0 || include01 ? H - 1 - ((0 - minV) / span) * (H - 1) : null;

  const labelMin = minV.toFixed(precision);
  const labelMax = maxV.toFixed(precision);

  const refs = (refLines ?? []).filter(
    (r) => typeof r?.y === "number" && Number.isFinite(r.y)
  );

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
          {typeof y0 === "number" && Number.isFinite(y0) ? (
            <line x1={0} x2={W} y1={y0} y2={y0} stroke="rgba(0,0,0,0.12)" strokeWidth="2" />
          ) : null}

          {/* Reference lines (e.g., ±eps bands) */}
          {refs.map((r, i) => {
            const yy = H - 1 - ((r.y - minV) / span) * (H - 1);
            if (!Number.isFinite(yy)) return null;
            return (
              <line
                key={`ref-${i}`}
                x1={0}
                x2={W}
                y1={yy}
                y2={yy}
                stroke="rgba(0,0,0,0.16)"
                strokeWidth="2"
                strokeDasharray={r.dashed ? "8 6" : undefined}
              />
            );
          })}

          {include01 ? (
            <>
              {/* 0 line already covered above; add 1 line */}
              {(() => {
                const y1 = H - 1 - ((1 - minV) / span) * (H - 1);
                return <line x1={0} x2={W} y1={y1} y2={y1} stroke="rgba(0,0,0,0.10)" strokeWidth="2" />;
              })()}
            </>
          ) : null}

          {segments.map((pts, i) => (
            <polyline
              key={`seg-${i}`}
              fill="none"
              stroke="rgba(0,0,0,0.55)"
              strokeWidth="3"
              points={pts}
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

        {subtitle ? (
          <div className="small" style={{ marginTop: 6, opacity: 0.75 }}>
            {subtitle}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function extractDependentsFromDetail(detail: any): string[] | null {
  // Backend uses: {"message": "...", "opr_id": "...", "dependents": [...]}
  if (!detail) return null;
  if (typeof detail === "object" && Array.isArray((detail as any).dependents)) {
    return (detail as any).dependents as string[];
  }
  return null;
}

export default function OperationalVisualizerPage() {
  const [ids, setIds] = useState<string[]>([]);
  const [id, setId] = useState("");
  const [meta, setMeta] = useState<MetaRes | null>(null);
  const [manifest, setManifest] = useState<ManifestRes | null>(null);
  const [series, setSeries] = useState<SeriesRes | null>(null);
  const [listLoaded, setListLoaded] = useState(false);

  const [t, setT] = useState(0);
  const [loop, setLoop] = useState(true);

  const [showFront, setShowFront] = useState(false);
  const [frontOpacity, setFrontOpacity] = useState(0.9);
  const [showMechanismAudit, setShowMechanismAudit] = useState(false);

  const [busyDelete, setBusyDelete] = useState(false);
  const [msg, setMsg] = useState<string>("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const idFromUrl = searchParams.get("id") || "";

  // Keep URL query param in sync with selected id.
  const syncUrlId = useCallback(
    (nextId: string) => {
      try {
        if (typeof window === "undefined") return;
        const u = new URL(window.location.href);
        if (nextId) u.searchParams.set("id", nextId);
        else u.searchParams.delete("id");
        router.replace(u.pathname + u.search);
      } catch {
        // ignore URL sync failures
      }
    },
    [router]
  );


  const warmedKeyRef = useRef<string>("");

  const refresh = useCallback(async () => {
    setMsg("");
    try {
      const r = await getJSON<ListRes>("/operational/list");
      setIds((r.ids ?? []).slice().sort());
      setListLoaded(true);
    } catch (e: any) {
      console.error(e);
      setMsg(typeof e?.message === "string" ? e.message : "Failed to load operational runs.");
      setListLoaded(true);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);


  const onChangeId = useCallback(
    (nextId: string) => {
      setId(nextId);
      syncUrlId(nextId);
    },
    [syncUrlId]
  );

  const clearSelection = useCallback(() => {
    // IMPORTANT: clears both state and URL param to prevent "(direct)" loops
    setMeta(null);
    setSeries(null);
    setT(0);
    setMsg("");
    onChangeId("");
  }, [onChangeId]);

  // If the currently selected id is no longer in the list (e.g., after deletion),
  // clear it AND clear the URL param so RunPicker doesn't show "(direct)".

  useEffect(() => {
    if (!id) return;
    if (listLoaded && !ids.includes(id)) {
      clearSelection();
    }
  }, [ids, id, listLoaded, clearSelection]);

  // If user navigates to /operational/visualizer?id=opr-xxxx, auto-select it
  // ONLY if it exists in ids once ids is loaded; otherwise scrub the URL param.
  useEffect(() => {
    if (!listLoaded) return;
    if (!idFromUrl) return;
    if (id) return; // don’t clobber user selection

    // If the URL id is not a real run, scrub the URL param to avoid "(direct)" loops.
    if (!ids.includes(idFromUrl)) {
      syncUrlId("");
      return;
    }

    // Safe to accept.
    setId(idFromUrl);
  }, [idFromUrl, id, ids, listLoaded, syncUrlId]);

 

  useEffect(() => {
    let alive = true;

    setMsg("");
    setManifest(null);
    setSeries(null);

    if (!id) {
      setMeta(null);
      setManifest(null);
      setT(0);
      return;
    }

    Promise.allSettled([
      getJSON<MetaRes>(`/operational/${id}/meta`),
      getJSON<SeriesRes>(`/operational/${id}/series`),
      getJSON<ManifestRes>(`/operational/${id}/manifest`),
    ])
      .then((res) => {
        if (!alive) return;

        const m = res[0].status === "fulfilled" ? res[0].value : null;
        const s = res[1].status === "fulfilled" ? res[1].value : null;
        const mf = res[2].status === "fulfilled" ? res[2].value : null;

        if (m) {
          setMeta(m);
          setT(0);
        } else {
          setMeta(null);
          setT(0);
          setMsg("Failed to load run meta.");
        }

        setSeries(s);
        setManifest(mf);
      })
      .catch((e: any) => {
        if (!alive) return;
        console.error(e);
        setMeta(null);
        setManifest(null);
        setSeries(null);
        setT(0);
        setMsg(typeof e?.message === "string" ? e.message : "Failed to load run.");
      });

    return () => {
      alive = false;
    };
  }, [id]);

  const T = Math.max(1, meta?.T ?? 1);
  const tt = meta ? clamp(t, 0, Math.max(0, meta.T - 1)) : 0;

  // Atomic image to prevent flicker during playback
  const deploymentUrl = id && meta ? imgSrc(`/operational/${id}/t/${tt}/deployment.png`) : "";
  const shownDeployment = useAtomicImage(deploymentUrl, !!(id && meta));

  // Optional front-band overlay (transparent PNG)
  const frontUrl = id && meta ? imgSrc(`/operational/${id}/t/${tt}/front.png`) : "";
  const shownFront = useAtomicImage(frontUrl, !!(showFront && id && meta));

  // Warm cache first N frames once per run
  useEffect(() => {
    if (!id || !meta) return;
    const warmN = Math.min(meta.T, WARM_N);
    const warmKey = `${id}|T=${meta.T}`;
    if (warmedKeyRef.current === warmKey) return;
    warmedKeyRef.current = warmKey;

    const doWarm = () => {
      for (let k = 0; k < warmN; k++) {
        preload(imgSrc(`/operational/${id}/t/${k}/deployment.png`));
        preload(imgSrc(`/operational/${id}/t/${k}/front.png`));
      }
    };

    // @ts-ignore
    if (typeof requestIdleCallback !== "undefined") requestIdleCallback(doWarm);
    else setTimeout(doWarm, 0);
  }, [id, meta?.T]);

  // Preload ahead
  useEffect(() => {
    if (!id || !meta) return;
    if (meta.T <= 1) return;

    for (let k = 1; k <= PRELOAD_AHEAD; k++) {
      const nextT = tt + k < meta.T ? tt + k : loop ? (tt + k) % meta.T : tt;
      if (nextT === tt) continue;
      preload(imgSrc(`/operational/${id}/t/${nextT}/deployment.png`));
      preload(imgSrc(`/operational/${id}/t/${nextT}/front.png`));
    }
  }, [id, meta, tt, loop]);

  async function onDelete() {
    if (!id || busyDelete) return;

    const ok = window.confirm(
      `Delete operational run ${id}?\n\nThis removes manifest, fields, renders, and metrics under data/.`
    );
    if (!ok) return;

    setBusyDelete(true);
    setMsg("");

    try {
      const doomed = id;
      await deleteJSON(`/operational/${doomed}`);

      // Clear selection + URL immediately so we don't re-fetch meta for a deleted run.
      clearSelection();

      setMsg(`Deleted ${doomed}.`);
      await refresh();
    } catch (e: any) {
      const status: number | undefined = e?.status;
      const detail: any = e?.detail;

      const dependents = status === 409 ? extractDependentsFromDetail(detail) : null;

      if (status === 409 && dependents && dependents.length) {
        const msg =
          `This operational run (${id}) is referenced by ${dependents.length} analysis stud${dependents.length === 1 ? "y" : "ies"}:\n\n` +
          dependents.map((x) => `• ${x}`).join("\n") +
          `\n\nDeleting the operational run will NOT delete those analysis studies.\n` +
          `They may remain viewable, but their provenance links to this run will be broken.\n\n` +
          `Delete anyway?`;

        const okForce = window.confirm(msg);
        if (!okForce) {
          setMsg("");
          return;
        }

        try {
          const doomed = id;
          await deleteJSON(`/operational/${doomed}?force=true`);
          clearSelection();
          setMsg(`Deleted ${doomed}.`);
          await refresh();
          return;
        } catch (e2: any) {
          console.error(e2);
          setMsg(typeof e2?.message === "string" ? e2.message : "Delete failed.");
          return;
        }
      }

      console.error(e);
      if (typeof detail === "string") setMsg(detail);
      else setMsg(typeof e?.message === "string" ? e.message : "Delete failed.");
    } finally {
      setBusyDelete(false);
    }
  }

  const canPlot = useMemo(() => {
    const s = series;
    if (!s) return false;
    const anyLen =
      (s.coverage_frac?.length ?? 0) ||
      (s.movement_l1_mean?.length ?? 0) ||
      (s.overlap_fire_sensors?.length ?? 0) ||
      (s.true_detections_any?.length ?? 0) ||
      (s.arrived_detections_any?.length ?? 0) ||
      (s.detections_any?.length ?? 0) ||
      (s.mean_entropy?.length ?? 0) ||
      (s.delta_mean_entropy?.length ?? 0) ||
      (s.arrivals_frac?.length ?? 0) ||
      (s.detections_arrived_frac?.length ?? 0) ||
      (s.obs_age_steps?.length ?? 0) ||
      (s.loss_frac?.length ?? 0) ||
      (s.usefulness_gap?.length ?? 0) ||
      (s.misleading_activity?.length ?? 0) ||
      (s.recent_obs_age_mean_valid?.length ?? 0) ||
      (s.recent_misleading_activity_mean?.length ?? 0) ||
      (s.recent_misleading_activity_pos_frac?.length ?? 0) ||
      (s.recent_driver_info_true_mean?.length ?? 0) ||
      (s.usefulness_regime_state?.length ?? 0) ||
      (s.usefulness_trigger_recover?.length ?? 0) ||
      (s.usefulness_trigger_caution?.length ?? 0) ||
      (s.usefulness_trigger_recover_from_caution?.length ?? 0) ||
      (s.usefulness_trigger_exploit?.length ?? 0) ||
      (s.usefulness_recover_counter?.length ?? 0) ||
      (s.usefulness_caution_counter?.length ?? 0) ||
      (s.usefulness_recover_exit_counter?.length ?? 0) ||
      (s.usefulness_exploit_counter?.length ?? 0) ||

      (s.driver_info_true?.length ?? 0) ||
      (s.residual_cov?.length ?? 0) ||
      (s.residual_info?.length ?? 0) ||
      (s.regime_utilization?.length ?? 0) ||
      (s.regime_strict_drift_proxy?.length ?? 0) ||
      (s.regime_local_drift_rate?.length ?? 0) ||
      (s.regime_cumulative_exposure?.length ?? 0) ||
      (s.regime_state?.length ?? 0) ||
      (s.regime_trigger_downshift?.length ?? 0) ||
      (s.regime_trigger_switch_to_certified?.length ?? 0) ||
      (s.regime_trigger_recovery?.length ?? 0) ||
      (s.regime_certified_stage_index?.length ?? 0) ||
      (s.regime_opportunistic_level_index?.length ?? 0) ||
      (s.regime_active_state?.length ?? 0) ||
      (s.regime_active_transition_event?.length ?? 0) ||
      (s.regime_effective_eta?.length ?? 0) ||
      (s.regime_effective_move_budget_cells?.length ?? 0) ||
      (s.debug_down_utilization_margin?.length ?? 0) ||
      (s.debug_switch_utilization_margin?.length ?? 0) ||
      (s.debug_recovery_utilization_margin?.length ?? 0) ||
      (s.debug_down_counter?.length ?? 0) ||
      (s.debug_switch_counter?.length ?? 0) ||
      (s.debug_recovery_counter?.length ?? 0) ||
      (s.debug_recovery_block_counter?.length ?? 0) ||
      (s.debug_leave_certified_counter?.length ?? 0) ||
      (s.debug_trig_leave_certified_final?.length ?? 0) ||
      (s.debug_active_downshift_support_score?.length ?? 0) ||
      (s.debug_active_downshift_support_breadth?.length ?? 0) ||
      (s.debug_trig_down_weak_support_component?.length ?? 0) ||
      (s.debug_active_corruption_guard_score?.length ?? 0) ||
      (s.debug_active_corruption_guard_breadth?.length ?? 0) ||
      (s.debug_corruption_guard_counter?.length ?? 0) ||
      (s.debug_trig_down_corruption_guard_component?.length ?? 0) ||
      (s.debug_trig_down_corruption_led_final?.length ?? 0);
    return anyLen > 0;
  }, [series]);

  const cursorSummary = useMemo(() => {
    if (!series) return null;

    const at = (arr?: number[]) => {
      if (!arr || !arr.length) return null;
      const i = clamp(tt, 0, arr.length - 1);
      const v = arr[i];
      return Number.isFinite(v) ? v : null;
    };

    const atInt = (arr?: number[]) => {
      if (!arr || !arr.length) return null;
      const i = clamp(tt, 0, arr.length - 1);
      const v = arr[i];
      return Number.isFinite(v) ? Math.round(v) : null;
    };

    return {
      detections_any: at(series.detections_any),
      true_detections_any: at(series.true_detections_any),
      arrived_detections_any: at(series.arrived_detections_any),
      coverage_frac: at(series.coverage_frac),
      new_coverage_frac: at(series.new_coverage_frac),
      movement_l1_mean: at(series.movement_l1_mean),
      overlap_fire_sensors: at(series.overlap_fire_sensors),
      overlap_front_sensors: at(series.overlap_front_sensors),
      mean_entropy: at(series.mean_entropy),
      delta_mean_entropy: at(series.delta_mean_entropy),
      arrivals_frac: at(series.arrivals_frac),
      detections_arrived_frac: at(series.detections_arrived_frac),
      obs_age_steps: atInt(series.obs_age_steps),
      loss_frac: at(series.loss_frac),
      usefulness_gap: at(series.usefulness_gap),
      misleading_activity: at(series.misleading_activity),
      recent_obs_age_mean_valid: at(series.recent_obs_age_mean_valid),
      recent_misleading_activity_mean: at(series.recent_misleading_activity_mean),
      recent_misleading_activity_pos_frac: at(series.recent_misleading_activity_pos_frac),
      recent_driver_info_true_mean: at(series.recent_driver_info_true_mean),
      usefulness_regime_state: atInt(series.usefulness_regime_state),
      usefulness_trigger_recover: atInt(series.usefulness_trigger_recover),
      usefulness_trigger_caution: atInt(series.usefulness_trigger_caution),
      usefulness_trigger_recover_from_caution: atInt(series.usefulness_trigger_recover_from_caution),
      usefulness_trigger_exploit: atInt(series.usefulness_trigger_exploit),
      usefulness_recover_counter: atInt(series.usefulness_recover_counter),
      usefulness_caution_counter: atInt(series.usefulness_caution_counter),
      usefulness_recover_exit_counter: atInt(series.usefulness_recover_exit_counter),
      usefulness_exploit_counter: atInt(series.usefulness_exploit_counter),

      driver_info_true: at(series.driver_info_true),
      residual_cov: at(series.residual_cov),
      residual_info: at(series.residual_info),
      regime_utilization: at(series.regime_utilization),
      regime_strict_drift_proxy: at(series.regime_strict_drift_proxy),
      regime_local_drift_rate: at(series.regime_local_drift_rate),
      regime_cumulative_exposure: at(series.regime_cumulative_exposure),
      regime_state: atInt(series.regime_state),
      regime_trigger_downshift: atInt(series.regime_trigger_downshift),
      regime_trigger_switch_to_certified: atInt(series.regime_trigger_switch_to_certified),
      regime_trigger_recovery: atInt(series.regime_trigger_recovery),
      regime_certified_stage_index: atInt(series.regime_certified_stage_index),
      regime_opportunistic_level_index: atInt(series.regime_opportunistic_level_index),
      regime_advisory_stage_eta: at(series.regime_advisory_stage_eta),
      regime_active_state: atInt(series.regime_active_state),
      regime_active_certified_stage_index: atInt(series.regime_active_certified_stage_index),
      regime_active_opportunistic_level_index: atInt(series.regime_active_opportunistic_level_index),
      regime_active_transition_event: atInt(series.regime_active_transition_event),
      regime_effective_eta: at(series.regime_effective_eta),
      regime_effective_move_budget_cells: at(series.regime_effective_move_budget_cells),
      debug_down_utilization_margin: at(series.debug_down_utilization_margin),
      debug_down_strict_margin: at(series.debug_down_strict_margin),
      debug_down_utilization_threshold: at(series.debug_down_utilization_threshold),
      debug_down_strict_threshold: at(series.debug_down_strict_threshold),
      debug_down_hysteresis: at(series.debug_down_hysteresis),
      debug_trig_down_utilization_component: atInt(series.debug_trig_down_utilization_component),
      debug_trig_down_strict_component: atInt(series.debug_trig_down_strict_component),
      debug_trig_down_final: atInt(series.debug_trig_down_final),
      debug_switch_utilization_margin: at(series.debug_switch_utilization_margin),
      debug_switch_strict_margin: at(series.debug_switch_strict_margin),
      debug_switch_utilization_threshold: at(series.debug_switch_utilization_threshold),
      debug_switch_strict_threshold: at(series.debug_switch_strict_threshold),
      debug_switch_hysteresis: at(series.debug_switch_hysteresis),
      debug_trig_switch_utilization_component: atInt(series.debug_trig_switch_utilization_component),
      debug_trig_switch_strict_component: atInt(series.debug_trig_switch_strict_component),
      debug_trig_switch_local_component: atInt(series.debug_trig_switch_local_component),
      debug_trig_switch_exposure_component: atInt(series.debug_trig_switch_exposure_component),
      debug_trig_switch_final: atInt(series.debug_trig_switch_final),
      debug_recovery_utilization_margin: at(series.debug_recovery_utilization_margin),
      debug_recovery_strict_margin: at(series.debug_recovery_strict_margin),
      debug_recovery_utilization_threshold: at(series.debug_recovery_utilization_threshold),
      debug_recovery_strict_threshold: at(series.debug_recovery_strict_threshold),
      debug_recovery_hysteresis: at(series.debug_recovery_hysteresis),
      debug_down_counter: atInt(series.debug_down_counter),
      debug_switch_counter: atInt(series.debug_switch_counter),
      debug_recovery_counter: atInt(series.debug_recovery_counter),
      debug_recovery_block_counter: atInt(series.debug_recovery_block_counter),
      debug_leave_certified_counter: atInt(series.debug_leave_certified_counter),
      debug_trig_leave_certified_final: atInt(series.debug_trig_leave_certified_final),
      debug_active_downshift_support_score: at(series.debug_active_downshift_support_score),
      debug_active_downshift_support_breadth: at(series.debug_active_downshift_support_breadth),
      debug_trig_down_weak_support_component: atInt(series.debug_trig_down_weak_support_component),
      debug_active_corruption_guard_score: at(series.debug_active_corruption_guard_score),
      debug_active_corruption_guard_breadth: at(series.debug_active_corruption_guard_breadth),
      debug_corruption_guard_counter: atInt(series.debug_corruption_guard_counter),
      debug_trig_down_corruption_guard_component: atInt(series.debug_trig_down_corruption_guard_component),
      debug_trig_down_corruption_led_final: atInt(series.debug_trig_down_corruption_led_final),
    };
  }, [series, tt]);

  const PLOT_H = 150;

  // Effective residual bands are supplied from backend summary via /series.

  const epsInfo = typeof series?.eps_ref_eff_info === "number" ? series.eps_ref_eff_info : null;
  const epsCov = typeof series?.eps_ref_eff_cov === "number" ? series.eps_ref_eff_cov : null;
  const infoPosFrac =
    typeof series?.residual_info_pos_frac === "number" ? series.residual_info_pos_frac : null;
  const covPosFrac =
    typeof series?.residual_cov_pos_frac === "number" ? series.residual_cov_pos_frac : null;
  const infoInBandFrac =
    typeof series?.residual_info_in_band_frac === "number" ? series.residual_info_in_band_frac : null;
  const covInBandFrac =
    typeof series?.residual_cov_in_band_frac === "number" ? series.residual_cov_in_band_frac : null;

  const advisoryDownshiftHits =
    typeof series?.regime_advisory_downshift_trigger_hits === "number"
      ? series.regime_advisory_downshift_trigger_hits
      : null;

  const advisorySwitchHits =
    typeof series?.regime_advisory_switch_to_certified_trigger_hits === "number"
      ? series.regime_advisory_switch_to_certified_trigger_hits
      : null;

  const advisoryRecoveryHits =
    typeof series?.regime_advisory_recovery_trigger_hits === "number"
      ? series.regime_advisory_recovery_trigger_hits
      : null;

  // Truthfulness gate for the compact usefulness layer:
  // prefer the explicit backend scalar when it is truthy, but do not hide
  // the section when a usefulness run clearly emitted usefulness-specific
  // traces and the scalar is absent / stale / not yet wired truthfully.
  // This keeps non-usefulness runs clean while still letting real usefulness
  // probe runs show their compact-layer summaries.
  const usefulnessSummaryAvailable =
    manifest?.network?.policy === "usefulness_proto";

  const activeStateSummaryAvailable =
    series?.regime_active_enabled === true;

  const advisorySummaryAvailable =
    series?.regime_enabled === true;

    const activeLastStateIsCertified =
    typeof series?.regime_active_last_state === "number" &&
    Number(series.regime_active_last_state) === 3;

  const mechanismSummaryAvailable =
    !!series?.regime_mechanism_audit_available;

  // Match Epistemic Visualizer delete messaging:
  // treat DELETE failure / 409 conflict as an error box, otherwise show muted info.
  const deleteIsError =
    !!msg &&
    (msg.startsWith("DELETE ") || msg.toLowerCase().includes("failed") || msg.toLowerCase().includes("conflict") || msg.includes("409"));


  return (
    <div className="card">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <h2 style={{ marginTop: 0 }}>Operational Visualizer</h2>
      </div>
      <div aria-hidden className="section-stripe section-stripe--operational" style={{ marginTop: 0 }} />

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
          <RunPicker label="Select Operational Run" ids={ids} value={id} onChange={onChangeId} />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={refresh} disabled={busyDelete} style={{ height: 34 }}>
            Refresh
          </button>
          <button onClick={onDelete} disabled={!id || busyDelete} style={{ height: 34 }}>
            {busyDelete ? "Deleting…" : "Delete Run"}
          </button>
        </div>
      </div>

      {msg ? (
        deleteIsError ? (
          <div className="card" style={{ border: "1px solid #f3c1c1", marginTop: 8 }}>
            <h2 style={{ marginTop: 0 }}>Delete failed</h2>
            <pre style={{ whiteSpace: "pre-wrap", margin: 0, color: "crimson", fontSize: 12 }}>
              {msg}
            </pre>
          </div>
        ) : (
          <div className="small" style={{ marginTop: 8, opacity: 0.8 }}>
            {msg}
          </div>
        )
      ) : null}

      {meta ? (
        <>
          <div className="small" style={{ marginTop: 6 }}>
            Grid{" "}
            {meta.H > 0 && meta.W > 0 ? (
              <>
                {meta.H}×{meta.W}
              </>
            ) : (
              <>—</>
            )}
            , cell {meta.cell_size_m}m, CRS {meta.crs_code || "—"}, dt={meta.dt_seconds}s, T={meta.T}
          </div>

          {typeof series?.source_phy_horizon_steps === "number" ? (
            <div className="small" style={{ marginTop: 4, opacity: 0.82, lineHeight: 1.4 }}>
              {series.execution_window_enabled ? (
                <>
                  Source physical horizon=<b>{series.source_phy_horizon_steps}</b>
                  {" "}· execution window=<b>[{series.execution_window_start_step ?? 0}, {series.execution_window_end_step_exclusive ?? "—"})</b>
                  {" "}· local operational horizon=<b>{series.local_operational_horizon_steps ?? meta.T}</b>
                  {" "}· viewer t is a <b>local operational step</b>
                </>
              ) : (
                <>
                  Source physical horizon=<b>{series.source_phy_horizon_steps}</b>
                  {" "}· full-horizon execution
                  {" "}· local operational horizon=<b>{series.local_operational_horizon_steps ?? meta.T}</b>
                </>
              )}
            </div>
          ) : null}
          <div style={{ marginTop: 6 }}>
            <PlayBar t={t} setT={setT} T={T} loop={loop} setLoop={setLoop} />
          </div>
          <div className="small" style={{ marginTop: 8, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="checkbox"
                checked={showFront}
                onChange={(e) => setShowFront(e.target.checked)}
              />
              Show fire front
            </label>

            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="checkbox"
                checked={showMechanismAudit}
                onChange={(e) => setShowMechanismAudit(e.target.checked)}
              />
              Show deep mechanism audit
            </label>

            {showFront ? (
              <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ opacity: 0.8 }}>opacity</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={frontOpacity}
                  onChange={(e) => setFrontOpacity(parseFloat(e.target.value))}
                />
                <span style={{ width: 42, textAlign: "right" }}>{frontOpacity.toFixed(2)}</span>
              </label>
            ) : null}
          </div>

          <div className="small" style={{ marginTop: 8, opacity: 0.72, lineHeight: 1.4 }}>
            Deployment overlay shows the full nonzero fire footprint for context
            (burning + burned). Overlap metrics below are computed against
            actively burning cells and the derived front band.
          </div>
          <div className="small" style={{ marginTop: 8, opacity: 0.82, lineHeight: 1.4 }}>
            Main interpretation path:
            <b> Current frame snapshot → Operational sensing and motion → Belief and entropy evolution → MDC residual diagnostics</b>.
            The compact usefulness layer, advisory regime, and active regime sections are controller-facing interpretations layered on top of that main path.
            Mechanism audit is a deeper diagnostic layer and is hidden by default.
          </div>
          <div className="imgbox">
            {shownDeployment ? (
              <div style={{ display: "grid" }}>
                <img
                  decoding="async"
                  src={shownDeployment}
                  alt="deployment"
                  draggable={false}
                  style={{ gridArea: "1 / 1", maxWidth: "100%", height: "auto" }}
                />

                {showFront && shownFront ? (
                  <img
                    decoding="async"
                    src={shownFront}
                    alt="front"
                    draggable={false}
                    style={{
                      gridArea: "1 / 1",
                      maxWidth: "100%",
                      height: "auto",
                      opacity: frontOpacity,
                      pointerEvents: "none",
                    }}
                  />
                ) : null}
              </div>
            ) : null}
          </div>

          {canPlot ? (
            <>

              {cursorSummary ? (
                <div className="card" style={{ marginTop: 12 }}>
                  <h2 style={{ marginTop: 0 }}>Current frame snapshot</h2>
                  <div className="small" style={{ lineHeight: 1.45 }}>
                    <div style={{ fontWeight: 600 }}>Operational state at t={tt}</div>
                    <div>
                      detect_true=<b>{fmtInt(cursorSummary.true_detections_any)}</b>
                      {" "}· detect_arrived=<b>{
                        typeof cursorSummary.arrived_detections_any === "number"
                          ? fmtInt(cursorSummary.arrived_detections_any)
                          : fmtInt(cursorSummary.detections_any)
                      }</b>
                      {" "}· coverage=<b>{fmtNum(cursorSummary.coverage_frac, 4)}</b>
                      {" "}· new_coverage=<b>{fmtNum(cursorSummary.new_coverage_frac, 4)}</b>
                      {" "}· move(L1)=<b>{fmtNum(cursorSummary.movement_l1_mean, 3)}</b>
                    </div>
                    <div>
                      overlap_fire=<b>{fmtNum(cursorSummary.overlap_fire_sensors, 3)}</b>
                      {" "}· overlap_front=<b>{fmtNum(cursorSummary.overlap_front_sensors, 3)}</b>
                      {" "}· arrivals=<b>{fmtNum(cursorSummary.arrivals_frac, 3)}</b>
                      {" "}· det_arrived_frac=<b>{fmtNum(cursorSummary.detections_arrived_frac, 3)}</b>
                    </div>
                    <div>
                      mean_entropy=<b>{fmtNum(cursorSummary.mean_entropy, 4)}</b>
                      {" "}· Δmean_entropy=<b>{fmtNum(cursorSummary.delta_mean_entropy, 5)}</b>
                    </div>
                    <div>
                      obs_age=<b>{fmtInt(cursorSummary.obs_age_steps)}</b>
                      {" "}· loss_frac=<b>{fmtNum(cursorSummary.loss_frac, 3)}</b>
                      {" "}· usefulness_gap=<b>{fmtNum(cursorSummary.usefulness_gap, 5)}</b>
                      {" "}· misleading_activity=<b>{fmtNum(cursorSummary.misleading_activity, 5)}</b>
                    </div>
                    <div>
                      recent_age=<b>{fmtNum(cursorSummary.recent_obs_age_mean_valid, 3)}</b>
                      {" "}· recent_mislead_mean=<b>{fmtNum(cursorSummary.recent_misleading_activity_mean, 5)}</b>
                      {" "}· recent_mislead_pos_frac=<b>{fmtNum(cursorSummary.recent_misleading_activity_pos_frac, 3)}</b>
                      {" "}· recent_driver_info=<b>{fmtNum(cursorSummary.recent_driver_info_true_mean, 6)}</b>
                    </div>
                    {usefulnessSummaryAvailable ? (
                      <div>
                        usefulness_state=<b>{usefulnessStateLabel(cursorSummary.usefulness_regime_state)}</b>
                        {" "}· trig_recover=<b>{fmtInt(cursorSummary.usefulness_trigger_recover)}</b>
                        {" "}· trig_caution=<b>{fmtInt(cursorSummary.usefulness_trigger_caution)}</b>
                        {" "}· trig_recover_from_caution=<b>{fmtInt(cursorSummary.usefulness_trigger_recover_from_caution)}</b>
                        {" "}· trig_exploit=<b>{fmtInt(cursorSummary.usefulness_trigger_exploit)}</b>
                        {" "}· recover_counter=<b>{fmtInt(cursorSummary.usefulness_recover_counter)}</b>
                        {" "}· caution_counter=<b>{fmtInt(cursorSummary.usefulness_caution_counter)}</b>
                        {" "}· recover_exit_counter=<b>{fmtInt(cursorSummary.usefulness_recover_exit_counter)}</b>
                        {" "}· exploit_counter=<b>{fmtInt(cursorSummary.usefulness_exploit_counter)}</b>
                      </div>
                    ) : null}

                    <div style={{ marginTop: 8, fontWeight: 600 }}>MDC diagnostics at current frame</div>
                    <div>
                      d_info_true=<b>{fmtNum(cursorSummary.driver_info_true, 4)}</b>
                    </div>
                    <div>
                      r_info=<b>{fmtNum(cursorSummary.residual_info, 5)}</b>
                      {" "}· r_cov=<b>{fmtNum(cursorSummary.residual_cov, 5)}</b>
                      {" "}· eps_info=<b>{fmtNum(epsInfo, 6)}</b>
                      {" "}· eps_cov=<b>{fmtNum(epsCov, 6)}</b>
                    </div>

                    {(series?.ttfd_true != null || series?.ttfd_arrived != null || series?.ttfd != null) ? (
                      <>
                        <div style={{ marginTop: 8, fontWeight: 600 }}>Episode detection timing</div>
                        <div>
                          ttfd_true=<b>{series?.ttfd_true ?? "—"}</b>
                          {" "}· ttfd_arrived=<b>{series?.ttfd_arrived ?? "—"}</b>
                          {" "}· ttfd_legacy=<b>{series?.ttfd ?? "—"}</b>
                          {series?.detections_any_semantics ? (
                            <> · detect_series=<b>{series.detections_any_semantics}</b></>
                          ) : null}
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>

              ) : null}

              {usefulnessSummaryAvailable ? (
                <div className="card" style={{ marginTop: 12 }}>
                  <h2 style={{ marginTop: 0 }}>Compact usefulness layer summary</h2>
                  <div className="small" style={{ lineHeight: 1.45 }}>
                    <div style={{ opacity: 0.82 }}>
                      This section summarizes the live compact usefulness-facing layer used by
                      <b> usefulness_proto</b>. It is distinct from the broader advisory/active
                      regime-management overlay shown below.
                    </div>
                    <div style={{ marginTop: 8 }}>
                      usefulness_policy=<b>{manifest?.network?.policy ?? "—"}</b>
                      {" "}· last_state=<b>{usefulnessStateLabel(series.usefulness_regime_state_last)}</b>
                    </div>
                    <div>
                      exploit_frac=<b>{fmtNum(series.usefulness_regime_state_exploit_frac, 3)}</b>
                      {" "}· recover_frac=<b>{fmtNum(series.usefulness_regime_state_recover_frac, 3)}</b>
                      {" "}· caution_frac=<b>{fmtNum(series.usefulness_regime_state_caution_frac, 3)}</b>
                    </div>
                    <div>
                      recover_hits=<b>{fmtInt(series.usefulness_trigger_recover_hits)}</b>
                      {" "}· caution_hits=<b>{fmtInt(series.usefulness_trigger_caution_hits)}</b>
                      {" "}· recover_from_caution_hits=<b>{fmtInt(series.usefulness_trigger_recover_from_caution_hits)}</b>
                      {" "}· exploit_hits=<b>{fmtInt(series.usefulness_trigger_exploit_hits)}</b>
                    </div>
                    <div style={{ marginTop: 8, opacity: 0.82 }}>
                      Compact reading:
                      {" "}healthy runs should lean <b>exploit</b>,
                      {" "}delay-heavy runs may shift toward <b>recover</b>,
                      {" "}and corruption/noise-heavy runs may shift toward <b>caution</b>.
                    </div>
                    <div style={{ marginTop: 6, opacity: 0.78 }}>
                      The editable richer usefulness manifest surface lives in the Designer,
                      but this summary should be read primarily as a report on the
                      <b> live compact usefulness path</b>.
                    </div>
                    <div>
                      recent_age_last=<b>{fmtNum(series.recent_obs_age_mean_valid_last, 3)}</b>
                      {" "}· recent_misleading_mean_last=<b>{fmtNum(series.recent_misleading_activity_mean_last, 5)}</b>
                      {" "}· recent_misleading_pos_frac_last=<b>{fmtNum(series.recent_misleading_activity_pos_frac_last, 3)}</b>
                      {" "}· recent_driver_info_last=<b>{fmtNum(series.recent_driver_info_true_mean_last, 6)}</b>
                    </div>
                  </div>
                </div>
              ) : null}

              {advisorySummaryAvailable ? (
                <div className="card" style={{ marginTop: 12 }}>
                  <h2 style={{ marginTop: 0 }}>Advisory regime summary</h2>
                  <div className="small" style={{ lineHeight: 1.45 }}>
                    <div>
                      mode=<b>{series.regime_mode ?? "—"}</b>
                      {typeof series.regime_utilization_mean === "number" ? (
                        <> · utilization_mean=<b>{series.regime_utilization_mean.toFixed(4)}</b></>
                      ) : null}
                      {typeof series.regime_strict_drift_proxy_mean === "number" ? (
                        <> · strict_proxy_mean=<b>{series.regime_strict_drift_proxy_mean.toFixed(4)}</b></>
                      ) : null}
                    </div>
                    <div>
                      {typeof series.regime_local_drift_rate_mean === "number" ? (
                        <>local_drift_mean=<b>{series.regime_local_drift_rate_mean.toFixed(4)}</b></>
                      ) : null}
                      {typeof series.regime_cumulative_exposure_final === "number" ? (
                        <> · cumulative_exposure_final=<b>{series.regime_cumulative_exposure_final.toFixed(2)}</b></>
                      ) : null}
                    </div>
                    <div style={{ marginTop: 10, fontWeight: 600 }}>
                      Advisory trigger-hit summary
                    </div>
                    <div style={{ marginTop: 6, opacity: 0.82 }}>
                      These counts indicate advisory criteria hits only. They do not, by themselves, imply realized active-state transitions.
                    </div>
                    <div>
                      advisory_downshift_trigger_hits=<b>{advisoryDownshiftHits ?? "—"}</b>
                      {" "}· advisory_switch_to_certified_trigger_hits=<b>{advisorySwitchHits ?? "—"}</b>
                      {" "}· advisory_recovery_trigger_hits=<b>{advisoryRecoveryHits ?? "—"}</b>
                    </div>
                    <div>
                      advisory_last_state=<b>{regimeStateLabel(series.regime_last_state)}</b>
                      {series.regime_last_certified_stage_id ? (
                        <> · advisory_stage=<b>{series.regime_last_certified_stage_id}</b></>
                      ) : null}
                      {typeof series.regime_advisory_stage_eta_last === "number" ? (
                        <> · advisory_stage_eta=<b>{series.regime_advisory_stage_eta_last.toFixed(4)}</b></>
                      ) : null}
                      {series.regime_last_opportunistic_level_id ? (
                        <> · advisory_ladder=<b>{series.regime_last_opportunistic_level_id}</b></>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}

              {activeStateSummaryAvailable ? (
                <div className="card" style={{ marginTop: 12 }}>
                  <h2 style={{ marginTop: 0 }}>Active realized behavior</h2>
                  <div className="small" style={{ lineHeight: 1.45 }}>
                    <div style={{ opacity: 0.82 }}>
                      This section summarizes realized active state occupancy and realized transition events, not advisory trigger hits.
                    </div>
                    <div style={{ marginTop: 8 }}>
                      active_last_state=<b>{activeRegimeStateLabel(series.regime_active_last_state)}</b>
                      {activeLastStateIsCertified && series.regime_active_last_certified_stage_id ? (
                        <>
                          {" "}· active_stage=<b>{series.regime_active_last_certified_stage_id}</b>
                        </>
                      ) : null}
                      {series.regime_active_last_opportunistic_level_id ? (
                        <> · active_ladder=<b>{series.regime_active_last_opportunistic_level_id}</b></>
                      ) : null}
                    </div>
                    <div>
                      active_transition_count=<b>{series.regime_active_transition_count ?? "—"}</b>
                          {typeof series.regime_advisory_stage_eta_mean === "number" ? (
                            <> · advisory_certified_eta_mean=<b>{series.regime_advisory_stage_eta_mean.toFixed(4)}</b></>
                      ) : null}
                          {typeof series.regime_effective_eta_mean === "number" ? (
                            <> · active_effective_eta_mean_episode=<b>{series.regime_effective_eta_mean.toFixed(4)}</b></>
                          ) : null}
                      {typeof series.regime_effective_move_budget_cells_mean === "number" ? (
                        <> · effective_move_budget_cells_mean=<b>{series.regime_effective_move_budget_cells_mean.toFixed(3)}</b></>
                      ) : null}
                    </div>
                    {(typeof series.debug_active_downshift_support_score_mean === "number" ||
                      typeof series.debug_active_downshift_support_score_min === "number" ||
                      typeof series.debug_active_downshift_weak_support_hits === "number") ? (
                      <div>
                        {typeof series.debug_active_downshift_support_score_mean === "number" ? (
                          <>
                            weak_support_score_mean=<b>{series.debug_active_downshift_support_score_mean.toFixed(4)}</b>
                          </>
                        ) : null}
                        {typeof series.debug_active_downshift_support_score_min === "number" ? (
                          <>
                            {" "}· weak_support_score_min=<b>{series.debug_active_downshift_support_score_min.toFixed(4)}</b>
                          </>
                        ) : null}
                        {typeof series.debug_active_downshift_weak_support_hits === "number" ? (
                          <>
                            {" "}· weak_support_hits=<b>{series.debug_active_downshift_weak_support_hits}</b>
                          </>
                        ) : null}
                      </div>
                    ) : null}
                    {(typeof series.debug_active_corruption_guard_score_mean === "number" ||
                      typeof series.debug_active_corruption_guard_score_min === "number" ||
                      typeof series.debug_active_corruption_guard_hits === "number" ||
                      typeof series.debug_active_corruption_led_downshift_hits === "number") ? (
                      <div>
                        {typeof series.debug_active_corruption_guard_score_mean === "number" ? (
                          <>
                            corruption_guard_score_mean=<b>{series.debug_active_corruption_guard_score_mean.toFixed(4)}</b>
                          </>
                        ) : null}
                        {typeof series.debug_active_corruption_guard_score_min === "number" ? (
                          <>
                            {" "}· corruption_guard_score_min=<b>{series.debug_active_corruption_guard_score_min.toFixed(4)}</b>
                          </>
                        ) : null}
                        {typeof series.debug_active_corruption_guard_hits === "number" ? (
                          <> · corruption_guard_hits=<b>{series.debug_active_corruption_guard_hits}</b></>
                        ) : null}
                        {typeof series.debug_active_corruption_led_downshift_hits === "number" ? (
                          <> · corruption_led_downshift_hits=<b>{series.debug_active_corruption_led_downshift_hits}</b></>
                        ) : null}
                      </div>
                    ) : null}
                    <div>
                          {typeof series.regime_advisory_stage_eta_last === "number" ? (
                            <>advisory_certified_eta_last=<b>{series.regime_advisory_stage_eta_last.toFixed(4)}</b> · </>
                          ) : null}
                          {typeof series.regime_effective_eta_last === "number" ? (
                            <>active_effective_eta_last=<b>{series.regime_effective_eta_last.toFixed(4)}</b> · </>
                          ) : null}
                      nominal_state_frac=<b>{typeof series.regime_active_state_nominal_frac === "number" ? series.regime_active_state_nominal_frac.toFixed(3) : "—"}</b>
                      {" "}· downshift_state_frac=<b>{typeof series.regime_active_state_downshift_frac === "number" ? series.regime_active_state_downshift_frac.toFixed(3) : "—"}</b>
                      {" "}· certified_state_frac=<b>{typeof series.regime_active_state_certified_frac === "number" ? series.regime_active_state_certified_frac.toFixed(3) : "—"}</b>
                    </div>
                  </div>
                </div>
              ) : null}

              {showMechanismAudit && cursorSummary && (advisorySummaryAvailable || activeStateSummaryAvailable) ? (
                <div className="card" style={{ marginTop: 12 }}>
                  <h2 style={{ marginTop: 0 }}>Regime snapshot at current frame (diagnostic)</h2>
                  <div className="small" style={{ lineHeight: 1.45 }}>
                    <div style={{ opacity: 0.82 }}>
                      Advisory entries are suggested state/level selections and per-step trigger booleans. Active entries are realized applied state/level selections and realized transition events.
                    </div>
                    <div style={{ opacity: 0.82 }}>
                      Advisory certified eta is the eta implied by the suggested certified stage. Active effective eta is only nonzero when realized active state is certified.
                    </div>

                    <div style={{ marginTop: 8, fontWeight: 600 }}>Advisory signals</div>
                    <div>
                      advisory_state=<b>{regimeStateLabel(cursorSummary.regime_state)}</b>
                    </div>
                    <div>
                      advisory_trigger_downshift=<b>{cursorSummary.regime_trigger_downshift ?? "—"}</b>
                      {" "}· advisory_trigger_switch=<b>{cursorSummary.regime_trigger_switch_to_certified ?? "—"}</b>
                      {" "}· advisory_trigger_recovery=<b>{cursorSummary.regime_trigger_recovery ?? "—"}</b>
                    </div>
                    <div>
                      advisory_stage_idx=<b>{cursorSummary.regime_certified_stage_index ?? "—"}</b>
                      {" "}· advisory_level_idx=<b>{cursorSummary.regime_opportunistic_level_index ?? "—"}</b>
                      {" "}· advisory_stage_eta=<b>{
                        typeof cursorSummary.regime_advisory_stage_eta === "number"
                          ? cursorSummary.regime_advisory_stage_eta.toFixed(4)
                          : "—"
                      }</b>
                    </div>

                    {showMechanismAudit && mechanismSummaryAvailable ? (
                      <>
                        <div style={{ marginTop: 8, fontWeight: 600 }}>Threshold-neighborhood diagnostics</div>
                        <div style={{ opacity: 0.82 }}>
                          Signed margin convention: positive means the signal is on the trigger-firing side of the effective hysteresis-adjusted threshold; zero is exactly on the boundary.
                        </div>
                        <div>
                          down_util_margin=<b>{fmtNum(cursorSummary.debug_down_utilization_margin, 4)}</b>
                          {" "}· down_strict_margin=<b>{fmtNum(cursorSummary.debug_down_strict_margin, 4)}</b>
                          {" "}· down_counter=<b>{fmtInt(cursorSummary.debug_down_counter)}</b>
                        </div>
                        <div>
                          switch_util_margin=<b>{fmtNum(cursorSummary.debug_switch_utilization_margin, 4)}</b>
                          {" "}· switch_strict_margin=<b>{fmtNum(cursorSummary.debug_switch_strict_margin, 4)}</b>
                          {" "}· switch_counter=<b>{fmtInt(cursorSummary.debug_switch_counter)}</b>
                        </div>
                        <div>
                          recovery_util_margin=<b>{fmtNum(cursorSummary.debug_recovery_utilization_margin, 4)}</b>
                          {" "}· recovery_strict_margin=<b>{fmtNum(cursorSummary.debug_recovery_strict_margin, 4)}</b>
                          {" "}· recovery_counter=<b>{fmtInt(cursorSummary.debug_recovery_counter)}</b>
                          {" "}· recovery_block=<b>{fmtInt(cursorSummary.debug_recovery_block_counter)}</b>
                        </div>
                    <div>
                      leave_certified_counter=<b>{fmtInt(cursorSummary.debug_leave_certified_counter)}</b>
                      {" "}· leave_certified_trigger=<b>{fmtInt(cursorSummary.debug_trig_leave_certified_final)}</b>
                    </div>
                    <div>
                      weak_support_score=<b>{fmtNum(cursorSummary.debug_active_downshift_support_score, 4)}</b>
                      {" "}· weak_support_breadth=<b>{fmtNum(cursorSummary.debug_active_downshift_support_breadth, 4)}</b>
                      {" "}· weak_support_trigger=<b>{fmtInt(cursorSummary.debug_trig_down_weak_support_component)}</b>
                    </div>
                    <div>
                      corruption_guard_score=<b>{fmtNum(cursorSummary.debug_active_corruption_guard_score, 4)}</b>
                      {" "}· corruption_guard_breadth=<b>{fmtNum(cursorSummary.debug_active_corruption_guard_breadth, 4)}</b>
                      {" "}· corruption_guard_counter=<b>{fmtInt(cursorSummary.debug_corruption_guard_counter)}</b>
                    </div>
                    <div>
                      corruption_guard_trigger=<b>{fmtInt(cursorSummary.debug_trig_down_corruption_guard_component)}</b>
                      {" "}· corruption_led_downshift=<b>{fmtInt(cursorSummary.debug_trig_down_corruption_led_final)}</b>
                      {" "}· active_transition_evt=<b>{cursorSummary.regime_active_transition_event ?? "—"}</b>

                    </div>
                      </>
                    ) : null}

                    {activeStateSummaryAvailable ? (
                      <>
                        <div style={{ marginTop: 8, fontWeight: 600 }}>Active realized state</div>
                        <div>
                          active_state=<b>{activeRegimeStateLabel(cursorSummary.regime_active_state)}</b>
                        </div>
                        <div>
                          advisory_certified_eta=<b>{
                            typeof cursorSummary.regime_advisory_stage_eta === "number"
                              ? cursorSummary.regime_advisory_stage_eta.toFixed(4)
                              : "—"
                          }</b>
                          {" "}· active_effective_eta=<b>{
                            typeof cursorSummary.regime_effective_eta === "number"
                              ? cursorSummary.regime_effective_eta.toFixed(4)
                              : "—"
                          }</b>
                        </div>
                        {cursorSummary.regime_active_state === 3 ? (
                          <div>
                            active_stage_idx=<b>{cursorSummary.regime_active_certified_stage_index ?? "—"}</b>
                            {" "}· last_opportunistic_level_idx=<b>{cursorSummary.regime_active_opportunistic_level_index ?? "—"}</b>
                            {" "}· active_transition_evt=<b>{cursorSummary.regime_active_transition_event ?? "—"}</b>
                            {" "}· move_eff=<b>{
                              typeof cursorSummary.regime_effective_move_budget_cells === "number"
                                ? cursorSummary.regime_effective_move_budget_cells.toFixed(3)
                                : "—"
                            }</b>
                          </div>
                        ) : (
                          <div>
                            active_stage_idx=<b>—</b>
                            {" "}· active_level_idx=<b>{cursorSummary.regime_active_opportunistic_level_index ?? "—"}</b>
                            {" "}· active_transition_evt=<b>{cursorSummary.regime_active_transition_event ?? "—"}</b>
                            {" "}· move_eff=<b>{
                              typeof cursorSummary.regime_effective_move_budget_cells === "number"
                                ? cursorSummary.regime_effective_move_budget_cells.toFixed(3)
                                : "—"
                            }</b>
                          </div>
                        )}
                      </>
                    ) : null}

                    <div style={{ marginTop: 8, fontWeight: 600 }}>Effective applied controls</div>
                    <div>
                      eta_eff=<b>{
                        typeof cursorSummary.regime_effective_eta === "number"
                          ? cursorSummary.regime_effective_eta.toFixed(4)
                          : "—"
                      }</b>
                      {" "}· move_eff=<b>{
                        typeof cursorSummary.regime_effective_move_budget_cells === "number"
                          ? cursorSummary.regime_effective_move_budget_cells.toFixed(3)
                          : "—"
                      }</b>
                    </div>
                  </div>
                </div>
              ) : null}

              {(series?.driver_info_true_kind || series?.residual_info_driver || series?.residual_cov_driver) ? (
                <div className="card" style={{ marginTop: 12 }}>
                  <h2 style={{ marginTop: 0 }}>MDC diagnostic identities</h2>
                  <div className="small" style={{ lineHeight: 1.45 }}>

                    <div>driver_info_true_kind=<b>{series?.driver_info_true_kind ?? "—"}</b></div>
                    <div>residual_info_driver=<b>{series?.residual_info_driver ?? "—"}</b></div>
                    <div>residual_cov_driver=<b>{series?.residual_cov_driver ?? "—"}</b></div>
                    <div style={{ marginTop: 6, opacity: 0.82 }}>
                      `driver_info_true` is the delayed-aligned information driver and should be preferred for scientific interpretation.
                    </div>
                  </div>
                </div>
              ) : null}

              {mechanismSummaryAvailable ? (
                <div className="card" style={{ marginTop: 12 }}>
                  <h2 style={{ marginTop: 0 }}>Regime mechanism audit summary (diagnostic)</h2>
                  <div className="small" style={{ lineHeight: 1.45 }}>
                    <div style={{ opacity: 0.82 }}>
                      This section is specifically for hysteresis / persistence / cooldown inspection.
                      It is a mechanism lens, not the identity of AWSRT or of this page.
                    </div>
                    <div style={{ marginTop: 8 }}>
                      down_util_margin_range=<b>{fmtNum(series.debug_down_utilization_margin_min, 4)}</b> to <b>{fmtNum(series.debug_down_utilization_margin_max, 4)}</b>
                    </div>
                    <div>
                      switch_util_margin_range=<b>{fmtNum(series.debug_switch_utilization_margin_min, 4)}</b> to <b>{fmtNum(series.debug_switch_utilization_margin_max, 4)}</b>
                    </div>
                    <div>
                      recovery_util_margin_range=<b>{fmtNum(series.debug_recovery_utilization_margin_min, 4)}</b> to <b>{fmtNum(series.debug_recovery_utilization_margin_max, 4)}</b>
                    </div>
                    <div>
                      leave_certified_trigger_hits=<b>{fmtInt(series.debug_leave_certified_trigger_hits)}</b>
                      {" "}· leave_certified_counter_max=<b>{fmtInt(series.debug_leave_certified_counter_max)}</b>
                    </div>
                    <div>
                      corruption_guard_hits=<b>{fmtInt(series.debug_active_corruption_guard_hits)}</b>
                      {" "}· corruption_led_downshift_hits=<b>{fmtInt(series.debug_active_corruption_led_downshift_hits)}</b>
                      {" "}· corruption_guard_counter_max=<b>{fmtInt(series.debug_corruption_guard_counter_max)}</b>
                    </div>
                    <div>
                      corruption_guard_score_mean=<b>{fmtNum(series.debug_active_corruption_guard_score_mean, 4)}</b>
                      {" "}· corruption_guard_score_min=<b>{fmtNum(series.debug_active_corruption_guard_score_min, 4)}</b>
                    </div>
                    <div style={{ marginTop: 8, opacity: 0.82 }}>
                      Positive margin means the corresponding trigger condition is on its firing side of the effective hysteresis-adjusted threshold.
                    </div>
                  </div>
                </div>
              ) : null}

              {usefulnessSummaryAvailable ? <SectionCard
                title="Compact usefulness layer traces"
                subtitle="Live usefulness-facing trace view: recent-window support quantities plus the exploit / recover / caution state and trigger traces."
              >
                {series?.recent_obs_age_mean_valid?.length ? (
                  <SparkLine
                    title="Recent valid observation age"
                    values={series.recent_obs_age_mean_valid.map((v) => Number(v))}
                    cursorT={Math.min(tt, Math.max(0, series.recent_obs_age_mean_valid.length - 1))}
                    height={PLOT_H}
                    precision={4}
                    include0
                    subtitle="Rolling recent-window mean age over valid delivered observations"
                  />
                ) : (
                  <div />
                )}

                {series?.recent_misleading_activity_pos_frac?.length ? (
                  <SparkLine
                    title="Recent misleading-activity positive fraction"
                    values={series.recent_misleading_activity_pos_frac.map((v) => Number(v))}
                    cursorT={Math.min(tt, Math.max(0, series.recent_misleading_activity_pos_frac.length - 1))}
                    height={PLOT_H}
                    precision={4}
                    include01
                    subtitle="Rolling fraction of recent steps with strictly positive misleading activity"
                  />
                ) : (
                  <div />
                )}

                {series?.recent_driver_info_true_mean?.length ? (
                  <SparkLine
                    title="Recent driver-info mean"
                    values={series.recent_driver_info_true_mean.map((v) => Number(v))}
                    cursorT={Math.min(tt, Math.max(0, series.recent_driver_info_true_mean.length - 1))}
                    height={PLOT_H}
                    precision={6}
                    include0
                    subtitle="Rolling recent-window mean of the delayed-aligned truthier information driver"
                  />
                ) : (
                  <div />
                )}

                {series?.usefulness_regime_state?.length ? (
                  <SparkLine
                    title="Usefulness regime state"
                    values={series.usefulness_regime_state.map((v) => Number(v))}
                    cursorT={Math.min(tt, Math.max(0, series.usefulness_regime_state.length - 1))}
                    height={PLOT_H}
                    precision={0}
                    include0
                    subtitle="0 = exploit, 1 = recover, 2 = caution on the compact live usefulness path"
                  />
                ) : (
                  <div />
                )}

                {series?.usefulness_trigger_caution?.length ? (
                  <SparkLine
                    title="Usefulness trigger: caution"
                    values={series.usefulness_trigger_caution.map((v) => Number(v))}
                    cursorT={Math.min(tt, Math.max(0, series.usefulness_trigger_caution.length - 1))}
                    height={PLOT_H}
                    precision={0}
                    include01
                    subtitle="1 means the compact usefulness caution condition is firing at that step"
                  />
                ) : (
                  <div />
                )}

                {series?.usefulness_trigger_recover?.length ? (
                  <SparkLine
                    title="Usefulness trigger: recover"
                    values={series.usefulness_trigger_recover.map((v) => Number(v))}
                    cursorT={Math.min(tt, Math.max(0, series.usefulness_trigger_recover.length - 1))}
                    height={PLOT_H}
                    precision={0}
                    include01
                    subtitle="1 means weakened support is sufficient to leave exploit and enter recover on the compact usefulness path"
                  />
                ) : (
                  <div />
                )}
                {series?.usefulness_trigger_recover_from_caution?.length ? (
                  <SparkLine
                    title="Usefulness trigger: recover from caution"
                    values={series.usefulness_trigger_recover_from_caution.map((v) => Number(v))}
                    cursorT={Math.min(tt, Math.max(0, series.usefulness_trigger_recover_from_caution.length - 1))}
                    height={PLOT_H}
                    precision={0}
                    include01
                    subtitle="1 means partial requalification out of caution is firing on the compact usefulness path"
                  />
                ) : (
                  <div />
                )}

                {series?.usefulness_trigger_exploit?.length ? (
                  <SparkLine
                    title="Usefulness trigger: exploit"
                    values={series.usefulness_trigger_exploit.map((v) => Number(v))}
                    cursorT={Math.min(tt, Math.max(0, series.usefulness_trigger_exploit.length - 1))}
                    height={PLOT_H}
                    precision={0}
                    include01
                    subtitle="1 means strong healthy requalification for exploit is firing on the compact usefulness path"
                  />
                ) : (
                  <div />
                )}

                {series?.misleading_activity?.length ? (
                  <SparkLine
                    title="Misleading activity"
                    values={series.misleading_activity.map((v) => Number(v))}
                    cursorT={Math.min(tt, Math.max(0, series.misleading_activity.length - 1))}
                    height={PLOT_H}
                    precision={6}
                    include0
                    subtitle="Per-step corruption-sensitive activity: positive when arrivals occur while mean entropy worsens"
                  />
                ) : (
                  <div />
                )}

                {series?.usefulness_gap?.length ? (
                  <SparkLine
                    title="Usefulness gap"
                    values={series.usefulness_gap.map((v) => Number(v))}
                    cursorT={Math.min(tt, Math.max(0, series.usefulness_gap.length - 1))}
                    height={PLOT_H}
                    precision={6}
                    include0
                    subtitle="Delivered activity minus realized entropy-reduction proxy"
                  />
                ) : (
                  <div />
                )}

                {series?.usefulness_recover_counter?.length ? (
                  <SparkLine
                    title="Recover persistence counter"
                    values={series.usefulness_recover_counter.map((v) => Number(v))}
                    cursorT={Math.min(tt, Math.max(0, series.usefulness_recover_counter.length - 1))}
                    height={PLOT_H}
                    precision={0}
                    include0
                    subtitle="Consecutive steps for the recover trigger"
                  />
                ) : (
                  <div />
                )}

                {series?.usefulness_caution_counter?.length ? (
                  <SparkLine
                    title="Caution persistence counter"
                    values={series.usefulness_caution_counter.map((v) => Number(v))}
                    cursorT={Math.min(tt, Math.max(0, series.usefulness_caution_counter.length - 1))}
                    height={PLOT_H}
                    precision={0}
                    include0
                    subtitle="Consecutive steps for the caution trigger"
                  />
                ) : (
                  <div />
                )}

                {series?.usefulness_recover_exit_counter?.length ? (
                  <SparkLine
                    title="Recover-exit persistence counter"
                    values={series.usefulness_recover_exit_counter.map((v) => Number(v))}
                    cursorT={Math.min(tt, Math.max(0, series.usefulness_recover_exit_counter.length - 1))}
                    height={PLOT_H}
                    precision={0}
                    include0
                    subtitle="Consecutive steps for recover-from-caution requalification"
                  />
                ) : (
                  <div />
                )}

                {series?.obs_age_steps?.length ? (
                  <SparkLine
                    title="Observation age steps"
                    values={series.obs_age_steps.map((v) => Number(v))}
                    cursorT={Math.min(tt, Math.max(0, series.obs_age_steps.length - 1))}
                    height={PLOT_H}
                    precision={0}
                    include0
                    subtitle="Raw delivered-observation age; negative means no valid age at that step"
                  />
                ) : (
                  <div />
                )}

                {series?.usefulness_exploit_counter?.length ? (
                  <SparkLine
                    title="Exploit persistence counter"
                    values={series.usefulness_exploit_counter.map((v) => Number(v))}
                    cursorT={Math.min(tt, Math.max(0, series.usefulness_exploit_counter.length - 1))}
                    height={PLOT_H}
                    precision={0}
                    include0
                    subtitle="Consecutive steps for strong exploit requalification"
                  />
                ) : (
                  <div />
                )}
              </SectionCard> : null}

              <SectionCard
                title="Operational sensing and motion"
                subtitle="What the deployment is doing at each step: coverage, detections, movement, and overlap with the burning region/front band."
              >
                <SparkLine
                  title="Coverage fraction — unique covered cells / (H·W)"
                  values={(series?.coverage_frac ?? []).map((v) => Number(v))}
                  cursorT={Math.min(tt, Math.max(0, (series?.coverage_frac?.length ?? 1) - 1))}
                  height={PLOT_H}
                  precision={5}
                  include01
                />

                <SparkLine
                  title="New coverage fraction — newly covered cells / (H·W)"
                  values={(series?.new_coverage_frac ?? []).map((v) => Number(v))}
                  cursorT={Math.min(tt, Math.max(0, (series?.new_coverage_frac?.length ?? 1) - 1))}
                  height={PLOT_H}
                  precision={5}
                  include01
                />

                <SparkLine
                  title="True detections any (current footprint hit)"
                  values={(
                    series?.true_detections_any ??
                    []
                  ).map((v) => Number(v))}
                  cursorT={Math.min(tt, Math.max(0, (series?.true_detections_any?.length ?? 1) - 1))}
                  height={PLOT_H}
                  precision={0}
                  include01
                  subtitle="Current-frame true hit against actively burning cells, before delay/loss/noise"
                />

                <SparkLine
                  title="Arrived detections any (delayed / impaired)"
                  values={(
                    series?.arrived_detections_any ??
                    series?.detections_any ??
                    []
                  ).map((v) => Number(v))}
                  cursorT={Math.min(
                    tt,
                    Math.max(0, ((series?.arrived_detections_any ?? series?.detections_any)?.length ?? 1) - 1)
                  )}
                  height={PLOT_H}
                  precision={0}
                  include01
                  subtitle="Arrived observation stream after delay/loss/noise; legacy detections_any maps to this"
                />

                <SparkLine
                  title="Mean L1 movement per sensor (cells/step)"
                  values={(series?.movement_l1_mean ?? []).map((v) => Number(v))}
                  cursorT={Math.min(tt, Math.max(0, (series?.movement_l1_mean?.length ?? 1) - 1))}
                  height={PLOT_H}
                  precision={4}
                  include0
                />

                <SparkLine
                  title="Overlap with burning region (fraction of sensors)"
                  values={(series?.overlap_fire_sensors ?? []).map((v) => Number(v))}
                  cursorT={Math.min(tt, Math.max(0, (series?.overlap_fire_sensors?.length ?? 1) - 1))}
                  height={PLOT_H}
                  precision={4}
                  include01
                />

                <SparkLine
                  title="Overlap with fire front band (fraction of sensors)"
                  values={(series?.overlap_front_sensors ?? []).map((v) => Number(v))}
                  cursorT={Math.min(tt, Math.max(0, (series?.overlap_front_sensors?.length ?? 1) - 1))}
                  height={PLOT_H}
                  precision={4}
                  include01
                />
              </SectionCard>
 
              <SectionCard
                title="Belief and entropy evolution"
                subtitle="Closed-loop epistemic quantities carried by O1: entropy evolution and realized arrival/detection fractions."
              >

                {series?.mean_entropy?.length ? (
                  <SparkLine
                    title="Mean entropy (O1 embedded)"
                    values={series.mean_entropy.map((v) => Number(v))}
                    cursorT={Math.min(tt, Math.max(0, series.mean_entropy.length - 1))}
                    height={PLOT_H}
                    precision={5}
                    subtitle="Computed from belief/entropy stored in the operational run (causal in O1)"
                  />
                ) : (
                  <div />
                )}

                {series?.delta_mean_entropy?.length ? (
                  <SparkLine
                    title="Δ mean entropy (O1 embedded)"
                    values={series.delta_mean_entropy.map((v) => Number(v))}
                    cursorT={Math.min(tt, Math.max(0, series.delta_mean_entropy.length - 1))}
                    height={PLOT_H}
                    precision={6}
                    include0
                    subtitle="ΔH̄(t) = mean_entropy(t+1) - mean_entropy(t)"
                  />
                ) : (
                  <div />
                )}

                {series?.arrivals_frac?.length ? (
                  <SparkLine
                    title="Arrivals fraction (realized budget)"
                    values={series.arrivals_frac.map((v) => Number(v))}
                    cursorT={Math.min(tt, Math.max(0, series.arrivals_frac.length - 1))}
                    height={PLOT_H}
                    precision={4}
                    include01
                    subtitle="Fraction of sensors with an arrived packet after loss/delay"
                  />
                ) : (
                  <div />
                )}

                {series?.detections_arrived_frac?.length ? (
                  <SparkLine
                    title="Detections arrived fraction"
                    values={series.detections_arrived_frac.map((v) => Number(v))}
                    cursorT={Math.min(tt, Math.max(0, series.detections_arrived_frac.length - 1))}
                    height={PLOT_H}
                    precision={4}
                    include01
                    subtitle="Fraction of sensors with arrived detection=1"
                  />
                ) : (
                  <div />
                )}
              </SectionCard>
 
              <SectionCard
                title="MDC residual diagnostics"
                subtitle="Diagnostic drivers and residuals. Prefer the delayed-aligned truthier driver when present."
              >
                {series?.driver_info_true?.length ? (
                  <SparkLine
                    title="Driver (info, truthier) — expected mutual information proxy"
                    values={series.driver_info_true.map((v) => Number(v))}
                    cursorT={Math.min(tt, Math.max(0, series.driver_info_true.length - 1))}
                    height={PLOT_H}
                    precision={5}
                    include0
                    subtitle={
                      series?.driver_info_true_kind
                        ? `Delayed-aligned information driver (${series.driver_info_true_kind})`
                        : "Binary sensor MI-style driver aligned to the delayed observation cause"
                    }
                  />
                ) : null}
                {series?.residual_cov?.length ? (
                  <SparkLine
                    title="Residual (cov) — ΔH̄ + c·arrivals"
                    values={series.residual_cov.map((v) => Number(v))}
                    cursorT={Math.min(tt, Math.max(0, series.residual_cov.length - 1))}
                    height={PLOT_H}
                    precision={6}
                    include0
                    refLines={
                      typeof epsCov === "number"
                        ? [
                            { y: +epsCov, dashed: true, label: "+eps_cov" },
                            { y: -epsCov, dashed: true, label: "-eps_cov" },
                          ]
                        : undefined
                    }
                    subtitle={
                      series?.residual_cov_driver
                        ? `r_cov(t) = ΔH̄(t) + c·${series.residual_cov_driver}(t)`
                        : "r_cov(t) = ΔH̄(t) + c·arrivals_frac(t)"
                    }
                  />
                ) : null}

                {series?.residual_info?.length ? (
                  <SparkLine
                    title="Residual (info) — ΔH̄ + c·d_info_true"
                    values={series.residual_info.map((v) => Number(v))}
                    cursorT={Math.min(tt, Math.max(0, series.residual_info.length - 1))}
                    height={PLOT_H}
                    precision={6}
                    include0
                    refLines={
                      typeof epsInfo === "number"
                        ? [
                            { y: +epsInfo, dashed: true, label: "+eps_info" },
                            { y: -epsInfo, dashed: true, label: "-eps_info" },
                          ]
                        : undefined
                    }
                    subtitle={
                      series?.residual_info_driver
                        ? `r_info uses ${series.residual_info_driver} with delayed-aligned diagnostics`
                        : "Uses the truthier delayed-aligned information driver"
                    }
                  />
                ) : null}
              
              </SectionCard>
              {advisorySummaryAvailable ? ( 
                <SectionCard
                  title="Advisory regime-management traces"
                  subtitle="Suggested regime state, suggested certified stage / opportunistic ladder level, and advisory trigger booleans. These are recommendation-side traces, not realized active-state quantities."
                >

                  {series?.regime_utilization?.length ? (
                    <SparkLine
                      title="Regime utilization"
                      values={series.regime_utilization.map((v) => Number(v))}
                      cursorT={Math.min(tt, Math.max(0, series.regime_utilization.length - 1))}
                      height={PLOT_H}
                      precision={4}
                      include01
                      subtitle="u_t = fraction of intended sensing budget still certificate-covered"
                    />
                  ) : (
                    <div />
                  )}

                  {series?.regime_strict_drift_proxy?.length ? (
                    <SparkLine
                      title="Regime strict drift proxy"
                      values={series.regime_strict_drift_proxy.map((v) => Number(v))}
                      cursorT={Math.min(tt, Math.max(0, series.regime_strict_drift_proxy.length - 1))}
                      height={PLOT_H}
                      precision={5}
                      include0
                      subtitle="Expected certified rate × utilization"
                    />
                  ) : (
                    <div />
                  )}

                  {series?.regime_local_drift_rate?.length ? (
                    <SparkLine
                      title="Regime local drift rate"
                      values={series.regime_local_drift_rate.map((v) => Number(v))}
                      cursorT={Math.min(tt, Math.max(0, series.regime_local_drift_rate.length - 1))}
                      height={PLOT_H}
                      precision={5}
                      include0
                      subtitle="Per-step entropy decrease after applying delayed observation"
                    />
                  ) : (
                    <div />
                  )}

                  {series?.regime_cumulative_exposure?.length ? (
                    <SparkLine
                      title="Regime cumulative exposure"
                      values={series.regime_cumulative_exposure.map((v) => Number(v))}
                      cursorT={Math.min(tt, Math.max(0, series.regime_cumulative_exposure.length - 1))}
                      height={PLOT_H}
                      precision={4}
                      include0
                      subtitle="Running cumulative uncertainty exposure"
                    />
                  ) : (
                    <div />
                  )}

                  {series?.regime_trigger_downshift?.length ? (
                    <SparkLine
                      title="Advisory trigger: downshift"
                      values={series.regime_trigger_downshift.map((v) => Number(v))}
                      cursorT={Math.min(tt, Math.max(0, series.regime_trigger_downshift.length - 1))}
                      height={PLOT_H}
                      precision={0}
                      include01
                      subtitle="Advisory trigger boolean per step: 1 means downshift condition fired"
                    />
                  ) : (
                    <div />
                  )}

                  {series?.regime_trigger_switch_to_certified?.length ? (
                    <SparkLine
                      title="Advisory trigger: switch to certified"
                      values={series.regime_trigger_switch_to_certified.map((v) => Number(v))}
                      cursorT={Math.min(tt, Math.max(0, series.regime_trigger_switch_to_certified.length - 1))}
                      height={PLOT_H}
                      precision={0}
                      include01
                      subtitle="Advisory trigger boolean per step: 1 means certified-switch condition fired"
                    />
                  ) : (
                    <div />
                  )}

                  {series?.regime_trigger_recovery?.length ? (
                    <SparkLine
                      title="Advisory trigger: recovery"
                      values={series.regime_trigger_recovery.map((v) => Number(v))}
                      cursorT={Math.min(tt, Math.max(0, series.regime_trigger_recovery.length - 1))}
                      height={PLOT_H}
                      precision={0}
                      include01
                      subtitle="Advisory trigger boolean per step: 1 means recovery condition fired"
                    />
                  ) : (
                    <div />
                  )}

                  {series?.regime_state?.length ? (
                    <SparkLine
                      title="Advisory regime state code"
                      values={series.regime_state.map((v) => Number(v))}
                      cursorT={Math.min(tt, Math.max(0, series.regime_state.length - 1))}
                      height={PLOT_H}
                      precision={0}
                      include0
                      subtitle="Advisory code derived from trigger conditions, not a realized active-state trace"
                    />
                  ) : (
                    <div />
                  )}

                  {series?.regime_certified_stage_index?.length ? (
                    <SparkLine
                      title="Advisory certified stage index"
                      values={series.regime_certified_stage_index.map((v) => Number(v))}
                      cursorT={Math.min(tt, Math.max(0, series.regime_certified_stage_index.length - 1))}
                      height={PLOT_H}
                      precision={0}
                      include0
                      subtitle="Suggested certified stage chosen from the advisory stage table"
                    />
                  ) : (
                    <div />
                  )}

                  {series?.regime_opportunistic_level_index?.length ? (
                    <SparkLine
                      title="Advisory opportunistic level index"
                      values={series.regime_opportunistic_level_index.map((v) => Number(v))}
                      cursorT={Math.min(tt, Math.max(0, series.regime_opportunistic_level_index.length - 1))}
                      height={PLOT_H}
                      precision={0}
                      include0
                      subtitle="Suggested ladder level chosen from utilization before active-state persistence logic"
                    />
                  ) : (
                    <div />
                  )}
                </SectionCard>
              ) : null}
 
              {activeStateSummaryAvailable ? (
                <SectionCard
                  title="Active regime-management traces"
                  subtitle="Realized active state, realized transition events, and the effective controls actually applied. This is the realized active-control layer, distinct from advisory suggestions."
                >
                  {series?.regime_active_state?.length ? (
                    <SparkLine
                      title="Active realized state code"
                      values={series.regime_active_state.map((v) => Number(v))}
                      cursorT={Math.min(tt, Math.max(0, series.regime_active_state.length - 1))}
                      height={PLOT_H}
                      precision={0}
                      include0
                      subtitle="Realized active state over time"
                    />
                  ) : (
                    <div />
                  )}

                  {series?.regime_active_transition_event?.length ? (
                    <SparkLine
                      title="Active realized transition events"
                      values={series.regime_active_transition_event.map((v) => Number(v))}
                      cursorT={Math.min(tt, Math.max(0, series.regime_active_transition_event.length - 1))}
                      height={PLOT_H}
                      precision={0}
                      include0
                      subtitle="Discrete realized transition events, not advisory trigger hits"
                    />
                  ) : (
                    <div />
                  )}

                  {series?.regime_effective_eta?.length ? (
                    <SparkLine
                      title="Effective eta (active control)"
                      values={series.regime_effective_eta.map((v) => Number(v))}
                      cursorT={Math.min(tt, Math.max(0, series.regime_effective_eta.length - 1))}
                      height={PLOT_H}
                      precision={4}
                      include0
                      subtitle="Episode-step effective eta applied by active mode (nonzero only in realized certified state)"
                    />
                  ) : (
                    <div />
                  )}

                  {series?.regime_advisory_stage_eta?.length ? (
                    <SparkLine
                      title="Advisory certified stage eta"
                      values={series.regime_advisory_stage_eta.map((v) => Number(v))}
                      cursorT={Math.min(tt, Math.max(0, series.regime_advisory_stage_eta.length - 1))}
                      height={PLOT_H}
                      precision={4}
                      include0
                      subtitle="Eta implied by the advisory certified stage, regardless of realized active state"
                    />
                  ) : (
                    <div />
                  )}

                  {series?.regime_effective_move_budget_cells?.length ? (
                    <SparkLine
                      title="Effective move budget (cells)"
                      values={series.regime_effective_move_budget_cells.map((v) => Number(v))}
                      cursorT={Math.min(tt, Math.max(0, series.regime_effective_move_budget_cells.length - 1))}
                      height={PLOT_H}
                      precision={4}
                      include0
                      subtitle="Motion budget actually applied after ladder / certified adjustments"
                    />
                  ) : (
                    <div />
                  )}

                  {series?.debug_active_downshift_support_score?.length ? (
                    <SparkLine
                      title="Active weak-support score"
                      values={series.debug_active_downshift_support_score.map((v) => Number(v))}
                      cursorT={Math.min(tt, Math.max(0, series.debug_active_downshift_support_score.length - 1))}
                      height={PLOT_H}
                      precision={4}
                      include01
                      subtitle="Lower values mean opportunistic posture is more weakly supported"
                    />
                  ) : (
                    <div />
                  )}

                  {series?.debug_trig_down_weak_support_component?.length ? (
                    <SparkLine
                      title="Active trigger: weak-support downshift"
                      values={series.debug_trig_down_weak_support_component.map((v) => Number(v))}
                      cursorT={Math.min(tt, Math.max(0, series.debug_trig_down_weak_support_component.length - 1))}
                      height={PLOT_H}
                      precision={0}
                      include01
                      subtitle="1 means the bounded weak-support shortcut is firing for active downshift"
                    />
                  ) : (
                    <div />
                  )}
                </SectionCard>
              ) : null}

              {showMechanismAudit ? (
                <SectionCard
                  title="Threshold-neighborhood and counter inspection (mechanism audit)"
                  subtitle="Diagnostic hysteresis / persistence / cooldown view: signal, effective threshold neighborhood, realized active state, and persistence / cooldown traces."
                >
                  {series?.regime_utilization?.length ? (
                    <SparkLine
                      title="Utilization with effective threshold neighborhood"
                      values={series.regime_utilization.map((v) => Number(v))}
                      cursorT={Math.min(tt, Math.max(0, series.regime_utilization.length - 1))}
                      height={PLOT_H}
                      precision={4}
                      include01
                      refLines={[
                        ...(series.debug_down_utilization_threshold?.length
                          ? [{ y: Number(series.debug_down_utilization_threshold[Math.min(tt, Math.max(0, series.debug_down_utilization_threshold.length - 1))]), dashed: true, label: "down" }]
                          : []),
                        ...(series.debug_switch_utilization_threshold?.length
                          ? [{ y: Number(series.debug_switch_utilization_threshold[Math.min(tt, Math.max(0, series.debug_switch_utilization_threshold.length - 1))]), dashed: true, label: "switch" }]
                          : []),
                        ...(series.debug_recovery_utilization_threshold?.length
                          ? [{ y: Number(series.debug_recovery_utilization_threshold[Math.min(tt, Math.max(0, series.debug_recovery_utilization_threshold.length - 1))]), dashed: true, label: "recovery" }]
                          : []),
                      ]}
                      subtitle="The step trace is utilization. Dashed reference lines show the current-frame effective hysteresis-shifted thresholds."
                    />
                  ) : (
                    <div />
                  )}

                  {series?.debug_down_utilization_margin?.length ? (
                    <SparkLine
                      title="Downshift utilization margin"
                      values={series.debug_down_utilization_margin.map((v) => Number(v))}
                      cursorT={Math.min(tt, Math.max(0, series.debug_down_utilization_margin.length - 1))}
                      height={PLOT_H}
                      precision={5}
                      include0
                      subtitle="Positive => utilization is on the downshift-firing side of the effective threshold"
                    />
                  ) : (
                    <div />
                  )}

                  {series?.debug_switch_utilization_margin?.length ? (
                    <SparkLine
                      title="Switch-to-certified utilization margin"
                      values={series.debug_switch_utilization_margin.map((v) => Number(v))}
                      cursorT={Math.min(tt, Math.max(0, series.debug_switch_utilization_margin.length - 1))}
                      height={PLOT_H}
                      precision={5}
                      include0
                      subtitle="Positive => utilization is on the certified-switch firing side of the effective threshold"
                    />
                  ) : (
                    <div />
                  )}

                  {series?.debug_recovery_utilization_margin?.length ? (
                    <SparkLine
                      title="Recovery utilization margin"
                      values={series.debug_recovery_utilization_margin.map((v) => Number(v))}
                      cursorT={Math.min(tt, Math.max(0, series.debug_recovery_utilization_margin.length - 1))}
                      height={PLOT_H}
                      precision={5}
                      include0
                      subtitle="Positive => utilization is on the recovery-firing side of the effective threshold"
                    />
                  ) : (
                    <div />
                  )}

                  {series?.debug_down_counter?.length ? (
                    <SparkLine
                      title="Downshift persistence counter"
                      values={series.debug_down_counter.map((v) => Number(v))}
                      cursorT={Math.min(tt, Math.max(0, series.debug_down_counter.length - 1))}
                      height={PLOT_H}
                      precision={0}
                      include0
                      subtitle="How long the downshift trigger has persisted in the current meaningful state"
                    />
                  ) : (
                    <div />
                  )}

                  {series?.debug_switch_counter?.length ? (
                    <SparkLine
                      title="Switch-to-certified persistence counter"
                      values={series.debug_switch_counter.map((v) => Number(v))}
                      cursorT={Math.min(tt, Math.max(0, series.debug_switch_counter.length - 1))}
                      height={PLOT_H}
                      precision={0}
                      include0
                      subtitle="How long the certified-switch trigger has persisted in the current meaningful state"
                    />
                  ) : (
                    <div />
                  )}

                  {series?.debug_recovery_counter?.length ? (
                    <SparkLine
                      title="Recovery persistence counter"
                      values={series.debug_recovery_counter.map((v) => Number(v))}
                      cursorT={Math.min(tt, Math.max(0, series.debug_recovery_counter.length - 1))}
                      height={PLOT_H}
                      precision={0}
                      include0
                      subtitle="How long the recovery trigger has persisted while recovery is meaningful"
                    />
                  ) : (
                    <div />
                  )}

                  {series?.debug_recovery_block_counter?.length ? (
                    <SparkLine
                      title="Recovery block / cooldown counter"
                      values={series.debug_recovery_block_counter.map((v) => Number(v))}
                      cursorT={Math.min(tt, Math.max(0, series.debug_recovery_block_counter.length - 1))}
                      height={PLOT_H}
                      precision={0}
                      include0
                      subtitle="Positive means downshift→nominal recovery is temporarily blocked to reduce chatter"
                    />
                  ) : (
                    <div />
                  )}

                  {series?.debug_leave_certified_counter?.length ? (
                    <SparkLine
                      title="Leave-certified persistence counter"
                      values={series.debug_leave_certified_counter.map((v) => Number(v))}
                      cursorT={Math.min(tt, Math.max(0, series.debug_leave_certified_counter.length - 1))}
                      height={PLOT_H}
                      precision={0}
                      include0
                      subtitle="How long certified-exit evidence has persisted while the active state is certified"
                    />
                  ) : (
                    <div />
                  )}

                  {series?.debug_active_downshift_support_score?.length ? (
                    <SparkLine
                      title="Weak-support score (mechanism audit)"
                      values={series.debug_active_downshift_support_score.map((v) => Number(v))}
                      cursorT={Math.min(tt, Math.max(0, series.debug_active_downshift_support_score.length - 1))}
                      height={PLOT_H}
                      precision={4}
                      include01
                      subtitle="Bounded active-support score used to expose weakly justified opportunistic posture"
                    />
                  ) : (
                    <div />
                  )}

                  {series?.debug_active_downshift_support_breadth?.length ? (
                    <SparkLine
                      title="Weak-support breadth"
                      values={series.debug_active_downshift_support_breadth.map((v) => Number(v))}
                      cursorT={Math.min(tt, Math.max(0, series.debug_active_downshift_support_breadth.length - 1))}
                      height={PLOT_H}
                      precision={4}
                      include01
                      subtitle="Front/support encounter breadth used alongside the weak-support score"
                    />
                  ) : (
                    <div />
                  )}

                  {series?.debug_active_corruption_guard_score?.length ? (
                    <SparkLine
                      title="Corruption-guard score"
                      values={series.debug_active_corruption_guard_score.map((v) => Number(v))}
                      cursorT={Math.min(tt, Math.max(0, series.debug_active_corruption_guard_score.length - 1))}
                      height={PLOT_H}
                      precision={4}
                      include01
                      subtitle="Support score used by the bounded corruption-guarded active downshift path"
                    />
                  ) : (
                    <div />
                  )}

                  {series?.debug_active_corruption_guard_breadth?.length ? (
                    <SparkLine
                      title="Corruption-guard breadth"
                      values={series.debug_active_corruption_guard_breadth.map((v) => Number(v))}
                      cursorT={Math.min(tt, Math.max(0, series.debug_active_corruption_guard_breadth.length - 1))}
                      height={PLOT_H}
                      precision={4}
                      include01
                      subtitle="Breadth companion used with the corruption-guarded support score"
                    />
                  ) : (
                    <div />
                  )}

                  {series?.debug_corruption_guard_counter?.length ? (
                    <SparkLine
                      title="Corruption-guard persistence counter"
                      values={series.debug_corruption_guard_counter.map((v) => Number(v))}
                      cursorT={Math.min(tt, Math.max(0, series.debug_corruption_guard_counter.length - 1))}
                      height={PLOT_H}
                      precision={0}
                      include0
                      subtitle="Persistence counter for the guarded corruption-led active downshift path"
                    />
                  ) : (
                    <div />
                  )}

                  {series?.debug_trig_down_corruption_guard_component?.length ? (
                    <SparkLine
                      title="Active trigger: corruption guard"
                      values={series.debug_trig_down_corruption_guard_component.map((v) => Number(v))}
                      cursorT={Math.min(tt, Math.max(0, series.debug_trig_down_corruption_guard_component.length - 1))}
                      height={PLOT_H}
                      precision={0}
                      include01
                      subtitle="1 means the guarded corruption-led downshift component is firing"
                    />
                  ) : (
                    <div />
                  )}

                  {series?.debug_trig_down_corruption_led_final?.length ? (
                    <SparkLine
                      title="Active trigger: corruption-led downshift (realized)"
                      values={series.debug_trig_down_corruption_led_final.map((v) => Number(v))}
                      cursorT={Math.min(tt, Math.max(0, series.debug_trig_down_corruption_led_final.length - 1))}
                      height={PLOT_H}
                      precision={0}
                      include01
                      subtitle="1 means realized active downshift is currently being explained by the mature corruption-led path"
                    />
                  ) : (
                    <div />
                  )}
                  {series?.debug_trig_leave_certified_final?.length ? (
                    <SparkLine
                      title="Leave-certified trigger"
                      values={series.debug_trig_leave_certified_final.map((v) => Number(v))}
                      cursorT={Math.min(tt, Math.max(0, series.debug_trig_leave_certified_final.length - 1))}
                      height={PLOT_H}
                      precision={0}
                      include01
                      subtitle="1 means explicit certified-exit evidence is firing at that step"
                    />
                  ) : (
                    <div />
                  )}

                  {series?.regime_active_state?.length ? (
                    <SparkLine
                      title="Active realized state (for alignment)"
                      values={series.regime_active_state.map((v) => Number(v))}
                      cursorT={Math.min(tt, Math.max(0, series.regime_active_state.length - 1))}
                      height={PLOT_H}
                      precision={0}
                      include0
                      subtitle="Use this with margins/counters to explain each realized state change"
                    />
                  ) : (
                    <div />
                  )}
                </SectionCard>
              ) : null}
            </>
          ) : (
            <div className="small" style={{ marginTop: 10, opacity: 0.8 }}>
              No operational time-series found for this run (did you run it after the backend patch?).
            </div>
          )}
        </>
      ) : (
        <div className="small">No run selected yet.</div>
      )}
    </div>
  );
}
