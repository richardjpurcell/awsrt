# AWSRT v0.6 Subgoal 05: Longer-Window Distance Probe

**Status:** Draft design note  
**Applies to:** `v0.6-subgoal-05`  
**Recommended file:** `docs/design/v0_6_05_longer_window_distance_probe.md`  
**Depends on:** `v0.6-subgoal-03`, `v0.6-subgoal-04`  
**Purpose:** Test whether the far-distance TTFD missingness observed in the corrected Subgoal 03 distance-band matrix is a fixed-window artifact or a more persistent structural-distance effect.

---

## 1. Purpose of this note

This note defines AWSRT v0.6 Subgoal 05.

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

Subgoal 05 asks the next focused scientific question:

> Were the far-distance TTFD failures in Subgoal 03 caused mainly by the fixed 150-step window, or do they persist under a longer observation window?

This is not a new controller design and not a broad new sweep.

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

A natural next question is whether the far cases are truly unreachable or merely late.

Subgoal 05 tests whether extending the window changes:

- finite TTFD availability;
- TTFD means for near and mid bands;
- far and very-far TTFD missingness;
- usefulness-state occupancy;
- belief-quality summaries;
- delivered-information summaries;
- and the interpretation of distance as a structural variable.

The goal is not to erase the Subgoal 03 result.

The goal is to determine whether its strongest distance effect is window-dependent.

---

## 3. Relationship to Subgoal 03

Subgoal 03 should remain the primary short-window distance-band result.

Its corrected interpretation was:

> Distance strongly affects finite TTFD within the fixed `0:150` window, but the compact usefulness triad remains condition-readable.

Subgoal 05 does not replace that result.

Instead, it adds a second window condition.

The comparison is:

```text
Subgoal 03:
  execution_window = 0:150

Subgoal 05:
  execution_window = longer than 0:150
```

The scientific question becomes:

> Does TTFD missingness at larger distances persist, or does it resolve when the observation window is extended?

---

## 4. Relationship to Subgoal 04

Subgoal 04 created the general extraction script:

```text
src/extract_analysis_study_summary.py
```

Subgoal 05 should use this script for audit and summary.

This is important because Subgoal 03 exposed case-label / override mismatch risk.

Subgoal 05 should not rely only on raw `summary.json` or long console output.

Every completed Subgoal 05 analysis should be checked with:

```text
analysis_extraction_integrity.json
analysis_extraction_case_summary.csv
analysis_extraction_group_summary.csv
analysis_extraction_interpretation.md
```

The extraction step is now part of the expected workflow.

---

## 5. Recommended experiment choice

Use the same distance-band matrix structure as Subgoal 03.

Do not introduce a second physical artifact yet.

Do not introduce new policies.

Do not vary tie-breaking.

Do not add regime control.

The main change should be the execution window.

Recommended first longer window:

```text
execution_window.start_step = 0
execution_window.end_step_exclusive = 250
```

Rationale:

- `0:250` is a meaningful extension beyond `0:150`;
- it is not as heavy as jumping immediately to `0:300` or `0:500`;
- it is long enough to test whether far-distance detections are simply delayed beyond the prior window;
- it preserves continuity with Subgoal 03.

If `0:250` still leaves all far and very-far TTFDs missing, a later subgoal can decide whether `0:300` or `0:500` is warranted.

Do not run multiple longer windows in Subgoal 05 unless the `0:250` result is clearly invalid or technically unusable.

---

## 6. Fixed physical artifact

Use the same physical artifact as Subgoal 03:

```text
phy-b7edba9ac3
```

Known native grid:

```text
H = 1085
W = 1448
domain_diagonal_cells = 1809.400176854197
```

No additional physical artifacts should be introduced in Subgoal 05.

---

## 7. Native ignition reference

Use the same native ignition reference as Subgoals 02 and 03:

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

Use the same four distance-band base stations as Subgoal 03.

```text
distance_band       base_station_rc   raw_distance_cells   normalized_distance
dist_15_near        (585, 640)        271.53               0.150
dist_30_mid         (777, 832)        543.06               0.300
dist_50_far         (1033, 1088)      905.10               0.500
dist_60_very_far    (1080, 1320)      1110.11              0.614
```

Keep the label:

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

Use stochastic tie-breaking in every case.

Each case override must explicitly include:

```json
{
  "network.tie_breaking": "stochastic"
}
```

Tie-breaking should not be varied in this subgoal.

This preserves continuity with Subgoal 03 and avoids reintroducing the deterministic directional artifact identified in v0.5.

---

## 10. Usefulness-family conditions

Use the same three usefulness-family conditions:

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

The purpose is to determine whether the longer window changes the distance-band timing story while preserving the known condition semantics.

---

## 11. Matrix shape

Use the same matrix shape as Subgoal 03:

```text
4 distance bands × 3 usefulness-family conditions × 5 seeds = 60 runs
```

Seeds:

```text
0,1,2,3,4
```

If runtime is a concern, a smoke run may be performed first, but the intended Subgoal 05 matrix is the full five-seed run.

---

## 12. Recommended Analysis Batch settings

Use:

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
Execution window:    0:250
Regime enabled:      no
O1 enabled:          yes
```

The main change from Subgoal 03 is:

```text
execution_window.end_step_exclusive = 250
```

instead of:

```text
execution_window.end_step_exclusive = 150
```

---

## 13. Case labels

Use the same 12 case labels as Subgoal 03:

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

Do not add a window suffix to the case labels unless necessary.

The window condition should be recorded in the design note, analysis metadata if possible, and interpretation text.

If audit clarity becomes a concern, a higher-level study label can include:

```text
window_0_250
```

but the case labels should remain directly comparable with Subgoal 03.

---

## 14. Sweep cases

Use the same sweep cases as Subgoal 03.

```json
[
  {
    "label": "dist_15_near__healthy",
    "overrides": {
      "network.base_station_rc": [585, 640],
      "network.policy": "usefulness_proto",
      "network.tie_breaking": "stochastic",
      "impairments.delay_steps": 0,
      "impairments.loss_prob": 0,
      "impairments.noise_level": 0,
      "study.case_family": "usefulness_distance",
      "study.case_kind": "healthy"
    }
  },
  {
    "label": "dist_15_near__delay",
    "overrides": {
      "network.base_station_rc": [585, 640],
      "network.policy": "usefulness_proto",
      "network.tie_breaking": "stochastic",
      "impairments.delay_steps": 4,
      "impairments.loss_prob": 0,
      "impairments.noise_level": 0,
      "study.case_family": "usefulness_distance",
      "study.case_kind": "delay"
    }
  },
  {
    "label": "dist_15_near__noise",
    "overrides": {
      "network.base_station_rc": [585, 640],
      "network.policy": "usefulness_proto",
      "network.tie_breaking": "stochastic",
      "impairments.delay_steps": 0,
      "impairments.loss_prob": 0,
      "impairments.noise_level": 0.2,
      "study.case_family": "usefulness_distance",
      "study.case_kind": "noise"
    }
  },
  {
    "label": "dist_30_mid__healthy",
    "overrides": {
      "network.base_station_rc": [777, 832],
      "network.policy": "usefulness_proto",
      "network.tie_breaking": "stochastic",
      "impairments.delay_steps": 0,
      "impairments.loss_prob": 0,
      "impairments.noise_level": 0,
      "study.case_family": "usefulness_distance",
      "study.case_kind": "healthy"
    }
  },
  {
    "label": "dist_30_mid__delay",
    "overrides": {
      "network.base_station_rc": [777, 832],
      "network.policy": "usefulness_proto",
      "network.tie_breaking": "stochastic",
      "impairments.delay_steps": 4,
      "impairments.loss_prob": 0,
      "impairments.noise_level": 0,
      "study.case_family": "usefulness_distance",
      "study.case_kind": "delay"
    }
  },
  {
    "label": "dist_30_mid__noise",
    "overrides": {
      "network.base_station_rc": [777, 832],
      "network.policy": "usefulness_proto",
      "network.tie_breaking": "stochastic",
      "impairments.delay_steps": 0,
      "impairments.loss_prob": 0,
      "impairments.noise_level": 0.2,
      "study.case_family": "usefulness_distance",
      "study.case_kind": "noise"
    }
  },
  {
    "label": "dist_50_far__healthy",
    "overrides": {
      "network.base_station_rc": [1033, 1088],
      "network.policy": "usefulness_proto",
      "network.tie_breaking": "stochastic",
      "impairments.delay_steps": 0,
      "impairments.loss_prob": 0,
      "impairments.noise_level": 0,
      "study.case_family": "usefulness_distance",
      "study.case_kind": "healthy"
    }
  },
  {
    "label": "dist_50_far__delay",
    "overrides": {
      "network.base_station_rc": [1033, 1088],
      "network.policy": "usefulness_proto",
      "network.tie_breaking": "stochastic",
      "impairments.delay_steps": 4,
      "impairments.loss_prob": 0,
      "impairments.noise_level": 0,
      "study.case_family": "usefulness_distance",
      "study.case_kind": "delay"
    }
  },
  {
    "label": "dist_50_far__noise",
    "overrides": {
      "network.base_station_rc": [1033, 1088],
      "network.policy": "usefulness_proto",
      "network.tie_breaking": "stochastic",
      "impairments.delay_steps": 0,
      "impairments.loss_prob": 0,
      "impairments.noise_level": 0.2,
      "study.case_family": "usefulness_distance",
      "study.case_kind": "noise"
    }
  },
  {
    "label": "dist_60_very_far__healthy",
    "overrides": {
      "network.base_station_rc": [1080, 1320],
      "network.policy": "usefulness_proto",
      "network.tie_breaking": "stochastic",
      "impairments.delay_steps": 0,
      "impairments.loss_prob": 0,
      "impairments.noise_level": 0,
      "study.case_family": "usefulness_distance",
      "study.case_kind": "healthy"
    }
  },
  {
    "label": "dist_60_very_far__delay",
    "overrides": {
      "network.base_station_rc": [1080, 1320],
      "network.policy": "usefulness_proto",
      "network.tie_breaking": "stochastic",
      "impairments.delay_steps": 4,
      "impairments.loss_prob": 0,
      "impairments.noise_level": 0,
      "study.case_family": "usefulness_distance",
      "study.case_kind": "delay"
    }
  },
  {
    "label": "dist_60_very_far__noise",
    "overrides": {
      "network.base_station_rc": [1080, 1320],
      "network.policy": "usefulness_proto",
      "network.tie_breaking": "stochastic",
      "impairments.delay_steps": 0,
      "impairments.loss_prob": 0,
      "impairments.noise_level": 0.2,
      "study.case_family": "usefulness_distance",
      "study.case_kind": "noise"
    }
  }
]
```

Before launch, visually confirm that each case label matches its intended:

```text
base_station_rc
delay_steps
loss_prob
noise_level
```

This check matters because Subgoal 03 initially had two case-label / override mismatches.

---

## 15. Required extraction after run

After the Subgoal 05 run completes, use the Subgoal 04 extractor.

If the new analysis ID is:

```text
ana-XXXXXXXXXX
```

run:

```bash
python src/extract_analysis_study_summary.py \
  data/metrics/ana-XXXXXXXXXX \
  --preset distance_band_v0_6_03 \
  --expected-rows-per-case 5
```

If the run requires any repair cells, use the repair form:

```bash
python src/extract_analysis_study_summary.py \
  data/metrics/ana-XXXXXXXXXX \
  --repair data/metrics/ana-YYYYYYYYYY \
  --replace-case <case-to-replace> \
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

Subgoal 05 is not ready for interpretation until:

```text
analysis_extraction_integrity.json
```

reports:

```text
ok = true
rows_after_correction = 60
case_count = 12
rows_per_case = 5 each
failures = []
```

---

## 16. Metrics of interest

Primary metrics:

- `ttfd`
- `ttfd_true`
- `ttfd_arrived`
- `mean_entropy_auc`
- `coverage_auc`
- `usefulness_regime_state_exploit_frac`
- `usefulness_regime_state_recover_frac`
- `usefulness_regime_state_caution_frac`

Secondary metrics:

- `usefulness_trigger_recover_hits`
- `usefulness_trigger_caution_hits`
- `usefulness_trigger_recover_from_caution_hits`
- `usefulness_trigger_exploit_hits`
- `delivered_info_proxy_mean`
- `mdc_residual_mean`
- `mdc_residual_pos_frac`
- `mdc_violation_rate`
- `movement_total_mean_l1`
- `moves_per_step_mean`
- `moved_frac_mean`
- `arrivals_frac_mean`
- `detections_arrived_frac_mean`
- `obs_age_mean_valid`
- `obs_age_max_valid`

Audit fields:

- `case`
- `seed`
- `policy`
- `opr_id`
- `phy_id`
- `base_station_rc`
- `deployment_mode`
- `n_sensors`
- `delay_steps`
- `noise_level`
- `loss_prob`
- `tie_breaking`, if available

Distance metadata:

```text
distance_band
base_station_rc
ignition_reference_rc
raw_distance_cells
normalized_distance
```

---

## 17. Interpretation criteria

### 17.1 Far TTFD becomes finite

If `dist_50_far` or `dist_60_very_far` cases gain finite TTFD under `0:250`, then the Subgoal 03 far-distance missingness was at least partly a fixed-window effect.

Interpretation:

> Larger distance delayed detection beyond the short window, but did not make finite detection unavailable under the longer window.

This would not weaken the Subgoal 03 result. It would refine it.

### 17.2 Far TTFD remains missing

If far and very-far cases remain missing under `0:250`, then the distance effect is more persistent.

Interpretation:

> Within both tested windows, far-distance base-station placement prevents finite TTFD under the tested conditions.

This would strengthen the case for treating base-station distance as a core structural axis.

### 17.3 TTFD improves but triad remains stable

If additional finite TTFD appears while usefulness states remain:

```text
healthy -> exploit
delay   -> recover
noise   -> caution
```

then the triad is robust to the longer window.

Interpretation:

> The timing surface changes with window length, but the usefulness-state interpretation remains stable.

### 17.4 Triad changes under longer window

If the longer window changes usefulness-state occupancy substantially, especially in far cases, then the short-window and longer-window interpretations should be separated.

Possible examples:

- far healthy remains exploit-dominant but less purely so;
- far delay becomes less recover-dominant after late detections;
- far noise remains caution-dominant;
- far cases begin showing transitions that were absent in `0:150`.

This would suggest that usefulness-state occupancy depends not only on impairment and distance, but also on the time horizon over which information contact is allowed to develop.

### 17.5 Belief quality shifts more than TTFD

If mean entropy AUC changes substantially under the longer window, especially in far cases, then window length may affect aggregate belief-quality summaries more than the short-window matrix suggested.

Interpret carefully because longer windows may change the scale or accumulated meaning of AUC-style metrics.

Do not compare absolute AUC values across different window lengths without acknowledging the window difference.

---

## 18. AUC caution under different windows

Subgoal 05 changes the execution window.

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

## 19. Expected possible result

A plausible result is:

```text
near and mid:
  finite TTFD remains finite, possibly with similar or modestly changed means

far:
  some or all cases may gain finite TTFD

very far:
  may remain missing, or may gain late finite TTFD

usefulness triad:
  likely remains healthy/exploit, delay/recover, noise/caution
```

But this should not be assumed.

The purpose of Subgoal 05 is to observe the actual behavior.

---

## 20. Minimal success criteria

Subgoal 05 is complete if:

1. The longer-window distance matrix executes, or failures are clearly recorded.
2. The analysis is extracted with `src/extract_analysis_study_summary.py`.
3. The extraction integrity report passes, or any failures are documented.
4. All 12 intended case labels are represented.
5. Each case has five seeds, unless any missing runs are explicitly documented.
6. The matrix can be grouped by distance band and condition.
7. TTFD finite counts and missing fractions are compared against the Subgoal 03 short-window result.
8. Dominant usefulness states are reported by distance band and condition.
9. Mean entropy AUC and coverage AUC are interpreted with window-length caution.
10. At least one clear conclusion is possible:
    - far TTFD missingness was mainly short-window-limited;
    - far TTFD missingness persisted under `0:250`;
    - usefulness triad remained stable across window extension;
    - or usefulness-state occupancy changed under longer observation.
11. No controller redesign is introduced.

---

## 21. What this subgoal is not

Subgoal 05 should not:

- add another physical artifact;
- vary tie-breaking;
- compare baseline policies;
- introduce regime management;
- change the usefulness controller;
- create new distance bands;
- change the ignition reference;
- generalize to all real fires;
- run multiple long windows unless the first result is unusable.

It is deliberately narrow:

> same artifact, same distance bands, same usefulness-family conditions, same seeds, longer window.

---

## 22. Likely next step after Subgoal 05

If Subgoal 05 is clean and interpretable, the next subgoal can take one of two directions.

### Option A: Clean figure/table packaging

If the short-window and longer-window results together are strong, create a figure/table packaging subgoal.

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
- corrected extraction provenance.

### Option B: Second physical artifact

If the result suggests a strong distance-window relationship, carry the distance protocol to another transformed real-fire artifact.

Possible title:

```text
AWSRT v0.6 Subgoal 06: Second-Artifact Distance Protocol Check
```

This would test whether the distance/usefulness separation survives outside `phy-b7edba9ac3`.

Do not decide this before interpreting Subgoal 05.

---

## 23. Working conclusion

Subgoal 05 is a focused test of time horizon.

Subgoal 03 showed that base-station distance strongly structured finite TTFD within `0:150` while leaving the compact usefulness triad readable.

Subgoal 05 asks whether that timing result persists when the observation window is extended to `0:250`.

The expected contribution is not simply another matrix.

The expected contribution is a clearer interpretation of the Subgoal 03 distance result:

> Was far-distance TTFD missing because detection was impossible under the tested geometry, or because the study window ended before delayed contact could become visible?

Answering that question strengthens the v0.6 claim that deployment geometry is a real structural variable, and that AWSRT can expose separations among timing, information delivery, belief quality, and usefulness-state behavior.
