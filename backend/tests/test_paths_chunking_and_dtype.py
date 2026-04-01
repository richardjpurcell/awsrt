# backend/tests/test_paths_chunking_and_dtype.py
from __future__ import annotations

import numpy as np

from awsrt_core.io import paths


def test_default_chunks_2d_square():
  """2D (H,W) uses STATIC_CHUNK, clamped to shape."""
  a = np.zeros((300, 300), dtype=np.float32)
  chunks = paths._default_chunks_for(a)
  # STATIC_CHUNK = (256,256) → clamped to (256,256)
  assert chunks == (256, 256)


def test_default_chunks_2d_small():
  """2D (H,W) smaller than STATIC_CHUNK clamps correctly."""
  a = np.zeros((100, 50), dtype=np.float32)
  chunks = paths._default_chunks_for(a)
  # Both dims smaller than 256 → chunks == shape
  assert chunks == (100, 50)


def test_default_chunks_3d_cube():
  """3D (T,H,W) uses DYNAMIC_CHUNK (1,256,256), clamped to shape."""
  a = np.zeros((10, 300, 300), dtype=np.float32)
  chunks = paths._default_chunks_for(a)
  # DYNAMIC_CHUNK = (1,256,256) → clamped to (1,256,256)
  assert chunks == (1, 256, 256)


def test_default_chunks_3d_small():
  """3D (T,H,W) smaller than DYNAMIC_CHUNK clamps correctly."""
  a = np.zeros((10, 100, 50), dtype=np.float32)
  chunks = paths._default_chunks_for(a)
  # H,W smaller than 256 → chunks == (1,100,50)
  assert chunks == (1, 100, 50)


def test_clamp_chunks_defensive_extra_dims():
  """_clamp_chunks tolerates extra chunk dims and clamps to shape length."""
  shape = (10, 20)
  chunks = paths._clamp_chunks((100, 5, 999), shape)
  # Only first two dims matter; each clamped to [1, shape_i]
  assert chunks == (10, 5)


# ---------------------------------------------------------------------------
# Dtype normalization tests (via write_field, not via private helper)
# ---------------------------------------------------------------------------


def test_write_field_normalizes_float64_to_float32(tmp_path, monkeypatch):
  """float64 inputs are stored as float32 in Zarr."""
  monkeypatch.setenv("AWSRT_DATA_DIR", str(tmp_path / "data"))
  # We must re-import after env change so paths.DATA_DIR picks it up
  from importlib import reload

  reload(paths)  # type: ignore[arg-type]

  run_id = "test-dtype-f64"
  a = np.zeros((4, 4), dtype=np.float64)

  za = paths.write_field(run_id, "field_f64", a)
  assert za.dtype == np.float32


def test_write_field_normalizes_int64_to_int32(tmp_path, monkeypatch):
  """int64 inputs are stored as int32 in Zarr."""
  monkeypatch.setenv("AWSRT_DATA_DIR", str(tmp_path / "data"))
  from importlib import reload

  reload(paths)  # type: ignore[arg-type]

  run_id = "test-dtype-i64"
  a = np.zeros((4, 4), dtype=np.int64)

  za = paths.write_field(run_id, "field_i64", a)
  assert za.dtype == np.int32


def test_write_field_normalizes_bool_to_uint8(tmp_path, monkeypatch):
  """bool inputs are stored as uint8 in Zarr (0/1)."""
  monkeypatch.setenv("AWSRT_DATA_DIR", str(tmp_path / "data"))
  from importlib import reload

  reload(paths)  # type: ignore[arg-type]

  run_id = "test-dtype-bool"
  a = np.array([[True, False], [False, True]], dtype=bool)

  za = paths.write_field(run_id, "field_bool", a)
  assert za.dtype == np.uint8
  vals = set(za[...] .ravel().tolist())
  assert vals <= {0, 1}
