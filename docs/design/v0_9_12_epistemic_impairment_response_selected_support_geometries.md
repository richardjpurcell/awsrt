# AWSRT v0.9-subgoal-12 — Epistemic Impairment Response Under Selected Support Geometries

## Working title

**Epistemic impairment response under selected support geometries**

## Version-track context

AWSRT v0.9 is the interpretability / inspectability track:

> From reproducible handoff to interpretable inspection.

Thesis-facing wording:

> From reproducible handoff to epistemic and operational inspectability.

The previous subgoal, `v0.9-subgoal-11`, established a clean-channel Epistemic Surface baseline using a 5 × 3 support-geometry × belief-decay matrix. That experiment showed that support geometry and belief decay interact under clean arrivals, and that delivered-information proxy activity should not be equated with maintained belief quality.

This subgoal begins the next experimental stage: introducing impairment into the Epistemic Surface while keeping the matrix small enough to remain interpretable.

## Project framing

AWSRT is a research instrument for studying adaptive sensing, impaired information flow, uncertainty-aware belief maintenance, and usefulness under wildfire-like dynamic fields.

AWSRT is **not**:

- an operational wildfire simulator;
- a high-fidelity physical wildfire simulator;
- a physical twin or digital twin;
- a decision-automation system.

The Epistemic Surface is also not an operational search-policy surface. Its support masks are epistemic probes: controlled patterns for asking where sensing is prescribed, what arrives, and how those arrivals affect the maintained belief state.

## Immediate purpose of this subgoal

Use selected support geometries and decay settings to test how impairment changes the relationship among:

1. prescribed support;
2. realized arrivals;
3. delivered-information proxy activity;
4. entropy-side belief maintenance;
5. visual inspectability of the belief, entropy, entropy-change, support, and arrival panels.

The clean-channel matrix from subgoal 11 deliberately made support and arrivals match. This made the support/arrival panels partly control windows. In subgoal 12, impairment should make those panels scientifically active.

## Main research question

> Under selected support geometries and belief-decay settings, how do loss, delay, and noise change the relationship between prescribed support, realized arrivals, delivered-information activity, entropy change, and maintained belief quality?

## Subquestions

1. Does impairment make the prescribed-support versus realized-arrival distinction visually and metrically meaningful?
2. Do some support geometries remain more robust under impairment than others?
3. Does the arrived-information proxy separate from entropy-side belief maintenance more strongly under impairment than in the clean matrix?
4. Do the Epistemic Visualizer panels communicate the impairment mechanism clearly enough to support thesis-facing interpretation?
5. Which impairment/support/decay cases are worth carrying into the thesis chapter as representative figures?

## Recommended experimental scope

Do **not** run the full 5 × 3 × impairment expansion by default. That would be large and may be hard to interpret.

Start with a deliberately selected matrix:

### Support geometries

Recommended initial set:

- `random_support`
- `scanline_support`
- `ring_support`

Rationale:

- `random_support` provides the unstructured baseline.
- `scanline_support` was one of the strongest clean-retention cases in subgoal 11.
- `ring_support` is visually distinctive and was one of the high delivered-information proxy / relatively high entropy cases at intermediate decay.

Possible alternative:

- replace `ring_support` with `block_sweep_support` if the goal is to foreground local block inspection rather than perimeter-like support.

Do not include all five support geometries unless the first pass shows that the selected matrix is too narrow.

### Decay settings

Use two decay settings:

- `decay=0.1`
- `decay=0.6`

Rationale:

- `decay=0.1` showed stronger retention and clearer entropy-side separation in subgoal 11.
- `decay=0.6` showed information-proxy activity without strong global entropy maintenance.
- `decay=1.0` was useful as a clean high-decay control, but it may add little in the impairment response matrix unless a specific control run is needed.

### Impairment modes

Use four conditions:

- healthy / clean
- loss
- delay
- noise

Where possible, align impairment levels with established thesis/AWSRT conventions. Candidate defaults:

- healthy: `loss_prob=0.0`, `max_delay_steps=0`, noise off / `noise_prob=0.0`
- loss: use a moderate loss level such as `loss_prob=0.2` or the closest existing Epistemic Designer equivalent
- delay: use a moderate delay such as `max_delay_steps=4` or the closest existing Epistemic Designer equivalent
- noise: use a moderate observation-noise level such as `noise_prob=0.2` or the closest existing Epistemic Designer equivalent

Before running the matrix, inspect the Epistemic Designer field names and generated run summaries to confirm the exact impairment parameter names.

## Initial matrix size

Recommended initial matrix:

```text
3 support geometries × 2 decay settings × 4 impairment modes = 24 runs
```

This is large enough to reveal impairment response, but small enough to remain interpretable.

If 24 runs feels too large during manual execution, start with a reduced scout matrix:

```text
2 support geometries × 2 decay settings × 4 impairment modes = 16 runs
```

Recommended scout geometries:

- `random_support`
- `scanline_support`

Then add `ring_support` or `block_sweep_support` if the first 16 runs show interpretable differences.

## Controlled variables

Hold fixed unless explicitly changing them:

- physical artifact: use the same artifact as subgoal 11 if possible, `phy-0c33002565`
- grid: `150 × 150`
- horizon: `T=200`
- support budget: `4096`
- support seed: `0` where applicable
- observation setup: keep all non-target impairment settings fixed
- visualizer frame for screenshots: use the same slot/frame across runs where possible, preferably around the slot used in the clean-matrix visual review

## Expected metric outputs

For each run, preserve:

- `summary.json`
- `render_debug.json`
- run manifest/settings JSON if available
- at least one visual screenshot at a common frame

Key metrics:

- entropy AUC
- terminal mean entropy
- mean entropy over time if available
- delta mean entropy summary
- arrived-information proxy mean
- support proxy / residual summaries if available
- MDC violation rate
- arrival fraction mean
- loss/delay/noise configuration values

## Expected figures for later packaging

This subgoal may eventually need a new plotting script or an extension of the subgoal-11 script. Do not implement that until the run outputs are inspected.

Likely figures:

1. **Entropy AUC by impairment, support geometry, and decay**
   - Shows whether impairment weakens maintained belief quality differently across geometries.

2. **Terminal mean entropy by impairment, support geometry, and decay**
   - Endpoint complement to entropy AUC.

3. **Arrived-information proxy versus entropy AUC under impairment**
   - Tests whether impairment strengthens the separation between information activity and belief quality.

4. **Arrival fraction by impairment and support geometry**
   - Useful for checking that loss/delay conditions actually change realized arrival.

5. **Representative visual-panel collage**
   - Selected support/decay/impairment cases at a common frame.
   - Should include belief, entropy, entropy change, support mask, and arrivals-over-support.

6. **Optional residual/MDC diagnostic figure**
   - Secondary unless impairment makes residual violations central.

## Hypotheses / expected outcomes

These are not claims yet. They are expectations to test.

### Healthy condition

Healthy runs should resemble the subgoal-11 clean baseline for the same support geometry and decay. This provides continuity and sanity checking.

### Loss

Loss should make prescribed support and realized arrivals diverge. The support/arrival panels should become more informative than in the clean matrix. Entropy maintenance may weaken if enough prescribed observations fail to arrive.

### Delay

Delay should create temporal mismatch. Arrivals may occur, but not necessarily at the moment when they most support current belief maintenance. This condition is especially relevant to the thesis distinction between information arrival and timely usefulness.

### Noise

Noise should allow arrivals to occur while weakening or corrupting their belief-improving effect. This is potentially the strongest Epistemic Surface analogue of the thesis claim that delivery does not guarantee usefulness.

## Scientific value criteria

This subgoal has scientific value if it demonstrates at least one of the following:

1. The same prescribed support geometry produces different belief-maintenance outcomes under different impairment modes.
2. Support and arrival panels become diagnostically meaningful under impairment.
3. Arrived-information proxy activity separates from entropy-side belief maintenance more clearly under loss, delay, or noise.
4. Visual panels reveal impairment-specific mechanisms that are supported by metric summaries.
5. Some support geometries are more interpretable or robust under impairment than others.

This subgoal has weaker value if:

- all impairment modes collapse to visually and metrically similar outcomes;
- support/arrival panels remain uninformative even under impairment;
- metric summaries do not separate in a thesis-relevant way;
- visual patterns are interesting but not supported by metrics.

## Non-goals

Do not do the following in this subgoal:

- do not reopen v0.6 scientific experiments;
- do not reinterpret v0.6 results;
- do not treat support geometries as operational wildfire search policies;
- do not add new support geometry types;
- do not redesign the Epistemic Visualizer;
- do not change belief update semantics;
- do not change entropy computation;
- do not change impairment semantics unless a bug is discovered and documented;
- do not add a batch system until manual execution proves too error-prone;
- do not overclaim generality from one artifact and one seed.

## Suggested workflow

### 1. Finish subgoal-11 merge/push first

The user has merged `v0.9-subgoal-11` into local `main`. Push `main` before beginning subgoal 12.

```bash
git push origin main
git status
```

### 2. Start the branch

```bash
git checkout main
git pull origin main
git status
git checkout -b v0.9-subgoal-12
```

### 3. Add this design note first

Place this file at:

```text
docs/design/v0_9_12_epistemic_impairment_response_selected_support_geometries.md
```

Then commit and push:

```bash
git add docs/design/v0_9_12_epistemic_impairment_response_selected_support_geometries.md
git diff --check
git commit -m "Add epistemic impairment response experiment note"
git push origin HEAD:refs/heads/v0.9-subgoal-12
git status
```

### 4. Inspect before running the matrix

Before generating runs, inspect the Epistemic Designer and summary outputs to confirm exact impairment parameter names.

Suggested commands:

```bash
grep -n "loss\|delay\|noise\|decay\|support" frontend/app/epistemic/designer/page.tsx
sed -n '1,220p' backend/awsrt_core/schemas/epistemic.py
sed -n '1,260p' backend/awsrt_core/epistemic/option_a.py
```

If manual UI execution is sufficient, do not patch code.

### 5. Run the selected matrix manually

Record each run as:

```text
support_model | decay | impairment | epi_id | notes
```

Keep the run table in the working notes or a temporary CSV. If the matrix becomes unwieldy, consider creating an untracked helper table first rather than adding new production code.

### 6. Upload / inspect outputs

After completing the matrix, inspect:

- metric table;
- summary JSONs;
- render-debug JSONs;
- representative screenshots.

Only then decide whether a plotting script extension is needed.

## Candidate run table template

| Run | Support geometry | Decay | Impairment | epi_id | Notes |
|---:|---|---:|---|---|---|
| 1 | random_support | 0.1 | healthy |  |  |
| 2 | random_support | 0.1 | loss |  |  |
| 3 | random_support | 0.1 | delay |  |  |
| 4 | random_support | 0.1 | noise |  |  |
| 5 | random_support | 0.6 | healthy |  |  |
| 6 | random_support | 0.6 | loss |  |  |
| 7 | random_support | 0.6 | delay |  |  |
| 8 | random_support | 0.6 | noise |  |  |
| 9 | scanline_support | 0.1 | healthy |  |  |
| 10 | scanline_support | 0.1 | loss |  |  |
| 11 | scanline_support | 0.1 | delay |  |  |
| 12 | scanline_support | 0.1 | noise |  |  |
| 13 | scanline_support | 0.6 | healthy |  |  |
| 14 | scanline_support | 0.6 | loss |  |  |
| 15 | scanline_support | 0.6 | delay |  |  |
| 16 | scanline_support | 0.6 | noise |  |  |
| 17 | ring_support | 0.1 | healthy |  |  |
| 18 | ring_support | 0.1 | loss |  |  |
| 19 | ring_support | 0.1 | delay |  |  |
| 20 | ring_support | 0.1 | noise |  |  |
| 21 | ring_support | 0.6 | healthy |  |  |
| 22 | ring_support | 0.6 | loss |  |  |
| 23 | ring_support | 0.6 | delay |  |  |
| 24 | ring_support | 0.6 | noise |  |  |

## Possible stopping points

A clean stopping point for subgoal 12 could be one of the following:

1. **Design-only stop**
   - design note committed and pushed;
   - no run matrix yet.

2. **Scout matrix stop**
   - 16-run random/scanline matrix completed;
   - first analysis note created.

3. **Full selected matrix stop**
   - 24-run selected matrix completed;
   - metric interpretation completed;
   - decision made on whether plotting support is needed.

The recommended stopping point is either scout matrix completion or full selected matrix completion, depending on manual workload.

## Expected thesis integration

If successful, this subgoal will extend the Epistemic Surface results chapter with a second experimental section:

> Impairment response under selected support geometries

Possible thesis-facing result statement:

> Once impairment is introduced, prescribed support and realized arrivals no longer act only as control windows. Loss, delay, and noise expose different ways in which information flow can separate from maintained belief quality, even under the same support geometry and belief-decay setting.

This would strengthen the bridge from the Epistemic Surface back to the thesis's central claim that information arrival is not always useful.
