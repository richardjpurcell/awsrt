# AWSRT Frontend Build and Runtime Check

**Project:** AWSRT — Adaptive Wildfire Sensing Research Tool  
**Version track:** v0.8  
**Subgoal:** v0.8-subgoal-05 — Frontend build and runtime check discipline  
**Status:** Initial frontend validation workflow note  
**Date:** 2026-05-30  

---

## Purpose

This note documents a lightweight frontend build and runtime check workflow for AWSRT.

The goal is to provide a repeatable frontend confidence check for local development, subgoal freeze, and reproducible handoff. The workflow confirms that the frontend dependencies install, the Next.js production build passes, and the development server starts at the expected local URL.

This is a software health workflow. It is not a scientific reproduction workflow and does not reproduce the frozen v0.6 evidence state.

---

## Scope

This workflow checks:

- frontend package metadata;
- dependency installation;
- production build;
- route generation in the production build;
- development server startup;
- known warnings that should be recorded but not automatically fixed.

This workflow does not check:

- backend health;
- backend pytest behavior;
- full browser interaction;
- artifact creation;
- v0.6 result reproduction;
- npm dependency remediation;
- JOSS packaging completeness.

For backend checks, see:

```text
docs/development/backend_smoke_test.md
```

For the minimal first-run browser workflow, see:

```text
docs/reproducibility/minimal_first_run.md
```

---

## Frontend package metadata

The frontend package file is:

```text
frontend/package.json
```

Current package metadata includes:

```json
{
  "name": "awsrt-frontend",
  "private": true,
  "version": "0.1.0"
}
```

Current scripts include:

```text
dev     next dev -p 3000
build   next build
start   next start -p 3000
lint    next lint
```

Current core dependencies include:

```text
next 14.2.5
react 18.3.1
react-dom 18.3.1
typescript
```

The repository includes:

```text
frontend/package-lock.json
frontend/.env.local.example
```

---

## Tier 1 — Dependency installation

From the repository root, run:

```bash
npm --prefix frontend install
```

Observed result during v0.8 Subgoal 05:

```text
up to date, audited 29 packages in 2s
```

Observed warning:

```text
2 vulnerabilities (1 moderate, 1 critical)
```

npm suggested:

```bash
npm audit fix --force
```

This command was not run during Subgoal 05. Forced dependency updates can change dependency state and should be handled deliberately in a dependency-maintenance subgoal if needed.

---

## Tier 2 — Production build

From the repository root, run:

```bash
npm --prefix frontend run build
```

Observed result during v0.8 Subgoal 05:

```text
Compiled successfully
Linting and checking validity of types
Collecting page data
Generating static pages (14/14)
Collecting build traces
Finalizing page optimization
```

The build passed.

The Browserslist/caniuse-lite warning observed in an earlier v0.8 check was not observed during this Subgoal 05 build run.

---

## Production build route output

The production build reported the following application routes:

```text
/
 /_not-found
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

The important AWSRT research-surface routes are:

```text
/
/physical/designer
/physical/visualizer
/epistemic/designer
/epistemic/visualizer
/operational/designer
/operational/visualizer
/analysis/batch
/analysis/graphic
/analysis/raw
```

This route set supports the v0.8 handoff workflow by confirming that the four research surfaces and analysis pages are included in the production build.

---

## Tier 3 — Development server startup

From the repository root, run:

```bash
npm --prefix frontend run dev
```

Expected local URL:

```text
http://localhost:3000
```

Observed result during v0.8 Subgoal 05:

```text
PASS
```

The development server started successfully and was stopped manually with `Ctrl-C`.

---

## Recommended frontend validation sequence

For a normal frontend validation check, run:

```bash
npm --prefix frontend install
npm --prefix frontend run build
```

For runtime development-server confirmation, also run:

```bash
npm --prefix frontend run dev
```

Expected local URL:

```text
http://localhost:3000
```

Stop the development server with:

```text
Ctrl-C
```

---

## When to run this workflow

Run this workflow:

- before freezing frontend-touching subgoals;
- after editing files under `frontend/`;
- after changing frontend routes;
- after changing shared frontend API helpers;
- after changing package metadata or lockfiles;
- before frontend-related handoff claims;
- before adding CI around frontend build checks.

For docs-only changes, this workflow is optional unless the documentation claims frontend behavior.

For backend-only changes, this workflow is usually not required unless frontend behavior depends on the backend change.

---

## Relationship to other v0.8 documents

Related documents:

```text
docs/install/local_install.md
docs/install/clean_machine_check.md
docs/development/backend_smoke_test.md
docs/development/subgoal_freeze_checklist.md
docs/reproducibility/minimal_first_run.md
docs/reproducibility/reproduce_v0_6.md
```

This frontend build-check workflow complements the backend smoke-test workflow. Together they provide a lightweight validation pair for v0.8 handoff:

```text
backend: import + health + pytest
frontend: install + production build + dev startup
```

---

## Known limitations

This frontend validation workflow does not prove scientific correctness.

It does not validate all browser interactions, does not reproduce v0.6 results, and does not confirm all operational or analysis workflows.

Known unresolved observation:

```text
npm install reports 2 vulnerabilities:
- 1 moderate
- 1 critical
```

This note records the warning but does not fix it.

If dependency remediation is needed, it should be handled as a deliberate dependency-maintenance subgoal rather than by running `npm audit fix --force` opportunistically.

---

## Current conclusion

During v0.8 Subgoal 05:

```text
npm --prefix frontend install
```

completed successfully with dependency vulnerability warnings.

```text
npm --prefix frontend run build
```

passed successfully.

```text
npm --prefix frontend run dev
```

started successfully at the expected local development URL.

Therefore the current recommended frontend validation command is:

```bash
npm --prefix frontend run build
```

with `npm --prefix frontend install` used when dependencies need to be installed or refreshed, and `npm --prefix frontend run dev` used when runtime development-server confirmation is needed.
