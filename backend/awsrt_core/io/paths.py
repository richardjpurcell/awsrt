# backend/awsrt_core/io/paths.py
from __future__ import annotations

import json
import os
import shutil
from pathlib import Path
from typing import Any, Literal, Optional, Tuple

import numpy as np
import zarr


# Optional compression (recommended). If unavailable, fall back to Zarr defaults.
try:
    from numcodecs import Blosc  # type: ignore

    _DEFAULT_COMPRESSOR = Blosc(cname="zstd", clevel=5, shuffle=Blosc.BITSHUFFLE)
except Exception:  # pragma: no cover
    _DEFAULT_COMPRESSOR = None


# -----------------------------------------------------------------------------
# Canonical data layout
# -----------------------------------------------------------------------------
#
# data/
#   manifests/
#   fields/
#   renders/
#   metrics/
#
# Canonical Zarr policy:
#   one Zarr GROUP per run:
#     data/fields/{run_id}/fields.zarr
#   flat dataset names inside that group (no subgroups).
# -----------------------------------------------------------------------------

REPO_ROOT = Path(__file__).resolve().parents[3]

# Allow override (useful in dev/CI): AWSRT_DATA_DIR=/abs/path/to/data
DATA_DIR = Path(os.environ.get("AWSRT_DATA_DIR", str(REPO_ROOT / "data"))).resolve()

MANIFESTS_DIR = DATA_DIR / "manifests"
FIELDS_DIR = DATA_DIR / "fields"
RENDERS_DIR = DATA_DIR / "renders"
METRICS_DIR = DATA_DIR / "metrics"

FIELDS_ZARR_NAME = "fields.zarr"

# Chunking defaults (tuned for time-slider viewing and ~100k cells scale)
STATIC_CHUNK: Tuple[int, int] = (256, 256)  # (H, W)
DYNAMIC_CHUNK: Tuple[int, int, int] = (1, 256, 256)  # (T, H, W)

# -----------------------------------------------------------------------------
# dtype policy
# -----------------------------------------------------------------------------
# We enforce "best effort" dtype normalization at the storage boundary so that
# upstream generators can't accidentally explode storage (e.g., int32 fuels).
#
# Continuous fields:
#   - float64 -> float32
#   - int64 -> int32
#   - bool -> uint8
#
# Categorical fields:
#   - uint8 (fire_state, fuels, masks, etc.)
# -----------------------------------------------------------------------------

# Known categorical dataset names (flat fields in fields.zarr).
# Keep this list small and conservative; add to it as you introduce new discrete layers.
_CATEGORICAL_FIELDS: set[str] = {
    "fuels",
    "fuel_id",
    "fuel",
    "fire_state",
    "fire",
    "burned",
    # Epistemic Option A masks (categorical/boolean)
    "a_mask",
    "arrived_mask",
    "lost_mask",
}


def ensure_data_dirs() -> None:
    for p in (DATA_DIR, MANIFESTS_DIR, FIELDS_DIR, RENDERS_DIR, METRICS_DIR):
        p.mkdir(parents=True, exist_ok=True)


# -------------------------
# Manifests
# -------------------------


def manifest_path(manifest_id: str) -> Path:
    return MANIFESTS_DIR / f"{manifest_id}.json"


def save_manifest(manifest_id: str, data: dict[str, Any]) -> Path:
    ensure_data_dirs()
    p = manifest_path(manifest_id)
    with p.open("w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, sort_keys=True)
    return p


def load_manifest(manifest_id: str) -> dict[str, Any]:
    p = manifest_path(manifest_id)
    if not p.exists():
        raise FileNotFoundError(f"Manifest not found: {manifest_id}")
    with p.open("r", encoding="utf-8") as f:
        return json.load(f)


def list_manifests(prefix: str) -> list[str]:
    ensure_data_dirs()
    stems: set[str] = set()

    # Accept both ID styles: "phy-..." and "phy_..."
    for pat in (f"{prefix}-*.json", f"{prefix}_*.json"):
        for p in MANIFESTS_DIR.glob(pat):
            stems.add(p.stem)

    return sorted(stems)


# -------------------------
# Run directories
# -------------------------


def fields_dir(run_id: str) -> Path:
    p = FIELDS_DIR / run_id
    p.mkdir(parents=True, exist_ok=True)
    return p

def _fields_dir_path(run_id: str) -> Path:
    """
    Pure path (no side effects). Use this for READ-only path composition so we
    don't recreate empty folders after a run is deleted.
    """
    return FIELDS_DIR / run_id

def _renders_dir_path(run_id: str) -> Path:
    """
    Pure path (no side effects). Use this for READ-only path composition so we
    don't recreate empty folders after a run is deleted.
    """
    return RENDERS_DIR / run_id


def renders_dir(run_id: str) -> Path:
    p = RENDERS_DIR / run_id
    p.mkdir(parents=True, exist_ok=True)
    return p


def renders_t_dir(run_id: str, t: int) -> Path:
    p = renders_dir(run_id) / "t" / str(int(t))
    p.mkdir(parents=True, exist_ok=True)
    return p

def _metrics_dir_path(run_id: str) -> Path:
    """
    Pure path (no side effects). Use this for READ-only path composition so we
    don't recreate empty folders after a run is deleted.
    """
    return METRICS_DIR / run_id


def metrics_dir(run_id: str) -> Path:
    p = METRICS_DIR / run_id
    p.mkdir(parents=True, exist_ok=True)
    return p


# -------------------------
# Zarr fields storage (canonical)
# -------------------------


def fields_zarr_group_path(run_id: str) -> Path:
    """
    Canonical Zarr location for a run:
      data/fields/{run_id}/fields.zarr
    """
    # IMPORTANT: no mkdir here (read paths must be side-effect free)
    return _fields_dir_path(run_id) / FIELDS_ZARR_NAME


def open_fields_group(run_id: str, mode: Literal["r", "r+", "a", "w"] = "a") -> zarr.Group:
    """
    Open the run's canonical Zarr group.
    """
    ensure_data_dirs()
    # Only create directories when the caller intends to write.
    if mode in ("a", "w", "r+"):
        fields_dir(run_id)  # mkdir ok
    path = fields_zarr_group_path(run_id)
    return zarr.open_group(str(path), mode=mode)  # type: ignore[return-value]


def _validate_field_name(name: str) -> str:
    """
    Canonical invariant: fields are stored as flat dataset names in a single group.

    Disallow subgroup paths (e.g. "foo/bar") and empty/whitespace names.
    """
    if not isinstance(name, str):
        raise TypeError("field name must be a string")
    n = name.strip()
    if not n:
        raise ValueError("field name must be non-empty")
    if "/" in n or "\\" in n:
        raise ValueError(f"field name must be flat (no '/' or '\\\\'): {name!r}")
    if n in (".", ".."):
        raise ValueError(f"invalid field name: {name!r}")
    return n


def _clamp_chunks(chunks: tuple[int, ...], shape: tuple[int, ...]) -> tuple[int, ...]:
    """
    Ensure each chunk dim is <= corresponding shape dim (and >=1).
    If chunks has more dims than shape, extra dims are dropped (defensive).
    """
    out: list[int] = []
    for i, s in enumerate(shape):
        s_i = int(s)
        c_i = int(chunks[i]) if i < len(chunks) else s_i
        if s_i <= 0:
            out.append(1)
        else:
            out.append(max(1, min(int(c_i), s_i)))
    return tuple(out)


def _default_chunks_for(arr: np.ndarray) -> Optional[tuple[int, ...]]:
    """
    Chunking policy:
      - 2D (H,W) -> (256,256) clamped to shape
      - 3D (T,H,W) -> (1,256,256) clamped to shape (fast single-timestep reads)
      - else -> None (let Zarr decide)
    """
    shape = tuple(int(x) for x in arr.shape)
    if arr.ndim == 2:
        return _clamp_chunks(STATIC_CHUNK, shape)
    if arr.ndim == 3:
        return _clamp_chunks(DYNAMIC_CHUNK, shape)
    return None


def _is_categorical_field(name: str) -> bool:
    # strict match; your dataset names are already canonical/flat
    return name in _CATEGORICAL_FIELDS


def _normalize_dtype(name: str, arr: np.ndarray) -> np.ndarray:
    """
    Conservative dtype normalization to reduce size + keep things consistent.

    Rules:
      - categorical fields -> uint8
      - float64 -> float32
      - int64 -> int32
      - bool -> uint8
      - ensure contiguous array for faster IO/compression
    """
    a = np.asarray(arr)

    # Enforce categorical storage
    if _is_categorical_field(name):
        # If upstream produces negative ints, clip defensively.
        if np.issubdtype(a.dtype, np.signedinteger):
            a = np.clip(a, 0, 255).astype(np.uint8, copy=False)
        else:
            a = a.astype(np.uint8, copy=False)
        return np.ascontiguousarray(a)

    # Continuous fields
    if a.dtype == np.float64:
        a = a.astype(np.float32, copy=False)

    if a.dtype == np.int64:
        a = a.astype(np.int32, copy=False)

    if a.dtype == np.bool_:
        a = a.astype(np.uint8, copy=False)

    return np.ascontiguousarray(a)


def write_field(
    run_id: str,
    name: str,
    arr: np.ndarray,
    *,
    chunks: Optional[tuple[int, ...]] = None,
    compressor=_DEFAULT_COMPRESSOR,
    overwrite: bool = True,
) -> zarr.Array:
    """
    Write a named field array into the run's Zarr group.

    This is the primitive orchestrators should use via a small
    `store(name, arr)` closure.
    """
    root = open_fields_group(run_id, mode="a")

    name = _validate_field_name(name)
    arr = _normalize_dtype(name, arr)

    if chunks is None:
        chunks = _default_chunks_for(arr)
    else:
        chunks = _clamp_chunks(tuple(int(x) for x in chunks), tuple(int(x) for x in arr.shape))

    za = root.array(
        name,
        data=arr,
        chunks=chunks,
        compressor=compressor,
        overwrite=overwrite,
    )
    return za


def read_field(run_id: str, name: str) -> zarr.Array:
    root = open_fields_group(run_id, mode="r")
    name = _validate_field_name(name)
    if name not in root:
        raise KeyError(name)
    return root[name]


def list_fields(run_id: str) -> list[str]:
    """
    Lists dataset names present in the run fields group.
    Useful for the visualizer to avoid offering unavailable layers.
    """
    root = open_fields_group(run_id, mode="r")
    return sorted(list(root.array_keys()))


# -------------------------
# Router compatibility helpers
# -------------------------


def zarr_path(run_id: str, name: str) -> Path:
    """
    Router-facing helper.

    Returns a "path" that points to a dataset inside the canonical group:
      data/fields/{run_id}/fields.zarr/{name}

    This works with zarr.open(str(path), mode=...) and with open_zarr_array().
    """
    nm = _validate_field_name(name)
    return fields_zarr_group_path(run_id) / nm


def open_zarr_array(p: Path, *, mode: Literal["r", "r+", "a", "w"] = "r") -> zarr.Array:
    """
    Convenience wrapper used by routers.
    """
    return zarr.open(str(p), mode=mode)  # type: ignore[return-value]


# -------------------------
# Deletion
# -------------------------


def delete_run_artifacts(run_id: str) -> dict[str, Any]:
    """
    Deletes:
      - data/manifests/{run_id}.json
      - data/fields/{run_id}/
      - data/renders/{run_id}/
      - data/metrics/{run_id}/
    """
    ensure_data_dirs()
    removed: list[str] = []

    mp = manifest_path(run_id)
    if mp.exists():
        mp.unlink()
        removed.append(str(mp))

    for d in (_fields_dir_path(run_id), _renders_dir_path(run_id), _metrics_dir_path(run_id)):
        if d.exists():
            shutil.rmtree(d, ignore_errors=True)
            removed.append(str(d))

    return {"ok": True, "run_id": run_id, "removed": removed}


__all__ = [
    "ensure_data_dirs",
    "manifest_path",
    "save_manifest",
    "load_manifest",
    "list_manifests",
    "fields_dir",
    "renders_dir",
    "renders_t_dir",
    "metrics_dir",
    "_fields_dir_path",
    "_renders_dir_path",
    "_metrics_dir_path",
    "FIELDS_ZARR_NAME",
    "fields_zarr_group_path",
    "open_fields_group",
    "write_field",
    "read_field",
    "list_fields",
    "zarr_path",
    "open_zarr_array",
    "delete_run_artifacts",
]
