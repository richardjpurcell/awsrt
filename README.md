# AWSRT — Fresh Scaffold (v0)

This repo contains a minimal-but-robust scaffold for the **Adaptive Wildfire Sensing Research Tool (AWSRT)**:
- **Physical**: grid + terrain + simple spread
- **Epistemic**: Beta–Bernoulli belief + Shannon entropy
- **Operational**: toy policies + sensors + MDC stub
- **Analysis**: metrics endpoints (AUC / TTFD / per-step MDC rows)

## Run (backend)

Install + run:

```bash
python -m venv .venv && source .venv/bin/activate
pip install -U pip
pip install -e .
uvicorn backend.api.main:app --reload --port 8000
```

Health check: http://127.0.0.1:8000/health

## Environment variables (recommended)

### Data directory override

By default AWSRT writes artifacts under `./data/`:

- `data/manifests/`
- `data/fields/`
- `data/renders/`
- `data/metrics/`

To override:

- `AWSRT_DATA_DIR=/abs/path/to/data`

Example:

```bash
export AWSRT_DATA_DIR=/tmp/awsrt_data
uvicorn backend.api.main:app --reload --port 8000
```

### Render resolution (PNG quality)

AWSRT renders overlay-aligned PNGs (base / fire / wind / fuels) using a pixel canvas derived from `(H,W)`.  
For **large historical replays**, you’ll usually want higher resolution.

Set these **before starting** the backend:

- `AWSRT_RENDER_PX_PER_CELL`  
  Pixels per grid cell (higher = sharper, slower, larger PNGs).  
  Typical: `1.0` to `4.0`

- `AWSRT_RENDER_MAX_SIDE_PX`  
  Hard clamp on the longest PNG side (prevents huge renders).  
  Typical: `4096`, `8192`, `12000`

- `AWSRT_RENDER_DPI`  
  Matplotlib DPI (secondary; affects antialiasing).  
  Typical: `160` to `240`

**Recommended starting points**

- Small sims (≤ 300×300):
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

### Render cache note (important)

Render endpoints cache PNGs under `data/renders/{phy_id}/t/{t}/…`.  
If you change render env vars, delete cached renders to see the new resolution:

```bash
rm -rf data/renders/phy-XXXXX
# or to wipe only per-timestep frames:
rm -rf data/renders/phy-XXXXX/t
```

## Run (frontend)

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Open: http://127.0.0.1:3000

## Quick curl smoke test

### Create + run a physical sim

```bash
curl -s -X POST http://127.0.0.1:8000/physical/manifest   -H "Content-Type: application/json"   -d '{
    "grid": {"H": 100, "W": 100, "cell_size_m": 250, "crs_code": "EPSG:3978"},
    "dt_seconds": 3600,
    "horizon_steps": 48,
    "seed": 0,
    "terrain": {"enabled": true, "seed": 42, "smooth_iters": 8},
    "fire": {"ignitions": [{"row": 50, "col": 50, "t0": 0}], "spread_prob": 1.0}
  }' | jq

# suppose it returns {"phy_id": "phy-..."}
curl -s -X POST http://127.0.0.1:8000/physical/run   -H "Content-Type: application/json"   -d '{"id": "phy-..."}' | jq
```

### Create + run epistemic

```bash
curl -s -X POST http://127.0.0.1:8000/epistemic/manifest   -H "Content-Type: application/json"   -d '{
    "phy_id": "phy-...",
    "belief": {"prior_p": 0.5, "decay": 1.0, "noise": {"false_pos": 0.01, "false_neg": 0.05}},
    "entropy": {"units": "bits"},
    "observe_all_cells": true
  }' | jq

# suppose it returns {"epi_id": "epi-..."}
curl -s -X POST http://127.0.0.1:8000/epistemic/run   -H "Content-Type: application/json"   -d '{"id": "epi-..."}' | jq
```

### Create + run operational

```bash
curl -s -X POST http://127.0.0.1:8000/operational/manifest   -H "Content-Type: application/json"   -d '{
    "epi_id": "epi-...",
    "mdc": {"delta": 1.0, "epsilon": 0.1, "rho": 0.01, "tau": 0.2, "noise_level": 0.1, "delay_steps": 1, "loss_prob": 0.05},
    "network": {"policy": "greedy", "deployment_mode": "dynamic", "tie_breaking": "deterministic", "n_sensors": 20,
                "sensor_radius_m": 250, "sensor_move_max_m": 500, "min_separation_m": 0, "base_station_rc": [50, 50]}
  }' | jq

# suppose it returns {"opr_id": "opr-..."}
curl -s -X POST http://127.0.0.1:8000/operational/run   -H "Content-Type: application/json"   -d '{"id": "opr-..."}' | jq

curl -s http://127.0.0.1:8000/metrics/opr-.../summary | jq
```

## Historical replays (CFSDS)

AWSRT supports creating **historical replay physical runs** directly from on-disk CFSDS artifacts.

### Expected data layout

Place files under:

```
data/cfsds/{fire_id}/
  {fire_id}_krig.tif
  Firegrowth_groups_v1_1_{fire_id}.csv          (optional but recommended)
  Firegrowth_pts_v1_1_{fire_id}.csv             (optional)
  bundle.json                                   (optional)
```

Example:

```
data/cfsds/2016_255/2016_255_krig.tif
```

### Create a CFSDS replay run (from data/cfsds/... files)

This creates a new `phy-...` run with fields like `fire_state`, `arrival_time`, etc.  
**You do not run `/physical/run` afterward** — the importer writes the fields directly.

```bash
curl -s -X POST http://127.0.0.1:8000/physical/historical/import   -H "Content-Type: application/json"   -d '{
    "source": "cfsds",
    "fire_id": "2016_255",
    "dt_seconds": 3600,
    "label": "CFSDS replay 2016_255"
  }' | jq
```

### Create a synthetic demo replay (no files required)

```bash
curl -s -X POST http://127.0.0.1:8000/physical/historical/import   -H "Content-Type: application/json"   -d '{
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

### Viewing

- Open the frontend physical visualizer
- Select the returned `phy-...` id
- The manifest includes a `source` of `historical_cfsds` and a `historical` metadata block (fire id, label, notes)

## Notes

- Data are written to `data/` (manifests, zarr fields, png renders, metrics).
- Policies are intentionally simple for v0; interfaces are designed so you can swap in richer models later.
- If you increase render resolution, remember cached frames may need clearing under `data/renders/{phy_id}/…`.
