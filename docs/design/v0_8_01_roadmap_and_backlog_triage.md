# AWSRT v0.8 Subgoal 01 — Roadmap and Backlog Triage for Reproducible Handoff

**Project:** AWSRT — Adaptive Wildfire Sensing Research Tool  
**Branch:** `v0.8-subgoal-01`  
**Design note:** `docs/design/v0_8_01_roadmap_and_backlog_triage.md`  
**Status:** Draft design note  
**Date:** 2026-05-27

---

## 1. Purpose

This subgoal opens AWSRT v0.8 after the frozen and tagged v0.7 closeout.

v0.7 made AWSRT more coherent and shareable as a research instrument. It aligned the README and documentation index, clarified the four research surfaces, improved selected UI wording and feedback, added movement and deployment-origin auditability, fixed the frontend production build, and documented a lightweight subgoal freeze workflow.

v0.8 should now move from:

```text
shareable repository
```

toward:

```text
reproducible handoff
```

The purpose of this subgoal is to define the v0.8 roadmap and triage the backlog before implementation begins.

The guiding question is:

> What should v0.8 improve now that v0.7 made AWSRT coherent, buildable, documented, and freeze-disciplined?

---

## 2. Proposed v0.8 theme

The proposed v0.8 theme is:

> From shareable repository to reproducible handoff.

This means AWSRT should become easier for someone else to clone, install, build, run, inspect, and understand as a research tool.

The target audience is twofold:

1. **Thesis committee readability**  
   The tool should help a committee member understand what AWSRT is, what it is not, and how it supports the thesis argument.

2. **JOSS / community readiness**  
   The repository should move closer to a form that could support Journal of Open Source Software review and broader community inspection.

This does not mean AWSRT must become a polished public product. It means the project should become easier to hand off, reproduce, and evaluate.

---

## 3. What v0.8 inherits from v0.7

v0.7 established:

- four research surfaces:
  - Physical Surface;
  - Epistemic Surface;
  - Operational Surface;
  - Analysis Surface;
- improved README and documentation index;
- local installation notes;
- v0.6 reproducibility notes;
- frontend production-build success;
- subgoal freeze checklist;
- movement/path auditability;
- deployment-origin case helper;
- consolidated v0.7 freeze note;
- frozen `v0.7` tag on `main`.

v0.8 should preserve this foundation.

---

## 4. What v0.8 should not do by default

v0.8 should not automatically reopen thesis experiments or alter v0.6 interpretations.

Avoid by default:

- rerunning v0.6 experiments;
- changing frozen v0.6 evidence claims;
- renaming backend schema fields;
- changing manifest compatibility;
- adding broad new experimental campaigns;
- turning AWSRT into an operational wildfire simulator;
- turning AWSRT into a high-fidelity physical/digital twin;
- over-polishing the UI at the expense of reproducible handoff.

Any change that touches research interpretation, schema compatibility, or reproducibility should be explicitly designed before implementation.

---

## 5. Initial v0.8 priorities

### 5.1 Reproducible handoff

Core question:

> Can another technically capable user clone, install, build, run, and inspect AWSRT without relying on private memory or chat history?

Candidate subgoals:

- clean-machine install verification;
- Node/Python version documentation;
- frontend build validation guidance;
- backend smoke-test guidance;
- clearer first-run walkthrough;
- artifact/data directory expectations;
- minimal known-good command sequence.

### 5.2 JOSS and community readiness

Core question:

> What would a JOSS reviewer or community reader need in order to understand, build, and evaluate AWSRT as research software?

Candidate subgoals:

- review JOSS paper/repository expectations;
- check `CITATION.cff`;
- check license and README clarity;
- define installation and example-run expectations;
- prepare a minimal example workflow;
- clarify contribution/development expectations without overbuilding governance.

### 5.3 Thesis committee readability

Core question:

> Can a committee member understand the tool’s role in the thesis without confusing it for a wildfire simulator or operational planner?

Candidate subgoals:

- committee-facing demo walkthrough;
- screenshots or diagrams of the four surfaces;
- short explanation of how AWSRT supports the thesis question;
- clearer navigation from README to v0.6 reproduction and analysis artifacts.

### 5.4 Developer workflow stability

Core question:

> Can future subgoals continue safely without repeatedly rediscovering build, branch, and freeze practices?

Candidate subgoals:

- keep using `docs/development/subgoal_freeze_checklist.md`;
- add lightweight CI for frontend build;
- optionally add backend test/smoke workflow;
- document branch/tag/release conventions.

---

## 6. Explicit backlog threads to preserve

The following items should be kept visible even if they are not part of the immediate v0.8 implementation path.

### 6.1 Operational Visualizer map sizing and usability

Current concern:

> The Operational Visualizer does not control the size and readability of the sensor/terrain visual feedback map as well as the Physical Visualizer. The Physical Visualizer is currently more user friendly.

This should be preserved as a backlog thread.

Possible future scope:

- improve map sizing controls;
- improve terrain/sensor/fire visual balance;
- align visual affordances with Physical Visualizer where appropriate;
- make Operational Visualizer more committee/demo friendly;
- avoid changing operational logic;
- keep the work as display/layout/readability unless explicitly designed otherwise.

Possible future subgoal title:

```text
Operational Visualizer map sizing and visual feedback pass
```

This may belong in v0.8 if committee/JOSS demo readiness requires it, but it does not have to be first.

### 6.2 Future Epistemic Surface ideas

Current concern:

> There are still ideas for the Epistemic Surface worth pursuing later.

This should be preserved without forcing it into the reproducible-handoff path.

Possible future scope:

- improve Epistemic Surface workflows;
- clarify belief, uncertainty, entropy, and residual interpretation;
- add better epistemic diagnostics or visual explanations;
- improve committee-facing explanation of belief maintenance;
- avoid squeezing research-surface redesign into release hardening unless it becomes necessary.

Possible future subgoal title:

```text
Epistemic Surface next-work design probe
```

This may be deferred to a later v0.8 subgoal or to v0.9 depending on priority.

---

## 7. Candidate v0.8 roadmap

A possible v0.8 sequence is:

### v0.8-subgoal-01 — Roadmap and backlog triage

Define the v0.8 theme, priorities, and backlog.

### v0.8-subgoal-02 — Clean-machine install verification

Test or simulate a clean setup path and update installation documentation based on what actually breaks.

Likely outputs:

```text
docs/install/local_install.md
docs/install/clean_machine_check.md
```

### v0.8-subgoal-03 — Minimal reproducible first-run workflow

Create a concise first-run path that confirms backend, frontend, and one simple artifact/workflow.

Likely outputs:

```text
docs/reproducibility/minimal_first_run.md
```

### v0.8-subgoal-04 — Lightweight CI / frontend build check

Add a GitHub Action or equivalent lightweight check for:

```bash
npm --prefix frontend run build
```

Keep this modest.

### v0.8-subgoal-05 — Backend smoke-test workflow

Clarify and/or add a targeted backend smoke-test path.

Possible commands:

```bash
python -m pytest backend/tests
```

or a narrower test set if the full suite is not reliable.

### v0.8-subgoal-06 — JOSS/community readiness review

Review repository against JOSS-style expectations:

- installation;
- license;
- citation;
- example use;
- documentation;
- statement of need;
- reproducibility and support expectations.

### v0.8-subgoal-07 — Committee-facing demo walkthrough

Create a short walkthrough for showing AWSRT’s four surfaces and v0.6 evidence without overclaiming.

### v0.8-subgoal-08 — Optional Operational Visualizer usability pass

If selected for v0.8, improve Operational Visualizer map sizing and visual feedback readability.

### v0.8-subgoal-09 — v0.8 consolidation and handoff freeze

Consolidate v0.8, validate build/test/docs, and decide whether to tag.

This sequence is provisional. Subgoal 01 should decide the first concrete implementation target after triage.

---

## 8. Candidate backlog file

In addition to this design note, v0.8 may create:

```text
docs/backlog/v0_8_backlog.md
```

This file could preserve deferred items such as:

- Operational Visualizer map sizing and readability;
- future Epistemic Surface ideas;
- CI refinements;
- installation improvements discovered during clean-machine testing;
- community/JOSS readiness gaps;
- demo/figure/export workflow needs.

The backlog file should be short and practical, not a second design-note archive.

---

## 9. Recommended immediate deliverables for Subgoal 01

Subgoal 01 should likely produce:

```text
docs/design/v0_8_01_roadmap_and_backlog_triage.md
docs/backlog/v0_8_backlog.md
```

The design note explains the v0.8 direction.

The backlog note preserves actionable deferred items.

No frontend or backend code should be changed in this subgoal unless explicitly decided later.

---

## 10. Suggested inspection commands

Before finalizing the roadmap/backlog, inspect current documentation:

```bash
sed -n '1,240p' README.md
sed -n '1,240p' docs/README.md
sed -n '1,240p' docs/install/local_install.md
sed -n '1,240p' docs/reproducibility/reproduce_v0_6.md
sed -n '1,240p' docs/development/subgoal_freeze_checklist.md
find docs/backlog -maxdepth 2 -type f | sort
```

Optional validation, since this is a docs-only planning subgoal:

```bash
git diff --check
```

No frontend build is required unless frontend files are touched.

---

## 11. Non-goals

Subgoal 01 should not:

- implement CI;
- change installation instructions before inspection;
- change frontend or backend code;
- start Operational Visualizer refactoring;
- start Epistemic Surface redesign;
- rerun experiments;
- change v0.6 interpretation;
- tag v0.8.

This is a roadmap and backlog triage subgoal.

---

## 12. Freeze criteria

Subgoal 01 can be frozen when:

1. The v0.8 theme is recorded.
2. The roadmap identifies initial v0.8 priorities.
3. Thesis committee readability and JOSS/community readiness are both represented.
4. Reproducible handoff is identified as the primary v0.8 direction.
5. Operational Visualizer map sizing/usability is captured as a backlog thread.
6. Future Epistemic Surface work is captured as a backlog thread.
7. No frontend/backend behavior is changed.
8. `git diff --check` passes.
9. The working tree is clean.
10. Changes are committed and pushed.

---

## 13. Suggested commit message

```text
Add v0.8 roadmap and backlog triage
```

If a separate backlog file is added:

```text
Add v0.8 roadmap and backlog
```

---

## 14. Expected outcome

At the end of Subgoal 01, AWSRT v0.8 should have a clear starting direction:

> From shareable repository to reproducible handoff.

The repository should also preserve the two important future threads:

- Operational Visualizer visual feedback and map sizing need improvement.
- Epistemic Surface ideas remain important and should be pursued deliberately later.

This lets v0.8 begin with reproducibility and handoff discipline while keeping future interface and research-surface improvements visible.
