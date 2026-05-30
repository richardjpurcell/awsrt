# v0.9-subgoal-02 — Operational Visualizer View-Window Stabilization

## Version context

AWSRT v0.8 has been merged, pushed, frozen, and tagged. The v0.8 release track moved AWSRT from a working research repository toward a reproducible handoff state. It did not reopen the frozen v0.6 experiments or alter the thesis evidence state.

The current development track is v0.9.

Working theme:

> From reproducible handoff to interpretable inspection.

Alternate thesis-facing wording:

> From reproducible handoff to epistemic and operational inspectability.

v0.9-subgoal-01 introduced a controlled single-window view into the Operational Visualizer. It borrowed the useful view-window pattern from the Physical Visualizer while preserving the Operational Visualizer's single-run, display-only role.

This subgoal is a short stabilization and documentation pass after that implementation.

## Subgoal name

`v0.9-subgoal-02`

## Branch

`v0.9-subgoal-02`

## Design note path

`docs/design/v0_9_02_operational_visualizer_view_window_stabilization.md`

## Purpose

Stabilize and document the Operational Visualizer view-window controls added in v0.9-subgoal-01.

The purpose is not to add a new visualization feature. The purpose is to confirm that the new single controlled viewport is understandable, mechanically stable, and consistent with the v0.9 theme of interpretable inspection.

## Relationship to v0.9-subgoal-01

v0.9-subgoal-01 added a single controlled operational map viewport with:

- Fit control;
- Reset control;
- zoom-in and zoom-out buttons;
- scroll-to-zoom behavior;
- drag-to-pan behavior;
- controlled viewport/stage structure;
- preserved deployment image, fire-front overlay, and sensor-trail overlay alignment.

v0.9-subgoal-02 should treat that implementation as the object of inspection and stabilization.

## Scope

This is a stabilization and documentation pass.

In scope:

- inspect the implemented Operational Visualizer viewport block;
- inspect shared/global CSS used by the viewport and stage classes;
- confirm that the controls are visible and understandable;
- confirm that the map viewport remains single-window and display-only;
- add a short design/stabilization note;
- make only very small frontend polish changes if inspection reveals an obvious readability issue.

Out of scope:

- new operational logic;
- new policy logic;
- new backend endpoints;
- new artifact formats;
- new experiment runs;
- changes to v0.6 scientific interpretation;
- epistemic-surface redesign;
- broad frontend redesign.

## Project framing constraints

AWSRT is a research instrument for studying adaptive sensing, belief maintenance, impaired information flow, and usefulness under wildfire-like dynamic fields.

AWSRT is not:

- an operational wildfire simulator;
- a high-fidelity physical wildfire simulator;
- a physical twin or digital twin;
- a decision-support tool for real wildfire operations.

v0.6 remains the frozen evidence/result state. v0.9 improves interpretability and inspectability without reopening v0.6 experiments by default.

## Stabilization questions

During inspection, answer:

1. Are the new controls visible where a user would expect them?
2. Is the instruction text concise enough for committee/demo use?
3. Does Fit return the full operational map to a readable centered view?
4. Does Reset return to native-scale inspection without breaking the viewport?
5. Do zoom and pan behave predictably?
6. Does the fire-front overlay remain aligned with the deployment image?
7. Do sensor trails remain aligned with the deployment image?
8. Does PlayBar frame advancement preserve the display behavior?
9. Are metric and diagnostic sections unchanged?
10. Is the implementation still display-only?

## Manual smoke-check checklist

Manual checks should confirm:

- an operational run loads;
- the deployment image appears;
- Fit recenters and fits the full operational map;
- Reset returns to native-scale inspection;
- + and – zoom around the viewport center;
- scroll zooms around the cursor;
- drag pans the map;
- fire-front overlay remains aligned;
- sensor trails remain aligned;
- PlayBar frame changes preserve display behavior;
- metric and diagnostic sections remain unchanged;
- no backend state or artifact semantics are changed.

## Suggested inspection commands

Inspect the implemented viewport region:

```bash
sed -n '1300,1385p' frontend/app/operational/visualizer/page.tsx
```

Confirm control and viewport hooks:

```bash
grep -n "Scroll to zoom\|Fit\|Reset\|viewer-viewport\|viewer-stage" \
  frontend/app/operational/visualizer/page.tsx
```

Inspect the global CSS classes used by the Physical and Operational Visualizers:

```bash
grep -n "viewer-viewport\|viewer-stage\|imgbox" frontend/app/globals.css
sed -n '1,220p' frontend/app/globals.css
```

## Expected outcome

A small, clean stabilization subgoal that confirms the Operational Visualizer view-window update is usable and documented.

The expected output is either:

1. this design/stabilization note only; or
2. this note plus a very small frontend polish patch if inspection reveals an obvious issue.

## Validation expectations

Because this subgoal is frontend-facing, validation should include:

```bash
npm --prefix frontend run build
git diff --check
git status
```

If backend files are touched unexpectedly, also run:

```bash
PYTHONPATH=backend python -c "from api.main import app; print(app.title, app.version)"
python -m pytest backend/tests
```

## Freeze criteria

Before closing this subgoal:

- the working tree should be clean;
- frontend build should pass if frontend files changed;
- `git diff --check` should pass;
- any commit should be pushed with the full branch ref:

```bash
git push origin HEAD:refs/heads/v0.9-subgoal-02
```

## Notes for future v0.9 work

This subgoal should close the immediate Operational Visualizer view-window stabilization loop.

A later v0.9 subgoal may move toward the Epistemic Surface / Epistemic Visualizer focus probe, but this subgoal should not begin that redesign.
