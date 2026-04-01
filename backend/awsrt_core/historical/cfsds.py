# backend/awsrt_core/historical/cfsds.py
from __future__ import annotations

from dataclasses import dataclass
from typing import Callable
from pathlib import Path
from typing import Optional, Tuple

import numpy as np

from awsrt_core.io.paths import DATA_DIR

try:  # pragma: no cover
    import pandas as pd
except Exception:  # pragma: no cover
    pd = None  # type: ignore

try:  # pragma: no cover
    import rasterio
except Exception:  # pragma: no cover
    rasterio = None  # type: ignore

try:  # pragma: no cover
    from scipy.ndimage import distance_transform_edt  # type: ignore
except Exception:  # pragma: no cover
    distance_transform_edt = None  # type: ignore


@dataclass(frozen=True)
class CFSDSBundle:
    fire_id: str
    root: Path
    krig_tif: Path
    groups_csv: Optional[Path] = None
    points_csv: Optional[Path] = None
    bundle_json: Optional[Path] = None


def _pick_first(globbed: list[Path]) -> Optional[Path]:
    globbed = [p for p in globbed if p.exists()]
    return sorted(globbed)[0] if globbed else None


def find_cfsds_bundle(fire_id: str, *, root: Optional[Path] = None) -> CFSDSBundle:
    """
    Find the on-disk files for a fire id under data/cfsds/.

    Preferred layout:
      data/cfsds/{fire_id}/
        {fire_id}_krig.tif
        Firegrowth_groups_v1_1_{fire_id}.csv
        Firegrowth_pts_v1_1_{fire_id}.csv
        bundle.json

    Falls back to globbing for backwards compatibility.
    """
    root = (root or (DATA_DIR / "cfsds")).resolve()
    fire_dir = (root / fire_id).resolve()

    bundle_json = fire_dir / "bundle.json"
    bundle_json_path = bundle_json if bundle_json.exists() else None

    # Preferred: exact filenames
    tif = fire_dir / f"{fire_id}_krig.tif"
    groups = fire_dir / f"Firegrowth_groups_v1_1_{fire_id}.csv"
    points = fire_dir / f"Firegrowth_pts_v1_1_{fire_id}.csv"

    if tif.exists():
        return CFSDSBundle(
            fire_id=fire_id,
            root=root,
            krig_tif=tif,
            groups_csv=groups if groups.exists() else None,
            points_csv=points if points.exists() else None,
            bundle_json=bundle_json_path,
        )

    # Fallback: older layouts / flexible naming
    roots = [root, fire_dir]

    tif2: Optional[Path] = None
    for r in roots:
        tif2 = _pick_first(list(r.glob(f"*{fire_id}*krig*.tif")))
        if tif2:
            break
    if tif2 is None:
        raise FileNotFoundError(f"CFSDS GeoTIFF not found for fire_id={fire_id} under {root}")

    groups2: Optional[Path] = None
    points2: Optional[Path] = None
    for r in roots:
        if groups2 is None:
            groups2 = _pick_first(list(r.glob(f"*{fire_id}*groups*.csv")))
        if points2 is None:
            points2 = _pick_first(list(r.glob(f"*{fire_id}*pts*.csv")))
        if groups2 and points2:
            break

    # Try to find bundle.json in fallback roots too
    bj2 = None
    for r in roots:
        p = r / "bundle.json"
        if p.exists():
            bj2 = p
            break

    return CFSDSBundle(
        fire_id=fire_id,
        root=root,
        krig_tif=tif2,
        groups_csv=groups2,
        points_csv=points2,
        bundle_json=bj2,
    )


@dataclass(frozen=True)
class KrigRaster:
    """
    The krig GeoTIFF interpreted as a DOB (day-of-year) raster.
    """

    dob_doy: np.ndarray  # uint16, (H,W), 0 where nodata/unburned
    day_of_burn: np.ndarray  # int16/int32, (H,W), 0 where unburned; 1..D where D=max
    doy0: int  # min finite DOB in raster
    transform: object  # rasterio.Affine
    crs_wkt: str | None
    cell_size_m: float


def load_krig_day_of_burn(bundle: CFSDSBundle) -> KrigRaster:
    """
    Reads the GeoTIFF and converts it to:
      - dob_doy: raw day-of-year values (0 for nodata)
      - day_of_burn: relative day index (1..D), with D = max(dob_doy)-min(dob_doy)+1

    Assumption (works for 2016_255):
      TIFF pixel values represent DOB day-of-year (e.g., 122..229).
    """
    if rasterio is None:
        raise RuntimeError("rasterio is required to read GeoTIFFs (pip install rasterio)")

    with rasterio.open(bundle.krig_tif) as src:
        arr = src.read(1)  # uint32
        nodata = src.nodata
        transform = src.transform
        crs_wkt = src.crs.to_wkt() if src.crs else None
        cell = float(abs(transform.a))

    if nodata is None:
        mask = np.zeros_like(arr, dtype=bool)
    else:
        mask = arr == np.uint32(nodata)

    finite = arr[~mask]
    if finite.size == 0:
        raise ValueError(f"{bundle.krig_tif} contains no finite pixels after nodata masking")

    doy0 = int(finite.min())

    dob_doy = np.zeros(arr.shape, dtype=np.uint16)
    dob_doy[~mask] = finite.astype(np.uint16)

    day_of_burn = np.zeros(arr.shape, dtype=np.int16)
    day_of_burn[~mask] = (dob_doy[~mask].astype(np.int32) - doy0 + 1).astype(np.int16)

    return KrigRaster(
        dob_doy=dob_doy,
        day_of_burn=day_of_burn,
        doy0=doy0,
        transform=transform,
        crs_wkt=crs_wkt,
        cell_size_m=cell,
    )


def load_groups_csv(bundle: CFSDSBundle):
    """
    Optional: load the groups CSV (timeline backbone).
    Returns a pandas DataFrame or None if unavailable.
    """
    if bundle.groups_csv is None:
        return None
    if pd is None:
        raise RuntimeError("pandas is required to read CFSDS CSVs (pip install pandas)")
    df = pd.read_csv(bundle.groups_csv)
    if "ID" in df.columns:
        df = df[df["ID"].astype(str) == str(bundle.fire_id)]
    if "fireday" in df.columns:
        df = df.sort_values("fireday")
    return df


def load_points_csv(bundle: CFSDSBundle):
    """
    Optional: load the points CSV (cell-level attributes).
    Returns a pandas DataFrame or None if unavailable.
    """
    if bundle.points_csv is None:
        return None
    if pd is None:
        raise RuntimeError("pandas is required to read CFSDS CSVs (pip install pandas)")
    df = pd.read_csv(bundle.points_csv)
    if "ID" in df.columns:
        df = df[df["ID"].astype(str) == str(bundle.fire_id)]
    return df


def build_dem_terrain_from_points(bundle: CFSDSBundle, *, H: int, W: int, transform: object) -> Tuple[np.ndarray, np.ndarray]:
    """
    Build a DEM raster aligned to the krig GeoTIFF grid from the points CSV.

    Outputs:
      - terrain_dem_m: float32 (meters), filled across the grid
      - terrain: float32 normalized 0..1 (derived from terrain_dem_m)

    Requirements:
      - points CSV must contain columns: lon, lat, dem
      - GeoTIFF must have a CRS (used to project lon/lat into raster coordinates)

    Fill policy:
      - aggregate multiple points in a cell by mean
      - fill remaining gaps by nearest-neighbor (SciPy if available),
        otherwise an iterative 4-neighbor NaN fill fallback
    """
    if rasterio is None:
        raise RuntimeError("rasterio is required to rasterize points (pip install rasterio)")
    if pd is None:
        raise RuntimeError("pandas is required to read CFSDS CSVs (pip install pandas)")

    df = load_points_csv(bundle)
    if df is None or len(df) == 0:
        raise FileNotFoundError("CFSDS points CSV not found or empty for this fire_id")

    need = {"lon", "lat", "dem"}
    missing = [c for c in need if c not in df.columns]
    if missing:
        raise ValueError(f"points CSV missing required columns: {missing}")

    d = df[["lon", "lat", "dem"]].copy()
    d = d.replace([np.inf, -np.inf], np.nan).dropna()
    if len(d) == 0:
        raise ValueError("points CSV has no finite lon/lat/dem rows after filtering")

    # Destination CRS from the GeoTIFF
    with rasterio.open(bundle.krig_tif) as src:
        dst_crs = src.crs
    if dst_crs is None:
        raise ValueError("GeoTIFF has no CRS; cannot transform lon/lat -> raster coordinates")
    # NOTE: rasterio 1.4.x may not expose submodules as attributes (e.g., rasterio.warp),
    # so calling rasterio.warp.transform(...) can raise AttributeError.
    try:
        from rasterio.warp import transform as crs_transform  # type: ignore
    except Exception as e:
        raise RuntimeError("Failed to import rasterio.warp.transform") from e

    try:
        from rasterio.transform import rowcol  # type: ignore
    except Exception as e:
        raise RuntimeError("Failed to import rasterio.transform.rowcol") from e


    lons = d["lon"].astype(float).to_numpy()
    lats = d["lat"].astype(float).to_numpy()
    xs, ys = crs_transform("EPSG:4326", dst_crs, lons, lats)

    rr, cc = rowcol(transform, xs, ys)
    rr = np.asarray(rr, dtype=np.int32)
    cc = np.asarray(cc, dtype=np.int32)

    inside = (rr >= 0) & (rr < H) & (cc >= 0) & (cc < W)
    rr = rr[inside]
    cc = cc[inside]
    dem = d["dem"].astype(float).to_numpy()[inside]
    if dem.size == 0:
        raise ValueError("No points fell inside the raster bounds after CRS transform")

    lin = rr * W + cc
    counts = np.bincount(lin, minlength=H * W).astype(np.float32)
    sums = np.bincount(lin, weights=dem, minlength=H * W).astype(np.float32)

    out = np.full(H * W, np.nan, dtype=np.float32)
    ok = counts > 0
    out[ok] = sums[ok] / counts[ok]
    terrain_dem_m = out.reshape(H, W)

    # Fill gaps
    valid = np.isfinite(terrain_dem_m)
    if valid.any() and (~valid).any():
        if distance_transform_edt is not None:
            # nearest-neighbor fill using indices to nearest valid cell
            ind = distance_transform_edt(~valid, return_indices=True, return_distances=False)
            r0 = ind[0]
            c0 = ind[1]
            filled = terrain_dem_m.copy()
            filled[~valid] = terrain_dem_m[r0[~valid], c0[~valid]]
            terrain_dem_m = filled.astype(np.float32)
        else:
            # fallback: iterative 4-neighbor mean fill (wrap-around via roll; rarely used)
            filled = terrain_dem_m.copy()
            for _ in range(50):
                nan = ~np.isfinite(filled)
                if not nan.any():
                    break
                up = np.roll(filled, 1, axis=0)
                dn = np.roll(filled, -1, axis=0)
                lf = np.roll(filled, 1, axis=1)
                rt = np.roll(filled, -1, axis=1)
                stack = np.stack([up, dn, lf, rt], axis=0)
                m = np.nanmean(stack, axis=0)
                filled[nan] = m[nan]
            terrain_dem_m = np.nan_to_num(filled, nan=0.0).astype(np.float32)

    # Normalize to 0..1
    finite = np.isfinite(terrain_dem_m)
    if not finite.any():
        terrain = np.zeros((H, W), dtype=np.float32)
    else:
        mn = float(np.nanmin(terrain_dem_m[finite]))
        mx = float(np.nanmax(terrain_dem_m[finite]))
        if not np.isfinite(mn) or not np.isfinite(mx) or mx <= mn:
            terrain = np.zeros((H, W), dtype=np.float32)
        else:
            terrain = ((terrain_dem_m - mn) / (mx - mn)).astype(np.float32)
            terrain = np.clip(terrain, 0.0, 1.0)

    return terrain_dem_m.astype(np.float32), terrain.astype(np.float32)
