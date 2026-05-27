# AWSRT v0.7 Subgoal 11 — Consolidation and Freeze Packaging

**Project:** AWSRT — Adaptive Wildfire Sensing Research Tool  
**Branch:** `v0.7-subgoal-11`  
**Design note:** `docs/design/v0_7_11_consolidation_and_freeze_packaging.md`  
**Status:** Draft design note  
**Date:** 2026-05-27

---

## 1. Purpose

This subgoal consolidates the AWSRT v0.7 shareability work into a clear closeout state.

v0.7 has not been an experimental-result version. It has been a shareability, coherence, documentation, and auditability pass over AWSRT after the frozen v0.6 distance-window and cross-artifact synthesis state.

The purpose of this subgoal is to answer:

> What is the bounded v0.7 result state, and what does it make safer or clearer for committee-facing and future-development use?

The goal is not to add new frontend or backend functionality. The goal is to package the v0.7 work so that the repository history, README, documentation index, and design notes tell a coherent story.

---

## 2. Current v0.7 arc

The v0.7 sequence has focused on making AWSRT easier to understand, inspect, run, and continue developing as a research instrument.

The main v0.7 arc is:

1. define the shareable research-tool roadmap;
2. organize the frontend around the four research surfaces;
3. update README, local install notes, and v0.6 reproducibility notes;
4. improve UI maturity feedback;
5. refine Physical Surface abstraction wording;
6. add movement/path auditability;
7. make deployment-origin geometry cases explicit in Analysis Batch;
8. harden the frontend production build;
9. add a subgoal freeze checklist;
10. align the README and documentation index.

Subgoal 11 should consolidate those changes, record the final validation state, and identify what remains intentionally unfinished.

---

## 3. Important framing

AWSRT remains:

- a research instrument;
- a tool for studying adaptive sensing, belief maintenance, impaired information flow, and usefulness;
- a wildfire-like experimental field and transformed-artifact analysis environment;
- thesis-facing and paper-facing research software under active development.

AWSRT is not:

- an operational wildfire deployment system;
- a high-fidelity wildfire simulator;
- a physical twin;
- a digital twin;
- a universally optimal adaptive-sensing controller;
- a productized public web application.

The v0.7 freeze should preserve this framing.

---

## 4. v0.7 did not reopen v0.6

A central closeout point:

> v0.7 did not rerun, modify, or reinterpret the frozen v0.6 experiments.

v0.6 remains the frozen distance-window and cross-artifact synthesis result state. v0.7 made the tool more inspectable and shareable around that state.

Therefore, the v0.7 closeout should distinguish:

```text
v0.6 = frozen evidence/result state
v0.7 = shareability, documentation, UI wording, auditability, and workflow hardening
```

This distinction should appear clearly in the consolidation note.

---

## 5. Subgoal-by-subgoal consolidation

### v0.7-subgoal-01 — Shareable research tool roadmap

Established the v0.7 direction: make AWSRT more coherent and shareable without transforming it into a polished public product or operational simulator.

Expected closeout note:

```text
Subgoal 01 set the roadmap for v0.7 as a shareability and coherence pass over the research instrument.
```

### v0.7-subgoal-02 — Surface terminology and splash reframing

Reframed the frontend around four research surfaces:

- Physical Surface;
- Epistemic Surface;
- Operational Surface;
- Analysis Surface.

Expected closeout note:

```text
Subgoal 02 gave the app a stable organizing vocabulary aligned with the thesis framing.
```

### v0.7-subgoal-03 — README and local installation docs

Updated the root README and added installation/reproducibility documentation, including:

```text
docs/install/local_install.md
docs/reproducibility/reproduce_v0_6.md
```

Expected closeout note:

```text
Subgoal 03 made local setup and frozen v0.6 reproduction more discoverable.
```

### v0.7-subgoal-04 — UI maturity pass

Improved UI feedback for deletion and long-running study generation. Cleaned Epistemic Surface wording so Belief Lab is framed as a workflow within the Epistemic Surface.

Expected closeout note:

```text
Subgoal 04 improved user feedback without claiming polished product maturity.
```

### v0.7-subgoal-05 — Physical Surface abstraction pass

Refined Physical Designer and Physical Visualizer wording so generated fields are framed as environmental-field substrates rather than literal physical worlds.

Expected closeout note:

```text
Subgoal 05 reduced the risk that the Physical Surface would be misread as a physical wildfire simulator or digital twin.
```

### v0.7-subgoal-06 — Sensor trajectory movement auditability

Added movement/path auditability through:

- read-only trajectory CSV export from existing `sensors_rc`;
- read-only trajectory JSON endpoint;
- Movement audit card in Operational Visualizer;
- optional sensor trail overlay.

Expected closeout note:

```text
Subgoal 06 made realized movement consequences inspectable without changing backend movement logic.
```

### v0.7-subgoal-07 — Batch-origin cases and geometry-study design

Added Analysis Batch support for deployment-origin case expansion using ordinary case overrides of:

```text
network.base_station_rc
```

Also included:

- v0.6 three-origin reference helper;
- sampled-origin structure example;
- no backend schema rename;
- no normalized-distance computation in this subgoal;
- no v0.6 reruns.

Expected closeout note:

```text
Subgoal 07 made deployment geometry an explicit, repeatable, auditable study dimension while preserving existing manifest semantics.
```

### v0.7-subgoal-08 — Frontend production-build hardening

Resolved production build/export failures caused by query-parameter pages using `useSearchParams()` without Suspense boundaries.

Validation reached:

```text
npm --prefix frontend run build
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
```

Expected closeout note:

```text
Subgoal 08 made the frontend production build succeed, improving shareability beyond the local development server.
```

### v0.7-subgoal-09 — Freeze checklist and developer workflow

Added:

```text
docs/development/subgoal_freeze_checklist.md
docs/design/v0_7_09_freeze_checklist_and_developer_workflow.md
```

Expected closeout note:

```text
Subgoal 09 captured a lightweight validation habit for future subgoals.
```

### v0.7-subgoal-10 — README and docs index alignment

Updated root README/documentation map and expanded:

```text
docs/README.md
```

Expected closeout note:

```text
Subgoal 10 made the v0.7 documentation surface discoverable from the README and docs index.
```

---

## 6. Candidate deliverable

The main deliverable for this subgoal is a closeout/freeze note:

```text
docs/design/v0_7_11_consolidation_and_freeze_packaging.md
```

Possible additional deliverable, only if useful:

```text
docs/design/v0_7_00_summary.md
```

However, the preferred initial implementation is a single design/freeze-packaging note. Avoid adding too many summary files unless the need is clear.

---

## 7. Recommended closeout document structure

The closeout note should include:

```text
# AWSRT v0.7 Consolidation and Freeze Packaging

## 1. Purpose
## 2. What v0.7 changed
## 3. What v0.7 did not change
## 4. Subgoal summary
## 5. Validation state
## 6. Documentation state
## 7. Known limitations
## 8. Suggested next development directions
## 9. Freeze criteria
## 10. Suggested commit and push commands
```

This should be concise enough to use as a real freeze record, but complete enough to make the v0.7 arc understandable later.

---

## 8. Validation state to record

The final v0.7 closeout should record:

### 8.1 Frontend build

After Subgoal 08:

```bash
npm --prefix frontend run build
```

passed successfully.

### 8.2 Documentation-only checks

For docs-only subgoals:

```bash
git diff --check
```

was used as the primary validation.

### 8.3 Manual UI checks

Important manual checks included:

- Analysis Batch `usefulness_family` preset expands to healthy / delay / noise;
- applying the v0.6 origin helper produces nine origin × condition cases;
- each generated override contains `network.base_station_rc`;
- Operational Visualizer movement trail overlay was manually inspected during Subgoal 06;
- production build succeeded after Suspense boundary fixes.

### 8.4 Git cleanliness

Each subgoal was committed and pushed on a dedicated branch.

---

## 9. Documentation state to record

At v0.7 closeout, the following documentation should be discoverable:

```text
README.md
docs/README.md
docs/install/local_install.md
docs/reproducibility/reproduce_v0_6.md
docs/development/subgoal_freeze_checklist.md
docs/design/v0_7_01_shareable_research_tool_roadmap.md
docs/design/v0_7_02_surface_terminology_and_splash_reframing.md
docs/design/v0_7_03_readme_and_local_installation_docs.md
docs/design/v0_7_04_ui_maturity_pass.md
docs/design/v0_7_05_physical_surface_abstraction_pass.md
docs/design/v0_7_06_sensor_trajectory_movement_auditability.md
docs/design/v0_7_07_batch_origin_cases_geometry_study_design.md
docs/design/v0_7_08_frontend_production_build_hardening.md
docs/design/v0_7_09_freeze_checklist_and_developer_workflow.md
docs/design/v0_7_10_readme_and_docs_index_alignment.md
docs/design/v0_7_11_consolidation_and_freeze_packaging.md
```

---

## 10. Known limitations to preserve

The closeout should explicitly preserve these limitations:

- AWSRT is still research software under active development.
- Installation has not been broadly tested across machines.
- Docker/containerized installation is not yet the primary supported path.
- Some frontend surfaces remain research-instrument workflows rather than polished product UX.
- v0.6 evidence is bounded transformed-real-fire evidence, not universal wildfire generalization.
- The compact usefulness triad remains an interpretive diagnostic, not a complete causal explanation.
- Historical design notes may retain older terminology for auditability.
- v0.7 does not claim new empirical validation beyond the frozen v0.6 state.

---

## 11. Possible next development directions

The closeout may identify possible next directions without committing to them.

Potential next lines:

### 11.1 v0.8 packaging / release discipline

Possible focus:

- decide whether to tag v0.7;
- prepare a release note;
- define branch merge strategy;
- review whether a GitHub release is needed.

### 11.2 Documentation polish

Possible focus:

- tighten local install instructions after testing on another machine;
- add screenshots or diagrams for the four surfaces;
- improve API route documentation.

### 11.3 Lightweight CI

Possible focus:

- add a GitHub Action for `npm --prefix frontend run build`;
- optionally add backend tests;
- keep CI modest and aligned with research software needs.

### 11.4 Continued app auditability

Possible focus:

- richer export metadata;
- more visible analysis table columns;
- more explicit provenance links between visualizer pages and study artifacts.

### 11.5 Thesis-facing figure/export support

Possible focus:

- improve figure export reproducibility;
- document canonical figure workflows;
- package thesis-ready artifacts.

These should remain suggestions, not requirements.

---

## 12. Non-goals

Subgoal 11 should not:

- add new app features;
- run new experiments;
- rerun v0.6 studies;
- alter v0.6 interpretation;
- rename schemas or manifest fields;
- change backend behavior;
- change frontend behavior except possibly documentation links;
- add CI/CD unless explicitly split into a new subgoal;
- create a release tag unless explicitly decided.

---

## 13. Suggested inspection commands

Before writing the closeout note, inspect:

```bash
git log --oneline --decorate -20
find docs -maxdepth 2 -type f | sort
sed -n '1,220p' README.md
sed -n '1,220p' docs/README.md
sed -n '1,220p' docs/development/subgoal_freeze_checklist.md
```

Optional:

```bash
npm --prefix frontend run build
```

This optional build check is useful before final v0.7 closeout, even if Subgoal 11 is docs-only, because the closeout is meant to record a freeze-ready state.

---

## 14. Freeze criteria

Subgoal 11 can be frozen when:

1. The v0.7 consolidation/freeze note exists.
2. The note summarizes v0.7 subgoals 01–10.
3. The note clearly distinguishes v0.6 frozen evidence from v0.7 shareability work.
4. The note records validation status.
5. The note records known limitations.
6. The note identifies possible next directions without committing to them.
7. No frontend or backend functionality is changed.
8. `git diff --check` passes.
9. The working tree is clean.
10. Changes are committed.
11. The branch is pushed to GitHub.

If a final frontend build is run, record the result in the closeout note.

---

## 15. Suggested commit messages

For the closeout note:

```text
Add v0.7 consolidation freeze note
```

If a final README/docs pointer is also adjusted:

```text
Document v0.7 consolidation state
```

---

## 16. Expected outcome

At the end of Subgoal 11, AWSRT v0.7 should have a coherent closeout record.

A future reader should be able to answer:

- What was v0.7 for?
- Which subgoals were completed?
- What did v0.7 make clearer?
- What did v0.7 intentionally not change?
- What validation was performed?
- What remains unfinished?
- What should the next development line consider?

This supports the larger goal of making AWSRT defensible and shareable as a research instrument without overclaiming operational readiness or experimental generality.
