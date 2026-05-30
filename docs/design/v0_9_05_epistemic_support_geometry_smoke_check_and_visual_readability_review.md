# v0.9-subgoal-05 — Epistemic Support Geometry Smoke Check and Visual Readability Review

## Version context

AWSRT v0.8 remains the frozen handoff-ready baseline. v0.9 is the interpretability / inspectability track.

Completed so far in v0.9:

- v0.9-subgoal-01: Operational Visualizer view-window and map-readability controls.
- v0.9-subgoal-02: Operational Visualizer view-window stabilization note.
- v0.9-subgoal-03: Epistemic Surface inspectability probe.
- v0.9-subgoal-04: Built-in Epistemic Support Geometry Presets.

The v0.9-subgoal-04 implementation added built-in Belief Lab support geometries while preserving the policy-free support-lab framing.

## Subgoal name

`v0.9-subgoal-05`

## Branch

`v0.9-subgoal-05`

## Design note path

`docs/design/v0_9_05_epistemic_support_geometry_smoke_check_and_visual_readability_review.md`

## Immediate purpose

Smoke-check the new built-in epistemic support geometries and assess whether they produce readable belief/uncertainty stories in the current Epistemic Visualizer.

This is a stabilization and visual-readability review subgoal. It should not introduce new visual rendering features unless a very small polish fix is clearly necessary.

## Motivation

v0.9-subgoal-04 added the support-story machinery that the Epistemic Surface was missing. Before adding blurred support clouds, thesis-like panel layouts, or plot reorganizations, we need to see what the new support geometries actually produce.

The question is not merely whether the code runs. The question is whether the new support geometries help the Epistemic Surface tell clearer stories about how sensing support shapes belief and uncertainty.

## Framing

Belief Lab remains policy-free.

The new support models should be understood as:

- epistemic support geometries;
- support schedules;
- prescribed sensing-support patterns;
- visual/story scaffolds for belief and uncertainty experiments.

They are not:

- operational movement policies;
- sensor fleet-control policies;
- real wildfire deployment strategies;
- physical or operational simulation claims.

## Main review questions

### Functional smoke questions

For each new support geometry:

- Can a Belief Lab run be generated?
- Does the run open in the Epistemic Visualizer?
- Does the support mask render?
- Does the arrived mask render?
- Does `arrived_on_support.png` render and remain aligned?
- Do belief, entropy, delta entropy, and sign tiles render?
- Do plots load?
- Does the summary record the selected support model?

### Visual readability questions

For each support geometry:

- Is the support pattern visually recognizable?
- Does it tell a clearer story than random support?
- Does the belief field respond in a way that can be inspected?
- Does the uncertainty / entropy panel relate visibly to support?
- Does the pattern become too sparse or too noisy at typical budgets?
- Does the current tile size make the pattern readable?
- Does the visualizer need better panel grouping before blur/cloud rendering?
- Are current plots useful when paired with the new support geometries, or still too abstract?

### Design-direction questions

After smoke checking, decide whether the next implementation should be:

1. Designer-side preset polish;
2. Visualizer-side thesis-like panel simplification;
3. blurred / impressionistic support and arrival rendering;
4. plot reduction or plot grouping;
5. backend support geometry refinement.

## Candidate smoke cases

Use an existing physical run that is convenient and already known to work.

Suggested baseline settings unless otherwise noted:

- physical reference: `reference-center-ideal`
- grid: `150 x 150`
- sensed cells per step: `4096`
- prior: `0.5`
- decay: `1.0`
- false positive: `0.0` or `0.01`
- false negative: `0.0` or `0.05`
- loss: `0.0`
- delay probability: `1.0`
- maximum delay steps: `0`
- entropy units: `bits`
- residual driver: `arrival_frac`
- residual scale: `auto`

Recommended smoke cases:

### 1. Random support reference

Purpose: retain baseline comparison.

- support model: `random_support`
- budget: moderate-to-high enough to be readable

### 2. Scanline support

Purpose: verify simple sweep readability.

- support model: `scanline_support`
- budget: moderate
- expected visual result: clear scanline / sweep progression across time

### 3. Block sweep support

Purpose: verify localized moving support mass.

- support model: `block_sweep_support`
- budget: moderate
- expected visual result: block-like region moving across the field

### 4. Center-out support

Purpose: verify expanding / center-out story.

- support model: `center_out_support`
- budget: moderate
- expected visual result: support progresses from central cells outward over time

### 5. Ring support

Purpose: verify annular / perimeter-like support story.

- support model: `ring_support`
- budget: moderate
- expected visual result: ring or perimeter-like support structure

### Optional impaired-channel cases

After clean/no-impairment cases work:

- add mild loss to one structured support case;
- add mild delay to one structured support case;
- inspect whether support/arrival separation becomes legible.

## Manual inspection rubric

For each run, record brief notes under the following headings:

```text
Run:
Support model:
Budget:
Impairment:
Did it generate?
Did it open?
Support readability:
Arrival readability:
Belief readability:
Entropy readability:
Plot usefulness:
Main visual problem:
Main design opportunity:
```

## Smoke review findings

The smoke review used the `reference-center-ideal` physical case on a `150 x 150` grid with `4096` cells sensed per step. The images were inspected at time slots selected to show the intersection between support geometry and the fire field. The specific `epi-*` IDs were not retained, because this subgoal is a visual/readability review rather than an artifact-freeze step.

### Overall finding

The new support geometries work and are visually meaningful. They create different epistemic stories rather than simply producing different versions of random sampling.

The major conclusion is:

```text
The random-only bottleneck has been reduced.
The next bottleneck is Epistemic Visualizer presentation.
```

The current visualizer already contains the relevant ingredients, but the important visual panels are too far down the page and are preceded by too many text-heavy interpretation cards and plot panels. The page currently feels more like a diagnostic dashboard than a simple thesis-style belief/uncertainty explanation.

### Random support

`random_support` remains useful as a baseline and functional sanity check.

It shows that the pipeline works:

- support mask renders;
- arrivals render;
- belief responds;
- entropy and entropy-change render;
- plots load.

However, the visual story remains noisy. Support and arrival masks read as salt-and-pepper fields. The entropy and entropy-change panels are correspondingly hard to narrate.

Judgment:

```text
Useful baseline, weak explanatory visual.
```

### Scanline support

`scanline_support` is a strong readable support geometry.

The horizontal band is immediately recognizable. It gives a clear story:

```text
A structured strip of sensing passes through the field;
where it intersects the fire, belief changes and uncertainty collapses locally.
```

The support and arrival masks are easy to inspect, and the belief/entropy response is much clearer than random support.

Judgment:

```text
Strong committee/demo candidate.
```

### Block sweep support

`block_sweep_support` is one of the strongest current presets.

The support mask is immediately legible as a compact square/rectangular block. The entropy panel clearly shows the inspected region, and the belief field shows how local support intersects the fire region. The entropy-change panel gives a readable edge/transition story.

This case already approaches the desired explanatory visual style without requiring blurred or impressionistic rendering.

Judgment:

```text
Probably the clearest support-geometry story in the current implementation.
```

### Ring support

`ring_support` is visually distinctive and useful.

The annular support structure is immediately readable. It supports a different epistemic story from scanline or block sweep:

```text
Support is concentrated along a boundary/perimeter-like region rather than filling an area.
```

The belief, entropy, and entropy-change panels show clear ring-shaped structure. This is useful for boundary/perimeter uncertainty stories.

Judgment:

```text
Very strong visually; especially useful for perimeter/boundary support stories.
```

### Center-out support

`center_out_support` is visually interesting but semantically less straightforward than its name suggests.

The result is not simply a filled expanding disk. The implementation orders cells by distance from the center and takes budget-sized slices through that radial order. As a result, at later timesteps it can produce central structure plus outer-edge or corner effects.

This behavior is not necessarily wrong. It is rich and potentially useful. But the name `center_out_support` may lead users to expect a continuously filled growing disk.

Judgment:

```text
Interesting and useful, but current semantics are closer to a radial-order sweep than a filled expanding disk.
```

Potential future refinement:

- rename or explain it more clearly; or
- add a separate `expanding_disk_support` model later if a true filled-disk story is needed.

## Plot and layout findings

The new support geometries make the visual panels more meaningful, but the current page layout buries those panels.

Current presentation issue:

- There are too many text-related cards before the visual panels.
- The visual panels appear too low on the page.
- The diagnostic plots appear before the main support/belief/uncertainty story.
- Most plots are not currently telling a coherent story for this use case.
- The useful delivered information plot is the only plot that currently appears to provide interesting visual variation.
- The mean entropy, arrival fraction, decrease diagnostic, and residual diagnostic plots are often flat or repetitive in these clean/no-delay/no-loss smoke cases.

This does not mean the plots are wrong. It means they are not the right first-order visual story for this part of v0.9.

## Design conclusion

The next implementation should not be blurred/cloud rendering yet.

The smoke results show that support geometries are now strong enough to justify a cleaner visual presentation. Therefore the next subgoal should focus on Epistemic Visualizer presentation simplification.

Recommended next subgoal:

```text
v0.9-subgoal-06 — Epistemic Visualizer Thesis-Style Panel Simplification
```

Likely goals:

- move the main visual panels higher on the page;
- reduce or collapse text-heavy interpretation cards;
- make the first visible story closer to:
  1. belief field;
  2. entropy / uncertainty field;
  3. entropy-change field;
  4. prescribed support mask;
  5. arrivals over support;
- demote diagnostic plots below the visual panels;
- consider showing only the useful delivered information plot by default;
- keep other plots available but lower-priority or collapsible;
- preserve current backend and support geometry semantics.

## Likely outcomes

### Outcome A — Support geometries are already useful

Confirmed. The new support masks are visually clear and belief/uncertainty panels respond coherently.

### Outcome B — Support geometries work but rendering is too literal

Partly true, but not the immediate bottleneck. Block, scanline, and ring are readable even with literal masks.

### Outcome C — Support geometries are too sparse or awkward

Not generally true with the smoke setting used here. At `4096` cells on a `150 x 150` grid, the structured support patterns are readable.

The possible exception is semantic rather than visual: `center_out_support` may need clearer naming or explanation later.

### Outcome D — Plots remain the bottleneck

Partly true. The plots are not the first-order story for this page. The useful delivered-information plot is visually interesting, but the other plots are often flat in the clean smoke cases.

## Implementation expectations

This subgoal should end as review and documentation.

Possible low-risk changes, only if clearly needed:

- improve support-model labels;
- improve explanatory text in the Designer;
- add or adjust reference presets for the new support geometries;
- add a small summary note to the Visualizer;
- fix obvious support model display issues.

However, based on the smoke review, the more appropriate next step is a separate visualizer simplification subgoal rather than patching within subgoal-05.

## Likely files for the next subgoal

The likely implementation target for `v0.9-subgoal-06` is:

- `frontend/app/epistemic/visualizer/page.tsx`

Potentially also:

- `docs/design/v0_9_06_epistemic_visualizer_thesis_style_panel_simplification.md`

Backend changes are not expected for that next subgoal.

## Strict non-goals

Do not:

- add blurred/cloud rendering yet;
- redesign the entire Epistemic Surface;
- add uploaded custom mask workflows;
- change belief update semantics;
- change impairment semantics;
- change entropy computation;
- change MDC residual semantics;
- rerun or alter frozen v0.6 experiments;
- change v0.6 scientific interpretation;
- treat support geometries as operational movement policies.

## Validation

If this subgoal remains documentation/manual review only:

```bash
git diff --check
git status
```

If frontend copy or preset polish is added:

```bash
npm --prefix frontend run build
git diff --check
git status
```

If backend bug fixes become necessary:

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
git checkout -b v0.9-subgoal-05
```

Then add this design note:

```bash
git add docs/design/v0_9_05_epistemic_support_geometry_smoke_check_and_visual_readability_review.md
git diff --check
git commit -m "Add epistemic support geometry smoke review note"
git push origin HEAD:refs/heads/v0.9-subgoal-05
```

## Expected stopping point

This subgoal should end with a documented judgment about what the new support geometries reveal.

The final judgment from the smoke review is:

1. `block_sweep_support`, `scanline_support`, and `ring_support` are visually useful.
2. `center_out_support` is useful but may need clearer naming or a future filled-disk variant.
3. `random_support` remains useful as a baseline but weak as an explanatory visual.
4. The next subgoal should focus on Epistemic Visualizer presentation simplification, not backend support geometry or blurred rendering.
5. No functional regressions were observed during the smoke review.
