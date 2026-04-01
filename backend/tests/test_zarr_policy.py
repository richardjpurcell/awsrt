# backend/tests/test_zarr_policy.py
from __future__ import annotations

import os
from pathlib import Path

import numpy as np
import zarr

from awsrt_core.io.paths import open_fields_group, write_field


def test_zarr_chunking_and_dtype_policy(tmp_path, monkeypatch):
    monkeypatch.setenv("AWSRT_DATA_DIR", str(tmp_path / "data"))

    run_id = "phy-testpolicy"
    g = open_fields_group(run_id, mode="a")

    # 2D static
    a2 = (np.random.rand(300, 300) * 10.0).astype(np.float64)  # should normalize to float32
    write_field(run_id, "temp2d", a2)
    arr2 = g["temp2d"]
    assert arr2.dtype == np.float32
    assert arr2.chunks == (256, 256)

    # 3D dynamic
    a3 = (np.random.rand(3, 300, 300) * 10.0).astype(np.float64)  # normalize float32
    write_field(run_id, "temp3d", a3)
    arr3 = g["temp3d"]
    assert arr3.dtype == np.float32
    assert arr3.chunks[0] == 1
    assert arr3.chunks[1:] == (256, 256)

    # bool -> uint8
    b = (np.random.rand(3, 10, 10) > 0.5)
    write_field(run_id, "mask", b)
    arrb = g["mask"]
    assert arrb.dtype == np.uint8
