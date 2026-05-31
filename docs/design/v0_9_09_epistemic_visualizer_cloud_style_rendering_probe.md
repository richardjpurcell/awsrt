# v0.9-subgoal-09 — Epistemic Visualizer Cloud-Style Rendering Probe

## Version context

AWSRT v0.8 remains the frozen handoff-ready baseline.

AWSRT v0.9 is the interpretability / inspectability track:

> From reproducible handoff to interpretable inspection.

Alternate thesis-facing wording:

> From reproducible handoff to epistemic and operational inspectability.

Completed v0.9 work so far:

- `v0.9-subgoal-01`: Operational Visualizer view-window and map-readability controls.
- `v0.9-subgoal-02`: Operational Visualizer view-window stabilization note.
- `v0.9-subgoal-03`: Epistemic Surface inspectability probe.
- `v0.9-subgoal-04`: Built-in Epistemic Support Geometry Presets.
- `v0.9-subgoal-05`: Epistemic Support Geometry Smoke Check and Visual Readability Review.
- `v0.9-subgoal-06`: Epistemic Visualizer thesis-style panel simplification.
- `v0.9-subgoal-07`: Epistemic Visualizer panel triage and diagnostic prominence review.
- `v0.9-subgoal-08`: Epistemic Visualizer support/arrival pairing review.

Current `main` after subgoal 08:

- The Epistemic Visualizer foregrounds the main visual panels.
- Support and arrivals are visually paired as a realization story.
- Secondary diagnostics are collapsed by default.
- All five existing visual panels remain available:
  - belief field;
  - entropy / uncertainty field;
  - entropy-change field;
  - prescribed support mask;
  - arrivals over prescribed support.

## Subgoal name

`v0.9-subgoal-09`

## Branch

`v0.9-subgoal-09`

## Design note path

`docs/design/v0_9_09_epistemic_visualizer_cloud_style_rendering_probe.md`

## Immediate purpose

Probe whether the Epistemic Visualizer should support a more cloud-like or impressionistic rendering mode for selected visual panels.

The motivation is that some current visual windows can look point-like, speckled, or mechanically pixelated. That is technically faithful, but may not always serve the thesis-facing interpretation. The thesis story is often about epistemic condition, uncertainty, support, and arrival patterns as fields or regions of attention, not merely as isolated pixels.

This subgoal should explore the rendering question carefully and minimally.

## Core research-instrument framing

AWSRT remains a research instrument.

This subgoal must not imply that AWSRT is:

- an operational wildfire simulator;
- a high-fidelity physical wildfire model;
- a physical twin or digital twin;
- a validated visualization of real atmospheric smoke, fire, or sensor phenomena.

The cloud-style rendering should be framed as an **inspectability view** over existing epistemic arrays, not a physical rendering of wildfire phenomena.

Good language:

- cloud-style rendering;
- impressionistic field view;
- smoothed inspectability view;
- visual interpolation for interpretation;
- optional rendered view over the same underlying data.

Avoid language that suggests:

- physical smoke;
- real plume modelling;
- geophysical realism;
- operational prediction;
- additional scientific evidence not present in the data.

## Why this subgoal follows support/arrival pairing

Subgoal 08 clarified the page-level structure:

```text
Belief and uncertainty state
  belief / entropy / entropy-change

Support and arrival realization
  prescribed support / arrivals over support
```

That pairing made the next bottleneck clearer. Some panels now communicate their relationship well, but their mark-making may still be visually too discrete for thesis-style explanation.

The next question is therefore not layout first, but rendering mode:

```text
Can selected epistemic panels be shown as softer fields without changing the underlying semantics?
```

## Primary design question

Should the Epistemic Visualizer offer an optional cloud/impressionistic view for one or more of the existing panels?

Candidate panels:

1. entropy / uncertainty field;
2. entropy-change field;
3. prescribed support mask;
4. arrivals over prescribed support;
5. possibly belief field, but this may already work well as a continuous field.

## Initial hypothesis

A cloud-style rendering is likely most useful for:

- support mask;
- arrivals over prescribed support;
- entropy-change field.

It may be less necessary for:

- belief field;
- entropy field;

because those already behave like scalar fields, depending on the renderer.

The support and arrival panels are the most obvious candidates because they can currently feel like point selections rather than regions of epistemic attention or realized observation.

## Strict non-goals

Do not change:

- belief update semantics;
- support geometry generation;
- support masks as data;
- arrival masks as data;
- impairment semantics;
- entropy computation;
- entropy-change computation;
- residual / MDC semantics;
- existing image endpoint meanings;
- v0.6 experiments or scientific interpretation;
- operational policies or movement behavior.

Do not claim that cloud rendering creates new evidence.

Do not remove the crisp/original rendering mode.

Do not make cloud rendering the only way to inspect the data.

Do not add a large visual redesign across other surfaces.

Do not build a complex renderer before inspecting existing rendering code.

## Required principle

Cloud-style rendering must be optional and reversible.

The user should still be able to inspect the crisp underlying data representation.

Preferred framing:

```text
Rendering mode:
- crisp
- soft / cloud
```

or:

```text
Display:
- original
- smoothed
```

The exact UI wording can be decided after inspection.

## Likely implementation targets

Primary likely files:

- `frontend/app/epistemic/visualizer/page.tsx`

Potential backend rendering files to inspect before touching:

- `backend/api/routers/epistemic.py`
- `backend/awsrt_core/epistemic/option_a.py`
- any helper that generates:
  - `belief.png`;
  - `entropy.png`;
  - `delta_entropy_sign.png`;
  - `support_mask.png`;
  - `arrived_on_support.png`;
  - legends.

Potential styling file only if needed:

- `frontend/app/globals.css`

## Inspection-first workflow

Before patching, inspect the current frontend and backend rendering flow.

Start with:

```bash
grep -R "support_mask.png\|arrived_on_support.png\|delta_entropy_sign.png\|belief.png\|entropy.png" -n backend frontend | head -80
```

Then inspect likely backend rendering definitions:

```bash
grep -R "def .*support\|def .*arrived\|delta_entropy_sign\|support_mask\|arrived_on_support" -n backend/awsrt_core backend/api | head -120
```

Inspect the current visualizer tile and trail components:

```bash
grep -n "function Tile\|function TrailTile\|imgSrc\|support_mask\|arrived_on_support" frontend/app/epistemic/visualizer/page.tsx
```

Then inspect the relevant code ranges discovered by grep.

## Candidate implementation approaches

### Option A — Frontend CSS-only softening

Apply optional CSS filters to existing image elements.

Possible techniques:

- `filter: blur(...)`;
- `opacity`;
- layered duplicate image with one blurred copy behind a crisp copy;
- `imageRendering` control.

Advantages:

- frontend-only;
- low risk;
- no backend data or endpoint changes;
- easy to toggle;
- reversible.

Risks:

- blur can obscure crisp support/arrival structure;
- CSS blur may not produce a satisfying cloud look;
- legends may no longer visually match exactly;
- can look like a cosmetic effect rather than an epistemic view.

### Option B — Frontend layered soft/crisp rendering

Render the same image twice inside a tile:

```text
soft blurred image behind
crisp image above at partial opacity
```

Advantages:

- preserves data trace while creating a field impression;
- optional per tile;
- does not require backend changes.

Risks:

- requires modifying `Tile` / `TrailTile`;
- may interact with temporal trail opacity;
- may need careful sizing.

### Option C — Backend alternate rendered image endpoints

Add optional rendered images such as:

```text
support_mask_soft.png
arrived_on_support_soft.png
delta_entropy_sign_soft.png
```

Advantages:

- more control;
- proper smoothing can happen before color mapping or after mask composition;
- legends can be made consistent.

Risks:

- backend changes;
- more files/artifacts;
- more validation;
- easier to overbuild;
- may complicate existing artifact assumptions.

### Option D — Defer implementation after a probe

Inspect rendering code and decide that only a design note is needed for now.

Advantages:

- avoids premature visual semantics;
- keeps v0.9 conservative.

Risks:

- may delay a useful thesis-facing improvement.

## Recommended first implementation bias

Start with a frontend-only optional rendering probe.

Prefer **Option B** if the existing image tiles are easy to modify:

```text
soft underlay + crisp overlay
```

This may give a better cloud impression than a simple blur while retaining inspectability.

However, do not implement until the Tile and TrailTile components are inspected.

## Possible UI shape

A compact control near the visual panels:

```text
Rendering mode: Crisp | Soft field
```

or:

```text
Visual style:
[ ] Soft field rendering
```

Preferred default:

```text
Crisp/original
```

because this preserves exact inspection by default.

Possible tile-level behavior:

- Belief field: leave crisp by default, maybe unaffected.
- Entropy field: optionally soft.
- Entropy-change field: optionally soft.
- Prescribed support mask: optionally soft.
- Arrivals over prescribed support: optionally soft.

Alternative:

- Apply soft rendering only to support/arrival tiles in the first patch.

## Suggested first patch scope

The first code patch should be very small:

1. Add local React state:

```ts
const [softFieldRendering, setSoftFieldRendering] = useState(false);
```

2. Add a compact checkbox near the visual panels:

```text
Soft field rendering
```

3. Add optional `soft` prop to `Tile`.

4. Use the soft rendering only for:

```text
Prescribed support mask
Arrivals over prescribed support
```

5. Do not alter `TrailTile` until the first result is visually reviewed.

This is intentionally conservative.

## Candidate frontend-only patch concept

Possible Tile concept:

```tsx
function Tile({ title, src, soft = false }: { title: string; src: string; soft?: boolean }) {
  ...
}
```

Inside the image wrapper:

```tsx
{soft ? (
  <div style={{ position: "relative" }}>
    <img src={src} style={{ width: "100%", filter: "blur(6px)", opacity: 0.55 }} />
    <img src={src} style={{ width: "100%", position: "absolute", inset: 0, opacity: 0.55 }} />
  </div>
) : (
  <img src={src} style={{ width: "100%" }} />
)}
```

This is illustrative only. Use the actual inspected `Tile` component.

## Design risks

### Risk 1 — Soft rendering implies physical smoke or plume realism

Mitigation:

- use “soft field rendering” rather than “smoke” or “cloud” in UI;
- document that it is an interpretive rendering view only.

### Risk 2 — Blur hides sparse support/arrival evidence

Mitigation:

- keep crisp mode available;
- default to crisp;
- consider layered soft + crisp rather than blur-only.

### Risk 3 — Legends become misleading

Mitigation:

- do not change legends;
- frame soft rendering as display style rather than new color scale;
- inspect whether legends remain close enough.

### Risk 4 — The visualizer becomes too aesthetic

Mitigation:

- stop if the cloud view looks pretty but less inspectable;
- keep the research-instrument framing;
- compare crisp and soft side-by-side during manual smoke review.

### Risk 5 — Trail rendering interacts poorly with soft rendering

Mitigation:

- do not change `TrailTile` in the first patch unless necessary;
- start with support/arrival panels only.

## Manual smoke checks

Use one or more existing Belief Lab runs, preferably including:

- `block_sweep_support`;
- `scanline_support`;
- `ring_support`;
- `center_out_support`;
- a clean run and, if available, an impaired run.

Check:

- page loads;
- crisp mode remains default;
- support and arrival panels render exactly as before when soft mode is off;
- soft mode toggles without reload;
- support and arrival panels appear field-like but not misleading;
- titles remain accurate;
- legends still make sense;
- playback works;
- no flickering regression;
- temporal trail still works;
- secondary diagnostics remain collapsed by default.

## Validation commands

If the first patch is frontend-only:

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

## Commit discipline

Start from clean synchronized `main`:

```bash
git checkout main
git pull origin main
git status
git checkout -b v0.9-subgoal-09
```

Add this design note first:

```bash
git add docs/design/v0_9_09_epistemic_visualizer_cloud_style_rendering_probe.md
git diff --check
git commit -m "Add epistemic visualizer cloud rendering probe note"
git push origin HEAD:refs/heads/v0.9-subgoal-09
```

Then inspect before patching.

## Expected outcome

At the end of this subgoal, AWSRT should have one of the following:

1. a small optional frontend soft-field rendering mode for support and arrival panels; or
2. a documented decision to defer cloud/impressionistic rendering until the renderer can be redesigned more carefully.

The expected successful code outcome is conservative:

```text
Crisp rendering remains the default.
Soft field rendering is optional.
Support and arrival panels can be read as field-like epistemic realizations.
No scientific or backend semantics change.
```

## Notes for future work

Possible later subgoals:

- apply soft rendering to entropy-change fields;
- create backend-rendered smoothed alternatives;
- add side-by-side crisp/soft comparison;
- tune legends for soft rendering;
- create thesis-export panel figures;
- revisit the five-panel visual story after cloud rendering is evaluated.
