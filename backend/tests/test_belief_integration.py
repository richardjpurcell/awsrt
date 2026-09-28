from __future__ import annotations

import os
from pathlib import Path

import numpy as np
import zarr


def _physical_manifest(*, H: int = 8, W: int = 8, T: int = 3) -> dict:
    return {
        "dt_seconds": 60,
        "horizon_steps": T,
        "seed": 0,
        "grid": {
            "H": H,
            "W": W,
            "cell_size_m": 250.0,
            "crs_code": "EPSG:3978",
            "origin_x": 0.0,
            "origin_y": 0.0,
        },
        "terrain": {
            "enabled": True,
            "seed": 1,
            "amplitude": 250.0,
            "smooth_iters": 2,
        },
        "wind": {
            "enabled": True,
            "u": 2.0,
            "v": 0.5,
            "dynamic": False,
        },
        "fuels": {
            "enabled": True,
            "preset": "fort_mcmurray",
        },
        "weather": {
            "enabled": True,
            "temperature": {
                "enabled": True,
                "dynamic": False,
                "seed": 123,
                "base_c": 20.0,
            },
            "humidity": {
                "enabled": True,
                "dynamic": False,
                "seed": 456,
                "base_rh": 0.35,
            },
        },
        "fire": {
            "spread_prob_base": 0.25,
            "burn_time_steps": 2,
            "ignition_window": {
                "t_min": 0,
                "t_max": T - 1,
                "seed": 999,
            },
            "ignitions": [
                {
                    "row": H // 2,
                    "col": W // 2,
                    "t0": 0,
                    "radius_cells": 0,
                }
            ],
            "weather_coupling": {
                "enabled": True,
                "temp_gain": 0.02,
                "rh_gain": 1.0,
                "mult_min": 0.25,
                "mult_max": 4.0,
            },
        },
    }


def _belief_manifest(phy_id: str, *, loss_prob: float) -> dict:
    return {
        "phy_id": phy_id,
        "belief": {
            "model": "beta_bernoulli",
            "prior_p": 0.5,
            "decay": 1.0,
            "noise": {
                "false_pos": 0.0,
                "false_neg": 0.0,
            },
        },
        "entropy": {
            "model": "shannon",
            "units": "bits",
        },
        "support": {
            "model": "scanline_support",
            "budget": 8,
            "seed": 0,
        },
        "impairment": {
            "mode": "model_a_iid",
            "loss_prob": loss_prob,
            "delay_geom_p": 1.0,
            "max_delay_steps": 0,
        },
        "mdc": {
            "eps": 0.0,
            "residual_driver": "arrival_frac",
            "residual_c": 0.0,
        },
    }


def _create_and_run_belief_lab(client, phy_id: str, *, loss_prob: float) -> str:
    r = client.post(
        "/epistemic/manifest",
        json=_belief_manifest(phy_id, loss_prob=loss_prob),
    )
    assert r.status_code == 200, r.text
    epi_id = r.json()["epi_id"]

    r2 = client.post("/epistemic/run", json={"id": epi_id})
    assert r2.status_code == 200, r2.text

    return epi_id


def _open_field(data_root: Path, run_id: str, field: str) -> np.ndarray:
    zpath = data_root / "fields" / run_id / "fields.zarr"
    group = zarr.open_group(str(zpath), mode="r")
    return np.asarray(group[field][:])


def test_delivery_not_support_alone_updates_belief(client):
    # Produce one deterministic physical truth shared by both Belief Lab runs.
    r = client.post("/physical/manifest", json=_physical_manifest())
    assert r.status_code == 200, r.text
    phy_id = r.json()["phy_id"]

    r2 = client.post("/physical/run", json={"id": phy_id})
    assert r2.status_code == 200, r2.text

    # Same sensing opportunity, two channel conditions:
    # all observations delivered vs all observations lost.
    delivered_id = _create_and_run_belief_lab(client, phy_id, loss_prob=0.0)
    lost_id = _create_and_run_belief_lab(client, phy_id, loss_prob=1.0)

    data_root = Path(os.environ["AWSRT_DATA_DIR"])

    delivered_support = _open_field(data_root, delivered_id, "support_mask")
    delivered_arrived = _open_field(data_root, delivered_id, "arrived_mask")
    delivered_belief = _open_field(data_root, delivered_id, "belief")
    delivered_entropy = _open_field(data_root, delivered_id, "entropy")

    lost_support = _open_field(data_root, lost_id, "support_mask")
    lost_arrived = _open_field(data_root, lost_id, "arrived_mask")
    lost_belief = _open_field(data_root, lost_id, "belief")
    lost_entropy = _open_field(data_root, lost_id, "entropy")

    # Both runs attempt exactly the same deterministic sensing support.
    np.testing.assert_array_equal(delivered_support, lost_support)
    assert np.count_nonzero(delivered_support) > 0

    # With zero loss and zero delay, every attempted observation arrives.
    np.testing.assert_array_equal(delivered_arrived, delivered_support)

    # With total loss, support is still attempted but nothing arrives.
    assert np.count_nonzero(lost_arrived) == 0

    # decay=1 resets to the p=0.5 prior each step. With no arrivals, the
    # posterior therefore remains exactly at that prior and at maximum
    # Bernoulli entropy (1 bit).
    np.testing.assert_allclose(lost_belief, 0.5)
    np.testing.assert_allclose(lost_entropy, 1.0)

    # Delivered observations must have a belief consequence on arrived cells.
    arrived = delivered_arrived.astype(bool)
    assert np.any(np.abs(delivered_belief[arrived] - 0.5) > 0.0)

    # Those delivered observations also reduce uncertainty relative to the
    # no-arrival case on at least one arrived cell.
    assert np.any(delivered_entropy[arrived] < lost_entropy[arrived])
