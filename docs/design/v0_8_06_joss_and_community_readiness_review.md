# AWSRT v0.8 Subgoal 06 — JOSS and Community Readiness Review

**Project:** AWSRT — Adaptive Wildfire Sensing Research Tool  
**Branch:** `v0.8-subgoal-06`  
**Design note:** `docs/design/v0_8_06_joss_and_community_readiness_review.md`  
**Status:** Draft design note  
**Date:** 2026-05-30  

---

## 1. Purpose

This subgoal continues AWSRT v0.8 after the frontend build/check workflow completed in Subgoal 05.

The v0.8 theme remains:

```text
From shareable repository to reproducible handoff.
```

Subgoals 01–05 established the v0.8 handoff foundation:

- roadmap and backlog triage;
- clean-machine installation verification;
- minimal first-run workflow;
- backend smoke-test workflow;
- frontend build/runtime check workflow.

Subgoal 06 should now review AWSRT from the perspective of an external technical reader, especially a potential JOSS reviewer or community user.

The purpose is not to submit to JOSS immediately. The purpose is to identify what is already ready, what is incomplete, and what small documentation or repository improvements would make AWSRT easier to inspect as research software.

---

## 2. External-readiness framing

AWSRT should be reviewed as research software.

The intended community-facing framing is:

```text
AWSRT is a research instrument for studying adaptive sensing, belief maintenance,
impaired information flow, and usefulness under wildfire-like dynamic fields.
```

AWSRT should not be framed as:

- an operational wildfire simulator;
- a high-fidelity physical wildfire simulator;
- a physical twin or digital twin;
- a universal adaptive-sensing controller;
- a general wildfire prediction system.

The JOSS/community review should reinforce this boundary.

---

## 3. Relationship to previous v0.8 subgoals

### Subgoal 01

Created:

```text
docs/design/v0_8_01_roadmap_and_backlog_triage.md
docs/backlog/v0_8_backlog.md
```

Established the v0.8 theme and preserved future backlog threads.

### Subgoal 02

Created and updated:

```text
docs/design/v0_8_02_clean_machine_install_verification.md
docs/install/local_install.md
docs/install/clean_machine_check.md
README.md
docs/README.md
```

Verified the local install/startup path.

### Subgoal 03

Created:

```text
docs/design/v0_8_03_minimal_reproducible_first_run_workflow.md
docs/reproducibility/minimal_first_run.md
```

Verified a small Physical Surface smoke artifact workflow.

### Subgoal 04

Created:

```text
docs/design/v0_8_04_backend_smoke_test_workflow.md
docs/development/backend_smoke_test.md
```

Verified backend import, health, and pytest workflow.

### Subgoal 05

Created:

```text
docs/design/v0_8_05_frontend_build_and_runtime_check_discipline.md
docs/development/frontend_build_check.md
```

Verified frontend install/build/dev-server workflow.

Subgoal 06 should now use these as evidence for a broader repository-readiness review.

---

## 4. Guiding question

The guiding question for this subgoal is:

> If an outside technical reviewer arrived at the AWSRT repository today, could they understand what the software is, install it, run it, test it, cite it, and understand its research scope without private project history?

This should be answered by inspection, not assumption.

---

## 5. JOSS/community readiness dimensions

This subgoal should review the repository against the following dimensions.

### 5.1 Statement of need / research need

Check whether the repository clearly explains:

- what problem AWSRT addresses;
- who the target audience is;
- why the software is needed;
- how it relates to existing work;
- what research gap it fills.

For AWSRT, the likely statement of need is not “wildfire simulation.” It is the need for a controlled research instrument that makes timing, delivery, belief quality, and usefulness-state behavior separable under impaired adaptive sensing.

### 5.2 Installation

Check whether a new technical reader can find and follow:

```text
docs/install/local_install.md
docs/install/clean_machine_check.md
```

Questions:

- Are Python and Node expectations clear enough?
- Is the backend startup command unambiguous?
- Is the frontend startup/build path clear?
- Are known warnings documented without panic or concealment?

### 5.3 Example usage

Check whether there is a minimal example path:

```text
docs/reproducibility/minimal_first_run.md
```

Questions:

- Does the workflow start from repository root?
- Does it identify success conditions?
- Does it avoid overclaiming scientific reproduction?
- Does it show a concrete small artifact workflow?

### 5.4 Tests and validation

Check whether the repository documents:

```text
docs/development/backend_smoke_test.md
docs/development/frontend_build_check.md
docs/development/subgoal_freeze_checklist.md
```

Questions:

- Is the backend test command clear?
- Is the frontend build command clear?
- Are warnings documented?
- Is the difference between software smoke tests and scientific validation clear?

### 5.5 Documentation map

Check:

```text
README.md
docs/README.md
```

Questions:

- Can a reader find install docs?
- Can they find first-run docs?
- Can they find reproducibility docs?
- Can they find development checks?
- Can they find design notes without being overwhelmed?

### 5.6 Citation and license

Check:

```text
LICENSE
CITATION.cff
```

Questions:

- Is the license visible?
- Is citation metadata present?
- Does the README point to citation information?
- Do citation details match the intended software identity?
- Is a release/tag strategy needed before any JOSS submission?

### 5.7 Repository hygiene

Check for issues such as:

- committed cache files;
- `.DS_Store` files;
- generated build artifacts;
- accidental local data artifacts;
- stale docs;
- ambiguous version state;
- branch/tag confusion.

This review should inspect, not immediately delete or rewrite. Any cleanup should be proposed deliberately.

### 5.8 Community expectations

Check whether the repository needs:

- contribution guidance;
- issue/support guidance;
- code of conduct;
- development workflow notes;
- clearer support limitations.

Do not overbuild governance for v0.8. The review should identify gaps and recommend what is necessary versus optional.

---

## 6. Proposed output file

The likely primary deliverable is:

```text
docs/development/joss_community_readiness_review.md
```

This file should be a structured review, not a design note.

Recommended sections:

```text
1. Purpose
2. Review basis
3. Current readiness summary
4. Strengths already in place
5. Gaps / risks
6. Recommended small fixes for v0.8
7. Larger items to defer
8. JOSS-specific notes
9. Community-reader notes
10. Recommended next subgoal
```

Possible supporting edits:

```text
README.md
docs/README.md
CITATION.cff
docs/development/subgoal_freeze_checklist.md
```

These should be edited only if inspection reveals small, high-value gaps.

---

## 7. Suggested inspection commands

Start by inspecting top-level repository metadata and docs:

```bash
sed -n '1,260p' README.md
sed -n '1,220p' docs/README.md
sed -n '1,220p' LICENSE
sed -n '1,220p' CITATION.cff
sed -n '1,220p' pyproject.toml
sed -n '1,220p' frontend/package.json
```

Inspect v0.8 handoff docs:

```bash
sed -n '1,220p' docs/install/local_install.md
sed -n '1,220p' docs/install/clean_machine_check.md
sed -n '1,220p' docs/reproducibility/minimal_first_run.md
sed -n '1,220p' docs/reproducibility/reproduce_v0_6.md
sed -n '1,220p' docs/development/backend_smoke_test.md
sed -n '1,220p' docs/development/frontend_build_check.md
sed -n '1,220p' docs/development/subgoal_freeze_checklist.md
```

Inspect repository hygiene:

```bash
find . -name '.DS_Store' -o -path '*/__pycache__/*' -o -path '*/.pytest_cache/*' | sort
git ls-files | grep -E '(^|/)(\.DS_Store|__pycache__|\.pytest_cache|\.next)(/|$)' || true
git status
```

Inspect available top-level files:

```bash
find . -maxdepth 2 -type f | sort | sed -n '1,240p'
```

---

## 8. Review method

The review should classify findings into four categories.

### 8.1 Ready / adequate for v0.8

Items that already support community/JOSS-style inspection.

### 8.2 Small fix recommended in v0.8

Items that are low-risk and improve handoff/readability.

Examples:

- README pointer improvements;
- citation wording;
- docs index cleanup;
- stale wording;
- clearer statement of need;
- repository hygiene notes.

### 8.3 Defer

Items that matter but should not block v0.8.

Examples:

- full CI;
- dependency upgrade/audit remediation;
- contributor governance;
- richer examples;
- screenshots;
- frontend UI polish.

### 8.4 Out of scope

Items that should not be pulled into v0.8 unless separately designed.

Examples:

- new experiments;
- operational wildfire claims;
- physical twin/digital twin claims;
- broad frontend redesign;
- changing schema semantics;
- rerunning v0.6 evidence.

---

## 9. Expected deliverables

Likely deliverables:

```text
docs/design/v0_8_06_joss_and_community_readiness_review.md
docs/development/joss_community_readiness_review.md
```

Possible supporting edits:

```text
README.md
docs/README.md
CITATION.cff
.gitignore
```

Supporting edits should remain small and evidence-based.

---

## 10. Validation expectations

At freeze, this subgoal should run:

```bash
git diff --check
git status
```

If any frontend files are touched:

```bash
npm --prefix frontend run build
```

If any backend files are touched:

```bash
python -m pytest backend/tests
```

If only docs and metadata are touched, frontend/backend validation is optional unless the edited docs make new behavior claims.

---

## 11. Non-goals

Subgoal 06 should not:

- prepare a full JOSS paper;
- submit to JOSS;
- add broad CI;
- fix all dependency warnings;
- redesign the README from scratch unless clearly necessary;
- change code behavior;
- rerun experiments;
- create new scientific claims.

This is a readiness review and small-gap triage subgoal.

---

## 12. Freeze criteria

Subgoal 06 can be frozen when:

1. A JOSS/community readiness review document exists.
2. The review identifies current strengths and gaps.
3. The review distinguishes small v0.8 fixes from deferred items.
4. AWSRT’s research-instrument boundary is preserved.
5. Any small documentation/metadata fixes are committed.
6. `git diff --check` passes.
7. The working tree is clean.
8. Changes are committed and pushed.

---

## 13. Suggested commit messages

For the design note:

```text
Add JOSS/community readiness review design
```

For the review document:

```text
Add JOSS/community readiness review
```

For small fixes:

```text
Update repository metadata for community readiness
```

or a more specific message depending on the change.

---

## 14. Expected outcome

At the end of Subgoal 06, AWSRT should have a concrete, evidence-based view of its community/JOSS readiness.

The result should guide whether v0.8 should next focus on:

- small metadata/documentation fixes;
- committee-facing orientation;
- optional CI;
- optional dependency-maintenance;
- or v0.8 consolidation and freeze.
