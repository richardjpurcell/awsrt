# backend/awsrt_core/historical/replay.py
from __future__ import annotations

from dataclasses import dataclass
from typing import Tuple

import numpy as np

from awsrt_core.historical.cfsds import (
    build_dem_terrain_from_points,
    find_cfsds_bundle,
    load_groups_csv,
    load_krig_day_of_burn,
)
from awsrt_core.io.ids import new_id
from awsrt_core.io.paths import renders_dir, save_manifest, write_field
from awsrt_core.io.renders import render_legend_png
from awsrt_core.schemas.physical import (
    GridSpec,
    HistoricalImportRequest,
    HistoricalMeta,
    PhysicalManifest,
)

# Optional SciPy distance transform; falls back to a simpler scheme if missing.
try:  # pragma: no cover
    from scipy.ndimage import distance_transform_edt  # type: ignore
except Exception:  # pragma: no cover
    distance_transform_edt = None  # type: ignore


@dataclass
class HistoricalRunSpec:
    """
    Internal spec for constructing a historical replay run.
    """
    fire_id: str
    datasource: str
    label: str | None
    H: int
    W: int
    days: int
    dt_seconds: int
    burn_duration_hours: int


def make_synthetic_daily_burn(H: int, W: int, days: int) -> np.ndarray:
    """
    Synthetic daily burn map: concentric-ish front expanding from the center.

    Returns:
      D: int32 array of shape (H, W), values:
        0      = never burns
        1..D   = day-of-burning (1-based)
    """
    yy, xx = np.mgrid[0:H, 0:W]
    cy, cx = H / 2.0, W / 2.0
    r = np.sqrt((yy - cy) ** 2 + (xx - cx) ** 2)

    r_max = float(r.max() + 1e-6)
    frac = r / r_max  # 0..1

    D = np.zeros((H, W), dtype=np.int32)
    for k in range(1, days + 1):
        lower = (k - 1) / days
        upper = k / days
        mask = (frac >= lower) & (frac < upper)
        D[mask] = k

    # Ensure the center burns on day 1 so we always have a core
    D[int(cy), int(cx)] = max(1, min(days, int(D[int(cy), int(cx)] or 1)))
    return D


def arrival_times_from_daily(day_of_burn: np.ndarray) -> np.ndarray:
    """
    Compute continuous arrival times tau(i,j) in DAYS from integer day-of-burn.

    Invariants:
      - If D[i,j] == k > 0, then tau(i,j) ∈ (k-1, k].
      - If D[i,j] == 0, tau(i,j) = +inf.
    """
    D = np.asarray(day_of_burn, dtype=np.int32)

    tau = np.full(D.shape, np.inf, dtype=np.float32)

    burn_mask = D > 0
    if not burn_mask.any():
        return tau

    D_max = int(D[burn_mask].max())

    for k in range(1, D_max + 1):
        day_mask = D == k
        if not day_mask.any():
            continue

        prev_mask = (D > 0) & (D < k)

        if distance_transform_edt is not None and prev_mask.any():
            # Distance to previously burned region
            dist_to_prev = distance_transform_edt(~prev_mask)
            d = dist_to_prev[day_mask]
        else:
            # Fallback: flat within-day timing if SciPy is missing or no previous fire
            d = np.zeros(day_mask.sum(), dtype=np.float32)

        if d.size == 0:
            continue

        if d.max() > 0:
            alpha_raw = d / d.max()
        else:
            alpha_raw = np.zeros_like(d)

        # Monotone within-day progression: nearest first.
        n = alpha_raw.size
        order = np.argsort(alpha_raw)
        alpha = np.empty_like(alpha_raw)
        alpha[order] = (np.arange(n) + 1) / n  # 1/n .. 1

        tau[day_mask] = (k - 1.0) + alpha

    return tau


def fire_state_from_arrival_times(
    tau: np.ndarray,
    dt_seconds: int,
    burn_duration_hours: int,
    post_burn_steps: int = 24,
) -> Tuple[np.ndarray, int]:
    """
    Map continuous arrival times tau(i,j) to discrete fire_state[t,i,j].

      0 -> unburned
      1 -> burning
      2 -> burned
    """
    H, W = tau.shape
    dt_days = dt_seconds / 86400.0

    arrival_mask = np.isfinite(tau)

    t_arrival = np.full((H, W), -1, dtype=np.int32)

    scaled = tau[arrival_mask] / dt_days
    # Nudge toward -inf so exact boundaries stay in the intended (k-1, k] bucket.
    scaled = np.nextafter(scaled, -np.inf)

    t_arrival[arrival_mask] = np.floor(scaled).astype(np.int32)
    t_arrival[t_arrival < 0] = 0

    burn_duration_steps = int(round((burn_duration_hours * 3600) / dt_seconds))
    if burn_duration_steps < 1:
        burn_duration_steps = 1

    if arrival_mask.any():
        max_start = int(t_arrival[arrival_mask].max())
        T = max_start + burn_duration_steps + post_burn_steps
    else:
        T = 1

    fire_state = np.zeros((T, H, W), dtype=np.uint8)

    for t in range(T):
        t_rel = t - t_arrival  # broadcast

        burning = arrival_mask & (t_rel >= 0) & (t_rel < burn_duration_steps)
        burned = arrival_mask & (t_rel >= burn_duration_steps)

        if burning.any():
            fire_state[t][burning] = np.uint8(1)
        if burned.any():
            fire_state[t][burned] = np.uint8(2)

    return fire_state, burn_duration_steps


def _build_manifest(phy_id: str, spec: HistoricalRunSpec, T: int) -> PhysicalManifest:
    grid = GridSpec(H=spec.H, W=spec.W)
    return PhysicalManifest(
        grid=grid,
        dt_seconds=spec.dt_seconds,
        horizon_steps=T,
        seed=0,
        source="historical_cfsds",
        historical=HistoricalMeta(
            datasource=spec.datasource,
            fire_id=spec.fire_id,
            label=spec.label,
        ),
    )


def _write_belief_legend(phy_id: str) -> None:
    rd = renders_dir(phy_id)
    render_legend_png(
        rd / "legend_belief.png",
        cmap="viridis",
        label="belief (p)",
        vmin=0.0,
        vmax=1.0,
    )


def create_historical_demo_run(req: HistoricalImportRequest) -> str:
    spec = HistoricalRunSpec(
        fire_id=req.fire_id,
        datasource=req.source,
        label=req.label,
        H=int(req.H),
        W=int(req.W),
        days=int(req.days),
        dt_seconds=int(req.dt_seconds),
        burn_duration_hours=int(req.burn_duration_hours),
    )

    H, W = spec.H, spec.W

    day_of_burn = make_synthetic_daily_burn(H, W, days=spec.days)
    tau = arrival_times_from_daily(day_of_burn)
    fire_state, burn_duration_steps = fire_state_from_arrival_times(
        tau,
        dt_seconds=spec.dt_seconds,
        burn_duration_hours=spec.burn_duration_hours,
    )
    T = int(fire_state.shape[0])

    # Synthetic terrain + DEM for demo runs (no disk IO).
    yy, _xx = np.mgrid[0:H, 0:W]
    terrain = (yy / max(H - 1, 1)).astype(np.float32)          # 0..1
    terrain_dem_m = (terrain * 1000.0).astype(np.float32)      # meters

    belief = np.full((T, H, W), 0.5, dtype=np.float32)

    phy_id = new_id("phy")

    write_field(phy_id, "terrain_dem_m", terrain_dem_m)
    write_field(phy_id, "terrain", terrain)
    write_field(phy_id, "fire_state", fire_state)
    write_field(phy_id, "arrival_time", tau.astype(np.float32))
    write_field(phy_id, "belief", belief)

    man = _build_manifest(phy_id, spec, T)
    save_manifest(phy_id, man.model_dump())

    _write_belief_legend(phy_id)
    return phy_id


def create_historical_cfsds_run(req: HistoricalImportRequest) -> str:
    """
    Create a historical replay run from on-disk CFSDS artifacts in data/cfsds/.

    Writes fields:
      - dob_doy (H,W) uint16
      - day_of_burn (H,W) int16
      - arrival_time (H,W) float32  [days]
      - fire_state (T,H,W) uint8
      - terrain_dem_m (H,W) float32 meters (if points CSV available)
      - terrain (H,W) float32 normalized 0..1 (from DEM if available; otherwise placeholder)
      - belief (T,H,W) float32 (0.5 placeholder)
    """
    bundle = find_cfsds_bundle(req.fire_id)
    kr = load_krig_day_of_burn(bundle)

    day_of_burn = kr.day_of_burn.astype(np.int32)
    H, W = day_of_burn.shape

    tau = arrival_times_from_daily(day_of_burn)
    fire_state, burn_duration_steps = fire_state_from_arrival_times(
        tau,
        dt_seconds=int(req.dt_seconds),
        burn_duration_hours=int(req.burn_duration_hours),
    )
    T = int(fire_state.shape[0])

    # Default terrain (fallback): 0..1 slope
    yy, _xx = np.mgrid[0:H, 0:W]
    terrain_norm = (yy / max(H - 1, 1)).astype(np.float32)
    terrain_dem_m = None

    # NEW: derive DEM-backed terrain from points CSV if available.
    dem_notes = "dem=missing"
    try:
        dem_m, terr01 = build_dem_terrain_from_points(bundle, H=H, W=W, transform=kr.transform)
        terrain_dem_m = dem_m.astype(np.float32)
        terrain_norm = terr01.astype(np.float32)
        if np.isfinite(terrain_dem_m).any():
            mn = float(np.nanmin(terrain_dem_m[np.isfinite(terrain_dem_m)]))
            mx = float(np.nanmax(terrain_dem_m[np.isfinite(terrain_dem_m)]))
            dem_notes = f"dem=ok[{mn:.3g},{mx:.3g}]m"
        else:
            dem_notes = "dem=ok[nonfinite]"
    except Exception as e:
        # Keep run usable even if DEM build fails.
        dem_notes = f"dem=failed({type(e).__name__})"

    belief = np.full((T, H, W), 0.5, dtype=np.float32)

    phy_id = new_id("phy")

    write_field(phy_id, "dob_doy", kr.dob_doy)
    write_field(phy_id, "day_of_burn", day_of_burn.astype(np.int16))
    write_field(phy_id, "arrival_time", tau.astype(np.float32))
    write_field(phy_id, "fire_state", fire_state)

    # Always write normalized terrain (UI base layer)
    write_field(phy_id, "terrain", terrain_norm)

    # If we successfully built DEM meters, write it too (enables “Terrain DEM (m)” option)
    if terrain_dem_m is not None:
        write_field(phy_id, "terrain_dem_m", terrain_dem_m)

    write_field(phy_id, "belief", belief)

    grid = GridSpec(
        H=H,
        W=W,
        cell_size_m=float(kr.cell_size_m),
        crs_code="CFSDS_LCC_NAD83",
        origin_x=float(kr.transform.c),
        origin_y=float(kr.transform.f),
    )

    notes_bits = [
        f"cfsds.krig_tif={bundle.krig_tif.name}",
        f"dob_doy_min={kr.doy0}",
        f"dob_span_days={int(day_of_burn.max())}",
        "native_dt_seconds=86400",
        f"dt_seconds={int(req.dt_seconds)}",
        f"burn_duration_steps={burn_duration_steps}",
        dem_notes,
    ]
    if kr.crs_wkt:
        notes_bits.append(f"crs_wkt={kr.crs_wkt}")

    try:
        gdf = load_groups_csv(bundle)
    except Exception:
        gdf = None
    if gdf is not None and "fireday" in getattr(gdf, "columns", []):
        notes_bits.append(f"groups_rows={len(gdf)}")

    man = PhysicalManifest(
        grid=grid,
        dt_seconds=int(req.dt_seconds),
        horizon_steps=T,
        seed=0,
        source="historical_cfsds",
        historical=HistoricalMeta(
            datasource="cfsds",
            fire_id=req.fire_id,
            label=req.label,
            notes=" | ".join(notes_bits),
        ),
    )
    save_manifest(phy_id, man.model_dump())

    _write_belief_legend(phy_id)
    return phy_id
