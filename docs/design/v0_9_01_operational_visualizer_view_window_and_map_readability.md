# v0.9-subgoal-01 — Operational Visualizer View-Window and Map Readability Pass

## Version context

AWSRT v0.8 has been merged, pushed, frozen, and tagged. The v0.8 release track moved AWSRT from a working research repository toward a reproducible handoff state. It did not reopen the frozen v0.6 experiments or alter the thesis evidence state.

The next development track is v0.9.

Working theme:

> From reproducible handoff to interpretable inspection.

Alternate thesis-facing wording:

> From reproducible handoff to epistemic and operational inspectability.

This subgoal begins the v0.9 track by improving the readability and inspectability of the Operational Visualizer.

## Subgoal name

`v0.9-subgoal-01`

## Branch

`v0.9-subgoal-01`

## Design note path

`docs/design/v0_9_01_operational_visualizer_view_window_and_map_readability.md`

## Immediate purpose

Improve the Operational Visualizer’s map readability by inspecting and selectively borrowing useful sizing, layout, and view-window ideas from the Physical Visualizer.

The goal is not to make the Operational Visualizer identical to the Physical Visualizer. The Physical Visualizer supports two windows for comparison. The Operational Visualizer likely only needs one controlled view window, because its role is to inspect a single operational run or playback state rather than compare two physical substrates side by side.

This subgoal is therefore a focused display/readability pass, not a scientific or policy change.

## Project framing constraints

AWSRT is a research instrument for studying adaptive sensing, belief maintenance, impaired information flow, and usefulness under wildfire-like dynamic fields.

AWSRT is not:

- an operational wildfire simulator;
- a high-fidelity physical wildfire simulator;
- a physical twin or digital twin;
- a decision-support tool for real wildfire operations.

v0.6 remains the frozen evidence/result state. v0.9 should improve interpretability and inspectability without reopening v0.6 experiments by default.

## Motivation

The Physical Visualizer already appears to contain useful affordances for map sizing, view-window control, and visual feedback. These affordances make large spatial artifacts easier to inspect and present.

The Operational Visualizer currently lags behind the Physical Visualizer in map readability and view-window usability. This matters for committee-facing walkthroughs, demos, and internal debugging because operational traces, sensor movement, contact, and fire-state overlays need to be legible without requiring the viewer to mentally compensate for poor canvas sizing or awkward framing.

## Intended design direction

Inspect first, patch second.

The initial investigation should compare:

1. How the Physical Visualizer sizes and frames maps.
2. How the Physical Visualizer manages one or more view windows.
3. How the Physical Visualizer communicates viewport, scale, or map extent to the user.
4. How the Operational Visualizer currently sizes and frames its map/canvas.
5. Whether any shared map, image, canvas, or visualizer utilities are already available.
6. The smallest additive change that gives the Operational Visualizer a controlled, readable, single-window map view.

## Expected Operational Visualizer behavior

The preferred outcome is a single controlled operational view window with improved readability.

Possible improvements to evaluate during inspection include:

- fixed or bounded map display dimensions;
- viewport/window controls borrowed from the Physical Visualizer where appropriate;
- better canvas aspect-ratio handling;
- clearer map extent or crop behavior;
- improved scale/readability for sensors, trails, fire overlays, and operational feedback;
- layout changes that make the map panel easier to use during demos;
- small visual feedback controls that help the user understand what part of the operational artifact is being inspected.

These should be treated as candidate ideas, not pre-approved implementation requirements.

## Strict non-goals

Do not change:

- operational policy logic;
- impairment semantics;
- backend schema fields casually;
- v0.6 experiments;
- v0.6 scientific interpretation;
- epistemic-surface design;
- physical-surface semantics;
- AWSRT’s research-instrument framing.

Do not:

- rerun v0.6 experiments;
- convert AWSRT into an operational wildfire simulator;
- combine this with the Epistemic Surface redesign;
- perform broad UI redesign outside the Operational Visualizer readability/view-window issue.

## Initial inspection targets

Primary files:

- `frontend/app/physical/visualizer/page.tsx`
- `frontend/app/operational/visualizer/page.tsx`

Likely shared-code search areas:

- `frontend/app/**/visualizer/**`
- `frontend/components/**`
- `frontend/lib/**`
- `frontend/app/**/components/**`
- any shared canvas, map, image, viewport, or sizing utilities

## Suggested inspection questions

### Physical Visualizer

- Where are the physical map/canvas dimensions calculated?
- Are there explicit view-window controls?
- Are there two independent view windows, or one shared view-window abstraction used twice?
- Is aspect-ratio preservation handled explicitly?
- Are canvas dimensions tied to artifact dimensions, CSS bounds, or user controls?
- Which parts are comparison-specific and should not be copied?
- Which parts are generic map-readability affordances and could be adapted?

### Operational Visualizer

- Where is the operational canvas or map rendered?
- Is there a current concept of viewport, crop, zoom, or window?
- How are sensors, sensor trails, fire overlays, belief/entropy overlays, and operational feedback positioned?
- Are coordinates rendered in artifact space, display space, or a mixed convention?
- What currently limits readability?
- What is the smallest safe display-only change?

### Shared utilities/components

- Is there an existing map/canvas utility that can be reused?
- Are physical and operational visualizers duplicating similar logic?
- Is a small local helper preferable to a broad shared abstraction for this subgoal?
- Would a shared abstraction be premature at v0.9-subgoal-01?

## Development discipline

Use the established AWSRT subgoal pattern:

1. Start from clean `main`.
2. Pull `main`.
3. Create `v0.9-subgoal-01`.
4. Add this design note.
5. Commit and push the branch.
6. Inspect relevant files before patching.
7. Propose focused git-style diffs.
8. Make small additive changes.
9. Validate.
10. Push branch.
11. Merge to `main` when subgoal is complete.
12. Do not tag until final v0.9 freeze.

## Validation expectations

Because this subgoal is expected to touch frontend code, validation should include at minimum:

```bash
git diff --check
npm --prefix frontend run build
```

If backend files are touched unexpectedly, also run:

```bash
PYTHONPATH=backend python -c "from api.main import app; print(app.title, app.version)"
python -m pytest backend/tests
```

Before any subgoal freeze:

```bash
git status
```

The working tree should be clean before merge/freeze.

## First implementation rule

Do not implement code until the Physical Visualizer and Operational Visualizer have been inspected and the minimal patch direction is clear.

## Initial terminal inspection commands

After creating and pushing the branch, begin with read-only inspection:

```bash
sed -n '1,260p' frontend/app/physical/visualizer/page.tsx
sed -n '260,620p' frontend/app/physical/visualizer/page.tsx
sed -n '620,1040p' frontend/app/physical/visualizer/page.tsx
```

```bash
sed -n '1,260p' frontend/app/operational/visualizer/page.tsx
sed -n '260,620p' frontend/app/operational/visualizer/page.tsx
sed -n '620,1040p' frontend/app/operational/visualizer/page.tsx
```

Then search for shared visualizer/map/canvas utilities:

```bash
find frontend -type f \
  \( -name '*.tsx' -o -name '*.ts' -o -name '*.css' \) \
  | grep -Ei 'visualizer|canvas|map|viewport|image|sizing|surface'
```

```bash
grep -R "canvas\|Canvas\|viewport\|viewWindow\|view window\|window\|zoom\|scale\|map" \
  frontend/app frontend/components frontend/lib \
  --include='*.tsx' --include='*.ts' --include='*.css' \
  | head -n 200
```

## Expected first deliverable after inspection

A short diagnosis identifying:

1. Physical Visualizer affordances worth borrowing.
2. Physical Visualizer affordances that are comparison-specific and should not be copied.
3. Operational Visualizer readability bottlenecks.
4. The smallest proposed display-only patch.
5. Validation commands for the patch.

