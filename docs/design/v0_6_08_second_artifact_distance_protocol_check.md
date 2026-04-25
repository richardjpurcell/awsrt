# AWSRT v0.6 Subgoal 08: Second-Artifact Distance Protocol Check

**Status:** Draft design note  
**Applies to:** `v0.6-subgoal-08`  
**Recommended file:** `docs/design/v0_6_08_second_artifact_distance_protocol_check.md`  
**Depends on:** `v0.6-subgoal-03`, `v0.6-subgoal-04`, `v0.6-subgoal-05`, `v0.6-subgoal-06`, `v0.6-subgoal-07`  
**Primary reference artifact:** `phy-b7edba9ac3`  
**Purpose:** Test whether the v0.6 distance/window/usefulness separation observed on `phy-b7edba9ac3` survives contact with a second transformed real-fire artifact.

---

## 1. Purpose of this note

This note defines AWSRT v0.6 Subgoal 08.

Subgoals 03 through 07 established and packaged a coherent distance-window result on one transformed real-fire artifact:

```text
phy-b7edba9ac3
```

The current v0.6 result is:

> base-station distance strongly affects finite TTFD availability; extending the observation window resolves some far-distance missingness; far-distance noise remains resistant; and the compact usefulness triad remains condition-readable.

That result is meaningful, but still bounded to one physical artifact.

Subgoal 08 asks the next scientific question:

> Does the same distance/window/usefulness separation appear in a second transformed real-fire artifact?

This is not a broad benchmark expansion.

It is a controlled second-artifact protocol check.

---

## 2. Scientific motivation

The v0.6 first-artifact result is strong enough to preserve, but not yet strong enough to generalize.

The current result shows that, for `phy-b7edba9ac3`:

```text
distance affects timing access;
window length changes finite TTFD availability;
noise remains far-distance TTFD-resistant;
the usefulness triad remains stable.
```

However, wildfire geometry, ignition location, domain shape, fire-growth morphology, and sensor/base-station geometry may differ substantially across physical artifacts.

A second artifact check is therefore scientifically valuable because it tests whether the first-artifact result is:

- a local property of one replay;
- a consequence of the specific ignition/base-station geometry;
- or a more general pattern that may survive across transformed real-fire contexts.

Subgoal 08 should be interpreted as a **bounded generalization check**, not as a final cross-fire validation campaign.

---

## 3. Relationship to Subgoal 07

Subgoal 07 synthesized the first-artifact distance-window result into thesis-facing language.

Its central interpretation was:

> distance and time horizon strongly affect finite detection timing, but the usefulness-state mapping remains stable across the tested conditions.

Subgoal 08 should use that synthesis as the reference interpretation.

The goal is not to replace the first-artifact result.

The goal is to test whether a second artifact supports, weakens, or complicates it.

---

## 4. Main scientific question

Subgoal 08 centers on this question:

> When the distance-band protocol is applied to a second transformed real-fire artifact, do detection timing, information delivery, belief quality, and usefulness-state behavior separate in a similar way?

More specifically:

1. Does increasing ignition-to-base-station distance affect finite TTFD availability?
2. Does a longer window resolve some far-distance missingness?
3. Does noise remain more TTFD-resistant than healthy or delay at far distance?
4. Does the compact triad remain condition-readable?
5. Do belief-quality and information-delivery summaries move together with TTFD, or separate?

The most useful result would not necessarily be a perfect replication.

A complication or partial failure may be scientifically valuable if it clarifies when the distance/usefulness story depends on artifact geometry.

---

## 5. What should stay fixed

To make the second-artifact check interpretable, the following should remain fixed relative to the first-artifact v0.6 protocol wherever possible:

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

The experiment should not add:

- new policies;
- deterministic tie-breaking;
- regime management;
- new impairment families;
- new controller behavior;
- stochastic base-station sampling;
- additional windows beyond the chosen protocol.

---

## 6. What must be re-derived

The second artifact must not reuse the first artifact’s ignition reference or base-station locations.

For the second artifact, re-derive:

```text
native grid shape
domain diagonal
ignition_reference_rc
distance-band candidate locations
actual raw distances
actual normalized distances
distance-band labels
```

The first artifact’s reference values were:

```text
artifact: phy-b7edba9ac3
grid: (1085, 1448)
ignition_reference_rc: (393, 448)
domain_diagonal_cells: 1809.400176854197
```

These are not transferable.

The second artifact needs its own audit.

---

## 7. Second artifact selection

Subgoal 08 begins by selecting a second transformed real-fire physical artifact from available AWSRT physical artifacts.

Candidate selection criteria:

1. It should have native Zarr fields available under:

```text
data/fields/<phy_id>/fields.zarr
```

2. It should have enough spatial extent for multiple distance bands.
3. It should have a meaningful early burned region from which an ignition reference can be derived.
4. It should not be so boundary-constrained that only one or two viable base-station distances are possible.
5. It should ideally represent a different fire geometry from `phy-b7edba9ac3`.

Suggested starting action:

```bash
find data/fields -maxdepth 2 -name "fields.zarr" -print
```

or inspect available manifests:

```bash
ls data/manifests | head
```

Because `data/fields/` and `data/manifests/` are not tracked in git, artifact selection is an environment-local step and should be documented in the design note after selection.

---

## 8. Ignition reference protocol

For the selected second artifact, use the same native-field ignition reference protocol as Subgoal 02:

```text
ignition_reference_method = centroid(day_of_burn == min_positive_day_of_burn)
```

Required audit values:

```text
phy_id
grid shape
domain diagonal
min positive day_of_burn
earliest burned cell count
earliest burned bbox rows
earliest burned bbox cols
earliest centroid rc
rounded ignition_reference_rc
```

Optional sanity check:

```text
fire_state[0] burning count
fire_state[0] burning bbox rows/cols
fire_state[0] burning centroid rc
distance from day_of_burn centroid to fire_state[0] centroid
```

If `fire_state[0]` has no burning cells, use the earliest available non-empty fire-state frame and record that choice.

---

## 9. Distance-band selection protocol

The second artifact should use the same conceptual distance-band idea as the first artifact:

```text
near
mid
far
very far
```

However, the achieved normalized distances may differ because the artifact geometry and boundaries differ.

Preferred target distances:

```text
near:      ~0.15 normalized distance
mid:       ~0.30 normalized distance
far:       ~0.50 normalized distance
very far:  maximum feasible bounded candidate, ideally >0.60
```

If the fourth band cannot reach ~0.60, label it honestly.

Do not use labels that imply an achieved distance that was not achieved.

Example first-artifact precedent:

```text
dist_60_very_far
```

was used instead of:

```text
dist_70_very_far
```

because the achieved normalized distance was approximately `0.614`.

For the second artifact, labels should be based on achieved distances, not desired targets.

---

## 10. Distance-band audit table

After selecting base stations, record a table:

```text
distance_band       base_station_rc   raw_distance_cells   normalized_distance
<near_label>        (...)             ...                  ...
<mid_label>         (...)             ...                  ...
<far_label>         (...)             ...                  ...
<very_far_label>    (...)             ...                  ...
```

Also record:

```text
ignition_reference_rc
domain_diagonal_cells
grid shape
selection direction or rationale
boundary limitations
```

If only three distance bands are feasible, record that explicitly and explain why.

Do not force a four-band matrix if the fourth band is geometrically misleading.

---

## 11. Window choice

Subgoal 08 should use the two-window structure established in the first-artifact study:

```text
short window: 0:150
long window:  0:450
```

This supports direct interpretive comparison with Subgoals 03 and 05.

However, do not launch both windows until the second artifact’s distance bands are selected and audited.

Recommended sequence:

1. Select artifact.
2. Derive ignition reference.
3. Select distance bands.
4. Run a short-window matrix.
5. Interpret integrity and TTFD missingness.
6. Run the long-window matrix only if the short-window result is valid and interpretable.

This avoids running a large second-artifact protocol before confirming geometry.

---

## 12. Matrix shape

If four distance bands are selected, each window uses:

```text
4 distance bands × 3 usefulness-family conditions × 5 seeds = 60 runs
```

Two windows would therefore be:

```text
120 runs total
```

If only three distance bands are selected:

```text
3 distance bands × 3 conditions × 5 seeds = 45 runs per window
```

Do not increase seeds in Subgoal 08.

Do not add additional impairment levels.

---

## 13. Usefulness-family conditions

Use the same three usefulness-family conditions.

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

## 14. Tie-breaking

Use stochastic tie-breaking in every case.

Each case override must explicitly include:

```json
{
  "network.tie_breaking": "stochastic"
}
```

Do not vary tie-breaking in this subgoal.

Justification:

> deterministic tie-breaking has a known directional artifact; v0.5 showed that stochastic tie-breaking does not materially change the dominant usefulness-triad interpretation while avoiding the deterministic movement bias.

---

## 15. Case labels

Case labels should be constructed as:

```text
<distance_band>__healthy
<distance_band>__delay
<distance_band>__noise
```

Example if the second artifact uses the same approximate labels:

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

If achieved distances differ, use honest labels:

```text
dist_12_near
dist_28_mid
dist_47_far
dist_58_very_far
```

or similar.

The label should reflect the achieved normalized distance well enough for audit readability.

---

## 16. Extraction requirements

Use the general extraction script from Subgoal 04:

```text
src/extract_analysis_study_summary.py
```

For each completed analysis:

```bash
python src/extract_analysis_study_summary.py \
  data/metrics/<ana-id> \
  --expected-rows-per-case 5
```

If the built-in `distance_band_v0_6_03` preset does not match the second artifact’s distance bands, do not misuse it.

Instead, either:

1. run without a preset and rely on generic grouping; or
2. extend the extractor with a new preset for the second artifact; or
3. add a small metadata-file option in a later subgoal.

For Subgoal 08, do not over-engineer the extractor unless needed.

The minimum requirement is that the second-artifact analysis is grouped by case and condition and that distance metadata is documented in the design note.

---

## 17. Packaging requirements

If both windows are completed, adapt or extend the packaging script:

```text
src/package_v0_6_distance_window_results.py
```

Possible options:

1. Add CLI arguments so it can package arbitrary short/long analysis folders.
2. Add a new output directory for the second artifact.
3. Add a separate packaging script only if the existing one becomes confusing.

Preferred output directory:

```text
results/figures/v0_6_second_artifact_distance_window/
```

Do not overwrite the first-artifact packaging outputs.

---

## 18. Metrics of interest

Primary metrics:

```text
ttfd
ttfd_true
ttfd_arrived
mean_entropy_auc
coverage_auc
usefulness_regime_state_exploit_frac
usefulness_regime_state_recover_frac
usefulness_regime_state_caution_frac
```

Secondary metrics:

```text
usefulness_trigger_recover_hits
usefulness_trigger_caution_hits
usefulness_trigger_recover_from_caution_hits
usefulness_trigger_exploit_hits
delivered_info_proxy_mean
mdc_residual_mean
mdc_residual_pos_frac
mdc_violation_rate
movement_total_mean_l1
moves_per_step_mean
moved_frac_mean
arrivals_frac_mean
detections_arrived_frac_mean
obs_age_mean_valid
obs_age_max_valid
```

Audit fields:

```text
case
seed
policy
opr_id
phy_id
base_station_rc
deployment_mode
n_sensors
delay_steps
noise_level
loss_prob
tie_breaking, if available
```

Distance metadata:

```text
distance_band
base_station_rc
ignition_reference_rc
raw_distance_cells
normalized_distance
```

---

## 19. Interpretation criteria

### 19.1 Similar pattern to first artifact

If the second artifact shows:

```text
short window:
  far-distance TTFD missingness increases

long window:
  some far-distance cases resolve

noise:
  remains more TTFD-resistant

usefulness:
  healthy -> exploit
  delay -> recover
  noise -> caution
```

then the first-artifact result gains bounded support.

Interpretation:

> the distance/window/usefulness separation survives a second transformed real-fire context.

### 19.2 TTFD behaves differently but triad remains stable

If TTFD availability does not follow the same distance pattern but the usefulness triad remains stable, then the result is still useful.

Interpretation:

> the compact usefulness triad is more stable than the timing-access surface, while distance effects are artifact-dependent.

### 19.3 Triad weakens or changes

If the dominant mapping no longer holds, record this clearly.

Possible interpretations:

- the second artifact has geometry that changes information contact;
- distance-band selection is not equivalent across artifacts;
- the compact usefulness controller may be more artifact-sensitive than the first study suggested;
- additional diagnostics are needed before claiming cross-artifact robustness.

Do not treat this as a failure.

It may be a scientifically important boundary condition.

### 19.4 Noise no longer remains TTFD-resistant

If far-distance noise becomes finite in the long window, then the first-artifact noise result should be treated as artifact-specific.

Interpretation:

> noise-side persistence depends on fire geometry, deployment geometry, or observation horizon.

This would refine the thesis.

### 19.5 All cases become finite even in the short window

If all second-artifact cases are finite in `0:150`, the artifact may be geometrically easier.

Interpretation:

> distance may not be sufficiently stressful in this artifact, or the selected bands may not create comparable timing pressure.

This may require selecting a different second artifact or a more extreme distance candidate.

---

## 20. Expected possible outcomes

The most likely useful outcomes are:

### Outcome A: Partial replication

Distance affects TTFD, long window resolves some cases, noise remains harder, triad remains stable.

This is the strongest result.

### Outcome B: Timing differs, triad holds

TTFD behavior changes across artifact, but usefulness-state interpretation remains healthy/exploit, delay/recover, noise/caution.

This still supports the usefulness-triad story.

### Outcome C: Strong artifact dependence

The second artifact changes both TTFD and usefulness occupancy.

This becomes a boundary-condition result and may motivate more careful physical-context stratification.

### Outcome D: Geometry selection problem

Distance bands fail to induce meaningful variation.

This would not invalidate the method, but would require selecting a better artifact or revising the base-station selection protocol.

---

## 21. Minimal success criteria

Subgoal 08 is complete if:

1. A second physical artifact is selected and documented.
2. Its native grid, domain diagonal, and ignition reference are audited.
3. Distance-band base stations are selected and their achieved normalized distances are recorded.
4. At least the short-window matrix is run and extracted.
5. The long-window matrix is run if the short-window result is valid and interpretable.
6. Extraction outputs are generated using `src/extract_analysis_study_summary.py`.
7. Case labels and base-station overrides are validated or manually audited.
8. TTFD missingness is reported by distance band and condition.
9. Dominant usefulness state is reported by distance band and condition.
10. The result is interpreted relative to the first artifact.
11. No controller redesign is introduced.
12. Claims remain bounded to the tested artifacts.

---

## 22. What this subgoal is not

Subgoal 08 should not:

- become a broad multi-fire benchmark;
- compare multiple policies;
- change the usefulness controller;
- vary tie-breaking;
- add new impairment levels;
- introduce regime management;
- automate a general distance-band selector unless absolutely necessary;
- over-generalize from two artifacts;
- discard the first-artifact result if the second differs.

It is a bounded second-artifact check.

---

## 23. Suggested workflow

Recommended workflow:

```text
Step 1:
  list available physical artifacts

Step 2:
  choose one candidate artifact

Step 3:
  inspect native fields and derive ignition reference

Step 4:
  select feasible distance-band base stations

Step 5:
  write/update the Subgoal 08 note with artifact-specific audit values

Step 6:
  run the short-window matrix (0:150)

Step 7:
  extract and inspect

Step 8:
  decide whether to run the long-window matrix (0:450)

Step 9:
  package and compare against the first artifact

Step 10:
  close out with a bounded cross-artifact interpretation
```

This subgoal should remain incremental.

Do not launch the full two-window matrix before Steps 1–5 are documented.

---

## 24. Likely helper scripts

Subgoal 08 may need one small helper script to inspect a candidate artifact.

Possible temporary script:

```text
src/do_not_track/inspect_second_artifact_ignition.py
```

or, if reusable:

```text
src/inspect_physical_artifact_geometry.py
```

If the script is general and useful for future artifacts, place it under `src/` and track it.

If it is exploratory, place it under:

```text
src/do_not_track/
```

The helper should ideally output:

```text
phy_id
grid shape
domain diagonal
min positive day_of_burn
earliest burned bbox
earliest burned centroid
fire_state early-frame sanity check
suggested candidate distances
```

---

## 25. Recommended next step after Subgoal 08

If Subgoal 08 produces a readable second-artifact result, the next step can be:

```text
AWSRT v0.6 Subgoal 09: Cross-Artifact Distance-Window Synthesis
```

Suggested file:

```text
docs/design/v0_6_09_cross_artifact_distance_window_synthesis.md
```

Purpose:

Compare first-artifact and second-artifact distance-window behavior and decide whether v0.6 is ready for freeze or needs a third artifact.

If Subgoal 08 shows a geometry-selection problem, then Subgoal 09 should instead refine the artifact/distance selection protocol.

---

## 26. Working conclusion

Subgoal 08 is the first bounded generalization check for the v0.6 distance-window finding.

The first artifact showed that distance and time horizon can strongly affect finite detection timing while leaving the usefulness triad readable.

The second artifact will test whether that separation survives outside the original transformed real-fire context.

The goal is not to prove universality.

The goal is to determine whether the AWSRT distance/usefulness story is robust enough to carry beyond a single physical artifact, or whether it must be framed more narrowly as a first-artifact finding with artifact-dependent boundary conditions.
