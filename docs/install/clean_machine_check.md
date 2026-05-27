# AWSRT Clean-Machine Check

**Project:** AWSRT — Adaptive Wildfire Sensing Research Tool  
**Version track:** v0.8  
**Subgoal:** v0.8-subgoal-02 — Clean-machine install verification  
**Status:** Initial verification note  
**Date:** 2026-05-27  

---

## Purpose

This note records the first v0.8 clean-machine / reproducible-handoff installation checks.

The goal is not to prove that AWSRT installs cleanly on every platform. The goal is to record what was actually inspected and verified during Subgoal 02 so that the repository moves from informal local knowledge toward a documented handoff path.

This check supports the v0.8 theme:

```text
From shareable repository to reproducible handoff.
```

---

## Scope

This note covers the local development setup path for:

- Python/FastAPI backend metadata and startup;
- Next.js frontend dependency installation;
- Next.js production build;
- Next.js development startup;
- known setup warnings and unresolved issues.

This note does not reproduce the frozen v0.6 result state. For v0.6 result inspection, use:

```text
docs/reproducibility/reproduce_v0_6.md
```

---

## Repository state

The check was performed on branch:

```text
v0.8-subgoal-02
```

The local install documentation had been updated to prefer the verified backend startup command:

```bash
make backend
```

which expands to:

```bash
PYTHONPATH=backend uvicorn api.main:app --reload --port 8000
```

---

## Metadata inspected

The repository currently contains the following setup metadata:

```text
pyproject.toml
frontend/package.json
frontend/.env.local.example
```

The repository did not contain a root `requirements.txt`, backend `requirements.txt`, or `environment.yml` during this inspection.

Backend dependencies are therefore installed through:

```bash
pip install -e .
```

Frontend dependencies are installed through:

```bash
npm --prefix frontend install
```

or from inside `frontend/` with:

```bash
npm install
```

---

## Backend verification

### Backend startup using Makefile

Command:

```bash
make backend
```

Observed result:

```text
PASS
```

The backend started successfully with Uvicorn on:

```text
http://127.0.0.1:8000
```

The application startup completed.

### Direct backend startup command

Command tested:

```bash
uvicorn backend.api.main:app --reload --port 8000
```

Observed result:

```text
FAIL
```

Observed failure mode:

```text
ModuleNotFoundError: No module named 'api'
```

Interpretation:

The current backend import layout expects `backend/` on `PYTHONPATH`, because `backend/api/main.py` imports routers using the `api.*` package path. Therefore the current documented local startup path should be:

```bash
make backend
```

or the expanded equivalent:

```bash
PYTHONPATH=backend uvicorn api.main:app --reload --port 8000
```

The command below should not be documented as the primary startup path unless the backend import layout is changed in a future subgoal:

```bash
uvicorn backend.api.main:app --reload --port 8000
```

---

## Frontend verification

### Dependency installation

Command:

```bash
npm --prefix frontend install
```

Observed result:

```text
PASS
```

npm completed dependency installation.

Observed warnings:

```text
2 vulnerabilities reported:
- 1 moderate
- 1 critical
```

npm suggested:

```bash
npm audit fix --force
```

This command was not run during Subgoal 02 because forced dependency updates can change dependency state and should be handled deliberately in a dependency-maintenance subgoal if needed.

### Production build

Command:

```bash
npm --prefix frontend run build
```

Observed result:

```text
PASS
```

Next.js compiled successfully, checked types, generated static pages, collected build traces, and finalized page optimization.

Observed warning:

```text
Browserslist: caniuse-lite is outdated.
```

This warning did not prevent the production build from passing.

### Development server

Command:

```bash
npm --prefix frontend run dev
```

Observed result:

```text
PASS
```

The frontend development server started successfully at:

```text
http://localhost:3000
```

Observed startup time:

```text
Ready in 973ms
```

The server was then stopped manually with `Ctrl-C`.

---

## Verified command sequence so far

From the repository root, the currently verified handoff path is:

```bash
pip install -e .
make backend
```

In a second terminal:

```bash
npm --prefix frontend install
npm --prefix frontend run build
npm --prefix frontend run dev
```

Expected frontend development URL:

```text
http://localhost:3000
```

Expected backend URL:

```text
http://127.0.0.1:8000
```

---

## Known observations not fixed in this subgoal

The following were observed but not fixed:

1. `uvicorn backend.api.main:app --reload --port 8000` fails under the current import layout.
2. `npm install` reports one moderate and one critical vulnerability.
3. The frontend build reports outdated Browserslist/caniuse-lite data.
4. Installation has not yet been tested broadly on a truly fresh machine or across operating systems.
5. Docker/containerized installation is not currently the primary supported path.

---

## Documentation changes made during Subgoal 02

The following documentation files were updated before this check note was created:

```text
README.md
docs/install/local_install.md
```

The updates standardized the backend startup path around:

```bash
make backend
```

and recorded the expanded command:

```bash
PYTHONPATH=backend uvicorn api.main:app --reload --port 8000
```

---

## Recommended next checks

The next checks for v0.8 handoff readiness are:

1. Confirm the backend health endpoint response explicitly with:

   ```bash
   curl http://127.0.0.1:8000/health
   ```

2. Confirm the frontend loads in a browser and reaches the AWSRT landing page.

3. Decide whether to document npm vulnerability warnings as known limitations or create a later dependency-maintenance subgoal.

4. Decide whether to add a lightweight backend smoke command or test command to the v0.8 handoff path.

5. Consider whether `docs/README.md` should link directly to this file.

---

## Current conclusion

Subgoal 02 has verified the core local startup path for the backend and frontend, with one important backend-command correction.

The current handoff path is not yet a full clean-machine guarantee, but it is now more explicit and less dependent on private project memory than the pre-v0.8 documentation state.
