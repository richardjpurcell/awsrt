# AWSRT v0.2 Operational Usefulness Diagnostics

**Status:** Draft design note  
**Applies to:** `v0.2-dev`  
**Purpose:** Define the first compact diagnostic layer for distinguishing delivered observation activity, staleness, and misleadingness in AWSRT closed-loop operational runs.

---

## 1. Scope

This note defines the first operational usefulness diagnostics added for AWSRT `v0.2` closed-loop runs. The goal is not to provide a final theory of usefulness, nor to fully characterize all impairment effects. Instead, this note introduces a small set of run-level and step-level diagnostics that make it possible to distinguish among:

- continued observation activity,
- staleness due to delay,
- loss or non-arrival,
- and activity that appears operationally misleading.

These diagnostics are intended to support:

- inspection of closed-loop operational runs,
- comparison across impairment sweeps,
- interpretation of the usefulness wedge suggested by AWSRT `v0.1`,
- and later usefulness-aware control logic.

This note applies only to the operational layer. It does not redefine impairment semantics in the epistemic layer or unify all diagnostic logic across AWSRT.

---

## 2. Motivation

AWSRT `v0.1` suggested a central distinction between:

- **information continuing to arrive**, and
- **information remaining operationally useful for belief improvement**.

That distinction becomes especially important under impairment. Delay, noise, and loss do not affect usefulness in the same way:

- **delay** can preserve content while making it stale,
- **noise** can preserve activity while degrading or reversing usefulness,
- **loss** can suppress delivery altogether.

AWSRT `v0.2` therefore needs diagnostic quantities that do more than count arrivals. It needs quantities that help answer:

1. Are observations still arriving?
2. Are they arriving late?
3. Is belief still improving?
4. Are arriving observations becoming misleading?

The first diagnostics in this note are deliberately minimal, but they are sufficient to begin answering those questions.

---

## 3. Design principles

The diagnostics in this note follow the following principles.

### 3.1 Small before complete
The goal is not to build a large ontology of usefulness metrics. The goal is to add the smallest diagnostic layer that is operationally interpretable and experimentally useful.

### 3.2 Separate causes from consequences
The diagnostics distinguish:

- delivery activity,
- staleness,
- and belief-side consequences.

This is consistent with the v0.2 impairment semantics note, which separates impairment classes from usefulness degradation.

### 3.3 Use controller-compatible information when possible
Where feasible, diagnostics should be grounded in quantities that are compatible with the delivered observation stream and belief evolution actually seen in operational runs.

### 3.4 Prefer interpretable aggregates
Step-level series are useful for debugging, but summary-level aggregates are needed for comparisons and tables.

---

## 4. Step-level diagnostics

AWSRT `v0.2` now records the following per-step operational usefulness diagnostics.

### 4.1 Delivery activity diagnostics

#### `arrivals_frac[t]`
Fraction of sensors whose delivered observation at step `t` is present.

Interpretation:
- high values indicate continued delivery activity,
- low values indicate non-arrival at that step.

#### `detections_arrived_frac[t]`
Fraction of sensors whose delivered observation at step `t` is a positive detection.

Interpretation:
- this is a delivered positive-detection activity summary,
- not a direct correctness measure.

### 4.2 Delivery timing diagnostics

#### `obs_generation_step[t]`
The generation timestep of the observation being applied at step `t`.

For startup padding before the delay queue fills, this is `-1`.

#### `obs_delivery_step[t]`
The timestep at which the observation is applied. This is the current step `t`.

#### `obs_age_steps[t]`
The effective delivered age in timesteps:

- `obs_delivery_step[t] - obs_generation_step[t]` when valid,
- `-1` when no real generated observation is yet available.

Interpretation:
- `0` means same-step delivery,
- larger values indicate staleness due to delay.

### 4.3 Non-arrival diagnostic

#### `loss_frac[t]`
Fraction of sensors with no delivered observation at step `t`.

Current operational interpretation:
- this is best understood as a **no-delivered-observation fraction**,
- not yet as a pure physical channel-loss fraction,
- because startup delay padding also contributes to it.

This naming may later be refined.

### 4.4 Belief-side usefulness diagnostics

#### `delta_mean_entropy[t]`
Per-step change in mean entropy across the belief map.

Interpretation:
- negative values indicate entropy reduction,
- positive values indicate worsening uncertainty.

#### `usefulness_gap[t]`
Defined as:

\[
\mathrm{usefulness\_gap}(t)
=
\mathrm{arrivals\_frac}(t)
-
\max(0,\,-\Delta \bar H(t))
\]

Interpretation:
- large positive values mean delivered activity remains high while realized uncertainty reduction is weak,
- values near zero indicate closer alignment between activity and improvement.

This is a broad delivery-versus-improvement mismatch signal.

#### `misleading_activity[t]`
Defined as:

\[
\mathrm{misleading\_activity}(t)
=
\mathrm{arrivals\_frac}(t)\cdot \max(0, \Delta \bar H(t))
\]

Interpretation:
- positive values occur only when observations are arriving and mean entropy worsens,
- this is intended as a first corruption-sensitive indicator of misleading delivered activity.

This is not yet a formal correctness diagnostic. It is a practical first indicator that active delivered observations may be degrading belief rather than improving it.

---

## 5. Summary-level diagnostics

To support compact comparison across runs, AWSRT `v0.2` also records the following summary aggregates.

### 5.1 Delivery and timing summaries

#### `arrivals_frac_mean`
Mean delivered-arrival fraction over the run.

#### `obs_age_mean_valid`
Mean of `obs_age_steps[t]` over valid timesteps only, excluding `-1` startup padding entries.

#### `obs_age_max_valid`
Maximum valid delivered age observed during the run.

These provide compact indicators of average and worst-case staleness.

### 5.2 Information-value summary

#### `driver_info_true_mean`
Mean expected information-value proxy over the run.

In the current implementation this is the expected mutual-information-style proxy associated with the delayed observation source under the configured loss/noise assumptions.

Interpretation:
- higher values indicate the delivered observation stream is expected to retain information value,
- lower values indicate a weaker information-bearing stream,
- in particular, severe binary corruption can drive this value toward zero.

### 5.3 Usefulness and misleadingness summaries

#### `usefulness_gap_mean`
Mean of the per-step usefulness-gap series.

#### `usefulness_gap_max`
Maximum of the per-step usefulness-gap series.

These summarize delivery-versus-improvement mismatch over the run.

#### `misleading_activity_mean`
Mean of the per-step misleading-activity series.

#### `misleading_activity_max`
Maximum of the per-step misleading-activity series.

#### `misleading_activity_pos_frac`
Fraction of valid steps for which `misleading_activity[t] > 0`.

This is a particularly interpretable quantity: it measures how often active delivered observations are associated with worsening mean entropy.

#### `misleading_activity_ratio`
Defined as:

\[
\mathrm{misleading\_activity\_ratio}
=
\frac{\mathrm{misleading\_activity\_mean}}
{\max(\mathrm{usefulness\_gap\_mean}, \varepsilon)}
\]

with a small positive numerical floor \(\varepsilon\).

Interpretation:
- this normalizes the corruption-sensitive component by the broader delivery-versus-improvement mismatch baseline,
- it is intended to help distinguish broadly weak usefulness from specifically misleading activity.

---

## 6. Interpretation guidance

The new diagnostics should be interpreted together, not in isolation.

### 6.1 High arrivals with low age
This indicates observations are arriving promptly. If usefulness still degrades, corruption or other belief-side mismatch is more plausible than staleness.

### 6.2 High arrivals with high age
This indicates that the system remains active, but the stream is stale. This is the characteristic signature of delay-driven degradation.

### 6.3 High arrivals with high misleadingness
If `arrivals_frac_mean` remains high while `misleading_activity_*` rises and `driver_info_true_mean` falls, the stream is active but likely misleading. This is the characteristic signature of corruption-driven degradation.

### 6.4 Low arrivals
This indicates non-arrival or startup padding effects. At present, `loss_frac` combines those two sources, so interpretation should account for configured delay.

### 6.5 TTFD remains necessary but insufficient
`ttfd_true` and `ttfd_arrived` remain useful timing checks, but they do not by themselves explain whether a delivered stream remains helpful over the full run. The usefulness and misleadingness diagnostics are intended to complement TTFD rather than replace it.

---

## 7. First three-case validation

The first validation of these diagnostics used three operational runs under the same policy family:

- ideal,
- delayed,
- and noisy.

The purpose was not to make headline scientific claims, but to check whether the new diagnostics separate three qualitatively different regimes.

### 7.1 Validation table

| Case | arrivals_frac_mean | obs_age_mean_valid | obs_age_max_valid | driver_info_true_mean | misleading_activity_pos_frac | misleading_activity_ratio | ttfd_true | ttfd_arrived |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Ideal | 1.0 | 0.0 | 0 | 0.0004911501 | 0.1206030 | 5.6901517e-06 | 42 | 42 |
| Delay = 4 | 0.9800000 | 4.0 | 4 | 0.0005691932 | 0.1809045 | 1.4266696e-05 | 67 | 71 |
| Noise = 0.5 | 1.0 | 0.0 | 0 | 0.0 | 0.5276382 | 4.4336289e-05 | 80 | 0 |

### 7.2 Interpretation of the validation

#### Ideal
The ideal run shows:
- full delivery activity,
- zero delivered age,
- matching true and arrived TTFD,
- and the lowest misleadingness summaries of the three cases.

This is the intended baseline.

#### Delay
The delay run shows:
- slightly reduced mean arrivals because startup queue padding is included in the run average,
- explicit staleness through `obs_age_mean_valid = 4`,
- and a four-step lag between `ttfd_true` and `ttfd_arrived`.

Misleadingness rises somewhat relative to ideal, but the dominant signal is staleness.

#### Noise
The noise run shows:
- full delivery activity,
- zero delivered age,
- a collapse of `driver_info_true_mean` to zero,
- sharply increased misleadingness summaries,
- and a severe divergence between `ttfd_true` and `ttfd_arrived`.

This is the clearest current signature of corruption-driven usefulness failure.

### 7.3 Result of the validation
The diagnostics successfully separate:

- **timely and mostly well-behaved** ideal operation,
- **stale but not equivalently misleading** delayed operation,
- and **timely but misleading** corrupted operation.

That is sufficient to justify keeping these diagnostics as the first operational usefulness layer in AWSRT `v0.2`.

---

## 8. Current limitations

These diagnostics are intentionally first-pass and have several limitations.

### 8.1 `usefulness_gap` is broad, not specific
`usefulness_gap` is useful as a mismatch signal, but it is not by itself a direct impairment-severity score. It remains high even in healthy runs when entropy reductions are small per step.

### 8.2 `misleading_activity` is sensitive, not binary
Even ideal runs can show nonzero `misleading_activity` because local entropy can fluctuate upward briefly. The metric should be interpreted as a tendency, not a clean on/off failure flag.

### 8.3 `loss_frac` currently mixes startup padding and non-arrival
At present, startup delay padding and true non-arrival both appear in `loss_frac`. A later revision may split this into:
- `no_arrival_frac`,
- and a stricter true-loss event summary.

### 8.4 Mean entropy is only one belief-quality summary
These diagnostics currently use mean entropy as the primary belief-side signal. Later versions may extend this to other belief-quality summaries or region-specific quantities.

---

## 9. Non-goals for this stage

This diagnostic layer does **not** yet attempt to provide:

- a formal theory of usefulness,
- a full causal decomposition of delivery versus correctness failures,
- privileged latent-state correctness labels for the controller,
- or a final paper-ready impairment taxonomy.

Its purpose is narrower: to provide a compact and interpretable operational diagnostic layer that supports v0.2 development and initial impairment-aware studies.

---

## 10. Recommended use in v0.2

For v0.2 operational comparisons, the following compact set is recommended as the default usefulness-diagnostic view:

- `arrivals_frac_mean`
- `obs_age_mean_valid`
- `obs_age_max_valid`
- `driver_info_true_mean`
- `misleading_activity_pos_frac`
- `misleading_activity_ratio`
- `ttfd_true`
- `ttfd_arrived`

This set is small enough for routine comparison tables while still separating:
- delivery activity,
- staleness,
- information-value loss,
- and misleading belief effects.

---

## 11. Short summary

AWSRT `v0.2` now includes a first operational usefulness-diagnostic layer that distinguishes:

- whether observations are still arriving,
- whether they are stale,
- whether their expected information value has weakened,
- and whether continued delivered activity is associated with worsening belief.

The first validation across ideal, delayed, and noisy runs shows that these diagnostics already separate stale-but-active behavior from timely-but-misleading behavior. This provides a practical foundation for later usefulness-aware control logic and more serious impairment diagnostics.