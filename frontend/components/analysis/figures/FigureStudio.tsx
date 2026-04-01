// frontend/components/analysis/figures/FigureStudio.tsx
"use client";

import React, { useMemo, useRef, useState } from "react";
import AblationCurveFigure from "./AblationCurveFigure";
import WinRateFigure from "./WinRateFigure";
import TradeoffScatterFigure from "./TradeoffScatterFigure";
import { downloadPNGFromSVG, downloadSVG } from "./export";
import { ErrorMode } from "./plot_utils";

type Props = {
  summaries: Record<string, any>;          // ana_id -> summary.json
  orderedStudyIds: string[];              // prioritize display order
  defaultStudyId: string;
  getStudyLabel: (anaId: string) => string;
};

type FigureKind = "ablation" | "winrate" | "tradeoff";
type FigureSize = "single" | "compact" | "double";
type DisplayWidth = "full" | "half" | "third";

function metricOptionsFor(summary: any): string[] {
  const mdir = summary?.metrics_catalog?.direction ?? {};
  const keys = Object.keys(mdir || {});
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
    "regime_effective_move_budget_cells_mean",
    "mdc_violation_rate",
    "mdc_residual_mean",
    "delivered_info_proxy_mean",
  ];
  const rest = keys.filter((k) => !prefer.includes(k)).sort();
  return [...prefer.filter((k) => keys.includes(k)), ...rest];
}

function caseKeys(summary: any): string[] {
  const sweep = Array.isArray(summary?.sweep) ? summary.sweep : [];
  if (sweep.length) return sweep.map((s: any) => String(s?.label ?? ""));
  // fallback
  const byMetric = summary?.case_policy_stats_by_metric ?? {};
  const firstMetric = Object.keys(byMetric || {})[0];
  const byCase = firstMetric ? byMetric?.[firstMetric] : {};
  return Object.keys(byCase || {}).sort();
}

function sizePreset(size: FigureSize): { w: number; h: number; label: string } {
  // Chosen to be paper-friendly:
  // - single: fits a typical single-column figure comfortably
  // - compact: for UI dashboards / quick scans
  // - double: for wider multi-policy legends
  if (size === "compact") return { w: 560, h: 320, label: "compact" };
  if (size === "double") return { w: 900, h: 420, label: "double-column" };
  return { w: 640, h: 360, label: "single-column" };
}

function displayWidthStyle(mode: DisplayWidth): React.CSSProperties {
  // Key idea: keep a constant aspect ratio via SVG viewBox,
  // but clamp the *rendered width* so the figure doesn't become vertically huge.
  // We use viewport width units so it's responsive to screen size.
  //
  // - full  : uses the card width (current behavior)
  // - half  : ~½ viewport width (clamped to card width by min(100%, ...))
  // - third : ~⅓ viewport width
  //
  // The figure components already render SVG width="100%" so this wrapper controls the actual size.
  const vw = mode === "third" ? "33vw" : mode === "half" ? "50vw" : "100%";
  return { width: `min(100%, ${vw})`, margin: "0 auto" };
}

export default function FigureStudio({ summaries, orderedStudyIds, defaultStudyId, getStudyLabel }: Props) {
  const loadedIds = useMemo(() => {
    const ids = orderedStudyIds.length ? orderedStudyIds : Object.keys(summaries);
    return ids.filter((id) => Boolean(summaries?.[id]));
  }, [orderedStudyIds, summaries]);

  const [figure, setFigure] = useState<FigureKind>("ablation");
  const [activeStudy, setActiveStudy] = useState<string>(defaultStudyId || loadedIds[0] || "");
  const [metric, setMetric] = useState<string>("__choose_best_by__");
  const [baseline, setBaseline] = useState<string>("__from_summary__");
  const [errorMode, setErrorMode] = useState<ErrorMode>("stderr");
  const [caseLabelMode, setCaseLabelMode] = useState<"label" | "level">("label");
  // Figure size preset (single-column default).
  // NOTE: This must exist before `preset = sizePreset(figSize)` is computed.
  const [figSize, setFigSize] = useState<FigureSize>("single");
  // Display width affects *UI size only* (exports use viewBox).
  const [displayWidth, setDisplayWidth] = useState<DisplayWidth>("half");

  // Tradeoff controls
  const [tradeY, setTradeY] = useState<string>("mean_entropy_auc");
  const [tradeCase, setTradeCase] = useState<string>("__all__");

  const svgRef = useRef<SVGSVGElement>(null);

  const s = summaries?.[activeStudy] ?? null;

  const metrics = useMemo(() => (s ? metricOptionsFor(s) : []), [s]);

  const chosenMetric = useMemo(() => {
    if (!s) return "";
    const m = metric === "__choose_best_by__" ? String(s?.choose_best_by ?? "").trim() : String(metric).trim();
    return m;
  }, [s, metric]);

  const baselinePolicy = useMemo(() => {
    if (!s) return "";
    if (baseline !== "__from_summary__") return baseline;
    const b = String(s?.baseline_policy ?? "").trim();
    return b || "greedy";
  }, [s, baseline]);

  const policyList = useMemo(() => {
    if (!s) return [];
    const pols = Array.isArray(s?.policies) ? (s.policies as string[]).map(String) : [];
    return pols;
  }, [s]);

  // For tradeoff overlay, use all loaded operational studies currently supplied.

  const tradeoffStudyIds = useMemo(() => {
    return loadedIds.filter((id) => String(summaries?.[id]?.study_type ?? "") === "operational_study");
  }, [loadedIds, summaries]);

  const canExport = Boolean(svgRef.current);

  // Be defensive in case of a hot-reload / partial merge.
  const safeFigSize: FigureSize = (figSize === "single" || figSize === "compact" || figSize === "double") ? figSize : "single";
  const preset = sizePreset(safeFigSize);
  const uiStyle = displayWidthStyle(displayWidth);

  function exportBaseName(): string {
    const fig = figure;
    const id = figure === "tradeoff" ? "multi" : (activeStudy || "study");
    const m = figure === "tradeoff" ? `${"ttfd"}_vs_${tradeY}` : chosenMetric;
    const err = figure === "ablation" ? errorMode : "none";
    return `awsrt_${fig}_${id}_${m}_${err}`.replace(/[^a-zA-Z0-9._-]+/g, "_");
  }

  async function onExportSVG() {
    const el = svgRef.current;
    if (!el) return;
    downloadSVG(el, `${exportBaseName()}.svg`);
  }

  async function onExportPNG() {
    const el = svgRef.current;
    if (!el) return;
    await downloadPNGFromSVG(el, `${exportBaseName()}.png`, 2);
  }

  if (!loadedIds.length) {
    return <div className="small" style={{ opacity: 0.8 }}>Load a study to enable Figure Studio.</div>;
  }

  return (
    <div>
      <div className="row" style={{ alignItems: "center", flexWrap: "wrap" }}>
        <label>Figure</label>
        <select value={figure} onChange={(e) => setFigure(e.target.value as FigureKind)} style={{ minWidth: 220 }}>
          <option value="ablation">D1 · Ablation curve</option>
          <option value="winrate">D2 · Win-rate vs baseline</option>
          <option value="tradeoff">D3 · Tradeoff scatter</option>
        </select>

        {figure !== "tradeoff" ? (
          <>
            <label>Study</label>
            <select
              value={activeStudy}
              onChange={(e) => setActiveStudy(String(e.target.value))}
              style={{ minWidth: 420 }}
            >
              {loadedIds.map((id) => (
                <option key={id} value={id}>
                  {getStudyLabel(id)}
                </option>
              ))}
            </select>
          </>
        ) : (
          <>
            <label>Studies</label>
            <div className="small" style={{ opacity: 0.8 }}>
              Overlaying {tradeoffStudyIds.length} batch study{tradeoffStudyIds.length === 1 ? "" : "ies"} (shape indicates study).
            </div>
          </>
        )}
      </div>

      <div className="row" style={{ alignItems: "center", flexWrap: "wrap", marginTop: 10 }}>
        {figure !== "tradeoff" ? (
          <>
            <label>Metric</label>
            <select
              value={metric}
              onChange={(e) => setMetric(String(e.target.value))}
              style={{ minWidth: 260 }}
            >
              <option value="__choose_best_by__">(use choose_best_by)</option>
              {metrics.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            <label>Baseline</label>
            <select
              value={baseline}
              onChange={(e) => setBaseline(String(e.target.value))}
              style={{ minWidth: 220 }}
            >
              <option value="__from_summary__">(from summary)</option>
              {policyList.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            <label>Case labels</label>
            <select value={caseLabelMode} onChange={(e) => setCaseLabelMode(e.target.value as any)}>
              <option value="label">label</option>
              <option value="level">numeric level</option>
            </select>
            <label>Display width</label>
            <select value={displayWidth} onChange={(e) => setDisplayWidth(e.target.value as DisplayWidth)}>
              <option value="full">full</option>
              <option value="half">half</option>
              <option value="third">third</option>
            </select>

            <label>Paper size</label>
            <select value={safeFigSize} onChange={(e) => setFigSize(e.target.value as FigureSize)}>
              <option value="single">single-column</option>
              <option value="compact">compact</option>
              <option value="double">double-column</option>
            </select>

            {figure === "ablation" ? (
              <>
                <label>Error</label>
                <select value={errorMode} onChange={(e) => setErrorMode(e.target.value as ErrorMode)}>
                  <option value="stderr">stderr</option>
                  <option value="std">std</option>
                  <option value="none">none</option>
                </select>
              </>
            ) : null}
          </>
        ) : (
          <>
            <label>Y metric</label>
            <select value={tradeY} onChange={(e) => setTradeY(String(e.target.value))} style={{ minWidth: 260 }}>
              <option value="mean_entropy_auc">mean_entropy_auc</option>
              <option value="coverage_auc">coverage_auc</option>
              <option value="regime_utilization_mean">regime_utilization_mean</option>
              <option value="regime_strict_drift_proxy_mean">regime_strict_drift_proxy_mean</option>
              <option value="regime_local_drift_rate_mean">regime_local_drift_rate_mean</option>
              <option value="regime_cumulative_exposure_final">regime_cumulative_exposure_final</option>
              <option value="regime_active_transition_count">regime_active_transition_count</option>
              <option value="regime_effective_eta_mean">regime_effective_eta_mean</option>
              <option value="regime_effective_move_budget_cells_mean">regime_effective_move_budget_cells_mean</option>

              <option value="mdc_violation_rate">mdc_violation_rate</option>
              <option value="delivered_info_proxy_mean">delivered_info_proxy_mean</option>
            </select>

            <label>Case</label>
            <select value={tradeCase} onChange={(e) => setTradeCase(String(e.target.value))} style={{ minWidth: 220 }}>
              <option value="__all__">mean over cases</option>
              {tradeoffStudyIds.length && summaries?.[tradeoffStudyIds[0]] ? (
                // Use cases from first study as canonical list (they should align if protocols match).
                caseKeys(summaries[tradeoffStudyIds[0]]).map((ck) => (
                  <option key={ck} value={ck}>{ck}</option>
                ))
              ) : null}
            </select>

            <label>Display width</label>
            <select value={displayWidth} onChange={(e) => setDisplayWidth(e.target.value as DisplayWidth)}>
              <option value="full">full</option>
              <option value="half">half</option>
              <option value="third">third</option>
            </select>

            <label>Paper size</label>
            <select value={safeFigSize} onChange={(e) => setFigSize(e.target.value as FigureSize)}>
              <option value="single">single-column</option>
              <option value="compact">compact</option>
              <option value="double">double-column</option>
            </select>
          </>
        )}

        <div style={{ flex: 1 }} />

        <button onClick={onExportSVG} disabled={!canExport} title="Download as SVG (paper-ready)">
          Download SVG
        </button>
        <button onClick={onExportPNG} disabled={!canExport} title="Download as PNG (raster export)">
          Download PNG
        </button>
      </div>

      <div style={{ marginTop: 14 }}>
        {figure === "ablation" && s ? (
          <div style={uiStyle}>
            <AblationCurveFigure
              svgRef={svgRef}
              title="Ablation curve"
              summary={s}
              metric={chosenMetric}
              errorMode={errorMode}
              caseLabelMode={caseLabelMode}
              xLabel="ablation level"
              yLabel={chosenMetric}
              width={preset.w}
              height={preset.h}
            />
          </div>
        ) : null}

        {figure === "winrate" && s ? (
          <div style={uiStyle}>
            <WinRateFigure
              svgRef={svgRef}
              title="Win-rate vs baseline across ablation levels"
              summary={s}
              metric={chosenMetric}
              baselinePolicy={baselinePolicy}
              caseLabelMode={caseLabelMode}
              width={preset.w}
              height={preset.h}
            />
          </div>
        ) : null}

        {figure === "tradeoff" ? (
          <div style={uiStyle}>
            <TradeoffScatterFigure
              svgRef={svgRef}
              title="Tradeoff scatter"
              summaries={summaries}
              orderedStudyIds={tradeoffStudyIds}
              xMetric="ttfd"
              yMetric={tradeY}
              caseKey={tradeCase}
              width={preset.w}
              height={preset.h}
            />
          </div>
        ) : null}
      </div>

      <div className="small" style={{ marginTop: 10, opacity: 0.75 }}>
        Source contract: uses <b>sweep</b> for case order, <b>case_policy_stats_by_metric</b> for D1/D3, and{" "}
        <b>case_policy_win_rates_vs_baseline</b> for D2. (No CSV scanning.){" "}
        {s ? (
          <>
            Active study: <b>{String(s?.ana_id ?? activeStudy)}</b> · baseline: <b>{baselinePolicy}</b> · choose_best_by:{" "}
            <b>{String(s?.choose_best_by ?? "—")}</b>
            {" "}· size: <b>{preset.label}</b>
            {" "}· display: <b>{displayWidth}</b>
          </>
        ) : null}
      </div>
      <div className="small" style={{ marginTop: 6, opacity: 0.72 }}>
        Regime metrics are exposed here as diagnostic / proxy / control-behavior summaries. They are useful for sweep analysis,
        but should not be interpreted by themselves as proof of control correctness or MDC truth.
      </div>
    </div>
  );
}
