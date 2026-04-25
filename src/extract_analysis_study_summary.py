#!/usr/bin/env python3
"""
General AWSRT analysis-study extraction utility.

Reads standard AWSRT analysis outputs:

    data/metrics/ana-*/summary.json
    data/metrics/ana-*/table.csv

and writes compact, auditable extraction artifacts into the main analysis
directory.

Typical usage:

    python src/extract_analysis_study_summary.py data/metrics/ana-194fc0a69b

With repair replacement:

    python src/extract_analysis_study_summary.py \
      data/metrics/ana-194fc0a69b \
      --repair data/metrics/ana-5c07ad299a \
      --replace-case dist_15_near__noise \
      --replace-case dist_60_very_far__delay \
      --preset distance_band_v0_6_03 \
      --expected-rows-per-case 5

Outputs, by default under the main analysis directory:

    analysis_extraction_columns.txt
    analysis_extraction_integrity.json
    analysis_extraction_corrected_rows.csv
    analysis_extraction_case_summary.csv
    analysis_extraction_group_summary.csv
    analysis_extraction_interpretation.md
"""

from __future__ import annotations

import argparse
import json
import math
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import pandas as pd


OUTPUT_PREFIX = "analysis_extraction"


KEY_COLUMNS = [
    # identity / grouping
    "case",
    "seed",
    "policy",
    "opr_id",
    "phy_id",
    "base_station_rc",
    "deployment_mode",
    "n_sensors",
    "tie_breaking",
    "network_tie_breaking",
    "case_family",
    "case_kind",

    # impairments
    "delay_steps",
    "loss_prob",
    "noise_level",

    # headline
    "ttfd",
    "ttfd_true",
    "ttfd_arrived",
    "mean_entropy_auc",
    "coverage_auc",

    # movement / observation
    "movement_total_mean_l1",
    "moves_per_step_mean",
    "moved_frac_mean",
    "arrivals_frac_mean",
    "detections_arrived_frac_mean",
    "obs_age_mean_valid",
    "obs_age_max_valid",

    # information / MDC
    "driver_info_true_mean",
    "delivered_info_proxy_mean",
    "mdc_residual_mean",
    "mdc_residual_pos_frac",
    "mdc_violation_rate",
    "residual_info_mean",
    "residual_info_pos_frac",

    # usefulness occupancy
    "usefulness_regime_state_exploit_frac",
    "usefulness_regime_state_recover_frac",
    "usefulness_regime_state_caution_frac",

    # usefulness triggers
    "usefulness_trigger_recover_hits",
    "usefulness_trigger_caution_hits",
    "usefulness_trigger_recover_from_caution_hits",
    "usefulness_trigger_exploit_hits",
]


CASE_SUMMARY_METRICS = [
    "ttfd",
    "ttfd_true",
    "ttfd_arrived",
    "mean_entropy_auc",
    "coverage_auc",
    "delivered_info_proxy_mean",
    "mdc_residual_mean",
    "mdc_residual_pos_frac",
    "mdc_violation_rate",
    "arrivals_frac_mean",
    "detections_arrived_frac_mean",
    "obs_age_mean_valid",
    "obs_age_max_valid",
    "movement_total_mean_l1",
    "moves_per_step_mean",
    "moved_frac_mean",
    "usefulness_regime_state_exploit_frac",
    "usefulness_regime_state_recover_frac",
    "usefulness_regime_state_caution_frac",
    "usefulness_trigger_recover_hits",
    "usefulness_trigger_caution_hits",
    "usefulness_trigger_recover_from_caution_hits",
    "usefulness_trigger_exploit_hits",
]


USEFULNESS_STATE_COLS = {
    "exploit": "usefulness_regime_state_exploit_frac",
    "recover": "usefulness_regime_state_recover_frac",
    "caution": "usefulness_regime_state_caution_frac",
}


DISTANCE_BAND_V0_6_03 = {
    "dist_15_near": {
        "distance_base_station_rc_expected": "(585, 640)",
        "raw_distance_cells": 271.53,
        "normalized_distance": 0.150,
    },
    "dist_30_mid": {
        "distance_base_station_rc_expected": "(777, 832)",
        "raw_distance_cells": 543.06,
        "normalized_distance": 0.300,
    },
    "dist_50_far": {
        "distance_base_station_rc_expected": "(1033, 1088)",
        "raw_distance_cells": 905.10,
        "normalized_distance": 0.500,
    },
    "dist_60_very_far": {
        "distance_base_station_rc_expected": "(1080, 1320)",
        "raw_distance_cells": 1110.11,
        "normalized_distance": 0.614,
    },
}


EXPECTED_OVERRIDES_DISTANCE_BAND_V0_6_03 = {
    "dist_15_near__healthy": {
        "base_station_rc": "(585, 640)",
        "delay_steps": 0,
        "loss_prob": 0.0,
        "noise_level": 0.0,
    },
    "dist_15_near__delay": {
        "base_station_rc": "(585, 640)",
        "delay_steps": 4,
        "loss_prob": 0.0,
        "noise_level": 0.0,
    },
    "dist_15_near__noise": {
        "base_station_rc": "(585, 640)",
        "delay_steps": 0,
        "loss_prob": 0.0,
        "noise_level": 0.2,
    },
    "dist_30_mid__healthy": {
        "base_station_rc": "(777, 832)",
        "delay_steps": 0,
        "loss_prob": 0.0,
        "noise_level": 0.0,
    },
    "dist_30_mid__delay": {
        "base_station_rc": "(777, 832)",
        "delay_steps": 4,
        "loss_prob": 0.0,
        "noise_level": 0.0,
    },
    "dist_30_mid__noise": {
        "base_station_rc": "(777, 832)",
        "delay_steps": 0,
        "loss_prob": 0.0,
        "noise_level": 0.2,
    },
    "dist_50_far__healthy": {
        "base_station_rc": "(1033, 1088)",
        "delay_steps": 0,
        "loss_prob": 0.0,
        "noise_level": 0.0,
    },
    "dist_50_far__delay": {
        "base_station_rc": "(1033, 1088)",
        "delay_steps": 4,
        "loss_prob": 0.0,
        "noise_level": 0.0,
    },
    "dist_50_far__noise": {
        "base_station_rc": "(1033, 1088)",
        "delay_steps": 0,
        "loss_prob": 0.0,
        "noise_level": 0.2,
    },
    "dist_60_very_far__healthy": {
        "base_station_rc": "(1080, 1320)",
        "delay_steps": 0,
        "loss_prob": 0.0,
        "noise_level": 0.0,
    },
    "dist_60_very_far__delay": {
        "base_station_rc": "(1080, 1320)",
        "delay_steps": 4,
        "loss_prob": 0.0,
        "noise_level": 0.0,
    },
    "dist_60_very_far__noise": {
        "base_station_rc": "(1080, 1320)",
        "delay_steps": 0,
        "loss_prob": 0.0,
        "noise_level": 0.2,
    },
}


@dataclass
class LoadedStudy:
    ana_dir: Path
    summary: dict[str, Any]
    table: pd.DataFrame
    ana_id: str


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Extract compact, auditable summaries from AWSRT analysis outputs."
    )
    parser.add_argument(
        "main_ana_dir",
        type=Path,
        help="Main analysis directory, e.g. data/metrics/ana-194fc0a69b",
    )
    parser.add_argument(
        "--repair",
        action="append",
        type=Path,
        default=[],
        help=(
            "Optional repair analysis directory. Can be repeated. "
            "Requires at least one --replace-case unless --append-repair is used."
        ),
    )
    parser.add_argument(
        "--replace-case",
        action="append",
        default=[],
        help="Case label to remove from the main table and replace with matching repair rows.",
    )
    parser.add_argument(
        "--append-repair",
        action="store_true",
        help=(
            "Append all repair rows rather than replacing named cases. "
            "Use cautiously; replacement is preferred for patched matrices."
        ),
    )
    parser.add_argument(
        "--preset",
        choices=["distance_band_v0_6_03"],
        default=None,
        help="Optional known metadata/validation preset.",
    )
    parser.add_argument(
        "--expected-rows-per-case",
        type=int,
        default=None,
        help="Optional expected number of rows per case.",
    )
    parser.add_argument(
        "--out-dir",
        type=Path,
        default=None,
        help="Optional output directory. Defaults to the main analysis directory.",
    )
    parser.add_argument(
        "--prefix",
        default=OUTPUT_PREFIX,
        help=f"Output file prefix. Default: {OUTPUT_PREFIX}",
    )
    return parser.parse_args()


def load_json(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def load_summary(ana_dir: Path) -> dict[str, Any]:
    path = ana_dir / "summary.json"
    if not path.exists():
        raise FileNotFoundError(f"Missing summary.json: {path}")
    return load_json(path)


def load_table(ana_dir: Path) -> pd.DataFrame:
    path = ana_dir / "table.csv"
    if not path.exists():
        raise FileNotFoundError(f"Missing table.csv: {path}")
    return pd.read_csv(path)


def get_ana_id(summary: dict[str, Any], ana_dir: Path) -> str:
    ana_id = summary.get("ana_id")
    if isinstance(ana_id, str) and ana_id:
        return ana_id
    return ana_dir.name


def load_study(ana_dir: Path) -> LoadedStudy:
    ana_dir = ana_dir.expanduser().resolve()
    if not ana_dir.exists():
        raise FileNotFoundError(f"Analysis directory does not exist: {ana_dir}")
    summary = load_summary(ana_dir)
    table = load_table(ana_dir)
    ana_id = get_ana_id(summary, ana_dir)
    return LoadedStudy(ana_dir=ana_dir, summary=summary, table=table, ana_id=ana_id)


def ensure_case_column(df: pd.DataFrame) -> None:
    if "case" not in df.columns:
        raise ValueError("Expected a 'case' column in table.csv; cannot group analysis rows.")


def normalize_base_station_rc_value(value: Any) -> str:
    """Normalize base_station_rc values for comparison.

    The table currently tends to emit strings like '(585, 640)'.
    This also handles list/tuple values if future extraction emits them.
    """
    if pd.isna(value):
        return ""
    if isinstance(value, (list, tuple)) and len(value) == 2:
        return f"({int(value[0])}, {int(value[1])})"
    text = str(value).strip()
    # Normalize '[585, 640]' to '(585, 640)' if encountered.
    m = re.match(r"^\[\s*(-?\d+)\s*,\s*(-?\d+)\s*\]$", text)
    if m:
        return f"({int(m.group(1))}, {int(m.group(2))})"
    return text


def values_equal(observed: Any, expected: Any, *, tol: float = 1e-9) -> bool:
    if isinstance(expected, str):
        return normalize_base_station_rc_value(observed) == expected

    if pd.isna(observed):
        return False

    try:
        obs_float = float(observed)
        exp_float = float(expected)
        return math.isclose(obs_float, exp_float, rel_tol=tol, abs_tol=tol)
    except (TypeError, ValueError):
        return str(observed) == str(expected)


def add_source_columns(df: pd.DataFrame, ana_id: str, ana_dir: Path, repair_row: bool) -> pd.DataFrame:
    out = df.copy()
    out["source_ana_id"] = ana_id
    out["source_ana_dir"] = str(ana_dir)
    out["repair_row"] = bool(repair_row)
    return out


def apply_repairs(
    main: LoadedStudy,
    repairs: list[LoadedStudy],
    replace_cases: list[str],
    append_repair: bool,
) -> tuple[pd.DataFrame, dict[str, Any]]:
    ensure_case_column(main.table)

    main_df = add_source_columns(main.table, main.ana_id, main.ana_dir, repair_row=False)

    repair_rows_loaded = 0
    repair_ana_ids: list[str] = []
    warnings: list[str] = []

    if repairs and not replace_cases and not append_repair:
        raise ValueError(
            "--repair was supplied without --replace-case. "
            "Use --replace-case for patched matrices or --append-repair to append all repair rows."
        )

    if not repairs:
        return main_df, {
            "main_rows_loaded": int(len(main_df)),
            "repair_rows_loaded": 0,
            "repair_ana_ids": [],
            "replace_cases": [],
            "append_repair": False,
            "warnings": [],
        }

    repair_frames: list[pd.DataFrame] = []
    for repair in repairs:
        ensure_case_column(repair.table)
        repair_ana_ids.append(repair.ana_id)
        repair_df = add_source_columns(repair.table, repair.ana_id, repair.ana_dir, repair_row=True)
        repair_rows_loaded += int(len(repair_df))

        if append_repair:
            selected = repair_df.copy()
        else:
            selected = repair_df[repair_df["case"].isin(replace_cases)].copy()
            missing_in_repair = sorted(set(replace_cases) - set(selected["case"].unique()))
            if missing_in_repair:
                warnings.append(
                    f"Repair study {repair.ana_id} does not contain replacement cases: {missing_in_repair}"
                )

        repair_frames.append(selected)

    if append_repair:
        corrected = pd.concat([main_df, *repair_frames], ignore_index=True)
    else:
        corrected_main = main_df[~main_df["case"].isin(replace_cases)].copy()
        corrected = pd.concat([corrected_main, *repair_frames], ignore_index=True)

    return corrected, {
        "main_rows_loaded": int(len(main_df)),
        "repair_rows_loaded": int(repair_rows_loaded),
        "repair_ana_ids": repair_ana_ids,
        "replace_cases": replace_cases,
        "append_repair": bool(append_repair),
        "warnings": warnings,
    }


def derive_case_fields(df: pd.DataFrame) -> pd.DataFrame:
    ensure_case_column(df)
    out = df.copy()

    split = out["case"].astype(str).str.split("__", n=1, expand=True)
    if split.shape[1] == 2:
        out["case_group"] = split[0]
        out["case_kind_derived"] = split[1]
    else:
        out["case_group"] = out["case"].astype(str)
        out["case_kind_derived"] = ""

    # Distance-band convenience fields for labels like dist_15_near__healthy.
    is_distance = out["case_group"].astype(str).str.startswith("dist_")
    out["distance_band"] = out["case_group"].where(is_distance, "")
    out["condition"] = out["case_kind_derived"].where(is_distance, "")
    return out


def apply_preset_metadata(df: pd.DataFrame, preset: str | None) -> pd.DataFrame:
    out = df.copy()

    if preset == "distance_band_v0_6_03":
        if "distance_band" not in out.columns:
            out = derive_case_fields(out)

        out["raw_distance_cells"] = out["distance_band"].map(
            {k: v["raw_distance_cells"] for k, v in DISTANCE_BAND_V0_6_03.items()}
        )
        out["normalized_distance"] = out["distance_band"].map(
            {k: v["normalized_distance"] for k, v in DISTANCE_BAND_V0_6_03.items()}
        )
        out["distance_base_station_rc_expected"] = out["distance_band"].map(
            {
                k: v["distance_base_station_rc_expected"]
                for k, v in DISTANCE_BAND_V0_6_03.items()
            }
        )

    return out


def unique_join(series: pd.Series, max_items: int = 12) -> str:
    vals = []
    for value in series.dropna().tolist():
        text = normalize_base_station_rc_value(value) if series.name == "base_station_rc" else str(value)
        if text not in vals:
            vals.append(text)
    if len(vals) > max_items:
        return "; ".join(vals[:max_items]) + f"; ... ({len(vals) - max_items} more)"
    return "; ".join(vals)


def seeds_join(series: pd.Series) -> str:
    vals = []
    for value in series.dropna().tolist():
        try:
            text = str(int(value))
        except (TypeError, ValueError):
            text = str(value)
        if text not in vals:
            vals.append(text)
    return ",".join(vals)


def metric_stats(series: pd.Series, prefix: str) -> dict[str, Any]:
    numeric = pd.to_numeric(series, errors="coerce")
    return {
        f"{prefix}_count": int(numeric.notna().sum()),
        f"{prefix}_missing_count": int(numeric.isna().sum()),
        f"{prefix}_missing_frac": float(numeric.isna().mean()) if len(numeric) else math.nan,
        f"{prefix}_mean": float(numeric.mean()) if numeric.notna().any() else math.nan,
        f"{prefix}_median": float(numeric.median()) if numeric.notna().any() else math.nan,
        f"{prefix}_std": float(numeric.std()) if numeric.notna().sum() > 1 else math.nan,
        f"{prefix}_min": float(numeric.min()) if numeric.notna().any() else math.nan,
        f"{prefix}_max": float(numeric.max()) if numeric.notna().any() else math.nan,
    }


def dominant_state_from_row(row: pd.Series) -> str:
    candidates: dict[str, float] = {}
    for state, col in USEFULNESS_STATE_COLS.items():
        mean_col = f"{col}_mean"
        if mean_col in row and pd.notna(row[mean_col]):
            candidates[state] = float(row[mean_col])
    if not candidates:
        return ""
    return max(candidates, key=candidates.get)


def summarize_by_case(df: pd.DataFrame) -> pd.DataFrame:
    ensure_case_column(df)
    records: list[dict[str, Any]] = []

    for case, group in df.groupby("case", sort=True, dropna=False):
        record: dict[str, Any] = {
            "case": case,
            "rows": int(len(group)),
            "source_ana_ids": unique_join(group["source_ana_id"]) if "source_ana_id" in group else "",
            "repair_rows": int(group["repair_row"].sum()) if "repair_row" in group else 0,
        }

        if "seed" in group:
            record["seeds_present"] = seeds_join(group["seed"])
            record["seed_count"] = int(group["seed"].nunique(dropna=True))

        for col in [
            "policy",
            "phy_id",
            "base_station_rc",
            "deployment_mode",
            "n_sensors",
            "delay_steps",
            "loss_prob",
            "noise_level",
            "case_group",
            "case_kind_derived",
            "distance_band",
            "condition",
            "raw_distance_cells",
            "normalized_distance",
            "distance_base_station_rc_expected",
        ]:
            if col in group.columns:
                record[f"{col}_values"] = unique_join(group[col])

        for metric in CASE_SUMMARY_METRICS:
            if metric in group.columns:
                record.update(metric_stats(group[metric], metric))

        records.append(record)

    out = pd.DataFrame(records)

    if not out.empty:
        out["dominant_usefulness_state"] = out.apply(dominant_state_from_row, axis=1)

    return out


def summarize_by_group(df: pd.DataFrame) -> pd.DataFrame:
    group_cols: list[str] = []
    if "distance_band" in df.columns and "condition" in df.columns and df["distance_band"].astype(str).ne("").any():
        group_cols = ["distance_band", "condition"]
    elif "case_group" in df.columns and "case_kind_derived" in df.columns:
        group_cols = ["case_group", "case_kind_derived"]
    else:
        return pd.DataFrame()

    records: list[dict[str, Any]] = []

    for keys, group in df.groupby(group_cols, sort=True, dropna=False):
        if not isinstance(keys, tuple):
            keys = (keys,)
        record = {col: key for col, key in zip(group_cols, keys)}
        record["rows"] = int(len(group))
        record["case_count"] = int(group["case"].nunique()) if "case" in group else 0
        record["cases"] = unique_join(group["case"]) if "case" in group else ""
        record["source_ana_ids"] = unique_join(group["source_ana_id"]) if "source_ana_id" in group else ""
        record["repair_rows"] = int(group["repair_row"].sum()) if "repair_row" in group else 0

        for col in [
            "base_station_rc",
            "raw_distance_cells",
            "normalized_distance",
            "distance_base_station_rc_expected",
            "delay_steps",
            "loss_prob",
            "noise_level",
        ]:
            if col in group.columns:
                record[f"{col}_values"] = unique_join(group[col])

        for metric in CASE_SUMMARY_METRICS:
            if metric in group.columns:
                stats = metric_stats(group[metric], metric)
                # Group summary keeps the same flat names as case summary.
                record.update(stats)

        records.append(record)

    out = pd.DataFrame(records)
    if not out.empty:
        out["dominant_usefulness_state"] = out.apply(dominant_state_from_row, axis=1)

    return out


def validate_expected_cases(
    df: pd.DataFrame,
    preset: str | None,
    expected_rows_per_case: int | None,
) -> dict[str, Any]:
    ensure_case_column(df)
    failures: list[dict[str, Any]] = []
    warnings: list[str] = []

    cases_present = sorted(df["case"].dropna().astype(str).unique().tolist())
    rows_per_case = df.groupby("case").size().astype(int).to_dict()

    expected_cases: dict[str, dict[str, Any]] = {}
    if preset == "distance_band_v0_6_03":
        expected_cases = EXPECTED_OVERRIDES_DISTANCE_BAND_V0_6_03

    missing_cases = sorted(set(expected_cases) - set(cases_present)) if expected_cases else []
    extra_cases = sorted(set(cases_present) - set(expected_cases)) if expected_cases else []

    for case in missing_cases:
        failures.append({"type": "missing_case", "case": case})

    if expected_cases:
        for case in extra_cases:
            failures.append({"type": "extra_case", "case": case})

    if expected_rows_per_case is not None:
        for case in cases_present:
            n = int(rows_per_case.get(case, 0))
            if n != expected_rows_per_case:
                failures.append(
                    {
                        "type": "unexpected_row_count",
                        "case": case,
                        "observed": n,
                        "expected": expected_rows_per_case,
                    }
                )

    for case, expected in expected_cases.items():
        case_rows = df[df["case"] == case]
        if case_rows.empty:
            continue

        for col, expected_value in expected.items():
            if col not in case_rows.columns:
                failures.append(
                    {
                        "type": "missing_validation_column",
                        "case": case,
                        "column": col,
                        "expected": expected_value,
                    }
                )
                continue

            for idx, observed in case_rows[col].items():
                if not values_equal(observed, expected_value):
                    failures.append(
                        {
                            "type": "override_mismatch",
                            "case": case,
                            "row_index": int(idx),
                            "column": col,
                            "observed": normalize_base_station_rc_value(observed)
                            if col == "base_station_rc"
                            else observed,
                            "expected": expected_value,
                        }
                    )

    ok = not failures

    return {
        "ok": ok,
        "preset": preset,
        "expected_rows_per_case": expected_rows_per_case,
        "cases_present": cases_present,
        "cases_missing": missing_cases,
        "cases_extra": extra_cases,
        "rows_per_case": {str(k): int(v) for k, v in rows_per_case.items()},
        "failures": failures,
        "warnings": warnings,
    }


def make_columns_report(df: pd.DataFrame, path: Path) -> tuple[list[str], list[str]]:
    present = [c for c in KEY_COLUMNS if c in df.columns]
    missing = [c for c in KEY_COLUMNS if c not in df.columns]

    lines: list[str] = []
    lines.append("AWSRT analysis extraction column report")
    lines.append("=" * 48)
    lines.append("")
    lines.append(f"row_count: {len(df)}")
    lines.append(f"column_count: {len(df.columns)}")
    lines.append("")
    lines.append("Key columns present:")
    for col in present:
        lines.append(f"  - {col}")
    lines.append("")
    lines.append("Key columns missing:")
    for col in missing:
        lines.append(f"  - {col}")
    lines.append("")
    lines.append("All columns:")
    for col in df.columns:
        lines.append(f"  - {col}")
    lines.append("")

    path.write_text("\n".join(lines), encoding="utf-8")
    return present, missing


def compact_summary_metadata(summary: dict[str, Any]) -> dict[str, Any]:
    keys = [
        "ana_id",
        "analysis_contract_version",
        "baseline_policy",
        "best",
        "best_robust",
        "row_count",
        "seeds",
        "policies",
        "study_type",
        "study_semantics",
        "sweep_context",
        "created_at",
    ]
    return {key: summary.get(key) for key in keys if key in summary}


def write_integrity_report(
    *,
    path: Path,
    main: LoadedStudy,
    repairs_meta: dict[str, Any],
    corrected_df: pd.DataFrame,
    present_cols: list[str],
    missing_cols: list[str],
    validation: dict[str, Any],
    summary_meta: dict[str, Any],
    extra_warnings: list[str],
) -> None:
    warnings = []
    warnings.extend(repairs_meta.get("warnings", []))
    warnings.extend(validation.get("warnings", []))
    warnings.extend(extra_warnings)

    report = {
        "ok": bool(validation.get("ok", True)) and not extra_warnings,
        "main_ana_id": main.ana_id,
        "main_ana_dir": str(main.ana_dir),
        "repair_ana_ids": repairs_meta.get("repair_ana_ids", []),
        "main_rows_loaded": repairs_meta.get("main_rows_loaded"),
        "repair_rows_loaded": repairs_meta.get("repair_rows_loaded"),
        "replace_cases": repairs_meta.get("replace_cases", []),
        "append_repair": repairs_meta.get("append_repair", False),
        "rows_after_correction": int(len(corrected_df)),
        "column_count_after_correction": int(len(corrected_df.columns)),
        "key_columns_present": present_cols,
        "key_columns_missing": missing_cols,
        "summary_metadata": summary_meta,
        "case_validation": validation,
        "warnings": warnings,
    }

    path.write_text(json.dumps(report, indent=2, sort_keys=True), encoding="utf-8")


def safe_float_text(value: Any, digits: int = 6) -> str:
    try:
        x = float(value)
    except (TypeError, ValueError):
        return ""
    if math.isnan(x):
        return "NaN"
    return f"{x:.{digits}f}"


def write_markdown_interpretation(
    *,
    path: Path,
    main: LoadedStudy,
    repairs_meta: dict[str, Any],
    validation: dict[str, Any],
    case_summary: pd.DataFrame,
    group_summary: pd.DataFrame,
    preset: str | None,
) -> None:
    lines: list[str] = []

    lines.append("# Analysis Extraction Interpretation Stub")
    lines.append("")
    lines.append("## Analysis inputs")
    lines.append("")
    lines.append(f"- Main analysis: `{main.ana_id}`")
    lines.append(f"- Main directory: `{main.ana_dir}`")

    repair_ids = repairs_meta.get("repair_ana_ids", [])
    if repair_ids:
        lines.append(f"- Repair analyses: `{', '.join(repair_ids)}`")
        replace_cases = repairs_meta.get("replace_cases", [])
        if replace_cases:
            lines.append(f"- Replaced cases: `{', '.join(replace_cases)}`")
    else:
        lines.append("- Repair analyses: none")

    lines.append("")
    lines.append("## Integrity")
    lines.append("")
    lines.append(f"- Rows after correction: `{sum(case_summary['rows']) if not case_summary.empty else 0}`")
    lines.append(f"- Case count: `{len(case_summary)}`")
    lines.append(f"- Validation preset: `{preset or 'none'}`")
    lines.append(f"- Validation ok: `{validation.get('ok')}`")

    failures = validation.get("failures", [])
    if failures:
        lines.append("")
        lines.append("### Validation failures")
        lines.append("")
        for failure in failures[:25]:
            lines.append(f"- `{failure}`")
        if len(failures) > 25:
            lines.append(f"- ... {len(failures) - 25} additional failures omitted")
    else:
        lines.append("")
        lines.append("No validation failures were reported.")

    if not case_summary.empty and "ttfd_missing_frac" in case_summary.columns:
        lines.append("")
        lines.append("## TTFD missingness by case")
        lines.append("")
        lines.append("| case | rows | ttfd_n_finite | ttfd_missing_frac | ttfd_mean |")
        lines.append("|---|---:|---:|---:|---:|")
        for _, row in case_summary.sort_values("case").iterrows():
            lines.append(
                "| {case} | {rows} | {finite} | {missing} | {mean} |".format(
                    case=row.get("case", ""),
                    rows=int(row.get("rows", 0)),
                    finite=int(row.get("ttfd_count", 0)) if pd.notna(row.get("ttfd_count", math.nan)) else 0,
                    missing=safe_float_text(row.get("ttfd_missing_frac"), 3),
                    mean=safe_float_text(row.get("ttfd_mean"), 3),
                )
            )

    if not case_summary.empty and "dominant_usefulness_state" in case_summary.columns:
        lines.append("")
        lines.append("## Dominant usefulness state by case")
        lines.append("")
        lines.append("| case | dominant_state | exploit_mean | recover_mean | caution_mean |")
        lines.append("|---|---|---:|---:|---:|")
        for _, row in case_summary.sort_values("case").iterrows():
            lines.append(
                "| {case} | {state} | {exploit} | {recover} | {caution} |".format(
                    case=row.get("case", ""),
                    state=row.get("dominant_usefulness_state", ""),
                    exploit=safe_float_text(
                        row.get("usefulness_regime_state_exploit_frac_mean"), 3
                    ),
                    recover=safe_float_text(
                        row.get("usefulness_regime_state_recover_frac_mean"), 3
                    ),
                    caution=safe_float_text(
                        row.get("usefulness_regime_state_caution_frac_mean"), 3
                    ),
                )
            )

    if not group_summary.empty:
        lines.append("")
        lines.append("## Group summary")
        lines.append("")
        group_cols = [
            c
            for c in ["distance_band", "condition", "case_group", "case_kind_derived"]
            if c in group_summary.columns
        ]
        display_cols = group_cols + [
            "rows",
            "dominant_usefulness_state",
            "ttfd_mean",
            "ttfd_missing_frac",
            "mean_entropy_auc_mean",
            "coverage_auc_mean",
        ]
        display_cols = [c for c in display_cols if c in group_summary.columns]

        lines.append("| " + " | ".join(display_cols) + " |")
        lines.append("| " + " | ".join(["---"] * len(display_cols)) + " |")
        for _, row in group_summary.sort_values(group_cols).iterrows():
            vals = []
            for col in display_cols:
                value = row.get(col, "")
                if isinstance(value, float):
                    vals.append(safe_float_text(value, 6))
                else:
                    vals.append(str(value))
            lines.append("| " + " | ".join(vals) + " |")

    if preset == "distance_band_v0_6_03" and not case_summary.empty:
        lines.append("")
        lines.append("## Distance-band interpretation prompt")
        lines.append("")
        lines.append(
            "This extraction used the `distance_band_v0_6_03` preset. Review whether "
            "TTFD availability, belief quality, information delivery, and usefulness-state "
            "occupancy move together or separate. The script does not make the scientific "
            "claim automatically; it prepares the auditable evidence table."
        )

    lines.append("")
    path.write_text("\n".join(lines), encoding="utf-8")


def write_outputs(
    *,
    out_dir: Path,
    prefix: str,
    main: LoadedStudy,
    repairs_meta: dict[str, Any],
    corrected_df: pd.DataFrame,
    case_summary: pd.DataFrame,
    group_summary: pd.DataFrame,
    validation: dict[str, Any],
    summary_meta: dict[str, Any],
    extra_warnings: list[str],
    preset: str | None,
) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)

    columns_path = out_dir / f"{prefix}_columns.txt"
    present_cols, missing_cols = make_columns_report(corrected_df, columns_path)

    corrected_df.to_csv(out_dir / f"{prefix}_corrected_rows.csv", index=False)
    case_summary.to_csv(out_dir / f"{prefix}_case_summary.csv", index=False)
    if not group_summary.empty:
        group_summary.to_csv(out_dir / f"{prefix}_group_summary.csv", index=False)
    else:
        # Still write an empty file so workflows know it was attempted.
        pd.DataFrame().to_csv(out_dir / f"{prefix}_group_summary.csv", index=False)

    write_integrity_report(
        path=out_dir / f"{prefix}_integrity.json",
        main=main,
        repairs_meta=repairs_meta,
        corrected_df=corrected_df,
        present_cols=present_cols,
        missing_cols=missing_cols,
        validation=validation,
        summary_meta=summary_meta,
        extra_warnings=extra_warnings,
    )

    write_markdown_interpretation(
        path=out_dir / f"{prefix}_interpretation.md",
        main=main,
        repairs_meta=repairs_meta,
        validation=validation,
        case_summary=case_summary,
        group_summary=group_summary,
        preset=preset,
    )


def main() -> int:
    args = parse_args()

    try:
        main_study = load_study(args.main_ana_dir)
        repair_studies = [load_study(path) for path in args.repair]

        corrected_df, repairs_meta = apply_repairs(
            main_study,
            repair_studies,
            replace_cases=args.replace_case,
            append_repair=args.append_repair,
        )

        corrected_df = derive_case_fields(corrected_df)
        corrected_df = apply_preset_metadata(corrected_df, args.preset)

        validation = validate_expected_cases(
            corrected_df,
            preset=args.preset,
            expected_rows_per_case=args.expected_rows_per_case,
        )

        case_summary = summarize_by_case(corrected_df)
        group_summary = summarize_by_group(corrected_df)
        summary_meta = compact_summary_metadata(main_study.summary)

        out_dir = args.out_dir if args.out_dir is not None else main_study.ana_dir
        out_dir = out_dir.expanduser().resolve()

        extra_warnings: list[str] = []
        if args.preset is None and args.expected_rows_per_case is not None:
            extra_warnings.append(
                "--expected-rows-per-case was supplied without a preset; only observed cases were row-count checked."
            )

        write_outputs(
            out_dir=out_dir,
            prefix=args.prefix,
            main=main_study,
            repairs_meta=repairs_meta,
            corrected_df=corrected_df,
            case_summary=case_summary,
            group_summary=group_summary,
            validation=validation,
            summary_meta=summary_meta,
            extra_warnings=extra_warnings,
            preset=args.preset,
        )

        print("Extraction complete.")
        print(f"Main analysis: {main_study.ana_id}")
        print(f"Rows after correction: {len(corrected_df)}")
        print(f"Cases: {corrected_df['case'].nunique() if 'case' in corrected_df.columns else 'n/a'}")
        print(f"Validation ok: {validation.get('ok')}")
        print(f"Output directory: {out_dir}")
        print("")
        print("Wrote:")
        for name in [
            f"{args.prefix}_columns.txt",
            f"{args.prefix}_integrity.json",
            f"{args.prefix}_corrected_rows.csv",
            f"{args.prefix}_case_summary.csv",
            f"{args.prefix}_group_summary.csv",
            f"{args.prefix}_interpretation.md",
        ]:
            print(f"  - {out_dir / name}")

        if not validation.get("ok"):
            print("", file=sys.stderr)
            print("Validation failed. Inspect the integrity JSON for details.", file=sys.stderr)
            return 1

        return 0

    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
