#!/usr/bin/env python3
"""
Package AWSRT v0.6 distance-window results.

This script reads extracted analysis-study summaries produced by:

    src/extract_analysis_study_summary.py

and writes combined evidence tables and lightweight figures for the v0.6
distance-window result.

Default inputs:
    short window: data/metrics/ana-194fc0a69b
    long window:  data/metrics/ana-efab12c047

Default output:
    results/figures/v0_6_distance_window/

The script does not rerun analyses. It only packages already-extracted CSVs.
"""

from __future__ import annotations

import argparse
from pathlib import Path
from typing import Iterable

import matplotlib.pyplot as plt
import pandas as pd


SHORT_WINDOW_DEFAULT = Path("data/metrics/ana-194fc0a69b")
LONG_WINDOW_DEFAULT = Path("data/metrics/ana-efab12c047")
OUT_DIR_DEFAULT = Path("results/figures/v0_6_distance_window")


DISTANCE_ORDER = [
    "dist_15_near",
    "dist_30_mid",
    "dist_50_far",
    "dist_60_very_far",
]

CONDITION_ORDER = [
    "healthy",
    "delay",
    "noise",
]

WINDOW_ORDER = [
    "0:150",
    "0:450",
]

STATE_COLS = {
    "exploit": "usefulness_regime_state_exploit_frac_mean",
    "recover": "usefulness_regime_state_recover_frac_mean",
    "caution": "usefulness_regime_state_caution_frac_mean",
}

CORE_COLUMNS = [
    "distance_band",
    "condition",
    "rows",
    "normalized_distance_values",
    "ttfd_count",
    "ttfd_missing_count",
    "ttfd_missing_frac",
    "ttfd_mean",
    "ttfd_median",
    "mean_entropy_auc_mean",
    "coverage_auc_mean",
    "delivered_info_proxy_mean_mean",
    "mdc_residual_mean_mean",
    "mdc_violation_rate_mean",
    "usefulness_regime_state_exploit_frac_mean",
    "usefulness_regime_state_recover_frac_mean",
    "usefulness_regime_state_caution_frac_mean",
    "dominant_usefulness_state",
]


def read_group_summary(ana_dir: Path, window_label: str, window_steps: int) -> pd.DataFrame:
    path = ana_dir / "analysis_extraction_group_summary.csv"
    if not path.exists():
        raise FileNotFoundError(f"Missing extracted group summary: {path}")

    df = pd.read_csv(path)
    df.insert(0, "window_label", window_label)
    df.insert(1, "window_steps", window_steps)
    df.insert(2, "source_ana_dir", str(ana_dir))

    if "distance_band" not in df.columns or "condition" not in df.columns:
        raise ValueError(
            f"{path} must contain distance_band and condition columns. "
            "Re-run extract_analysis_study_summary.py with --preset distance_band_v0_6_03."
        )

    return df


def first_existing(df: pd.DataFrame, candidates: Iterable[str]) -> str | None:
    for col in candidates:
        if col in df.columns:
            return col
    return None


def normalize_distance_column(df: pd.DataFrame) -> pd.DataFrame:
    """Create normalized_distance if possible.

    The extractor currently writes normalized_distance_values in group summaries.
    This helper keeps the packaging script robust if a later extractor writes
    normalized_distance directly.
    """
    out = df.copy()

    if "normalized_distance" in out.columns:
        out["normalized_distance"] = pd.to_numeric(out["normalized_distance"], errors="coerce")
        return out

    if "normalized_distance_values" in out.columns:
        out["normalized_distance"] = pd.to_numeric(out["normalized_distance_values"], errors="coerce")
    else:
        out["normalized_distance"] = pd.NA

    return out


def add_ordering(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()
    out["distance_order"] = out["distance_band"].map({v: i for i, v in enumerate(DISTANCE_ORDER)})
    out["condition_order"] = out["condition"].map({v: i for i, v in enumerate(CONDITION_ORDER)})
    out["window_order"] = out["window_label"].map({v: i for i, v in enumerate(WINDOW_ORDER)})
    return out.sort_values(["window_order", "distance_order", "condition_order"]).reset_index(drop=True)


def build_ttfd_availability(df: pd.DataFrame) -> pd.DataFrame:
    cols = [
        "window_label",
        "window_steps",
        "distance_band",
        "normalized_distance",
        "condition",
        "rows",
        "ttfd_count",
        "ttfd_missing_count",
        "ttfd_missing_frac",
        "ttfd_mean",
        "ttfd_median",
        "dominant_usefulness_state",
    ]
    present = [c for c in cols if c in df.columns]
    return add_ordering(df[present])


def build_dominant_state(df: pd.DataFrame) -> pd.DataFrame:
    cols = [
        "window_label",
        "window_steps",
        "distance_band",
        "normalized_distance",
        "condition",
        "dominant_usefulness_state",
        "usefulness_regime_state_exploit_frac_mean",
        "usefulness_regime_state_recover_frac_mean",
        "usefulness_regime_state_caution_frac_mean",
    ]
    present = [c for c in cols if c in df.columns]
    return add_ordering(df[present])


def build_metric_snapshot(df: pd.DataFrame) -> pd.DataFrame:
    cols = [
        "window_label",
        "window_steps",
        "distance_band",
        "normalized_distance",
        "condition",
        "ttfd_count",
        "ttfd_missing_frac",
        "ttfd_mean",
        "mean_entropy_auc_mean",
        "coverage_auc_mean",
        "delivered_info_proxy_mean_mean",
        "mdc_residual_mean_mean",
        "mdc_violation_rate_mean",
        "dominant_usefulness_state",
    ]
    present = [c for c in cols if c in df.columns]
    return add_ordering(df[present])


def make_ttfd_missingness_figure(ttfd: pd.DataFrame, out_path: Path) -> None:
    """Legacy audit figure: categorical distance-band × condition sequence.

    This is useful for quick inspection but should not be the main thesis figure,
    because the line connects different condition categories.
    """
    fig, ax = plt.subplots(figsize=(10, 6))

    x_labels = []
    for window_label, sub in ttfd.groupby("window_label", sort=False):
        y_values = []
        local_labels = []

        sub = add_ordering(sub)
        for _, row in sub.iterrows():
            local_labels.append(f"{row['distance_band']}\n{row['condition']}")
            y_values.append(row.get("ttfd_missing_frac", pd.NA))

        if len(local_labels) > len(x_labels):
            x_labels = local_labels

        ax.plot(range(len(local_labels)), y_values, marker="o", label=window_label)

    ax.set_title("AWSRT v0.6 distance-window TTFD missingness")
    ax.set_xlabel("Distance band and condition")
    ax.set_ylabel("TTFD missing fraction")
    ax.set_ylim(-0.05, 1.05)
    ax.set_xticks(range(len(x_labels)))
    ax.set_xticklabels(x_labels, rotation=45, ha="right")
    ax.legend(title="Window")
    ax.grid(True, axis="y", alpha=0.3)
    fig.tight_layout()
    fig.savefig(out_path, dpi=200)
    plt.close(fig)


def make_ttfd_missingness_by_condition_figure(ttfd: pd.DataFrame, out_path: Path) -> None:
    """Thesis-facing TTFD missingness figure.

    Uses normalized distance as the x-axis and splits panels by condition. This
    avoids implying continuity between different condition categories.
    """
    work = ttfd.copy()
    work["normalized_distance"] = pd.to_numeric(work["normalized_distance"], errors="coerce")
    work["ttfd_missing_frac"] = pd.to_numeric(work["ttfd_missing_frac"], errors="coerce")
    work = work[work["normalized_distance"].notna()].copy()
    work = add_ordering(work)

    fig, axes = plt.subplots(
        nrows=1,
        ncols=len(CONDITION_ORDER),
        figsize=(13.5, 4.4),
        sharey=True,
    )

    if len(CONDITION_ORDER) == 1:
        axes = [axes]

    for ax, condition in zip(axes, CONDITION_ORDER):
        sub_condition = work[work["condition"] == condition].copy()

        for window_label, sub_window in sub_condition.groupby("window_label", sort=False):
            sub_window = sub_window.sort_values("normalized_distance")
            ax.plot(
                sub_window["normalized_distance"],
                sub_window["ttfd_missing_frac"],
                marker="o",
                label=window_label,
            )

            # Annotate partially finite long-window very-far cases using n finite / n rows.
            for _, row in sub_window.iterrows():
                ttfd_count = row.get("ttfd_count", pd.NA)
                rows = row.get("rows", pd.NA)
                missing_frac = row.get("ttfd_missing_frac", pd.NA)
                if pd.notna(ttfd_count) and pd.notna(rows) and rows:
                    ttfd_count_i = int(ttfd_count)
                    rows_i = int(rows)
                    if 0 < ttfd_count_i < rows_i:
                        ax.annotate(
                            f"{ttfd_count_i}/{rows_i}",
                            (row["normalized_distance"], missing_frac),
                            textcoords="offset points",
                            xytext=(0, 8),
                            ha="center",
                            fontsize=8,
                        )

        ax.set_title(condition)
        ax.set_xlabel("Normalized ignition-to-base distance")
        ax.set_ylim(-0.05, 1.05)
        ax.grid(True, axis="y", alpha=0.3)

    axes[0].set_ylabel("TTFD missing fraction")
    axes[-1].legend(title="Window", loc="best")
    fig.suptitle("AWSRT v0.6 TTFD missingness by condition and distance")
    fig.tight_layout()
    fig.savefig(out_path, dpi=200)
    plt.close(fig)


def make_ttfd_mean_figure(ttfd: pd.DataFrame, out_path: Path) -> None:
    """Legacy audit figure: finite TTFD means over categorical sequence."""
    finite = ttfd.copy()
    finite["ttfd_mean"] = pd.to_numeric(finite.get("ttfd_mean"), errors="coerce")
    finite = finite[finite["ttfd_mean"].notna()].copy()

    fig, ax = plt.subplots(figsize=(10, 6))

    x_labels = []
    for window_label, sub in finite.groupby("window_label", sort=False):
        sub = add_ordering(sub)
        local_labels = [f"{r.distance_band}\n{r.condition}" for r in sub.itertuples()]
        y_values = sub["ttfd_mean"].tolist()

        if len(local_labels) > len(x_labels):
            x_labels = local_labels

        ax.plot(range(len(local_labels)), y_values, marker="o", label=window_label)

    ax.set_title("AWSRT v0.6 finite TTFD means")
    ax.set_xlabel("Distance band and condition")
    ax.set_ylabel("Mean TTFD among finite detections")
    ax.set_xticks(range(len(x_labels)))
    ax.set_xticklabels(x_labels, rotation=45, ha="right")
    ax.legend(title="Window")
    ax.grid(True, axis="y", alpha=0.3)
    fig.tight_layout()
    fig.savefig(out_path, dpi=200)
    plt.close(fig)


def make_dominant_state_figure(states: pd.DataFrame, out_path: Path) -> None:
    table_df = states[
        [
            "window_label",
            "distance_band",
            "condition",
            "dominant_usefulness_state",
        ]
    ].copy()
    table_df = add_ordering(table_df)

    # Keep the table compact by using one row per window × distance band and one column per condition.
    pivot = table_df.pivot_table(
        index=["window_label", "distance_band"],
        columns="condition",
        values="dominant_usefulness_state",
        aggfunc="first",
    )
    pivot = pivot.reindex(
        pd.MultiIndex.from_product([WINDOW_ORDER, DISTANCE_ORDER], names=["window_label", "distance_band"])
    )
    pivot = pivot.reindex(columns=CONDITION_ORDER)
    pivot = pivot.reset_index()

    display = pivot.fillna("")

    fig, ax = plt.subplots(figsize=(9, 4.8))
    ax.axis("off")
    ax.set_title("AWSRT v0.6 dominant usefulness state by window, distance, and condition")

    table = ax.table(
        cellText=display.values,
        colLabels=display.columns,
        loc="center",
        cellLoc="center",
    )
    table.auto_set_font_size(False)
    table.set_fontsize(8)
    table.scale(1.0, 1.3)

    fig.tight_layout()
    fig.savefig(out_path, dpi=200)
    plt.close(fig)


def format_float(value: object, digits: int = 3) -> str:
    try:
        val = float(value)
    except (TypeError, ValueError):
        return ""
    if pd.isna(val):
        return "NaN"
    return f"{val:.{digits}f}"


def markdown_table(df: pd.DataFrame, columns: list[str], max_rows: int | None = None) -> str:
    work = df.copy()
    if max_rows is not None:
        work = work.head(max_rows)

    present = [c for c in columns if c in work.columns]
    if not present:
        return "_No requested columns available._"

    lines = []
    lines.append("| " + " | ".join(present) + " |")
    lines.append("| " + " | ".join(["---"] * len(present)) + " |")

    for _, row in work[present].iterrows():
        values = []
        for col in present:
            val = row[col]
            if isinstance(val, float):
                values.append(format_float(val, 3))
            else:
                values.append(str(val))
        lines.append("| " + " | ".join(values) + " |")

    return "\n".join(lines)


def write_interpretation(
    out_path: Path,
    short_dir: Path,
    long_dir: Path,
    ttfd: pd.DataFrame,
    states: pd.DataFrame,
    snapshot: pd.DataFrame,
) -> None:
    ttfd_cols = [
        "window_label",
        "distance_band",
        "condition",
        "ttfd_count",
        "ttfd_missing_frac",
        "ttfd_mean",
        "dominant_usefulness_state",
    ]

    state_cols = [
        "window_label",
        "distance_band",
        "condition",
        "dominant_usefulness_state",
        "usefulness_regime_state_exploit_frac_mean",
        "usefulness_regime_state_recover_frac_mean",
        "usefulness_regime_state_caution_frac_mean",
    ]

    content = f"""# AWSRT v0.6 Distance-Window Result Packaging

## Inputs

- Short-window corrected analysis: `{short_dir}`
- Long-window analysis: `{long_dir}`

## Packaged result

This package combines the corrected `0:150` distance-band result with the `0:450` longer-window result.

The central interpretation is:

> Extending the window from 150 to 450 steps converted some far-distance TTFD failures into late detections, showing that short-window missingness was partly horizon-limited. However, the compact usefulness triad remained stable, and noise-side cases continued to resist finite TTFD at far distances.

## TTFD availability summary

{markdown_table(ttfd, ttfd_cols)}

## Dominant usefulness state summary

{markdown_table(states, state_cols)}

## AUC/window-length caution

The two packaged analyses use different execution windows. AUC-style metrics such as `mean_entropy_auc` and `coverage_auc` should not be compared as absolute cross-window improvement/degradation unless their normalization is confirmed.

Safer cross-window claims:

- finite TTFD availability changed with window length;
- far healthy and delay cases gained late finite detections;
- far and very-far noise cases remained TTFD-missing;
- the compact usefulness triad remained condition-readable.

## Generated files

- `v0_6_distance_window_ttfd_availability.csv`
- `v0_6_distance_window_dominant_state.csv`
- `v0_6_distance_window_metric_snapshot.csv`
- `figure_v0_6_distance_window_ttfd_missingness.png`
- `figure_v0_6_distance_window_ttfd_missingness_by_condition.png`
- `figure_v0_6_distance_window_ttfd_mean.png`
- `figure_v0_6_distance_window_dominant_state.png`

## Figure guidance

The condition-wise missingness figure is the preferred thesis-facing TTFD figure because it uses normalized distance as the x-axis and separates healthy, delay, and noise panels. The categorical missingness and TTFD-mean figures are retained as audit views.
"""

    out_path.write_text(content, encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Package AWSRT v0.6 short/long distance-window extracted summaries."
    )
    parser.add_argument(
        "--short-dir",
        type=Path,
        default=SHORT_WINDOW_DEFAULT,
        help=f"Short-window analysis directory. Default: {SHORT_WINDOW_DEFAULT}",
    )
    parser.add_argument(
        "--long-dir",
        type=Path,
        default=LONG_WINDOW_DEFAULT,
        help=f"Long-window analysis directory. Default: {LONG_WINDOW_DEFAULT}",
    )
    parser.add_argument(
        "--out-dir",
        type=Path,
        default=OUT_DIR_DEFAULT,
        help=f"Output directory. Default: {OUT_DIR_DEFAULT}",
    )
    parser.add_argument(
        "--short-label",
        default="0:150",
        help="Label for the short-window analysis.",
    )
    parser.add_argument(
        "--long-label",
        default="0:450",
        help="Label for the long-window analysis.",
    )
    parser.add_argument(
        "--short-steps",
        type=int,
        default=150,
        help="Number of steps in the short-window analysis.",
    )
    parser.add_argument(
        "--long-steps",
        type=int,
        default=450,
        help="Number of steps in the long-window analysis.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    args.out_dir.mkdir(parents=True, exist_ok=True)

    short_df = read_group_summary(args.short_dir, args.short_label, args.short_steps)
    long_df = read_group_summary(args.long_dir, args.long_label, args.long_steps)

    combined = pd.concat([short_df, long_df], ignore_index=True, sort=False)
    combined = normalize_distance_column(combined)
    combined = add_ordering(combined)

    ttfd = build_ttfd_availability(combined)
    states = build_dominant_state(combined)
    snapshot = build_metric_snapshot(combined)

    ttfd_path = args.out_dir / "v0_6_distance_window_ttfd_availability.csv"
    states_path = args.out_dir / "v0_6_distance_window_dominant_state.csv"
    snapshot_path = args.out_dir / "v0_6_distance_window_metric_snapshot.csv"
    md_path = args.out_dir / "v0_6_distance_window_interpretation.md"

    ttfd.to_csv(ttfd_path, index=False)
    states.to_csv(states_path, index=False)
    snapshot.to_csv(snapshot_path, index=False)

    figure_ttfd_missingness = args.out_dir / "figure_v0_6_distance_window_ttfd_missingness.png"
    figure_ttfd_missingness_by_condition = (
        args.out_dir / "figure_v0_6_distance_window_ttfd_missingness_by_condition.png"
    )
    figure_ttfd_mean = args.out_dir / "figure_v0_6_distance_window_ttfd_mean.png"
    figure_dominant_state = args.out_dir / "figure_v0_6_distance_window_dominant_state.png"

    make_ttfd_missingness_figure(ttfd, figure_ttfd_missingness)
    make_ttfd_missingness_by_condition_figure(ttfd, figure_ttfd_missingness_by_condition)
    make_ttfd_mean_figure(ttfd, figure_ttfd_mean)
    make_dominant_state_figure(states, figure_dominant_state)

    write_interpretation(md_path, args.short_dir, args.long_dir, ttfd, states, snapshot)

    print("Distance-window packaging complete.")
    print(f"Short input: {args.short_dir}")
    print(f"Long input:  {args.long_dir}")
    print(f"Output dir:  {args.out_dir}")
    print()
    print("Wrote:")
    for path in [
        ttfd_path,
        states_path,
        snapshot_path,
        md_path,
        figure_ttfd_missingness,
        figure_ttfd_missingness_by_condition,
        figure_ttfd_mean,
        figure_dominant_state,
    ]:
        print(f"  - {path}")


if __name__ == "__main__":
    main()
