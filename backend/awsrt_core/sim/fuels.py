# backend/awsrt_core/sim/fuels.py
from __future__ import annotations

import numpy as np

from awsrt_core.schemas.physical import PhysicalManifest

# --- Fuels (FBP categorical) ---

FUEL_CODE_TO_ID: dict[str, int] = {
    "NONE": 0,
    "C2": 1,
    "C3": 2,
    "M1": 3,
    "D1": 4,
    "S1": 5,
    "O1A": 6,
    "O1B": 7,
}

DEFAULT_SPREAD_MULT: dict[str, float] = {
    "C2": 1.75,
    "C3": 1.45,
    "M1": 1.00,
    "D1": 0.30,
    "S1": 1.15,
    "O1A": 0.75,
    "O1B": 0.75,
}

DEFAULT_BURN_MULT: dict[str, float] = {
    "C2": 1.45,
    "C3": 1.25,
    "M1": 1.00,
    "D1": 0.55,
    "S1": 1.00,
    "O1A": 0.82,
    "O1B": 0.82,
}

# terrain bias (positive => prefers higher elevation)
DEFAULT_TERRAIN_BIAS: dict[str, float] = {
    "C2": +0.25,
    "C3": +0.20,
    "M1": 0.00,
    "D1": -0.25,
    "S1": +0.10,
    "O1A": 0.00,
    "O1B": 0.00,
}


def _normalize_terrain01(terr: np.ndarray) -> np.ndarray:
    terr = np.asarray(terr, dtype=np.float32)
    finite = np.isfinite(terr)
    if not finite.any():
        return np.zeros_like(terr, dtype=np.float32)
    tmin = float(np.nanmin(terr[finite]))
    tmax = float(np.nanmax(terr[finite]))
    if not np.isfinite(tmin) or not np.isfinite(tmax) or tmax <= tmin:
        return np.zeros_like(terr, dtype=np.float32)
    out = (terr - tmin) / (tmax - tmin)
    return np.clip(out, 0.0, 1.0).astype(np.float32, copy=False)


def _smooth5_scores(scores: np.ndarray, iters: int) -> np.ndarray:
    """
    Smooth KxHxW score volumes with a 5-point stencil using edge replication.
    This avoids torus-style wraparound artifacts across opposite map edges.
    """
    scores = np.asarray(scores, dtype=np.float32)
    iters = max(0, int(iters))
    for _ in range(iters):
        sp = np.pad(scores, ((0, 0), (1, 1), (1, 1)), mode="edge")
        scores = (
            sp[:, 1:-1, 1:-1]
            + sp[:, :-2, 1:-1]
            + sp[:, 2:, 1:-1]
            + sp[:, 1:-1, :-2]
            + sp[:, 1:-1, 2:]
        ) * (1.0 / 5.0)
    return scores

def _zscore_scores(scores: np.ndarray) -> np.ndarray:
    """
    Normalize each category score field to comparable scale so one raw random field
    does not dominate purely because of variance differences after smoothing.
    """
    scores = np.asarray(scores, dtype=np.float32)
    mu = scores.mean(axis=(-2, -1), keepdims=True)
    sd = scores.std(axis=(-2, -1), keepdims=True)
    sd = np.where(sd > 1e-6, sd, 1.0).astype(np.float32, copy=False)
    return ((scores - mu) / sd).astype(np.float32, copy=False)


def _sharpen_scores(scores: np.ndarray, gamma: float = 1.35) -> np.ndarray:
    """
    Increase category separation cell-by-cell after smoothing.
    This makes patch regions read more clearly in categorical renders.
    """
    scores = np.asarray(scores, dtype=np.float32)
    mean = scores.mean(axis=0, keepdims=True)
    return (mean + (scores - mean) * float(gamma)).astype(np.float32, copy=False)

def generate_fuels(man: PhysicalManifest, terrain: np.ndarray) -> np.ndarray:
    """
    Generate a categorical fuels map as uint8 [H,W].

    Canonical behavior:
      - If fuels missing/disabled: return zeros (still valid data), but the orchestrator decides
        whether to STORE the fuels dataset.
      - If dominant_codes is empty: return zeros.
      - Weights are aligned to codes and normalized.
      - Produces contiguous "blob" regions via smoothing iterations.
      - Optionally correlates with terrain via terrain_correlation.

    Deterministic given fuels.seed (+ terrain input).
    """
    H, W = int(man.grid.H), int(man.grid.W)

    terr = np.asarray(terrain, dtype=np.float32)
    if terr.shape != (H, W):
        raise ValueError(f"terrain must have shape (H,W)=({H},{W}); got {terr.shape}")

    fuels_cfg = getattr(man, "fuels", None)
    enabled = bool(fuels_cfg is not None and bool(getattr(fuels_cfg, "enabled", False)))
    if not enabled:
        return np.zeros((H, W), dtype=np.uint8)

    seed = int(getattr(fuels_cfg, "seed", 0))
    rng = np.random.default_rng(seed)

    # Codes
    raw_codes = list(getattr(fuels_cfg, "dominant_codes", []) or [])
    codes = [str(c).strip().upper() for c in raw_codes if str(c).strip()]
    if not codes:
        return np.zeros((H, W), dtype=np.uint8)

    # Weights (align to codes, sanitize)
    raw_w = list(getattr(fuels_cfg, "dominant_weights", []) or [])
    weights = np.array([float(x) for x in raw_w], dtype=np.float32)

    K = len(codes)
    if weights.size < K:
        if weights.size == 0:
            weights = np.ones(K, dtype=np.float32)
        else:
            fill = float(np.nanmean(weights)) if np.isfinite(weights).any() else 1.0
            pad = np.full((K - weights.size,), fill, dtype=np.float32)
            weights = np.concatenate([weights, pad], axis=0)
    elif weights.size > K:
        weights = weights[:K]

    # Replace non-finite and negatives
    weights = np.where(np.isfinite(weights) & (weights > 0.0), weights, 0.0).astype(np.float32, copy=False)

    ws = float(weights.sum())
    if not np.isfinite(ws) or ws <= 1e-9:
        weights = np.full((K,), 1.0 / float(K), dtype=np.float32)
    else:
        weights = weights / ws

    terr01 = _normalize_terrain01(terr)

    # Only allow terrain correlation to influence category scores when terrain
    # actually has spatial variation. Otherwise a flat terrain field would act
    # like a global prior offset rather than a spatial correlation mechanism.
    terr_has_variation = bool(np.isfinite(terr).any() and float(np.nanmax(terr) - np.nanmin(terr)) > 1e-9)
    if not terr_has_variation:
        terr01 = np.zeros_like(terr01, dtype=np.float32)

    # Base random scores -> smooth for blobs
    scores = rng.standard_normal((K, H, W)).astype(np.float32)
    patch_iters = int(getattr(fuels_cfg, "patch_iters", 0))
    # Push fuels patches a bit coarser than the raw knob value so diagnostic
    # presets read more clearly in the visualizer.
    effective_patch_iters = max(0, int(round(patch_iters * 1.8)))
    scores = _smooth5_scores(scores, effective_patch_iters)
    scores = _zscore_scores(scores)
    scores = _sharpen_scores(scores, gamma=1.6)

    # Add weight prior (log-space) + terrain bias
    terr_strength = float(getattr(fuels_cfg, "terrain_correlation", 0.0))
    if not np.isfinite(terr_strength):
        terr_strength = 0.0

    # Keep terr_strength in a sensible range (schema may already bound it, but be defensive)
    terr_strength = float(np.clip(terr_strength, 0.0, 1.0))

    for i, code in enumerate(codes):
        wi = float(weights[i])
        # Slightly stronger than plain log-weighting so configured dominant classes
        # remain visible after smoothing, but not so strong that the map collapses
        # into a single class.
        scores[i] += 1.5 * float(np.log(max(wi, 1e-9)))

        bias = float(DEFAULT_TERRAIN_BIAS.get(code, 0.0))
        if terr_has_variation and np.isfinite(bias) and terr_strength > 0.0 and bias != 0.0:
            # centered terrain in [-0.5,0.5], scaled to ~[-2,2] then multiplied by bias
            scores[i] += terr_strength * bias * (terr01 - 0.5) * 4.0

    choice = np.argmax(scores, axis=0)  # [H,W] in 0..K-1

    fuels = np.zeros((H, W), dtype=np.uint8)
    for i, code in enumerate(codes):
        fid = int(FUEL_CODE_TO_ID.get(code, 0))
        fid = max(0, min(255, fid))
        fuels[choice == i] = np.uint8(fid)

    return fuels


__all__ = [
    "FUEL_CODE_TO_ID",
    "DEFAULT_SPREAD_MULT",
    "DEFAULT_BURN_MULT",
    "DEFAULT_TERRAIN_BIAS",
    "generate_fuels",
]
