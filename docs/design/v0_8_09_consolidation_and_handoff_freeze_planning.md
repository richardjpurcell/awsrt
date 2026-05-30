# AWSRT v0.8 Subgoal 09 — Consolidation and Handoff Freeze Planning

**Project:** AWSRT — Adaptive Wildfire Sensing Research Tool  
**Branch:** `v0.8-subgoal-09`  
**Design note:** `docs/design/v0_8_09_consolidation_and_handoff_freeze_planning.md`  
**Status:** Draft design note  
**Date:** 2026-05-30  

---

## 1. Purpose

This subgoal follows the committee-facing orientation guide completed in Subgoal 08.

The v0.8 theme remains:

```text
From shareable repository to reproducible handoff.
```

Subgoals 01–08 have now built the core v0.8 handoff spine:

```text
roadmap/backlog
clean-machine installation verification
minimal first-run workflow
backend smoke-test workflow
frontend build/runtime check workflow
JOSS/community readiness review
repository metadata and hygiene cleanup
committee-facing orientation guide
```

Subgoal 09 should now consolidate the v0.8 state and decide whether anything small must be fixed before a v0.8 freeze/tag.

The purpose is not to add new features. The purpose is to audit, validate, and prepare a coherent handoff closeout.

---

## 2. Guiding question

The guiding question for this subgoal is:

> Is AWSRT v0.8 ready to be frozen as a reproducible-handoff milestone, and if not, what small final fixes remain?

This should be answered by inspection and validation, not by adding new scope.

---

## 3. Relationship to previous v0.8 subgoals

### Subgoal 01 — Roadmap and backlog triage

Created:

```text
docs/design/v0_8_01_roadmap_and_backlog_triage.md
docs/backlog/v0_8_backlog.md
```

Established the v0.8 theme and preserved future backlog threads.

### Subgoal 02 — Clean-machine install verification

Created/updated:

```text
docs/design/v0_8_02_clean_machine_install_verification.md
docs/install/local_install.md
docs/install/clean_machine_check.md
README.md
docs/README.md
```

Verified local install/startup paths.

### Subgoal 03 — Minimal first-run workflow

Created:

```text
docs/design/v0_8_03_minimal_reproducible_first_run_workflow.md
docs/reproducibility/minimal_first_run.md
```

Verified a small Physical Surface smoke artifact workflow.

### Subgoal 04 — Backend smoke-test workflow

Created:

```text
docs/design/v0_8_04_backend_smoke_test_workflow.md
docs/development/backend_smoke_test.md
```

Verified backend import, health, and pytest workflow.

### Subgoal 05 — Frontend build/runtime check workflow

Created:

```text
docs/design/v0_8_05_frontend_build_and_runtime_check_discipline.md
docs/development/frontend_build_check.md
```

Verified frontend install/build/dev workflow.

### Subgoal 06 — JOSS/community readiness review

Created:

```text
docs/design/v0_8_06_joss_and_community_readiness_review.md
docs/development/joss_community_readiness_review.md
```

Identified current strengths and readiness gaps.

### Subgoal 07 — Repository metadata and hygiene cleanup

Created/updated:

```text
docs/design/v0_8_07_repository_metadata_and_hygiene_cleanup.md
LICENSE
CITATION.cff
```

Confirmed ignore-file coverage and cleaned metadata wording.

### Subgoal 08 — Committee-facing orientation guide

Created:

```text
docs/design/v0_8_08_committee_facing_orientation_guide.md
docs/overview/awsrt_committee_orientation.md
```

Added a thesis committee-facing entry point.

Subgoal 09 should consolidate this work and prepare for freeze.

---

## 4. Scope

### 4.1 In scope

This subgoal may include:

- inspecting the v0.8 documentation map;
- confirming that new v0.8 documents are discoverable;
- validating backend and frontend checks;
- checking `README.md` and `docs/README.md` for stale wording;
- checking `CITATION.cff` and `LICENSE` after Subgoal 07;
- reviewing `docs/backlog/v0_8_backlog.md` for completed/deferred status;
- creating a v0.8 consolidation/freeze note;
- deciding whether to tag `v0.8`;
- documenting freeze validation results.

### 4.2 Out of scope

This subgoal should not:

- rerun or reinterpret v0.6 experiments;
- change backend or frontend behavior;
- add new UI features;
- add CI unless explicitly split into a new subgoal;
- fix npm audit warnings;
- create a JOSS paper;
- add contribution/governance files unless separately designed;
- perform broad documentation rewrites;
- add screenshots or presentation material unless separately designed.

---

## 5. Candidate output file

The likely primary deliverable is:

```text
docs/design/v0_8_09_consolidation_and_handoff_freeze_planning.md
```

This design note already provides the planning frame.

The likely final closeout deliverable is:

```text
docs/design/v0_8_10_consolidation_and_handoff_freeze.md
```

or, if the project chooses to close v0.8 within this subgoal:

```text
docs/design/v0_8_09_consolidation_and_handoff_freeze.md
```

Recommended approach:

- Use Subgoal 09 to inspect and plan freeze.
- If small final fixes are found, make them here.
- If everything is ready, either close/tag within Subgoal 09 or create a final Subgoal 10 for freeze packaging.

The decision should be made after inspection.

---

## 6. Consolidation checklist

### 6.1 Documentation discoverability

Check that `docs/README.md` links to:

```text
docs/overview/awsrt_committee_orientation.md
docs/install/local_install.md
docs/install/clean_machine_check.md
docs/reproducibility/minimal_first_run.md
docs/reproducibility/reproduce_v0_6.md
docs/development/backend_smoke_test.md
docs/development/frontend_build_check.md
docs/development/joss_community_readiness_review.md
docs/development/subgoal_freeze_checklist.md
docs/backlog/v0_8_backlog.md
```

Check that recent v0.8 design notes include:

```text
v0_8_01_roadmap_and_backlog_triage.md
v0_8_02_clean_machine_install_verification.md
v0_8_03_minimal_reproducible_first_run_workflow.md
v0_8_04_backend_smoke_test_workflow.md
v0_8_05_frontend_build_and_runtime_check_discipline.md
v0_8_06_joss_and_community_readiness_review.md
v0_8_07_repository_metadata_and_hygiene_cleanup.md
v0_8_08_committee_facing_orientation_guide.md
v0_8_09_consolidation_and_handoff_freeze_planning.md
```

### 6.2 Root README status

Check that `README.md` accurately describes:

- v0.6 as frozen evidence/result state;
- v0.7 as shareability/coherence pass;
- v0.8 as reproducible-handoff work;
- AWSRT as research software under active development;
- AWSRT as not an operational wildfire simulator.

### 6.3 Validation docs

Check that these validation docs are current:

```text
docs/development/backend_smoke_test.md
docs/development/frontend_build_check.md
docs/reproducibility/minimal_first_run.md
docs/install/clean_machine_check.md
```

### 6.4 Metadata

Check:

```text
LICENSE
CITATION.cff
pyproject.toml
frontend/package.json
```

Confirm that obvious metadata placeholders have been removed or consciously deferred.

### 6.5 Backlog status

Review:

```text
docs/backlog/v0_8_backlog.md
```

Decide whether to update it with:

- completed v0.8 items;
- deferred items;
- remaining optional threads;
- future v0.9 candidates.

Keep the backlog short and practical if edited.

---

## 7. Suggested inspection commands

Inspect current docs map and top-level framing:

```bash
sed -n '1,260p' README.md
sed -n '1,240p' docs/README.md
sed -n '1,220p' docs/backlog/v0_8_backlog.md
```

Inspect key v0.8 docs:

```bash
sed -n '1,180p' docs/overview/awsrt_committee_orientation.md
sed -n '1,180p' docs/reproducibility/minimal_first_run.md
sed -n '1,180p' docs/development/backend_smoke_test.md
sed -n '1,180p' docs/development/frontend_build_check.md
sed -n '1,180p' docs/development/joss_community_readiness_review.md
```

Inspect metadata:

```bash
sed -n '1,120p' LICENSE
sed -n '1,220p' CITATION.cff
sed -n '1,220p' pyproject.toml
sed -n '1,220p' frontend/package.json
```

Inspect current Git state and design notes:

```bash
find docs/design -maxdepth 1 -type f | sort | grep 'v0_8'
git status
git log --oneline --decorate -12
```

---

## 8. Validation commands

For v0.8 handoff confidence, run:

```bash
git diff --check
PYTHONPATH=backend python -c "from api.main import app; print(app.title, app.version)"
python -m pytest backend/tests
npm --prefix frontend run build
git status
```

Optional runtime checks:

```bash
make backend
curl http://127.0.0.1:8000/health
npm --prefix frontend run dev
```

The optional runtime checks are useful if making a final release/freeze note, but may not be necessary if already documented and recently verified.

---

## 9. Freeze/tag decision

After inspection and validation, decide whether to:

### Option A — Create a final v0.8 freeze subgoal

Use Subgoal 09 only for planning and small fixes, then create:

```text
v0.8-subgoal-10 — v0.8 consolidation and handoff freeze
```

This is more conservative and keeps the final freeze note separate.

### Option B — Freeze within Subgoal 09

If no additional fixes are needed, rename or extend the Subgoal 09 closeout note and tag v0.8 directly after validation.

This is faster but less separated.

Recommended default:

```text
Use Subgoal 09 for consolidation planning.
Create Subgoal 10 for final v0.8 freeze/tag if a tag is desired.
```

---

## 10. Expected deliverables

Likely deliverables:

```text
docs/design/v0_8_09_consolidation_and_handoff_freeze_planning.md
```

Possible supporting edits:

```text
README.md
docs/README.md
docs/backlog/v0_8_backlog.md
CITATION.cff
```

Only make supporting edits if inspection shows stale or inconsistent information.

---

## 11. Validation expectations

At freeze of this subgoal:

```bash
git diff --check
git status
```

If this subgoal changes only docs/metadata, no frontend/backend validation is strictly required.

However, because this is consolidation planning, running the full handoff validation is recommended:

```bash
PYTHONPATH=backend python -c "from api.main import app; print(app.title, app.version)"
python -m pytest backend/tests
npm --prefix frontend run build
```

No v0.8 tag should be created unless the project explicitly chooses to freeze.

---

## 12. Non-goals

Subgoal 09 should not:

- reopen v0.6 experiments;
- change scientific interpretation;
- add new features;
- start a JOSS paper;
- add screenshots or slides;
- fix dependency vulnerabilities;
- add broad CI;
- modify backend or frontend behavior.

This is consolidation planning and final small-fix triage only.

---

## 13. Freeze criteria

Subgoal 09 can be frozen when:

1. The v0.8 state has been inspected.
2. Major v0.8 documents are discoverable.
3. Any stale README/docs-index/backlog issues are fixed or explicitly deferred.
4. Backend validation is run or explicitly deferred with reason.
5. Frontend build validation is run or explicitly deferred with reason.
6. The freeze/tag decision is recorded.
7. `git diff --check` passes.
8. The working tree is clean.
9. Changes are committed and pushed.

---

## 14. Suggested commit messages

For the design note:

```text
Add v0.8 consolidation planning design
```

For docs index/backlog cleanup:

```text
Update v0.8 docs for consolidation planning
```

For a final closeout note, if created:

```text
Add v0.8 handoff freeze note
```

---

## 15. Expected outcome

At the end of Subgoal 09, AWSRT should have a clear answer to whether v0.8 is ready for final freeze/tag.

If the answer is yes, Subgoal 10 should be a short, disciplined closeout and tag step.

If the answer is no, the remaining work should be explicitly scoped and separated from the handoff spine already completed.
