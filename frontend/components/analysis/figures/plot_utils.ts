// frontend/components/analysis/figures/plot_utils.ts
export type Direction = "min" | "max";
export type ErrorMode = "stderr" | "std" | "none";
export type XYPoint = { x: number; y: number | null };

export type LegendItem<T = any> = { key: string; data: T; w?: number };

export function clamp01(x: number): number {
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(1, x));
}

export function toNumberOrNull(x: any): number | null {
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}

export function fmt(x: any, digits = 4): string {
  const n = toNumberOrNull(x);
  if (n === null) return "—";
  if (Math.abs(n - Math.round(n)) < 1e-12) return String(Math.round(n));
  return n.toFixed(digits).replace(/0+$/, "").replace(/\.$/, "");
}

export function directionForMetric(summary: any, metric: string): Direction {
  const m = String(metric || "").trim();
  const d = String(summary?.metrics_catalog?.direction?.[m] ?? "").toLowerCase().trim();
  if (d === "min" || d === "max") return d as Direction;

  // Fallback heuristic (should be rare if Phase C packaging is present).
  const ml = m.toLowerCase();

  if (ml === "ttfd") return "min";
  if (ml.includes("time") || ml.includes("latency")) return "min";
  if (ml.includes("entropy")) return "min";
  if (ml.includes("violation") || ml.includes("error") || ml.includes("loss")) return "min";
  if (ml.includes("exposure")) return "min";
  if (ml.includes("transition_count")) return "min";
  if (ml.includes("residual") && (ml.includes("mean") || ml.includes("pos_frac"))) return "min";
  if (ml.includes("auc") || ml.includes("coverage") || ml.includes("info")) return "max";
  if (ml.includes("in_band")) return "max";
  if (ml.includes("utilization") || ml.includes("drift_proxy") || ml.includes("local_drift_rate")) return "max";
  return "max";
}

export function caseOrderAndLabels(summary: any): Array<{ key: string; label: string; level: number }> {
  // Your sample summary includes `sweep: [{label, overrides}, ...]` which is perfect.
  const sweep = Array.isArray(summary?.sweep) ? summary.sweep : [];
  if (sweep.length) {
    return sweep.map((s: any, idx: number) => ({
      key: String(s?.label ?? `case_${idx}`),
      label: String(s?.label ?? `case_${idx}`),
      level: idx,
    }));
  }

  // Fallback: sort the observed case keys.
  const byMetric = summary?.case_policy_stats_by_metric ?? {};
  const metrics = Object.keys(byMetric || {});
  const firstMetric = metrics[0];
  const casesObj = firstMetric ? byMetric?.[firstMetric] : null;
  const keys = casesObj && typeof casesObj === "object" ? Object.keys(casesObj) : [];
  return keys.sort().map((k, i) => ({ key: k, label: k, level: i }));
}

export function stderrFromStd(std: number, n: number): number {
  if (!Number.isFinite(std) || !Number.isFinite(n) || n <= 0) return NaN;
  return std / Math.sqrt(n);
}

export function niceTicks(minV: number, maxV: number, count = 5): number[] {
  if (!Number.isFinite(minV) || !Number.isFinite(maxV)) return [];
  if (Math.abs(maxV - minV) < 1e-12) return [minV];

  // Simple linear ticks. Good enough for paper plots and avoids heavy deps.
  const span = maxV - minV;
  const step = span / (count - 1);
  const out: number[] = [];
  for (let i = 0; i < count; i++) out.push(minV + i * step);
  return out;
}

// Choose a safe number of digits for tick labels given tick spacing.
// Prevents duplicated labels when the tick step is smaller than fmt(..., digits).
export function tickDigitsFromTicks(ticks: number[], fallback = 3): number {
  if (!Array.isArray(ticks) || ticks.length < 2) return fallback;
  const step = Math.abs(ticks[1] - ticks[0]);
  if (!Number.isFinite(step) || step <= 0) return fallback;

  // Example: step=0.01 -> 3; step=0.0002 -> 5 (enough to distinguish adjacent ticks).
  const raw = Math.ceil(-Math.log10(step)) + 1;
  const digits = Math.max(2, raw);
  return Math.min(6, digits);
}

export function fmtTick(x: any, ticks: number[], fallback = 3): string {
  return fmt(x, tickDigitsFromTicks(ticks, fallback));
}

export function segmentedLinePath(
  pts: XYPoint[],
  sx: (x: number) => number,
  sy: (y: number) => number
): string[] {
  const paths: string[] = [];
  let cur: string[] = [];

  for (const pt of pts) {
    if (pt.y === null || !Number.isFinite(pt.y)) {
      if (cur.length) {
        paths.push(cur.join(" "));
        cur = [];
      }
      continue;
    }

    const x = sx(pt.x);
    const y = sy(pt.y);
    cur.push(`${cur.length === 0 ? "M" : "L"} ${x} ${y}`);
  }

  if (cur.length) {
    paths.push(cur.join(" "));
  }

  return paths;
}

// -------- Legend layout helpers (wrap + center) --------
export function rowTotalWidth(row: Array<{ w: number }>, gap = 18): number {
  if (!row.length) return 0;
  return row.reduce((acc, it) => acc + (it.w || 0), 0) + gap * (row.length - 1);
}

export function defaultLegendItemWidth(label: string): number {
  // Heuristic: sample line + marker + padding + text width approximation.
  // Keep conservative to avoid collisions (SVG text measurement is painful).
  const base = 34 /* line */ + 10 + 6 /* padding */ + 7.2 * Math.min(28, String(label).length);
  return Math.max(140, Math.min(260, base));
}

export function layoutLegendRows<T extends { key: string; label?: string }>(
  items: T[],
  maxW: number,
  opts?: {
    gap?: number;
    rowsMax?: number;
    itemWidth?: (it: T) => number;
  }
): Array<Array<{ it: T; w: number }>> {
  const gap = opts?.gap ?? 18;
  const rowsMax = opts?.rowsMax ?? 2;
  const itemWidth = opts?.itemWidth ?? ((it: T) => defaultLegendItemWidth(String((it as any).label ?? it.key)));

  const rows: Array<Array<{ it: T; w: number }>> = [];
  let row: Array<{ it: T; w: number }> = [];
  let rowW = 0;

  for (const it of items) {
    const w = itemWidth(it);
    const g = row.length ? gap : 0;
    if (row.length && rowW + g + w > maxW) {
      rows.push(row);
      row = [{ it, w }];
      rowW = w;
      if (rows.length >= rowsMax) break;
    } else {
      row.push({ it, w });
      rowW += g + w;
    }
  }
  if (row.length && rows.length < rowsMax) rows.push(row);
  return rows;
}

export function policyDisplayLabel(summary: any, policy: string): string {
  const labels = (summary?.study_semantics?.policy_semantics?.policy_labels ??
    summary?.policy_labels ??
    {}) as Record<string, any>;
  const explicit = String(labels?.[policy] ?? "").trim();
  if (explicit) return explicit;
  return policy;
}

export function policyLegendItemWidth(summary: any, policy: string): number {
  const label = policyDisplayLabel(summary, policy);
  const base = 54 + 7.2 * Math.min(36, label.length);
  return Math.max(120, Math.min(340, base));
}

// -------- Metric axis labeling helpers --------
export function metricUnits(metric: string): string {
  const m = String(metric || "").trim().toLowerCase();
  // Keep conservative: only label units when we're reasonably confident.
  // Adjust terminology to match paper (slots vs steps, etc.).
  if (m === "ttfd") return "steps";
  if (m.includes("time_to") || m.includes("latency")) return "steps";
  if (m.includes("violation_rate")) return "fraction";
  if (m.includes("coverage_auc")) return "AUC";
  if (m.includes("entropy_auc") || m.includes("mean_entropy_auc")) return "bits·steps";
  if (m.includes("delivered_info_proxy")) return "bits";
  return "";
}

export function metricAxisLabel(metric: string): string {
  const u = metricUnits(metric);
  return u ? `${metric} (${u})` : metric;
}

export function extent(values: Array<number | null | undefined>): { min: number; max: number } | null {
  const xs = values.filter((v) => typeof v === "number" && Number.isFinite(v)) as number[];
  if (!xs.length) return null;
  return { min: Math.min(...xs), max: Math.max(...xs) };
}