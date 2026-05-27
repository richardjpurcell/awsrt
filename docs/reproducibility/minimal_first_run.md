# AWSRT Minimal First-Run Workflow

**Project:** AWSRT — Adaptive Wildfire Sensing Research Tool  
**Version track:** v0.8  
**Subgoal:** v0.8-subgoal-03 — Minimal reproducible first-run workflow  
**Status:** Initial first-run workflow note  
**Date:** 2026-05-27  

---

## Purpose

This note documents a minimal first-run workflow for AWSRT.

The goal is to help a technically capable reader confirm that AWSRT can be started locally, reached through the browser, and used to create and inspect a small Physical Surface artifact.

This is a handoff and smoke workflow. It is not a reproduction of the frozen v0.6 thesis/journal evidence state.

---

## What this workflow verifies

This workflow verifies that:

1. the backend starts and responds to the health endpoint;
2. the frontend development server starts;
3. the AWSRT landing page loads;
4. the Physical Surface can create a small smoke-test physical artifact;
5. the Physical Visualizer can be opened for the created artifact.

This workflow does not verify:

- full v0.6 result reproduction;
- transformed real-fire artifact reproduction;
- operational policy comparisons;
- analysis-batch reproduction;
- scientific interpretation of results.

For v0.6 evidence-state inspection, use:

```text
docs/reproducibility/reproduce_v0_6.md
```

---

## Prerequisites

Before running this workflow, follow the local installation notes:

```text
docs/install/local_install.md
```

The expected backend startup path is:

```bash
make backend
```

which expands to:

```bash
PYTHONPATH=backend uvicorn api.main:app --reload --port 8000
```

The frontend package metadata is located at:

```text
frontend/package.json
```

The frontend environment example file is located at:

```text
frontend/.env.local.example
```

---

## Repository state used for this check

This workflow was performed during:

```text
v0.8-subgoal-03
```

It builds on the clean-machine verification performed during:

```text
v0.8-subgoal-02
```

The Subgoal 02 verification note is:

```text
docs/install/clean_machine_check.md
```

---

## Step 1 — Start the backend

From the repository root:

```bash
make backend
```

Expected backend URL:

```text
http://127.0.0.1:8000
```

---

## Step 2 — Confirm backend health

In a second terminal:

```bash
curl http://127.0.0.1:8000/health
```

Observed response during this check:

```json
{"ok":true,"version":"0.1.0"}
```

Expected result:

- `"ok"` is `true`;
- `"version"` is present;
- the backend is reachable at `http://127.0.0.1:8000`.

---

## Step 3 — Start the frontend

From the repository root:

```bash
npm --prefix frontend run dev
```

Observed frontend startup during this check:

```text
Next.js 14.2.5
Local: http://localhost:3000
Ready in 1055ms
```

Expected frontend URL:

```text
http://localhost:3000
```

---

## Step 4 — Open the AWSRT landing page

Open:

```text
http://localhost:3000
```

Expected visible result:

- the AWSRT landing page loads;
- the page identifies AWSRT as the Adaptive Wildfire Sensing Research Tool;
- the four research surfaces are visible or navigable:
  - Physical Surface;
  - Epistemic Surface;
  - Operational Surface;
  - Analysis Surface.

This confirms that the frontend is reachable and that the high-level research-surface orientation is visible.

---

## Step 5 — Open the Physical Surface

From the landing page, click:

```text
Physical Surface
```

Expected route:

```text
http://localhost:3000/physical/designer
```

Expected visible result:

- the Physical Surface page opens;
- physical-field controls are visible;
- the preset taxonomy is available;
- the page includes the `Generate Physical RUN` action.

---

## Step 6 — Select the smoke-test preset

On the Physical Surface, select:

```text
Smoke test · small grid
```

This preset is intended as a fast regression substrate for backend smoke tests. It checks basic manifest creation, field generation, fire-like stepping, and visualization. It is not intended for rich trend interpretation.

The preset configures a small physical run, including:

```text
grid = 40 × 40
T = 16
ignition = (20, 20)
terrain = off
wind = off
fuels = off
weather = off
fire-weather coupling = off
```

---

## Step 7 — Generate the Physical run

Click:

```text
Generate Physical RUN
```

Expected behavior:

1. the frontend posts a manifest to the backend;
2. the backend returns a physical artifact ID;
3. the frontend runs the physical artifact;
4. the page displays:

```text
Created: phy-...
```

Observed artifact ID during this check:

```text
phy-6d2c689dab
```

---

## Step 8 — Open the Physical Visualizer

After the artifact is created, click:

```text
Open in Visualizer
```

Expected behavior:

- the app opens the Physical Visualizer;
- the created `phy-*` artifact is selected or loaded;
- the visualizer route includes the created ID.

Expected route pattern:

```text
http://localhost:3000/physical/visualizer?id=phy-...
```

Observed artifact for this check:

```text
phy-6d2c689dab
```

---

## Expected success condition

The minimal first-run workflow is successful if:

1. backend health returns `{"ok":true,"version":"0.1.0"}`;
2. the frontend starts at `http://localhost:3000`;
3. the AWSRT landing page loads;
4. the Physical Surface opens;
5. the `Smoke test · small grid` preset can be selected;
6. `Generate Physical RUN` creates a `phy-*` artifact;
7. `Open in Visualizer` opens the Physical Visualizer for that artifact.

---

## Observed success record

During v0.8 Subgoal 03, this workflow created:

```text
phy-6d2c689dab
```

The backend health response was:

```json
{"ok":true,"version":"0.1.0"}
```

The frontend development server started at:

```text
http://localhost:3000
```

---

## Notes and limitations

This workflow is intentionally small.

It verifies basic startup, page navigation, and one small Physical Surface artifact workflow. It does not reproduce the frozen v0.6 experimental evidence state.

The smoke-test artifact should not be interpreted as a thesis result or as evidence about wildfire behavior. It is a local application and handoff check.

Known limitations:

- this check was not a broad cross-platform installation test;
- npm dependency warnings may still exist from Subgoal 02;
- this workflow does not exercise operational, epistemic, or analysis result generation;
- this workflow does not validate transformed real-fire artifacts;
- this workflow does not validate JOSS packaging expectations by itself.

---

## Relationship to v0.8 handoff goal

This workflow supports the v0.8 handoff goal by documenting a concrete first-run path:

```text
clone/install → start backend → start frontend → open app → create small artifact → visualize artifact
```

It moves AWSRT one step beyond “the repository builds” toward “a new technical reader can see the research instrument operate.”
