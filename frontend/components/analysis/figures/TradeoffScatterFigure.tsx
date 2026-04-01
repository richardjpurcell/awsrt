// frontend/components/analysis/figures/TradeoffScatterFigure.tsx
"use client";

import React, { useMemo } from "react";
import {
  extent,
  fmt,
  layoutLegendRows,
  metricAxisLabel,
  policyDisplayLabel,
  niceTicks,
  rowTotalWidth,
  tickDigitsFromTicks,
  toNumberOrNull,
} from "./plot_utils";

type Props = {
  svgRef?: React.RefObject<SVGSVGElement>;
  title: string;
  summaries: Record<string, any>; // ana_id -> summary
  orderedStudyIds: string[];      // overlay order
  xMetric: string;               // usually ttfd
  yMetric: string;               // mean_entropy_auc or coverage_auc
  caseKey?: string | "__all__";   // choose a case, or aggregate mean across cases
  width?: number;
  height?: number;
};

type Pt = {
  anaId: string;
  policy: string;
  x: number;
  y: number;
  studyIndex: number;
};

function studyDisplayLabel(summary: any, anaId: string): string {
  const explicit = String(summary?.study_semantics?.study_label ?? "").trim();
  if (explicit) return explicit;
  const fam = String(summary?.study_semantics?.study_family ?? "").trim();
  const axis = String(summary?.study_semantics?.comparison_axis ?? "").trim();
  if (fam && axis) return `${anaId} · ${fam} · ${axis}`;
  if (fam) return `${anaId} · ${fam}`;
  return anaId;
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
  if (m.includes("residual") && (m.includes("mean") || m.includes("pos_frac"))) return "min";
  if (m.includes("in_band") || m.includes("auc") || m.includes("coverage") || m.includes("info") || m.includes("utilization") || m.includes("drift_proxy") || m.includes("local_drift_rate")) return "max";
  return "max";
}

function caseOrder(summary: any): string[] {
  const sweep = Array.isArray(summary?.sweep) ? summary.sweep : [];
  if (sweep.length) return sweep.map((s: any) => String(s?.label ?? ""));
  const byMetric = summary?.case_policy_stats_by_metric ?? {};
  const casesObj = byMetric?.[Object.keys(byMetric || {})[0]] ?? {};
  return Object.keys(casesObj || {}).sort();
}

function aggAcrossCases(summary: any, metric: string, policy: string): { mean: number | null } {
  const byMetric = summary?.case_policy_stats_by_metric ?? {};
  const byCase = byMetric?.[metric] ?? {};
  if (!byCase || typeof byCase !== "object") return { mean: null };

  const cases = caseOrder(summary);
  const values: number[] = [];
  for (const ck of cases) {
    const mu = toNumberOrNull(byCase?.[ck]?.[policy]?.mean);
    if (mu !== null) values.push(mu);
  }
  if (!values.length) return { mean: null };
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return { mean };
}

function valueAtCase(summary: any, metric: string, policy: string, caseKey: string): { mean: number | null } {
  const byMetric = summary?.case_policy_stats_by_metric ?? {};
  const byCase = byMetric?.[metric] ?? {};
  const mu = toNumberOrNull(byCase?.[caseKey]?.[policy]?.mean);
  return { mean: mu };
}

function markerForStudy(i: number) {
  // Distinct marker shapes per study (grayscale-friendly).
  const shapes = ["circle", "square", "triangle"] as const;
  return shapes[i % shapes.length];
}

function betterCorner(xDir: "min" | "max", yDir: "min" | "max"): string {
  if (xDir === "min" && yDir === "max") return "upper-left";
  if (xDir === "min" && yDir === "min") return "lower-left";
  if (xDir === "max" && yDir === "max") return "upper-right";
  return "lower-right";
}

export default function TradeoffScatterFigure({
  svgRef,
  title,
  summaries,
  orderedStudyIds,
  xMetric,
  yMetric,
  caseKey = "__all__",
  width = 640,
  height = 360,
}: Props) {
  const pts = useMemo<Pt[]>(() => {
    const out: Pt[] = [];
    for (let si = 0; si < orderedStudyIds.length; si++) {
      const anaId = orderedStudyIds[si];
      const s = summaries?.[anaId];
      if (!s) continue;

      const policies = Array.isArray(s?.policies) ? (s.policies as string[]).map(String) : [];
      for (const p of policies) {
        const x = caseKey === "__all__"
          ? aggAcrossCases(s, xMetric, p).mean
          : valueAtCase(s, xMetric, p, String(caseKey)).mean;

        const y = caseKey === "__all__"
          ? aggAcrossCases(s, yMetric, p).mean
          : valueAtCase(s, yMetric, p, String(caseKey)).mean;

        if (x !== null && y !== null) {
          out.push({ anaId, policy: p, x, y, studyIndex: si });
        }
      }
    }
    return out;
  }, [summaries, orderedStudyIds, xMetric, yMetric, caseKey]);
  const anchorSummary = orderedStudyIds.length ? summaries?.[orderedStudyIds[0]] : null;
  const xDir = metricDirection(anchorSummary, xMetric);
  const yDir = metricDirection(anchorSummary, yMetric);

  const labelPts = useMemo(() => {
    return pts.length <= 14 ? pts : [];
  }, [pts]);

  const legendStudies = useMemo(() => {
    return orderedStudyIds.map((id) => ({ id, label: studyDisplayLabel(summaries?.[id], id) }));
  }, [orderedStudyIds, summaries]);

  const xExt = extent(pts.map((p) => p.x));
  const yExt = extent(pts.map((p) => p.y));
  if (!xExt || !yExt) {
    return (
      <div className="small" style={{ opacity: 0.8 }}>
        No numeric scatter points for <b>{xMetric}</b> vs <b>{yMetric}</b>.
      </div>
    );
  }

  const margin = { l: 68, r: 24, t: 46, b: 92 };
  const W = width;
  const H = height;
  const innerW = W - margin.l - margin.r;
  const innerH = H - margin.t - margin.b;

  const rawXSpan = xExt.max - xExt.min;
  const rawYSpan = yExt.max - yExt.min;
  const xPad = rawXSpan === 0 ? Math.max(1, Math.abs(xExt.max) * 0.1 || 1) : rawXSpan * 0.08;
  const yPad = rawYSpan === 0 ? Math.max(1, Math.abs(yExt.max) * 0.1 || 1) : rawYSpan * 0.08;
  const xMin = xExt.min - xPad;
  const xMax = xExt.max + xPad;
  const yMin = yExt.min - yPad;
  const yMax = yExt.max + yPad;

  const sx = (x: number) => margin.l + ((x - xMin) / (xMax - xMin || 1)) * innerW;
  const sy = (y: number) => margin.t + (1 - (y - yMin) / (yMax - yMin || 1)) * innerH;

  const xTicks = niceTicks(xMin, xMax, 5);
  const yTicks = niceTicks(yMin, yMax, 5);
  // Dynamic tick precision to avoid duplicate labels when ranges are tight.
  const xTickDigits = tickDigitsFromTicks(xTicks, 3);
  const yTickDigits = tickDigitsFromTicks(yTicks, 3);

  // Study legend (shape mapping), wrapped + centered.

  const legendRows = layoutLegendRows(
    legendStudies.map((it, si) => ({ key: it.id, label: it.label, si })),
    innerW,
    { rowsMax: 2, gap: 18, itemWidth: (it) => Math.max(180, Math.min(420, 22 + 7.2 * Math.min(56, String((it as any).label ?? it.key).length) + 22)) }
  );

  const axisY = margin.t + innerH;
  const xLabelY = axisY + 48;
  const legendBaseY = H - 18;
  const legendRowDy = 22;

  return (
    <div>
      <div className="small" style={{ marginBottom: 8 }}>
        <b>{title}</b>{" "}
        <span style={{ opacity: 0.75 }}>
          · x=<b>{xMetric}</b> ({xDir === "min" ? "lower better" : "higher better"}){" "}
          · y=<b>{yMetric}</b> ({yDir === "min" ? "lower better" : "higher better"}){" "}
          · better region=<b>{betterCorner(xDir, yDir)}</b>{" "}
          · case={caseKey === "__all__" ? "mean over cases" : caseKey}
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

          {/* Axes */}
          <line x1={margin.l} y1={margin.t} x2={margin.l} y2={margin.t + innerH} stroke="rgba(0,0,0,0.55)" />
          <line x1={margin.l} y1={margin.t + innerH} x2={margin.l + innerW} y2={margin.t + innerH} stroke="rgba(0,0,0,0.55)" />

          {/* Grid + Y ticks */}
          {yTicks.map((tv, i) => {
            const y = sy(tv);
            return (
              <g key={`yt${i}`}>
                <line x1={margin.l} y1={y} x2={margin.l + innerW} y2={y} stroke="rgba(0,0,0,0.08)" />
                <text x={margin.l - 10} y={y + 4} fontSize="12" textAnchor="end" fill="rgba(0,0,0,0.72)">
                  {fmt(tv, yTickDigits)}
                </text>
              </g>
            );
          })}

          {/* X ticks + vertical grid (paper-style) */}
          {xTicks.map((tv, i) => {
            const x = sx(tv);
            const y0 = margin.t + innerH;
            return (
              <g key={`xt${i}`}>
                {/* light vertical grid */}
                <line x1={x} y1={margin.t} x2={x} y2={y0} stroke="rgba(0,0,0,0.06)" />
                {/* tick mark */}
                <line x1={x} y1={y0} x2={x} y2={y0 + 6} stroke="rgba(0,0,0,0.55)" />
                {/* tick label */}
                <text x={x} y={y0 + 22} fontSize="12" textAnchor="middle" fill="rgba(0,0,0,0.78)">
                  {fmt(tv, xTickDigits)}
                </text>
              </g>
            );
          })}

          {/* Labels */}
          <text x={margin.l + innerW / 2} y={xLabelY} fontSize="12" textAnchor="middle" fill="rgba(0,0,0,0.78)">
            {metricAxisLabel(xMetric)}
          </text>
          <text
            x={16}
            y={margin.t + innerH / 2}
            fontSize="12"
            textAnchor="middle"
            fill="rgba(0,0,0,0.78)"
            transform={`rotate(-90 16 ${margin.t + innerH / 2})`}
          >
            {metricAxisLabel(yMetric)}
          </text>

          {/* Points */}
          {pts.map((p, i) => {
            const x = sx(p.x);
            const y = sy(p.y);
            const shape = markerForStudy(p.studyIndex);
            const fill = "rgba(0,0,0,0.75)";
            const stroke = "rgba(0,0,0,0.35)";

            if (shape === "square") {
              return (
                <rect key={i} x={x - 4} y={y - 4} width={8} height={8} fill={fill} stroke={stroke}>
                  <title>{`${policyDisplayLabel(summaries?.[p.anaId], p.policy)} · ${studyDisplayLabel(summaries?.[p.anaId], p.anaId)} · ${xMetric}=${fmt(p.x, xTickDigits)} · ${yMetric}=${fmt(p.y, yTickDigits)}`}</title>
                </rect>
              );
            }
            if (shape === "triangle") {
              const d = `M ${x} ${y - 5} L ${x - 5} ${y + 4} L ${x + 5} ${y + 4} Z`;
              return (
                <path key={i} d={d} fill={fill} stroke={stroke}>
                  <title>{`${policyDisplayLabel(summaries?.[p.anaId], p.policy)} · ${studyDisplayLabel(summaries?.[p.anaId], p.anaId)} · ${xMetric}=${fmt(p.x, xTickDigits)} · ${yMetric}=${fmt(p.y, yTickDigits)}`}</title>
                </path>
              );
            }
            return (
              <circle key={i} cx={x} cy={y} r={4} fill={fill} stroke={stroke}>
                <title>{`${policyDisplayLabel(summaries?.[p.anaId], p.policy)} · ${studyDisplayLabel(summaries?.[p.anaId], p.anaId)} · ${xMetric}=${fmt(p.x, xTickDigits)} · ${yMetric}=${fmt(p.y, yTickDigits)}`}</title>
              </circle>
            );
          })}

          {/* Light annotation: only label all points when the scatter is small enough */}
          {labelPts.map((p, i) => {
            const x = sx(p.x);
            const y = sy(p.y);
            return (
              <text key={`t${i}`} x={x + 6} y={y - 6} fontSize="11" fill="rgba(0,0,0,0.65)">
                {policyDisplayLabel(summaries?.[p.anaId], p.policy)}
              </text>
            );
          })}

          {/* Legend: study shape mapping (wrapped + centered) */}
          <g>
            {legendRows.map((row, ri) => {
              const y = legendBaseY - (legendRows.length - 1 - ri) * legendRowDy;
              // rowTotalWidth expects items with {w} and a gap
              const tw = rowTotalWidth(row.map((r) => ({ w: r.w })), 18);
              const xStart = margin.l + Math.max(0, (innerW - tw) / 2);
              let x = xStart;
              return (
                <g key={ri}>
                  {row.map((r) => {
                    const item = r.it as any;
                    const si = item.si as number;
                    const id = r.it.key;
                    const shape = markerForStudy(si);
                    const fill = "rgba(0,0,0,0.75)";
                    const stroke = "rgba(0,0,0,0.35)";
                    const g = (
                      <g key={id} transform={`translate(${x}, ${y})`}>
                        {shape === "square" ? (
                          <rect x={0} y={-4} width={8} height={8} fill={fill} stroke={stroke} />
                        ) : shape === "triangle" ? (
                          <path d={`M 4 -5 L -1 4 L 9 4 Z`} fill={fill} stroke={stroke} />
                        ) : (
                          <circle cx={4} cy={0} r={4} fill={fill} stroke={stroke} />
                        )}
                        <text x={16} y={4} fontSize="12" fill="rgba(0,0,0,0.78)" textAnchor="start">
                          {String(item.label ?? id)}
                        </text>
                      </g>
                    );
                    x += r.w + 18;
                    return g;
                  })}
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      <div className="small" style={{ marginTop: 8, opacity: 0.75 }}>
        Evidence: <b>summary.json.case_policy_stats_by_metric</b> → (case mean) → scatter.{" "}
        Better region: <b>{betterCorner(xDir, yDir)}</b>.{" "}
        (Overlays multiple studies; marker shape indicates study.)
      </div>
    </div>
  );
}
