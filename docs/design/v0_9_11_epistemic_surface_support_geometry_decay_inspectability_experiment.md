# AWSRT v0.9-subgoal-11 — Epistemic Surface Support Geometry × Decay Inspectability Experiment

## Status

**Version track:** AWSRT v0.9  
**v0.9 theme:** From reproducible handoff to interpretable inspection  
**Subgoal branch:** `v0.9-subgoal-11`  
**Subgoal type:** experimental-design / bounded epistemic inspectability experiment  
**Primary implementation area:** likely analysis/script support and documentation; frontend/backend changes only if inspection reveals a small missing affordance  
**Scientific status:** v0.9 inspectability evidence, not a reopening of frozen v0.6 thesis-result experiments

---

## Purpose

This subgoal begins a sequence of Epistemic Surface experiments designed to test what, if anything, the Epistemic Surface and Epistemic Visualizer can demonstrate scientifically.

The immediate experiment is a bounded clean-arrival study of:

```text
support geometry × belief decay
```

The experiment asks whether different prescribed support geometries, under controlled clean-arrival conditions, produce interpretable differences in belief maintenance, entropy reduction, entropy-change structure, and delivered-information proxy behavior.

This is not intended to claim operational wildfire prediction or reopen the v0.6 evidence base. It is intended to test whether the v0.9 Epistemic Surface is scientifically useful as an inspectability instrument.

---

## Motivation from preceding runs

A preliminary random-support decay probe compared three runs on the same physical field, with the same support model, support seed, support budget, no delay, no loss, no noise, and only belief decay varied.

The random-support panels showed that prescribed support and arrivals may be visually uninformative when support is random and arrivals are clean. That is not a failure. It is a control condition: support and arrival structure are intentionally unchanged.

The belief, entropy, entropy-change, and delivered-information panels did show differences across decay settings. Metrics confirmed that decay changed belief maintenance even when arrival fraction and support budget were identical.

The strongest preliminary insight was:

```text
same support / same arrivals can still produce different belief-maintenance regimes.
```

A second insight was:

```text
larger arrived-information proxy does not necessarily imply better maintained belief state.
```

This subgoal turns that observation into a small, controlled matrix.

---

## Main scientific question

Under clean arrival conditions, can the Epistemic Surface demonstrate that support geometry controls the spatial form of epistemic change while belief decay controls the persistence of that change?

More concretely:

1. Do structured support geometries make the visual panels more scientifically interpretable than random support?
2. Does low, medium, and high decay produce distinct belief-maintenance regimes across support geometries?
3. Do visual impressions agree with metric summaries such as entropy AUC, terminal mean entropy, delta-entropy behavior, and arrived-information proxy?
4. Can the Epistemic Visualizer distinguish support/arrival sameness from belief-state consequence?

---

## Strict non-goals

Do not treat this as a physical wildfire-validation experiment.

Do not claim AWSRT is an operational wildfire simulator.

Do not change v0.6 experiments, artifacts, or conclusions.

Do not change belief update semantics as part of this experiment.

Do not change impairment semantics as part of this experiment.

Do not treat support geometries as operational movement policies.

Do not add custom uploaded masks unless a later subgoal explicitly targets that feature.

Do not blur the boundary between visual inspectability and quantitative evidence. Visual panels guide interpretation; metrics discipline interpretation.

---

## Experimental frame

### Fixed conditions

Use a single reference physical field and clean channel conditions:

| Variable | Setting | Rationale |
|---|---|---|
| Physical field | `phy-6fdf1ef479` if continuing from the preliminary probe | Keeps field constant across the matrix |
| Grid | 150 × 150 | Matches recent Epistemic Surface smoke/probe scale |
| Time | T = 72 if using current Belief Lab default | Enough frames to observe decay effects |
| Support budget | 4096 cells / step | Matches prior runs and gives visible support density |
| Delay | none (`max_delay_steps=0`, `delay_geom_p=1.0`) | Keep arrivals aligned with support |
| Loss | 0.0 | Clean arrival condition |
| Noise | false positive 0.0, false negative 0.0 | Isolate support/decay effects |
| Prior | 0.5 | Neutral baseline |
| Entropy | Shannon bits | Existing metric basis |
| MDC epsilon | 0.0 | Current probe convention |
| Residual driver | arrival fraction initially | Keep comparable with prior runs |

### Varied factors

| Factor | Levels | Purpose |
|---|---|---|
| Support geometry | `random_support`, `scanline_support`, `block_sweep_support`, `ring_support`, `center_out_support` | Tests whether spatial support structure changes interpretability and belief-maintenance consequences |
| Belief decay | `0.1`, `0.6`, `1.0` initially | Tests retained, intermediate, and high-decay / near-reset regimes |

This yields:

```text
5 support geometries × 3 decay values = 15 runs
```

---

## Proposed Phase A matrix

| Run group | Support model | Decay | What it should test | Expected visual/metric signal |
|---|---:|---:|---|---|
| A1 | `random_support` | 0.1 | Unstructured support with strong belief retention | Coherent belief/entropy structure may emerge despite visually noisy support; lower entropy AUC |
| A2 | `random_support` | 0.6 | Unstructured support with partial forgetting | Visual structure may appear, but metrics may remain close to high-entropy regime |
| A3 | `random_support` | 1.0 | Unstructured support with no effective accumulation | Support/arrival panels unchanged; mean entropy likely flat/high |
| B1 | `scanline_support` | 0.1 | Sequential spatial acquisition with retention | Moving line-like epistemic trace should accumulate into maintained field |
| B2 | `scanline_support` | 0.6 | Sequential acquisition with partial forgetting | Recent scan structure may dominate; older regions may fade |
| B3 | `scanline_support` | 1.0 | Sequential acquisition without retention | Visual panels may show current/recent support but little sustained entropy reduction |
| C1 | `block_sweep_support` | 0.1 | Localized systematic inspection with retention | Strong local-to-global accumulation; likely clear support-to-belief story |
| C2 | `block_sweep_support` | 0.6 | Localized inspection with partial forgetting | Block history may partially persist; boundary between retained and forgotten regions visible |
| C3 | `block_sweep_support` | 1.0 | Localized inspection without retention | Current block visible; little durable global belief maintenance |
| D1 | `ring_support` | 0.1 | Perimeter-like support with retention | Boundary/perimeter information may accumulate into ring-shaped entropy/belief structure |
| D2 | `ring_support` | 0.6 | Perimeter-like support with partial forgetting | Ring trace may appear but fade or remain metric-weak |
| D3 | `ring_support` | 1.0 | Perimeter-like support without retention | Support may remain visually strong but entropy maintenance weak |
| E1 | `center_out_support` | 0.1 | Radial/focal support with retention | Expanding/focal epistemic structure should be visible and retained |
| E2 | `center_out_support` | 0.6 | Radial/focal support with partial forgetting | Recent radial regions dominate; persistence limited |
| E3 | `center_out_support` | 1.0 | Radial/focal support without retention | Immediate radial support visible; little sustained entropy reduction |

---

## Primary outputs to collect

For each run, retain:

1. `summary.json`
2. `render_debug.json`
3. Epistemic Visualizer screenshots at a common frame, initially slot/frame 40 if comparable
4. Optional screenshots at early / middle / late frames if a support geometry has a temporal story
5. Run manifest / creation config
6. Any generated visual artifacts needed to reproduce or explain the panel view

---

## Required summary table

Create a table with at least these columns:

| epi_id | support_model | decay | entropy_auc | mean_entropy_mean | mean_entropy_t0 | mean_entropy_t_end | delta_mean_entropy_mean | delta_mean_entropy_min | delta_mean_entropy_max | arrived_info_proxy_mean | arrived_info_proxy_sum | arrival_frac_mean | mdc_violation_rate | residual_support_pos_frac | residual_arrived_info_pos_frac |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|

Useful derived columns:

| Derived field | Definition | Why useful |
|---|---|---|
| entropy_drop | `mean_entropy_t0 - mean_entropy_t_end` | Simple final belief-maintenance effect |
| entropy_auc_delta_vs_high_decay | `entropy_auc(decay=1.0) - entropy_auc(current)` within same support geometry | Measures benefit of retention relative to high-decay baseline |
| arrived_info_minus_entropy_alignment | qualitative or computed later | Helps inspect delivery/usefulness separation |
| visual_interpretability_score | manual 0–2 or 0–3 rating | Helps separate scientific value from visual clutter |

---

## Evaluation criteria

### Evidence of scientific value

The experiment has scientific value if it demonstrates one or more of the following separations:

```text
same support budget, different belief maintenance
same arrival fraction, different entropy consequence
different support geometry, different spatial entropy-change story
higher arrived-information proxy, not necessarily lower entropy AUC
visual impression that must be corrected or qualified by metrics
```

### Evidence of weak scientific value

The experiment is weak if all structured support geometries produce visually different pictures but nearly identical metrics, or if metrics change but the visualizer cannot help interpret why.

### Strongest likely result

A strong result would be:

```text
Under clean arrivals, support geometry controls the spatial organization of epistemic change, while decay controls whether that change persists as a maintained belief state.
```

### Important caution

If `decay=0.6` visually appears intermediate but metrics remain close to `decay=1.0`, that is not a failed result. It is a useful visualizer-validity finding: visual inspection needs metric discipline.

---

## Suggested command/process discipline

Start from clean `main`:

```bash
git checkout main
git pull origin main
git status
git checkout -b v0.9-subgoal-11
```

Commit this design note first:

```bash
git add docs/design/v0_9_11_epistemic_surface_support_geometry_decay_inspectability_experiment.md
git diff --check
git commit -m "Add epistemic support geometry decay experiment note"
git push origin HEAD:refs/heads/v0.9-subgoal-11
git status
```

Then proceed read-only before patching:

```bash
grep -R "random_support\|scanline_support\|block_sweep_support\|ring_support\|center_out_support" -n backend frontend/app/epistemic --exclude-dir=__pycache__ --exclude-dir=.next
```

Inspect whether the UI/API already supports all needed runs manually. If yes, do not patch. Run the matrix manually and collect artifacts. If not, add only the smallest helper needed.

---

## Likely implementation needs

This subgoal may not require code changes. It may only require:

1. Running the 15-run matrix.
2. Exporting/capturing summaries and debug files.
3. Creating a compact comparison table.
4. Reviewing visual panels at a common frame.
5. Deciding whether the Epistemic Surface demonstrates a defensible inspectability result.

Possible small helper script, only if needed:

```text
scripts or docs-supported helper to collect summary.json values from a list of epi-* IDs into one CSV/Markdown table.
```

Avoid adding automation unless manual collection becomes error-prone.

---

## Validation expectations

If no code changes:

```bash
git diff --check
git status
```

If frontend code changes:

```bash
npm --prefix frontend run build
git diff --check
git status
```

If backend code changes:

```bash
PYTHONPATH=backend python -c "from api.main import app; print(app.title, app.version)"
python -m pytest backend/tests
npm --prefix frontend run build
git diff --check
git status
```

---

## Expected end-of-subgoal deliverables

1. Design note committed in `docs/design/`.
2. Matrix of run IDs and settings.
3. Summary comparison table.
4. Visual notes for each support model × decay grouping.
5. A decision on whether this line has scientific value.
6. If valuable, a concise thesis-facing result statement.
7. If not valuable, a concise explanation of what the Epistemic Surface failed to demonstrate.

---

# Future v0.9 epistemic experiment subgoals

The following should be treated as future subgoals, not mixed into subgoal 11.

---

## v0.9-subgoal-12 — Epistemic Impairment Response Under Selected Support Geometries

### Purpose

Once the clean support-geometry × decay baseline is understood, introduce impairments so the prescribed-support versus realized-arrival pair becomes scientifically active.

### Main question

How do loss, delay, and noise change the relationship between prescribed support, realized arrivals, entropy change, and belief maintenance?

### Candidate matrix

Use a reduced set of support geometries selected from subgoal 11, likely:

```text
block_sweep_support
ring_support
random_support baseline
```

Use one or two decay values, likely:

```text
0.1 retained-belief regime
0.6 partial-retention regime, if subgoal 11 shows it is meaningful
```

Vary impairment:

```text
healthy / clean
loss
noise
delay
```

### Scientific value

This line directly supports the thesis separation between information arrival and information usefulness. Loss separates requested support from arrivals. Delay separates support timing from current belief relevance. Noise separates arrival from correct belief improvement.

### Strict boundary

Do not rerun v0.6 experiments. This is an Epistemic Surface inspectability probe, not a new operational result set.

---

## v0.9-subgoal-13 — Visualizer / Metric Alignment Review

### Purpose

Systematically compare what the visualizer appears to show against what the metrics say.

### Main question

When do visual panels accurately suggest metric-level differences, and when can they mislead?

### Inputs

Use runs from subgoal 11 and subgoal 12.

### Method

For each selected run or run group:

1. Record visual impression from belief, entropy, entropy-change, support, arrival, and delivered-information panels.
2. Compare against entropy AUC, terminal mean entropy, delta-entropy summaries, arrived-info proxy, MDC/residual measures.
3. Mark cases as:
   - visually aligned with metrics;
   - visually suggestive but metric-weak;
   - metric-strong but visually subtle;
   - visually ambiguous.

### Scientific value

This strengthens AWSRT as a research instrument by showing that the visualizer is an inspection aid rather than decorative evidence or a replacement for metrics.

---

## v0.9-subgoal-14 — Epistemic Result Framing and Thesis Integration Note

### Purpose

If subgoals 11–13 produce defensible findings, write a thesis-facing interpretation note.

### Main question

What can the Epistemic Surface now defensibly demonstrate?

### Likely claim

A bounded claim might be:

```text
The Epistemic Surface makes belief maintenance inspectable as a state-dependent process: support and arrival structure can remain fixed while belief-maintenance consequences vary, and visually plausible epistemic patterns must be interpreted alongside entropy and residual diagnostics.
```

### Deliverables

1. A concise results-style summary.
2. Candidate thesis paragraph(s).
3. Candidate figure/table list.
4. Explicit boundaries and non-claims.

---

## v0.9-subgoal-15 — Optional Epistemic Batch/Export Helper

### Purpose

Only if manual collection becomes too slow or error-prone, add a small helper for running or summarizing epistemic matrices.

### Possible helper features

1. Export selected `summary.json` fields from a list of `epi-*` IDs.
2. Create a CSV or Markdown summary table.
3. Optionally copy key screenshots into a comparison folder.

### Non-goal

Do not build a large new batch system unless the experiment sequence clearly demands it.

---

## Recommended immediate next step after committing this note

Inspect whether all Phase A runs can be generated manually from the existing Epistemic Designer without code changes. If yes, generate the 15 runs and record run IDs in a simple table. If not, identify the smallest missing UI/API affordance and patch only that.

