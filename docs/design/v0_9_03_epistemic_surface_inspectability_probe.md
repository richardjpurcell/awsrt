# v0.9-subgoal-03 — Epistemic Surface Inspectability Probe

## Version context

AWSRT v0.8 remains the frozen handoff-ready baseline, and v0.9 is the interpretability / inspectability track.

Completed so far in v0.9:

- v0.9-subgoal-01: Operational Visualizer view-window and map-readability pass
- v0.9-subgoal-02: Operational Visualizer stabilization/documentation note

This subgoal begins the epistemic-facing part of v0.9.

## Subgoal name

`v0.9-subgoal-03`

## Branch

`v0.9-subgoal-03`

## Design note path

`docs/design/v0_9_03_epistemic_surface_inspectability_probe.md`

## Immediate purpose

Probe the current Epistemic Surface and Epistemic Visualizer to understand what kinds of belief/uncertainty stories AWSRT can currently tell, which stories are hard to read, and what design direction would improve inspectability without overcommitting to implementation too early.

This is an inspection-and-framing subgoal first, not an implementation subgoal.

## Framing insight motivating the probe

The Operational Visualizer works because it tells a readable story: where sensors move, how they respond, and how those visible motions relate to the regime plots.

The epistemic side is different. The main interest is not simply where sensors move, but how sensing patterns produce belief and uncertainty structure.

Several interpretive tensions motivate this probe:

1. Sparse/random sensing can quickly become visually chaotic, making belief–uncertainty relationships hard to read.
2. High-coverage sensing can make the belief/uncertainty relationship much clearer.
3. Human deployment often follows an interpretable pattern (sweeps, zig-zagging, expansion, perimeter following, etc.), and AWSRT may need clearer preset patterns to support storytelling and inspection.
4. The current epistemic point/square rendering may be too literal and too small to be readable.
5. The epistemic visual output may benefit from a more impressionistic rendering style (e.g., expanded/blurred sensing influence “clouds”) so that sensing, belief, and uncertainty can be visually related more directly.
6. Current epistemic plots may be correct but not yet narratively interpretable.

## Working design hypothesis

The Epistemic Surface may need to support two related but distinct things:

### A. Better *experimental stories*

Meaning:
- more interpretable sensing/deployment patterns;
- clearer control over coverage regime;
- easier ways to produce structured examples that reveal belief–uncertainty relationships.

Candidate pattern families to inspect or consider later:
- random scatter (baseline);
- zig-zag / lawnmower sweep;
- expanding circle / radial expansion;
- perimeter-following / ring-like coverage;
- directional sweep / front-chasing pattern;
- high-coverage dense sampling pattern;
- sparse sentinel / spot-check pattern.

These are not yet approved implementation requirements. They are candidate storytelling families.

### B. Better *epistemic rendering*

Meaning:
- belief and uncertainty displays that are more readable and more obviously related;
- sensor influence rendered in a way that is visually legible rather than as tiny hard-edged squares;
- a visual language that is explanatory rather than physically literal.

Candidate rendering directions to inspect or consider later:
- expanded sensor footprints;
- blurred or feathered influence regions;
- “cloud-like” / impressionistic overlays;
- simplified thesis-like four-panel displays;
- side-by-side belief and uncertainty panels with consistent framing and scales.

Again, these are inspection targets, not implementation commitments.

## Project framing constraints

AWSRT remains a research instrument.

Do not reframe AWSRT as:
- an operational wildfire simulator;
- a high-fidelity physical wildfire simulator;
- a digital twin / physical twin;
- a real deployment planner.

The goal here is interpretability and inspectability, not realism for its own sake.

## Strict non-goals

Do not:
- reopen or rerun frozen v0.6 experiments by default;
- alter v0.6 scientific interpretation;
- casually change operational policy logic or impairment semantics;
- implement user-provided mask workflows in this subgoal;
- combine this with a broad UI overhaul across the repository;
- commit to new deployment-pattern semantics before inspection.

Custom uploaded deployment masks may remain a long-range backlog item and should not drive near-term design.

## Key questions for the probe

### Epistemic story questions

- What is the current epistemic story the visualizer is telling?
- What kinds of belief/uncertainty cases are currently readable?
- What cases collapse into apparent noise?
- Are current sensing/deployment assumptions helping or obstructing interpretation?
- Would a small library of pre-baked deployment patterns materially improve inspectability?

### Visual language questions

- How are sensors currently rendered?
- How are belief and uncertainty currently rendered?
- Are their color scales, panel layout, and framing visually coherent?
- Would “impressionistic” rendering improve readability without misleading the user?
- Can the simplicity of the thesis-style panel presentation be adapted into AWSRT?

### Plotting questions

- Which current plots are epistemically important?
- Which plots look repetitive but do not currently tell a readable story?
- Are the current plots mismatched to the intended interpretation task?
- Should some plots be reorganized, hidden, or reframed later?

### Surface-design questions

- Is the issue mainly in the Epistemic Visualizer?
- Or is the issue upstream in the kinds of epistemic runs the Designer can produce?
- Do we need new deployment presets, new render modes, or both?
- What is the smallest useful next implementation track after inspection?

## Initial inspection targets

Primary frontend targets:
- `frontend/app/epistemic/designer/page.tsx`
- `frontend/app/epistemic/visualizer/page.tsx`

Likely backend/supporting targets:
- backend routers/endpoints serving epistemic artifacts
- any render helpers or artifact writers for epistemic images/series
- any frontend components shared with operational / physical visualizers

Also inspect:
- current docs describing the epistemic surface
- any currently available epistemic run options relevant to deployment or rendering

## Suggested inspection steps

1. Inspect the Epistemic Designer to see what kinds of experiment/setup choices already exist.
2. Inspect the Epistemic Visualizer to see how belief, uncertainty, sensing, and plots are currently presented.
3. Identify where sensor footprints / overlays / panels are rendered.
4. Identify whether current plot choices align with the epistemic story of interest.
5. Identify whether deployment-pattern diversity already exists or would need to be added.
6. Produce a short diagnosis before proposing any implementation.

## Development discipline

Use the established AWSRT subgoal pattern:

1. Start from clean `main`.
2. Pull `main`.
3. Create `v0.9-subgoal-03`.
4. Add this design note.
5. Commit and push the branch.
6. Inspect before patching.
7. Prefer small, additive, reversible changes.
8. If implementation follows later, validate before merge.
9. Push branch.
10. Merge back to `main` only when the subgoal has a clear stopping point.
11. Do not tag until final v0.9 freeze.

## Validation expectations

If this subgoal stays inspection/design-only, validation is lightweight:

```bash
git diff --check
git status
```

If frontend implementation follows later, then also run:

```bash
npm --prefix frontend run build
```

If backend files are touched unexpectedly, also run:

```bash
PYTHONPATH=backend python -c "from api.main import app; print(app.title, app.version)"
python -m pytest backend/tests
```

## Initial terminal inspection commands

Start with read-only inspection:

```bash
sed -n '1,260p' frontend/app/epistemic/designer/page.tsx
sed -n '260,620p' frontend/app/epistemic/designer/page.tsx
sed -n '620,1040p' frontend/app/epistemic/designer/page.tsx
```

```bash
sed -n '1,260p' frontend/app/epistemic/visualizer/page.tsx
sed -n '260,620p' frontend/app/epistemic/visualizer/page.tsx
sed -n '620,1040p' frontend/app/epistemic/visualizer/page.tsx
```

Then search for likely epistemic rendering / plotting / sensor-footprint logic:

```bash
grep -R "belief\|uncertainty\|entropy\|sensor\|footprint\|mask\|overlay\|plot\|series\|heatmap" \
  frontend/app/epistemic backend \
  --include='*.tsx' --include='*.ts' --include='*.py' \
  | head -n 300
```

## Expected first deliverable after inspection

A short diagnosis identifying:

1. what epistemic story the current tool tells well;
2. what epistemic story it does not yet tell well;
3. whether the main bottleneck is deployment-pattern choice, visual rendering, plot design, or a combination;
4. which improvements belong in the Designer, the Visualizer, or both;
5. the smallest sensible next implementation subgoal.
