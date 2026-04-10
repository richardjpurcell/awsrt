from __future__ import annotations

import json
import math

from typing import Any, Optional
from collections import deque

from pydantic import BaseModel, Field

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse

import numpy as np
import zarr

from awsrt_core.io.ids import new_id
from awsrt_core.io.paths import (
    delete_run_artifacts,
    load_manifest,
    save_manifest,
    list_manifests,
    zarr_path,
    open_zarr_array,
    renders_t_dir,
    metrics_dir,
    _metrics_dir_path,
)
from awsrt_core.io.renders import (
    render_deployment_overlay_png,
    render_front_band_png,
)
from awsrt_core.schemas.common import ListResponse, MetaResponse, RunRequest
from awsrt_core.schemas.operational import OperationalManifest
from awsrt_core.operational.policies import (
    compute_score_map,
    get_uncertainty_score_debug_snapshot,
    reset_uncertainty_score_debug_snapshot,
    topk_with_separation,
    move_sensors_mdc_limited,
)
from awsrt_core.operational.sensors import (
    offsets_within_radius,
    detect_fire_at_sensors,
    move_sensors_greedy_limited,
    clamp_rc,
)
from awsrt_core.metrics.basic import (
    write_summary_json,
    write_steps_csv,
    entropy_auc,
    time_to_first_detect,
)

router = APIRouter()

# Compact usefulness support signals used by the usefulness_proto controller
# path for state interpretation, logging, and audit.
USEFULNESS_SUPPORT_WINDOW = 10

# Compact usefulness-aware controller prototype.
# This remains backend-local and behaviorally active on the
# usefulness_proto path, without implying full unification with the
# broader regime-management layer.
USEFULNESS_PROTO_POLICY = "usefulness_proto"
USEFULNESS_STATE_EXPLOIT = 0
USEFULNESS_STATE_RECOVER = 1
USEFULNESS_STATE_CAUTION = 2

# Enter recover when recent support has weakened enough that full exploit is
# no longer justified, but strong caution is not yet required.
USEFULNESS_RECOVER_AGE_THRESHOLD = 1.0
USEFULNESS_RECOVER_MISLEADING_POS_FRAC_THRESHOLD = 0.15
USEFULNESS_RECOVER_DRIVER_INFO_LOW_THRESHOLD = 2.0e-4
USEFULNESS_RECOVER_ARRIVALS_HIGH_THRESHOLD = 0.80

# Enter caution when recent information quality looks strongly degraded.
USEFULNESS_CAUTION_AGE_THRESHOLD = 2.0
USEFULNESS_CAUTION_MISLEADING_POS_FRAC_THRESHOLD = 0.30
# Corruption-side caution should fire under materially weakened useful
# information, not only near-total collapse. The previous 1e-6 threshold was
# too strict relative to observed delayed-aligned driver magnitudes in
# moderate/strong noise runs, so noisy-but-still-active cases stayed in
# exploit even when misleadingness was clearly elevated.
USEFULNESS_CAUTION_DRIVER_INFO_LOW_THRESHOLD = 2.0e-4
USEFULNESS_CAUTION_ARRIVALS_HIGH_THRESHOLD = 0.80

# Subgoal G:
# Delay-heavy cases should default to recover, not caution.
# Reserve caution for either:
#   1) corruption-style degraded activity, or
#   2) explicitly severe stale-but-still-active delay.
#
# Keep this backend-local and compact for the first semantic pass.
USEFULNESS_SEVERE_DELAY_AGE_THRESHOLD = 4.0

# Return from caution to recover when support has partially requalified but is
# not yet clean enough for full exploit.
USEFULNESS_RECOVER_EXIT_AGE_THRESHOLD = 1.0
USEFULNESS_RECOVER_EXIT_MISLEADING_POS_FRAC_THRESHOLD = 0.20
USEFULNESS_RECOVER_EXIT_DRIVER_INFO_RECOVER_THRESHOLD = 1.0e-5

# Return to exploit only when recent conditions look clearly healthy again.
USEFULNESS_EXPLOIT_AGE_THRESHOLD = 0.5
USEFULNESS_EXPLOIT_MISLEADING_POS_FRAC_THRESHOLD = 0.15
USEFULNESS_EXPLOIT_DRIVER_INFO_RECOVER_THRESHOLD = 1.0e-5

USEFULNESS_RECOVER_PERSISTENCE = 2
USEFULNESS_CAUTION_PERSISTENCE = 3
USEFULNESS_RECOVER_EXIT_PERSISTENCE = 2
USEFULNESS_EXPLOIT_PERSISTENCE = 3

class ComparePoliciesRequest(BaseModel):
    """
    Create + run multiple operational runs from the same base manifest, varying only policy.

    Intended for fast iteration now; later Analysis/Graphic can call this endpoint or reuse its logic.
    """
    manifest: OperationalManifest
    policies: list[str] = Field(default_factory=lambda: ["random_feasible", "uncertainty", "mdc_info"])



# ----------------------------
# Generic / shared helpers
# ----------------------------

def _load_opr_summary_or_none(opr_id: str) -> dict[str, Any] | None:
    p = _metrics_dir_path(opr_id) / "summary.json"
    try:
        if not p.exists():
            return None
        with p.open("r", encoding="utf-8") as f:
            data = json.load(f)
        return data if isinstance(data, dict) else None
    except Exception:
        return None


def _summary_with_advisory_compat_aliases(summary: dict[str, Any]) -> dict[str, Any]:
    """
    Compatibility shim for older frontend readers.

    Canonical advisory summary keys are:
      - regime_last_state
      - regime_last_certified_stage_index
      - regime_last_opportunistic_level_index
      - regime_last_certified_stage_id
      - regime_last_opportunistic_level_id

    Older readers may still request advisory-prefixed aliases. Populate those
    lazily from the canonical keys if they are absent.
    """
    s = dict(summary)
    alias_map = {
        "regime_advisory_last_state": "regime_last_state",
        "regime_advisory_last_certified_stage_index": "regime_last_certified_stage_index",
        "regime_advisory_last_opportunistic_level_index": "regime_last_opportunistic_level_index",
        "regime_advisory_last_certified_stage_id": "regime_last_certified_stage_id",
        "regime_advisory_last_opportunistic_level_id": "regime_last_opportunistic_level_id",
    }
    for alias_key, canonical_key in alias_map.items():
        if alias_key not in s and canonical_key in s:
            s[alias_key] = s.get(canonical_key)
    return s


def _build_usefulness_proto_summary(
    *,
    T: int,
    usefulness_proto_enabled: bool,
    usefulness_regime_state: np.ndarray,
    usefulness_trigger_recover: np.ndarray,
    usefulness_trigger_caution: np.ndarray,
    usefulness_trigger_recover_from_caution: np.ndarray,
    usefulness_trigger_exploit: np.ndarray,
) -> dict[str, Any]:
    return {
        "usefulness_proto_enabled": bool(usefulness_proto_enabled),
        "usefulness_regime_state_last": int(usefulness_regime_state[-1]) if T > 0 else 0,
        "usefulness_regime_state_exploit_frac": _frac_eq(
            usefulness_regime_state,
            USEFULNESS_STATE_EXPLOIT,
        ),
        "usefulness_regime_state_recover_frac": _frac_eq(
            usefulness_regime_state,
            USEFULNESS_STATE_RECOVER,
        ),
        "usefulness_regime_state_caution_frac": _frac_eq(
            usefulness_regime_state,
            USEFULNESS_STATE_CAUTION,
        ),
        "usefulness_trigger_recover_hits": int(np.count_nonzero(usefulness_trigger_recover)),
        "usefulness_trigger_caution_hits": int(np.count_nonzero(usefulness_trigger_caution)),
        "usefulness_trigger_recover_from_caution_hits": int(
            np.count_nonzero(usefulness_trigger_recover_from_caution)
        ),
        "usefulness_trigger_exploit_hits": int(np.count_nonzero(usefulness_trigger_exploit)),
    }


def _build_regime_advisory_summary(
    *,
    T: int,
    regime_enabled: bool,
    regime_mode: str,
    rgm_stages: list[Any],
    rgm_ladder: list[Any],
    regime_utilization: np.ndarray,
    regime_strict_drift_proxy: np.ndarray,
    regime_local_drift_rate: np.ndarray,
    regime_cumulative_exposure: np.ndarray,
    regime_requal_support_score: np.ndarray,
    regime_requal_support_breadth: np.ndarray,
    regime_trigger_downshift: np.ndarray,
    regime_trigger_switch_to_certified: np.ndarray,
    regime_trigger_recovery: np.ndarray,
    regime_state: np.ndarray,
    regime_certified_stage_index: np.ndarray,
    regime_opportunistic_level_index: np.ndarray,
    regime_advisory_stage_eta: np.ndarray,
) -> dict[str, Any]:
    return {
        "regime_enabled": bool(regime_enabled),
        "regime_mode": str(regime_mode),
        "regime_advisory_enabled": bool(regime_enabled),
        "regime_stage_ids": [str(getattr(x, "stage_id", "")) for x in rgm_stages],
        "regime_opportunistic_level_ids": [str(getattr(x, "level_id", "")) for x in rgm_ladder],
        "regime_utilization_mean": float(np.mean(regime_utilization)) if T > 0 else None,
        "regime_strict_drift_proxy_mean": float(np.mean(regime_strict_drift_proxy)) if T > 0 else None,
        "regime_local_drift_rate_mean": float(np.mean(regime_local_drift_rate)) if T > 0 else None,
        "regime_cumulative_exposure_final": float(regime_cumulative_exposure[-1]) if T > 0 else None,
        "regime_requal_support_score_mean": float(np.mean(regime_requal_support_score)) if T > 0 else None,
        "regime_requal_support_score_max": float(np.max(regime_requal_support_score)) if T > 0 else None,
        "regime_requal_support_breadth_mean": float(np.mean(regime_requal_support_breadth)) if T > 0 else None,
        "regime_requal_support_breadth_max": float(np.max(regime_requal_support_breadth)) if T > 0 else None,
        "regime_advisory_downshift_trigger_hits": int(np.count_nonzero(regime_trigger_downshift)),
        "regime_advisory_switch_to_certified_trigger_hits": int(np.count_nonzero(regime_trigger_switch_to_certified)),
        "regime_advisory_recovery_trigger_hits": int(np.count_nonzero(regime_trigger_recovery)),
        "regime_last_state": int(regime_state[-1]) if T > 0 else 0,
        "regime_last_certified_stage_index": int(regime_certified_stage_index[-1]) if T > 0 else -1,
        "regime_last_opportunistic_level_index": int(regime_opportunistic_level_index[-1]) if T > 0 else -1,
        "regime_last_certified_stage_id": (
            str(rgm_stages[int(regime_certified_stage_index[-1])].stage_id)
            if T > 0 and 0 <= int(regime_certified_stage_index[-1]) < len(rgm_stages)
            else None
        ),
        "regime_advisory_stage_eta_mean": float(np.mean(regime_advisory_stage_eta)) if T > 0 else None,
        "regime_advisory_stage_eta_last": float(regime_advisory_stage_eta[-1]) if T > 0 else None,
        "regime_last_opportunistic_level_id": (
            str(rgm_ladder[int(regime_opportunistic_level_index[-1])].level_id)
            if T > 0 and 0 <= int(regime_opportunistic_level_index[-1]) < len(rgm_ladder)
            else None
        ),
    }


def _build_regime_active_summary(
    *,
    T: int,
    regime_active_enabled: bool,
    active_verify_style: bool,
    rgm_stages: list[Any],
    rgm_ladder: list[Any],
    regime_active_transition_event: np.ndarray,
    regime_active_state: np.ndarray,
    regime_active_certified_stage_index: np.ndarray,
    regime_active_opportunistic_level_index: np.ndarray,
    regime_effective_eta: np.ndarray,
    regime_effective_move_budget_cells: np.ndarray,
) -> dict[str, Any]:
    return {
        "regime_active_enabled": bool(regime_active_enabled),
        "regime_active_verify_style": bool(active_verify_style),
        "regime_active_transition_count": int(np.count_nonzero(regime_active_transition_event)),
        "regime_active_last_state": int(regime_active_state[-1]) if T > 0 else 0,
        "regime_active_last_certified_stage_index": (
            int(regime_active_certified_stage_index[-1])
            if T > 0 and int(regime_active_state[-1]) == 3 else -1
        ),
        "regime_active_last_opportunistic_level_index": int(regime_active_opportunistic_level_index[-1]) if T > 0 else -1,
        "regime_active_last_certified_stage_id": (
            str(rgm_stages[int(regime_active_certified_stage_index[-1])].stage_id)
            if T > 0 and int(regime_active_state[-1]) == 3
            and 0 <= int(regime_active_certified_stage_index[-1]) < len(rgm_stages)
            else None
        ),
        "regime_active_last_opportunistic_level_id": (
            str(rgm_ladder[int(regime_active_opportunistic_level_index[-1])].level_id)
            if T > 0 and 0 <= int(regime_active_opportunistic_level_index[-1]) < len(rgm_ladder)
            else None
        ),
        "regime_effective_eta_mean": float(np.mean(regime_effective_eta)) if T > 0 else None,
        "regime_effective_move_budget_cells_mean": float(np.mean(regime_effective_move_budget_cells)) if T > 0 else None,
        "regime_effective_eta_last": float(regime_effective_eta[-1]) if T > 0 else None,
        "regime_effective_move_budget_cells_last": float(regime_effective_move_budget_cells[-1]) if T > 0 else None,
        "regime_active_state_disabled_frac": _frac_eq(regime_active_state, 0),
        "regime_active_state_nominal_frac": _frac_eq(regime_active_state, 1),
        "regime_active_state_downshift_frac": _frac_eq(regime_active_state, 2),
        "regime_active_state_certified_frac": _frac_eq(regime_active_state, 3),
        "regime_active_state_disabled_steps": int(np.count_nonzero(regime_active_state == 0)),
        "regime_active_state_nominal_steps": int(np.count_nonzero(regime_active_state == 1)),
        "regime_active_state_downshift_steps": int(np.count_nonzero(regime_active_state == 2)),
        "regime_active_state_certified_steps": int(np.count_nonzero(regime_active_state == 3)),
    }

def _read_series_1d_or_empty(opr_id: str, name: str) -> np.ndarray:
    """
    Read a 1D series from operational zarr. Returns empty float32 array if missing.
    """
    try:
        a = open_zarr_array(zarr_path(opr_id, name), mode="r")
        x = np.asarray(a[:], dtype=np.float32).reshape(-1)
        return x
    except Exception:
        return np.zeros((0,), dtype=np.float32)


def _safe_mean(x: np.ndarray) -> Optional[float]:
    if x is None:
        return None
    x = np.asarray(x).reshape(-1)
    if x.size == 0:
        return None
    return float(np.mean(x))


def _frac_eq(x: np.ndarray, value: int) -> Optional[float]:
    x = np.asarray(x).reshape(-1)
    if x.size == 0:
        return None
    return float(np.mean((x == int(value)).astype(np.float32)))


def _rolling_mean_valid(x: np.ndarray, start: int, end: int) -> Optional[float]:
    """
    Mean over x[start:end] after dropping invalid entries:
      - None
      - non-finite values
      - for integer age-style series, caller should pass only the raw slice and
        rely on this helper's explicit nonnegative filter

    Intended first use:
      - obs_age_steps, where negative values mean "no valid age"
    """
    xs = np.asarray(x[start:end]).reshape(-1)
    if xs.size == 0:
        return None
    xs = xs[np.isfinite(xs)]
    if xs.size == 0:
        return None
    xs = xs[xs >= 0]
    if xs.size == 0:
        return None
    return float(np.mean(xs.astype(np.float32)))


def _rolling_mean(x: np.ndarray, start: int, end: int) -> Optional[float]:
    """
    Mean over x[start:end] after dropping non-finite values.
    """
    xs = np.asarray(x[start:end]).reshape(-1)
    if xs.size == 0:
        return None
    xs = xs[np.isfinite(xs)]
    if xs.size == 0:
        return None
    return float(np.mean(xs.astype(np.float32)))


def _rolling_positive_fraction(x: np.ndarray, start: int, end: int) -> Optional[float]:
    """
    Fraction of valid entries in x[start:end] that are strictly positive.
    """
    xs = np.asarray(x[start:end]).reshape(-1)
    if xs.size == 0:
        return None
    xs = xs[np.isfinite(xs)]
    if xs.size == 0:
        return None
    return float(np.mean((xs > 0).astype(np.float32)))

# ----------------------------
# Compact usefulness helpers
# ----------------------------

def _usefulness_trigger_recover(
    *,
    recent_obs_age_mean_valid: Optional[float],
    recent_misleading_activity_pos_frac: Optional[float],
    recent_driver_info_true_mean: Optional[float],
    arrivals_frac_t: float,
) -> bool:
    age_weakened = (
        recent_obs_age_mean_valid is not None
        and float(recent_obs_age_mean_valid) >= float(USEFULNESS_RECOVER_AGE_THRESHOLD)
    )
    misleading_weakened = (
        recent_misleading_activity_pos_frac is not None
        and float(recent_misleading_activity_pos_frac)
        >= float(USEFULNESS_RECOVER_MISLEADING_POS_FRAC_THRESHOLD)
    )
    low_info_while_active = (
        float(arrivals_frac_t) >= float(USEFULNESS_RECOVER_ARRIVALS_HIGH_THRESHOLD)
        and recent_driver_info_true_mean is not None
        and float(recent_driver_info_true_mean)
        <= float(USEFULNESS_RECOVER_DRIVER_INFO_LOW_THRESHOLD)
    )
    corruption_weakened = bool(misleading_weakened and low_info_while_active)
    return bool(age_weakened or corruption_weakened)


def _usefulness_trigger_caution(
    *,
    recent_obs_age_mean_valid: Optional[float],
    recent_misleading_activity_pos_frac: Optional[float],
    recent_driver_info_true_mean: Optional[float],
    arrivals_frac_t: float,
) -> bool:
    age_bad = (
        recent_obs_age_mean_valid is not None
        and float(recent_obs_age_mean_valid) >= float(USEFULNESS_CAUTION_AGE_THRESHOLD)
    )
    misleading_bad = (
        recent_misleading_activity_pos_frac is not None
        and float(recent_misleading_activity_pos_frac)
        >= float(USEFULNESS_CAUTION_MISLEADING_POS_FRAC_THRESHOLD)
    )
    low_info_while_active = (
        float(arrivals_frac_t) >= float(USEFULNESS_CAUTION_ARRIVALS_HIGH_THRESHOLD)
        and recent_driver_info_true_mean is not None
        and float(recent_driver_info_true_mean)
        <= float(USEFULNESS_CAUTION_DRIVER_INFO_LOW_THRESHOLD)
    )
    corruption_bad = bool(misleading_bad and low_info_while_active)

    # Subgoal G semantics:
    # age-driven degradation should map to recover by default.
    # Pure staleness should only promote to caution when it is explicitly
    # severe AND still reflects stale-but-active weak information flow.
    severe_delay_bad = bool(
        recent_obs_age_mean_valid is not None
        and float(recent_obs_age_mean_valid) >= float(USEFULNESS_SEVERE_DELAY_AGE_THRESHOLD)
        and recent_misleading_activity_pos_frac is not None
        and float(recent_misleading_activity_pos_frac)
        >= float(USEFULNESS_CAUTION_MISLEADING_POS_FRAC_THRESHOLD)
        and float(arrivals_frac_t) >= float(USEFULNESS_CAUTION_ARRIVALS_HIGH_THRESHOLD)
        and recent_driver_info_true_mean is not None
        and float(recent_driver_info_true_mean)
        <= float(USEFULNESS_CAUTION_DRIVER_INFO_LOW_THRESHOLD)
    )

    return bool(corruption_bad or severe_delay_bad)


def _usefulness_trigger_recover_from_caution(
    *,
    recent_obs_age_mean_valid: Optional[float],
    recent_misleading_activity_pos_frac: Optional[float],
    recent_driver_info_true_mean: Optional[float],
    arrivals_frac_t: float,
) -> bool:
    age_ok = (
        recent_obs_age_mean_valid is not None
        and float(recent_obs_age_mean_valid) <= float(USEFULNESS_RECOVER_EXIT_AGE_THRESHOLD)
    )
    misleading_ok = (
        recent_misleading_activity_pos_frac is not None
        and float(recent_misleading_activity_pos_frac)
        <= float(USEFULNESS_RECOVER_EXIT_MISLEADING_POS_FRAC_THRESHOLD)
    )
    info_ok = (
        recent_driver_info_true_mean is not None
        and float(recent_driver_info_true_mean)
        >= float(USEFULNESS_RECOVER_EXIT_DRIVER_INFO_RECOVER_THRESHOLD)
    )
    healthy_recover_exit = bool(age_ok and misleading_ok and info_ok)

    # Subgoal G refinement:
    # allow caution -> recover when the run is still stale, but the condition
    # reads as stale-but-active rather than corruption-like breakdown.
    #
    # This prevents moderate/strong delay runs from getting trapped in caution
    # solely because age stays high after an early caution entry.
    stale_but_active_recover = bool(
        recent_obs_age_mean_valid is not None
        and float(recent_obs_age_mean_valid) >= float(USEFULNESS_RECOVER_AGE_THRESHOLD)
        and recent_misleading_activity_pos_frac is not None
        and float(recent_misleading_activity_pos_frac)
        <= float(USEFULNESS_RECOVER_EXIT_MISLEADING_POS_FRAC_THRESHOLD)
        and float(arrivals_frac_t) >= float(USEFULNESS_RECOVER_ARRIVALS_HIGH_THRESHOLD)
        and recent_driver_info_true_mean is not None
        and float(recent_driver_info_true_mean)
        > float(USEFULNESS_CAUTION_DRIVER_INFO_LOW_THRESHOLD)
    )

    return bool(healthy_recover_exit or stale_but_active_recover)


def _usefulness_trigger_exploit(
    *,
    recent_obs_age_mean_valid: Optional[float],
    recent_misleading_activity_pos_frac: Optional[float],
    recent_driver_info_true_mean: Optional[float],
    arrivals_frac_t: float,
) -> bool:
    """
    First-pass exploit re-entry trigger for recover -> exploit.

    Subgoal I refinement:
    require arrivals-side health as well, so recover -> exploit is gated by
    both "clean recent conditions" and "still-active delivered opportunity".
    """
    age_ok = (
        recent_obs_age_mean_valid is not None
        and float(recent_obs_age_mean_valid) <= float(USEFULNESS_EXPLOIT_AGE_THRESHOLD)
    )
    misleading_ok = (
        recent_misleading_activity_pos_frac is not None
        and float(recent_misleading_activity_pos_frac)
        <= float(USEFULNESS_EXPLOIT_MISLEADING_POS_FRAC_THRESHOLD)
    )
    info_ok = (
        recent_driver_info_true_mean is not None
        and float(recent_driver_info_true_mean)
        >= float(USEFULNESS_EXPLOIT_DRIVER_INFO_RECOVER_THRESHOLD)
    )
    arrivals_ok = (
        float(arrivals_frac_t) >= float(USEFULNESS_RECOVER_ARRIVALS_HIGH_THRESHOLD)
    )
    return bool(age_ok and misleading_ok and info_ok and arrivals_ok)


def _usefulness_transition(
    *,
    cur_state: int,
    trig_recover: bool,
    trig_caution: bool,
    trig_recover_from_caution: bool,
    trig_exploit: bool,
    recover_counter: int,
    caution_counter: int,
    recover_exit_counter: int,
    exploit_counter: int,
) -> int:
    """
    Three-regime usefulness transition rule.

    States:
      0 = exploit
      1 = recover
      2 = caution
    """
    st = int(cur_state)
    if st == USEFULNESS_STATE_EXPLOIT:
        if trig_caution and int(caution_counter) >= int(USEFULNESS_CAUTION_PERSISTENCE):
            return USEFULNESS_STATE_CAUTION
        if trig_recover and int(recover_counter) >= int(USEFULNESS_RECOVER_PERSISTENCE):
            return USEFULNESS_STATE_RECOVER
        return USEFULNESS_STATE_EXPLOIT

    if st == USEFULNESS_STATE_RECOVER:
        if trig_caution and int(caution_counter) >= int(USEFULNESS_CAUTION_PERSISTENCE):
            return USEFULNESS_STATE_CAUTION

        if trig_exploit and int(exploit_counter) >= int(USEFULNESS_EXPLOIT_PERSISTENCE):
            return USEFULNESS_STATE_EXPLOIT
        return USEFULNESS_STATE_RECOVER

    if st == USEFULNESS_STATE_CAUTION:
        if (
            trig_recover_from_caution
            and int(recover_exit_counter) >= int(USEFULNESS_RECOVER_EXIT_PERSISTENCE)
        ):
            return USEFULNESS_STATE_RECOVER
        return USEFULNESS_STATE_CAUTION

    return USEFULNESS_STATE_EXPLOIT


# ----------------------------
# Compare / metrics helpers
# ----------------------------

def _compute_compare_metrics(opr_id: str) -> dict[str, Any]:
    """
    Compact metrics payload for compare-policies.
    Uses summary.json when present + computes a few means/ratios from zarr series.
    """
    s = _load_opr_summary_or_none(opr_id) or {}

    # Prefer O1-level eps_ref (user input) and eps_ref_eff_* (effective band used for stats).
    eps_ref = s.get("eps_ref", None)
    if eps_ref is None and isinstance(s.get("o1"), dict):
        eps_ref = s["o1"].get("eps_ref", None)
    eps_ref_f = float(eps_ref) if eps_ref is not None else 0.0

    eps_ref_eff_info = s.get("eps_ref_eff_info", None)
    eps_ref_eff_cov = s.get("eps_ref_eff_cov", None)

    # Pull the most useful “headline” values from summary when available.
    out: dict[str, Any] = {
        "ttfd": s.get("ttfd", None),
        "ttfd_true": s.get("ttfd_true", None),
        "ttfd_arrived": s.get("ttfd_arrived", None),
        "mean_entropy_auc": s.get("mean_entropy_auc", s.get("entropy_auc", None)),
        "coverage_auc": s.get("coverage_auc", None),
        "movement_total_mean_l1": s.get("movement_total_mean_l1", None),
        "moves_per_step_mean": s.get("moves_per_step_mean", None),
        "moved_frac_mean": s.get("moved_frac_mean", None),
        "k_update_proxy": s.get("k_update_proxy", None),
        "mdc_info_regime": s.get("mdc_info_regime", None),
        "arrivals_frac_mean": s.get("arrivals_frac_mean", None),
        "detections_arrived_frac_mean": s.get("detections_arrived_frac_mean", None),
        "driver_info_true_mean": s.get("driver_info_true_mean", None),
        "driver_info_true_kind": s.get("driver_info_true_kind", None),
        "residual_info_mean": s.get("residual_info_mean", None),
        "residual_cov_mean": s.get("residual_cov_mean", None),
        "eps_ref": eps_ref_f,
        "eps_ref_eff_info": float(eps_ref_eff_info) if eps_ref_eff_info is not None else None,
        "eps_ref_eff_cov": float(eps_ref_eff_cov) if eps_ref_eff_cov is not None else None,
        # Prefer the summary's band-based fraction if present
        "residual_info_pos_frac": s.get("residual_info_pos_frac", None),
        "residual_cov_pos_frac": s.get("residual_cov_pos_frac", None),
        "residual_info_in_band_frac": s.get("residual_info_in_band_frac", None),
        "usefulness_gap_mean": s.get("usefulness_gap_mean", None),
        "usefulness_gap_max": s.get("usefulness_gap_max", None),
        "misleading_activity_mean": s.get("misleading_activity_mean", None),
        "misleading_activity_max": s.get("misleading_activity_max", None),
        "misleading_activity_pos_frac": s.get("misleading_activity_pos_frac", None),
        "misleading_activity_ratio": s.get("misleading_activity_ratio", None),
        "obs_age_mean_valid": s.get("obs_age_mean_valid", None),
        "obs_age_max_valid": s.get("obs_age_max_valid", None),
        # First Subgoal C rolling-support summaries
        "recent_obs_age_mean_valid_last": s.get("recent_obs_age_mean_valid_last", None),
        "recent_obs_age_mean_valid_max": s.get("recent_obs_age_mean_valid_max", None),
        "recent_misleading_activity_mean_last": s.get("recent_misleading_activity_mean_last", None),
        "recent_misleading_activity_mean_max": s.get("recent_misleading_activity_mean_max", None),
        "recent_misleading_activity_pos_frac_last": s.get("recent_misleading_activity_pos_frac_last", None),
        "recent_driver_info_true_mean_last": s.get("recent_driver_info_true_mean_last", None),
        # First usefulness-aware prototype summaries
        "usefulness_proto_enabled": s.get("usefulness_proto_enabled", None),
        "usefulness_regime_state_last": s.get("usefulness_regime_state_last", None),
        "usefulness_regime_state_exploit_frac": s.get("usefulness_regime_state_exploit_frac", None),
        "usefulness_regime_state_recover_frac": s.get("usefulness_regime_state_recover_frac", None),
        "usefulness_regime_state_caution_frac": s.get("usefulness_regime_state_caution_frac", None),
        "usefulness_trigger_recover_hits": s.get("usefulness_trigger_recover_hits", None),
        "usefulness_trigger_caution_hits": s.get("usefulness_trigger_caution_hits", None),
        "usefulness_trigger_recover_from_caution_hits": s.get(
            "usefulness_trigger_recover_from_caution_hits",
            None,
        ),
        "usefulness_trigger_exploit_hits": s.get("usefulness_trigger_exploit_hits", None),
        "residual_cov_in_band_frac": s.get("residual_cov_in_band_frac", None),
        # Regime-management advisory summaries
        "regime_enabled": s.get("regime_enabled", None),
        "regime_mode": s.get("regime_mode", None),
        "regime_utilization_mean": s.get("regime_utilization_mean", None),
        "regime_strict_drift_proxy_mean": s.get("regime_strict_drift_proxy_mean", None),
        "regime_local_drift_rate_mean": s.get("regime_local_drift_rate_mean", None),
        "regime_cumulative_exposure_final": s.get("regime_cumulative_exposure_final", None),
        # Advisory summaries:
        # These are trigger-hit summaries, not realized active-state transitions.

        "regime_advisory_downshift_trigger_hits": s.get(
            "regime_advisory_downshift_trigger_hits",
            None,
        ),
        "regime_advisory_switch_to_certified_trigger_hits": s.get(
            "regime_advisory_switch_to_certified_trigger_hits",
            None,
        ),
        "regime_advisory_recovery_trigger_hits": s.get(
            "regime_advisory_recovery_trigger_hits",
            None,
        ),

        "regime_last_state": s.get("regime_last_state", None),
        "regime_last_certified_stage_index": s.get("regime_last_certified_stage_index", None),
        "regime_last_opportunistic_level_index": s.get("regime_last_opportunistic_level_index", None),
        "regime_last_certified_stage_id": s.get("regime_last_certified_stage_id", None),
        "regime_last_opportunistic_level_id": s.get("regime_last_opportunistic_level_id", None),
        # Regime-management active-control summaries
        "regime_active_enabled": s.get("regime_active_enabled", None),
        "regime_active_verify_style": s.get("regime_active_verify_style", None),
        "regime_active_transition_count": s.get("regime_active_transition_count", None),
        "regime_active_last_state": s.get("regime_active_last_state", None),
        "regime_active_last_certified_stage_index": s.get("regime_active_last_certified_stage_index", None),
        "regime_active_last_opportunistic_level_index": s.get("regime_active_last_opportunistic_level_index", None),
        "regime_active_last_certified_stage_id": s.get("regime_active_last_certified_stage_id", None),
        "regime_active_last_opportunistic_level_id": s.get("regime_active_last_opportunistic_level_id", None),
        "regime_effective_eta_mean": s.get("regime_effective_eta_mean", None),
        "regime_effective_move_budget_cells_mean": s.get("regime_effective_move_budget_cells_mean", None),
        "regime_effective_eta_last": s.get("regime_effective_eta_last", None),
        "regime_effective_move_budget_cells_last": s.get("regime_effective_move_budget_cells_last", None),
        "regime_active_state_disabled_frac": s.get("regime_active_state_disabled_frac", None),
        "regime_active_state_nominal_frac": s.get("regime_active_state_nominal_frac", None),
        "regime_active_state_downshift_frac": s.get("regime_active_state_downshift_frac", None),
        "regime_active_state_certified_frac": s.get("regime_active_state_certified_frac", None),
        "regime_active_state_disabled_steps": s.get("regime_active_state_disabled_steps", None),
        "regime_active_state_nominal_steps": s.get("regime_active_state_nominal_steps", None),
        "regime_active_state_downshift_steps": s.get("regime_active_state_downshift_steps", None),
        "regime_active_state_certified_steps": s.get("regime_active_state_certified_steps", None),

    }

    # Fill/augment from series (works even if summary is minimal).
    overlap_front = _read_series_1d_or_empty(opr_id, "overlap_front_sensors")
    out["overlap_front_mean"] = _safe_mean(overlap_front)

    residual_info = _read_series_1d_or_empty(opr_id, "residual_info")
    # residual series is typically defined for t=0..T-2 (last is 0); ignore last when possible
    if residual_info.size >= 2:
        ri = residual_info[:-1]
    else:
        ri = residual_info
    out["residual_info_mean_series"] = _safe_mean(ri)

    # If summary didn't provide pos_frac, compute it using:
    #   - eps_ref when eps_ref>0
    #   - auto eps_ref_eff = 0.15*max(|r|) when eps_ref==0
    if out.get("residual_info_pos_frac", None) is None:
        if ri.size:
            if eps_ref_f > 0.0:
                eff = eps_ref_f
            else:
                mx = float(np.max(np.abs(ri))) if ri.size else 0.0
                eff = 0.15 * mx
            out["eps_ref_eff_info"] = float(eff)
            out["residual_info_pos_frac"] = float(np.mean((ri > float(eff)).astype(np.float32)))
        else:
            out["residual_info_pos_frac"] = None

    residual_cov = _read_series_1d_or_empty(opr_id, "residual_cov")
    if residual_cov.size >= 2:
        rc = residual_cov[:-1]
    else:
        rc = residual_cov
    if out.get("residual_cov_pos_frac", None) is None:
        if rc.size:
            if eps_ref_f > 0.0:
                eff = eps_ref_f
            else:
                mx = float(np.max(np.abs(rc))) if rc.size else 0.0
                eff = 0.15 * mx
            out["eps_ref_eff_cov"] = float(eff)
            out["residual_cov_pos_frac"] = float(np.mean((rc > float(eff)).astype(np.float32)))
        else:
            out["residual_cov_pos_frac"] = None

    return out


# ----------------------------
# Generic operational / geometry helpers
# ----------------------------

def _safe_dt_seconds(x: Any) -> int:
    try:
        v = int(x)
    except Exception:
        v = 0
    return max(1, v)


def _safe_crs_code(x: Any) -> str:
    try:
        s = str(x or "").strip()
    except Exception:
        s = ""
    return s if s else "UNKNOWN"


def _safe_hw(x: Any) -> int:
    try:
        v = int(x)
    except Exception:
        v = 0
    return max(1, v)


def _vectorized_coverage_mask(
    sensors_rc: np.ndarray,  # (N,2) int
    offsets: np.ndarray,     # (M,2) int
    H: int,
    W: int,
) -> np.ndarray:
    """
    Return a uint8 mask (H,W) of cells covered by any sensor footprint.
    Vectorized for speed; safe for N small/moderate and offsets moderate.
    """
    if sensors_rc.size == 0 or offsets.size == 0:
        return np.zeros((H, W), dtype=np.uint8)

    s = sensors_rc.astype(np.int32)
    o = offsets.astype(np.int32)

    rr = s[:, None, 0] + o[None, :, 0]  # (N,M)
    cc = s[:, None, 1] + o[None, :, 1]  # (N,M)

    rr = rr.reshape(-1)
    cc = cc.reshape(-1)

    ok = (rr >= 0) & (rr < H) & (cc >= 0) & (cc < W)
    rr = rr[ok]
    cc = cc[ok]

    mask = np.zeros((H, W), dtype=np.uint8)
    mask[rr, cc] = 1
    return mask


def _front_band_mask(fire: np.ndarray, band: int = 1) -> np.ndarray:
    """
    Simple front-band: boundary of burning region dilated by `band` steps (4-neighborhood).
    fire: (H,W) uint8/bool where >0 means burning.
    """
    f = (fire > 0).astype(np.uint8)

    up = np.zeros_like(f); up[1:] = f[:-1]
    dn = np.zeros_like(f); dn[:-1] = f[1:]
    lf = np.zeros_like(f); lf[:, 1:] = f[:, :-1]
    rt = np.zeros_like(f); rt[:, :-1] = f[:, 1:]

    boundary = (f > 0) & ((up == 0) | (dn == 0) | (lf == 0) | (rt == 0))
    band_mask = boundary.astype(np.uint8)

    steps = max(0, int(band))
    for _ in range(steps):
        b = band_mask
        upb = np.zeros_like(b); upb[1:] = b[:-1]
        dnb = np.zeros_like(b); dnb[:-1] = b[1:]
        lfb = np.zeros_like(b); lfb[:, 1:] = b[:, :-1]
        rtb = np.zeros_like(b); rtb[:, :-1] = b[:, 1:]
        band_mask = ((b > 0) | (upb > 0) | (dnb > 0) | (lfb > 0) | (rtb > 0)).astype(np.uint8)

    return band_mask


def _fraction_sensors_hitting_mask(
    sensors_rc: np.ndarray,  # (N,2)
    offsets: np.ndarray,     # (M,2)
    target_mask: np.ndarray, # (H,W) uint8/bool
) -> float:
    H, W = target_mask.shape
    N = int(sensors_rc.shape[0])
    if N <= 0:
        return 0.0

    hits = 0
    for i in range(N):
        r0 = int(sensors_rc[i, 0])
        c0 = int(sensors_rc[i, 1])
        hit = False
        for dr, dc in offsets:
            rr = r0 + int(dr)
            cc = c0 + int(dc)
            if 0 <= rr < H and 0 <= cc < W and target_mask[rr, cc] > 0:
                hit = True
                break
        hits += 1 if hit else 0

    return float(hits) / float(N)


def _binary_entropy(p: np.ndarray) -> np.ndarray:
    """
    Binary entropy H(p) in bits, elementwise, with numerical stability.
    """
    p = np.asarray(p, dtype=np.float32)
    eps = 1e-6
    pc = np.clip(p, eps, 1.0 - eps)
    return -(pc * np.log2(pc) + (1.0 - pc) * np.log2(1.0 - pc)).astype(np.float32)

def _apply_impairments_to_detections(
    det_u1: np.ndarray,           # (N,) uint8 (0/1)
    *,
    loss_prob: float,
    noise_level: float,
    rng: np.random.Generator,
) -> np.ndarray:
    """
    Convert true detections into delivered observations under content and delivery impairments.

    Semantics:
    - loss_prob applies delivery impairment: an observation opportunity may produce
        no delivered observation (`-1`)
    - noise_level applies content impairment: an arrived binary detection may flip
        from 0 to 1 or 1 to 0
    - delay is not handled here; it is applied later by the delivery queue in the
        closed-loop run loop

    Returns int8 array with:
    -1 = no arrival (lost)
    0 = arrived non-detection
    1 = arrived detection
    """
    det = det_u1.astype(np.int8)

    # Loss: drop the whole packet (independent of content)
    if loss_prob > 0:
        lost = rng.random(det.shape) < float(loss_prob)
        det[lost] = -1

    # Noise: flip bits for arrived packets
    if noise_level > 0:
        arrived = det >= 0
        flip = arrived & (rng.random(det.shape) < float(noise_level))
        det[flip] = (1 - det[flip]).astype(np.int8)

    return det


def _update_belief_from_obs_in_footprints(
    belief_t: np.ndarray,        # (H,W) float32
    sensors_rc: np.ndarray,      # (N,2) int32
    offsets: np.ndarray,         # (M,2) int32
    obs_i8: np.ndarray,          # (N,) int8, -1/0/1
    *,
    alpha_pos: float,
    alpha_neg: float,
) -> np.ndarray:
    """
    O1.0 minimal measurement update:
      - For arrived obs=1: push belief upward in the sensor footprint
      - For arrived obs=0: push belief downward in the sensor footprint
      - For obs=-1: no update from that sensor
    """
    H, W = belief_t.shape
    p = np.clip(belief_t.astype(np.float32), 0.0, 1.0)

    a_pos = float(alpha_pos)
    a_neg = float(alpha_neg)

    # Sequential sensor updates (simple and stable; N is small)
    for i in range(int(sensors_rc.shape[0])):
        y = int(obs_i8[i])
        if y < 0:
            continue  # no arrival

        r0 = int(sensors_rc[i, 0])
        c0 = int(sensors_rc[i, 1])

        # Apply update over footprint
        for dr, dc in offsets:
            rr = r0 + int(dr)
            cc = c0 + int(dc)
            if 0 <= rr < H and 0 <= cc < W:
                if y == 1:
                    p[rr, cc] = p[rr, cc] + a_pos * (1.0 - p[rr, cc])
                else:
                    p[rr, cc] = p[rr, cc] - a_neg * (p[rr, cc])

    return np.clip(p, 0.0, 1.0).astype(np.float32)

def _union_flat_indices(
    *,
    cur_rc: np.ndarray,         # (N,2) int32
    offsets: np.ndarray,        # (M,2) int32
    H: int,
    W: int,
) -> np.ndarray:
    """
    Return unique flat indices of the UNION of all sensor footprints.
    (No (H,W) float mask allocation; uses a flat bool 'seen'.)
    """
    if cur_rc.size == 0 or offsets.size == 0:
        return np.zeros((0,), dtype=np.int32)
    seen = np.zeros((H * W,), dtype=np.bool_)
    for r0, c0 in cur_rc.astype(np.int32, copy=False):
        r0 = int(r0); c0 = int(c0)
        for dr, dc in offsets:
            rr = r0 + int(dr); cc = c0 + int(dc)
            if 0 <= rr < H and 0 <= cc < W:
                seen[rr * W + cc] = True
    return np.flatnonzero(seen).astype(np.int32)


# ----------------------------
# Information / belief update helpers
# ----------------------------

# Controller visibility note:
#   This helper computes an analysis-style information driver from the current
#   belief state and configured impairment parameters. It is appropriate for
#   operational scoring and diagnostics because it uses controller-available
#   belief plus configured channel assumptions, not hidden ground-truth
#   corruption labels or privileged latent-state mismatch tags.
def _binary_sensor_expected_mi_union(
    *,
    belief_t: np.ndarray,       # (H,W) float32, current belief BEFORE applying obs
    sensors_gen_rc: np.ndarray, # (N,2) int32, sensors that GENERATED the obs being applied now
    offsets: np.ndarray,        # (M,2) int32
    H: int,
    W: int,
    loss_prob: float,
    noise_level: float,
) -> float:
    """
    Expected mutual information proxy for the delayed observation source.

    Model:
      - hidden X in {0,1} with P(X=1)=p from belief_t
      - packet arrives with probability (1-loss_prob)
      - conditional sensor bit flips with probability noise_level

    For arrived packets:
      P(Y=1|X=1)=1-n
      P(Y=1|X=0)=n

    Then:
      I(X;Y_arrived) = H(Y_arrived) - H(Y_arrived|X)
                      = H(q) - H(n)
      where q = n + p*(1-2n)

    Loss scales the expected information by P(arrival).

    Returns mean expected MI across the full grid, restricted to the union
    footprint of the sensor placement that generated obs_apply at the current t.
    """
    idx = _union_flat_indices(cur_rc=sensors_gen_rc, offsets=offsets, H=H, W=W)
    if idx.size == 0:
        return 0.0

    p = np.asarray(belief_t, dtype=np.float32).reshape(-1)[idx]
    n = float(np.clip(noise_level, 0.0, 1.0))
    p_arrive = float(np.clip(1.0 - float(loss_prob), 0.0, 1.0))

    q = np.clip(n + p * (1.0 - 2.0 * n), 0.0, 1.0).astype(np.float32)
    hq = _binary_entropy(q)
    hn = _binary_entropy(np.full_like(q, n, dtype=np.float32))
    mi = np.maximum(0.0, hq - hn)

    return float(np.sum(p_arrive * mi)) / float(H * W)


# ----------------------------
# Advisory regime-management helpers
# ----------------------------

def _get_phy_meta_from_manifest(phy_m: dict) -> tuple[int, int, int, float, str, int]:
    """
    Returns (H, W, T, cell_size_m, crs_code, dt_seconds)
    """
    grid = phy_m.get("grid", {})
    if not isinstance(grid, dict):
        grid = {}
    H = _safe_hw(grid.get("H", 0))
    W = _safe_hw(grid.get("W", 0))
    cell_size_m = float(grid.get("cell_size_m", 1.0) or 1.0)
    crs_code = _safe_crs_code(grid.get("crs_code", ""))
    dt_seconds = _safe_dt_seconds(phy_m.get("dt_seconds", 1))
    T = int(phy_m.get("horizon_steps", 0) or 0)
    return H, W, T, cell_size_m, crs_code, dt_seconds


def _pick_certified_stage(
    stages: list[Any],
    entropy_selector_value: float,
) -> tuple[int, str | None, float]:
    """
    Pick the current certified stage from the configured stage table.

    Interpretation:
      - stages are ordered by descending entropy_threshold
      - choose the first stage whose threshold is still satisfied
      - if below all thresholds, fall back to the last stage

    Returns:
      (stage_index, stage_id_or_none, expected_certified_rate)
    """
    if not stages:
        return -1, None, 0.0

    ordered = sorted(
        list(enumerate(stages)),
        key=lambda x: float(getattr(x[1], "entropy_threshold", 0.0)),
        reverse=True,
    )
    selector_value = float(entropy_selector_value)

    for orig_idx, st in ordered:
        thr = float(getattr(st, "entropy_threshold", 0.0))
        if selector_value >= thr:
            return int(orig_idx), str(getattr(st, "stage_id", None)), float(
                getattr(st, "expected_certified_rate", 0.0)
            )

    orig_idx, st = ordered[-1]
    return int(orig_idx), str(getattr(st, "stage_id", None)), float(
        getattr(st, "expected_certified_rate", 0.0)
    )


def _pick_opportunistic_level(
    ladder: list[Any],
    utilization: float,
) -> tuple[int, str | None]:
    """
    Pick the current opportunistic ladder level from utilization.

    Interpretation:
      - higher healthy_utilization_target = more aggressive / nominal level
      - choose the highest level whose target is still satisfied
      - if none are satisfied, fall back to the last level
    """
    if not ladder:
        return -1, None

    ordered = sorted(
        list(enumerate(ladder)),
        key=lambda x: float(getattr(x[1], "healthy_utilization_target", 0.0)),
        reverse=True,
    )
    u = float(utilization)

    for orig_idx, lvl in ordered:
        tgt = float(getattr(lvl, "healthy_utilization_target", 0.0))
        if u >= tgt:
            return int(orig_idx), str(getattr(lvl, "level_id", None))

    orig_idx, lvl = ordered[-1]
    return int(orig_idx), str(getattr(lvl, "level_id", None))

def _regime_state_code(
    *,
    regime_enabled: bool,
    trigger_downshift: bool,
    trigger_switch_to_certified: bool,
    trigger_recovery: bool,
) -> int:
    """
    Simple advisory-only state code:
      0 = disabled
      1 = opportunistic nominal
      2 = opportunistic downshift
      3 = certified descent
      4 = recovery-ready / healthy
    """
    if not regime_enabled:
        return 0
    if trigger_switch_to_certified:
        return 3
    if trigger_downshift:
        return 2
    if trigger_recovery:
        return 4
    return 1


def _threshold_with_hysteresis(thr: Any, field_name: str, hysteresis_sign: float = 0.0) -> float:
    """
    Read a threshold field and optionally shift it by hysteresis_band.

    hysteresis_sign:
      -1 => relax downward threshold by subtracting hysteresis
      +1 => tighten upward/recovery threshold by adding hysteresis
       0 => no shift
    """
    base = float(getattr(thr, field_name, 0.0) or 0.0)
    h = float(getattr(thr, "hysteresis_band", 0.0) or 0.0)
    return float(base + hysteresis_sign * h)

def _threshold_margin(value: float, threshold: float, *, direction: str) -> float:
    """
    Signed margin relative to a hysteresis-adjusted threshold.

    Sign convention used for debug series:

      - direction="down":
          margin = threshold - value
          positive => value is on the trigger-firing side of a downward trigger
                      (e.g. utilization is BELOW the effective threshold)
          zero     => exactly on the decision boundary
          negative => value is on the non-trigger side

      - direction="up":
          margin = value - threshold
          positive => value is on the trigger-firing side of an upward/recovery trigger
                      (e.g. utilization is ABOVE the effective threshold)
          zero     => exactly on the decision boundary
          negative => value is on the non-trigger side

    This convention lets plots answer the most important debugging question:
    "was the signal actually near / across the active decision boundary?"
    """
    v = float(value)
    thr = float(threshold)
    if direction == "down":
        return float(thr - v)
    if direction == "up":
        return float(v - thr)
    raise ValueError(f"unsupported margin direction: {direction}")


def _regime_trigger_components_with_hysteresis(
    *,
    utilization: float,
    strict_drift_proxy: float,
    local_drift_rate: float,
    cumulative_exposure: float,
    thr: Any,
    mode: str,
) -> dict[str, bool]:
    """
    Threshold evaluation with optional hysteresis.

    mode:
      - "downshift" / "switch": downward-style triggers
      - "recovery": upward-style trigger
    """
    if thr is None:
        return {}

    if mode == "recovery":
        u_thr = _threshold_with_hysteresis(thr, "utilization_threshold", +1.0)
        s_thr = _threshold_with_hysteresis(thr, "strict_drift_proxy_threshold", +1.0)
        c_thr = _threshold_with_hysteresis(thr, "cumulative_exposure_threshold", -1.0)
        l_thr = _threshold_with_hysteresis(thr, "local_drift_rate_threshold", +1.0)
        out: dict[str, bool] = {}
        if u_thr > 0.0:
            out["utilization"] = bool(utilization >= u_thr)
        if s_thr > 0.0:
            out["strict_drift_proxy"] = bool(strict_drift_proxy >= s_thr)
        if c_thr > 0.0:
            out["cumulative_exposure"] = bool(cumulative_exposure <= c_thr)
        if l_thr > 0.0:
            out["local_drift_rate"] = bool(local_drift_rate >= l_thr)
        return out

    # downshift / switch-to-certified
    u_thr = _threshold_with_hysteresis(thr, "utilization_threshold", -1.0)
    s_thr = _threshold_with_hysteresis(thr, "strict_drift_proxy_threshold", -1.0)
    c_thr = _threshold_with_hysteresis(thr, "cumulative_exposure_threshold", +1.0)
    l_thr = _threshold_with_hysteresis(thr, "local_drift_rate_threshold", -1.0)
    out: dict[str, bool] = {}
    if u_thr > 0.0:
        out["utilization"] = bool(utilization < u_thr)
    if s_thr > 0.0:
        out["strict_drift_proxy"] = bool(strict_drift_proxy < s_thr)
    if c_thr > 0.0:
        out["cumulative_exposure"] = bool(cumulative_exposure > c_thr)
    if l_thr > 0.0:
        out["local_drift_rate"] = bool(local_drift_rate < l_thr)
    return out

def _combine_regime_trigger_components(
    comps: dict[str, bool],
    *,
    use_utilization: bool,
    use_strict_drift_proxy: bool,
    use_local_drift_rate: bool,
    use_cumulative_exposure: bool,
    use_trigger_bools: bool,
    require_all: bool = True,
) -> bool:
    """
    Combine advisory trigger components into a single trigger boolean.

    Policy:
      - if trigger booleans are disabled, return False
      - only include components whose corresponding signal is enabled
      - require ALL enabled components to hold when require_all=True
      - allow ANY enabled component to fire when require_all=False
      - if no components are enabled, return False

    Scientific / preset intent:
      - advisory mode is intended to be conservative and interpretable, so
        callers usually use require_all=True there
      - active verification presets may choose require_all=False so the state
        machine is easy to exercise and inspect mechanically
      - this helper is intentionally generic; callers must decide whether a
        given preset family wants "all enabled signals agree" or "any enabled
        signal is sufficient"

    Important:
      - utilization and strict_drift_proxy are not forced to be co-primary here
      - if a preset enables both and require_all=True, they behave as co-primary
      - if require_all=False, either can independently fire the combined trigger
      - therefore the scientific meaning of the combined trigger depends on the
        caller's require_all choice

    Args:
      require_all:
        True  -> all enabled components must hold simultaneously
        False -> any enabled component may fire the trigger
    """
    if not use_trigger_bools:
        return False

    enabled_items: list[bool] = []

    if use_utilization and "utilization" in comps:
        enabled_items.append(bool(comps["utilization"]))
    if use_strict_drift_proxy and "strict_drift_proxy" in comps:
        enabled_items.append(bool(comps["strict_drift_proxy"]))
    if use_local_drift_rate and "local_drift_rate" in comps:
        enabled_items.append(bool(comps["local_drift_rate"]))
    if use_cumulative_exposure and "cumulative_exposure" in comps:
        enabled_items.append(bool(comps["cumulative_exposure"]))

    if not enabled_items:
        return False

    return bool(all(enabled_items)) if require_all else bool(any(enabled_items))


def _combine_switch_to_certified_components_active(
    comps: dict[str, bool],
    *,
    use_utilization: bool,
    use_strict_drift_proxy: bool,
    use_local_drift_rate: bool,
    use_cumulative_exposure: bool,
    use_trigger_bools: bool,
    verify_style: bool,
) -> bool:
    """
    Active-mode combiner specifically for switch-to-certified.

    Rationale:
      - switch-to-certified is intentionally special-cased relative to the
        generic combiner because certification should represent stronger
        sustained evidence than ordinary downshift
      - verify-style active presets stay permissive so the active state
        machine is easy to exercise and inspect mechanically
      - non-verify active presets should NOT certify merely because any single
        enabled component fires; frontier-rich runs otherwise collapse into
        certified too readily

    Policy:
      - if verify_style=True: permissive ANY-of-enabled behavior
      - otherwise:
          * if both utilization and strict_drift_proxy are enabled and present,
            require BOTH of those to fire
          * local_drift_rate / cumulative_exposure can strengthen the case but
            do not replace the core utilization+strict agreement
          * if only one of utilization / strict is enabled, fall back to that
            plus optional strengthening from the others

    Scientific intent:
      - utilization is typically the most interpretable live "certificate-covered
        budget" signal
      - strict_drift_proxy acts as a stricter companion signal
      - in non-verify active presets, certification is therefore treated as a
        stronger condition than simple degradation, with utilization + strict
        agreement as the intended core when both are enabled
    """
    if not use_trigger_bools:
        return False

    if verify_style:
        return _combine_regime_trigger_components(
            comps,
            use_utilization=use_utilization,
            use_strict_drift_proxy=use_strict_drift_proxy,
            use_local_drift_rate=use_local_drift_rate,
            use_cumulative_exposure=use_cumulative_exposure,
            use_trigger_bools=use_trigger_bools,
            require_all=False,
        )

    util_present = use_utilization and ("utilization" in comps)
    strict_present = use_strict_drift_proxy and ("strict_drift_proxy" in comps)
    local_present = use_local_drift_rate and ("local_drift_rate" in comps)
    expo_present = use_cumulative_exposure and ("cumulative_exposure" in comps)

    util_ok = bool(comps.get("utilization", False)) if util_present else None
    strict_ok = bool(comps.get("strict_drift_proxy", False)) if strict_present else None
    local_ok = bool(comps.get("local_drift_rate", False)) if local_present else None
    expo_ok = bool(comps.get("cumulative_exposure", False)) if expo_present else None

    core_checks: list[bool] = []
    if util_ok is not None:
        core_checks.append(util_ok)
    if strict_ok is not None:
        core_checks.append(strict_ok)

    if not core_checks:
        return False

    core_pass = all(core_checks)
    if not core_pass:
        return False

    aux_checks: list[bool] = []
    if local_ok is not None:
        aux_checks.append(local_ok)
    if expo_ok is not None:
        aux_checks.append(expo_ok)

    return bool(any(aux_checks)) if aux_checks else False


# ----------------------------
# Active regime-management helpers
# ----------------------------

def _update_active_regime_counters(
    *,
    cur_state: int,
    trig_down: bool,
    trig_switch: bool,
    trig_recovery: bool,
    trig_leave_certified: bool,
    down_counter: int,
    switch_counter: int,
    recovery_counter: int,
    leave_certified_counter: int,
) -> tuple[int, int, int, int]:
    """
    State-aware persistence counters for the active regime machine.

    Rationale:
      - counters should only accumulate for triggers that are meaningful in the
        current state
      - this prevents irrelevant trigger memory from leaking across states
      - in particular, recovery should not accumulate while already in
        certified descent, because recovery is intended to lift degraded
        opportunistic states, not eject certified mode

    Policy:
      state 1 (opportunistic_nominal):
        - accumulate downshift and switch-to-certified
        - ignore recovery
        - ignore leave-certified
      state 2 (opportunistic_downshift):
        - accumulate downshift, switch-to-certified, and recovery
        - ignore leave-certified
      state 3 (certified_descent):
        - accumulate switch-to-certified only while certification evidence remains
        - accumulate leave-certified only when certified evidence is absent and
          recovery-style evidence is present
        - ignore ordinary recovery/downshift counters
      other / disabled:
        - reset all
    """
    st = int(cur_state)

    if st == 1:
        return (
            (int(down_counter) + 1) if trig_down else 0,
            (int(switch_counter) + 1) if trig_switch else 0,
            0,
            0,
        )

    if st == 2:
        return (
            (int(down_counter) + 1) if trig_down else 0,
            (int(switch_counter) + 1) if trig_switch else 0,
            (int(recovery_counter) + 1) if trig_recovery else 0,
            0,
        )

    if st == 3:
        return (
            0,
            (int(switch_counter) + 1) if trig_switch else 0,
            0,
            (int(leave_certified_counter) + 1) if trig_leave_certified else 0,
        )

    return 0, 0, 0, 0


def _compute_leave_certified_trigger(
    *,
    trig_switch: bool,
    requal_support_score: float,
    requal_support_breadth: float,
    support_threshold: float,
    breadth_threshold: float,
    require_switch_off: bool = True,
) -> bool:
    """
    Explicit certified-exit trigger based on requalification support.

    Intent:
      - certified mode should not be permanently absorbing
      - but it should not exit merely because one diagnostic spikes for one step

    Policy:
      - optionally require switch-to-certified NOT to be firing
      - require enough pooled renewed-opportunity support
      - require enough breadth across the fleet / front encounter
      - temporal persistence is enforced outside this helper via the
        leave-certified counter
    """
    if require_switch_off and trig_switch:
        return False

    score_ok = float(requal_support_score) >= float(support_threshold)
    breadth_ok = float(requal_support_breadth) >= float(breadth_threshold)
    return bool(score_ok and breadth_ok)


def _update_active_regime_cooldowns(
    *,
    cur_state: int,
    prev_state: int,
    recovery_block_counter: int,
    recovery_block_steps: int,
) -> int:
    """
    Maintain a minimal anti-chatter cooldown for nominal/downshift oscillation.

    Policy:
      - whenever the machine ENTERS downshift (1 -> 2), start a recovery block
        window of `recovery_block_steps`
      - while currently in downshift and the block counter is positive, decrement
        it once per step
      - outside downshift, clear the block counter

    Interpretation:
      - recovery may still accumulate diagnostically, but the transition logic
        will not allow 2 -> 1 until this cooldown has expired
    """
    steps = max(0, int(recovery_block_steps))
    cs = int(cur_state)
    ps = int(prev_state)
    blk = max(0, int(recovery_block_counter))

    if ps != 2 and cs == 2:
        return steps
    if cs == 2:
        return max(0, blk - 1)
    return 0

def _active_regime_transition(
    *,
    active_enabled: bool,
    cur_state: int,
    cur_stage_idx: int,
    cur_level_idx: int,
    stage_idx_suggested: int,
    level_idx_suggested: int,
    trig_down: bool,
    trig_switch: bool,
    trig_recovery: bool,
    trig_leave_certified: bool,
    down_counter: int,
    switch_counter: int,
    recovery_counter: int,
    leave_certified_counter: int,
    down_persistence: int,
    switch_persistence: int,
    recovery_persistence: int,
    leave_certified_persistence: int,
    recovery_block_counter: int,
    max_level_idx: int,
) -> tuple[int, int, int, int]:
    """
    Active state machine for Patch 3A.

    States:
      0 = disabled
      1 = opportunistic_nominal
      2 = opportunistic_downshift
      3 = certified_descent

    Returns:
      (next_state, next_stage_idx, next_level_idx, transition_event)

    transition_event:
      0 = none
      1 = nominal -> downshift
      2 = nominal/downshift -> certified
      3 = downshift -> nominal (recovery)
      4 = certified -> downshift (leave certified)

    Important control policy:
      - state geometry is:
          * 1 -> 2 : degradation / downshift
          * 2 -> 1 : recovery
          * 1/2 -> 3 : certification
          * 3 -> 2 : explicit certified exit when certification evidence decays
                     and healthy evidence persists
      - recovery is only used to lift degraded opportunistic behavior
      - certified descent does NOT exit on recovery
      - if a future design needs certified exit logic, add an explicit
        leave-certified trigger rather than reusing recovery
      - nominal/downshift anti-chatter:
          * after entering downshift, recovery is temporarily blocked by a
            short cooldown
          * recovery out of downshift is stricter than degradation into it:
            require recovery persistence AND absence of active downshift
    """
    if not active_enabled:
        return 0, -1, -1, 0

    next_state = int(cur_state)
    next_stage_idx = int(cur_stage_idx)
    next_level_idx = int(cur_level_idx)
    event = 0

    if next_state <= 0:
        next_state = 1
        next_level_idx = max(0, int(level_idx_suggested)) if max_level_idx >= 0 else -1
        next_stage_idx = int(stage_idx_suggested) if int(stage_idx_suggested) >= 0 else -1

    # Highest priority: switch to certified.
    # Operationally, certified descent is the strongest intervention:
    # once sustained evidence says "use certified control", it should swallow
    # ordinary nominal/downshift oscillation.
    if trig_switch and switch_counter >= switch_persistence:
        if next_state != 3:
            next_state = 3
            next_stage_idx = int(stage_idx_suggested) if int(stage_idx_suggested) >= 0 else next_stage_idx
            event = 2
        else:
            next_stage_idx = int(stage_idx_suggested) if int(stage_idx_suggested) >= 0 else next_stage_idx
        return next_state, next_stage_idx, next_level_idx, event

    if next_state == 1:
        # Downshift protects against utilization collapse / weakened certificate
        # coverage while remaining opportunistic.
        if trig_down and down_counter >= down_persistence:
            next_state = 2
            if max_level_idx >= 0:
                next_level_idx = min(max_level_idx, max(0, int(level_idx_suggested)))
            event = 1
        return next_state, next_stage_idx, next_level_idx, event

    if next_state == 2:
        # Recovery is intentionally stricter than degradation:
        #   - must survive recovery persistence
        #   - must not still be actively downshift-triggered
        #   - must wait out the anti-chatter cooldown
        recovery_allowed = (
            recovery_block_counter <= 0
            and trig_recovery
            and (not trig_down)
            and recovery_counter >= recovery_persistence
        )
        if recovery_allowed:
            next_state = 1
            next_level_idx = 0 if max_level_idx >= 0 else -1
            event = 3
            return next_state, next_stage_idx, next_level_idx, event

        if trig_down and down_counter >= down_persistence and max_level_idx >= 0:
            next_level_idx = min(max_level_idx, max(next_level_idx, int(level_idx_suggested)))
        return next_state, next_stage_idx, next_level_idx, event

    if next_state == 3:
        # Certified is no longer fully absorbing.
        # Leave certified only when:
        #   - switch evidence is no longer sustained
        #   - explicit leave-certified evidence persists
        next_stage_idx = int(stage_idx_suggested) if int(stage_idx_suggested) >= 0 else next_stage_idx
        if trig_leave_certified and leave_certified_counter >= leave_certified_persistence:
            next_state = 2
            if max_level_idx >= 0:
                next_level_idx = min(max_level_idx, max(0, int(level_idx_suggested)))
            event = 4
        return next_state, next_stage_idx, next_level_idx, event

    return next_state, next_stage_idx, next_level_idx, event


def _resolve_active_stage_eta(
    *,
    rgm_stages: list[Any],
    active_state: int,
    active_stage_idx: int,
    advisory_stage_idx: int,
) -> float | None:
    """
    Effective certified eta for active mode.

    Policy:
      - only report an effective eta when active mode is actually in
        certified descent
      - outside certified descent, return None
      - if the active certified stage index is invalid, return None
 
    This keeps regime_effective_eta semantically tied to realized active
    certified control, rather than advisory/suggested certified staging.
    """
    if int(active_state) != 3:
         return None

    idx = int(active_stage_idx)
    if idx < 0 or idx >= len(rgm_stages):
        return None

    try:
        return float(getattr(rgm_stages[idx], "eta", 0.0))
    except Exception:
        return None


def _resolve_active_move_budget_cells(
    *,
    base_move_max_cells: float,
    cell_size_m: float,
    rgm_ladder: list[Any],
    active_state: int,
    active_level_idx: int,
) -> float:
    """
    Effective move budget for active mode.

    Policy:
      - opportunistic nominal/downshift states may use ladder motion_adjustment
      - certified state should remain conservative, but still mobile enough to
        continue an interpretable certified descent rather than visually freezing
      - value is always >= 0

    Units:
      - base_move_max_cells is already in grid cells
      - ladder motion_adjustment is configured in meters in the frontend presets
      - therefore motion_adjustment must be converted from meters -> cells here
    """
    if int(active_state) == 3:
        # Certified mode should remain conservative, but still visibly mobile.
        # Old behavior (25% capped at 2 cells) interacted too strongly with the
        # mover cap and entropy masking, producing near-freeze behavior.
        base = max(0.0, float(base_move_max_cells))
        return min(max(3.0, 0.50 * base), 6.0)

    if 0 <= int(active_level_idx) < len(rgm_ladder):
        try:
            adj_m = float(getattr(rgm_ladder[int(active_level_idx)], "motion_adjustment", 0.0))
        except Exception:
            adj_m = 0.0

        cell_m = float(cell_size_m) if float(cell_size_m) > 0.0 else 1.0
        adj_cells = float(adj_m) / float(cell_m)
        return max(0.0, float(base_move_max_cells) + float(adj_cells))

    return max(0.0, float(base_move_max_cells))


def _resolve_active_tie_breaking(
    *,
    base_deterministic: bool,
    active_enabled: bool,
    active_state: int,
) -> bool:
    """
    Effective tie-breaking mode for active regime control.

    Policy:
      - outside active control, preserve the configured tie-breaking mode
      - in certified state, force non-deterministic tie-breaking so sensors do
        not move in lockstep toward identical score plateaus
      - in opportunistic states, preserve the configured mode
    """
    if not active_enabled:
        return bool(base_deterministic)
    if int(active_state) == 3:
        return False
    return bool(base_deterministic)


def _resolve_active_max_moves_per_step(
    *,
    base_max_moves_per_step: int,
    n_sensors: int,
    active_enabled: bool,
    active_state: int,
) -> int:
    """
    Effective move-count cap for active regime control.

    Policy:
      - outside active control, preserve the configured cap
      - in certified state, cap mover count to a small fraction of the fleet
        even when the base configuration is unlimited (0)
      - in opportunistic states, preserve the configured cap

    Notes:
      - backend convention uses 0 to mean "no explicit cap"
      - certified control should still allow visible mobility, but not a whole-
        swarm synchronized slide
    """
    base = int(base_max_moves_per_step)
    if not active_enabled:
        return base
    if int(active_state) != 3:
        return base

    # Old 10% cap was often too restrictive in combination with the reduced
    # certified move budget. A slightly looser cap keeps certified mode
    # conservative while avoiding near-static behavior.
    certified_cap = max(2, int(np.ceil(0.25 * max(1, int(n_sensors)))))
    if base <= 0:
        return certified_cap
    return min(base, certified_cap)


def _resolve_active_entropy_for_control(
    *,
    entropy_t: np.ndarray,
    belief_t: np.ndarray,
    eta_effective: float | None,
) -> np.ndarray:
    """
    Build the effective entropy map used by the existing controller.

    Patch 3B policy:
      - if eta_effective is None, use the original entropy map
      - otherwise suppress entropy outside the certified band
      - otherwise emphasize entropy inside the certified band [eta, 1-eta]
        while retaining a weaker out-of-band signal, so certified mode remains
        guided rather than going effectively blind outside the band
    """
    if eta_effective is None:
        return entropy_t

    eta = float(np.clip(float(eta_effective), 0.0, 0.5))
    lo = eta
    hi = 1.0 - eta
    in_band = ((belief_t >= lo) & (belief_t <= hi)).astype(np.float32)

    # Soft emphasis:
    #   - full weight inside certified band
    #   - attenuated but nonzero weight outside the band
    # This keeps certified control guided toward nearby informative structure
    # instead of becoming effectively blind outside the band.
    out_band_weight = np.float32(0.25)
    weights = np.where(in_band > 0.0, np.float32(1.0), out_band_weight)
    return (entropy_t.astype(np.float32) * weights.astype(np.float32)).astype(np.float32)


# ----------------------------
# Policy / summary labeling helpers
# ----------------------------

def _classify_mdc_info_reward_strength(
    *,
    c_info: float,
    alpha_pos: float,
    alpha_neg: float,
) -> str:
    """
    Classify the current mdc_info reward setting using the same semantic surface
    now shown in the frontend designer.

    This intentionally replaces the older explore/neutral/suppress wording.
    The current interpretation is magnitude-oriented:
      - off
      - light
      - moderate
      - strong
    """
    k_update = 0.5 * float(alpha_pos + alpha_neg)
    c = float(c_info)
    if abs(c) <= 1e-12:
        return "off"
    if c < k_update:
        return "light"
    if c < 2.0 * k_update:
        return "moderate"
    return "strong"


# ----------------------------
# Persistence helpers
# ----------------------------

def _write_named_1d_series(
    *,
    opr_id: str,
    items: list[tuple[str, np.ndarray, str]],
) -> None:
    """
    Persist a batch of 1D zarr series using the existing per-series layout.

    Intentionally thin and file-local:
      - preserves series names
      - preserves dtype selection
      - preserves chunking policy
      - performs no reshaping or semantic transformation
    """
    for name, arr, dtype in items:
        z = zarr.open(
            str(zarr_path(opr_id, name)),
            mode="w",
            shape=arr.shape,
            dtype=dtype,
            chunks=(min(int(arr.shape[0]), 256),),
        )
        z[:] = arr


# ----------------------------
# Response construction helpers
# ----------------------------

def _build_operational_meta_response(
    *,
    opr_id: str,
    H: Any,
    W: Any,
    T: Any,
    dt_seconds: Any,
    crs_code: Any,
    cell_size_m: Any,
) -> MetaResponse:
    """
    Build a normalized MetaResponse for operational runs.

    Intentionally thin:
      - preserves existing fallback normalization behavior
      - keeps horizon_steps aligned to T
      - avoids repeating the same MetaResponse construction in meta()
    """
    Hn = _safe_hw(H)
    Wn = _safe_hw(W)
    Tn = max(0, int(T))
    dtn = _safe_dt_seconds(dt_seconds)
    crs = _safe_crs_code(crs_code)
    cell = float(cell_size_m) if float(cell_size_m) > 0 else 1.0
    return MetaResponse(
        id=opr_id,
        H=Hn,
        W=Wn,
        T=Tn,
        dt_seconds=dtn,
        horizon_steps=Tn,
        crs_code=crs,
        cell_size_m=cell,
    )

# ----------------------------
# Endpoints
# ----------------------------

@router.post("/manifest")
def create_manifest(manifest: OperationalManifest) -> dict:
    opr_id = new_id("opr")
    save_manifest(opr_id, manifest.model_dump())
    return {"opr_id": opr_id}


@router.get("/list", response_model=ListResponse)
def list_runs() -> ListResponse:
    return ListResponse(ids=list_manifests("opr"))


@router.get("/{opr_id}/manifest")
def get_manifest(opr_id: str) -> dict:
    try:
        return load_manifest(opr_id)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="manifest not found")


@router.get("/{opr_id}/meta", response_model=MetaResponse)
def meta(opr_id: str) -> MetaResponse:
    # Preferred: resolve meta from linked physical run (O1) or parent chain (O0)
    try:
        m = load_manifest(opr_id)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="manifest not found")

    # O1 path: manifest contains phy_id
    phy_id = m.get("phy_id") if isinstance(m, dict) else None
    if phy_id:
        try:
            phy = load_manifest(str(phy_id))
            H, W, T, cell_size_m, crs_code, dt_seconds = _get_phy_meta_from_manifest(phy)
            return _build_operational_meta_response(
                opr_id=opr_id,
                H=H,
                W=W,
                T=T,
                dt_seconds=dt_seconds,
                crs_code=crs_code,
                cell_size_m=cell_size_m,
            )
        except FileNotFoundError:
            pass
        except Exception:
            raise HTTPException(status_code=500, detail="linked physical manifest is malformed")

    # O0 path: resolve via epi -> phy chain if present
    epi_id = m.get("epi_id") if isinstance(m, dict) else None
    if epi_id:
        try:
            epi = load_manifest(str(epi_id))
            phy_id2 = epi.get("phy_id") if isinstance(epi, dict) else None
            if phy_id2:
                phy = load_manifest(str(phy_id2))
                H, W, T, cell_size_m, crs_code, dt_seconds = _get_phy_meta_from_manifest(phy)
                return _build_operational_meta_response(
                    opr_id=opr_id,
                    H=H,
                    W=W,
                    T=T,
                    dt_seconds=dt_seconds,
                    crs_code=crs_code,
                    cell_size_m=cell_size_m,
                )
        except FileNotFoundError:
            # fall back to stored operational meta
            pass
        except Exception:
            raise HTTPException(status_code=500, detail="linked parent manifest is malformed")

    # Fallback: stored meta in operational summary
    s = _load_opr_summary_or_none(opr_id) or {}
    if all(k in s for k in ("H", "W", "T", "dt_seconds", "cell_size_m", "crs_code")):
        try:
            return _build_operational_meta_response(
                opr_id=opr_id,
                H=s["H"],
                W=s["W"],
                T=s["T"],
                dt_seconds=s.get("dt_seconds", 1),
                crs_code=s.get("crs_code", ""),
                cell_size_m=s["cell_size_m"],
            )
        except Exception:
            pass

    # Last resort: infer T from sensors_rc (H/W unknown without summary)
    try:
        a = open_zarr_array(zarr_path(opr_id, "sensors_rc"), mode="r")
        shp = tuple(int(x) for x in a.shape)
        if len(shp) != 3:
            raise ValueError(f"sensors_rc must be 3D (T,N,2); got {shp}")
        T = shp[0]
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"cannot determine operational meta: {e}")

    return _build_operational_meta_response(
        opr_id=opr_id,
        H=s.get("H", 1),
        W=s.get("W", 1),
        T=s.get("T", T) or T,
        dt_seconds=s.get("dt_seconds", 1),
        crs_code=s.get("crs_code", ""),
        cell_size_m=s.get("cell_size_m", 1.0) or 1.0,
    )


@router.post("/run")
def run(req: RunRequest) -> dict:
    """
    Mainline execution:
      - O1: closed-loop operational+epistemic (manifest.run_mode == "closed_loop")
      - O0: replay-on-top-of-epistemic (manifest.run_mode == "replay") [debug/advanced]
    """
    opr_id = req.id
    m = OperationalManifest.model_validate(load_manifest(opr_id))

    run_mode = getattr(m, "run_mode", "closed_loop")

    # Safe defaults for regime-management locals.
    # These are overridden inside the closed-loop setup once the manifest-backed
    # regime configuration is unpacked, but defining them here prevents
    # refactor-order bugs where an audit/helper flag is computed before the
    # regime block runs.
    regime_enabled = False
    regime_mode = "advisory"
    regime_active_enabled = False
    active_verify_style = False
    rgm = None

    # ----------------------------
    # O1: closed-loop mode
    # ----------------------------
    if run_mode == "closed_loop":
        # ----------------------------
        # Closed-loop setup / manifest-linked truth load
        # ----------------------------
        if not m.phy_id:
            raise HTTPException(status_code=400, detail="operational manifest missing phy_id for closed_loop mode")
        phy_id = str(m.phy_id)
        phy_m = load_manifest(phy_id)

        Hm, Wm, Tm, cell_size_m, crs_code, dt_seconds = _get_phy_meta_from_manifest(phy_m)

        # Load truth arrays from physical run
        fire_state = np.asarray(open_zarr_array(zarr_path(phy_id, "fire_state"), mode="r")[:], dtype=np.uint8)
        if fire_state.ndim != 3:
            raise HTTPException(status_code=500, detail=f"fire_state must be (T,H,W); got shape={fire_state.shape}")
        T_truth, H_truth, W_truth = fire_state.shape
        T = int(Tm) if int(Tm) > 0 else int(T_truth)
        H = int(Hm) if int(Hm) > 0 else int(H_truth)
        W = int(Wm) if int(Wm) > 0 else int(W_truth)

        # Preserve the physical 3-state semantics:
        #   0 = unburned
        #   1 = burning
        #   2 = burned
        #
        # Operationally we distinguish:
        #   - fire_active: actively burning cells only
        #   - fire_any: any nonzero fire-state cell (burning or burned)
        fire_active = (fire_state[:T, :H, :W] == 1).astype(np.uint8)
        fire_any = (fire_state[:T, :H, :W] > 0).astype(np.uint8)

        # Terrain is optional: if absent, render a flat background.
        terr01: np.ndarray
        try:
            terrain = np.asarray(open_zarr_array(zarr_path(phy_id, "terrain"), mode="r")[:], dtype=np.float32)
            terr01 = terrain.astype(np.float32)
            if terr01.ndim == 3:
                # if terrain is time-varying, just use first frame for background normalization
                terr_base = terr01[0]
            else:
                terr_base = terr01
            mn = float(np.nanmin(terr_base))
            mx = float(np.nanmax(terr_base))
            terr_base01 = (terr_base - mn) / (mx - mn) if mx > mn else np.zeros_like(terr_base)
            terr01 = terr_base01.astype(np.float32)
        except Exception:
            terr01 = np.zeros_like(fire_any[0], dtype=np.float32)

        radius_cells = float(m.network.sensor_radius_m / cell_size_m)
        move_max_cells = float(m.network.sensor_move_max_m / cell_size_m)
        min_sep_cells = float(m.network.min_separation_m / cell_size_m) if m.network.min_separation_m > 0 else 0.0

        offsets = offsets_within_radius(radius_cells)

        # RNG
        seed = int(getattr(m.o1, "seed", 0) or 0)
        rng = np.random.default_rng(seed)

        # ----------------------------
        # Closed-loop array / series allocation
        # ----------------------------        
        # Allocate operational arrays
        sensors = np.zeros((T, m.network.n_sensors, 2), dtype=np.int32)
        detections = np.zeros((T, m.network.n_sensors), dtype=np.uint8)  # arrived detections (0/1)

        # Operational series
        detections_any = np.zeros((T,), dtype=np.uint8)
        # Detection semantics:
        #   - true_detections_any: current-frame true footprint hit before impairments
        #   - arrived_detections_any: delayed / impaired arrived observation stream
        #   - detections_any: legacy compatibility alias; kept equal to
        #     arrived_detections_any so older frontends do not break
        true_detections_any = np.zeros((T,), dtype=np.uint8)
        arrived_detections_any = np.zeros((T,), dtype=np.uint8)
        detections_any = np.zeros((T,), dtype=np.uint8)  # legacy alias = arrived_detections_any

        coverage_frac = np.zeros((T,), dtype=np.float32)
        new_coverage_frac = np.zeros((T,), dtype=np.float32)
        movement_l1_mean = np.zeros((T,), dtype=np.float32)
        moves_per_step = np.zeros((T,), dtype=np.int32)
        moved_frac = np.zeros((T,), dtype=np.float32)
        overlap_fire_sensors = np.zeros((T,), dtype=np.float32)
        overlap_fire_any_sensors = np.zeros((T,), dtype=np.float32)
        overlap_front_sensors = np.zeros((T,), dtype=np.float32)
        uncertainty_debug_variance_mean = np.zeros((T,), dtype=np.float32)
        uncertainty_debug_variance_max = np.zeros((T,), dtype=np.float32)
        uncertainty_debug_novelty_mean = np.zeros((T,), dtype=np.float32)
        uncertainty_debug_novelty_max = np.zeros((T,), dtype=np.float32)
        uncertainty_debug_entropy_bonus_mean = np.zeros((T,), dtype=np.float32)
        uncertainty_debug_entropy_bonus_max = np.zeros((T,), dtype=np.float32)
        uncertainty_debug_score_mean = np.zeros((T,), dtype=np.float32)
        uncertainty_debug_score_max = np.zeros((T,), dtype=np.float32)

        # Realized "budget" series (arrivals after loss/delay, and arrived detections)
        arrivals_frac = np.zeros((T,), dtype=np.float32)
        detections_arrived_frac = np.zeros((T,), dtype=np.float32)
        obs_generation_step = np.full((T,), -1, dtype=np.int32)
        obs_delivery_step = np.full((T,), -1, dtype=np.int32)
        obs_age_steps = np.full((T,), -1, dtype=np.int32)
        loss_frac = np.zeros((T,), dtype=np.float32)
        usefulness_gap = np.zeros((T,), dtype=np.float32)
        misleading_activity = np.zeros((T,), dtype=np.float32)
        # First Subgoal C support signals: rolling usefulness/staleness summaries.
        # Logging only for now; no control use yet.
        recent_obs_age_mean_valid = np.full((T,), np.nan, dtype=np.float32)
        recent_misleading_activity_mean = np.full((T,), np.nan, dtype=np.float32)
        recent_misleading_activity_pos_frac = np.full((T,), np.nan, dtype=np.float32)
        recent_driver_info_true_mean = np.full((T,), np.nan, dtype=np.float32)
        # First usefulness-aware prototype state/logging series
        usefulness_regime_state = np.zeros((T,), dtype=np.int32)
        usefulness_trigger_recover = np.zeros((T,), dtype=np.uint8)
        usefulness_trigger_caution = np.zeros((T,), dtype=np.uint8)
        usefulness_trigger_recover_from_caution = np.zeros((T,), dtype=np.uint8)
        usefulness_trigger_exploit = np.zeros((T,), dtype=np.uint8)
        usefulness_recover_counter = np.zeros((T,), dtype=np.int32)
        usefulness_caution_counter = np.zeros((T,), dtype=np.int32)
        usefulness_recover_exit_counter = np.zeros((T,), dtype=np.int32)
        usefulness_exploit_counter = np.zeros((T,), dtype=np.int32)
        # Residual/control primitives used by current dynamic policies
        # driver_cov := arrivals_frac (arrival-like / budget-like)
        # driver_info_true is the canonical information driver aligned to obs_apply cause
        driver_info_true = np.zeros((T,), dtype=np.float32)
        residual_cov = np.zeros((T,), dtype=np.float32)
        residual_info = np.zeros((T,), dtype=np.float32)

        # Advisory-only regime-management series
        regime_utilization = np.zeros((T,), dtype=np.float32)
        regime_strict_drift_proxy = np.zeros((T,), dtype=np.float32)
        regime_local_drift_rate = np.zeros((T,), dtype=np.float32)
        regime_cumulative_exposure = np.zeros((T,), dtype=np.float32)
        regime_state = np.zeros((T,), dtype=np.int32)
        regime_trigger_downshift = np.zeros((T,), dtype=np.uint8)
        regime_trigger_switch_to_certified = np.zeros((T,), dtype=np.uint8)
        regime_trigger_recovery = np.zeros((T,), dtype=np.uint8)
        regime_certified_stage_index = np.full((T,), -1, dtype=np.int32)
        regime_opportunistic_level_index = np.full((T,), -1, dtype=np.int32)
        regime_advisory_stage_eta = np.zeros((T,), dtype=np.float32)

        # Active regime state-machine series (Patch 3A)
        regime_active_state = np.zeros((T,), dtype=np.int32)
        regime_active_certified_stage_index = np.full((T,), -1, dtype=np.int32)
        regime_active_opportunistic_level_index = np.full((T,), -1, dtype=np.int32)
        regime_active_transition_event = np.zeros((T,), dtype=np.int32)
        regime_effective_eta = np.zeros((T,), dtype=np.float32)
        regime_effective_move_budget_cells = np.zeros((T,), dtype=np.float32)
        debug_down_utilization_margin = np.full((T,), np.nan, dtype=np.float32)
        debug_down_strict_margin = np.full((T,), np.nan, dtype=np.float32)
        debug_down_utilization_threshold = np.full((T,), np.nan, dtype=np.float32)
        debug_down_strict_threshold = np.full((T,), np.nan, dtype=np.float32)
        debug_down_hysteresis = np.full((T,), np.nan, dtype=np.float32)
        debug_trig_down_utilization_component = np.zeros((T,), dtype=np.uint8)
        debug_trig_down_strict_component = np.zeros((T,), dtype=np.uint8)
        debug_trig_down_final = np.zeros((T,), dtype=np.uint8)
        debug_switch_utilization_margin = np.full((T,), np.nan, dtype=np.float32)
        debug_switch_strict_margin = np.full((T,), np.nan, dtype=np.float32)
        debug_switch_utilization_threshold = np.full((T,), np.nan, dtype=np.float32)
        debug_switch_strict_threshold = np.full((T,), np.nan, dtype=np.float32)
        debug_switch_hysteresis = np.full((T,), np.nan, dtype=np.float32)
        debug_trig_switch_utilization_component = np.zeros((T,), dtype=np.uint8)
        debug_trig_switch_strict_component = np.zeros((T,), dtype=np.uint8)

        debug_trig_switch_local_component = np.zeros((T,), dtype=np.uint8)
        debug_trig_switch_exposure_component = np.zeros((T,), dtype=np.uint8)
        debug_trig_switch_final = np.zeros((T,), dtype=np.uint8)
        debug_recovery_utilization_margin = np.full((T,), np.nan, dtype=np.float32)
        debug_recovery_strict_margin = np.full((T,), np.nan, dtype=np.float32)
        debug_recovery_utilization_threshold = np.full((T,), np.nan, dtype=np.float32)
        debug_recovery_strict_threshold = np.full((T,), np.nan, dtype=np.float32)
        debug_recovery_hysteresis = np.full((T,), np.nan, dtype=np.float32)
        debug_down_counter = np.zeros((T,), dtype=np.int32)
        debug_switch_counter = np.zeros((T,), dtype=np.int32)
        debug_recovery_counter = np.zeros((T,), dtype=np.int32)
        debug_recovery_block_counter = np.zeros((T,), dtype=np.int32)
        debug_leave_certified_counter = np.zeros((T,), dtype=np.int32)
        debug_trig_leave_certified_final = np.zeros((T,), dtype=np.uint8)
        regime_requal_support_score = np.zeros((T,), dtype=np.float32)
        regime_requal_support_breadth = np.zeros((T,), dtype=np.float32)
        debug_requal_support_front = np.zeros((T,), dtype=np.float32)
        debug_requal_support_detect = np.zeros((T,), dtype=np.float32)
        debug_requal_support_info = np.zeros((T,), dtype=np.float32)
        debug_requal_support_health = np.zeros((T,), dtype=np.float32)

        cumulative_exposure_running = 0.0
        # Epistemic trace (embedded)
        store_epi = bool(getattr(m.o1, "store_epi_trace", True))
        prior_p = float(getattr(m.o1, "prior_p", 0.02))
        alpha_pos = float(getattr(m.o1, "alpha_pos", 0.35))
        alpha_neg = float(getattr(m.o1, "alpha_neg", 0.15))
        front_band_cells = int(getattr(m.o1, "front_band_cells", 1) or 0)
        c_info = float(getattr(m.o1, "c_info", 1.0))
        c_cov = float(getattr(m.o1, "c_cov", 1.0))
        eps_ref = float(getattr(m.o1, "eps_ref", 0.0))

        # ----------------------------
        # Regime-management / usefulness setup
        # ----------------------------        
        # Regime-management scaffolding (Patch 2A: advisory-only signals/logging)
        rgm = getattr(m, "regime_management", None)
        regime_enabled = bool(rgm is not None and bool(getattr(rgm, "enabled", False)))
        regime_mode = str(getattr(rgm, "mode", "advisory")) if rgm is not None else "advisory"

        rgm_signals = getattr(rgm, "signals", None) if rgm is not None else None
        use_utilization = bool(getattr(rgm_signals, "use_utilization", True)) if rgm_signals is not None else True
        use_strict_drift_proxy = (
            bool(getattr(rgm_signals, "use_strict_drift_proxy", True)) if rgm_signals is not None else True
        )
        use_local_drift_rate = (
            bool(getattr(rgm_signals, "use_local_drift_rate", True)) if rgm_signals is not None else True
        )
        use_cumulative_exposure = (
            bool(getattr(rgm_signals, "use_cumulative_exposure", True)) if rgm_signals is not None else True
        )
        use_trigger_bools = (
            bool(getattr(rgm_signals, "use_trigger_bools", True)) if rgm_signals is not None else True
        )
        regime_active_enabled = bool(regime_enabled and str(regime_mode) == "active")



        # Heuristic but useful distinction:
        # verify presets disable local_drift_rate and cumulative_exposure, so we
        # treat that profile as the permissive "verification style" active mode.
        active_verify_style = bool(
            regime_active_enabled
            and use_utilization
            and use_strict_drift_proxy
            and not use_local_drift_rate
            and not use_cumulative_exposure
        )

        rgm_transition = getattr(rgm, "transition_logic", None) if rgm is not None else None
        rgm_recovery_support = getattr(rgm, "recovery_support", None) if rgm is not None else None
        downshift_thr = getattr(rgm_transition, "downshift_thresholds", None) if rgm_transition is not None else None
        switch_cert_thr = (
            getattr(rgm_transition, "switch_to_certified_thresholds", None) if rgm_transition is not None else None
        )
        recovery_thr = getattr(rgm_transition, "recovery_thresholds", None) if rgm_transition is not None else None

        rgm_opportunistic = getattr(rgm, "opportunistic", None) if rgm is not None else None
        rgm_ladder = list(getattr(rgm_opportunistic, "ladder", []) or []) if rgm_opportunistic is not None else []

        rgm_certified = getattr(rgm, "certified", None) if rgm is not None else None
        rgm_stages = list(getattr(rgm_certified, "stages", []) or []) if rgm_certified is not None else []

        max_ladder_idx = len(rgm_ladder) - 1

        down_persistence = max(1, int(getattr(downshift_thr, "persistence_steps", 1) or 1)) if downshift_thr is not None else 1
        switch_persistence = max(1, int(getattr(switch_cert_thr, "persistence_steps", 1) or 1)) if switch_cert_thr is not None else 1
        recovery_persistence = max(1, int(getattr(recovery_thr, "persistence_steps", 1) or 1)) if recovery_thr is not None else 1

        recovery_support_enabled = bool(
            regime_active_enabled
            and rgm_recovery_support is not None
            and bool(getattr(rgm_recovery_support, "enabled", True))
        )
        recovery_support_threshold = (
            float(getattr(rgm_recovery_support, "support_threshold", 0.30) or 0.30)
            if rgm_recovery_support is not None else 0.30
        )
        recovery_breadth_threshold = (
            float(getattr(rgm_recovery_support, "breadth_threshold", 0.15) or 0.15)
            if rgm_recovery_support is not None else 0.15
        )
        recovery_support_require_switch_off = (
            bool(getattr(rgm_recovery_support, "require_switch_off", True))
            if rgm_recovery_support is not None else True
        )
        w_front = float(getattr(rgm_recovery_support, "weight_front_overlap", 0.35) or 0.35) if rgm_recovery_support is not None else 0.35
        w_detect = float(getattr(rgm_recovery_support, "weight_detection_arrivals", 0.25) or 0.25) if rgm_recovery_support is not None else 0.25
        w_info = float(getattr(rgm_recovery_support, "weight_info_driver", 0.25) or 0.25) if rgm_recovery_support is not None else 0.25
        w_health = float(getattr(rgm_recovery_support, "weight_health", 0.15) or 0.15) if rgm_recovery_support is not None else 0.15
        requal_w_sum = max(1e-6, w_front + w_detect + w_info + w_health)

        down_counter = 0
        switch_counter = 0
        recovery_counter = 0
        leave_certified_counter = 0
        recovery_block_steps = max(1, int(down_persistence + recovery_persistence))
        recovery_block_counter = 0
        leave_certified_persistence = (
            max(1, int(getattr(rgm_recovery_support, "persistence_steps", max(2, int(recovery_persistence))) or max(2, int(recovery_persistence))))
            if rgm_recovery_support is not None else max(2, int(recovery_persistence))
        )
        active_state_cur = 1 if regime_active_enabled else 0
        active_stage_idx_cur = -1

        active_level_idx_cur = 0 if regime_active_enabled and max_ladder_idx >= 0 else -1

        usefulness_proto_enabled = str(m.network.policy) == USEFULNESS_PROTO_POLICY
        usefulness_state_cur = USEFULNESS_STATE_EXPLOIT
        recover_counter_cur = 0
        caution_counter_cur = 0
        recover_exit_counter_cur = 0
        exploit_counter_cur = 0
        usefulness_recent_obs_age_window: deque[float] = deque(maxlen=USEFULNESS_SUPPORT_WINDOW)
        usefulness_recent_misleading_window: deque[float] = deque(maxlen=USEFULNESS_SUPPORT_WINDOW)
        usefulness_recent_driver_info_window: deque[float] = deque(maxlen=USEFULNESS_SUPPORT_WINDOW)

        belief_t = np.full((H, W), prior_p, dtype=np.float32)
        entropy_t = _binary_entropy(belief_t)
        # Uncertainty-policy memory:
        #   memory=0 -> recently under-covered / novel
        #   memory=1 -> recently heavily covered
        #
        # This is used only by the redesigned "uncertainty" score:
        #   score_unc = variance * powered_novelty + entropy_bonus
        uncertainty_memory = np.zeros((H, W), dtype=np.float32)

        # Canonical uncertainty policy parameters:
        # - uncertainty_decay:        persistence of recent-coverage memory
        # - uncertainty_gain:         strength of fresh coverage imprint
        # - uncertainty_gamma:        novelty suppression exponent
        # - uncertainty_beta:         direct novelty bonus exponent
        # - uncertainty_lambda:       novelty bonus weight
        uncertainty_decay = float(getattr(m.o1, "uncertainty_decay", 0.985))
        uncertainty_gain = float(getattr(m.o1, "uncertainty_gain", 0.35))
        uncertainty_gamma = float(getattr(m.o1, "uncertainty_gamma", 6.0))
        uncertainty_beta = float(getattr(m.o1, "uncertainty_beta", 2.0))
        uncertainty_lambda = float(getattr(m.o1, "uncertainty_lambda", 0.15))


        # Persist embedded belief/entropy arrays (optional)
        z_b = None
        z_e = None
        if store_epi:
            z_b = zarr.open(str(zarr_path(opr_id, "belief")), mode="w", shape=(T, H, W), dtype="f4", chunks=(1, H, W))
            z_e = zarr.open(str(zarr_path(opr_id, "entropy")), mode="w", shape=(T, H, W), dtype="f4", chunks=(1, H, W))
            z_b[0] = belief_t
            z_e[0] = entropy_t

        mean_entropy = np.zeros((T,), dtype=np.float32)
        mean_entropy[0] = float(entropy_t.mean())

        # Initial sensor positions
        bs_r, bs_c = m.network.base_station_rc
        cur = np.tile(np.array([[bs_r, bs_c]], dtype=np.int32), (m.network.n_sensors, 1))
        cur = clamp_rc(cur, H, W)

        deterministic = m.network.tie_breaking == "deterministic"
        max_moves_per_step = int(getattr(m.network, "max_moves_per_step", 0) or 0)

        # Delay queue of observations: each entry is int8 obs array (N,), -1/0/1
        # Delay is modeled as delivery lag after observation generation.
        # obs_now is generated at the current step; obs_apply is the delivered
        # observation after delay, taken from the queue below.
        delay = int(m.impairments.delay_steps or 0)
        delay = max(0, delay)
        empty_obs = np.full((m.network.n_sensors,), -1, dtype=np.int8)
        obs_queue: list[np.ndarray] = [empty_obs.copy() for _ in range(delay)]

        prev_cov = np.zeros((H, W), dtype=np.uint8)

        # ----------------------------
        # Main closed-loop execution
        # ----------------------------
        for t in range(T):
            # For usefulness_proto, choose an effective controller behavior
            # causally from the CURRENT usefulness state, before movement.
            if usefulness_proto_enabled:
                if int(usefulness_state_cur) == USEFULNESS_STATE_EXPLOIT:
                    effective_policy = "greedy"
                elif int(usefulness_state_cur) == USEFULNESS_STATE_RECOVER:
                    effective_policy = "uncertainty"
                else:
                    effective_policy = "mdc_info"
            else:
                effective_policy = str(m.network.policy)

            # ---- effective control knobs from active regime state (Patch 3B) ----
            # These are computed from the PREVIOUS active state and affect the
            # controller choices for the current step. The new active state for
            # this same step is computed later, after the delayed observation update.
            eta_effective_pre = _resolve_active_stage_eta(
                rgm_stages=rgm_stages,
                active_state=active_state_cur,
                active_stage_idx=active_stage_idx_cur,
                advisory_stage_idx=active_stage_idx_cur if active_state_cur == 3 else -1,
            ) if regime_active_enabled else None

            move_budget_cells_eff = _resolve_active_move_budget_cells(
                base_move_max_cells=move_max_cells,
                cell_size_m=cell_size_m,
                rgm_ladder=rgm_ladder,
                active_state=active_state_cur,
                active_level_idx=active_level_idx_cur,
            ) if regime_active_enabled else float(move_max_cells)

            deterministic_eff = _resolve_active_tie_breaking(
                base_deterministic=deterministic,
                active_enabled=regime_active_enabled,
                active_state=active_state_cur,
            )

            max_moves_per_step_eff = _resolve_active_max_moves_per_step(
                base_max_moves_per_step=max_moves_per_step,
                n_sensors=int(m.network.n_sensors),
                active_enabled=regime_active_enabled,
                active_state=active_state_cur,
            )

            entropy_control_t = _resolve_active_entropy_for_control(
                entropy_t=entropy_t,
                belief_t=belief_t,
                eta_effective=eta_effective_pre,
            ) if regime_active_enabled else entropy_t
            # Preserve the semantic meaning of frame t=0 for dynamic runs:
            # it should show the initialized deployment at the base station,
            # before any policy-driven movement occurs.
            #
            # Static runs still choose their placement at t=0, as before.
            if t == 0 and m.network.deployment_mode == "dynamic":
                cur = clamp_rc(cur, H, W)
            elif effective_policy == "random_feasible":
                # random within feasible region (baseline for budget emulation)
                score = rng.random((H, W)).astype(np.float32)
                if m.network.deployment_mode == "static":
                    if t == 0:
                        chosen = topk_with_separation(
                            score,
                            m.network.n_sensors,
                            min_sep_cells=min_sep_cells,
                            deterministic=False,
                            rng=rng,
                        )
                        cur = clamp_rc(chosen.astype(np.int32), H, W)
                else:
                    cur = move_sensors_greedy_limited(
                        cur,
                        score,
                        move_max_cells=move_budget_cells_eff,
                        min_sep_cells=min_sep_cells,
                        max_moves_per_step=max_moves_per_step_eff,
                        deterministic=False,
                        rng=rng,
                    )
                    cur = clamp_rc(cur, H, W)
            elif effective_policy in ("mdc_info", "mdc_arrival") and m.network.deployment_mode == "dynamic":
                # MDC-live controller (O1): choose moves to minimize a residual-style objective.
                # We keep this lightweight: predicted ΔH̄ is approximated from covered entropy mass.
                k_update = 0.5 * float(alpha_pos + alpha_neg)
                c_ctrl = float(c_info) if effective_policy == "mdc_info" else float(c_cov)
                cur = move_sensors_mdc_limited(
                    cur,
                    entropy_t=entropy_control_t,
                    offsets=offsets,
                    move_max_cells=move_budget_cells_eff,
                    min_sep_cells=min_sep_cells,
                    policy=effective_policy,
                    c_coef=c_ctrl,
                    k_update=k_update,
                    deterministic=deterministic_eff,
                    rng=rng,
                    max_moves_per_step=max_moves_per_step_eff,
                    k_candidates=20,
                    t=t,
                )
                cur = clamp_rc(cur, H, W)
            else:
                reset_uncertainty_score_debug_snapshot()
                score = compute_score_map(
                    belief_t,
                    entropy_control_t,
                    effective_policy,
                    uncertainty_memory=uncertainty_memory,
                    uncertainty_gamma=uncertainty_gamma,
                    uncertainty_beta=uncertainty_beta,
                    uncertainty_lambda=uncertainty_lambda,
                )
                if m.network.deployment_mode == "static":
                    if t == 0:
                        chosen = topk_with_separation(
                            score,
                            m.network.n_sensors,
                            min_sep_cells=min_sep_cells,
                            deterministic=deterministic_eff,
                            rng=rng,
                        )
                        cur = clamp_rc(chosen.astype(np.int32), H, W)
                else:
                    cur = move_sensors_greedy_limited(
                        cur,
                        score,
                        move_max_cells=move_budget_cells_eff,
                        min_sep_cells=min_sep_cells,
                        max_moves_per_step=max_moves_per_step_eff,
                        deterministic=deterministic_eff,
                        rng=rng,
                    )
                    cur = clamp_rc(cur, H, W)

                if str(effective_policy) == "uncertainty":
                    dbg = get_uncertainty_score_debug_snapshot()

                    uncertainty_debug_variance_mean[t] = float(
                        ((dbg.get("variance") or {}).get("mean", 0.0))
                    )
                    uncertainty_debug_variance_max[t] = float(
                        ((dbg.get("variance") or {}).get("max", 0.0))
                    )
                    uncertainty_debug_novelty_mean[t] = float(
                        ((dbg.get("novelty") or {}).get("mean", 0.0))
                    )
                    uncertainty_debug_novelty_max[t] = float(
                        ((dbg.get("novelty") or {}).get("max", 0.0))
                    )
                    uncertainty_debug_entropy_bonus_mean[t] = float(
                        ((dbg.get("entropy_bonus") or {}).get("mean", 0.0))
                    )
                    uncertainty_debug_entropy_bonus_max[t] = float(
                        ((dbg.get("entropy_bonus") or {}).get("max", 0.0))
                    )

                    uncertainty_debug_score_mean[t] = float(((dbg.get("score") or {}).get("mean", 0.0))
                    )
                    uncertainty_debug_score_max[t] = float(((dbg.get("score") or {}).get("max", 0.0)))

                else:
                    uncertainty_debug_variance_mean[t] = 0.0
                    uncertainty_debug_variance_max[t] = 0.0
                    uncertainty_debug_novelty_mean[t] = 0.0
                    uncertainty_debug_novelty_max[t] = 0.0
                    uncertainty_debug_entropy_bonus_mean[t] = 0.0
                    uncertainty_debug_entropy_bonus_max[t] = 0.0
                    uncertainty_debug_score_mean[t] = 0.0
                    uncertainty_debug_score_max[t] = 0.0

            sensors[t] = cur

            # Compute footprint mask once (coverage + new coverage + overlap metrics)
            cov = _vectorized_coverage_mask(sensors[t], offsets, H, W)

            # ---- Information driver estimates aligned to the delayed observation cause ----
            # IMPORTANT: delta_mean_entropy[t] is caused by obs_apply (delayed),
            # so driver_info[t] must be aligned to the SAME causal source.
            #
            # obs_apply at time t is generated by the sensor placement at time (t-delay).
            # When t < delay, we apply an "empty" observation; driver is 0.
            if delay > 0 and t - delay >= 0:
                sensors_gen = sensors[t - delay]
            else:
                sensors_gen = sensors[t] if delay == 0 else None
 
            if sensors_gen is None:
                driver_info_true[t] = 0.0
            else:
                driver_info_true[t] = _binary_sensor_expected_mi_union(
                    belief_t=belief_t,
                    sensors_gen_rc=sensors_gen,
                    offsets=offsets,
                    H=int(H),
                    W=int(W),
                    loss_prob=float(m.impairments.loss_prob),
                    noise_level=float(m.impairments.noise_level),
                )

            # ---- truth detections for this time step ----
            # Detection semantics should reflect actively burning cells, not
            # the union of burning+burned cells.
            true_det = detect_fire_at_sensors(fire_active[t], cur, offsets)  # uint8 0/1
            # Current-frame truth-aligned detection summary.
            true_detections_any[t] = 1 if int(np.sum(true_det)) > 0 else 0


            # ---- impairments + delay -> arrived obs applied now ----
            obs_now = _apply_impairments_to_detections(
                true_det,
                loss_prob=float(m.impairments.loss_prob),
                noise_level=float(m.impairments.noise_level),
                rng=rng,
            )

            obs_queue.append(obs_now)
            obs_apply = obs_queue.pop(0)  # apply delayed observation now

            # Minimal delivered-observation metadata for v0.2 diagnostics:
            # record the generation step of the observation currently being
            # applied, its delivery step, and its effective age in timesteps.
            if delay == 0:
                gen_step_t = t
            elif t - delay >= 0:
                gen_step_t = t - delay
            else:
                gen_step_t = -1

            obs_generation_step[t] = int(gen_step_t)
            obs_delivery_step[t] = int(t)
            obs_age_steps[t] = int(t - gen_step_t) if gen_step_t >= 0 else -1

            # realized "budget": arrivals after loss/delay
            arrived_mask = obs_apply >= 0
            arrivals_frac[t] = float(np.mean(arrived_mask.astype(np.float32))) if arrived_mask.size else 0.0
            detections_arrived_frac[t] = float(np.mean((obs_apply == 1).astype(np.float32))) if obs_apply.size else 0.0
            loss_frac[t] = 1.0 - float(arrivals_frac[t])

            # arrived detections (0/1) for plots/metrics: lost -> 0
            det_arrived = (obs_apply == 1).astype(np.uint8)
            detections[t] = det_arrived

            # ---- epistemic update: belief_{t+1} from obs_apply ----
            # IMPORTANT:
            # obs_apply at time t was GENERATED by sensors at time (t-delay), not by cur=sensors[t]
            # when delay>0. To keep Δmean_entropy[t] causally aligned with driver_*[t], apply the
            # arrived observation on the deployment that generated it.
            sensors_apply = sensors_gen if sensors_gen is not None else cur

            belief_tp1 = _update_belief_from_obs_in_footprints(
                belief_t,
                sensors_apply,
                offsets,
                obs_apply,
                alpha_pos=alpha_pos,
                alpha_neg=alpha_neg,
            )
            entropy_tp1 = _binary_entropy(belief_tp1)

            # Compute current front support once per step, unconditionally.
            #
            # This is used both by:
            #   1) regime requalification logic (when regime management is enabled)
            #   2) later overlap/render diagnostics (for all policies, including
            #      greedy / uncertainty / non-regime runs)
            #
            # Therefore it must not live only inside the regime_enabled branch.
            front_now = _front_band_mask(fire_active[t], band=front_band_cells)
            overlap_front_for_regime = float(
                _fraction_sensors_hitting_mask(sensors[t], offsets, front_now)
            )

            # Advisory-only regime-management signals (post-update state for this step)

            mean_entropy_before_bits_per_cell = float(np.mean(entropy_t))
            mean_entropy_after_bits_per_cell = float(np.mean(entropy_tp1))
            delta_mean_entropy_t = float(
                mean_entropy_after_bits_per_cell - mean_entropy_before_bits_per_cell
            )
            local_drift_rate_t = max(
                0.0,
                mean_entropy_before_bits_per_cell - mean_entropy_after_bits_per_cell,
            )
            # Causal corruption-sensitive usefulness diagnostic:
            # positive only when observations are arriving and mean entropy worsens.
            misleading_activity_t = float(arrivals_frac[t]) * max(
                0.0,
                float(delta_mean_entropy_t),
            )
            cumulative_exposure_running += mean_entropy_after_bits_per_cell

            if regime_enabled:
                # Certified-stage thresholds are calibrated on TOTAL entropy,
                # not mean entropy. Keep this explicit to avoid later confusion.
                entropy_after_total_bits = float(np.sum(entropy_tp1))
                stage_idx, _, expected_rate = _pick_certified_stage(
                    rgm_stages,
                    entropy_after_total_bits,
                )
                stage_eta = None
                if stage_idx >= 0 and 0 <= stage_idx < len(rgm_stages):
                    stage_eta = float(getattr(rgm_stages[stage_idx], "eta", 0.0))

                if stage_eta is not None and m.network.n_sensors > 0:
                    band_mask = (belief_tp1 >= float(stage_eta)) & (belief_tp1 <= float(1.0 - float(stage_eta)))
                    k_t = int(np.count_nonzero(band_mask))
                    utilization_t = float(min(int(m.network.n_sensors), int(k_t))) / float(max(1, int(m.network.n_sensors)))
                else:
                    utilization_t = 0.0

                strict_proxy_t = float(expected_rate) * float(utilization_t)
                level_idx, _ = _pick_opportunistic_level(rgm_ladder, utilization_t)

                down_comps = (
                    _regime_trigger_components_with_hysteresis(
                        utilization=utilization_t,
                        strict_drift_proxy=strict_proxy_t,
                        local_drift_rate=local_drift_rate_t,
                        cumulative_exposure=cumulative_exposure_running,
                        thr=downshift_thr,
                        mode="downshift",
                    )
                    if downshift_thr is not None else {}
                )
                # Debug instrumentation: expose both the effective hysteresis-
                # shifted thresholds and signed margins relative to those
                # thresholds. Positive margin means "on the trigger side".
                if downshift_thr is not None:
                    down_u_thr_eff = _threshold_with_hysteresis(downshift_thr, "utilization_threshold", -1.0)
                    down_s_thr_eff = _threshold_with_hysteresis(downshift_thr, "strict_drift_proxy_threshold", -1.0)
                    debug_down_utilization_threshold[t] = float(down_u_thr_eff)
                    debug_down_strict_threshold[t] = float(down_s_thr_eff)
                    debug_down_hysteresis[t] = float(getattr(downshift_thr, "hysteresis_band", 0.0) or 0.0)
                    if down_u_thr_eff > 0.0:
                        debug_down_utilization_margin[t] = float(
                            _threshold_margin(utilization_t, down_u_thr_eff, direction="down")
                        )
                    if down_s_thr_eff > 0.0:
                        debug_down_strict_margin[t] = float(
                            _threshold_margin(strict_proxy_t, down_s_thr_eff, direction="down")
                        )

                switch_comps = (
                    _regime_trigger_components_with_hysteresis(
                        utilization=utilization_t,
                        strict_drift_proxy=strict_proxy_t,
                        local_drift_rate=local_drift_rate_t,
                        cumulative_exposure=cumulative_exposure_running,
                        thr=switch_cert_thr,
                        mode="switch",
                    )
                    if switch_cert_thr is not None else {}
                )
                if switch_cert_thr is not None:
                    switch_u_thr_eff = _threshold_with_hysteresis(switch_cert_thr, "utilization_threshold", -1.0)
                    switch_s_thr_eff = _threshold_with_hysteresis(switch_cert_thr, "strict_drift_proxy_threshold", -1.0)
                    debug_switch_utilization_threshold[t] = float(switch_u_thr_eff)
                    debug_switch_strict_threshold[t] = float(switch_s_thr_eff)
                    debug_switch_hysteresis[t] = float(getattr(switch_cert_thr, "hysteresis_band", 0.0) or 0.0)
                    if switch_u_thr_eff > 0.0:
                        debug_switch_utilization_margin[t] = float(
                            _threshold_margin(utilization_t, switch_u_thr_eff, direction="down")
                        )
                    if switch_s_thr_eff > 0.0:
                        debug_switch_strict_margin[t] = float(
                            _threshold_margin(strict_proxy_t, switch_s_thr_eff, direction="down")
                        )

                recovery_comps = (
                    _regime_trigger_components_with_hysteresis(
                        utilization=utilization_t,
                        strict_drift_proxy=strict_proxy_t,
                        local_drift_rate=local_drift_rate_t,
                        cumulative_exposure=cumulative_exposure_running,
                        thr=recovery_thr,
                        mode="recovery",
                    )
                    if recovery_thr is not None else {}
                )
                if recovery_thr is not None:
                    rec_u_thr_eff = _threshold_with_hysteresis(recovery_thr, "utilization_threshold", +1.0)
                    rec_s_thr_eff = _threshold_with_hysteresis(recovery_thr, "strict_drift_proxy_threshold", +1.0)
                    debug_recovery_utilization_threshold[t] = float(rec_u_thr_eff)
                    debug_recovery_strict_threshold[t] = float(rec_s_thr_eff)
                    debug_recovery_hysteresis[t] = float(getattr(recovery_thr, "hysteresis_band", 0.0) or 0.0)
                    if rec_u_thr_eff > 0.0:
                        debug_recovery_utilization_margin[t] = float(
                            _threshold_margin(utilization_t, rec_u_thr_eff, direction="up")
                        )
                    if rec_s_thr_eff > 0.0:
                        debug_recovery_strict_margin[t] = float(
                            _threshold_margin(strict_proxy_t, rec_s_thr_eff, direction="up")
                        )

                # Advisory mode keeps stricter ALL-components semantics.
                # Active mode currently uses permissive ANY-of-enabled logic for
                # generic downshift/recovery triggers, while switch-to-certified
                # is special-cased below. This is intentionally surfaced here
                # because it can dominate visible hysteresis effects.
                # Policy:
                # - advisory mode stays conservative: all enabled components must agree
                # - active verification presets may stay permissive so the machine is easy to exercise
                # - active non-verify presets should again require coordinated evidence
                require_all_components = (not regime_active_enabled) or (not active_verify_style)

                trig_down = _combine_regime_trigger_components(
                    down_comps,
                    use_utilization=use_utilization,
                    use_strict_drift_proxy=use_strict_drift_proxy,
                    use_local_drift_rate=use_local_drift_rate,
                    use_cumulative_exposure=use_cumulative_exposure,
                    use_trigger_bools=use_trigger_bools,
                    require_all=require_all_components,
                )
                trig_switch = (
                    _combine_switch_to_certified_components_active(
                        switch_comps,
                        use_utilization=use_utilization,
                        use_strict_drift_proxy=use_strict_drift_proxy,
                        use_local_drift_rate=use_local_drift_rate,
                        use_cumulative_exposure=use_cumulative_exposure,
                        use_trigger_bools=use_trigger_bools,
                        verify_style=active_verify_style,
                    )
                    if regime_active_enabled
                    else _combine_regime_trigger_components(
                        switch_comps,
                        use_utilization=use_utilization,
                        use_strict_drift_proxy=use_strict_drift_proxy,
                        use_local_drift_rate=use_local_drift_rate,
                        use_cumulative_exposure=use_cumulative_exposure,
                        use_trigger_bools=use_trigger_bools,
                        require_all=True,
                    )
                )
                trig_recovery = _combine_regime_trigger_components(
                    recovery_comps,
                    use_utilization=use_utilization,
                    use_strict_drift_proxy=use_strict_drift_proxy,
                    use_local_drift_rate=use_local_drift_rate,
                    use_cumulative_exposure=use_cumulative_exposure,
                    use_trigger_bools=use_trigger_bools,
                    require_all=require_all_components,
                )

                # Certified exit should represent requalification for
                # opportunistic control under renewed informative opportunity,
                # not only healthy-side utilization / strict proxy.
                info_scale = max(
                    1e-6,
                    float(np.max(driver_info_true[: t + 1])) if t >= 0 else 1.0,
                )
                support_front = float(np.clip(overlap_front_for_regime, 0.0, 1.0))
                support_detect = float(np.clip(detections_arrived_frac[t], 0.0, 1.0))
                support_info = float(np.clip(float(driver_info_true[t]) / info_scale, 0.0, 1.0))

                u_thr_rec = _threshold_with_hysteresis(recovery_thr, "utilization_threshold", +1.0) if recovery_thr is not None else 0.0
                s_thr_rec = _threshold_with_hysteresis(recovery_thr, "strict_drift_proxy_threshold", +1.0) if recovery_thr is not None else 0.0
                util_health = 0.0
                strict_health = 0.0
                if u_thr_rec > 0.0:
                    util_health = float(np.clip(float(utilization_t) / max(float(u_thr_rec), 1e-6), 0.0, 1.0))
                if s_thr_rec > 0.0:
                    strict_health = float(np.clip(float(strict_proxy_t) / max(float(s_thr_rec), 1e-6), 0.0, 1.0))
                support_health = float(max(util_health, strict_health))

                requal_support_score_t = float(
                    (
                        w_front * support_front
                        + w_detect * support_detect
                        + w_info * support_info
                        + w_health * support_health
                    ) / requal_w_sum
                )
                requal_support_breadth_t = float(np.clip(overlap_front_for_regime, 0.0, 1.0))

                regime_requal_support_score[t] = requal_support_score_t
                regime_requal_support_breadth[t] = requal_support_breadth_t
                debug_requal_support_front[t] = support_front
                debug_requal_support_detect[t] = support_detect
                debug_requal_support_info[t] = support_info
                debug_requal_support_health[t] = support_health

                trig_leave_certified = (
                    _compute_leave_certified_trigger(
                        trig_switch=trig_switch,
                        requal_support_score=requal_support_score_t,
                        requal_support_breadth=requal_support_breadth_t,
                        support_threshold=recovery_support_threshold,
                        breadth_threshold=recovery_breadth_threshold,
                        require_switch_off=recovery_support_require_switch_off,
                    )
                    if recovery_support_enabled else False
                )
                debug_trig_down_utilization_component[t] = 1 if down_comps.get("utilization", False) else 0
                debug_trig_down_strict_component[t] = 1 if down_comps.get("strict_drift_proxy", False) else 0
                debug_trig_down_final[t] = 1 if trig_down else 0
                debug_trig_switch_utilization_component[t] = 1 if switch_comps.get("utilization", False) else 0
                debug_trig_switch_strict_component[t] = 1 if switch_comps.get("strict_drift_proxy", False) else 0
                debug_trig_switch_final[t] = 1 if trig_switch else 0

                debug_trig_switch_local_component[t] = 1 if switch_comps.get("local_drift_rate", False) else 0
                debug_trig_switch_exposure_component[t] = 1 if switch_comps.get("cumulative_exposure", False) else 0
                debug_trig_leave_certified_final[t] = 1 if trig_leave_certified else 0

                regime_utilization[t] = float(utilization_t) if use_utilization else 0.0
                regime_strict_drift_proxy[t] = float(strict_proxy_t) if use_strict_drift_proxy else 0.0
                regime_local_drift_rate[t] = float(local_drift_rate_t) if use_local_drift_rate else 0.0
                regime_cumulative_exposure[t] = float(cumulative_exposure_running) if use_cumulative_exposure else 0.0
                regime_state[t] = int(
                    _regime_state_code(
                        regime_enabled=True,
                        trigger_downshift=trig_down,
                        trigger_switch_to_certified=trig_switch,
                        trigger_recovery=trig_recovery,
                    )
                )
                regime_trigger_downshift[t] = 1 if trig_down else 0
                regime_trigger_switch_to_certified[t] = 1 if trig_switch else 0
                regime_trigger_recovery[t] = 1 if trig_recovery else 0
                regime_certified_stage_index[t] = int(stage_idx)
                regime_opportunistic_level_index[t] = int(level_idx)
                regime_advisory_stage_eta[t] = float(stage_eta) if stage_eta is not None else 0.0


                # Active state machine
                if regime_active_enabled:
                    active_state_prev = int(active_state_cur)

                    # Update persistence counters in a state-aware way so
                    # irrelevant trigger memory does not leak across states.
                    (
                        down_counter,
                        switch_counter,
                        recovery_counter,
                        leave_certified_counter,
                    ) = _update_active_regime_counters(
                        cur_state=active_state_cur,
                        trig_down=trig_down,
                        trig_switch=trig_switch,
                        trig_recovery=trig_recovery,
                        trig_leave_certified=trig_leave_certified,
                        down_counter=down_counter,
                        switch_counter=switch_counter,
                        recovery_counter=recovery_counter,
                        leave_certified_counter=leave_certified_counter,
                    )
                    debug_down_counter[t] = int(down_counter)
                    debug_switch_counter[t] = int(switch_counter)
                    debug_recovery_counter[t] = int(recovery_counter)
                    debug_leave_certified_counter[t] = int(leave_certified_counter)
                    (
                        active_state_cur,
                        active_stage_idx_cur,
                        active_level_idx_cur,
                        transition_event_t,
                    ) = _active_regime_transition(
                        active_enabled=True,
                        cur_state=active_state_cur,
                        cur_stage_idx=active_stage_idx_cur,
                        cur_level_idx=active_level_idx_cur,
                        stage_idx_suggested=stage_idx,
                        level_idx_suggested=level_idx,
                        trig_down=trig_down,
                        trig_switch=trig_switch,
                        trig_recovery=trig_recovery,
                        trig_leave_certified=trig_leave_certified,
                        down_counter=down_counter,
                        switch_counter=switch_counter,
                        recovery_counter=recovery_counter,
                        leave_certified_counter=leave_certified_counter,
                        down_persistence=down_persistence,
                        switch_persistence=switch_persistence,
                        recovery_persistence=recovery_persistence,
                        leave_certified_persistence=leave_certified_persistence,
                        recovery_block_counter=recovery_block_counter,
                        max_level_idx=max_ladder_idx,
                    )
                    recovery_block_counter = _update_active_regime_cooldowns(
                        cur_state=active_state_cur,
                        prev_state=active_state_prev,
                        recovery_block_counter=recovery_block_counter,
                        recovery_block_steps=recovery_block_steps,
                    )
                    debug_recovery_block_counter[t] = int(recovery_block_counter)
                    regime_active_state[t] = int(active_state_cur)
                    regime_active_certified_stage_index[t] = int(active_stage_idx_cur)
                    regime_active_opportunistic_level_index[t] = int(active_level_idx_cur)
                    regime_active_transition_event[t] = int(transition_event_t)
                    eta_effective_post = _resolve_active_stage_eta(
                        rgm_stages=rgm_stages,
                        active_state=active_state_cur,
                        active_stage_idx=active_stage_idx_cur,
                        advisory_stage_idx=-1,
                    )
                    regime_effective_eta[t] = float(eta_effective_post) if eta_effective_post is not None else 0.0
                    regime_effective_move_budget_cells[t] = float(
                        _resolve_active_move_budget_cells(
                            base_move_max_cells=move_max_cells,
                            cell_size_m=cell_size_m,
                            rgm_ladder=rgm_ladder,
                            active_state=active_state_cur,
                            active_level_idx=active_level_idx_cur,
                        )
                    )
                else:
                    debug_down_counter[t] = 0
                    debug_switch_counter[t] = 0
                    debug_recovery_counter[t] = 0
                    debug_recovery_block_counter[t] = 0
                    debug_leave_certified_counter[t] = 0
                    debug_trig_leave_certified_final[t] = 0
                    regime_active_state[t] = 0
                    regime_active_certified_stage_index[t] = -1
                    regime_active_opportunistic_level_index[t] = -1
                    regime_active_transition_event[t] = 0
                    regime_effective_eta[t] = 0.0
                    regime_effective_move_budget_cells[t] = float(move_max_cells) if regime_enabled else 0.0
            else:
                debug_down_utilization_margin[t] = np.nan
                debug_down_strict_margin[t] = np.nan
                regime_local_drift_rate[t] = float(local_drift_rate_t)
                regime_cumulative_exposure[t] = float(cumulative_exposure_running)
                debug_down_utilization_threshold[t] = np.nan
                debug_down_strict_threshold[t] = np.nan
                debug_down_hysteresis[t] = np.nan
                debug_trig_down_utilization_component[t] = 0
                debug_trig_down_strict_component[t] = 0
                debug_trig_down_final[t] = 0
                debug_switch_utilization_margin[t] = np.nan
                debug_switch_strict_margin[t] = np.nan
                debug_switch_utilization_threshold[t] = np.nan
                debug_switch_strict_threshold[t] = np.nan
                debug_switch_hysteresis[t] = np.nan
                debug_trig_switch_utilization_component[t] = 0
                debug_trig_switch_strict_component[t] = 0
                debug_trig_switch_final[t] = 0
                debug_trig_switch_local_component[t] = 0
                debug_trig_switch_exposure_component[t] = 0
                debug_recovery_utilization_margin[t] = np.nan
                debug_recovery_strict_margin[t] = np.nan
                debug_recovery_utilization_threshold[t] = np.nan
                debug_recovery_strict_threshold[t] = np.nan
                debug_recovery_hysteresis[t] = np.nan
                debug_down_counter[t] = 0
                debug_switch_counter[t] = 0
                debug_recovery_counter[t] = 0
                debug_recovery_block_counter[t] = 0
                debug_leave_certified_counter[t] = 0
                debug_trig_leave_certified_final[t] = 0
                regime_state[t] = 0
                regime_advisory_stage_eta[t] = 0.0
                regime_active_state[t] = 0
                regime_active_certified_stage_index[t] = -1
                regime_active_opportunistic_level_index[t] = -1
                regime_active_transition_event[t] = 0
                regime_effective_eta[t] = 0.0
                regime_effective_move_budget_cells[t] = 0.0

            # Store trace frame t (already stored t=0 above)
            if store_epi and t > 0 and z_b is not None and z_e is not None:
                z_b[t] = belief_t
                z_e[t] = entropy_t

            # advance
            belief_t = belief_tp1
            entropy_t = entropy_tp1

            if t + 1 < T:
                mean_entropy[t + 1] = float(entropy_t.mean())

            # ---- operational series + renders ----
            arrived_detections_any[t] = 1 if int(detections[t].sum()) > 0 else 0

            # Legacy compatibility: preserve old field as arrived/impaired semantics.
            detections_any[t] = arrived_detections_any[t]

            coverage_frac[t] = float(cov.sum()) / float(H * W)

            new_cov = (cov > 0) & (prev_cov == 0)
            new_coverage_frac[t] = float(np.count_nonzero(new_cov)) / float(H * W)
            prev_cov = cov

            # Update uncertainty memory from realized coverage.
            # This is backend-local state used only by the redesigned
            # uncertainty policy; it does not alter regime logic directly.
            # Use a persistent memory shadow:
            #   - covered cells get a strong immediate imprint
            #   - old memory decays gradually over time
            uncertainty_memory = np.maximum(
                float(uncertainty_decay) * uncertainty_memory,
                float(uncertainty_gain) * cov.astype(np.float32),
            ).astype(np.float32)

            uncertainty_memory = np.clip(uncertainty_memory, 0.0, 1.0)

            # Causal usefulness-aware rolling support + state update.
            # This is the compact three-regime Subgoal E scaffold and is only
            # active for policy == usefulness_proto.
            if obs_age_steps[t] >= 0:
                usefulness_recent_obs_age_window.append(float(obs_age_steps[t]))
            misleading_activity[t] = np.float32(misleading_activity_t)
            usefulness_recent_misleading_window.append(float(misleading_activity[t]))
            usefulness_recent_driver_info_window.append(float(driver_info_true[t]))

            if len(usefulness_recent_obs_age_window) > 0:
                recent_obs_age_mean_valid[t] = np.float32(
                    np.mean(np.asarray(usefulness_recent_obs_age_window, dtype=np.float32))
                )
            if len(usefulness_recent_misleading_window) > 0:
                mis_arr = np.asarray(usefulness_recent_misleading_window, dtype=np.float32)
                recent_misleading_activity_mean[t] = np.float32(np.mean(mis_arr))
                recent_misleading_activity_pos_frac[t] = np.float32(np.mean((mis_arr > 0.0).astype(np.float32)))
            if len(usefulness_recent_driver_info_window) > 0:
                recent_driver_info_true_mean[t] = np.float32(
                    np.mean(np.asarray(usefulness_recent_driver_info_window, dtype=np.float32))
                )

            age_recent_t = (
                float(recent_obs_age_mean_valid[t])
                if np.isfinite(recent_obs_age_mean_valid[t]) else None
            )
            misleading_pos_recent_t = (
                float(recent_misleading_activity_pos_frac[t])
                if np.isfinite(recent_misleading_activity_pos_frac[t]) else None
            )
            driver_recent_t = (
                float(recent_driver_info_true_mean[t])
                if np.isfinite(recent_driver_info_true_mean[t]) else None
            )

            trig_recover_t = False
            trig_caution_t = False
            trig_recover_from_caution_t = False
            trig_exploit_t = False
            if usefulness_proto_enabled:
                # Compute raw support conditions first.
                raw_trig_recover_t = _usefulness_trigger_recover(
                    recent_obs_age_mean_valid=age_recent_t,
                    recent_misleading_activity_pos_frac=misleading_pos_recent_t,
                    recent_driver_info_true_mean=driver_recent_t,
                    arrivals_frac_t=float(arrivals_frac[t]),
                )
                raw_trig_caution_t = _usefulness_trigger_caution(
                    recent_obs_age_mean_valid=age_recent_t,
                    recent_misleading_activity_pos_frac=misleading_pos_recent_t,
                    recent_driver_info_true_mean=driver_recent_t,
                    arrivals_frac_t=float(arrivals_frac[t]),
                )
                raw_trig_recover_from_caution_t = _usefulness_trigger_recover_from_caution(
                    recent_obs_age_mean_valid=age_recent_t,
                    recent_misleading_activity_pos_frac=misleading_pos_recent_t,
                    recent_driver_info_true_mean=driver_recent_t,
                    arrivals_frac_t=float(arrivals_frac[t]),
                )
                raw_trig_exploit_t = _usefulness_trigger_exploit(
                    recent_obs_age_mean_valid=age_recent_t,
                    recent_misleading_activity_pos_frac=misleading_pos_recent_t,
                    recent_driver_info_true_mean=driver_recent_t,
                    arrivals_frac_t=float(arrivals_frac[t]),
                )

                # State-gate triggers so only meaningful transitions accumulate persistence.
                cur_usefulness_state = int(usefulness_state_cur)

                # exploit -> recover
                trig_recover_t = bool(
                    cur_usefulness_state == USEFULNESS_STATE_EXPLOIT
                    and raw_trig_recover_t
                )

                # exploit/recover -> caution
                trig_caution_t = bool(
                    cur_usefulness_state in (
                        USEFULNESS_STATE_EXPLOIT,
                        USEFULNESS_STATE_RECOVER,
                    )
                    and raw_trig_caution_t
                )

                # caution -> recover
                trig_recover_from_caution_t = bool(
                    cur_usefulness_state == USEFULNESS_STATE_CAUTION
                    and raw_trig_recover_from_caution_t
                )

                # recover -> exploit
                trig_exploit_t = bool(
                    cur_usefulness_state == USEFULNESS_STATE_RECOVER
                    and raw_trig_exploit_t
                )

                # State-aware persistence counters.
                recover_counter_cur = (
                    int(recover_counter_cur) + 1 if trig_recover_t else 0
                )
                caution_counter_cur = (
                    int(caution_counter_cur) + 1 if trig_caution_t else 0
                )
                recover_exit_counter_cur = (
                    int(recover_exit_counter_cur) + 1
                    if trig_recover_from_caution_t else 0
                )
                exploit_counter_cur = (
                    int(exploit_counter_cur) + 1 if trig_exploit_t else 0
                )

                usefulness_state_cur = _usefulness_transition(
                    cur_state=usefulness_state_cur,
                    trig_recover=trig_recover_t,
                    trig_caution=trig_caution_t,
                    trig_recover_from_caution=trig_recover_from_caution_t,
                    trig_exploit=trig_exploit_t,
                    recover_counter=recover_counter_cur,
                    caution_counter=caution_counter_cur,
                    recover_exit_counter=recover_exit_counter_cur,
                    exploit_counter=exploit_counter_cur,
                )
            else:
                recover_counter_cur = 0
                caution_counter_cur = 0
                recover_exit_counter_cur = 0
                exploit_counter_cur = 0
                usefulness_state_cur = USEFULNESS_STATE_EXPLOIT

            usefulness_regime_state[t] = int(usefulness_state_cur)
            usefulness_trigger_recover[t] = 1 if trig_recover_t else 0
            usefulness_trigger_caution[t] = 1 if trig_caution_t else 0
            usefulness_trigger_recover_from_caution[t] = 1 if trig_recover_from_caution_t else 0
            usefulness_trigger_exploit[t] = 1 if trig_exploit_t else 0
            usefulness_recover_counter[t] = int(recover_counter_cur)
            usefulness_caution_counter[t] = int(caution_counter_cur)
            usefulness_recover_exit_counter[t] = int(recover_exit_counter_cur)
            usefulness_exploit_counter[t] = int(exploit_counter_cur)

            if t == 0:
                movement_l1_mean[t] = 0.0
                moves_per_step[t] = 0
                moved_frac[t] = 0.0
            else:
                d = np.abs(sensors[t].astype(np.int32) - sensors[t - 1].astype(np.int32))
                movement_l1_mean[t] = float(np.mean(d[:, 0] + d[:, 1]))
                moved = np.any(sensors[t].astype(np.int32) != sensors[t - 1].astype(np.int32), axis=1)
                mc = int(np.count_nonzero(moved))
                moves_per_step[t] = mc
                moved_frac[t] = float(mc) / float(max(1, int(m.network.n_sensors)))

            # Primary overlap metric: actively burning cells only.
            overlap_fire_sensors[t] = float(_fraction_sensors_hitting_mask(sensors[t], offsets, fire_active[t]))
            # Diagnostic companion: any nonzero fire-state cell (burning or burned).
            overlap_fire_any_sensors[t] = float(_fraction_sensors_hitting_mask(sensors[t], offsets, fire_any[t]))

            # Front band should be derived from active burning, not burned interior.
            front = front_now
            overlap_front_sensors[t] = float(overlap_front_for_regime)

            td = renders_t_dir(opr_id, t)
            render_deployment_overlay_png(
                terr01,
                # Keep the full nonzero fire footprint in the deployment overlay
                # for visual context. Metrics above now distinguish active-only
                # from burning-or-burned explicitly.
                fire_any[t],
                sensors[t],
                td / "deployment.png",
                radius_cells=radius_cells,
                show_fire=True,
                show_grid=False,
            )

            # Step 5: fire "front band" overlay (transparent), aligned to canonical canvas
            render_front_band_png(
                td / "front.png",
                front,
                terrain=None,     # overlay mode (transparent background)
                show_grid=False,
                alpha=0.90,
            )

        # ----------------------------
        # Persistence: core arrays and derived series
        # ----------------------------        
        # Persist core arrays
        z_s = zarr.open(
            str(zarr_path(opr_id, "sensors_rc")),
            mode="w",
            shape=sensors.shape,
            dtype="i4",
            chunks=(1, m.network.n_sensors, 2),
        )
        z_s[:] = sensors

        z_d = zarr.open(
            str(zarr_path(opr_id, "detections")),
            mode="w",
            shape=detections.shape,
            dtype="u1",
            chunks=(1, m.network.n_sensors),
        )
        z_d[:] = detections

        _write_named_1d_series(
            opr_id=opr_id,
            items=[
                ("true_detections_any", true_detections_any, "u1"),
                ("arrived_detections_any", arrived_detections_any, "u1"),
                ("detections_any", detections_any, "u1"),
                ("coverage_frac", coverage_frac.astype(np.float32), "f4"),
                ("new_coverage_frac", new_coverage_frac.astype(np.float32), "f4"),
                ("movement_l1_mean", movement_l1_mean.astype(np.float32), "f4"),
                ("moves_per_step", moves_per_step.astype(np.int32), "i4"),
                ("moved_frac", moved_frac.astype(np.float32), "f4"),
                ("overlap_fire_sensors", overlap_fire_sensors.astype(np.float32), "f4"),
                ("overlap_fire_any_sensors", overlap_fire_any_sensors.astype(np.float32), "f4"),
                ("overlap_front_sensors", overlap_front_sensors.astype(np.float32), "f4"),
                ("uncertainty_debug_variance_mean", uncertainty_debug_variance_mean.astype(np.float32), "f4"),
                ("uncertainty_debug_variance_max", uncertainty_debug_variance_max.astype(np.float32), "f4"),
                ("uncertainty_debug_novelty_mean", uncertainty_debug_novelty_mean.astype(np.float32), "f4"),
                ("uncertainty_debug_novelty_max", uncertainty_debug_novelty_max.astype(np.float32), "f4"),
                ("uncertainty_debug_entropy_bonus_mean", uncertainty_debug_entropy_bonus_mean.astype(np.float32), "f4"),
                ("uncertainty_debug_entropy_bonus_max", uncertainty_debug_entropy_bonus_max.astype(np.float32), "f4"),
                ("uncertainty_debug_score_mean", uncertainty_debug_score_mean.astype(np.float32), "f4"),
                ("uncertainty_debug_score_max", uncertainty_debug_score_max.astype(np.float32), "f4"),
            ],
        )

        _write_named_1d_series(
            opr_id=opr_id,
            items=[
                ("arrivals_frac", arrivals_frac.astype(np.float32), "f4"),
                ("detections_arrived_frac", detections_arrived_frac.astype(np.float32), "f4"),
                ("obs_generation_step", obs_generation_step.astype(np.int32), "i4"),
                ("obs_delivery_step", obs_delivery_step.astype(np.int32), "i4"),
                ("obs_age_steps", obs_age_steps.astype(np.int32), "i4"),
                ("loss_frac", loss_frac.astype(np.float32), "f4"),
                ("mean_entropy", mean_entropy.astype(np.float32), "f4"),
            ],
        )
        delta_mean_entropy = np.zeros_like(mean_entropy)
        if T > 1:
            delta_mean_entropy[:-1] = mean_entropy[1:] - mean_entropy[:-1]

        # First minimal wedge-style diagnostic:
        # arrivals_frac captures delivered observation activity, while
        # max(0, -delta_mean_entropy) captures realized uncertainty reduction.
        # A larger positive usefulness_gap means observations are still arriving
        # but belief improvement is weak relative to that activity.
        usefulness_gap = arrivals_frac - np.maximum(
            0.0,
            -delta_mean_entropy.astype(np.float32),
        ).astype(np.float32)

        _write_named_1d_series(
            opr_id=opr_id,
            items=[
                ("delta_mean_entropy", delta_mean_entropy.astype(np.float32), "f4"),
                ("usefulness_gap", usefulness_gap.astype(np.float32), "f4"),
                ("misleading_activity", misleading_activity.astype(np.float32), "f4"),
                ("recent_obs_age_mean_valid", recent_obs_age_mean_valid.astype(np.float32), "f4"),
                ("recent_misleading_activity_mean", recent_misleading_activity_mean.astype(np.float32), "f4"),
                ("recent_misleading_activity_pos_frac", recent_misleading_activity_pos_frac.astype(np.float32), "f4"),
                ("recent_driver_info_true_mean", recent_driver_info_true_mean.astype(np.float32), "f4"),
                ("usefulness_regime_state", usefulness_regime_state.astype(np.int32), "i4"),
                ("usefulness_trigger_recover", usefulness_trigger_recover.astype(np.uint8), "u1"),
                ("usefulness_trigger_caution", usefulness_trigger_caution.astype(np.uint8), "u1"),
                ("usefulness_trigger_recover_from_caution", usefulness_trigger_recover_from_caution.astype(np.uint8), "u1"),
                ("usefulness_trigger_exploit", usefulness_trigger_exploit.astype(np.uint8), "u1"),
                ("usefulness_recover_counter", usefulness_recover_counter.astype(np.int32), "i4"),
                ("usefulness_caution_counter", usefulness_caution_counter.astype(np.int32), "i4"),
                ("usefulness_recover_exit_counter", usefulness_recover_exit_counter.astype(np.int32), "i4"),
                ("usefulness_exploit_counter", usefulness_exploit_counter.astype(np.int32), "i4"),
                ("driver_info_true", driver_info_true.astype(np.float32), "f4"),
                ("regime_requal_support_score", regime_requal_support_score.astype(np.float32), "f4"),
                ("regime_requal_support_breadth", regime_requal_support_breadth.astype(np.float32), "f4"),
                ("debug_requal_support_front", debug_requal_support_front.astype(np.float32), "f4"),
                ("debug_requal_support_detect", debug_requal_support_detect.astype(np.float32), "f4"),
                ("debug_requal_support_info", debug_requal_support_info.astype(np.float32), "f4"),
                ("debug_requal_support_health", debug_requal_support_health.astype(np.float32), "f4"),
            ],
        )

        if T > 1:
            residual_cov[:-1] = delta_mean_entropy[:-1] + float(c_cov) * arrivals_frac[:-1]
            residual_info[:-1] = delta_mean_entropy[:-1] + float(c_info) * driver_info_true[:-1]
        _write_named_1d_series(
            opr_id=opr_id,
            items=[
                ("residual_cov", residual_cov.astype(np.float32), "f4"),
                ("residual_info", residual_info.astype(np.float32), "f4"),
                ("regime_utilization", regime_utilization.astype(np.float32), "f4"),
                ("regime_strict_drift_proxy", regime_strict_drift_proxy.astype(np.float32), "f4"),
                ("regime_local_drift_rate", regime_local_drift_rate.astype(np.float32), "f4"),
                ("regime_cumulative_exposure", regime_cumulative_exposure.astype(np.float32), "f4"),
                ("regime_state", regime_state.astype(np.int32), "i4"),
                ("regime_trigger_downshift", regime_trigger_downshift.astype(np.uint8), "u1"),
                ("regime_trigger_switch_to_certified", regime_trigger_switch_to_certified.astype(np.uint8), "u1"),
                ("regime_trigger_recovery", regime_trigger_recovery.astype(np.uint8), "u1"),
                ("regime_certified_stage_index", regime_certified_stage_index.astype(np.int32), "i4"),
                ("regime_opportunistic_level_index", regime_opportunistic_level_index.astype(np.int32), "i4"),
                ("regime_advisory_stage_eta", regime_advisory_stage_eta.astype(np.float32), "f4"),
                ("regime_active_state", regime_active_state.astype(np.int32), "i4"),
                ("regime_active_certified_stage_index", regime_active_certified_stage_index.astype(np.int32), "i4"),
                ("regime_active_opportunistic_level_index", regime_active_opportunistic_level_index.astype(np.int32), "i4"),
                ("regime_active_transition_event", regime_active_transition_event.astype(np.int32), "i4"),
                ("regime_effective_eta", regime_effective_eta.astype(np.float32), "f4"),
                ("regime_effective_move_budget_cells", regime_effective_move_budget_cells.astype(np.float32), "f4"),
                ("debug_down_utilization_margin", debug_down_utilization_margin.astype(np.float32), "f4"),
                ("debug_down_strict_margin", debug_down_strict_margin.astype(np.float32), "f4"),
                ("debug_down_utilization_threshold", debug_down_utilization_threshold.astype(np.float32), "f4"),
                ("debug_down_strict_threshold", debug_down_strict_threshold.astype(np.float32), "f4"),
                ("debug_down_hysteresis", debug_down_hysteresis.astype(np.float32), "f4"),
                ("debug_trig_down_utilization_component", debug_trig_down_utilization_component.astype(np.uint8), "u1"),
                ("debug_trig_down_strict_component", debug_trig_down_strict_component.astype(np.uint8), "u1"),
                ("debug_trig_down_final", debug_trig_down_final.astype(np.uint8), "u1"),
                ("debug_switch_utilization_margin", debug_switch_utilization_margin.astype(np.float32), "f4"),
                ("debug_switch_strict_margin", debug_switch_strict_margin.astype(np.float32), "f4"),
                ("debug_switch_utilization_threshold", debug_switch_utilization_threshold.astype(np.float32), "f4"),
                ("debug_switch_strict_threshold", debug_switch_strict_threshold.astype(np.float32), "f4"),
                ("debug_switch_hysteresis", debug_switch_hysteresis.astype(np.float32), "f4"),
                ("debug_trig_switch_utilization_component", debug_trig_switch_utilization_component.astype(np.uint8), "u1"),
                ("debug_trig_switch_strict_component", debug_trig_switch_strict_component.astype(np.uint8), "u1"),
                ("debug_trig_switch_local_component", debug_trig_switch_local_component.astype(np.uint8), "u1"),
                ("debug_trig_switch_exposure_component", debug_trig_switch_exposure_component.astype(np.uint8), "u1"),
                ("debug_trig_switch_final", debug_trig_switch_final.astype(np.uint8), "u1"),
                ("debug_recovery_utilization_margin", debug_recovery_utilization_margin.astype(np.float32), "f4"),
                ("debug_recovery_strict_margin", debug_recovery_strict_margin.astype(np.float32), "f4"),
                ("debug_recovery_utilization_threshold", debug_recovery_utilization_threshold.astype(np.float32), "f4"),
                ("debug_recovery_strict_threshold", debug_recovery_strict_threshold.astype(np.float32), "f4"),
                ("debug_recovery_hysteresis", debug_recovery_hysteresis.astype(np.float32), "f4"),
                ("debug_down_counter", debug_down_counter.astype(np.int32), "i4"),
                ("debug_switch_counter", debug_switch_counter.astype(np.int32), "i4"),
                ("debug_recovery_counter", debug_recovery_counter.astype(np.int32), "i4"),
                ("debug_recovery_block_counter", debug_recovery_block_counter.astype(np.int32), "i4"),
                ("debug_leave_certified_counter", debug_leave_certified_counter.astype(np.int32), "i4"),
                ("debug_trig_leave_certified_final", debug_trig_leave_certified_final.astype(np.uint8), "u1"),
            ],
        )

        # ----------------------------
        # Summary-only aggregate calculations
        # ----------------------------        
        # Residual band summaries (for tables / quick comparisons)
        # If eps_ref>0: use that absolute band.
        # If eps_ref==0: auto band per-run: eps_ref_eff = 0.15 * max(|r(t)|).
        eps_user = float(eps_ref)
        eps_ref_eff_cov: Optional[float] = None
        eps_ref_eff_info: Optional[float] = None
        residual_cov_pos_frac: Optional[float] = None
        residual_info_pos_frac: Optional[float] = None

        if T > 1:
            rc = residual_cov[:-1]
            ri = residual_info[:-1]
            if eps_user > 0.0:
                eps_ref_eff_cov = eps_user
                eps_ref_eff_info = eps_user
            else:
                mx_cov = float(np.max(np.abs(rc))) if rc.size else 0.0
                mx_info = float(np.max(np.abs(ri))) if ri.size else 0.0
                eps_ref_eff_cov = 0.15 * mx_cov
                eps_ref_eff_info = 0.15 * mx_info

            residual_cov_pos_frac = float(np.mean((rc > float(eps_ref_eff_cov)).astype(np.float32))) if rc.size else None
            residual_info_pos_frac = float(np.mean((ri > float(eps_ref_eff_info)).astype(np.float32))) if ri.size else None

        # Also store residual ranges for debugging / calibration (helps choose eps_ref)
        residual_cov_min = float(np.min(residual_cov[:-1])) if T > 1 else float(residual_cov[0])
        residual_cov_max = float(np.max(residual_cov[:-1])) if T > 1 else float(residual_cov[0])
        residual_info_min = float(np.min(residual_info[:-1])) if T > 1 else float(residual_info[0])
        residual_info_max = float(np.max(residual_info[:-1])) if T > 1 else float(residual_info[0])

        # First usefulness / misleadingness summary aggregates
        usefulness_gap_mean = float(np.mean(usefulness_gap[:-1])) if T > 1 else float(np.mean(usefulness_gap))
        usefulness_gap_max = float(np.max(usefulness_gap[:-1])) if T > 1 else float(np.max(usefulness_gap))
        misleading_activity_mean = (
            float(np.mean(misleading_activity[:-1])) if T > 1 else float(np.mean(misleading_activity))
        )
        misleading_activity_max = (
            float(np.max(misleading_activity[:-1])) if T > 1 else float(np.max(misleading_activity))
        )
        misleading_activity_pos_frac = (
            float(np.mean((misleading_activity[:-1] > 0.0).astype(np.float32)))
            if T > 1 else float(np.mean((misleading_activity > 0.0).astype(np.float32)))
        )
        misleading_activity_ratio = float(misleading_activity_mean) / max(
            float(usefulness_gap_mean),
            1e-12,
        )

        valid_obs_age = obs_age_steps[obs_age_steps >= 0]
        obs_age_mean_valid = (
            float(np.mean(valid_obs_age.astype(np.float32)))
            if valid_obs_age.size > 0 else None
        )
        obs_age_max_valid = (
            int(np.max(valid_obs_age))
            if valid_obs_age.size > 0 else None
        )

        # First Subgoal C rolling-support summary aggregates.
        valid_recent_obs_age = recent_obs_age_mean_valid[np.isfinite(recent_obs_age_mean_valid)]
        valid_recent_misleading_mean = (
            recent_misleading_activity_mean[np.isfinite(recent_misleading_activity_mean)]
        )
        valid_recent_misleading_pos_frac = (
            recent_misleading_activity_pos_frac[np.isfinite(recent_misleading_activity_pos_frac)]
        )
        valid_recent_driver_info = (
            recent_driver_info_true_mean[np.isfinite(recent_driver_info_true_mean)]
        )

        recent_obs_age_mean_valid_last = (
            float(valid_recent_obs_age[-1]) if valid_recent_obs_age.size > 0 else None
        )
        recent_obs_age_mean_valid_max = (
            float(np.max(valid_recent_obs_age)) if valid_recent_obs_age.size > 0 else None
        )
        recent_misleading_activity_mean_last = (
            float(valid_recent_misleading_mean[-1]) if valid_recent_misleading_mean.size > 0 else None
        )
        recent_misleading_activity_mean_max = (
            float(np.max(valid_recent_misleading_mean)) if valid_recent_misleading_mean.size > 0 else None
        )
        recent_misleading_activity_pos_frac_last = (
            float(valid_recent_misleading_pos_frac[-1]) if valid_recent_misleading_pos_frac.size > 0 else None
        )
        recent_driver_info_true_mean_last = (
            float(valid_recent_driver_info[-1]) if valid_recent_driver_info.size > 0 else None
        )

        # Mechanism-audit availability should reflect whether meaningful
        # regime mechanism diagnostics were actually produced for this run,
        # not whether an early/default config local happened to be populated.
        #
        # Keep this compact and truthfulness-oriented:
        #   - require regime machinery to be enabled
        #   - then check for actual nontrivial mechanism-audit content
        #
        # This intentionally uses emitted series/diagnostics rather than a
        # manifest-only logging flag, because the frontend/summary question is:
        # "does this run contain meaningful mechanism-audit content?"
        mechanism_audit_available = bool(
            regime_enabled
            and (
                int(np.count_nonzero(regime_active_transition_event)) > 0
                or int(np.count_nonzero(debug_trig_down_final)) > 0
                or int(np.count_nonzero(debug_trig_switch_final)) > 0
                or int(np.count_nonzero(debug_trig_leave_certified_final)) > 0
                or int(np.count_nonzero(debug_down_counter)) > 0
                or int(np.count_nonzero(debug_switch_counter)) > 0
                or int(np.count_nonzero(debug_recovery_counter)) > 0
                or int(np.count_nonzero(debug_leave_certified_counter)) > 0
                or np.any(np.isfinite(debug_down_utilization_margin))
                or np.any(np.isfinite(debug_switch_utilization_margin))
                or np.any(np.isfinite(debug_recovery_utilization_margin))
                or float(np.max(regime_requal_support_score)) > 0.0
                or float(np.max(regime_requal_support_breadth)) > 0.0
            )
        )

        auc = entropy_auc(mean_entropy)
        ttf = time_to_first_detect(detections)
        ttf_true = int(np.argmax(true_detections_any > 0)) if int(np.any(true_detections_any > 0)) else None
        ttf_arrived = int(np.argmax(arrived_detections_any > 0)) if int(np.any(arrived_detections_any > 0)) else None
        steps: list[dict] = []

        # ----------------------------
        # Step metrics packing
        # ----------------------------
        for t in range(T - 1):

            steps.append(
                {
                    "t": t,
                    "mean_entropy_before": float(mean_entropy[t]),
                    "mean_entropy_after": float(mean_entropy[t + 1]),
                    "detections_any": int(detections_any[t]),
                    "true_detections_any": int(true_detections_any[t]),
                    "arrived_detections_any": int(arrived_detections_any[t]),
                    "coverage_frac": float(coverage_frac[t]),
                    "new_coverage_frac": float(new_coverage_frac[t]),
                    "movement_l1_mean": float(movement_l1_mean[t]),
                    "overlap_fire_sensors": float(overlap_fire_sensors[t]),
                    "overlap_fire_any_sensors": float(overlap_fire_any_sensors[t]),
                    "overlap_front_sensors": float(overlap_front_sensors[t]),
                    "uncertainty_debug_variance_mean": float(uncertainty_debug_variance_mean[t]),
                    "uncertainty_debug_variance_max": float(uncertainty_debug_variance_max[t]),
                    "uncertainty_debug_novelty_mean": float(uncertainty_debug_novelty_mean[t]),
                    "uncertainty_debug_novelty_max": float(uncertainty_debug_novelty_max[t]),
                    "uncertainty_debug_entropy_bonus_mean": float(uncertainty_debug_entropy_bonus_mean[t]),
                    "uncertainty_debug_entropy_bonus_max": float(uncertainty_debug_entropy_bonus_max[t]),
                    "uncertainty_debug_score_mean": float(uncertainty_debug_score_mean[t]),
                    "uncertainty_debug_score_max": float(uncertainty_debug_score_max[t]),

                    "arrivals_frac": float(arrivals_frac[t]),
                    "detections_arrived_frac": float(detections_arrived_frac[t]),
                    "obs_generation_step": int(obs_generation_step[t]),
                    "obs_delivery_step": int(obs_delivery_step[t]),
                    "obs_age_steps": int(obs_age_steps[t]),
                    "loss_frac": float(loss_frac[t]),
                    "usefulness_gap": float(usefulness_gap[t]),
                    "misleading_activity": float(misleading_activity[t]),
                    "driver_info_true": float(driver_info_true[t]),
                    "recent_obs_age_mean_valid": (
                        float(recent_obs_age_mean_valid[t])
                        if np.isfinite(recent_obs_age_mean_valid[t]) else None
                    ),
                    "recent_misleading_activity_mean": (
                        float(recent_misleading_activity_mean[t])
                        if np.isfinite(recent_misleading_activity_mean[t]) else None
                    ),
                    "recent_misleading_activity_pos_frac": (
                        float(recent_misleading_activity_pos_frac[t])
                        if np.isfinite(recent_misleading_activity_pos_frac[t]) else None
                    ),
                    "recent_driver_info_true_mean": (
                        float(recent_driver_info_true_mean[t])
                        if np.isfinite(recent_driver_info_true_mean[t]) else None
                    ),
                    "usefulness_proto_enabled": int(usefulness_proto_enabled),
                    "usefulness_regime_state": int(usefulness_regime_state[t]),
                    "usefulness_trigger_recover": int(usefulness_trigger_recover[t]),
                    "usefulness_trigger_caution": int(usefulness_trigger_caution[t]),
                    "usefulness_trigger_recover_from_caution": int(
                        usefulness_trigger_recover_from_caution[t]
                    ),
                    "usefulness_trigger_exploit": int(usefulness_trigger_exploit[t]),
                    "usefulness_recover_counter": int(usefulness_recover_counter[t]),
                    "usefulness_caution_counter": int(usefulness_caution_counter[t]),
                    "usefulness_recover_exit_counter": int(usefulness_recover_exit_counter[t]),
                    "usefulness_exploit_counter": int(usefulness_exploit_counter[t]),
                    "regime_requal_support_score": float(regime_requal_support_score[t]),
                    "regime_requal_support_breadth": float(regime_requal_support_breadth[t]),
                    "debug_requal_support_front": float(debug_requal_support_front[t]),
                    "debug_requal_support_detect": float(debug_requal_support_detect[t]),
                    "debug_requal_support_info": float(debug_requal_support_info[t]),
                    "debug_requal_support_health": float(debug_requal_support_health[t]),
                    "residual_cov": float(residual_cov[t]),
                    "residual_info": float(residual_info[t]),
                    "c_info": float(c_info),
                    "c_cov": float(c_cov),
                    "eps_ref": float(eps_ref),
                    "mean_entropy": float(mean_entropy[t]),
                    "delta_mean_entropy": float(delta_mean_entropy[t]),
                    "regime_enabled": int(regime_enabled),
                    "regime_mode": str(regime_mode),
                    "regime_active_enabled": int(regime_active_enabled),
                    "regime_active_verify_style": int(active_verify_style),
                    "regime_utilization": float(regime_utilization[t]),
                    "regime_strict_drift_proxy": float(regime_strict_drift_proxy[t]),
                    "regime_local_drift_rate": float(regime_local_drift_rate[t]),
                    "regime_cumulative_exposure": float(regime_cumulative_exposure[t]),
                    "regime_state": int(regime_state[t]),
                    "regime_trigger_downshift": int(regime_trigger_downshift[t]),
                    "regime_trigger_switch_to_certified": int(regime_trigger_switch_to_certified[t]),
                    "regime_trigger_recovery": int(regime_trigger_recovery[t]),
                    "debug_down_utilization_margin": float(debug_down_utilization_margin[t]),
                    "debug_down_strict_margin": float(debug_down_strict_margin[t]),
                    "debug_down_utilization_threshold": float(debug_down_utilization_threshold[t]),
                    "debug_down_strict_threshold": float(debug_down_strict_threshold[t]),
                    "debug_down_hysteresis": float(debug_down_hysteresis[t]),
                    "debug_trig_down_utilization_component": int(debug_trig_down_utilization_component[t]),
                    "debug_trig_down_strict_component": int(debug_trig_down_strict_component[t]),
                    "debug_trig_down_final": int(debug_trig_down_final[t]),
                    "debug_switch_utilization_margin": float(debug_switch_utilization_margin[t]),
                    "debug_switch_strict_margin": float(debug_switch_strict_margin[t]),
                    "debug_switch_utilization_threshold": float(debug_switch_utilization_threshold[t]),
                    "debug_switch_strict_threshold": float(debug_switch_strict_threshold[t]),
                    "debug_switch_hysteresis": float(debug_switch_hysteresis[t]),
                    "debug_trig_switch_utilization_component": int(debug_trig_switch_utilization_component[t]),
                    "debug_trig_switch_strict_component": int(debug_trig_switch_strict_component[t]),
                    "debug_trig_switch_local_component": int(debug_trig_switch_local_component[t]),
                    "debug_trig_switch_exposure_component": int(debug_trig_switch_exposure_component[t]),
                    "debug_trig_switch_final": int(debug_trig_switch_final[t]),
                    "debug_recovery_utilization_margin": float(debug_recovery_utilization_margin[t]),
                    "debug_recovery_strict_margin": float(debug_recovery_strict_margin[t]),
                    "debug_recovery_utilization_threshold": float(debug_recovery_utilization_threshold[t]),
                    "debug_recovery_strict_threshold": float(debug_recovery_strict_threshold[t]),
                    "debug_recovery_hysteresis": float(debug_recovery_hysteresis[t]),
                    "debug_down_counter": int(debug_down_counter[t]),
                    "debug_switch_counter": int(debug_switch_counter[t]),
                    "debug_recovery_counter": int(debug_recovery_counter[t]),
                    "debug_recovery_block_counter": int(debug_recovery_block_counter[t]),
                    "debug_leave_certified_counter": int(debug_leave_certified_counter[t]),
                    "debug_trig_leave_certified_final": int(debug_trig_leave_certified_final[t]),

                    "regime_certified_stage_index": int(regime_certified_stage_index[t]),
                    "regime_opportunistic_level_index": int(regime_opportunistic_level_index[t]),
                    "regime_advisory_stage_eta": float(regime_advisory_stage_eta[t]),
                    "regime_active_state": int(regime_active_state[t]),
                    "regime_active_certified_stage_index": int(regime_active_certified_stage_index[t]),
                    "regime_active_opportunistic_level_index": int(regime_active_opportunistic_level_index[t]),
                    "regime_active_transition_event": int(regime_active_transition_event[t]),
                    "regime_effective_eta": float(regime_effective_eta[t]),
                    "regime_effective_move_budget_cells": float(regime_effective_move_budget_cells[t]),

                }
            )

        # ----------------------------
        # CSV + summary emission
        # ----------------------------
        write_steps_csv(metrics_dir(opr_id) / "step_metrics.csv", steps)

        summary_meta = {
            "id": opr_id,
            "layer": "operational",
            "run_mode": "closed_loop",
            "phy_id": phy_id,
            # Persist meta needed by Operational Visualizer even if parents are deleted later.
            "H": int(H),
            "W": int(W),
            "T": int(T),
            "dt_seconds": int(dt_seconds),
            "cell_size_m": float(cell_size_m),
            "crs_code": str(crs_code),
        }

        summary_config = {
            "policy": m.network.policy,
            "deployment_mode": m.network.deployment_mode,
            "tie_breaking": m.network.tie_breaking,
            "n_sensors": m.network.n_sensors,
            "sensor_radius_m": m.network.sensor_radius_m,
            "sensor_move_max_m": m.network.sensor_move_max_m,
            "min_separation_m": m.network.min_separation_m,
            "max_moves_per_step": int(getattr(m.network, "max_moves_per_step", 0) or 0),
            "impairments": m.impairments.model_dump(),
            "o1": getattr(m, "o1").model_dump() if getattr(m, "o1", None) is not None else None,
            "regime_management": getattr(m, "regime_management").model_dump()
            if getattr(m, "regime_management", None) is not None else None,
            "policy_semantics": (
                "posterior_variance_times_novelty_plus_novelty_bonus"
                if str(m.network.policy) == "uncertainty"
                else ("belief" if str(m.network.policy) == "greedy" else None)
            ),
            "uncertainty_decay": float(uncertainty_decay)
            if str(m.network.policy) == "uncertainty" else None,
            "uncertainty_gain": float(uncertainty_gain)
            if str(m.network.policy) == "uncertainty" else None,
            "uncertainty_gamma": float(uncertainty_gamma)
            if str(m.network.policy) == "uncertainty" else None,
            "uncertainty_beta": float(uncertainty_beta)
            if str(m.network.policy) == "uncertainty" else None,
            "uncertainty_lambda": float(uncertainty_lambda)
            if str(m.network.policy) == "uncertainty" else None,
        }

        summary_metrics = {
            "mean_entropy_auc": float(auc),
            "ttfd": ttf,
            # Detection semantics:
            #   - ttfd: legacy compatibility alias using arrived/impaired detections
            #   - ttfd_true: current-frame true footprint hit
            #   - ttfd_arrived: delayed / impaired arrived observation stream
            "ttfd_true": ttf_true,
            "ttfd_arrived": ttf_arrived,
            "detections_any_semantics": "legacy_alias_for_arrived_detections_any",
            "coverage_auc": float(np.trapz(coverage_frac, dx=1.0)) if T > 1 else float(coverage_frac[0]),
            "movement_total_mean_l1": float(np.sum(movement_l1_mean)),
            "moves_per_step_mean": float(np.mean(moves_per_step)) if T > 0 else None,
            "moved_frac_mean": float(np.mean(moved_frac)) if T > 0 else None,
            "overlap_fire_sensors_mean": float(np.mean(overlap_fire_sensors)) if T > 0 else None,
            "overlap_fire_any_sensors_mean": float(np.mean(overlap_fire_any_sensors)) if T > 0 else None,
            "uncertainty_variance_mean": (
                float(np.mean((4.0 * belief_t * (1.0 - belief_t)).astype(np.float32)))
                if T > 0 and str(m.network.policy) == "uncertainty"
                else None
            ),
            # Proxy calibration helper for interpreting mdc_info behavior
            "k_update_proxy": float(0.5 * float(alpha_pos + alpha_neg)),
            "mdc_info_regime": _classify_mdc_info_reward_strength(
                c_info=float(c_info),
                alpha_pos=float(alpha_pos),
                alpha_neg=float(alpha_neg),
            )
            if str(m.network.policy) == "mdc_info"
            else None,
            # Realized budget summaries
            "arrivals_frac_mean": float(np.mean(arrivals_frac)) if T > 0 else None,
            "detections_arrived_frac_mean": float(np.mean(detections_arrived_frac)) if T > 0 else None,
            # Driver/residual summaries used by the current operational tool
            "driver_info_true_kind": "expected_mutual_information_binary_sensor",
            "residual_info_driver": "driver_info_true",
            "residual_cov_driver": "arrivals_frac",
            "driver_info_true_mean": float(np.mean(driver_info_true)) if T > 0 else None,
            "residual_cov_mean": float(np.mean(residual_cov[:-1])) if T > 1 else None,
            "residual_info_mean": float(np.mean(residual_info[:-1])) if T > 1 else None,
            "residual_cov_pos_frac": residual_cov_pos_frac,
            "residual_info_pos_frac": residual_info_pos_frac,
            "residual_cov_in_band_frac": (
                float(np.mean((np.abs(residual_cov[:-1]) <= float(eps_ref_eff_cov)).astype(np.float32)))
                if T > 1 and eps_ref_eff_cov is not None else None
            ),
            "residual_info_in_band_frac": (
                float(np.mean((np.abs(residual_info[:-1]) <= float(eps_ref_eff_info)).astype(np.float32)))
                if T > 1 and eps_ref_eff_info is not None else None
            ),
            "c_info": float(c_info),
            "c_cov": float(c_cov),
            "eps_ref": float(eps_ref),
            "eps_ref_eff_cov": eps_ref_eff_cov,
            "eps_ref_eff_info": eps_ref_eff_info,
            "residual_cov_min": float(residual_cov_min),
            "residual_cov_max": float(residual_cov_max),
            "residual_info_min": float(residual_info_min),
            "residual_info_max": float(residual_info_max),
            "usefulness_gap_mean": float(usefulness_gap_mean),
            "usefulness_gap_max": float(usefulness_gap_max),
            "misleading_activity_mean": float(misleading_activity_mean),
            "misleading_activity_max": float(misleading_activity_max),
            "misleading_activity_pos_frac": float(misleading_activity_pos_frac),
            "misleading_activity_ratio": float(misleading_activity_ratio),
            "obs_age_mean_valid": float(obs_age_mean_valid) if obs_age_mean_valid is not None else None,
            "obs_age_max_valid": int(obs_age_max_valid) if obs_age_max_valid is not None else None,
            # First Subgoal C rolling-support summaries
            "recent_obs_age_mean_valid_last": (
                float(recent_obs_age_mean_valid_last)
                if recent_obs_age_mean_valid_last is not None else None
            ),
            "recent_obs_age_mean_valid_max": (
                float(recent_obs_age_mean_valid_max)
                if recent_obs_age_mean_valid_max is not None else None
            ),
            "recent_misleading_activity_mean_last": (
                float(recent_misleading_activity_mean_last)
                if recent_misleading_activity_mean_last is not None else None
            ),
            "recent_misleading_activity_mean_max": (
                float(recent_misleading_activity_mean_max)
                if recent_misleading_activity_mean_max is not None else None
            ),
            "recent_misleading_activity_pos_frac_last": (
                float(recent_misleading_activity_pos_frac_last)
                if recent_misleading_activity_pos_frac_last is not None else None
            ),
            "recent_driver_info_true_mean_last": (
                float(recent_driver_info_true_mean_last)
                if recent_driver_info_true_mean_last is not None else None
            ),
        }

        summary_mechanism_audit = {
            "debug_leave_certified_counter_max": (
                int(np.max(debug_leave_certified_counter)) if T > 0 else 0
            ),
            "debug_leave_certified_trigger_hits": int(np.count_nonzero(debug_trig_leave_certified_final)),
            "regime_mechanism_audit_available": bool(mechanism_audit_available),
            # Mechanism diagnostics kept intentionally lightweight at summary
            # level; detailed inspection should use step series / CSV.
            "debug_down_utilization_margin_min": (
                float(np.nanmin(debug_down_utilization_margin))
                if np.any(np.isfinite(debug_down_utilization_margin)) else None
            ),
            "debug_down_utilization_margin_max": (
                float(np.nanmax(debug_down_utilization_margin))
                if np.any(np.isfinite(debug_down_utilization_margin)) else None
            ),
            "debug_switch_utilization_margin_min": (
                float(np.nanmin(debug_switch_utilization_margin))
                if np.any(np.isfinite(debug_switch_utilization_margin)) else None
            ),
            "debug_switch_utilization_margin_max": (
                float(np.nanmax(debug_switch_utilization_margin))
                if np.any(np.isfinite(debug_switch_utilization_margin)) else None
            ),
            "debug_recovery_utilization_margin_min": (
                float(np.nanmin(debug_recovery_utilization_margin))
                if np.any(np.isfinite(debug_recovery_utilization_margin)) else None
            ),
            "debug_recovery_utilization_margin_max": (
                float(np.nanmax(debug_recovery_utilization_margin))
                if np.any(np.isfinite(debug_recovery_utilization_margin)) else None
            ),
        }

        summary_validation = {
            # Subgoal D compact validation bundle.
            # Keep existing flat summary keys unchanged for compatibility;
            # this nested block provides a stable audit-facing surface for
            # compact tables and validation-oriented visual summaries.
            "subgoal_d_validation": {
                "impairment_audit": {
                    "ttfd_true": ttf_true,
                    "ttfd_arrived": ttf_arrived,
                    "arrivals_frac_mean": float(np.mean(arrivals_frac)) if T > 0 else None,
                    "obs_age_mean_valid": (
                        float(obs_age_mean_valid) if obs_age_mean_valid is not None else None
                    ),
                    "obs_age_max_valid": (
                        int(obs_age_max_valid) if obs_age_max_valid is not None else None
                    ),
                    "driver_info_true_mean": float(np.mean(driver_info_true)) if T > 0 else None,
                    "misleading_activity_pos_frac": float(misleading_activity_pos_frac),
                    "misleading_activity_ratio": float(misleading_activity_ratio),
                    "recent_obs_age_mean_valid_last": (
                        float(recent_obs_age_mean_valid_last)
                        if recent_obs_age_mean_valid_last is not None else None
                    ),
                    "recent_misleading_activity_pos_frac_last": (
                        float(recent_misleading_activity_pos_frac_last)
                        if recent_misleading_activity_pos_frac_last is not None else None
                    ),
                    "recent_driver_info_true_mean_last": (
                        float(recent_driver_info_true_mean_last)
                        if recent_driver_info_true_mean_last is not None else None
                    ),
                },
                "usefulness_proto_audit": {
                    "enabled": bool(usefulness_proto_enabled),
                    "regime_state_last": int(usefulness_regime_state[-1]) if T > 0 else 0,
                    "regime_state_exploit_frac": _frac_eq(
                        usefulness_regime_state,
                        USEFULNESS_STATE_EXPLOIT,
                    ),
                    "regime_state_recover_frac": _frac_eq(
                        usefulness_regime_state,
                        USEFULNESS_STATE_RECOVER,
                    ),
                    "regime_state_caution_frac": _frac_eq(
                        usefulness_regime_state,
                        USEFULNESS_STATE_CAUTION,
                    ),
                    "trigger_recover_hits": int(np.count_nonzero(usefulness_trigger_recover)),
                    "trigger_caution_hits": int(np.count_nonzero(usefulness_trigger_caution)),
                    "trigger_recover_from_caution_hits": int(
                        np.count_nonzero(usefulness_trigger_recover_from_caution)
                    ),
                    "trigger_exploit_hits": int(np.count_nonzero(usefulness_trigger_exploit)),
                },
            },
        }

        summary_payload = {
            **summary_meta,
            **summary_config,
            **summary_metrics,
            **_build_usefulness_proto_summary(
                T=T,
                usefulness_proto_enabled=usefulness_proto_enabled,
                usefulness_regime_state=usefulness_regime_state,
                usefulness_trigger_recover=usefulness_trigger_recover,
                usefulness_trigger_caution=usefulness_trigger_caution,
                usefulness_trigger_recover_from_caution=usefulness_trigger_recover_from_caution,
                usefulness_trigger_exploit=usefulness_trigger_exploit,
            ),
            **_build_regime_advisory_summary(
                T=T,
                regime_enabled=regime_enabled,
                regime_mode=regime_mode,
                rgm_stages=rgm_stages,
                rgm_ladder=rgm_ladder,
                regime_utilization=regime_utilization,
                regime_strict_drift_proxy=regime_strict_drift_proxy,
                regime_local_drift_rate=regime_local_drift_rate,
                regime_cumulative_exposure=regime_cumulative_exposure,
                regime_requal_support_score=regime_requal_support_score,
                regime_requal_support_breadth=regime_requal_support_breadth,
                regime_trigger_downshift=regime_trigger_downshift,
                regime_trigger_switch_to_certified=regime_trigger_switch_to_certified,
                regime_trigger_recovery=regime_trigger_recovery,
                regime_state=regime_state,
                regime_certified_stage_index=regime_certified_stage_index,
                regime_opportunistic_level_index=regime_opportunistic_level_index,
                regime_advisory_stage_eta=regime_advisory_stage_eta,
            ),
            **_build_regime_active_summary(
                T=T,
                regime_active_enabled=regime_active_enabled,
                active_verify_style=active_verify_style,
                rgm_stages=rgm_stages,
                rgm_ladder=rgm_ladder,
                regime_active_transition_event=regime_active_transition_event,
                regime_active_state=regime_active_state,
                regime_active_certified_stage_index=regime_active_certified_stage_index,
                regime_active_opportunistic_level_index=regime_active_opportunistic_level_index,
                regime_effective_eta=regime_effective_eta,
                regime_effective_move_budget_cells=regime_effective_move_budget_cells,
            ),
            **summary_mechanism_audit,
            **summary_validation,
        }

        write_summary_json(
            metrics_dir(opr_id) / "summary.json",
            summary_payload,
        )

        return {"ok": True, "opr_id": opr_id}

    raise HTTPException(
        status_code=400,
        detail=f"unsupported operational run_mode: {run_mode}",
    )


@router.get("/{opr_id}/series")
def series(opr_id: str) -> dict[str, Any]:
    """
    Time-series payload for Operational Visualizer plots.

    Contract is intentionally simple JSON lists; derived arrays are stored in operational zarr
    so visualization works even if parents are deleted.
    """
    def _read_1d(name: str) -> list[float]:
        try:
            a = open_zarr_array(zarr_path(opr_id, name), mode="r")
            x = np.asarray(a[:])
            return [float(v) for v in x.tolist()]
        except Exception:
            return []

    def _read_1d_int(name: str) -> list[int]:
        try:
            a = open_zarr_array(zarr_path(opr_id, name), mode="r")
            x = np.asarray(a[:]).reshape(-1)
            return [int(v) for v in x.tolist()]
        except Exception:
            return []

    # Pull scalar summary fields that help interpret residual plots (bands + rates).
    s = _summary_with_advisory_compat_aliases(_load_opr_summary_or_none(opr_id) or {})

    def _as_float_or_none(x: Any) -> Optional[float]:
        try:
            if x is None:
                return None
            v = float(x)
            if not math.isfinite(v):
                return None
            return v
        except Exception:
            return None

    out: dict[str, Any] = {
        "detections_any": _read_1d_int("detections_any"),
        "true_detections_any": _read_1d_int("true_detections_any"),
        "arrived_detections_any": _read_1d_int("arrived_detections_any"),
        "coverage_frac": _read_1d("coverage_frac"),
        "new_coverage_frac": _read_1d("new_coverage_frac"),
        "movement_l1_mean": _read_1d("movement_l1_mean"),
        "moves_per_step": _read_1d_int("moves_per_step"),
        "moved_frac": _read_1d("moved_frac"),
        "overlap_fire_sensors": _read_1d("overlap_fire_sensors"),
        "overlap_fire_any_sensors": _read_1d("overlap_fire_any_sensors"),
        "overlap_front_sensors": _read_1d("overlap_front_sensors"),
        "uncertainty_debug_variance_mean": _read_1d("uncertainty_debug_variance_mean"),
        "uncertainty_debug_variance_max": _read_1d("uncertainty_debug_variance_max"),
        "uncertainty_debug_novelty_mean": _read_1d("uncertainty_debug_novelty_mean"),
        "uncertainty_debug_novelty_max": _read_1d("uncertainty_debug_novelty_max"),
        "uncertainty_debug_entropy_bonus_mean": _read_1d("uncertainty_debug_entropy_bonus_mean"),
        "uncertainty_debug_entropy_bonus_max": _read_1d("uncertainty_debug_entropy_bonus_max"),
        "uncertainty_debug_score_mean": _read_1d("uncertainty_debug_score_mean"),
        "uncertainty_debug_score_max": _read_1d("uncertainty_debug_score_max"),

        # O1/O0: preferred series if present
        "mean_entropy": _read_1d("mean_entropy"),
        "delta_mean_entropy": _read_1d("delta_mean_entropy"),
        # O1: realized budget
        "arrivals_frac": _read_1d("arrivals_frac"),
        "detections_arrived_frac": _read_1d("detections_arrived_frac"),
        "obs_generation_step": _read_1d_int("obs_generation_step"),
        "obs_delivery_step": _read_1d_int("obs_delivery_step"),
        "obs_age_steps": _read_1d_int("obs_age_steps"),
        "loss_frac": _read_1d("loss_frac"),
        "usefulness_gap": _read_1d("usefulness_gap"),
        "misleading_activity": _read_1d("misleading_activity"),
        "recent_obs_age_mean_valid": _read_1d("recent_obs_age_mean_valid"),
        "recent_misleading_activity_mean": _read_1d("recent_misleading_activity_mean"),
        "recent_misleading_activity_pos_frac": _read_1d("recent_misleading_activity_pos_frac"),
        "recent_driver_info_true_mean": _read_1d("recent_driver_info_true_mean"),
        "usefulness_regime_state": _read_1d_int("usefulness_regime_state"),
        "usefulness_trigger_recover": _read_1d_int("usefulness_trigger_recover"),
        "usefulness_trigger_caution": _read_1d_int("usefulness_trigger_caution"),
        "usefulness_trigger_recover_from_caution": _read_1d_int("usefulness_trigger_recover_from_caution"),
        "usefulness_trigger_exploit": _read_1d_int("usefulness_trigger_exploit"),
        "usefulness_recover_counter": _read_1d_int("usefulness_recover_counter"),
        "usefulness_caution_counter": _read_1d_int("usefulness_caution_counter"),
        "usefulness_recover_exit_counter": _read_1d_int("usefulness_recover_exit_counter"),
        "usefulness_exploit_counter": _read_1d_int("usefulness_exploit_counter"),
        # Driver/residual series
        "driver_info_true": _read_1d("driver_info_true"),
        "residual_cov": _read_1d("residual_cov"),
        "residual_info": _read_1d("residual_info"),
        # Regime-management advisory series
        "regime_utilization": _read_1d("regime_utilization"),
        "regime_strict_drift_proxy": _read_1d("regime_strict_drift_proxy"),
        "regime_local_drift_rate": _read_1d("regime_local_drift_rate"),
        "regime_cumulative_exposure": _read_1d("regime_cumulative_exposure"),
        "regime_state": _read_1d_int("regime_state"),
        "regime_trigger_downshift": _read_1d_int("regime_trigger_downshift"),
        "regime_trigger_switch_to_certified": _read_1d_int("regime_trigger_switch_to_certified"),
        "regime_trigger_recovery": _read_1d_int("regime_trigger_recovery"),
        "regime_certified_stage_index": _read_1d_int("regime_certified_stage_index"),
        "regime_opportunistic_level_index": _read_1d_int("regime_opportunistic_level_index"),
        "regime_advisory_stage_eta": _read_1d("regime_advisory_stage_eta"),
        "regime_active_state": _read_1d_int("regime_active_state"),
        "regime_active_certified_stage_index": _read_1d_int("regime_active_certified_stage_index"),
        "regime_active_opportunistic_level_index": _read_1d_int("regime_active_opportunistic_level_index"),
        "regime_active_transition_event": _read_1d_int("regime_active_transition_event"),
        "regime_effective_eta": _read_1d("regime_effective_eta"),
        "regime_effective_move_budget_cells": _read_1d("regime_effective_move_budget_cells"),
        "debug_down_utilization_margin": _read_1d("debug_down_utilization_margin"),
        "debug_down_strict_margin": _read_1d("debug_down_strict_margin"),
        "debug_down_utilization_threshold": _read_1d("debug_down_utilization_threshold"),
        "debug_down_strict_threshold": _read_1d("debug_down_strict_threshold"),
        "debug_down_hysteresis": _read_1d("debug_down_hysteresis"),
        "debug_trig_down_utilization_component": _read_1d_int("debug_trig_down_utilization_component"),
        "debug_trig_down_strict_component": _read_1d_int("debug_trig_down_strict_component"),
        "debug_trig_down_final": _read_1d_int("debug_trig_down_final"),
        "debug_switch_utilization_margin": _read_1d("debug_switch_utilization_margin"),
        "debug_switch_strict_margin": _read_1d("debug_switch_strict_margin"),
        "debug_switch_utilization_threshold": _read_1d("debug_switch_utilization_threshold"),
        "debug_switch_strict_threshold": _read_1d("debug_switch_strict_threshold"),
        "debug_switch_hysteresis": _read_1d("debug_switch_hysteresis"),
        "debug_trig_switch_utilization_component": _read_1d_int("debug_trig_switch_utilization_component"),
        "debug_trig_switch_strict_component": _read_1d_int("debug_trig_switch_strict_component"),
        "debug_trig_switch_local_component": _read_1d_int("debug_trig_switch_local_component"),
        "debug_trig_switch_exposure_component": _read_1d_int("debug_trig_switch_exposure_component"),
        "debug_trig_switch_final": _read_1d_int("debug_trig_switch_final"),
        "debug_recovery_utilization_margin": _read_1d("debug_recovery_utilization_margin"),
        "debug_recovery_strict_margin": _read_1d("debug_recovery_strict_margin"),
        "debug_recovery_utilization_threshold": _read_1d("debug_recovery_utilization_threshold"),
        "debug_recovery_strict_threshold": _read_1d("debug_recovery_strict_threshold"),
        "debug_recovery_hysteresis": _read_1d("debug_recovery_hysteresis"),
        "debug_down_counter": _read_1d_int("debug_down_counter"),
        "debug_switch_counter": _read_1d_int("debug_switch_counter"),
        "debug_recovery_counter": _read_1d_int("debug_recovery_counter"),
        "debug_recovery_block_counter": _read_1d_int("debug_recovery_block_counter"),
        "debug_leave_certified_counter": _read_1d_int("debug_leave_certified_counter"),
        "debug_trig_leave_certified_final": _read_1d_int("debug_trig_leave_certified_final"),

        # Scalars from summary.json (not time-series). These are key to interpreting presets:
        # - eps_ref: user-specified band (0 => auto)
        # - eps_ref_eff_*: effective band used for pos-frac computation
        "eps_ref_eff_info": _as_float_or_none(s.get("eps_ref_eff_info", None)),
        # - residual_*_pos_frac: fraction of steps with residual > eps_ref_eff_*
        "eps_ref": _as_float_or_none(s.get("eps_ref", None)),
        "eps_ref_eff_cov": _as_float_or_none(s.get("eps_ref_eff_cov", None)),
        "ttfd": s.get("ttfd", None),
        "ttfd_true": s.get("ttfd_true", None),
        "ttfd_arrived": s.get("ttfd_arrived", None),
        "detections_any_semantics": s.get("detections_any_semantics", None),
        "residual_cov_pos_frac": _as_float_or_none(s.get("residual_cov_pos_frac", None)),
        "residual_info_pos_frac": _as_float_or_none(s.get("residual_info_pos_frac", None)),
        "residual_cov_in_band_frac": _as_float_or_none(s.get("residual_cov_in_band_frac", None)),
        "residual_info_in_band_frac": _as_float_or_none(s.get("residual_info_in_band_frac", None)),
        "driver_info_true_kind": s.get("driver_info_true_kind", None),
        "residual_info_driver": s.get("residual_info_driver", None),
        "residual_cov_driver": s.get("residual_cov_driver", None),
        "driver_info_true_mean": _as_float_or_none(s.get("driver_info_true_mean", None)),
        "uncertainty_debug_score_mean_mean": _as_float_or_none(s.get("uncertainty_debug_score_mean_mean", None)),

        # Optional ranges (helpful for auto-calibration / debugging)
        "residual_cov_min": _as_float_or_none(s.get("residual_cov_min", None)),
        "residual_cov_max": _as_float_or_none(s.get("residual_cov_max", None)),
        "residual_info_min": _as_float_or_none(s.get("residual_info_min", None)),
        "residual_info_max": _as_float_or_none(s.get("residual_info_max", None)),
        "usefulness_gap_mean": _as_float_or_none(s.get("usefulness_gap_mean", None)),
        "usefulness_gap_max": _as_float_or_none(s.get("usefulness_gap_max", None)),
        "misleading_activity_mean": _as_float_or_none(s.get("misleading_activity_mean", None)),
        "misleading_activity_max": _as_float_or_none(s.get("misleading_activity_max", None)),
        "misleading_activity_pos_frac": _as_float_or_none(s.get("misleading_activity_pos_frac", None)),
        "misleading_activity_ratio": _as_float_or_none(s.get("misleading_activity_ratio", None)),
        "obs_age_mean_valid": _as_float_or_none(s.get("obs_age_mean_valid", None)),
        "obs_age_max_valid": s.get("obs_age_max_valid", None),
        # First Subgoal C rolling-support summary scalars
        "recent_obs_age_mean_valid_last": _as_float_or_none(
            s.get("recent_obs_age_mean_valid_last", None)
        ),
        "recent_obs_age_mean_valid_max": _as_float_or_none(
            s.get("recent_obs_age_mean_valid_max", None)
        ),
        "recent_misleading_activity_mean_last": _as_float_or_none(
            s.get("recent_misleading_activity_mean_last", None)
        ),
        "recent_misleading_activity_mean_max": _as_float_or_none(
            s.get("recent_misleading_activity_mean_max", None)
        ),
        "recent_misleading_activity_pos_frac_last": _as_float_or_none(
            s.get("recent_misleading_activity_pos_frac_last", None)
        ),
        "recent_driver_info_true_mean_last": _as_float_or_none(
            s.get("recent_driver_info_true_mean_last", None)
        ),
        # First usefulness-aware prototype summary scalars
        "usefulness_proto_enabled": bool(s.get("usefulness_proto_enabled", False)),
        "usefulness_regime_state_last": s.get("usefulness_regime_state_last", None),
        "usefulness_regime_state_exploit_frac": _as_float_or_none(
            s.get("usefulness_regime_state_exploit_frac", None)
        ),
        "usefulness_regime_state_recover_frac": _as_float_or_none(
            s.get("usefulness_regime_state_recover_frac", None)
        ),
        "usefulness_regime_state_caution_frac": _as_float_or_none(
            s.get("usefulness_regime_state_caution_frac", None)
        ),
        "usefulness_trigger_recover_hits": s.get("usefulness_trigger_recover_hits", None),
        "usefulness_trigger_caution_hits": s.get("usefulness_trigger_caution_hits", None),
        "usefulness_trigger_recover_from_caution_hits": s.get(
            "usefulness_trigger_recover_from_caution_hits",
            None,
        ),
        "usefulness_trigger_exploit_hits": s.get("usefulness_trigger_exploit_hits", None),
     
        # Regime-management summary scalars
        "regime_enabled": bool(s.get("regime_enabled", False)),
        "regime_mode": s.get("regime_mode", None),
        "regime_advisory_enabled": bool(s.get("regime_advisory_enabled", s.get("regime_enabled", False))),
        "regime_stage_ids": s.get("regime_stage_ids", []),
        "regime_opportunistic_level_ids": s.get("regime_opportunistic_level_ids", []),
        "regime_utilization_mean": _as_float_or_none(s.get("regime_utilization_mean", None)),
        "regime_strict_drift_proxy_mean": _as_float_or_none(s.get("regime_strict_drift_proxy_mean", None)),
        "regime_local_drift_rate_mean": _as_float_or_none(s.get("regime_local_drift_rate_mean", None)),
        "regime_cumulative_exposure_final": _as_float_or_none(s.get("regime_cumulative_exposure_final", None)),
        # Advisory summary scalars:
        # Canonical meaning is "trigger hits", not realized transitions.

        "regime_advisory_downshift_trigger_hits": s.get(
            "regime_advisory_downshift_trigger_hits",
            None,
        ),
        "regime_advisory_switch_to_certified_trigger_hits": s.get(
            "regime_advisory_switch_to_certified_trigger_hits",
            None,
        ),
        "regime_advisory_recovery_trigger_hits": s.get(
            "regime_advisory_recovery_trigger_hits",
            None,
        ),

        "regime_last_state": s.get("regime_last_state", None),
        "regime_last_certified_stage_index": s.get("regime_last_certified_stage_index", None),
        "regime_last_opportunistic_level_index": s.get("regime_last_opportunistic_level_index", None),
        "regime_advisory_last_state": s.get("regime_advisory_last_state", s.get("regime_last_state", None)),
        "regime_advisory_last_certified_stage_index": s.get(
            "regime_advisory_last_certified_stage_index",
            s.get("regime_last_certified_stage_index", None),
        ),
        "regime_advisory_last_opportunistic_level_index": s.get(
            "regime_advisory_last_opportunistic_level_index",
            s.get("regime_last_opportunistic_level_index", None),
        ),
        "regime_last_certified_stage_id": s.get("regime_last_certified_stage_id", None),
        "regime_advisory_last_certified_stage_id": s.get(
            "regime_advisory_last_certified_stage_id",
            s.get("regime_last_certified_stage_id", None),
        ),
        "regime_advisory_stage_eta_mean": _as_float_or_none(s.get("regime_advisory_stage_eta_mean", None)),
        "regime_advisory_stage_eta_last": _as_float_or_none(s.get("regime_advisory_stage_eta_last", None)),
        "regime_last_opportunistic_level_id": s.get("regime_last_opportunistic_level_id", None),
        "regime_advisory_last_opportunistic_level_id": s.get(
            "regime_advisory_last_opportunistic_level_id",
            s.get("regime_last_opportunistic_level_id", None),
        ),
        "regime_active_enabled": bool(s.get("regime_active_enabled", False)),
        "regime_active_verify_style": bool(s.get("regime_active_verify_style", False)),
        "regime_active_transition_count": s.get("regime_active_transition_count", None),
        "regime_active_last_state": s.get("regime_active_last_state", None),
        "regime_active_last_certified_stage_index": s.get("regime_active_last_certified_stage_index", None),
        "regime_active_last_opportunistic_level_index": s.get("regime_active_last_opportunistic_level_index", None),
        "regime_active_last_certified_stage_id": s.get("regime_active_last_certified_stage_id", None),
        "regime_active_last_opportunistic_level_id": s.get("regime_active_last_opportunistic_level_id", None),
        "regime_effective_eta_mean": _as_float_or_none(s.get("regime_effective_eta_mean", None)),
        "regime_effective_move_budget_cells_mean": _as_float_or_none(s.get("regime_effective_move_budget_cells_mean", None)),
        "regime_effective_eta_last": _as_float_or_none(s.get("regime_effective_eta_last", None)),
        "regime_effective_move_budget_cells_last": _as_float_or_none(s.get("regime_effective_move_budget_cells_last", None)),
        "regime_active_state_disabled_frac": _as_float_or_none(s.get("regime_active_state_disabled_frac", None)),
        "regime_active_state_nominal_frac": _as_float_or_none(s.get("regime_active_state_nominal_frac", None)),
        "regime_active_state_downshift_frac": _as_float_or_none(s.get("regime_active_state_downshift_frac", None)),
        "regime_active_state_certified_frac": _as_float_or_none(s.get("regime_active_state_certified_frac", None)),
        "regime_active_state_disabled_steps": s.get("regime_active_state_disabled_steps", None),
        "regime_active_state_nominal_steps": s.get("regime_active_state_nominal_steps", None),
        "regime_active_state_downshift_steps": s.get("regime_active_state_downshift_steps", None),
        "regime_active_state_certified_steps": s.get("regime_active_state_certified_steps", None),
        "debug_leave_certified_counter_max": s.get("debug_leave_certified_counter_max", None),
        "debug_leave_certified_trigger_hits": s.get("debug_leave_certified_trigger_hits", None),
        "debug_down_utilization_margin_min": _as_float_or_none(s.get("debug_down_utilization_margin_min", None)),
        "debug_down_utilization_margin_max": _as_float_or_none(s.get("debug_down_utilization_margin_max", None)),
        "debug_switch_utilization_margin_min": _as_float_or_none(s.get("debug_switch_utilization_margin_min", None)),
        "debug_switch_utilization_margin_max": _as_float_or_none(s.get("debug_switch_utilization_margin_max", None)),
        "debug_recovery_utilization_margin_min": _as_float_or_none(s.get("debug_recovery_utilization_margin_min", None)),
        "debug_recovery_utilization_margin_max": _as_float_or_none(s.get("debug_recovery_utilization_margin_max", None)),
        "regime_mechanism_audit_available": bool(s.get("regime_mechanism_audit_available", False)),
    }

    return out


@router.get("/{opr_id}/t/{t}/deployment.png")
def deployment_png(opr_id: str, t: int):
    p = renders_t_dir(opr_id, t) / "deployment.png"
    if not p.exists():
        raise HTTPException(status_code=404, detail="deployment.png not found (did you run it?)")
    return FileResponse(p)

@router.get("/{opr_id}/t/{t}/front.png")
def front_png(opr_id: str, t: int):
    p = renders_t_dir(opr_id, t) / "front.png"
    if not p.exists():
        raise HTTPException(status_code=404, detail="front.png not found (did you run it?)")
    return FileResponse(p)


@router.delete("/{opr_id}")
def delete_run(
    opr_id: str,
    force: bool = Query(False, description="If true, delete even if dependent runs exist."),
) -> dict:
    # Block deletion if analysis studies (ana-*) reference this operational run,
    # unless force=true. This mirrors epistemic delete-hardening and prevents
    # breaking shareable analysis artifacts by accident.
    referenced_by_ana: list[str] = []
    try:
        ana_ids = list_manifests("ana")
        for aid in ana_ids:
            try:
                am = load_manifest(aid)
            except Exception:
                continue
            if isinstance(am, dict):
                # Support multiple possible manifest layouts.
                ids = []
                if isinstance(am.get("opr_ids"), list):
                    ids.extend([str(x) for x in am["opr_ids"]])
                if isinstance(am.get("created_run_ids"), list):
                    ids.extend([str(x) for x in am["created_run_ids"]])
                if isinstance(am.get("runs"), list):
                    for r in am["runs"]:
                        if isinstance(r, dict) and "opr_id" in r:
                            ids.append(str(r["opr_id"]))
                if str(opr_id) in set(ids):
                    referenced_by_ana.append(str(aid))
    except Exception:
        referenced_by_ana = []

    if referenced_by_ana and not bool(force):
        raise HTTPException(
            status_code=409,
            detail={
                "message": "operational run is referenced by analysis studies",
                "opr_id": opr_id,
                # Frontend expects `dependents`; keep the legacy key too.
                "dependents": referenced_by_ana,
                "referenced_by_ana": referenced_by_ana,
            },
        )

    return delete_run_artifacts(opr_id)


__all__ = ["router"]
