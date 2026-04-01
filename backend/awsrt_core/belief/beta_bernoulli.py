from __future__ import annotations

import numpy as np


def prior_alpha_beta(prior_p: float) -> tuple[float, float]:
    # A light, symmetric-ish prior centered on prior_p.
    # (You can replace this with a calibrated prior later.)
    strength = 2.0
    a = prior_p * strength
    b = (1.0 - prior_p) * strength
    return float(a), float(b)


def apply_observation_noise(
    truth01: np.ndarray,
    *,
    false_pos: float,
    false_neg: float,
    rng: np.random.Generator,
) -> np.ndarray:
    truth = truth01.astype(np.uint8)
    obs = truth.copy()
    # flip 0->1 with false_pos
    fp = (truth == 0) & (rng.random(truth.shape) < false_pos)
    obs[fp] = 1
    # flip 1->0 with false_neg
    fn = (truth == 1) & (rng.random(truth.shape) < false_neg)
    obs[fn] = 0
    return obs


def beta_filter_over_time(
    truth_T: np.ndarray,  # (T,H,W) uint8
    *,
    prior_p: float,
    decay: float,
    false_pos: float,
    false_neg: float,
    seed: int,
) -> tuple[np.ndarray, np.ndarray]:
    rng = np.random.default_rng(seed)
    T, H, W = truth_T.shape
    a0, b0 = prior_alpha_beta(prior_p)

    alpha = np.full((H, W), a0, dtype=np.float32)
    beta = np.full((H, W), b0, dtype=np.float32)

    belief = np.zeros((T, H, W), dtype=np.float32)
    # store entropy-ready Bernoulli p, not raw alpha/beta.
    for t in range(T):
        truth = truth_T[t]
        obs = apply_observation_noise(truth, false_pos=false_pos, false_neg=false_neg, rng=rng)
        # decay towards prior (1.0 => reset each step)
        if decay > 0:
            alpha = (1.0 - decay) * alpha + decay * a0
            beta = (1.0 - decay) * beta + decay * b0
        alpha = alpha + obs.astype(np.float32)
        beta = beta + (1.0 - obs.astype(np.float32))
        p = alpha / (alpha + beta)
        belief[t] = p
    return belief, np.stack([np.full((H, W), a0, dtype=np.float32), np.full((H, W), b0, dtype=np.float32)])


def shannon_entropy_bernoulli(p: np.ndarray, *, units: str = "bits") -> np.ndarray:
    p = np.clip(p.astype(np.float32), 1e-6, 1.0 - 1e-6)
    h = -(p * np.log(p) + (1.0 - p) * np.log(1.0 - p))
    if units == "bits":
        h = h / np.log(2.0)
    return h.astype(np.float32)
