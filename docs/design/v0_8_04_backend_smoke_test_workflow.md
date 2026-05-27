# AWSRT v0.8 Subgoal 04 — Backend Smoke-Test Workflow

**Project:** AWSRT — Adaptive Wildfire Sensing Research Tool  
**Branch:** `v0.8-subgoal-04`  
**Design note:** `docs/design/v0_8_04_backend_smoke_test_workflow.md`  
**Status:** Draft design note  
**Date:** 2026-05-27  

---

## 1. Purpose

This subgoal continues AWSRT v0.8 after the minimal first-run workflow completed in Subgoal 03.

The v0.8 theme remains:

```text
From shareable repository to reproducible handoff.
```

Subgoal 02 verified local installation and startup commands.

Subgoal 03 documented a minimal first-run workflow:

```text
backend health → frontend startup → landing page → Physical Surface smoke artifact → Physical Visualizer
```

Subgoal 04 should now make the backend side of that handoff more explicit.

The purpose is to define a lightweight backend smoke-test workflow that a developer, thesis committee reader, JOSS reviewer, or future maintainer can run to confirm basic backend health without needing to execute a full experimental campaign.

---

## 2. Relationship to previous v0.8 subgoals

### Subgoal 01

Subgoal 01 established the v0.8 roadmap and backlog:

```text
docs/design/v0_8_01_roadmap_and_backlog_triage.md
docs/backlog/v0_8_backlog.md
```

It identified clean-machine reproducibility, first-run workflow, and backend smoke checks as early v0.8 priorities.

### Subgoal 02

Subgoal 02 verified the local setup path and standardized backend startup around:

```bash
make backend
```

which expands to:

```bash
PYTHONPATH=backend uvicorn api.main:app --reload --port 8000
```

It also created:

```text
docs/install/clean_machine_check.md
```

### Subgoal 03

Subgoal 03 documented the first-run workflow:

```text
docs/reproducibility/minimal_first_run.md
```

It verified:

```text
curl http://127.0.0.1:8000/health
→ {"ok":true,"version":"0.1.0"}
```

and created a small Physical Surface smoke artifact:

```text
phy-6d2c689dab
```

Subgoal 04 should convert these ad hoc backend checks into a clearer reusable backend smoke-test path.

---

## 3. Guiding question

The guiding question for this subgoal is:

> What is the narrowest reliable backend check that gives confidence AWSRT can start, expose its API, and support the minimal first-run workflow?

This should not become a broad test-infrastructure project unless inspection shows that such infrastructure already exists and is easy to document.

---

## 4. Scope

### 4.1 In scope

This subgoal may include:

- inspecting existing backend tests and pytest configuration;
- documenting the current backend smoke-test commands;
- deciding whether the handoff smoke check should rely on:
  - `make backend` plus `curl /health`;
  - a small pytest subset;
  - a simple Python import/startup check;
  - or a combination of these;
- documenting expected outputs and failure modes;
- linking the backend smoke workflow from the docs index;
- making small documentation patches to existing install/reproducibility docs;
- adding a very small smoke-test script or pytest only if inspection shows it is needed and low risk.

### 4.2 Out of scope

This subgoal should not:

- build broad CI infrastructure;
- redesign backend package imports;
- change API behavior;
- change schema compatibility;
- change physical, epistemic, operational, or analysis semantics;
- rerun v0.6 experiments;
- fix frontend issues;
- address npm audit vulnerabilities;
- treat smoke tests as scientific reproduction.

---

## 5. Working principle

The backend smoke-test workflow should be:

```text
narrow
fast
documented
repeatable
low-risk
handoff-oriented
```

It should check that the backend can start and provide the basic services required by the first-run workflow.

It should not attempt to validate all scientific behavior.

---

## 6. Candidate output file

The likely primary deliverable is:

```text
docs/development/backend_smoke_test.md
```

or, if the workflow is framed more for new users than developers:

```text
docs/install/backend_smoke_test.md
```

Recommended choice:

```text
docs/development/backend_smoke_test.md
```

Reason:

- this is a developer/handoff verification workflow;
- install docs already explain how to start the backend;
- reproducibility docs explain first-run and v0.6 reproduction;
- development docs are the right home for a reusable smoke check before freezing subgoals.

Possible supporting edits:

```text
docs/README.md
docs/install/clean_machine_check.md
docs/reproducibility/minimal_first_run.md
```

These should be edited only if discoverability or cross-reference clarity requires it.

---

## 7. Candidate backend smoke checks

The exact workflow should be decided after inspection.

### 7.1 Startup and health check

Current known-good startup path:

```bash
make backend
```

Expected backend URL:

```text
http://127.0.0.1:8000
```

Health check:

```bash
curl http://127.0.0.1:8000/health
```

Expected response:

```json
{"ok":true,"version":"0.1.0"}
```

This is the minimum backend smoke check.

### 7.2 Import-level check

Possible import check:

```bash
PYTHONPATH=backend python -c "from api.main import app; print(app.title, app.version)"
```

Expected output should be confirmed by inspection.

This check may be useful because it does not require starting a long-running server.

### 7.3 Pytest subset

The repository currently contains backend tests under:

```text
backend/tests/
```

and pytest configuration under:

```text
backend/pytest.ini
```

Potential pytest commands to inspect:

```bash
python -m pytest backend/tests
python -m pytest backend/tests/test_weather.py
python -m pytest backend/tests/test_physical_integration.py
```

The subgoal should inspect existing tests before deciding what to document. If the full backend test suite is reliable and reasonably fast, document it. If the full suite is too broad or environment-dependent, document a smaller smoke subset.

### 7.4 Physical API smoke path

Because Subgoal 03 used the Physical Surface smoke preset, a backend-only equivalent might be possible through API calls:

```text
POST /physical/manifest
POST /physical/run
GET /physical/{phy_id}/meta
GET /physical/{phy_id}/fields
```

However, this should only be documented if the payload is small, stable, and not too cumbersome. Otherwise the UI-based first-run workflow remains the artifact-generation check.

---

## 8. Suggested inspection commands

Start by inspecting backend test configuration and available tests:

```bash
sed -n '1,220p' backend/pytest.ini
find backend/tests -maxdepth 2 -type f | sort
sed -n '1,220p' backend/tests/conftest.py
sed -n '1,220p' backend/tests/test_weather.py
sed -n '1,260p' backend/tests/test_physical_integration.py
```

Inspect the Makefile and backend app entrypoint:

```bash
sed -n '1,160p' Makefile
sed -n '1,220p' backend/api/main.py
```

Then test candidate commands:

```bash
PYTHONPATH=backend python -c "from api.main import app; print(app.title, app.version)"
python -m pytest backend/tests
```

If the full test suite is too broad, test a narrower subset and document the reason.

---

## 9. Expected deliverables

Likely deliverables:

```text
docs/design/v0_8_04_backend_smoke_test_workflow.md
docs/development/backend_smoke_test.md
```

Possible supporting edits:

```text
docs/README.md
docs/development/subgoal_freeze_checklist.md
docs/install/clean_machine_check.md
```

Subgoal 04 should remain documentation-first. Any backend test or script addition should be small, justified by inspection, and reversible.

---

## 10. Validation expectations

At freeze, this subgoal should validate the chosen backend smoke path.

Minimum validation:

```bash
git diff --check
make backend
curl http://127.0.0.1:8000/health
```

If a pytest command is documented, run it before freeze:

```bash
python -m pytest backend/tests
```

or the selected narrower subset.

If no frontend files are changed, no frontend build is required. If `docs/development/subgoal_freeze_checklist.md` or first-run docs are changed only, frontend build is still not required.

---

## 11. Non-goals

Subgoal 04 should not:

- replace the minimal first-run workflow;
- replace v0.6 reproducibility documentation;
- introduce broad CI;
- change backend imports merely to satisfy an alternate startup command;
- fix every existing backend warning;
- require transformed fire artifacts;
- create new experimental evidence.

This is a backend confidence workflow, not a scientific validation campaign.

---

## 12. Freeze criteria

Subgoal 04 can be frozen when:

1. The backend smoke-test workflow is documented.
2. The workflow uses the verified backend startup path.
3. The `/health` response is documented.
4. Any selected pytest/import command is documented and tested.
5. The workflow distinguishes smoke testing from scientific reproduction.
6. Documentation entry points link to the workflow.
7. `git diff --check` passes.
8. The documented backend smoke command passes.
9. The working tree is clean.
10. Changes are committed and pushed.

---

## 13. Suggested commit messages

For the design note:

```text
Add backend smoke-test workflow design
```

For the smoke-test documentation:

```text
Add backend smoke-test workflow documentation
```

For docs-index alignment:

```text
Update docs index for backend smoke-test workflow
```

---

## 14. Expected outcome

At the end of Subgoal 04, AWSRT should have a clear backend smoke-test workflow that can be used during future subgoal freezes and handoff checks.

This should strengthen v0.8 reproducible-handoff discipline without expanding the scope into full CI or scientific reproduction.
