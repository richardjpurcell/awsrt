# awsrt_core/epistemic/option_a.py
from __future__ import annotations

from dataclasses import dataclass
import numpy as np

from awsrt_core.belief.beta_bernoulli import (
    prior_alpha_beta,
    apply_observation_noise,
    shannon_entropy_bernoulli,
)


@dataclass
class EpistemicOptionAOutput:
    # Per-cell belief-lab state
    belief: np.ndarray            # (T,H,W) float32
    entropy: np.ndarray           # (T,H,W) float32
    delta_entropy: np.ndarray     # (T,H,W) float32, delta[t]=entropy[t]-entropy[t-1], delta[0]=0

    # Support + impairment observables
    support_mask: np.ndarray      # (T,H,W) uint8   attempted support at time t
    arrived_mask: np.ndarray      # (T,H,W) uint8   arrivals applied at time t
    lost_mask: np.ndarray         # (T,H,W) uint8   attempted support at time t but lost
    delay_steps: np.ndarray       # (T,H,W) int16   realized delay for support attempts at time t (-1 if lost)


    # Global time-series (publication/MDC-facing)
    arrived_info_proxy: np.ndarray    # (T,) float32  sum positive entropy drop on arrived cells at t
    arrival_frac: np.ndarray          # (T,) float32  mean(arrived_mask[t]) over grid

    mean_entropy: np.ndarray          # (T,) float32  mean(entropy[t]) over grid
    delta_mean_entropy: np.ndarray    # (T,) float32  delta_mean[t]=meanH[t]-meanH[t-1], delta_mean[0]=0
    mdc_flag: np.ndarray              # (T,) uint8    1 if delta_mean_entropy[t] <= -eps for t>=1 else 0; mdc_flag[0]=0
    eps: float                        # scalar threshold used for mdc_flag

    # Residual diagnostics (always computed so UI dropdown works)
    residual_support: np.ndarray      # (T,) float32  r_a(t) = ΔH̄(t) + c_a * a(t)
    residual_arrived_info: np.ndarray # (T,) float32  r_I(t) = ΔH̄(t) + c_I * Ĩ(t)
    c_arrival: float                  # scaling used for residual_arrival
    c_info: float                     # scaling used for residual_info

    # Manifest-owned parameters (echoed back for provenance)
    residual_driver: str              # e.g. "arrival_frac" or "delivered_info_proxy"
    residual_c: float                 # if nonzero, used as c_*; otherwise autoscaled


def _choose_support_mask(
    H: int,
    W: int,
    *,
    model: str,
    m: int,
    rng: np.random.Generator,
    fixed_mask: np.ndarray | None = None,
) -> np.ndarray:
    if m <= 0:
        return np.zeros((H, W), dtype=np.uint8)

    if model == "fixed_support_mask":
        if fixed_mask is None:
            raise ValueError("fixed_mask is required for model='fixed_support_mask'")
        mask = (fixed_mask.astype(bool)).astype(np.uint8)
        return mask

    # random_support: choose m distinct cells uniformly
    N = H * W
    m_eff = min(int(m), N)
    idx = rng.choice(N, size=m_eff, replace=False)
    mask = np.zeros(N, dtype=np.uint8)
    mask[idx] = 1
    return mask.reshape(H, W)


def _robust_scale(delta: np.ndarray, driver: np.ndarray) -> float:
    """
    Robust scale match:
      c = median(|Δ|) / (median(|driver|) + tiny)

    Keeps c*driver comparable to Δ in magnitude across regimes.
    """
    tiny = 1e-12
    d = np.asarray(delta, dtype=np.float32)
    x = np.asarray(driver, dtype=np.float32)
    if d.ndim != 1 or x.ndim != 1 or len(d) == 0 or len(x) == 0:
        return 0.0

    # Ignore t=0 padding if present
    d_use = d[1:] if len(d) > 1 else d
    x_use = x[1:] if len(x) > 1 else x

    d_use = d_use[np.isfinite(d_use)]
    x_use = x_use[np.isfinite(x_use)]

    if d_use.size == 0 or x_use.size == 0:
        return 0.0

    md = float(np.median(np.abs(d_use)))
    mx = float(np.median(np.abs(x_use)))

    if md <= tiny or mx <= tiny:
        return 0.0
    return md / (mx + tiny)


def run_epistemic_option_a(
    truth_T: np.ndarray,  # (T,H,W) uint8 fire_state or binary fire presence
    *,
    prior_p: float,
    decay: float,
    false_pos: float,
    false_neg: float,
    action_model: str,
    action_m: int,
    action_seed: int,
    loss_prob: float,
    delay_geom_p: float,
    max_delay_steps: int,
    entropy_units: str = "bits",
    fixed_mask: np.ndarray | None = None,
    eps: float = 1e-6,
    residual_driver: str = "arrival_frac",
    residual_c: float = 0.0,
) -> EpistemicOptionAOutput:
    """
    Option A belief-lab loop:
      - support chooses a set of cells each step (mask)
      - impairment adds independent loss + geometric delay
      - arrivals at time t are applied to Beta-Bernoulli belief
      - entropy + global series are recorded for MDC diagnostics

    eps:
      Threshold for "minimum decrease" on global mean entropy:
        mdc_flag[t] = 1 iff delta_mean_entropy[t] <= -eps  (t>=1)

    residuals:
      r_a(t) = ΔH̄(t) + c_a * a(t)
      r_I(t) = ΔH̄(t) + c_I * Ĩ(t)

      If residual_c != 0, then c_a = c_I = residual_c (manifest-owned explicit scaling).
      Otherwise, c_a and c_I are chosen via robust autoscale.
    """
    # Treat any positive fire_state as "fire present".
    truth01 = (truth_T > 0).astype(np.uint8)

    T, H, W = truth01.shape
    rng = np.random.default_rng(action_seed)

    a0, b0 = prior_alpha_beta(float(prior_p))
    alpha = np.full((H, W), a0, dtype=np.float32)
    beta = np.full((H, W), b0, dtype=np.float32)

    belief = np.zeros((T, H, W), dtype=np.float32)
    entropy = np.zeros((T, H, W), dtype=np.float32)
    delta_entropy = np.zeros((T, H, W), dtype=np.float32)

    support_mask = np.zeros((T, H, W), dtype=np.uint8)
    arrived_mask = np.zeros((T, H, W), dtype=np.uint8)
    lost_mask = np.zeros((T, H, W), dtype=np.uint8)
    delay_steps = np.full((T, H, W), -1, dtype=np.int16)

    arrived_info_proxy = np.zeros((T,), dtype=np.float32)
    arrival_frac = np.zeros((T,), dtype=np.float32)

    mean_entropy = np.zeros((T,), dtype=np.float32)
    delta_mean_entropy = np.zeros((T,), dtype=np.float32)
    mdc_flag = np.zeros((T,), dtype=np.uint8)

    # Delay queue: for each arrival time ta, store obs + mask
    queued_obs = np.zeros((T, H, W), dtype=np.uint8)
    queued_has = np.zeros((T, H, W), dtype=np.uint8)

    eps_f = float(eps)

    for t in range(T):
        # --- support ---
        sm = _choose_support_mask(H, W, model=action_model, m=action_m, rng=rng, fixed_mask=fixed_mask)
        support_mask[t] = sm

        # --- generate raw observations for supported cells only ---
        obs_full = apply_observation_noise(truth01[t], false_pos=false_pos, false_neg=false_neg, rng=rng)
        attempted = sm.astype(bool)

        # --- loss ---
        if loss_prob > 0:
            lost = attempted & (rng.random((H, W)) < float(loss_prob))
        else:
            lost = np.zeros((H, W), dtype=bool)
        lost_mask[t] = lost.astype(np.uint8)

        # --- delays (sampled for supported & not lost) ---
        dmap = np.full((H, W), -1, dtype=np.int16)
        active = attempted & (~lost)
        if np.any(active):
            u = rng.random((H, W))
            if max_delay_steps <= 0 or float(delay_geom_p) >= 1.0:
                d = np.zeros((H, W), dtype=np.int16)
            else:
                p = float(delay_geom_p)
                q = 1.0 - p
                # geometric on {0,1,2,...} via inverse CDF
                d = np.floor(np.log(1.0 - u + 1e-12) / np.log(q + 1e-12)).astype(np.int16)
                d = np.clip(d, 0, int(max_delay_steps)).astype(np.int16)
            dmap[active] = d[active]
        delay_steps[t] = dmap

        # --- schedule arrivals (arrivals occur at ta = t + d) ---
        if np.any(active):
            rr, cc = np.nonzero(active)
            for r, c in zip(rr.tolist(), cc.tolist()):
                d = int(dmap[r, c])
                ta = t + d
                if 0 <= ta < T:
                    queued_obs[ta, r, c] = int(obs_full[r, c])
                    queued_has[ta, r, c] = 1

        # --- predict/decay before applying arrivals at time t ---
        if decay > 0:
            alpha = (1.0 - float(decay)) * alpha + float(decay) * a0
            beta = (1.0 - float(decay)) * beta + float(decay) * b0

        # entropy before update (for delivered_info_proxy accounting)
        p_prior = alpha / (alpha + beta)
        h_prior = shannon_entropy_bernoulli(p_prior, units=entropy_units)

        # --- update using arrivals that occur NOW (not attempts now) ---
        has = queued_has[t].astype(bool)
        arrived_mask[t] = queued_has[t]
        arrival_frac[t] = float(queued_has[t].mean())

        if np.any(has):
            obs_now = queued_obs[t].astype(np.float32)
            alpha[has] = alpha[has] + obs_now[has]
            beta[has] = beta[has] + (1.0 - obs_now[has])

        p_post = alpha / (alpha + beta)
        belief[t] = p_post.astype(np.float32, copy=False)

        h_post = shannon_entropy_bernoulli(p_post, units=entropy_units)
        entropy[t] = h_post.astype(np.float32, copy=False)

        if t > 0:
            delta_entropy[t] = entropy[t] - entropy[t - 1]
        else:
            delta_entropy[t] = 0.0

        # arrived info proxy = sum positive entropy drops on arrived cells at time t
        if np.any(has):
            dh = (h_prior - h_post)
            arrived_info_proxy[t] = float(np.maximum(dh[has], 0.0).sum())
        else:
            arrived_info_proxy[t] = 0.0

        # --- global series for MDC ---
        mean_entropy[t] = float(entropy[t].mean())
        if t > 0:
            delta_mean_entropy[t] = float(mean_entropy[t] - mean_entropy[t - 1])
            mdc_flag[t] = 1 if delta_mean_entropy[t] <= -eps_f else 0
        else:
            delta_mean_entropy[t] = 0.0
            mdc_flag[t] = 0

    # ----------------------------
    # Residual diagnostics
    # ----------------------------
    dH = delta_mean_entropy.astype(np.float32, copy=False)
    a = arrival_frac.astype(np.float32, copy=False)
    I = arrived_info_proxy.astype(np.float32, copy=False)

    rc = float(residual_c) if residual_c is not None else 0.0
    if abs(rc) > 0.0:
        c_arrival = rc
        c_info = rc
    else:
        c_arrival = _robust_scale(dH, a)
        c_info = _robust_scale(dH, I)

    residual_support = (dH + float(c_arrival) * a).astype(np.float32, copy=False)
    residual_arrived_info = (dH + float(c_info) * I).astype(np.float32, copy=False)

    return EpistemicOptionAOutput(
        belief=belief,
        entropy=entropy,
        delta_entropy=delta_entropy,
        support_mask=support_mask,
        arrived_mask=arrived_mask,
        lost_mask=lost_mask,
        delay_steps=delay_steps,
        arrived_info_proxy=arrived_info_proxy,
        arrival_frac=arrival_frac,
        mean_entropy=mean_entropy,
        delta_mean_entropy=delta_mean_entropy,
        mdc_flag=mdc_flag,
        eps=eps_f,
        residual_support=residual_support,
        residual_arrived_info=residual_arrived_info,
        c_arrival=float(c_arrival),
        c_info=float(c_info),
        residual_driver=str(residual_driver),
        residual_c=float(rc),
    )
