# v0.9-subgoal-10 — Epistemic Visualizer Belief Palette Review

## Version context

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
- `v0.9-subgoal-06`: Epistemic Visualizer Thesis-Style Panel Simplification.
- `v0.9-subgoal-07`: Epistemic Visualizer Panel Triage and Diagnostic Prominence Review.
- `v0.9-subgoal-08`: Epistemic Visualizer Support/Arrival Pairing Review.
- `v0.9-subgoal-09`: Epistemic Visualizer Cloud-Style Rendering Probe.

`v0.9-subgoal-09` added an optional Crisp / Cloud rendering mode. Crisp remains the default authoritative diagnostic view. Cloud mode is a frontend-only visual probe that softens image tiles into a more field-like display while preserving backend image generation, routes, belief semantics, entropy semantics, support/arrival semantics, and residual diagnostics.

The cloud rendering probe exposed a remaining visual issue: the current belief-field palette may not tell the clearest thesis-facing story, especially in Cloud mode. The blue/green palette is visually pleasant but may not strongly communicate the intended low-belief / high-belief contrast.

## Subgoal name

`v0.9-subgoal-10`

## Branch

`v0.9-subgoal-10`

## Design note path

`docs/design/v0_9_10_epistemic_visualizer_belief_palette_review.md`

## Immediate purpose

Review and, if appropriate, lightly adjust the Epistemic Visualizer belief-field palette so that the belief panel tells a clearer thesis-facing story in both Crisp and Cloud rendering modes.

The goal is not to redesign all rendering. The goal is to determine whether the current belief colors are semantically strong enough, and to make a conservative palette adjustment only if it improves interpretability.

## Motivation

The current Epistemic Visualizer panel structure is now much clearer:

```text
Belief and uncertainty state
  - belief field
  - entropy field
  - entropy-change field

Support and arrival realization
  - prescribed support mask
  - arrivals over prescribed support
```

The optional Cloud mode now makes the rendered visual panels more field-like. However, the belief panel can still read as a soft blue/green texture rather than a clear belief-state contrast.

The belief panel is the first visual window in the epistemic story. It needs to answer a simple question quickly:

```text
Where does the maintained posterior currently lean low or high?
```

If the color palette is too gentle or ambiguous, the first panel may not carry that story well.

## Core framing

AWSRT remains a research instrument.

The belief palette should support:

- belief-state inspection;
- uncertainty-aware interpretation;
- thesis-facing explanation;
- comparison between Crisp and Cloud rendering modes;
- support/arrival-to-belief storytelling.

It should not imply:

- operational wildfire prediction;
- physical fire-intensity mapping;
- satellite thermal imagery;
- validated fire-front severity;
- a digital twin or physical twin.

## Design question

The central question for this subgoal is:

> Does the belief-field color palette make the posterior belief story easier to inspect, or does it make the first panel visually pleasant but semantically weak?

A successful palette should make it easier to say:

```text
This region is lower posterior belief.
This region is higher posterior belief.
The belief field is changing / biased / retained / stale in this way.
```

## Current concern

Current belief rendering appears to use a blue/green style where:

```text
blue  = lower fire belief
green = higher fire belief
```

In Crisp mode, this may be acceptable. In Cloud mode, it can become visually soft and less semantically decisive.

The issue is not that the palette is wrong. The issue is that it may not be clear enough for thesis-style inspection.

## Candidate palette directions

### Candidate A — keep current palette

Keep blue/green unchanged.

Advantages:

- no semantic risk;
- no code churn;
- preserves screenshots and existing familiarity;
- avoids making belief look like physical fire intensity.

Disadvantages:

- may remain too soft in Cloud mode;
- may not give a strong low/high visual contrast;
- may look like a generic environmental heatmap rather than belief state.

### Candidate B — blue to amber/orange

Use a muted blue-to-amber or blue-to-orange palette.

Possible semantics:

```text
blue / cool = lower posterior belief
amber / warm = higher posterior belief
```

Advantages:

- low/high contrast is intuitive;
- warmer high-belief regions may stand out more clearly;
- likely improves Cloud mode readability.

Risks:

- could accidentally look like physical fire intensity;
- may overstate operational interpretation;
- needs careful wording to preserve belief-state semantics.

### Candidate C — purple to gold

Use a purple-to-gold or violet-to-yellow palette.

Possible semantics:

```text
purple / dark = lower posterior belief
gold / light = higher posterior belief
```

Advantages:

- visually distinct from fire-intensity red/orange;
- clear luminance contrast;
- could be thesis-friendly.

Risks:

- may be less immediately intuitive;
- accessibility/contrast needs visual checking.

### Candidate D — monochrome belief intensity

Use a neutral dark-to-light or desaturated single-hue palette.

Possible semantics:

```text
dark = lower posterior belief
light = higher posterior belief
```

Advantages:

- avoids false physical-fire connotation;
- direct belief-strength cue;
- simple.

Risks:

- may be confused with entropy panel, which already uses dark/light uncertainty;
- weaker distinction among panels.

## Preferred initial direction

Start by inspecting how the current belief PNG is generated.

Only after inspection decide whether to:

1. keep the palette unchanged and record the concern;
2. add a frontend-only palette mode;
3. adjust backend belief colormap generation;
4. defer palette changes until a broader rendering pass.

The safest initial implementation path is likely **not** to alter backend generation immediately. However, if the belief PNG is generated with a very localized colormap function, a small backend palette change may be acceptable if tests and build remain clean.

## Strict non-goals

Do not change:

- belief update semantics;
- entropy computation;
- support geometry semantics;
- arrival semantics;
- residual semantics;
- image endpoint names;
- v0.6 experiments;
- v0.6 scientific interpretation;
- Cloud/Crisp default behavior;
- the five-panel story unless inspection shows a trivial issue.

Do not add:

- a large palette editor;
- user-uploaded custom colormaps;
- new backend artifacts unless necessary;
- operational fire-intensity framing;
- physical wildfire severity language.

## Likely implementation targets

Possible frontend target:

- `frontend/app/epistemic/visualizer/page.tsx`

Possible backend/rendering targets, depending on inspection:

- files under `backend/awsrt_core/epistemic/`
- files under `backend/api/routers/epistemic.py`
- any rendering utility responsible for `/epistemic/{id}/t/{tt}/belief.png`

Do not assume the target before inspection.

## Inspection targets before patching

First locate belief rendering and colormap logic.

Suggested commands:

```bash
grep -R "belief.png\|belief field\|colormap\|cmap\|imshow\|viridis\|Blues\|Greens\|RGB\|rgba" -n backend frontend/app/epistemic | head -80
```

Then inspect likely backend renderer sections, for example:

```bash
grep -R "belief.png" -n backend
```

```bash
grep -R "delta_entropy_sign\|support_mask\|arrived_on_support\|entropy.png" -n backend/awsrt_core backend/api | head -120
```

If the rendering is concentrated in one file, inspect that file before proposing patches.

## Candidate patch shapes

### Patch shape 1 — documentation-only finding

If the palette is not easy to change safely, record the palette issue as a future item and close this subgoal as a review.

Appropriate if:

- belief rendering is entangled;
- changing palette risks breaking visual assumptions;
- Cloud mode is acceptable but not perfect;
- a separate rendering architecture pass would be cleaner.

### Patch shape 2 — small backend colormap adjustment

If the belief PNG is rendered through a small, isolated colormap function, adjust only that colormap.

Requirements:

- one small function-level change;
- comments preserve belief-state framing;
- no endpoint changes;
- no metric or semantic changes;
- tests pass.

### Patch shape 3 — frontend label/legend improvement only

If colors remain unchanged, improve title/legend text to make the semantics clearer.

Example:

```text
Belief field — posterior probability tendency, not physical fire intensity
```

Use only if a color change is not justified.

### Patch shape 4 — frontend optional palette selector

This is probably too much for this subgoal unless trivial. Avoid unless the code naturally supports it.

## Design risks

### Risk 1 — Making belief look like fire intensity

Warm colors may make users read the belief panel as physical fire heat.

Mitigation:

- avoid red-hot palettes;
- use muted amber rather than flame red;
- keep labels explicit: posterior belief, not physical intensity.

### Risk 2 — Confusing belief with entropy

Dark/light belief palettes may be confused with entropy/uncertainty panels.

Mitigation:

- preserve distinct palette families across belief and entropy;
- keep entropy visually tied to uncertainty.

### Risk 3 — Over-tuning for Cloud mode

Cloud mode is optional and exploratory. Crisp remains the default.

Mitigation:

- evaluate palette in both Crisp and Cloud;
- do not degrade Crisp readability to improve Cloud aesthetics.

### Risk 4 — Reopening backend rendering too broadly

Palette review should not become a rendering architecture rewrite.

Mitigation:

- inspect first;
- patch only if the rendering function is localized;
- otherwise close with documented finding.

## Manual smoke checks

After any patch:

- open an existing Belief Lab run;
- compare Crisp and Cloud modes;
- check belief panel first-read clarity;
- ensure entropy panel remains visually distinct;
- ensure entropy-change blue/red meaning remains intact;
- ensure support and arrivals remain readable;
- ensure no route or image loading failure occurs;
- ensure labels do not imply physical fire intensity.

## Validation commands

If frontend-only:

```bash
npm --prefix frontend run build
git diff --check
git status
```

If backend rendering files are touched:

```bash
PYTHONPATH=backend python -c "from api.main import app; print(app.title, app.version)"
python -m pytest backend/tests
npm --prefix frontend run build
git diff --check
git status
```

## Starting branch sequence

From clean synchronized `main`:

```bash
git checkout main
git pull origin main
git status
git checkout -b v0.9-subgoal-10
```

Add this design note:

```bash
git add docs/design/v0_9_10_epistemic_visualizer_belief_palette_review.md
git diff --check
git commit -m "Add epistemic visualizer belief palette review note"
git push origin HEAD:refs/heads/v0.9-subgoal-10
```

## Expected outcome

At the end of this subgoal, AWSRT should have either:

1. a small, validated belief-palette or label improvement; or
2. a documented decision to defer palette changes to a later rendering architecture pass.

The belief panel should remain scientifically faithful and thesis-facing:

```text
This is a posterior belief visualization, not a physical wildfire intensity map.
```
