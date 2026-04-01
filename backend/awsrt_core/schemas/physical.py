# backend/awsrt_core/schemas/physical.py
from __future__ import annotations

from typing import Dict, List, Literal, Optional

from pydantic import Field, model_validator

from awsrt_core.schemas.common import AWSRTModel, GridSpec as _BaseGridSpec

Neighborhood = Literal["von_neumann", "moore"]
FireMode = Literal["stochastic", "deterministic"]
FuelPreset = Literal["fort_mcmurray", "boreal_conifer", "mixedwood", "deciduous"]


class GridSpec(_BaseGridSpec):
    """
    Physical-grid specialization:
    - defaults tuned for your common physical use-case
    - origin included (useful for geo-referencing later)
    """
    cell_size_m: float = Field(default=250.0, gt=0)
    crs_code: str = Field(default="EPSG:3978")

    origin_x: float = 0.0
    origin_y: float = 0.0


class TerrainSpec(AWSRTModel):
    enabled: bool = True
    seed: int = 42
    amplitude: float = 250.0
    smooth_iters: int = Field(default=8, ge=0)


class WindSpec(AWSRTModel):
    enabled: bool = False
    # wind components in m/s (u east-west, v north-south)
    u: float = 0.0
    v: float = 0.0
    units: Literal["m/s"] = "m/s"

    # --- dynamic/heterogeneous wind ---
    dynamic: bool = False
    seed: int = 0

    # spatial heterogeneity (static field added to u,v), in m/s
    spatial_amp: float = Field(default=0.0, ge=0.0)
    spatial_smooth_iters: int = Field(default=6, ge=0)

    # temporal variation (global AR(1) drift added each step), in m/s
    temporal_sigma: float = Field(default=0.25, ge=0.0)
    tau_steps: float = Field(default=6.0, gt=0.0)  # correlation timescale in steps (larger = slower changes)

    # terrain-coupled component (downslope bias vector), in m/s
    terrain_gain: float = Field(default=0.0, ge=0.0)


# -------------------------
# Weather (temp/humidity) generators
# -------------------------

class TemperatureSpec(AWSRTModel):
    enabled: bool = False
    units: Literal["C"] = "C"

    base_c: float = 20.0

    dynamic: bool = False
    seed: int = 123

    spatial_amp_c: float = Field(default=3.0, ge=0.0)
    spatial_smooth_iters: int = Field(default=8, ge=0)

    temporal_sigma_c: float = Field(default=0.5, ge=0.0)
    tau_steps: float = Field(default=8.0, gt=0.0)


class HumiditySpec(AWSRTModel):
    enabled: bool = False
    units: Literal["rh"] = "rh"

    # NOTE: this schema treats RH as a fraction in [0,1]
    base_rh: float = Field(default=0.35, ge=0.0, le=1.0)

    dynamic: bool = False
    seed: int = 456

    spatial_amp_rh: float = Field(default=0.10, ge=0.0)
    spatial_smooth_iters: int = Field(default=8, ge=0)

    temporal_sigma_rh: float = Field(default=0.02, ge=0.0)
    tau_steps: float = Field(default=8.0, gt=0.0)


class WeatherSpec(AWSRTModel):
    """
    weather.enabled controls whether the orchestrator generates & stores weather arrays.

    Invariant:
      - if weather.enabled is True, at least one of temperature/humidity must be enabled
      - if either temperature/humidity is enabled, weather.enabled must be True
    """
    enabled: bool = False
    temperature: TemperatureSpec = Field(default_factory=TemperatureSpec)
    humidity: HumiditySpec = Field(default_factory=HumiditySpec)

    @model_validator(mode="after")
    def _check_enabled_consistency(self):
        any_field_enabled = bool(self.temperature.enabled) or bool(self.humidity.enabled)
        if self.enabled and not any_field_enabled:
            raise ValueError("weather.enabled=true requires temperature.enabled or humidity.enabled to be true")
        if any_field_enabled and not self.enabled:
            raise ValueError("temperature/humidity enabled requires weather.enabled=true")
        return self


class Ignition(AWSRTModel):
    row: int = Field(..., ge=0)
    col: int = Field(..., ge=0)
    t0: Optional[int] = None
    radius_cells: int = Field(default=0, ge=0)

    @model_validator(mode="after")
    def _check_t0(self):
        # Canonical: allow t0==0 (ignite at the initial frame).
        # None means "sample from ignition_window".
        if self.t0 is not None and self.t0 < 0:
            raise ValueError("Ignition.t0 must be >= 0 (or null to sample)")
        return self


class IgnitionWindow(AWSRTModel):
    # Canonical: allow sampling from t=0 as well.
    t_min: int = Field(default=0, ge=0)
    t_max: int = Field(default=12, ge=0)
    seed: int = 123

    @model_validator(mode="after")
    def _check_range(self):
        if self.t_max < self.t_min:
            raise ValueError("ignition_window.t_max must be >= ignition_window.t_min")
        return self


class SpottingSpec(AWSRTModel):
    enabled: bool = False
    prob: float = Field(default=0.0, ge=0.0, le=1.0)
    radius_cells: int = Field(default=10, ge=0)
    seed: int = 0


# -------------------------
# Fire ↔ Weather coupling (default OFF)
# -------------------------

class FireWeatherCouplingSpec(AWSRTModel):
    """
    Optional coupling from generated weather fields into the fire model.

    No backward compatibility: canonical field names only.
    """
    enabled: bool = False

    # Future-proofing: current sim effectively implements "spread_prob"
    affects: Literal["spread_prob", "burn_time", "both"] = "spread_prob"

    # Reference operating point
    temp_ref_c: float = 20.0
    rh_ref: float = Field(default=0.35, ge=0.0, le=1.0)

    # Canonical gain names
    temp_gain: float = 0.0
    rh_gain: float = 0.0

    # Clamp multiplier for stability
    mult_min: float = Field(default=0.25, gt=0.0)
    mult_max: float = Field(default=4.0, gt=0.0)

    @model_validator(mode="after")
    def _check(self):
        if self.mult_max < self.mult_min:
            raise ValueError("fire.weather_coupling.mult_max must be >= mult_min")
        return self


class FireSpec(AWSRTModel):
    model: Literal["anisotropic"] = "anisotropic"
    mode: FireMode = "stochastic"
    neighborhood: Neighborhood = "moore"

    spread_prob_base: float = Field(default=0.35, ge=0.0, le=1.0)
    burn_time_steps: int = Field(default=4, ge=1)

    wind_gain: float = Field(default=1.0, ge=0.0)
    slope_gain: float = Field(default=1.0, ge=0.0)

    det_threshold: float = Field(default=0.5, ge=0.0, le=1.0)

    ignitions: List[Ignition] = Field(default_factory=list)
    ignition_window: IgnitionWindow = Field(default_factory=IgnitionWindow)
    spotting: SpottingSpec = Field(default_factory=SpottingSpec)

    weather_coupling: FireWeatherCouplingSpec = Field(default_factory=FireWeatherCouplingSpec)


class FuelsSpec(AWSRTModel):
    enabled: bool = False

    preset: FuelPreset = "fort_mcmurray"
    dominant_codes: List[str] = Field(default_factory=lambda: ["C2", "C3", "M1"])
    dominant_weights: List[float] = Field(default_factory=lambda: [0.55, 0.30, 0.15])

    seed: int = 7

    patch_iters: int = Field(default=10, ge=0)
    terrain_correlation: float = Field(default=0.35, ge=0.0, le=1.0)

    spread_mult: Dict[str, float] = Field(default_factory=dict)
    burn_mult: Dict[str, float] = Field(default_factory=dict)

    @model_validator(mode="after")
    def _check(self):
        codes = [str(c).strip().upper() for c in (self.dominant_codes or []) if str(c).strip()]
        if len(codes) == 0:
            raise ValueError("fuels.dominant_codes must contain at least 1 fuel code")
        if len(codes) > 3:
            raise ValueError("fuels.dominant_codes supports up to 3 dominant fuel codes")

        if len(self.dominant_weights) != len(codes):
            raise ValueError("fuels.dominant_weights must match dominant_codes length")
        if any(float(w) < 0 for w in self.dominant_weights):
            raise ValueError("fuels.dominant_weights must be non-negative")

        s = float(sum(self.dominant_weights))
        if s <= 0:
            raise ValueError("fuels.dominant_weights must sum to > 0")

        # IMPORTANT: do NOT assign via `self.dominant_codes = ...` because validate_assignment=True
        # would re-trigger validation and recurse.
        object.__setattr__(self, "dominant_codes", codes)

        return self


class HistoricalMeta(AWSRTModel):
    """
    Metadata for historical replay runs (e.g., derived from CFSDS).
    """
    datasource: Literal["cfsds", "cfsds_demo"] = "cfsds_demo"
    fire_id: str
    label: Optional[str] = None
    notes: Optional[str] = None


class PhysicalManifest(AWSRTModel):
    grid: GridSpec
    dt_seconds: int = Field(default=3600, gt=0)
    horizon_steps: int = Field(default=48, ge=1)
    seed: int = 0

    # Source of this physical run:
    # - "simulated": produced by the Physical Designer + /physical/run
    # - "historical_cfsds": derived from CFSDS (or demo replay)
    source: Literal["simulated", "historical_cfsds"] = "simulated"
    historical: Optional[HistoricalMeta] = None

    terrain: TerrainSpec = Field(default_factory=TerrainSpec)
    wind: WindSpec = Field(default_factory=WindSpec)
    fuels: FuelsSpec = Field(default_factory=FuelsSpec)
    weather: WeatherSpec = Field(default_factory=WeatherSpec)
    fire: FireSpec = Field(default_factory=FireSpec)

    @model_validator(mode="after")
    def _cross_checks(self):
        H = int(self.grid.H)
        W = int(self.grid.W)
        T = int(self.horizon_steps)

        # ignition window bounds
        iw = self.fire.ignition_window
        if iw.t_min >= T:
            raise ValueError("fire.ignition_window.t_min must be < horizon_steps")
        if iw.t_max >= T:
            raise ValueError("fire.ignition_window.t_max must be < horizon_steps")

        # ignition list bounds
        for ign in self.fire.ignitions:
            if ign.row < 0 or ign.row >= H:
                raise ValueError("fire.ignitions[].row must be within grid [0, H)")
            if ign.col < 0 or ign.col >= W:
                raise ValueError("fire.ignitions[].col must be within grid [0, W)")
            if ign.t0 is not None and (ign.t0 < 0 or ign.t0 >= T):
                raise ValueError("fire.ignitions[].t0 must satisfy 0 <= t0 < horizon_steps")

        # coupling requires weather arrays to exist (temp and/or RH)
        if self.fire.weather_coupling.enabled:
            if not self.weather.enabled:
                raise ValueError("fire.weather_coupling.enabled=true requires weather.enabled=true")
            if not (self.weather.temperature.enabled or self.weather.humidity.enabled):
                raise ValueError(
                    "fire.weather_coupling.enabled=true requires temperature.enabled or humidity.enabled"
                )

        return self


class HistoricalImportRequest(AWSRTModel):
    """
    Request payload for /physical/historical/import.

    For now this drives a synthetic "CFSDS demo" replay that creates:
      - a manifest with source="historical_cfsds"
      - canonical fields.zarr with fire_state, arrival_time, terrain, and placeholder belief.
    """
    source: Literal["cfsds_demo", "cfsds"] = "cfsds_demo"
    fire_id: str

    dt_seconds: int = Field(default=3600, gt=0)
    burn_duration_hours: int = Field(default=6, ge=1)

    # Synthetic grid + progression params for the demo
    H: int = Field(default=128, ge=4)
    W: int = Field(default=128, ge=4)
    days: int = Field(default=5, ge=1)

    label: Optional[str] = None
