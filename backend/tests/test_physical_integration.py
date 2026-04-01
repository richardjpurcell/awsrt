# backend/tests/test_physical_integration.py
from __future__ import annotations

import os
from pathlib import Path

import zarr


def _manifest_payload(*, H: int = 16, W: int = 12, T: int = 4, seed: int = 0) -> dict:
    # ignition_window.t_max must be < horizon_steps
    t_max = max(0, T - 1)

    return {
        "dt_seconds": 60,
        "horizon_steps": T,
        "seed": seed,
        "grid": {
            "H": H,
            "W": W,
            "cell_size_m": 250.0,
            "crs_code": "EPSG:3978",
            "origin_x": 0.0,
            "origin_y": 0.0,
        },
        "terrain": {"enabled": True, "seed": 1, "amplitude": 250.0, "smooth_iters": 2},
        "wind": {"enabled": True, "u": 2.0, "v": 0.5, "dynamic": False},
        "fuels": {"enabled": True, "preset": "fort_mcmurray"},
        "weather": {
            "enabled": True,
            "temperature": {"enabled": True, "dynamic": False, "seed": 123, "base_c": 20.0},
            "humidity": {"enabled": True, "dynamic": False, "seed": 456, "base_rh": 0.35},
        },
        "fire": {
            "spread_prob_base": 0.25,
            "burn_time_steps": 2,
            "ignition_window": {"t_min": 0, "t_max": t_max, "seed": 999},
            "ignitions": [{"row": H // 2, "col": W // 2, "t0": 0, "radius_cells": 0}],
            "weather_coupling": {
                "enabled": True,
                "temp_gain": 0.02,
                "rh_gain": 1.0,
                "mult_min": 0.25,
                "mult_max": 4.0,
            },
        },
    }


def test_manifest_run_zarr_and_png_endpoints(client):
    # 1) Post manifest
    r = client.post("/physical/manifest", json=_manifest_payload())
    assert r.status_code == 200, r.text
    phy_id = r.json()["phy_id"]

    # 2) Run it (router expects {"id": "..."} not {"phy_id": "..."} )
    r2 = client.post("/physical/run", json={"id": phy_id})
    assert r2.status_code == 200, r2.text

    # 3) Verify fields list
    rf = client.get(f"/physical/{phy_id}/fields")
    assert rf.status_code == 200, rf.text

    # Your endpoint returns {"fields": [...]}
    fields = set(rf.json()["fields"])
    for k in (
        "terrain",
        "fuels",
        "wind_u",
        "wind_v",
        "temperature_c",
        "humidity_rh",
        "fire_state",
        "arrival_time",
    ):
        assert k in fields

    # 4) Verify Zarr exists on disk at canonical location under AWSRT_DATA_DIR
    data_root = Path(os.environ["AWSRT_DATA_DIR"])
    zpath = data_root / "fields" / phy_id / "fields.zarr"
    assert zpath.exists()

    g = zarr.open_group(str(zpath), mode="r")
    for k in (
        "terrain",
        "fuels",
        "wind_u",
        "wind_v",
        "temperature_c",
        "humidity_rh",
        "fire_state",
        "arrival_time",
    ):
        assert k in g

    # chunk sanity (dynamic arrays should have leading chunk dim == 1)
    assert g["fire_state"].chunks[0] == 1
    assert g["temperature_c"].chunks[0] == 1
    assert g["humidity_rh"].chunks[0] == 1

    # 5) Verify a couple PNG endpoints return 200
    rb = client.get(f"/physical/{phy_id}/t/0/base.png?bg=terrain")
    assert rb.status_code == 200, rb.text

    rf = client.get(f"/physical/{phy_id}/t/0/fire_alpha.png")
    assert rf.status_code == 200, rf.text

    # 6) Cached renders should exist
    renders_dir = data_root / "renders" / phy_id
    assert renders_dir.exists()
    assert any(p.suffix == ".png" for p in renders_dir.rglob("*.png"))
