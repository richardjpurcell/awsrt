from __future__ import annotations

import numpy as np

from awsrt_core.schemas.physical import PhysicalManifest
from awsrt_core.sim.fuels import DEFAULT_BURN_MULT, DEFAULT_SPREAD_MULT, FUEL_CODE_TO_ID


def _shift_slices(H: int, W: int, dr: int, dc: int):
    # source slice (sr, sc) maps to dest slice (tr, tc) without wrap
    if dr >= 0:
        sr = slice(0, H - dr)
        tr = slice(dr, H)
    else:
        sr = slice(-dr, H)
        tr = slice(0, H + dr)

    if dc >= 0:
        sc = slice(0, W - dc)
        tc = slice(dc, W)
    else:
        sc = slice(-dc, W)
        tc = slice(0, W + dc)

    return sr, sc, tr, tc


def _neighborhood_offsets(kind: str):
    if kind == "von_neumann":
        return [(-1, 0), (1, 0), (0, -1), (0, 1)]
    # moore
    return [
        (-1, 0),
        (1, 0),
        (0, -1),
        (0, 1),
        (-1, -1),
        (-1, 1),
        (1, -1),
        (1, 1),
    ]


def _resolve_ignitions(man: PhysicalManifest) -> list[tuple[int, int, int, int]]:
    """
    Returns list of (row, col, t0, radius_cells).

    Canonical behavior:
      - Allow t0 == 0 (ignite at initial frame).
      - If t0 is None: sample from ignition_window if available; else default to 0.
    """
    fire = getattr(man, "fire", None)
    if fire is None:
        return []

    iw = getattr(fire, "ignition_window", None)
    seed = int(getattr(iw, "seed", 0)) if iw is not None else 0
    rng = np.random.default_rng(seed)

    out: list[tuple[int, int, int, int]] = []

    ignitions = getattr(fire, "ignitions", None) or []
    for ign in ignitions:
        t0 = getattr(ign, "t0", None)

        if t0 is None:
            if iw is not None and getattr(iw, "t_min", None) is not None and getattr(iw, "t_max", None) is not None:
                # inclusive range
                t0 = int(rng.integers(int(iw.t_min), int(iw.t_max) + 1))
            else:
                t0 = 0

        t0 = max(0, int(t0))

        out.append(
            (
                int(getattr(ign, "row", 0)),
                int(getattr(ign, "col", 0)),
                t0,
                int(getattr(ign, "radius_cells", 0)),
            )
        )

    return out


def _weather_multiplier(
    temp_c_t: np.ndarray | None,
    rh_t: np.ndarray | None,
    cfg,
) -> np.ndarray:
    """
    Compute per-cell multiplier (float32 [H,W]) applied to spread probability p.

    Coupling can use temperature OR humidity OR both:
      m = exp(temp_gain * (temp - temp_ref)) * exp(rh_gain * (rh_ref - rh))

    - If temp_c_t is None -> ignore temp term
    - If rh_t is None     -> ignore humidity term
    - If both None        -> ERROR (caller should not request multiplier)

    Clipped to [mult_min, mult_max] for stability.
    """
    temp_gain = float(getattr(cfg, "temp_gain", 0.0))
    rh_gain = float(getattr(cfg, "rh_gain", 0.0))

    temp_ref = float(getattr(cfg, "temp_ref_c", 20.0))
    rh_ref = float(getattr(cfg, "rh_ref", 0.35))

    mult_min = float(getattr(cfg, "mult_min", 0.25))
    mult_max = float(getattr(cfg, "mult_max", 4.0))

    mult_min = max(0.0, mult_min)
    mult_max = max(mult_min, mult_max)

    shape: tuple[int, int] | None = None

    if temp_c_t is not None:
        temp_c_t = np.asarray(temp_c_t, dtype=np.float32)
        if temp_c_t.ndim != 2:
            raise ValueError(f"temp_c_t must be [H,W]; got {temp_c_t.shape}")
        shape = temp_c_t.shape

    if rh_t is not None:
        rh_t = np.asarray(rh_t, dtype=np.float32)
        if rh_t.ndim != 2:
            raise ValueError(f"rh_t must be [H,W]; got {rh_t.shape}")
        rh_t = np.clip(rh_t, 0.0, 1.0)
        if shape is None:
            shape = rh_t.shape
        elif rh_t.shape != shape:
            raise ValueError(f"temp_c_t/rh_t shape mismatch: {shape} vs {rh_t.shape}")

    if shape is None:
        raise ValueError("weather coupling requested multiplier but both temp_c_t and rh_t are None")

    m = np.ones(shape, dtype=np.float32)

    if temp_c_t is not None and temp_gain != 0.0:
        # exp may overflow; clip later
        m *= np.exp(temp_gain * (temp_c_t - temp_ref)).astype(np.float32)

    if rh_t is not None and rh_gain != 0.0:
        m *= np.exp(rh_gain * (rh_ref - rh_t)).astype(np.float32)

    m = np.clip(m, mult_min, mult_max)

    return m


def _validate_weather_arrays(
    temp_c: np.ndarray | None,
    rh: np.ndarray | None,
    T: int,
    H: int,
    W: int,
) -> tuple[np.ndarray | None, np.ndarray | None, int]:
    """
    Validate optional weather arrays to be [T,H,W] (float32) with correct H,W.
    Accepts temp-only or RH-only.

    Returns:
      (temp_c_or_None, rh_or_None, T_weather)

    T_weather is the minimum time extent across whichever arrays are present, capped by T.
    If neither array is present/valid -> (None, None, 0)
    """
    temp_ok = False
    rh_ok = False

    if temp_c is not None:
        try:
            temp_c = np.asarray(temp_c, dtype=np.float32)
            if temp_c.ndim == 3 and temp_c.shape[1] == H and temp_c.shape[2] == W and temp_c.shape[0] > 0:
                temp_ok = True
            else:
                temp_c = None
        except Exception:
            temp_c = None

    if rh is not None:
        try:
            rh = np.asarray(rh, dtype=np.float32)
            if rh.ndim == 3 and rh.shape[1] == H and rh.shape[2] == W and rh.shape[0] > 0:
                rh = np.clip(rh, 0.0, 1.0).astype(np.float32, copy=False)
                rh_ok = True
            else:
                rh = None
        except Exception:
            rh = None

    if not temp_ok and not rh_ok:
        return None, None, 0

    T_weather = T
    if temp_ok:
        T_weather = min(T_weather, int(temp_c.shape[0]))  # type: ignore[union-attr]
    if rh_ok:
        T_weather = min(T_weather, int(rh.shape[0]))  # type: ignore[union-attr]

    if T_weather <= 0:
        return None, None, 0

    return temp_c, rh, int(T_weather)


def simulate_fire(
    man: PhysicalManifest,
    terrain: np.ndarray,
    wind_u: np.ndarray,
    wind_v: np.ndarray,
    fuels: np.ndarray | None = None,
    temperature_c: np.ndarray | None = None,
    humidity_rh: np.ndarray | None = None,
) -> tuple[np.ndarray, np.ndarray]:
    """
    Outputs:
      fire_state: uint8 [T,H,W] 0=unburned,1=burning,2=burned
      arrival_time: int32 [H,W] first t when becomes burning, -1 if never

    Canonical rule:
      - This module NEVER generates weather fields.
      - If coupling is enabled, it uses whatever arrays are provided (temp and/or RH).
      - Coupling may use temp-only or RH-only or both.
    """
    T, H, W = int(man.horizon_steps), int(man.grid.H), int(man.grid.W)
    dt = float(man.dt_seconds)
    cell = float(man.grid.cell_size_m)

    if not np.isfinite(dt) or dt <= 0:
        raise ValueError(f"dt_seconds must be > 0; got {dt}")
    if not np.isfinite(cell) or cell <= 0:
        raise ValueError(f"cell_size_m must be > 0; got {cell}")

    terrain = np.asarray(terrain, dtype=np.float32)
    if terrain.shape != (H, W):
        raise ValueError(f"terrain must have shape (H,W)=({H},{W}); got {terrain.shape}")

    wind_u = np.asarray(wind_u, dtype=np.float32)
    wind_v = np.asarray(wind_v, dtype=np.float32)
    if wind_u.shape != (T, H, W) or wind_v.shape != (T, H, W):
        raise ValueError(
            f"wind_u/wind_v must have shape (T,H,W)=({T},{H},{W}); got {wind_u.shape} / {wind_v.shape}"
        )

    fire_state = np.zeros((T, H, W), dtype=np.uint8)
    arrival = np.full((H, W), -1, dtype=np.int32)

    # current state (for stepping)
    cur = np.zeros((H, W), dtype=np.uint8)  # 0/1/2
    burn_age = np.full((H, W), -1, dtype=np.int16)  # -1 => not burning; else 0..burn_time-1...

    ignitions = _resolve_ignitions(man)

    rng = np.random.default_rng(int(getattr(man, "seed", 0)))
    offsets = _neighborhood_offsets(str(getattr(man.fire, "neighborhood", "moore")))

    base = float(man.fire.spread_prob_base)
    burn_time = max(1, int(man.fire.burn_time_steps))
    wind_gain = float(man.fire.wind_gain)
    slope_gain = float(man.fire.slope_gain)
    det_thresh = float(man.fire.det_threshold)
    det_thresh = float(np.clip(det_thresh, 0.0, 1.0))
    stochastic = (str(man.fire.mode) == "stochastic")

    eps = 1e-9

    # -------------------------
    # Optional: weather coupling (default OFF)
    # -------------------------
    cfg = getattr(man.fire, "weather_coupling", None)
    weather_enabled = bool(cfg is not None and bool(getattr(cfg, "enabled", False)))

    temperature_c, humidity_rh, T_weather = _validate_weather_arrays(temperature_c, humidity_rh, T, H, W)

    if weather_enabled:
        # Coupling requires at least one valid array (temp or RH).
        if temperature_c is None and humidity_rh is None:
            raise ValueError(
                "fire.weather_coupling.enabled=true but neither temperature_c nor humidity_rh was provided. "
                "The orchestrator must pass generated weather arrays into simulate_fire()."
            )
        # Canonical strictness: coupling expects weather arrays to cover the full horizon.
        if T_weather != T:
            raise ValueError(
                f"fire.weather_coupling.enabled=true requires weather arrays with T={T}, "
                f"but got T_weather={T_weather} (provide full-length arrays)."
            )

    # -------------------------
    # Fuels multipliers (v1)
    # -------------------------
    if fuels is None or getattr(fuels, "size", 0) == 0:
        fuels = np.zeros((H, W), dtype=np.uint8)
    else:
        fuels = np.asarray(fuels, dtype=np.uint8)
        if fuels.shape != (H, W):
            raise ValueError(f"fuels must have shape (H,W)=({H},{W}); got {fuels.shape}")

    fuels_spec = getattr(man, "fuels", None)
    spread_mult_code = dict(DEFAULT_SPREAD_MULT)
    burn_mult_code = dict(DEFAULT_BURN_MULT)

    if fuels_spec is not None:
        try:
            spread_mult_code.update(
                {str(k).strip().upper(): float(v) for k, v in (fuels_spec.spread_mult or {}).items()}
            )
            burn_mult_code.update(
                {str(k).strip().upper(): float(v) for k, v in (fuels_spec.burn_mult or {}).items()}
            )
        except Exception:
            pass

    spread_mult_id = np.ones(256, dtype=np.float32)
    burn_mult_id = np.ones(256, dtype=np.float32)
    for code, fid in FUEL_CODE_TO_ID.items():
        if 0 <= int(fid) <= 255:
            c = str(code).strip().upper()
            if c in spread_mult_code:
                spread_mult_id[int(fid)] = float(spread_mult_code[c])
            if c in burn_mult_code:
                burn_mult_id[int(fid)] = float(burn_mult_code[c])

    burn_time_map = (burn_mult_id[fuels.astype(np.int32)] * float(burn_time)).astype(np.float32)
    burn_time_map = np.clip(np.rint(burn_time_map), 1.0, 32767.0).astype(np.int16)

    terrain_enabled = bool(getattr(man, "terrain", None) is not None and bool(getattr(man.terrain, "enabled", False)))

    for t in range(T):
        # Track cells that ignite during this timestep so they do not age immediately.
        ignited_this_step = np.zeros((H, W), dtype=bool)

        # Weather multiplier for this step (computed once per t).
        wmult = None
        if weather_enabled:
            assert cfg is not None
            temp_t = temperature_c[t] if temperature_c is not None else None
            rh_t = humidity_rh[t] if humidity_rh is not None else None
            wmult = _weather_multiplier(temp_t, rh_t, cfg)  # [H,W]

        # 1) apply scheduled ignitions
        for (r0, c0, t0, rad) in ignitions:
            if t != t0:
                continue

            rr0 = max(0, r0 - rad)
            rr1 = min(H, r0 + rad + 1)
            cc0 = max(0, c0 - rad)
            cc1 = min(W, c0 + rad + 1)

            patch = (slice(rr0, rr1), slice(cc0, cc1))

            # avoid cur[patch][new] (can write to a copy)
            cur_patch = cur[patch]
            age_patch = burn_age[patch]
            arr_patch = arrival[patch]

            new = (cur_patch == 0)
            if new.any():
                cur_patch[new] = 1
                ignited_this_step[patch] |= new
                age_patch[new] = 0
                arr_patch[new & (arr_patch < 0)] = t

                cur[patch] = cur_patch
                burn_age[patch] = age_patch
                arrival[patch] = arr_patch

        burning = (cur == 1)
        unburned = (cur == 0)

        ignite_any = np.zeros((H, W), dtype=bool)

        if burning.any():
            u_t = wind_u[t]
            v_t = wind_v[t]
            speed = np.sqrt(u_t * u_t + v_t * v_t)  # m/s
            speed_cells = (speed * dt) / max(cell, eps)  # cells per step

            for (dr, dc) in offsets:
                sr, sc, tr, tc = _shift_slices(H, W, dr, dc)

                src_burning = burning[sr, sc]
                if not src_burning.any():
                    continue

                tgt_unburned = unburned[tr, tc]
                if not tgt_unburned.any():
                    continue

                active = src_burning & tgt_unburned
                if not active.any():
                    continue

                dnorm = float(np.sqrt(dr * dr + dc * dc)) if (dr != 0 or dc != 0) else 1.0

                u = u_t[sr, sc]
                v = v_t[sr, sc]
                sp = speed_cells[sr, sc]

                wnorm = np.sqrt(u * u + v * v)

                wnx = np.zeros_like(u, dtype=np.float32)
                wny = np.zeros_like(v, dtype=np.float32)
                mask = wnorm > eps
                wnx[mask] = u[mask] / wnorm[mask]
                wny[mask] = v[mask] / wnorm[mask]

                # d_hat uses (dc, dr) in grid coords
                ax = (wnx * (dc / dnorm) + wny * (dr / dnorm))  # [-1,1]
                wind_factor = np.exp(wind_gain * ax * sp)

                if terrain_enabled:
                    dz = terrain[tr, tc] - terrain[sr, sc]
                    slope = dz / max(cell, eps)
                    slope_factor = np.exp(slope_gain * slope)
                else:
                    slope_factor = 1.0

                p = base * wind_factor * slope_factor

                # Fuel effect applies to TARGET cell
                fm = spread_mult_id[fuels[tr, tc].astype(np.int32)]
                p = p * fm

                # Weather effect applies to TARGET cell (optional)
                if wmult is not None:
                    p = p * wmult[tr, tc]

                p = np.clip(p, 0.0, 1.0)

                if stochastic:
                    r = rng.random(p.shape)
                    ign = (r < p) & active
                else:
                    ign = (p >= det_thresh) & active

                if ign.any():
                    ignite_any[tr, tc] |= ign

        # 3) apply ignitions
        if ignite_any.any():
            new = ignite_any & (cur == 0)
            if new.any():
                ignited_this_step[new] = True
                cur[new] = 1
                burn_age[new] = 0
                arrival[new & (arrival < 0)] = t

        # 4) aging burning → burned (per-cell burn time)
        burning = (cur == 1)
        if burning.any():
            aging = burning & (~ignited_this_step)
            if aging.any():
                burn_age[aging] += 1
                to_burned = aging & (burn_age >= burn_time_map)
                if to_burned.any():
                    cur[to_burned] = 2
                    burn_age[to_burned] = -1

        fire_state[t] = cur

    return fire_state, arrival


__all__ = ["simulate_fire"]
