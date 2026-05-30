# AWSRT v0.8 Subgoal 10 — Consolidation and Handoff Freeze

**Project:** AWSRT — Adaptive Wildfire Sensing Research Tool  
**Branch:** `v0.8-subgoal-10`  
**Design / closeout note:** `docs/design/v0_8_10_consolidation_and_handoff_freeze.md`  
**Status:** Draft final freeze note  
**Date:** 2026-05-30  

---

## 1. Purpose

This subgoal closes AWSRT v0.8 as a reproducible-handoff milestone.

The v0.8 theme has been:

```text
From shareable repository to reproducible handoff.
```

Subgoals 01–09 established and consolidated the v0.8 handoff spine:

```text
roadmap/backlog
clean-machine installation verification
minimal first-run workflow
backend smoke-test workflow
frontend build/runtime check workflow
JOSS/community readiness review
repository metadata and hygiene cleanup
committee-facing orientation guide
consolidation planning
```

Subgoal 10 should complete the freeze process by recording the final v0.8 state, running final validation, merging to `main`, and deciding whether to tag `v0.8`.

This subgoal should be short and disciplined.

---

## 2. Guiding question

The guiding question is:

> Is AWSRT v0.8 ready to be frozen and tagged as a reproducible-handoff milestone?

This should be answered by validation and repository inspection, not by expanding scope.

---

## 3. What v0.8 is

AWSRT v0.8 is a reproducible-handoff release track.

It makes AWSRT easier for a thesis committee member, JOSS/community reader, or future maintainer to:

- understand what AWSRT is;
- understand what AWSRT is not;
- install the backend and frontend;
- run a minimal first-run workflow;
- validate backend health and tests;
- validate frontend build and development startup;
- inspect the frozen v0.6 evidence state;
- understand the repository’s readiness and remaining gaps.

v0.8 is a documentation, validation, metadata, and handoff milestone.

---

## 4. What v0.8 is not

v0.8 is not:

- a new experimental-result version;
- a rerun of v0.6 experiments;
- a change to v0.6 scientific interpretation;
- an operational wildfire simulator release;
- a high-fidelity wildfire prediction release;
- a physical twin or digital twin release;
- a JOSS submission package;
- a dependency-remediation release;
- a broad UI redesign.

The frozen v0.6 evidence state remains the current result state for thesis/paper interpretation.

---

## 5. v0.8 subgoal summary

### v0.8-subgoal-01 — Roadmap and backlog triage

Created:

```text
docs/design/v0_8_01_roadmap_and_backlog_triage.md
docs/backlog/v0_8_backlog.md
```

Established v0.8 as a move from shareable repository to reproducible handoff.

### v0.8-subgoal-02 — Clean-machine install verification

Created/updated:

```text
docs/design/v0_8_02_clean_machine_install_verification.md
docs/install/local_install.md
docs/install/clean_machine_check.md
README.md
docs/README.md
```

Verified the backend startup path and frontend install/build/dev path.

### v0.8-subgoal-03 — Minimal first-run workflow

Created:

```text
docs/design/v0_8_03_minimal_reproducible_first_run_workflow.md
docs/reproducibility/minimal_first_run.md
```

Verified a first-run workflow that created and visualized a small Physical Surface smoke artifact.

### v0.8-subgoal-04 — Backend smoke-test workflow

Created:

```text
docs/design/v0_8_04_backend_smoke_test_workflow.md
docs/development/backend_smoke_test.md
```

Documented backend import, health, and pytest workflow.

### v0.8-subgoal-05 — Frontend build/runtime check workflow

Created:

```text
docs/design/v0_8_05_frontend_build_and_runtime_check_discipline.md
docs/development/frontend_build_check.md
```

Documented frontend install, production build, route output, and dev-server startup.

### v0.8-subgoal-06 — JOSS/community readiness review

Created:

```text
docs/design/v0_8_06_joss_and_community_readiness_review.md
docs/development/joss_community_readiness_review.md
```

Reviewed repository readiness for external/community inspection and identified small metadata/hygiene issues.

### v0.8-subgoal-07 — Repository metadata and hygiene cleanup

Created/updated:

```text
docs/design/v0_8_07_repository_metadata_and_hygiene_cleanup.md
LICENSE
CITATION.cff
```

Confirmed ignore coverage and cleaned repository metadata wording.

### v0.8-subgoal-08 — Committee-facing orientation guide

Created:

```text
docs/design/v0_8_08_committee_facing_orientation_guide.md
docs/overview/awsrt_committee_orientation.md
```

Added a thesis committee-facing guide explaining AWSRT’s role, limits, four surfaces, and evidence state.

### v0.8-subgoal-09 — Consolidation and handoff freeze planning

Created/updated:

```text
docs/design/v0_8_09_consolidation_and_handoff_freeze_planning.md
README.md
docs/README.md
```

Inspected the v0.8 handoff spine, fixed docs-index drift, and recommended a final Subgoal 10 freeze step.

---

## 6. Final validation plan

Before freezing v0.8, run the following from the repository root.

### 6.1 Git whitespace/diff check

```bash
git diff --check
```

Expected:

```text
no output
```

### 6.2 Backend import check

```bash
PYTHONPATH=backend python -c "from api.main import app; print(app.title, app.version)"
```

Expected:

```text
AWSRT API 0.1.0
```

### 6.3 Backend tests

```bash
python -m pytest backend/tests
```

Expected:

```text
18 passed
```

The exact runtime may vary.

### 6.4 Frontend production build

```bash
npm --prefix frontend run build
```

Expected:

```text
Compiled successfully
Generating static pages (14/14)
```

The build should include the expected app routes:

```text
/
/analysis/batch
/analysis/graphic
/analysis/raw
/epistemic/designer
/epistemic/visualizer
/operational/designer
/operational/visualizer
/physical/designer
/physical/visualizer
```

### 6.5 Final git status

```bash
git status
```

Expected:

```text
nothing to commit, working tree clean
```

---

## 7. Optional runtime spot checks

If desired before tagging:

### Backend runtime health

Terminal 1:

```bash
make backend
```

Terminal 2:

```bash
curl http://127.0.0.1:8000/health
```

Expected response:

```json
{"ok":true,"version":"0.1.0"}
```

### Frontend runtime

```bash
npm --prefix frontend run dev
```

Expected local URL:

```text
http://localhost:3000
```

These runtime checks are useful but optional if the documented Subgoal 03–05 checks remain recent and the final backend/frontend validation passes.

---

## 8. Freeze/tag process

If final validation passes, commit this freeze note on `v0.8-subgoal-10`, push the branch, then merge to `main`.

Suggested branch commit:

```text
Add v0.8 handoff freeze note
```

Suggested merge commit:

```text
Merge AWSRT v0.8 subgoal 10 handoff freeze
```

After merging to `main` and pushing, create an annotated tag:

```bash
git tag -a v0.8 -m "AWSRT v0.8 reproducible handoff"
git push origin v0.8
```

Before tagging, confirm:

```bash
git status
git log --oneline --decorate -5
```

The `v0.8` tag should point to the final `main` merge commit for Subgoal 10.

---

## 9. Freeze criteria

v0.8 can be frozen when:

1. This freeze note exists.
2. `git diff --check` passes.
3. Backend import check passes.
4. Backend pytest suite passes.
5. Frontend production build passes.
6. The working tree is clean.
7. Subgoal 10 is committed and pushed.
8. Subgoal 10 is merged into `main`.
9. `main` is pushed to GitHub.
10. The `v0.8` tag is created and pushed, if the release/tag decision is yes.

---

## 10. Remaining deferred items after v0.8

The following items remain appropriate future work and should not block the v0.8 freeze:

- optional GitHub CI for backend tests and frontend build;
- dependency maintenance / npm audit remediation;
- JOSS paper skeleton or submission preparation;
- contribution/support/governance files;
- Operational Visualizer map sizing/readability pass;
- future Epistemic Surface design probe;
- screenshots or demo assets;
- richer public/community onboarding.

These can be considered for later v0.8.x, v0.9, or thesis-support subgoals.

---

## 11. Expected v0.8 outcome

At the end of v0.8, AWSRT should be more than a coherent local research repository.

It should be a handoff-ready research instrument with:

- clear framing;
- bounded claims;
- install documentation;
- first-run workflow;
- backend validation;
- frontend validation;
- committee orientation;
- community-readiness review;
- cleaned metadata;
- versioned audit trail.

The frozen v0.6 evidence state remains intact, while v0.8 improves the repository’s ability to be inspected, run, and understood.
