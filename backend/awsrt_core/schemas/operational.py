from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field, model_validator

class ImpairmentSpec(BaseModel):
    """
    Operational observation-stream impairments for closed-loop runs.

    AWSRT v0.2 distinguishes three primary impairment classes:

      - delay_steps: timing impairment (staleness via delivery lag)
      - noise_level: content impairment (observation corruption)
      - loss_prob: delivery impairment (observation loss)

    These are operational knobs affecting the delivered observation stream used
    by the embedded belief update in closed-loop runs. They are not the full
    paper-level MDC penalty model.
    """

    noise_level: float = Field(
        default=0.0,
        ge=0.0,
        le=1.0,
        description="Content impairment strength applied to observations before delivery.",
    )
    delay_steps: int = Field(
        default=0,
        ge=0,
        description="Delivery delay in timesteps between observation generation and arrival.",
    )
    loss_prob: float = Field(
        default=0.0,
        ge=0.0,
        le=1.0,
        description="Probability that an observation opportunity produces no delivered observation.",
    )


class O1Spec(BaseModel):
    """
    Closed-loop (O1) epistemic update configuration.

    This is intentionally minimal for O1.0:
      - observations are binary detections (after loss/noise/delay)
      - belief update is a simple local "push up / push down" in the footprint
      - entropy is computed from updated belief

    Later, you can extend this to reuse your full epistemic model.
    """
    enabled: bool = Field(
        default=True,
        description="If true, run closed-loop and store embedded belief/entropy trace.",
    )
    seed: int = Field(default=0, ge=0)

    # Simple measurement-update strengths used in O1.0
    alpha_pos: float = Field(
        default=0.35,
        ge=0.0,
        le=1.0,
        description="Belief increase rate in covered cells when detection=1.",
    )
    alpha_neg: float = Field(
        default=0.15,
        ge=0.0,
        le=1.0,
        description="Belief decrease rate in covered cells when detection=0.",
    )

    # Prior for belief[0] if not seeded from an external epi run
    prior_p: float = Field(
        default=0.02,
        ge=0.0,
        le=1.0,
        description="Initial prior fire probability for belief[0].",
    )

    # Whether to persist embedded epistemic trace arrays inside opr run
    store_epi_trace: bool = Field(default=True)
    # O1.1 residual weights + reference band (no fallback needed; new runs only)
    c_info: float = Field(
        default=1.0,
        ge=0.0,
        description=(
            "Information reward weight for MDC-style operational control. "
            "Larger c_info makes information-rich candidate footprints more attractive "
            "in the deployment score."
        ),
    )
    c_cov: float = Field(
        default=1.0,
        ge=0.0,
        description=(
            "Coverage/arrival weight for MDC-style operational control and diagnostics. "
            "Used in the arrival-oriented deployment score and residual-style summaries."
        ),
    )
    eps_ref: float = Field(
        default=0.0,
        ge=0.0,
        description=(
            "Reference ε band for residual diagnostics. "
            "If eps_ref>0, report fraction r(t)>eps_ref. "
            "If eps_ref==0, backend may auto-scale eps_ref_eff=0.15*max(|r(t)|) per-run."
        ),
    )

    # What observation model we use for O1.0
    obs_model: Literal["detections_binary"] = Field(default="detections_binary")

    # Optional: front-band thickness for overlap_front metric (in cells)
    front_band_cells: int = Field(default=1, ge=0)

    # Uncertainty-policy shaping parameters
    uncertainty_decay: float = Field(
        default=0.985,
        ge=0.0,
        le=1.0,
        description=(
            "Per-step decay for uncertainty memory. Higher values retain recent "
            "coverage history longer, making recently covered regions stay less novel."
        ),
    )
    uncertainty_gain: float = Field(
        default=0.35,
        ge=0.0,
        le=1.0,
        description=(
            "Immediate imprint strength from current-step coverage into "
            "uncertainty memory."
        ),
    )
    uncertainty_gamma: float = Field(
        default=6.0,
        ge=0.0,
        description=(
            "Novelty suppression exponent for the uncertainty policy. "
            "Larger values more strongly downweight recently covered regions."
        ),
    )
    uncertainty_beta: float = Field(
        default=2.0,
        ge=0.0,
        description=(
            "Variance-shaping exponent for the uncertainty policy. "
            "Larger values increase contrast between low- and high-variance cells."
        ),
    )
    uncertainty_lambda: float = Field(
        default=0.15,
        ge=0.0,
        description=(
            "Entropy-bonus weight for the uncertainty policy. "
            "Higher values preserve more exploratory pressure when variance contrast is weak."
        ),
    )

class NetworkSpec(BaseModel):
    """
    Operational network and policy specification.

    Notes:
      - `mdc_info` and `mdc_arrival` remain useful as "MDC-style" options.
        In O1, these can be upgraded to true residual-driven control later.
      - `random_feasible` is a key baseline: it samples feasible deployments
        under the SAME operational constraints, enabling "budget emulation"
        baselines (random sensing under realized action-interface budget).
      - `usefulness_proto` is the compact usefulness-aware controller family.
        In Subgoal E it is interpreted as a three-regime usefulness scaffold
        (exploit / middle / caution) with manifest-backed transition logic.
    """
    policy: Literal[
        "greedy",
        "uncertainty",
        "balance",
        "rl",
        "mdc_info",
        "mdc_arrival",
        "random_feasible",
        "usefulness_proto",
    ] = "greedy"

    deployment_mode: Literal["static", "dynamic"] = "dynamic"
    tie_breaking: Literal["deterministic", "stochastic"] = "deterministic"

    n_sensors: int = Field(default=20, ge=1)

    # Sensing + motion constraints (v0)
    sensor_radius_m: float = Field(default=250.0, gt=0)
    sensor_move_max_m: float = Field(default=500.0, ge=0)
    min_separation_m: float = Field(default=0.0, ge=0.0)

    # Deployment anchor (used for initial positions in dynamic mode)
    base_station_rc: tuple[int, int] = (50, 50)

    # Optional realism knobs (reserved for next iterations)
    movement_budget_m: float = Field(
        default=0.0,
        ge=0.0,
        description="If >0, cap total movement per episode (meters).",
    )
    max_moves_per_step: int = Field(
        default=0,
        ge=0,
        description="If >0, cap number of sensors allowed to move each step.",
    )
    collision_model: Literal["none", "overlap_drop", "one_per_cell"] = Field(
        default="none",
        description="Collision/channel contention model.",
    )
    collision_strength: float = Field(
        default=0.0,
        ge=0.0,
        le=1.0,
        description="Strength parameter for collision models (if used).",
    )
    battery_model: Literal["none", "active_time", "movement_energy"] = Field(
        default="none",
        description="Battery model.",
    )
    battery_capacity: float = Field(
        default=0.0,
        ge=0.0,
        description="Capacity for battery model (units depend on model).",
    )


class UsefulnessRegimePoliciesSpec(BaseModel):
    exploit_policy: Literal["greedy", "uncertainty", "mdc_info", "mdc_arrival"] = Field(
        default="greedy",
        description="Effective controller policy used while the usefulness regime is in exploit.",
    )
    recover_policy: Literal["greedy", "uncertainty", "mdc_info", "mdc_arrival"] = Field(
        default="uncertainty",
        description="Effective controller policy used while the usefulness regime is in the middle regime.",
    )
    caution_policy: Literal["greedy", "uncertainty", "mdc_info", "mdc_arrival"] = Field(
        default="mdc_info",
        description="Effective controller policy used while the usefulness regime is in caution.",
    )


class UsefulnessRegimeThresholdsSpec(BaseModel):
    age_threshold: float = Field(default=0.0, ge=0.0)
    misleading_pos_frac_threshold: float = Field(default=0.0, ge=0.0, le=1.0)
    driver_info_threshold: float = Field(default=0.0, ge=0.0)
    arrivals_high_threshold: float = Field(default=0.0, ge=0.0, le=1.0)
    persistence_steps: int = Field(default=1, ge=1)


class UsefulnessExploitThresholdsSpec(BaseModel):
    age_threshold: float = Field(default=0.5, ge=0.0)
    misleading_pos_frac_threshold: float = Field(default=0.10, ge=0.0, le=1.0)
    driver_info_recover_threshold: float = Field(default=1.0e-5, ge=0.0)
    persistence_steps: int = Field(default=3, ge=1)


class UsefulnessRegimeLoggingSpec(BaseModel):
    store_step_trace: bool = Field(
        default=True,
        description="Persist per-step usefulness-regime series for audit and trace inspection.",
    )
    store_transition_counters: bool = Field(
        default=True,
        description="Persist usefulness trigger/counter series for mechanism inspection.",
    )


class UsefulnessRegimeTransitionLogicSpec(BaseModel):
    recover_entry: UsefulnessRegimeThresholdsSpec = Field(
        default_factory=lambda: UsefulnessRegimeThresholdsSpec(
            age_threshold=1.0,
            misleading_pos_frac_threshold=0.15,
            driver_info_threshold=5.0e-4,
            arrivals_high_threshold=0.80,
            persistence_steps=2,
        )
    )
    caution_entry: UsefulnessRegimeThresholdsSpec = Field(
        default_factory=lambda: UsefulnessRegimeThresholdsSpec(
            age_threshold=2.0,
            misleading_pos_frac_threshold=0.30,
            driver_info_threshold=2.0e-4,
            arrivals_high_threshold=0.80,
            persistence_steps=3,
        )
    )
    recover_exit: UsefulnessExploitThresholdsSpec = Field(
        default_factory=lambda: UsefulnessExploitThresholdsSpec(
            age_threshold=1.0,
            misleading_pos_frac_threshold=0.20,
            driver_info_recover_threshold=1.0e-5,
            persistence_steps=2,
        )
    )
    exploit_entry: UsefulnessExploitThresholdsSpec = Field(
        default_factory=UsefulnessExploitThresholdsSpec
    )


class UsefulnessRegimeSpec(BaseModel):
    enabled: bool = Field(
        default=False,
        description="Enable the three-regime usefulness-aware controller scaffold.",
    )
    middle_label: Literal["recover", "guarded"] = Field(
        default="recover",
        description="Semantic label for the middle usefulness regime.",
    )
    policies: UsefulnessRegimePoliciesSpec = Field(default_factory=UsefulnessRegimePoliciesSpec)
    transition_logic: UsefulnessRegimeTransitionLogicSpec = Field(
        default_factory=UsefulnessRegimeTransitionLogicSpec
    )
    logging: UsefulnessRegimeLoggingSpec = Field(default_factory=UsefulnessRegimeLoggingSpec)
class HealthyUtilizationRangeSpec(BaseModel):
    min: float = Field(default=0.0, ge=0.0, le=1.0)
    max: float = Field(default=1.0, ge=0.0, le=1.0)

    @model_validator(mode="after")
    def _check_range(self):
        if self.max < self.min:
            raise ValueError("healthy_utilization_range.max must be >= min")
        return self


class CertifiedStageSpec(BaseModel):
    stage_id: str = Field(..., min_length=1)
    label: str = Field(default="")
    eta: float = Field(..., ge=0.0, le=0.5)
    expected_certified_rate: float = Field(default=0.0, ge=0.0)
    entropy_threshold: float = Field(default=0.0, ge=0.0)
    healthy_utilization_range: HealthyUtilizationRangeSpec = Field(
        default_factory=HealthyUtilizationRangeSpec
    )


class OpportunisticLevelSpec(BaseModel):
    level_id: str = Field(..., min_length=1)
    label: str = Field(default="")
    eta_adjustment: float = Field(default=0.0)
    motion_adjustment: float = Field(default=0.0)
    healthy_utilization_target: float = Field(default=1.0, ge=0.0, le=1.0)
    notes: str = Field(default="")


class RegimeThresholdSpec(BaseModel):
    utilization_threshold: float = Field(default=0.0, ge=0.0, le=1.0)
    strict_drift_proxy_threshold: float = Field(default=0.0)
    cumulative_exposure_threshold: float = Field(default=0.0, ge=0.0)
    local_drift_rate_threshold: float = Field(default=0.0)
    persistence_steps: int = Field(
        default=1,
        ge=1,
        description="Number of consecutive steps a trigger condition must hold before it is treated as satisfied.",
    )
    hysteresis_band: float = Field(
        default=0.0,
        ge=0.0,
        description="Threshold offset used to reduce chatter between neighboring regime conditions.",
    )


class RegimeSignalsSpec(BaseModel):
    use_utilization: bool = Field(default=True, description="Enable utilization-based advisory trigger components.")
    use_strict_drift_proxy: bool = Field(default=True, description="Enable strict-drift-proxy advisory trigger components.")
    use_local_drift_rate: bool = Field(default=True, description="Enable local-drift-rate advisory trigger components.")
    use_cumulative_exposure: bool = Field(default=True, description="Enable cumulative-exposure advisory trigger components.")
    use_trigger_bools: bool = Field(
        default=True,
        description="If false, advisory trigger booleans are suppressed even if underlying signal components are logged.",
    )


class RegimeLoggingSpec(BaseModel):
    store_step_trace: bool = Field(default=True, description="Persist per-step regime diagnostics.")
    store_trigger_components: bool = Field(
        default=True,
        description="Persist advisory trigger-component diagnostics for verification and debugging.",
    )
    store_transition_details: bool = Field(
        default=True,
        description="Persist active realized transition details when active mode is enabled.",
    )


class RegimeTransitionLogicSpec(BaseModel):
    downshift_thresholds: RegimeThresholdSpec = Field(
        default_factory=RegimeThresholdSpec,
        description="Thresholds for advisory downshift trigger evaluation.",
    )
    switch_to_certified_thresholds: RegimeThresholdSpec = Field(
        default_factory=RegimeThresholdSpec,
        description="Thresholds for advisory switch-to-certified trigger evaluation.",
    )
    recovery_thresholds: RegimeThresholdSpec = Field(
        default_factory=RegimeThresholdSpec,
        description="Thresholds for advisory recovery trigger evaluation.",
    )


class RegimeRecoverySupportSpec(BaseModel):
    """
    Certified-exit requalification support.

    This is intentionally separate from the generic advisory recovery thresholds.
    The semantics are:
      - certified mode remains conservative and sticky
      - exit from certified requires renewed support for opportunistic control
      - support should be broad enough (across sensors / front encounter) and
        persistent enough (via leave-certified persistence)
    """

    enabled: bool = Field(default=True)

    weight_front_overlap: float = Field(default=0.35, ge=0.0)
    weight_detection_arrivals: float = Field(default=0.25, ge=0.0)
    weight_info_driver: float = Field(default=0.25, ge=0.0)
    weight_health: float = Field(default=0.15, ge=0.0)

    support_threshold: float = Field(default=0.30, ge=0.0, le=1.0)
    breadth_threshold: float = Field(default=0.15, ge=0.0, le=1.0)

    persistence_steps: int = Field(default=3, ge=1)
    require_switch_off: bool = Field(default=True)


class RegimeOpportunisticSpec(BaseModel):
    ladder: list[OpportunisticLevelSpec] = Field(default_factory=list)

    @model_validator(mode="after")
    def _check_unique_level_ids(self):
        ids = [x.level_id for x in self.ladder]
        if len(ids) != len(set(ids)):
            raise ValueError("opportunistic.ladder must have unique level_id values")
        return self


class RegimeCertifiedSpec(BaseModel):
    stages: list[CertifiedStageSpec] = Field(default_factory=list)

    @model_validator(mode="after")
    def _check_unique_stage_ids(self):
        ids = [s.stage_id for s in self.stages]
        if len(ids) != len(set(ids)):
            raise ValueError("certified.stages must have unique stage_id values")
        return self


class RegimeManagementSpec(BaseModel):
    enabled: bool = Field(default=False)
    mode: Literal["advisory", "active"] = Field(
        default="advisory",
        description=(
            "advisory = compute/log suggested regime state and trigger activity only; "
            "active = apply realized regime state transitions to control quantities such as eta and motion budget."
        ),
    )

    signals: RegimeSignalsSpec = Field(default_factory=RegimeSignalsSpec)
    transition_logic: RegimeTransitionLogicSpec = Field(default_factory=RegimeTransitionLogicSpec)
    recovery_support: RegimeRecoverySupportSpec = Field(default_factory=RegimeRecoverySupportSpec)
    opportunistic: RegimeOpportunisticSpec = Field(default_factory=RegimeOpportunisticSpec)
    certified: RegimeCertifiedSpec = Field(default_factory=RegimeCertifiedSpec)
    logging: RegimeLoggingSpec = Field(default_factory=RegimeLoggingSpec)

    @model_validator(mode="after")
    def _check_mode_requirements(self):
        if not self.enabled:
            return self

        if self.mode == "active":
            if len(self.certified.stages) == 0:
                raise ValueError(
                    "regime_management.certified.stages must be non-empty when enabled=true and mode='active'"
                )
        return self


class OperationalManifest(BaseModel):
    """
    Operational run manifest.

    Mainline mode is O1 closed-loop, which selects a physical run and produces
    an embedded epistemic trace (belief/entropy) as part of the operational run.

    O0 replay mode is kept as an advanced/debug mode:
      - set run_mode="replay" and provide epi_id
    """
    run_mode: Literal["closed_loop", "replay"] = Field(default="closed_loop")

    # O1: prefer selecting physical directly.
    phy_id: Optional[str] = Field(
        default=None,
        description="Physical run id. Required for run_mode='closed_loop'.",
    )

    # O0: replay on a precomputed epistemic run (optional).
    epi_id: Optional[str] = Field(
        default=None,
        description="Epistemic run id. Required for run_mode='replay' (optional/debug).",
    )

    impairments: ImpairmentSpec = Field(default_factory=ImpairmentSpec)
    network: NetworkSpec = Field(default_factory=NetworkSpec)

    # Closed-loop configuration (only used when run_mode='closed_loop')
    o1: O1Spec = Field(default_factory=O1Spec)
    usefulness_regime: UsefulnessRegimeSpec = Field(default_factory=UsefulnessRegimeSpec)
    regime_management: RegimeManagementSpec = Field(default_factory=RegimeManagementSpec)

    @model_validator(mode="after")
    def _check_run_mode_requirements(self):
        if self.run_mode == "closed_loop":
            if not self.phy_id:
                raise ValueError("phy_id is required when run_mode='closed_loop'")
        elif self.run_mode == "replay":
            if not self.epi_id:
                raise ValueError("epi_id is required when run_mode='replay'")
        return self

