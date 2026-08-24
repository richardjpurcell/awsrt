# AWSRT — Windows 11 Installation and Launch

This guide describes the Windows 11 installation path for AWSRT. It consolidates the successful Anaconda-based setup and the troubleshooting discovered during a fresh Windows installation.

AWSRT runs locally as two applications:

- a Python/FastAPI backend on port `8000`;
- a Next.js frontend on port `3000`.

AWSRT is research software. These instructions are for local research, review, and reproducible inspection, not operational wildfire deployment.

## 1. Prerequisites

Install either Anaconda or Miniconda. Git is also useful if you are cloning the repository rather than using a ZIP archive.

The recommended clean-install baseline is:

- Python 3.11;
- Node.js 20;
- the dedicated Conda environment name `awsrt`.

The repository includes `environment.yml`, which creates this baseline consistently.

## 2. Get AWSRT

Using Git from Anaconda Prompt:

```bat
git clone https://github.com/richardjpurcell/awsrt.git
cd /d awsrt
```

Or unzip a supplied archive to a simple path such as:

```text
C:\Users\YourName\Documents\awsrt
```

The repository root should contain at least:

```text
backend
frontend
data
docs
pyproject.toml
environment.yml
README.md
start_backend.bat
start_frontend.bat
```

All commands below that say “from the repository root” mean this directory.

## 3. Create the Conda environment

Preferred:

```bat
conda env create -f environment.yml
conda activate awsrt
```

The manual equivalent is:

```bat
conda create -n awsrt -c conda-forge python=3.11 nodejs=20 pip
conda activate awsrt
```

Confirm the tools are available:

```bat
python --version
node --version
npm --version
```

## 4. Install the Python backend

From the repository root:

```bat
python -m pip install --upgrade pip
python -m pip install -e .
python -m pip check
```

The project metadata deliberately constrains dependency families that have introduced incompatible major changes. In particular, AWSRT currently stays on NumPy 1.x and Zarr 2.x until migration to the newer major APIs is tested.

Check the resolved versions:

```bat
python -c "import numpy, zarr, numcodecs; print('numpy', numpy.__version__); print('zarr', zarr.__version__); print('numcodecs', numcodecs.__version__)"
```

Do not separately run commands such as `pip install -U numpy zarr` after installing AWSRT; that can bypass the compatibility intent of the repository metadata.

## 5. Install the frontend

Enter the directory that contains `package.json`:

```bat
cd frontend
dir package.json
npm ci
```

`npm ci` uses the committed `package-lock.json` and is preferred for a clean/review install. Use `npm install` when intentionally updating frontend dependencies and the lockfile.

Create the local frontend environment file if needed:

```bat
if not exist .env.local copy .env.local.example .env.local
```

Return to the repository root:

```bat
cd ..
```

## 6. Start AWSRT

After first-time installation, AWSRT can normally be launched by double-clicking the two supplied files in the repository root:

```text
start_backend.bat
start_frontend.bat
```

Leave both terminal windows open while using AWSRT.

The backend should be available at:

```text
http://127.0.0.1:8000
```

Health check:

```text
http://127.0.0.1:8000/health
```

The frontend should be available at:

```text
http://localhost:3000
```

Open `http://localhost:3000` in a browser.

### Manual backend launch

From the repository root in Anaconda Prompt:

```bat
conda activate awsrt
set PYTHONPATH=backend
python -m uvicorn api.main:app --reload --port 8000
```

### Manual frontend launch

From a second Anaconda Prompt:

```bat
conda activate awsrt
cd /d "C:\path\to\awsrt\frontend"
npm run dev
```

## 7. First functional check

After both servers are running:

1. Open `http://127.0.0.1:8000/health` and confirm that the backend responds.
2. Open `http://localhost:3000` and confirm that the AWSRT interface loads.
3. Open the Physical Surface and create or inspect a small run.
4. Open an Epistemic or Operational visualizer.
5. Inspect the corresponding analysis or metric view.

## 8. Stopping AWSRT

Click each server window and press `Ctrl+C`, or close both server windows. Closing only the browser does not stop the backend or frontend processes.

## Troubleshooting

### `pip install -e .` reports multiple top-level packages

The current repository should already contain explicit setuptools package discovery in `pyproject.toml`:

```toml
[build-system]
requires = ["setuptools>=68", "wheel"]
build-backend = "setuptools.build_meta"

[tool.setuptools.packages.find]
where = ["backend"]
include = ["api*", "awsrt_core*"]
exclude = ["tests*"]
```

If this block is missing, update to the current repository version rather than asking each user to edit `pyproject.toml` manually.

### `npm` cannot find `package.json`

Run npm from `frontend`:

```bat
cd frontend
dir package.json
npm ci
```

There is no root-level `package.json` in the current layout.

### `.env.local` is missing

From `frontend`:

```bat
copy .env.local.example .env.local
```

The supplied `start_frontend.bat` also creates this file automatically when the example file exists.

### `npm` is not recognized

```bat
conda activate awsrt
node --version
npm --version
```

If Node.js/npm are missing, recreate the environment from `environment.yml` or verify that it contains Node.js 20.

### Backend starts but the browser cannot connect

Confirm that both launcher windows are still running. Test the backend directly at:

```text
http://127.0.0.1:8000/health
```

If the health check works but `http://localhost:3000` does not, troubleshoot the frontend terminal.

### Port 8000 or 3000 is already in use

An earlier AWSRT process may still be running. Find the older terminal and press `Ctrl+C`, then start the corresponding launcher again.

### Dependency/version errors after an older install

Activate `awsrt` and reinstall from the current project metadata:

```bat
conda activate awsrt
python -m pip install -e .
python -m pip check
```

Then inspect the versions:

```bat
python -c "import numpy, zarr, numcodecs; print('numpy', numpy.__version__); print('zarr', zarr.__version__); print('numcodecs', numcodecs.__version__)"
```

If the environment has accumulated conflicting packages, the cleanest repair is usually to remove and recreate the dedicated environment rather than patching packages one at a time:

```bat
conda deactivate
conda env remove -n awsrt
conda env create -f environment.yml
conda activate awsrt
python -m pip install -e .
cd frontend
npm ci
```

## Next use

After a successful first installation:

1. open the AWSRT folder;
2. double-click `start_backend.bat`;
3. double-click `start_frontend.bat`;
4. open `http://localhost:3000`.

You do not need to repeat Conda, pip, or npm installation unless the environment or project dependencies change.
