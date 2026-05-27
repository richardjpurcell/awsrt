# v0.7 Subgoal 07 — Batch-Origin Cases and Geometry Study Design

**Project:** AWSRT — Adaptive Wildfire Sensing Research Tool  
**Branch:** `v0.7-subgoal-07`  
**Status:** Proposed / design-start note  
**Date:** 2026-05-26  

---

## 1. Purpose

This subgoal designs a shareable, auditable way to define and run **deployment-origin / geometry cases** in AWSRT batch studies.

The goal is not to launch new thesis experiments immediately. The goal is to make geometry variation easier to specify, inspect, reproduce, and compare without ad hoc manual edits to individual manifests.

In v0.6, deployment geometry was shown to be a structural variable: where sensors begin relative to ignition and fire evolution can affect time-to-first-detection, contact, belief quality, usefulness-state occupancy, and movement traces. Subgoal 07 turns that lesson into better research-tool support.

---

## 2. Scientific motivation

The central scientific question for this subgoal is:

> How can AWSRT make deployment geometry an explicit, repeatable study dimension rather than an implicit or manually edited condition?

In earlier v0.6 work, deployment origin and observation windows were treated as structural variables. This mattered because geometry can change the apparent interpretation of timing metrics, contact and overlap metrics, movement requirements, realized sensor paths, entropy and belief-quality summaries, usefulness-state occupancy, policy-family comparison, and robustness claims under transformed wildfire-like conditions.

Subgoal 06 added movement/path auditability. Subgoal 07 builds on that by improving how geometry cases are specified in the first place.

---

## 3. Framing

AWSRT remains a research instrument, not an operational deployment planner.

This subgoal should preserve the v0.7 framing:

- AWSRT is not a physical twin or digital twin.
- AWSRT is not a high-fidelity wildfire simulator.
- Geometry cases are experimental structural conditions, not operational recommendations.
- Deployment origins are auditable inputs, not claims about optimal real-world placement.
- Batch studies should support systematic comparison without implying universal ranking.

Preferred language:

```text
deployment-origin case
geometry case
structural deployment condition
origin set
origin sweep
deployment geometry as an experimental variable
```

Avoid language that implies:

```text
optimal deployment
real-world recommended placement
validated operational geometry
physical deployment plan
```

---

## 4. Current suspected state

Before implementation, inspect current support for geometry and origin overrides.

Likely existing mechanism:

- operational manifests already include `network.base_station_rc`;
- Analysis Batch likely supports dotpath overrides;
- geometry cases may already be possible manually via `network.base_station_rc`;
- the missing piece is probably a curated UI/design layer for named origin cases.

The first inspection should determine whether Subgoal 07 should add documentation only, named origin presets in the Analysis Batch UI, a reusable origin-case generator, richer summary columns for deployment geometry, distance-to-ignition normalization, or a future design only with implementation deferred.

---

## 5. Initial inspection commands

Run from repository root:

```bash
grep -R "base_station_rc\|origin\|deployment origin\|origin_near\|origin_south\|origin_east\|network.base_station_rc" -n \
  --exclude-dir=node_modules \
  backend frontend/app docs
```

Target the Analysis Batch UI:

```bash
grep -n "base_station_rc\|origin\|case\|overrides\|dotpath\|network" \
  frontend/app/analysis/batch/page.tsx
```

Target backend batch-study support:

```bash
grep -n "base_station_rc\|origin\|overrides\|dotpath\|create_operational_study\|network" \
  backend/api/routers/analysis.py
```

Optional follow-up search for v0.6 geometry language:

```bash
grep -R "deployment geometry\|distance-window\|base station\|ignition-to-base\|origin_" -n \
  --exclude-dir=node_modules \
  docs backend frontend/app
```

---

## 6. Classification of findings

Classify findings as follows.

### A. Existing manifest field

Examples:

```text
network.base_station_rc
```

These are likely already stable and should not be renamed.

### B. Existing batch override mechanism

Evidence that Analysis Batch can already set dotpath overrides such as:

```text
network.base_station_rc
```

If present, Subgoal 07 may be mostly a UI/preset/documentation layer.

### C. Existing UI control

Evidence that deployment origin can already be set directly in a UI.

If this exists, the question becomes whether the current control supports systematic case generation.

### D. Existing analysis column

Evidence that batch output already records origin or geometry metadata.

If absent, adding summary/table columns may be useful.

### E. Existing v0.6 geometry design note

Historical notes should inform language but should not be rewritten unless they are active v0.7 docs.

### F. Missing support

Likely missing support may include named geometry cases, origin-case set selection, automatic dotpath override generation, normalized ignition-to-origin distance, analysis table columns for deployment origin, or UI explanation of geometry as a structural variable.

---

## 7. Candidate origin-case model

A minimal named origin-case object could look like:

```json
{
  "id": "origin_near_initial",
  "label": "Near initial fire region",
  "base_station_rc": [300, 465],
  "description": "Near the initial ignition region; useful as a lower-access-friction geometry case."
}
```

A geometry case set could be:

```json
{
  "id": "v0_6_three_origin_reference",
  "label": "v0.6 three-origin reference set",
  "cases": [
    {
      "id": "origin_near_initial",
      "base_station_rc": [300, 465]
    },
    {
      "id": "origin_south_central",
      "base_station_rc": [650, 725]
    },
    {
      "id": "origin_east_corridor",
      "base_station_rc": [350, 1000]
    }
  ]
}
```

The known v0.6 origin examples were:

```text
origin_near_initial = [300, 465]
origin_south_central = [650, 725]
origin_east_corridor = [350, 1000]
```

These should be treated as reference examples, not universal defaults.

---

## 8. Possible UI design

### Minimal UI approach

Add a small section to Analysis Batch:

```text
Geometry / deployment-origin cases
[ ] Expand cases over selected deployment origins

Origin case set:
  - Manual / none
  - v0.6 three-origin reference set
  - Custom origin list

Selected cases:
  origin_near_initial       [300, 465]
  origin_south_central      [650, 725]
  origin_east_corridor      [350, 1000]
```

Generated dotpath override per case:

```text
network.base_station_rc = [r, c]
```

Optional generated label fields:

```text
geometry_case_id
geometry_case_label
```

### Conservative UI approach

Do not add a new full case generator yet. Instead, add documented examples and a small helper that adds case rows using existing override mechanics.

### Analysis-first approach

Leave input mechanics unchanged, but ensure output tables include:

```text
base_station_r
base_station_c
geometry_case_id
geometry_case_label
```

This supports auditability but may be less helpful for users constructing studies.

---

## 9. Candidate backend behavior

If backend changes are needed, keep them additive.

Possible additions:

- Preserve `network.base_station_rc` in analysis study tables.
- Add optional `geometry_case_id` and `geometry_case_label` columns when present in overrides.
- Include normalized distance to ignition reference only if the physical manifest provides a clear ignition reference and domain scale.

Avoid:

- changing the `network.base_station_rc` schema;
- renaming base station terminology;
- changing old manifests;
- enforcing a single canonical origin set;
- automatically rewriting old analysis tables.

---

## 10. Relationship to Subgoal 06

Subgoal 06 exposed realized movement through:

```text
GET /operational/{opr_id}/trajectory.csv
GET /operational/{opr_id}/trajectory.json
```

and an optional trail overlay in the Operational Visualizer.

Subgoal 07 should use that movement auditability as interpretive support:

- geometry cases specify where sensors start;
- trajectory traces show where they actually go;
- analysis summaries show timing, contact, belief, usefulness, and effort consequences.

The key thesis-facing connection is:

> Geometry is not merely a setup detail. It is a structural condition whose consequences can now be inspected through both metrics and realized movement traces.

---

## 11. Non-goals

Subgoal 07 should not:

- launch new thesis experiments by default;
- rerun v0.6 unless explicitly requested;
- change existing manifests;
- rename `network.base_station_rc`;
- add a real-world deployment planner;
- claim optimal sensor origins;
- add complex GIS selection tools;
- overbuild a general experimental-design engine.

The first implementation, if any, should be small and reversible.

---

## 12. Possible implementation phases

### Phase 1 — Inspection and design confirmation

- Inspect current base-station/origin support.
- Confirm how Analysis Batch applies dotpath overrides.
- Determine whether outputs already preserve origin settings.
- Decide whether Subgoal 07 needs UI, backend, docs, or all three.

### Phase 2 — Documentation / design note update

- Document the existing geometry override path.
- Explain deployment origin as a structural variable.
- Record the intended geometry-case model.

### Phase 3 — Minimal UI helper

- Add named origin-case presets to Analysis Batch.
- Generate dotpath overrides using existing mechanisms.
- Avoid changing backend schema.

### Phase 4 — Output audit columns

- Ensure analysis tables include origin row/column.
- Optionally include geometry case labels if provided.
- Keep this additive and backward-compatible.

### Phase 5 — Future extension

- Support custom origin lists.
- Support normalized ignition-to-origin distances.
- Support geometry-case comparison panels.
- Integrate with movement-trace summaries.

---

## 13. Freeze criteria

Subgoal 07 can be considered complete when:

1. Existing geometry/origin support has been inspected.
2. The role of `network.base_station_rc` is documented.
3. A decision is made between documentation-only, UI-helper, backend-output, or combined implementation.
4. If implemented, geometry cases are additive and compatible with existing manifests.
5. No backend schema rename is attempted.
6. No v0.6 experiments are rerun or modified unless explicitly chosen.
7. Any UI change uses existing dotpath override semantics where possible.
8. App runs locally.
9. Working tree is clean and changes are committed.

---

## 14. Suggested commit messages

Design-only:

```text
Add batch-origin geometry study design note
```

UI helper:

```text
Add batch deployment-origin case helper
```

Backend output/audit columns:

```text
Expose deployment-origin fields in analysis tables
```

Combined minimal implementation:

```text
Add deployment-origin case support for batch studies
```

---

## 15. Open decisions

Before implementing, decide:

1. Should Subgoal 07 be design-only or include a small UI helper?
2. Should geometry cases be named presets, custom rows, or both?
3. Should v0.6 origin examples be included as a reference case set?
4. Should analysis tables always include base-station row/column?
5. Should normalized ignition-to-origin distance be computed now or deferred?
6. Should geometry-case labels be stored in manifests, analysis rows, or only frontend-generated table fields?
7. Should this remain Analysis Batch only, or also appear in Operational Designer?

Initial recommendation:

- Start with inspection.
- Treat `network.base_station_rc` as the stable compatibility field.
- Add a small Analysis Batch helper only if the current override mechanism makes it safe.
- Ensure analysis output records origin coordinates if it does not already.
- Defer normalized distance calculations unless the physical manifest provides a clean, stable ignition reference and domain scale.

---

## 16. Working principle

Keep geometry cases explicit, auditable, and modest.

A good Subgoal 07 outcome should let a future reader ask:

> Which deployment-origin case produced this run, and how did that structural condition affect timing, contact, belief maintenance, usefulness-state behavior, and realized movement?

The answer should be recoverable from manifests, analysis tables, and movement traces without manual reconstruction.
