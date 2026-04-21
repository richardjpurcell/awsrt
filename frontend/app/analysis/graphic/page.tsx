"use client";

import { useEffect, useMemo, useState } from "react";
import { apiUrl, getJSON } from "@/lib/api";
import { useSearchParams } from "next/navigation";
import FigureStudio from "@/components/analysis/figures/FigureStudio";

type AnalysisListItem = {
  ana_id: string;
  study_type: string;
  created_at?: string | null;
  protocol_id?: string | null;
  phy_id?: string | null;
  run_count?: number;
  choose_best_by?: string | null;
  study_family?: string | null;
  comparison_axis?: string | null;
  comparison_tier?: string | null;
  preset_origin?: string | null;
};

type ListVerboseRes = { items: AnalysisListItem[] };
type Summary = Record<string, any>;

function isOperationalStudy(summary: Summary): boolean {
  return String((summary as any)?.study_type ?? "").trim() === "operational_study";
}

function fmtNum(x: any, digits = 6): string {
  const n = Number(x);
  if (!Number.isFinite(n)) return "—";
  if (Math.abs(n - Math.round(n)) < 1e-12) return String(Math.round(n));
  return n.toFixed(digits);
}

function fmtPct(x: any, digits = 1): string {
  const n = Number(x);
  if (!Number.isFinite(n)) return "—";
  return (100 * n).toFixed(digits) + "%";
}

function strOrDash(x: any): string {
  const s = String(x ?? "").trim();
  return s || "—";
}

function toNumberOrNull(x: any): number | null {
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}

function usefulnessProxyRead(summary: Summary | null): {
  deliveredMetric: string;
  deliveredValue: number | null;
  beliefMetric: string;
  beliefValue: number | null;
  ttfdValue: number | null;
  note: string;
} {
  if (!summary) {
    return {
      deliveredMetric: "—",
      deliveredValue: null,
      beliefMetric: "—",
      beliefValue: null,
      ttfdValue: null,
      note: "No usefulness-oriented reading available.",
    };
  }

  const by = (summary as any)?.policy_stats_by_metric ?? {};
  const bestPolicy = String((summary as any)?.best?.policy ?? "").trim();
  const deliveredMetric =
    by?.delivered_info_proxy_mean?.[bestPolicy]?.mean != null
      ? "delivered_info_proxy_mean"
      : by?.driver_info_true_mean?.[bestPolicy]?.mean != null
      ? "driver_info_true_mean"
      : "delivered_info_proxy_mean";
  const deliveredValue = toNumberOrNull(by?.[deliveredMetric]?.[bestPolicy]?.mean);
  const beliefMetric = "mean_entropy_auc";
  const beliefValue = toNumberOrNull(by?.mean_entropy_auc?.[bestPolicy]?.mean);
  const ttfdValue = toNumberOrNull(by?.ttfd?.[bestPolicy]?.mean);

  const note =
    deliveredValue === null || beliefValue === null
      ? "Usefulness-style reading is partial here because one or more proxy metrics are missing from the current summary artifact."
      : "Read delivered information and belief quality side by side. A strong real-fire usefulness-style slice does not assume that more delivered information automatically yields better belief improvement.";

  return { deliveredMetric, deliveredValue, beliefMetric, beliefValue, ttfdValue, note };
}

function summarizeStudyRole(summary: Summary | null): string {
  if (!summary) return "Study summary artifact";
  const sem = (summary as any)?.study_semantics ?? {};
  const family = String(sem?.study_family ?? "").trim();
  const axis = String(sem?.comparison_axis ?? "").trim();
  const tier = String(sem?.comparison_tier ?? "").trim();

  const familyText =
    family === "baseline_compare"
      ? "baseline comparison"
      : family === "mdc_compare"
      ? "MDC comparison"
      : family === "regime_advisory_compare"
      ? "regime advisory comparison"
      : family === "regime_active_compare"
      ? "regime active comparison"
      : family === "impairment_diagnostic"
      ? "impairment diagnostic"
      : family === "verification"
      ? "verification study"
      : "study";

  const axisText = axis ? ` centered on ${axis}` : "";
  const tierText =
    tier === "diagnostic"
      ? "Diagnostic interpretation should be read as supporting evidence, not headline performance claims."
      : "This is intended to support the main comparison reading path.";

  return `This ana-* artifact is a ${familyText}${axisText}. ${tierText}`;
}

function summarizeManifestContext(manifest: any): string {
  const baseManifest = manifest?.base_manifest || {};
  const net = baseManifest?.network || {};
  const impairments = baseManifest?.impairments || {};
  const o1 = baseManifest?.o1 || {};
  const parts: string[] = [];

  if (baseManifest?.phy_id) parts.push(`phy_id=${baseManifest.phy_id}`);
  if (net?.deployment_mode) parts.push(`mode=${net.deployment_mode}`);
  if (typeof net?.n_sensors === "number") parts.push(`n=${net.n_sensors}`);
  if (typeof net?.sensor_radius_m === "number") parts.push(`r=${net.sensor_radius_m}m`);
  if (typeof net?.sensor_move_max_m === "number") parts.push(`move=${net.sensor_move_max_m}m`);
  if (typeof net?.max_moves_per_step === "number") parts.push(`maxMoves/step=${net.max_moves_per_step}`);
  if (typeof impairments?.noise_level === "number") parts.push(`noise=${impairments.noise_level}`);
  if (typeof impairments?.delay_steps === "number") parts.push(`delay=${impairments.delay_steps}`);
  if (typeof impairments?.loss_prob === "number") parts.push(`loss=${impairments.loss_prob}`);
  if (typeof o1?.c_info === "number") parts.push(`c_info=${o1.c_info}`);
  if (typeof o1?.c_cov === "number") parts.push(`c_cov=${o1.c_cov}`);
  if (typeof o1?.eps_ref === "number") parts.push(`eps_ref=${o1.eps_ref}`);
  return parts.length ? parts.join(" · ") : "protocol: —";
}


function defaultMetricDirection(metric: string): "min" | "max" {
  const m = String(metric || "").toLowerCase();
  // Things where lower is better
  if (m === "ttfd") return "min";
  if (m.includes("time_to") || m.includes("time") || m.includes("latency")) return "min";
  if (m.includes("entropy")) return "min";
  if (m.includes("violation") || m.includes("error") || m.includes("loss")) return "min";
  if (m.includes("residual") && (m.includes("pos_frac") || m.includes("mean"))) return "min";
  if (m.includes("exposure")) return "min";
  if (m.includes("transition_count")) return "min";
  // AUC / coverage / info where higher is better
  if (m.includes("auc") || m.includes("coverage") || m.includes("info")) return "max";
  if (m.includes("in_band")) return "max";
  if (m.includes("utilization")) return "max";
  if (m.includes("drift_proxy")) return "max";
  if (m.includes("local_drift_rate")) return "max";
  // Default to max (safer for “score-like” quantities)
  return "max";
}

function hasRegimeSummary(summary: Summary): boolean {
  if (!summary || typeof summary !== "object") return false;
  const regimeCentered = Array.isArray((summary as any)?.metrics_catalog?.regime_centered)
    ? ((summary as any).metrics_catalog.regime_centered as any[])
    : [];
  const policyStats = (summary as any)?.policy_stats_by_metric ?? {};
  return (
    "regime_enabled" in summary ||
    "regime_utilization_mean" in summary ||
    "regime_strict_drift_proxy_mean" in summary ||
    "regime_local_drift_rate_mean" in summary ||
    "regime_cumulative_exposure_final" in summary ||
    "regime_advisory_downshift_trigger_hits" in summary ||
    "regime_advisory_switch_to_certified_trigger_hits" in summary ||
    "regime_advisory_recovery_trigger_hits" in summary ||
    "regime_active_transition_count" in summary ||
    "regime_effective_eta_mean" in summary ||
    "regime_effective_move_budget_cells_mean" in summary ||
    regimeCentered.length > 0 ||
    "regime_utilization_mean" in policyStats ||
    "regime_strict_drift_proxy_mean" in policyStats ||
    "regime_local_drift_rate_mean" in policyStats ||
    "regime_cumulative_exposure_final" in policyStats ||
    "regime_advisory_downshift_trigger_hits" in policyStats ||
    "regime_advisory_switch_to_certified_trigger_hits" in policyStats ||
    "regime_advisory_recovery_trigger_hits" in policyStats ||
    "regime_active_transition_count" in policyStats ||
    "regime_effective_eta_mean" in policyStats ||
    "regime_effective_move_budget_cells_mean" in policyStats
  );
}

function regimeStateLabel(code: any): string {
  const n = Number(code);
  if (!Number.isFinite(n)) return "—";
  if (n === 0) return "disabled";
  if (n === 1) return "opportunistic_nominal";
  if (n === 2) return "opportunistic_downshift";
  if (n === 3) return "certified_descent";
  if (n === 4) return "recovery_ready";
  return String(code);
}

function nonEmptyArray(x: any): string[] {
  return Array.isArray(x) ? x.map((v) => String(v ?? "").trim()).filter(Boolean) : [];
}

function sweepContextSummary(summary: Summary): {
  regimeFamilies: string[];
  impairmentLevels: string[];
  regimeModes: string[];
  overrideKeys: string[];
  primarySweepKey: string;
  sweepKind: string;
} {

  const ctx = ((summary as any)?.sweep_context && typeof (summary as any).sweep_context === "object")
    ? (summary as any).sweep_context
    : {};

  return {
    regimeFamilies: Array.isArray(ctx?.regime_families) ? ctx.regime_families : [],
    impairmentLevels: Array.isArray(ctx?.impairment_levels) ? ctx.impairment_levels : [],
    regimeModes: Array.isArray(ctx?.regime_modes) ? ctx.regime_modes : [],
    overrideKeys: Array.isArray(ctx?.override_keys) ? ctx.override_keys : [],
    primarySweepKey: String(ctx?.primary_sweep_key ?? "").trim(),
    sweepKind: String(ctx?.sweep_kind ?? "").trim(),
  };
}

function PolicySummaryChart({
  title,
  metric,
  direction,
  policyStats,
  winRates,
  baseline,
  width = 1280,
}: {
  title: string;
  metric: string;
  direction: "min" | "max";
  policyStats: Record<string, any>;
  winRates?: Record<string, any> | null;
  baseline?: string | null;
  width?: number;
}) {
  const W = Math.max(760, Math.min(1600, Math.floor(width ?? 1280)));
  const pad = 16;
  const labelW = Math.max(170, Math.floor(W * 0.16));
  const barH = 24;
  const gap = 12;
  const valuePadRight = Math.max(250, Math.floor(W * 0.22)); // mean±std + win-rate text


  const policies = Object.keys(policyStats || {}).filter(Boolean);
  if (!policies.length) return null;

  // Assemble rows with mean/std; drop missing means.
  const rows = policies
    .map((p) => {
      const ps = policyStats?.[p] ?? {};
      const mu = toNumberOrNull(ps?.mean);
      const sd = toNumberOrNull(ps?.std);
      const n = toNumberOrNull(ps?.n);
      const wr = winRates?.[p] ?? null;
      const winRate = toNumberOrNull(wr?.win_rate);
      const wins = toNumberOrNull(wr?.wins);
      const total = toNumberOrNull(wr?.total);
      return { label: p, mean: mu, std: sd, n, winRate, wins, total };
    })
    .filter((r) => r.mean !== null) as Array<{
    label: string;
    mean: number;
    std: number | null;
    n: number | null;
    winRate: number | null;
    wins: number | null;
    total: number | null;
  }>;

  if (!rows.length) return null;

  // Order: best first by mean(metric) according to direction; keep baseline near top if present.
  const sorted = rows.slice().sort((a, b) => (direction === "min" ? a.mean - b.mean : b.mean - a.mean));
  const baselineKey = String(baseline ?? "").trim();
  const ordered =
    baselineKey && sorted.some((r) => r.label === baselineKey)
      ? [sorted.find((r) => r.label === baselineKey)!, ...sorted.filter((r) => r.label !== baselineKey)]
      : sorted;

  const means = ordered.map((r) => r.mean);
  const vMin = Math.min(...means);
  const vMax = Math.max(...means);
  const span = vMax - vMin || 1;
  const allEqual = Math.abs(vMax - vMin) < 1e-12;

  const barW = W - pad * 2 - labelW - valuePadRight;
  const x0 = pad + labelW;
  const y0 = pad + 24;

  const widthOf = (v: number) => {
    const t = (v - vMin) / span;
    const better = direction === "min" ? 1 - t : t;
    if (allEqual) return Math.max(1, 0.75 * barW);
    return Math.max(1, better * barW);
  };

  const fmt = (v: number, digits = 6) => {
    if (Math.abs(v - Math.round(v)) < 1e-12) return String(Math.round(v));
    return v.toFixed(digits).replace(/0+$/, "").replace(/\.$/, "");
  };

  return (
    <div style={{ marginTop: 10 }}>
      <div className="small" style={{ marginBottom: 6 }}>
        {title}{" "}
        <span style={{ opacity: 0.7 }}>
          (metric=<b>{metric}</b> · {direction === "min" ? "lower is better" : "higher is better"})
        </span>
      </div>
      <div
        style={{
          border: "1px solid rgba(0,0,0,0.12)",
          borderRadius: 10,
          padding: 10,
          background: "#fff",
          width: "100%",
          maxWidth: "100%",
        }}
      >
        <svg
          width="100%"
          viewBox={`0 0 ${W} ${Math.max(180, y0 + ordered.length * (barH + gap) + pad)}`}
          preserveAspectRatio="xMinYMin meet"
        >
          <line x1={x0} x2={x0 + barW} y1={y0 - 10} y2={y0 - 10} stroke="rgba(0,0,0,0.12)" strokeWidth="2" />

          {ordered.map((d, i) => {
            const y = y0 + i * (barH + gap);
            const w = widthOf(d.mean);
            const isBase = baselineKey && d.label === baselineKey;
            const wrTxt =
              d.winRate !== null && d.wins !== null && d.total !== null
                ? ` · win=${(d.winRate * 100).toFixed(1)}% (${d.wins}/${d.total})`
                : "";
            const sdTxt = d.std !== null ? ` ±${fmt(d.std, 6)}` : "";
            const nTxt = d.n !== null ? ` · n=${Math.round(d.n)}` : "";
            const label =
              d.label.length > 30
                ? `${d.label.slice(0, 29)}…${isBase ? " (baseline)" : ""}`
                : (isBase ? `${d.label} (baseline)` : d.label);
            return (
              <g key={i}>
                <text x={pad} y={y + barH * 0.72} fontSize="12" fill="rgba(0,0,0,0.78)">
                  {label}
                </text>
                <rect
                  x={x0}
                  y={y}
                  width={w}
                  height={barH}
                  rx={8}
                  ry={8}
                  fill={isBase ? "rgba(0,0,0,0.25)" : "rgba(0,0,0,0.35)"}
                />
                <text x={x0 + w + 8} y={y + barH * 0.72} fontSize="12" fill="rgba(0,0,0,0.78)">
                  {fmt(d.mean, 6)}
                  {sdTxt}
                  {nTxt}
                  {wrTxt}
                </text>
              </g>
            );
          })}
        </svg>
        {allEqual ? (
          <div className="small" style={{ marginTop: 8, opacity: 0.75 }}>
            All policy means tie on <b>{metric}</b>. (Still showing ±std and win-rate where available.)
          </div>
        ) : null}
      </div>
    </div>
  );
}


export default function AnalysisGraphicPage() {
  const searchParams = useSearchParams();
  const qid = searchParams.get("id") || "";

  const [items, setItems] = useState<AnalysisListItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [manifest, setManifest] = useState<any | null>(null);
  const [err, setErr] = useState<string>("");
  const [loadedSummaries, setLoadedSummaries] = useState<Record<string, Summary>>({});
  const [loadedManifests, setLoadedManifests] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<boolean>(false);

  const [plotMetric, setPlotMetric] = useState<string>("__choose_best_by__");

  const studyRoleText = summarizeStudyRole(summary);
  const manifestSummaryText = summarizeManifestContext(manifest);

  useEffect(() => {
    getJSON<ListVerboseRes>("/analysis/list_verbose")
      .then((r) => setItems(Array.isArray(r?.items) ? r.items : []))
      .catch((e) => {
        console.error(e);
        setErr(String(e?.message ?? e));
      });
  }, []);

  async function loadStudy(idIn: string) {
    const id = String(idIn || "").trim();
    setErr("");
    setSummary(null);
    setManifest(null);
    if (!id) return;
    setLoading(true);
    try {
      const nextSummary = await getJSON<Summary>(`/analysis/${id}/summary`);
      const nextManifest = await getJSON<any>(`/analysis/${id}/manifest`);
      setSummary(nextSummary);
      setManifest(nextManifest);
      setLoadedSummaries((prev) => ({ ...prev, [id]: nextSummary }));
      setLoadedManifests((prev) => ({ ...prev, [id]: nextManifest }));
    } catch (e: any) {
      console.error(e);
      setErr(String(e?.message ?? e));
    } finally {
      setLoading(false);
    }
  }

  async function warmLoadedStudies() {
    const ids = items.map((it) => String(it.ana_id ?? "").trim()).filter(Boolean);
    const missing = ids.filter((id) => !loadedSummaries[id]);
    if (!missing.length) return;
    try {
      const pairs = await Promise.all(
        missing.map(async (id) => {
          const s = await getJSON<Summary>(`/analysis/${id}/summary`);
          return [id, s] as const;
        })
      );
      setLoadedSummaries((prev) => ({ ...prev, ...Object.fromEntries(pairs) }));
    } catch (e) {
      console.error(e);
    }
  }

  async function load() {
    return loadStudy(selectedId);
  }

  function metaById(anaId: string): AnalysisListItem | null {
    const s = String(anaId ?? "").trim();
    if (!s) return null;
    return items.find((x) => String(x?.ana_id ?? "") === s) ?? null;
  }

  function studyLabel(anaId: string): string {
    const m = metaById(anaId);
    if (!m) return anaId;
    const fam = String(m.study_family ?? "operational_study");
    const axis = m.comparison_axis ? ` · ${m.comparison_axis}` : "";
    const tier = m.comparison_tier ? ` · ${m.comparison_tier}` : "";
    const proto = String(m.protocol_id ?? "—");
    const n = typeof m.run_count === "number" ? m.run_count : 0;
    const phy = m.phy_id ? ` · ${m.phy_id}` : "";
    return `${anaId} · ${fam}${axis}${tier} · ${proto}${phy} · ${n} runs`;
  }

  const orderedStudyIds = useMemo(() => {
    return items.map((it) => String(it.ana_id ?? "").trim()).filter(Boolean);
  }, [items]);

  // If opened with ?id=ana-..., preselect it and auto-load.
  useEffect(() => {
    if (!qid) return;
    setSelectedId(qid);
    loadStudy(qid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qid]);

  useEffect(() => {
    if (!items.length) return;
    warmLoadedStudies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  function bestRow(summary: Summary): any | null {
    return operationalBestRow(summary);
  }

  // ----------------------------
  // Plot metric selector (Option A)
  // ----------------------------

  // Build a compact set of candidate metrics from loaded summaries.
  // Only include keys that look numeric in at least one row.
  const metricOptions = (() => {
    const keys = new Set<string>();
    if (summary) {
      const s = summary;
      const by = (s as any)?.policy_stats_by_metric;
      if (by && typeof by === "object") {
        for (const mk of Object.keys(by)) {
          const ps = by[mk];
          if (!ps || typeof ps !== "object") continue;
          const pols = Object.keys(ps);
          const ok = pols.some((p) => toNumberOrNull(ps?.[p]?.mean) !== null);
          if (ok) keys.add(mk);
        }
      }
    }


    const prefer = [
      "ttfd",
      "mean_entropy_auc",
      "coverage_auc",
      "regime_utilization_mean",
      "regime_strict_drift_proxy_mean",
      "regime_local_drift_rate_mean",
      "regime_cumulative_exposure_final",
      "regime_advisory_downshift_trigger_hits",
      "regime_advisory_switch_to_certified_trigger_hits",
      "regime_advisory_recovery_trigger_hits",
      "regime_active_transition_count",
      "regime_effective_eta_mean",
      "regime_active_state_nominal_frac",
      "regime_active_state_downshift_frac",
      "regime_active_state_certified_frac",
      "regime_advisory_stage_eta_mean",
      "regime_effective_move_budget_cells_mean",
      "driver_info_true_mean",
      "driver_info_mean",
      "mdc_violation_rate",

      "delivered_info_proxy_mean",

      "residual_info_in_band_frac",
      "residual_cov_in_band_frac",
      "arrivals_frac_mean",
      "detections_arrived_frac_mean",
      "moves_per_step_mean",
      "moved_frac_mean",
      "overlap_front_mean",
      "residual_info_mean",
      "residual_cov_mean",
      "residual_info_pos_frac",
      "residual_cov_pos_frac",
    ];
    const rest = Array.from(keys).filter((k) => !prefer.includes(k)).sort();
    return ["__choose_best_by__", ...prefer.filter((k) => keys.has(k)), ...rest];
  })();

  function operationalMetric(summary: Summary): string {
    return String((summary as any)?.choose_best_by ?? (summary as any)?.best?.metric ?? "ttfd").trim() || "ttfd";
  }

  function operationalPolicyStatsForMetric(summary: Summary, metric: string): Record<string, any> {
    const m = String(metric || "").trim();
    const by = (summary as any)?.policy_stats_by_metric ?? null;
    if (by && typeof by === "object" && by[m] && typeof by[m] === "object") return by[m];
    
    const ps = (summary as any)?.policy_stats ?? {};
    return (ps && typeof ps === "object") ? ps : {};
  }

 function operationalWinRatesForMetric(summary: Summary, metric: string): Record<string, any> {
   const m = String(metric || "").trim();
   const by = (summary as any)?.win_rates_vs_baseline ?? null;
   if (by && typeof by === "object" && by[m] && typeof by[m] === "object") {
     return by[m]?.policies ?? {};
   }
   return {};
 }

function operationalDirectionForMetric(summary: Summary, metric: string): "min" | "max" {
  const m = String(metric || "").trim();

  const dCatalog = String((summary as any)?.metric_semantics?.[m]?.direction ?? (summary as any)?.metrics_catalog?.direction?.[m] ?? "")
    .toLowerCase()
    .trim();
  if (dCatalog === "min" || dCatalog === "max") return dCatalog as "min" | "max";

  const choose = operationalMetric(summary);
  if (m && m === choose) {
    const d = String((summary as any)?.direction ?? "").toLowerCase().trim();
    if (d === "min" || d === "max") return d as "min" | "max";
  }

  return defaultMetricDirection(m);
}

  function operationalBestRow(summary: Summary): any | null {
    const bestPol = String((summary as any)?.best?.policy ?? "").trim();
    if (!bestPol) return null;
    const by = (summary as any)?.policy_stats_by_metric ?? {};
    const getMean = (m: string) => {
      const mu = by?.[m]?.[bestPol]?.mean;
      return toNumberOrNull(mu);
    };
    // Synthesize a "row-like" object for leaderboard columns
    return {
      policy: bestPol,
      ttfd: getMean("ttfd"),
      mean_entropy_auc: getMean("mean_entropy_auc"),
      coverage_auc: getMean("coverage_auc"),
      regime_utilization_mean: getMean("regime_utilization_mean"),
      regime_strict_drift_proxy_mean: getMean("regime_strict_drift_proxy_mean"),
      regime_local_drift_rate_mean: getMean("regime_local_drift_rate_mean"),
      regime_cumulative_exposure_final: getMean("regime_cumulative_exposure_final"),
      regime_active_transition_count: getMean("regime_active_transition_count"),
      regime_effective_eta_mean: getMean("regime_effective_eta_mean"),
      regime_effective_move_budget_cells_mean: getMean("regime_effective_move_budget_cells_mean"),
      moves_per_step_mean: getMean("moves_per_step_mean"),
      moved_frac_mean: getMean("moved_frac_mean"),
      // mdc_info_regime doesn't exist as numeric mean; leave unset
    };
  }


  function fmt(x: any, digits = 4) {
    if (x === null || x === undefined) return "—";
    const n = Number(x);
    if (!Number.isFinite(n)) return String(x);
    // show integers cleanly
    if (Math.abs(n - Math.round(n)) < 1e-12) return String(Math.round(n));
    return n.toFixed(digits);
  }

  function oprLink(oprId: any) {
    const s = String(oprId ?? "").trim();
    if (!s) return null;
    return (
      <a href={`/operational/visualizer?id=${encodeURIComponent(s)}`} style={{ marginLeft: 8 }}>
        open →
      </a>
    );
  }


  function runLink(row: any) {

    if (row?.opr_id) return oprLink(row.opr_id);

    const v = String(row?.id ?? "").trim();
    if (v.startsWith("opr-")) return oprLink(v);

    return null;
  }

  function tierCardStyle(tier: string | null | undefined) {
    const t = String(tier ?? "").trim();
    if (t === "diagnostic") {
      return {
        border: "1px solid #f2d38a",
        background: "rgba(242, 211, 138, 0.14)",
      };
    }
    return {
      border: "1px solid rgba(0,0,0,0.08)",
      background: "rgba(0,0,0,0.02)",
    };
  }

  return (
    <div className="card">
      <h2>Analysis · Graphic</h2>
      <div aria-hidden className="section-stripe section-stripe--analysis" />
      <div className="small" style={{ lineHeight: 1.45 }}>
        Select one operational study (ana-*) and inspect its study semantics, primary metrics, and policy summary artifact.
      </div>
      <div className="small" style={{ lineHeight: 1.45, opacity: 0.84, marginTop: 6 }}>
        This page is the canonical polished reading path for a completed <b>ana-*</b> study. Use it to interpret study intent,
        summary metrics, and comparison artifacts before going to Raw for audit.
      </div>

      {summary && selectedId ? (
        <div className="card" style={{ marginTop: 10, background: "rgba(0,0,0,0.02)" }}>
          <h2 style={{ marginTop: 0, fontSize: 16 }}>Role of this artifact</h2>
          <div className="small" style={{ lineHeight: 1.5 }}>
            {studyRoleText}
          </div>
          <div className="small" style={{ marginTop: 8, opacity: 0.8 }}>Base manifest snapshot: <span title={manifestSummaryText}>{manifestSummaryText}</span></div>
      </div>
      ) : null}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 12,
          marginTop: 10,
        }}
      >
        <div className="card" style={{ marginTop: 0 }}>
          <h2 style={{ marginTop: 0, fontSize: 16 }}>Study controls</h2>
          <div className="row" style={{ alignItems: "center" }}>
            <label>Study</label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              style={{ minWidth: 420 }}
              disabled={loading}
            >
              <option value="">(none)</option>
              {items.map((it) => (
                <option key={it.ana_id} value={it.ana_id}>
                  {studyLabel(it.ana_id)}
                </option>
              ))}
            </select>
          </div>
          <div className="row" style={{ alignItems: "center" }}>
            <label>Plot metric</label>
            <select
              value={plotMetric}
              onChange={(e) => setPlotMetric(String(e.target.value))}
              style={{ minWidth: 340 }}
              disabled={loading}
            >
              {metricOptions.map((m) => (
                <option key={m} value={m}>
                  {m === "__choose_best_by__" ? "(use choose_best_by per study)" : m}
                </option>
              ))}
            </select>
          </div>
          <div className="small" style={{ opacity: 0.8, marginTop: 6 }}>
            {plotMetric === "__choose_best_by__"
              ? "Uses the study’s choose_best_by (or best.metric)."
              : "Applies the selected metric to this study’s summary artifact."}
          </div>
        </div>
      </div>



      <div className="row">
       <button onClick={load} disabled={loading || !selectedId}>
          {loading ? "Loading..." : (qid ? "Refresh" : "Generate Analysis")}
        </button>
        {qid ? (
          <div className="small" style={{ opacity: 0.8, alignSelf: "center" }}>
            Auto-loaded from URL; adjust the study selection then click Refresh.
          </div>
        ) : null}
      </div>

      {err ? (
        <div className="card" style={{ border: "1px solid #f3c1c1" }}>
          <h2>Error</h2>
          <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{err}</pre>
        </div>
      ) : null}

      {summary && selectedId ? (
        <div className="card" style={{ marginTop: 10 }}>
          <h2>Figure Studio</h2>
          <div className="small" style={{ lineHeight: 1.45 }}>
            Publication-grade figures from <b>summary.json</b> (no CSV scanning): Study → Artifact → Summary → Figure → Claim.
          </div>
          <div style={{ marginTop: 10 }}>
            <FigureStudio
              key={selectedId}
              summaries={loadedSummaries[selectedId] ? loadedSummaries : { [selectedId]: summary }}
              orderedStudyIds={orderedStudyIds.length ? orderedStudyIds : [selectedId]}
              defaultStudyId={selectedId}
              getStudyLabel={(anaId) => studyLabel(anaId)}
            />
          </div>
        </div>
      ) : null}

      {summary && selectedId ? (
        <div className="card">
          <h2>Study snapshot</h2>
          <div className="small" style={{ lineHeight: 1.45 }}>
            Compact report view for the selected study, emphasizing study intent, best policy, and a few comparison-first metrics.
          </div>
          <div className="small" style={{ lineHeight: 1.45, opacity: 0.8, marginTop: 6 }}>
            Treat this card as the study-level summary checkpoint before reading the detailed comparison panels below.
          </div>
          <div style={{ overflowX: "auto", marginTop: 8 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 6 }}>ana_id</th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 6 }}>intent</th>

                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 6 }}>protocol</th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 6 }}>best</th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 6 }}>best metric</th>

                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 6 }}>ttfd</th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 6 }}>mean_entropy_auc</th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 6 }}>mdc_violation_rate</th>

                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 6 }}></th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const anaId = selectedId;
                  const s = summary;
                  const r = bestRow(s);
                  const bestLabel = s?.best?.policy ?? s?.best?.opr_id ?? "—";
                  const sem = (s as any)?.study_semantics ?? {};
                  const intentText = `${String(sem?.study_family ?? "—")} · ${String(sem?.comparison_axis ?? "—")} · ${String(sem?.comparison_tier ?? "—")}`;

                  return (
                    <tr key={anaId}>
                      <td style={{ borderBottom: "1px solid #eee", padding: 6 }}>{anaId}</td>
                      <td style={{ borderBottom: "1px solid #eee", padding: 6 }}>{intentText}</td>
                      <td style={{ borderBottom: "1px solid #eee", padding: 6 }}>{String(s?.protocol_id ?? "—")}</td>
                      <td style={{ borderBottom: "1px solid #eee", padding: 6 }}>{String(bestLabel)}</td>
                      <td style={{ borderBottom: "1px solid #eee", padding: 6 }}>
                        {String(s?.best?.metric ?? "—")}={fmt(s?.best?.value, 6)}
                      </td>
                      <td style={{ borderBottom: "1px solid #eee", padding: 6 }}>{fmt(r?.ttfd, 0)}</td>
                      <td style={{ borderBottom: "1px solid #eee", padding: 6 }}>{fmt(r?.mean_entropy_auc, 6)}</td>
                      <td style={{ borderBottom: "1px solid #eee", padding: 6 }}>{fmt((s as any)?.policy_stats_by_metric?.mdc_violation_rate?.[String((s as any)?.best?.policy ?? "")]?.mean, 6)}</td>
                      <td style={{ borderBottom: "1px solid #eee", padding: 6 }}>
                        <a href={apiUrl(`/analysis/${anaId}/table.csv`)} target="_blank" rel="noreferrer">csv</a>
                        {r ? runLink(r) : null}
                      </td>
                    </tr>
                  );
                })()}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
      
      {/* Compact “small multiples” layout: 2 columns on medium screens, 3 on wide screens. */}
      <div
        className="analysisGrid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 14,
          alignItems: "start",
          marginTop: 10,
        }}
      >
        {summary && selectedId && isOperationalStudy(summary) ? (() => {
          const id = selectedId;
          const s = summary;

          const sweepCtx = sweepContextSummary(s);
          const chosenMetric = operationalMetric(s);
          const activeMetric =
            plotMetric === "__choose_best_by__"
              ? chosenMetric
              : String(plotMetric || "").trim();
          const activeDirection = activeMetric
            ? operationalDirectionForMetric(s, activeMetric)
            : "max";

          const manifestForCard = manifest || {};
          const baseManifest = manifestForCard?.base_manifest || {};
          const studySemantics = (s as any)?.study_semantics ?? {};
          const regimeSemantics = studySemantics?.regime_semantics ?? {};
          const metricSemantics = (s as any)?.metric_semantics ?? {};
          const tierStyle = tierCardStyle(studySemantics?.comparison_tier);
          const usefulnessRead = usefulnessProxyRead(s);
          const net = baseManifest?.network || {};
          const impairments = baseManifest?.impairments || {};
          const o1 = baseManifest?.o1 || {};
          const protocolParts: string[] = [];
          if (baseManifest?.phy_id) protocolParts.push(`phy_id=${baseManifest.phy_id}`);

          const regimeTransitionRead = (() => {
            const activeLastState = (s as any)?.regime_active_last_state;
            const activeTransitionCount = toNumberOrNull((s as any)?.regime_active_transition_count);
            const exposureFinal = toNumberOrNull((s as any)?.regime_cumulative_exposure_final);
            const etaMean = toNumberOrNull((s as any)?.regime_effective_eta_mean);
            const moveBudgetMean = toNumberOrNull((s as any)?.regime_effective_move_budget_cells_mean);
            const advisoryEtaMean = toNumberOrNull((s as any)?.regime_advisory_stage_eta_mean);

            const nominalFrac = toNumberOrNull((s as any)?.regime_active_state_nominal_frac);
            const downshiftFrac = toNumberOrNull((s as any)?.regime_active_state_downshift_frac);
            const certifiedFrac = toNumberOrNull((s as any)?.regime_active_state_certified_frac);

            const advisoryDownHits =
              toNumberOrNull((s as any)?.regime_advisory_downshift_trigger_hits);

            const advisorySwitchHits =
              toNumberOrNull((s as any)?.regime_advisory_switch_to_certified_trigger_hits);

            const advisoryRecoveryHits =
              toNumberOrNull((s as any)?.regime_advisory_recovery_trigger_hits);

            let read = "No compact transition reading available.";
            if (activeTransitionCount !== null && activeTransitionCount === 0) {
              read = "Advisory criteria may have fired, but no realized active-state transitions were recorded.";
            } else if (activeTransitionCount !== null && activeTransitionCount > 0 && certifiedFrac !== null && certifiedFrac > 0) {
              read = "This study realized active transitions and spent nonzero occupancy in certified descent.";
            } else if (activeTransitionCount !== null && activeTransitionCount > 0 && downshiftFrac !== null && downshiftFrac > 0) {
              read = "This study realized active transitions, but the visible active occupancy remained mostly nominal/downshift rather than certified.";
            }

            return {
              activeLastState,
              activeTransitionCount,
              exposureFinal,
              etaMean,
              advisoryEtaMean,
              moveBudgetMean,
              nominalFrac,
              downshiftFrac,
              certifiedFrac,
              advisoryDownHits,
              advisorySwitchHits,
              advisoryRecoveryHits,
              read,
            };
          })();

          const readingNote =
            sweepCtx?.primarySweepKey === "hysteresis_band"
              ? "Read this study mainly as a transition-sensitivity experiment: the central question is whether hysteresis changes realized active behavior, not only advisory trigger counts."
              : sweepCtx?.primarySweepKey === "persistence_steps"
              ? "Read this study mainly as a persistence-sensitivity experiment: the central question is how much sustained evidence is required before active transitions are realized."
              : "Read this study as a summary-artifact comparison first, then use Raw for row-preview diagnostics when transition mechanics matter.";

          if (net?.deployment_mode) protocolParts.push(`mode=${net.deployment_mode}`);
          if (typeof net?.n_sensors === "number") protocolParts.push(`n=${net.n_sensors}`);
          if (typeof net?.sensor_radius_m === "number") protocolParts.push(`r=${net.sensor_radius_m}m`);
          if (typeof net?.sensor_move_max_m === "number") protocolParts.push(`move=${net.sensor_move_max_m}m`);
          if (typeof net?.max_moves_per_step === "number") protocolParts.push(`maxMoves/step=${net.max_moves_per_step}`);
          if (typeof impairments?.noise_level === "number") protocolParts.push(`noise=${impairments.noise_level}`);
          if (typeof impairments?.delay_steps === "number") protocolParts.push(`delay=${impairments.delay_steps}`);
          if (typeof impairments?.loss_prob === "number") protocolParts.push(`loss=${impairments.loss_prob}`);
          if (typeof o1?.seed === "number") protocolParts.push(`seed=${o1.seed}`);
          if (typeof o1?.c_info === "number") protocolParts.push(`c_info=${o1.c_info}`);
          if (typeof o1?.c_cov === "number") protocolParts.push(`c_cov=${o1.c_cov}`);
          if (typeof o1?.eps_ref === "number") protocolParts.push(`eps_ref=${o1.eps_ref}`);
          const protocolSummary = protocolParts.length ? protocolParts.join(" · ") : "protocol: —";

          return (
            <div className="card" key={id}>
              <div
                className="card"
                style={{
                  marginTop: 0,
                  ...tierStyle,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <h2 style={{ marginTop: 0, marginBottom: 6 }}>{id}</h2>
                    <div className="small" style={{ lineHeight: 1.5 }}>
                      <b>{String(studySemantics?.study_family ?? "—")}</b>
                      {" · "}
                      <b>{String(studySemantics?.comparison_axis ?? "—")}</b>
                      {" · "}
                      <b>{String(studySemantics?.comparison_tier ?? "—")}</b>
                    </div>
                  </div>
                  <div className="small" style={{ textAlign: "right", opacity: 0.85 }}>
                    <div>protocol: <b>{String(s.protocol_id ?? "—")}</b></div>
                    <div>created: <b>{String(s.created_at ?? "—")}</b></div>
                    <div>runs: <b>{String(((s.opr_ids ?? []) as any[]).length ?? "—")}</b></div>
                  </div>
                </div>
                <div className="small" style={{ marginTop: 8, opacity: 0.82 }}>
                  preset=<b>{String(studySemantics?.preset_origin ?? "—")}</b>
                  {" · "}baseline-policy-group=<b>{String(studySemantics?.policy_semantics?.contains_baseline ?? "—")}</b>
                  {" · "}mdc-policy-group=<b>{String(studySemantics?.policy_semantics?.contains_mdc ?? "—")}</b>
                </div>
                <div className="small" style={{ marginTop: 6, opacity: 0.8, lineHeight: 1.45 }}>
                  {studyRoleText}
                </div>
                <div className="small" style={{ marginTop: 6, opacity: 0.78 }}>
                  base manifest: <span title={manifestSummaryText}>{manifestSummaryText}</span>
                </div>
              </div>

            {hasRegimeSummary(s) ? (
              <div className="card" style={{ marginTop: 10 }}>
                <h2 style={{ marginTop: 0 }}>Regime summary</h2>
                <div className="small" style={{ opacity: 0.88, lineHeight: 1.45, marginBottom: 8 }}>
                  regime_present=<b>{String(regimeSemantics?.regime_present ?? "—")}</b>
                  {" · "}families=<b>{nonEmptyArray(regimeSemantics?.regime_families_present).length ? nonEmptyArray(regimeSemantics?.regime_families_present).join(", ") : "—"}</b>
                  {" · "}separate-advisory-active=<b>{String(regimeSemantics?.frontend_should_separate_advisory_and_active ?? "—")}</b>
                </div>
                <div className="small" style={{ opacity: 0.8, marginBottom: 10 }}>
                  {readingNote}
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    gap: 8,
                    marginTop: 8,
                  }}
                  className="regimeSummaryStatsGrid"   
                >
                  <div className="card" style={{ marginTop: 0, background: "rgba(0,0,0,0.02)" }}>
                    <h2 style={{ marginTop: 0, fontSize: 16 }}>Advisory context</h2>
                    <div className="small" style={{ lineHeight: 1.5 }}>
                      advisory_present=<b>{String(regimeSemantics?.advisory_metrics_present ?? "—")}</b>
                      <div style={{ marginTop: 6 }}>
                        u_mean=<b>{fmt((bestRow(s) as any)?.regime_utilization_mean, 6)}</b>
                        {" · "}strict_proxy_mean=<b>{fmt((bestRow(s) as any)?.regime_strict_drift_proxy_mean, 6)}</b>
                      </div>
                      <div>
                        local_drift_mean=<b>{fmt((bestRow(s) as any)?.regime_local_drift_rate_mean, 6)}</b>
                        {" · "}advisory_eta_mean=<b>{fmtNum(regimeTransitionRead.advisoryEtaMean, 6)}</b>
                      </div>
                      <div>
                        advisory_down_hits=<b>{fmtNum(regimeTransitionRead.advisoryDownHits, 0)}</b>
                        {" · "}advisory_switch_hits=<b>{fmtNum(regimeTransitionRead.advisorySwitchHits, 0)}</b>
                        {" · "}advisory_recovery_hits=<b>{fmtNum(regimeTransitionRead.advisoryRecoveryHits, 0)}</b>
                      </div>
                    </div>
                  </div>

                  <div className="card" style={{ marginTop: 0, background: "rgba(0,0,0,0.02)" }}>
                    <h2 style={{ marginTop: 0, fontSize: 16 }}>Active realized context</h2>
                    <div className="small" style={{ lineHeight: 1.5 }}>
                      active_present=<b>{String(regimeSemantics?.active_metrics_present ?? "—")}</b>
                      <div style={{ marginTop: 6 }}>
                        active_last_state=<b>{regimeStateLabel(regimeTransitionRead.activeLastState)}</b>
                        {" · "}active_transitions=<b>{fmtNum(regimeTransitionRead.activeTransitionCount, 0)}</b>
                      </div>
                      <div>
                        exposure_final=<b>{fmtNum(regimeTransitionRead.exposureFinal, 6)}</b>
                        {" · "}eta_mean=<b>{fmtNum(regimeTransitionRead.etaMean, 6)}</b>
                        {" · "}move_budget_mean=<b>{fmtNum(regimeTransitionRead.moveBudgetMean, 6)}</b>
                      </div>
                    </div>
                  </div>

                  <div className="card" style={{ marginTop: 0, background: "rgba(0,0,0,0.02)" }}>
                    <h2 style={{ marginTop: 0, fontSize: 16 }}>State occupancy interpretation</h2>
                    <div className="small" style={{ lineHeight: 1.5 }}>
                      <div>
                        nominal_frac=<b>{fmtPct(regimeTransitionRead.nominalFrac, 1)}</b>
                        {" · "}downshift_frac=<b>{fmtPct(regimeTransitionRead.downshiftFrac, 1)}</b>
                      </div>
                      <div>
                        certified_frac=<b>{fmtPct(regimeTransitionRead.certifiedFrac, 1)}</b>
                      </div>
                      <div style={{ marginTop: 8, opacity: 0.84 }}>
                        {regimeTransitionRead.read}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
            <div className="card" style={{ marginTop: 10 }}>
              <h2 style={{ marginTop: 0 }}>Usefulness-oriented quick read</h2>
              <div className="small" style={{ opacity: 0.84, lineHeight: 1.5 }}>
                This bounded Subgoal-07 reading block reconnects the study to the earlier usefulness-wedge logic:
                compare <b>information delivered</b> with <b>belief improvement</b>, then interpret <b>ttfd</b>
                as supporting context rather than as the whole story.
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: 8,
                  marginTop: 10,
                }}
                className="studySummaryStatsGrid"
              >
                <div className="card" style={{ marginTop: 0, background: "rgba(0,0,0,0.02)" }}>
                  <h2 style={{ marginTop: 0, fontSize: 16 }}>Delivered information proxy</h2>
                  <div className="small">
                    <b>{usefulnessRead.deliveredMetric}</b>
                    <div style={{ marginTop: 6, opacity: 0.82 }}>{fmt(usefulnessRead.deliveredValue, 6)}</div>
                  </div>
                </div>
                <div className="card" style={{ marginTop: 0, background: "rgba(0,0,0,0.02)" }}>
                  <h2 style={{ marginTop: 0, fontSize: 16 }}>Belief-quality proxy</h2>
                  <div className="small">
                    <b>{usefulnessRead.beliefMetric}</b>
                    <div style={{ marginTop: 6, opacity: 0.82 }}>{fmt(usefulnessRead.beliefValue, 6)}</div>
                  </div>
                </div>
                <div className="card" style={{ marginTop: 0, background: "rgba(0,0,0,0.02)" }}>
                  <h2 style={{ marginTop: 0, fontSize: 16 }}>Responsiveness context</h2>
                  <div className="small"><b>ttfd</b><div style={{ marginTop: 6, opacity: 0.82 }}>{fmt(usefulnessRead.ttfdValue, 6)}</div></div>
                </div>
              </div>
              <div className="small" style={{ marginTop: 10, opacity: 0.8 }}>{usefulnessRead.note}</div>
            </div>

            <div className="card" style={{ marginTop: 10 }}>
              <h2 style={{ marginTop: 0 }}>Protocol reading note</h2>
              <div className="small" style={{ opacity: 0.85, lineHeight: 1.5 }}>
                <div>
                  study_family=<b>{strOrDash(studySemantics?.study_family)}</b>
                  {" · "}comparison_axis=<b>{strOrDash(studySemantics?.comparison_axis)}</b>
                  {" · "}comparison_tier=<b>{strOrDash(studySemantics?.comparison_tier)}</b>
                </div>
                <div style={{ marginTop: 6 }}>
                  primary_sweep_key=<b>{strOrDash(sweepCtx?.primarySweepKey)}</b>
                  {" · "}sweep_kind=<b>{strOrDash(sweepCtx?.sweepKind)}</b>
                </div>
                <div style={{ marginTop: 8, opacity: 0.84 }}>
                  {readingNote}
                </div>
              </div>
            </div>

            <div className="card" style={{ marginTop: 10 }}>
              <h2 style={{ marginTop: 0 }}>Study summary</h2>
              <div className="small" style={{ opacity: 0.85 }}>
                metric: <b>{activeMetric}</b>
                {" · "}direction: <b>{activeDirection}</b>
                {String((s as any)?.baseline_policy ?? "").trim() ? (
                  <>
                    {" · "}baseline: <b>{String((s as any).baseline_policy)}</b>
                  </>
                ) : null}
                {String((s as any)?.row_count ?? "").trim() ? (
                  <>
                    {" · "}rows: <b>{String((s as any).row_count)}</b>
                  </>
                ) : null}
                {metricSemantics?.[activeMetric]?.tier ? (
                  <>
                    {" · "}tier: <b>{String(metricSemantics[activeMetric].tier)}</b>
                  </>
                ) : null}
                {metricSemantics?.[activeMetric]?.domain ? (
                  <>
                    {" · "}domain: <b>{String(metricSemantics[activeMetric].domain)}</b>
                  </>
                ) : null}
                {metricSemantics?.[activeMetric]?.semantic_role ? (
                  <>
                    {" · "}role: <b>{String(metricSemantics[activeMetric].semantic_role)}</b>
                  </>
                ) : null}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: 8,
                  marginTop: 10,
                }}
                className="studySummaryStatsGrid"
              >
                <div className="card" style={{ marginTop: 0, background: "rgba(0,0,0,0.02)" }}>
                  <h2 style={{ marginTop: 0, fontSize: 16 }}>Best result</h2>
                  <div className="small">
                    <b>{String((s as any)?.best?.policy ?? "—")}</b>
                    <div style={{ marginTop: 6, opacity: 0.82 }}>
                      {String((s as any)?.best?.metric ?? "—")}={fmt((s as any)?.best?.value, 6)}
                    </div>
                  </div>
                </div>
                <div className="card" style={{ marginTop: 0, background: "rgba(0,0,0,0.02)" }}>
                  <h2 style={{ marginTop: 0, fontSize: 16 }}>Baseline</h2>
                  <div className="small">
                    <b>{String((s as any)?.baseline_policy ?? "—")}</b>
                    <div style={{ marginTop: 6, opacity: 0.82 }}>
                      comparison is paired against this policy where available
                    </div>
                  </div>
                </div>
                <div className="card" style={{ marginTop: 0, background: "rgba(0,0,0,0.02)" }}>
                  <h2 style={{ marginTop: 0, fontSize: 16 }}>Rows</h2>
                  <div className="small">
                    <b>{String((s as any)?.row_count ?? "—")}</b>
                    <div style={{ marginTop: 6, opacity: 0.82 }}>
                      summary artifact size for this study
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="card"
                style={{
                  marginTop: 12,
                  background: "rgba(0,0,0,0.015)",
                  border: "1px solid rgba(0,0,0,0.08)",
                }}
              >
                <h2 style={{ marginTop: 0, fontSize: 16 }}>Primary comparison report</h2>
                <div className="small" style={{ opacity: 0.8 }}>
                  This full-width panel is the main comparison block for the selected study and metric.
                </div>

                <PolicySummaryChart
                  title="Policy means (±std) and win-rate vs baseline"
                  metric={activeMetric}
                  direction={activeDirection}
                  policyStats={operationalPolicyStatsForMetric(s, activeMetric)}
                  winRates={
                    activeMetric === chosenMetric
                      ? operationalWinRatesForMetric(s, activeMetric)
                      : null
                  }
                  baseline={(s as any)?.baseline_policy ?? null}
                  width={1600}
                />

                <div className="small" style={{ marginTop: 10, opacity: 0.75 }}>
                  Read this panel as the study’s primary comparison artifact; use Sweep context below for audit and experimental framing.
                </div>
              </div>
            </div>

            <div className="card" style={{ marginTop: 10 }}>
              <h2 style={{ marginTop: 0 }}>Sweep context</h2>
              <div className="small" style={{ opacity: 0.85, lineHeight: 1.5 }}>
                <div>
                  sweep kind: <b>{sweepCtx?.sweepKind || "—"}</b>
                </div>
                <div>
                  primary sweep key: <b>{sweepCtx?.primarySweepKey || "—"}</b>
                </div>
                <div>
                  regime families: <b>{sweepCtx?.regimeFamilies.length ? sweepCtx.regimeFamilies.join(", ") : "—"}</b>
                </div>
                <div>
                  impairment levels: <b>{sweepCtx?.impairmentLevels.length ? sweepCtx.impairmentLevels.join(", ") : "—"}</b>
                </div>
                <div>
                  regime modes: <b>{sweepCtx?.regimeModes.length ? sweepCtx.regimeModes.join(", ") : "—"}</b>
                </div>
                <div>
                  override keys: <b>{sweepCtx?.overrideKeys.length ? sweepCtx.overrideKeys.join(", ") : "—"}</b>
                </div>
              </div>
              <div className="small" style={{ marginTop: 8, opacity: 0.72 }}>
                This panel is backend-owned experiment context for auditing and screenshot support, not for performance claims.
              </div>
            </div>


            <div className="small" style={{ opacity: 0.85, marginTop: 6 }}>
              {manifestSummaryText}
            </div>

            <div className="row" style={{ alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <b>Best</b>:{" "}
                {String(
                  s.best?.policy ??
                    s.best?.opr_id ??
                    "—"
                )}{" "}
                ({String(s.best?.metric ?? "—")}={String(s.best?.value ?? "—")})
              </div>
              <a className="button" href={`/analysis/raw?id=${encodeURIComponent(id)}`}>
                Open Raw
              </a>
              <a
                className="button"
                href={apiUrl(`/analysis/${id}/table.csv`)}
                target="_blank"
                rel="noreferrer"
              >
                Download CSV
              </a>
            </div>

            <div className="small" style={{ marginTop: 8, opacity: 0.75 }}>
              Raw row inspection is available in <b>Analysis · Raw</b>. This view prioritizes study semantics and summary artifacts.
            </div>
            </div>
          );
        })() : null}
      </div>

      <div className="small">
        This page now treats the operational study summary as the primary analysis artifact.
      </div>
      <div className="small" style={{ opacity: 0.78, marginTop: 6 }}>
        Use <b>Analysis · Raw</b> for row-level verification and protocol audit. Use this page for the canonical study-level reading
        of one completed <b>ana-*</b> artifact.
      </div>

      <style jsx>{`
        @media (max-width: 1100px) {
          .row {
            gap: 8px;
            flex-wrap: wrap;
          }
        }
        @media (max-width: 980px) {
          .studySummaryStatsGrid {
            grid-template-columns: 1fr !important;
          }
          .regimeSummaryStatsGrid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
