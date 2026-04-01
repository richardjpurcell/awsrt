# backend/awsrt_core/io/renders.py
from __future__ import annotations

from pathlib import Path
from typing import Optional
import math
import time

import numpy as np

import os

import matplotlib

matplotlib.use("Agg")  # non-GUI backend for servers
import matplotlib.pyplot as plt

from matplotlib.colors import ListedColormap
from matplotlib.patches import Patch

# ------------------------------------------------------------------
# Optional lightweight render instrumentation
# ------------------------------------------------------------------
# Enable with:
#   AWSRT_RENDER_LOG=1
# This logs to stderr (uvicorn captures it) with per-call timings and canvas size.
_RENDER_LOG = os.getenv("AWSRT_RENDER_LOG", "0").strip() in ("1", "true", "yes", "on")

def _rlog(msg: str) -> None:
    if not _RENDER_LOG:
        return
    try:
        print(f"[awsrt.render] {msg}", flush=True)
    except Exception:
        pass

# ------------------------------------------------------------------
# Render sizing policy (pixel-true resolution)
# ------------------------------------------------------------------
# We render overlay-aligned layers (base / fire / wind / categorical) at a
# pixel size derived from grid dims. All renderers share the same sizing
# function -> overlays stay perfectly aligned.
#
# Tune without code changes:
#   AWSRT_RENDER_PX_PER_CELL=2.0   (1.0, 2.0, 3.0...)
#   AWSRT_RENDER_MAX_SIDE_PX=4096  (4096, 8192...)
#   AWSRT_RENDER_DPI=160           (100..250)
#
_RENDER_PX_PER_CELL = float(os.getenv("AWSRT_RENDER_PX_PER_CELL", "2.0"))
_RENDER_MAX_SIDE_PX = int(os.getenv("AWSRT_RENDER_MAX_SIDE_PX", "4096"))
_RENDER_DPI = int(os.getenv("AWSRT_RENDER_DPI", "160"))

# Lock orientation explicitly (avoid rcParams surprises)
_ORIGIN = "upper"


def _ensure_parent(p: Path) -> None:
    p.parent.mkdir(parents=True, exist_ok=True)


def _lock_array_bounds(ax, H: int, W: int) -> None:
    """
    Ensure consistent array->data bounds across ALL renderers.

    We lock bounds to exact cell edges. Combined with aspect='equal',
    this guarantees square cells and consistent padding across layers.
    """
    ax.set_xlim(-0.5, W - 0.5)
    ax.set_ylim(H - 0.5, -0.5)  # "upper" origin: row 0 at top


def _apply_canonical_axes(ax, H: int, W: int) -> None:
    """
    Canonical axes policy for overlay-aligned images:

    - Lock bounds to exact cell edges.
    - Preserve cell aspect (square cells): aspect='equal'
      This may introduce padding *inside the PNG* (letterbox/pillarbox),
      which is exactly what we want so square runs look square even on a
      fixed canvas.
    - Center the drawn region so all layers share identical padding.
    """
    _lock_array_bounds(ax, H, W)
    ax.set_aspect("equal", adjustable="box")
    # Ensure padding is symmetric/centered (important for overlays).
    try:
        ax.set_anchor("C")
    except Exception:
        pass


def _canvas_pixels(H: int, W: int) -> tuple[int, int]:
    """
    Compute (height_px, width_px) for a given grid (H,W).
    Clamps the longest side to _RENDER_MAX_SIDE_PX to avoid insane renders.
    """
    H = int(H)
    W = int(W)
    if _RENDER_LOG:
        _rlog(f"_canvas_pixels H={H} W={W} px_per_cell={_RENDER_PX_PER_CELL} max_side={_RENDER_MAX_SIDE_PX} dpi={_RENDER_DPI}")
    p = max(0.1, float(_RENDER_PX_PER_CELL))
    w_px = int(max(1, round(W * p)))
    h_px = int(max(1, round(H * p)))

    max_side = int(max(256, _RENDER_MAX_SIDE_PX))
    s = max(w_px, h_px)
    if s > max_side:
        scale = max_side / float(s)
        w_px = int(max(1, round(w_px * scale)))
        h_px = int(max(1, round(h_px * scale)))

    return h_px, w_px

def _new_canvas(H: int, W: int) -> tuple[plt.Figure, plt.Axes]:
    """
    Create a figure sized to the target pixel resolution for this grid.
    This replaces the old fixed 720x480 canvas and massively improves detail.
    """
    h_px, w_px = _canvas_pixels(H, W)
    dpi = int(max(72, min(300, _RENDER_DPI)))
    if _RENDER_LOG:
        _rlog(f"_new_canvas H={H} W={W} -> {w_px}x{h_px}px @ dpi={dpi}")
    fig = plt.figure(figsize=(w_px / dpi, h_px / dpi), dpi=dpi)
    ax = fig.add_subplot(111)
    return fig, ax


def _maybe_draw_grid(
    ax: plt.Axes,
    H: int,
    W: int,
    show_grid: bool,
    *,
    lw: float = 0.4,
    alpha: float = 0.35,
    max_lines: int = 220,
) -> None:
    """
    Draw a visible grid overlay.

    Old behavior suppressed grid entirely for H/W > 200, which made grid=1 and grid=0 identical
    for large historical replays.

    New behavior:
      - Always keep axes hidden (so overlays stay clean).
      - For small grids, draw cell-by-cell lines.
      - For large grids, draw a *coarser* grid (every N cells) to stay fast.
    """
    ax.set_axis_off()
    if not show_grid:
        return

    t0 = time.perf_counter()

    H = int(H)
    W = int(W)
    max_lines = int(max(20, max_lines))

    # Choose a step so we draw <= max_lines lines per axis (roughly).
    step_x = max(1, int(math.ceil(W / max_lines)))
    step_y = max(1, int(math.ceil(H / max_lines)))
    step = max(step_x, step_y)

    # Minor grid (every step cells)
    xs = np.arange(-0.5, W, step, dtype=np.float32)
    ys = np.arange(-0.5, H, step, dtype=np.float32)

    # Major grid every 5 minor steps (helps visibility when step > 1)
    major_step = max(1, step * 5)
    xsM = np.arange(-0.5, W, major_step, dtype=np.float32)
    ysM = np.arange(-0.5, H, major_step, dtype=np.float32)

    # Draw on top of imshow (high zorder).
    ax.vlines(xs,  -0.5, H - 0.5, colors="white", linewidth=max(0.2, lw * 0.75), alpha=min(0.35, alpha * 0.55), zorder=10)
    ax.hlines(ys,  -0.5, W - 0.5, colors="white", linewidth=max(0.2, lw * 0.75), alpha=min(0.35, alpha * 0.55), zorder=10)
    ax.vlines(xsM, -0.5, H - 0.5, colors="white", linewidth=max(0.25, lw * 1.15), alpha=alpha, zorder=11)
    ax.hlines(ysM, -0.5, W - 0.5, colors="white", linewidth=max(0.25, lw * 1.15), alpha=alpha, zorder=11)
    if _RENDER_LOG:
        dt = (time.perf_counter() - t0) * 1000.0
        _rlog(f"grid_draw H={H} W={W} step={step} major_step={major_step} ms={dt:.2f}")

def _build_alpha_mask(
    field2d: np.ndarray,
    *,
    alpha_mask_below: Optional[float],
    alpha_mask_mode: str,
) -> np.ndarray | None:
    """
    Build a per-pixel alpha mask for scalar overlays.

    Returns:
      - None if no alpha masking is requested
      - float32 array in [0,1] matching field2d shape otherwise

    Semantics:
      lt      -> alpha=0 where value <  thr
      le      -> alpha=0 where value <= thr
      abs_lt  -> alpha=0 where abs(value) <  thr
      abs_le  -> alpha=0 where abs(value) <= thr
    """
    if alpha_mask_below is None or not np.isfinite(alpha_mask_below):
        return None

    thr = float(alpha_mask_below)
    mode = str(alpha_mask_mode or "lt").strip().lower()

    if mode == "lt":
        keep = field2d >= thr
    elif mode == "le":
        keep = field2d > thr
    elif mode == "abs_lt":
        keep = np.abs(field2d) >= thr
    elif mode == "abs_le":
        keep = np.abs(field2d) > thr
    else:
        raise ValueError(f"unsupported alpha_mask_mode={alpha_mask_mode!r}")

    return np.where(keep, 1.0, 0.0).astype(np.float32, copy=False)


def _soften_alpha_mask(alpha: np.ndarray | None, *, passes: int = 2) -> np.ndarray | None:
    """
    Soften binary alpha masks with a tiny local blur so temporal trails read better.
    Keeps dependencies minimal by using a simple 3x3 neighborhood average.
    """
    if alpha is None:
        return None

    a = np.asarray(alpha, dtype=np.float32)
    for _ in range(max(0, int(passes))):
        p = np.pad(a, 1, mode="edge")
        a = (
            p[:-2, :-2] + p[:-2, 1:-1] + p[:-2, 2:] +
            p[1:-1, :-2] + p[1:-1, 1:-1] + p[1:-1, 2:] +
            p[2:, :-2] + p[2:, 1:-1] + p[2:, 2:]
        ) / 9.0
    return np.clip(a, 0.0, 1.0)

def render_scalar_png(
    field2d: np.ndarray,
    out_path: Path,
    *,
    cmap: str = "viridis",
    vmin: Optional[float] = None,
    vmax: Optional[float] = None,
    show_grid: bool = False,
    title: Optional[str] = None,
    with_colorbar: bool = True,
    transparent_background: bool = False,
    alpha_mask_below: Optional[float] = None,
    soften_alpha_mask: bool = True,
    alpha_mask_mode: str = "le",
) -> None:
    """
    Render a 2D scalar field to a PNG.

    Canonical behavior for overlay-aligned layers:
    - Fixed canvas size for consistent overlays.
    - Preserve cell aspect ratio (square cells) with aspect='equal'.
    - Allow letterboxing/pillarboxing inside the PNG (no stretching).

    IMPORTANT:

    Optional transparency controls:
    - transparent_background=True:
        save PNG with transparent background instead of opaque canvas.
    - alpha_mask_below=<thr>:
        apply per-pixel alpha so low-signal values fade away.
    - alpha_mask_mode:
        "lt"  -> alpha=0 where value <  thr
        "le"  -> alpha=0 where value <= thr
        "abs_lt" -> alpha=0 where abs(value) <  thr
        "abs_le" -> alpha=0 where abs(value) <= thr

    Optional alpha-softening control:
    - soften_alpha_mask=True:
        feather binary alpha masks slightly for smoother overlays.
    - soften_alpha_mask=False:
        keep a hard cutout. This is useful for sparse diagnostic overlays
        where feathering can reintroduce dark low-value haze into an
        "abs_le" -> alpha=0 where abs(value) <= thr
    """
    _ensure_parent(out_path)
    field2d = np.asarray(field2d, dtype=np.float32)
    if field2d.ndim != 2:
        raise ValueError(f"render_scalar_png expects 2D array; got shape {field2d.shape}")
    H, W = field2d.shape

    t0 = time.perf_counter()
    fig, ax = _new_canvas(H, W)

    if transparent_background:
        fig.patch.set_alpha(0.0)
        ax.set_facecolor((0, 0, 0, 0))

    alpha = _build_alpha_mask(
        field2d,
        alpha_mask_below=alpha_mask_below,
        alpha_mask_mode=alpha_mask_mode,
    )

    # For transparent overlays, a softly feathered alpha reads much better in temporal trails
    # than a hard binary cutout. However, for sparse scalar overlays like
    # Belief Lab entropy departure / delta-entropy, feathering can leak nonzero
    # alpha into neighboring near-zero pixels, which then appear as an unwanted
    # dark haze. Allow callers to disable softening.
    if transparent_background and alpha is not None and soften_alpha_mask:
        alpha = _soften_alpha_mask(alpha, passes=2)

        amax = float(np.max(alpha)) if alpha.size else 0.0
        if amax > 1e-9:
            alpha = np.clip(alpha / amax, 0.0, 1.0)

        alpha = np.power(alpha, 1.35, dtype=np.float32)
        alpha = np.where(alpha >= 0.06, alpha, 0.0).astype(np.float32, copy=False)

    im_kwargs = dict(  # type: ignore[var-annotated]
        cmap=cmap,
        vmin=vmin,
        vmax=vmax,
        interpolation="nearest",
        aspect="equal",  # preserve cell aspect (square cells)
        origin=_ORIGIN,
    )
    if alpha is not None:
        im_kwargs["alpha"] = alpha

    # When using transparent overlays without an explicit alpha mask, allow the PNG background
    # to be transparent but keep all field pixels fully opaque.
    # This is useful for stacked trail rendering in the frontend.

    im = ax.imshow(field2d, **im_kwargs)

    _apply_canonical_axes(ax, H, W)

    if title:
        ax.set_title(title, fontsize=10)

    _maybe_draw_grid(ax, H, W, show_grid)

    # When no colorbar, fill the canvas with the axes. Aspect='equal' will introduce
    # *internal* padding as needed, while keeping the PNG size fixed.
    if not with_colorbar:
        ax.set_position([0, 0, 1, 1])

    if with_colorbar:
        cbar = fig.colorbar(im, ax=ax, fraction=0.046, pad=0.02)
        cbar.ax.tick_params(labelsize=8)

    # IMPORTANT: no tight_layout / no bbox_inches="tight" for overlay layers
    fig.savefig(out_path, pad_inches=0, transparent=transparent_background)
    plt.close(fig)
    if _RENDER_LOG:
        dt = (time.perf_counter() - t0) * 1000.0
        _rlog(
            "render_scalar_png "
            f"out={out_path.name} H={H} W={W} grid={show_grid} cbar={with_colorbar} "
            f"transparent={transparent_background} "
            f"alpha_thr={alpha_mask_below if alpha_mask_below is not None else 'none'} "
            f"soften_alpha={soften_alpha_mask} "
            f"alpha_mode={alpha_mask_mode} ms={dt:.2f}"
        )



def render_legend_png(
    out_path: Path,
    *,
    cmap: str = "viridis",
    label: str = "",
    vmin: float | None = None,
    vmax: float | None = None,
    ticks: int = 3,
) -> None:
    """
    Small standalone legend bar (safe to bbox/tight_layout because it is NOT used as an overlay layer).
    """
    _ensure_parent(out_path)

    grad = np.linspace(0.0, 1.0, 256, dtype=np.float32)[None, :]
    fig = plt.figure(figsize=(4.5, 0.7), dpi=160)
    ax = fig.add_subplot(111)

    im = ax.imshow(grad, cmap=cmap, aspect="auto", origin=_ORIGIN)
    ax.set_axis_off()

    cbar = fig.colorbar(im, ax=ax, orientation="horizontal", fraction=0.9, pad=0.25)

    if label:
        cbar.set_label(label, fontsize=9)

    if vmin is not None and vmax is not None and np.isfinite(vmin) and np.isfinite(vmax) and vmax > vmin:
        ticks = max(2, int(ticks))
        pos = np.linspace(0.0, 1.0, ticks)
        vals = vmin + (vmax - vmin) * pos
        cbar.set_ticks(pos)
        cbar.set_ticklabels([f"{v:.3g}" for v in vals])

    cbar.ax.tick_params(labelsize=8)
    fig.tight_layout(pad=0.15)
    fig.savefig(out_path, bbox_inches="tight", transparent=True)
    plt.close(fig)


def render_deployment_overlay_png(
    background2d: np.ndarray,
    fire2d: np.ndarray,
    sensors_rc: np.ndarray,
    out_path: Path,
    *,
    radius_cells: float,
    show_fire: bool = True,
    show_grid: bool = False,
) -> None:
    """
    Composited export (background + fire + sensors), but MUST remain overlay-aligned
    with other layers (front/wind/fire overlays). Do NOT tight-crop.
    """
    _ensure_parent(out_path)

    background2d = np.asarray(background2d)
    if background2d.ndim != 2:
        raise ValueError(f"background2d must be 2D; got {background2d.shape}")
    H, W = background2d.shape

    fig, ax = _new_canvas(H, W)
    ax.imshow(background2d, cmap="gray", interpolation="nearest", aspect="equal", origin=_ORIGIN)
    _apply_canonical_axes(ax, H, W)

    if show_fire:
        fire_mask = (np.asarray(fire2d) > 0).astype(np.float32)
        ax.imshow(
            np.dstack([fire_mask, np.zeros_like(fire_mask), np.zeros_like(fire_mask)]),
            alpha=0.6,
            interpolation="nearest",
            aspect="equal",
            origin=_ORIGIN,
        )

    _maybe_draw_grid(ax, H, W, show_grid)

    if sensors_rc.size > 0:
        sensors_rc = np.asarray(sensors_rc)
        rr = sensors_rc[:, 0].astype(float)
        cc = sensors_rc[:, 1].astype(float)
        ax.scatter(cc, rr, s=30, marker="o", edgecolors="cyan", facecolors="none", linewidths=1.2)
        ax.scatter(cc, rr, s=8, marker="o")
        for r, c in zip(rr, cc):
            circ = plt.Circle((c, r), radius=radius_cells, fill=False, linewidth=0.9)
            ax.add_patch(circ)

    # Overlay alignment: fill canvas, no tight cropping.
    ax.set_position([0, 0, 1, 1])
    fig.savefig(out_path, pad_inches=0)
    plt.close(fig)


def render_fire_state_png(
    out_path: Path,
    fire_state: np.ndarray,
    terrain: np.ndarray | None = None,
    show_grid: bool = False,
) -> None:
    """
    Render fire state as a PNG.
    - If terrain is provided, it is drawn as a background.
    - If terrain is None, output is transparent except for fire pixels.

    IMPORTANT: do NOT use bbox_inches="tight" here (overlay alignment).
    """
    _ensure_parent(out_path)

    fire_state = np.asarray(fire_state, dtype=np.uint8)
    if fire_state.ndim != 2:
        raise ValueError(f"fire_state must be 2D; got {fire_state.shape}")
    H, W = fire_state.shape

    if terrain is not None:
        terrain = np.asarray(terrain)
        if terrain.shape != (H, W):
            raise ValueError(f"terrain shape {terrain.shape} does not match fire_state {(H, W)}")
    t0 = time.perf_counter()
    fig, ax = _new_canvas(H, W)

    # If we're an overlay, make everything transparent except pixels we draw.
    if terrain is None:
        fig.patch.set_alpha(0.0)
        ax.set_facecolor((0, 0, 0, 0))

    if terrain is not None:
        ax.imshow(terrain, cmap="gray", interpolation="nearest", aspect="equal", origin=_ORIGIN)

    cmap = ListedColormap(
        [
            (0, 0, 0, 0.0),      # 0 unburned: transparent
            (1, 0, 0, 0.95),     # 1 burning: red
            (0.35, 0, 0, 0.85),  # 2 burned: dark red
        ]
    )
    ax.imshow(fire_state, cmap=cmap, vmin=0, vmax=2, interpolation="nearest", aspect="equal", origin=_ORIGIN)

    _apply_canonical_axes(ax, H, W)
    _maybe_draw_grid(ax, H, W, show_grid, lw=0.35, alpha=0.35)

    ax.set_position([0, 0, 1, 1])

    fig.savefig(out_path, transparent=(terrain is None), pad_inches=0)
    plt.close(fig)
    if _RENDER_LOG:
        dt = (time.perf_counter() - t0) * 1000.0
        _rlog(f"render_fire_state_png out={out_path.name} H={H} W={W} grid={show_grid} terrain={'1' if terrain is not None else '0'} ms={dt:.2f}")

def render_front_band_png(
    out_path: Path,
    front_mask: np.ndarray,
    *,
    terrain: np.ndarray | None = None,
    show_grid: bool = False,
    alpha: float = 0.90,
) -> None:
    """
    Render a "front band" (edge/band) mask as a transparent RGBA overlay.

    - If terrain is provided, it is drawn as a background (non-overlay use).
    - If terrain is None, output is transparent except for front pixels.

    IMPORTANT: do NOT use bbox_inches="tight" here (overlay alignment).
    """
    _ensure_parent(out_path)

    front_mask = (np.asarray(front_mask) > 0).astype(np.uint8)
    if front_mask.ndim != 2:
        raise ValueError(f"front_mask must be 2D; got {front_mask.shape}")
    H, W = front_mask.shape

    if terrain is not None:
        terrain = np.asarray(terrain)
        if terrain.shape != (H, W):
            raise ValueError(f"terrain shape {terrain.shape} does not match front_mask {(H, W)}")

    t0 = time.perf_counter()
    fig, ax = _new_canvas(H, W)

    # Overlay mode: transparent background
    if terrain is None:
        fig.patch.set_alpha(0.0)
        ax.set_facecolor((0, 0, 0, 0))

    if terrain is not None:
        ax.imshow(terrain, cmap="gray", interpolation="nearest", aspect="equal", origin=_ORIGIN)

    a = float(max(0.0, min(1.0, alpha)))
    cmap = ListedColormap(
        [
            (0, 0, 0, 0.0),   # 0: transparent
            (1, 1, 0, a),     # 1: yellow front band
        ]
    )
    ax.imshow(front_mask, cmap=cmap, vmin=0, vmax=1, interpolation="nearest", aspect="equal", origin=_ORIGIN)

    _apply_canonical_axes(ax, H, W)
    _maybe_draw_grid(ax, H, W, show_grid, lw=0.30, alpha=0.30)

    # Fill canvas; keep internal padding controlled by aspect='equal'
    ax.set_position([0, 0, 1, 1])
    fig.savefig(out_path, transparent=(terrain is None), pad_inches=0)
    plt.close(fig)
    if _RENDER_LOG:
        dt = (time.perf_counter() - t0) * 1000.0
        _rlog(f"render_front_band_png out={out_path.name} H={H} W={W} grid={show_grid} terrain={'1' if terrain is not None else '0'} ms={dt:.2f}")



def render_wind_arrows_png(
    out_path: Path,
    u2d: np.ndarray,
    v2d: np.ndarray,
    *,
    step: int | None = None,
    arrow_frac: float = 1.35,
    min_speed: float = 0.0,
) -> None:
    """
    Render wind as a transparent RGBA overlay of arrows (quiver), aligned to the same
    pixel canvas as other overlay renderers (no tight cropping).

    Canonical behavior:
    - Fixed canvas
    - aspect='equal' via _apply_canonical_axes => square cells + internal padding as needed
    """
    _ensure_parent(out_path)

    u2d = np.asarray(u2d, dtype=np.float32)
    v2d = np.asarray(v2d, dtype=np.float32)
    if u2d.shape != v2d.shape:
        raise ValueError(f"u2d/v2d shape mismatch: {u2d.shape} vs {v2d.shape}")
    if u2d.ndim != 2:
        raise ValueError(f"u2d/v2d must be 2D; got {u2d.shape}")

    H, W = u2d.shape
    t0 = time.perf_counter()

    fig, ax = _new_canvas(H, W)
    try:
        fig.patch.set_alpha(0.0)
        ax.set_facecolor((0, 0, 0, 0))
        ax.set_axis_off()
        ax.set_position([0, 0, 1, 1])

        # Canonical bounds + aspect (must match imshow-based layers)
        _apply_canonical_axes(ax, H, W)

        # Choose a sane default sampling step (caps arrow count for large grids)
        if step is None:
            # Slightly coarser default spacing improves readability in the Physical visualizer.
            step = max(1, int(max(H, W) / 18))
        step = int(max(1, step))

        rr = np.arange(0, H, step, dtype=int)
        cc = np.arange(0, W, step, dtype=int)
        if rr.size == 0 or cc.size == 0:
            fig.savefig(out_path, transparent=True, pad_inches=0)
            return

        # (R,C) are row/col sample locations in array coordinates
        R, C = np.meshgrid(rr, cc, indexing="ij")
        U = u2d[R, C]
        V = v2d[R, C]

        speed = np.sqrt(U * U + V * V)
        finite = np.isfinite(speed)
        # Drop tiny arrows early to reduce clutter + work
        speed_ok = finite & (speed >= float(min_speed))
        if not speed_ok.any():
            fig.savefig(out_path, transparent=True, pad_inches=0)
            return

        vmax = float(np.nanmax(speed[speed_ok]))
        if vmax <= 1e-9:
            fig.savefig(out_path, transparent=True, pad_inches=0)
            return

        scale = max(vmax, 1e-9)
        Uq = (U / scale) * (float(arrow_frac) * step)
        Vq = (V / scale) * (float(arrow_frac) * step)

        mask = np.isfinite(Uq) & np.isfinite(Vq) & speed_ok
        if not mask.any():
            fig.savefig(out_path, transparent=True, pad_inches=0)
            return

        ax.quiver(
            C[mask],
            R[mask],
            Uq[mask],
            Vq[mask],
            angles="xy",
            scale_units="xy",
            scale=1.0,
            pivot="middle",
            width=0.0052,
            headwidth=4.8,
            headlength=6.4,
            headaxislength=5.3,
            color="white",
            alpha=0.96,
        )

        fig.savefig(out_path, transparent=True, pad_inches=0)
    finally:
        plt.close(fig)
        if _RENDER_LOG:
            dt = (time.perf_counter() - t0) * 1000.0
            _rlog(f"render_wind_arrows_png out={out_path.name} H={H} W={W} step={step} min_speed={min_speed} ms={dt:.2f}")


# -----------------------------
# CATEGORICAL (FUELS) RENDERING
# -----------------------------

FUEL_RENDER = {
    0: ("None", (0.90, 0.90, 0.90, 1.0)),
    1: ("C2", (0.10, 0.55, 0.20, 1.0)),
    2: ("C3", (0.12, 0.45, 0.18, 1.0)),
    3: ("M1", (0.55, 0.65, 0.25, 1.0)),
    4: ("D1", (0.85, 0.70, 0.25, 1.0)),
    5: ("S1", (0.20, 0.35, 0.20, 1.0)),
    6: ("O1A", (0.65, 0.85, 0.40, 1.0)),
    7: ("O1B", (0.55, 0.80, 0.35, 1.0)),
}


def render_categorical_png(
    cats_u8: np.ndarray,
    out_path: Path,
    *,
    show_grid: bool = False,
    palette: dict[int, tuple[str, tuple[float, float, float, float]]] | None = None,
) -> None:
    """
    Render a categorical uint8 field as a PNG (e.g., fuels map).
    Uses a ListedColormap created from the provided palette, falling back to FUEL_RENDER.
    Unknown IDs fall back to gray.

    Canonical behavior:
    - Fixed canvas
    - aspect='equal' => preserve cell aspect, allow internal padding
    """
    _ensure_parent(out_path)
    cats_u8 = np.asarray(cats_u8, dtype=np.uint8)
    if cats_u8.ndim != 2:
        raise ValueError(f"cats_u8 must be 2D; got {cats_u8.shape}")
    H, W = cats_u8.shape

    pal = palette if palette is not None else FUEL_RENDER
    max_id = int(np.nanmax(cats_u8)) if cats_u8.size else 0
    max_id = max(max_id, 0)

    colors = [(0.6, 0.6, 0.6, 1.0)] * (max_id + 1)
    for i in range(max_id + 1):
        colors[i] = pal.get(i, (str(i), (0.6, 0.6, 0.6, 1.0)))[1]

    cmap = ListedColormap(colors)
    t0 = time.perf_counter()
    fig, ax = _new_canvas(H, W)
    ax.imshow(
        cats_u8,
        cmap=cmap,
        interpolation="nearest",
        vmin=0,
        vmax=max_id,
        aspect="equal",
        origin=_ORIGIN,
    )

    _apply_canonical_axes(ax, H, W)
    _maybe_draw_grid(ax, H, W, show_grid, lw=0.25, alpha=0.35)

    ax.set_position([0, 0, 1, 1])

    # IMPORTANT: no bbox_inches="tight" to keep canvas consistent
    fig.savefig(out_path, pad_inches=0)
    plt.close(fig)
    if _RENDER_LOG:
        dt = (time.perf_counter() - t0) * 1000.0
        _rlog(f"render_categorical_png out={out_path.name} H={H} W={W} grid={show_grid} max_id={max_id} ms={dt:.2f}")

def render_sign_mask_png(
    sign_u8: np.ndarray,
    out_path: Path,
    *,
    show_grid: bool = False,
) -> None:
    """
    Render a 3-state sign mask as a transparent categorical overlay:
      0 = transparent / background
      1 = negative (blue)
      2 = positive (red)

    This is intended for sparse signed diagnostic fields such as Belief Lab
    delta-entropy sign renders.
    """
    SIGN_RENDER = {
        0: ("zero", (0.0, 0.0, 0.0, 0.0)),
        1: ("negative", (0.10, 0.35, 0.95, 0.95)),
        2: ("positive", (0.90, 0.15, 0.15, 0.95)),
    }

    _ensure_parent(out_path)
    sign_u8 = np.asarray(sign_u8, dtype=np.uint8)
    if sign_u8.ndim != 2:
        raise ValueError(f"sign_u8 must be 2D; got {sign_u8.shape}")
    H, W = sign_u8.shape
    t0 = time.perf_counter()
    fig, ax = _new_canvas(H, W)
    try:
        fig.patch.set_alpha(0.0)
        ax.set_facecolor((0, 0, 0, 0))

        colors = [SIGN_RENDER[i][1] for i in range(3)]
        cmap = ListedColormap(colors)

        ax.imshow(
            sign_u8,
            cmap=cmap,
            interpolation="nearest",
            vmin=0,
            vmax=2,
            aspect="equal",
            origin=_ORIGIN,
        )

        _apply_canonical_axes(ax, H, W)
        _maybe_draw_grid(ax, H, W, show_grid, lw=0.25, alpha=0.35)
        ax.set_position([0, 0, 1, 1])
        fig.savefig(out_path, transparent=True, pad_inches=0)
    finally:
        plt.close(fig)
        if _RENDER_LOG:
            dt = (time.perf_counter() - t0) * 1000.0
            _rlog(
                f"render_sign_mask_png out={out_path.name} H={H} W={W} grid={show_grid} ms={dt:.2f}"
            )


def render_support_arrival_overlay_png(
    support_mask_2d: np.ndarray,
    arrived_mask_2d: np.ndarray,
    out_path: Path,
    *,
    show_grid: bool = False,
) -> None:
    """
    Render a composite diagnostic tile:
      - support mask in gray
      - arrived mask in white on top

    Intended for Belief Lab so the user can see prescribed support and
    realized arrivals in one image.
    """
    _ensure_parent(out_path)

    support = (np.asarray(support_mask_2d) > 0).astype(np.uint8)
    arrived = (np.asarray(arrived_mask_2d) > 0).astype(np.uint8)

    if support.ndim != 2:
        raise ValueError(f"support_mask_2d must be 2D; got {support.shape}")
    if arrived.ndim != 2:
        raise ValueError(f"arrived_mask_2d must be 2D; got {arrived.shape}")
    if support.shape != arrived.shape:
        raise ValueError(f"support/arrived shape mismatch: {support.shape} vs {arrived.shape}")

    H, W = support.shape
    t0 = time.perf_counter()

    fig, ax = _new_canvas(H, W)
    try:
        fig.patch.set_alpha(0.0)
        ax.set_facecolor((0, 0, 0, 0))

        support_cmap = ListedColormap(
            [
                (0.0, 0.0, 0.0, 0.0),     # background transparent
                (0.62, 0.62, 0.62, 0.95), # prescribed support gray
            ]
        )
        arrived_cmap = ListedColormap(
            [
                (0.0, 0.0, 0.0, 0.0),   # background transparent
                (0.18, 0.86, 0.28, 1.0),   # actual arrivals green
            ]
        )

        ax.imshow(
            support,
            cmap=support_cmap,
            vmin=0,
            vmax=1,
            interpolation="nearest",
            aspect="equal",
            origin=_ORIGIN,
        )
        ax.imshow(
            arrived,
            cmap=arrived_cmap,
            vmin=0,
            vmax=1,
            interpolation="nearest",
            aspect="equal",
            origin=_ORIGIN,
        )

        _apply_canonical_axes(ax, H, W)
        _maybe_draw_grid(ax, H, W, show_grid, lw=0.25, alpha=0.35)
        ax.set_position([0, 0, 1, 1])
        fig.savefig(out_path, transparent=True, pad_inches=0)
    finally:
        plt.close(fig)
        if _RENDER_LOG:
            dt = (time.perf_counter() - t0) * 1000.0
            _rlog(
                f"render_support_arrival_overlay_png out={out_path.name} H={H} W={W} grid={show_grid} ms={dt:.2f}"
            )

def render_discrete_legend_png(
    out_path: Path,
    *,
    present_ids: list[int],
) -> None:
    """
    Render a discrete legend (horizontal, multi-column) for the categories present in a run.
    """
    _ensure_parent(out_path)

    ids = [i for i in present_ids if i in FUEL_RENDER]
    if not ids:
        ids = [0]

    handles = [Patch(facecolor=FUEL_RENDER[i][1], edgecolor="none", label=FUEL_RENDER[i][0]) for i in ids]

    fig = plt.figure(figsize=(6.0, 1.0), dpi=160)
    ax = fig.add_subplot(111)
    ax.axis("off")
    ax.legend(
        handles=handles,
        loc="center",
        ncol=min(len(handles), 6),
        frameon=False,
        fontsize=9,
        handlelength=1.2,
        columnspacing=1.2,
    )
    fig.tight_layout(pad=0.2)
    fig.savefig(out_path, transparent=True)
    plt.close(fig)


__all__ = [
    "render_scalar_png",
    "render_legend_png",
    "render_deployment_overlay_png",
    "render_fire_state_png",
    "render_front_band_png",
    "render_wind_arrows_png",
    "render_categorical_png",
    "render_sign_mask_png",
    "render_support_arrival_overlay_png",
    "render_discrete_legend_png",
]
