# AWSRT v0.6 Subgoal 06: Distance-Window Result Packaging

**Status:** Closed design / completed packaging step  
**Applies to:** `v0.6-subgoal-06`  
**Recommended file:** `docs/design/v0_6_06_distance_window_result_packaging.md`  
**Depends on:** `v0.6-subgoal-03`, `v0.6-subgoal-04`, `v0.6-subgoal-05`  
**Primary short-window analysis:** corrected `data/metrics/ana-194fc0a69b` with repair input `data/metrics/ana-5c07ad299a`  
**Primary long-window analysis:** `data/metrics/ana-efab12c047`  
**Packaging script:** `src/package_v0_6_distance_window_results.py`  
**Output directory:** `results/figures/v0_6_distance_window/`  
**Purpose:** Package the v0.6 distance-window results into clean, auditable evidence tables and thesis-facing figures before starting another experiment.

---

## 1. Purpose of this note

This note records AWSRT v0.6 Subgoal 06.

Subgoals 03 and 05 produced a coherent two-window distance result on the same transformed real-fire artifact:

```text
phy-b7edba9ac3
```

Subgoal 03 used the short window:

```text
execution_window = 0:150
```

Subgoal 05 used the longer window:

```text
execution_window = 0:450
```

Together, these subgoals showed that ignition-to-base-station distance affects timing access strongly, but does not collapse the compact usefulness-triad interpretation.

Subgoal 06 was not a new matrix.

It was a packaging and interpretation-hardening step.

The purpose was to turn the two-window result into:

- clean evidence tables;
- compact thesis-facing figures;
- a small written interpretation;
- and a reproducible path from extracted CSV outputs to publication-quality artifacts.

---

## 2. Scientific motivation

The v0.6 distance-window result is now strong enough to package.

The key scientific finding is not simply:

> farther base stations are worse.

The stronger finding is:

> distance and time horizon affect TTFD availability strongly, while the compact usefulness triad remains condition-readable.

The two-window result separates at least three metric families:

```text
timing:
  TTFD availability changes strongly with distance and window length

usefulness state:
  healthy -> exploit
  delay   -> recover
  noise   -> caution

corruption-side behavior:
  noise remains caution-dominant and TTFD-resistant at far distances
```

This is aligned with the broader AWSRT thesis direction:

> information delivery, timing, belief quality, and operational usefulness do not collapse into a single metric.

Subgoal 06 packages this result in a way that can be reused in a thesis chapter, results appendix, or paper draft.

---

## 3. Relationship to Subgoal 03

Subgoal 03 produced the corrected short-window distance-band matrix.

Short-window run:

```text
main analysis:   data/metrics/ana-194fc0a69b
repair analysis: data/metrics/ana-5c07ad299a
window:          0:150
```

Corrected extraction command:

```bash
python src/extract_analysis_study_summary.py \
  data/metrics/ana-194fc0a69b \
  --repair data/metrics/ana-5c07ad299a \
  --replace-case dist_15_near__noise \
  --replace-case dist_60_very_far__delay \
  --preset distance_band_v0_6_03 \
  --expected-rows-per-case 5
```

Short-window interpretation:

```text
dist_15_near:
  finite TTFD for healthy, delay, noise

dist_30_mid:
  finite TTFD for healthy, delay, noise

dist_50_far:
  missing TTFD for healthy, delay, noise

dist_60_very_far:
  missing TTFD for healthy, delay, noise
```

Usefulness-state interpretation:

```text
healthy -> exploit
delay   -> recover
noise   -> caution
```

The short-window result shows strong distance-induced TTFD missingness while preserving the usefulness-triad mapping.

---

## 4. Relationship to Subgoal 05

Subgoal 05 produced the long-window distance-band matrix.

Long-window run:

```text
analysis: data/metrics/ana-efab12c047
window:   0:450
```

Extraction command:

```bash
python src/extract_analysis_study_summary.py \
  data/metrics/ana-efab12c047 \
  --preset distance_band_v0_6_03 \
  --expected-rows-per-case 5
```

Long-window interpretation:

```text
dist_15_near:
  healthy: finite TTFD
  delay:   finite TTFD
  noise:   finite TTFD

dist_30_mid:
  healthy: finite TTFD
  delay:   finite TTFD
  noise:   finite TTFD

dist_50_far:
  healthy: finite TTFD
  delay:   finite TTFD
  noise:   missing TTFD

dist_60_very_far:
  healthy: partially finite TTFD
  delay:   partially finite TTFD
  noise:   missing TTFD
```

More concrete long-window timing summary:

```text
dist_50_far:
  healthy: finite, mean TTFD ≈ 270.4
  delay:   finite, mean TTFD ≈ 258.0
  noise:   missing

dist_60_very_far:
  healthy: 3/5 finite, mean TTFD ≈ 429.0
  delay:   2/5 finite, mean TTFD ≈ 429.5
  noise:   missing
```

Usefulness-state interpretation:

```text
healthy -> exploit
delay   -> recover
noise   -> caution
```

The long-window result shows that some short-window TTFD missingness was horizon-limited, but noise-side far-distance cases remained TTFD-resistant.

---

## 5. Relationship to Subgoal 04

Subgoal 04 produced the general extraction utility:

```text
src/extract_analysis_study_summary.py
```

Subgoal 06 used the extracted outputs from this utility as its evidence base.

Short-window extraction files:

```text
data/metrics/ana-194fc0a69b/analysis_extraction_integrity.json
data/metrics/ana-194fc0a69b/analysis_extraction_corrected_rows.csv
data/metrics/ana-194fc0a69b/analysis_extraction_case_summary.csv
data/metrics/ana-194fc0a69b/analysis_extraction_group_summary.csv
data/metrics/ana-194fc0a69b/analysis_extraction_interpretation.md
```

Long-window extraction files:

```text
data/metrics/ana-efab12c047/analysis_extraction_integrity.json
data/metrics/ana-efab12c047/analysis_extraction_corrected_rows.csv
data/metrics/ana-efab12c047/analysis_extraction_case_summary.csv
data/metrics/ana-efab12c047/analysis_extraction_group_summary.csv
data/metrics/ana-efab12c047/analysis_extraction_interpretation.md
```

Subgoal 06 did not manually re-derive the results from raw `summary.json`.

---

## 6. Main packaging question

Subgoal 06 centered on this question:

> How can the `0:150` and `0:450` distance-window results be summarized so that the metric separation is visible without overclaiming?

The package makes three things easy to see:

1. Distance strongly affects TTFD availability.
2. Longer time horizon converts some far-distance missing TTFDs into late detections.
3. The compact usefulness triad remains stable across both windows.

The package also preserves the caution that AUC-style metrics are not automatically comparable across different window lengths unless normalization is confirmed.

---

## 7. Inputs

The packaging script uses these extracted summaries as inputs.

Short-window corrected matrix:

```text
data/metrics/ana-194fc0a69b/analysis_extraction_group_summary.csv
data/metrics/ana-194fc0a69b/analysis_extraction_case_summary.csv
data/metrics/ana-194fc0a69b/analysis_extraction_integrity.json
```

Long-window matrix:

```text
data/metrics/ana-efab12c047/analysis_extraction_group_summary.csv
data/metrics/ana-efab12c047/analysis_extraction_case_summary.csv
data/metrics/ana-efab12c047/analysis_extraction_integrity.json
```

The short-window corrected extraction used repairs from:

```text
data/metrics/ana-5c07ad299a
```

The long-window extraction did not require repairs.

---

## 8. Output location

Generated packaging outputs were written under:

```text
results/figures/v0_6_distance_window/
```

This path is git-ignored.

That is appropriate because these are generated working artifacts. Thesis-ready figures or curated tables can later be copied into a tracked documentation path if needed.

Do not commit large generated images or CSVs unless there is a deliberate reason.

---

## 9. Packaging script

Subgoal 06 created the packaging script:

```text
src/package_v0_6_distance_window_results.py
```

This script is intended to be tracked under `src/`.

It reads the extracted outputs from Subgoal 04 and writes a small set of packaging artifacts.

It does not re-run analyses.

Default inputs:

```text
short window: data/metrics/ana-194fc0a69b
long window:  data/metrics/ana-efab12c047
```

Default output:

```text
results/figures/v0_6_distance_window/
```

Run command:

```bash
python src/package_v0_6_distance_window_results.py
```

---

## 10. Generated output artifacts

Subgoal 06 generated the following artifacts:

```text
results/figures/v0_6_distance_window/
  v0_6_distance_window_ttfd_availability.csv
  v0_6_distance_window_dominant_state.csv
  v0_6_distance_window_metric_snapshot.csv
  v0_6_distance_window_interpretation.md
  figure_v0_6_distance_window_ttfd_missingness.png
  figure_v0_6_distance_window_ttfd_missingness_by_condition.png
  figure_v0_6_distance_window_ttfd_mean.png
  figure_v0_6_distance_window_dominant_state.png
```

The preferred thesis-facing TTFD figure is:

```text
figure_v0_6_distance_window_ttfd_missingness_by_condition.png
```

The older categorical missingness figure and finite-TTFD-mean figure are retained as audit views.

---

## 11. Core evidence table 1: TTFD availability

The packaging script creates a table comparing TTFD availability across:

```text
window
distance_band
condition
```

Output:

```text
v0_6_distance_window_ttfd_availability.csv
```

Key columns:

```text
window_label
window_steps
distance_band
normalized_distance
condition
rows
ttfd_count
ttfd_missing_count
ttfd_missing_frac
ttfd_mean
ttfd_median
dominant_usefulness_state
```

Observed qualitative pattern:

```text
0:150:
  dist_15_near and dist_30_mid:
    finite TTFD for healthy, delay, noise

  dist_50_far and dist_60_very_far:
    missing TTFD for healthy, delay, noise

0:450:
  dist_15_near and dist_30_mid:
    finite TTFD for healthy, delay, noise

  dist_50_far:
    healthy and delay finite
    noise missing

  dist_60_very_far:
    healthy and delay partially finite
    noise missing
```

This is the most important evidence table.

---

## 12. Core evidence table 2: Dominant usefulness state

The packaging script creates a table comparing dominant usefulness state across:

```text
window
distance_band
condition
```

Output:

```text
v0_6_distance_window_dominant_state.csv
```

Key columns:

```text
window_label
window_steps
distance_band
normalized_distance
condition
dominant_usefulness_state
usefulness_regime_state_exploit_frac_mean
usefulness_regime_state_recover_frac_mean
usefulness_regime_state_caution_frac_mean
```

Observed pattern:

```text
healthy -> exploit
delay   -> recover
noise   -> caution
```

across both windows and all distance bands.

This table supports the central claim that timing access changes but the compact usefulness triad remains condition-readable.

---

## 13. Core evidence table 3: Metric snapshot

The packaging script creates a compact metric snapshot table.

Output:

```text
v0_6_distance_window_metric_snapshot.csv
```

Key columns:

```text
window_label
window_steps
distance_band
normalized_distance
condition
ttfd_count
ttfd_missing_frac
ttfd_mean
mean_entropy_auc_mean
coverage_auc_mean
delivered_info_proxy_mean_mean
mdc_residual_mean_mean
mdc_violation_rate_mean
dominant_usefulness_state
```

This table is useful for appendix or design-note evidence, but it should not be overloaded in the main narrative.

AUC values should be interpreted with window-length caution.

---

## 14. Preferred Figure 1: TTFD missingness by condition and distance

Preferred thesis-facing figure:

```text
figure_v0_6_distance_window_ttfd_missingness_by_condition.png
```

Purpose:

Show how TTFD missingness changes by normalized distance, condition, and window.

Structure:

```text
panels: healthy, delay, noise
x-axis: normalized ignition-to-base distance
y-axis: TTFD missing fraction
lines/markers: 0:150 and 0:450 windows
```

This version is preferred over a single categorical x-axis because it does not imply continuity across unlike conditions.

The figure makes the core result visually clear:

```text
healthy:
  short window: far and very-far missing
  long window: far resolves, very-far partly resolves

delay:
  short window: far and very-far missing
  long window: far resolves, very-far partly resolves

noise:
  short window: far and very-far missing
  long window: far and very-far still missing
```

Caption note:

```text
Annotations indicate finite-detection count out of five seeds for partially resolved cases.
```

For example, the `3/5` and `2/5` annotations mark finite detections, while the y-axis reports missing fraction.

---

## 15. Audit Figure 2: Categorical TTFD missingness

Audit figure:

```text
figure_v0_6_distance_window_ttfd_missingness.png
```

Purpose:

Provide a quick categorical inspection of missingness across the full distance-band × condition sequence.

Caution:

This figure is less suitable as a main thesis figure because the x-axis combines distance and condition categories. A line across those categories can imply continuity between unlike cases.

Use this as an audit figure, not as the primary interpretive figure.

---

## 16. Figure 3: Dominant usefulness state by condition and distance

Generated figure:

```text
figure_v0_6_distance_window_dominant_state.png
```

Purpose:

Show that dominant usefulness state remains stable even when timing availability changes.

The figure uses a compact table layout:

```text
rows = window × distance band
columns = healthy, delay, noise
cell text = dominant state
```

Observed pattern:

```text
healthy -> exploit
delay   -> recover
noise   -> caution
```

across both windows.

This figure is useful as an audit/appendix figure because it directly shows triad stability.

---

## 17. Optional Figure 4: TTFD mean for finite detections

Generated audit figure:

```text
figure_v0_6_distance_window_ttfd_mean.png
```

Purpose:

Show late detections under the long window.

Caution:

TTFD mean is plotted only where `ttfd_count > 0`.

This figure should distinguish:

```text
finite but late
```

from:

```text
missing
```

Do not interpret missing TTFD as zero.

For very-far long-window cases, report the finite count because only some seeds are finite.

Example:

```text
dist_60_very_far healthy: 3/5 finite
dist_60_very_far delay:   2/5 finite
```

---

## 18. Interpretation Markdown

The packaging script writes:

```text
results/figures/v0_6_distance_window/v0_6_distance_window_interpretation.md
```

It includes:

- input analysis IDs;
- short-window and long-window inputs;
- TTFD availability table;
- dominant usefulness-state table;
- AUC/window-length caution;
- generated file list;
- figure guidance.

Core thesis-facing language:

```text
Extending the window from 150 to 450 steps converted some far-distance TTFD failures into late detections, showing that short-window missingness was partly horizon-limited. However, the compact usefulness triad remained stable, and noise-side cases continued to resist finite TTFD at far distances.
```

---

## 19. AUC and cross-window caution

Subgoal 06 preserves a clear caution about AUC-style metrics.

Because the two windows have different lengths:

```text
0:150
0:450
```

absolute values of:

```text
mean_entropy_auc
coverage_auc
```

may not be directly comparable unless normalization is confirmed.

The safer cross-window claims are:

- finite TTFD availability changed;
- missingness patterns changed;
- dominant usefulness states remained stable;
- noise remained far-distance TTFD-resistant.

Within each window, AUC-style metrics can still be used to inspect relative patterns.

Across windows, use AUC-style metrics cautiously and avoid strong claims about absolute improvement or degradation.

---

## 20. Packaged conclusion

The packaging supports this conclusion:

> The short-window matrix showed that base-station distance can eliminate finite TTFD within `0:150`, while leaving the usefulness triad readable. The long-window matrix showed that some of this missingness was horizon-limited: far healthy and delay cases became finite, and very-far healthy and delay cases became partially finite. However, far and very-far noise cases remained TTFD-missing even under `0:450`. Across both windows, the dominant usefulness mapping remained stable: healthy/exploit, delay/recover, noise/caution.

This conclusion is phrased as a result for one transformed real-fire artifact, not as a universal law.

---

## 21. Minimal success criteria review

Subgoal 06 is complete.

1. The short-window and long-window extracted outputs were both available.
2. Integrity was checked for both analyses before packaging.
3. A combined TTFD availability table was created.
4. A combined dominant usefulness-state table was created.
5. A compact metric snapshot table was created.
6. A preferred TTFD missingness figure was generated using normalized distance and condition panels.
7. Additional audit figures were generated.
8. The interpretation note clearly states the two-window result.
9. AUC/window-length caution is included.
10. No new matrix or controller change was introduced.
11. The packaging is reproducible from extracted CSV outputs.

---

## 22. What this subgoal was not

Subgoal 06 did not:

- run another matrix;
- add another physical artifact;
- change the controller;
- compare baseline policy families;
- vary tie-breaking;
- change distance-band definitions;
- revise the ignition reference;
- claim generalization to all fires;
- over-interpret AUC values across unequal windows;
- commit large generated artifacts without a deliberate reason.

It was a packaging and interpretation step.

---

## 23. Recommended next step after Subgoal 06

After Subgoal 06, there are two reasonable directions.

### Option A: Second physical artifact

Apply the distance protocol to another transformed real-fire artifact.

Possible note:

```text
docs/design/v0_6_07_second_artifact_distance_protocol_check.md
```

Purpose:

Test whether the distance/usefulness separation survives outside `phy-b7edba9ac3`.

This is the stronger scientific extension.

### Option B: Clean thesis synthesis

If the v0.6 narrative is already strong enough, create a thesis-facing synthesis note:

```text
docs/design/v0_6_07_thesis_distance_window_synthesis.md
```

Purpose:

Turn v0.6 into polished thesis prose and finalized figure captions.

This is preferable if the immediate goal is writing rather than running another experiment.

### Recommended immediate choice

The recommended immediate choice is Option B if the goal is to preserve the v0.6 insight before widening to another artifact.

The two-window result is now readable and packaged. A short synthesis note would lock in the interpretation and prevent the result from being diluted by immediately launching a broader matrix.

---

## 24. Working conclusion

Subgoal 06 exists because AWSRT results should not move directly from matrix output to narrative claims.

The v0.6 distance-window result is scientifically meaningful, but it needed to be made auditable and readable.

The central packaged message is:

> Distance from the initial fire context to the base station is a real structural variable. It strongly affects whether first detection appears within a finite observation window. Extending the window reveals that some far-distance failures are late detections rather than absolute failures, but noise-side far-distance cases remain resistant. Across these timing changes, the compact usefulness triad remains stable.

This supports the broader AWSRT thesis:

> timing, information delivery, belief quality, and usefulness-state behavior are related, but they are not the same thing.

The platform is useful precisely because it can show when these quantities do not collapse into one another.
