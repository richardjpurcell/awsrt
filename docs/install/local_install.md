# AWSRT Local Installation — macOS and Windows 11

## Status

These are the cross-platform local installation and validation notes for AWSRT during the v0.10 JOSS/open-science documentation refresh.

AWSRT is local research software composed of:

- a Python/FastAPI backend;
- a Next.js/React frontend;
- local data artifacts written under `data/` by default.

The established development workflow is on macOS. A fresh Windows 11 installation has also been completed using Anaconda/Conda, Python 3.11, Node.js 20, and the supplied `.bat` launchers. For new installations on either platform, the recommended baseline is now the dedicated `awsrt` Conda environment rather than a developer-specific environment.

AWSRT remains a bounded experimental research instrument. These instructions support development, review, and reproducible inspection; they are not operational wildfire-deployment instructions.

## Repository layout relevant to installation

```text
backend/                 FastAPI backend and AWSRT core modules
frontend/                Next.js frontend
data/                    Local manifests, fields, renders, metrics, and run artifacts
docs/                    Documentation and design notes
pyproject.toml           Python package/dependency metadata
environment.yml          Recommended Python/Node baseline
Makefile                 macOS/Unix convenience launch targets
start_backend.bat        Windows backend launcher
start_frontend.bat       Windows frontend launcher
README.md                Project overview
```

The backend Python package is defined in `pyproject.toml`. The frontend package is defined in `frontend/package.json` and its lockfile.

## Dependency policy

The installation problem discovered during Windows testing had two distinct causes:

1. **repository packaging/layout** — setuptools was not told that importable packages live under `backend/`;
2. **dependency drift** — broad lower bounds allowed newer major library versions to be selected by a fresh environment.

The repository should therefore carry the fix, rather than requiring each user to discover it.

The proposed Python compatibility bounds include:

```text
Python       >=3.10,<3.13
NumPy        >=1.24,<2
Zarr         >=2.16,<3
Numcodecs    >=0.10,<0.16
Pydantic     >=2.6,<3
FastAPI      >=0.110,<1
Uvicorn      >=0.27,<1
Matplotlib   >=3.7,<4
```

The NumPy and Zarr upper bounds are intentional. AWSRT has not yet been migrated and validated against the newer major APIs. `numcodecs<0.16` protects older Zarr 2.x releases from a known import incompatibility.

These are compatibility bounds, not an archival lockfile. Once a clean macOS and Windows install both pass the smoke tests, record the exact known-good environments separately if exact reproduction is required.

Do not individually upgrade core libraries after installing AWSRT. Prefer:

```bash
python -m pip install -e .
python -m pip check
```

## Recommended clean-install baseline

The repository includes:

```text
environment.yml
```

with:

```yaml
name: awsrt
channels:
  - conda-forge
dependencies:
  - python=3.11
  - nodejs=20
  - pip
```

This gives macOS and Windows the same Python/Node baseline. Python package compatibility is then resolved from `pyproject.toml`; frontend versions are resolved from `frontend/package-lock.json`.

## 1. Get the repository

```bash
git clone https://github.com/richardjpurcell/awsrt.git
cd awsrt
```

A supplied ZIP can also be used. In either case, make sure you are in the repository root — the directory containing `pyproject.toml`, `backend`, `frontend`, and `README.md`.

## 2. Create the environment

### macOS

From Terminal:

```bash
conda env create -f environment.yml
conda activate awsrt
```

Manual equivalent:

```bash
conda create -n awsrt -c conda-forge python=3.11 nodejs=20 pip
conda activate awsrt
```

### Windows 11

From Anaconda Prompt:

```bat
conda env create -f environment.yml
conda activate awsrt
```

Manual equivalent:

```bat
conda create -n awsrt -c conda-forge python=3.11 nodejs=20 pip
conda activate awsrt
```

Verify:

```text
python --version
node --version
npm --version
```

## 3. Install the backend

From the repository root on either platform:

```text
python -m pip install --upgrade pip
python -m pip install -e .
python -m pip check
```

Verify the dependency families that have caused compatibility problems:

```text
python -c "import numpy, zarr, numcodecs; print('numpy', numpy.__version__); print('zarr', zarr.__version__); print('numcodecs', numcodecs.__version__)"
```

Expected compatibility families are NumPy 1.x and Zarr 2.x.

## 4. Install the frontend

The repository has `frontend/package.json`; npm must therefore be run in that directory or with an explicit prefix.

### macOS

```bash
cd frontend
npm ci
cp .env.local.example .env.local
cd ..
```

If `.env.local` already exists, keep the existing file rather than overwriting it.

### Windows 11

```bat
cd frontend
dir package.json
npm ci
if not exist .env.local copy .env.local.example .env.local
cd ..
```

For clean/review installs, prefer `npm ci` because it follows the committed lockfile. Use `npm install` when intentionally changing frontend dependencies and updating `package-lock.json`.

## 5. Start AWSRT

AWSRT needs two running processes.

### macOS

Terminal 1, from the repository root:

```bash
make backend
```

Equivalent explicit command:

```bash
PYTHONPATH=backend python -m uvicorn api.main:app --reload --port 8000
```

Terminal 2, from the repository root:

```bash
make frontend
```

Equivalent explicit command:

```bash
npm --prefix frontend run dev
```

### Windows 11

Double-click in the repository root:

```text
start_backend.bat
start_frontend.bat
```

The launchers activate the `awsrt` Conda environment. `start_backend.bat` sets `PYTHONPATH=backend`; `start_frontend.bat` creates `frontend\.env.local` from the example if needed and starts the Next.js development server.

Manual Windows backend command:

```bat
conda activate awsrt
set PYTHONPATH=backend
python -m uvicorn api.main:app --reload --port 8000
```

Manual Windows frontend command:

```bat
conda activate awsrt
cd frontend
npm run dev
```

## 6. Open and validate

Backend:

```text
http://127.0.0.1:8000
```

Health endpoint:

```text
http://127.0.0.1:8000/health
```

Frontend:

```text
http://localhost:3000
```

Minimal smoke test:

1. confirm the backend health endpoint responds;
2. confirm the frontend loads;
3. open the Physical Surface and create or inspect a small artifact;
4. open an Epistemic or Operational visualizer;
5. inspect a corresponding analysis or metric view.

This validates installation and basic integration. It does not by itself reproduce the frozen thesis-facing experiments.

## 7. Tests and build checks

Backend:

```text
python -m pytest
```

Frontend, from `frontend/`:

```text
npm ci
npm run build
```

## Backend startup note

The current import layout expects `backend` on `PYTHONPATH`. Do not use:

```text
uvicorn backend.api.main:app --reload --port 8000
```

as the primary startup command. It can fail with:

```text
ModuleNotFoundError: No module named 'api'
```

Use the Makefile on macOS/Unix, the Windows launcher on Windows, or the explicit `PYTHONPATH` commands shown above.

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

To override the root data directory:

### macOS

```bash
export AWSRT_DATA_DIR=/abs/path/to/data
make backend
```

### Windows Anaconda Prompt

```bat
set AWSRT_DATA_DIR=C:\absolute\path\to\data
start_backend.bat
```

Set the variable in the same shell session that starts the backend.

## Render configuration

Optional render variables include:

```text
AWSRT_RENDER_PX_PER_CELL
AWSRT_RENDER_MAX_SIDE_PX
AWSRT_RENDER_DPI
```

Example for large transformed fire artifacts:

### macOS

```bash
export AWSRT_RENDER_PX_PER_CELL=3.0
export AWSRT_RENDER_MAX_SIDE_PX=8192
export AWSRT_RENDER_DPI=200
make backend
```

### Windows Anaconda Prompt

```bat
set AWSRT_RENDER_PX_PER_CELL=3.0
set AWSRT_RENDER_MAX_SIDE_PX=8192
set AWSRT_RENDER_DPI=200
start_backend.bat
```

If render settings change, remove the relevant cached render directory before regenerating.

macOS:

```bash
rm -rf data/renders/phy-XXXXX
```

Windows:

```bat
rmdir /s /q data\renders\phy-XXXXX
```

## Common troubleshooting

### `pip install -e .` reports multiple top-level packages

This was encountered during the Windows 11 install because the repository root contains `backend`, `frontend`, and `data`. The current `pyproject.toml` should explicitly locate Python packages under `backend/`:

```toml
[build-system]
requires = ["setuptools>=68", "wheel"]
build-backend = "setuptools.build_meta"

[tool.setuptools.packages.find]
where = ["backend"]
include = ["api*", "awsrt_core*"]
exclude = ["tests*"]
```

If a checkout lacks this block, update the repository. This should be a repository fix, not a per-user edit.

### `npm` reports `ENOENT` or cannot find `package.json`

You are probably running npm from the repository root. Use:

macOS:

```bash
cd frontend
npm ci
```

Windows:

```bat
cd frontend
dir package.json
npm ci
```

### `.env.local` is missing

macOS:

```bash
cd frontend
cp .env.local.example .env.local
```

Windows:

```bat
cd frontend
copy .env.local.example .env.local
```

The Windows frontend launcher also creates it automatically when possible.

### `npm` is not recognized on Windows

```bat
conda activate awsrt
node --version
npm --version
```

If Node/npm are missing, recreate the environment from `environment.yml`.

### Browser cannot connect

Check that both servers are running. Test `http://127.0.0.1:8000/health` directly. If the backend responds but `http://localhost:3000` does not, inspect the frontend terminal.

### Port 8000 or 3000 is already in use

Stop the older AWSRT terminal with `Ctrl+C`, then relaunch the corresponding server.

### NumPy/Zarr dependency drift

Do not repair this by upgrading packages individually. Activate the AWSRT environment and reinstall against current project metadata:

```text
python -m pip install -e .
python -m pip check
```

Then confirm NumPy is 1.x and Zarr is 2.x with the version-check command above.

If the environment has accumulated incompatible packages, recreate the dedicated `awsrt` environment from `environment.yml`.

## Reproducing thesis/journal results

The installation smoke test confirms that AWSRT can be installed, started, built, and inspected. Frozen thesis/journal results depend on preserved manifests, metrics, transformed fire artifacts, and analysis scripts. Use the relevant files under `docs/reproducibility/` for result reconstruction.

## Known limitations

- The workflow has now been exercised on macOS development systems and on a fresh Windows 11 installation, but not across a broad operating-system/Python/Node matrix.
- Python 3.11 and Node.js 20 are the recommended clean-install baseline; other combinations are not equally validated.
- NumPy 2.x and Zarr 3.x are intentionally outside the current compatibility bounds until AWSRT is migrated and tested against those major versions.
- Docker/container installation is not yet the primary supported path.
- Some pages are research-instrument surfaces rather than polished product workflows.
- Historical design notes may preserve older terminology for auditability.
