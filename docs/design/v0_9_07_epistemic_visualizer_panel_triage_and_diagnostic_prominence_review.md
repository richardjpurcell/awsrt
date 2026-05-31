# v0.9-subgoal-07 — Epistemic Visualizer Panel Triage and Diagnostic Prominence Review

## Version context

AWSRT v0.8 remains the frozen handoff-ready baseline. v0.9 is the interpretability / inspectability track.

Completed so far in v0.9:

- v0.9-subgoal-01: Operational Visualizer view-window and map-readability controls.
- v0.9-subgoal-02: Operational Visualizer view-window stabilization note.
- v0.9-subgoal-03: Epistemic Surface inspectability probe.
- v0.9-subgoal-04: Built-in Epistemic Support Geometry Presets.
- v0.9-subgoal-05: Epistemic Support Geometry Smoke Check and Visual Readability Review.
- v0.9-subgoal-06: Epistemic Visualizer Thesis-Style Panel Simplification.

The v0.9-subgoal-06 pass successfully changed the Epistemic Visualizer from a diagnostic-dashboard ordering toward a thesis-style visual story:

```text
controls
→ compact frame summary
→ epistemic frame panels
→ useful delivered information
→ secondary diagnostics
```

The page now works and is easier to read, but the simplification pass revealed a new set of interpretive triage questions:

- Do all five visual panels need to be visible at first-class prominence?
- Is the useful delivered-information plot now too visually large?
- Do all secondary diagnostic plots need to remain visible by default?
- Should support and arrivals be paired more tightly?
- Should some diagnostics move into an advanced/collapsed section?
- Should cloud/impressionistic rendering of point-like visual marks be deferred to a later rendering-specific subgoal?

## Subgoal name

`v0.9-subgoal-07`

## Proposed branch

`v0.9-subgoal-07`

## Design note path

`docs/design/v0_9_07_epistemic_visualizer_panel_triage_and_diagnostic_prominence_review.md`

## Immediate purpose

Review the simplified Epistemic Visualizer after v0.9-subgoal-06 and decide which visual panels and plots deserve first-class visibility, which should be paired, which should be collapsed, and which should remain available only as secondary diagnostics.

This subgoal should be a triage and prominence review, not a broad visual redesign.

## Current page state after v0.9-subgoal-06

The Epistemic Visualizer currently presents:

1. run selector and playback controls;
2. compact current-frame summary;
3. five epistemic frame panels:
   - belief field;
   - entropy / uncertainty field;
   - entropy-change field;
   - prescribed support mask;
   - arrivals over prescribed support;
4. useful delivered-information plot;
5. secondary diagnostics:
   - mean entropy / MDC-style plot;
   - realized channel rate / arrival fraction;
   - entropy-decrease diagnostic;
   - residual diagnostic;
   - collapsed “How to read this run” explanatory text.

This is a good first-order organization. The remaining question is whether everything now has the right visual weight.

## Working hypothesis

The current five-panel story is technically faithful, but may be more than the user needs at first glance.

The most thesis-facing visual relationship is probably:

```text
prescribed support + realized arrivals
→ belief field
→ uncertainty / entropy field
→ entropy change
```

This suggests that support and arrivals may function better as a paired interpretive unit than as two independent first-class panels.

Similarly, the useful delivered-information plot is important, but may not need a large full-width card if it competes visually with the field panels.

The remaining diagnostic plots are useful for development and auditability, but may be better treated as advanced diagnostics unless the user is actively debugging entropy/residual behavior.

## Core framing

AWSRT remains a research instrument. The Epistemic Visualizer should support belief/uncertainty inspection under controlled support and impairment conditions.

This subgoal should preserve the distinction between:

- visual explanation for thesis/demo inspection;
- diagnostic instrumentation for development and auditability;
- backend semantics and scientific results.

It should not make the page prettier at the expense of interpretability or traceability.

## Strict non-goals

Do not change:

- backend support geometry generation;
- belief update semantics;
- impairment semantics;
- entropy computation;
- MDC residual semantics;
- image endpoint names;
- v0.6 frozen experiments;
- v0.6 scientific interpretation;
- v0.8 reproducibility/handoff claims.

Do not add in this subgoal:

- new support geometries;
- uploaded custom mask workflows;
- new backend metrics;
- broad UI redesign across surfaces;
- operational movement policy semantics;
- cloud/impressionistic rendering, unless explicitly split into a later rendering-specific subgoal.

## Important later idea to preserve but not necessarily implement here

A later visual inspectability refinement should revisit whether point-like marks in the Epistemic Visualizer should render more like clouds, fields, or impressions rather than sparse points.

This may be relevant for:

- support masks;
- arrivals over support;
- uncertainty regions;
- entropy-change regions;
- future thesis/demo visual clarity.

However, this is likely a rendering-semantics subgoal rather than a panel-triage subgoal. It should remain parked unless the current triage clearly shows that rendering style, rather than layout prominence, is the next bottleneck.

## Candidate classification of current elements

### Core thesis panels

Likely first-class:

1. Belief field
   - Shows what the maintained posterior currently says.
   - Thesis role: belief state, not just observation arrival.

2. Entropy / uncertainty field
   - Shows where uncertainty is high or low.
   - Thesis role: uncertainty-aware belief maintenance.

3. Entropy-change field
   - Shows where uncertainty just changed.
   - Thesis role: dynamic belief improvement or degradation.

### Core but possibly paired panels

4. Prescribed support mask
   - Shows where sensing was requested.
   - Thesis role: support/attention geometry.
   - May be most readable when paired with arrivals.

5. Arrivals over prescribed support
   - Shows what actually arrived after impairment.
   - Thesis role: separation between requested support and realized information flow.
   - May be most readable when paired directly with support.

### Near-core diagnostic

6. Useful delivered information plot
   - Shows realized arrival-derived useful information proxy over time.
   - Smoke review suggested this plot is visually meaningful in clean cases.
   - However, full-width prominence may be too strong if it competes with the visual field panels.

### Secondary / advanced diagnostics

7. Mean entropy / MDC-style plot
   - Useful for auditability and entropy trajectory interpretation.
   - May be too abstract for first-screen thesis explanation.

8. Arrival fraction plot
   - Useful for channel impairment inspection.
   - May be flat or repetitive in clean cases.

9. Entropy-decrease diagnostic
   - Useful for checking decrease threshold behavior.
   - More technical than the main visual story.

10. Residual diagnostic
   - Important for formal diagnostic reasoning.
   - Likely advanced by default, especially because residual driver choice remains a technical control.

11. “How to read this run” explanatory text
   - Useful but should remain collapsed or below the main story.

## Possible layout directions

### Option A — Keep five visual panels, reduce plot prominence

Keep the five visual panels exactly as introduced in subgoal 06, but make the useful delivered-information plot smaller or integrate it into a compact near-core diagnostic row.

Advantages:

- Smallest change.
- Preserves the current clear visual story.
- Avoids over-tuning too early.

Risks:

- Still may feel visually crowded.
- Does not answer whether five panels are all needed.

### Option B — Pair support and arrivals visually

Keep five views, but present support and arrivals as a paired sub-block:

```text
Belief | Entropy | Entropy change
Support requested | Arrivals realized
```

or:

```text
Belief | Entropy | Entropy change
Support → Arrivals
```

Advantages:

- Makes support/arrival separation explicit.
- Preserves both masks without treating them as unrelated panels.
- Aligns well with “prescribed support versus realized arrival.”

Risks:

- May require modest layout tuning.
- Must avoid implying operational deployment policy.

### Option C — Collapse most secondary plots by default

Keep the useful delivered-information plot visible, but put the remaining plots in a collapsed advanced section.

Advantages:

- Makes the page more thesis/demo friendly.
- Reduces dashboard feel.
- Keeps auditability available.

Risks:

- Could hide diagnostics that are useful during development.
- Needs care so the research-instrument framing is not weakened.

### Option D — Make useful delivered information a compact metric card plus mini-plot

Instead of a large plot card, show a compact card with:

- current value;
- mean value;
- small sparkline;
- short label.

Advantages:

- Keeps the useful plot visible without dominating.
- Better matches “near-core diagnostic.”

Risks:

- Requires slightly more frontend work.
- Could reduce plot readability if too small.

### Option E — Defer layout changes and create a rendering-specific cloud subgoal

If the current layout feels acceptable, freeze this visualizer state and move next to rendering semantics.

Advantages:

- Avoids over-refining layout.
- Moves toward the previously discussed cloud/impressionistic visual idea.

Risks:

- Rendering changes may be more complex and less reversible.
- The current diagnostic prominence questions may remain unresolved.

## Suggested first inspection pass

Before patching, manually inspect at least two or three runs if available:

- `block_sweep_support`
- `scanline_support`
- `ring_support`
- optionally `random_support`

For each run, note:

1. whether all five visual panels are needed;
2. whether support and arrivals are easier to read separately or as a pair;
3. whether useful delivered information is too visually dominant;
4. whether secondary diagnostics are useful immediately or only when debugging;
5. whether the current collapsed “How to read this run” section is sufficient.

## Suggested code inspection commands

```bash
grep -n "Epistemic frame panels\|Useful delivered information\|Secondary diagnostics\|How to read this run\|Tile title=\|ResidualDiagnostic\|EntropyWithMDC\|SparkLine" \
  frontend/app/epistemic/visualizer/page.tsx
```

```bash
sed -n '1180,1405p' frontend/app/epistemic/visualizer/page.tsx
```

## Candidate smallest safe patch

If the manual review supports it, the smallest safe patch would be one of:

1. change `Useful delivered information` from a full card into a narrower/compact plot card;
2. move secondary diagnostics into a collapsed `<details>` block by default;
3. add a small heading or grouping that pairs `Prescribed support mask` and `Arrivals over prescribed support` conceptually without changing endpoints;
4. leave all five panels visible but reduce plot prominence.

The first patch should avoid creating new components unless the existing structure becomes too hard to read.

## Validation expectations

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
git checkout main
git pull origin main
git status
git checkout -b v0.9-subgoal-07
```

Add this design note:

```bash
mkdir -p docs/design
cp /path/to/downloaded/v0_9_07_epistemic_visualizer_panel_triage_and_diagnostic_prominence_review.md \
  docs/design/v0_9_07_epistemic_visualizer_panel_triage_and_diagnostic_prominence_review.md

git add docs/design/v0_9_07_epistemic_visualizer_panel_triage_and_diagnostic_prominence_review.md
git diff --check
git commit -m "Add epistemic visualizer panel triage note"
git push origin HEAD:refs/heads/v0.9-subgoal-07
```

## Expected outcome

At the end of this subgoal, AWSRT should have a clearer decision about visual and diagnostic prominence in the Epistemic Visualizer.

The result may be either:

- a small frontend patch that reduces diagnostic dominance;
- a decision to preserve the current v0.9-subgoal-06 layout;
- a clear handoff into a later rendering-specific subgoal about cloud/impressionistic visual marks.

The subgoal should not reopen scientific claims or alter backend semantics. It should improve the inspectability of the existing Epistemic Visualizer presentation.
