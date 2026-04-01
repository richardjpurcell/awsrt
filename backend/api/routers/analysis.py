

from __future__ import annotations

import csv
import hashlib
import math

from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
import json

from api.routers.operational import _compute_compare_metrics, run as operational_run
from awsrt_core.io.ids import new_id
from awsrt_core.io.paths import list_manifests, metrics_dir, save_manifest, load_manifest, delete_run_artifacts
from awsrt_core.metrics.basic import write_summary_json
from awsrt_core.schemas.common import ListResponse, RunRequest
from awsrt_core.schemas.operational import OperationalManifest

router = APIRouter()


class SweepCase(BaseModel):
    """
    One case in a batch sweep. Overrides are applied to the base manifest via dotpaths.
    Example overrides:
      {"impairments.loss_prob": 0.3, "impairments.delay_steps": 4, "impairments.noise_level": 0.1}
    """
    label: str = ""
    overrides: dict[str, Any] = Field(default_factory=dict)

class StudySemanticsRequest(BaseModel):
    """
    Explicit scientific intent for an Analysis study.
    This is the contract the frontend should use instead of reverse-engineering
    meaning from sweep overrides or metric names.
    """
    study_family: str = "baseline_compare"
    comparison_axis: str = "policy"
    comparison_tier: str = "main"
    preset_origin: str = "analysis_batch"
    study_label: str = ""


class CreateOperationalStudyRequest(BaseModel):
    """
    Canonical Analysis study request for Operational runs.

    Produces ONE ana-* artifact containing many runs:
      - manifests/{ana_id}.json (protocol + semantics + sweep context)
      - metrics/{ana_id}/summary.json (aggregates + explicit semantics)
      - metrics/{ana_id}/table.csv (one row per (case,seed,policy) run)
    """
    manifest: OperationalManifest
    semantics: StudySemanticsRequest = Field(default_factory=StudySemanticsRequest)
    policies: list[str] = Field(default_factory=lambda: ["random_feasible", "greedy", "uncertainty", "mdc_info"])
    seeds: list[int] = Field(default_factory=lambda: list(range(10)))
    sweep: list[SweepCase] = Field(default_factory=lambda: [SweepCase(label="base", overrides={})])
    columns: list[str] = Field(default_factory=list)
    choose_best_by: str = "ttfd"

    torture: dict[str, Any] = Field(default_factory=dict)


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def _protocol_id_from_base_manifest(base_manifest: dict[str, Any], *, drop: list[tuple[str, str]] | None = None) -> str:
    """
    Compute a stable protocol fingerprint for compatibility grouping.

    Rule: hash the base manifest excluding variant-defining knobs.
    For operational compare: drop ("network","policy").
    For epistemic compare: drop ("action","model").
    """
    proto = json.loads(json.dumps(base_manifest))  # deep-copy via json

    for parent_key, child_key in (drop or []):
        parent = proto.get(parent_key)
        if isinstance(parent, dict) and child_key in parent:
            p2 = dict(parent)
            p2.pop(child_key, None)
            proto[parent_key] = p2

    # Canonical JSON for hashing
    s = json.dumps(proto, sort_keys=True, separators=(",", ":"), ensure_ascii=True)
    h = hashlib.sha256(s.encode("utf-8")).hexdigest()[:12]
    return f"p-{h}"

def _protocol_id_for_batch_operational(
    base_protocol_id: str,
    *,
    policies: list[str],
    seeds: list[int],
    sweep: list[dict[str, Any]],
    choose_best_by: str,
) -> str:
    """
    Stable id for a *batch protocol* (same design across runs).
    Includes sweep definition + seeds + policies, but excludes runtime ids.
    """
    # Phase-A hardening:
    # Make protocol_id invariant to ordering of policies/seeds/sweep (set semantics).
    # This avoids creating new protocol_ids when the UI sends the same content in a different order.
    def _canon_policies(xs: list[str]) -> list[str]:
        out = []
        for p in xs or []:
            s = str(p).strip()
            if s:
                out.append(s)
        return sorted(set(out))

    def _canon_seeds(xs: list[int]) -> list[int]:
        out: list[int] = []
        for s in xs or []:
            try:
                out.append(int(s))
            except Exception:
                continue
        return sorted(set(out))

    def _canon_sweep(cases: list[dict[str, Any]]) -> list[dict[str, Any]]:
        # Normalize each case to a canonical dict and then sort by a stable signature.
        canon: list[dict[str, Any]] = []
        for c in cases or []:
            if not isinstance(c, dict):
                continue
            label = str(c.get("label", "") or "")
            overrides = c.get("overrides", {}) if isinstance(c.get("overrides", {}), dict) else {}
            # Ensure override keys are strings for stable json.
            overrides2 = {str(k): v for k, v in overrides.items()}
            canon.append({"label": label, "overrides": overrides2})
        def sig(x: dict[str, Any]) -> str:
            return json.dumps(x, sort_keys=True, separators=(",", ":"), ensure_ascii=True)
        return sorted(canon, key=sig)

    policies_hash = _canon_policies(policies)
    seeds_hash = _canon_seeds(seeds)
    sweep_hash = _canon_sweep(sweep)

    proto_obj = {
        "base_protocol_id": str(base_protocol_id),
        "policies": policies_hash,
        "seeds": seeds_hash,
        "sweep": sweep_hash,
        "choose_best_by": str(choose_best_by),
    }
    s = json.dumps(proto_obj, sort_keys=True, separators=(",", ":"), ensure_ascii=True)
    h = hashlib.sha256(s.encode("utf-8")).hexdigest()[:12]
    return f"p-{h}"


def _write_table_csv(
    path: Path,
    rows: list[dict[str, Any]],
    columns: list[str],
    *,
    ensure_cols: list[str] | None = None,
) -> list[str]:
    """Write table.csv deterministically and return the column list used."""
    path.parent.mkdir(parents=True, exist_ok=True)

    if not rows:
        path.write_text("", encoding="utf-8")
        return list(columns)

    # Drop any series-like fields from the analysis table.
    filtered_rows: list[dict[str, Any]] = []
    for r in rows:
        filtered_rows.append({k: v for k, v in r.items() if not str(k).endswith("_series")})


    if columns:
        cols = [c for c in list(columns) if not str(c).endswith("_series")]
    else:
        cols = list(filtered_rows[0].keys())
        # Light preference for readability (only if present)
        prefer = ["case", "seed", "policy", "opr_id", "epi_id", "ttfd", "mean_entropy_auc", "entropy_auc", "coverage_auc"]
        cols = [c for c in prefer if c in cols] + [c for c in cols if c not in prefer]

    # Phase C hardening: if the caller wants guaranteed columns (e.g., derived contract keys),
    # append any missing ones to the end to preserve ordering stability.
    if ensure_cols:
        for c in ensure_cols:
            c = str(c)
            if c and not c.endswith("_series") and c not in cols:
                cols.append(c)

    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=cols, extrasaction="ignore")
        w.writeheader()
        for r in filtered_rows:
            w.writerow({k: r.get(k, None) for k in cols})

    return cols

def _csv_header(path: Path) -> list[str]:
    """Return CSV header columns using Python's csv module (quote-safe)."""
    with path.open("r", newline="", encoding="utf-8") as f:
        r = csv.reader(f)
        return next(r, [])

def _count_csv_data_rows(path: Path) -> int:
    """Count data rows (excluding header) efficiently (assumes one record per line)."""
    n_newlines = 0
    with path.open("rb") as f:
        while True:
            chunk = f.read(1024 * 1024)
            if not chunk:
                break
            n_newlines += chunk.count(b"\n")

    # Handle file without trailing newline.
    try:
        size = path.stat().st_size
    except Exception:
        size = 0
    if size > 0:
        with path.open("rb") as f:
            f.seek(-1, 2)
            last = f.read(1)
        if last != b"\n":
            n_newlines += 1

    return max(0, n_newlines - 1)

def _csv_preview_rows(path: Path, *, limit: int = 50, offset: int = 0) -> tuple[list[str], list[dict[str, str]]]:
    """Read a small preview of table.csv as JSON-friendly rows."""
    limit = max(1, min(int(limit), 500))
    offset = max(0, int(offset))
    with path.open("r", newline="", encoding="utf-8") as f:
        dr = csv.DictReader(f)
        cols = list(dr.fieldnames or [])
        rows: list[dict[str, str]] = []
        for _ in range(offset):
            try:
                next(dr)
            except StopIteration:
                return cols, rows
        for _ in range(limit):
            try:
                row = next(dr)
            except StopIteration:
                break
            rows.append({k: ("" if v is None else str(v)) for k, v in (row or {}).items()})
        return cols, rows

def _set_in_dict_by_dotpath(d: dict[str, Any], path: str, value: Any) -> None:
    """
    Set d["a"]["b"]["c"]=value given "a.b.c". Creates dicts along the way.
    """
    parts = [p for p in str(path).split(".") if p]
    if not parts:
        return
    cur: Any = d
    for k in parts[:-1]:
        if not isinstance(cur, dict):
            return
        if k not in cur or not isinstance(cur.get(k), dict):
            cur[k] = {}
        cur = cur[k]
    if isinstance(cur, dict):
        cur[parts[-1]] = value

def _apply_overrides_to_manifest_dict(base: dict[str, Any], overrides: dict[str, Any]) -> dict[str, Any]:
    out = json.loads(json.dumps(base))  # deep copy
    for k, v in (overrides or {}).items():
        _set_in_dict_by_dotpath(out, str(k), v)
    return out

def _direction_for_metric(metric: str) -> str:
    m = str(metric or "").lower().strip()
    if m in ("ttfd",):
        return "min"
    if "time" in m or "latency" in m:
        return "min"
    # Entropy AUC / mean entropy AUC: LOWER is better
    if "entropy" in m:
        return "min"
    if "violation" in m or "error" in m or "loss" in m:
        return "min"
    if "exposure" in m:
        return "min"
    if "transition_count" in m:
        return "min"
    return "max"


def _contains_any(xs: list[str], needles: list[str]) -> bool:
    s = {str(x).strip() for x in xs or [] if str(x).strip()}
    return any(n in s for n in needles)


def _policy_semantics(policies: list[str]) -> dict[str, Any]:
    xs = [str(x).strip() for x in policies or [] if str(x).strip()]
    return {
        "contains_baseline": _contains_any(xs, ["random_feasible", "greedy", "uncertainty"]),
        "contains_mdc": _contains_any(xs, ["mdc_info", "mdc_arrival", "balance"]),
        "contains_advisory_regime": False,
        "contains_active_regime": False,
        "contains_verify": False,
        "policies": xs,
    }


def _regime_semantics_from_rows(rows: list[dict[str, Any]]) -> dict[str, Any]:
    advisory_present = False
    active_present = False
    enabled_present = False
    family_labels: set[str] = set()

    for r in rows or []:
        if bool(r.get("regime_enabled_cfg", False)):
            enabled_present = True
        mode = str(r.get("regime_mode_cfg", "") or "").strip().lower()
        if mode == "advisory":
            advisory_present = True
        if mode == "active":
            active_present = True
        fam = str(r.get("regime_family_cfg", "") or "").strip()
        if fam:
            family_labels.add(fam)

    return {
        "regime_present": enabled_present,
        "advisory_metrics_present": advisory_present,
        "active_metrics_present": active_present,
        "frontend_should_separate_advisory_and_active": advisory_present and active_present,
        "regime_families_present": sorted(family_labels),
    }


def _metric_semantics(catalog: dict[str, Any]) -> dict[str, Any]:
    """
    Explicit UI-facing metric semantics so Analysis Graphic does not need to guess.
    """
    out: dict[str, Any] = {}
    headline = set(catalog.get("headline", []) or [])
    mdc_centered = set(catalog.get("mdc_centered", []) or [])
    regime_centered = set(catalog.get("regime_centered", []) or [])
    directions = dict(catalog.get("direction", {}) or {})

    for m, d in directions.items():
        entry: dict[str, Any] = {
            "direction": d,
            "tier": "secondary",
            "domain": "other",
        }
        if m in headline:
            entry["domain"] = "headline"
            entry["tier"] = "primary" if m in {"ttfd", "mean_entropy_auc"} else "secondary"
        elif m in mdc_centered:
            entry["domain"] = "mdc"
            entry["tier"] = "primary" if m == "mdc_violation_rate" else "secondary"
        elif m in regime_centered:
            entry["domain"] = "regime"
            entry["tier"] = "secondary"
            if "effective_eta" in m or "utilization" in m or "strict_drift_proxy" in m:
                entry["semantic_role"] = "advisory"
            elif "active_transition" in m or "move_budget" in m:
                entry["semantic_role"] = "active"
            else:
                entry["semantic_role"] = "diagnostic"
        out[m] = entry
    return out


def _infer_primary_sweep_key(override_keys: list[str]) -> str | None:
    """
    Canonicalize sweep intent into a compact frontend-facing key.

    This lets Graphic/Raw interpret study purpose without reverse-engineering
    every individual dotpath or relying on a single exact override key.
    """
    keys = sorted(set(str(k).strip() for k in (override_keys or []) if str(k).strip()))
    if not keys:
        return None

    if len(keys) == 1:
        k = keys[0]
        if k == "network.n_sensors":
            return "n_sensors"
        return k

    if all(k.endswith(".persistence_steps") for k in keys):
        return "persistence_steps"

    if all(k.endswith(".hysteresis_band") for k in keys):
        return "hysteresis_band"

    if all(k.startswith("impairments.") for k in keys):
        if "impairments.loss_prob" in keys and len(keys) == 1:
            return "impairments.loss_prob"
        if "impairments.delay_steps" in keys and len(keys) == 1:
            return "impairments.delay_steps"
        if "impairments.noise_level" in keys and len(keys) == 1:
            return "impairments.noise_level"
        return "impairments"

    if all(k.startswith("regime_management.") for k in keys):
        return "regime_management"

    return None

def _sweep_context(
    sweep_cases: list[SweepCase],
    rows: list[dict[str, Any]],
) -> dict[str, Any]:
    case_labels = [str(c.label or "") for c in sweep_cases or []]
    override_keys: list[str] = []
    for c in sweep_cases or []:
        override_keys.extend([str(k) for k in (c.overrides or {}).keys()])
    override_keys = sorted(set(k for k in override_keys if k))

    regime_families = sorted(
        set(str(r.get("regime_family_cfg", "")).strip() for r in rows if str(r.get("regime_family_cfg", "")).strip())
    )
    impairment_levels = sorted(
        set(str(r.get("impairment_level_cfg", "")).strip() for r in rows if str(r.get("impairment_level_cfg", "")).strip())
    )
    regime_modes = sorted(
        set(str(r.get("regime_mode_cfg", "")).strip() for r in rows if str(r.get("regime_mode_cfg", "")).strip())
    )
    primary_sweep_key = _infer_primary_sweep_key(override_keys)

    if len(override_keys) == 0:
        sweep_kind = "preset_cases" if len(case_labels) <= 1 else "named_cases"
    elif primary_sweep_key in {
        "persistence_steps",
        "hysteresis_band",
        "n_sensors",
        "impairments.loss_prob",
        "impairments.delay_steps",
        "impairments.noise_level",
    }:
        sweep_kind = "single_factor"
        
    else:
        sweep_kind = "multi_factor"
        

    return {
        "sweep_kind": sweep_kind,
        "case_labels": case_labels,
        "override_keys": override_keys,
        "primary_sweep_key": primary_sweep_key,
        "uses_named_impairment_bundles": len(impairment_levels) > 0,
        "uses_named_regime_bundles": len(regime_families) > 0,
        "has_regime_variation": len(regime_families) > 0 or len(regime_modes) > 0,
        "has_impairment_variation": len(impairment_levels) > 0,
        "regime_families": regime_families,
        "impairment_levels": impairment_levels,
        "regime_modes": regime_modes,
    }
#
# ---- Explicit evidence packaging contract (operational studies) ----
#
# Goal: summary.json is sufficient for paper plots/claims without scanning table.csv.
#

HEADLINE_METRICS = ["ttfd", "mean_entropy_auc", "coverage_auc"]

# Minimal, stable, reviewer-friendly MDC evidence keys:
MDC_CENTERED_METRICS = [
    "mdc_violation_rate",
    "mdc_residual_pos_frac",
    "mdc_residual_mean",
    "delivered_info_proxy_mean",
]

# Regime-management metrics promoted to first-class batch-summary support.
# Advisory trigger-hit summaries are kept distinct from realized active-control metrics.
# These remain diagnostics / proxies / control-behavior summaries, not proof claims.
REGIME_CENTERED_METRICS = [
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
]

# Some runs export "raw" evidence fields (e.g. residual_info_mean) rather than the
# reviewer-facing names above. We derive the stable names here if missing.
DERIVED_FROM = {
    "delivered_info_proxy_mean": "driver_info_true_mean (fallback: driver_info_mean)",
    "mdc_residual_mean": "residual_info_mean",
    "mdc_residual_pos_frac": "residual_info_pos_frac",
    "mdc_violation_rate": "1 - residual_info_pos_frac (clamped 0..1)",
}


def _approx_eq(a: Any, b: Any, tol: float = 1e-9) -> bool:
    try:
        return abs(float(a) - float(b)) <= float(tol)
    except Exception:
        return False


def _classify_regime_family_from_cfg(row: dict[str, Any]) -> str:
    """
    Best-effort classifier for the standardized regime families currently emitted
    by the Analysis Batch presets.

    Returns one of:
      - balanced
      - opportunistic
      - certified
      - custom
      - disabled

    This is intentionally conservative: exact-ish matching on the current preset
    bundles, otherwise 'custom'.
    """
    if not bool(row.get("regime_enabled_cfg", False)):
        return "disabled"

    ds_u = row.get("downshift_util_cfg")
    sc_u = row.get("switch_util_cfg")
    rc_u = row.get("recovery_util_cfg")

    ds_p = row.get("downshift_persistence_cfg")
    sc_p = row.get("switch_persistence_cfg")
    rc_p = row.get("recovery_persistence_cfg")

    ds_h = row.get("downshift_hysteresis_cfg")
    sc_h = row.get("switch_hysteresis_cfg")
    rc_h = row.get("recovery_hysteresis_cfg")

    # balanced (matches current Analysis Batch / study-designer preset)
    if (
        _approx_eq(ds_u, 0.75) and _approx_eq(sc_u, 0.55) and _approx_eq(rc_u, 0.85)
        and _approx_eq(ds_p, 2) and _approx_eq(sc_p, 2) and _approx_eq(rc_p, 2)
        and _approx_eq(ds_h, 0.05) and _approx_eq(sc_h, 0.05) and _approx_eq(rc_h, 0.05)
    ):
        return "balanced"

    # opportunistic (matches current Analysis Batch / study-designer preset)
    if (
        _approx_eq(ds_u, 0.60) and _approx_eq(sc_u, 0.40) and _approx_eq(rc_u, 0.90)
        and _approx_eq(ds_p, 3) and _approx_eq(sc_p, 3) and _approx_eq(rc_p, 2)
        and _approx_eq(ds_h, 0.08) and _approx_eq(sc_h, 0.08) and _approx_eq(rc_h, 0.05)
    ):
        return "opportunistic"

    # certified (matches current Analysis Batch / study-designer preset)
    if (
        _approx_eq(ds_u, 0.85) and _approx_eq(sc_u, 0.70) and _approx_eq(rc_u, 0.82)
        and _approx_eq(ds_p, 1) and _approx_eq(sc_p, 1) and _approx_eq(rc_p, 3)
        and _approx_eq(ds_h, 0.03) and _approx_eq(sc_h, 0.03) and _approx_eq(rc_h, 0.08)
    ):
        return "certified"

    return "custom"


def _classify_impairment_level_from_cfg(row: dict[str, Any]) -> str:
    """
    Best-effort classifier for the standardized impairment bundles currently used
    by the batch presets.

    Returns:
      - ideal
      - moderate
      - harsh
      - custom
    """
    noise = row.get("noise_level")
    delay = row.get("delay_steps")
    loss = row.get("loss_prob")

    if _approx_eq(noise, 0.0) and _approx_eq(delay, 0) and _approx_eq(loss, 0.0):
        return "ideal"
    if _approx_eq(noise, 0.1) and _approx_eq(delay, 1) and _approx_eq(loss, 0.05):
        return "moderate"
    if _approx_eq(noise, 0.2) and _approx_eq(delay, 4) and _approx_eq(loss, 0.3):
        return "harsh"
    return "custom"


def _add_derived_metrics(rows: list[dict[str, Any]]) -> None:
    """
    In-place enrichment of rows with derived metrics, if absent.
    Keeps table.csv stable (because columns control what is written),
    but ensures summary.json always has the Phase-C metric catalog available.
    """
    for r in rows or []:
        # delivered_info_proxy_mean
        if "delivered_info_proxy_mean" not in r:
            v_true = _safe_float(r.get("driver_info_true_mean", None))
            v_legacy = _safe_float(r.get("driver_info_mean", None))
            r["delivered_info_proxy_mean"] = v_true if v_true is not None else v_legacy


        # mdc_residual_mean
        if "mdc_residual_mean" not in r and "residual_info_mean" in r:
            r["mdc_residual_mean"] = _safe_float(r.get("residual_info_mean", None))


        # mdc_residual_pos_frac
        if "mdc_residual_pos_frac" not in r and "residual_info_pos_frac" in r:
            r["mdc_residual_pos_frac"] = _safe_float(r.get("residual_info_pos_frac", None))

        # mdc_violation_rate = 1 - residual_info_pos_frac (clamped)
        if "mdc_violation_rate" not in r and "residual_info_pos_frac" in r:
            v = _safe_float(r.get("residual_info_pos_frac", None))
            if v is None:
                r["mdc_violation_rate"] = None
            else:
                x = 1.0 - v
                if x < 0.0:
                    x = 0.0
                if x > 1.0:
                    x = 1.0
                r["mdc_violation_rate"] = x

def _safe_float(x: Any) -> float | None:
    """Parse float and reject NaN/inf. Returns None if not a finite number."""
    try:
        v = float(x)
    except Exception:
        return None
    if not math.isfinite(v):
        return None
    return v

def _augment_rows_for_phase_c(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """
    Phase C evidence packaging: ensure summary.json's *contract metric keys*
    exist even if the underlying operational table uses different names.

    Observed operational table columns include (examples):
      - driver_info_mean
      - residual_info_mean
      - residual_info_pos_frac

    Contract keys (Phase C):
      - delivered_info_proxy_mean
      - mdc_residual_mean
      - mdc_residual_pos_frac
      - mdc_violation_rate

    Deterministic mapping (backend-only, no new policy/plot work):
      delivered_info_proxy_mean := driver_info_mean
      mdc_residual_mean        := residual_info_mean
      mdc_residual_pos_frac    := residual_info_pos_frac
      mdc_violation_rate       := clamp(1 - residual_info_pos_frac, 0..1)  (if missing)
    """
    out: list[dict[str, Any]] = []
    for r in rows or []:
        rr = dict(r)

        # Prefer truthier delivered-info proxy if available; otherwise fall back to legacy proxy
        if rr.get("delivered_info_proxy_mean", None) is None:
            v = _safe_float(rr.get("driver_info_true_mean", None))
            if v is None:
                v = _safe_float(rr.get("driver_info_mean", None))
            if v is not None:
                rr["delivered_info_proxy_mean"] = v

        # Residual mean proxy
        if rr.get("mdc_residual_mean", None) is None:
            v = _safe_float(rr.get("residual_info_mean", None))
            if v is not None:
                rr["mdc_residual_mean"] = v

        # Residual positive fraction proxy + violation rate (if not already present)
        if rr.get("mdc_residual_pos_frac", None) is None:
            v = _safe_float(rr.get("residual_info_pos_frac", None))
            if v is not None:
                rr["mdc_residual_pos_frac"] = v
                if rr.get("mdc_violation_rate", None) is None:
                    rr["mdc_violation_rate"] = max(0.0, min(1.0, 1.0 - v))

        out.append(rr)
    return out


def _metric_catalog(choose_best_by: str) -> dict[str, Any]:
    """
    Contract: headline + mdc_centered + regime_centered.
    Also include choose_best_by if it's not already in the set (keeps behavior stable).
    """
    choose = str(choose_best_by or "").strip()
    metrics = list(
        dict.fromkeys(
            [
                *HEADLINE_METRICS,
                *MDC_CENTERED_METRICS,
                *REGIME_CENTERED_METRICS,
                choose,
            ]
        )
    )
    metrics = [m for m in metrics if m]  # drop empty
    return {
        "headline": list(HEADLINE_METRICS),
        "mdc_centered": list(MDC_CENTERED_METRICS),
        "regime_centered": list(REGIME_CENTERED_METRICS),
        "derived_from": dict(DERIVED_FROM),
        "direction": {m: _direction_for_metric(m) for m in metrics},
        "all_metrics": metrics,  # convenient + still small
    }


def _compute_policy_stats_by_metric(rows: list[dict[str, Any]], metrics: list[str]) -> dict[str, dict[str, Any]]:
    """
    policy_stats_by_metric[metric][policy] -> {n, mean, std}
    """
    by_policy: dict[str, list[dict[str, Any]]] = {}
    for r in rows:
        by_policy.setdefault(str(r.get("policy", "")), []).append(r)

    out: dict[str, dict[str, Any]] = {m: {} for m in metrics}
    for m in metrics:
        for pol, rws in by_policy.items():
            xs: list[float] = []
            for r in rws:
                v = _safe_float(r.get(m, None))
                if v is None:
                    continue
                xs.append(v)
            mu, sd = _mean_std(xs)
            out[m][pol] = {"n": len(xs), "mean": mu, "std": sd}
    return out


def _compute_case_policy_stats_by_metric(
    rows: list[dict[str, Any]], metrics: list[str]
) -> dict[str, dict[str, dict[str, Any]]]:
    """
    case_policy_stats_by_metric[metric][case][policy] -> {n, mean, std}
    """
    by_case: dict[str, dict[str, list[dict[str, Any]]]] = {}
    for r in rows:
        case = str(r.get("case", ""))
        pol = str(r.get("policy", ""))
        by_case.setdefault(case, {}).setdefault(pol, []).append(r)

    out: dict[str, dict[str, dict[str, Any]]] = {m: {} for m in metrics}
    for m in metrics:
        for case, pol_map in by_case.items():
            out[m].setdefault(case, {})
            for pol, rws in pol_map.items():
                xs: list[float] = []
                for r in rws:
                    v = _safe_float(r.get(m, None))
                    if v is None:
                        continue
                    xs.append(v)
                mu, sd = _mean_std(xs)
                out[m][case][pol] = {"n": len(xs), "mean": mu, "std": sd}
    return out


def _compute_win_rates_vs_baseline(
    rows: list[dict[str, Any]],
    *,
    metrics: list[str],
    directions: dict[str, str],
    policies: list[str],
    baseline: str,
) -> dict[str, Any]:
    """
    win_rates_vs_baseline[metric] = {
      metric, direction, pairing, baseline_policy,
      policies: {policy: {wins,total,win_rate}}
    }
    Pairing is strictly (case, seed).
    """
    base_index: dict[tuple[str, int], dict[str, Any]] = {}
    for r in rows:
        if str(r.get("policy", "")) != baseline:
            continue
        key = (str(r.get("case", "")), int(r.get("seed", -1)))
        base_index[key] = r

    out: dict[str, Any] = {}
    for m in metrics:
        direction = str(directions.get(m, _direction_for_metric(m)))
        per_pol: dict[str, Any] = {}

        for pol in policies:
            if pol == baseline:
                continue
            wins = 0
            total = 0
            for r in rows:
                if str(r.get("policy", "")) != pol:
                    continue
                key = (str(r.get("case", "")), int(r.get("seed", -1)))
                br = base_index.get(key)
                if br is None:
                    continue
                v = _safe_float(r.get(m, None))
                b = _safe_float(br.get(m, None))
                if v is None or b is None:
                    continue
                total += 1
                if direction == "min":
                    if v < b:
                        wins += 1
                else:
                    if v > b:
                        wins += 1
            per_pol[pol] = {
                "wins": wins,
                "total": total,
                "win_rate": (wins / total) if total else None,
            }

        out[m] = {
            "metric": m,
            "direction": direction,
            "pairing": "case_seed",
            "baseline_policy": baseline,
            "policies": per_pol,
        }
    return out


def _compute_case_policy_win_rates_vs_baseline(
    rows: list[dict[str, Any]],
    *,
    metrics: list[str],
    directions: dict[str, str],
    policies: list[str],
    baseline: str,
) -> dict[str, Any]:
    """
    case_policy_win_rates_vs_baseline[metric][case] -> win-rates for that case only.
    """
    by_case: dict[str, list[dict[str, Any]]] = {}
    for r in rows:
        by_case.setdefault(str(r.get("case", "")), []).append(r)

    out: dict[str, Any] = {m: {} for m in metrics}
    for m in metrics:
        for case, case_rows in by_case.items():
            out[m][case] = _compute_win_rates_vs_baseline(
                case_rows,
                metrics=[m],
                directions=directions,
                policies=policies,
                baseline=baseline,
            )[m]
    return out
def _stable_drop_key(*parts: Any) -> float:
    """
    Deterministic pseudo-random in [0,1) from a tuple-like key.
    Used for torture tests (drop_frac) without needing RNG state.
    """
    s = json.dumps([str(p) for p in parts], separators=(",", ":"), ensure_ascii=True)
    h = hashlib.sha256(s.encode("utf-8")).hexdigest()[:16]
    # 64-bit int -> [0,1)
    x = int(h, 16) / float(16**16)
    return max(0.0, min(0.999999999999, x))


def _apply_phase_c_torture(
    ok_rows: list[dict[str, Any]],
    *,
    policies: list[str],
    baseline: str,
    torture: dict[str, Any],
) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    """
    Development-only perturbations to validate Phase C robustness.
    Returns (rows_after, torture_report).
    """
    t = torture or {}
    report: dict[str, Any] = {"enabled": bool(t), "applied": {}}
    if not t:
        return ok_rows, report

    rows = list(ok_rows)

    # (1) Missing baseline / fallback baseline: omit baseline rows + remove from policy list if requested.
    if bool(t.get("omit_baseline", False)):
        before = len(rows)
        rows = [r for r in rows if str(r.get("policy", "")) != baseline]
        report["applied"]["omit_baseline"] = {"baseline": baseline, "dropped_rows": before - len(rows)}

    # (2) Partial pairing: deterministically drop some rows by key.
    drop_frac = t.get("drop_frac", None)
    if drop_frac is not None:
        try:
            frac = float(drop_frac)
        except Exception:
            frac = 0.0
        frac = max(0.0, min(0.95, frac))
        drop_policies = t.get("drop_policies", None)
        if isinstance(drop_policies, list) and drop_policies:
            drop_set = {str(x) for x in drop_policies}
        else:
            drop_set = None  # all policies eligible

        before = len(rows)
        kept: list[dict[str, Any]] = []
        for r in rows:
            pol = str(r.get("policy", ""))
            if drop_set is not None and pol not in drop_set:
                kept.append(r)
                continue
            key_case = str(r.get("case", ""))
            key_seed = int(r.get("seed", -1)) if r.get("seed", None) is not None else -1
            # Include policy so we can selectively drop baseline (or non-baseline)
            u = _stable_drop_key(key_case, key_seed, pol, r.get("opr_id", ""))
            if u >= frac:
                kept.append(r)
        rows = kept
        report["applied"]["drop_frac"] = {"drop_frac": frac, "drop_policies": sorted(list(drop_set)) if drop_set else None, "dropped_rows": before - len(rows)}

    # (3) Missing metric columns: strip keys from rows.
    strip_metrics = t.get("strip_metrics", None)
    if isinstance(strip_metrics, list) and strip_metrics:
        strip = {str(x) for x in strip_metrics if str(x)}
        if strip:
            for r in rows:
                for k in strip:
                    r.pop(k, None)
            report["applied"]["strip_metrics"] = {"stripped": sorted(list(strip))}

    # (4) Ordering invariance smoke: reorder rows, does not change protocol_id, should not change aggregates.
    if bool(t.get("shuffle_execution_order", False)):
        # Deterministic shuffle by stable hash (no RNG)
        rows = sorted(
            rows,
            key=lambda r: hashlib.sha256(
                json.dumps(
                    [r.get("case", ""), r.get("seed", None), r.get("policy", ""), r.get("opr_id", "")],
                    separators=(",", ":"),
                    ensure_ascii=True,
                ).encode("utf-8")
            ).hexdigest(),
            reverse=True,
        )
        report["applied"]["shuffle_execution_order"] = True

    return rows, report


def _phase_c_sanity_checks(
    rows: list[dict[str, Any]],
    *,
    metrics: list[str],
    policies: list[str],
    baseline: str,
    directions: dict[str, str],
) -> dict[str, Any]:
    """
    Self-checks that stay within Phase C: confirm pairing logic, missingness,
    and baseline fallback behaviors are explicit and interpretable.
    """
    out: dict[str, Any] = {"ok": True, "warnings": [], "details": {}}

    # Baseline existence (explicitly report; not an error because we fallback).
    have_baseline = any(str(r.get("policy", "")) == baseline for r in rows)
    out["details"]["baseline_present_in_rows"] = bool(have_baseline)
    if not have_baseline:
        out["warnings"].append(f"baseline_policy '{baseline}' has no rows; win-rates will have total=0.")

    # Missingness per policy per metric (how many finite values exist out of row-count for that policy)
    by_pol: dict[str, list[dict[str, Any]]] = {}
    for r in rows:
        by_pol.setdefault(str(r.get("policy", "")), []).append(r)

    missingness: dict[str, dict[str, Any]] = {}
    for m in metrics:
        missingness[m] = {}
        for pol in policies:
            rws = by_pol.get(pol, [])
            denom = len(rws)
            n_finite = 0
            for r in rws:
                if _safe_float(r.get(m, None)) is not None:
                    n_finite += 1
            missingness[m][pol] = {
                "rows": denom,
                "n_finite": n_finite,
                "missing_frac": (1.0 - (n_finite / denom)) if denom else None,
            }
    out["details"]["missingness"] = missingness

    # Pairing integrity: for each metric/policy, totals should be <= intersection of finite baseline and finite policy pairs.
    # We recompute the feasible pairing set sizes to catch subtle keying issues.
    pairing: dict[str, Any] = {}
    # baseline map: (case,seed) -> row
    base_rows = [r for r in rows if str(r.get("policy", "")) == baseline]
    base_by_key: dict[tuple[str, int], dict[str, Any]] = {}
    for r in base_rows:
        try:
            key = (str(r.get("case", "")), int(r.get("seed", -1)))
        except Exception:
            continue
        base_by_key[key] = r

    for m in metrics:
        direction = str(directions.get(m, _direction_for_metric(m)))
        pm: dict[str, Any] = {"direction": direction, "policies": {}}
        for pol in policies:
            if pol == baseline:
                continue
            # build policy map
            pol_rows = [r for r in rows if str(r.get("policy", "")) == pol]
            pol_by_key: dict[tuple[str, int], dict[str, Any]] = {}
            for r in pol_rows:
                try:
                    key = (str(r.get("case", "")), int(r.get("seed", -1)))
                except Exception:
                    continue
                pol_by_key[key] = r
            inter_keys = set(base_by_key.keys()) & set(pol_by_key.keys())

            feasible = 0
            for k in inter_keys:
                b = _safe_float(base_by_key[k].get(m, None))
                v = _safe_float(pol_by_key[k].get(m, None))
                if b is None or v is None:
                    continue
                feasible += 1
            pm["policies"][pol] = {"paired_keys": len(inter_keys), "feasible_pairs_finite": feasible}
        pairing[m] = pm
    out["details"]["pairing_feasibility"] = pairing

    return out

def _pick_best_policy_by_mean(
    policy_stats_by_metric: dict[str, dict[str, Any]],
    *,
    metric: str,
    direction: str,
    policies: list[str],
) -> tuple[str | None, float | None]:
    """
    Choose best policy using mean(metric). Deterministic tie-break: order in `policies`.
    """
    stats = policy_stats_by_metric.get(metric, {})
    best_pol: str | None = None
    best_val: float | None = None

    for pol in policies:
        mu = stats.get(pol, {}).get("mean", None)
        if mu is None:
            continue
        try:
            mu_f = float(mu)
        except Exception:
            continue

        if best_pol is None:
            best_pol, best_val = pol, mu_f
            continue

        if direction == "min":
            if mu_f < float(best_val):
                best_pol, best_val = pol, mu_f
        else:
            if mu_f > float(best_val):
                best_pol, best_val = pol, mu_f

    return best_pol, best_val
def _median(xs: list[float]) -> float | None:
    if not xs:
        return None
    ys = sorted(xs)
    n = len(ys)
    mid = n // 2
    if n % 2 == 1:
        return ys[mid]
    return 0.5 * (ys[mid - 1] + ys[mid])

def _pick_best_policy_by_median(
    rows: list[dict[str, Any]],
    *,
    metric: str,
    direction: str,
    policies: list[str],
) -> tuple[str | None, float | None]:
    """
    Choose best policy by median(metric) over all rows.
    Deterministic tie-break: order in `policies`.
    """
    best_pol: str | None = None
    best_val: float | None = None

    for pol in policies:
        xs: list[float] = []
        for r in rows:
            if str(r.get("policy", "")) != pol:
                continue
            v = _safe_float(r.get(metric, None))
            if v is None:
                continue
            xs.append(v)
        med = _median(xs)
        if med is None:
            continue
        if best_pol is None:
            best_pol, best_val = pol, med
            continue
        if direction == "min":
            if med < float(best_val):
                best_pol, best_val = pol, med
        else:
            if med > float(best_val):
                best_pol, best_val = pol, med

    return best_pol, best_val

def _pick_best_policy_by_win_rate_vs_baseline(
    win_rates_vs_baseline: dict[str, Any],
    *,
    metric: str,
    policies: list[str],
    baseline: str,
) -> tuple[str | None, float | None]:
    """
    Choose best policy by paired win-rate vs baseline for a given metric.
    Returns (policy, win_rate). Deterministic tie-break: order in `policies`.
    """
    entry = win_rates_vs_baseline.get(metric, {}) if isinstance(win_rates_vs_baseline, dict) else {}
    pol_map = entry.get("policies", {}) if isinstance(entry.get("policies", {}), dict) else {}

    best_pol: str | None = None
    best_wr: float | None = None
    for pol in policies:
        if pol == baseline:
            continue
        wr = pol_map.get(pol, {}).get("win_rate", None)
        try:
            wr_f = float(wr) if wr is not None else None
        except Exception:
            wr_f = None
        if wr_f is None:
            continue
        if best_pol is None:
            best_pol, best_wr = pol, wr_f
            continue
        # higher win-rate is always better
        if wr_f > float(best_wr):
            best_pol, best_wr = pol, wr_f
    return best_pol, best_wr

def _mean_std(xs: list[float]) -> tuple[float | None, float | None]:
    if not xs:
        return None, None
    mu = sum(xs) / float(len(xs))
    if len(xs) <= 1:
        return mu, 0.0
    var = sum((x - mu) ** 2 for x in xs) / float(len(xs) - 1)
    return mu, var ** 0.5

def _pick_best(rows: list[dict[str, Any]], metric: str) -> dict[str, Any] | None:
    if not rows:
        return None

    def f(r: dict[str, Any], key: str) -> float | None:
        v = r.get(key, None)
        try:
            return float(v)
        except Exception:
            return None

    # Tie-break rules (deterministic):
    # - ttfd: lower is better; tie-break by lower mean_entropy_auc; then higher coverage_auc
    # - mean_entropy_auc: lower; tie-break by lower ttfd; then higher coverage_auc
    # - coverage_auc: higher; tie-break by lower ttfd; then lower mean_entropy_auc
    primary = metric

    candidates: list[dict[str, Any]] = []
    for r in rows:
        if f(r, primary) is None:
            continue
        candidates.append(r)
    if not candidates:
        return None

    if primary in ("ttfd",):
        def sort_key(r):
            ttfd = f(r, "ttfd")
            ent = f(r, "mean_entropy_auc")
            cov = f(r, "coverage_auc")
            # None-safe fallbacks push unknowns to the end.
            return (
                ttfd if ttfd is not None else float("inf"),
                ent if ent is not None else float("inf"),
                -(cov if cov is not None else float("-inf")),
            )
        best_r = sorted(candidates, key=sort_key)[0]
        best_v = f(best_r, primary)
    elif primary in ("mean_entropy_auc", "entropy_auc"):
        def sort_key(r):
            ent = f(r, "mean_entropy_auc") or f(r, "entropy_auc")
            ttfd = f(r, "ttfd")
            cov = f(r, "coverage_auc")
            return (
                ent if ent is not None else float("inf"),
                ttfd if ttfd is not None else float("inf"),
                -(cov if cov is not None else float("-inf")),
            )
        best_r = sorted(candidates, key=sort_key)[0]
        best_v = f(best_r, primary) or f(best_r, "mean_entropy_auc") or f(best_r, "entropy_auc")
    elif primary in ("coverage_auc",):
        def sort_key(r):
            cov = f(r, "coverage_auc")
            ttfd = f(r, "ttfd")
            ent = f(r, "mean_entropy_auc")
            return (
                -(cov if cov is not None else float("-inf")),
                ttfd if ttfd is not None else float("inf"),
                ent if ent is not None else float("inf"),
            )
        best_r = sorted(candidates, key=sort_key)[0]
        best_v = f(best_r, primary)
    elif primary in ("arrival_frac_mean", "delivered_info_proxy_mean", "delivered_info_proxy_sum"):
        def sort_key(r):
            v = f(r, primary)
            return -(v if v is not None else float("-inf"))
        best_r = sorted(candidates, key=sort_key)[0]
        best_v = f(best_r, primary)
    else:
        # Fallback: use metric direction
        direction = _direction_for_metric(primary)
        def sort_key(r):
            v = f(r, primary)
            if direction == "max":
                return -(v if v is not None else float("-inf"))
            return v if v is not None else float("inf")
        best_r = sorted(candidates, key=sort_key)[0]
        best_v = f(best_r, primary)

    out: dict[str, Any] = {"metric": primary, "value": best_v}
    if "policy" in best_r:
        out["policy"] = best_r.get("policy", None)
    if "opr_id" in best_r:
        out["opr_id"] = best_r.get("opr_id", None)
    if "action_model" in best_r:
        out["action_model"] = best_r.get("action_model", None)
    if "epi_id" in best_r:
        out["epi_id"] = best_r.get("epi_id", None)
    return out

def _load_summary_or_empty(run_id: str) -> dict[str, Any]:
    try:
        p = metrics_dir(run_id) / "summary.json"
        if not p.exists():
            return {}
        return json.loads(p.read_text(encoding="utf-8")) or {}
    except Exception:
        return {}

def _compute_compare_metrics_epi(epi_id: str) -> dict[str, Any]:
    """
    Compact row for epistemic analysis tables (pulled from epi summary.json).
    """
    s = _load_summary_or_empty(epi_id)
    return {
        "epi_id": epi_id,
        "entropy_auc": s.get("entropy_auc", None),
        "mdc_violation_rate": s.get("mdc_violation_rate", None),
        "arrival_frac_mean": s.get("arrival_frac_mean", None),
        "delivered_info_proxy_sum": s.get("delivered_info_proxy_sum", None),
        "delivered_info_proxy_mean": s.get("delivered_info_proxy_mean", None),
        "mean_entropy_t0": s.get("mean_entropy_t0", None),
        "mean_entropy_t_end": s.get("mean_entropy_t_end", None),
        "delta_mean_entropy_min": s.get("delta_mean_entropy_min", None),
        "delta_mean_entropy_max": s.get("delta_mean_entropy_max", None),
        "action_model": s.get("action_model", None),
        "action_m": s.get("action_m", None),
        "action_seed": s.get("action_seed", None),
        "loss_prob": s.get("loss_prob", None),
        "delay_geom_p": s.get("delay_geom_p", None),
        "max_delay_steps": s.get("max_delay_steps", None),
        "impairment_mode": s.get("impairment_mode", None),
        # include residual config (useful for interpretability)
        "mdc_eps": s.get("mdc_eps", None),
        "mdc_residual_driver": s.get("mdc_residual_driver", None),
        "mdc_residual_c": s.get("mdc_residual_c", None),
        "mdc_c_arrival": s.get("mdc_c_arrival", None),
        "mdc_c_info": s.get("mdc_c_info", None),
        "H": s.get("H", None),
        "W": s.get("W", None),
        "T": s.get("T", None),
        "dt_seconds": s.get("dt_seconds", None),
        "cell_size_m": s.get("cell_size_m", None),
        "crs_code": s.get("crs_code", None),
    }


def _epistemic_metric_catalog(choose_best_by: str) -> dict[str, Any]:
    choose = str(choose_best_by or "").strip()
    metrics = list(
        dict.fromkeys(
            [
                *EPISTEMIC_HEADLINE_METRICS,
                choose,
            ]
        )
    )
    metrics = [m for m in metrics if m]
    return {
        "headline": list(EPISTEMIC_HEADLINE_METRICS),
        "direction": {m: _direction_for_metric(m) for m in metrics},
        "all_metrics": metrics,
    }


def _compute_action_model_stats_by_metric(
    rows: list[dict[str, Any]],
    metrics: list[str],
) -> dict[str, dict[str, Any]]:
    by_model: dict[str, list[dict[str, Any]]] = {}
    for r in rows:
        by_model.setdefault(str(r.get("action_model", "")), []).append(r)

    out: dict[str, dict[str, Any]] = {m: {} for m in metrics}
    for m in metrics:
        for model, rws in by_model.items():
            xs: list[float] = []
            for r in rws:
                v = _safe_float(r.get(m, None))
                if v is None:
                    continue
                xs.append(v)
            mu, sd = _mean_std(xs)
            out[m][model] = {"n": len(xs), "mean": mu, "std": sd}
    return out


def _compute_action_model_win_rates_vs_baseline(
    rows: list[dict[str, Any]],
    *,
    metrics: list[str],
    directions: dict[str, str],
    action_models: list[str],
    baseline: str,
) -> dict[str, Any]:
    base_rows = [r for r in rows if str(r.get("action_model", "")) == baseline]
    base_row = base_rows[0] if base_rows else None

    out: dict[str, Any] = {}
    for m in metrics:
        direction = str(directions.get(m, _direction_for_metric(m)))
        per_model: dict[str, Any] = {}
        b = _safe_float(base_row.get(m, None)) if base_row else None

        for model in action_models:
            if model == baseline:
                continue
            rr = next((r for r in rows if str(r.get("action_model", "")) == model), None)
            v = _safe_float(rr.get(m, None)) if rr else None
            win_rate = None
            wins = 0
            total = 0
            if v is not None and b is not None:
                total = 1
                if (direction == "min" and v < b) or (direction == "max" and v > b):
                    wins = 1
                win_rate = wins / total
            per_model[model] = {"wins": wins, "total": total, "win_rate": win_rate}

        out[m] = {
            "metric": m,
            "direction": direction,
            "pairing": "single_run_per_action_model",
            "baseline_action_model": baseline,
            "models": per_model,
        }
    return out

@router.post("/create_operational_study")
def create_operational_study(req: CreateOperationalStudyRequest) -> dict[str, Any]:

    """
    Canonical Analysis route for Operational studies.

    One row per run instance in table.csv:
      (case, seed, policy, opr_id, ...metrics...)
    """
    base = req.manifest
    policies = [str(p).strip() for p in (req.policies or []) if str(p).strip()]
    if not policies:
        raise HTTPException(status_code=400, detail="policies list is empty")

    baseline = "greedy" if "greedy" in set(policies) else policies[0]

    seeds = [int(s) for s in (req.seeds or [])]
    if not seeds:
        raise HTTPException(status_code=400, detail="seeds list is empty")

    sweep_cases = req.sweep or [SweepCase(label="base", overrides={})]
    if not sweep_cases:
        raise HTTPException(status_code=400, detail="sweep list is empty")

    # Ensure at least one empty/base case exists for sanity
    if not any((c.overrides or {}) == {} for c in sweep_cases):
        sweep_cases = [SweepCase(label="base", overrides={}), *sweep_cases]

    ana_id = new_id("ana")
    created_at = _utc_now_iso()

    base_manifest_dict = base.model_dump()

    base_protocol_id = _protocol_id_from_base_manifest(
        base_manifest_dict,
        drop=[("network", "policy"), ("o1", "seed")],
    )
    protocol_id = _protocol_id_for_batch_operational(
        base_protocol_id,
        policies=policies,
        seeds=seeds,
        sweep=[c.model_dump() for c in sweep_cases],
        choose_best_by=req.choose_best_by,
    )

    runs: list[dict[str, Any]] = []
    opr_ids: list[str] = []

    # Execute cartesian product: case × seed × policy
    for ci, case in enumerate(sweep_cases):
        case_label = str(case.label or f"case{ci}")
        overrides = dict(case.overrides or {})

        for seed in seeds:
            for pol in policies:
                opr_id: str | None = None
                try:
                    
                    m_dict = base.model_dump()
                    
                    _set_in_dict_by_dotpath(m_dict, "network.policy", pol)
                    _set_in_dict_by_dotpath(m_dict, "o1.seed", int(seed))
                    
                    m2_dict = _apply_overrides_to_manifest_dict(m_dict, overrides)
                    
                    m2 = OperationalManifest.model_validate(m2_dict)

                    opr_id = new_id("opr")
                    save_manifest(opr_id, m2.model_dump())
                    # Record attempted runs so cascade deletion cleans up even if execution fails.
                    opr_ids.append(opr_id)

                    operational_run(RunRequest(id=opr_id))

                    metrics = _compute_compare_metrics(opr_id)

                    
                    row: dict[str, Any] = {
                        "case": case_label,
                        "case_index": int(ci),
                        "seed": int(seed),
                        "policy": pol,
                        "opr_id": opr_id,
                    }

                    
                    try:
                        md = m2.model_dump()
                        impairments = (
                            md.get("impairments", {})
                            if isinstance(md.get("impairments", {}), dict)
                            else {}
                        )
                        net = md.get("network", {}) if isinstance(md.get("network", {}), dict) else {}
                        o1 = md.get("o1", {}) if isinstance(md.get("o1", {}), dict) else {}
                        rgm = md.get("regime_management", {}) if isinstance(md.get("regime_management", {}), dict) else {}
                        if "loss_prob" in impairments: row["loss_prob"] = impairments.get("loss_prob")
                        if "delay_steps" in impairments: row["delay_steps"] = impairments.get("delay_steps")
                        if "noise_level" in impairments: row["noise_level"] = impairments.get("noise_level")
                        if "max_moves_per_step" in net: row["max_moves_per_step"] = net.get("max_moves_per_step")
                        if "deployment_mode" in net: row["deployment_mode"] = net.get("deployment_mode")
                        if "n_sensors" in net: row["n_sensors"] = net.get("n_sensors")
                        if "c_info" in o1: row["c_info"] = o1.get("c_info")
                        if "c_cov" in o1: row["c_cov"] = o1.get("c_cov")
                        if "eps_ref" in o1: row["eps_ref"] = o1.get("eps_ref")

                        
                        if "enabled" in rgm: row["regime_enabled_cfg"] = rgm.get("enabled")
                        if "mode" in rgm: row["regime_mode_cfg"] = rgm.get("mode")

                        tl = rgm.get("transition_logic", {}) if isinstance(rgm.get("transition_logic", {}), dict) else {}
                        ds = tl.get("downshift_thresholds", {}) if isinstance(tl.get("downshift_thresholds", {}), dict) else {}
                        sc = tl.get("switch_to_certified_thresholds", {}) if isinstance(tl.get("switch_to_certified_thresholds", {}), dict) else {}
                        rc = tl.get("recovery_thresholds", {}) if isinstance(tl.get("recovery_thresholds", {}), dict) else {}

                        if "utilization_threshold" in ds: row["downshift_util_cfg"] = ds.get("utilization_threshold")
                        if "utilization_threshold" in sc: row["switch_util_cfg"] = sc.get("utilization_threshold")
                        if "utilization_threshold" in rc: row["recovery_util_cfg"] = rc.get("utilization_threshold")

                        if "strict_drift_proxy_threshold" in ds: row["downshift_strict_proxy_cfg"] = ds.get("strict_drift_proxy_threshold")
                        if "strict_drift_proxy_threshold" in sc: row["switch_strict_proxy_cfg"] = sc.get("strict_drift_proxy_threshold")
                        if "strict_drift_proxy_threshold" in rc: row["recovery_strict_proxy_cfg"] = rc.get("strict_drift_proxy_threshold")

                        if "cumulative_exposure_threshold" in ds: row["downshift_exposure_cfg"] = ds.get("cumulative_exposure_threshold")
                        if "cumulative_exposure_threshold" in sc: row["switch_exposure_cfg"] = sc.get("cumulative_exposure_threshold")
                        if "cumulative_exposure_threshold" in rc: row["recovery_exposure_cfg"] = rc.get("cumulative_exposure_threshold")

                        if "local_drift_rate_threshold" in ds: row["downshift_local_drift_cfg"] = ds.get("local_drift_rate_threshold")
                        if "local_drift_rate_threshold" in sc: row["switch_local_drift_cfg"] = sc.get("local_drift_rate_threshold")
                        if "local_drift_rate_threshold" in rc: row["recovery_local_drift_cfg"] = rc.get("local_drift_rate_threshold")

                        if "persistence_steps" in ds: row["downshift_persistence_cfg"] = ds.get("persistence_steps")
                        if "persistence_steps" in sc: row["switch_persistence_cfg"] = sc.get("persistence_steps")
                        if "persistence_steps" in rc: row["recovery_persistence_cfg"] = rc.get("persistence_steps")

                        if "hysteresis_band" in ds: row["downshift_hysteresis_cfg"] = ds.get("hysteresis_band")
                        if "hysteresis_band" in sc: row["switch_hysteresis_cfg"] = sc.get("hysteresis_band")
                        if "hysteresis_band" in rc: row["recovery_hysteresis_cfg"] = rc.get("hysteresis_band")

                        opp = rgm.get("opportunistic", {}) if isinstance(rgm.get("opportunistic", {}), dict) else {}
                        ladder = opp.get("ladder", []) if isinstance(opp.get("ladder", []), list) else []
                        if len(ladder) > 0 and isinstance(ladder[0], dict):
                            lvl0 = ladder[0]
                            if "level_id" in lvl0: row["opp_level0_id_cfg"] = lvl0.get("level_id")
                            if "healthy_utilization_target" in lvl0: row["opp_level0_util_target_cfg"] = lvl0.get("healthy_utilization_target")
                            if "motion_adjustment" in lvl0: row["opp_level0_motion_adjustment_cfg"] = lvl0.get("motion_adjustment")
                        if len(ladder) > 1 and isinstance(ladder[1], dict):
                            lvl1 = ladder[1]
                            if "level_id" in lvl1: row["opp_level1_id_cfg"] = lvl1.get("level_id")
                            if "healthy_utilization_target" in lvl1: row["opp_level1_util_target_cfg"] = lvl1.get("healthy_utilization_target")
                            if "motion_adjustment" in lvl1: row["opp_level1_motion_adjustment_cfg"] = lvl1.get("motion_adjustment")

                        cert = rgm.get("certified", {}) if isinstance(rgm.get("certified", {}), dict) else {}
                        stages = cert.get("stages", []) if isinstance(cert.get("stages", []), list) else []
                        if len(stages) > 0 and isinstance(stages[0], dict):
                            st0 = stages[0]
                            if "stage_id" in st0: row["cert_stage0_id_cfg"] = st0.get("stage_id")
                            if "entropy_threshold" in st0: row["cert_stage0_entropy_threshold_cfg"] = st0.get("entropy_threshold")
                            if "eta" in st0: row["cert_stage0_eta_cfg"] = st0.get("eta")
                            if "expected_certified_rate" in st0: row["cert_stage0_rate_cfg"] = st0.get("expected_certified_rate")
                        if len(stages) > 1 and isinstance(stages[1], dict):
                            st1 = stages[1]
                            if "stage_id" in st1: row["cert_stage1_id_cfg"] = st1.get("stage_id")
                            if "entropy_threshold" in st1: row["cert_stage1_entropy_threshold_cfg"] = st1.get("entropy_threshold")
                            if "eta" in st1: row["cert_stage1_eta_cfg"] = st1.get("eta")
                            if "expected_certified_rate" in st1: row["cert_stage1_rate_cfg"] = st1.get("expected_certified_rate")

                        
                        row["regime_family_cfg"] = _classify_regime_family_from_cfg(row)
                        row["impairment_level_cfg"] = _classify_impairment_level_from_cfg(row)

                    except Exception:
                        pass

                    runs.append({**row, **metrics})
                except Exception as e:
                    erow: dict[str, Any] = {
                        "case": case_label,
                        "case_index": int(ci),
                        "seed": int(seed),
                        "policy": pol,
                        "error": str(e),
                    }
                    if opr_id:
                        erow["opr_id"] = opr_id
                    runs.append(erow)

    ok_rows = [r for r in runs if "error" not in r]
    _add_derived_metrics(ok_rows)

    ok_rows, torture_report = _apply_phase_c_torture(
        ok_rows,
        policies=policies,
        baseline=baseline,
        torture=req.torture,
    )

    _add_derived_metrics(ok_rows)
    semantics = req.semantics.model_dump()
    policy_semantics = _policy_semantics(policies)
    regime_semantics = _regime_semantics_from_rows(ok_rows)
    policy_semantics["contains_advisory_regime"] = regime_semantics["advisory_metrics_present"]
    policy_semantics["contains_active_regime"] = regime_semantics["active_metrics_present"]

    sweep_context = _sweep_context(sweep_cases, ok_rows)


    save_manifest(
        ana_id,
        {
            "ana_id": ana_id,
            "protocol_id": protocol_id,
            "analysis_contract_version": "analysis_v2",
            "study_type": "operational_study",
            "created_at": created_at,
            "base_manifest": base_manifest_dict,
            "study_semantics": {
                "section": "analysis",
                "source_section": "operational",
                **semantics,
                "taxonomy_version": "analysis_v2",
                "policy_semantics": policy_semantics,
                "regime_semantics": regime_semantics,
            },
            "sweep_context": sweep_context,
            "policies": policies,
            "seeds": seeds,
            "sweep": [c.model_dump() for c in sweep_cases],
            "opr_ids": opr_ids,
            "columns": req.columns,
            "choose_best_by": req.choose_best_by,
        },
    )

    md = metrics_dir(ana_id)
    table_path = md / "table.csv"
    summary_path = md / "summary.json"

    ensure_cols = [
        "case", "case_index", "seed", "policy", "opr_id",
        "loss_prob", "delay_steps", "noise_level",
        "regime_enabled_cfg", "regime_mode_cfg", "regime_family_cfg", "impairment_level_cfg",
        "downshift_util_cfg", "switch_util_cfg", "recovery_util_cfg",
        "downshift_persistence_cfg", "switch_persistence_cfg", "recovery_persistence_cfg",
        "downshift_hysteresis_cfg", "switch_hysteresis_cfg", "recovery_hysteresis_cfg",
        *HEADLINE_METRICS,
        *MDC_CENTERED_METRICS,
        *REGIME_CENTERED_METRICS,
    ]
    used_cols = _write_table_csv(table_path, ok_rows, req.columns, ensure_cols=ensure_cols)


    choose_metric = str(req.choose_best_by or "ttfd").strip() or "ttfd"

    catalog = _metric_catalog(choose_metric)
    metrics_all: list[str] = list(catalog.get("all_metrics", []))
    directions: dict[str, str] = dict(catalog.get("direction", {}))

    baseline = "greedy" if "greedy" in set(policies) else policies[0]

    rows_aug = _augment_rows_for_phase_c(ok_rows)

    policy_stats_by_metric = _compute_policy_stats_by_metric(rows_aug, metrics_all)
    win_rates_vs_baseline = _compute_win_rates_vs_baseline(
        rows_aug,
        metrics=metrics_all,
        directions=directions,
        policies=policies,
        baseline=baseline,
    )

    phase_c_checks = _phase_c_sanity_checks(
        rows_aug,
        metrics=metrics_all,
        policies=policies,
        baseline=baseline,
        directions=directions,
    )

    case_policy_stats_by_metric = _compute_case_policy_stats_by_metric(rows_aug, metrics_all)
    case_policy_win_rates_vs_baseline = _compute_case_policy_win_rates_vs_baseline(
        rows_aug,
        metrics=metrics_all,
        directions=directions,
        policies=policies,
        baseline=baseline,
    )

    direction_choose = str(directions.get(choose_metric, _direction_for_metric(choose_metric)))
    best_policy, best_value = _pick_best_policy_by_mean(
        policy_stats_by_metric,
        metric=choose_metric,
        direction=direction_choose,
        policies=policies,
    )

    # Robust alternatives (for sanity / tool dev)
    best_policy_median, best_value_median = _pick_best_policy_by_median(
        rows_aug,
        metric=choose_metric,
        direction=direction_choose,
        policies=policies,
    )
    best_policy_wr, best_value_wr = _pick_best_policy_by_win_rate_vs_baseline(
        win_rates_vs_baseline,
        metric=choose_metric,
        policies=policies,
        baseline=baseline,
    )

    metric_semantics = _metric_semantics(
        {
            "headline": catalog["headline"],
            "mdc_centered": catalog["mdc_centered"],
            "regime_centered": catalog["regime_centered"],
            "direction": {m: directions[m] for m in metrics_all},
        }
    )

    write_summary_json(
        summary_path,
        {
            "ana_id": ana_id,
            "protocol_id": protocol_id,
            "analysis_contract_version": "analysis_v2",
            "study_type": "operational_study",
            "created_at": created_at,
            "study_semantics": {
                "section": "analysis",
                "source_section": "operational",
                **semantics,
                "taxonomy_version": "analysis_v2",
                "policy_semantics": policy_semantics,
                "regime_semantics": regime_semantics,
            },
            "sweep_context": sweep_context,
            "policies": policies,
            "seeds": seeds,
            "sweep": [c.model_dump() for c in sweep_cases],
            "opr_ids": opr_ids,
            "choose_best_by": choose_metric,


            "metrics_catalog": {
                "headline": catalog["headline"],
                "mdc_centered": catalog["mdc_centered"],
                "regime_centered": catalog["regime_centered"],
                "direction": {m: directions[m] for m in metrics_all},
                "derived_from": catalog["derived_from"],
            },
            "metric_semantics": metric_semantics,
            "baseline_policy": baseline,
            "best": {"metric": choose_metric, "policy": best_policy, "value": best_value, "by": "mean"},
            "best_robust": {
                "by_median": {"metric": choose_metric, "policy": best_policy_median, "value": best_value_median},
                "by_win_rate_vs_baseline": {"metric": choose_metric, "policy": best_policy_wr, "value": best_value_wr},
            },
            "policy_stats_by_metric": policy_stats_by_metric,
            "win_rates_vs_baseline": win_rates_vs_baseline,
            "case_policy_stats_by_metric": case_policy_stats_by_metric,
            "case_policy_win_rates_vs_baseline": case_policy_win_rates_vs_baseline,
            "phase_c_torture": torture_report,
            "phase_c_checks": phase_c_checks,
            "columns": used_cols,
            "row_count": len(ok_rows),
        },
    )

    return {
        "ok": True,
        "ana_id": ana_id,
        "protocol_id": protocol_id,
        "opr_ids": opr_ids,
        "row_count": len(ok_rows),
        "summary": str(summary_path),
        "table_csv": str(table_path),
        "runs": runs,  # includes error rows (if any)
    }


@router.get("/list", response_model=ListResponse)
def list_analysis() -> ListResponse:
    return ListResponse(ids=list_manifests("ana"))

class AnalysisListItem(BaseModel):
    ana_id: str
    study_type: str
    created_at: str | None = None
    protocol_id: str | None = None
    phy_id: str | None = None
    run_count: int = 0
    choose_best_by: str | None = None
    study_family: str | None = None
    comparison_axis: str | None = None
    comparison_tier: str | None = None
    preset_origin: str | None = None


class AnalysisListVerboseResponse(BaseModel):
    items: list[AnalysisListItem]


def _safe_get_phy_id(mm: dict[str, Any]) -> str | None:
    base = mm.get("base_manifest")
    if isinstance(base, dict):
        v = base.get("phy_id", None)
        return str(v) if v is not None else None
    return None


@router.get("/list_verbose", response_model=AnalysisListVerboseResponse)
def list_analysis_verbose() -> AnalysisListVerboseResponse:
    """
    Lightweight listing for UI dropdowns.

    Returns metadata needed to label studies without fetching summary.json for each:
      - ana_id, study_type, created_at, protocol_id, phy_id, run_count, choose_best_by
    """
    items: list[AnalysisListItem] = []

    for ana_id in list_manifests("ana"):
        try:
            mm = load_manifest(ana_id)
        except Exception:
            continue
        if not isinstance(mm, dict):
            continue

        study_type = str(mm.get("study_type", "") or "")
        created_at = mm.get("created_at", None)
        protocol_id = mm.get("protocol_id", None)
        choose_best_by = mm.get("choose_best_by", None)
        study_semantics = mm.get("study_semantics", {}) if isinstance(mm.get("study_semantics", {}), dict) else {}

        run_count = 0
        if isinstance(mm.get("opr_ids", None), list):
            run_count = len(mm["opr_ids"])

        items.append(
            AnalysisListItem(
                ana_id=str(ana_id),
                study_type=study_type,
                created_at=str(created_at) if created_at is not None else None,
                protocol_id=str(protocol_id) if protocol_id is not None else None,
                phy_id=_safe_get_phy_id(mm),
                run_count=run_count,
                choose_best_by=str(choose_best_by) if choose_best_by is not None else None,
                study_family=str(study_semantics.get("study_family")) if study_semantics.get("study_family") is not None else None,
                comparison_axis=str(study_semantics.get("comparison_axis")) if study_semantics.get("comparison_axis") is not None else None,
                comparison_tier=str(study_semantics.get("comparison_tier")) if study_semantics.get("comparison_tier") is not None else None,
                preset_origin=str(study_semantics.get("preset_origin")) if study_semantics.get("preset_origin") is not None else None,
            )
        )

    # Newest first (ISO timestamps sort lexicographically).
    items.sort(key=lambda x: (x.created_at or ""), reverse=True)
    return AnalysisListVerboseResponse(items=items)


@router.get("/{ana_id}/summary")
def analysis_summary(ana_id: str) -> dict[str, Any]:
    p = metrics_dir(ana_id) / "summary.json"
    if not p.exists():
        raise HTTPException(status_code=404, detail="analysis summary not found")
    return json.loads(p.read_text(encoding="utf-8"))

@router.get("/{ana_id}/manifest")
def analysis_manifest(ana_id: str) -> dict[str, Any]:
    """
    Return the stored analysis manifest (protocol record).
    This includes base_manifest and the created opr_ids.
    """
    try:
        m = load_manifest(ana_id)
    except Exception:
        raise HTTPException(status_code=404, detail="analysis manifest not found")
    if not isinstance(m, dict):
        raise HTTPException(status_code=500, detail="invalid analysis manifest format")
    return m


@router.get("/{ana_id}/table.csv")
def analysis_table_csv(ana_id: str):
    p = metrics_dir(ana_id) / "table.csv"
    if not p.exists():
        raise HTTPException(status_code=404, detail="analysis table.csv not found")
    return FileResponse(p, media_type="text/csv")

@router.get("/{ana_id}/table_meta")
def analysis_table_meta(ana_id: str) -> dict[str, Any]:
    """Metadata for table.csv without downloading it."""
    p = metrics_dir(ana_id) / "table.csv"
    if not p.exists():
        raise HTTPException(status_code=404, detail="analysis table.csv not found")

    cols = _csv_header(p)
    try:
        size_bytes = int(p.stat().st_size)
    except Exception:
        size_bytes = 0

    row_count = _count_csv_data_rows(p)
    return {
        "ana_id": ana_id,
        "columns": cols,
        "row_count": row_count,
        "size_bytes": size_bytes,
    }

@router.get("/{ana_id}/table_preview")
def analysis_table_preview(
    ana_id: str,
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
) -> dict[str, Any]:
    """Small JSON preview of table.csv (quote-safe) for UI rendering."""
    p = metrics_dir(ana_id) / "table.csv"
    if not p.exists():
        raise HTTPException(status_code=404, detail="analysis table.csv not found")
    cols, rows = _csv_preview_rows(p, limit=limit, offset=offset)
    return {"ana_id": ana_id, "columns": cols, "rows": rows, "limit": limit, "offset": offset}

@router.delete("/{ana_id}")
def delete_analysis(ana_id: str, cascade: bool = Query(True)) -> dict[str, Any]:
    """
    Delete an analysis study (ana-*).

    - Always deletes the study artifacts for ana_id.
    - If cascade=true: also deletes the underlying opr runs listed in the analysis manifest.
    """
    try:
        mm = load_manifest(ana_id)
    except Exception:
        raise HTTPException(status_code=404, detail="analysis manifest not found")
    if not isinstance(mm, dict):
        raise HTTPException(status_code=500, detail="invalid analysis manifest format")


    # Always delete the analysis study artifacts (manifest + fields + renders + metrics if any)
    delete_run_artifacts(ana_id)

    deleted_opr: list[str] = []

    if cascade:
        opr_ids = mm.get("opr_ids", [])
        if isinstance(opr_ids, list):
            for oid in opr_ids:
                oid = str(oid)
                delete_run_artifacts(oid)
                deleted_opr.append(oid)

    return {
        "ok": True,
        "ana_id": ana_id,
        "cascade": cascade,
        "deleted_opr_ids": deleted_opr,
    }

__all__ = ["router"]
