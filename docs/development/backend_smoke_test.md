# AWSRT Backend Smoke-Test Workflow

**Project:** AWSRT — Adaptive Wildfire Sensing Research Tool  
**Version track:** v0.8  
**Subgoal:** v0.8-subgoal-04 — Backend smoke-test workflow  
**Status:** Initial backend smoke-test workflow note  
**Date:** 2026-05-27  

---

## Purpose

This note documents a lightweight backend smoke-test workflow for AWSRT.

The goal is to provide a repeatable backend confidence check for local development, subgoal freeze, and reproducible handoff. The workflow confirms that the backend can be imported, started, queried through its health endpoint, and exercised through the existing backend test suite.

This is a software health workflow. It is not a scientific reproduction workflow and does not reproduce the frozen v0.6 evidence state.

---

## Scope

This workflow checks:

- backend importability;
- FastAPI app metadata;
- runtime server startup through the documented Makefile path;
- `/health` endpoint response;
- existing backend pytest suite;
- physical backend integration path through existing tests.

This workflow does not check:

- frontend build or runtime behavior;
- full v0.6 result reproduction;
- transformed real-fire result reproduction;
- analysis-batch scientific interpretation;
- JOSS packaging completeness;
- npm dependency warnings.

---

## Backend startup path

The current verified backend startup path is:

```bash
make backend
```

This expands to:

```bash
PYTHONPATH=backend uvicorn api.main:app --reload --port 8000
```

This path is required because the backend app imports routers using the `api.*` package path.

Do not use the following as the primary backend startup path in the current layout:

```bash
uvicorn backend.api.main:app --reload --port 8000
```

That command has been observed to fail with:

```text
ModuleNotFoundError: No module named 'api'
```

---

## Tier 1 — Import and app metadata check

From the repository root, run:

```bash
PYTHONPATH=backend python -c "from api.main import app; print(app.title, app.version)"
```

Observed result during v0.8 Subgoal 04:

```text
AWSRT API 0.1.0
```

Expected result:

- the command exits successfully;
- the app title is `AWSRT API`;
- the app version is printed.

This check confirms that the backend app can be imported with the expected import path.

---

## Tier 2 — Runtime health check

Start the backend from the repository root:

```bash
make backend
```

In a second terminal, run:

```bash
curl http://127.0.0.1:8000/health
```

Expected response:

```json
{"ok":true,"version":"0.1.0"}
```

This check confirms that the backend can start and serve the health endpoint.

---

## Tier 3 — Backend pytest suite

Run the backend test suite from the repository root:

```bash
python -m pytest backend/tests
```

Observed result during v0.8 Subgoal 04:

```text
18 passed in 1.11s
```

Expected result:

- pytest completes successfully;
- all backend tests pass.

This is currently the recommended backend test command for subgoal freeze and handoff checks because the existing test suite is fast and covers more than simple importability.

---

## What the backend tests cover

The backend tests currently include:

```text
backend/tests/test_fire_weather_and_coupling.py
backend/tests/test_paths_chunking_and_dtype.py
backend/tests/test_physical_integration.py
backend/tests/test_weather.py
backend/tests/test_zarr_policy.py
```

The test configuration is:

```text
backend/pytest.ini
```

Important properties of the test setup:

- `backend/pytest.ini` sets `testpaths = tests`;
- `backend/pytest.ini` sets `pythonpath = .`;
- test warnings are filtered for deprecation and pending-deprecation warnings;
- `backend/tests/conftest.py` redirects `AWSRT_DATA_DIR` into a temporary test directory;
- the FastAPI app is loaded through `api.main`;
- tests use FastAPI `TestClient`.

The physical integration test exercises a compact backend workflow:

1. post a physical manifest;
2. run the physical artifact;
3. inspect available fields;
4. verify Zarr output exists;
5. verify key datasets exist;
6. verify PNG render endpoints return successfully;
7. confirm cached render output exists.

This makes the backend pytest suite a useful smoke/integration check for the current v0.8 handoff path.

---

## Recommended backend smoke-test sequence

For a normal backend smoke check, run:

```bash
PYTHONPATH=backend python -c "from api.main import app; print(app.title, app.version)"
python -m pytest backend/tests
```

For a runtime server check, additionally run:

```bash
make backend
```

and in a second terminal:

```bash
curl http://127.0.0.1:8000/health
```

Expected health response:

```json
{"ok":true,"version":"0.1.0"}
```

---

## When to run this workflow

Run this workflow:

- before freezing backend-touching subgoals;
- after editing backend routers;
- after editing backend schemas;
- after editing backend physical-field generation or render paths;
- after changing import paths or startup commands;
- when validating a clean-machine or handoff setup;
- before adding CI around backend tests.

For docs-only changes, this workflow is optional unless the documentation claims backend behavior.

For frontend-only changes, this workflow is usually not required unless frontend work depends on backend API behavior.

---

## Relationship to other v0.8 documents

Related documents:

```text
docs/install/local_install.md
docs/install/clean_machine_check.md
docs/reproducibility/minimal_first_run.md
docs/reproducibility/reproduce_v0_6.md
docs/development/subgoal_freeze_checklist.md
```

This backend smoke-test workflow complements the minimal first-run workflow. The first-run workflow confirms that a user can start AWSRT and create a small Physical Surface artifact through the UI. This backend workflow gives a narrower command-line confidence check for backend health and integration behavior.

---

## Known limitations

This backend smoke-test workflow does not prove scientific correctness.

It does not reproduce v0.6 results, does not validate transformed real-fire experiments, and does not validate all operational or analysis workflows.

The current full backend test suite is fast and passed during Subgoal 04. If future tests become slower, flaky, or dependent on unavailable artifacts, this document should be revisited and a narrower smoke subset may be defined.

---

## Current conclusion

During v0.8 Subgoal 04, the backend import check passed:

```text
AWSRT API 0.1.0
```

The backend pytest suite passed:

```text
18 passed in 1.11s
```

Therefore the current recommended backend smoke-test command is:

```bash
python -m pytest backend/tests
```

with `make backend` plus `curl /health` used when runtime server verification is needed.
