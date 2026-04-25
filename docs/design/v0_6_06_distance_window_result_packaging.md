# AWSRT v0.6 Subgoal 06: Distance-Window Result Packaging

**Status:** Draft design note  
**Applies to:** `v0.6-subgoal-06`  
**Recommended file:** `docs/design/v0_6_06_distance_window_result_packaging.md`  
**Depends on:** `v0.6-subgoal-03`, `v0.6-subgoal-04`, `v0.6-subgoal-05`  
**Primary short-window analysis:** corrected `data/metrics/ana-194fc0a69b` with repair input `data/metrics/ana-5c07ad299a`  
**Primary long-window analysis:** `data/metrics/ana-efab12c047`  
**Purpose:** Package the v0.6 distance-window results into clean, auditable evidence tables and thesis-facing figures before starting another experiment.

---

## 1. Purpose of this note

This note defines AWSRT v0.6 Subgoal 06.

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

Subgoal 06 is not a new matrix.

It is a packaging and interpretation-hardening step.

The purpose is to turn the two-window result into:

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

Subgoal 06 should package this result in a way that can be reused in a thesis chapter, results appendix, or paper draft.

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

Subgoal 06 should use the extracted outputs from this utility as its evidence base.

Expected short-window extraction files:

```text
data/metrics/ana-194fc0a69b/analysis_extraction_integrity.json
data/metrics/ana-194fc0a69b/analysis_extraction_corrected_rows.csv
data/metrics/ana-194fc0a69b/analysis_extraction_case_summary.csv
data/metrics/ana-194fc0a69b/analysis_extraction_group_summary.csv
data/metrics/ana-194fc0a69b/analysis_extraction_interpretation.md
```

Expected long-window extraction files:

```text
data/metrics/ana-efab12c047/analysis_extraction_integrity.json
data/metrics/ana-efab12c047/analysis_extraction_corrected_rows.csv
data/metrics/ana-efab12c047/analysis_extraction_case_summary.csv
data/metrics/ana-efab12c047/analysis_extraction_group_summary.csv
data/metrics/ana-efab12c047/analysis_extraction_interpretation.md
```

Subgoal 06 should not manually re-derive the results from raw `summary.json` unless the extracted files are missing or invalid.

---

## 6. Main packaging question

Subgoal 06 centers on this question:

> How can the `0:150` and `0:450` distance-window results be summarized so that the metric separation is visible without overclaiming?

The package should make three things easy to see:

1. Distance strongly affects TTFD availability.
2. Longer time horizon converts some far-distance missing TTFDs into late detections.
3. The compact usefulness triad remains stable across both windows.

A good package should also preserve the caution that AUC-style metrics are not automatically comparable across different window lengths unless normalization is confirmed.

---

## 7. Inputs

Use these extracted summaries as inputs.

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

Generated packaging outputs should be written under a git-ignored results path unless deliberately curated into `docs/`.

Recommended working output directory:

```text
results/figures/v0_6_distance_window/
```

or:

```text
results/analysis_studies/v0_6_distance_window/
```

Because `results/` is currently ignored, thesis-ready artifacts can later be copied into a tracked documentation path if needed.

Possible tracked summary path, if a small curated table is desired:

```text
docs/results/v0_6_distance_window_summary.md
```

Do not commit large generated images or CSVs unless there is a clear reason.

---

## 9. Proposed helper script

Subgoal 06 may create a small packaging script.

Recommended script:

```text
src/package_v0_6_distance_window_results.py
```

If this script is created, it should be tracked under `src/`.

Do not place it under:

```text
src/do_not_track/
```

unless it is intentionally temporary.

The script should read the extracted outputs from Subgoal 04 and write a small set of packaging artifacts.

It should not re-run analyses.

---

## 10. Desired output artifacts

Recommended generated artifacts:

```text
results/figures/v0_6_distance_window/
  v0_6_distance_window_ttfd_availability.csv
  v0_6_distance_window_dominant_state.csv
  v0_6_distance_window_metric_snapshot.csv
  v0_6_distance_window_interpretation.md
  figure_v0_6_distance_window_ttfd_missingness.png
  figure_v0_6_distance_window_dominant_state.png
```

Optional:

```text
  figure_v0_6_distance_window_ttfd_mean.png
  figure_v0_6_distance_window_combined_summary.png
```

If figure generation takes too much time, prioritize CSV and Markdown packaging first.

---

## 11. Core evidence table 1: TTFD availability

Create a table comparing TTFD availability across:

```text
window
distance_band
condition
```

Suggested columns:

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

Expected qualitative pattern:

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

Create a table comparing dominant usefulness state across:

```text
window
distance_band
condition
```

Suggested columns:

```text
window_label
window_steps
distance_band
normalized_distance
condition
dominant_usefulness_state
exploit_frac_mean
recover_frac_mean
caution_frac_mean
```

Expected pattern:

```text
healthy -> exploit
delay   -> recover
noise   -> caution
```

across both windows and all distance bands.

This table supports the central claim that timing access changes but the compact usefulness triad remains condition-readable.

---

## 13. Core evidence table 3: Metric snapshot

Create a compact metric table for thesis notes.

Suggested columns:

```text
window_label
distance_band
condition
normalized_distance
ttfd_missing_frac
ttfd_mean
mean_entropy_auc_mean
coverage_auc_mean
delivered_info_proxy_mean_mean
mdc_residual_mean_mean
mdc_violation_rate_mean
dominant_usefulness_state
```

Include a note that AUC values should be interpreted with window-length caution.

This table is useful for appendix or design-note evidence, but it should not be overloaded in the main narrative.

---

## 14. Figure 1: TTFD missingness by distance and window

Recommended figure:

```text
figure_v0_6_distance_window_ttfd_missingness.png
```

Purpose:

Show how TTFD missingness changes by distance, condition, and window.

Possible visual forms:

- small multiples by condition;
- x-axis = normalized distance;
- y-axis = TTFD missing fraction;
- separate lines or markers for `0:150` and `0:450`.

Important requirements:

- make missingness visually explicit;
- do not hide `NaN` TTFD means;
- show that noise remains missing at far distances in the long window;
- keep the figure simple enough for a thesis chapter.

This is likely the main figure.

---

## 15. Figure 2: Dominant usefulness state by condition and distance

Recommended figure:

```text
figure_v0_6_distance_window_dominant_state.png
```

Purpose:

Show that dominant usefulness state remains stable even when timing availability changes.

Possible visual forms:

- tile/grid table;
- rows = distance bands;
- columns = conditions;
- separate panels for windows;
- cell text = dominant state;
- optional small numeric state fractions.

Avoid making this overly decorative.

The point is readability:

```text
healthy -> exploit
delay   -> recover
noise   -> caution
```

across both windows.

---

## 16. Optional Figure 3: TTFD mean for finite detections

Optional figure:

```text
figure_v0_6_distance_window_ttfd_mean.png
```

Purpose:

Show late detections under the long window.

Caution:

TTFD mean should only be plotted where `ttfd_count > 0`.

The figure should distinguish:

```text
finite but late
```

from:

```text
missing
```

Do not plot missing values as zero.

For very-far long-window cases, report the finite count because only some seeds are finite.

Example annotation:

```text
dist_60_very_far healthy: 3/5 finite
dist_60_very_far delay:   2/5 finite
```

---

## 17. Interpretation Markdown

Create a Markdown interpretation note:

```text
results/figures/v0_6_distance_window/v0_6_distance_window_interpretation.md
```

It should include:

- input analysis IDs;
- extraction integrity summary;
- short-window result;
- long-window result;
- TTFD availability comparison;
- dominant usefulness-state comparison;
- AUC/window-length caution;
- final thesis-facing interpretation.

Suggested thesis-facing language:

```text
Extending the window from 150 to 450 steps converted some far-distance TTFD failures into late detections, showing that short-window missingness was partly horizon-limited. However, the compact usefulness triad remained stable, and noise-side cases continued to resist finite TTFD at far distances. This reinforces the AWSRT distinction between timing access, belief summaries, and usefulness-state behavior.
```

---

## 18. AUC and cross-window caution

Subgoal 06 must preserve a clear caution about AUC-style metrics.

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

## 19. Expected packaging conclusion

The packaging should support this conclusion:

> The short-window matrix showed that base-station distance can eliminate finite TTFD within `0:150`, while leaving the usefulness triad readable. The long-window matrix showed that some of this missingness was horizon-limited: far healthy and delay cases became finite, and very-far healthy and delay cases became partially finite. However, far and very-far noise cases remained TTFD-missing even under `0:450`. Across both windows, the dominant usefulness mapping remained stable: healthy/exploit, delay/recover, noise/caution.

This conclusion should be phrased as a result for one transformed real-fire artifact, not as a universal law.

---

## 20. Minimal success criteria

Subgoal 06 is complete if:

1. The short-window and long-window extracted outputs are both available.
2. Integrity is checked for both analyses.
3. A combined TTFD availability table is created.
4. A combined dominant usefulness-state table is created.
5. A compact metric snapshot table is created.
6. At least one TTFD missingness figure is generated or a clear table equivalent is produced.
7. The interpretation note clearly states the two-window result.
8. AUC/window-length caution is included.
9. No new matrix or controller change is introduced.
10. The packaging is reproducible from extracted CSV outputs.

---

## 21. What this subgoal is not

Subgoal 06 should not:

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

It is a packaging and interpretation step.

---

## 22. Recommended next step after Subgoal 06

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

### Option B: Clean thesis packaging

If the v0.6 narrative is already strong enough, create a thesis-facing package:

```text
docs/design/v0_6_07_thesis_distance_window_synthesis.md
```

Purpose:

Turn v0.6 into polished thesis prose and finalized figure captions.

This is preferable if the immediate goal is writing rather than running another experiment.

---

## 23. Working conclusion

Subgoal 06 exists because AWSRT results should not move directly from matrix output to narrative claims.

The v0.6 distance-window result is scientifically meaningful, but it needs to be made auditable and readable.

The central packaged message should be:

> Distance from the initial fire context to the base station is a real structural variable. It strongly affects whether first detection appears within a finite observation window. Extending the window reveals that some far-distance failures are late detections rather than absolute failures, but noise-side far-distance cases remain resistant. Across these timing changes, the compact usefulness triad remains stable.

This supports the broader AWSRT thesis:

> timing, information delivery, belief quality, and usefulness-state behavior are related, but they are not the same thing.
