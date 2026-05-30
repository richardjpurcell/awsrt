# AWSRT JOSS and Community Readiness Review

**Project:** AWSRT — Adaptive Wildfire Sensing Research Tool  
**Version track:** v0.8  
**Subgoal:** v0.8-subgoal-06 — JOSS and community readiness review  
**Status:** Initial readiness review  
**Date:** 2026-05-30  

---

## 1. Purpose

This document reviews AWSRT from the perspective of an external technical reader, especially a potential Journal of Open Source Software (JOSS) reviewer or community user.

The review asks whether a reader can understand, install, run, test, cite, and evaluate AWSRT as research software without relying on private project history.

This is not a JOSS paper draft and not a submission package. It is a readiness review and triage note for AWSRT v0.8.

---

## 2. Review basis

The review inspected the following repository areas:

```text
README.md
docs/README.md
LICENSE
CITATION.cff
pyproject.toml
frontend/package.json
docs/install/local_install.md
docs/install/clean_machine_check.md
docs/reproducibility/minimal_first_run.md
docs/reproducibility/reproduce_v0_6.md
docs/development/backend_smoke_test.md
docs/development/frontend_build_check.md
docs/development/subgoal_freeze_checklist.md
```

Repository hygiene was also inspected for local system/cache artifacts such as `.DS_Store`, `__pycache__`, `.pytest_cache`, and `.next`.

---

## 3. Current readiness summary

AWSRT is substantially more handoff-ready than it was before v0.8.

The repository now has a coherent research-software entry path:

```text
README.md
docs/README.md
docs/install/local_install.md
docs/install/clean_machine_check.md
docs/reproducibility/minimal_first_run.md
docs/development/backend_smoke_test.md
docs/development/frontend_build_check.md
docs/development/subgoal_freeze_checklist.md
```

The strongest current readiness features are:

- clear research-instrument framing;
- explicit “what AWSRT is not” boundaries;
- local install path;
- backend startup path;
- backend health check;
- backend pytest workflow;
- frontend install/build/dev workflow;
- minimal first-run UI workflow;
- frozen v0.6 reproduction pointer;
- docs index and design-note audit trail.

The main remaining readiness gaps are:

- license metadata contains placeholder-style copyright text;
- citation metadata is stale relative to v0.8 and partly conflicts with the current “not a simulator” framing;
- the docs index development-workflow section appears to have lost or under-emphasized the freeze checklist and backend smoke workflow;
- README quickstart and v0.8 docs use slightly different frontend command styles;
- v0.6 reproduction docs still say “v0.7 documentation work”;
- repository hygiene shows many local `.DS_Store`, `__pycache__`, and `.pytest_cache` files in the working tree, although they are not tracked by Git;
- contribution/support/community governance is not yet defined;
- no JOSS paper skeleton exists, which is fine for v0.8 but should be tracked.

---

## 4. Strengths already in place

### 4.1 Research-instrument framing

The root README gives a strong and appropriate description of AWSRT as a research instrument for studying adaptive sensing, belief maintenance, impaired information flow, and usefulness under wildfire-like dynamic fields.

It also states that AWSRT is not an operational wildfire simulator and does not claim high-fidelity wildfire prediction.

This is a major strength for JOSS/community readability because it reduces the risk that reviewers or readers mistake the tool for an operational fire model.

### 4.2 Clear “what it is / what it is not” boundary

The README includes explicit sections for:

```text
What AWSRT is
What AWSRT is not
```

These sections are valuable and should be preserved.

The “what AWSRT is not” section is especially important for JOSS/community readers because the word “wildfire” can otherwise imply operational or physical-simulation claims.

### 4.3 Four-surface architecture is readable

The README describes:

```text
Physical Surface
Epistemic Surface
Operational Surface
Analysis Surface
```

This gives outside readers a conceptual map of the software.

The docs index also reinforces that the project has installation notes, reproducibility notes, development workflow guidance, and versioned design records.

### 4.4 Installation and startup are now documented

The local installation notes describe:

- Python/FastAPI backend;
- Next.js/React frontend;
- Python dependency installation through `pip install -e .`;
- frontend dependency installation;
- backend startup through `make backend`;
- frontend startup;
- data directory expectations.

The backend startup ambiguity identified earlier in v0.8 has been resolved by documenting:

```bash
make backend
```

and the expanded command:

```bash
PYTHONPATH=backend uvicorn api.main:app --reload --port 8000
```

### 4.5 Minimal first-run workflow exists

The minimal first-run workflow is a strong readiness asset.

It documents a concrete path:

```text
start backend
check /health
start frontend
open landing page
open Physical Surface
select Smoke test · small grid
generate Physical RUN
open Physical Visualizer
```

It also clearly states that the workflow is not v0.6 scientific reproduction.

### 4.6 Backend and frontend validation workflows exist

AWSRT now has parallel backend and frontend validation notes:

```text
docs/development/backend_smoke_test.md
docs/development/frontend_build_check.md
```

The backend workflow records:

```text
PYTHONPATH=backend python -c "from api.main import app; print(app.title, app.version)"
python -m pytest backend/tests
```

with observed result:

```text
18 passed
```

The frontend workflow records:

```text
npm --prefix frontend install
npm --prefix frontend run build
npm --prefix frontend run dev
```

with observed successful build and startup.

This is a strong foundation for future CI or reviewer inspection.

---

## 5. Gaps and risks

### 5.1 License metadata needs cleanup

The LICENSE file currently includes placeholder-style text:

```text
Copyright (c) [2026], [Adaptive Wildfire Sensing Research Tool]
```

For community/JOSS readiness, this should be replaced with a real copyright holder.

Recommended direction:

```text
Copyright (c) 2026, Richard Purcell
```

or, if institutional/legal guidance says otherwise, the appropriate rights holder.

This should be fixed before any public release or JOSS submission.

### 5.2 CITATION.cff is stale and partly misaligned

`CITATION.cff` currently lists:

```text
version: "v0.1"
date-released: "2026-04-05"
```

That is stale relative to the current v0.8 handoff track.

The abstract also says AWSRT supports “wildfire simulation and replay,” which may invite the exact misunderstanding the README now avoids. A better wording would emphasize wildfire-like dynamic fields, transformed fire artifacts, belief/uncertainty analysis, impaired sensing, and research instrumentation.

Recommended action:

- update citation metadata near the v0.8 freeze or release tag;
- change the abstract to match the current research-instrument framing;
- consider whether the version should remain v0.1 until v0.8 is tagged or be updated after the v0.8 release decision.

### 5.3 docs/README.md development workflow section needs repair

The docs index currently lists the frontend build workflow under “Development workflow,” but the backend smoke workflow and subgoal freeze checklist are not equally visible in that section.

Recommended action:

Under `## Development workflow`, include:

```text
development/subgoal_freeze_checklist.md
development/backend_smoke_test.md
development/frontend_build_check.md
```

The current state risks making the frontend workflow more discoverable than the actual freeze checklist and backend workflow.

### 5.4 README quickstart and install docs use different frontend command styles

The README quickstart uses:

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

The v0.8 validation docs often use root-level commands:

```bash
npm --prefix frontend install
npm --prefix frontend run build
npm --prefix frontend run dev
```

Both are valid, but the mixed style may confuse a new reader.

Recommended action:

Either:

1. keep both styles but explicitly say they are equivalent; or
2. standardize the README quickstart on root-level `npm --prefix frontend ...` commands to match the validation docs.

For handoff discipline, root-level commands are easier to copy/paste from the repository root.

### 5.5 v0.6 reproduction note has stale v0.7 status wording

`docs/reproducibility/reproduce_v0_6.md` still says:

```text
Draft reproduction pointer for AWSRT v0.7 documentation work.
```

This should be updated to v0.8 handoff/reproducibility wording.

This is a small documentation fix.

### 5.6 Repository hygiene has many local generated files

The working tree contains many local files matching:

```text
.DS_Store
__pycache__
.pytest_cache
```

These do not appear to be tracked by Git, which is good.

However, their presence suggests the project should ensure `.gitignore` covers:

```text
.DS_Store
__pycache__/
*.pyc
.pytest_cache/
frontend/.next/
```

Recommended action:

- inspect `.gitignore`;
- add missing ignore patterns if needed;
- optionally remove local generated files from the working tree using a safe cleanup command.

Do not delete data artifacts or result outputs casually.

### 5.7 Contribution/support expectations are not yet defined

For a future public/JOSS-style release, AWSRT may need some lightweight community-facing guidance:

```text
CONTRIBUTING.md
SUPPORT.md
CODE_OF_CONDUCT.md
```

This does not need to block v0.8, but it should be recorded as a future readiness item.

### 5.8 pyproject metadata is backend-only

The root `pyproject.toml` describes:

```text
name = "awsrt-backend"
```

This is honest for the Python backend, but AWSRT as a full research tool also includes a frontend and documentation workflows.

For JOSS, this is probably acceptable if README explains the full software structure clearly. But future packaging work may need to decide whether AWSRT is packaged as a backend package plus frontend app, or as a broader repository-level research software project.

---

## 6. Recommended small fixes for v0.8

These are low-risk and worth doing during v0.8.

### Fix 1 — Repair docs index development workflow section

Update `docs/README.md` so the development workflow section lists:

```text
development/subgoal_freeze_checklist.md
development/backend_smoke_test.md
development/frontend_build_check.md
```

### Fix 2 — Update stale v0.6 reproduction status wording

Change the status line in:

```text
docs/reproducibility/reproduce_v0_6.md
```

from v0.7 documentation work to v0.8 reproducible-handoff work.

### Fix 3 — Inspect and possibly update `.gitignore`

Check whether `.gitignore` covers local generated files:

```text
.DS_Store
__pycache__/
*.pyc
.pytest_cache/
frontend/.next/
```

If not, add those ignore rules.

### Fix 4 — Decide whether to update LICENSE holder text now

The placeholder-style license line is a community-readiness issue.

This should be fixed before any v0.8 release/tag intended for outside readers. The correct legal holder should be chosen deliberately.

### Fix 5 — Update CITATION.cff after v0.8 release decision

The citation file should be refreshed before a public-facing v0.8 release.

Potential updates:

- version;
- release date;
- abstract wording;
- keywords;
- possibly preferred citation title.

This may belong in a later release/consolidation subgoal rather than immediately.

---

## 7. Larger items to defer

The following are useful but should not block v0.8 unless they become necessary.

### CI

A lightweight CI workflow for backend tests and frontend build would be helpful, but v0.8 already has documented manual checks.

Defer unless the project needs GitHub-level automated validation before v0.8 freeze.

### Dependency remediation

Frontend npm audit warnings are recorded. Do not run forced dependency fixes casually.

Dependency remediation should be a deliberate maintenance subgoal.

### Community governance files

Files such as `CONTRIBUTING.md`, `SUPPORT.md`, and `CODE_OF_CONDUCT.md` may be useful later.

For now, the subgoal freeze checklist and development docs provide a local workflow.

### JOSS paper skeleton

Do not write the JOSS paper in this subgoal.

A later JOSS-specific subgoal can draft:

```text
paper.md
```

if and when submission becomes a real target.

### Screenshots / richer demo material

Screenshots could help committee and community readers, but they are not necessary for this readiness review.

This may overlap with a later committee-facing orientation subgoal.

---

## 8. JOSS-specific notes

Before a JOSS submission, AWSRT would likely need:

- a polished statement of need;
- a clear installation path;
- a clear example;
- visible tests;
- citation metadata;
- license metadata;
- a release/archive strategy;
- a concise paper that describes the software and its research use.

AWSRT has made strong progress on installation, example use, tests, and documentation.

The weaker points are currently:

- citation metadata freshness;
- license holder placeholder;
- contribution/support expectations;
- a formal JOSS paper;
- possibly repository-level packaging clarity.

None of these require changing the research code immediately.

---

## 9. Community-reader notes

For a community reader, the most important current entry path is:

```text
README.md
docs/README.md
docs/install/local_install.md
docs/reproducibility/minimal_first_run.md
docs/development/backend_smoke_test.md
docs/development/frontend_build_check.md
```

This path is now reasonably strong.

The biggest readability risk is not installation. It is interpretation. AWSRT must continue to avoid being read as an operational wildfire simulator or high-fidelity wildfire model.

The README already handles this well. Future docs should preserve that boundary.

---

## 10. Recommended next subgoal

After completing small fixes from this review, the strongest next subgoal is:

```text
v0.8-subgoal-07 — Committee-facing orientation
```

Rationale:

- v0.8 now has install, first-run, backend, and frontend checks.
- JOSS/community gaps have been identified.
- The next high-value handoff task is helping thesis committee readers understand how AWSRT supports the thesis without overclaiming operational wildfire realism.

A later subgoal can handle v0.8 consolidation and release/tag decisions.

---

## 11. Current conclusion

AWSRT is not yet JOSS-submission-ready in a formal sense, but it is much closer to community-inspectable research software.

The project now has a coherent handoff path and validation discipline.

The most important near-term fixes are documentation/metadata quality issues, not code changes.
