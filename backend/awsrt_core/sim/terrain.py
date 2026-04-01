# backend/awsrt_core/sim/terrain.py
from __future__ import annotations

import numpy as np

from awsrt_core.schemas.physical import PhysicalManifest


def _smooth5(a: np.ndarray, iters: int) -> np.ndarray:
    """
    5-point stencil smoothing with edge replication (no torus wrap).
    Deterministic and fast; suitable for bounded synthetic terrain fields.
    """
    a = np.asarray(a, dtype=np.float32)
    iters = max(0, int(iters))
    for _ in range(iters):
        ap = np.pad(a, ((1, 1), (1, 1)), mode="edge")
        a = (
            ap[1:-1, 1:-1]
            + ap[:-2, 1:-1]
            + ap[2:, 1:-1]
            + ap[1:-1, :-2]
            + ap[1:-1, 2:]
        ) * (1.0 / 5.0)
    return a


def generate_terrain(man: PhysicalManifest) -> np.ndarray:
    """
    Generate terrain elevation as float32 [H,W].

    Canonical behavior (no backward compatibility):
      - If terrain.enabled is false: returns zeros (still a valid [H,W] field).
      - Else: smoothed Gaussian noise normalized to [0,1], then scaled by amplitude.
      - Deterministic given terrain.seed.
    """
    H, W = int(man.grid.H), int(man.grid.W)

    terr = getattr(man, "terrain", None)
    enabled = bool(terr is not None and bool(getattr(terr, "enabled", False)))
    if not enabled:
        return np.zeros((H, W), dtype=np.float32)

    seed = int(getattr(terr, "seed", 0))
    smooth_iters = int(getattr(terr, "smooth_iters", 0))
    amp = float(getattr(terr, "amplitude", 0.0))

    if not np.isfinite(amp) or amp <= 0.0:
        return np.zeros((H, W), dtype=np.float32)

    rng = np.random.default_rng(seed)
    a = rng.standard_normal((H, W)).astype(np.float32)

    a = _smooth5(a, smooth_iters)

    # normalize to [0,1] robustly
    mn = float(np.nanmin(a))
    mx = float(np.nanmax(a))
    span = mx - mn
    if not np.isfinite(span) or span <= 1e-9:
        return np.zeros((H, W), dtype=np.float32)

    a = (a - mn) * (1.0 / span)
    a = (a * amp).astype(np.float32)
    return a


__all__ = ["generate_terrain"]
