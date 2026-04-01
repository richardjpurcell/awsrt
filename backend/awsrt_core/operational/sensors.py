from __future__ import annotations

import numpy as np
from typing import Optional


def offsets_within_radius(radius_cells: float) -> np.ndarray:
    """
    Integer (dr,dc) offsets whose Euclidean distance is within radius_cells.
    Used for footprints and fire-detection checks.
    """
    r = float(radius_cells)
    R = int(np.ceil(r))
    offs: list[tuple[int, int]] = []
    r2 = r * r
    for dr in range(-R, R + 1):
        for dc in range(-R, R + 1):
            if float(dr * dr + dc * dc) <= r2 + 1e-6:
                offs.append((int(dr), int(dc)))
    return np.array(offs, dtype=np.int32)


def detect_fire_at_sensors(
    fire2d: np.ndarray,      # (H,W) uint8/bool
    sensors_rc: np.ndarray,  # (N,2)
    offsets: np.ndarray,     # (M,2)
) -> np.ndarray:
    """
    Returns det[i]=1 if any cell in sensor i's footprint is burning.
    """
    H, W = fire2d.shape
    N = int(sensors_rc.shape[0])
    det = np.zeros((N,), dtype=np.uint8)

    # Fast-ish early exits; keep simple loops for clarity.
    for i in range(N):
        r0 = int(sensors_rc[i, 0])
        c0 = int(sensors_rc[i, 1])
        hit = 0
        for dr, dc in offsets:
            rr = r0 + int(dr)
            cc = c0 + int(dc)
            if 0 <= rr < H and 0 <= cc < W and fire2d[rr, cc] > 0:
                hit = 1
                break
        det[i] = hit

    return det


def clamp_rc(rc: np.ndarray, H: int, W: int) -> np.ndarray:
    """
    Clamp (N,2) row/col coordinates to grid bounds.
    """
    out = rc.copy()
    out[:, 0] = np.clip(out[:, 0], 0, int(H) - 1)
    out[:, 1] = np.clip(out[:, 1], 0, int(W) - 1)
    return out

def footprint_flat_indices(
    r0: int,
    c0: int,
    offsets: np.ndarray,  # (M,2)
    H: int,
    W: int,
) -> np.ndarray:
    """
    Return 1D flat indices (rr*W + cc) for the footprint cells of a single sensor.

    This is a fast primitive for incremental/union-footprint scoring in O1 policies:
      fixed: bool[H*W] union mask
      idx:   footprint_flat_indices(...)
      inc = idx[~fixed[idx]]
    """
    r0 = int(r0)
    c0 = int(c0)
    H = int(H)
    W = int(W)

    if offsets.size == 0:
        return np.zeros((0,), dtype=np.int32)

    rr = r0 + offsets[:, 0].astype(np.int32)
    cc = c0 + offsets[:, 1].astype(np.int32)
    ok = (rr >= 0) & (rr < H) & (cc >= 0) & (cc < W)
    rr = rr[ok]
    cc = cc[ok]
    return (rr * W + cc).astype(np.int32)


def footprint_mask(
    sensors_rc: np.ndarray,  # (N,2)
    offsets: np.ndarray,     # (M,2)
    H: int,
    W: int,
) -> np.ndarray:
    """
    Return uint8 mask (H,W) of cells covered by any sensor footprint.

    This is used to compute coverage_frac/new_coverage_frac without requiring
    upstream runs. It is intentionally pure and side-effect free.
    """
    H = int(H)
    W = int(W)
    mask = np.zeros((H, W), dtype=np.uint8)

    if sensors_rc.size == 0 or offsets.size == 0:
        return mask

    for r0, c0 in sensors_rc.astype(np.int32):
        r0 = int(r0)
        c0 = int(c0)
        for dr, dc in offsets:
            rr = r0 + int(dr)
            cc = c0 + int(dc)
            if 0 <= rr < H and 0 <= cc < W:
                mask[rr, cc] = 1

    return mask


def mask_frac(mask: np.ndarray) -> float:
    """
    Fraction of grid cells covered by a mask (interpreting nonzero as True).
    """
    if mask.size == 0:
        return 0.0
    return float(np.count_nonzero(mask)) / float(mask.size)


def movement_l1_mean(prev_rc: np.ndarray, cur_rc: np.ndarray) -> float:
    """
    Mean L1 movement per sensor between two deployments (in cell units).
    """
    if prev_rc.shape != cur_rc.shape or prev_rc.size == 0:
        return 0.0
    d = np.abs(cur_rc.astype(np.int32) - prev_rc.astype(np.int32))
    return float(np.mean(d[:, 0] + d[:, 1]))


def front_band_mask(fire: np.ndarray, band: int = 1) -> np.ndarray:
    """
    Compute a simple "front band" mask from a burning mask:
      - boundary = burning cell with a 4-neighbor not burning
      - band = boundary dilated `band` times (4-neighborhood)

    fire: (H,W) uint8/bool where >0 means burning.
    Returns uint8 mask (H,W).
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


def fraction_sensors_hitting_mask(
    sensors_rc: np.ndarray,  # (N,2)
    offsets: np.ndarray,     # (M,2)
    target_mask: np.ndarray, # (H,W) uint8/bool
) -> float:
    """
    Fraction of sensors whose footprint intersects target_mask.
    """
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


def entropy_binary(p: np.ndarray) -> np.ndarray:
    """
    Binary entropy H(p) in bits, elementwise, with numerical stability.
    """
    p = np.asarray(p, dtype=np.float32)
    eps = 1e-6
    pc = np.clip(p, eps, 1.0 - eps)
    return -(pc * np.log2(pc) + (1.0 - pc) * np.log2(1.0 - pc)).astype(np.float32)


def entropy_mass_in_mask(entropy: np.ndarray, mask: np.ndarray) -> float:
    """
    Sum of entropy over cells selected by mask, normalized by total cell count (H*W).

    This is a good "info-like driver" d_info(t):
      d_info(t) = (1/(H*W)) * Σ_{cells} entropy[cell] * 1{mask[cell]=1}
    """
    if entropy.size == 0 or mask.size == 0:
        return 0.0
    if entropy.shape != mask.shape:
        raise ValueError(f"entropy and mask must have same shape; got {entropy.shape} vs {mask.shape}")
    m = (mask > 0).astype(np.float32)
    return float(np.sum(entropy.astype(np.float32) * m)) / float(entropy.size)


def mask_entropy_mean(entropy: np.ndarray, mask: np.ndarray) -> float:
    """
    Mean entropy over covered cells only.

    This is sometimes useful for diagnostics, but for MDC drivers the
    entropy_mass_in_mask() normalization by (H*W) is often cleaner.
    """
    if entropy.size == 0 or mask.size == 0:
        return 0.0
    if entropy.shape != mask.shape:
        raise ValueError(f"entropy and mask must have same shape; got {entropy.shape} vs {mask.shape}")
    sel = entropy[(mask > 0)]
    if sel.size == 0:
        return 0.0
    return float(np.mean(sel.astype(np.float32)))


def move_sensors_greedy(
    current_rc: np.ndarray,  # (N,2)
    score: np.ndarray,       # (H,W)
    move_max_cells: float,
    min_sep_cells: float,
    *,
    deterministic: bool,
    rng: np.random.Generator,
) -> np.ndarray:
    """
    Greedy per-sensor move: for each sensor, choose the best cell within
    move_max_cells, while enforcing a minimum separation among chosen targets.

    NOTE: This is a simple v0 controller; it is intentionally local and
    order-dependent.
    """
    H, W = score.shape
    N = int(current_rc.shape[0])
    chosen: list[np.ndarray] = []
    taken: list[tuple[int, int]] = []
    min2 = float(min_sep_cells) ** 2

    for i in range(N):
        r0, c0 = int(current_rc[i, 0]), int(current_rc[i, 1])

        # Search within a square window, cheap for v0 and small move ranges.
        R = int(np.ceil(float(move_max_cells)))
        rmin, rmax = max(0, r0 - R), min(H - 1, r0 + R)
        cmin, cmax = max(0, c0 - R), min(W - 1, c0 + R)
        window = score[rmin : rmax + 1, cmin : cmax + 1].copy()

        # Mask out cells beyond the movement circle
        rr = np.arange(rmin, rmax + 1, dtype=np.int32)[:, None]
        cc = np.arange(cmin, cmax + 1, dtype=np.int32)[None, :]
        d2 = (rr - r0) ** 2 + (cc - c0) ** 2
        window[d2 > float(move_max_cells) ** 2 + 1e-6] = -np.inf

        # Mask out too-close to already chosen
        if float(min_sep_cells) > 0 and taken:
            for tr, tc in taken:
                d2t = (rr - int(tr)) ** 2 + (cc - int(tc)) ** 2
                window[d2t < min2] = -np.inf

        if np.all(~np.isfinite(window)):
            # fallback: stay put
            cand = np.array([r0, c0], dtype=np.int32)
        else:
            # choose argmax (with stochastic tie-break as tiny perturbation)
            if not deterministic:
                window = window + 1e-9 * rng.random(window.shape)
            idx = np.unravel_index(int(np.nanargmax(window)), window.shape)
            cand = np.array([int(rmin + idx[0]), int(cmin + idx[1])], dtype=np.int32)

        # NOTE: stored as (row,col)
        taken.append((int(cand[0]), int(cand[1])))
        chosen.append(cand)

    return np.stack(chosen, axis=0).astype(np.int32)

def _move_sensors_greedy_masked(
    current_rc: np.ndarray,  # (N,2)
    score: np.ndarray,       # (H,W)
    move_max_cells: float,
    min_sep_cells: float,
    allow_move: np.ndarray,  # (N,) bool
    *,
    deterministic: bool,
    rng: np.random.Generator,
) -> np.ndarray:
    """
    Greedy mover with lock mask: only sensors with allow_move[i]=True may move.
    Others are pinned to current_rc[i].

    We pre-seed `taken` with all locked positions so movers respect min separation
    vs locked sensors as well as previously-chosen movers.
    """
    H, W = score.shape
    cur = current_rc.astype(np.int32, copy=True)
    N = int(cur.shape[0])

    allow = np.asarray(allow_move, dtype=np.bool_).reshape(-1)
    if allow.size != N:
        raise ValueError(f"allow_move must have shape (N,), got {allow.shape} for N={N}")

    out = cur.copy()
    taken: list[tuple[int, int]] = []
    min2 = float(min_sep_cells) ** 2

    # Locked sensors are always "taken"
    for i in range(N):
        if bool(allow[i]):
            continue
        taken.append((int(cur[i, 0]), int(cur[i, 1])))

    for i in range(N):
        if not bool(allow[i]):
            continue  # locked, already set

        r0, c0 = int(cur[i, 0]), int(cur[i, 1])
        R = int(np.ceil(float(move_max_cells)))
        rmin, rmax = max(0, r0 - R), min(H - 1, r0 + R)
        cmin, cmax = max(0, c0 - R), min(W - 1, c0 + R)
        window = score[rmin : rmax + 1, cmin : cmax + 1].copy()

        rr = np.arange(rmin, rmax + 1, dtype=np.int32)[:, None]
        cc = np.arange(cmin, cmax + 1, dtype=np.int32)[None, :]
        d2 = (rr - r0) ** 2 + (cc - c0) ** 2
        window[d2 > float(move_max_cells) ** 2 + 1e-6] = -np.inf

        if float(min_sep_cells) > 0 and taken:
            for tr, tc in taken:
                d2t = (rr - int(tr)) ** 2 + (cc - int(tc)) ** 2
                window[d2t < min2] = -np.inf

        if np.all(~np.isfinite(window)):
            cand = np.array([r0, c0], dtype=np.int32)
        else:
            if not deterministic:
                window = window + 1e-9 * rng.random(window.shape)
            idx = np.unravel_index(int(np.nanargmax(window)), window.shape)
            cand = np.array([int(rmin + idx[0]), int(cmin + idx[1])], dtype=np.int32)

        out[i] = cand
        taken.append((int(cand[0]), int(cand[1])))

    return out.astype(np.int32)


def move_sensors_greedy_limited(
    current_rc: np.ndarray,  # (N,2)
    score: np.ndarray,       # (H,W)
    move_max_cells: float,
    min_sep_cells: float,
    *,
    max_moves_per_step: int = 0,
    deterministic: bool,
    rng: np.random.Generator,
) -> np.ndarray:
    """
    Greedy controller with optional realism-lite move cap:
      - If max_moves_per_step <= 0: behaves like move_sensors_greedy (no cap).
      - If >0: compute per-sensor benefit (score(new)-score(stay)) from an
        unconstrained greedy proposal, select top-K movers, then re-run a masked
        greedy placement where only those sensors may move.
    """
    cur = current_rc.astype(np.int32, copy=True)
    N = int(cur.shape[0])
    K = int(max_moves_per_step or 0)
    if N <= 0 or K <= 0 or K >= N:
        return move_sensors_greedy(
            cur,
            score,
            move_max_cells=move_max_cells,
            min_sep_cells=min_sep_cells,
            deterministic=deterministic,
            rng=rng,
        )

    # Unconstrained proposal (existing behavior) to estimate benefits
    prop_full = move_sensors_greedy(
        cur,
        score,
        move_max_cells=move_max_cells,
        min_sep_cells=min_sep_cells,
        deterministic=deterministic,
        rng=rng,
    ).astype(np.int32)

    H, W = score.shape
    r0 = cur[:, 0].astype(np.int32)
    c0 = cur[:, 1].astype(np.int32)
    r1 = prop_full[:, 0].astype(np.int32)
    c1 = prop_full[:, 1].astype(np.int32)

    stay_val = score[r0, c0].astype(np.float32)
    move_val = score[r1, c1].astype(np.float32)
    benefit = (move_val - stay_val).astype(np.float32)

    moved = (r1 != r0) | (c1 != c0)
    cand = np.where(moved & (benefit > 0.0))[0].astype(np.int32)
    if cand.size == 0:
        return cur

    if deterministic:
        order = np.lexsort((cand, -benefit[cand]))  # benefit desc, then idx asc
    else:
        noisy = benefit[cand] + 1e-9 * rng.random(cand.shape)
        order = np.argsort(-noisy)

    movers = cand[order[: min(K, cand.size)]]
    allow = np.zeros((N,), dtype=np.bool_)
    allow[movers] = True

    return _move_sensors_greedy_masked(
        cur,
        score,
        move_max_cells=move_max_cells,
        min_sep_cells=min_sep_cells,
        allow_move=allow,
        deterministic=deterministic,
        rng=rng,
    )