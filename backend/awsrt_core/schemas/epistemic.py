# awsrt_core/schemas/epistemic.py
from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field, model_validator


class ObservationNoise(BaseModel):
    false_pos: float = Field(default=0.0, ge=0.0, le=1.0)
    false_neg: float = Field(default=0.0, ge=0.0, le=1.0)


class BeliefSpec(BaseModel):
    model: Literal["beta_bernoulli"] = "beta_bernoulli"
    prior_p: float = Field(default=0.5, ge=1e-6, le=1 - 1e-6)
    # 1.0 => reset to prior each step (frame-wise filtering). 0.0 => pure accumulation.
    decay: float = Field(default=1.0, ge=0.0, le=1.0)
    noise: ObservationNoise = Field(default_factory=ObservationNoise)


class EntropySpec(BaseModel):
    model: Literal["shannon"] = "shannon"
    units: Literal["bits", "nats"] = "bits"


class SupportSpec(BaseModel):
    # Belief Lab: support is the set of sensed cells each step
    model: Literal["random_support", "fixed_support_mask"] = "random_support"

    # Budget: number of cells sensed per step
    # (If you truly want to allow "sense nothing", change ge=1 back to ge=0.)
    budget: int = Field(default=512, ge=1)

    # RNG seed (reproducibility)
    seed: int = 0

    # Only used if model == "fixed_support_mask"
    fixed_mask_path: Optional[str] = None  # e.g., "data/masks/my_mask.npy"

    @model_validator(mode="after")
    def _fixed_mask_requires_path(self) -> "SupportSpec":
        if self.model == "fixed_support_mask":
            p = (self.fixed_mask_path or "").strip()
            if not p:
                raise ValueError("support.fixed_mask_path is required when support.model == 'fixed_support_mask'")
        return self


class ImpairmentSpec(BaseModel):
    mode: Literal["model_a_iid", "mnar_experimental"] = "model_a_iid"

    # Independent loss (Model A)
    loss_prob: float = Field(default=0.0, ge=0.0, le=1.0)

    # Independent delay (Model A) — geometric delay over steps (0,1,2,...)
    delay_geom_p: float = Field(default=1.0, ge=1e-6, le=1.0)  # p=1 => always 0 delay
    max_delay_steps: int = Field(default=0, ge=0)  # clamp tail for bounded storage


class MDCSpec(BaseModel):
    """
    MDC diagnostics configuration:
      eps: threshold in ΔH̄(t) <= -eps
      residual_driver: which driver series you *view* as the MDC "forcing" term
      residual_c: optional fixed scale; if 0.0 you are effectively viewing raw ΔH̄(t)
    """

    eps: float = Field(default=0.0, ge=0.0)
    residual_driver: Literal["arrival_frac", "arrived_info_proxy"] = "arrival_frac"
    residual_c: float = Field(default=0.0)


class EpistemicManifest(BaseModel):
    phy_id: str
    belief: BeliefSpec = Field(default_factory=BeliefSpec)
    entropy: EntropySpec = Field(default_factory=EntropySpec)

    support: SupportSpec = Field(default_factory=SupportSpec)
    impairment: ImpairmentSpec = Field(default_factory=ImpairmentSpec)

    # MDC settings owned by the manifest
    mdc: MDCSpec = Field(default_factory=MDCSpec)

    # Keep existing for backward-compat (but Option A ignores it)
    observe_all_cells: bool = True

    @model_validator(mode="after")
    def _check_manifest_requirements(self) -> "EpistemicManifest":
        if not str(self.phy_id or "").strip():
            raise ValueError("phy_id is required")

        # fixed_mask must be meaningful under the current support model
        if self.support.model != "fixed_support_mask" and self.support.fixed_mask_path:
            # normalize obvious junk
            p = str(self.support.fixed_mask_path or "").strip()
            if not p:
                self.support.fixed_mask_path = None

        # If there is no delay support requested, keep max_delay_steps coherent.
        if float(self.impairment.delay_geom_p) >= 1.0 and int(self.impairment.max_delay_steps) == 0:
            return self

        # Bounded storage knob should not be negative; schema already enforces that,
        # but keep a semantic check for clarity.
        if int(self.impairment.max_delay_steps) < 0:
            raise ValueError("impairment.max_delay_steps must be >= 0")

        return self