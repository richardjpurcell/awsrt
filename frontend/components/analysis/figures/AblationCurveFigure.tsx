// frontend/components/analysis/figures/AblationCurveFigure.tsx
"use client";

import React, { useMemo } from "react";
import {
  ErrorMode,
  extent,
  fmt,
  layoutLegendRows,
  rowTotalWidth,
  stderrFromStd,
  tickDigitsFromTicks,
  fmtTick,
  segmentedLinePath,
  toNumberOrNull,
  policyDisplayLabel,
  policyLegendItemWidth,
  niceTicks,
} from "./plot_utils";

type Props = {
  svgRef?: React.RefObject<SVGSVGElement>;
  title: string;
  summary: any;
  metric: string;
  errorMode: ErrorMode;
  yLabel?: string;
  xLabel?: string;
  caseLabelMode: "label" | "level";
  width?: number;   // viewBox width
  height?: number;  // viewBox height
};

type Point = { x: number; y: number; err: number | null };

function caseOrderAndLabels(summary: any): Array<{ key: string; label: string; level: number }> {
  const sweep = Array.isArray(summary?.sweep) ? summary.sweep : [];
  if (sweep.length) {
    return sweep.map((s: any, idx: number) => ({
      key: String(s?.label ?? `case_${idx}`),
      label: String(s?.label ?? `case_${idx}`),
      level: idx,
    }));
  }
  const byMetric = summary?.case_policy_stats_by_metric ?? {};
  const casesObj = byMetric?.[Object.keys(byMetric || {})[0]] ?? {};
  const keys = Object.keys(casesObj || {});
  return keys.sort().map((k, i) => ({ key: k, label: k, level: i }));
}

function metricDirection(summary: any, metric: string): "min" | "max" {
  const d = String(summary?.metrics_catalog?.direction?.[metric] ?? "").toLowerCase().trim();
  if (d === "min" || d === "max") return d;
  const m = String(metric || "").toLowerCase();
  if (m === "ttfd") return "min";
  if (m.includes("time") || m.includes("latency")) return "min";
  if (m.includes("entropy")) return "min";
  if (m.includes("violation") || m.includes("error") || m.includes("loss")) return "min";
  if (m.includes("exposure")) return "min";
  if (m.includes("transition_count")) return "min";
  if (m.includes("residual") && (m.includes("pos_frac") || m.includes("mean"))) return "min";
  if (m.includes("auc") || m.includes("coverage") || m.includes("info")) return "max";
  if (m.includes("in_band")) return "max";
  if (m.includes("utilization")) return "max";
  if (m.includes("drift_proxy")) return "max";
  if (m.includes("local_drift_rate")) return "max";
  return "max";
}

export default function AblationCurveFigure({
  svgRef,
  title,
  summary,
  metric,
  errorMode,
  yLabel,
  xLabel,
  caseLabelMode,
  width = 640,
  height = 360,
}: Props) {
  const data = useMemo(() => {
    const m = String(metric || "").trim();
    const cases = caseOrderAndLabels(summary);

    // Shape (from your sample): case_policy_stats_by_metric[metric][case][policy] = {mean,std,n}
    const byMetric = summary?.case_policy_stats_by_metric ?? {};
    const byCase = byMetric?.[m] ?? null;

    const policies = Array.isArray(summary?.policies)
      ? (summary.policies as string[]).map(String)
      : byCase && typeof byCase === "object"
        ? Array.from(
            new Set(
              Object.keys(byCase).flatMap((ck) => Object.keys(byCase?.[ck] ?? {}))
            )
          ).map(String)
        : [];

    const series: Record<string, Point[]> = {};
    for (const p of policies) series[p] = [];

    for (const c of cases) {
      const caseStats = byCase?.[c.key] ?? null;
      for (const p of policies) {
        const st = caseStats?.[p] ?? null;
        const mu = toNumberOrNull(st?.mean);
        const sd = toNumberOrNull(st?.std);
        const n = toNumberOrNull(st?.n);

        let err: number | null = null;
        if (errorMode === "none") err = null;
        else if (errorMode === "std") err = sd;
        else if (errorMode === "stderr") {
          err = sd !== null && n !== null ? stderrFromStd(sd, n) : null;
        }

        if (mu !== null) series[p].push({ x: c.level, y: mu, err: err !== null && Number.isFinite(err) ? err : null });
        else series[p].push({ x: c.level, y: NaN, err: null });
      }
    }

    return { cases, policies, series };
  }, [summary, metric, errorMode]);

  const yCandidates: number[] = [];
  for (const p of data.policies) {
    for (const pt of data.series[p] || []) {
      if (!Number.isFinite(pt.y)) continue;
      if (pt.err !== null && Number.isFinite(pt.err)) {
        yCandidates.push(pt.y - pt.err, pt.y + pt.err);
      } else {
        yCandidates.push(pt.y);
      }
    }
  }

  const yExt0 = extent(yCandidates);
  if (!yExt0) {
    return (
      <div className="small" style={{ opacity: 0.8 }}>
        No numeric data found for metric <b>{metric}</b>.
      </div>
    );
  }

  const ySpan0 = yExt0.max - yExt0.min;
  const yPad = ySpan0 === 0 ? Math.max(1, Math.abs(yExt0.max) * 0.1 || 1) : ySpan0 * 0.08;
  const yMin = yExt0.min - yPad;
  const yMax = yExt0.max + yPad;
  const direction = metricDirection(summary, metric);

  // Bottom layout (avoid text collisions):
  // - reserve space for x tick labels
  // - reserve space for x-axis label
  // - reserve space for legend (can wrap)
  const legendLaneH = 22;     // one row of legend items (baseline)
  const legendRowsMax = 2;    // allow wrapping into up to 2 rows
  const margin = { l: 68, r: 22, t: 46, b: 92 + legendLaneH * (legendRowsMax - 1) };
  const W = width;
  const H = height;
  const innerW = W - margin.l - margin.r;
  const innerH = H - margin.t - margin.b;

  const xMin = 0;
  const xMax = Math.max(1, data.cases.length - 1);

  const sx = (x: number) => margin.l + (xMax === xMin ? 0 : ((x - xMin) / (xMax - xMin)) * innerW);
  const sy = (y: number) => margin.t + (1 - (y - yMin) / (yMax - yMin || 1)) * innerH;

  // Grayscale line styles (policy index → dash)
  const dashFor = (i: number) => {
    const patterns = ["", "8 5", "2 4", "10 3 2 3", "1 3"];
    return patterns[i % patterns.length];
  };

  const xTickLabels = data.cases.map((c) => (caseLabelMode === "level" ? String(c.level) : c.label));
  const yTicks = niceTicks(yMin, yMax, 5);

  const legendRows = layoutLegendRows(
    data.policies.map((p, i) => ({ key: p, label: p, i })),
    innerW,
    {
      rowsMax: legendRowsMax,
      gap: 18,
      itemWidth: (it) => policyLegendItemWidth(summary, String((it as any).key ?? "")),
    }
  );

  // Vertical positions in the bottom margin band:
  // - xTickLabels are at y0+22 already (relative to axis baseline)
  // - x-axis label goes above the legend
  // - legend sits at the very bottom (with optional second row above it)
  const axisY = margin.t + innerH;
  const xLabelY = axisY + 48;             // below tick labels, above legend
  const legendBaseY = H - 18;             // bottom padding for legend last row
  const legendRowDy = 22;                 // row spacing
  const yTickDigits = tickDigitsFromTicks(yTicks, 4);
  const xLabelsNeedRotation = caseLabelMode === "label" && xTickLabels.some((s) => String(s).length > 10);
  const xTickY = axisY + (xLabelsNeedRotation ? 14 : 22);
  const showEveryXTicks = data.cases.length > 10 ? 2 : 1;

  return (
    <div>
      <div className="small" style={{ marginBottom: 8 }}>
        <b>{title}</b>{" "}
        <span style={{ opacity: 0.75 }}>
          · metric=<b>{metric}</b> · error={errorMode} · {direction === "min" ? "lower is better" : "higher is better"}
        </span>
      </div>

      <div
        style={{
          border: "1px solid rgba(0,0,0,0.12)",
          borderRadius: 12,
          padding: 10,
          background: "#fff",
          overflowX: "auto",
        }}
      >
        <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMinYMin meet">
          {/* Background */}
          <rect x={0} y={0} width={W} height={H} fill="#ffffff" />

          {/* Title */}
          <text x={margin.l} y={24} fontSize="16" fill="rgba(0,0,0,0.82)">
            {title}
          </text>

          {/* Axes */}
          <line x1={margin.l} y1={margin.t} x2={margin.l} y2={margin.t + innerH} stroke="rgba(0,0,0,0.55)" />
          <line x1={margin.l} y1={margin.t + innerH} x2={margin.l + innerW} y2={margin.t + innerH} stroke="rgba(0,0,0,0.55)" />

          {/* Grid + Y ticks */}
          {yTicks.map((tv, i) => {
            const y = sy(tv);
            return (
              <g key={i}>
                <line x1={margin.l} y1={y} x2={margin.l + innerW} y2={y} stroke="rgba(0,0,0,0.08)" />
                <text x={margin.l - 10} y={y + 4} fontSize="12" textAnchor="end" fill="rgba(0,0,0,0.72)">
                  {fmtTick(tv, yTicks, 4)}
                </text>
              </g>
            );
          })}

          {/* X ticks */}
          {data.cases.map((c, i) => {
            if (i % showEveryXTicks !== 0) return null;
            const x = sx(c.level);
            const y0 = margin.t + innerH;
            return (
              <g key={c.key}>
                <line x1={x} y1={y0} x2={x} y2={y0 + 6} stroke="rgba(0,0,0,0.55)" />
                <text
                  x={x}
                  y={xTickY}
                  fontSize="12"
                  textAnchor="middle"
                  fill="rgba(0,0,0,0.78)"
                  transform={xLabelsNeedRotation ? `rotate(-30 ${x} ${xTickY})` : undefined}
                >
                  {xTickLabels[i]}
                </text>
              </g>
            );
          })}

          {/* Axis labels */}
          <text x={margin.l + innerW / 2} y={xLabelY} fontSize="12" textAnchor="middle" fill="rgba(0,0,0,0.78)">
            {xLabel ?? "case (ablation level)"}
          </text>
          <text
            x={16}
            y={margin.t + innerH / 2}
            fontSize="12"
            textAnchor="middle"
            fill="rgba(0,0,0,0.78)"
            transform={`rotate(-90 16 ${margin.t + innerH / 2})`}
          >
            {yLabel ?? metric}
          </text>

          {/* Series */}
          {data.policies.map((p, pi) => {
            const pts = data.series[p] || [];

            const dash = dashFor(pi);
            const paths = segmentedLinePath(
              pts.map((pt) => ({ x: pt.x, y: Number.isFinite(pt.y) ? pt.y : null })),
              sx,
              sy
            );

            return (
              <g key={p}>
                {/* Error bars */}
                {errorMode !== "none"
                  ? pts.map((pt, i) => {
                      if (!Number.isFinite(pt.y) || pt.err === null) return null;
                      const x = sx(pt.x);
                      const y = sy(pt.y);
                      const yA = sy(pt.y - pt.err);
                      const yB = sy(pt.y + pt.err);
                      return (
                        <g key={i}>
                          <line x1={x} y1={yA} x2={x} y2={yB} stroke="rgba(0,0,0,0.45)" strokeWidth={1} />
                          <line x1={x - 6} y1={yA} x2={x + 6} y2={yA} stroke="rgba(0,0,0,0.45)" strokeWidth={1} />
                          <line x1={x - 6} y1={yB} x2={x + 6} y2={yB} stroke="rgba(0,0,0,0.45)" strokeWidth={1} />
                        </g>
                      );
                    })
                  : null}

                {/* Line */}
                {paths.map((pathD, pj) => (
                  <path
                    key={pj}
                    d={pathD}

                    fill="none"
                    stroke="rgba(0,0,0,0.78)"
                    strokeWidth={2}
                    strokeDasharray={dash || undefined}
                  />
                ))}

                {/* Markers */}
                {pts.map((pt, i) => {
                  if (!Number.isFinite(pt.y)) return null;
                  const x = sx(pt.x);
                  const y = sy(pt.y);
                  return (
                    <circle key={i} cx={x} cy={y} r={3.2} fill="rgba(0,0,0,0.78)">
                      <title>
                        {`${policyDisplayLabel(summary, p)} · ${caseLabelMode === "level" ? `level=${pt.x}` : xTickLabels[pt.x] ?? `level=${pt.x}`} · ${metric}=${fmt(pt.y, Math.min(6, yTickDigits + 1))}${pt.err !== null ? ` ± ${fmt(pt.err, Math.min(6, yTickDigits + 1))}` : ""}`}
                      </title>
                    </circle>
                  );
                })}
              </g>
            );
          })}

          {/* Legend */}
          <g>
            {legendRows.map((row, ri) => {
              // If two rows, the first row sits above the second row.
              const y = legendBaseY - (legendRows.length - 1 - ri) * legendRowDy;
              // Center each row within the plot width.
              const tw = rowTotalWidth(row.map((r) => ({ w: r.w })), 18);
              const xStart = margin.l + Math.max(0, (innerW - tw) / 2);
              let x = xStart;
              return (
                <g key={ri}>
                  {row.map((it) => {
                    const dash = dashFor((it.it as any).i);
                    const g = (
                      <g key={it.it.key} transform={`translate(${x}, ${y})`}>
                        <line
                          x1={0}
                          y1={0}
                          x2={34}
                          y2={0}
                          stroke="rgba(0,0,0,0.78)"
                          strokeWidth={2}
                          strokeDasharray={dash || undefined}
                        />
                        <circle cx={17} cy={0} r={3.2} fill="rgba(0,0,0,0.78)" />
                        <text x={44} y={4} fontSize="12" fill="rgba(0,0,0,0.78)" textAnchor="start">
                          {policyDisplayLabel(summary, String(it.it.key))}
                        </text>
                      </g>
                    );
                    x += it.w + 18;
                    return g;
                  })}
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      <div className="small" style={{ marginTop: 8, opacity: 0.75 }}>
        Evidence: <b>summary.json.case_policy_stats_by_metric</b> → mean ± {errorMode === "stderr" ? "stderr" : errorMode} across seeds.{" "}
        Interpretation: <b>{direction === "min" ? "lower is better" : "higher is better"}</b>.
      </div>
    </div>
  );
}
