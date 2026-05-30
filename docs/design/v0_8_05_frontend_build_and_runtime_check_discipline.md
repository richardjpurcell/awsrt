# AWSRT v0.8 Subgoal 05 — Frontend Build and Runtime Check Discipline

**Project:** AWSRT — Adaptive Wildfire Sensing Research Tool  
**Branch:** `v0.8-subgoal-05`  
**Design note:** `docs/design/v0_8_05_frontend_build_and_runtime_check_discipline.md`  
**Status:** Draft design note  
**Date:** 2026-05-30  

---

## 1. Purpose

This subgoal continues AWSRT v0.8 after the backend smoke-test workflow completed in Subgoal 04.

The v0.8 theme remains:

```text
From shareable repository to reproducible handoff.
```

Subgoal 02 verified local installation and startup commands.

Subgoal 03 documented a minimal first-run workflow.

Subgoal 04 documented backend import, health, and pytest smoke-test discipline.

Subgoal 05 should now make the frontend side of the handoff equally explicit.

The purpose is to define a lightweight frontend build and runtime check workflow that a developer, thesis committee reader, JOSS reviewer, or future maintainer can use to confirm that the AWSRT frontend installs, builds, starts, and exposes the expected research-surface routes.

This subgoal is about validation discipline and documentation. It should not become a frontend redesign or dependency-maintenance project unless inspection reveals a small blocking issue.

---

## 2. Relationship to previous v0.8 subgoals

### Subgoal 01

Subgoal 01 established the v0.8 roadmap and backlog:

```text
docs/design/v0_8_01_roadmap_and_backlog_triage.md
docs/backlog/v0_8_backlog.md
```

It identified reproducible handoff as the primary v0.8 direction.

### Subgoal 02

Subgoal 02 verified local installation and created:

```text
docs/install/clean_machine_check.md
```

It recorded that frontend install and production build passed, while noting npm audit warnings and a Browserslist/caniuse-lite warning.

### Subgoal 03

Subgoal 03 documented a minimal first-run workflow:

```text
docs/reproducibility/minimal_first_run.md
```

It verified frontend startup at:

```text
http://localhost:3000
```

and used the frontend to create and visualize a small Physical Surface smoke artifact.

### Subgoal 04

Subgoal 04 documented backend smoke-test workflow:

```text
docs/development/backend_smoke_test.md
```

It established a backend confidence path using import checks, `/health`, and `python -m pytest backend/tests`.

Subgoal 05 should now provide the parallel frontend confidence path.

---

## 3. Guiding question

The guiding question for this subgoal is:

> What is the narrowest reliable frontend check that gives confidence AWSRT can install, build, start, and expose the expected research-surface routes?

This should not become a broad UI test framework unless inspection shows that such infrastructure already exists and is easy to document.

---

## 4. Scope

### 4.1 In scope

This subgoal may include:

- inspecting `frontend/package.json`;
- confirming current frontend scripts;
- documenting frontend dependency installation;
- documenting production build validation;
- documenting development-server startup;
- documenting expected routes/pages;
- recording known warnings without fixing them;
- linking the frontend check workflow from the docs index and freeze checklist;
- making small documentation patches to improve discoverability.

### 4.2 Out of scope

This subgoal should not:

- redesign frontend pages;
- change frontend route structure;
- change UI behavior;
- fix npm audit warnings by force;
- upgrade Next.js or React;
- add broad Playwright/Cypress/browser-test infrastructure;
- change backend behavior;
- rerun v0.6 experiments;
- treat frontend smoke checks as scientific reproduction.

---

## 5. Working principle

The frontend check workflow should be:

```text
narrow
fast
documented
repeatable
low-risk
handoff-oriented
```

It should answer whether the frontend is installable, buildable, startable, and navigable.

It should not attempt to validate all UI semantics or all research workflows.

---

## 6. Candidate output file

The likely primary deliverable is:

```text
docs/development/frontend_build_check.md
```

Reason:

- this is a development and freeze-validation workflow;
- the local install docs already explain how to start the frontend;
- the minimal first-run workflow explains browser-side inspection;
- development docs are the right home for repeatable validation commands.

Possible supporting edits:

```text
docs/README.md
docs/development/subgoal_freeze_checklist.md
docs/install/clean_machine_check.md
```

These should be edited only if discoverability or cross-reference clarity requires it.

---

## 7. Candidate frontend checks

The exact workflow should be confirmed by inspection.

### 7.1 Dependency installation

Known command:

```bash
npm --prefix frontend install
```

This should install frontend dependencies from `frontend/package.json`.

If `package-lock.json` exists and is current, `npm ci` could be considered in the future, but this subgoal should document the workflow already in use unless inspection suggests otherwise.

### 7.2 Production build

Known command:

```bash
npm --prefix frontend run build
```

This should run the Next.js production build and catch TypeScript, routing, and build-time errors.

Subgoal 02 observed that this command passed, while reporting:

```text
Browserslist: caniuse-lite is outdated.
```

The warning did not block the build.

### 7.3 Development server

Known command:

```bash
npm --prefix frontend run dev
```

Expected local URL:

```text
http://localhost:3000
```

Subgoal 03 observed successful startup at this URL.

### 7.4 Route/page presence

The frontend currently exposes routes under:

```text
/
physical/designer
physical/visualizer
epistemic/designer
epistemic/visualizer
operational/designer
operational/visualizer
analysis/batch
analysis/graphic
analysis/raw
```

The frontend check workflow may document a lightweight route-presence expectation based on the production build output and manual page-load inspection.

This should remain manual unless a browser-test framework is deliberately introduced later.

---

## 8. Suggested inspection commands

Start by inspecting frontend package metadata and route files:

```bash
sed -n '1,220p' frontend/package.json
find frontend/app -maxdepth 3 -type f | sort
find frontend -maxdepth 2 -name 'package-lock.json' -o -name '.env*' -type f | sort
```

Then run the candidate validation commands:

```bash
npm --prefix frontend install
npm --prefix frontend run build
npm --prefix frontend run dev
```

Record:

- whether install completes;
- whether vulnerabilities are reported;
- whether production build passes;
- whether Browserslist/caniuse-lite warnings appear;
- whether the dev server starts;
- the local URL printed by Next.js.

---

## 9. Expected deliverables

Likely deliverables:

```text
docs/design/v0_8_05_frontend_build_and_runtime_check_discipline.md
docs/development/frontend_build_check.md
```

Possible supporting edits:

```text
docs/README.md
docs/development/subgoal_freeze_checklist.md
```

Subgoal 05 should remain documentation-first.

---

## 10. Validation expectations

At freeze, this subgoal should validate the documented frontend path.

Minimum validation:

```bash
git diff --check
npm --prefix frontend run build
npm --prefix frontend run dev
```

If dependency installation is part of the documented workflow, also run:

```bash
npm --prefix frontend install
```

If no frontend code files are changed, the build should still be run because the subgoal is specifically about frontend build/check discipline.

If backend files are not changed, backend pytest is not required.

---

## 11. Non-goals

Subgoal 05 should not:

- replace the minimal first-run workflow;
- introduce browser automation;
- upgrade frontend dependencies;
- run `npm audit fix --force`;
- modify UI layout;
- alter research-surface terminology;
- create new experimental results.

This is a frontend confidence workflow, not frontend feature work.

---

## 12. Freeze criteria

Subgoal 05 can be frozen when:

1. The frontend build/check workflow is documented.
2. The documented install/build/dev commands have been inspected or tested.
3. Known warnings are recorded without overclaiming.
4. The workflow distinguishes frontend validation from scientific reproduction.
5. Documentation entry points link to the workflow.
6. `git diff --check` passes.
7. `npm --prefix frontend run build` passes.
8. The working tree is clean.
9. Changes are committed and pushed.

---

## 13. Suggested commit messages

For the design note:

```text
Add frontend build-check workflow design
```

For the workflow documentation:

```text
Add frontend build-check workflow documentation
```

For docs-index alignment:

```text
Update docs index for frontend build-check workflow
```

---

## 14. Expected outcome

At the end of Subgoal 05, AWSRT should have a clear frontend validation workflow comparable to the backend smoke-test workflow.

This should strengthen v0.8 reproducible-handoff discipline before moving into JOSS/community readiness and committee-facing orientation.
