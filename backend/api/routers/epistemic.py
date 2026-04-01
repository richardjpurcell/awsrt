# backend/api/routers/epistemic.py

"""
Belief Lab backend router.

This router retains the internal /epistemic namespace and epi-* IDs for now,
but the scientific/product meaning is now Belief Lab: a policy-free support /
channel / belief-update laboratory aligned with AWSRT's operational O1
semantics.
"""

from __future__ import annotations

import json
from pathlib import Path
import math
from typing import Any

import numpy as np
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse

from awsrt_core.epistemic.option_a import run_epistemic_option_a
from awsrt_core.io.ids import new_id
from awsrt_core.io.paths import (
    delete_run_artifacts,
    list_fields,
    list_manifests,
    load_manifest,
    metrics_dir,
    open_zarr_array,
    renders_dir,
    renders_t_dir,
    save_manifest,
    write_field,
    zarr_path,
)
from awsrt_core.io.renders import (
    render_legend_png,
    render_scalar_png,
    render_categorical_png,
    render_sign_mask_png,
    render_support_arrival_overlay_png,
)
from awsrt_core.metrics.basic import entropy_auc, write_summary_json
from awsrt_core.schemas.common import ListResponse, MetaResponse, RunRequest
from awsrt_core.schemas.epistemic import EpistemicManifest

router = APIRouter()

def _load_epi_summary_or_none(epi_id: str) -> dict[str, Any] | None:
    """
    Read metrics/{epi_id}/summary.json if present.
    Used to keep Belief Lab runs viewable even if the linked physical run is deleted.
    """
    p = metrics_dir(epi_id) / "summary.json"
    try:
        if not p.exists():
            return None
        with p.open("r", encoding="utf-8") as f:
            data = json.load(f)
        return data if isinstance(data, dict) else None
    except Exception:
        return None


def _as_float_or_none(x: Any) -> float | None:
    try:
        if x is None:
            return None
        v = float(x)
        if not math.isfinite(v):
            return None
        return v
    except Exception:
        return None


def _safe_mean_1d(x: np.ndarray) -> float | None:
    try:
        arr = np.asarray(x).reshape(-1)
        if arr.size == 0:
            return None
        return float(np.mean(arr))
    except Exception:
        return None


def _safe_min_1d(x: np.ndarray) -> float | None:
    try:
        arr = np.asarray(x).reshape(-1)
        if arr.size == 0:
            return None
        return float(np.min(arr))
    except Exception:
        return None


def _safe_max_1d(x: np.ndarray) -> float | None:
    try:
        arr = np.asarray(x).reshape(-1)
        if arr.size == 0:
            return None
        return float(np.max(arr))
    except Exception:
        return None


def _frac_le_abs(x: np.ndarray, thr: float | None) -> float | None:
    try:
        arr = np.asarray(x).reshape(-1)
        if arr.size == 0 or thr is None:
            return None
        return float(np.mean((np.abs(arr) <= float(thr)).astype(np.float32)))
    except Exception:
        return None


def _frac_gt(x: np.ndarray, thr: float | None) -> float | None:
    try:
        arr = np.asarray(x).reshape(-1)
        if arr.size == 0 or thr is None:
            return None
        return float(np.mean((arr > float(thr)).astype(np.float32)))
    except Exception:
        return None


def _finite_stats_2d(x: np.ndarray) -> dict[str, Any]:
    """
    Compact numeric diagnostics for a 2D field.
    Keeps output JSON-safe and robust to NaN / inf / empty inputs.
    """
    try:
        arr = np.asarray(x, dtype=np.float32).reshape(-1)
    except Exception:
        return {
            "size": 0,
            "finite_frac": None,
            "min": None,
            "max": None,
            "mean": None,
            "std": None,
            "q01": None,
            "q05": None,
            "q25": None,
            "q50": None,
            "q75": None,
            "q95": None,
            "q99": None,
            "frac_zero": None,
        }

    size = int(arr.size)
    if size == 0:
        return {
            "size": 0,
            "finite_frac": None,
            "min": None,
            "max": None,
            "mean": None,
            "std": None,
            "q01": None,
            "q05": None,
            "q25": None,
            "q50": None,
            "q75": None,
            "q95": None,
            "q99": None,
            "frac_zero": None,
        }

    finite = np.isfinite(arr)
    finite_frac = float(np.mean(finite.astype(np.float32)))
    vals = arr[finite]
    if vals.size == 0:
        return {
            "size": size,
            "finite_frac": finite_frac,
            "min": None,
            "max": None,
            "mean": None,
            "std": None,
            "q01": None,
            "q05": None,
            "q25": None,
            "q50": None,
            "q75": None,
            "q95": None,
            "q99": None,
            "frac_zero": None,
        }

    return {
        "size": size,
        "finite_frac": finite_frac,
        "min": float(np.min(vals)),
        "max": float(np.max(vals)),
        "mean": float(np.mean(vals)),
        "std": float(np.std(vals)),
        "q01": float(np.quantile(vals, 0.01)),
        "q05": float(np.quantile(vals, 0.05)),
        "q25": float(np.quantile(vals, 0.25)),
        "q50": float(np.quantile(vals, 0.50)),
        "q75": float(np.quantile(vals, 0.75)),
        "q95": float(np.quantile(vals, 0.95)),
        "q99": float(np.quantile(vals, 0.99)),
        "frac_zero": float(np.mean((vals == 0.0).astype(np.float32))),
    }

def _robust_abs_quantile(x: np.ndarray, q: float) -> float | None:
    """
    Return a robust quantile of |x| over finite values.
    Useful for choosing symmetric signed render ranges from observed data.
    """
    try:
        arr = np.asarray(x, dtype=np.float32).reshape(-1)
        if arr.size == 0:
            return None
        arr = arr[np.isfinite(arr)]
        if arr.size == 0:
            return None
        qq = float(np.clip(float(q), 0.0, 1.0))
        return float(np.quantile(np.abs(arr), qq))
    except Exception:
        return None


def _choose_delta_render_params(
    delta_3d: np.ndarray,
    *,
    vmax_entropy: float,
) -> tuple[float, float]:
    """
    Choose a data-driven symmetric color range and alpha threshold for delta-entropy.

    Policy:
      - symmetric range is based on the observed 99th percentile of |delta|
      - alpha threshold is based on a lower observed quantile of |delta|
      - both values are clamped away from zero
      - range is also capped by the theoretical entropy bound for safety

    Returns:
      (delta_render_abs, delta_signal_thr)
      where render vmin/vmax are [-delta_render_abs, +delta_render_abs]
    """
    theoretical_cap = float(max(1e-6, abs(vmax_entropy)))

    q99_abs = _robust_abs_quantile(delta_3d, 0.99)
    q90_abs = _robust_abs_quantile(delta_3d, 0.90)
    q75_abs = _robust_abs_quantile(delta_3d, 0.75)

    tiny = 1e-6

    # Symmetric color range: use the observed 99th percentile when available.
    # Fall back progressively if the run is nearly static.
    delta_render_abs = q99_abs
    if delta_render_abs is None or not math.isfinite(delta_render_abs) or delta_render_abs <= tiny:
        delta_render_abs = q90_abs
    if delta_render_abs is None or not math.isfinite(delta_render_abs) or delta_render_abs <= tiny:
        delta_render_abs = q75_abs
    if delta_render_abs is None or not math.isfinite(delta_render_abs) or delta_render_abs <= tiny:
        delta_render_abs = theoretical_cap * 0.05

    delta_render_abs = float(np.clip(delta_render_abs, tiny, theoretical_cap))

    # Alpha threshold: pick a lower robust quantile so near-zero drift is hidden
    # but meaningful signed structure remains visible.
    #
    # Tightened fallback:
    #   when q75_abs is unavailable / zero in sparse runs, use 35% of the
    #   chosen render range instead of 20% to reduce salt-and-pepper clutter.
    delta_signal_thr = q75_abs
    if delta_signal_thr is None or not math.isfinite(delta_signal_thr) or delta_signal_thr <= tiny:
        delta_signal_thr = 0.35 * delta_render_abs

    delta_signal_thr = float(np.clip(delta_signal_thr, tiny, 0.95 * delta_render_abs))
    return delta_render_abs, delta_signal_thr

def _delta_sign_u8(delta_2d: np.ndarray, *, thr: float) -> np.ndarray:
    """
    Convert signed delta-entropy into a 3-state categorical field:
      0 = near-zero / background
      1 = negative delta
      2 = positive delta

    Thresholding is symmetric in |delta|.
    """
    x = np.asarray(delta_2d, dtype=np.float32)
    out = np.zeros(x.shape, dtype=np.uint8)
    if x.size == 0:
        return out

    thr_f = float(max(0.0, thr))
    neg = x < -thr_f
    pos = x > +thr_f
    out[neg] = 1
    out[pos] = 2
    return out

def _write_render_debug_json(epi_id: str, payload: dict[str, Any]) -> None:
    p = metrics_dir(epi_id) / "render_debug.json"
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open("w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)

@router.post("/manifest")
def create_manifest(manifest: EpistemicManifest) -> dict:
    epi_id = new_id("epi")
    save_manifest(epi_id, manifest.model_dump())
    return {"epi_id": epi_id, "belief_lab_id": epi_id}


@router.get("/list", response_model=ListResponse)
def list_runs() -> ListResponse:
    return ListResponse(ids=list_manifests("epi"))


@router.get("/{epi_id}/manifest")
def get_manifest(epi_id: str) -> dict:
    try:
        return load_manifest(epi_id)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="manifest not found")


@router.get("/{epi_id}/meta", response_model=MetaResponse)
def meta(epi_id: str) -> MetaResponse:
    try:
        m = load_manifest(epi_id)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="manifest not found")

    phy_id = m.get("phy_id")
    if not phy_id:
        raise HTTPException(status_code=400, detail="Belief Lab manifest missing phy_id")

    # Preferred: linked physical manifest (current behavior)
    phy = None
    try:
        phy = load_manifest(str(phy_id))
    except FileNotFoundError:
        phy = None

    if isinstance(phy, dict):
        try:
            H = int(phy["grid"]["H"])
            W = int(phy["grid"]["W"])
            T = int(phy["horizon_steps"])
            dt_seconds = int(phy["dt_seconds"])
            cell_size_m = float(phy["grid"]["cell_size_m"])
            crs_code = str(phy["grid"].get("crs_code", ""))
            return MetaResponse(
                id=epi_id,
                H=H,
                W=W,
                T=T,
                dt_seconds=dt_seconds,
                horizon_steps=T,
                crs_code=crs_code,
                cell_size_m=cell_size_m,
            )
        except Exception:
            raise HTTPException(status_code=500, detail="linked physical manifest is malformed")

    # Fallback: stored epistemic meta in summary.json (self-contained runs)
    s = _load_epi_summary_or_none(epi_id) or {}
    if all(k in s for k in ("H", "W", "T", "dt_seconds", "cell_size_m", "crs_code")):
        try:
            H = int(s["H"])
            W = int(s["W"])
            T = int(s["T"])
            dt_seconds = int(s["dt_seconds"])
            cell_size_m = float(s["cell_size_m"])
            crs_code = str(s.get("crs_code", ""))
            return MetaResponse(
                id=epi_id,
                H=H,
                W=W,
                T=T,
                dt_seconds=dt_seconds,
                horizon_steps=T,
                crs_code=crs_code,
                cell_size_m=cell_size_m,
            )
        except Exception:
            # fall through to zarr inference
            pass

    # Last resort: infer (T,H,W) from stored belief field
    try:
        bel = open_zarr_array(zarr_path(epi_id, "belief"), mode="r")
        shp = tuple(int(x) for x in bel.shape)
        if len(shp) != 3:
            raise ValueError(f"belief must be 3D (T,H,W); got {shp}")
        T, H, W = shp
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"cannot determine Belief Lab meta (missing physical + missing summary + missing belief): {e}")

    # dt_seconds/cell_size_m/crs_code unknown if physical is gone and summary missing; use safe defaults
    return MetaResponse(
        id=epi_id,
        H=H,
        W=W,
        T=T,
        dt_seconds=int(s.get("dt_seconds", 0) or 0),
        horizon_steps=T,
        crs_code=str(s.get("crs_code", "") or ""),
        cell_size_m=float(s.get("cell_size_m", 1.0) or 1.0),
    )


@router.get("/{epi_id}/fields")
def fields(epi_id: str) -> dict:
    try:
        return {"fields": list_fields(epi_id)}
    except Exception:
        return {"fields": []}


@router.post("/run")
def run(req: RunRequest) -> dict:
    epi_id = req.id
    try:
        m = EpistemicManifest.model_validate(load_manifest(epi_id))
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Belief Lab manifest not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"invalid Belief Lab manifest: {e}")

    # --- Load physical truth ---
    try:
        fire = open_zarr_array(zarr_path(m.phy_id, "fire_state"), mode="r")
        truth = np.asarray(fire[:], dtype=np.uint8)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="physical fields not found (did you run physical?)")
    except KeyError:
        raise HTTPException(status_code=404, detail="fire_state not found in physical fields (did you run physical?)")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"failed to load physical fire_state: {e}")

    if truth.ndim != 3:
        raise HTTPException(status_code=500, detail=f"fire_state must be 3D (T,H,W); got {truth.shape}")
    T, H, W = map(int, truth.shape)

    # Capture physical meta for self-contained Belief Lab visualization (so epi still works if phy is deleted later).
    dt_seconds = 0
    cell_size_m = 1.0
    crs_code = ""
    try:
        phy = load_manifest(str(m.phy_id))
        if isinstance(phy, dict):
            dt_seconds = int(phy.get("dt_seconds", 0) or 0)
            grid = phy.get("grid", {}) if isinstance(phy.get("grid", {}), dict) else {}
            cell_size_m = float(grid.get("cell_size_m", 1.0) or 1.0)
            crs_code = str(grid.get("crs_code", "") or "")
    except Exception:
        pass


    # --- Optional fixed support mask (Option A) ---
    fixed_support_mask = None
    try:
        if m.support.model == "fixed_support_mask":
            # Schema validator should enforce this, but keep a clear runtime error too.
            if not m.support.fixed_mask_path:
                raise HTTPException(status_code=400, detail="support.model='fixed_support_mask' requires support.fixed_mask_path")
            fixed_support_mask = np.load(m.support.fixed_mask_path)
            if fixed_support_mask.shape != (H, W):
                raise HTTPException(
                    status_code=400,
                    detail=f"fixed_support_mask has shape {fixed_support_mask.shape}, expected {(H, W)}",
                )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"failed to load fixed_mask: {e}")

    # --- MDC parameters (manifest-owned; single source of truth) ---
    # Still keep a defensive fallback for legacy manifests / partial runs.
    eps = 0.0
    residual_driver = "arrival_frac"
    residual_c = 0.0
    try:
        eps = float(m.mdc.eps)
        residual_driver = str(m.mdc.residual_driver)
        residual_c = float(m.mdc.residual_c)
    except Exception:
        pass

    # --- Run Belief Lab loop (Option A) ---
    try:
        out = run_epistemic_option_a(
            truth,
            prior_p=float(m.belief.prior_p),
            decay=float(m.belief.decay),
            false_pos=float(m.belief.noise.false_pos),
            false_neg=float(m.belief.noise.false_neg),
            action_model=str(m.support.model),
            action_m=int(m.support.budget),
            action_seed=int(m.support.seed),
            loss_prob=float(m.impairment.loss_prob),
            delay_geom_p=float(m.impairment.delay_geom_p),
            max_delay_steps=int(m.impairment.max_delay_steps),
            entropy_units=str(m.entropy.units),
            fixed_mask=fixed_support_mask,
            eps=float(eps),
            residual_driver=residual_driver,
            residual_c=float(residual_c),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"failed to run Belief Lab option A: {e}")

    # --- Store fields ---
    try:
        # Per-cell fields
        write_field(epi_id, "belief", out.belief)
        write_field(epi_id, "entropy", out.entropy)
        write_field(epi_id, "delta_entropy", out.delta_entropy)

        # Support / impairment fields
        write_field(epi_id, "support_mask", out.support_mask)
        write_field(epi_id, "arrived_mask", out.arrived_mask)
        write_field(epi_id, "lost_mask", out.lost_mask)
        write_field(epi_id, "delay_steps", out.delay_steps)

        # Drivers / proxies
        write_field(epi_id, "arrived_info_proxy", out.arrived_info_proxy.astype(np.float32, copy=False))
        write_field(epi_id, "arrival_frac", out.arrival_frac.astype(np.float32, copy=False))

        # Publication-facing global series
        write_field(epi_id, "mean_entropy", out.mean_entropy.astype(np.float32, copy=False))
        write_field(epi_id, "delta_mean_entropy", out.delta_mean_entropy.astype(np.float32, copy=False))
        write_field(epi_id, "mdc_flag", out.mdc_flag.astype(np.uint8, copy=False))

        # Residual diagnostics (computed in option_a)
        write_field(epi_id, "residual_support", out.residual_support.astype(np.float32, copy=False))
        write_field(epi_id, "residual_arrived_info", out.residual_arrived_info.astype(np.float32, copy=False))


    except Exception as e:
        raise HTTPException(status_code=500, detail=f"failed to write Belief Lab zarr fields: {e}")

    # --- Renders ---
    vmax_entropy = float(np.log2(2.0)) if m.entropy.units == "bits" else float(np.log(2.0))
    delta_render_abs, delta_signal_thr = _choose_delta_render_params(
        out.delta_entropy,
        vmax_entropy=vmax_entropy,
    )
    vmin_dh = -float(delta_render_abs)
    vmax_dh = float(delta_render_abs)
    render_debug_frames: list[dict[str, Any]] = []
    delta_render_policy = {
        "mode": "data_driven_symmetric",
        "range_abs_source": "q99_abs_delta (fallback q90/q75/5% theoretical cap)",
        "sign_only_threshold_source": "same threshold as delta alpha mask",
        "alpha_threshold_source": "q75_abs_delta (fallback 35% of render abs)",
    }

    for t in range(T):
        td = renders_t_dir(epi_id, t)
        entropy_departure = np.maximum(vmax_entropy - out.entropy[t], 0.0).astype(np.float32, copy=False)
        entropy_departure_max = float(np.max(entropy_departure)) if entropy_departure.size else 0.0
        entropy_departure_vmax = max(entropy_departure_max, 1e-6)
        delta_t = np.asarray(out.delta_entropy[t], dtype=np.float32)
        delta_sign_t = _delta_sign_u8(delta_t, thr=delta_signal_thr)
        abs_delta_t = np.abs(delta_t)

        render_debug_frames.append(
            {
                "t": int(t),
                "arrival_frac": float(out.arrival_frac[t]),
                "arrived_info_proxy": float(out.arrived_info_proxy[t]),
                "mean_entropy": float(out.mean_entropy[t]),
                "delta_mean_entropy": float(out.delta_mean_entropy[t]),
                "entropy": _finite_stats_2d(out.entropy[t]),
                "entropy_departure": {
                    **_finite_stats_2d(entropy_departure),
                    "vmax_used": float(entropy_departure_vmax),
                },
                "delta_entropy": {
                    **_finite_stats_2d(delta_t),
                    "vmin_used": float(vmin_dh),
                    "vmax_used": float(vmax_dh),
                    "alpha_mask_below": float(delta_signal_thr),
                    "render_policy": "data_driven_symmetric",
                    "alpha_mask_mode": "abs_le",
                    "soften_alpha_mask": False,
                    "frac_neg": float(np.mean((delta_t < 0.0).astype(np.float32))),
                    "frac_pos": float(np.mean((delta_t > 0.0).astype(np.float32))),
                    "frac_abs_le_thr": float(np.mean((abs_delta_t <= float(delta_signal_thr)).astype(np.float32))),
                    "frac_abs_gt_thr": float(np.mean((abs_delta_t > float(delta_signal_thr)).astype(np.float32))),
                    "frac_abs_gt_1e_4": float(np.mean((abs_delta_t > 1e-4).astype(np.float32))),
                    "frac_abs_gt_1e_3": float(np.mean((abs_delta_t > 1e-3).astype(np.float32))),
                    "frac_abs_gt_1e_2": float(np.mean((abs_delta_t > 1e-2).astype(np.float32))),
                    "frac_abs_gt_5e_2": float(np.mean((abs_delta_t > 5e-2).astype(np.float32))),
                    "frac_abs_gt_1e_1": float(np.mean((abs_delta_t > 1e-1).astype(np.float32))),
                    "sign_only_counts": {
                        "zero": int(np.sum(delta_sign_t == 0)),
                        "neg": int(np.sum(delta_sign_t == 1)),
                        "pos": int(np.sum(delta_sign_t == 2)),
                    },
                    "sign_only_fracs": {
                        "zero": float(np.mean((delta_sign_t == 0).astype(np.float32))),
                        "neg": float(np.mean((delta_sign_t == 1).astype(np.float32))),
                        "pos": float(np.mean((delta_sign_t == 2).astype(np.float32))),
                    },
                },
                "support_mask": {
                    "mean": float(np.mean(out.support_mask[t].astype(np.float32))),
                    "sum": int(np.sum(out.support_mask[t].astype(np.int64))),
                },
                "arrived_mask": {
                    "mean": float(np.mean(out.arrived_mask[t].astype(np.float32))),
                    "sum": int(np.sum(out.arrived_mask[t].astype(np.int64))),
                },
                "lost_mask": {
                    "mean": float(np.mean(out.lost_mask[t].astype(np.float32))),
                    "sum": int(np.sum(out.lost_mask[t].astype(np.int64))),
                },
            }
        )

        render_scalar_png(
            out.belief[t],
            td / "belief.png",
            cmap="viridis",
            vmin=0.0,
            vmax=1.0,
            title=None,
            with_colorbar=False,
        )

        render_scalar_png(
            entropy_departure,
            td / "entropy.png",
            cmap="gray",
            vmin=0.0,
            vmax=entropy_departure_vmax,
            transparent_background=False,
            title=None,
            with_colorbar=False,
        )

        render_scalar_png(
            out.delta_entropy[t],
            td / "delta_entropy.png",
            cmap="coolwarm",
            vmin=vmin_dh,
            vmax=vmax_dh,
            transparent_background=True,
            # Hide tiny near-zero changes so the temporal trail reveals recent
            # entropy-change signal instead of washing the tile with pastel noise.
            soften_alpha_mask=False,
            alpha_mask_below=delta_signal_thr,
            alpha_mask_mode="abs_le",
            title=None,
            with_colorbar=False,
        )

        render_scalar_png(
            out.arrived_mask[t].astype(np.float32, copy=False),
            td / "arrived_mask.png",
            cmap="gray",
            vmin=0.0,
            vmax=1.0,
            title=None,
            with_colorbar=False,
        )

        render_support_arrival_overlay_png(
            support_mask_2d=out.support_mask[t].astype(np.uint8, copy=False),
            arrived_mask_2d=out.arrived_mask[t].astype(np.uint8, copy=False),
            out_path=td / "arrived_on_support.png",
        )

        render_sign_mask_png(
            delta_sign_t,
            td / "delta_entropy_sign.png",
        )

        render_scalar_png(
            out.support_mask[t].astype(np.float32, copy=False),
            td / "support_mask.png",
            cmap="gray",
            vmin=0.0,
            vmax=1.0,
            title=None,
            with_colorbar=False,
        )

    rd = renders_dir(epi_id)
    render_legend_png(rd / "legend_belief.png", cmap="viridis", label="belief (p)", vmin=0.0, vmax=1.0)
    render_legend_png(
        rd / "legend_entropy.png",
        cmap="gray",
        label=f"entropy ({m.entropy.units})",
        vmin=0.0,
        vmax=vmax_entropy,
    )
    render_legend_png(
        rd / "legend_delta_entropy.png",
        cmap="coolwarm",
        label=f"Δentropy ({m.entropy.units})",
        vmin=vmin_dh,
        vmax=vmax_dh,
    )
    render_legend_png(
        rd / "legend_delta_entropy_sign.png", cmap="coolwarm", label="Δentropy sign (blue=decrease, red=increase)", vmin=-1.0, vmax=1.0
    )
    render_legend_png(rd / "legend_support_mask.png", cmap="gray", label="support mask (0/1)", vmin=0.0, vmax=1.0)
    render_legend_png(rd / "legend_arrived_mask.png", cmap="gray", label="arrivals (0/1)", vmin=0.0, vmax=1.0)
    try:
        _write_render_debug_json(
            epi_id,
            {
                "id": epi_id,
                "layer": "belief_lab",
                "entropy_units": str(m.entropy.units),
                "vmax_entropy": float(vmax_entropy),
                "delta_render_vmin": float(vmin_dh),
                "delta_render_abs": float(delta_render_abs),
                "delta_render_vmax": float(vmax_dh),
                "delta_signal_thr": float(delta_signal_thr),
                "notes": {
                    "entropy_tile_field": "entropy_departure = max_entropy - entropy",
                    "delta_entropy_tile_field": "raw delta_entropy[t] = entropy[t] - entropy[t-1]",
                    "delta_entropy_sign_tile_field": "categorical sign(delta_entropy[t]) with symmetric threshold",
                },
                "delta_render_policy": delta_render_policy,
                "frames": render_debug_frames,
            },
        )
    except Exception:
        pass

    # --- Metrics summary ---
    mean_entropy = out.mean_entropy.astype(np.float32, copy=False)
    arrived_info = out.arrived_info_proxy.astype(np.float32, copy=False)
    delta_mean_entropy = out.delta_mean_entropy.astype(np.float32, copy=False)
    residual_support = out.residual_support.astype(np.float32, copy=False)
    residual_arrived_info = out.residual_arrived_info.astype(np.float32, copy=False)
    arrival_frac = out.arrival_frac.astype(np.float32, copy=False)

    eps_eff = float(out.eps)
    residual_arrived_info_mean = _safe_mean_1d(residual_arrived_info)
    residual_support_mean = _safe_mean_1d(residual_support)
    residual_arrived_info_in_band_frac = _frac_le_abs(residual_arrived_info, eps_eff)
    residual_support_in_band_frac = _frac_le_abs(residual_support, eps_eff)
    residual_arrived_info_pos_frac = _frac_gt(residual_arrived_info, eps_eff)
    residual_support_pos_frac = _frac_gt(residual_support, eps_eff)

    write_summary_json(
        metrics_dir(epi_id) / "summary.json",
        {
            "id": epi_id,
            "layer": "belief_lab",
            "phy_id": m.phy_id,
            # Persist meta needed by the Belief Lab Visualizer even if the linked physical run is deleted.
            "H": int(H),
            "W": int(W),
            "T": int(T),
            "dt_seconds": int(dt_seconds),
            "cell_size_m": float(cell_size_m),
            "crs_code": str(crs_code),
            "mode": "policy_free_support_lab",
            "entropy_auc": entropy_auc(mean_entropy),
            "mean_entropy_auc": entropy_auc(mean_entropy),
            "mean_entropy_t0": float(mean_entropy[0]) if len(mean_entropy) else None,
            "mean_entropy_t_end": float(mean_entropy[-1]) if len(mean_entropy) else None,
            "mean_entropy_mean": _safe_mean_1d(mean_entropy),
            "delta_mean_entropy_min": _safe_min_1d(delta_mean_entropy),
            "delta_mean_entropy_max": _safe_max_1d(delta_mean_entropy),
            "delta_mean_entropy_mean": _safe_mean_1d(delta_mean_entropy),
            "mdc_eps": float(out.eps),
            "mdc_violation_rate": float(np.mean(out.delta_mean_entropy > -float(out.eps)))
            if len(out.delta_mean_entropy)
            else None,
            "mdc_residual_driver": str(getattr(out, "residual_driver", "arrival_frac")),
            "mdc_residual_c": float(getattr(out, "residual_c", 0.0)),
            "mdc_c_arrival": float(getattr(out, "c_arrival", 0.0)),
            "mdc_c_info": float(getattr(out, "c_info", 0.0)),
            "arrived_info_proxy_sum": float(np.sum(arrived_info)),
            "arrived_info_proxy_mean": float(np.mean(arrived_info)),
            "arrival_frac_mean": float(np.mean(arrival_frac)),
            "arrival_frac_min": _safe_min_1d(arrival_frac),
            "arrival_frac_max": _safe_max_1d(arrival_frac),
            "residual_support_mean": residual_support_mean,
            "residual_support_min": _safe_min_1d(residual_support),
            "residual_support_max": _safe_max_1d(residual_support),
            "residual_support_in_band_frac": residual_support_in_band_frac,
            "residual_support_pos_frac": residual_support_pos_frac,
            "residual_arrived_info_mean": residual_arrived_info_mean,
            "residual_arrived_info_min": _safe_min_1d(residual_arrived_info),
            "residual_arrived_info_max": _safe_max_1d(residual_arrived_info),
            "residual_arrived_info_in_band_frac": residual_arrived_info_in_band_frac,
            "residual_arrived_info_pos_frac": residual_arrived_info_pos_frac,
            "support_model": str(m.support.model),
            "support_budget": int(m.support.budget),
            "support_seed": int(m.support.seed),
            "fixed_support_mask_path": None if not m.support.fixed_mask_path else str(m.support.fixed_mask_path),
            "loss_prob": float(m.impairment.loss_prob),
            "delay_geom_p": float(m.impairment.delay_geom_p),
            "max_delay_steps": int(m.impairment.max_delay_steps),
            "impairment_mode": str(m.impairment.mode),
        },
    )

    return {"ok": True, "epi_id": epi_id, "belief_lab_id": epi_id}


# --------------------------
# Time-series endpoint
# --------------------------


@router.get("/{epi_id}/series")
def series(epi_id: str) -> dict:
    """
    Return Belief Lab global observables and drivers for MDC diagnostics.

    All arrays are returned as JSON lists so the frontend can plot them.
    """
    try:
        m = load_manifest(epi_id)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="manifest not found")

    units = None
    try:
        units = str(m.get("entropy", {}).get("units", ""))
    except Exception:
        units = None

    # --- MDC parameters are manifest-owned (single source of truth) ---
    # load_manifest returns a dict; keep this defensive for older manifests.
    mdc: dict[str, Any] = {}
    try:
        if isinstance(m, dict):
            mdc = dict(m.get("mdc", {}) or {})
    except Exception:
        mdc = {}

    eps = 0.0
    residual_driver = "arrival_frac"
    residual_c = 0.0
    try:
        eps = float(mdc.get("eps", 0.0))
        residual_driver = str(mdc.get("residual_driver", "arrival_frac"))
        residual_c = float(mdc.get("residual_c", 0.0))
    except Exception:
        eps = 0.0
        residual_driver = "arrival_frac"
        residual_c = 0.0

    def _read_1d(name: str) -> np.ndarray:
        a = open_zarr_array(zarr_path(epi_id, name), mode="r")
        x = np.asarray(a[:])
        if x.ndim != 1:
            raise ValueError(f"{name} is not 1D (got shape {x.shape})")
        return x

    try:
        mean_entropy = _read_1d("mean_entropy").astype(np.float32, copy=False)
        delta_mean_entropy = _read_1d("delta_mean_entropy").astype(np.float32, copy=False)
        mdc_flag = _read_1d("mdc_flag").astype(np.uint8, copy=False)

        arrival_frac = _read_1d("arrival_frac").astype(np.float32, copy=False)
        arrived_info_proxy = _read_1d("arrived_info_proxy").astype(np.float32, copy=False)

        residual_support = _read_1d("residual_support").astype(np.float32, copy=False)
        residual_arrived_info = _read_1d("residual_arrived_info").astype(np.float32, copy=False)


    except Exception as e:
        raise HTTPException(status_code=404, detail=f"series not found (did you run Belief Lab?): {e}")

    s = _load_epi_summary_or_none(epi_id) or {}

    return {
        "units": units,
        "eps": float(eps),
        "residual_driver": residual_driver,
        "residual_c": float(residual_c),
        "mean_entropy": mean_entropy.tolist(),
        "delta_mean_entropy": delta_mean_entropy.tolist(),
        "mdc_flag": mdc_flag.tolist(),
        "arrival_frac": arrival_frac.tolist(),
        "arrived_info_proxy": arrived_info_proxy.tolist(),
        "residual_support": residual_support.tolist(),
        "residual_arrived_info": residual_arrived_info.tolist(),
        # Summary-aligned scalars (mirrors operational /series style)
        "entropy_auc": _as_float_or_none(s.get("entropy_auc", None)),
        "mean_entropy_auc": _as_float_or_none(s.get("mean_entropy_auc", None)),
        "mean_entropy_mean": _as_float_or_none(s.get("mean_entropy_mean", None)),
        "delta_mean_entropy_mean": _as_float_or_none(s.get("delta_mean_entropy_mean", None)),
        "delta_mean_entropy_min": _as_float_or_none(s.get("delta_mean_entropy_min", None)),
        "delta_mean_entropy_max": _as_float_or_none(s.get("delta_mean_entropy_max", None)),
        "mdc_eps": _as_float_or_none(s.get("mdc_eps", None)),
        "mdc_violation_rate": _as_float_or_none(s.get("mdc_violation_rate", None)),
        "mdc_residual_driver": s.get("mdc_residual_driver", None),
        "mdc_residual_c": _as_float_or_none(s.get("mdc_residual_c", None)),
        "c_arrival": _as_float_or_none(s.get("mdc_c_arrival", None)),
        "c_info": _as_float_or_none(s.get("mdc_c_info", None)),
        "arrived_info_proxy_sum": _as_float_or_none(s.get("arrived_info_proxy_sum", None)),
        "arrived_info_proxy_mean": _as_float_or_none(s.get("arrived_info_proxy_mean", None)),
        "arrival_frac_mean": _as_float_or_none(s.get("arrival_frac_mean", None)),
        "arrival_frac_min": _as_float_or_none(s.get("arrival_frac_min", None)),
        "arrival_frac_max": _as_float_or_none(s.get("arrival_frac_max", None)),
        "residual_support_mean": _as_float_or_none(s.get("residual_support_mean", None)),
        "residual_support_min": _as_float_or_none(s.get("residual_support_min", None)),
        "residual_support_max": _as_float_or_none(s.get("residual_support_max", None)),
        "residual_support_in_band_frac": _as_float_or_none(s.get("residual_support_in_band_frac", None)),
        "residual_support_pos_frac": _as_float_or_none(s.get("residual_support_pos_frac", None)),
        "residual_arrived_info_mean": _as_float_or_none(s.get("residual_arrived_info_mean", None)),
        "residual_arrived_info_min": _as_float_or_none(s.get("residual_arrived_info_min", None)),
        "residual_arrived_info_max": _as_float_or_none(s.get("residual_arrived_info_max", None)),
        "residual_arrived_info_in_band_frac": _as_float_or_none(s.get("residual_arrived_info_in_band_frac", None)),
        "residual_arrived_info_pos_frac": _as_float_or_none(s.get("residual_arrived_info_pos_frac", None)),
    }


# --------------------------
# PNG endpoints
# --------------------------


@router.get("/{epi_id}/t/{t}/belief.png")
def belief_png(epi_id: str, t: int):
    p = renders_t_dir(epi_id, t) / "belief.png"
    if not p.exists():
        raise HTTPException(status_code=404, detail="belief.png not found (did you run the sim?)")
    return FileResponse(p)


@router.get("/{epi_id}/t/{t}/entropy.png")
def entropy_png(epi_id: str, t: int):
    p = renders_t_dir(epi_id, t) / "entropy.png"
    if not p.exists():
        raise HTTPException(status_code=404, detail="entropy.png not found (did you run the sim?)")
    return FileResponse(p)


@router.get("/{epi_id}/t/{t}/delta_entropy.png")
def delta_entropy_png(epi_id: str, t: int):
    p = renders_t_dir(epi_id, t) / "delta_entropy.png"
    if not p.exists():
        raise HTTPException(status_code=404, detail="delta_entropy.png not found (did you run the sim?)")
    return FileResponse(p)

@router.get("/{epi_id}/t/{t}/delta_entropy_sign.png")
def delta_entropy_sign_png(epi_id: str, t: int):
    p = renders_t_dir(epi_id, t) / "delta_entropy_sign.png"
    if not p.exists():
        raise HTTPException(status_code=404, detail="delta_entropy_sign.png not found (did you run the sim?)")
    return FileResponse(p)

@router.get("/{epi_id}/t/{t}/arrived_mask.png")
def arrived_mask_png(epi_id: str, t: int):
    p = renders_t_dir(epi_id, t) / "arrived_mask.png"
    if not p.exists():
        raise HTTPException(status_code=404, detail="arrived_mask.png not found (did you run the sim?)")
    return FileResponse(p)


@router.get("/{epi_id}/t/{t}/arrived_on_support.png")
def arrived_on_support_png(epi_id: str, t: int):
    p = renders_t_dir(epi_id, t) / "arrived_on_support.png"
    if not p.exists():
        raise HTTPException(status_code=404, detail="arrived_on_support.png not found (did you run the sim?)")
    return FileResponse(p)

@router.get("/{epi_id}/t/{t}/support_mask.png")
def support_mask_png(epi_id: str, t: int):
    p = renders_t_dir(epi_id, t) / "support_mask.png"
    if not p.exists():
        raise HTTPException(status_code=404, detail="support_mask.png not found (did you run the sim?)")
    return FileResponse(p)


@router.get("/{epi_id}/legend/belief.png")
def belief_legend(epi_id: str):
    p = renders_dir(epi_id) / "legend_belief.png"
    if not p.exists():
        raise HTTPException(status_code=404, detail="legend not found")
    return FileResponse(p)

@router.get("/{epi_id}/legend/support_mask.png")
def support_mask_legend(epi_id: str):
    p = renders_dir(epi_id) / "legend_support_mask.png"
    if not p.exists():
        raise HTTPException(status_code=404, detail="legend not found")
    return FileResponse(p)

@router.get("/{epi_id}/legend/entropy.png")
def entropy_legend(epi_id: str):
    p = renders_dir(epi_id) / "legend_entropy.png"
    if not p.exists():
        raise HTTPException(status_code=404, detail="legend not found")
    return FileResponse(p)


@router.get("/{epi_id}/legend/delta_entropy.png")
def delta_entropy_legend(epi_id: str):
    p = renders_dir(epi_id) / "legend_delta_entropy.png"
    if not p.exists():
        raise HTTPException(status_code=404, detail="legend not found")
    return FileResponse(p)

@router.get("/{epi_id}/legend/delta_entropy_sign.png")
def delta_entropy_sign_legend(epi_id: str):
    p = renders_dir(epi_id) / "legend_delta_entropy_sign.png"
    if not p.exists():
        raise HTTPException(status_code=404, detail="legend not found")
    return FileResponse(p)

@router.get("/{epi_id}/legend/arrived_mask.png")
def arrived_mask_legend(epi_id: str):
    p = renders_dir(epi_id) / "legend_arrived_mask.png"
    if not p.exists():
        raise HTTPException(status_code=404, detail="legend not found")
    return FileResponse(p)


@router.delete("/{epi_id}")
def delete_run(
    epi_id: str,
    force: bool = Query(False, description="If true, delete even if dependent runs exist."),
) -> dict:
    # Warn if operational runs depend on this Belief Lab run.
    dependents: list[str] = []
    try:
        opr_ids = list_manifests("opr")
        for oid in opr_ids:
            try:
                om = load_manifest(oid)
            except Exception:
                continue
            if isinstance(om, dict) and str(om.get("epi_id", "")) == str(epi_id):
                dependents.append(str(oid))
    except Exception:
        dependents = dependents
    # Warn if any analysis studies (ana-*) reference this epistemic run.
    # This prevents breaking study artifacts unless the user explicitly forces deletion.
    ana_refs: list[str] = []
    try:
        ana_ids = list_manifests("ana")
        for aid in ana_ids:
            try:
                am = load_manifest(aid)
            except Exception:
                continue
            if not isinstance(am, dict):
                continue
            epi_ids = am.get("epi_ids", [])
            if isinstance(epi_ids, list) and any(str(x) == str(epi_id) for x in epi_ids):
                ana_refs.append(str(aid))
    except Exception:
        ana_refs = ana_refs


    if dependents and not bool(force):
        raise HTTPException(
            status_code=409,
            detail={
                "message": "Belief Lab run has dependent operational runs",
                "epi_id": epi_id,
                "dependents": dependents,
            },
        )
    if ana_refs and not bool(force):
        raise HTTPException(
            status_code=409,
            detail={
                "message": "Belief Lab run is referenced by analysis studies",
                "epi_id": epi_id,
                "referenced_by_ana": ana_refs,
            },
        )


    return delete_run_artifacts(epi_id)


__all__ = ["router"]
