from __future__ import annotations

# Public API for the sim layer.
# Keep these imports stable even as internal files are refactored.

from awsrt_core.sim.fuels import (
    DEFAULT_BURN_MULT,
    DEFAULT_SPREAD_MULT,
    DEFAULT_TERRAIN_BIAS,
    FUEL_CODE_TO_ID,
    generate_fuels,
)
from awsrt_core.sim.terrain import generate_terrain
from awsrt_core.sim.wind import generate_wind_uv
from awsrt_core.sim.weather import generate_humidity_rh, generate_temperature_c
from awsrt_core.sim.fire import simulate_fire

__all__ = [
    # fuels
    "generate_fuels",
    "FUEL_CODE_TO_ID",
    "DEFAULT_SPREAD_MULT",
    "DEFAULT_BURN_MULT",
    "DEFAULT_TERRAIN_BIAS",
    # terrain/wind/weather
    "generate_terrain",
    "generate_wind_uv",
    "generate_temperature_c",
    "generate_humidity_rh",
    # fire
    "simulate_fire",
]
