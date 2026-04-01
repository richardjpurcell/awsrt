# backend/awsrt_core/schemas/common.py
from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class AWSRTModel(BaseModel):
    """
    Canonical strict base model for all AWSRT schemas.

    - extra="forbid": reject unknown fields (no backward compatibility).
    - validate_default=True: validate defaults like explicit values.
    - str_strip_whitespace=True: normalize incoming strings.
    - validate_assignment=True: catch invalid assignments during internal mutation/tests.
    """
    model_config = ConfigDict(
        extra="forbid",
        validate_default=True,
        str_strip_whitespace=True,
        validate_assignment=True,
    )


class GridSpec(AWSRTModel):
    H: int = Field(..., ge=1)
    W: int = Field(..., ge=1)
    cell_size_m: float = Field(..., gt=0)
    crs_code: str = Field(default="EPSG:4326")


class IdResponse(AWSRTModel):
    id: str = Field(..., min_length=1)


class RunRequest(AWSRTModel):
    id: str = Field(..., min_length=1)


class MetaResponse(AWSRTModel):
    """
    Lightweight metadata used by visualizers.

    Important: MetaResponse must support the "global solution" behavior:
    a run should remain viewable even if upstream runs are deleted, by falling
    back to metadata persisted inside the run's own summary.json.

    Because fallback metadata can be partially unknown, MetaResponse is designed
    to allow "unknown" placeholders:
      - H/W may be 0 if the grid size is not known
      - dt_seconds may be 0 if the timestep is not known
      - crs_code may be "" if CRS is not known

    Visualizers should be robust to unknowns (e.g., hide CRS labels if empty).
    """
    id: str = Field(..., min_length=1)
    H: int = Field(..., ge=0)
    W: int = Field(..., ge=0)
    T: int = Field(..., ge=0)
    dt_seconds: int = Field(..., ge=0)
    horizon_steps: int = Field(..., ge=0)
    crs_code: str = Field(default="")
    cell_size_m: float = Field(..., gt=0)


class ListResponse(AWSRTModel):
    ids: list[str] = Field(default_factory=list)
