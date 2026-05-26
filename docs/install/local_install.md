# AWSRT Local Installation Notes

## Status

Draft local installation notes for AWSRT v0.7 documentation work.

These instructions describe the current local development workflow for AWSRT. They are intended for a motivated technical reader who wants to run the backend and frontend locally. They are not yet a polished public deployment guide.

## Tested/development context

AWSRT is currently developed as local research software with:

- a Python/FastAPI backend;
- a Next.js/React frontend;
- local data artifacts written under `data/` by default.

The current development workflow has been used on macOS with a conda environment named:

```bash
PhD_general
```

A generic Python virtual environment path is also supported by the project packaging metadata.

## Repository layout relevant to installation

Important files and directories:

```text
backend/                 FastAPI backend and AWSRT core modules
frontend/                Next.js frontend
data/                    Local manifests, fields, renders, metrics, and run artifacts
docs/                    Documentation and design notes
pyproject.toml           Python package/dependency metadata
frontend/package.json    Frontend package/dependency metadata
Makefile                 Convenience backend/frontend run targets
README.md                Project overview
```

The backend Python package is defined in `pyproject.toml`.

The frontend package is defined in `frontend/package.json`.

## Backend requirements

The backend package metadata currently declares:

```text
requires-python = >=3.10
```

Core Python dependencies are installed through:

```bash
pip install -e .
```

The current declared backend dependencies include:

```text
fastapi
uvicorn[standard]
pydantic
numpy
zarr
pillow
matplotlib
```

Do not install these manually unless debugging. Prefer installing from `pyproject.toml` with `pip install -e .`.

## Frontend requirements

The frontend uses Next.js and React. The current frontend package metadata includes:

```text
next 14.2.5
react 18.3.1
react-dom 18.3.1
typescript
```

Install frontend dependencies from inside the `frontend/` directory with:

```bash
npm install
```

## Installation path A: Python virtual environment

From the repository root:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -U pip
pip install -e .
```

Start the backend:

```bash
uvicorn backend.api.main:app --reload --port 8000
```

Health check:

```text
http://127.0.0.1:8000/health
```

## Installation path B: conda development environment

If using the existing development-style conda workflow:

```bash
conda activate PhD_general
pip install -e .
```

Start the backend:

```bash
uvicorn backend.api.main:app --reload --port 8000
```

Health check:

```text
http://127.0.0.1:8000/health
```

## Frontend setup

In a second terminal, from the repository root:

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Open the frontend in a browser:

```text
http://127.0.0.1:3000
```

If `.env.local.example` does not exist in your checkout, inspect the frontend configuration and create `.env.local` only if needed. The app may still run with the default local backend assumptions.

## Convenience Makefile targets

The repository includes a small `Makefile` with convenience targets:

```bash
make backend
make frontend
```

Current targets are equivalent to:

```bash
PYTHONPATH=backend uvicorn api.main:app --reload --port 8000
npm --prefix frontend run dev
```

The direct backend command used elsewhere in the documentation is:

```bash
uvicorn backend.api.main:app --reload --port 8000
```

If one command path fails because of import-path assumptions, try the other and record the result. Future documentation should eventually standardize this.

## Data directory

By default, AWSRT writes local artifacts under:

```text
data/
```

Common subdirectories include:

```text
data/manifests/
data/fields/
data/renders/
data/metrics/
```

To use a different data root:

```bash
export AWSRT_DATA_DIR=/abs/path/to/data
uvicorn backend.api.main:app --reload --port 8000
```

Use the same shell session for the environment variable and backend process.

## Render configuration

AWSRT renders overlay-aligned PNGs for visual inspection. Large transformed fire artifacts may require larger render limits.

Optional render environment variables:

```bash
export AWSRT_RENDER_PX_PER_CELL=3.0
export AWSRT_RENDER_MAX_SIDE_PX=8192
export AWSRT_RENDER_DPI=200
```

Smaller simulations may work with lower values, for example:

```bash
export AWSRT_RENDER_PX_PER_CELL=2.0
export AWSRT_RENDER_MAX_SIDE_PX=4096
export AWSRT_RENDER_DPI=160
```

Render endpoints cache generated PNGs under paths such as:

```text
data/renders/{phy_id}/t/{t}/...
```

If render settings change, delete cached renders for the relevant artifact before regenerating:

```bash
rm -rf data/renders/phy-XXXXX
# or only cached timestep frames:
rm -rf data/renders/phy-XXXXX/t
```

## First-run smoke test

A minimal smoke test is:

1. Start the backend.
2. Open the health endpoint:

   ```text
   http://127.0.0.1:8000/health
   ```

3. Start the frontend.
4. Open:

   ```text
   http://127.0.0.1:3000
   ```

5. Confirm the AWSRT splash page loads.
6. Open the Physical Surface.
7. Create or inspect a small run.
8. Open the corresponding visualizer or analysis page.

This smoke test confirms that the backend, frontend, and local data paths are basically functioning. It does not reproduce the frozen v0.6 results by itself.

## Reproducing thesis/journal results

The frozen v0.6 results depend on preserved manifests, metrics, transformed fire artifacts, and analysis scripts. Reproducing those results requires more than simply launching the app.

A separate v0.6 reproduction note should document:

- the `v0.6` tag;
- relevant v0.6 design notes;
- expected data/artifact paths;
- analysis IDs;
- packaging scripts;
- known limits of reproduction.

Suggested future path:

```text
docs/reproducibility/reproduce_v0_6.md
```

## Common troubleshooting

### Backend import errors

If this command fails:

```bash
uvicorn backend.api.main:app --reload --port 8000
```

try the Makefile target:

```bash
make backend
```

or explicitly set `PYTHONPATH`:

```bash
PYTHONPATH=backend uvicorn api.main:app --reload --port 8000
```

The project currently contains both direct package-style and Makefile-style backend run patterns. This should be standardized in a later documentation pass.

### Frontend dependency errors

From inside `frontend/`, reinstall dependencies:

```bash
rm -rf node_modules
npm install
npm run dev
```

### Frontend cannot reach backend

Confirm that the backend is running at:

```text
http://127.0.0.1:8000
```

Then confirm the frontend is running at:

```text
http://127.0.0.1:3000
```

If `.env.local` exists, check whether it points to the correct backend URL.

### Cached renders look stale

Delete the relevant cached render directory:

```bash
rm -rf data/renders/phy-XXXXX
```

Then reload or regenerate the visualizer output.

### Large artifact rendering is slow or blurry

Increase render settings before starting the backend:

```bash
export AWSRT_RENDER_PX_PER_CELL=3.0
export AWSRT_RENDER_MAX_SIDE_PX=8192
export AWSRT_RENDER_DPI=200
uvicorn backend.api.main:app --reload --port 8000
```

### Missing data artifacts

Some workflows require preserved manifests, metrics, fields, or transformed fire artifacts. If a page or script expects a specific `phy-*`, `epi-*`, `op-*`, or `ana-*` artifact, confirm that the corresponding files exist under `data/`.

## Known limitations

- Installation has not yet been tested broadly across fresh machines.
- Docker/container installation is not yet the primary supported path.
- Some pages are research-instrument surfaces rather than polished product workflows.
- Historical design notes may preserve older terminology for auditability.
- The Physical Surface is an experimental environmental substrate, not a high-fidelity physical wildfire simulator.
- The v0.6 result state is frozen, but v0.7 documentation and usability work is ongoing.
