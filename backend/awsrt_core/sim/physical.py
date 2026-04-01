# backend/awsrt_core/sim/physical.py
from __future__ import annotations

from typing import Callable, Optional

import numpy as np

from awsrt_core.schemas.physical import PhysicalManifest
from awsrt_core.sim.fuels import generate_fuels
from awsrt_core.sim.fire import simulate_fire as simulate_fire_core
from awsrt_core.sim.terrain import generate_terrain
from awsrt_core.sim.weather import generate_humidity_rh, generate_temperature_c
from awsrt_core.sim.wind import generate_wind_uv

StoreFn = Callable[[str, np.ndarray], None]


def _bool(v: object) -> bool:
    """Canonical helper: treat any truthy value as enabled."""
    return bool(v)


def generate_weather_fields(
    man: PhysicalManifest,
    *,
    temperature_c: np.ndarray | None = None,
    humidity_rh: np.ndarray | None = None,
) -> tuple[np.ndarray | None, np.ndarray | None]:
    """
    Generate optional weather fields according to the manifest.

    Canonical behavior:
      - If weather.enabled is false: do NOT generate arrays.
      - If weather.enabled is true: generate any enabled sub-fields that were not provided.
    """
    weather = getattr(man, "weather", None)
    if weather is None or not _bool(getattr(weather, "enabled", False)):
        return None, None

    # Temperature
    temp_cfg = getattr(weather, "temperature", None)
    if temperature_c is None and temp_cfg is not None and _bool(getattr(temp_cfg, "enabled", False)):
        temperature_c = generate_temperature_c(man)

    # Humidity
    hum_cfg = getattr(weather, "humidity", None)
    if humidity_rh is None and hum_cfg is not None and _bool(getattr(hum_cfg, "enabled", False)):
        humidity_rh = generate_humidity_rh(man)

    return temperature_c, humidity_rh


def run_physical(
    man: PhysicalManifest,
    *,
    terrain: np.ndarray | None = None,
    fuels: np.ndarray | None = None,
    wind_u: np.ndarray | None = None,
    wind_v: np.ndarray | None = None,
    temperature_c: np.ndarray | None = None,
    humidity_rh: np.ndarray | None = None,
    store: Optional[StoreFn] = None,
) -> dict[str, np.ndarray | None]:
    """
    Canonical physical orchestrator (strict, no backward-compat):
      - Uses manifest .enabled flags to decide what gets STORED (and thus appears in /fields).
      - Still produces any arrays required for simulation internally (e.g., wind always exists for fire).
      - Rejects caller-provided arrays when the corresponding manifest block is disabled.

    Storage rules (canonical):
      - terrain: stored iff man.terrain.enabled
      - fuels:   stored iff man.fuels.enabled
      - wind:    stored iff man.wind.enabled
      - weather: stored iff man.weather.enabled and subfield.enabled
      - fire_state/arrival_time: always stored (outputs)
    """
    T, H, W = int(man.horizon_steps), int(man.grid.H), int(man.grid.W)

    # -------------------------
    # Enabled flags
    # -------------------------
    terrain_spec = getattr(man, "terrain", None)
    terrain_enabled = bool(terrain_spec is not None and _bool(getattr(terrain_spec, "enabled", False)))

    fuels_spec = getattr(man, "fuels", None)
    fuels_enabled = bool(fuels_spec is not None and _bool(getattr(fuels_spec, "enabled", False)))

    wind_spec = getattr(man, "wind", None)
    wind_enabled = bool(wind_spec is not None and _bool(getattr(wind_spec, "enabled", False)))

    weather = getattr(man, "weather", None)
    weather_enabled = bool(weather is not None and _bool(getattr(weather, "enabled", False)))

    temp_spec = getattr(weather, "temperature", None) if weather is not None else None
    hum_spec = getattr(weather, "humidity", None) if weather is not None else None
    temp_enabled = bool(temp_spec is not None and _bool(getattr(temp_spec, "enabled", False)))
    hum_enabled = bool(hum_spec is not None and _bool(getattr(hum_spec, "enabled", False)))

    fire = getattr(man, "fire", None)
    wx = getattr(fire, "weather_coupling", None) if fire is not None else None
    coupling_enabled = bool(wx is not None and _bool(getattr(wx, "enabled", False)))

    # Canonical consistency: coupling implies weather is enabled in the manifest.
    if coupling_enabled and not weather_enabled:
        raise ValueError(
            "fire.weather_coupling.enabled=true requires weather.enabled=true in the manifest "
            "(canonical AWSRT behavior)."
        )

    # -------------------------
    # Terrain (optional storage; always provide a simulation terrain)
    # -------------------------
    # Strictness: don't accept caller-provided terrain if manifest disables terrain storage.
    if not terrain_enabled and terrain is not None:
        raise ValueError("terrain was provided but terrain.enabled=false in the manifest.")

    if terrain_enabled:
        if terrain is None:
            terrain = generate_terrain(man)
        terrain_sim = np.asarray(terrain, dtype=np.float32)
        if terrain_sim.shape != (H, W):
            raise ValueError(f"terrain must have shape (H,W)=({H},{W}); got {terrain_sim.shape}")
    else:
        # Canonical: flat terrain for simulation when disabled (no stored field, no viewer option).
        terrain_sim = np.zeros((H, W), dtype=np.float32)

    # -------------------------
    # Fuels (optional)
    # -------------------------
    # Strictness: don't silently drop caller-provided fuels if manifest disables fuels.
    if not fuels_enabled and fuels is not None:
        raise ValueError("fuels was provided but fuels.enabled=false in the manifest.")

    fuels_sim: np.ndarray | None
    if fuels_enabled:
        if fuels is None:
            fuels = generate_fuels(man, terrain=terrain_sim)
        fuels_sim = np.asarray(fuels, dtype=np.uint8)
        if fuels_sim.shape != (H, W):
            raise ValueError(f"fuels must have shape (H,W)=({H},{W}); got {fuels_sim.shape}")
    else:
        fuels_sim = None

    # -------------------------
    # Wind (required for simulation; optional storage)
    # -------------------------
    # Canonical: caller must provide BOTH wind_u and wind_v, or neither (auto-generate).
    if (wind_u is None) ^ (wind_v is None):
        raise ValueError("Provide both wind_u and wind_v, or neither (to auto-generate).")

    # Strictness: if wind storage is disabled, reject externally provided time-varying wind arrays.
    if not wind_enabled and (wind_u is not None or wind_v is not None):
        raise ValueError("wind_u/wind_v were provided but wind.enabled=false in the manifest.")

    if wind_u is None and wind_v is None:
        # generate_wind_uv should honor man.wind.enabled + man.wind.dynamic internally; when disabled,
        # it should typically produce constant fields from man.wind.u/v (often zeros).
        wind_u, wind_v = generate_wind_uv(man, terrain_sim)

    wind_u_sim = np.asarray(wind_u, dtype=np.float32)
    wind_v_sim = np.asarray(wind_v, dtype=np.float32)
    if wind_u_sim.shape != (T, H, W) or wind_v_sim.shape != (T, H, W):
        raise ValueError(
            f"wind_u/wind_v must have shape (T,H,W)=({T},{H},{W}); got {wind_u_sim.shape} / {wind_v_sim.shape}"
        )

    # -------------------------
    # Weather (optional; required if coupling enabled)
    # -------------------------
    # Strictness: if weather is disabled, reject externally provided weather arrays.
    if not weather_enabled and (temperature_c is not None or humidity_rh is not None):
        raise ValueError(
            "temperature_c/humidity_rh were provided but weather.enabled=false in the manifest. "
            "Enable weather in the manifest to use/store weather arrays."
        )

    # Canonical strictness at the subfield boundary:
    # do not accept externally provided arrays for disabled weather subfields.
    if temperature_c is not None and not temp_enabled:
        raise ValueError(
            "temperature_c was provided but weather.temperature.enabled=false in the manifest."
        )

    if humidity_rh is not None and not hum_enabled:
        raise ValueError(
            "humidity_rh was provided but weather.humidity.enabled=false in the manifest."
        )

    temperature_c, humidity_rh = generate_weather_fields(
        man,
        temperature_c=temperature_c,
        humidity_rh=humidity_rh,
    )

    # If coupling is enabled, require at least one usable weather field.
    # (Does NOT require both.)
    if coupling_enabled and temperature_c is None and humidity_rh is None:
        raise ValueError(
            "fire.weather_coupling.enabled=true, but no weather fields are available. "
            "Enable at least one of weather.temperature.enabled or weather.humidity.enabled "
            "in the manifest (or provide temperature_c/humidity_rh arrays)."
        )

    temp_sim: np.ndarray | None = None
    rh_sim: np.ndarray | None = None

    if temperature_c is not None:
        temp_sim = np.asarray(temperature_c, dtype=np.float32)
        if temp_sim.shape != (T, H, W):
            raise ValueError(f"temperature_c must have shape (T,H,W)=({T},{H},{W}); got {temp_sim.shape}")

    if humidity_rh is not None:
        rh_sim = np.asarray(humidity_rh, dtype=np.float32)
        if rh_sim.shape != (T, H, W):
            raise ValueError(f"humidity_rh must have shape (T,H,W)=({T},{H},{W}); got {rh_sim.shape}")
        rh_sim = np.clip(rh_sim, 0.0, 1.0, out=rh_sim)

    # -------------------------
    # Store inputs (ONLY if enabled)
    # -------------------------
    if store is not None:
        if terrain_enabled:
            store("terrain", terrain_sim)

        if wind_enabled:
            store("wind_u", wind_u_sim)
            store("wind_v", wind_v_sim)

        if fuels_sim is not None:
            store("fuels", fuels_sim)

        # Weather storage is governed by weather.enabled AND subfield.enabled.
        # Store only arrays whose subfield is actually enabled in the manifest.
        if temp_enabled and temp_sim is not None:
            store("temperature_c", temp_sim)
        if hum_enabled and rh_sim is not None:
            store("humidity_rh", rh_sim)

    # -------------------------
    # Fire simulation (consumes generated/provided arrays)
    # -------------------------
    fire_state, arrival_time = simulate_fire_core(
        man,
        terrain_sim,
        wind_u_sim,
        wind_v_sim,
        fuels=fuels_sim,
        temperature_c=temp_sim,
        humidity_rh=rh_sim,
    )

    # -------------------------
    # Store outputs (always)
    # -------------------------
    if store is not None:
        store("fire_state", np.asarray(fire_state))
        store("arrival_time", np.asarray(arrival_time))

    return {
        # Return simulation arrays (even if not stored), so the router can render fire.png etc.
        "terrain": terrain_sim,
        "fuels": fuels_sim,
        "wind_u": wind_u_sim,
        "wind_v": wind_v_sim,
        "temperature_c": temp_sim,
        "humidity_rh": rh_sim,
        "fire_state": fire_state,
        "arrival_time": arrival_time,
    }


__all__ = ["run_physical", "generate_weather_fields"]
