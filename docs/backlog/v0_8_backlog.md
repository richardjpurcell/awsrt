# AWSRT v0.8 Backlog — Reproducible Handoff

**Project:** AWSRT — Adaptive Wildfire Sensing Research Tool  
**Version track:** v0.8  
**Theme:** From shareable repository to reproducible handoff  
**Status:** Active backlog  
**Created:** 2026-05-27

---

## Purpose

This backlog captures candidate work for AWSRT v0.8 after the frozen v0.7 closeout.

v0.8 should improve AWSRT as a handoff-ready research instrument for:

1. thesis committee readability;
2. JOSS/community inspection;
3. clean-machine reproducibility.

This file is not a commitment to implement every item in v0.8. It is a triage surface for deciding what should be done now, what should be deferred, and what should remain explicitly out of scope.

---

## Scope rule

v0.8 should support reproducible handoff.

It should not reopen the frozen v0.6 evidence state unless a later subgoal explicitly designs that work.

Default non-goals:

- do not rerun v0.6 experiments;
- do not alter v0.6 scientific interpretations;
- do not change operational policy logic;
- do not change impairment semantics;
- do not rename backend schema fields casually;
- do not reframe AWSRT as an operational wildfire simulator;
- do not reframe AWSRT as a physical twin or digital twin.

---

## Priority 1 — Core v0.8 handoff path

These items are the strongest candidates for the main v0.8 sequence.

### Clean-machine installation verification

Goal: confirm that a technically capable new user can clone, install, and start AWSRT from documented instructions.

Likely outputs:

- verify `docs/install/local_install.md`;
- add `docs/install/clean_machine_check.md` if useful;
- document Python and Node assumptions;
- record a minimal known-good command sequence;
- capture setup assumptions that currently live only in memory.

Validation:

- backend starts;
- frontend starts or builds;
- documented commands match observed behavior.

---

### Minimal first-run workflow

Goal: provide a concise first-run path that demonstrates AWSRT as a research tool without requiring prior chat history.

Likely output:

- `docs/reproducibility/minimal_first_run.md`

The workflow should show:

- how to start the backend;
- how to start the frontend;
- what page or endpoint to inspect;
- what a successful first run looks like;
- where v0.6 reproducibility documentation lives.

---

### Backend smoke-test workflow

Goal: define a lightweight backend confidence check for handoff.

Likely outputs:

- documented backend startup command;
- documented health endpoint or smoke command;
- targeted test command if one already exists or can be added safely.

Preferred approach:

- inspect existing backend tests before adding new infrastructure;
- prefer a narrow smoke check over a fragile full-suite requirement.

---

### Frontend build verification

Goal: preserve the v0.7 frontend production-build hardening.

Required check after frontend changes:

```bash
npm --prefix frontend run build