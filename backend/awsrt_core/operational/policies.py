from __future__ import annotations

from typing import Any, Optional
import numpy as np

from awsrt_core.operational.sensors import (
    footprint_flat_indices,
    footprint_mask,
    mask_frac,
    entropy_mass_in_mask,
)

# -----------------------------------------------------------------------------
# Lightweight backend debug for uncertainty-score decomposition.
#
# Purpose:
#   The recent regime/frontier debugging suggests the frontier path is wired,
#   but may be numerically too weak relative to the base uncertainty score.
#   We therefore keep a tiny "last call" debug snapshot so the operational
#   runner can inspect what compute_score_map() actually produced.
#
# Notes:
#   - This is intentionally process-local and lightweight.
#   - It records only summary statistics for the most recent uncertainty-policy
#     score-map computation.
#   - Router code can import get_uncertainty_score_debug_snapshot() after a
#     score-map call and persist selected fields into step_metrics / summary.
# -----------------------------------------------------------------------------
_LAST_UNCERTAINTY_SCORE_DEBUG: dict[str, Any] = {}


def reset_uncertainty_score_debug_snapshot() -> None:
    """
    Clear the most recent uncertainty-score debug snapshot.
    """
    global _LAST_UNCERTAINTY_SCORE_DEBUG
    _LAST_UNCERTAINTY_SCORE_DEBUG = {}


def get_uncertainty_score_debug_snapshot() -> dict[str, Any]:
    """
    Return a shallow copy of the latest uncertainty-score debug snapshot.
    """
    return dict(_LAST_UNCERTAINTY_SCORE_DEBUG)


def _stats_dict(x: np.ndarray) -> dict[str, float]:
    """
    Compact numeric summary for a score component.
    """
    arr = np.asarray(x, dtype=np.float32)
    if arr.size == 0:
        return {
            "mean": 0.0,
            "max": 0.0,
            "min": 0.0,
            "sum": 0.0,
            "nonzero_frac": 0.0,
        }
    return {
        "mean": float(np.mean(arr)),
        "max": float(np.max(arr)),
        "min": float(np.min(arr)),
        "sum": float(np.sum(arr)),
        "nonzero_frac": float(np.mean((arr != 0).astype(np.float32))),
    }


def _update_uncertainty_score_debug_snapshot(
    *,
    variance: np.ndarray,
    variance_term: np.ndarray,
    novelty: np.ndarray,
    entropy_bonus: np.ndarray,
    frontier: np.ndarray,
    frontier_add: np.ndarray,
    score: np.ndarray,
    frontier_enabled: bool,
    frontier_weight: float,
    gamma: float,
    beta: float,
    lam: float,
) -> None:
    global _LAST_UNCERTAINTY_SCORE_DEBUG
    _LAST_UNCERTAINTY_SCORE_DEBUG = {
        "frontier_enabled": bool(frontier_enabled),
        "frontier_weight": float(frontier_weight),
        "uncertainty_gamma": float(gamma),
        "uncertainty_beta": float(beta),
        "uncertainty_lambda": float(lam),
        "variance": _stats_dict(variance),
        "variance_term": _stats_dict(variance_term),
        "novelty": _stats_dict(novelty),
        "entropy_bonus": _stats_dict(entropy_bonus),
        "frontier": _stats_dict(frontier),
        "frontier_add": _stats_dict(frontier_add),
        "score": _stats_dict(score),
    }


def _tie_break_shuffle(rcs: np.ndarray, rng: np.random.Generator) -> np.ndarray:
    """
    Shuffle candidate coordinates in-place order, used for stochastic tie-breaking.
    """
    idx = np.arange(rcs.shape[0])
    rng.shuffle(idx)
    return rcs[idx]


def topk_with_separation(
    score: np.ndarray,  # (H,W)
    k: int,
    *,
    min_sep_cells: float = 0.0,
    deterministic: bool = True,
    rng: np.random.Generator,
) -> np.ndarray:
    """
    Select top-k (row,col) points from a score map, enforcing minimum separation.

    - deterministic=True: stable arg-sort on the raw score.
    - deterministic=False: add tiny noise to score for tie-breaking before sorting.

    Notes:
      * This is greedy and not globally optimal under separation constraints, but is
        simple and matches v0 needs.
      * Returns shape (k,2) unless there are insufficient feasible points, in which
        case it returns as many as it can find (>=0).
    """
    if score.ndim != 2:
        raise ValueError(f"score must be 2D (H,W); got shape={score.shape}")

    H, W = score.shape
    k = int(k)
    if k <= 0:
        return np.zeros((0, 2), dtype=np.int32)

    score2 = score
    if not deterministic:
        # For stochastic tie-break: perturb scores with tiny noise before sorting.
        # (This is more faithful than shuffling indices after sorting.)
        score2 = score + 1e-9 * rng.random(score.shape)

    flat_idx = np.argsort(score2.reshape(-1))[::-1]  # descending
    rcs = np.stack([flat_idx // W, flat_idx % W], axis=1).astype(np.int32)

    # Fast path: no separation constraint
    if float(min_sep_cells) <= 0.0:
        rcs_k = rcs[:k]
        if rcs_k.shape[0] < k:
            return rcs_k.astype(np.int32)
        return rcs_k.astype(np.int32)

    # Greedy separation filter
    chosen: list[tuple[int, int]] = []
    min2 = float(min_sep_cells) ** 2
    for r, c in rcs:
        ok = True
        for rr, cc in chosen:
            if (int(r) - int(rr)) ** 2 + (int(c) - int(cc)) ** 2 < min2:
                ok = False
                break
        if ok:
            chosen.append((int(r), int(c)))
            if len(chosen) >= k:
                break

    return np.array(chosen, dtype=np.int32)


def compute_score_map(
    belief: np.ndarray,
    entropy: np.ndarray,
    policy: str,
    *,
    uncertainty_memory: Optional[np.ndarray] = None,
    uncertainty_gamma: float = 6.0,
    uncertainty_beta: float = 2.0,
    uncertainty_lambda: float = 0.15,
    uncertainty_frontier: Optional[np.ndarray] = None,
    uncertainty_frontier_enabled: bool = False,
    uncertainty_frontier_weight: float = 0.0,
) -> np.ndarray:
    """
    Map-based operational policy scoring.

    Policy names:
      - greedy:        maximize belief
      - uncertainty:   maximize posterior variance * novelty + entropy bonus
      - balance:       maximize belief * entropy (simple exploit/explore blend)
      - rl:            stub (currently behaves like balance)

    MDC-driven aliases:
      - mdc_info:      entropy map (useful for static placement / O0 fallback)
      - mdc_arrival:   belief*entropy map (O0 fallback)

    Uncertainty redesign:
      - greedy remains exploitative: move toward currently high-belief regions
      - uncertainty is redesigned to prefer unresolved AND under-covered regions
      - posterior variance is used instead of raw entropy
      - recent coverage memory enters through uncertainty_memory
        where uncertainty_memory in [0,1] is a decayed recent-coverage memory
      - score form:
            variance      = 4 p (1-p)
            novelty       = (1 - memory)^gamma
            variance_term = variance^beta
            score_unc     = variance_term * novelty + lambda * entropy
      - uncertainty_gamma controls suppression of recently covered regions
      - uncertainty_beta controls how strongly variance contrast is sharpened
      - uncertainty_lambda controls how much raw entropy contributes even
        when variance contrast is weak
      - if uncertainty_memory is not provided, memory defaults to 0
        everywhere (maximal novelty)

    NOTE:
      In O1 closed-loop, true MDC behavior should be implemented by *deployment scoring*
      (mask-level objective), not a per-cell map. For that, use move_sensors_mdc(...).
    """
    if belief.shape != entropy.shape:
        raise ValueError(f"belief and entropy must have same shape; got {belief.shape} vs {entropy.shape}")
    if uncertainty_memory is not None and uncertainty_memory.shape != belief.shape:
        raise ValueError(
            f"uncertainty_memory must have same shape as belief; "
            f"got {uncertainty_memory.shape} vs {belief.shape}"
        )
    if uncertainty_frontier is not None and uncertainty_frontier.shape != belief.shape:
        raise ValueError(
            f"uncertainty_frontier must have same shape as belief; "
            f"got {uncertainty_frontier.shape} vs {belief.shape}"
        )

    # Clear stale uncertainty debug when this call is not for uncertainty,
    # so downstream readers do not accidentally inspect an old snapshot.
    p = (policy or "").strip().lower()
    if p != "uncertainty":
        reset_uncertainty_score_debug_snapshot()

    p = (policy or "").strip().lower()

    if p == "greedy":
        return belief

    p = (policy or "").strip().lower()

    if p == "uncertainty":

        # Posterior variance peaks at p=0.5 and is lower near certainty.
        variance = (4.0 * belief * (1.0 - belief)).astype(np.float32)

        if uncertainty_memory is None:
            mem = np.zeros_like(variance, dtype=np.float32)
        else:
            mem = np.clip(uncertainty_memory.astype(np.float32), 0.0, 1.0)

        gamma = float(max(0.0, uncertainty_gamma))
        beta = float(max(0.0, uncertainty_beta))
        lam = float(max(0.0, uncertainty_lambda))
        frontier_enabled = bool(uncertainty_frontier_enabled)
        frontier_weight = float(max(0.0, uncertainty_frontier_weight))

        novelty_base = np.clip(1.0 - mem, 0.0, 1.0).astype(np.float32)

        # Novelty term:
        # prefer under-covered regions, with stronger suppression as
        # uncertainty_gamma increases.
        novelty = np.power(novelty_base, gamma).astype(np.float32)
        entropy_bonus = (np.float32(lam) * entropy.astype(np.float32)).astype(np.float32)


        # Variance shaping term:
        # sharpen or flatten the contrast between low- and high-variance cells.
        variance_term = np.power(np.clip(variance, 0.0, 1.0), beta).astype(np.float32)

        base_unc = (variance_term * novelty).astype(np.float32)

        # Optional frontier emphasis:
        # apply frontier as a small, variance-gated additive bonus rather than
        # as a broad multiplicative amplifier on the full base uncertainty term.
        #
        # Rationale:
        #   The multiplicative form created strong local attractors on frontier
        #   ridges and, in clean sweeps, increased coverage while hurting early
        #   fire engagement and TTFD. We therefore make frontier secondary:
        #     - it should help discriminate among already-uncertain regions,
        #       not globally re-rank the map
        #     - it should matter most where posterior variance is still high
        #     - it should be capped so it cannot dominate base_unc
        #
        # Form:
        #   frontier_gate = variance
        #   frontier_raw  = frontier_weight * frontier * frontier_gate * entropy_bonus
        #   frontier_cap  = 0.25 * base_unc
        #   frontier_add  = min(frontier_raw, frontier_cap)
        #
        # Interpretation:
        #   - frontier is strongest where belief is unresolved (high variance)
        #   - frontier scales with the exploratory/entropy side rather than the
        #     whole base uncertainty mass
        #   - cap keeps frontier from creating large standalone peaks
        if frontier_enabled and frontier_weight > 0.0:
            if uncertainty_frontier is None:
                frontier = np.zeros_like(variance_term, dtype=np.float32)
            else:
                frontier = np.clip(uncertainty_frontier.astype(np.float32), 0.0, 1.0)

            frontier_gate = np.clip(variance, 0.0, 1.0).astype(np.float32)
            frontier_raw = (
                np.float32(frontier_weight)
                * frontier
                * frontier_gate
                * entropy_bonus
            ).astype(np.float32)

            frontier_cap = (np.float32(0.25) * base_unc).astype(np.float32)
            frontier_add = np.minimum(frontier_raw, frontier_cap).astype(np.float32)
        else:
            frontier = np.zeros_like(variance_term, dtype=np.float32)
            frontier_add = np.zeros_like(base_unc, dtype=np.float32)

        score_unc = (
            base_unc
            + entropy_bonus
            + frontier_add
        ).astype(np.float32)

        _update_uncertainty_score_debug_snapshot(
            variance=variance,
            variance_term=variance_term,
            novelty=novelty,
            entropy_bonus=entropy_bonus,
            frontier=frontier,
            frontier_add=frontier_add,
            score=score_unc,
            frontier_enabled=frontier_enabled,
            frontier_weight=frontier_weight,
            gamma=gamma,
            beta=beta,
            lam=lam,
        )
        return score_unc

    if p == "balance":
        return belief * entropy

    if p == "rl":
        # stub: behaves like balance for v0
        return belief * entropy

    # Fallback maps for MDC policies (static and/or O0)
    if p == "mdc_info":
        return entropy
    if p == "mdc_arrival":
        return belief * entropy

    # Default fallback: greedy
    return belief


# ----------------------------
# O1 MDC-live helpers
# ----------------------------

def candidates_within_move(
    r0: int,
    c0: int,
    *,
    move_max_cells: float,
    H: int,
    W: int,
    rng: np.random.Generator,
    k_candidates: int,
) -> np.ndarray:
    """
    Generate candidate (row,col) positions within a movement radius.

    Strategy:
      - If radius is small, enumerate all feasible cells in the circle.
      - Otherwise sample uniformly from the bounding square and reject outside the circle.

    Always includes (r0,c0) as a candidate.
    """
    H = int(H); W = int(W)
    r0 = int(r0); c0 = int(c0)
    k = int(k_candidates)

    if k <= 0:
        return np.array([[r0, c0]], dtype=np.int32)

    rmax = float(move_max_cells)
    R = int(np.ceil(rmax))
    r2 = rmax * rmax

    # Enumerate if small
    if R <= 8:
        pts: list[tuple[int, int]] = []
        for rr in range(max(0, r0 - R), min(H - 1, r0 + R) + 1):
            for cc in range(max(0, c0 - R), min(W - 1, c0 + R) + 1):
                d2 = float((rr - r0) * (rr - r0) + (cc - c0) * (cc - c0))
                if d2 <= r2 + 1e-6:
                    pts.append((int(rr), int(cc)))
        if not pts:
            return np.array([[r0, c0]], dtype=np.int32)
        arr = np.array(pts, dtype=np.int32)

        # If too many, sub-sample deterministically via rng (still reproducible)
        if arr.shape[0] > k:
            idx = rng.choice(arr.shape[0], size=k, replace=False)
            arr = arr[idx]
        # Ensure (r0,c0) included
        if not np.any((arr[:, 0] == r0) & (arr[:, 1] == c0)):
            arr = np.vstack([arr, np.array([[r0, c0]], dtype=np.int32)])
        return arr.astype(np.int32)

    # Sampling mode for larger radii
    pts2: list[tuple[int, int]] = [(r0, c0)]
    need = max(0, k - 1)
    tries = 0
    max_tries = max(200, need * 50)

    while len(pts2) < (need + 1) and tries < max_tries:
        tries += 1
        rr = int(rng.integers(max(0, r0 - R), min(H - 1, r0 + R) + 1))
        cc = int(rng.integers(max(0, c0 - R), min(W - 1, c0 + R) + 1))
        d2 = float((rr - r0) * (rr - r0) + (cc - c0) * (cc - c0))
        if d2 > r2 + 1e-6:
            continue
        pts2.append((rr, cc))

    return np.array(pts2, dtype=np.int32)


def _min_sep_ok(
    r: int,
    c: int,
    taken: list[tuple[int, int]],
    *,
    min_sep_cells: float,
) -> bool:
    if not taken:
        return True
    if float(min_sep_cells) <= 0:
        return True
    min2 = float(min_sep_cells) ** 2
    for rr, cc in taken:
        if (int(r) - int(rr)) ** 2 + (int(c) - int(cc)) ** 2 < min2:
            return False
    return True


def predict_mdc_residual(
    *,
    entropy_t: np.ndarray,           # (H,W) float
    offsets: np.ndarray,             # (M,2) int
    sensors_rc: np.ndarray,          # (N,2) int
    H: int,
    W: int,
    policy: str,
    c_coef: float,
    k_update: float,
) -> tuple[float, float, float]:
    """
    Predict a residual score for a candidate deployment.

    We need a cheap, causal proxy (no full lookahead simulator). We do:

      d_info = entropy mass covered (normalized by H*W)
      d_cov  = coverage fraction (mask fraction)

      predicted ΔH̄ ≈ -k_update * d_info

    Residual variants:
      mdc_info:    score = ΔH̄ - c * d_info
      mdc_arrival: r = ΔH̄ + c * d_cov

    Returns: (residual, d_info, d_cov)
    """
    p = (policy or "").strip().lower()
    if p not in ("mdc_info", "mdc_arrival"):
        raise ValueError(f"predict_mdc_residual only supports mdc_info/mdc_arrival; got {policy}")

    mask = footprint_mask(sensors_rc, offsets, H, W)
    d_cov = mask_frac(mask)
    d_info = entropy_mass_in_mask(entropy_t, mask)

    dH_pred = -float(k_update) * float(d_info)
    c = float(c_coef)

    if p == "mdc_info":
        r = dH_pred - c * float(d_info)
    else:
        r = dH_pred + c * float(d_cov)

    return float(r), float(d_info), float(d_cov)


def move_sensors_mdc(
    current_rc: np.ndarray,          # (N,2)
    *,
    entropy_t: np.ndarray,           # (H,W)
    offsets: np.ndarray,             # (M,2)
    move_max_cells: float,
    min_sep_cells: float,
    policy: str,                     # "mdc_info" | "mdc_arrival"
    c_coef: float,
    k_update: float,
    deterministic: bool,
    rng: np.random.Generator,
    k_candidates: int = 20,
    t: int = 0,
) -> np.ndarray:
    """
O1 dynamic MDC-live controller (marginal scoring, fast flat-index version).

    Key idea:
      - Union-footprint scoring can be flat when sensors overlap.
      - Instead, score the *incremental* footprint contributed by the sensor being placed.

    For sensor i, given fixed_union (bool[H*W] union of already-chosen footprints this step):
      idx_cand = footprint_flat_indices(rr,cc)
      idx_inc  = idx_cand[~fixed_union[idx_cand]]

    Driver variants:
      - mdc_info:    d_info_inc = (1/(H*W)) * sum(entropy[idx_inc])
      - mdc_arrival: d_cov_inc  = (1/(H*W)) * |idx_inc|

    Predicted entropy drift proxy:
      ΔH̄_pred ≈ -k_update * d_info_inc
    Score:
      mdc_info:    score = ΔH̄_pred - c * d_info_inc
      mdc_arrival: r = ΔH̄_pred + c * d_cov_inc

    This avoids allocating (H,W) masks per candidate and fixes the "blob" problem
    by scoring incremental contribution only.
    """
    p = (policy or "").strip().lower()
    if p not in ("mdc_info", "mdc_arrival"):
        raise ValueError(f"move_sensors_mdc only supports mdc_info/mdc_arrival; got {policy}")

    if entropy_t.ndim != 2:
        raise ValueError(f"entropy_t must be 2D (H,W); got shape={entropy_t.shape}")

    H, W = entropy_t.shape
    cur = current_rc.astype(np.int32, copy=True)
    N = int(cur.shape[0])
    if N <= 0:
        return cur

    # proposal is the deployment we build greedily
    proposal = cur.copy()

    # union footprint of sensors already chosen this step (flat, bool)
    fixed_union = np.zeros((H * W,), dtype=np.bool_)

    taken: list[tuple[int, int]] = []

    c = float(c_coef)
    k_upd = float(k_update)

    # Note: entropy_t is 2D; we use flat view for fast masked sums.
    ent_flat = np.asarray(entropy_t, dtype=np.float32).reshape(-1)

    for i in range(N):
        r0, c0 = int(cur[i, 0]), int(cur[i, 1])

        cand_rcs = candidates_within_move(
            r0,
            c0,
            move_max_cells=float(move_max_cells),
            H=int(H),
            W=int(W),
            rng=rng,
            k_candidates=int(k_candidates),
        )

        # Stochastic tie-break: shuffle candidate order (consistent with your style)
        if not deterministic:
            cand_rcs = _tie_break_shuffle(cand_rcs, rng)

        best_r: Optional[float] = None
        best = np.array([r0, c0], dtype=np.int32)

        for rr, cc in cand_rcs:
            rr = int(rr); cc = int(cc)
            if not (0 <= rr < H and 0 <= cc < W):
                continue
            if not _min_sep_ok(rr, cc, taken, min_sep_cells=float(min_sep_cells)):
                continue

            # candidate footprint indices and incremental part beyond already-chosen sensors
            idx_cand = footprint_flat_indices(rr, cc, offsets, H, W)
            if idx_cand.size == 0:
                continue
            # If footprint_flat_indices can include duplicates, normalize:
            # idx_cand = np.unique(idx_cand)
            inc_sel = ~fixed_union[idx_cand]
            idx_inc = idx_cand[inc_sel]

            # Drivers from incremental footprint (normalized by H*W)
            d_cov_inc = float(idx_inc.size) / float(H * W)
            d_info_inc = float(np.sum(ent_flat[idx_inc])) / float(H * W)

            # Predicted entropy drift proxy uses info increment (even for arrival mode)
            dH_pred = -k_upd * d_info_inc

            if p == "mdc_info":
                # Lower is better. More predicted entropy reduction and more
                # information mass should both improve the candidate score.
                rscore = dH_pred - c * d_info_inc
            else:
                rscore = dH_pred + c * d_cov_inc

            # Tie-break jitter at the deployment-score level
            if deterministic:
                j = (int(t) * 1000003 + int(i) * 9176 + int(rr) * 127 + int(cc) * 131) % 1000003
                rscore = float(rscore) + 1e-12 * float(j)
            else:
                rscore = float(rscore) + 1e-9 * float(rng.random())

            if best_r is None or rscore < best_r - 1e-12:
                best_r = float(rscore)
                best = np.array([rr, cc], dtype=np.int32)

            elif best_r is not None and abs(rscore - best_r) <= 1e-12 and deterministic:
                # stable tie-break: lexicographic (row, col)
                if (rr < int(best[0])) or (rr == int(best[0]) and cc < int(best[1])):
                    best_r = float(rscore)
                    best = np.array([rr, cc], dtype=np.int32)


        # Commit choice
        proposal[i] = best
        taken.append((int(best[0]), int(best[1])))

        # Update fixed union mask (add full footprint of chosen sensor)
        idx_best = footprint_flat_indices(int(best[0]), int(best[1]), offsets, H, W)
        if idx_best.size:
            fixed_union[idx_best] = True

    return proposal.astype(np.int32)


def _move_sensors_mdc_masked(
    current_rc: np.ndarray,          # (N,2)
    allow_move: np.ndarray,          # (N,) bool
    *,
    entropy_t: np.ndarray,           # (H,W)
    offsets: np.ndarray,             # (M,2)
    move_max_cells: float,
    min_sep_cells: float,
    policy: str,                     # "mdc_info" | "mdc_arrival"
    c_coef: float,
    k_update: float,
    deterministic: bool,
    rng: np.random.Generator,
    k_candidates: int = 20,
    t: int = 0,
) -> np.ndarray:
    """
    Like move_sensors_mdc, but only sensors with allow_move[i]=True may move.
    Others are locked to their current positions.

    Implementation detail:
      - We pre-seed `taken` and `fixed_union` with all locked sensors so movers
        respect min-separation and incremental scoring against locked footprints.
    """
    p = (policy or "").strip().lower()
    if p not in ("mdc_info", "mdc_arrival"):
        raise ValueError(f"_move_sensors_mdc_masked only supports mdc_info/mdc_arrival; got {policy}")
    if entropy_t.ndim != 2:
        raise ValueError(f"entropy_t must be 2D (H,W); got shape={entropy_t.shape}")

    H, W = entropy_t.shape
    cur = current_rc.astype(np.int32, copy=True)
    N = int(cur.shape[0])
    if N <= 0:
        return cur

    allow = np.asarray(allow_move, dtype=np.bool_).reshape(-1)
    if allow.size != N:
        raise ValueError(f"allow_move must have shape (N,), got {allow.shape} for N={N}")

    proposal = cur.copy()
    fixed_union = np.zeros((H * W,), dtype=np.bool_)
    taken: list[tuple[int, int]] = []

    # Pre-seed with locked sensors (so movers respect them)
    for i in range(N):
        if bool(allow[i]):
            continue
        rr0, cc0 = int(cur[i, 0]), int(cur[i, 1])
        taken.append((rr0, cc0))
        idx0 = footprint_flat_indices(rr0, cc0, offsets, H, W)
        if idx0.size:
            fixed_union[idx0] = True

    c = float(c_coef)
    k_upd = float(k_update)
    ent_flat = np.asarray(entropy_t, dtype=np.float32).reshape(-1)

    for i in range(N):
        if not bool(allow[i]):
            continue  # locked

        r0, c0 = int(cur[i, 0]), int(cur[i, 1])
        cand_rcs = candidates_within_move(
            r0,
            c0,
            move_max_cells=float(move_max_cells),
            H=int(H),
            W=int(W),
            rng=rng,
            k_candidates=int(k_candidates),
        )
        if not deterministic:
            cand_rcs = _tie_break_shuffle(cand_rcs, rng)

        best_r: Optional[float] = None
        best = np.array([r0, c0], dtype=np.int32)

        for rr, cc in cand_rcs:
            rr = int(rr); cc = int(cc)
            if not (0 <= rr < H and 0 <= cc < W):
                continue
            if not _min_sep_ok(rr, cc, taken, min_sep_cells=float(min_sep_cells)):
                continue

            idx_cand = footprint_flat_indices(rr, cc, offsets, H, W)
            if idx_cand.size == 0:
                continue
            inc_sel = ~fixed_union[idx_cand]
            idx_inc = idx_cand[inc_sel]

            d_cov_inc = float(idx_inc.size) / float(H * W)
            d_info_inc = float(np.sum(ent_flat[idx_inc])) / float(H * W)
            dH_pred = -k_upd * d_info_inc

            if p == "mdc_info":
                rscore = dH_pred - c * d_info_inc
            else:
                rscore = dH_pred + c * d_cov_inc

            if deterministic:
                j = (int(t) * 1000003 + int(i) * 9176 + int(rr) * 127 + int(cc) * 131) % 1000003
                rscore = float(rscore) + 1e-12 * float(j)
            else:
                rscore = float(rscore) + 1e-9 * float(rng.random())

            if best_r is None or rscore < best_r - 1e-12:
                best_r = float(rscore)
                best = np.array([rr, cc], dtype=np.int32)
            elif best_r is not None and abs(rscore - best_r) <= 1e-12 and deterministic:
                if (rr < int(best[0])) or (rr == int(best[0]) and cc < int(best[1])):
                    best_r = float(rscore)
                    best = np.array([rr, cc], dtype=np.int32)

        proposal[i] = best
        taken.append((int(best[0]), int(best[1])))

        idx_best = footprint_flat_indices(int(best[0]), int(best[1]), offsets, H, W)
        if idx_best.size:
            fixed_union[idx_best] = True

    return proposal.astype(np.int32)


def move_sensors_mdc_limited(
    current_rc: np.ndarray,          # (N,2)
    *,
    entropy_t: np.ndarray,           # (H,W)
    offsets: np.ndarray,             # (M,2)
    move_max_cells: float,
    min_sep_cells: float,
    policy: str,                     # "mdc_info" | "mdc_arrival"
    c_coef: float,
    k_update: float,
    deterministic: bool,
    rng: np.random.Generator,
    max_moves_per_step: int = 0,
    k_candidates: int = 20,
    t: int = 0,
) -> np.ndarray:
    """
    MDC controller with optional realism-lite move cap:
      - If max_moves_per_step <= 0: behaves like move_sensors_mdc (no cap).
      - If >0: select top-K sensors with the largest predicted residual improvement
        vs staying (computed against "others stay" baseline), then re-run a masked
        MDC placement where only those sensors may move.
    """
    cur = current_rc.astype(np.int32, copy=True)
    N = int(cur.shape[0])
    K = int(max_moves_per_step or 0)
    if N <= 0 or K <= 0 or K >= N:
        return move_sensors_mdc(
            cur,
            entropy_t=entropy_t,
            offsets=offsets,
            move_max_cells=move_max_cells,
            min_sep_cells=min_sep_cells,
            policy=policy,
            c_coef=c_coef,
            k_update=k_update,
            deterministic=deterministic,
            rng=rng,
            k_candidates=k_candidates,
            t=t,
        )

    p = (policy or "").strip().lower()
    if p not in ("mdc_info", "mdc_arrival"):
        raise ValueError(f"move_sensors_mdc_limited only supports mdc_info/mdc_arrival; got {policy}")
    if entropy_t.ndim != 2:
        raise ValueError(f"entropy_t must be 2D (H,W); got shape={entropy_t.shape}")

    H, W = entropy_t.shape
    ent_flat = np.asarray(entropy_t, dtype=np.float32).reshape(-1)
    c = float(c_coef)
    k_upd = float(k_update)

    # Coverage counts (others-stay baseline)
    counts = np.zeros((H * W,), dtype=np.int32)
    idx_cur_list: list[np.ndarray] = []
    for i in range(N):
        rr0, cc0 = int(cur[i, 0]), int(cur[i, 1])
        idx0 = footprint_flat_indices(rr0, cc0, offsets, H, W)
        idx_cur_list.append(idx0)
        if idx0.size:
            counts[idx0] += 1

    improve = np.zeros((N,), dtype=np.float32)

    for i in range(N):
        idx_i = idx_cur_list[i]
        if idx_i.size:
            counts_others = counts.copy()
            counts_others[idx_i] -= 1
        else:
            counts_others = counts

        # Staying score (increment beyond others)
        if idx_i.size:
            inc_stay = idx_i[counts_others[idx_i] <= 0]
        else:
            inc_stay = idx_i

        d_cov_stay = float(inc_stay.size) / float(H * W)
        d_info_stay = float(np.sum(ent_flat[inc_stay])) / float(H * W)
        dH_stay = -k_upd * d_info_stay
        stay_r = dH_stay - c * d_info_stay if p == "mdc_info" else dH_stay + c * d_cov_stay

        # Best move score against others-stay baseline
        r0, c0 = int(cur[i, 0]), int(cur[i, 1])
        cand_rcs = candidates_within_move(
            r0,
            c0,
            move_max_cells=float(move_max_cells),
            H=int(H),
            W=int(W),
            rng=rng,
            k_candidates=int(k_candidates),
        )
        if not deterministic:
            cand_rcs = _tie_break_shuffle(cand_rcs, rng)

        best_r: Optional[float] = None
        best = np.array([r0, c0], dtype=np.int32)

        for rr, cc in cand_rcs:
            rr = int(rr); cc = int(cc)
            idx_c = footprint_flat_indices(rr, cc, offsets, H, W)
            if idx_c.size == 0:
                continue
            inc = idx_c[counts_others[idx_c] <= 0]

            d_cov = float(inc.size) / float(H * W)
            d_info = float(np.sum(ent_flat[inc])) / float(H * W)
            dH_pred = -k_upd * d_info
            rscore = dH_pred - c * d_info if p == "mdc_info" else dH_pred + c * d_cov

            # tiny tie-break jitter
            if deterministic:
                j = (int(t) * 1000003 + int(i) * 9176 + int(rr) * 127 + int(cc) * 131) % 1000003
                rscore = float(rscore) + 1e-12 * float(j)
            else:
                rscore = float(rscore) + 1e-9 * float(rng.random())

            if best_r is None or rscore < best_r - 1e-12:
                best_r = float(rscore)
                best = np.array([rr, cc], dtype=np.int32)
            elif best_r is not None and abs(rscore - best_r) <= 1e-12 and deterministic:
                if (rr < int(best[0])) or (rr == int(best[0]) and cc < int(best[1])):
                    best_r = float(rscore)
                    best = np.array([rr, cc], dtype=np.int32)

        if best_r is None:
            best_r = float(stay_r)
            best = np.array([r0, c0], dtype=np.int32)

        improve[i] = float(stay_r - float(best_r))  # positive => moving helps

    # Choose movers by improvement (respect deterministic/stochastic tie-break).
    # If no strictly-positive improvements exist (flat objective), still allow up to K movers:
    # masked MDC will include "stay" as a candidate, so sensors may still choose to stay.
    cand_pos = np.where(improve > 0.0)[0].astype(np.int32)
    if cand_pos.size > 0:
        cand = cand_pos
    else:
        cand = np.arange(N, dtype=np.int32)

    if deterministic:
        order = np.lexsort((cand, -improve[cand]))  # improvement desc, then idx asc
    else:
        noisy = improve[cand] + 1e-9 * rng.random(cand.shape)
        order = np.argsort(-noisy)

    movers = cand[order[: min(K, cand.size)]]

    allow = np.zeros((N,), dtype=np.bool_)
    allow[movers] = True

    return _move_sensors_mdc_masked(
        cur,
        allow,
        entropy_t=entropy_t,
        offsets=offsets,
        move_max_cells=move_max_cells,
        min_sep_cells=min_sep_cells,
        policy=policy,
        c_coef=c_coef,
        k_update=k_update,
        deterministic=deterministic,
        rng=rng,
        k_candidates=k_candidates,
        t=t,
    )
