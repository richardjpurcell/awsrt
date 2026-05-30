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

## Likely outcomes

Possible outcomes after review:

### Outcome A — Support geometries are already useful

If the new support masks are visually clear and belief/uncertainty panels respond coherently, the next subgoal can focus on visualizer layout or thesis-like panel simplification.

### Outcome B — Support geometries work but rendering is too literal

If support patterns are structurally correct but still too hard to see, the next subgoal should target softened / cloud-like support and arrival rendering.

### Outcome C — Support geometries are too sparse or awkward

If patterns are structurally hard to read at normal budgets, the next subgoal should refine support geometry generation or add designer presets with better budget defaults.

### Outcome D — Plots remain the bottleneck

If the visual panels become readable but plots still do not help interpretation, the next subgoal should reorganize plot grouping and narrative labels.

## Implementation expectations

This subgoal should begin as review and documentation.

Possible low-risk changes, only if clearly needed:

- improve support-model labels;
- improve explanatory text in the Designer;
- add or adjust reference presets for the new support geometries;
- add a small summary note to the Visualizer;
- fix obvious support model display issues.

Avoid larger changes until the smoke review is complete.

## Likely files if a small polish patch is needed

- `frontend/app/epistemic/designer/page.tsx`
- `frontend/app/epistemic/visualizer/page.tsx`
- `docs/design/v0_9_05_epistemic_support_geometry_smoke_check_and_visual_readability_review.md`

Do not touch backend logic in this subgoal unless the smoke check reveals a functional bug in the new support geometries.

## Strict non-goals

Do not:

- add blurred/cloud rendering yet;
- redesign the Epistemic Visualizer layout yet;
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

The final note should identify:

1. which support geometries are visually useful;
2. which ones need refinement;
3. whether the next subgoal should focus on visualizer layout, blurred/cloud rendering, designer presets, or plot interpretation;
4. any bugs or regressions found during smoke testing.
