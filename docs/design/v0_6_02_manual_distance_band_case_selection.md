# AWSRT v0.6 Subgoal 02: Manual Distance-Band Case Selection and Audit

**Status:** Draft design note  
**Applies to:** `v0.6-subgoal-02`  
**Purpose:** Establish the native-grid ignition reference for the first v0.6 distance probe, select auditable ignition-to-base-station distance bands, and prepare the first distance × usefulness-family Analysis Batch matrix.

---

## 1. Purpose of this note

This note defines AWSRT v0.6 Subgoal 02.

Subgoal 01 established the scientific rationale for reframing deployment geometry as a measurable structural variable: normalized distance between the initial fire context and the base station.

Subgoal 02 now turns that protocol into a concrete, auditable case-selection plan for the first executable v0.6 distance experiment.

The goals are to:

1. identify the native-grid ignition reference for the selected transformed real-fire physical artifact;
2. verify that the render-derived ignition estimate is consistent with native field data;
3. select a small set of base-station locations at increasing normalized distance from ignition;
4. document actual achieved distances rather than relying on idealized labels;
5. prepare the first distance × usefulness-family case matrix;
6. keep stochastic tie-breaking explicit in every case definition.

This subgoal should remain a case-selection and audit subgoal.

The experiment itself should be run in the next subgoal.

---

## 2. Scientific context

AWSRT v0.5 showed that deployment geometry matters, especially for detection timing and encounter behavior, while the usefulness triad remained interpretable under bounded structural variation.

v0.6 asks a sharper question:

> How does distance between the initial fire context and the base station shape detection timing, information delivery, belief quality, and usefulness-state behavior?

Subgoal 02 prepares the first controlled version of this question.

Instead of using named deployment origins such as:

```text
origin_near_initial
origin_south_central
origin_east_corridor
```

Subgoal 02 defines distance-banded cases such as:

```text
dist_15_near
dist_30_mid
dist_50_far
dist_60_very_far
```

The important shift is that deployment geometry becomes a recorded structural variable rather than only a named scenario.

---

## 3. Physical artifact under study

The first v0.6 distance-band probe should use the same transformed real-fire physical artifact that anchored the later v0.5 work:

```text
phy-b7edba9ac3
```

This is appropriate because the artifact is already understood from prior v0.5 experiments.

The native field data are stored in canonical Zarr form:

```text
data/fields/phy-b7edba9ac3/fields.zarr
```

The available datasets are:

```text
arrival_time: shape=(1085, 1448), dtype=float32
belief:       shape=(2621, 1085, 1448), dtype=float32
day_of_burn: shape=(1085, 1448), dtype=int16
dob_doy:     shape=(1085, 1448), dtype=uint16
fire_state:  shape=(2621, 1085, 1448), dtype=uint8
terrain:     shape=(1085, 1448), dtype=float32
terrain_dem_m: shape=(1085, 1448), dtype=float32
```

The manifest grid is:

```text
grid.H = 1085
grid.W = 1448
```

The native grid diagonal is:

```text
domain_diagonal_cells = 1809.400176854197
```

All v0.6 distance calculations for this first probe should use this native grid coordinate system.

---

## 4. Native ignition-reference definition

For CFSDS historical replay physical artifacts, the manifest does not necessarily contain an explicit synthetic ignition list.

For transformed real-fire runs, the initial fire context is implicit in the earliest burned cells of the kriged day-of-burn field.

Therefore, for this v0.6 distance protocol, define the ignition reference as:

```text
ignition_reference_rc = centroid(day_of_burn == min_positive(day_of_burn))
```

Equivalently, for this artifact:

```text
ignition_reference_rc = centroid(day_of_burn == 1)
```

This definition is preferred because it is:

- native-grid based;
- repeatable;
- independent of render scaling;
- tied directly to the historical replay construction;
- available for other CFSDS-derived physical artifacts later.

The frame-0 `fire_state` centroid and the rendered image estimate should be used only as validation checks.

---

## 5. Ignition-reference audit for `phy-b7edba9ac3`

The native field inspection produced the following result:

```text
grid H,W: 1085 × 1448
domain diagonal: 1809.400176854197 cells

day_of_burn min positive: 1
day_of_burn max: 108
burned cell count: 570012

earliest burned day: 1
earliest burned cell count: 741
earliest burned bbox rows: 378..406
earliest burned bbox cols: 419..475
earliest burned centroid rc: (392.63967611336034, 448.3724696356275)
earliest rounded centroid rc: (393, 448)
```

The frame-0 fire-state check produced:

```text
fire_state[0] burning cell count: 30
fire_state[0] burning bbox rows: 378..397
fire_state[0] burning bbox cols: 436..466
fire_state[0] burning centroid rc: (395.56666666666666, 450.26666666666665)
fire_state[0] rounded centroid rc: (396, 450)
```

The earlier render-derived estimate was:

```text
render-derived estimate rc: (388, 451)
```

Its distance from the native `day_of_burn == 1` centroid was approximately:

```text
5.33 cells
```

This validates the visual estimate as a useful sanity check, but the native day-of-burn centroid should be used for all distance calculations.

The selected ignition reference for this subgoal is therefore:

```text
ignition_reference_rc = (393, 448)
ignition_reference_method = centroid(day_of_burn == 1), rounded to nearest native-grid cell
coordinate_space = native_grid_rc
```

---

## 6. Distance definition

For this subgoal, normalized ignition-to-base-station distance is defined as:

```text
normalized_distance = euclidean_distance(base_station_rc, ignition_reference_rc) / domain_diagonal_cells
```

where:

```text
domain_diagonal_cells = sqrt(H^2 + W^2)
```

For `phy-b7edba9ac3`:

```text
H = 1085
W = 1448
domain_diagonal_cells = 1809.400176854197
ignition_reference_rc = (393, 448)
```

All selected base-station coordinates below are native-grid row-column coordinates.

---

## 7. Candidate distance-band selection

The initial ideal distance bands proposed in Subgoal 01 were approximately:

```text
15%, 30%, 50%, 70% of domain diagonal
```

A quick candidate calculation showed that 15%, 30%, and 50% are reachable along a simple southeast progression from the ignition reference.

However, a 70% point is not reachable along the same progression without leaving the grid.

The tested candidate values were:

```text
grid: (1085, 1448)
ignition_reference_rc: (393, 448)
diag: 1809.400176854197

dist_15_near             rc=(585, 640)   inside=True  dist=271.53   pct=0.150
dist_30_mid              rc=(777, 832)   inside=True  dist=543.06   pct=0.300
dist_50_far              rc=(1033, 1088) inside=True  dist=905.10   pct=0.500
dist_70_east             rc=(650, 1420)  inside=True  dist=1005.40  pct=0.556
dist_70_southeast_edge   rc=(1080, 1320) inside=True  dist=1110.11  pct=0.614
dist_70_south            rc=(1080, 900)  inside=True  dist=822.36   pct=0.454
```

This means the first three distance bands can be treated as approximately exact 15%, 30%, and 50% cases.

The farthest practical candidate tested is approximately 61.4% of the domain diagonal, not 70%.

Therefore, the fourth band should be truthfully labeled:

```text
dist_60_very_far
```

not:

```text
dist_70_very_far
```

---

## 8. Selected distance-band base stations

Use the following four distance bands for the first v0.6 distance probe:

| Distance band | Base station rc | Raw distance cells | Normalized distance | Notes |
|---|---:|---:|---:|---|
| `dist_15_near` | `(585, 640)` | `271.53` | `0.150` | Near case; follows southeast progression. |
| `dist_30_mid` | `(777, 832)` | `543.06` | `0.300` | Mid-distance case; follows southeast progression. |
| `dist_50_far` | `(1033, 1088)` | `905.10` | `0.500` | Far case; follows southeast progression. |
| `dist_60_very_far` | `(1080, 1320)` | `1110.11` | `0.614` | Boundary-limited farthest practical southeast/eastward candidate tested. |

The first three points follow a simple approximate southeast expansion from the ignition reference.

The fourth point is boundary-limited. It should be interpreted as the farthest practical selected point in this first manual distance ladder, not as a mathematically pure continuation of the same ray.

This is acceptable for the first v0.6 probe because the purpose is not geometric perfection. The purpose is an auditable, monotonic distance ladder.

---

## 9. Tie-breaking control

Tie-breaking should be fixed to stochastic in every case.

This should be included explicitly in every case definition:

```json
{
  "network.tie_breaking": "stochastic"
}
```

This choice is justified by v0.5.

v0.5 did not show that deterministic and stochastic tie-breaking are universally equivalent. It showed that, under the bounded usefulness-triad studies tested, stochastic tie-breaking did not overturn the dominant impairment-to-state mapping.

Using stochastic tie-breaking in v0.6 avoids carrying forward the known deterministic up-left movement artifact while preserving a documented control setting.

For Subgoal 02 and the following executable matrix, tie-breaking is not an experimental axis.

It is a fixed control.

---

## 10. Usefulness-family conditions

Use the same three usefulness-family conditions as the final v0.5 studies:

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

These conditions preserve continuity with v0.5 while allowing distance to become the new structural axis.

---

## 11. First executable matrix shape

The first v0.6 distance matrix should be:

```text
4 distance bands × 3 usefulness-family conditions × 5 seeds = 60 runs
```

Use:

```text
seeds = 0,1,2,3,4
```

Fixed controls:

```text
physical artifact: phy-b7edba9ac3
policy: usefulness_proto
tie_breaking: stochastic, explicitly set in every case
execution_window: 0:150 initially
regime enabled: no
O1 enabled: yes
deployment mode: dynamic
sensor count: 20
sensor radius: 250 m
move/step: 500 m
max moves/step: 0
min separation: 250 m
```

The experiment should be run in Subgoal 03, after this case-selection note is frozen.

---

## 12. Case labels

Use the following 12 case labels:

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

The tie-breaking mode is fixed and explicit in the overrides rather than encoded in the labels.

If later analysis shows that explicit tie-breaking labels are needed for audit convenience, labels may be extended to include:

```text
__stoch
```

For this subgoal, the cleaner label structure is:

```text
distance_band__condition
```

---

## 13. Analysis Batch case definitions

Use these case definitions as the starting matrix.

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

## 14. Metrics of interest

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

Audit fields:

- `case`
- `seed`
- `policy`
- `phy_id`
- `base_station_rc`
- `deployment_mode`
- `n_sensors`
- `delay_steps`
- `noise_level`
- `loss_prob`
- `tie_breaking`, if emitted

Distance-specific audit values should be preserved in this note and later in extraction scripts:

- `ignition_reference_rc`
- `distance_band`
- `base_station_rc`
- `raw_distance_cells`
- `normalized_distance`
- `coordinate_space`

---

## 15. Interpretation criteria for the next subgoal

The following experiment should ask:

> As ignition-to-base-station distance increases, do detection timing, information delivery, belief quality, and usefulness-state behavior degrade together, or do they separate?

Specific readings to check:

1. Does TTFD increase or become more frequently missing with distance?
2. Does mean entropy AUC degrade monotonically, weakly, or not at all?
3. Does healthy remain exploit-dominant at increasing distance?
4. Do far healthy cases begin to show recover-like stress?
5. Does delay remain recover-dominant across distance?
6. Does noise remain caution-dominant across distance?
7. Do delivered information and MDC residual metrics separate from TTFD or entropy?

A particularly important possible finding is:

> Geometric access impairment may create usefulness stress even without explicit communication impairment.

This would be visible if far healthy cases shift away from clean exploit dominance.

---

## 16. Code-change implications

No backend code changes are required to run the next experiment if the case overrides are entered manually.

The existing Analysis Batch system supports:

```json
{
  "network.base_station_rc": [r, c],
  "network.tie_breaking": "stochastic"
}
```

However, Subgoal 02 shows that distance-specific audit values are important. For now, these values can be stored in the design note and in extraction scripts.

Later, it may be useful to add optional analysis row fields such as:

```text
ignition_reference_rc
distance_band
raw_distance_cells
normalized_distance
distance_coordinate_space
tie_breaking
```

That should not block the first v0.6 distance matrix.

The recommended near-term path is:

1. use the manual case definitions in this note;
2. run the 60-row matrix in Subgoal 03;
3. use an extraction script to attach distance metadata by case label;
4. only add backend/schema fields if repeated distance studies make manual metadata brittle.

---

## 17. Minimal success criteria

Subgoal 02 is complete if:

1. The native-grid ignition reference is identified and recorded.
2. The frame-0 and render-derived ignition checks are recorded.
3. The native grid dimensions and domain diagonal are recorded.
4. Four distance-band base-station coordinates are selected.
5. Actual distances and normalized distances are recorded.
6. The fourth band is truthfully labeled `dist_60_very_far` rather than overstated as 70%.
7. Stochastic tie-breaking is explicitly included in every case definition.
8. A 12-case distance × usefulness-family matrix is prepared.
9. The subgoal remains a case-selection/audit step and does not expand into a broad experiment.

---

## 18. Likely next step

The next subgoal should run and interpret the first executable matrix:

```text
AWSRT v0.6 Subgoal 03: Ignition-Distance Usefulness Matrix Execution
```

Suggested filename:

```text
docs/design/v0_6_03_ignition_distance_usefulness_matrix_execution.md
```

Subgoal 03 should execute:

```text
4 distance bands × 3 usefulness-family conditions × 5 seeds = 60 runs
```

using the case definitions from this note.

The key output should be a compact interpretation of whether distance acts as:

- mostly a TTFD/access variable;
- a broader belief-quality variable;
- a usefulness-state stress variable;
- or a metric-separating structural condition.

---

## 19. Working note

Subgoal 02 turns the v0.6 idea into an executable distance axis.

The most important scientific improvement is that ignition distance is now defined from the native historical replay fields, not guessed from a render.

This gives the next experiment a defensible structural variable:

```text
normalized ignition-to-base-station distance
```

The study remains manual and bounded, but it is now auditable.

That is the right level of infrastructure for the first v0.6 distance probe.
