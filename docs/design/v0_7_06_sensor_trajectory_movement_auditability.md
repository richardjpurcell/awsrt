# v0.7 Subgoal 06 — Sensor Trajectory and Movement Auditability

**Project:** AWSRT — Adaptive Wildfire Sensing Research Tool  
**Branch:** `v0.7-subgoal-06`  
**Status:** Proposed / design-start note  
**Date:** 2026-05-26  

---

## 1. Purpose

This subgoal makes AWSRT better at explaining **where sensors moved, why they moved, and what path evidence supports a result**.

The goal is not to make a prettier animation or to launch new experiments. The goal is to expose movement as an auditable structural trace within the research instrument.

Sensor trajectories are not merely visualization artifacts. In AWSRT they are part of the structural record of an adaptive sensing run: they show how policy decisions, feasibility constraints, tie-breaking, deployment geometry, and environmental-field structure are translated into realized movement.

This matters because v0.6 showed that deployment geometry, observation windows, and tie-breaking can affect timing, contact, entropy, and usefulness-state summaries. If those effects matter scientifically, then movement paths should be inspectable.

---

## 2. Framing

AWSRT remains a research instrument for adaptive sensing, belief maintenance, information impairment, and usefulness under wildfire-like dynamic fields.

This subgoal should preserve the v0.7 framing:

- AWSRT is not a physical twin or digital twin.
- AWSRT is not a high-fidelity wildfire simulator.
- AWSRT is not being turned into a polished public product.
- The Physical Surface provides an environmental-field substrate.
- The Operational Surface applies sensing policies and feasibility constraints.
- The Analysis Surface interprets resulting traces, metrics, and artifacts.

Movement/path auditability primarily belongs to the **Operational Surface** and **Analysis Surface**. The Physical Surface provides the substrate through which movement occurs, but sensor movement is produced by policy, feasibility, deployment geometry, candidate ordering, and tie-breaking.

---

## 3. Research motivation

The scientific question behind this subgoal is:

> Can AWSRT make the movement consequences of adaptive sensing policies inspectable enough that timing, contact, belief-quality, and usefulness-state results can be interpreted as structural outcomes rather than opaque metric summaries?

In v0.6, several interpretation risks emerged:

1. **Deployment origin matters.**  
   Where sensors begin can strongly affect time-to-first-detection and contact with the evolving field.

2. **Tie-breaking matters.**  
   Deterministic tie-breaking can introduce directional artifacts under equal or near-equal movement scores.

3. **Feasibility projection matters.**  
   A policy may propose movement, but the realized path is shaped by movement constraints, separation constraints, bounds, and feasibility repair.

4. **Observation windows matter.**  
   A run can appear different depending on whether the system has enough time to reach informative regions.

5. **Metrics alone can obscure mechanism.**  
   Timing, coverage, entropy, and usefulness-state summaries are more interpretable when paired with the realized trajectory trace.

The auditability goal is therefore not simply “show the path.” It is to connect realized movement to experimental structure.

---

## 4. Core design question

The central design question for v0.7-subgoal-06 is:

> What minimal movement/path record is needed so that a future AWSRT run can be audited without rerunning the experiment?

A secondary question is:

> What movement/path information is already stored, and can it be surfaced safely without breaking existing manifests or v0.6 reproducibility?

---

## 5. Initial inspection tasks

Before implementing anything, inspect the current repository for existing movement, path, and trajectory support.

Suggested broad search:

```bash
grep -R "trajectory\|path\|sensor.*position\|positions\|movement\|move\|route\|trace\|history" -n \
  --exclude-dir=node_modules \
  backend frontend/app
```

Suggested targeted search:

```bash
grep -R "sensor_positions\|positions_by_t\|sensor_state\|movement_cost\|distance\|candidate\|tie" -n \
  --exclude-dir=node_modules \
  backend frontend/app
```

Suggested artifact search:

```bash
find data -maxdepth 4 -type f | grep -E "manifest|metrics|sensor|trajectory|position|path|json|csv" | head -80
```

Useful follow-up searches may include:

```bash
grep -R "tie_break\|tie-breaking\|candidate_order\|candidate\|feasible\|project" -n \
  --exclude-dir=node_modules \
  backend frontend/app docs
```

```bash
grep -R "base_station\|origin\|deployment\|sensor_count\|sensor.*rc" -n \
  --exclude-dir=node_modules \
  backend frontend/app docs
```

---

## 6. Classification of findings

When inspecting the results, classify each relevant hit as one of the following.

### A. Existing stored trace

Evidence that sensor positions, movements, or trajectories are already written to disk as part of a run.

Examples might include JSON, CSV, manifest, or metrics artifacts containing per-time-step sensor positions.

### B. Existing in-memory trace

Evidence that sensor positions are available during execution but not persisted.

This may be useful for future export support but should not be treated as already auditable.

### C. Derived movement metric

Evidence that movement cost, distance traveled, repositioning cost, or related summaries are computed, even if the full path is not stored.

These are useful but not enough for path auditability on their own.

### D. Policy decision evidence

Evidence that candidate scores, selected targets, tie-breaking, or feasibility choices are available.

This would support stronger auditability, but may be more intrusive to persist.

### E. UI visualization only

Evidence that movement is shown visually but not stored as an artifact.

This is helpful for users but weaker than durable auditability.

### F. Historical / reproducibility artifact

Existing v0.6 artifacts or documentation that should be preserved and not rewritten.

---

## 7. Minimal future trajectory artifact

A minimal future artifact should probably be line-oriented or table-shaped, so that it can be inspected, plotted, and joined to metrics.

A candidate JSONL shape:

```json
{"t":0,"sensor_id":"s0","r":300,"c":465,"phase":"initial","movement_distance":0.0,"feasible":true}
{"t":1,"sensor_id":"s0","r":304,"c":470,"phase":"realized_move","movement_distance":6.4,"feasible":true}
```

A candidate CSV shape:

```csv
run_id,t,sensor_id,r,c,phase,movement_distance,feasible
run_001,0,s0,300,465,initial,0.0,true
run_001,1,s0,304,470,realized_move,6.4,true
```

At minimum, each row should support:

- `run_id`
- `t`
- `sensor_id`
- realized row/column position
- movement distance or displacement since previous step
- whether the realized position passed feasibility constraints
- optional phase or reason tag

A richer version could later include:

- proposed target row/column
- selected candidate rank
- candidate score
- tie-breaking mode
- feasibility repair flag
- reason for rejection or projection
- distance to ignition reference
- distance to nearest active/burning/front-band region
- policy family
- impairment family
- deployment origin
- random seed

The richer version should not be implemented until the current movement logic is inspected.

---
## Implementation note — initial audit endpoint

Initial implementation exposes the already-persisted `sensors_rc` Zarr array as a read-only CSV export:

```text
GET /operational/{opr_id}/trajectory.csv
```

The endpoint derives rows from the stored `(T, N, 2)` realized sensor-position trace. It does not create a second trajectory store, alter manifests, or modify historical runs.

The Operational Visualizer exposes this endpoint through a small **Movement audit** card.

Initial CSV columns:

```text
opr_id,t,sensor_index,r,c,prev_r,prev_c,dr,dc,l1_move,moved
```

This first implementation makes realized movement auditable without yet recording candidate-level decision traces, tie-breaking explanations, or feasibility-repair details.


## 8. Possible artifact names

Candidate future artifact names:

```text
trajectory.csv
sensor_trajectory.csv
movement_trace.csv
sensor_movement_trace.jsonl
trajectory_manifest.json
```

Recommended initial direction:

```text
sensor_trajectory.csv
```

Rationale:

- easy to inspect manually;
- easy to plot;
- easy to join with per-time-step metrics;
- easy to archive in reproduction bundles;
- avoids nested JSON complexity for the first implementation.

If richer decision evidence is added later, it may deserve a separate artifact:

```text
movement_decisions.jsonl
```

That separation would preserve a clean distinction between:

- realized movement trace; and
- policy/candidate/decision explanation trace.

---

## 9. UI placement

Trajectory auditability should not be treated as part of the Physical Surface.

Likely UI homes:

### Operational Surface

Best for inspecting one run’s realized sensor movement in relation to policy configuration.

Possible panel:

```text
Operational Surface → Movement Trace
```

Useful controls:

- run selector;
- sensor selector;
- time slider;
- show/hide path;
- show current positions;
- show deployment origin;
- show candidate/path metadata if available.

### Analysis Surface

Best for comparing trajectory-derived summaries across runs.

Possible panel:

```text
Analysis Surface → Movement Audit
```

Useful summaries:

- total movement distance;
- movement distance by sensor;
- distance from deployment origin;
- distance to ignition reference;
- fraction of time near active/front-band regions;
- path compactness or wandering;
- comparison across policy families, geometry cases, or tie-breaking modes.

### Physical Visualizer

May remain useful for visual overlay, but should not become the conceptual home of trajectory auditability.

The Physical Visualizer can show movement over an environmental-field substrate, but the trace itself is operational evidence.

---

## 10. Non-goals

This subgoal should not:

- rerun v0.6 experiments;
- modify v0.6 reproduction artifacts;
- rename backend schema fields;
- redesign the movement controller;
- add new policy behavior;
- claim physical wildfire realism;
- claim path optimality;
- turn AWSRT into an operational navigation or deployment planner.

The first implementation, if any, should be audit/export/display support only.

---

## 11. Compatibility constraints

Preserve:

- existing manifests;
- existing artifact paths;
- v0.6 reproduction instructions;
- existing policy names and metric semantics;
- backend schema compatibility unless aliases are explicitly designed later.

If a new trajectory artifact is added, it should be additive and optional. Older runs should remain readable.

The app should tolerate missing trajectory artifacts and show a clear message such as:

```text
No trajectory artifact is available for this run.
```

not fail or imply the run is invalid.

---

## 12. Candidate implementation phases

### Phase 1 — Inspection and design confirmation

- Search current backend/frontend for movement/path storage.
- Identify existing artifacts.
- Determine whether realized positions are already available.
- Decide the minimal artifact format.
- Decide UI surface placement.

### Phase 2 — Additive export support

- Persist realized sensor positions for new runs only.
- Add a small manifest entry indicating the trajectory artifact path.
- Ensure older runs remain compatible.

### Phase 3 — Minimal UI inspection

- Add a simple trajectory artifact presence indicator.
- Add a table or downloadable artifact link.
- Optionally add a basic path overlay only if the trace already exists.

### Phase 4 — Analysis integration

- Add trajectory-derived summaries only after the basic trace is stable.
- Avoid composite over-ranking.
- Keep movement summaries separate from belief/usefulness metrics.

---

## 13. Freeze criteria

Subgoal 06 can be considered complete when:

1. Current movement/path storage has been inspected and documented.
2. Existing trajectory-related artifacts, if any, have been identified.
3. A minimal future trajectory artifact schema has been selected.
4. The proper UI surface for movement inspection has been chosen.
5. No v0.6 experiments have been rerun or modified.
6. No backend schema renaming has been attempted.
7. Any implementation is additive and compatible with older runs.
8. Missing trajectory artifacts are handled gracefully.
9. The app runs locally.
10. The working tree is clean and changes are committed.

---

## 14. Suggested commit messages

For a design-only commit:

```text
Add movement auditability design note
```

For an inspection/documentation commit:

```text
Document existing movement trace support
```

For a minimal additive export implementation:

```text
Add sensor trajectory artifact export
```

For a minimal UI inspection commit:

```text
Expose sensor trajectory artifact in analysis UI
```

---

## 15. Open decisions

Before implementing, decide:

1. Should the first artifact be CSV, JSONL, or both?
2. Should trajectory traces be attached to Operational runs, Analysis runs, or both?
3. Should the first UI exposure be a table/download link rather than an overlay?
4. Should proposed candidates be recorded now, or deferred until after realized positions are stable?
5. Should deterministic/stochastic tie-breaking metadata be recorded in the same artifact or kept in the manifest?
6. What is the smallest useful path audit that supports thesis-facing interpretation?

Initial recommendation:

- Start with realized movement only.
- Use `sensor_trajectory.csv`.
- Store it as an additive artifact for new runs.
- Surface it first as an Analysis/Operational downloadable artifact or table.
- Defer candidate-level decision traces until realized movement is stable.

---

## 16. Working principle

Keep the trace simple, durable, and interpretable.

A useful trajectory artifact should let a future reader ask:

> Given this run’s policy, geometry, seed, and impairment setting, where did the sensors actually go?

That answer should be available without rerunning the experiment.
