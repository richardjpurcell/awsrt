# backend/awsrt_core/sim/weather.py
from __future__ import annotations

import numpy as np

from awsrt_core.schemas.physical import PhysicalManifest


def _smooth5(a: np.ndarray, iters: int) -> np.ndarray:
    """
    5-point neighborhood smoothing with edge replication (no torus wrap).
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


def _require_enabled(man: PhysicalManifest, kind: str) -> object:
    """
    Enforce canonical invariant:
      - Weather generators are only called when weather.enabled=True AND subfield.enabled=True.

    Returns the sub-config object (temperature or humidity).
    """
    weather = getattr(man, "weather", None)
    if weather is None or not bool(getattr(weather, "enabled", False)):
        raise ValueError(f"weather.enabled must be true to generate {kind}")

    if kind == "temperature":
        sub = getattr(weather, "temperature", None)
    elif kind == "humidity":
        sub = getattr(weather, "humidity", None)
    else:  # pragma: no cover
        raise ValueError(f"unknown weather kind: {kind}")

    if sub is None or not bool(getattr(sub, "enabled", False)):
        raise ValueError(f"weather.{kind}.enabled must be true to generate {kind}")

    return sub


def _ar1_drift(T: int, *, sigma: float, tau_steps: float, rng: np.random.Generator) -> np.ndarray:
    """
    Generate a global AR(1) drift sequence (float32) of length T:
      drift[t] = alpha*drift[t-1] + sqrt(1-alpha^2)*sigma*N(0,1)

    tau_steps controls correlation timescale (larger => slower changes).
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


def generate_temperature_c(man: PhysicalManifest) -> np.ndarray:
    """
    Generate temperature in Celsius as float32 [T,H,W].

    Pattern:
      - base_c: constant baseline
      - spatial_amp_c + spatial_smooth_iters: static spatial heterogeneity (smoothed noise)
      - if dynamic=True: add a global AR(1) drift over time (scalar per step)

    Canonical rule:
      - Raises if weather/temperature is disabled (or missing).
    """
    T, H, W = int(man.horizon_steps), int(man.grid.H), int(man.grid.W)

    temp = _require_enabled(man, "temperature")

    base_c = float(getattr(temp, "base_c", 20.0))
    dynamic = bool(getattr(temp, "dynamic", False))
    seed = int(getattr(temp, "seed", 123))

    spatial_amp_c = float(getattr(temp, "spatial_amp_c", 0.0))
    spatial_smooth_iters = int(getattr(temp, "spatial_smooth_iters", 0))
    temporal_sigma_c = float(getattr(temp, "temporal_sigma_c", 0.0))
    tau_steps = float(getattr(temp, "tau_steps", 8.0))

    rng = np.random.default_rng(seed)

    # Static spatial pattern
    if spatial_amp_c > 0.0:
        s = _smooth5(rng.standard_normal((H, W)), spatial_smooth_iters)
        eps = 1e-6
        s = s / (float(s.std()) + eps)
        spatial = (spatial_amp_c * s).astype(np.float32)
    else:
        spatial = np.zeros((H, W), dtype=np.float32)

    base = (base_c + spatial).astype(np.float32)

    # No temporal variation: broadcast base across time (fast, no Python loop)
    if not dynamic:
        return np.broadcast_to(base[None, :, :], (T, H, W)).astype(np.float32, copy=True)

    drift = _ar1_drift(T, sigma=temporal_sigma_c, tau_steps=tau_steps, rng=rng)
    return (base[None, :, :] + drift[:, None, None]).astype(np.float32, copy=False)


def generate_humidity_rh(man: PhysicalManifest) -> np.ndarray:
    """
    Generate relative humidity (0..1) as float32 [T,H,W].

    Pattern:
      - base_rh + static spatial heterogeneity
      - optional global AR(1) drift if dynamic=True
      - final field clipped to [0,1]

    Canonical rule:
      - Raises if weather/humidity is disabled (or missing).
    """
    T, H, W = int(man.horizon_steps), int(man.grid.H), int(man.grid.W)

    hum = _require_enabled(man, "humidity")

    base_rh = float(getattr(hum, "base_rh", 0.35))
    dynamic = bool(getattr(hum, "dynamic", False))
    seed = int(getattr(hum, "seed", 456))

    spatial_amp_rh = float(getattr(hum, "spatial_amp_rh", 0.0))
    spatial_smooth_iters = int(getattr(hum, "spatial_smooth_iters", 0))
    temporal_sigma_rh = float(getattr(hum, "temporal_sigma_rh", 0.0))
    tau_steps = float(getattr(hum, "tau_steps", 8.0))

    base_rh = float(np.clip(base_rh, 0.0, 1.0))

    rng = np.random.default_rng(seed)

    # Static spatial pattern
    if spatial_amp_rh > 0.0:
        s = _smooth5(rng.standard_normal((H, W)), spatial_smooth_iters)
        eps = 1e-6
        s = s / (float(s.std()) + eps)
        spatial = (spatial_amp_rh * s).astype(np.float32)
    else:
        spatial = np.zeros((H, W), dtype=np.float32)

    base = (base_rh + spatial).astype(np.float32)

    if not dynamic:
        out = np.broadcast_to(base[None, :, :], (T, H, W)).astype(np.float32, copy=True)
        return np.clip(out, 0.0, 1.0, out=out)

    drift = _ar1_drift(T, sigma=temporal_sigma_rh, tau_steps=tau_steps, rng=rng)
    out = (base[None, :, :] + drift[:, None, None]).astype(np.float32, copy=False)
    return np.clip(out, 0.0, 1.0, out=out)


__all__ = ["generate_temperature_c", "generate_humidity_rh"]
