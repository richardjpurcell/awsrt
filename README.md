# AWSRT: Adaptive Wildfire Sensing Research Tool

AWSRT is an **information-centric research software platform** for studying adaptive wildfire sensing in dynamic and uncertain environments.

The platform supports three linked research layers:

- **Physical**: wildfire environment generation and replay, including grid, terrain, fuels, wind, weather, and fire spread
- **Epistemic**: belief-state construction and uncertainty analysis, including Beta–Bernoulli belief updates and Shannon entropy summaries
- **Operational**: sensing-network policies, impairment models, and regime-managed control experiments
- **Analysis**: study manifests, metrics, figures, and experiment comparison workflows

AWSRT is designed to support research on questions such as:

- how adaptive sensing policies differ under controlled conditions,
- when information delivery and operational usefulness begin to separate,
- how delay, noise, and loss affect belief quality differently,
- and how higher-level regime logic can respond when sensing remains active but belief improvement begins to stall.

This repository contains the frozen **AWSRT v0.1** research software state associated with the thesis-results version of the platform. Future development proceeds from later versions (for example, `v0.2-dev`), but this repository state documents the software basis of the v0.1 research release.

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