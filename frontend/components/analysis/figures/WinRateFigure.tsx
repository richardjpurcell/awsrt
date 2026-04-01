// frontend/components/analysis/figures/WinRateFigure.tsx
"use client";

import React, { useMemo } from "react";
import {
  clamp01,
  fmt,
  fmtTick,
  layoutLegendRows,
  niceTicks,
  rowTotalWidth,
  policyLegendItemWidth,
  segmentedLinePath,
  policyDisplayLabel,
  toNumberOrNull,
} from "./plot_utils";

type Props = {
  svgRef?: React.RefObject<SVGSVGElement>;
  title: string;
  summary: any;
  metric: string;
  baselinePolicy: string;
  caseLabelMode: "label" | "level";
  width?: number;
  height?: number;
};

function caseOrderAndLabels(summary: any): Array<{ key: string; label: string; level: number }> {
  const sweep = Array.isArray(summary?.sweep) ? summary.sweep : [];
  if (sweep.length) {
    return sweep.map((s: any, idx: number) => ({
      key: String(s?.label ?? `case_${idx}`),
      label: String(s?.label ?? `case_${idx}`),
      level: idx,
    }));
  }
  // fallback
  const byMetric = summary?.case_policy_win_rates_vs_baseline ?? {};
  const casesObj = byMetric?.[Object.keys(byMetric || {})[0]] ?? {};
  const keys = Object.keys(casesObj || {});
  return keys.sort().map((k, i) => ({ key: k, label: k, level: i }));
}

export default function WinRateFigure({
  svgRef,
  title,
  summary,
  metric,
  baselinePolicy,
  caseLabelMode,
  width = 640,
  height = 360,
}: Props) {
  const data = useMemo(() => {
    const m = String(metric || "").trim();
    const cases = caseOrderAndLabels(summary);

    // Shape (your sample): case_policy_win_rates_vs_baseline[metric][case] = {baseline_policy,direction,policies:{p:{win_rate,wins,total}}}
    const byMetric = summary?.case_policy_win_rates_vs_baseline ?? {};
    const byCase = byMetric?.[m] ?? null;

    // Only policies that appear in win-rate payload. Exclude baseline from plotted series.
    const policies = Array.from(
      new Set(
        cases.flatMap((c) => Object.keys(byCase?.[c.key]?.policies ?? {}))
      )
    )
      .map(String)
      .filter((p) => String(p) !== String(baselinePolicy));

    const series: Record<string, Array<{ x: number; y: number | null }>> = {};
    for (const p of policies) series[p] = [];

    for (const c of cases) {
      const entry = byCase?.[c.key] ?? null;
      const pols = entry?.policies ?? {};
      for (const p of policies) {
        const wr = toNumberOrNull(pols?.[p]?.win_rate);
        series[p].push({ x: c.level, y: wr !== null ? clamp01(wr) : null });
      }
    }

    return { cases, policies, series};
  }, [summary, metric, baselinePolicy]);

  const winRateMeta = useMemo(() => {
    const m = String(metric || "").trim();
    const byMetric = summary?.case_policy_win_rates_vs_baseline ?? {};
    const byCase = byMetric?.[m] ?? null;

    const map: Record<string, Array<{ wins: number | null; total: number | null; winRate: number | null }>> = {};
    for (const p of data.policies) map[p] = [];

    for (const c of data.cases) {
      const pols = byCase?.[c.key]?.policies ?? {};
      for (const p of data.policies) {
        map[p].push({
          wins: toNumberOrNull(pols?.[p]?.wins),
          total: toNumberOrNull(pols?.[p]?.total),
          winRate: toNumberOrNull(pols?.[p]?.win_rate),
        });
      }
    }

    return map;
  }, [summary, metric, data.cases, data.policies]);

  if (!data.policies.length) {
    return (
      <div className="small" style={{ opacity: 0.8 }}>
        No win-rate data found for metric <b>{metric}</b>. (Expected: summary.case_policy_win_rates_vs_baseline[metric].*)
      </div>
    );
  }

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
  const yMin = 0;
  const yMax = 1;

  const sx = (x: number) => margin.l + (xMax === xMin ? 0 : ((x - xMin) / (xMax - xMin)) * innerW);
  const sy = (y: number) => margin.t + (1 - (y - yMin) / (yMax - yMin || 1)) * innerH;

  const dashFor = (i: number) => {
    const patterns = ["", "8 5", "2 4", "10 3 2 3", "1 3"];
    return patterns[i % patterns.length];
  };

  const xTickLabels = data.cases.map((c) => (caseLabelMode === "level" ? String(c.level) : c.label));
  const yTicks = niceTicks(0, 1, 5);

  const showEveryXTicks = data.cases.length > 10 ? 2 : 1;

  const legendRows = layoutLegendRows(
    data.policies.map((p, i) => ({ key: p, label: p, i })),
    innerW,
    {
      rowsMax: legendRowsMax,
      gap: 18,
      itemWidth: (it) => policyLegendItemWidth(summary, String((it as any).key ?? "")),
    }
  );

  const axisY = margin.t + innerH;
  const xLabelY = axisY + 48;      // below tick labels, above legend
  const legendBaseY = H - 18;      // bottom padding for legend last row
  const legendRowDy = 22;          // row spacing

  return (
    <div>
      <div className="small" style={{ marginBottom: 8 }}>
        <b>{title}</b>{" "}
        <span style={{ opacity: 0.75 }}>
          · metric=<b>{metric}</b> · baseline=<b>{baselinePolicy}</b> · higher is better
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
          <rect x={0} y={0} width={W} height={H} fill="#ffffff" />

          <text x={margin.l} y={24} fontSize="16" fill="rgba(0,0,0,0.82)">
            {title}
          </text>

          <line x1={margin.l} y1={margin.t} x2={margin.l} y2={margin.t + innerH} stroke="rgba(0,0,0,0.55)" />
          <line x1={margin.l} y1={margin.t + innerH} x2={margin.l + innerW} y2={margin.t + innerH} stroke="rgba(0,0,0,0.55)" />

          {/* 50% reference line */}
          <line
            x1={margin.l}
            y1={sy(0.5)}
            x2={margin.l + innerW}
            y2={sy(0.5)}
            stroke="rgba(0,0,0,0.18)"
            strokeDasharray="4 4"
          />

          {/* Y ticks/grid */}
          {yTicks.map((tv, i) => {
            const y = sy(tv);
            return (
              <g key={i}>
                <line x1={margin.l} y1={y} x2={margin.l + innerW} y2={y} stroke="rgba(0,0,0,0.08)" />
                <text x={margin.l - 10} y={y + 4} fontSize="12" textAnchor="end" fill="rgba(0,0,0,0.72)">
                  {fmtTick(tv, yTicks, 3)}
                </text>
              </g>
            );
          })}

          {/* X ticks + vertical grid */}
          {data.cases.map((c, i) => {
            if (i % showEveryXTicks !== 0) return null;
            const x = sx(c.level);
            const y0 = margin.t + innerH;
            return (
              <g key={c.key}>
                <line x1={x} y1={margin.t} x2={x} y2={y0} stroke="rgba(0,0,0,0.06)" />
                <line x1={x} y1={y0} x2={x} y2={y0 + 6} stroke="rgba(0,0,0,0.55)" />
                <text x={x} y={y0 + 22} fontSize="12" textAnchor="middle" fill="rgba(0,0,0,0.78)">
                  {xTickLabels[i]}
                </text>
              </g>
            );
          })}

          <text x={margin.l + innerW / 2} y={xLabelY} fontSize="12" textAnchor="middle" fill="rgba(0,0,0,0.78)">
            case (ablation level)
          </text>
          <text
            x={16}
            y={margin.t + innerH / 2}
            fontSize="12"
            textAnchor="middle"
            fill="rgba(0,0,0,0.78)"
            transform={`rotate(-90 16 ${margin.t + innerH / 2})`}
          >
            win-rate vs baseline (0–1)
          </text>

          {/* Series */}
          {data.policies.map((p, pi) => {
            const pts = data.series[p] || [];
            const paths = segmentedLinePath(pts, sx, sy);

            const dash = dashFor(pi);
            const isBaseline = String(p) === String(baselinePolicy);
            return (
              <g key={p}>
                {paths.map((pathD, pj) => (
                  <path
                    key={pj}
                    d={pathD}
                    fill="none"
                    stroke={isBaseline ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0.78)"}
                    strokeWidth={2}
                    strokeDasharray={dash || undefined}
                  />
                ))}
                {pts.map((pt, i) => {
                  if (pt.y === null) return null;
                  const x = sx(pt.x);
                  const y = sy(pt.y);
                  const meta = winRateMeta?.[p]?.[i];
                  const wrPct = meta?.winRate !== null && meta?.winRate !== undefined
                    ? `${(100 * Number(meta.winRate)).toFixed(1)}%`
                    : "—";
                  const winsTxt = meta?.wins !== null && meta?.wins !== undefined ? String(meta.wins) : "—";
                  const totalTxt = meta?.total !== null && meta?.total !== undefined ? String(meta.total) : "—";
                  return (
                    <circle key={i} cx={x} cy={y} r={3.2} fill={isBaseline ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0.78)"}>
                      <title>{`${policyDisplayLabel(summary, p)} · case=${xTickLabels[i]} · win-rate=${wrPct} · wins=${winsTxt}/${totalTxt}`}</title>
                    </circle>
                  );
                })}
              </g>
            );
          })}

          {/* Legend */}
          <g>
            {legendRows.map((row, ri) => {
              const y = legendBaseY - (legendRows.length - 1 - ri) * legendRowDy;
              // Center each row within the plot width.
              const tw = rowTotalWidth(row.map((r) => ({ w: r.w })), 18);
              const xStart = margin.l + Math.max(0, (innerW - tw) / 2);
              let x = xStart;
              return (
                <g key={ri}>
                  {row.map((it) => {
                    const dash = dashFor((it.it as any).i);
                    const isBaseline = String(it.it.key) === String(baselinePolicy);
                    const g = (
                      <g key={it.it.key} transform={`translate(${x}, ${y})`}>
                        <line
                          x1={0}
                          y1={0}
                          x2={34}
                          y2={0}
                          stroke={isBaseline ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0.78)"}
                          strokeWidth={2}
                          strokeDasharray={dash || undefined}
                        />
                        <circle cx={17} cy={0} r={3.2} fill={isBaseline ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0.78)"} />
                        <text x={44} y={4} fontSize="12" fill="rgba(0,0,0,0.78)" textAnchor="start">
                          {isBaseline ? `${policyDisplayLabel(summary, String(it.it.key))} (baseline)` : policyDisplayLabel(summary, String(it.it.key))}
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
        Evidence: <b>summary.json.case_policy_win_rates_vs_baseline</b> (paired by <b>case_seed</b> in Phase C packaging).
      </div>
      <div className="small" style={{ marginTop: 4, opacity: 0.72 }}>
        The dashed horizontal line marks <b>0.5</b> win-rate, i.e. parity with the baseline under paired comparisons.
      </div>
    </div>
  );
}
