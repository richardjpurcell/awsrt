# AWSRT v0.6 Subgoal 08: Second-Artifact Distance Protocol Check

**Status:** Completed / interpreted design note  
**Applies to:** `v0.6-subgoal-08`  
**Recommended file:** `docs/design/v0_6_08_second_artifact_distance_protocol_check.md`  
**Depends on:** `v0.6-subgoal-03`, `v0.6-subgoal-04`, `v0.6-subgoal-05`, `v0.6-subgoal-06`, `v0.6-subgoal-07`  
**Primary reference artifact:** `phy-b7edba9ac3`  
**Second artifact:** `phy-79a8cea500` / CFSDS fire `2017_856`  
**Primary second-artifact window:** `700:1200`  
**Completed analysis:** `ana-70996f0076`  
**Purpose:** Test whether the v0.6 distance/window/usefulness separation observed on `phy-b7edba9ac3` survives contact with a second transformed real-fire artifact, using an artifact-appropriate window anchiored by observed fire engagement around the usual base-station region.

---

## 1. Purpose of this note

This note records AWSRT v0.6 Subgoal 08.

Subgoals 03 through 07 established and packaged a coherent distance-window result on one transformed real-fire artifact:

```text
phy-b7edba9ac3
```

The first-artifact v0.6 result was:

> base-station distance strongly affects finite TTFD availability; extending the observation window resolves some far-distance missingness; far-distance noise remains resistant; and the compact usefulness triad remains condition-readable.

That result was meaningful, but bounded to one physical artifact.

Subgoal 08 asked the next scientific question:

> Does the same distance/window/usefulness separation appear in a second transformed real-fire artifact?

The selected second artifact was:

```text
fire_id = 2017_856
phy_id  = phy-79a8cea500
```

The completed analysis was:

```text
ana_id = ana-70996f0076
execution_window = 700:1200
rows = 60
cases = 12
seeds = 0,1,2,3,4
repairs = none
```

Subgoal 08 is not a broad benchmark expansion.

It is a controlled second-artifact protocol check.

---

## 2. Scientific motivation

The v0.6 first-artifact result was strong enough to preserve, but not strong enough to generalize on its own.

For `phy-b7edba9ac3`, the earlier result showed:

```text
distance affects timing access;
window length changes finite TTFD availability;
noise remains far-distance TTFD-resistant;
the usefulness triad remains stable.
```

However, wildfire geometry, ignition location, domain shape, fire-growth morphology, and sensor/base-station geometry may differ substantially across physical artifacts.

The second selected artifact, `phy-79a8cea500`, is especially useful because visual inspection suggests that the fire becomes spatially complex and engages or encircles the usual base-station region near:

```text
base_station_reference_rc ≈ (750, 600)
```

during approximately:

```text
time slots 800..1100
```

This motivated an artifact-appropriate primary analysis window:

```text
execution_window = 700:1200
```

A second artifact check is therefore scientifically valuable because it tests whether the first-artifact result is:

- a local property of one replay;
- a consequence of the specific ignition/base-station geometry;
- a consequence of the short/long window framing used for that artifact;
- or a more general pattern that may survive across transformed real-fire contexts.

Subgoal 08 should be interpreted as a **bounded generalization check**, not as a final cross-fire validation campaign.

---

## 3. Relationship to Subgoal 07

Subgoal 07 synthesized the first-artifact distance-window result into thesis-facing language.

Its central interpretation was:

> distance and time horizon strongly affect finite detection timing, but the usefulness-state mapping remains stable across the tested conditions.

Subgoal 08 used that synthesis as the reference interpretation.

The goal was not to replace the first-artifact result.

The goal was to test whether a second artifact supports, weakens, or complicates it.

The completed result supports a bounded continuation of the first-artifact finding, with artifact-specific timing structure.

---

## 4. Main scientific question

Subgoal 08 centered on this question:

> When the distance-band protocol is applied to a second transformed real-fire artifact, do detection timing, information delivery, belief quality, and usefulness-state behavior separate in a similar way?

For `phy-79a8cea500`, the question had an artifact-specific refinement:

> How does usefulness behavior respond when base-station distance is varied in a fire whose later geometry appears to engage or encircle the usual central base-station region?

More specifically:

1. Does increasing ignition-to-base-station distance affect finite TTFD availability?
2. Does the artifact-appropriate `700:1200` window expose timing/usefulness behavior that would be missed by a generic `0:150` window?
3. Does noise remain more TTFD-resistant than healthy or delay at larger distances?
4. Does the compact triad remain condition-readable?
5. Do belief-quality and information-delivery summaries move together with TTFD, or separate?

The completed result is best interpreted as a **partial replication with artifact-specific timing geometry**.

---

## 5. Fixed protocol settings

The following settings were kept fixed relative to the first-artifact v0.6 protocol wherever possible:

```text
policy:              usefulness_proto
tie-breaking:        stochastic
regime enabled:      no
O1 enabled:          yes
seeds:               0,1,2,3,4
conditions:          healthy, delay, noise
delay condition:     delay_steps = 4, loss_prob = 0, noise_level = 0
noise condition:     delay_steps = 0, loss_prob = 0, noise_level = 0.2
healthy condition:   delay_steps = 0, loss_prob = 0, noise_level = 0
```

The experiment did not add:

- new policies;
- deterministic tie-breaking;
- regime management;
- new impairment families;
- new controller behavior;
- stochastic base-station sampling;
- additional artifacts.

The window differed from the first artifact because this artifact has a different time structure and a visually meaningful engagement period.

---

## 6. What was re-derived

The second artifact did not reuse the first artifact’s ignition reference or base-station locations.

For the second artifact, the following were re-derived:

```text
native grid shape
domain diagonal
ignition_reference_rc
distance-band candidate locations
actual raw distances
actual normalized distances
distance-band labels
artifact-appropriate window
```

The first artifact’s reference values were:

```text
artifact: phy-b7edba9ac3
grid: (1085, 1448)
ignition_reference_rc: (393, 448)
domain_diagonal_cells: 1809.400176854197
```

These values were not transferred to the second artifact.

---

## 7. Second artifact selection

The selected second transformed real-fire artifact was:

```text
fire_id = 2017_856
phy_id  = phy-79a8cea500
```

Raw CFSDS source bundle:

```text
data/cfsds/2017_856/
  2017_856_krig.tif
  bundle.json
  Firegrowth_groups_v1_1_2017_856.csv
  Firegrowth_pts_v1_1_2017_856.csv
```

Existing AWSRT manifest:

```text
data/manifests/phy-79a8cea500.json
```

The manifest identifies:

```text
fire_id: 2017_856
label:   2017_856 (DEM)
```

Existing fields path:

```text
data/fields/phy-79a8cea500/fields.zarr
```

Available Zarr datasets:

```text
arrival_time
belief
day_of_burn
dob_doy
fire_state
terrain
terrain_dem_m
```

This artifact was suitable because:

- it already exists as an AWSRT physical artifact;
- it has native Zarr fields available;
- it has a large enough domain for multiple distance bands;
- it has a meaningful early burned region;
- visual inspection suggests later fire engagement around a central/usual base-station region;
- it differs substantially from the first artifact’s geometry.

---

## 8. Artifact-specific audit: `2017_856` / `phy-79a8cea500`

Native-grid audit:

```text
phy_id: phy-79a8cea500
fire_id: 2017_856
grid: (1314, 1144)
domain_diagonal_cells: 1742.2204223346712
```

Zarr datasets:

```text
arrival_time: shape=(1314, 1144), dtype=float32
belief:       shape=(3485, 1314, 1144), dtype=float32
day_of_burn:  shape=(1314, 1144), dtype=int16
dob_doy:      shape=(1314, 1144), dtype=uint16
fire_state:   shape=(3485, 1314, 1144), dtype=uint8
terrain:      shape=(1314, 1144), dtype=float32
terrain_dem_m: shape=(1314, 1144), dtype=float32
```

Native ignition reference:

```text
ignition_reference_method = centroid(day_of_burn == min_positive_day_of_burn)
min_positive_day_of_burn = 1
earliest_burned_cell_count = 559
earliest_burned_bbox_rows = 857..1144
earliest_burned_bbox_cols = 236..944
earliest_centroid_rc = (1079.21, 767.30)
rounded_ignition_reference_rc = (1079, 767)
```

Fire-state sanity check:

```text
first_nonempty_fire_state_t = 0
fire_state[0] burning_count = 23
fire_state[0] bbox_rows = 857..1116
fire_state[0] bbox_cols = 236..933
fire_state[0] centroid_rc = (1096.87, 839.35)
fire_state[0] rounded_centroid_rc = (1097, 839)
distance_to_day_of_burn_centroid = 74.18 cells
```

Official Subgoal 08 ignition reference:

```text
ignition_reference_rc = (1079, 767)
```

---

## 9. Visual/time-window observation

Visual inspection of `2017_856` indicated that the fire becomes especially interesting around the central/usual base-station region.

Two screenshots were inspected around:

```text
time slot 800
time slot 1100
```

The fire appears to engage or encircle the region near:

```text
usual_base_reference_rc = (750, 600)
```

Distance from the official ignition reference:

```text
ignition_reference_rc = (1079, 767)
usual_base_reference_rc = (750, 600)
raw_distance_cells = 368.95799218881274
normalized_distance = 0.21177457654548024
```

This point is not one of the clean distance bands, but it is useful context for selecting the study window.

Therefore, for this artifact, the primary analysis window was:

```text
execution_window.start_step = 700
execution_window.end_step_exclusive = 1200
```

This is an artifact-appropriate transformed-real-fire window, not arbitrary window stretching.

The reason is that the goal is to study distance/usefulness behavior during a period of meaningful fire engagement around a central operational region.

---

## 10. Distance-band selection protocol

The second artifact used the same conceptual distance-band idea as the first artifact:

```text
near
mid
far
very far
```

However, its geometry is different.

The ignition reference is already far south in the grid:

```text
ignition_reference_rc = (1079, 767)
```

A southeast progression is not feasible beyond the near band.

The cleanest feasible distance axis is the northwest ray from the ignition reference.

This northwest ray supports approximately the same normalized distance bands used in the first artifact:

```text
0.15
0.30
0.50
0.60
```

This keeps the second-artifact check comparable while respecting the actual geometry.

---

## 11. Selected second-artifact distance bands

Selected base-station locations for `phy-79a8cea500`:

```text
distance_band       base_station_rc   raw_distance_cells   normalized_distance   direction
dist_15_near        (894, 582)        261.63               0.150                 NW
dist_30_mid         (709, 397)        523.26               0.300                 NW
dist_50_far         (463, 151)        871.16               0.500                 NW
dist_60_very_far    (340, 28)         1045.10              0.600                 NW
```

Candidate-direction audit showed:

```text
direction NW:
  pct=0.15 rc=(894, 582) inside=True dist=261.63 norm=0.150
  pct=0.30 rc=(709, 397) inside=True dist=523.26 norm=0.300
  pct=0.50 rc=(463, 151) inside=True dist=871.16 norm=0.500
  pct=0.60 rc=(340, 28)  inside=True dist=1045.10 norm=0.600
  pct=0.70 rc=(217, -95) inside=False
```

Corner audit:

```text
corner=(0, 0)       dist=1323.83 norm=0.760
corner=(0, 1143)    dist=1142.64 norm=0.656
corner=(1313, 0)    dist=801.90  norm=0.460
corner=(1313, 1143) dist=442.87  norm=0.254
```

The selected `dist_60_very_far` label is truthful because the achieved normalized distance is approximately `0.600`.

Do not label this case as `dist_70_very_far`.

---

## 12. Window choice

The first-artifact study used:

```text
short window: 0:150
long window:  0:450
```

For this second artifact, the primary window was:

```text
700:1200
```

This differs from the first artifact by design.

The reason is that `2017_856` has a later period of interest in which the fire appears to encircle or strongly engage the usual base-station region near `(750, 600)`.

The Subgoal 08 window should therefore be described as:

```text
artifact-appropriate engagement window
```

rather than:

```text
short-window replication
```

or:

```text
long-window replication
```

This reframing keeps the scientific intent honest.

Subgoal 08 tested whether distance/usefulness separation survives in a second artifact under a meaningful transformed-real-fire window, not merely whether the exact first-artifact window pair repeats.

---

## 13. Matrix shape

The completed matrix was:

```text
4 distance bands × 3 usefulness-family conditions × 5 seeds = 60 runs
```

Window:

```text
execution_window = 700:1200
```

Seeds:

```text
0,1,2,3,4
```

No additional seeds, windows, policies, impairment levels, or artifacts were added.

---

## 14. Usefulness-family conditions

The same three usefulness-family conditions were used.

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

These conditions preserve continuity with v0.5 and first-artifact v0.6.

---

## 15. Tie-breaking

Stochastic tie-breaking was used in every case.

Each case override included:

```json
{
  "network.tie_breaking": "stochastic"
}
```

Tie-breaking was not varied.

Justification:

> deterministic tie-breaking has a known directional artifact; v0.5 showed that stochastic tie-breaking does not materially change the dominant usefulness-triad interpretation while avoiding the deterministic movement bias.

Note that `tie_breaking` was not emitted as a row-level output column, but the sweep metadata preserved `network.tie_breaking` as an override key.

---

## 16. Case labels

The 12 case labels were:

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

Because the selected second-artifact bands closely match the first-artifact normalized labels, the same label family is acceptable.

The base-station coordinates are different from the first artifact and were explicit in every override.

---

## 17. Sweep cases

The run used the planned second-artifact sweep cases with:

```text
study.case_family = usefulness_distance_second_artifact
study.case_kind   = healthy | delay | noise
```

Base-station mapping:

```text
dist_15_near        -> network.base_station_rc = [894, 582]
dist_30_mid         -> network.base_station_rc = [709, 397]
dist_50_far         -> network.base_station_rc = [463, 151]
dist_60_very_far    -> network.base_station_rc = [340, 28]
```

The extracted table did not include `case_family` or `case_kind` as row-level columns, but the analysis integrity metadata recorded `study.case_family` and `study.case_kind` in the sweep override keys.

---

## 18. Analysis Batch settings used

The intended analysis settings were:

```text
Physical run:        phy-79a8cea500
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
Execution window:    700:1200
Regime enabled:      no
O1 enabled:          yes
```

The completed analysis ID was:

```text
ana-70996f0076
```

---

## 19. Extraction and integrity result

The completed analysis was extracted with the general Subgoal 04 utility:

```bash
python src/extract_analysis_study_summary.py \
  data/metrics/ana-70996f0076 \
  --expected-rows-per-case 5
```

Generated extraction outputs include:

```text
data/metrics/ana-70996f0076/analysis_extraction_integrity.json
data/metrics/ana-70996f0076/analysis_extraction_interpretation.md
data/metrics/ana-70996f0076/analysis_extraction_case_summary.csv
data/metrics/ana-70996f0076/analysis_extraction_group_summary.csv
```

Integrity summary:

```text
main_ana_id = ana-70996f0076
main_rows_loaded = 60
rows_after_correction = 60
repair_ana_ids = []
repair_rows_loaded = 0
append_repair = false
cases_present = 12 expected cases
rows_per_case = 5 each
case_validation.ok = true
case_validation.failures = []
```

Extraction caveat:

```text
integrity.ok = false
```

This top-level `ok=false` is due to the extractor warning:

```text
--expected-rows-per-case was supplied without a preset; only observed cases were row-count checked.
```

This is not a study failure.

It means the extraction validated observed case counts, but did not apply a preset-based coordinate/override validation map.

For this subgoal, that is acceptable because the second-artifact distance metadata differs from the first-artifact preset and has been documented directly in this note.

The row/case validation itself passed.

---

## 20. TTFD result

TTFD missingness by case:

```text
case                         finite / rows   missing_frac   mean_TTFD
dist_15_near__delay          5 / 5           0.000          77.2
dist_15_near__healthy        5 / 5           0.000          82.2
dist_15_near__noise          5 / 5           0.000          190.6

dist_30_mid__delay           5 / 5           0.000          46.0
dist_30_mid__healthy         5 / 5           0.000          42.8
dist_30_mid__noise           5 / 5           0.000          226.8

dist_50_far__delay           5 / 5           0.000          121.6
dist_50_far__healthy         5 / 5           0.000          144.0
dist_50_far__noise           0 / 5           1.000          NaN

dist_60_very_far__delay      1 / 5           0.800          469.0
dist_60_very_far__healthy    1 / 5           0.800          290.0
dist_60_very_far__noise      0 / 5           1.000          NaN
```

Interpretation:

```text
near and mid:
  finite TTFD across healthy, delay, and noise

far:
  healthy and delay finite;
  noise missing

very far:
  healthy and delay partially finite;
  noise missing
```

The timing surface therefore shows distance-dependent stress, with noise becoming especially TTFD-resistant at larger distances.

---

## 21. Dominant usefulness-state result

Dominant usefulness state by case:

```text
case                         dominant state   exploit   recover   caution
dist_15_near__delay          recover          0.010     0.761     0.229
dist_15_near__healthy        exploit          0.650     0.335     0.015
dist_15_near__noise          caution          0.003     0.020     0.978

dist_30_mid__delay           recover          0.010     0.824     0.166
dist_30_mid__healthy         exploit          0.696     0.279     0.025
dist_30_mid__noise           caution          0.003     0.029     0.968

dist_50_far__delay           recover          0.010     0.734     0.256
dist_50_far__healthy         exploit          0.935     0.054     0.011
dist_50_far__noise           caution          0.003     0.022     0.975

dist_60_very_far__delay      recover          0.010     0.990     0.000
dist_60_very_far__healthy    exploit          0.996     0.004     0.000
dist_60_very_far__noise      caution          0.002     0.022     0.976
```

The dominant usefulness mapping is stable across all distance bands:

```text
healthy -> exploit
delay   -> recover
noise   -> caution
```

This is the most important Subgoal 08 result.

Even when finite TTFD becomes sparse or absent at larger distances, the compact triad remains condition-readable.

---

## 22. Group-level result

Group-level summary:

```text
distance_band      condition   dominant_state   ttfd_mean   ttfd_missing_frac   mean_entropy_auc   coverage_auc
dist_15_near       delay       recover          77.2        0.0                 70.347049          0.138167
dist_15_near       healthy     exploit          82.2        0.0                 70.388451          0.137946
dist_15_near       noise       caution          190.6       0.0                 70.868716          0.132842

dist_30_mid        delay       recover          46.0        0.0                 70.393567          0.138070
dist_30_mid        healthy     exploit          42.8        0.0                 70.361087          0.137773
dist_30_mid        noise       caution          226.8       0.0                 70.872807          0.133146

dist_50_far        delay       recover          121.6       0.0                 70.228938          0.138281
dist_50_far        healthy     exploit          144.0       0.0                 70.189120          0.138410
dist_50_far        noise       caution          NaN         1.0                 70.862146          0.132553

dist_60_very_far   delay       recover          469.0       0.8                 70.210818          0.137576
dist_60_very_far   healthy     exploit          290.0       0.8                 70.174292          0.138060
dist_60_very_far   noise       caution          NaN         1.0                 70.865852          0.132587
```

Mean entropy AUC and coverage AUC should be interpreted within this artifact/window and not overextended as cross-artifact absolute measures.

The more important observation is the separation between:

```text
TTFD availability
usefulness-state occupancy
condition semantics
```

---

## 23. Interpretation

Subgoal 08 produced a readable second-artifact result.

It is not a perfect replication of the first artifact, but it supports the v0.6 story in a bounded way.

The result can be summarized as:

```text
The second artifact supports the v0.6 distance/usefulness separation.
Distance affects finite TTFD availability, especially at the far and very-far bands.
Noise is the most timing-resistant condition at larger distances.
At the same time, the compact usefulness triad remains condition-readable across the entire matrix.
```

The clearest scientific statement is:

> The second artifact gives a partial replication with artifact-specific timing structure: timing access changes with distance and condition, but the usefulness-state mapping remains stable.

This is important because it shows that the AWSRT usefulness triad is not merely a byproduct of the first artifact’s geometry.

It also shows that TTFD availability is more geometry/window-sensitive than the compact condition-state mapping.

---

## 24. Comparison to the first artifact

The first artifact, `phy-b7edba9ac3`, showed:

```text
short window 0:150:
  near/mid finite TTFD;
  far/very-far missing TTFD;
  triad stable

long window 0:450:
  some far/very-far healthy and delay cases become finite or partially finite;
  far/very-far noise remains resistant;
  triad stable
```

The second artifact, `phy-79a8cea500`, using the artifact-appropriate `700:1200` window, showed:

```text
near/mid:
  finite TTFD across all conditions

far:
  healthy and delay finite;
  noise missing

very far:
  healthy and delay partially finite;
  noise missing

usefulness:
  healthy -> exploit
  delay   -> recover
  noise   -> caution
```

The shared cross-artifact pattern is:

```text
1. distance affects finite timing access;
2. noise becomes timing-resistant at larger distances;
3. the compact triad remains condition-readable;
4. timing and usefulness-state behavior separate rather than collapsing into one metric.
```

The artifact-specific difference is that the second artifact was not framed as a direct short/long window pair.

Instead, it used a meaningful engagement window selected from visual fire behavior.

That distinction should be preserved in thesis prose.

---

## 25. Extraction caveat and audit note

The extraction integrity file reports:

```text
case_validation.ok = true
rows_after_correction = 60
rows_per_case = 5 each
warnings = ["--expected-rows-per-case was supplied without a preset; only observed cases were row-count checked."]
ok = false
```

This should be read carefully.

The run itself does not appear invalid.

The top-level `ok=false` is an extraction-status warning, not a failed matrix or failed case-count validation.

Because no second-artifact preset was supplied, the extractor did not verify coordinate-level expected overrides.

That is acceptable for this subgoal because:

- the second-artifact base-station coordinates are documented in this note;
- all 12 cases are present;
- all cases have five rows;
- no repair rows were needed;
- the sweep metadata records `network.base_station_rc`, `network.tie_breaking`, and `study.case_kind` as override keys.

If desired, a later subgoal can extend the extractor with a second-artifact distance preset.

This is not necessary before closing Subgoal 08.

---

## 26. What this subgoal was not

Subgoal 08 did not:

- become a broad multi-fire benchmark;
- compare multiple policies;
- change the usefulness controller;
- vary tie-breaking;
- add new impairment levels;
- introduce regime management;
- automate a general distance-band selector;
- over-generalize from two artifacts;
- discard the first-artifact result;
- pretend that `700:1200` is directly equivalent to the first artifact’s `0:150` or `0:450` windows.

It remained a bounded second-artifact check with an artifact-appropriate engagement window.

---

## 27. Minimal success criteria review

Subgoal 08 success criteria:

1. **Second artifact documented:** done, `phy-79a8cea500` / `2017_856`.
2. **Native grid, domain diagonal, ignition reference audited:** done.
3. **Artifact-appropriate window justified:** done, `700:1200` from visual engagement around `(750, 600)`.
4. **Distance-band base stations selected and recorded:** done.
5. **60-run matrix executed:** done, `ana-70996f0076`.
6. **Extraction outputs generated:** done.
7. **Case labels and base-station overrides audited:** case labels/counts passed; coordinate audit documented in this note.
8. **TTFD missingness reported:** done.
9. **Dominant usefulness state reported:** done.
10. **Result interpreted relative to first artifact:** done.
11. **No controller redesign introduced:** done.
12. **Claims bounded to tested artifacts:** done.

Subgoal 08 can be closed.

---

## 28. Recommended next step after Subgoal 08

The recommended next step is:

```text
AWSRT v0.6 Subgoal 09: Cross-Artifact Distance-Window Synthesis
```

Suggested file:

```text
docs/design/v0_6_09_cross_artifact_distance_window_synthesis.md
```

Purpose:

> Compare first-artifact and second-artifact distance/window behavior and decide whether v0.6 is ready to freeze or needs another artifact.

Subgoal 09 should synthesize:

```text
ignition-to-base-station distance
observation-window choice
fire engagement around the operational base region
TTFD availability
noise-side resistance
compact usefulness-state stability
```

It should not immediately launch another matrix unless the synthesis identifies a specific gap.

---

## 29. Working conclusion

Subgoal 08 is the first bounded generalization check for the v0.6 distance-window finding.

The first artifact showed that distance and time horizon can strongly affect finite detection timing while leaving the usefulness triad readable.

The second artifact, `phy-79a8cea500`, shows that this separation survives outside the original transformed real-fire context under an artifact-appropriate engagement window.

The result is not universal proof.

It is a useful bounded replication:

> Distance and condition shape finite timing access, especially under noise at larger distances, while the compact usefulness triad remains readable across the tested matrix.

This supports the broader AWSRT thesis:

> timing, information delivery, belief quality, and usefulness-state behavior are related, but they are not the same thing.
