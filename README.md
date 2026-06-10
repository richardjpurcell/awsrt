# AWSRT — Adaptive Wildfire Sensing Research Tool

AWSRT is the **Adaptive Wildfire Sensing Research Tool**, a research instrument for studying adaptive sensing, belief maintenance, information impairment, and usefulness under wildfire-like dynamic fields.

AWSRT is not an operational wildfire simulator and does not claim high-fidelity physical wildfire prediction. Its purpose is to make separations between timing, information delivery, belief quality, epistemic inspectability, and usefulness-state behavior inspectable under controlled experimental conditions.

## Current status

The current `main` branch includes the frozen AWSRT v0.6 result state, the completed v0.7 shareability/coherence pass, the completed v0.8 reproducible-handoff pass, and the completed v0.9 interpretability/inspectability pass.

* **v0.6** is the frozen distance-window and cross-artifact synthesis release used to support current thesis and journal-paper interpretation.
* **v0.7** completed a shareability, coherence, documentation, build-hardening, and auditability pass.
* **v0.8** moved AWSRT from a shareable repository toward reproducible handoff through installation checks, first-run workflow, backend/frontend validation, community-readiness review, metadata cleanup, and committee-facing orientation.
* **v0.9** moved AWSRT from reproducible handoff toward interpretable inspection. It improved operational visualizer readability, added and reviewed Epistemic Surface support-geometry workflows, strengthened Epistemic Visualizer support/arrival inspection, added optional cloud-like uncertainty rendering, updated thesis-facing epistemic figures and metrics, and completed an interpretability freeze.

The current documentation-facing goal is to align the repository for JOSS/open-science review: README clarity, installation instructions, test instructions, citation metadata, reproducibility notes, contribution guidance, and paper-facing statement of need.

AWSRT remains research software under active development. It is intended to support thesis-facing and paper-facing experimental analysis, not operational wildfire deployment.

## What AWSRT is

AWSRT is a controlled research environment for asking questions such as:

* when sensing activity and useful information diverge;
* how delay, noise, and loss affect maintained belief quality;
* how prescribed sensing support, realized arrivals, and belief entropy separate under controlled epistemic inspection;
* how detection timing differs from belief maintenance;
* how deployment geometry and observation windows affect timing access;
* how adaptive sensing policies behave under impaired information flow;
* how visual inspection aligns or misaligns with entropy-side and delivery-side metrics;
* how compact usefulness states such as exploit, recover, and caution remain interpretable under bounded conditions.

The tool is designed to expose relationships among:

* **timing**, such as time-to-first-detection;
* **information delivery**, such as whether observations arrive;
* **belief quality**, such as entropy-based summaries;
* **usefulness-state behavior**, such as exploit, recover, and caution occupancy;
* **epistemic support structure**, such as prescribed support masks, realized arrivals, and support-geometry effects;
* **visual inspectability**, such as belief, entropy, entropy-change, support, and support-arrival visualizer windows;
* **structural variables**, such as deployment geometry, observation windows, transformed fire artifacts, and tie-breaking semantics.

## What AWSRT is not

AWSRT should not be read as:

* a real-time operational wildfire management system;
* a high-fidelity physical wildfire simulator;
* a physical twin or digital twin of a specific fire;
* a universally optimal adaptive-sensing controller;
* a claim that one metric captures usefulness by itself;
* a claim that Epistemic Surface support geometries are operational search policies;
* a claim that visual impressions replace metric-based interpretation;
* a claim that the tested results generalize to all wildfire settings.

The Physical Surface uses structured wildfire-like fields and transformed fire artifacts as experimental substrates. These fields may represent or stand in for environmental structure, but they are used to test sensing, belief maintenance, and information-usefulness questions rather than to predict real wildfire behavior.

The Epistemic Surface uses controlled support geometries as belief-maintenance probes. These probes are used to inspect support, arrival, information activity, entropy-side belief quality, and visual interpretation under controlled conditions. They should not be interpreted as operational wildfire search strategies.

## Four research surfaces

AWSRT is organized around four research surfaces.

### Physical Surface

The Physical Surface defines structured environmental fields used by AWSRT experiments. These include grid structure, ignition, fire-like spread, terrain-like structure, directional-bias fields, fuel-like heterogeneity, scalar environmental fields, and transformed fire artifacts.

The Physical Surface provides the environmental substrate consumed by later surfaces. It should be understood as an experimental field generator and artifact interface, not as a physical wildfire-prediction engine.

### Epistemic Surface

The Epistemic Surface maintains belief-state and uncertainty representations over the monitored field. It supports belief updates, uncertainty summaries, entropy calculations, belief-quality analysis, controlled support-geometry probes, and visual inspection of support/arrival structure.

This surface is central to the thesis framing because AWSRT is not only asking whether the system detects fire. It is asking whether observations help maintain an uncertainty-aware belief state under impaired information flow.

The v0.9 Epistemic Surface work added thesis-facing support-geometry inspection workflows. These workflows separate prescribed support, realized arrivals, delivered-information activity, entropy-side belief quality, and visual impressions under controlled conditions. Support geometries are interpreted as epistemic probes, not as operational wildfire search policies.

The Epistemic Visualizer supports inspection through belief, entropy/uncertainty, entropy-change, prescribed-support, and arrivals-over-support views. Visual impressions are treated as inspection aids and are interpreted alongside metrics such as entropy AUC, terminal entropy, arrived-information proxy, and related diagnostics.

### Operational Surface

The Operational Surface runs adaptive sensing behavior. It includes sensing-network policies, deployment settings, impairment models, compact usefulness interpretation, and controller-facing diagnostics.

The compact usefulness triad is interpreted as:

* **exploit**: usable information flow;
* **recover**: delayed or stale information flow;
* **caution**: corrupted or suspect information flow.

The Operational Surface also supports broader policy and regime-management experiments, but these should not be conflated with the compact usefulness triad.

### Analysis Surface

The Analysis Surface supports study manifests, metric extraction, figure generation, raw artifact inspection, and thesis-facing interpretation.

It is used to compare timing, information delivery, belief quality, usefulness-state behavior, epistemic support/arrival structure, effort, and structural variables such as deployment geometry and observation-window selection.

## Frozen and current thesis-facing result summaries

AWSRT v0.6 tested deployment geometry and observation-window effects under transformed real-fire conditions.

The frozen v0.6 result shows that normalized deployment geometry and observation-window structure strongly affect timing access, especially finite time-to-first-detection availability. Across the tested transformed real-fire artifacts, however, the compact usefulness triad remained condition-readable:

* healthy cases mapped to exploit-dominant behavior;
* delay cases mapped to recover-dominant behavior;
* noise cases mapped to caution-dominant behavior.

This supports the thesis-level separation between timing access, information delivery, belief quality, and usefulness-state interpretation.

The v0.6 evidence base should be read as bounded transformed-real-fire evidence, not as universal wildfire generalization.

AWSRT v0.9 added an interpretability/inspectability layer around the Epistemic Surface and Epistemic Visualizer. The v0.9 epistemic work tested whether support geometry, belief decay, impairments, delivered-information activity, and visual impressions remain separable under controlled belief-maintenance conditions.

The v0.9 epistemic evidence supports the thesis-facing claim that:

* prescribed support and realized arrivals should be interpreted separately;
* delivered-information activity is not the same as maintained belief quality;
* visual inspection is useful only when disciplined by entropy-side and arrival-side metrics;
* support geometries are controlled epistemic probes, not operational search policies.

The v0.9 evidence base should be read as bounded epistemic inspectability evidence, not as operational wildfire validation.

## Core capabilities

AWSRT currently supports:

* generation of structured wildfire-like physical fields;
* import and use of transformed historical fire artifacts;
* belief-state and entropy-oriented epistemic analysis;
* support-geometry probes for controlled epistemic inspection;
* Epistemic Visualizer windows for belief, entropy, entropy-change, support, and support-arrival comparison;
* operational sensing experiments with multiple policy families;
* impairment studies with noise, delay, and loss;
* compact usefulness-path experiments and summaries;
* advisory and active regime-management experiments;
* metric computation for timeliness, entropy, usefulness, support/arrival structure, and mechanism-facing summaries;
* manifest-based experiment definition and recovery;
* frontend design, visualization, analysis, and audit workflows;
* figure and result packaging for comparative analysis.

## Repository structure

```text
backend/                 FastAPI backend and AWSRT core modules
frontend/                Next.js frontend for the four research surfaces
data/                    Local manifests, fields, renders, metrics, and run artifacts
docs/                    Documentation, design notes, install notes, and workflow guidance
docs/design/             Versioned design notes and release-freeze interpretation notes
docs/install/            Local installation and setup notes
docs/reproducibility/    Reproduction notes for frozen result states
docs/development/        Developer workflow and subgoal freeze checklist
notes/                   Supporting research notes retained with software versions
paper/                   Paper-facing materials
results/                 Result outputs and figure exports
src/                     Utility and packaging scripts
README.md                Project overview
pyproject.toml           Python package configuration
frontend/package.json    Frontend package configuration
```

Historical release notes and reproducibility files, such as `REPRODUCIBILITY_v0.1.md`, `RESULTS_MANIFEST_v0.1.md`, `VERSION_NOTES_v0.1.md`, and `VERSION_NOTES_v0.2.md`, are retained for auditability.

## Quickstart

These instructions describe the current local development workflow. They are not yet a polished public installation process.
For more detailed setup notes, see [`docs/install/local_install.md`](docs/install/local_install.md).

### 1. Clone the repository

```bash
git clone https://github.com/richardjpurcell/awsrt.git
cd awsrt
```

### 2. Create and activate a Python environment

A generic virtual-environment path is:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -U pip
pip install -e .
```

The current development workflow has also used a conda environment named `PhD_general`:

```bash
conda activate PhD_general
pip install -e .
```

Use the environment approach that matches your local setup.

### 3. Start the backend

```bash
make backend
```

This expands to:

```bash
PYTHONPATH=backend uvicorn api.main:app --reload --port 8000
```

Health check:

```text
http://127.0.0.1:8000/health
```

When the backend is running, FastAPI route documentation may also be available through the local API documentation endpoint.

### 4. Install and start the frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Open:

```text
http://127.0.0.1:3000
```

### 5. Data location

By default, AWSRT writes artifacts under:

```text
data/
```

including:

```text
data/manifests/
data/fields/
data/renders/
data/metrics/
```

To override the root data directory:

```bash
export AWSRT_DATA_DIR=/abs/path/to/data
```

Then start the backend from the same shell:

```bash
make backend
```

## Testing and validation

A minimal backend validation check is:

```bash
python -m pytest
```

A frontend build check is:

```bash
cd frontend
npm install
npm run build
```

For a lightweight end-to-end smoke test:

1. start the backend;
2. verify `http://127.0.0.1:8000/health`;
3. start the frontend;
4. open `http://127.0.0.1:3000`;
5. open the Physical Surface and create or inspect a small run;
6. open an Epistemic or Operational visualizer;
7. inspect the corresponding analysis or metric view.

More detailed reproduction and experiment-specific instructions belong in `docs/install/` or `docs/reproducibility/`.

## Render configuration

AWSRT renders overlay-aligned PNGs, including base, fire, wind, terrain, and categorical field layers. Large transformed fire artifacts may benefit from higher render resolution.

Available environment variables:

* `AWSRT_RENDER_PX_PER_CELL`: pixels per grid cell;
* `AWSRT_RENDER_MAX_SIDE_PX`: maximum longest rendered PNG side;
* `AWSRT_RENDER_DPI`: Matplotlib DPI used during rendering.

Suggested starting points:

For small simulations:

```bash
export AWSRT_RENDER_PX_PER_CELL=2.0
export AWSRT_RENDER_MAX_SIDE_PX=4096
export AWSRT_RENDER_DPI=160
```

For large transformed fire artifacts:

```bash
export AWSRT_RENDER_PX_PER_CELL=3.0
export AWSRT_RENDER_MAX_SIDE_PX=8192
export AWSRT_RENDER_DPI=200
```

Render endpoints cache PNGs under paths such as:

```text
data/renders/{phy_id}/t/{t}/...
```

If render environment variables change, delete cached renders to regenerate them:

```bash
rm -rf data/renders/phy-XXXXX
# or only cached timestep frames:
rm -rf data/renders/phy-XXXXX/t
```

## Documentation map

Important documentation areas include:

* [`docs/README.md`](docs/README.md): documentation index;
* [`docs/install/local_install.md`](docs/install/local_install.md): local installation and setup notes;
* [`docs/reproducibility/reproduce_v0_6.md`](docs/reproducibility/reproduce_v0_6.md): reproduction notes for the frozen v0.6 result state;
* [`docs/development/subgoal_freeze_checklist.md`](docs/development/subgoal_freeze_checklist.md): lightweight developer checklist for freezing subgoals;
* [`docs/backlog/v0_8_backlog.md`](docs/backlog/v0_8_backlog.md): historical v0.8 backlog for reproducible handoff, committee readability, and JOSS/community readiness;
* [`docs/design/`](docs/design/): versioned design notes, subgoal plans, and release-freeze interpretation notes;
* v0.9 design notes in [`docs/design/`](docs/design/): epistemic support geometry, Epistemic Visualizer inspection, support-arrival pairing, metric/figure refresh, visualizer-metric alignment, interpretability freeze, and release-readiness notes;
* `REPRODUCIBILITY_v0.1.md`: historical v0.1 reproducibility notes;
* `RESULTS_MANIFEST_v0.1.md`: historical v0.1 results manifest;
* `VERSION_NOTES_v0.1.md`: historical v0.1 notes;
* `VERSION_NOTES_v0.2.md`: historical v0.2 notes.

The v0.8 documentation work moved AWSRT from a shareable repository toward reproducible handoff. The v0.9 documentation and design notes add interpretability and epistemic-inspectability context without changing the frozen v0.6 evidence base.

## Known limitations

AWSRT is research software under active development.

Current limitations include:

* installation has not yet been tested broadly across machines;
* Docker or containerized installation is not yet the primary supported path;
* some frontend pages are research-instrument surfaces rather than polished product workflows;
* historical design notes may preserve older terminology for auditability;
* the Physical Surface is an experimental environmental substrate, not a high-fidelity physical simulator;
* transformed real-fire results are bounded and should not be read as universal wildfire generalization;
* Epistemic Surface support geometries are controlled epistemic probes, not operational search policies;
* visualizer outputs are inspection aids and should be interpreted alongside metrics rather than as standalone evidence;
* the compact usefulness triad is an interpretive diagnostic, not a complete causal explanation of every metric movement;
* v0.6 results are frozen, v0.8 reproducible-handoff work is complete, and v0.9 interpretability work is complete, while JOSS/open-science documentation review remains ongoing.

## Citation and publications

Citation information is maintained in:

```text
CITATION.cff
```

AWSRT supports thesis-facing and paper-facing work on adaptive sensing, belief maintenance, impaired information flow, and wildfire-like monitoring. Use the citation metadata in `CITATION.cff` when citing the software repository, and cite associated thesis or publication artifacts separately when appropriate.

## License

See:

```text
LICENSE
```
