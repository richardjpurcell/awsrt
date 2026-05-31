# v0.9-subgoal-06 — Epistemic Visualizer Thesis-Style Panel Simplification

## Version context

AWSRT v0.8 remains the frozen handoff-ready baseline. v0.9 is the interpretability / inspectability track.

Completed so far in v0.9:

- v0.9-subgoal-01: Operational Visualizer view-window and map-readability controls.
- v0.9-subgoal-02: Operational Visualizer view-window stabilization note.
- v0.9-subgoal-03: Epistemic Surface inspectability probe.
- v0.9-subgoal-04: Built-in Epistemic Support Geometry Presets.
- v0.9-subgoal-05: Epistemic Support Geometry Smoke Check and Visual Readability Review.

The v0.9-subgoal-05 smoke review showed that the new support geometries work and are visually meaningful. The remaining bottleneck is the Epistemic Visualizer presentation: the main visual panels are too low on the page, and too many text-heavy cards and diagnostic plots appear before the user reaches the core belief/uncertainty story.

## Subgoal name

`v0.9-subgoal-06`

## Branch

`v0.9-subgoal-06`

## Design note path

`docs/design/v0_9_06_epistemic_visualizer_thesis_style_panel_simplification.md`

## Immediate purpose

Simplify the Epistemic Visualizer presentation so the page foregrounds the thesis-style epistemic story:

1. what belief currently says;
2. where uncertainty is high or low;
3. where uncertainty just changed;
4. where sensing support was prescribed;
5. what actually arrived over that support.

The goal is not to redesign the Epistemic Surface or change backend semantics. The goal is to make the existing visual information easier to inspect and explain.

## Motivation

The current Epistemic Visualizer contains useful information, but the presentation order is not yet aligned with the interpretive task.

Current issues:

- too many text-heavy cards appear before the image panels;
- diagnostic plots appear before the main visual panels;
- the visual panels are visually and conceptually the most important part of the page, but appear too low;
- several plots are flat or repetitive in clean smoke-test cases;
- the useful delivered-information plot is currently the only plot that consistently adds visual interest in these cases;
- the page feels more like a diagnostic dashboard than a clear thesis-style explanatory panel.

The support geometries added in v0.9-subgoal-04 now give the visualizer better stories to show. The visualizer should be rearranged so those stories are visible immediately.

## Core framing

The Epistemic Visualizer should help users inspect how prescribed support and realized arrivals shape belief and uncertainty.

This remains a research-instrument visualization.

It should not be framed as:

- operational wildfire prediction;
- real-world sensor fleet planning;
- a digital twin;
- a physical simulation dashboard.

It should be framed as:

- belief/uncertainty inspection;
- support/arrival inspection;
- epistemic storytelling under controlled support and impairment conditions.

## Desired page story

The first visible story should be visual, not textual.

Preferred top-level interpretive path:

```text
Selected run and playback controls
→ compact current-frame summary
→ main visual panel group
→ useful delivered-information plot
→ secondary diagnostics / advanced plots
```

The main visual panel group should roughly follow the thesis-style logic:

```text
Belief field
Uncertainty / entropy field
Entropy-change field
Prescribed support mask
Arrivals over prescribed support
```

This is not necessarily a literal four-panel figure, but the page should make that relationship immediately visible.

## Proposed layout direction

### 1. Keep the run selector and playback controls at the top

Retain:

- Belief Lab run selector;
- grid/time metadata;
- PlayBar controls;
- loop toggle;
- temporal trail controls if still useful;
- residual driver selector if still needed.

These are functional controls and should stay near the top.

### 2. Compress the opening explanation

The current explanatory prose is useful but too large.

Replace or collapse large text cards into a smaller summary such as:

```text
Use this page to inspect how prescribed support and realized arrivals shape belief, uncertainty, and entropy-change diagnostics.
```

Detailed interpretation text can move into a `<details>` block or below the main panels.

### 3. Move the visual panels immediately after the controls

The visual panels should appear before the large diagnostic plot block.

Priority panels:

1. Belief field
2. Entropy / uncertainty field
3. Entropy-change field
4. Prescribed support mask
5. Arrivals over prescribed support

Possible arrangement:

- first row: belief, entropy, entropy change, support;
- second row: arrivals over support plus optional compact current-frame summary;
- or a responsive grid where the five tiles appear before any plots.

### 4. Demote most plots below the visual panels

Plots should be interpreted as secondary diagnostics.

Default visible plot priority:

1. Useful delivered information / arrived information proxy.
2. Mean entropy plot.
3. Arrival fraction plot.
4. Decrease diagnostic.
5. Residual diagnostic.

The useful delivered-information plot can remain visible by default because the smoke review found it visually meaningful. Other plots may be moved below, grouped, or made collapsible.

### 5. Reduce or collapse text-heavy cards

Cards such as “Current frame summary” and “How to read this run” are useful, but they should not dominate the first screen.

Possible treatment:

- keep a compact current-frame summary inline;
- move “How to read this run” into a collapsible section below the panels;
- reduce repeated explanatory text under plots;
- keep the language available, but do not put it before the central visual story.

## Functional non-goals

Do not change:

- backend support geometry generation;
- belief update semantics;
- impairment semantics;
- entropy computation;
- MDC residual semantics;
- image endpoint names;
- v0.6 frozen experiments;
- v0.6 scientific interpretation.

Do not add in this subgoal:

- blurred/cloud rendering;
- new support geometries;
- uploaded custom mask workflows;
- new backend metrics;
- broad UI redesign across other surfaces.

## Visual non-goals

Do not attempt to make the visualizer beautiful at the expense of interpretability.

Do not remove advanced diagnostics entirely. They may be demoted or collapsed, but should remain accessible.

Do not hide uncertainty or residual information in a way that weakens the research-instrument framing.

## Likely implementation target

Primary file:

- `frontend/app/epistemic/visualizer/page.tsx`

Likely no backend changes.

Possible supporting files only if needed:

- `frontend/app/globals.css`
- `docs/design/v0_9_06_epistemic_visualizer_thesis_style_panel_simplification.md`

## Inspection targets before patching

Inspect current visualizer structure and locate:

- opening explanation block;
- run selector and playback controls;
- current frame summary card;
- “How to read this run” card;
- plot block;
- image tile block;
- tile components;
- any responsive grid/layout CSS.

Suggested commands:

```bash
grep -n "Current frame summary\|How to read this run\|Belief field\|Entropy field\|Prescribed support mask\|Useful delivered information\|arrival fraction\|Residual" \
  frontend/app/epistemic/visualizer/page.tsx
```

```bash
sed -n '700,1160p' frontend/app/epistemic/visualizer/page.tsx
sed -n '1160,1540p' frontend/app/epistemic/visualizer/page.tsx
```

Use the actual inspected structure before proposing patches.

## Candidate patch shape

A good first patch should be mostly reordering and small copy edits.

Likely patch order:

1. Identify the visual tile group.
2. Move the visual tile group above the diagnostic plot group.
3. Compress the top explanatory cards.
4. Keep only a compact frame summary above or beside the panels.
5. Move “How to read this run” below the panels or into `<details>`.
6. Keep useful delivered information plot visible near the panels.
7. Move remaining plots lower or into an “Advanced diagnostics” section.

## Design risks

### Risk 1 — Hiding useful diagnostic context

The visual panels need context, but not so much that the panels are buried.

Mitigation:

- keep compact labels on each panel;
- retain the current explanatory text lower on the page or inside collapsible sections.

### Risk 2 — Breaking layout responsiveness

Moving large tile groups can break smaller browser widths.

Mitigation:

- preserve existing tile component behavior where possible;
- avoid new complex CSS in the first patch;
- test frontend build and manually inspect at normal desktop width.

### Risk 3 — Over-removing plots

The plots are still useful for diagnostic work, even if not the first-order story.

Mitigation:

- demote rather than delete;
- use section headings such as “Secondary diagnostics” or “Advanced diagnostics.”

### Risk 4 — Prematurely adding blur/cloud rendering

The smoke review showed support geometries are readable enough to justify layout simplification first.

Mitigation:

- explicitly defer impressionistic rendering to a later subgoal.

## Manual smoke checks

After patching, open an existing Belief Lab run for each type if available, or at least one structured support run.

Check:

- page loads;
- run selector works;
- playback controls work;
- visual panels appear without excessive scrolling;
- belief, entropy, entropy-change, support, and arrivals panels render;
- useful delivered-information plot still renders;
- other plots remain accessible;
- residual driver selector still works;
- temporal trail toggle still works if preserved;
- no visual panel endpoint names changed.

## Validation commands

Because this subgoal should be frontend-only:

```bash
npm --prefix frontend run build
git diff --check
git status
```

If backend files are touched unexpectedly:

```bash
PYTHONPATH=backend python -c "from api.main import app; print(app.title, app.version)"
python -m pytest backend/tests
npm --prefix frontend run build
git diff --check
git status
```

## Starting branch sequence

From clean, synchronized `main`:

```bash
git pull origin main
git status
git checkout -b v0.9-subgoal-06
```

Add this design note:

```bash
git add docs/design/v0_9_06_epistemic_visualizer_thesis_style_panel_simplification.md
git diff --check
git commit -m "Add epistemic visualizer panel simplification note"
git push origin HEAD:refs/heads/v0.9-subgoal-06
```

## Expected outcome

After this subgoal, the Epistemic Visualizer should feel more like a thesis-style inspection page and less like a diagnostic dashboard.

The user should be able to see the core epistemic relationship quickly:

```text
support / arrivals → belief → uncertainty → entropy change
```

The page should remain technically faithful, but the main visual story should be easier to explain during committee review, demos, and internal development.
