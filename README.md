# AWSRT: Adaptive Wildfire Sensing Research Tool

AWSRT is an **information-centric research software platform** for studying adaptive wildfire sensing in dynamic and uncertain environments.

The platform supports four linked research layers:

- **Physical**: wildfire environment generation and replay, including grid, terrain, fuels, wind, weather, and fire spread
- **Epistemic**: belief-state construction and uncertainty analysis, including Beta–Bernoulli belief updates and Shannon entropy summaries
- **Operational**: sensing-network policies, impairment models, and regime-managed control experiments
- **Analysis**: study manifests, metrics, figures, and experiment comparison workflows

AWSRT is designed to support research on questions such as:

- how adaptive sensing policies differ under controlled conditions,
- when information delivery and operational usefulness begin to separate,
- how delay, noise, and loss affect belief quality differently,
- and how higher-level regime logic can respond when sensing remains active but belief improvement begins to stall.

This repository contains the frozen **AWSRT v0.1** research software state associated with the thesis-results version of the platform. Future development proceeds from later versions (for example, `v0.2-dev`), but this repository state documents the software basis of the v0.1 research release and provides a stable public reference point for ongoing development.

## Core capabilities

AWSRT currently supports:

- generation of synthetic physical wildfire environments,
- import of historical replay physical runs from CFSDS-style artifacts,
- epistemic belief evolution over physical runs,
- operational sensing experiments with multiple policy families,
- impairment studies with noise, delay, and loss,
- metric computation including timeliness and entropy summaries,
- manifest-based experiment definition and recovery,
- frontend visualization and study inspection workflows,
- and figure generation for comparative analysis.

## Repository structure

- `backend/` — FastAPI backend and AWSRT core modules
- `frontend/` — Next.js frontend for design, visualization, and analysis
- `data/manifests/` — preserved manifests defining runs and studies
- `results/figures/` — preserved figure exports associated with the frozen results version
- `src/plots.py` — plotting support
- `notes/` — selected supporting research notes retained with the frozen software version

## Run the backend

Create an environment, install the package, and start the API server:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -U pip
pip install -e .
uvicorn backend.api.main:app --reload --port 8000
```

Health check:

http://127.0.0.1:8000/health

## Environment variables

### Data directory override

By default AWSRT writes artifacts under `./data/`, including:

- `data/manifests/`
- `data/fields/`
- `data/renders/`
- `data/metrics/`

To override the root data directory:

- `AWSRT_DATA_DIR=/abs/path/to/data`

Example:

```bash
export AWSRT_DATA_DIR=/tmp/awsrt_data
uvicorn backend.api.main:app --reload --port 8000
```

### Render resolution

AWSRT renders overlay-aligned PNGs (for example base, fire, wind, and fuels layers) using a pixel canvas derived from grid dimensions. For large historical replays, higher render resolution is often useful.

Available variables:

- `AWSRT_RENDER_PX_PER_CELL`  
  Pixels per grid cell. Higher values increase sharpness and file size.

- `AWSRT_RENDER_MAX_SIDE_PX`  
  Hard clamp on the longest rendered PNG side.

- `AWSRT_RENDER_DPI`  
  Matplotlib DPI used during rendering.

Recommended starting points:

- Small simulations (≤ 300×300):
  - `AWSRT_RENDER_PX_PER_CELL=2.0`
  - `AWSRT_RENDER_MAX_SIDE_PX=4096`
  - `AWSRT_RENDER_DPI=160`

- Large historical replays:
  - `AWSRT_RENDER_PX_PER_CELL=3.0`
  - `AWSRT_RENDER_MAX_SIDE_PX=8192`
  - `AWSRT_RENDER_DPI=200`

Example:

```bash
export AWSRT_RENDER_PX_PER_CELL=3.0
export AWSRT_RENDER_MAX_SIDE_PX=8192
export AWSRT_RENDER_DPI=200
uvicorn backend.api.main:app --reload --port 8000
```

### Render cache note

Render endpoints cache PNGs under `data/renders/{phy_id}/t/{t}/...`. If you change render environment variables, delete cached renders to regenerate them at the new resolution:

```bash
rm -rf data/renders/phy-XXXXX
# or only cached timestep frames:
rm -rf data/renders/phy-XXXXX/t
```

## Run the frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Open:

http://127.0.0.1:3000

## Quick smoke test

### 1. Create and run a physical simulation

```bash
curl -s -X POST http://127.0.0.1:8000/physical/manifest \
  -H "Content-Type: application/json" \
  -d '{
    "grid": {"H": 100, "W": 100, "cell_size_m": 250, "crs_code": "EPSG:3978"},
    "dt_seconds": 3600,
    "horizon_steps": 48,
    "seed": 0,
    "terrain": {"enabled": true, "seed": 42, "smooth_iters": 8},
    "fire": {"ignitions": [{"row": 50, "col": 50, "t0": 0}], "spread_prob": 1.0}
  }' | jq

# suppose it returns {"phy_id": "phy-..."}
curl -s -X POST http://127.0.0.1:8000/physical/run \
  -H "Content-Type: application/json" \
  -d '{"id": "phy-..."}' | jq
```

### 2. Create and run an epistemic layer

```bash
curl -s -X POST http://127.0.0.1:8000/epistemic/manifest \
  -H "Content-Type: application/json" \
  -d '{
    "phy_id": "phy-...",
    "belief": {"prior_p": 0.5, "decay": 1.0, "noise": {"false_pos": 0.01, "false_neg": 0.05}},
    "entropy": {"units": "bits"},
    "observe_all_cells": true
  }' | jq

# suppose it returns {"epi_id": "epi-..."}
curl -s -X POST http://127.0.0.1:8000/epistemic/run \
  -H "Content-Type: application/json" \
  -d '{"id": "epi-..."}' | jq
```

### 3. Create and run an operational experiment

```bash
curl -s -X POST http://127.0.0.1:8000/operational/manifest \
  -H "Content-Type: application/json" \
  -d '{
    "epi_id": "epi-...",
    "mdc": {
      "delta": 1.0,
      "epsilon": 0.1,
      "rho": 0.01,
      "tau": 0.2,
      "noise_level": 0.1,
      "delay_steps": 1,
      "loss_prob": 0.05
    },
    "network": {
      "policy": "greedy",
      "deployment_mode": "dynamic",
      "tie_breaking": "deterministic",
      "n_sensors": 20,
      "sensor_radius_m": 250,
      "sensor_move_max_m": 500,
      "min_separation_m": 0,
      "base_station_rc": [50, 50]
    }
  }' | jq

# suppose it returns {"opr_id": "opr-..."}
curl -s -X POST http://127.0.0.1:8000/operational/run \
  -H "Content-Type: application/json" \
  -d '{"id": "opr-..."}' | jq

curl -s http://127.0.0.1:8000/metrics/opr-.../summary | jq
```

## Historical replays (CFSDS)

AWSRT supports historical replay physical runs from on-disk CFSDS-style artifacts.

### Expected data layout

Place files under:

```text
data/cfsds/{fire_id}/
  {fire_id}_krig.tif
  Firegrowth_groups_v1_1_{fire_id}.csv          (optional but recommended)
  Firegrowth_pts_v1_1_{fire_id}.csv             (optional)
  bundle.json                                   (optional)
```

Example:

```text
data/cfsds/2016_255/2016_255_krig.tif
```

### Create a CFSDS replay run

This creates a new `phy-...` run with historical fields such as `fire_state` and `arrival_time`. You do not run `/physical/run` afterward because the importer writes the fields directly.

```bash
curl -s -X POST http://127.0.0.1:8000/physical/historical/import \
  -H "Content-Type: application/json" \
  -d '{
    "source": "cfsds",
    "fire_id": "2016_255",
    "dt_seconds": 3600,
    "label": "CFSDS replay 2016_255"
  }' | jq
```

### Create a synthetic demo replay

```bash
curl -s -X POST http://127.0.0.1:8000/physical/historical/import \
  -H "Content-Type: application/json" \
  -d '{
    "source": "cfsds_demo",
    "fire_id": "demo_001",
    "H": 200,
    "W": 200,
    "days": 10,
    "dt_seconds": 3600,
    "burn_duration_hours": 12,
    "label": "Synthetic replay demo"
  }' | jq
```

### Viewing historical runs

- Open the frontend physical visualizer
- Select the returned `phy-...` id
- The manifest includes `source: historical_cfsds` and a `historical` metadata block

## Testing

Backend tests are located under:

```text
backend/tests/
```

Typical test command:

```bash
pytest backend/tests
```

## Notes on scope

AWSRT v0.1 is a meaningful research software release, but it is not the final form of the platform. The software is designed to support continuing development in later versions while preserving a frozen, reproducible basis for the v0.1 results and documentation.

In particular:

- policies are intentionally simple enough to be swappable and extensible,
- manifests are preserved so studies can be recovered and compared,
- and the platform is intended to support future refinement in simulation realism, sensing logic, control logic, and experiment design.

## Citation and versioning

If you use AWSRT in research, please cite the software repository and associated release metadata. Citation metadata is provided in `CITATION.cff`.

This repository contains the frozen research software state associated with AWSRT v0.1. If you are documenting or citing the thesis-results version of the platform, refer to the frozen `v0.1` tag rather than later development branches.

## Contributing

Contributions are welcome, especially bug reports, documentation improvements, testing improvements, and research-workflow enhancements. Please open an issue before making substantial changes so proposed work can be discussed in advance. See `CONTRIBUTING.md` for guidance.

## License

AWSRT is released under the BSD 3-Clause License. See the `LICENSE` file for details.

## Acknowledgements

AWSRT was developed as part of ongoing research on adaptive wildfire sensing in dynamic and uncertain environments. Specific project, institutional, funding, and collaboration acknowledgements will be maintained here as the public repository record develops.
