from __future__ import annotations

import json
import urllib.error
import urllib.request


BASE_URL = "http://127.0.0.1:8000"


def request_json(method: str, path: str, payload: dict | None = None) -> dict:
    data = None
    headers = {}

    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"

    request = urllib.request.Request(
        f"{BASE_URL}{path}",
        data=data,
        headers=headers,
        method=method,
    )

    try:
        with urllib.request.urlopen(request) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(
            f"{method} {path} failed with HTTP {exc.code}: {body}"
        ) from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(
            f"Could not reach AWSRT at {BASE_URL}. "
            "Start the backend with `make backend` first."
        ) from exc


def physical_manifest() -> dict:
    H = 8
    W = 8
    T = 3

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


def belief_manifest(phy_id: str, loss_prob: float) -> dict:
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


def run_belief_case(phy_id: str, loss_prob: float) -> tuple[str, dict]:
    created = request_json(
        "POST",
        "/epistemic/manifest",
        belief_manifest(phy_id, loss_prob),
    )
    epi_id = created["epi_id"]

    request_json("POST", "/epistemic/run", {"id": epi_id})
    series = request_json("GET", f"/epistemic/{epi_id}/series")

    return epi_id, series


def main() -> None:
    health = request_json("GET", "/health")
    print(
        f"AWSRT backend: ok={health.get('ok')} "
        f"version={health.get('version')}"
    )

    created = request_json("POST", "/physical/manifest", physical_manifest())
    phy_id = created["phy_id"]
    request_json("POST", "/physical/run", {"id": phy_id})

    delivered_id, delivered = run_belief_case(phy_id, loss_prob=0.0)
    lost_id, lost = run_belief_case(phy_id, loss_prob=1.0)

    print()
    print("Minimal scientific workflow")
    print("---------------------------")
    print(f"Physical truth:       {phy_id}")
    print(f"Delivered case:       {delivered_id}")
    print(f"Total-loss case:      {lost_id}")
    print()
    print(f"Delivered arrival fraction: {delivered['arrival_frac']}")
    print(f"Total-loss arrival fraction: {lost['arrival_frac']}")
    print()
    print(f"Delivered mean entropy:      {delivered['mean_entropy']}")
    print(f"Total-loss mean entropy:     {lost['mean_entropy']}")
    delivered_arrival = delivered["arrival_frac"]
    lost_arrival = lost["arrival_frac"]
    delivered_entropy = delivered["mean_entropy"]
    lost_entropy = lost["mean_entropy"]

    if not any(value > 0.0 for value in delivered_arrival):
        raise RuntimeError("Delivered case produced no received observations.")

    if not all(value == 0.0 for value in lost_arrival):
        raise RuntimeError("Total-loss case unexpectedly received observations.")

    if not all(value == 1.0 for value in lost_entropy):
        raise RuntimeError(
            "Total-loss case did not remain at maximum Bernoulli entropy."
        )

    if not any(
        delivered_value < lost_value
        for delivered_value, lost_value in zip(
            delivered_entropy,
            lost_entropy,
            strict=True,
        )
    ):
        raise RuntimeError(
            "Delivered evidence did not reduce mean entropy."
        )

    print()
    print("Verification: PASS")
    print()
    print("Interpretation:")
    print(
        "Both epistemic runs use the same physical truth and the same "
        "deterministic sensing configuration."
    )
    print(
        "The controlled difference is delivery loss: observations are "
        "delivered in one case and completely lost in the other."
    )
    print(
        "Compare arrival fraction and mean entropy to see how delivery "
        "changes the evidence available to the maintained belief."
    )


if __name__ == "__main__":
    main()
