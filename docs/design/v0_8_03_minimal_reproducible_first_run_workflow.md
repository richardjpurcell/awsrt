# AWSRT v0.8 Subgoal 03 — Minimal Reproducible First-Run Workflow

**Project:** AWSRT — Adaptive Wildfire Sensing Research Tool  
**Branch:** `v0.8-subgoal-03`  
**Design note:** `docs/design/v0_8_03_minimal_reproducible_first_run_workflow.md`  
**Status:** Draft design note  
**Date:** 2026-05-27  

---

## 1. Purpose

This subgoal continues AWSRT v0.8 after the clean-machine installation verification work completed in Subgoal 02.

The v0.8 theme remains:

```text
From shareable repository to reproducible handoff.
```

Subgoal 02 verified and documented the local setup path:

- backend startup through `make backend`;
- frontend dependency installation;
- frontend production build;
- frontend development startup;
- known setup warnings and unresolved dependency-maintenance issues.

Subgoal 03 should now move one step beyond “the app starts” toward:

> Can a technically capable new user perform a minimal first-run workflow that demonstrates AWSRT as a research instrument?

The purpose is not to reproduce the full frozen v0.6 evidence state. The purpose is to document a small, bounded, first-run path that confirms the repository can be installed, started, inspected, and used at a minimal level without relying on private development memory.

---

## 2. Relationship to previous v0.8 subgoals

### Subgoal 01

Subgoal 01 created the v0.8 roadmap and backlog:

```text
docs/design/v0_8_01_roadmap_and_backlog_triage.md
docs/backlog/v0_8_backlog.md
```

It established reproducible handoff as the primary v0.8 direction.

### Subgoal 02

Subgoal 02 created and updated:

```text
docs/design/v0_8_02_clean_machine_install_verification.md
docs/install/local_install.md
docs/install/clean_machine_check.md
docs/README.md
README.md
```

It verified the core local startup path and standardized the backend command:

```bash
make backend
```

which expands to:

```bash
PYTHONPATH=backend uvicorn api.main:app --reload --port 8000
```

Subgoal 03 should build on that verified startup path.

---

## 3. Guiding question

The guiding question for this subgoal is:

> What is the smallest documented workflow that lets a new technical reader see AWSRT operate as a research instrument?

A successful workflow should show that:

1. the backend is reachable;
2. the frontend is reachable;
3. at least one AWSRT surface can be opened and inspected;
4. the user can understand what success looks like;
5. the user is not accidentally asked to reproduce the full v0.6 thesis evidence state.

---

## 4. Scope

### 4.1 In scope

This subgoal may include:

- inspecting the existing frontend surfaces and API routes;
- identifying a minimal safe first-run workflow;
- documenting the workflow in a new reproducibility or install note;
- linking the workflow from the docs index;
- using already-available app pages rather than adding new features;
- making tiny documentation patches if the first-run path reveals confusing instructions;
- adding screenshots only if they are easy and clearly helpful;
- recording limitations and what the workflow does not prove.

### 4.2 Out of scope

This subgoal should not:

- rerun the frozen v0.6 experiment set;
- create a new experimental campaign;
- modify policy logic;
- modify impairment semantics;
- change backend schema compatibility;
- redesign frontend pages;
- add broad CI infrastructure;
- fix npm audit vulnerabilities unless explicitly split into a dependency-maintenance subgoal;
- treat a first-run smoke workflow as scientific reproduction.

---

## 5. Working principle

The workflow should be:

```text
minimal
documented
bounded
repeatable
non-claim-inflating
```

It should be clear enough for a thesis committee member, JOSS reviewer, or technically capable reader to understand what was checked.

It should not overstate what the workflow proves.

---

## 6. Candidate output file

The likely primary deliverable is:

```text
docs/reproducibility/minimal_first_run.md
```

This file should document:

- purpose;
- prerequisites;
- expected repository state;
- backend startup;
- backend health check;
- frontend startup;
- browser entry point;
- minimal surface walkthrough;
- expected success indicators;
- known limitations;
- relationship to v0.6 reproduction.

Possible secondary edits:

```text
docs/README.md
README.md
docs/install/local_install.md
```

These should be edited only if the new workflow needs to be discoverable from existing documentation entry points.

---

## 7. Candidate first-run workflow

The exact workflow should be confirmed by inspection, but a likely path is:

### 7.1 Start backend

From the repository root:

```bash
make backend
```

Expected backend URL:

```text
http://127.0.0.1:8000
```

### 7.2 Verify backend health

In a second terminal:

```bash
curl http://127.0.0.1:8000/health
```

Expected result should be recorded exactly after testing.

### 7.3 Start frontend

From the repository root:

```bash
npm --prefix frontend run dev
```

Expected frontend URL:

```text
http://localhost:3000
```

### 7.4 Open frontend

Open:

```text
http://localhost:3000
```

Expected success condition:

- AWSRT landing/splash page loads;
- the four research surfaces are visible or navigable.

### 7.5 Minimal surface inspection

The workflow should inspect one or more surfaces without requiring full experiment reproduction.

Candidate surface path:

1. Open the Physical Surface.
2. Create or inspect a small physical artifact if the current UI supports this without hidden assumptions.
3. Open the corresponding visualizer if an artifact is created or already available.
4. Confirm that the app shows a research-surface workflow rather than an operational wildfire simulator workflow.

Alternative conservative path:

1. Open the landing page.
2. Open the Physical Surface.
3. Open the Operational Surface.
4. Open the Analysis Surface.
5. Confirm pages load and explain that this is a navigation/startup smoke workflow, not an artifact-generation reproduction.

The final choice should be based on what works reliably during inspection.

---

## 8. Suggested inspection commands

Before writing the final workflow, inspect current frontend routes and relevant backend routes:

```bash
find frontend/app -maxdepth 3 -type f | sort
find backend/api/routers -maxdepth 2 -type f | sort
sed -n '1,220p' backend/api/main.py
sed -n '1,220p' backend/api/routers/physical.py
sed -n '1,220p' backend/api/routers/analysis.py
```

Then verify the runtime path:

```bash
make backend
curl http://127.0.0.1:8000/health
npm --prefix frontend run dev
```

If artifact creation is included in the minimal workflow, inspect the relevant UI and route behavior before documenting it.

---

## 9. Expected deliverables

Likely deliverables:

```text
docs/design/v0_8_03_minimal_reproducible_first_run_workflow.md
docs/reproducibility/minimal_first_run.md
```

Possible supporting edits:

```text
docs/README.md
README.md
docs/install/local_install.md
```

Subgoal 03 should remain mostly documentation and verification unless a small defect blocks the minimal first-run path.

---

## 10. Validation expectations

Because this subgoal concerns first-run verification, the expected validation should include:

```bash
git diff --check
make backend
curl http://127.0.0.1:8000/health
npm --prefix frontend run build
npm --prefix frontend run dev
```

The frontend build should be run because the first-run workflow depends on the frontend remaining buildable.

If no frontend code changes are made, a previously passing build may be referenced, but a final build before freeze is still preferred for handoff confidence.

---

## 11. Non-goals

Subgoal 03 should not:

- claim full reproducibility of v0.6 results;
- replace `docs/reproducibility/reproduce_v0_6.md`;
- add a new experimental result workflow;
- change controller behavior;
- change physical-field semantics;
- fix dependency vulnerabilities unless separately designed;
- create a polished public product demo.

This is a minimal first-run workflow, not a scientific reproduction package.

---

## 12. Freeze criteria

Subgoal 03 can be frozen when:

1. The first-run workflow is documented.
2. The documented backend startup path is verified.
3. The backend health response is recorded.
4. The documented frontend startup path is verified.
5. The expected visible success condition is documented.
6. The workflow clearly distinguishes first-run inspection from v0.6 reproduction.
7. Documentation entry points link to the workflow.
8. `git diff --check` passes.
9. Frontend build passes, unless explicitly deferred with a reason.
10. The working tree is clean.
11. Changes are committed and pushed.

---

## 13. Suggested commit messages

For the design note:

```text
Add minimal first-run workflow design
```

For the workflow documentation:

```text
Add minimal first-run workflow documentation
```

If docs index alignment is included:

```text
Update docs index for first-run workflow
```

---

## 14. Expected outcome

At the end of Subgoal 03, AWSRT should have a clear first-run path that a new technical reader can follow after installation.

The result should support the v0.8 handoff goal without reopening experiments or overstating what a smoke workflow proves.
