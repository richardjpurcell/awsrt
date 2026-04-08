# AWSRT v0.2 Usefulness Validation

**Status:** Revised design note  
**Applies to:** `v0.2-subgoal-d`  
**Purpose:** Define and track a disciplined validation program for AWSRT `v0.2` operational usefulness diagnostics and the first usefulness-aware control prototype.

---

## 1. Scope

This note defines **Subgoal D** for AWSRT `v0.2`: validating that the newly
added usefulness diagnostics and the first usefulness-aware controller produce
behavior that is:

- interpretable,
- operationally meaningful,
- experimentally auditable,
- and consistent with the intended `v0.2` development story.

This note follows two earlier design notes:

- `docs/design/operational_usefulness_diagnostics_v0_2.md`
- `docs/design/usefulness_aware_control_v0_2.md`

Those notes define:

- the first usefulness-diagnostic layer,
- and the first usefulness-aware control bridge.

This note defines how those additions should now be **validated**.

It does **not** define a final paper-ready experimental campaign, a full
`v0.2` controller architecture, or the final three-regime usefulness-aware
controller. It defines the next disciplined experimental step.

### Validation status and handoff

A compact first-pass validation subset has now been run for:

- ideal,
- delay-heavy,
- and noise-heavy cases,

using the first usefulness-aware prototype, followed by a fixed-policy audit
across representative baselines and a limited harder-world check.

These results support the intended qualitative separation among:

- healthy/timely operation,
- stale-but-active operation under delay,
- and timely-but-misleading operation under observation corruption.

The current validated core is therefore no longer hypothetical. Subgoal D has
now reached a meaningful compact validation checkpoint.

---

## 2. Motivation

Subgoal B established that AWSRT can now distinguish, at least in a first-pass
way, among:

- continued observation activity,
- staleness due to delay,
- reduced information value,
- and activity that appears operationally misleading.

Subgoal C then established a minimal usefulness-aware controller prototype that
responds to those signals through a simple exploit/caution regime distinction.

At this point, further controller expansion is **not yet** the main need. The
main need is to verify that:

1. the diagnostics behave as intended across controlled impairment cases,
2. the controller responds for the right reasons,
3. the response remains quiet in healthy conditions,
4. and the whole mechanism remains interpretable enough to support later extension.

Subgoal D therefore shifts the development emphasis from:

- **building new machinery**

to

- **auditing and validating the machinery already added**.

---

## 3. Development stance

Subgoal D should be carried out with the same development stance used elsewhere
in AWSRT `v0.2`:

- **small before broad**
- **controlled before sweeping**
- **interpretable before optimized**
- **auditable before elaborate**

This means the first validation should avoid:

- large preset proliferation,
- many new controller variants,
- immediate harder-world exhaustive sweeps,
- or broad claims about best policy performance.

Instead, Subgoal D should validate one compact diagnostic-and-control story in
layers.

---

## 4. What is being validated

Subgoal D validates two connected additions.

### 4.1 Usefulness diagnostics

The operational diagnostic layer now includes quantities such as:

- `arrivals_frac`
- `obs_age_steps`
- `driver_info_true`
- `usefulness_gap`
- `misleading_activity`
- recent-window support summaries built from those quantities

These diagnostics should now be checked for:

- directional correctness,
- interpretability,
- and stable behavior across representative impairment cases.

### 4.2 First usefulness-aware control prototype

The first control prototype currently uses a minimal exploit/caution distinction
driven by recent-window usefulness signals.

This prototype should now be checked for:

- quiet behavior in ideal conditions,
- staleness-driven caution under delay,
- misleadingness-driven caution under corruption,
- and legible transition behavior in step traces.

---

## 5. Validation philosophy

The goal of Subgoal D is **not** to prove that the current prototype is final or
optimal.

The goal is narrower:

> demonstrate that AWSRT now has a compact, interpretable usefulness-diagnostic
> and usefulness-response layer that behaves sensibly under controlled
> conditions.

A successful Subgoal D result means:

- the current machinery is scientifically usable,
- and later extension to richer regime logic is justified.

An unsuccessful result means:

- the diagnostics or transitions remain confusing,
- and the next development step should still be refinement rather than expansion.

### Current empirical reading

The current first-pass evidence supports the following interpretation:

- the prototype remains quiet under ideal conditions,
- delay-heavy runs enter caution for staleness-driven reasons,
- and noise-impaired runs enter caution for corruption-side reasons while
  remaining timely rather than stale.

A further nuance should also be recorded:

- the corruption-side retuning fixed the earlier false-negative problem,
- but the current noise ladder (`0.1–0.3`) remains somewhat compressed in
  caution occupancy.

This does **not** invalidate Subgoal D. It means that qualitative separation is
now in place, while finer severity calibration may still be improved later.

---

## 6. Validation layers

Validation should proceed in four layers.

### 6.1 Layer 1 — impairment-diagnostic verification

**Purpose:** verify that the diagnostic quantities separate ideal, delay-heavy,
noise-heavy, loss-heavy, and mixed cases in the intended qualitative way.

**Main question:** do the diagnostics reflect the right kind of impairment?

This layer is primarily about:

- `arrivals_frac`
- `obs_age_steps`
- `driver_info_true`
- `misleading_activity`
- recent-window support summaries

### 6.2 Layer 2 — fixed-policy usefulness audit

**Purpose:** verify that the wedge and usefulness diagnostics remain
interpretable under fixed policy families.

**Main question:** do baseline or fixed-policy runs show diagnostic patterns
that are consistent with their impairment conditions?

This layer keeps policy fixed and interprets:

- greedy
- uncertainty
- `mdc_info`

under selected impairment cases.

### 6.3 Layer 3 — usefulness-aware regime audit

**Purpose:** verify that the current usefulness-aware prototype changes regime
behavior for the intended reasons.

**Main question:** does the controller enter caution when it should, and remain
exploitative when it should?

This is the main Subgoal D controller-validation layer.

### 6.4 Layer 4 — limited harder-world check

**Purpose:** ensure the behavior is not purely an artifact of the simplest
reference world.

**Main question:** does the same interpretive pattern survive on a small
selected harder-world subset?

This layer should remain intentionally limited.

---

## 7. Experiment groups

Subgoal D should use a small, explicit experiment family.

### 7.1 Experiment Group 1 — impairment-diagnostic verification

**Purpose:** verify diagnostic directionality and separation.

**Recommended cases:**

- ideal
- delay-focused case
- noise-focused case
- loss-focused case
- one mixed impairment case

**Current validated compact subset:**

- ideal
- delay = 4
- noise = 0.1
- noise = 0.2
- noise = 0.3

**Recommended noise ladder discipline:**

- `noise = 0.1` → moderate / realistic
- `noise = 0.2` → strong but still plausible
- `noise = 0.3` → stress case
- `noise = 0.5` → boundary / extreme stress only

**Primary quantities to inspect:**

- `arrivals_frac_mean`
- `obs_age_mean_valid`
- `obs_age_max_valid`
- `driver_info_true_mean`
- `misleading_activity_pos_frac`
- `misleading_activity_ratio`
- `recent_obs_age_mean_valid_last`
- `recent_misleading_activity_pos_frac_last`
- `recent_driver_info_true_mean_last`
- `ttfd_true`
- `ttfd_arrived`

**Expected pattern:**

- ideal: timely, low sustained misleadingness, non-collapsed information value
- delay: high age, active stream, caution should be explainable by staleness
- noise: weakened information value, higher misleadingness, caution should be
  explainable by corruption-sensitive signals
- loss: lower activity or arrival fraction, distinguishable from stale-but-active
  and misleading-but-active cases
- mixed: hybrid behavior, but still interpretable in terms of combined signal
  movement

### 7.2 Experiment Group 2 — fixed-policy usefulness audit

**Purpose:** audit diagnostics under fixed policy families.

**Recommended policies:**

- greedy
- uncertainty
- `mdc_info`

**Recommended world:**

- simple reference world

**Recommended impairment subset:**

- ideal
- one delay-heavy case
- one noise-heavy case

**Questions:**

1. Do the usefulness diagnostics remain legible across policy families?
2. Do delay and noise still separate as stale-but-active versus timely-but-misleading?
3. Does the wedge story remain visible under the current `v0.2` diagnostics?

This group is diagnostic-first, not leaderboard-first.

### 7.3 Experiment Group 3 — usefulness-aware prototype audit

**Purpose:** validate the first exploit/caution prototype directly.

**Recommended controller under test:**

- `usefulness_proto`

**Recommended comparison baselines:**

- greedy
- uncertainty
- `mdc_info`

**Recommended impairment subset:**

- ideal
- delay-heavy
- noise-heavy
- one mixed case

**Current validated compact subset:**

- ideal
- delay = 4
- noise = 0.1
- noise = 0.2
- noise = 0.3

**Primary controller quantities to inspect:**

- `usefulness_regime_state_last`
- `usefulness_regime_state_exploit_frac`
- `usefulness_regime_state_caution_frac`
- `usefulness_trigger_caution_hits`
- `usefulness_trigger_exploit_hits`

**Primary support quantities to inspect alongside them:**

- `recent_obs_age_mean_valid`
- `recent_misleading_activity_mean`
- `recent_misleading_activity_pos_frac`
- `recent_driver_info_true_mean`

**Expected first-pass behavior:**

- ideal: mostly or entirely exploit
- delay: caution occupancy driven mainly by age or staleness
- noise: caution occupancy driven mainly by misleadingness or weakened
  information value
- mixed: caution occupancy explainable by combined support degradation

**Current nuance to preserve in interpretation:**

- the earlier corruption-side false negative is now resolved,
- but noise `0.1–0.3` currently produces somewhat compressed caution occupancy,
- so the present prototype is best treated as qualitatively validated rather than
  finely severity-calibrated.

This group is the core of Subgoal D.

### 7.4 Experiment Group 4 — limited harder-world check

**Purpose:** verify that the story survives beyond the easiest geometry.

**Recommended world:**

- harder corner-fire world, or equivalent harder geometry already used elsewhere
  in AWSRT

**Recommended subset:**

- ideal
- one delay-heavy case
- one noise-heavy case

**Recommended controller subset:**

- `mdc_info`
- `usefulness_proto`

**Questions:**

1. Does the exploit/caution distinction still appear?
2. Do the diagnostic quantities remain interpretable?
3. Does harder geometry sharpen differences without breaking the logic?

This group should remain small and confirmatory.

---

## 8. Validation outputs

Subgoal D should produce a small, stable output set.

### 8.1 Compact impairment audit table

A single compact table for Experiment Group 1.

**Recommended columns:**

- case
- arrivals_frac_mean
- obs_age_mean_valid
- obs_age_max_valid
- driver_info_true_mean
- misleading_activity_pos_frac
- recent_obs_age_mean_valid_last
- recent_misleading_activity_pos_frac_last
- recent_driver_info_true_mean_last
- ttfd_true
- ttfd_arrived

This is the main compact diagnostic verification artifact.

### 8.2 Aligned step-trace figure

A trace-style figure for one or two selected runs.

**Recommended aligned panels:**

- recent age support
- recent misleadingness support
- recent driver-info support
- mean entropy / delta entropy
- usefulness regime state
- trigger activity

**Purpose:** show *why* the controller entered or remained in caution.

### 8.3 Regime timeline figure

A simple timeline for one representative run, especially under delay and noise.

**Recommended contents:**

- exploit/caution state over time
- caution/exploit triggers
- key supporting recent-window signals

This figure should answer:

> when did the transition happen, and why?

### 8.4 Small appendix-style audit summary

A compact summary for the usefulness-aware prototype across the selected cases.

**Recommended columns:**

- case
- exploit_frac
- caution_frac
- caution_hits
- exploit_hits
- final_state
- recent_age_last
- recent_misleading_pos_frac_last
- recent_driver_info_last

This is the main controller audit table.

---

## 9. Current compact validation results

### 9.1 Compact usefulness-prototype audit table

The following compact table records the currently validated first-pass Subgoal D
`usefulness_proto` subset.

| Case | Delay | Noise | Loss | arrivals_frac_mean | obs_age_mean_valid | misleading_activity_pos_frac | recent_obs_age_mean_valid_last | recent_misleading_activity_pos_frac_last | driver_info_true_mean | recent_driver_info_true_mean_last | ttfd_true | ttfd_arrived | exploit_frac | caution_frac | caution_hits | exploit_hits | Interpretable reading |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Ideal | 0 | 0.0 | 0.0 | 1.000 | 0.0 | 0.146 | 0.0 | 0.0 | 0.000465 | 0.000277 | 59 | 59 | 1.00 | 0.00 | 0 | 109 | Healthy/timely baseline. No staleness, no sustained recent misleadingness, and the prototype stays exploit. |
| Delay-heavy | 4 | 0.0 | 0.0 | 0.980 | 4.0 | 0.201 | 4.0 | 0.0 | 0.000551 | 0.000387 | 63 | 67 | 0.03 | 0.97 | 196 | 0 | Stale-but-active case. Arrival activity remains high, but age is persistently elevated; the prototype moves strongly to caution for staleness reasons. |
| Noise 0.1 | 0 | 0.1 | 0.0 | 1.000 | 0.0 | 0.397 | 0.0 | 0.0 | 0.000754 | 0.000772 | 63 | 0 | 0.01 | 0.99 | 6 | 3 | Lower-noise corruption case. Arrivals remain timely and age stays at zero, but corruption-side support is already strong enough in the current prototype to produce a caution-dominant response. This is therefore not a clean exploitative mild-noise case, but the weakest member of the current corruption-driven caution regime. |
| Noise 0.2 | 0 | 0.2 | 0.0 | 1.000 | 0.0 | 0.472 | 0.0 | 0.300 | 0.000509 | 0.000525 | 75 | 0 | 0.01 | 0.99 | 9 | 0 | Moderate corruption case. Timely arrivals continue, but recent misleadingness now reaches a caution-worthy level; the prototype enters and largely remains in caution for corruption-side reasons rather than staleness. |
| Noise 0.3 | 0 | 0.3 | 0.0 | 1.000 | 0.0 | 0.563 | 0.0 | 0.500 | 0.000232 | 0.000254 | 81 | 0 | Stress corruption case. Misleadingness is high, useful information weakens further, and the prototype remains strongly in caution while staying timely rather than stale. |

### 9.2 Reading of the compact audit table

The table supports the main intended first-pass Subgoal D story:

- ideal remains exploitative,
- delay pushes the controller into caution because age and staleness remain
  persistently high,
- and noise-impaired runs push the controller into caution through
  corruption-side signals rather than staleness.

At the same time, the table makes an important calibration nuance explicit:

- in the current prototype, the noise ladder `0.1–0.3` is qualitatively well
  separated from delay,
- but it remains somewhat compressed in exploit/caution occupancy,
- since even `noise = 0.1` already produces a caution-dominant response.

Accordingly, the current first-pass Subgoal D validation supports the following
compact interpretation:

- ideal -> exploit,
- delay -> caution because of staleness,
- noise -> caution because of corruption-sensitive support degradation while
  remaining timely rather than stale.

Within that corruption-side family, severity is still visible in the support
quantities:

- `noise = 0.1` is the weakest member of the current corruption-driven caution
  regime,
- `noise = 0.2` strengthens the corruption-side caution evidence,
- `noise = 0.3` remains the harsher corruption stress case.

This is still a useful validation outcome, because the prototype now clearly
shows:

- separation between staleness-driven and corruption-driven caution,
- and an interpretable corruption-side degradation ladder in the support signals,

even though the current exploit/caution occupancy fractions remain somewhat
compressed across the `0.1–0.3` noise range.

### 9.3 Compact trace-level confirmation

Representative trace-level confirmation now supports the intended causal reading
for both delay and noise.

#### Representative delay confirmation

For the representative `delay = 4` usefulness-prototype run:

- `arrivals_frac_mean = 0.98`
- `obs_age_mean_valid = 4.0`
- `recent_obs_age_mean_valid_last = 4.0`
- `recent_misleading_activity_pos_frac_last = 0.0`
- `caution_frac = 0.97`
- `exploit_frac = 0.03`
- `caution_hits = 196`
- `exploit_hits = 0`

This is consistent with a **stale-but-active** regime: arrival activity remains
high, age remains pinned at the imposed delay level, misleadingness is not the
dominant end-of-run explanation, and the controller stays almost entirely in
caution for staleness-driven reasons.

#### Representative noise confirmation

For the representative `noise = 0.2` usefulness-prototype run:

- `arrivals_frac_mean = 1.0`
- `obs_age_mean_valid = 0.0`
- `recent_obs_age_mean_valid_last = 0.0`
- `misleading_activity_pos_frac = 0.472`
- `recent_misleading_activity_pos_frac_last = 0.300`
- `caution_frac = 0.99`
- `exploit_frac = 0.01`
- `caution_hits = 9`
- `exploit_hits = 0`

This is consistent with a **timely-but-misleading** regime: arrival activity
remains fully active, age remains zero, corruption-side misleadingness is
elevated, and the controller stays almost entirely in caution for
corruption-side reasons rather than staleness.

#### Interpretation

These representative confirmations strengthen the compact Subgoal D reading:

- delay-side caution is explainable by persistent staleness,
- noise-side caution is explainable by persistent corruption-side support
  degradation,
- and the prototype’s exploit/caution distinction is now causally interpretable
  in both representative degraded cases.

---

## 10. Fixed-policy usefulness audit

### 10.1 Greedy subset

This subsection records the fixed-policy usefulness-audit results for the
**greedy** baseline. The purpose of this audit is narrower than the
usefulness-aware prototype audit. It does not ask whether greedy enters a
usefulness regime, because no usefulness-aware regime logic is active in these
runs. Instead, it asks whether the newly added usefulness diagnostics remain
interpretable under a fixed, non-usefulness-aware policy.

At this stage, the answer appears to be yes.

The greedy runs preserve the intended directional separation among the compact
impairment cases:

- **ideal** remains timely and comparatively healthy,
- **delay-heavy** appears as a stale-but-active case,
- **noise-impaired** appears as a timely-but-misleading case.

This matters because it shows that the usefulness diagnostics are not merely
self-confirming internal signals of `usefulness_proto`. They remain legible even
when the deployment policy itself is a fixed baseline.

#### Greedy compact audit table

| Case | Delay | Noise | Loss | arrivals_frac_mean | obs_age_mean_valid | misleading_activity_pos_frac | recent_obs_age_mean_valid_last | recent_misleading_activity_pos_frac_last | driver_info_true_mean | recent_driver_info_true_mean_last | ttfd_true | ttfd_arrived | Interpretable reading |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Greedy · ideal | 0 | 0.0 | 0.0 | 1.000 | 0.0 | 0.146 | 0.0 | 0.0 | 0.000465 | 0.000277 | 59 | 59 | Healthy/timely greedy baseline. No staleness, low misleadingness, and normal information level. |
| Greedy · delay-heavy | 4 | 0.0 | 0.0 | 0.980 | 4.0 | 0.211 | 4.0 | 0.0 | 0.000477 | 0.000303 | 67 | 71 | Stale-but-active greedy case. Arrival activity remains high, but observation age is persistently elevated and arrived detection timing is delayed. |
| Greedy · noise 0.2 | 0 | 0.2 | 0.0 | 1.000 | 0.0 | 0.543 | 0.0 | 0.500 | 0.000291 | 0.000342 | 89 | 0 | Timely-but-misleading greedy case. No staleness, but misleadingness is substantially elevated and information value is weaker than in the ideal and delay cases. |

#### Reading of the greedy table

The greedy subset supports the same qualitative impairment reading already seen
in the usefulness-aware prototype audit, but now under a fixed baseline policy.

First, the **ideal greedy** run behaves as expected for a healthy baseline:
arrival activity is complete, observation age remains zero, misleading activity
stays comparatively low, and recent-window support quantities remain quiet.

Second, the **delay-heavy greedy** run is clearly distinguishable from ideal by
its persistent staleness signature. Arrival activity remains high
(`arrivals_frac_mean ≈ 0.98`), but the observation stream is no longer timely:
`obs_age_mean_valid = 4.0`, `recent_obs_age_mean_valid_last = 4.0`, and arrived
detection timing is delayed relative to true detection timing. This is therefore
best read as a **stale-but-active** fixed-policy case.

Third, the **noise-impaired greedy** run is distinguishable from both ideal and
delay in a different way. Observation age remains zero, so the run is not
stale. However, misleadingness rises substantially
(`misleading_activity_pos_frac ≈ 0.543`,
`recent_misleading_activity_pos_frac_last = 0.500`), while
`driver_info_true_mean` is weaker than in the ideal and delay cases. This is
best read as a **timely-but-misleading** fixed-policy case.

### 10.2 Uncertainty subset

This subsection records the fixed-policy usefulness-audit results for the
**uncertainty** baseline. As with the greedy subset, the purpose here is not to
ask whether the controller itself enters a usefulness-aware regime, because
`usefulness_proto` is not enabled in these runs. Instead, the goal is to check
whether the usefulness diagnostics remain directionally interpretable under a
fixed exploratory baseline.

The current uncertainty subset indicates that they do.

Across the compact cases now run, the uncertainty policy still preserves the
intended diagnostic separation:

- **ideal** remains timely and comparatively healthy,
- **delay-heavy** remains distinguishable as a stale-but-active case,
- **noise-impaired** remains distinguishable as a timely-but-misleading case.

This is useful because uncertainty is operationally quite different from greedy.
If the same compact usefulness diagnostics remain interpretable here as well,
that strengthens the claim that the Subgoal D diagnostic layer is not merely a
policy-specific artifact.

#### Uncertainty compact audit table

| Case | Delay | Noise | Loss | arrivals_frac_mean | obs_age_mean_valid | misleading_activity_pos_frac | recent_obs_age_mean_valid_last | recent_misleading_activity_pos_frac_last | driver_info_true_mean | recent_driver_info_true_mean_last | ttfd_true | ttfd_arrived | Interpretable reading |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Uncertainty · ideal | 0 | 0.0 | 0.0 | 1.000 | 0.0 | 0.186 | 0.0 | 0.0 | 0.000506 | 0.000255 | 58 | 58 | Healthy/timely uncertainty baseline. No staleness, no sustained recent misleadingness, and normal information value. |
| Uncertainty · delay-heavy | 4 | 0.0 | 0.0 | 0.980 | 4.0 | 0.317 | 4.0 | 0.0 | 0.000491 | 0.000421 | 54 | 58 | Stale-but-active uncertainty case. Arrival activity remains high, but age is persistently elevated and arrived detection timing is delayed relative to true detection timing. |
| Uncertainty · noise 0.2 | 0 | 0.2 | 0.0 | 1.000 | 0.0 | 0.653 | 0.0 | 0.400 | 0.000399 | 0.000489 | 91 | 0 | Timely-but-misleading uncertainty case. No staleness is present, but misleadingness is substantially elevated and recent corruption-side support remains active. |

#### Reading of the uncertainty table

The uncertainty subset supports the same intended qualitative separation already
seen in the usefulness-aware prototype and greedy fixed-policy subsets.

First, the **ideal uncertainty** run behaves like a healthy exploratory
baseline. Arrival activity is complete, observation age stays at zero, recent
age support remains quiet, and recent misleadingness is absent at the end of the
episode.

Second, the **delay-heavy uncertainty** run is clearly separated from ideal by
persistent staleness rather than corruption. Arrival activity remains high
(`arrivals_frac_mean ≈ 0.98`), but `obs_age_mean_valid = 4.0` and
`recent_obs_age_mean_valid_last = 4.0`, while recent misleadingness remains zero
at the end of the episode. This is therefore best read as a **stale-but-active**
fixed-policy case.

Third, the **noise-impaired uncertainty** run is separated from both ideal and
delay in the corruption direction. Observation age remains zero throughout, so
the run is not stale. However, misleadingness rises sharply
(`misleading_activity_pos_frac ≈ 0.653`,
`recent_misleading_activity_pos_frac_last = 0.400`), while
`driver_info_true_mean` is lower than in the ideal and delay cases. This is
best read as a **timely-but-misleading** uncertainty case.

### 10.3 `mdc_info` subset

This subsection records the fixed-policy usefulness-audit results for the
**`mdc_info`** baseline. The compact `mdc_info` subset also supports the
intended Subgoal D separation between delay-side staleness and noise-side
corruption.

#### `mdc_info` compact audit table

| Case | Delay | Noise | Loss | arrivals_frac_mean | obs_age_mean_valid | misleading_activity_pos_frac | recent_obs_age_mean_valid_last | recent_misleading_activity_pos_frac_last | driver_info_true_mean | recent_driver_info_true_mean_last | ttfd_true | ttfd_arrived | Interpretable reading |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| `mdc_info` · ideal | 0 | 0.0 | 0.0 | 1.000 | 0.0 | 0.121 | 0.0 | 0.0 | 0.000491 | 0.000529 | 42 | 42 | Healthy/timely `mdc_info` baseline. Arrivals remain ideal, age stays at zero, misleadingness stays low, and the information driver remains non-collapsed. |
| `mdc_info` · delay-heavy | 4 | 0.0 | 0.0 | 0.980 | 4.0 | 0.181 | 4.0 | 0.0 | 0.000569 | 0.000319 | 67 | 71 | Stale-but-active `mdc_info` case. Arrival activity remains high, but the age signal is persistently elevated and detection timing slips, while recent misleadingness remains low. |
| `mdc_info` · noise 0.2 | 0 | 0.2 | 0.0 | 1.000 | 0.0 | 0.497 | 0.0 | 0.500 | 0.000510 | 0.000547 | 74 | 0 | Timely-but-misleading `mdc_info` case. Arrivals remain timely, age remains zero, but misleadingness rises sharply and recent corruption-side support stays elevated. |

#### Reading of the `mdc_info` table

This compact `mdc_info` subset is consistent with the same qualitative
impairment logic already seen in the prototype audit and the other fixed-policy
subsets:

- ideal remains healthy and timely,
- delay preserves activity but pushes the run into a stale-but-active condition,
- noise preserves timeliness but pushes the run into a timely-but-misleading
  condition.

In other words, even when the policy is held fixed at `mdc_info`, the
usefulness diagnostics still separate the two main degradation modes in the
intended way:

- **delay** is primarily visible through age and delayed arrival timing,
- **noise** is primarily visible through elevated misleadingness rather than
  staleness.

### 10.4 Cross-policy synthesis

Taken together, the current fixed-policy subsets support a narrow but important
Subgoal D conclusion: the usefulness diagnostics remain interpretable across
multiple policy families, not only within the usefulness-aware prototype.

Across **greedy**, **uncertainty**, and **`mdc_info`**, the same compact
directional structure survives:

- **ideal** runs remain timely and comparatively healthy,
- **delay-heavy** runs remain **stale-but-active**,
- **noise-impaired** runs remain **timely-but-misleading**.

This cross-policy consistency matters more, at this stage, than any simple
policy ranking. The present fixed-policy audit is not primarily a leaderboard
exercise. Its purpose is to check whether the new diagnostics continue to say
something operationally legible when attached to substantively different
deployment styles.

The current answer appears to be yes.

More specifically, the three fixed-policy subsets jointly suggest that:

- the **age-based quantities** are consistently the clearest markers of
  delay-heavy degradation,
- the **misleadingness quantities** are consistently the clearest markers of
  corruption-heavy degradation,
- and the **driver-information quantities** remain useful supporting evidence,
  even when their absolute level varies by policy.

What this establishes is narrower and more valuable for the present stage:

> the compact usefulness diagnostics now appear operationally legible across the
> usefulness-aware prototype and across representative fixed-policy baselines.

---

## 11. Limited harder-world check

### 11.1 `usefulness_proto` harder-world subset

This subsection records the first limited harder-world check for
`usefulness_proto`. The purpose is deliberately narrow: verify that the compact
Subgoal D story is not merely an artifact of the simplest reference world.

The current harder-world subset includes the same usual compact trio:

- ideal,
- delay-heavy,
- noise-heavy.

At this stage, the harder-world results support the same intended qualitative
reading already established on the simple world:

- **ideal** remains healthy and exploitative,
- **delay-heavy** remains stale-but-active and caution-dominant,
- **noise-heavy** remains timely-but-misleading and caution-dominant.

This is exactly the kind of limited confirmation Subgoal D was meant to obtain
before any broader harder-world expansion.

#### Harder-world compact audit table

| Case | Delay | Noise | Loss | arrivals_frac_mean | obs_age_mean_valid | misleading_activity_pos_frac | recent_obs_age_mean_valid_last | recent_misleading_activity_pos_frac_last | driver_info_true_mean | recent_driver_info_true_mean_last | ttfd_true | ttfd_arrived | exploit_frac | caution_frac | caution_hits | exploit_hits | Interpretable reading |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Harder world · ideal | 0 | 0.0 | 0.0 | 1.000 | 0.0 | 0.156 | 0.0 | 0.0 | 0.000472 | 0.000390 | 73 | 73 | 1.00 | 0.00 | 0 | 88 | Healthy/timely harder-world baseline. No staleness, no sustained recent misleadingness, and the prototype stays exploitative. |
| Harder world · delay-heavy | 4 | 0.0 | 0.0 | 0.980 | 4.0 | 0.211 | 4.0 | 0.0 | 0.000558 | 0.000851 | 81 | 85 | 0.03 | 0.97 | 196 | 0 | Stale-but-active harder-world case. Arrival activity remains high, but age is pinned at the imposed delay level and arrived detection timing slips; the prototype stays strongly caution-dominant for staleness reasons. |
| Harder world · noise 0.2 | 0 | 0.2 | 0.0 | 1.000 | 0.0 | 0.513 | 0.0 | 0.400 | 0.000507 | 0.000523 | 96 | 0 | 0.01 | 0.99 | 9 | 0 | Timely-but-misleading harder-world case. Arrivals remain fully timely and age stays at zero, but corruption-side misleadingness is elevated and the prototype remains strongly caution-dominant for corruption-side reasons rather than staleness. |

### 11.2 Reading of the harder-world table

The limited harder-world check supports the same compact interpretation already
seen on the simple world.

First, the **harder-world ideal** run remains clearly exploitative. Arrival
activity is complete, observation age remains zero, recent misleadingness is
quiet at the end of the run, and exploit occupancy remains complete. The harder
geometry does not, by itself, force a spurious caution regime.

Second, the **harder-world delay-heavy** run remains clearly
**stale-but-active**. Arrival activity is still high
(`arrivals_frac_mean ≈ 0.98`), but both the episode-average and recent-window
age quantities are pinned at `4.0`, and arrived detection timing is delayed
relative to true detection timing. At the same time, recent misleadingness
remains zero at the end of the run. This remains a staleness-driven caution
case, not a corruption-driven one.

Third, the **harder-world noise-heavy** run remains clearly
**timely-but-misleading**. Observation age stays at zero, so the run is not
stale. However, misleadingness rises substantially
(`misleading_activity_pos_frac ≈ 0.513`,
`recent_misleading_activity_pos_frac_last = 0.400`), while the prototype remains
almost entirely in caution. This is therefore the same corruption-side caution
story already seen on the simple world, now surviving under harder geometry.

### 11.3 Interpretation for Subgoal D

This limited harder-world check is a useful confirmatory result.

It does **not** establish a broad harder-world study, and it should not yet be
over-read as a paper-scale robustness claim. But it does support the intended
Subgoal D question:

> does the compact exploit-versus-caution interpretation survive beyond the
> easiest geometry?

At present, the answer appears to be yes.

The harder-world subset therefore supports the following narrow conclusion:

- the compact usefulness-diagnostic story is not confined to the simplest world,
- ideal still reads as healthy and exploitative,
- delay still reads as stale-but-active,
- noise still reads as timely-but-misleading,
- and the usefulness-aware prototype preserves the same qualitative control
  response under this limited harder-world check.

---

## 12. Success criteria

Subgoal D should be considered successful if the following hold.

### 12.1 Diagnostic correctness

The controlled impairment cases separate in the intended qualitative way:

- delay primarily raises age or staleness signals,
- noise primarily raises misleadingness or weakened-information signals,
- loss primarily lowers activity,
- ideal remains quiet and healthy.

### 12.2 Controller quietness in healthy runs

The usefulness-aware prototype should remain mostly exploitative under ideal
conditions.

### 12.3 Controller responsiveness under degraded runs

The usefulness-aware prototype should move into caution under:

- delay-heavy staleness,
- and noise-impaired timely-but-misleading conditions.

### 12.4 Transition interpretability

It should be possible to inspect traces and explain transitions in plain
operational terms.

### 12.5 Compactness

The validation should stay small enough that:

- the logic remains auditable,
- the outputs are readable,
- and the next extension step is clear.

### 12.6 Current status against criteria

At the present compact first-pass stage:

- **12.1** appears satisfied for ideal, delay-heavy, and noise-heavy cases,
- **12.2** appears satisfied,
- **12.3** appears satisfied after corruption-side retuning,
- **12.4** appears satisfied at the compact representative level,
- **12.5** is currently satisfied.

---

## 13. Failure conditions / warning signs

Subgoal D should be treated as incomplete if one or more of the following
occurs:

- ideal runs spend substantial unexplained time in caution,
- delay and noise become indistinguishable in all summaries,
- the controller enters caution but traces do not show why,
- transition behavior depends mainly on implementation artifacts rather than
  support signals,
- or the validation requires many ad hoc thresholds and exceptions to look
  sensible.

These would indicate that the current prototype still needs refinement before
extension.

### Current cautionary note

A more specific current warning sign to monitor is:

- corruption-side response may remain somewhat compressed across
  moderate-to-strong noise levels.

This is not currently a failure condition, because the qualitative distinction
is now present and interpretable. It is instead a calibration note to revisit
only if later work suggests that the controller is too eager under moderate
corruption.

---

## 14. Non-goals for Subgoal D

Subgoal D is **not** intended to deliver:

- the final usefulness-aware controller,
- the final three-regime exploit/recover/caution architecture,
- full hyperparameter tuning,
- exhaustive impairment sweeps,
- paper-final figures for all chapters,
- or harder-world broad claims.

Those are later steps.

The aim here is narrower:

- validate that the current diagnostic-and-control bridge is real,
  interpretable, and worth building on.

---

## 15. Recommended working sequence

The recommended sequence for Subgoal D is:

### Step 1
Freeze the current Subgoal C prototype and preserve it as a checkpoint.

### Step 2
Run Experiment Group 1 and build the compact impairment audit table.

### Step 3
Run Experiment Group 3 and inspect the exploit/caution summaries.

### Step 4
Open one or two representative traces and verify transition causality.

### Step 5
Run the limited fixed-policy audit.

### Step 6
Only then run the limited harder-world check.

### Step 7
Decide whether the next step should be:

- a three-state controller extension,
- threshold refinement,
- or broader comparison sweeps.

### Current practical position in the sequence

The project has now effectively completed:

- Step 2 for the compact first-pass subset,
- Step 3 for the same subset,
- Step 4 at representative compact-trace level,
- Step 5 for the three selected fixed-policy baselines,
- and Step 6 in the intended limited harder-world form.

The project is therefore at Step 7:

- preserve the current Subgoal D result as a compact validated checkpoint,
- and decide whether the next development step should be controller extension
  rather than further compact audit expansion.

---

## 16. Recommended naming and artifact discipline

To keep Subgoal D disciplined, artifacts should be named in a way that makes
their purpose obvious.

Recommended categories:

- impairment diagnostic verification
- usefulness prototype audit
- fixed-policy usefulness audit
- limited harder-world check

Presets and figures should prefer descriptive names over proliferating family
labels.

### Recommended current naming for the validated compact subset

- `subgoal_d_ideal`
- `subgoal_d_delay4`
- `subgoal_d_noise01`
- `subgoal_d_noise02`
- `subgoal_d_noise03`

This keeps the current validation core explicit and compact.

---

## 17. Relation to later development

If Subgoal D succeeds, the likely next development directions are:

1. extend from two-state exploit/caution to a three-regime prototype,
2. introduce a clearer recover or uncertainty-stabilization regime,
3. refine trigger logic with bounded support quantities,
4. and widen the experiment family for a more publication-oriented `v0.2` study.

If Subgoal D fails, the next step should remain internal refinement rather than
controller expansion.

### Current implication for later development

At present, the compact first-pass results justify:

- preserving the current result as a validated compact checkpoint,
- and moving next to the architecture-level decision about controller extension,

rather than returning immediately to broad diagnostic redesign.

The current prototype now appears sufficiently real and interpretable to support
the next design step.

---

## 18. Current Subgoal D status

At this point, the compact Subgoal D validation program has reached a meaningful
first-pass stopping point.

The project now has:

- a compact impairment audit for `usefulness_proto`,
- representative trace-level confirmation for delay and noise,
- a fixed-policy usefulness audit across greedy, uncertainty, and `mdc_info`,
- and a limited harder-world confirmation for the usefulness-aware prototype.

Taken together, these results support the intended narrow Subgoal D claim:

> AWSRT `v0.2` now has a compact, interpretable usefulness-diagnostic layer and
> a first usefulness-aware control prototype whose exploit-versus-caution
> behavior is auditable and qualitatively aligned with the intended
> delay-versus-noise operational story.

### 18.1 What now appears established

First, the usefulness diagnostics are no longer merely hypothetical. Across the
compact cases examined so far, they remain directionally interpretable:

- **ideal** runs remain healthy and timely,
- **delay-heavy** runs read as stale-but-active,
- **noise-impaired** runs read as timely-but-misleading.

Second, the first usefulness-aware prototype is now empirically legible in the
intended first-pass sense:

- ideal runs remain exploitative,
- delay-heavy runs move into caution for staleness-driven reasons,
- noise-impaired runs move into caution for corruption-side reasons rather than
  staleness.

Third, that diagnostic story is not confined to the prototype itself. The fixed
policy audit shows that the same compact delay-versus-noise interpretation
remains visible under greedy, uncertainty, and `mdc_info`.

Fourth, the limited harder-world check suggests that this interpretation is not
purely an artifact of the easiest geometry. The same qualitative story survives
under the harder-world subset that has now been run.

### 18.2 What remains only partially resolved

At the same time, Subgoal D should still be read with appropriate discipline.

The current prototype appears **qualitatively validated**, but not yet finely
calibrated.

In particular:

- the corruption-side response is now clearly present,
- but the noise ladder remains somewhat compressed in exploit/caution occupancy,
- especially compared with the stronger separation visible in the support
  quantities themselves.

That is not a failure of Subgoal D. It simply means that the present controller
should be treated as a successful first usefulness-aware bridge rather than as a
finished or carefully tuned final controller.

### 18.3 Recommended interpretation

The most appropriate current interpretation is therefore:

- **Subgoal D is substantially achieved at the compact validation level**,
- but the result should be framed as a successful first-pass validation rather
  than a final controller study.

This is enough to justify moving forward without immediately redesigning the
controller.

It is also enough to justify not widening the current validation program much
further unless a later writing or figure need specifically requires it.

### 18.4 Recommended next decision

The next development decision should now be made at the architecture level, not
at the level of repeating more compact validation cases.

The main options are:

1. **pause Subgoal D here as validated**, preserving the current prototype and
   audit tables as a completed first-pass checkpoint;
2. **perform a small calibration pass** only if later work suggests that
   moderate corruption is still too caution-sensitive;
3. **move on to the next controller extension**, such as a richer multi-regime
   usefulness-aware design.

The current results support option **1** or **3** more strongly than a return to
broad diagnostic debugging.

---

## 19. Practical recommendation

The most disciplined next step is:

> freeze the current Subgoal D result as a validated compact checkpoint, and
> then decide whether the next development goal is controller extension rather
> than further compact audit expansion.

In other words, the project is now at a natural handoff point.

Subgoal D has done its job: it has shown that the usefulness diagnostics and the
first exploit/caution controller are real enough, interpretable enough, and
stable enough to support the next design step.

---

## 20. Short summary

Subgoal D for AWSRT `v0.2` is a disciplined validation phase for the new
operational usefulness diagnostics and the first usefulness-aware control
prototype. It proceeds in small layers: impairment-diagnostic verification,
fixed-policy audit, usefulness-aware prototype audit, and a limited
harder-world check. Success means the diagnostics separate delay, noise, loss,
and ideal conditions in an interpretable way, and the prototype controller
transitions between exploit and caution for clearly auditable reasons.

The current compact first-pass validation now supports the core intended story:

- ideal remains exploitative,
- delay produces a stale-but-active caution response,
- noise produces a timely-but-misleading caution response,
- the same diagnostic reading survives across greedy, uncertainty, and
  `mdc_info`,
- and the compact story also survives a limited harder-world check.

The remaining decision is therefore no longer whether the compact Subgoal D
story exists. It does. The remaining decision is whether to freeze this result
as a checkpoint and move on to the next controller extension.