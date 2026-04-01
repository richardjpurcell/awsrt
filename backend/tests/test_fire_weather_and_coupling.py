# backend/tests/test_fire_weather_and_coupling.py
from __future__ import annotations

import numpy as np

import warnings

from awsrt_core.schemas.physical import FireWeatherCouplingSpec
from awsrt_core.sim.fire import _weather_multiplier


def test_multiplier_temp_only():
    cfg = FireWeatherCouplingSpec(
        enabled=True,
        temp_ref_c=20.0,
        rh_ref=0.35,
        temp_gain=0.1,
        rh_gain=0.0,
        mult_min=0.25,
        mult_max=4.0,
    )

    temp = np.array([[20.0, 21.0], [22.0, 19.0]], dtype=np.float32)
    rh = None

    m = _weather_multiplier(temp, rh, cfg)

    # exp(0.1*(temp-20))
    expected = np.exp(0.1 * (temp - 20.0)).astype(np.float32)
    expected = np.clip(expected, cfg.mult_min, cfg.mult_max)

    assert m.dtype == np.float32
    assert m.shape == (2, 2)
    assert np.allclose(m, expected, rtol=1e-6, atol=1e-6)


def test_multiplier_rh_only():
    cfg = FireWeatherCouplingSpec(
        enabled=True,
        temp_ref_c=20.0,
        rh_ref=0.35,
        temp_gain=0.0,
        rh_gain=2.0,
        mult_min=0.25,
        mult_max=4.0,
    )

    temp = None
    rh = np.array([[0.35, 0.25], [0.50, 0.10]], dtype=np.float32)

    m = _weather_multiplier(temp, rh, cfg)

    expected = np.exp(2.0 * (0.35 - np.clip(rh, 0.0, 1.0))).astype(np.float32)
    expected = np.clip(expected, cfg.mult_min, cfg.mult_max)

    assert m.dtype == np.float32
    assert m.shape == (2, 2)
    assert np.allclose(m, expected, rtol=1e-6, atol=1e-6)


def test_multiplier_both_terms_multiply():
    cfg = FireWeatherCouplingSpec(
        enabled=True,
        temp_ref_c=20.0,
        rh_ref=0.35,
        temp_gain=0.1,
        rh_gain=2.0,
        mult_min=0.25,
        mult_max=4.0,
    )

    temp = np.array([[20.0, 21.0], [22.0, 19.0]], dtype=np.float32)
    rh = np.array([[0.35, 0.25], [0.50, 0.10]], dtype=np.float32)

    m = _weather_multiplier(temp, rh, cfg)

    expected = (
        np.exp(0.1 * (temp - 20.0)) * np.exp(2.0 * (0.35 - np.clip(rh, 0.0, 1.0)))
    ).astype(np.float32)
    expected = np.clip(expected, cfg.mult_min, cfg.mult_max)

    assert np.allclose(m, expected, rtol=1e-6, atol=1e-6)


def test_multiplier_clamping_behavior():
    cfg = FireWeatherCouplingSpec(
        enabled=True,
        temp_ref_c=20.0,
        rh_ref=0.35,
        temp_gain=10.0,
        rh_gain=0.0,
        mult_min=0.25,
        mult_max=4.0,
    )

    temp = np.array([[100.0]], dtype=np.float32)

    with warnings.catch_warnings():
        warnings.simplefilter("ignore", RuntimeWarning)
        m = _weather_multiplier(temp, None, cfg)

    assert float(m[0, 0]) == float(cfg.mult_max)
