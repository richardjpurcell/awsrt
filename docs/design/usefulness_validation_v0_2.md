# AWSRT v0.2 Usefulness Validation

**Status:** Revised design note  
**Applies to:** `v0.2-subgoal-d`  
**Purpose:** Define and track a disciplined validation program for AWSRT `v0.2` operational usefulness diagnostics and the first usefulness-aware control prototype.

---

## 1. Scope

This note defines **Subgoal D** for AWSRT `v0.2`: validating that the newly added usefulness diagnostics and the first usefulness-aware controller produce behavior that is:

- interpretable,
- operationally meaningful,
- experimentally auditable,
- and consistent with the intended v0.2 development story.

This note follows two earlier design notes:

- `docs/design/operational_usefulness_diagnostics_v0_2.md`
- `docs/design/usefulness_aware_control_v0_2.md`

Those notes define:
- the first usefulness-diagnostic layer,
- and the first usefulness-aware control bridge.

This note defines how those additions should now be **validated**.

It does **not** define a final paper-ready experimental campaign, a full v0.2 controller architecture, or the final three-regime usefulness-aware controller. It defines the next disciplined experimental step.

### Current Subgoal D status
A compact first-pass validation subset has now been run for:

- ideal,
- delay-heavy,
- and noise-heavy cases,

using the first usefulness-aware prototype. These runs support the intended qualitative separation among:

- healthy/timely operation,
- stale-but-active operation under delay,
- and timely-but-misleading operation under observation corruption.

The current validated core is therefore no longer purely hypothetical. Subgoal D remains in progress, but its central compact audit story is now partially established.

---

## 2. Motivation

Subgoal B established that AWSRT can now distinguish, at least in a first-pass way, among:

- continued observation activity,
- staleness due to delay,
- reduced information value,
- and activity that appears operationally misleading.

Subgoal C then established a minimal usefulness-aware controller prototype that responds to those signals through a simple exploit/caution regime distinction.

At this point, further controller expansion is **not yet** the main need. The main need is to verify that:

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

Subgoal D should be carried out with the same development stance used elsewhere in AWSRT `v0.2`:

- **small before broad**
- **controlled before sweeping**
- **interpretable before optimized**
- **auditable before elaborate**

This means the first validation should avoid:

- large preset proliferation,
- many new controller variants,
- immediate harder-world exhaustive sweeps,
- or broad claims about best policy performance.

Instead, Subgoal D should validate one compact diagnostic-and-control story in layers.

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
The first control prototype currently uses a minimal exploit/caution distinction driven by recent-window usefulness signals.

This prototype should now be checked for:
- quiet behavior in ideal conditions,
- staleness-driven caution under delay,
- misleadingness-driven caution under corruption,
- and legible transition behavior in step traces.

---

## 5. Validation philosophy

The goal of Subgoal D is **not** to prove that the current prototype is final or optimal.

The goal is narrower:

> demonstrate that AWSRT now has a compact, interpretable usefulness-diagnostic and usefulness-response layer that behaves sensibly under controlled conditions.

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
- and noise-impaired runs now enter caution for corruption-side reasons while remaining timely rather than stale.

A further nuance should also be recorded:

- the corruption-side retuning fixed the earlier false-negative problem,
- but the current noise ladder (`0.1–0.3`) appears somewhat compressed in caution occupancy.

This does **not** invalidate Subgoal D. It means that qualitative separation is now in place, while finer severity calibration may still be improved later.

---

## 6. Validation layers

Validation should proceed in four layers.

### 6.1 Layer 1 — impairment-diagnostic verification
Purpose:
- verify that the diagnostic quantities separate ideal, delay-heavy, noise-heavy, loss-heavy, and mixed cases in the intended qualitative way.

Main question:
- do the diagnostics reflect the right kind of impairment?

This layer is primarily about:
- `arrivals_frac`
- `obs_age_steps`
- `driver_info_true`
- `misleading_activity`
- recent-window support summaries

### 6.2 Layer 2 — fixed-policy usefulness audit
Purpose:
- verify that the wedge and usefulness diagnostics remain interpretable under fixed policy families.

Main question:
- do baseline/fixed policy runs show diagnostic patterns that are consistent with their impairment conditions?

This layer keeps policy fixed and interprets:
- greedy
- uncertainty
- `mdc_info`

under selected impairment cases.

### 6.3 Layer 3 — usefulness-aware regime audit
Purpose:
- verify that the current usefulness-aware prototype changes regime behavior for the intended reasons.

Main question:
- does the controller enter caution when it should, and remain exploitative when it should?

This is the main Subgoal D controller-validation layer.

### 6.4 Layer 4 — limited harder-world check
Purpose:
- ensure the behavior is not purely an artifact of the simplest reference world.

Main question:
- does the same interpretive pattern survive on a small selected harder-world subset?

This layer should remain intentionally limited.

---

## 7. Experiment groups

Subgoal D should use a small, explicit experiment family.

---

### Experiment Group 1 — impairment-diagnostic verification

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
- noise: weakened information value, higher misleadingness, caution should be explainable by corruption-sensitive signals
- loss: lower activity / arrival fraction, distinguishable from stale-but-active and misleading-but-active cases
- mixed: hybrid behavior, but still interpretable in terms of combined signal movement

---

### Experiment Group 2 — fixed-policy usefulness audit

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
3. Does the wedge story remain visible under the current v0.2 diagnostics?

This group is diagnostic-first, not leaderboard-first.

---

### Experiment Group 3 — usefulness-aware prototype audit

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
- delay: caution occupancy driven mainly by age/staleness
- noise: caution occupancy driven mainly by misleadingness / weakened information value
- mixed: caution occupancy explainable by combined support degradation

**Current nuance to preserve in interpretation:**
- the earlier corruption-side false negative is now resolved,
- but noise `0.1–0.3` currently produces somewhat compressed caution occupancy,
- so the present prototype is best treated as qualitatively validated rather than finely severity-calibrated.

This group is the core of Subgoal D.

---

### Experiment Group 4 — limited harder-world check

**Purpose:** verify that the story survives beyond the easiest geometry.

**Recommended world:**
- harder corner-fire world, or equivalent harder geometry already used elsewhere in AWSRT

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

Recommended columns:
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

Recommended aligned panels:
- recent age support
- recent misleadingness support
- recent driver-info support
- mean entropy / delta entropy
- usefulness regime state
- trigger activity

Purpose:
- show *why* the controller entered or remained in caution.

### 8.3 Regime timeline figure
A simple timeline for one representative run, especially under delay and noise.

Recommended contents:
- exploit/caution state over time
- caution/exploit triggers
- key supporting recent-window signals

This figure should answer:
> when did the transition happen, and why?

### 8.4 Small appendix-style audit summary
A compact summary for the usefulness-aware prototype across the selected cases.

Recommended columns:
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

## 9. Current compact audit table

The following compact table records the currently validated first-pass Subgoal D subset.

| Case | Delay | Noise | Loss | arrivals_frac_mean | obs_age_mean_valid | misleading_activity_pos_frac | recent_obs_age_mean_valid_last | recent_misleading_activity_pos_frac_last | driver_info_true_mean | recent_driver_info_true_mean_last | ttfd_true | ttfd_arrived | exploit_frac | caution_frac | caution_hits | exploit_hits | Interpretable reading |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Ideal | 0 | 0.0 | 0.0 | 1.000 | 0.0 | 0.146 | 0.0 | 0.0 | 0.000465 | 0.000277 | 59 | 59 | 1.00 | 0.00 | 0 | 109 | Healthy/timely baseline. No staleness, no sustained recent misleadingness, prototype stays exploit. |
| Delay-heavy | 4 | 0.0 | 0.0 | 0.980 | 4.0 | 0.201 | 4.0 | 0.0 | 0.000551 | 0.000387 | 63 | 67 | 0.03 | 0.97 | 196 | 0 | Stale-but-active case. Arrival activity remains high, but age is persistently elevated; prototype moves strongly to caution for staleness reasons. |
| Noise 0.1 | 0 | 0.1 | 0.0 | 1.000 | 0.0 | 0.397 | 0.0 | 0.0 | 0.000754 | 0.000772 | 63 | 0 | 0.01 | 0.99 | 6 | 3 | Mild corruption case. Arrivals remain timely and age stays at zero, but corruption-side support is already strong enough in the current prototype to produce a caution-dominant response. This is therefore not a clean exploitive mild-noise case, but a lower-noise member of the current corruption-driven caution regime. |
| Noise 0.2 | 0 | 0.2 | 0.0 | 1.000 | 0.0 | 0.472 | 0.0 | 0.300 | 0.000509 | 0.000525 | 75 | 0 | 0.01 | 0.99 | 9 | 0 | Moderate corruption case. Timely arrivals continue, but recent misleadingness now reaches a caution-worthy level; prototype enters and largely remains in caution for corruption-side reasons rather than staleness. |
| Noise 0.3 | 0 | 0.3 | 0.0 | 1.000 | 0.0 | 0.563 | 0.0 | 0.500 | 0.000232 | 0.000254 | 81 | 0 | 0.01 | 0.99 | 16 | 0 | Stress corruption case. Misleadingness is high, useful information weakens further, and prototype remains strongly in caution while staying timely rather than stale. |

### Current reading of the table
The table supports the main intended first-pass Subgoal D story:

- ideal remains exploitative,
- delay pushes the controller into caution because age/staleness remains persistently high,
- and noise-impaired runs push the controller into caution through corruption-side signals rather than staleness.

At the same time, the table now makes an important calibration nuance explicit:

- in the current prototype, the noise ladder `0.1–0.3` is qualitatively well separated from delay,
- but it is still somewhat compressed in exploit/caution occupancy,
- since even `noise = 0.1` already produces a caution-dominant response.

Accordingly, the current first-pass Subgoal D validation supports the following compact interpretation:

- ideal -> exploit,
- delay -> caution because of staleness,
- noise -> caution because of corruption-sensitive support degradation while remaining timely rather than stale.

Within that corruption-side family, severity is still visible in the support quantities:

- `noise = 0.1` is the weakest member of the current corruption-driven caution regime,
- `noise = 0.2` strengthens the corruption-side caution evidence,
- `noise = 0.3` remains the harsher corruption stress case.

This is still a useful validation outcome, because the prototype now clearly shows:
- separation between staleness-driven and corruption-driven caution,
- and an interpretable corruption-side degradation ladder in the support signals,

even though the current exploit/caution occupancy fractions remain somewhat compressed across the `0.1–0.3` noise range.

---
## 9.1 Compact trace-level confirmation

Representative summary-level trace confirmation now supports the intended causal reading for both delay and noise.

### Delay representative confirmation
For the representative `delay = 4` usefulness-prototype run:

- `arrivals_frac_mean = 0.98`
- `obs_age_mean_valid = 4.0`
- `recent_obs_age_mean_valid_last = 4.0`
- `recent_misleading_activity_pos_frac_last = 0.0`
- `caution_frac = 0.97`
- `exploit_frac = 0.03`
- `caution_hits = 196`
- `exploit_hits = 0`

This is consistent with a **stale-but-active** regime:
arrival activity remains high, age remains pinned at the imposed delay level, misleadingness is not the dominant end-of-run explanation, and the controller stays almost entirely in caution for staleness-driven reasons.

### Noise representative confirmation
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

This is consistent with a **timely-but-misleading** regime:
arrival activity remains fully active, age remains zero, corruption-side misleadingness is elevated, and the controller stays almost entirely in caution for corruption-side reasons rather than staleness.

### Current interpretation
These representative confirmations strengthen the compact Subgoal D reading:

- delay-side caution is explainable by persistent staleness,
- noise-side caution is explainable by persistent corruption-side support degradation,
- and the prototype’s exploit/caution distinction is now causally interpretable in both representative degraded cases.
---
## 10. Success criteria

Subgoal D should be considered successful if the following hold.

### 10.1 Diagnostic correctness
The controlled impairment cases separate in the intended qualitative way:
- delay primarily raises age/staleness signals,
- noise primarily raises misleadingness / weakened-information signals,
- loss primarily lowers activity,
- ideal remains quiet and healthy.

### 10.2 Controller quietness in healthy runs
The usefulness-aware prototype should remain mostly exploitative under ideal conditions.

### 10.3 Controller responsiveness under degraded runs
The usefulness-aware prototype should move into caution under:
- delay-heavy staleness,
- and noise-impaired timely-but-misleading conditions.

### 10.4 Transition interpretability
It should be possible to inspect traces and explain transitions in plain operational terms.

### 10.5 Compactness
The validation should stay small enough that:
- the logic remains auditable,
- the outputs are readable,
- and the next extension step is clear.

### 10.6 Current status against criteria
At the present compact first-pass stage:

- **10.1** appears satisfied for ideal, delay-heavy, and noise-heavy cases,
- **10.2** appears satisfied,
- **10.3** appears satisfied after corruption-side retuning,
- **10.4** still needs trace-level confirmation for representative delay and noise runs,
- **10.5** is currently satisfied.

---

## 11. Failure conditions / warning signs

Subgoal D should be treated as incomplete if one or more of the following occurs:

- ideal runs spend substantial unexplained time in caution,
- delay and noise become indistinguishable in all summaries,
- the controller enters caution but traces do not show why,
- transition behavior depends mainly on implementation artifacts rather than support signals,
- or the validation requires many ad hoc thresholds and exceptions to look sensible.

These would indicate that the current prototype still needs refinement before extension.

### Current cautionary note
A more specific current warning sign to monitor is:

- corruption-side response may now be somewhat compressed across moderate-to-strong noise levels.

This is not currently a failure condition, because the qualitative distinction is now present and interpretable. It is instead a calibration note to revisit only if later trace-level inspection suggests that the controller is too eager under moderate corruption.

---

## 12. Non-goals for Subgoal D

Subgoal D is **not** intended to deliver:

- the final usefulness-aware controller,
- the final three-regime exploit/recover/caution architecture,
- full hyperparameter tuning,
- exhaustive impairment sweeps,
- paper-final figures for all chapters,
- or harder-world broad claims.

Those are later steps.

The aim here is narrower:
- validate that the current diagnostic-and-control bridge is real, interpretable, and worth building on.

---

## 13. Recommended working sequence

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
The project has effectively completed:
- Step 2 for the compact first-pass subset,
- and much of Step 3 for the same subset.

The next most sensible step is Step 4:
- inspect one representative delay run and one representative noise run in trace form,
- verify transition causality and timing,
- and only then decide whether further threshold adjustment is actually needed.

---

## 14. Recommended naming / artifact discipline

To keep Subgoal D disciplined, artifacts should be named in a way that makes their purpose obvious.

Recommended categories:
- impairment diagnostic verification
- usefulness prototype audit
- fixed-policy usefulness audit
- limited harder-world check

Presets and figures should prefer descriptive names over proliferating family labels.

### Recommended current naming for the validated compact subset
- `subgoal_d_ideal`
- `subgoal_d_delay4`
- `subgoal_d_noise01`
- `subgoal_d_noise02`
- `subgoal_d_noise03`

This keeps the current validation core explicit and compact.

---

## 15. Relation to later development

If Subgoal D succeeds, the likely next development directions are:

1. extend from two-state exploit/caution to a three-regime prototype,
2. introduce a clearer recover / uncertainty-stabilization regime,
3. refine trigger logic with bounded support quantities,
4. and widen the experiment family for a more publication-oriented v0.2 study.

If Subgoal D fails, the next step should remain internal refinement rather than controller expansion.

### Current implication for later development
At present, the compact first-pass results justify:
- continuing with trace-level validation and limited fixed-policy audit,
- rather than returning immediately to broad controller redesign.

The current prototype now appears sufficiently real and interpretable to support one more disciplined validation layer before any major expansion.

---

## 16. Short summary

Subgoal D for AWSRT `v0.2` is a disciplined validation phase for the new operational usefulness diagnostics and the first usefulness-aware control prototype. It should proceed in small layers: impairment-diagnostic verification, fixed-policy audit, usefulness-aware prototype audit, and a limited harder-world check. Success means the diagnostics separate delay, noise, loss, and ideal conditions in an interpretable way, and the prototype controller transitions between exploit and caution for clearly auditable reasons.

The current compact first-pass subset already supports the core intended story:

- ideal remains exploitative,
- delay produces a stale-but-active caution response,
- and noise produces a timely-but-misleading caution response.

The remaining near-term task is therefore not broad redesign, but trace-level confirmation and compact audit consolidation.