"use client";

import { useEffect, useMemo, useState } from "react";
import { apiUrl, deleteJSON, getJSON } from "@/lib/api";
import { useSearchParams } from "next/navigation";

type AnalysisListItem = {
  ana_id: string;
  study_type: string;
  created_at?: string | null;
  protocol_id?: string | null;
  phy_id?: string | null;
  run_count?: number;
  choose_best_by?: string | null;
};

type ListVerboseRes = { items: AnalysisListItem[] };

type TableMeta = {
  ana_id: string;
  columns: string[];
  row_count: number;
  size_bytes: number;
};

type TablePreview = {
  ana_id: string;
  columns: string[];
  rows: Record<string, string>[];
  limit: number;
  offset: number;
};

function isEpistemicStudy(summary: any): boolean {
  return String(summary?.study_type ?? "").trim().includes("compare_epistemic");
}

function isOperationalStudy(summary: any): boolean {
  return String(summary?.study_type ?? "").trim() === "operational_study";
}

function summarizeStudyRole(summary: any): string {
  if (!summary) return "Raw audit view for a study artifact.";
  const sem = summary?.study_semantics ?? {};
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

  return `Audit-oriented view of a ${familyText}${axis ? ` centered on ${axis}` : ""}${tier ? ` (${tier})` : ""}.`;

}

function batchMetric(summary: any): string {
  return String(summary?.choose_best_by ?? summary?.best?.metric ?? "ttfd").trim() || "ttfd";
}

function batchDirection(summary: any, metric?: string): "min" | "max" {
  const m = String(metric ?? batchMetric(summary)).trim();
  const d =
    summary?.metrics_catalog?.direction?.[m] ??
    summary?.direction ??
    null;
  const s = String(d ?? "").toLowerCase().trim();
  if (s === "min" || s === "max") return s;
  if (m === "ttfd") return "min";
  if (m.includes("time") || m.includes("latency")) return "min";
  if (m.includes("entropy")) return "min";
  if (m.includes("violation") || m.includes("error") || m.includes("loss")) return "min";
  if (m.includes("exposure")) return "min";
  if (m.includes("transition_count")) return "min";
  if (m.includes("residual") && (m.includes("mean") || m.includes("pos_frac"))) return "min";
  if (m.includes("in_band")) return "max";
  return "max";
}

function batchPolicyStatsForMetric(summary: any, metric?: string): Record<string, any> {
  const m = String(metric ?? batchMetric(summary)).trim();
  const by = summary?.policy_stats_by_metric;
  if (by && typeof by === "object" && by[m] && typeof by[m] === "object") return by[m];
  return {};
}

function batchWinRatesForMetric(summary: any, metric?: string): Record<string, any> {
  const m = String(metric ?? batchMetric(summary)).trim();
  const by = summary?.win_rates_vs_baseline;
  if (by && typeof by === "object" && by[m] && typeof by[m] === "object") {
    return by[m]?.policies ?? {};
  }
  return {};
}

function epistemicMetric(summary: any): string {
  return String(summary?.choose_best_by ?? summary?.best?.metric ?? "entropy_auc").trim() || "entropy_auc";
}

function epistemicDirection(summary: any, metric?: string): "min" | "max" {
  const m = String(metric ?? epistemicMetric(summary)).trim();
  const d =
    summary?.metrics_catalog?.direction?.[m] ??
    summary?.direction ??
    null;
  const s = String(d ?? "").toLowerCase().trim();
  if (s === "min" || s === "max") return s;
  if (m.includes("entropy")) return "min";
  if (m.includes("violation") || m.includes("error") || m.includes("loss")) return "min";
  return "max";
}

function epistemicActionModelStatsForMetric(summary: any, metric?: string): Record<string, any> {
  const m = String(metric ?? epistemicMetric(summary)).trim();
  const by = summary?.action_model_stats_by_metric;
  if (by && typeof by === "object" && by[m] && typeof by[m] === "object") return by[m];
  return {};
}

function epistemicWinRatesForMetric(summary: any, metric?: string): Record<string, any> {
  const m = String(metric ?? epistemicMetric(summary)).trim();
  const by = summary?.win_rates_vs_baseline;
  if (by && typeof by === "object" && by[m] && typeof by[m] === "object") {
    return by[m]?.models ?? {};
  }
  return {};
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

function fmtBytes(n: any): string {
  const x = Number(n);
  if (!Number.isFinite(x) || x < 0) return "—";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let v = x;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i += 1;
  }
  return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function hasRegimeSummary(summary: any): boolean {
  if (!summary || typeof summary !== "object") return false;
  const regimeCentered = Array.isArray(summary?.metrics_catalog?.regime_centered)
    ? summary.metrics_catalog.regime_centered
    : [];
  const policyStats = summary?.policy_stats_by_metric ?? {};
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

function uniqueNonEmptyValues(rows: Record<string, string>[], key: string): string[] {
  const out = new Set<string>();
  for (const r of rows || []) {
    const v = String(r?.[key] ?? "").trim();
    if (v) out.add(v);
  }
  return Array.from(out).sort();
}

function numericValues(rows: Record<string, string>[], key: string): number[] {
  const out: number[] = [];
  for (const r of rows || []) {
    const v = Number(r?.[key]);
    if (Number.isFinite(v)) out.push(v);
  }
  return out;
}

function minOrNull(xs: number[]): number | null {
  return xs.length ? Math.min(...xs) : null;
}

function maxOrNull(xs: number[]): number | null {
  return xs.length ? Math.max(...xs) : null;
}

function meanOrNull(xs: number[]): number | null {
  if (!xs.length) return null;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function fracAbsLe(xs: number[], thr: number): number | null {
  if (!xs.length) return null;
  const t = Math.abs(Number(thr));
  if (!Number.isFinite(t)) return null;
  let k = 0;
  for (const x of xs) {
    if (Math.abs(x) <= t) k += 1;
  }
  return k / xs.length;
}

function countPositive(xs: number[]): number | null {
  if (!xs.length) return null;
  let k = 0;
  for (const x of xs) {
    if (x > 0) k += 1;
  }
  return k;
}

function countNonZero(xs: number[]): number | null {
  if (!xs.length) return null;
  let k = 0;
  for (const x of xs) {
    if (x !== 0) k += 1;
  }
  return k;
}

function hasAnyColumn(rows: Record<string, string>[], cols: string[], keys: string[]): boolean {
  return keys.some((k) => cols.includes(k) || rows.some((r) => Object.prototype.hasOwnProperty.call(r, k)));
} 

export default function AnalysisRawPage() {
  const searchParams = useSearchParams();
  const qid = searchParams.get("id") || "";

  const [items, setItems] = useState<AnalysisListItem[]>([]);
  const [id, setId] = useState("");
  const [summary, setSummary] = useState<any>(null);
  const [manifest, setManifest] = useState<any>(null);
  const [tableMeta, setTableMeta] = useState<TableMeta | null>(null);
  const [previewLimit, setPreviewLimit] = useState<number>(50);
  const [tableCols, setTableCols] = useState<string[]>([]);
  const [tableRows, setTableRows] = useState<Record<string, string>[]>([]);
  const [filterCase, setFilterCase] = useState<string>("");
  const [filterPolicy, setFilterPolicy] = useState<string>("");
  const [err, setErr] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [cascadeDelete, setCascadeDelete] = useState<boolean>(true);

  useEffect(() => {
    getJSON<ListVerboseRes>("/analysis/list_verbose")
      .then((r) => setItems(Array.isArray(r?.items) ? r.items : []))
      .catch((e) => {
        console.error(e);
        setErr(String(e));
      });
  }, []);

  async function refreshList() {
    try {
      const r = await getJSON<ListVerboseRes>("/analysis/list_verbose");
      setItems(Array.isArray(r?.items) ? r.items : []);
    } catch (e) {
      console.error(e);
    }
  }

  function metaById(anaId: string): AnalysisListItem | null {
    const s = String(anaId ?? "").trim();
    if (!s) return null;
    return items.find((x) => String(x?.ana_id ?? "") === s) ?? null;
  }

  function studyLabel(anaId: string): string {
    const m = metaById(anaId);
    if (!m) return anaId;
    const st = String(m.study_type ?? "").replace(/^compare_/, "");
    const proto = String(m.protocol_id ?? "—");
    const n = typeof m.run_count === "number" ? m.run_count : 0;
    const phy = m.phy_id ? ` · ${m.phy_id}` : "";
    return `${anaId} · ${st} · ${proto}${phy} · ${n} runs`;
  }

  async function loadPreview(idIn: string, limit?: number) {
    if (!idIn) return;
    try {
      const lim = typeof limit === "number" ? limit : previewLimit;
      const prev = await getJSON<TablePreview>(`/analysis/${idIn}/table_preview?limit=${lim}&offset=0`);
      setTableCols(prev.columns ?? []);
      setTableRows(Array.isArray(prev.rows) ? prev.rows : []);
    } catch (e: any) {
      console.error(e);
      setErr(String(e?.message ?? e));
    }
  }
 
  async function loadId(idIn: string) {
    if (!idIn) return;
    setErr("");
    setSummary(null);
    setManifest(null);
    setTableMeta(null);
    setTableCols([]);
    setTableRows([]);
    setFilterCase("");
    setFilterPolicy("");
    setLoading(true);
    try {
      const s = await getJSON(`/analysis/${idIn}/summary`);
      setSummary(s);
      const m = await getJSON(`/analysis/${idIn}/manifest`);
      setManifest(m);
      const meta = await getJSON<TableMeta>(`/analysis/${idIn}/table_meta`);
      setTableMeta(meta);
      await loadPreview(idIn, previewLimit);
    } catch (e: any) {
      console.error(e);
      setErr(String(e?.message ?? e));
    } finally {
      setLoading(false);
    }
  }

  async function load() {
    return loadId(id);
  }

  // If opened with ?id=ana-..., preselect it and auto-load.
  useEffect(() => {
    if (!qid) return;
    setId(qid);
    loadId(qid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qid]);

  const hasCaseCol = tableCols.includes("case");
  const hasPolicyCol = tableCols.includes("policy");

  const uniqueCases = useMemo(() => {
    if (!hasCaseCol) return [];
    return Array.from(new Set(tableRows.map((r) => String(r["case"] ?? "")).filter(Boolean))).sort();
  }, [tableRows, hasCaseCol]);

  const uniquePolicies = useMemo(() => {
    if (!hasPolicyCol) return [];
    return Array.from(new Set(tableRows.map((r) => String(r["policy"] ?? "")).filter(Boolean))).sort();
  }, [tableRows, hasPolicyCol]);

  const filteredRows = useMemo(() => {
    return tableRows.filter((r) => {
      const c = String(r["case"] ?? "");
      const p = String(r["policy"] ?? r["action_model"] ?? "");
      if (filterCase && c !== filterCase) return false;
      if (filterPolicy && p !== filterPolicy) return false;
      return true;
    });
  }, [tableRows, filterCase, filterPolicy]);

  const summaryText = useMemo(() => {
    if (!summary) return "";
    try {
      return JSON.stringify(summary, null, 2);
    } catch {
      return String(summary);
    }
  }, [summary]);

  const studyRoleText = useMemo(() => {
    return summarizeStudyRole(summary);
  }, [summary]);

  const regimeSweepInfo = useMemo(() => {
    if (!tableRows.length) return null;

    const families = uniqueNonEmptyValues(tableRows, "regime_family_cfg");
    const impairments = uniqueNonEmptyValues(tableRows, "impairment_level_cfg");
    const modes = uniqueNonEmptyValues(tableRows, "regime_mode_cfg");

    const info = {
      families,
      impairments,
      modes,
      regimeEnabled: uniqueNonEmptyValues(tableRows, "regime_enabled_cfg"),
      downshiftUtil: uniqueNonEmptyValues(tableRows, "downshift_util_cfg"),
      switchUtil: uniqueNonEmptyValues(tableRows, "switch_util_cfg"),
      recoveryUtil: uniqueNonEmptyValues(tableRows, "recovery_util_cfg"),
      downshiftPersistence: uniqueNonEmptyValues(tableRows, "downshift_persistence_cfg"),
      switchPersistence: uniqueNonEmptyValues(tableRows, "switch_persistence_cfg"),
      recoveryPersistence: uniqueNonEmptyValues(tableRows, "recovery_persistence_cfg"),
      downshiftHysteresis: uniqueNonEmptyValues(tableRows, "downshift_hysteresis_cfg"),
      switchHysteresis: uniqueNonEmptyValues(tableRows, "switch_hysteresis_cfg"),
      recoveryHysteresis: uniqueNonEmptyValues(tableRows, "recovery_hysteresis_cfg"),
    };

    const hasAny =
      info.families.length > 0 ||
      info.impairments.length > 0 ||
      info.modes.length > 0 ||
      info.regimeEnabled.length > 0;

    return hasAny ? info : null;
  }, [tableRows]);

  const transitionDiagnostics = useMemo(() => {
    if (!tableRows.length || !tableCols.length) return null;

    const downUtilMargin = numericValues(tableRows, "debug_down_utilization_margin");
    const downStrictMargin = numericValues(tableRows, "debug_down_strict_margin");
    const switchUtilMargin = numericValues(tableRows, "debug_switch_utilization_margin");
    const switchStrictMargin = numericValues(tableRows, "debug_switch_strict_margin");
    const recoveryUtilMargin = numericValues(tableRows, "debug_recovery_utilization_margin");
    const recoveryStrictMargin = numericValues(tableRows, "debug_recovery_strict_margin");

    const downCounter = numericValues(tableRows, "debug_down_counter");
    const switchCounter = numericValues(tableRows, "debug_switch_counter");
    const recoveryCounter = numericValues(tableRows, "debug_recovery_counter");
    const recoveryBlockCounter = numericValues(tableRows, "debug_recovery_block_counter");

    const activeTransitions = numericValues(tableRows, "regime_active_transition_event");
    const activeState = numericValues(tableRows, "regime_active_state");

    const neighborhoodAbs = 0.05;

    const hasMargins = hasAnyColumn(tableRows, tableCols, [
      "debug_down_utilization_margin",
      "debug_down_strict_margin",
      "debug_switch_utilization_margin",
      "debug_switch_strict_margin",
      "debug_recovery_utilization_margin",
      "debug_recovery_strict_margin",
    ]);

    const hasCounters = hasAnyColumn(tableRows, tableCols, [
      "debug_down_counter",
      "debug_switch_counter",
      "debug_recovery_counter",
      "debug_recovery_block_counter",
    ]);

    const hasActive = hasAnyColumn(tableRows, tableCols, [
      "regime_active_transition_event",
      "regime_active_state",
    ]);

    if (!hasMargins && !hasCounters && !hasActive) return null;

    return {
      hasMargins,
      hasCounters,
      hasActive,
      neighborhoodAbs,

      downUtilMin: minOrNull(downUtilMargin),
      downUtilMax: maxOrNull(downUtilMargin),
      downUtilNearFrac: fracAbsLe(downUtilMargin, neighborhoodAbs),
      downStrictMin: minOrNull(downStrictMargin),
      downStrictMax: maxOrNull(downStrictMargin),

      switchUtilMin: minOrNull(switchUtilMargin),
      switchUtilMax: maxOrNull(switchUtilMargin),
      switchUtilNearFrac: fracAbsLe(switchUtilMargin, neighborhoodAbs),
      switchStrictMin: minOrNull(switchStrictMargin),
      switchStrictMax: maxOrNull(switchStrictMargin),

      recoveryUtilMin: minOrNull(recoveryUtilMargin),
      recoveryUtilMax: maxOrNull(recoveryUtilMargin),
      recoveryUtilNearFrac: fracAbsLe(recoveryUtilMargin, neighborhoodAbs),
      recoveryStrictMin: minOrNull(recoveryStrictMargin),
      recoveryStrictMax: maxOrNull(recoveryStrictMargin),

      downCounterMax: maxOrNull(downCounter),
      switchCounterMax: maxOrNull(switchCounter),
      recoveryCounterMax: maxOrNull(recoveryCounter),
      recoveryBlockMean: meanOrNull(recoveryBlockCounter),
      recoveryBlockNonZeroSteps: countPositive(recoveryBlockCounter),

      activeTransitionNonZero: countNonZero(activeTransitions),
      activeStateLast: activeState.length ? activeState[activeState.length - 1] : null,
    };
  }, [tableRows, tableCols]);

  const selectedMeta = useMemo(() => metaById(id), [id, items]);
  const selectedStudyLabel = selectedMeta ? studyLabel(id) : id;

  const protocolSummary = useMemo(() => {
    if (!manifest) return "—";
    const bm = manifest?.base_manifest || {};
    const net = bm?.network || {};
    const impairments = bm?.impairments || {};
    const o1 = bm?.o1 || {};
    const regime = bm?.regime_management || {};
    const parts: string[] = [];
    if (bm?.phy_id) parts.push(`phy_id=${bm.phy_id}`);
    if (net?.deployment_mode) parts.push(`mode=${net.deployment_mode}`);
    if (typeof net?.n_sensors === "number") parts.push(`n=${net.n_sensors}`);
    if (typeof net?.sensor_radius_m === "number") parts.push(`r=${net.sensor_radius_m}m`);
    if (typeof net?.sensor_move_max_m === "number") parts.push(`move=${net.sensor_move_max_m}m`);
    if (typeof net?.max_moves_per_step === "number") parts.push(`maxMoves/step=${net.max_moves_per_step}`);
    if (typeof impairments?.noise_level === "number") parts.push(`noise=${impairments.noise_level}`);
    if (typeof impairments?.delay_steps === "number") parts.push(`delay=${impairments.delay_steps}`);
    if (typeof impairments?.loss_prob === "number") parts.push(`loss=${impairments.loss_prob}`);

    if (typeof o1?.seed === "number") parts.push(`seed=${o1.seed}`);
    if (typeof o1?.c_info === "number") parts.push(`c_info=${o1.c_info}`);
    if (typeof o1?.c_cov === "number") parts.push(`c_cov=${o1.c_cov}`);
    if (typeof o1?.eps_ref === "number") parts.push(`eps_ref=${o1.eps_ref}`);
    if (typeof regime?.enabled === "boolean") parts.push(`regime=${regime.enabled ? "on" : "off"}`);
    if (regime?.mode) parts.push(`regime_mode=${regime.mode}`);
    return parts.length ? parts.join(" · ") : "—";
  }, [manifest]);

  return (
    <div className="card">
      <h2>Analysis · Raw</h2>
      <div aria-hidden className="section-stripe section-stripe--analysis" />
      <div className="small" style={{ opacity: 0.85 }}>
        Inspect the raw study artifacts behind an <b>ana-*</b> result. This page is for protocol audit, summary diagnostics,
        and table-level inspection after the higher-level reading in <b>Analysis · Graphic</b>.
      </div>

      {summary && id ? (
        <div className="card" style={{ marginTop: 10, background: "rgba(0,0,0,0.02)" }}>
          <h2 style={{ marginTop: 0, fontSize: 16 }}>Role of this page</h2>
          <div className="small" style={{ lineHeight: 1.5 }}>
            {studyRoleText}
          </div>
          <div className="small" style={{ marginTop: 8, opacity: 0.8 }}>
            Use this page to audit summary artifacts and preview rows. Use <b>Analysis · Graphic</b> for the canonical polished interpretation.
          </div>
      </div>
    ) : null}

      <div className="card" style={{ marginTop: 10 }}>
        <h2 style={{ marginTop: 0, fontSize: 16 }}>Raw study controls</h2>
        <div className="small" style={{ opacity: 0.8, marginBottom: 10 }}>
          Start by choosing a study, then inspect its summary artifacts, protocol context, and preview rows.
        </div>

        <div className="row" style={{ alignItems: "center" }}>
          <label>Select Study</label>
          <select value={id} onChange={(e) => setId(e.target.value)} style={{ minWidth: 420 }}>
            <option value="">(none)</option>
            {items.map((it) => (
              <option key={it.ana_id} value={it.ana_id}>
                {studyLabel(it.ana_id)}
              </option>
            ))}
          </select>
          <button onClick={load} disabled={!id || loading}>
            {loading ? "Loading..." : (qid ? "Refresh" : "Load")}
          </button>
        </div>

        <div className="row" style={{ alignItems: "center" }}>
          <label>Preview rows</label>
          <select
            value={previewLimit}
            onChange={(e) => {
              const v = Number(e.target.value);
              setPreviewLimit(v);
              if (id) loadPreview(id, v);
            }}
            disabled={loading}
          >
            {[25, 50, 100, 200].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          {id ? (
            <a className="button" href={`/analysis/graphic?id=${encodeURIComponent(id)}`}>
              Open Graphic
            </a>
          ) : null}
          {id ? (
            <a
              className="button"
              href={apiUrl(`/analysis/${id}/table.csv`)}
              target="_blank"
              rel="noreferrer"
            >
              Download CSV
            </a>
          ) : null}
        </div>

        <div className="small" style={{ marginTop: 6, opacity: 0.78 }}>
          {qid
            ? "Auto-loaded from URL; adjust the study selection then click Refresh."
            : "Use Analysis · Graphic for the polished reading path; use this page for audit, verification, and row inspection."}
        </div>
      </div>

      {summary && id ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr",
            gap: 12,
            marginTop: 10,
          }}
          className="rawTopGrid"
        >
          <div className="card" style={{ marginTop: 0 }}>
            <h2 style={{ marginTop: 0 }}>Study snapshot</h2>
            <div className="small" style={{ opacity: 0.82, lineHeight: 1.55 }}>
              <div><b>{selectedStudyLabel || id}</b></div>
              <div style={{ marginTop: 6 }}>
                type=<b>{String(summary?.study_type ?? selectedMeta?.study_type ?? "—")}</b>
                {summary?.study_semantics?.study_family ? (
                  <>
                    {" · "}family=<b>{String(summary.study_semantics.study_family)}</b>
                  </>
                ) : null}
                {summary?.study_semantics?.comparison_axis ? (
                  <>
                    {" · "}axis=<b>{String(summary.study_semantics.comparison_axis)}</b>
                  </>
                ) : null}
              </div>
              <div>
                {" · "}protocol=<b>{String(summary?.protocol_id ?? selectedMeta?.protocol_id ?? "—")}</b>
              </div>
              <div>
                created=<b>{String(summary?.created_at ?? selectedMeta?.created_at ?? "—")}</b>
                {" · "}runs=<b>{String(summary?.row_count ?? selectedMeta?.run_count ?? tableMeta?.row_count ?? "—")}</b>
              </div>
              {summary?.choose_best_by || summary?.best?.metric ? (
                <div>
                  headline metric=<b>{String(summary?.choose_best_by ?? summary?.best?.metric ?? "—")}</b>
                </div>
              ) : null}
            </div>
          </div>

          <div className="card" style={{ marginTop: 0 }}>
            <h2 style={{ marginTop: 0 }}>Artifact snapshot</h2>
            <div className="small" style={{ lineHeight: 1.55 }}>
              <div>
                table rows=<b>{String(tableMeta?.row_count ?? "—")}</b>
                {" · "}table size=<b>{fmtBytes(tableMeta?.size_bytes)}</b>
              </div>
              <div>
                preview rows=<b>{tableRows.length}</b>
                {" · "}columns=<b>{tableCols.length}</b>
              </div>
              <div>
                summary loaded=<b>{summary ? "yes" : "no"}</b>
                {" · "}manifest loaded=<b>{manifest ? "yes" : "no"}</b>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {manifest ? (
        <div className="card">
          <h2>Protocol context</h2>
          <div className="small" style={{ opacity: 0.8, marginBottom: 8 }}>
            Backend-owned execution context for audit and reproducibility.
          </div>
          <div className="small" style={{ opacity: 0.88, lineHeight: 1.55 }}>
            {protocolSummary}
          </div>
        </div>
      ) : null}
      {summary && isOperationalStudy(summary) ? (
        <div className="card">
          <h2>Operational study diagnostics</h2>
          <div className="small" style={{ opacity: 0.8, marginBottom: 10 }}>
            Summary-first reading of the selected operational batch study. Treat these cards as diagnostic interpretation,
            then use the CSV preview below for row-level confirmation.
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 12,
              marginTop: 4,
            }}
            className="rawSummaryGrid"
          >
            <div className="card rawSubCard">
              <h2 style={{ marginTop: 0, fontSize: 16 }}>Study headline</h2>
              <div className="small" style={{ lineHeight: 1.55 }}>
                choose_best_by=<b>{String(batchMetric(summary) ?? "—")}</b>
                <div>direction=<b>{String(batchDirection(summary, batchMetric(summary)) ?? "—")}</b></div>
                <div>baseline=<b>{String(summary?.baseline_policy ?? "—")}</b></div>
                <div>rows=<b>{String(summary?.row_count ?? "—")}</b></div>
              </div>
            </div>
            <div className="card rawSubCard">
              <h2 style={{ marginTop: 0, fontSize: 16 }}>Best by mean</h2>
              <div className="small" style={{ lineHeight: 1.55 }}>
                <b>{String(summary?.best?.policy ?? "—")}</b>
                <div>
                  {String(summary?.best?.metric ?? "—")}={fmtNum(summary?.best?.value, 6)}
                </div>
              </div>
            </div>
            <div className="card rawSubCard">
              <h2 style={{ marginTop: 0, fontSize: 16 }}>Robust checks</h2>
              <div className="small" style={{ lineHeight: 1.55 }}>
                median=<b>{String(summary?.best_robust?.by_median?.policy ?? "—")}</b>
                <div>win-rate=<b>{String(summary?.best_robust?.by_win_rate_vs_baseline?.policy ?? "—")}</b></div>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginTop: 10 }}>
            <h2 style={{ marginTop: 0, fontSize: 16 }}>Policy means and win-rate vs baseline</h2>
            <div className="small" style={{ opacity: 0.85 }}>
              Compact diagnostic table from <b>summary.json</b> for the study’s recorded headline metric.
            </div>
            {Object.keys(batchPolicyStatsForMetric(summary)).length > 0 ? (
            <div style={{ overflowX: "auto", marginTop: 8 }}>

              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 6 }}>policy</th>
                    <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 6 }}>n</th>
                    <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 6 }}>mean</th>
                    <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 6 }}>std</th>
                    <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 6 }}>win-rate vs baseline</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(batchPolicyStatsForMetric(summary)).map((pol: string) => {
                    const st = batchPolicyStatsForMetric(summary)?.[pol] ?? {};
                    const wr = batchWinRatesForMetric(summary)?.[pol] ?? null;
                    return (
                      <tr key={pol}>
                        <td style={{ borderBottom: "1px solid #eee", padding: 6 }}>{pol}</td>
                        <td style={{ borderBottom: "1px solid #eee", padding: 6 }}>{String(st.n ?? "—")}</td>
                        <td style={{ borderBottom: "1px solid #eee", padding: 6 }}>{fmtNum(st.mean, 6)}</td>
                        <td style={{ borderBottom: "1px solid #eee", padding: 6 }}>{fmtNum(st.std, 6)}</td>
                        <td style={{ borderBottom: "1px solid #eee", padding: 6 }}>
                          {wr && Number.isFinite(Number(wr.win_rate)) ? (
                            <>
                              <b>{fmtPct(wr.win_rate)}</b> ({String(wr.wins ?? "—")}/{String(wr.total ?? "—")})
                            </>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            ) : (
              <div className="small" style={{ marginTop: 8, opacity: 0.75 }}>
                (No policy_stats_by_metric entry found for the chosen metric in summary.json.)
              </div>
            )}
          </div>

          <div className="card" style={{ marginTop: 10 }}>
            <h2 style={{ marginTop: 0 }}>MDC-truth quick read</h2>
            <div className="small" style={{ opacity: 0.9 }}>
              Prefer <b>driver_info_true_mean</b> over legacy <b>driver_info_mean</b> when present.
              For residuals, lower <b>residual_info_pos_frac</b> / <b>residual_info_mean</b> is better,
              while higher <b>residual_info_in_band_frac</b> is better.
            </div>
            <div style={{ overflowX: "auto", marginTop: 8 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 6 }}>policy</th>
                    <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 6 }}>driver_info_true_mean</th>
                    <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 6 }}>driver_info_mean</th>
                    <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 6 }}>residual_info_mean</th>
                    <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 6 }}>residual_info_pos_frac</th>
                    <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 6 }}>residual_info_in_band_frac</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const p1 = batchPolicyStatsForMetric(summary, "driver_info_true_mean");
                    const p2 = batchPolicyStatsForMetric(summary, "driver_info_mean");
                    const p3 = batchPolicyStatsForMetric(summary, "residual_info_mean");
                    const p4 = batchPolicyStatsForMetric(summary, "residual_info_pos_frac");
                    const p5 = batchPolicyStatsForMetric(summary, "residual_info_in_band_frac");
                    const pols = Array.from(
                      new Set([
                        ...Object.keys(p1 || {}),
                        ...Object.keys(p2 || {}),
                        ...Object.keys(p3 || {}),
                        ...Object.keys(p4 || {}),
                        ...Object.keys(p5 || {}),
                      ])
                    ).sort();
                    return pols.map((pol) => (
                      <tr key={pol}>
                        <td style={{ borderBottom: "1px solid #eee", padding: 6 }}>{pol}</td>
                        <td style={{ borderBottom: "1px solid #eee", padding: 6 }}>{fmtNum(p1?.[pol]?.mean, 6)}</td>
                        <td style={{ borderBottom: "1px solid #eee", padding: 6 }}>{fmtNum(p2?.[pol]?.mean, 6)}</td>
                        <td style={{ borderBottom: "1px solid #eee", padding: 6 }}>{fmtNum(p3?.[pol]?.mean, 6)}</td>
                        <td style={{ borderBottom: "1px solid #eee", padding: 6 }}>{fmtNum(p4?.[pol]?.mean, 6)}</td>
                        <td style={{ borderBottom: "1px solid #eee", padding: 6 }}>{fmtNum(p5?.[pol]?.mean, 6)}</td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card" style={{ marginTop: 10 }}>
            <h2 style={{ marginTop: 0 }}>Regime-aware batch quick read</h2>
            <div className="small" style={{ opacity: 0.9 }}>
              These are diagnostic / proxy / control-behavior summaries from <b>summary.json</b>.
              Lower exposure and fewer active transitions are usually preferable; utilization is often better higher.
            </div>
            <div style={{ overflowX: "auto", marginTop: 8 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 6 }}>policy</th>
                    <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 6 }}>regime_utilization_mean</th>
                    <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 6 }}>regime_strict_drift_proxy_mean</th>
                    <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 6 }}>regime_cumulative_exposure_final</th>
                    <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 6 }}>regime_active_transition_count</th>
                    <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 6 }}>regime_effective_eta_mean</th>
                    <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 6 }}>regime_effective_move_budget_cells_mean</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const p1 = batchPolicyStatsForMetric(summary, "regime_utilization_mean");
                    const p2 = batchPolicyStatsForMetric(summary, "regime_strict_drift_proxy_mean");
                    const p3 = batchPolicyStatsForMetric(summary, "regime_cumulative_exposure_final");
                    const p4 = batchPolicyStatsForMetric(summary, "regime_active_transition_count");
                    const p5 = batchPolicyStatsForMetric(summary, "regime_effective_eta_mean");
                    const p6 = batchPolicyStatsForMetric(summary, "regime_effective_move_budget_cells_mean");
                    const pols = Array.from(
                      new Set([
                        ...Object.keys(p1 || {}),
                        ...Object.keys(p2 || {}),
                        ...Object.keys(p3 || {}),
                        ...Object.keys(p4 || {}),
                        ...Object.keys(p5 || {}),
                        ...Object.keys(p6 || {}),
                      ])
                    ).sort();
                    return pols.map((pol) => (
                      <tr key={pol}>
                        <td style={{ borderBottom: "1px solid #eee", padding: 6 }}>{pol}</td>
                        <td style={{ borderBottom: "1px solid #eee", padding: 6 }}>{fmtNum(p1?.[pol]?.mean, 6)}</td>
                        <td style={{ borderBottom: "1px solid #eee", padding: 6 }}>{fmtNum(p2?.[pol]?.mean, 6)}</td>
                        <td style={{ borderBottom: "1px solid #eee", padding: 6 }}>{fmtNum(p3?.[pol]?.mean, 6)}</td>
                        <td style={{ borderBottom: "1px solid #eee", padding: 6 }}>{fmtNum(p4?.[pol]?.mean, 6)}</td>
                        <td style={{ borderBottom: "1px solid #eee", padding: 6 }}>{fmtNum(p5?.[pol]?.mean, 6)}</td>
                        <td style={{ borderBottom: "1px solid #eee", padding: 6 }}>{fmtNum(p6?.[pol]?.mean, 6)}</td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}

      {summary && isEpistemicStudy(summary) ? (
        <div className="card">
          <h2>Epistemic quick summary</h2>
          <div className="small" style={{ opacity: 0.8, marginBottom: 10 }}>
            Summary-first reading of the selected epistemic study before row-level inspection.
          </div>

          <div className="small" style={{ opacity: 0.85 }}>
            choose_best_by=<b>{String(epistemicMetric(summary) ?? "—")}</b> · direction=
            <b>{String(epistemicDirection(summary, epistemicMetric(summary)) ?? "—")}</b> · baseline_action_model=
            <b>{String(summary?.baseline_action_model ?? "—")}</b> · rows=
            <b>{String(summary?.row_count ?? summary?.rows?.length ?? "—")}</b>
          </div>

          <div className="small" style={{ marginTop: 8, opacity: 0.85 }}>
            best=<b>{String(summary?.best?.action_model ?? "—")}</b>{" "}
            ({String(summary?.best?.metric ?? "—")}={fmtNum(summary?.best?.value, 6)})
          </div>

          {Object.keys(epistemicActionModelStatsForMetric(summary)).length > 0 ? (
            <div style={{ overflowX: "auto", marginTop: 8 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 6 }}>action_model</th>
                    <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 6 }}>n</th>
                    <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 6 }}>mean</th>
                    <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 6 }}>std</th>
                    <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 6 }}>win-rate vs baseline</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(epistemicActionModelStatsForMetric(summary)).map((model: string) => {
                    const st = epistemicActionModelStatsForMetric(summary)?.[model] ?? {};
                    const wr = epistemicWinRatesForMetric(summary)?.[model] ?? null;
                    return (
                      <tr key={model}>
                        <td style={{ borderBottom: "1px solid #eee", padding: 6 }}>{model}</td>
                        <td style={{ borderBottom: "1px solid #eee", padding: 6 }}>{String(st.n ?? "—")}</td>
                        <td style={{ borderBottom: "1px solid #eee", padding: 6 }}>{fmtNum(st.mean, 6)}</td>
                        <td style={{ borderBottom: "1px solid #eee", padding: 6 }}>{fmtNum(st.std, 6)}</td>
                        <td style={{ borderBottom: "1px solid #eee", padding: 6 }}>
                          {wr && Number.isFinite(Number(wr.win_rate)) ? (
                            <>
                              <b>{fmtPct(wr.win_rate)}</b> ({String(wr.wins ?? "—")}/{String(wr.total ?? "—")})
                            </>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="small" style={{ marginTop: 8, opacity: 0.75 }}>
              (No action_model_stats_by_metric entry found for the chosen metric in summary.json.)
            </div>
          )}

          <div className="card" style={{ marginTop: 10 }}>
            <h2 style={{ marginTop: 0 }}>Epistemic MDC quick read</h2>
            <div className="small" style={{ opacity: 0.9 }}>
              Lower <b>entropy_auc</b> and <b>mdc_violation_rate</b> are generally better.
              Higher <b>delivered_info_proxy_mean</b> indicates more delivered information under the chosen action model.
            </div>
            <div style={{ overflowX: "auto", marginTop: 8 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 6 }}>action_model</th>
                    <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 6 }}>entropy_auc</th>
                    <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 6 }}>mdc_violation_rate</th>
                    <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 6 }}>arrival_frac_mean</th>
                    <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 6 }}>delivered_info_proxy_mean</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const p1 = epistemicActionModelStatsForMetric(summary, "entropy_auc");
                    const p2 = epistemicActionModelStatsForMetric(summary, "mdc_violation_rate");
                    const p3 = epistemicActionModelStatsForMetric(summary, "arrival_frac_mean");
                    const p4 = epistemicActionModelStatsForMetric(summary, "delivered_info_proxy_mean");
                    const models = Array.from(
                      new Set([
                        ...Object.keys(p1 || {}),
                        ...Object.keys(p2 || {}),
                        ...Object.keys(p3 || {}),
                        ...Object.keys(p4 || {}),
                      ])
                    ).sort();
                    return models.map((model) => (
                      <tr key={model}>
                        <td style={{ borderBottom: "1px solid #eee", padding: 6 }}>{model}</td>
                        <td style={{ borderBottom: "1px solid #eee", padding: 6 }}>{fmtNum(p1?.[model]?.mean, 6)}</td>
                        <td style={{ borderBottom: "1px solid #eee", padding: 6 }}>{fmtNum(p2?.[model]?.mean, 6)}</td>
                        <td style={{ borderBottom: "1px solid #eee", padding: 6 }}>{fmtNum(p3?.[model]?.mean, 6)}</td>
                        <td style={{ borderBottom: "1px solid #eee", padding: 6 }}>{fmtNum(p4?.[model]?.mean, 6)}</td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}

      {summary && isOperationalStudy(summary) && regimeSweepInfo ? (
        <div className="card">
          <h2>Regime sweep factors</h2>
          <div className="small" style={{ opacity: 0.85 }}>
            Compact read of the regime-related config dimensions detected in the current table preview. These are study-design
            labels and control settings, not outcome metrics. Read this as experimental framing that supports the summary cards
            above.
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(280px, 1fr))",
              gap: 12,
              marginTop: 10,
            }}
          >
            <div className="card" style={{ margin: 0 }}>
              <h2 style={{ marginTop: 0 }}>Labels</h2>
              <div className="small" style={{ lineHeight: 1.5 }}>
                <div>
                  regime_family_cfg=<b>{regimeSweepInfo.families.length ? regimeSweepInfo.families.join(", ") : "—"}</b>
                </div>
                <div>
                  impairment_level_cfg=<b>{regimeSweepInfo.impairments.length ? regimeSweepInfo.impairments.join(", ") : "—"}</b>
                </div>
                <div>
                  regime_mode_cfg=<b>{regimeSweepInfo.modes.length ? regimeSweepInfo.modes.join(", ") : "—"}</b>
                </div>
                <div>
                  regime_enabled_cfg=<b>{regimeSweepInfo.regimeEnabled.length ? regimeSweepInfo.regimeEnabled.join(", ") : "—"}</b>
                </div>
              </div>
            </div>

            <div className="card" style={{ margin: 0 }}>
              <h2 style={{ marginTop: 0 }}>Thresholds</h2>
              <div className="small" style={{ lineHeight: 1.5 }}>
                <div>
                  downshift_util_cfg=<b>{regimeSweepInfo.downshiftUtil.length ? regimeSweepInfo.downshiftUtil.join(", ") : "—"}</b>
                </div>
                <div>
                  switch_util_cfg=<b>{regimeSweepInfo.switchUtil.length ? regimeSweepInfo.switchUtil.join(", ") : "—"}</b>
                </div>
                <div>
                  recovery_util_cfg=<b>{regimeSweepInfo.recoveryUtil.length ? regimeSweepInfo.recoveryUtil.join(", ") : "—"}</b>
                </div>
              </div>
            </div>

            <div className="card" style={{ margin: 0 }}>
              <h2 style={{ marginTop: 0 }}>Persistence</h2>
              <div className="small" style={{ lineHeight: 1.5 }}>
                <div>
                  downshift_persistence_cfg=<b>{regimeSweepInfo.downshiftPersistence.length ? regimeSweepInfo.downshiftPersistence.join(", ") : "—"}</b>
                </div>
                <div>
                  switch_persistence_cfg=<b>{regimeSweepInfo.switchPersistence.length ? regimeSweepInfo.switchPersistence.join(", ") : "—"}</b>
                </div>
                <div>
                  recovery_persistence_cfg=<b>{regimeSweepInfo.recoveryPersistence.length ? regimeSweepInfo.recoveryPersistence.join(", ") : "—"}</b>
                </div>
              </div>
            </div>

            <div className="card" style={{ margin: 0 }}>
              <h2 style={{ marginTop: 0 }}>Hysteresis</h2>
              <div className="small" style={{ lineHeight: 1.5 }}>
                <div>
                  downshift_hysteresis_cfg=<b>{regimeSweepInfo.downshiftHysteresis.length ? regimeSweepInfo.downshiftHysteresis.join(", ") : "—"}</b>
                </div>
                <div>
                  switch_hysteresis_cfg=<b>{regimeSweepInfo.switchHysteresis.length ? regimeSweepInfo.switchHysteresis.join(", ") : "—"}</b>
                </div>
                <div>
                  recovery_hysteresis_cfg=<b>{regimeSweepInfo.recoveryHysteresis.length ? regimeSweepInfo.recoveryHysteresis.join(", ") : "—"}</b>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {transitionDiagnostics ? (
        <div className="card">
          <h2>Transition diagnostics from preview rows</h2>
          <div className="small" style={{ opacity: 0.84, marginBottom: 10 }}>
            Compact threshold-neighborhood and persistence/cooldown summary computed from the currently loaded preview rows.
            This is a row-preview diagnostic, not yet a backend study-summary aggregate.
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(280px, 1fr))",
              gap: 12,
            }}
          >
            <div className="card" style={{ margin: 0 }}>
              <h2 style={{ marginTop: 0 }}>Margins</h2>
              <div className="small" style={{ lineHeight: 1.55 }}>
                <div>near-zero band = <b>±{fmtNum(transitionDiagnostics.neighborhoodAbs, 3)}</b></div>
                <div>
                  down util min/max = <b>{fmtNum(transitionDiagnostics.downUtilMin, 6)}</b> / <b>{fmtNum(transitionDiagnostics.downUtilMax, 6)}</b>
                </div>
                <div>
                  switch util min/max = <b>{fmtNum(transitionDiagnostics.switchUtilMin, 6)}</b> / <b>{fmtNum(transitionDiagnostics.switchUtilMax, 6)}</b>
                </div>
                <div>
                  recovery util min/max = <b>{fmtNum(transitionDiagnostics.recoveryUtilMin, 6)}</b> / <b>{fmtNum(transitionDiagnostics.recoveryUtilMax, 6)}</b>
                </div>
                <div>
                  down util near-zero frac = <b>{fmtPct(transitionDiagnostics.downUtilNearFrac, 1)}</b>
                </div>
                <div>
                  switch util near-zero frac = <b>{fmtPct(transitionDiagnostics.switchUtilNearFrac, 1)}</b>
                </div>
                <div>
                  recovery util near-zero frac = <b>{fmtPct(transitionDiagnostics.recoveryUtilNearFrac, 1)}</b>
                </div>
              </div>
            </div>

            <div className="card" style={{ margin: 0 }}>
              <h2 style={{ marginTop: 0 }}>Counters and realized active behavior</h2>
              <div className="small" style={{ lineHeight: 1.55 }}>
                <div>
                  down counter max = <b>{fmtNum(transitionDiagnostics.downCounterMax, 0)}</b>
                </div>
                <div>
                  switch counter max = <b>{fmtNum(transitionDiagnostics.switchCounterMax, 0)}</b>
                </div>
                <div>
                  recovery counter max = <b>{fmtNum(transitionDiagnostics.recoveryCounterMax, 0)}</b>
                </div>
                <div>
                  recovery block mean = <b>{fmtNum(transitionDiagnostics.recoveryBlockMean, 4)}</b>
                </div>
                <div>
                  recovery block nonzero steps = <b>{fmtNum(transitionDiagnostics.recoveryBlockNonZeroSteps, 0)}</b>
                </div>
                <div>
                  active transition nonzero rows = <b>{fmtNum(transitionDiagnostics.activeTransitionNonZero, 0)}</b>
                </div>
                <div>
                  active last state = <b>{regimeStateLabel(transitionDiagnostics.activeStateLast)}</b>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {summary && hasRegimeSummary(summary) ? (
        <div className="card">
          <h2>Regime-management summary</h2>

          <div className="small" style={{ opacity: 0.85, lineHeight: 1.5 }}>
            enabled=<b>{String(summary?.regime_enabled ?? "—")}</b>
            {" · "}mode=<b>{String(summary?.regime_mode ?? "—")}</b>
            {" · "}last_state=<b>{regimeStateLabel(summary?.regime_last_state)}</b>
            {summary?.regime_last_certified_stage_id ? (
              <> · last_stage=<b>{String(summary.regime_last_certified_stage_id)}</b></>
            ) : null}
            {summary?.regime_last_opportunistic_level_id ? (
              <> · last_ladder=<b>{String(summary.regime_last_opportunistic_level_id)}</b></>
            ) : null}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(260px, 1fr))",
              gap: 12,
              marginTop: 10,
            }}
          >
            <div className="card" style={{ margin: 0 }}>
              <h2 style={{ marginTop: 0 }}>Performance</h2>
              <div className="small" style={{ lineHeight: 1.45 }}>
                <div>
                  regime_utilization_mean=<b>{fmtNum(summary?.regime_utilization_mean, 6)}</b>
                </div>
                <div>
                  regime_strict_drift_proxy_mean=<b>{fmtNum(summary?.regime_strict_drift_proxy_mean, 6)}</b>
                </div>
                <div>
                  regime_local_drift_rate_mean=<b>{fmtNum(summary?.regime_local_drift_rate_mean, 6)}</b>
                </div>
                <div>
                  regime_cumulative_exposure_final=<b>{fmtNum(summary?.regime_cumulative_exposure_final, 6)}</b>
                </div>
              </div>
            </div>

            <div className="card" style={{ margin: 0 }}>
              <h2 style={{ marginTop: 0 }}>Cost</h2>
              <div className="small" style={{ lineHeight: 1.45 }}>
                <div>
                  movement_total_mean_l1=<b>{fmtNum(summary?.movement_total_mean_l1, 6)}</b>
                </div>
                <div>
                  moves_per_step_mean=<b>{fmtNum(summary?.moves_per_step_mean, 6)}</b>
                </div>
                <div>
                  moved_frac_mean=<b>{fmtNum(summary?.moved_frac_mean, 6)}</b>
                </div>
              </div>
            </div>

            <div className="card" style={{ margin: 0 }}>
              <h2 style={{ marginTop: 0 }}>Responsiveness</h2>
              <div className="small" style={{ lineHeight: 1.45 }}>
                <div>
                  ttfd=<b>{fmtNum(summary?.ttfd, 6)}</b>
                </div>
                <div>
                  coverage_auc=<b>{fmtNum(summary?.coverage_auc, 6)}</b>
                </div>
                <div>
                  mean_entropy_auc=<b>{fmtNum(summary?.mean_entropy_auc ?? summary?.entropy_auc, 6)}</b>
                </div>
              </div>
            </div>

            <div className="card" style={{ margin: 0 }}>
              <h2 style={{ marginTop: 0 }}>Regime behavior</h2>
              <div className="small" style={{ lineHeight: 1.45 }}>
                <div>
                  advisory_downshift_trigger_hits=<b>{fmtNum(
                    summary?.regime_advisory_downshift_trigger_hits,
                    0
                  )}</b>
                </div>
                <div>
                  advisory_switch_to_certified_trigger_hits=<b>{fmtNum(
                    summary?.regime_advisory_switch_to_certified_trigger_hits,
                    0
                  )}</b>
                </div>
                <div>
                  advisory_recovery_trigger_hits=<b>{fmtNum(
                    summary?.regime_advisory_recovery_trigger_hits,
                    0
                  )}</b>
                </div>
                <div>
                  active_transition_count=<b>{fmtNum(summary?.regime_active_transition_count, 0)}</b>
                </div>
                <div>
                  effective_eta_mean=<b>{fmtNum(summary?.regime_effective_eta_mean, 6)}</b>
                </div>
                <div>
                  effective_move_budget_cells_mean=<b>{fmtNum(summary?.regime_effective_move_budget_cells_mean, 6)}</b>
                </div>
                <div>
                  last_state=<b>{regimeStateLabel(summary?.regime_last_state)}</b>
                </div>
                <div>
                  stage_ids=<b>{Array.isArray(summary?.regime_stage_ids) ? summary.regime_stage_ids.join(", ") : "—"}</b>
                </div>
                <div>
                  ladder_ids=<b>{Array.isArray(summary?.regime_opportunistic_level_ids) ? summary.regime_opportunistic_level_ids.join(", ") : "—"}</b>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {summary ? (
        <div className="card" style={{ marginTop: 10 }}>
          <h2 style={{ marginTop: 0 }}>Raw artifact inspection</h2>
          <div className="small" style={{ opacity: 0.8 }}>
            Lower-level inspection tools for verification and debugging. These blocks are intentionally quieter than the
            study-summary cards above.
          </div>
        </div>
      ) : null}

      {err ? (
        <div className="card" style={{ border: "1px solid #f3c1c1" }}>
          <h2>Error</h2>
          <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{err}</pre>
        </div>
      ) : null}


      {summary ? (
        <div className="card">
          <h2>Summary JSON</h2>
          <div className="small" style={{ opacity: 0.78, marginBottom: 8 }}>
            Raw structured artifact for audit and debugging.
          </div>
          <details>
            <summary className="small" style={{ cursor: "pointer", opacity: 0.9 }}>
              show (truncated if huge)
            </summary>
            <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>
              {summaryText.length > 20000
                ? summaryText.slice(0, 20000) + "\n…(truncated)"
                : summaryText}
            </pre>
          </details>
        </div>
      ) : <div className="small">No data loaded.</div>}

      {tableRows.length > 0 ? (
        <div className="card">
          <h2>Analysis table.csv preview</h2>
          <div className="small" style={{ opacity: 0.78, marginBottom: 8 }}>
            Preview of the raw row table. Use the filters to inspect case- or policy-specific slices.
          </div>

          {(hasCaseCol || hasPolicyCol || tableCols.includes("action_model")) ? (
            <div className="row" style={{ alignItems: "center", marginTop: 6 }}>
              {hasCaseCol ? (
                <>
                  <label>case</label>
                  <select value={filterCase} onChange={(e) => setFilterCase(e.target.value)} style={{ minWidth: 220 }}>
                    <option value="">(all)</option>
                    {uniqueCases.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </>
              ) : null}

              {hasPolicyCol ? (
                <>
                  <label>policy</label>
                  <select value={filterPolicy} onChange={(e) => setFilterPolicy(e.target.value)} style={{ minWidth: 220 }}>
                    <option value="">(all)</option>
                    {uniquePolicies.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </>
              ) : null}

              {!hasPolicyCol && tableCols.includes("action_model") ? (
                <>
                  <label>action_model</label>
                  <select value={filterPolicy} onChange={(e) => setFilterPolicy(e.target.value)} style={{ minWidth: 220 }}>
                    <option value="">(all)</option>
                    {Array.from(new Set(tableRows.map((r) => String(r["action_model"] ?? "")).filter(Boolean))).sort().map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </>
              ) : null}

              <div className="small" style={{ opacity: 0.75 }}>
                showing <b>{filteredRows.length}</b> rows (preview)
              </div>

              <button
                type="button"
                onClick={() => { setFilterCase(""); setFilterPolicy(""); }}
                style={{ marginLeft: "auto" }}
              >
                Clear
              </button>
            </div>
          ) : null}

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr>
                  {tableCols.map((k) => (
                    <th key={k} style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 6 }}>{k}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((r, i) => (
                  <tr key={i}>
                    {tableCols.map((k) => (
                      <td key={k} style={{ borderBottom: "1px solid #eee", padding: 6 }}>{String(r[k])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {id ? (
        <div
          className="card"
          style={{
            marginTop: 10,
            border: "1px solid rgba(120,0,0,0.16)",
            background: "rgba(120,0,0,0.03)",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Study management</h2>
          <div className="small" style={{ opacity: 0.8, marginBottom: 10 }}>
            Destructive actions are kept here so they do not dominate the main reading path.
          </div>
          <div className="row" style={{ alignItems: "center", marginTop: 6 }}>
            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="checkbox"
                checked={cascadeDelete}
                onChange={(e) => setCascadeDelete(e.target.checked)}
                disabled={loading}
              />
              Also delete underlying runs (cascade)
            </label>
            <button
              onClick={async () => {
                const msg = cascadeDelete
                  ? `Delete study ${id} AND its underlying runs (opr/epi)? This cannot be undone.`
                  : `Delete study ${id}? This cannot be undone.`;
                const typed = window.prompt(msg + `\n\nType ${id} to confirm:`, "");
                if (String(typed ?? "").trim() !== String(id).trim()) return;
                setErr("");
                setLoading(true);
                try {
                  await deleteJSON(`/analysis/${id}?cascade=${cascadeDelete ? "true" : "false"}`);
                  setId("");
                  setSummary(null);
                  setManifest(null);
                  setTableMeta(null);
                  setTableCols([]);
                  setTableRows([]);
                  await refreshList();
                } catch (e: any) {
                  console.error(e);
                  setErr(String(e?.message ?? e));
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              style={{ marginLeft: "auto" }}
            >
              Delete Study
            </button>
          </div>
        </div>
      ) : null}

      <div className="small" style={{ opacity: 0.72, marginTop: 10 }}>
        Analysis · Raw is the audit-oriented companion to Analysis · Graphic: use Graphic for polished reading, and Raw for
        structured verification.
      </div>
      <div className="small" style={{ opacity: 0.72, marginTop: 6 }}>
        Division of labor: <b>Analysis · Batch</b> creates the study, <b>Analysis · Graphic</b> presents the canonical reading,
        and <b>Analysis · Raw</b> exposes the audit trail and row preview.
      </div>

      <style jsx>{`
        @media (max-width: 1100px) {
          .row {
            flex-wrap: wrap;
          }
        }

        @media (max-width: 980px) {
          .rawTopGrid {
            grid-template-columns: 1fr !important;
          }

          .rawSummaryGrid {
            grid-template-columns: 1fr !important;
          }
        }

        .rawSubCard {
          margin: 0;
          background: rgba(0,0,0,0.02);
        }
      `}</style>

    </div>
  );
}
