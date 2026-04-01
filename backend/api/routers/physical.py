# backend/api/routers/physical.py
from __future__ import annotations

import json
import shutil
import os
import time
from pathlib import Path
from typing import Any

import numpy as np
from fastapi import APIRouter, HTTPException, Query, Request
from fastapi.responses import FileResponse, Response

from awsrt_core.historical.replay import (
    create_historical_cfsds_run,
    create_historical_demo_run,
)
from awsrt_core.io.ids import new_id
from awsrt_core.io.paths import (
    delete_run_artifacts,
    fields_dir,
    fields_zarr_group_path,
    list_fields,
    list_manifests,
    load_manifest,
    metrics_dir,
    open_fields_group,
    renders_dir,
    renders_t_dir,
    save_manifest,
    write_field,
)
from awsrt_core.io.renders import (
    render_categorical_png,
    render_discrete_legend_png,
    render_fire_state_png,
    render_legend_png,
    render_scalar_png,
    render_wind_arrows_png,
)
from awsrt_core.metrics.basic import write_summary_json
from awsrt_core.schemas.common import ListResponse, MetaResponse, RunRequest
from awsrt_core.schemas.physical import HistoricalImportRequest, PhysicalManifest
from awsrt_core.sim.physical import run_physical  # canonical orchestrator (no backward compat)

# Optional PIL for PNG upscaling (QoL for large historical grids)
try:  # pragma: no cover
    from PIL import Image  # type: ignore
except Exception:  # pragma: no cover
    Image = None  # type: ignore


router = APIRouter()


# -------------------------
# Helpers
# -------------------------


def _open_fields_root_or_404(phy_id: str):
    try:
        return open_fields_group(phy_id, mode="r")
    except Exception:
        raise HTTPException(status_code=404, detail="Run fields not found (did you run the sim?)")


def _require_field(root, name: str):
    if name not in root:
        raise HTTPException(status_code=404, detail=f"Field not available: {name}")
    return root[name]


def _reset_run_outputs_keep_manifest(phy_id: str) -> None:
    """
    Canonical behavior:
    - If you re-run the same phy_id after changing the manifest (e.g., disabling fuels/weather),
      we must wipe old datasets; otherwise /fields will lie.

    Keep the manifest, but reset:
      - fields/{phy_id}/fields.zarr  (wipe datasets)
      - renders/{phy_id}/            (wipe cached pngs)
      - metrics/{phy_id}/            (wipe prior summary)
    """
    # wipe fields.zarr (datasets)
    try:
        p = fields_zarr_group_path(phy_id)
        if p.exists():
            shutil.rmtree(p, ignore_errors=True)
    except Exception:
        pass

    # wipe cached artifacts (do NOT rely on helper dirs having created them)
    for d in (Path(renders_dir(phy_id)), Path(metrics_dir(phy_id))):
        try:
            if d.exists():
                shutil.rmtree(d, ignore_errors=True)
        except Exception:
            pass

    # re-create dirs lazily on demand
    fields_dir(phy_id)
    renders_dir(phy_id)
    metrics_dir(phy_id)


def _load_summary_or_none(phy_id: str) -> dict[str, Any] | None:
    """
    Read metrics/{phy_id}/summary.json if present.
    Used to keep consistent color scales across timesteps without re-scanning arrays.
    """
    p = metrics_dir(phy_id) / "summary.json"
    try:
        if not p.exists():
            return None
        with p.open("r", encoding="utf-8") as f:
            data = json.load(f)
        return data if isinstance(data, dict) else None
    except Exception:
        return None


def _finite_minmax(x: np.ndarray) -> tuple[float | None, float | None]:
    x = np.asarray(x)
    finite = np.isfinite(x)
    if not finite.any():
        return None, None
    return float(np.nanmin(x[finite])), float(np.nanmax(x[finite]))


def _sampled_view(x: np.ndarray, *, max_samples: int = 200_000) -> np.ndarray:
    """
    Return a strided 1D view that samples up to max_samples elements.
    Avoids full scans of huge arrays when computing display scales.
    """
    x = np.asarray(x)
    if x.size <= max_samples:
        return x.reshape(-1)
    step = max(1, int(x.size // max_samples))
    return x.reshape(-1)[::step]


def _sampled_finite_minmax(x: np.ndarray, *, max_samples: int = 200_000) -> tuple[float | None, float | None]:
    xs = _sampled_view(x, max_samples=max_samples)
    finite = np.isfinite(xs)
    if not finite.any():
        return None, None
    return float(np.nanmin(xs[finite])), float(np.nanmax(xs[finite]))


def _sampled_finite_absmax(x: np.ndarray, *, max_samples: int = 200_000) -> float | None:
    xs = _sampled_view(x, max_samples=max_samples)
    finite = np.isfinite(xs)
    if not finite.any():
        return None
    return float(np.nanmax(np.abs(xs[finite])))


def _sampled_wind_speed_max(wind_u: np.ndarray, wind_v: np.ndarray, *, max_samples: int = 200_000) -> float | None:
    """
    Approximate global max wind speed without materializing full sqrt(u^2+v^2) over (T,H,W).
    Uses matched sampling over flattened u/v arrays.
    """
    u = np.asarray(wind_u, dtype=np.float32).reshape(-1)
    v = np.asarray(wind_v, dtype=np.float32).reshape(-1)
    if u.size == 0:
        return None

    if u.size <= max_samples:
        us = u
        vs = v
    else:
        step = max(1, int(u.size // max_samples))
        us = u[::step]
        vs = v[::step]

    speed = np.sqrt(us * us + vs * vs)
    finite = np.isfinite(speed)
    if not finite.any():
        return None
    return float(np.nanmax(speed[finite]))


def _is_protected_run(manifest: dict[str, Any]) -> bool:
    """
    Protect historical replays from deletion.
    Convention:
      - simulated runs: source == "simulated" (deletable)
      - replays: source != "simulated" (protected)
    """
    src = str(manifest.get("source", "simulated"))
    return src != "simulated"


def _display_name(manifest: dict[str, Any], run_id: str) -> str:
    """
    Human-friendly name for UI.
    """
    src = str(manifest.get("source", "simulated"))
    hist = manifest.get("historical") or {}
    if isinstance(hist, dict):
        fire_id = hist.get("fire_id")
        label = hist.get("label")
    else:
        fire_id, label = None, None

    if src != "simulated":
        if isinstance(label, str) and label.strip():
            return label.strip()
        if isinstance(fire_id, str) and fire_id.strip():
            return f"{fire_id.strip()} (replay)"
        return f"{run_id} (replay)"
    return run_id


def _effective_px(H: int, W: int, px: int, max_dim: int) -> int:
    """
    Clamp px so the largest side does not exceed max_dim.
    """
    px = int(px)
    if px <= 1:
        return 1
    max_side = max(int(H), int(W))
    if max_side <= 0:
        return 1
    px_cap = max(1, int(max_dim // max_side))
    return max(1, min(px, px_cap))

def _tmp_png_path(out: Path) -> Path:
    """
    Temp path for atomic PNG writes that **keeps the .png suffix**.
    Matplotlib infers output format from the filename extension; writing to
    *.png.tmp (or *.tmp) makes it think format='tmp' and it will fail.

    Example:
      out = ".../fire_alpha.png"
      tmp = ".../fire_alpha.tmp.png"
    """
    return out.with_name(f"{out.stem}.tmp{out.suffix}")


def _file_etag(p: Path) -> str:
    """
    Weak ETag based on mtime + size.
    Sufficient for immutable render artifacts on local disk.
    """
    st = p.stat()
    return f'W/"{st.st_mtime_ns:x}-{st.st_size:x}"'


def _serve_png(request: Request, out: Path) -> Response:
    """
    Serve a PNG with proper caching headers and conditional GET (304).
    Works for both GET and HEAD.
    """
    st = out.stat()
    etag = _file_etag(out)
    last_mod = time.strftime("%a, %d %b %Y %H:%M:%S GMT", time.gmtime(st.st_mtime))

    headers = {
        "ETag": etag,
        "Last-Modified": last_mod,
        # Images are immutable once written (path includes t + params)
        "Cache-Control": "public, max-age=31536000, immutable",
    }

    inm = request.headers.get("if-none-match")
    if inm and inm == etag:
        return Response(status_code=304, headers=headers)

    return FileResponse(out, headers=headers, media_type="image/png")


def _maybe_upscale_png_inplace(out: Path, *, px: int) -> None:
    """
    Upscale an already-rendered PNG in-place for crisper viewing on large grids.
    Uses nearest-neighbor to preserve cell boundaries.

    No-op if px <= 1 or Pillow is unavailable.
    """
    if px <= 1:
        return
    if Image is None:
        return
    try:
        im = Image.open(out)
        w, h = im.size
        im2 = im.resize((w * px, h * px), resample=Image.NEAREST)
        im2.save(out)
    except Exception:
        # Rendering should still succeed even if upscale fails.
        return


# -------------------------
# Manifest CRUD
# -------------------------


@router.post("/manifest")
def create_manifest(manifest: PhysicalManifest) -> dict[str, str]:
    phy_id = new_id("phy")
    save_manifest(phy_id, manifest.model_dump())
    return {"phy_id": phy_id}


@router.get("/list", response_model=ListResponse)
def list_runs() -> ListResponse:
    # Backward-compatible: keep the old response exactly.
    return ListResponse(ids=list_manifests("phy"))


@router.get("/list_details")
def list_runs_details() -> dict[str, Any]:
    """
    QoL endpoint for UIs: provides labels + provenance while keeping /list unchanged.
    """
    ids = list_manifests("phy")
    items: list[dict[str, Any]] = []
    for rid in ids:
        try:
            m = load_manifest(rid)
        except Exception:
            continue
        items.append(
            {
                "id": rid,
                "source": str(m.get("source", "simulated")),
                "protected": bool(_is_protected_run(m)),
                "display_name": _display_name(m, rid),
                "historical": m.get("historical", None),
            }
        )
    return {"ids": ids, "items": items}


@router.post("/historical/import")
def import_historical_run(req: HistoricalImportRequest) -> dict[str, str]:
    if req.source == "cfsds_demo":
        phy_id = create_historical_demo_run(req)
    elif req.source == "cfsds":
        phy_id = create_historical_cfsds_run(req)
    else:
        raise HTTPException(status_code=400, detail="Unsupported historical source")
    return {"phy_id": phy_id}


@router.get("/{phy_id}/manifest")
def get_manifest(phy_id: str) -> dict:
    try:
        return load_manifest(phy_id)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Manifest not found")


@router.delete("/{phy_id}")
def delete_run(phy_id: str, force: bool = Query(False, description="If true, delete even if dependent runs exist.")) -> dict:
    # Delete ONLY the physical run artifacts (does not cascade into epi/opr).
    try:
        m = load_manifest(phy_id)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Manifest not found")

    if _is_protected_run(m):
        raise HTTPException(status_code=403, detail="Historical replays are protected and cannot be deleted.")
    # Dependency warning: if epistemic runs reference this physical run, require force=true.
    dependents: list[str] = []
    try:
        epi_ids = list_manifests("epi")
        for eid in epi_ids:
            try:
                em = load_manifest(eid)
            except Exception:
                continue
            if isinstance(em, dict) and str(em.get("phy_id", "")) == str(phy_id):
                dependents.append(str(eid))
    except Exception:
        # If scanning fails, do not block deletion (keep behavior minimal); UI warning can still be best-effort later.
        dependents = dependents

    if dependents and not bool(force):
        raise HTTPException(
            status_code=409,
            detail={
                "message": "physical run has dependent epistemic runs",
                "phy_id": phy_id,
                "dependents": dependents,
            },
        )

    return delete_run_artifacts(phy_id)


@router.get("/{phy_id}/meta", response_model=MetaResponse)
def meta(phy_id: str) -> MetaResponse:
    try:
        m = load_manifest(phy_id)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Manifest not found")

    H = int(m["grid"]["H"])
    W = int(m["grid"]["W"])
    T = int(m["horizon_steps"])
    return MetaResponse(
        id=phy_id,
        H=H,
        W=W,
        T=T,
        dt_seconds=int(m["dt_seconds"]),
        horizon_steps=T,
        crs_code=str(m["grid"].get("crs_code", "")),
        cell_size_m=float(m["grid"]["cell_size_m"]),
    )


@router.get("/{phy_id}/fields")
def fields(phy_id: str) -> dict[str, list[str]]:
    """
    Returns available field dataset names stored for this run.
    Canonical way for the frontend Visualizer to avoid offering unavailable layers.
    """
    try:
        return {"fields": list_fields(phy_id)}
    except Exception:
        raise HTTPException(status_code=404, detail="Run fields not found (did you run the sim?)")


# -------------------------
# Run orchestration (canonical)
# -------------------------


@router.post("/run")
def run(req: RunRequest) -> dict[str, Any]:
    phy_id = req.id
    try:
        raw = load_manifest(phy_id)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Manifest not found")

    # NOTE: ValidationError import omitted here because it existed in your prior file;
    # leaving your behavior unchanged. If you want, we can patch that separately.
    m = PhysicalManifest.model_validate(raw)

    H, W = int(m.grid.H), int(m.grid.W)
    T = int(m.horizon_steps)

    # Reset old run outputs so /fields stays truthful if the manifest changed.
    _reset_run_outputs_keep_manifest(phy_id)

    def store(name: str, arr: np.ndarray) -> None:
        write_field(phy_id, name, np.asarray(arr))

    out = run_physical(m, store=store)

    # Placeholder belief for now (still useful for UI scaffolding)
    belief = np.full((T, H, W), 0.5, dtype=np.float32)
    write_field(phy_id, "belief", belief)

    # --- Legends (static assets) ---
    rd = renders_dir(phy_id)
    render_legend_png(rd / "legend_belief.png", cmap="viridis", label="belief (p)")

    fuels = out.get("fuels", None)
    if isinstance(fuels, np.ndarray):
        present = np.unique(fuels).astype(int).tolist()
        render_discrete_legend_png(rd / "legend_fuels.png", present_ids=present)

    # ---- Precompute global display scales (prevents flicker across timesteps) ----
    terrain_arr = out.get("terrain", None)
    wind_u = out.get("wind_u", None)
    wind_v = out.get("wind_v", None)
    temperature = out.get("temperature_c", None)

    terr_min, terr_max = (None, None)
    if isinstance(terrain_arr, np.ndarray):
        terr_min, terr_max = _finite_minmax(terrain_arr)

    temp_min, temp_max = (None, None)
    if isinstance(temperature, np.ndarray):
        temp_min, temp_max = _sampled_finite_minmax(temperature)

    wind_u_absmax = None
    wind_v_absmax = None
    wind_speed_max = None
    if isinstance(wind_u, np.ndarray) and isinstance(wind_v, np.ndarray):
        wind_u_absmax = _sampled_finite_absmax(wind_u)
        wind_v_absmax = _sampled_finite_absmax(wind_v)
        wind_speed_max = _sampled_wind_speed_max(wind_u, wind_v)

    has_temperature = isinstance(out.get("temperature_c", None), np.ndarray)
    has_humidity = isinstance(out.get("humidity_rh", None), np.ndarray)

    # Summary (also used by render endpoints for consistent scaling)
    write_summary_json(
        metrics_dir(phy_id) / "summary.json",
        {
            "id": phy_id,
            "layer": "physical",
            "H": H,
            "W": W,
            "T": T,
            "has_temperature": bool(has_temperature),
            "has_humidity": bool(has_humidity),
            "has_fuels": isinstance(out.get("fuels", None), np.ndarray),
            "terrain_min": terr_min,
            "terrain_max": terr_max,
            "temperature_min": temp_min,
            "temperature_max": temp_max,
            "wind_u_absmax": wind_u_absmax,
            "wind_v_absmax": wind_v_absmax,
            "wind_speed_max": wind_speed_max,
        },
    )

    # IMPORTANT: do NOT pre-render per-timestep fire.png here; render on demand in /t/{t}/fire.png
    return {"ok": True, "phy_id": phy_id}


# -------------------------
# Render endpoints (read from canonical fields.zarr)
# -------------------------


@router.api_route("/{phy_id}/t/{t}/base.png")
def base_png(
    phy_id: str,
    t: int,
    bg: str = Query("terrain", pattern="^(terrain|terrain_dem_m|blank|wind_speed|wind_u|wind_v|fuels|temperature|humidity)$"),
    grid: bool = Query(False),
    px: int = Query(1, ge=1, le=16, description="Upscale factor for PNG (nearest-neighbor)."),
    scale: int | None = Query(None, alias="scale", ge=1, le=16, description="Alias for px (frontend uses scale=...)."),
    max_dim: int = Query(4096, ge=256, le=16384, description="Clamp max image side after upscaling."),
    request: Request = None,
):
    try:
        m = load_manifest(phy_id)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Manifest not found")

    T = int(m["horizon_steps"])
    if t < 0 or t >= T:
        raise HTTPException(status_code=404, detail="t out of range")

    H = int(m["grid"]["H"])
    W = int(m["grid"]["W"])
    px_in = int(scale) if scale is not None else int(px)
    px_eff = _effective_px(H, W, px_in, max_dim)

    td = renders_t_dir(phy_id, t)
    out = td / f"base_{bg}_v3{'_grid' if grid else ''}_px{px_eff}.png"
    if out.exists():
        return _serve_png(request, out)

    if bg == "blank":
        tmp = _tmp_png_path(out)
        render_scalar_png(
            np.zeros((H, W), dtype=np.float32),
            tmp,
            cmap="gray",
            vmin=0,
            vmax=1,
            title=None,
            with_colorbar=False,
            show_grid=grid,
        )
        _maybe_upscale_png_inplace(tmp, px=px_eff)
        os.replace(tmp, out)
        return _serve_png(request, out)

    root = _open_fields_root_or_404(phy_id)
    summary = _load_summary_or_none(phy_id) or {}

    if bg == "terrain_dem_m":
        dem = np.asarray(_require_field(root, "terrain_dem_m")[:], dtype=np.float32)

        # DEM is static, so computing min/max on demand is fine (no flicker across t).
        vmin2, vmax2 = _finite_minmax(dem)
        vmin = 0.0 if vmin2 is None else float(vmin2)
        vmax = (vmin + 1.0) if (vmax2 is None or vmax2 <= vmin) else float(vmax2)

        tmp = _tmp_png_path(out)
        render_scalar_png(
            dem,
            tmp,
            cmap="gray",
            vmin=float(vmin),
            vmax=float(vmax),
            title=None,
            with_colorbar=False,
            show_grid=grid,
        )
        _maybe_upscale_png_inplace(tmp, px=px_eff)
        os.replace(tmp, out)
        return _serve_png(request, out)

    if bg == "terrain":
        terr = np.asarray(_require_field(root, "terrain")[:], dtype=np.float32)

        vmin = summary.get("terrain_min", None)
        vmax = summary.get("terrain_max", None)
        if vmin is None or vmax is None or not np.isfinite(vmin) or not np.isfinite(vmax) or vmax <= vmin:
            vmin2, vmax2 = _finite_minmax(terr)
            vmin = 0.0 if vmin2 is None else float(vmin2)
            vmax = (vmin + 1.0) if (vmax2 is None or vmax2 <= vmin) else float(vmax2)

        tmp = _tmp_png_path(out)
        render_scalar_png(
            terr,
            tmp,
            cmap="gray",
            vmin=float(vmin),
            vmax=float(vmax),
            title=None,
            with_colorbar=False,
            show_grid=grid,
        )
        _maybe_upscale_png_inplace(tmp, px=px_eff)
        os.replace(tmp, out)
        return _serve_png(request, out)

    if bg == "fuels":
        fu = np.asarray(_require_field(root, "fuels")[:], dtype=np.uint8)
        tmp = _tmp_png_path(out)
        render_categorical_png(fu, tmp, show_grid=grid)
        _maybe_upscale_png_inplace(tmp, px=px_eff)
        os.replace(tmp, out)
        return _serve_png(request, out)

    if bg == "temperature":
        tmp = np.asarray(_require_field(root, "temperature_c")[t], dtype=np.float32)

        vmin = summary.get("temperature_min", None)
        vmax = summary.get("temperature_max", None)
        if vmin is None or vmax is None or not np.isfinite(vmin) or not np.isfinite(vmax) or vmax <= vmin:
            vmin2, vmax2 = _finite_minmax(tmp)
            vmin = 0.0 if vmin2 is None else float(vmin2)
            vmax = (vmin + 1.0) if (vmax2 is None or vmax2 <= vmin) else float(vmax2)

        tmpf = _tmp_png_path(out)
        render_scalar_png(
            tmp,
            tmpf,
            cmap="inferno",
            vmin=float(vmin),
            vmax=float(vmax),
            title=None,
            with_colorbar=False,
            show_grid=grid,
        )
        _maybe_upscale_png_inplace(tmpf, px=px_eff)
        os.replace(tmpf, out)
        return _serve_png(request, out)


    if bg == "humidity":
        rh = np.asarray(_require_field(root, "humidity_rh")[t], dtype=np.float32)
        rh = np.clip(rh, 0.0, 1.0)
        tmp = _tmp_png_path(out)
        render_scalar_png(rh, tmp, cmap="Blues", vmin=0.0, vmax=1.0, title=None, with_colorbar=False, show_grid=grid)
        _maybe_upscale_png_inplace(tmp, px=px_eff)
        os.replace(tmp, out)
        return _serve_png(request, out)

    wu = np.asarray(_require_field(root, "wind_u")[t], dtype=np.float32)
    wv = np.asarray(_require_field(root, "wind_v")[t], dtype=np.float32)

    if bg == "wind_u":
        lim = summary.get("wind_u_absmax", None)
        if lim is None or not np.isfinite(lim) or lim <= 0:
            lim = float(np.nanmax(np.abs(wu))) if np.isfinite(wu).any() else 1.0
        lim = max(float(lim), 1e-6)
        tmp = _tmp_png_path(out)
        render_scalar_png(wu, tmp, cmap="coolwarm", vmin=-lim, vmax=lim, title=None, with_colorbar=False, show_grid=grid)
        _maybe_upscale_png_inplace(tmp, px=px_eff)
        os.replace(tmp, out)
        return _serve_png(request, out)

    if bg == "wind_v":
        lim = summary.get("wind_v_absmax", None)
        if lim is None or not np.isfinite(lim) or lim <= 0:
            lim = float(np.nanmax(np.abs(wv))) if np.isfinite(wv).any() else 1.0
        lim = max(float(lim), 1e-6)
        tmp = _tmp_png_path(out)
        render_scalar_png(wv, tmp, cmap="coolwarm", vmin=-lim, vmax=lim, title=None, with_colorbar=False, show_grid=grid)
        _maybe_upscale_png_inplace(tmp, px=px_eff)
        os.replace(tmp, out)
        return _serve_png(request, out)

    sp = np.sqrt(wu * wu + wv * wv)
    vmax = summary.get("wind_speed_max", None)
    if vmax is None or not np.isfinite(vmax) or vmax <= 0:
        vmax = float(np.nanmax(sp)) if np.isfinite(sp).any() else 1.0
    vmax = max(float(vmax), 1e-6)

    tmp = _tmp_png_path(out)
    render_scalar_png(sp, tmp, cmap="viridis", vmin=0.0, vmax=vmax, title=None, with_colorbar=False, show_grid=grid)
    _maybe_upscale_png_inplace(tmp, px=px_eff)
    os.replace(tmp, out)
    return _serve_png(request, out)


@router.get("/{phy_id}/t/{t}/fire_alpha.png")
def fire_alpha_png(
    phy_id: str,
    t: int,
    grid: bool = Query(False),
    px: int = Query(1, ge=1, le=16, description="Upscale factor for PNG (nearest-neighbor)."),
    scale: int | None = Query(None, alias="scale", ge=1, le=16, description="Alias for px (frontend uses scale=...)."),
    max_dim: int = Query(4096, ge=256, le=16384, description="Clamp max image side after upscaling."),
    request: Request = None,
):
    try:
        m = load_manifest(phy_id)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Manifest not found")

    T = int(m["horizon_steps"])
    if t < 0 or t >= T:
        raise HTTPException(status_code=404, detail="t out of range")

    H = int(m["grid"]["H"])
    W = int(m["grid"]["W"])
    px_in = int(scale) if scale is not None else int(px)
    px_eff = _effective_px(H, W, px_in, max_dim)

    td = renders_t_dir(phy_id, t)
    out = td / f"fire_alpha_v3{'_grid' if grid else ''}_px{px_eff}.png"
    if out.exists():
        return _serve_png(request, out)

    root = _open_fields_root_or_404(phy_id)
    fire_state = np.asarray(_require_field(root, "fire_state")[t], dtype=np.uint8)
    tmp = _tmp_png_path(out)
    render_fire_state_png(tmp, fire_state, terrain=None, show_grid=grid)
    _maybe_upscale_png_inplace(tmp, px=px_eff)
    os.replace(tmp, out)
    return _serve_png(request, out)


@router.get("/{phy_id}/t/{t}/wind_arrows.png")
def wind_arrows_png(
    phy_id: str,
    t: int,
    px: int = Query(1, ge=1, le=16, description="Upscale factor for PNG (nearest-neighbor)."),
    scale: int | None = Query(None, alias="scale", ge=1, le=16, description="Alias for px (frontend uses scale=...)."),
    max_dim: int = Query(4096, ge=256, le=16384, description="Clamp max image side after upscaling."),
):
    try:
        m = load_manifest(phy_id)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Manifest not found")

    T = int(m["horizon_steps"])
    if t < 0 or t >= T:
        raise HTTPException(status_code=404, detail="t out of range")

    H = int(m["grid"]["H"])
    W = int(m["grid"]["W"])
    px_in = int(scale) if scale is not None else int(px)
    px_eff = _effective_px(H, W, px_in, max_dim)

    td = renders_t_dir(phy_id, t)
    out = td / f"wind_arrows_v2_px{px_eff}.png"
    if out.exists():
        return FileResponse(out)

    root = _open_fields_root_or_404(phy_id)
    u = np.asarray(_require_field(root, "wind_u")[t], dtype=np.float32)
    v = np.asarray(_require_field(root, "wind_v")[t], dtype=np.float32)

    render_wind_arrows_png(out, u, v)
    _maybe_upscale_png_inplace(out, px=px_eff)
    return FileResponse(out)


@router.get("/{phy_id}/t/{t}/fire.png")
def fire_png(
    phy_id: str,
    t: int,
    px: int = Query(1, ge=1, le=16, description="Upscale factor for PNG (nearest-neighbor)."),
    scale: int | None = Query(None, alias="scale", ge=1, le=16, description="Alias for px (frontend uses scale=...)."),
    max_dim: int = Query(4096, ge=256, le=16384, description="Clamp max image side after upscaling."),
):
    """
    On-demand fire composite.
    If terrain.enabled=true, use terrain as background; otherwise render as transparent overlay.
    """
    try:
        m = load_manifest(phy_id)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Manifest not found")

    T = int(m["horizon_steps"])
    if t < 0 or t >= T:
        raise HTTPException(status_code=404, detail="t out of range")

    H = int(m["grid"]["H"])
    W = int(m["grid"]["W"])
    px_in = int(scale) if scale is not None else int(px)
    px_eff = _effective_px(H, W, px_in, max_dim)

    td = renders_t_dir(phy_id, t)
    out = td / f"fire_px{px_eff}.png"
    if out.exists():
        return FileResponse(out)

    root = _open_fields_root_or_404(phy_id)
    fire_state = np.asarray(_require_field(root, "fire_state")[t], dtype=np.uint8)

    terr = None
    if bool(m.get("terrain", {}).get("enabled", False)):
        terr = np.asarray(_require_field(root, "terrain")[:], dtype=np.float32)

    render_fire_state_png(out, fire_state, terrain=terr, show_grid=False)
    _maybe_upscale_png_inplace(out, px=px_eff)
    return FileResponse(out)


@router.get("/{phy_id}/legend/belief.png")
def belief_legend(phy_id: str):
    p = renders_dir(phy_id) / "legend_belief.png"
    if not p.exists():
        raise HTTPException(status_code=404, detail="legend not found")
    return FileResponse(p)


@router.get("/{phy_id}/legend/fuels.png")
def fuels_legend_png(phy_id: str):
    rd = renders_dir(phy_id)
    pre = rd / "legend_fuels.png"
    if pre.exists():
        return FileResponse(pre)

    root = _open_fields_root_or_404(phy_id)
    fu = np.asarray(_require_field(root, "fuels")[:], dtype=np.uint8)
    present = np.unique(fu).astype(int).tolist()

    out = rd / "legend_fuels.png"
    render_discrete_legend_png(out, present_ids=present)
    return FileResponse(out)


@router.get("/{phy_id}/legend/bg.png")
def bg_legend_png(
    phy_id: str,
    bg: str = Query("terrain", pattern="^(terrain|terrain_dem_m|blank|wind_speed|wind_u|wind_v|fuels|temperature|humidity)$"),
):
    rd = renders_dir(phy_id)
    out = rd / f"legend_{bg}.png"
    if out.exists():
        return FileResponse(out)

    root = _open_fields_root_or_404(phy_id)
    summary = _load_summary_or_none(phy_id) or {}

    if bg == "terrain_dem_m":
        dem = np.asarray(_require_field(root, "terrain_dem_m")[:], dtype=np.float32)

        # If you don’t have summary keys for DEM, just compute min/max.
        vmin2, vmax2 = _finite_minmax(dem)
        vmin = 0.0 if vmin2 is None else float(vmin2)
        vmax = (vmin + 1.0) if (vmax2 is None or vmax2 <= vmin) else float(vmax2)

        render_legend_png(out, cmap="gray", label="terrain DEM (m)", vmin=float(vmin), vmax=float(vmax))

        return FileResponse(out)


    if bg == "terrain":
        vmin = summary.get("terrain_min", None)
        vmax = summary.get("terrain_max", None)
        if vmin is None or vmax is None or not np.isfinite(vmin) or not np.isfinite(vmax) or vmax <= vmin:
            terr = np.asarray(_require_field(root, "terrain")[:], dtype=np.float32)
            vmin2, vmax2 = _finite_minmax(terr)
            vmin = 0.0 if vmin2 is None else float(vmin2)
            vmax = (vmin + 1.0) if (vmax2 is None or vmax2 <= vmin) else float(vmax2)

        render_legend_png(out, cmap="gray", label="terrain", vmin=float(vmin), vmax=float(vmax))
        return FileResponse(out)

    if bg == "fuels":
        fu = np.asarray(_require_field(root, "fuels")[:], dtype=np.uint8)
        present = np.unique(fu).astype(int).tolist()
        render_discrete_legend_png(out, present_ids=present)
        return FileResponse(out)

    if bg == "temperature":
        vmin = summary.get("temperature_min", None)
        vmax = summary.get("temperature_max", None)
        if vmin is None or vmax is None or not np.isfinite(vmin) or not np.isfinite(vmax) or vmax <= vmin:
            tmp = np.asarray(_require_field(root, "temperature_c")[:], dtype=np.float32)
            vmin2, vmax2 = _sampled_finite_minmax(tmp)
            vmin = 0.0 if vmin2 is None else float(vmin2)
            vmax = (vmin + 1.0) if (vmax2 is None or vmax2 <= vmin) else float(vmax2)

        render_legend_png(out, cmap="inferno", label="temperature (C)", vmin=float(vmin), vmax=float(vmax))
        return FileResponse(out)

    if bg == "humidity":
        _require_field(root, "humidity_rh")
        render_legend_png(out, cmap="Blues", label="humidity (rh)", vmin=0.0, vmax=1.0)
        return FileResponse(out)

    if bg == "wind_u":
        lim = summary.get("wind_u_absmax", None)
        if lim is None or not np.isfinite(lim) or lim <= 0:
            wu = np.asarray(_require_field(root, "wind_u")[0], dtype=np.float32)
            lim = float(np.nanmax(np.abs(wu))) if np.isfinite(wu).any() else 1.0
        lim = max(float(lim), 1e-6)
        render_legend_png(out, cmap="coolwarm", label="wind_u (m/s)", vmin=-lim, vmax=lim)
        return FileResponse(out)

    if bg == "wind_v":
        lim = summary.get("wind_v_absmax", None)
        if lim is None or not np.isfinite(lim) or lim <= 0:
            wv = np.asarray(_require_field(root, "wind_v")[0], dtype=np.float32)
            lim = float(np.nanmax(np.abs(wv))) if np.isfinite(wv).any() else 1.0
        lim = max(float(lim), 1e-6)
        render_legend_png(out, cmap="coolwarm", label="wind_v (m/s)", vmin=-lim, vmax=lim)
        return FileResponse(out)

    vmax = summary.get("wind_speed_max", None)
    if vmax is None or not np.isfinite(vmax) or vmax <= 0:
        wu0 = np.asarray(_require_field(root, "wind_u")[0], dtype=np.float32)
        wv0 = np.asarray(_require_field(root, "wind_v")[0], dtype=np.float32)
        sp0 = np.sqrt(wu0 * wu0 + wv0 * wv0)
        vmax = float(np.nanmax(sp0)) if np.isfinite(sp0).any() else 1.0
    vmax = max(float(vmax), 1e-6)

    render_legend_png(out, cmap="viridis", label="wind speed (m/s)", vmin=0.0, vmax=vmax)
    return FileResponse(out)
