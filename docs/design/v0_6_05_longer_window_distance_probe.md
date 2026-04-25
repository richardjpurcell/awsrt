# AWSRT v0.6 Subgoal 05: Longer-Window Distance Probe

**Status:** Closed design / completed subgoal  
**Applies to:** `v0.6-subgoal-05`  
**Recommended file:** `docs/design/v0_6_05_longer_window_distance_probe.md`  
**Depends on:** `v0.6-subgoal-03`, `v0.6-subgoal-04`  
**Primary analysis:** `data/metrics/ana-efab12c047`  
**Execution window:** `0:450`  
**Purpose:** Test whether the far-distance TTFD missingness observed in the corrected Subgoal 03 distance-band matrix is a fixed-window artifact or a more persistent structural-distance effect.

---

## 1. Purpose of this note

This note records AWSRT v0.6 Subgoal 05.

Subgoal 03 established the first corrected distance-band usefulness matrix on:

```text
phy-b7edba9ac3
```

using:

```text
execution_window = 0:150
```

The corrected matrix showed a strong separation:

```text
near and mid distance bands:
  finite TTFD

far and very-far distance bands:
  missing TTFD
```

while the compact usefulness triad remained condition-readable:

```text
healthy -> exploit
delay   -> recover
noise   -> caution
```

Subgoal 04 then introduced a reusable extraction utility:

```text
src/extract_analysis_study_summary.py
```

and validated it on the corrected Subgoal 03 matrix.

Subgoal 05 asked the next focused scientific question:

> Were the far-distance TTFD failures in Subgoal 03 caused mainly by the fixed 150-step window, or do they persist under a longer observation window?

The planned longer-window test originally considered `0:250`, but the executed Subgoal 05 run used a longer `0:450` window. This is acceptable and scientifically useful because it gives a stronger test of whether far-distance missing TTFD is merely a short-horizon artifact.

This subgoal is not a controller redesign and not a broad new sweep.

It is a bounded longer-window probe of the same distance-band structure.

---

## 2. Scientific motivation

The Subgoal 03 result is scientifically useful because it showed that distance affects metric families differently.

The strongest observed distance effect was TTFD missingness:

```text
dist_15_near:
  finite TTFD

dist_30_mid:
  finite TTFD

dist_50_far:
  missing TTFD

dist_60_very_far:
  missing TTFD
```

However, this was measured only inside:

```text
execution_window = 0:150
```

A natural next question was whether the far cases were truly unreachable or merely late.

Subgoal 05 tested whether extending the window changed:

- finite TTFD availability;
- TTFD means for near and mid bands;
- far and very-far TTFD missingness;
- usefulness-state occupancy;
- belief-quality summaries;
- delivered-information summaries;
- and the interpretation of distance as a structural variable.

The goal was not to erase the Subgoal 03 result.

The goal was to determine whether its strongest distance effect was window-dependent.

---

## 3. Relationship to Subgoal 03

Subgoal 03 remains the primary short-window distance-band result.

Its corrected interpretation was:

> Distance strongly affects finite TTFD within the fixed `0:150` window, but the compact usefulness triad remains condition-readable.

Subgoal 05 does not replace that result.

Instead, it adds a longer-window condition.

The comparison is:

```text
Subgoal 03:
  execution_window = 0:150

Subgoal 05:
  execution_window = 0:450
```

The scientific question becomes:

> Does TTFD missingness at larger distances persist, or does it resolve when the observation window is extended?

---

## 4. Relationship to Subgoal 04

Subgoal 04 created the general extraction script:

```text
src/extract_analysis_study_summary.py
```

Subgoal 05 used this script for audit and summary.

This is important because Subgoal 03 exposed case-label / override mismatch risk.

Subgoal 05 therefore did not rely only on raw `summary.json` or long console output.

The completed analysis was checked with:

```text
analysis_extraction_integrity.json
analysis_extraction_case_summary.csv
analysis_extraction_group_summary.csv
analysis_extraction_interpretation.md
```

The extraction step is now part of the expected AWSRT analysis workflow.

---

## 5. Executed experiment choice

The same distance-band matrix structure as Subgoal 03 was used.

Subgoal 05 did not introduce:

- a second physical artifact;
- new policies;
- tie-breaking variation;
- regime control;
- new distance bands;
- a controller redesign.

The main change was the execution window.

Executed longer window:

```text
execution_window.start_step = 0
execution_window.end_step_exclusive = 450
```

The longer `0:450` window provides a strong test of whether far-distance TTFD missingness is only a short-window artifact.

---

## 6. Fixed physical artifact

The same physical artifact as Subgoal 03 was used:

```text
phy-b7edba9ac3
```

Known native grid:

```text
H = 1085
W = 1448
domain_diagonal_cells = 1809.400176854197
```

No additional physical artifacts were introduced in Subgoal 05.

---

## 7. Native ignition reference

The same native ignition reference as Subgoals 02 and 03 was used:

```text
ignition_reference_method = centroid(day_of_burn == min_positive_day_of_burn)
ignition_reference_rc = (393, 448)
```

Supporting audit values:

```text
day_of_burn min positive: 1
earliest burned cell count: 741
earliest burned bbox rows: 378..406
earliest burned bbox cols: 419..475
earliest centroid rc: (392.64, 448.37)
earliest rounded centroid rc: (393, 448)
```

Official reference:

```text
ignition_reference_rc = (393, 448)
```

---

## 8. Distance-band base stations

The same four distance-band base stations as Subgoal 03 were used.

```text
distance_band       base_station_rc   raw_distance_cells   normalized_distance
dist_15_near        (585, 640)        271.53               0.150
dist_30_mid         (777, 832)        543.06               0.300
dist_50_far         (1033, 1088)      905.10               0.500
dist_60_very_far    (1080, 1320)      1110.11              0.614
```

The label remains:

```text
dist_60_very_far
```

not:

```text
dist_70_very_far
```

The fourth distance band is boundary-limited and achieved approximately `0.614` normalized distance.

---

## 9. Tie-breaking

Stochastic tie-breaking was used in every case.

Each case override was expected to include:

```json
{
  "network.tie_breaking": "stochastic"
}
```

Tie-breaking was not varied in this subgoal.

This preserves continuity with Subgoal 03 and avoids reintroducing the deterministic directional artifact identified in v0.5.

The extracted row table does not include a row-level `tie_breaking` column, but the study metadata records `network.tie_breaking` as an override key. This is acceptable for this subgoal, and consistent with the Subgoal 04 extraction behavior.

---

## 10. Usefulness-family conditions

The same three usefulness-family conditions were used:

```text
healthy:
  delay_steps = 0
  loss_prob = 0
  noise_level = 0

delay:
  delay_steps = 4
  loss_prob = 0
  noise_level = 0

noise:
  delay_steps = 0
  loss_prob = 0
  noise_level = 0.2
```

The purpose was to determine whether the longer window changed the distance-band timing story while preserving the known condition semantics.

---

## 11. Matrix shape

The same matrix shape as Subgoal 03 was used:

```text
4 distance bands × 3 usefulness-family conditions × 5 seeds = 60 runs
```

Seeds:

```text
0,1,2,3,4
```

The completed analysis contains 60 rows.

---

## 12. Analysis Batch settings

Subgoal 05 used the same basic settings as Subgoal 03, with the longer execution window.

```text
Physical run:        phy-b7edba9ac3
Study preset:        Main · Usefulness family comparison
Policy:              usefulness_proto only
Sweep cases:         distance band × usefulness-family condition
Mode:                dynamic
Tie-breaking:        stochastic, explicit in every case
Sensors:             20
Sensor radius:       250 m
Move/step:           500 m
Max moves/step:      0
Min separation:      250 m
Seeds:               0,1,2,3,4
Choose best by:      mean_entropy_auc
Execution window:    0:450
Regime enabled:      no
O1 enabled:          yes
```

The substantive change from Subgoal 03 was:

```text
execution_window.end_step_exclusive = 450
```

instead of:

```text
execution_window.end_step_exclusive = 150
```

---

## 13. Case labels

The same 12 case labels as Subgoal 03 were used:

```text
dist_15_near__healthy
dist_15_near__delay
dist_15_near__noise

dist_30_mid__healthy
dist_30_mid__delay
dist_30_mid__noise

dist_50_far__healthy
dist_50_far__delay
dist_50_far__noise

dist_60_very_far__healthy
dist_60_very_far__delay
dist_60_very_far__noise
```

No window suffix was added to the case labels.

This keeps the case labels directly comparable with Subgoal 03.

The window condition is recorded in this design note and should be preserved in interpretation text.

---

## 14. Extraction after run

The completed Subgoal 05 analysis ID was:

```text
ana-efab12c047
```

The extraction command used for the final validation was:

```bash
python src/extract_analysis_study_summary.py \
  data/metrics/ana-efab12c047 \
  --preset distance_band_v0_6_03 \
  --expected-rows-per-case 5
```

Expected extraction outputs:

```text
analysis_extraction_columns.txt
analysis_extraction_integrity.json
analysis_extraction_corrected_rows.csv
analysis_extraction_case_summary.csv
analysis_extraction_group_summary.csv
analysis_extraction_interpretation.md
```

The integrity report confirmed:

```text
ok = true
main_ana_id = ana-efab12c047
rows_after_correction = 60
cases_present = 12
rows_per_case = 5 each
failures = []
warnings = []
repair_ana_ids = []
repair_rows_loaded = 0
```

The validation preset was:

```text
distance_band_v0_6_03
```

The expected row-level missing columns were:

```text
tie_breaking
network_tie_breaking
case_family
case_kind
```

These are not blockers because the sweep metadata records the relevant override keys:

```text
network.tie_breaking
study.case_family
study.case_kind
```

---

## 15. Main result

The longer `0:450` window resolved some, but not all, of the far-distance TTFD missingness observed in Subgoal 03.

The key result is:

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

More concretely:

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

This means the Subgoal 03 far-distance missingness was partly horizon-limited.

However, the effect was not uniform across impairment families.

Healthy and delay cases gained late detections under the longer window, while far and very-far noise cases remained TTFD-missing.

---

## 16. Usefulness-state result

The compact usefulness triad remained stable across all distance bands under the longer window.

The dominant usefulness states were:

```text
healthy -> exploit
delay   -> recover
noise   -> caution
```

This held for:

```text
dist_15_near
dist_30_mid
dist_50_far
dist_60_very_far
```

Thus, extending the window changed the timing-access surface, but did not collapse the condition-readable usefulness-state interpretation.

This is important because it shows that:

> TTFD availability can change with distance and window length while the compact usefulness triad remains interpretable.

---

## 17. AUC caution under different windows

Subgoal 05 changed the execution window.

Therefore, AUC-style metrics such as:

```text
mean_entropy_auc
coverage_auc
```

may not be directly comparable in absolute scale to Subgoal 03 unless their definitions normalize by window length.

The key comparisons should be made primarily within the Subgoal 05 matrix.

Cross-window comparison should focus on:

- finite TTFD availability;
- TTFD missing fraction;
- dominant usefulness state;
- qualitative stability of condition mapping;
- relative patterns across distance bands inside each window.

Do not claim that a larger or smaller AUC across Subgoal 03 and Subgoal 05 directly means better or worse unless the metric normalization is confirmed.

---

## 18. Scientific interpretation

The completed Subgoal 05 result supports this interpretation:

> Extending the window from 150 to 450 steps converted some far-distance TTFD failures into late detections, showing that short-window missingness was partly horizon-limited. However, the compact usefulness triad remained stable, and noise-side cases continued to resist finite TTFD at far distances, reinforcing the distinction between timing access, belief summaries, and usefulness-state behavior.

This is a strong v0.6 result because it adds nuance without collapsing the original finding.

The refined conclusion is:

```text
Distance-induced TTFD missingness is partly a window-length effect,
but not uniformly so across impairment families.
```

More specifically:

```text
healthy/delay:
  longer window exposes late detections at far and some very-far cases

noise:
  remains TTFD-missing at far and very-far distances even with 450 time slots
```

This preserves the AWSRT separation story:

```text
TTFD availability changes strongly with window length and distance.
Usefulness-state interpretation remains condition-readable.
Noise remains the most detection-resistant / caution-dominant condition.
```

---

## 19. Minimal success criteria review

Subgoal 05 is complete.

1. The longer-window distance matrix executed.
2. The analysis was extracted with `src/extract_analysis_study_summary.py`.
3. The extraction integrity report passed.
4. All 12 intended case labels were represented.
5. Each case had five seeds.
6. The matrix could be grouped by distance band and condition.
7. TTFD finite counts and missing fractions were compared against the Subgoal 03 short-window result.
8. Dominant usefulness states were reported by distance band and condition.
9. Mean entropy AUC and coverage AUC were interpreted with window-length caution.
10. A clear conclusion was possible:
    - far TTFD missingness was partly short-window-limited;
    - far and very-far noise remained TTFD-missing;
    - usefulness triad remained stable across window extension.
11. No controller redesign was introduced.

---

## 20. What this subgoal was not

Subgoal 05 did not:

- add another physical artifact;
- vary tie-breaking;
- compare baseline policies;
- introduce regime management;
- change the usefulness controller;
- create new distance bands;
- change the ignition reference;
- generalize to all real fires;
- run a broad multi-window sweep.

It was deliberately narrow:

> same artifact, same distance bands, same usefulness-family conditions, same seeds, longer window.

---

## 21. Likely next step after Subgoal 05

The next subgoal should probably be a packaging and interpretation step rather than another immediate matrix.

### Recommended Option: Distance-window result packaging

Create a figure/table packaging subgoal.

Possible title:

```text
AWSRT v0.6 Subgoal 06: Distance-Window Result Packaging
```

Possible note:

```text
docs/design/v0_6_06_distance_window_result_packaging.md
```

This would prepare thesis-ready tables or figures showing:

- TTFD missingness by distance and window;
- dominant usefulness state by distance and condition;
- corrected extraction provenance;
- short-window versus long-window timing interpretation;
- AUC/window-length caution.

This is preferable before moving to another physical artifact because v0.6 now has a coherent two-window story on one transformed real-fire artifact.

### Later Option: Second physical artifact

A later subgoal can apply the distance protocol to another transformed real-fire artifact.

Possible title:

```text
AWSRT v0.6 Subgoal 07: Second-Artifact Distance Protocol Check
```

This would test whether the distance/usefulness separation survives outside `phy-b7edba9ac3`.

Do not start that before packaging the current result unless there is a strong reason to prioritize breadth over interpretation.

---

## 22. Working conclusion

Subgoal 05 was a focused test of time horizon.

Subgoal 03 showed that base-station distance strongly structured finite TTFD within `0:150` while leaving the compact usefulness triad readable.

Subgoal 05 showed that extending the window to `0:450` resolves some far-distance missingness but not all of it.

The important result is not simply that more time produces more detections.

The important result is the pattern:

```text
healthy/delay far cases:
  late finite detections emerge

noise far cases:
  TTFD remains missing

usefulness triad:
  remains condition-readable
```

This strengthens the v0.6 claim that deployment geometry is a real structural variable, and that AWSRT can expose separations among timing, information delivery, belief quality, and usefulness-state behavior.

The platform is useful precisely because these quantities do not collapse into one another.
