from __future__ import annotations

from fastapi import APIRouter
from awsrt_core.io.paths import metrics_dir
from awsrt_core.metrics.basic import read_summary_json, read_steps_csv


router = APIRouter()


@router.get("/{run_id}/summary")
def summary(run_id: str) -> dict:
    return read_summary_json(metrics_dir(run_id) / "summary.json")


@router.get("/{run_id}/steps")
def steps(run_id: str) -> dict:
    return {"rows": read_steps_csv(metrics_dir(run_id) / "step_metrics.csv")}
