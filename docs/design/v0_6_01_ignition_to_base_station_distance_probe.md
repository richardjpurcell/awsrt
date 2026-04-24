# AWSRT v0.6 Subgoal 01: Ignition-to-Base-Station Distance Probe

**Status:** Draft design note
**Applies to:** `v0.6-subgoal-01`
**Purpose:** Begin AWSRT v0.6 by reframing deployment geometry as a measurable structural variable: normalized distance between the initial fire context and the base station.

---

## 1. Purpose of this note

This note defines AWSRT v0.6 Subgoal 01.

AWSRT v0.5 closed with a useful but bounded structural-robustness result. Across deployment-origin variation and deterministic-versus-stochastic tie-breaking variation, the compact usefulness triad remained readable:

```text
healthy -> exploit-dominant
delay   -> recover-dominant
noise   -> caution-dominant
```

However, v0.5 also showed that deployment geometry matters, especially for detection timing and encounter behavior. Deployment origin affected TTFD strongly, while tie-breaking semantics affected secondary behavior such as TTFD availability, movement paths, and internal state-occupancy balance.

v0.6 therefore begins by turning deployment geometry from a categorical condition into a controlled structural variable.

The new question is:

> How does distance between the initial fire context and the base station shape detection timing, information delivery, belief quality, and usefulness-state behavior?

This subgoal does not redesign the controller.

It defines the first v0.6 scientific probe and the manual protocol needed to make ignition-to-base-station distance auditable.

---

## 2. Scientific intent

The scientific intent remains aligned with the core AWSRT thesis direction:

> Does the distinction between delivered information and operational usefulness survive contact with transformed real-fire conditions?

v0.5 showed that the usefulness triad remains readable under bounded structural variation.

v0.6 asks a sharper structural question:

> Can geometric access alone create usefulness stress, even when the information channel is otherwise healthy?

This is important because distance from the initial fire context may affect:

* first detection timing;
* whether observations arrive early enough to be useful;
* whether belief-state improvement tracks information delivery;
* whether healthy, delay, and noise conditions remain distinguishable;
* whether far but healthy cases begin to resemble delayed or recovery-stressed cases.

The goal is not to show that farther is always worse.

The goal is to test whether AWSRT can expose the difference between:

* physical/geometric access;
* communication impairment;
* information delivery;
* belief quality;
* and operational usefulness.

---

## 3. Relationship to v0.5

v0.5 asked:

> Does the usefulness triad remain readable under bounded deployment-origin and tie-breaking variation?

v0.6 asks:

> How does a measurable deployment-geometry variable — normalized ignition-to-base-station distance — affect the same usefulness-triad interpretation?

This is not merely more of v0.5.

The key shift is from categorical deployment origins:

```text
origin_near_initial
origin_south_central
origin_east_corridor
```

to distance-banded deployment origins:

```text
dist_near
dist_mid
dist_far
dist_very_far
```

where each band is tied to an approximate percentage distance from the ignition reference point.

This allows deployment geometry to become an interpretable scientific axis rather than a set of named coordinates.

---

## 4. Core question

Subgoal 01 centers on this question:

> As normalized distance between initial ignition and base station increases, do TTFD, information delivery, belief quality, and usefulness-state behavior degrade together, or do they separate?

The expected separations are scientifically important.

For example:

* TTFD may degrade sharply with distance.
* Mean entropy AUC may degrade less sharply.
* Delivered information may not track belief quality.
* Healthy-but-far cases may show recovery-like stress.
* Delay may become more severe as geometric distance increases.
* Noise may remain caution-dominant regardless of distance.

The purpose is to make these possible divergences visible.

---

## 5. Initial scope

Subgoal 01 is a design and protocol subgoal.

It should define:

1. how to identify the initial ignition reference point;
2. how to choose base-station locations by approximate normalized distance;
3. how to label distance-band cases;
4. how to keep stochastic tie-breaking explicit;
5. how to preserve auditability in the absence of fully automated ignition extraction;
6. what code changes are required now versus later.

The first implementation should remain manual and bounded.

Do not begin with automatic ignition detection, random base-station generation, or broad cross-artifact scaling.

Those are valid later extensions, but the first v0.6 step should establish a clear manual protocol.

---

## 6. Tie-breaking choice for v0.6

v0.6 should fix tie-breaking to stochastic for the distance probe.

This should be included explicitly in every case definition:

```json
{
  "network.tie_breaking": "stochastic"
}
```

This is recommended because v0.5 showed that deterministic-versus-stochastic tie-breaking did not materially change the dominant usefulness-triad interpretation under the tested bounded conditions, while deterministic tie-breaking retained a known directional artifact.

The precise interpretation is:

> v0.5 did not show that deterministic and stochastic tie-breaking are universally equivalent. It showed that, for the tested bounded usefulness-triad studies, stochastic tie-breaking did not overturn the qualitative impairment-to-state mapping.

Therefore, in v0.6, stochastic tie-breaking is treated as a fixed control setting, not as an experimental variable.

This avoids carrying forward the known deterministic up-left movement artifact while preserving a clearly documented tie-breaking choice.

---

## 7. Coordinate convention note

AWSRT commonly uses row-column coordinate ordering:

```text
(row, column)
```

This is sometimes visually confusing because rendered images are often read in x-y ordering:

```text
(x, y)
```

For v0.6, the note should preserve both when documenting manually identified points.

Use this convention:

```text
ignition_render_xy = (x, y)
ignition_render_rc = (row, column) = (y, x)
base_station_rc    = (row, column)
```

The long-term coordinate-cleanup problem is real but should not block v0.6.

For this subgoal, the important requirement is explicit naming.

Do not write simply:

```text
ignition = (548, 638)
```

Instead write:

```text
ignition_render_rc = (548, 638)
```

or:

```text
ignition_render_xy = (638, 548)
```

depending on the frame of reference.

---

## 8. Manual ignition-point protocol

### 8.1 Purpose

The ignition-point protocol exists to make the distance probe auditable.

Because all current reference fires begin at frame 0, the initial ignition point can be identified from the physical render at frame 0.

For now, this will be done manually.

Manual identification is acceptable at this stage because:

* the study is bounded;
* the number of physical artifacts is small;
* exact ignition-point automation is not the scientific question yet;
* manual coordinates can be recorded transparently;
* the protocol can later be replaced with automated extraction.

### 8.2 Required record for each physical artifact

For each physical artifact used in v0.6, record:

```text
phy_id:
render_file:
frame:
image_size_px:
ignition_render_bbox_xy:
ignition_render_center_xy:
ignition_render_center_rc:
visual_description:
notes:
```

Example:

```text
phy_id: phy-b7edba9ac3
render_file: fire_alpha_v3_grid_px1.png
frame: 0
image_size_px: 2048 x 1534
ignition_render_bbox_xy: x=616..660, y=534..562
ignition_render_center_xy: (638, 548)
ignition_render_center_rc: (548, 638)
visual_description: small horizontal red ignition mark in the upper-left quadrant, slightly left of center and above the horizontal midpoint
notes: render-space coordinate; not yet asserted to be native simulation-grid coordinate
```

### 8.3 Manual identification steps

1. Open the physical render at frame 0.
2. Locate the visible initial red fire/ignition cluster.
3. Estimate the bounding box around the visible red cluster.
4. Record the bounding box in x-y image coordinates.
5. Compute or estimate the center of the box.
6. Convert the center to row-column notation by swapping y and x.
7. Record both x-y and row-column forms.
8. Add a plain-language visual description.
9. Use the row-column form only when specifying base-station distances in AWSRT-style coordinates.
10. Clearly label whether coordinates are render-space or native simulation-space.

### 8.4 Current manually identified ignition point

For the uploaded frame-0 render:

```text
render_file: fire_alpha_v3_grid_px1.png
image_size_px: 2048 x 1534
ignition_render_bbox_xy: x=616..660, y=534..562
ignition_render_center_xy: (638, 548)
ignition_render_center_rc: (548, 638)
```

Visual description:

> The ignition appears as a small horizontal red cluster in the upper-left quadrant, slightly left of the image center and above the horizontal midpoint.

This should be treated as a manual render-space reference point.

---

## 9. Distance definition

For the first v0.6 probe, define normalized ignition-to-base-station distance as:

```text
normalized_distance = euclidean_distance(base_station_rc, ignition_reference_rc) / domain_diagonal
```

where:

```text
domain_diagonal = sqrt(n_rows^2 + n_cols^2)
```

For render-space calculations, use render dimensions.

For native simulation-grid calculations, use simulation grid dimensions.

The first manual pass may use render-space coordinates if the selected base-station coordinates are also chosen and recorded consistently in render-space-derived row-column terms. If operational `network.base_station_rc` uses native grid coordinates, then a mapping from render coordinates to native grid coordinates must be stated before executing the matrix.

The important distinction is:

```text
render-space distance is for manual visual design
native-grid distance is for actual operational execution
```

Subgoal 01 may document both, but the executed cases must be clear about which coordinate system produced `network.base_station_rc`.

---

## 10. Distance bands

Use a small number of approximate distance bands.

Recommended initial bands:

```text
dist_15_near
dist_30_mid
dist_50_far
dist_70_very_far
```

These labels should mean approximately:

```text
15% of domain diagonal from ignition reference
30% of domain diagonal from ignition reference
50% of domain diagonal from ignition reference
70% of domain diagonal from ignition reference
```

The exact achieved distance should be recorded for every case.

For example:

```text
case_label: dist_30_mid__healthy
intended_normalized_distance: 0.30
actual_normalized_distance: 0.287
base_station_rc: (r, c)
ignition_reference_rc: (548, 638)
```

The study should not depend on perfect distances. It depends on transparent, ordered distance bands.

---

## 11. Base-station selection protocol

### 11.1 Initial manual selection

For the first v0.6 matrix, manually choose base-station coordinates at increasing approximate normalized distances from the ignition reference point.

The chosen points should:

* remain inside the valid grid/domain;
* avoid obvious edge-only artifacts where possible;
* progress monotonically outward from the ignition reference;
* be visually interpretable;
* be recorded with actual distance and normalized distance;
* use stochastic tie-breaking in every case.

### 11.2 Direction/ray choice

There are two possible strategies.

#### Option A: One fixed outward direction

Choose all base-station points along one approximate direction away from ignition.

This isolates distance but may confound the result with direction.

#### Option B: Plausible operational corridor

Choose points that represent increasing practical distance from the initial fire context while staying within plausible deployment geometry.

This is more realistic but less geometrically pure.

For the first v0.6 probe, Option B is acceptable if the chosen points are documented clearly.

The main requirement is not geometric perfection.

The main requirement is auditability.

---

## 12. Proposed first experiment shape

The first executable matrix should remain compact:

```text
4 distance bands × 3 usefulness-family conditions × 5 seeds = 60 runs
```

Use the same usefulness-family conditions as v0.5:

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

Fixed controls:

```text
physical artifact: phy-b7edba9ac3 initially
policy: usefulness_proto
tie_breaking: stochastic, explicitly set in every case
execution_window: 0:150 initially
seeds: 0,1,2,3,4
regime enabled: no
O1 enabled: yes
```

The first physical artifact should remain `phy-b7edba9ac3` because it is already familiar from v0.5.

Cross-physical-context distance studies should wait until the one-artifact distance protocol is readable.

---

## 13. Suggested case-label structure

Use labels that encode distance band and usefulness-family condition:

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

dist_70_very_far__healthy
dist_70_very_far__delay
dist_70_very_far__noise
```

If needed, include the tie-breaking setting in the label as well:

```text
dist_30_mid__healthy__stoch
```

However, because v0.6 fixes stochastic tie-breaking in every case, it may be cleaner to keep labels focused on distance and impairment while ensuring the case override explicitly includes:

```json
"network.tie_breaking": "stochastic"
```

---

## 14. Example case definition

Example healthy near-distance case:

```json
{
  "label": "dist_15_near__healthy",
  "overrides": {
    "network.base_station_rc": [r_near, c_near],
    "network.policy": "usefulness_proto",
    "network.tie_breaking": "stochastic",
    "impairments.delay_steps": 0,
    "impairments.loss_prob": 0,
    "impairments.noise_level": 0,
    "study.case_family": "usefulness_distance",
    "study.case_kind": "healthy"
  }
}
```

Example far-delay case:

```json
{
  "label": "dist_50_far__delay",
  "overrides": {
    "network.base_station_rc": [r_far, c_far],
    "network.policy": "usefulness_proto",
    "network.tie_breaking": "stochastic",
    "impairments.delay_steps": 4,
    "impairments.loss_prob": 0,
    "impairments.noise_level": 0,
    "study.case_family": "usefulness_distance",
    "study.case_kind": "delay"
  }
}
```

The exact `base_station_rc` values should be filled only after the distance-band points are selected and audited.

---

## 15. Metrics of interest

Primary metrics:

* `ttfd`
* `mean_entropy_auc`
* `coverage_auc`
* `usefulness_regime_state_exploit_frac`
* `usefulness_regime_state_recover_frac`
* `usefulness_regime_state_caution_frac`

Secondary metrics:

* `usefulness_trigger_recover_hits`
* `usefulness_trigger_caution_hits`
* `usefulness_trigger_recover_from_caution_hits`
* `usefulness_trigger_exploit_hits`
* `delivered_info_proxy_mean`
* `mdc_residual_mean`
* `mdc_residual_pos_frac`
* `mdc_violation_rate`
* `movement_total_mean_l1`
* `moves_per_step_mean`
* `moved_frac_mean`
* `arrivals_frac_mean`
* `detections_arrived_frac_mean`

Audit fields:

* `case`
* `seed`
* `policy`
* `phy_id`
* `base_station_rc`
* `deployment_mode`
* `n_sensors`
* `tie_breaking`, if available
* `delay_steps`
* `noise_level`
* `loss_prob`

Distance-specific audit fields should be recorded manually at first and later added to exported rows if needed:

* `ignition_reference_rc`
* `intended_normalized_distance`
* `actual_normalized_distance`
* `distance_band`
* `distance_coordinate_space`

---

## 16. Expected interpretations

### 16.1 Simple monotonic degradation

If increasing distance causes worse TTFD, worse entropy, lower delivered information, and more stressed usefulness states, then distance acts as a broad structural difficulty axis.

This would be useful, but not the most interesting possible result.

### 16.2 Metric separation

A more scientifically interesting result would be:

* TTFD degrades sharply with distance;
* mean entropy changes less sharply;
* delivered information changes differently from entropy;
* usefulness state occupancy shifts in ways that do not reduce to TTFD alone.

This would reinforce the AWSRT thesis:

> detection timing, information delivery, belief quality, and operational usefulness are related but distinct.

### 16.3 Healthy-far usefulness stress

A particularly important outcome would be:

> healthy-but-far cases begin to show recover-like or caution-like stress.

This would suggest that geometric access impairment can create usefulness stress even without communication impairment.

That would be a strong v0.6 scientific finding.

### 16.4 Stable impairment-family interpretation

Another possible outcome is:

```text
healthy -> exploit
delay   -> recover
noise   -> caution
```

across all distance bands.

This would strengthen the robustness interpretation of the usefulness triad.

Even then, TTFD and secondary metrics may still vary with distance.

---

## 17. Code-change implications

The first manual v0.6 distance probe can begin with minimal or no backend changes if base-station coordinates are selected manually and entered through existing Analysis Batch case overrides.

The existing mechanism already supports:

```json
{
  "network.base_station_rc": [r, c],
  "network.tie_breaking": "stochastic"
}
```

Therefore, the minimal path is:

1. manually identify ignition reference point;
2. manually choose distance-band base-station coordinates;
3. manually compute and document intended/actual normalized distances;
4. enter `network.base_station_rc` and `network.tie_breaking` in each case override;
5. analyze outputs using existing columns.

However, code changes will likely be useful if the distance protocol becomes a recurring study axis.

Potential code changes include:

### 17.1 Analysis-row audit fields

Add optional analysis output columns such as:

```text
ignition_reference_rc
distance_band
intended_normalized_distance
actual_normalized_distance
distance_coordinate_space
tie_breaking
```

This would make distance studies easier to audit without relying only on case labels and design notes.

### 17.2 Analysis Batch UI helper

Add a case-building helper that accepts:

```text
ignition_reference_rc
normalized_distance
bearing or direction mode
```

and produces a candidate `network.base_station_rc`.

This is useful later, but not required for the first manual study.

### 17.3 Ignition extraction helper

Add a small utility that reads a frame-0 fire render or underlying physical manifest and extracts the initial ignition/fire cluster centroid.

This should wait until the manual protocol is understood.

### 17.4 Distance extraction script

Before backend or UI changes, a lightweight script may be enough:

```text
scripts/compute_ignition_distance_cases.py
```

The script could take:

```text
n_rows
n_cols
ignition_reference_rc
candidate_base_station_rc values
```

and output:

```text
raw_distance
normalized_distance
distance_band
case label suggestions
```

This is probably the best first code addition if manual calculation becomes tedious.

---

## 18. Minimal implementation recommendation

For Subgoal 01, do not implement broad automation yet.

The recommended implementation path is:

1. Write this design note.
2. Select the first physical artifact: `phy-b7edba9ac3`.
3. Record the manual ignition point from the frame-0 render.
4. Select four candidate base-station coordinates at increasing approximate normalized distances.
5. Use a small script or spreadsheet to compute actual normalized distances.
6. Create the first distance-band case matrix manually in Analysis Batch.
7. Keep `network.tie_breaking = stochastic` explicit in every case.
8. Run a smoke matrix before committing to the full five-seed matrix.

This keeps the science moving while avoiding premature infrastructure.

---

## 19. Minimal success criteria

Subgoal 01 is complete if:

1. The ignition-to-base-station distance protocol is documented.
2. The coordinate convention is explicitly stated.
3. The first manually identified ignition reference point is recorded.
4. The intended distance-band structure is defined.
5. The decision to use explicit stochastic tie-breaking is recorded.
6. The note distinguishes manual protocol from later automation.
7. The required versus optional code changes are clear.
8. The next executable matrix can be defined without ambiguity.

Subgoal 01 does not need to run the full experiment.

It prepares the distance-probe design.

---

## 20. Likely next step

The next subgoal should be:

```text
AWSRT v0.6 Subgoal 02: Manual Distance-Band Case Selection and Audit
```

That subgoal should choose the actual `base_station_rc` values for the distance bands, compute their normalized distances, and prepare the first executable Analysis Batch matrix.

A likely filename would be:

```text
docs/design/v0_6_02_manual_distance_band_case_selection.md
```

Subgoal 02 should not yet broaden to multiple physical artifacts.

The first priority is to make the distance axis clean and auditable on one known transformed real-fire artifact.

---

## 21. Working note

v0.6 should not be framed as another robustness repetition.

It should be framed as a controlled structural-distance probe.

The important shift is:

> v0.5 showed that deployment geometry matters; v0.6 asks how much, and in what metric-specific ways, distance from the initial fire context matters.

This is scientifically stronger than simply adding more artifacts.

It directly supports the AWSRT thesis by testing whether geometric access, communication impairment, information delivery, belief quality, and usefulness-state behavior separate under controlled distance variation.
