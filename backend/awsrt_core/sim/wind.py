# backend/awsrt_core/sim/wind.py
from __future__ import annotations

import numpy as np

from awsrt_core.schemas.physical import PhysicalManifest


def _smooth5(a: np.ndarray, iters: int) -> np.ndarray:
    """
    5-point neighborhood smoothing with edge replication (no torus wrap).

    This is more physically natural for bounded wildfire grids than np.roll-based
    wraparound, which couples opposite edges of the domain.
    """
    a = np.asarray(a, dtype=np.float32)
    for _ in range(max(0, int(iters))):
        ap = np.pad(a, ((1, 1), (1, 1)), mode="edge")
        a = (
            ap[1:-1, 1:-1]
            + ap[:-2, 1:-1]
            + ap[2:, 1:-1]
            + ap[1:-1, :-2]
            + ap[1:-1, 2:]
        ) / 5.0
    return a


def _ar1_drift(T: int, *, sigma: float, tau_steps: float, rng: np.random.Generator) -> np.ndarray:
    """
    Global AR(1) drift sequence (float32) of length T:
      drift[t] = alpha*drift[t-1] + sqrt(1-alpha^2)*sigma*N(0,1)
    """
    T = int(T)
    if T <= 0:
        return np.zeros((0,), dtype=np.float32)

    sigma = float(max(0.0, sigma))
    tau_steps = float(max(1e-6, tau_steps))

    alpha = float(np.exp(-1.0 / tau_steps))
    noise_scale = float(np.sqrt(max(0.0, 1.0 - alpha * alpha)))

    drift = np.zeros(T, dtype=np.float32)
    if T == 1 or sigma == 0.0:
        return drift

    for t in range(1, T):
        drift[t] = alpha * drift[t - 1] + noise_scale * sigma * float(rng.standard_normal())

    return drift


def generate_wind_uv(man: PhysicalManifest, terrain: np.ndarray | None = None) -> tuple[np.ndarray, np.ndarray]:
    """
    Generate wind u,v fields as float32 [T,H,W].

    Canonical behavior:
      - Always returns arrays shaped [T,H,W] (wind is required by the fire model).
      - If wind.enabled is false: returns zeros.
      - If wind.enabled is true and dynamic is false: returns constant u0/v0.
      - If wind.dynamic is true: returns (u0,v0) + spatial heterogeneity + optional terrain downslope bias + global AR(1) drift.

    Notes:
      - Spatial smoothing uses edge replication (no torus boundary wrap).
      - Terrain bias direction is downslope (-grad(terrain)), normalized, then scaled by terrain_gain (m/s).
      - Deterministic given wind.seed.
    """
    T, H, W = int(man.horizon_steps), int(man.grid.H), int(man.grid.W)

    wind = getattr(man, "wind", None)
    enabled = bool(wind is not None and bool(getattr(wind, "enabled", False)))

    # Wind disabled => canonical zeros (still [T,H,W])
    if not enabled:
        u = np.zeros((T, H, W), dtype=np.float32)
        v = np.zeros((T, H, W), dtype=np.float32)
        return u, v

    u0 = float(getattr(wind, "u", 0.0))
    v0 = float(getattr(wind, "v", 0.0))

    dynamic = bool(getattr(wind, "dynamic", False))
    if not dynamic:
        u = np.full((T, H, W), u0, dtype=np.float32)
        v = np.full((T, H, W), v0, dtype=np.float32)
        return u, v

    rng = np.random.default_rng(int(getattr(wind, "seed", 0)))

    # --- Static spatial heterogeneity (du_static, dv_static) ---
    spatial_amp = float(getattr(wind, "spatial_amp", 0.0))
    smooth_iters = int(getattr(wind, "spatial_smooth_iters", 6))

    if spatial_amp > 0.0:
        du = _smooth5(rng.standard_normal((H, W)), smooth_iters)
        dv = _smooth5(rng.standard_normal((H, W)), smooth_iters)
        eps = 1e-6
        du = du / (float(du.std()) + eps)
        dv = dv / (float(dv.std()) + eps)
        du_static = (spatial_amp * du).astype(np.float32, copy=False)
        dv_static = (spatial_amp * dv).astype(np.float32, copy=False)
    else:
        du_static = np.zeros((H, W), dtype=np.float32)
        dv_static = np.zeros((H, W), dtype=np.float32)

    # --- Terrain-coupled component (downslope direction, scaled to terrain_gain m/s) ---
    terrain_gain = float(getattr(wind, "terrain_gain", 0.0))
    if terrain_gain > 0.0 and terrain is not None:
        terrain = np.asarray(terrain, dtype=np.float32)
        if terrain.shape != (H, W):
            raise ValueError(f"terrain must have shape (H,W)=({H},{W}); got {terrain.shape}")

        # Gradient in grid coordinates: gr=d/drow, gc=d/dcol
        terr = np.nan_to_num(terrain, nan=0.0, posinf=0.0, neginf=0.0)
        gr, gc = np.gradient(terr)

        # Downslope direction = -grad
        bias_u = (-gc).astype(np.float32, copy=False)  # x/col component
        bias_v = (-gr).astype(np.float32, copy=False)  # y/row component
        mag = np.sqrt(bias_u * bias_u + bias_v * bias_v).astype(np.float32, copy=False)

        mask = mag > 1e-6
        bias_u = np.where(mask, bias_u / mag, 0.0).astype(np.float32, copy=False)
        bias_v = np.where(mask, bias_v / mag, 0.0).astype(np.float32, copy=False)

        bias_u *= terrain_gain
        bias_v *= terrain_gain
    else:
        bias_u = np.zeros((H, W), dtype=np.float32)
        bias_v = np.zeros((H, W), dtype=np.float32)

    # --- Temporal global drift (AR(1)) ---
    temporal_sigma = float(getattr(wind, "temporal_sigma", 0.25))
    tau_steps = float(getattr(wind, "tau_steps", 6.0))

    drift_u = _ar1_drift(T, sigma=temporal_sigma, tau_steps=tau_steps, rng=rng)
    drift_v = _ar1_drift(T, sigma=temporal_sigma, tau_steps=tau_steps, rng=rng)

    # Compose final fields (vectorized)
    base_u = (u0 + du_static + bias_u).astype(np.float32, copy=False)  # [H,W]
    base_v = (v0 + dv_static + bias_v).astype(np.float32, copy=False)  # [H,W]

    u = (base_u[None, :, :] + drift_u[:, None, None]).astype(np.float32, copy=False)
    v = (base_v[None, :, :] + drift_v[:, None, None]).astype(np.float32, copy=False)

    return u, v


__all__ = ["generate_wind_uv"]
