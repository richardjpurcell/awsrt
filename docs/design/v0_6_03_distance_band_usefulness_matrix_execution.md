# AWSRT v0.6 Subgoal 03: Distance-Band Usefulness Matrix Execution

**Status:** Closed design / completed subgoal  
**Applies to:** `v0.6-subgoal-03`  
**Primary run:** `data/metrics/ana-194fc0a69b`  
**Repair run:** `data/metrics/ana-5c07ad299a`  
**Purpose:** Run the first ignition-to-base-station distance-band usefulness matrix on `phy-b7edba9ac3`, using explicit stochastic tie-breaking, and interpret whether distance separates detection timing, information delivery, belief quality, and usefulness-state behavior.

---

## 1. Purpose of this note

This note records AWSRT v0.6 Subgoal 03.

Subgoal 01 established the scientific direction for v0.6:

> Treat distance between the initial fire context and the base station as a measurable structural variable.

Subgoal 02 then established the first manual distance-band setup for the known transformed real-fire artifact:

```text
phy-b7edba9ac3
```

It identified a native-grid ignition reference and selected four auditable base-station locations at increasing normalized distances from that reference.

Subgoal 03 executed the first distance-band usefulness matrix using that setup.

The purpose was to test whether increasing ignition-to-base-station distance changes:

- time to first detection;
- information delivery;
- belief-quality summaries;
- usefulness-state occupancy;
- and the healthy/delay/noise triad interpretation.

This was not a controller redesign and not a new deployment-policy comparison.

It was a controlled structural-distance probe.

---

## 2. Scientific question

Subgoal 03 centered on this question:

> As normalized distance between the initial fire context and the base station increases, do detection timing, information delivery, belief quality, and usefulness-state behavior degrade together, or do they separate?

The strongest scientific contribution was not simply showing that farther base stations are worse.

The more important question was whether distance affects AWSRT metrics differently.

For example:

- TTFD may become later or more frequently missing as distance increases.
- Mean entropy AUC may shift less dramatically than TTFD.
- Delivered-information summaries may not track belief-quality summaries.
- Healthy-but-far cases may remain exploit-like rather than showing impairment stress.
- Delay may remain recover-readable even when TTFD becomes missing.
- Noise may remain caution-dominant regardless of distance.

The completed result supports this separation framing.

---

## 3. Relationship to v0.5

AWSRT v0.5 showed that the compact usefulness triad remained interpretable under bounded structural variation.

The key v0.5 interpretation was:

```text
healthy -> exploit-dominant
delay   -> recover-dominant
noise   -> caution-dominant
```

even when deployment origin and tie-breaking semantics varied.

However, v0.5 also showed that structure matters:

- deployment origin strongly affected TTFD;
- deterministic tie-breaking introduced a directional artifact;
- stochastic tie-breaking changed TTFD availability and state-occupancy balance without changing the dominant triad mapping.

Subgoal 03 built on that by turning deployment geometry into a distance axis.

The new question was not only:

> Does the triad survive?

but also:

> How does distance shape the metric separations that the triad is meant to expose?

---

## 4. Fixed physical artifact

The matrix used the same transformed real-fire artifact as the v0.5 structural-robustness studies:

```text
phy-b7edba9ac3
```

Known native grid:

```text
H = 1085
W = 1448
domain_diagonal_cells = 1809.400176854197
```

This physical artifact was appropriate for the first v0.6 distance probe because:

- it had already been used in v0.5;
- its behavior was partially understood;
- the native `day_of_burn` and `fire_state` fields were available in Zarr;
- the initial ignition reference could be derived from native fields;
- the first matrix could focus on distance rather than cross-context variation.

No additional physical artifacts were added in Subgoal 03.

---

## 5. Native ignition reference

Subgoal 03 used the Subgoal 02 native ignition reference:

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

Sanity checks:

```text
fire_state[0] burning centroid rc: (395.57, 450.27)
fire_state[0] rounded centroid rc: (396, 450)
render-derived estimate rc: (388, 451)
distance between render estimate and day_of_burn centroid: ~5.33 cells
```

For Subgoal 03, the official ignition reference was:

```text
ignition_reference_rc = (393, 448)
```

---

## 6. Distance-band base stations

Subgoal 03 used the four distance bands selected in Subgoal 02.

```text
distance_band       base_station_rc   raw_distance_cells   normalized_distance
dist_15_near        (585, 640)        271.53               0.150
dist_30_mid         (777, 832)        543.06               0.300
dist_50_far         (1033, 1088)      905.10               0.500
dist_60_very_far    (1080, 1320)      1110.11              0.614
```

The first three bands followed an approximate southeast progression from the ignition reference.

The fourth band was boundary-limited. It was not a true 70% diagonal-distance case. It was instead the farthest practical selected candidate from the manual case-selection step, with an achieved normalized distance of approximately `0.614`.

Therefore, the correct label remains:

```text
dist_60_very_far
```

not:

```text
dist_70_very_far
```

This keeps the study truthful.

---

## 7. Tie-breaking

Subgoal 03 used stochastic tie-breaking in every intended case.

Each case override explicitly included:

```json
{
  "network.tie_breaking": "stochastic"
}
```

This was not left to a global default.

The justification was inherited from v0.5:

> Deterministic and stochastic tie-breaking did not materially change the dominant usefulness-triad interpretation under the bounded v0.5 tests, while deterministic tie-breaking retained a known directional artifact.

Therefore, Subgoal 03 treated stochastic tie-breaking as a fixed control setting.

Tie-breaking was not varied in this subgoal.

One audit caveat is that `tie_breaking` did not appear as a row-level column in the extracted `table.csv`. The sweep overrides and design record preserve the intended setting.

---

## 8. Usefulness-family conditions

Subgoal 03 used the same three usefulness-family conditions from v0.5.

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

These conditions preserved continuity with the v0.5 interpretation.

The purpose was to determine whether distance changed the previously readable mapping:

```text
healthy -> exploit
delay   -> recover
noise   -> caution
```

---

## 9. Matrix shape

The intended matrix was:

```text
4 distance bands × 3 usefulness-family conditions × 5 seeds = 60 runs
```

Seeds:

```text
0,1,2,3,4
```

The primary run produced a 60-row matrix:

```text
ana_id = ana-194fc0a69b
row_count = 60
```

A subsequent audit found two case-label / override mismatches in the primary run. A targeted repair run was then executed:

```text
ana_id = ana-5c07ad299a
row_count = 10
```

The corrected conceptual matrix should therefore be read as:

```text
ana-194fc0a69b = main matrix, with two invalid cells excluded
ana-5c07ad299a = repair patch for the two invalid cells
```

Together, these provide the complete corrected 60-row interpretation.

---

## 10. Recommended Analysis Batch settings used

The intended settings were:

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
Execution window:    0:150
Regime enabled:      no
O1 enabled:          yes
```

The execution window remained:

```text
execution_window.start_step = 0
execution_window.end_step_exclusive = 150
```

The window was not lengthened before the first distance-band result was interpreted.

Missing TTFD was allowed and became scientifically meaningful.

---

## 11. Case labels

The intended 12 case labels were:

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

The primary run represented all 12 labels with five rows per label.

However, row-level audit found that two labels in the primary run carried incorrect overrides:

```text
dist_15_near__noise
dist_60_very_far__delay
```

These two cells were repaired in `ana-5c07ad299a`.

---

## 12. Sweep cases

The intended sweep cases were as follows.

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

---

## 13. Metrics of interest

Primary metrics:

- `ttfd`
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

Distance metadata preserved manually:

```text
distance_band
base_station_rc
ignition_reference_rc
raw_distance_cells
normalized_distance
```

---

## 14. Extraction and audit outcome

A lightweight inspection script was used to inspect:

```text
data/metrics/ana-194fc0a69b/summary.json
data/metrics/ana-194fc0a69b/table.csv
```

The primary run had:

```text
row_count = 60
columns = 136
phy_id = phy-b7edba9ac3
policy = usefulness_proto
base_station_rc values:
  (585, 640)
  (777, 832)
  (1033, 1088)
  (1080, 1320)
```

All 12 intended labels appeared, with five rows each.

However, the row-level audit found two incorrect case-label / override pairings.

### 14.1 Invalid primary-run cell: `dist_15_near__noise`

Rows labeled:

```text
dist_15_near__noise
```

in `ana-194fc0a69b` actually had:

```text
base_station_rc = (777, 832)
delay_steps = 0
noise_level = 0.0
```

This was the `dist_30_mid__healthy` configuration, not `dist_15_near__noise`.

Expected:

```text
case = dist_15_near__noise
base_station_rc = (585, 640)
delay_steps = 0
loss_prob = 0
noise_level = 0.2
```

### 14.2 Invalid primary-run cell: `dist_60_very_far__delay`

Rows labeled:

```text
dist_60_very_far__delay
```

in `ana-194fc0a69b` actually had:

```text
base_station_rc = (1080, 1320)
delay_steps = 0
noise_level = 0.0
```

This was the `dist_60_very_far__healthy` configuration, not `dist_60_very_far__delay`.

Expected:

```text
case = dist_60_very_far__delay
base_station_rc = (1080, 1320)
delay_steps = 4
loss_prob = 0
noise_level = 0
```

### 14.3 Repair run

The two invalid cells were rerun in:

```text
ana_id = ana-5c07ad299a
row_count = 10
```

The repair run included:

```text
dist_15_near__noise
dist_60_very_far__delay
```

with the correct sweep overrides:

```text
dist_15_near__noise:
  base_station_rc = (585, 640)
  delay_steps = 0
  loss_prob = 0
  noise_level = 0.2
  network.tie_breaking = stochastic

dist_60_very_far__delay:
  base_station_rc = (1080, 1320)
  delay_steps = 4
  loss_prob = 0
  noise_level = 0
  network.tie_breaking = stochastic
```

Therefore, the corrected interpretation uses:

- the 50 valid rows from `ana-194fc0a69b`;
- plus the 10 repaired rows from `ana-5c07ad299a`.

---

## 15. Corrected compact result table

The following table records the corrected case-level means used for interpretation.

```text
distance_band       condition   ttfd    mean_entropy_auc   coverage_auc   delivered_info_proxy_mean   mdc_residual_mean   mdc_violation_rate   exploit_frac   recover_frac   caution_frac
dist_15_near        healthy     85.8    21.180548          0.039172       0.000061                    0.000059           0.021476             0.660000       0.148000       0.192000
dist_15_near        delay       85.8    21.197121          0.039035       0.000065                    0.000065           0.077852             0.033333       0.728000       0.238667
dist_15_near        noise       92.4    21.251278          0.037230       0.000053                    0.000055           0.006711             0.009333       0.014667       0.976000

dist_30_mid         healthy     108.8   21.172395          0.039218       0.000046                    0.000042           0.013423             0.764000       0.082667       0.153333
dist_30_mid         delay       108.0   21.178263          0.039065       0.000042                    0.000039           0.046980             0.033333       0.758667       0.208000
dist_30_mid         noise       119.8   21.249971          0.037106       0.000052                    0.000054           0.006711             0.009333       0.024000       0.966667

dist_50_far         healthy     NaN     21.169322          0.038953       0.000034                    0.000030           0.006711             1.000000       0.000000       0.000000
dist_50_far         delay       NaN     21.172800          0.038799       0.000032                    0.000028           0.033557             0.033333       0.966667       0.000000
dist_50_far         noise       NaN     21.248989          0.037148       0.000053                    0.000054           0.006711             0.006667       0.010667       0.982667

dist_60_very_far    healthy     NaN     21.170255          0.038597       0.000033                    0.000029           0.006711             1.000000       0.000000       0.000000
dist_60_very_far    delay       NaN     21.174518          0.038350       0.000031                    0.000027           0.033557             0.033333       0.966667       0.000000
dist_60_very_far    noise       NaN     21.246796          0.036101       0.000051                    0.000052           0.006711             0.006667       0.026667       0.966667
```

Notes:

- `NaN` TTFD means no finite TTFD within the `0:150` window.
- The two repaired values are:
  - `dist_15_near__noise` from `ana-5c07ad299a`;
  - `dist_60_very_far__delay` from `ana-5c07ad299a`.
- The remaining values are from the valid cells of `ana-194fc0a69b`.

---

## 16. TTFD outcome

Distance strongly affected finite TTFD availability.

Finite TTFD was present for the two nearer distance bands:

```text
dist_15_near:
  healthy = 85.8
  delay   = 85.8
  noise   = 92.4

dist_30_mid:
  healthy = 108.8
  delay   = 108.0
  noise   = 119.8
```

TTFD was missing for the two farther distance bands:

```text
dist_50_far:
  healthy = NaN
  delay   = NaN
  noise   = NaN

dist_60_very_far:
  healthy = NaN
  delay   = NaN
  noise   = NaN
```

This is the strongest distance effect in the matrix.

Interpretation:

> Ignition-to-base-station distance strongly affects whether finite TTFD is observed within the fixed 150-step window.

However, TTFD missingness did not imply collapse of the usefulness triad.

---

## 17. Usefulness triad outcome

The corrected matrix strongly preserves the compact usefulness triad.

### 17.1 Healthy cases

Healthy cases were exploit-dominant, especially at farther distances.

```text
healthy:
  dist_15_near        exploit = 0.660000
  dist_30_mid         exploit = 0.764000
  dist_50_far         exploit = 1.000000
  dist_60_very_far    exploit = 1.000000
```

The near healthy case retained some recover/caution occupancy, but exploit remained dominant.

Interpretation:

> Distance alone did not create recover- or caution-dominant usefulness stress in healthy cases.

### 17.2 Delay cases

Delay cases were recover-dominant across all distance bands.

```text
delay:
  dist_15_near        recover = 0.728000
  dist_30_mid         recover = 0.758667
  dist_50_far         recover = 0.966667
  dist_60_very_far    recover = 0.966667
```

The far and very-far delay cases were especially pure recover cases.

Interpretation:

> Delay remained recover-readable even when TTFD was missing at larger distances.

This is one of the clearest Subgoal 03 results.

### 17.3 Noise cases

Noise cases were caution-dominant across all distance bands.

```text
noise:
  dist_15_near        caution = 0.976000
  dist_30_mid         caution = 0.966667
  dist_50_far         caution = 0.982667
  dist_60_very_far    caution = 0.966667
```

Interpretation:

> Noise remained caution-readable across the full corrected distance matrix.

This extends the v0.5 corruption-side interpretation into the v0.6 distance-band setting.

---

## 18. Belief quality and information delivery outcome

Mean entropy AUC remained comparatively bounded relative to the sharp TTFD missingness change.

Approximate range across the corrected cases:

```text
mean_entropy_auc range ≈ 21.169 to 21.251
```

Coverage AUC also shifted only modestly, though noise cases generally had lower coverage at larger distances.

Delivered-information and MDC residual metrics varied by condition and distance, but they did not collapse into the same pattern as TTFD.

This supports the central AWSRT distinction:

> Detection timing, information delivery, belief quality, and usefulness-state behavior are related but non-identical metric families.

The most important separation is that far and very-far cases can have missing TTFD while still showing clear usefulness-state occupancy:

```text
dist_50_far__delay:
  TTFD = NaN
  recover = 0.966667

dist_60_very_far__delay:
  TTFD = NaN
  recover = 0.966667

dist_50_far__noise:
  TTFD = NaN
  caution = 0.982667

dist_60_very_far__noise:
  TTFD = NaN
  caution = 0.966667
```

Thus, TTFD failure within the window does not make the usefulness state uninterpretable.

---

## 19. Interpretation criteria revisited

### 19.1 Distance has little effect

Not supported.

Distance had a strong effect on TTFD availability.

### 19.2 TTFD changes more than belief quality

Supported.

TTFD shifted from finite to missing between the mid and far distance bands, while mean entropy AUC remained comparatively bounded.

This reinforces:

> First detection timing and aggregate belief quality are not the same metric.

### 19.3 Distance induces usefulness stress

Not supported for healthy cases.

Far healthy cases became fully exploit-dominant rather than recover- or caution-dominant.

This suggests that distance alone was not read by the compact usefulness controller as a degraded information-health condition.

### 19.4 Distance amplifies delay

Partially supported, but with a specific interpretation.

Delay remained recover-dominant at near and mid distances and became even more purely recover-dominant at far and very-far distances.

However, this should not be overread as monotonic degradation. It is better framed as:

> Delay remains recover-readable under increasing distance, including when TTFD is missing.

### 19.5 Noise remains caution-dominant

Strongly supported.

Noise was caution-dominant across all corrected distance bands.

### 19.6 Triad mapping collapses at far distance

Not supported.

The corrected matrix shows that the triad mapping survives the far and very-far bands:

```text
healthy -> exploit
delay   -> recover
noise   -> caution
```

The key caveat is that TTFD becomes missing at the far bands, so the matrix demonstrates separation rather than simple robustness.

---

## 20. Main Subgoal 03 conclusion

Subgoal 03 shows that normalized ignition-to-base-station distance is a meaningful structural axis, but not because all metrics degrade together.

Distance strongly affects finite TTFD within the fixed `0:150` window:

```text
near and mid bands:
  finite TTFD

far and very-far bands:
  no finite TTFD
```

However, the compact usefulness triad remains condition-readable across the corrected matrix:

```text
healthy -> exploit
delay   -> recover
noise   -> caution
```

This means distance changes detection timing and contact geometry without collapsing the delivered-information/usefulness distinction.

The key v0.6 finding is separation, not monotonic degradation.

TTFD availability, belief-quality summaries, delivered-information proxies, and usefulness-state occupancy do not move as a single bundle. Distance can remove finite TTFD while the usefulness controller still expresses impairment-specific states.

This supports treating deployment geometry as a core experimental variable while preserving the usefulness triad as a readable diagnostic surface.

---

## 21. TTFD caution

Subgoals 08 and 09 showed that TTFD can be missing within a 150-step transformed real-fire window.

Subgoal 03 confirms that this missingness becomes structurally organized by distance.

Therefore, future reporting should include:

- finite TTFD means;
- finite TTFD count;
- missing fraction;
- whether missingness increases with distance;
- whether missingness differs by usefulness-family condition.

Do not over-interpret TTFD means when finite counts are small.

TTFD missingness is itself part of the access/timing story.

---

## 22. Regime metrics caution

Regime-family control remained disabled.

If regime-centered columns appear in the analysis output, they should not be interpreted as active regime behavior.

The operational surface under test was:

```text
usefulness_proto
```

and the compact triad:

```text
exploit
recover
caution
```

The repair run also reported regime-centered metrics, but those are not the basis of the Subgoal 03 interpretation.

---

## 23. What this subgoal did not do

Subgoal 03 did not:

- introduce multiple physical artifacts;
- vary tie-breaking;
- redesign the controller;
- add stochastic base-station sampling;
- add automatic ignition extraction;
- compare baseline policy families;
- expand to a 500-step window before interpreting the 150-step result;
- claim generalization to all real fires.

It remained deliberately narrow:

> one physical artifact, four distance bands, three usefulness-family conditions, five seeds, explicit stochastic tie-breaking.

---

## 24. Minimal success criteria review

Subgoal 03 is complete.

1. The distance-band matrix executed.
2. All 12 intended case labels were represented.
3. `base_station_rc` was visible and auditable in output rows.
4. Two invalid cells were identified by row-level audit.
5. The invalid cells were repaired by targeted rerun.
6. The corrected matrix can be grouped by distance band and condition.
7. TTFD finite counts and missingness were reported.
8. Usefulness-state occupancy was compared across distance bands and conditions.
9. A clear interpretation is possible:
   - distance is strongly TTFD-sensitive;
   - belief-quality summaries do not collapse in the same way;
   - the compact triad survives the corrected distance-band matrix.
10. No controller redesign was introduced.

---

## 25. Recommended next step after Subgoal 03

The next subgoal should consolidate the result and harden extraction/reporting.

Suggested next note:

```text
docs/design/v0_6_04_distance_band_interpretation_and_extraction_hardening.md
```

Possible title:

```text
AWSRT v0.6 Subgoal 04: Distance-Band Interpretation and Extraction Hardening
```

Subgoal 04 should likely do three things:

1. Create a reusable extraction script that can merge a main run and repair run into a corrected case-level table.
2. Add or preserve distance audit columns:
   - `distance_band`
   - `base_station_rc`
   - `raw_distance_cells`
   - `normalized_distance`
   - `condition`
   - `source_ana_id`
   - `repair_cell`
3. Decide whether the next experiment should:
   - rerun this matrix as a single clean 60-row artifact;
   - extend the execution window;
   - or carry the distance protocol to a second physical artifact.

A full rerun is not required for Subgoal 03 closeout as long as this note remains transparent about the repaired cells.

---

## 26. Working conclusion

Subgoal 03 was the first real v0.6 scientific experiment.

The important result is not that distance makes everything worse.

The important result is that distance separates the metric families.

The completed corrected matrix supports this statement:

> Base-station distance from the initial fire context is not just a geometric nuisance. It is a structural condition that can affect detection timing, information delivery, belief quality, and usefulness-state behavior differently.

It also supports a stronger continuation of the v0.5 usefulness-triad result:

> Under this bounded transformed real-fire distance-band probe, the compact usefulness triad remains readable: healthy maps to exploit, delay maps to recover, and noise maps to caution, even when distance causes finite TTFD to disappear within the fixed execution window.

This is directly aligned with the AWSRT thesis direction.

The platform is useful precisely because it can show when these quantities do not collapse into one another.
