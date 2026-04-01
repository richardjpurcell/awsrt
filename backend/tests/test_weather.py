# backend/tests/test_weather.py
from __future__ import annotations

import numpy as np

from awsrt_core.schemas.physical import PhysicalManifest
from awsrt_core.sim.weather import generate_humidity_rh, generate_temperature_c


def _base_manifest_dict(*, H: int = 12, W: int = 10, T: int = 6, seed: int = 0) -> dict:
    # IMPORTANT: ignition_window.t_max must be < horizon_steps (schema cross-check)
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
        "weather": {
            "enabled": True,
            "temperature": {"enabled": True},
            "humidity": {"enabled": True},
        },
        "fire": {
            # keep defaults, but override ignition_window to satisfy small T
            "ignition_window": {"t_min": 0, "t_max": t_max, "seed": 123},
            # include at least one ignition so integration-style sims can ignite;
            # unit tests don’t depend on it, but it keeps manifests realistic.
            "ignitions": [{"row": 0, "col": 0, "t0": 0, "radius_cells": 0}],
        },
    }


def test_temperature_generator_shape_dtype_and_determinism():
    d = _base_manifest_dict(T=6)
    d["weather"]["temperature"] = {
        "enabled": True,
        "dynamic": True,
        "seed": 123,
        "base_c": 20.0,
    }
    man = PhysicalManifest.model_validate(d)

    a = generate_temperature_c(man)
    b = generate_temperature_c(man)

    assert a.shape == (man.horizon_steps, man.grid.H, man.grid.W)
    assert a.dtype == np.float32
    assert np.all(np.isfinite(a))
    # deterministic given the same manifest/seed
    assert np.array_equal(a, b)


def test_temperature_generator_statistically_same_across_seeds():
    d1 = _base_manifest_dict(T=6)
    d1["weather"]["temperature"] = {"enabled": True, "dynamic": True, "seed": 1, "base_c": 20.0}
    d2 = _base_manifest_dict(T=6)
    d2["weather"]["temperature"] = {"enabled": True, "dynamic": True, "seed": 2, "base_c": 20.0}

    m1 = PhysicalManifest.model_validate(d1)
    m2 = PhysicalManifest.model_validate(d2)

    a = generate_temperature_c(m1)
    b = generate_temperature_c(m2)

    # Not identical, but should be same *scale*.
    ma, mb = float(a.mean()), float(b.mean())
    sa, sb = float(a.std()), float(b.std())

    # Mean can drift a few degrees with different seeds; keep loose.
    assert abs(ma - mb) < 5.0
    # Std should be broadly similar.
    assert abs(sa - sb) < 2.0


def test_humidity_generator_shape_dtype_range_and_determinism():
    d = _base_manifest_dict(T=6)
    d["weather"]["humidity"] = {"enabled": True, "dynamic": True, "seed": 456, "base_rh": 0.35}
    man = PhysicalManifest.model_validate(d)

    a = generate_humidity_rh(man)
    b = generate_humidity_rh(man)

    assert a.shape == (man.horizon_steps, man.grid.H, man.grid.W)
    assert a.dtype == np.float32
    assert np.all(np.isfinite(a))
    assert float(a.min()) >= 0.0
    assert float(a.max()) <= 1.0
    assert np.array_equal(a, b)


def test_humidity_generator_statistically_same_across_seeds():
    d1 = _base_manifest_dict(T=6)
    d1["weather"]["humidity"] = {"enabled": True, "dynamic": True, "seed": 1, "base_rh": 0.35}
    d2 = _base_manifest_dict(T=6)
    d2["weather"]["humidity"] = {"enabled": True, "dynamic": True, "seed": 2, "base_rh": 0.35}

    m1 = PhysicalManifest.model_validate(d1)
    m2 = PhysicalManifest.model_validate(d2)

    a = generate_humidity_rh(m1)
    b = generate_humidity_rh(m2)

    ma, mb = float(a.mean()), float(b.mean())
    sa, sb = float(a.std()), float(b.std())

    # Humidity mean can shift with drift + clipping; keep slightly looser than 0.10.
    assert abs(ma - mb) < 0.15
    assert abs(sa - sb) < 0.10
