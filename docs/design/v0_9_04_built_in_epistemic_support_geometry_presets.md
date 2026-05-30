# v0.9-subgoal-04 — Built-in Epistemic Support Geometry Presets

## Version context

AWSRT v0.8 remains the frozen handoff-ready baseline. v0.9 is the interpretability / inspectability track.

Completed so far in v0.9:

- v0.9-subgoal-01: Operational Visualizer view-window and map-readability controls.
- v0.9-subgoal-02: Operational Visualizer view-window stabilization note.
- v0.9-subgoal-03: Epistemic Surface inspectability probe.

The v0.9-subgoal-03 probe concluded that the Epistemic Surface is structurally ready for built-in support geometry presets. The current Belief Lab already isolates support choice from belief update, impairment, entropy computation, MDC diagnostics, and rendering endpoints.

## Subgoal name

`v0.9-subgoal-04`

## Branch

`v0.9-subgoal-04`

## Design note path

`docs/design/v0_9_04_built_in_epistemic_support_geometry_presets.md`

## Immediate purpose

Add simple, named, built-in epistemic support geometries to Belief Lab so the Epistemic Surface can tell clearer belief/uncertainty stories than random support alone.

The goal is to let users create interpretable support schedules without requiring custom uploaded support masks.

## Core framing

These are not operational movement policies.

They should be described as:

- epistemic support geometries;
- support schedules;
- prescribed sensing-support patterns;
- policy-free support patterns.

They should not be described as:

- sensor movement policies;
- fleet-control policies;
- operational deployment algorithms;
- realistic field-deployment plans.

The distinction matters because Belief Lab is explicitly policy-free. It studies how prescribed sensing support, impairment, and belief-update rules shape belief and uncertainty. It does not model operational decision-making.

## Motivation

The Epistemic Surface currently supports:

- `random_support`
- `fixed_support_mask`

This is too narrow for the intended v0.9 epistemic-inspectability goal.

Random support is useful as a baseline but can produce visually noisy, hard-to-explain belief/uncertainty behavior. Fixed masks are powerful but too advanced for near-term committee/demo workflows. They require external files and are not yet the right path for quickly telling readable epistemic stories.

The next step is therefore a small built-in library of support geometries that produce understandable spatial-temporal support patterns.

## Interpretive goal

The support geometry presets should help answer questions such as:

- What happens to belief and uncertainty under broad/random coverage?
- What happens when support sweeps across the field?
- What happens when support expands outward from a center?
- What happens when support follows a ring or perimeter-like shape?
- How do support structure and channel impairment interact?

These are epistemic-inspection questions, not operational-control questions.

## Proposed first support models

The first implementation should remain modest.

Candidate support models:

### Existing models to preserve

- `random_support`
- `fixed_support_mask`

### New candidate models

- `scanline_support`
- `block_sweep_support`
- `ring_support`
- `center_out_support`

These names may be adjusted during implementation if another naming scheme fits the code better.

## Intended model meanings

### `random_support`

Existing baseline. Selects up to `budget` distinct cells uniformly each step.

### `fixed_support_mask`

Existing advanced geometry route. Uses a user-provided 2D mask loaded from disk. This remains useful but should not be the primary committee/demo path.

### `scanline_support`

A simple sweep pattern that advances through the grid in row-major or column-major order over time. This should produce an easily understood moving support band or sequence of support cells.

Purpose:

- readable sweep story;
- useful contrast against random support;
- easy to explain as policy-free spatial support scheduling.

### `block_sweep_support`

A moving rectangular window of support. The rectangle shifts across the grid over time.

Purpose:

- clearer visual mass than sparse individual points;
- easier to see how localized support changes belief/uncertainty;
- a bridge toward the user’s desired “cloud-like” visual story without changing rendering yet.

### `ring_support`

An annulus/perimeter-style support pattern. The selected support cells lie near a ring around a chosen center, with temporal variation if needed.

Purpose:

- useful for perimeter-like epistemic stories;
- makes support geometry visually distinct from random scatter;
- can show how ring-shaped support leaves interior/exterior uncertainty.

### `center_out_support`

A center-out or expanding-radius support pattern.

Purpose:

- useful for showing belief/uncertainty propagation from an initial focus region;
- visually interpretable;
- close to the user’s suggested expanding-circle story.

## Budget semantics

Preserve the existing `support.budget` meaning as much as possible:

> number of cells sensed per step

For all built-in support geometries, the generated mask should contain no more than `budget` active cells per step, except where clipping, duplicate removal, or grid boundaries make fewer cells available.

If a model naturally creates more candidate cells than the budget, select a deterministic subset. If it creates fewer cells, allow fewer cells rather than silently filling with unrelated random cells unless a clear fill policy is explicitly chosen.

## Reproducibility semantics

Preserve `support.seed` as a reproducibility parameter.

For deterministic geometries, the seed may be unused initially, but it should remain accepted for schema consistency and future tie-breaking or jitter options.

If a model uses random tie-breaking or randomized subset selection, it must use the existing seeded `rng` so runs remain reproducible.

## Implementation targets

Likely files:

- `backend/awsrt_core/schemas/epistemic.py`
- `backend/awsrt_core/epistemic/option_a.py`
- `backend/api/routers/epistemic.py`
- `frontend/app/epistemic/designer/page.tsx`

Potentially inspect but avoid changing unless necessary:

- `frontend/app/epistemic/visualizer/page.tsx`
- `backend/awsrt_core/io/renders.py`
- backend tests

## Backend implementation sketch

### 1. Extend schema support model literal

Current:

```python
model: Literal["random_support", "fixed_support_mask"] = "random_support"
```

Likely target:

```python
model: Literal[
    "random_support",
    "fixed_support_mask",
    "scanline_support",
    "block_sweep_support",
    "ring_support",
    "center_out_support",
] = "random_support"
```

### 2. Pass time index into support-mask generation

Current `_choose_support_mask(...)` receives `H`, `W`, model, budget, rng, and optional fixed mask.

New geometries need access to time `t` and possibly total horizon `T`.

Likely extension:

```python
def _choose_support_mask(
    H: int,
    W: int,
    *,
    model: str,
    m: int,
    rng: np.random.Generator,
    t: int = 0,
    T: int = 1,
    fixed_mask: np.ndarray | None = None,
) -> np.ndarray:
```

Then update the run loop call:

```python
sm = _choose_support_mask(
    H,
    W,
    model=action_model,
    m=action_m,
    rng=rng,
    t=t,
    T=T,
    fixed_mask=fixed_mask,
)
```

### 3. Add helper functions for support geometry

Prefer small local helpers in `option_a.py` rather than a broad abstraction in this subgoal.

Candidate helpers:

- `_budgeted_flat_mask(H, W, idx)`
- `_scanline_support_mask(H, W, m, t)`
- `_block_sweep_support_mask(H, W, m, t, T)`
- `_ring_support_mask(H, W, m, t, T)`
- `_center_out_support_mask(H, W, m, t, T)`

Keep them deterministic and easy to reason about.

## Frontend implementation sketch

Update `frontend/app/epistemic/designer/page.tsx` support-pattern dropdown.

Current options:

- Random support
- Fixed support mask

Likely target options:

- Random support
- Scanline support
- Block sweep support
- Ring support
- Center-out support
- Fixed support mask

Add explanatory text that reinforces the policy-free framing.

Possible wording:

> Support geometry defines where sensing is attempted in Belief Lab. These are policy-free support schedules, not operational movement policies.

Update preset taxonomy if useful, but do not overbuild.

Potential new visualizer reference presets:

- Dense random reference
- Scanline sweep reference
- Block sweep reference
- Center-out reference
- Ring support reference

These presets can populate support model, budget, seed, impairment, and belief settings without auto-running.

## Router implications

`backend/api/routers/epistemic.py` likely needs minimal change.

It currently only loads a fixed support mask when `m.support.model == "fixed_support_mask"`. That can remain unchanged.

The router passes `m.support.model` through to `run_epistemic_option_a(...)`. As long as schema validation accepts the new strings and `option_a.py` handles them, the router should continue to work.

Metrics summary should continue to record:

```python
"support_model": str(m.support.model)
"support_budget": int(m.support.budget)
"support_seed": int(m.support.seed)
```

No new metrics are required for the first implementation.

## Visualizer implications

No visualizer changes are required in this subgoal unless implementation reveals a simple label mismatch.

Existing render artifacts should continue to work:

- `support_mask.png`
- `arrived_mask.png`
- `arrived_on_support.png`
- `belief.png`
- `entropy.png`
- `delta_entropy.png`
- `delta_entropy_sign.png`

The visualizer will immediately benefit because support masks will be more structured.

Do not add blurred/cloud rendering yet. That belongs in a later subgoal after support-story presets exist.

## Tests / smoke checks

At minimum, validate existing test suite.

If time allows, add a small targeted test for `_choose_support_mask(...)` or the new helper functions.

Important properties:

- returns shape `(H, W)`;
- returns dtype `uint8`;
- active count is `<= budget` where feasible;
- existing `random_support` behavior still works;
- `fixed_support_mask` behavior still works;
- each new model works for small grids and rectangular grids;
- output is deterministic for deterministic patterns.

## Manual smoke checks

Generate at least one Belief Lab run with a new support model and inspect:

- run creation succeeds;
- generated run opens in Epistemic Visualizer;
- support mask is visibly structured;
- arrived mask remains aligned with support;
- belief and entropy tiles still render;
- plots still load;
- run summary records the selected support model.

Suggested initial smoke cases:

- `scanline_support`, moderate budget, no loss/delay;
- `block_sweep_support`, moderate budget, mild loss;
- `center_out_support`, moderate budget, no loss/delay;
- `ring_support`, moderate budget, no loss/delay.

## Validation commands

Because this subgoal will likely touch backend schema, backend generation, and frontend UI, run:

```bash
PYTHONPATH=backend python -c "from api.main import app; print(app.title, app.version)"
python -m pytest backend/tests
npm --prefix frontend run build
git diff --check
git status
```

## Strict non-goals

Do not:

- change belief update semantics;
- change impairment semantics;
- change entropy computation;
- change MDC residual semantics;
- change v0.6 experiments;
- change v0.6 scientific interpretation;
- introduce uploadable custom mask workflows;
- introduce operational movement policies;
- add blurred/cloud rendering in this subgoal;
- redesign the Epistemic Visualizer layout;
- change rendered image endpoint names unless absolutely necessary.

## Expected outcome

After this subgoal, Belief Lab should support a small set of built-in, named, policy-free support geometries. These should make epistemic examples easier to construct and interpret, especially when comparing belief and uncertainty under different support structures.

This should create a cleaner foundation for later visualizer work, including thesis-like panel simplification and impressionistic support/arrival rendering.
