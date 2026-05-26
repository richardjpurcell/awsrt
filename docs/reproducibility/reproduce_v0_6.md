# Reproducing the AWSRT v0.6 Result State

## Status

Draft reproduction pointer for AWSRT v0.7 documentation work.

This document provides a high-level guide to the frozen AWSRT v0.6 result state. It is intended as an orientation and audit pointer, not as a complete one-command reproduction bundle.

## Release tag

The frozen v0.6 result state is identified by the Git tag:

```text
v0.6
```

The final v0.6 packaging state was also closed through:

```text
v0.6-subgoal-10
```

## Purpose of v0.6

AWSRT v0.6 tested deployment geometry and observation-window effects under transformed real-fire conditions.

The central v0.6 claim is:

> Normalized deployment geometry and observation-window structure strongly affect detection timing, especially finite time-to-first-detection availability, while the compact usefulness triad remains condition-readable across the tested transformed real-fire artifacts.

The compact usefulness-state mapping remained readable under the tested conditions:

```text
healthy -> exploit-dominant
delay   -> recover-dominant
noise   -> caution-dominant
```

This result supports the thesis-level separation between timing access, information delivery, belief quality, and usefulness-state interpretation.

## What v0.6 is not

v0.6 is not an operational wildfire prediction release.

v0.6 is not a claim of universal wildfire generalization.

v0.6 is not a new optimized controller.

v0.6 is not a physical or digital twin demonstration.

v0.6 is a bounded transformed-real-fire research result showing how deployment geometry, observation windows, timing access, and usefulness-state interpretation separate under controlled AWSRT experiments.

## Design-note map

The v0.6 result was developed through the following design notes:

```text
docs/design/v0_6_01_ignition_to_base_station_distance_probe.md
docs/design/v0_6_02_manual_distance_band_case_selection.md
docs/design/v0_6_03_distance_band_usefulness_matrix_execution.md
docs/design/v0_6_04_general_analysis_extraction_and_distance_band_interpretation_hardening.md
docs/design/v0_6_05_longer_window_distance_probe.md
docs/design/v0_6_06_distance_window_result_packaging.md
docs/design/v0_6_07_thesis_distance_window_synthesis.md
docs/design/v0_6_08_second_artifact_distance_protocol_check.md
docs/design/v0_6_09_cross_artifact_distance_window_synthesis.md
docs/design/v0_6_10_final_synthesis_and_freeze_packaging.md
```

These notes are the primary audit trail for the v0.6 scientific result.

## Main scripts

The main v0.6 support scripts include:

```text
src/extract_analysis_study_summary.py
src/package_v0_6_distance_window_results.py
```

The extraction script was used to summarize analysis artifacts into case-level study summaries.

The packaging script was used to package the v0.6 distance-window result outputs.

## Main result-output directory

The main packaged v0.6 result outputs are expected under:

```text
results/figures/v0_6_distance_window/
```

This directory should contain the packaged interpretation artifacts created during Subgoal 06 and used in the subsequent thesis-facing synthesis.

## First transformed real-fire artifact

The first v0.6 transformed real-fire physical artifact was:

```text
phy-b7edba9ac3
```

Key properties:

```text
grid: (1085, 1448)
domain diagonal: 1809.400176854197
ignition reference: (393, 448)
```

Distance bands:

```text
dist_15_near      -> (585, 640), normalized distance ≈ 0.150
dist_30_mid       -> (777, 832), normalized distance ≈ 0.300
dist_50_far       -> (1033, 1088), normalized distance ≈ 0.500
dist_60_very_far  -> (1080, 1320), normalized distance ≈ 0.614
```

### First artifact, short window

Subgoal:

```text
v0.6 Subgoal 03
```

Analysis artifacts:

```text
data/metrics/ana-194fc0a69b
data/metrics/ana-5c07ad299a
```

Window:

```text
0:150
```

Extraction result:

```text
60 rows
12 cases
5 seeds per case
```

Summary:

- near and mid-distance cases had finite TTFD across healthy, delay, and noise;
- far and very-far cases had missing TTFD across healthy, delay, and noise;
- usefulness-state mapping remained stable:
  - healthy -> exploit;
  - delay -> recover;
  - noise -> caution.

### First artifact, long window

Subgoal:

```text
v0.6 Subgoal 05
```

Analysis artifact:

```text
data/metrics/ana-efab12c047
```

Window:

```text
0:450
```

Extraction result:

```text
60 rows
12 cases
5 seeds per case
```

Summary:

- near and mid-distance cases remained finite;
- far healthy and delay became finite;
- far noise remained missing;
- very-far healthy and delay became partially finite or sparse;
- very-far noise remained missing;
- usefulness-state mapping remained stable:
  - healthy -> exploit;
  - delay -> recover;
  - noise -> caution.

Interpretation:

Extending the window converted some far-distance TTFD failures into late detections, showing that some short-window missingness was horizon-limited. However, far-distance noise remained timing-resistant.

## Second transformed real-fire artifact

The second v0.6 transformed real-fire artifact was based on CFSDS fire:

```text
2017_856
```

Physical artifact:

```text
phy-79a8cea500
```

Manifest:

```text
data/manifests/phy-79a8cea500.json
```

Fields:

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

Grid:

```text
(1314, 1144)
```

Domain diagonal:

```text
1742.2204223346712
```

Ignition reference:

```text
(1079, 767)
```

Ignition reference method:

```text
centroid(day_of_burn == min_positive_day_of_burn)
```

Additional ignition-reference details:

```text
min_positive_day_of_burn: 1
earliest burned cell count: 559
earliest burned bbox rows: 857..1144
earliest burned bbox cols: 236..944
earliest centroid rc: (1079.21, 767.30)
```

Fire-state sanity check:

```text
first_nonempty_fire_state_t: 0
fire_state[0] burning_count: 23
fire_state[0] centroid_rc: (1096.87, 839.35)
distance_to_day_of_burn_centroid: 74.18 cells
```

### Second artifact window

The second artifact used an artifact-appropriate engagement window:

```text
700:1200
```

This was chosen because visual inspection showed the fire engaging or encircling the usual central base-station region near:

```text
(750, 600)
```

especially around time slots:

```text
800..1100
```

The second-artifact window should not be read as a direct absolute-time clone of the first artifact's `0:150` or `0:450` windows. It is an artifact-appropriate engagement window.

### Second artifact distance bands

The second-artifact base-station distance bands were constructed along a northwest ray from the ignition reference.

```text
dist_15_near      -> (894, 582), raw distance 261.63, normalized 0.150
dist_30_mid       -> (709, 397), raw distance 523.26, normalized 0.300
dist_50_far       -> (463, 151), raw distance 871.16, normalized 0.500
dist_60_very_far  -> (340, 28),  raw distance 1045.10, normalized 0.600
```

The usual central reference:

```text
(750, 600)
```

has distance from ignition reference:

```text
raw distance 368.96
normalized distance 0.212
```

This contextualizes the engagement window but is not one of the clean distance-band cases.

### Second artifact matrix

Subgoal:

```text
v0.6 Subgoal 08
```

Analysis artifact:

```text
data/metrics/ana-70996f0076
```

Matrix:

```text
4 distance bands × 3 conditions × 5 seeds = 60 runs
```

Conditions:

```text
healthy: delay_steps=0, loss_prob=0, noise_level=0
delay:   delay_steps=4, loss_prob=0, noise_level=0
noise:   delay_steps=0, loss_prob=0, noise_level=0.2
```

Policy:

```text
usefulness_proto
```

Tie-breaking:

```text
stochastic
```

Other settings:

```text
regime enabled: no
O1 enabled: yes
```

Extraction command used:

```bash
python src/extract_analysis_study_summary.py data/metrics/ana-70996f0076 --expected-rows-per-case 5
```

Extraction result:

```text
60 rows
12 cases
5 rows per case
no repairs
case validation passed after rerun
```

Summary:

- near and mid-distance cases had finite TTFD across healthy, delay, and noise;
- far healthy and delay were finite;
- far noise was missing;
- very-far healthy and delay were partially finite or sparse;
- very-far noise was missing;
- usefulness-state mapping remained stable:
  - healthy -> exploit;
  - delay -> recover;
  - noise -> caution.

## Cross-artifact synthesis

Across the two transformed real-fire artifacts:

1. Base-station geometry affected timing access, especially finite TTFD availability.
2. The exact timing surface was artifact- and window-dependent.
3. Noise was consistently timing-resistant at larger distances.
4. The compact usefulness triad remained condition-readable:
   - healthy -> exploit;
   - delay -> recover;
   - noise -> caution.
5. Timing behavior and usefulness-state interpretation separated:
   - TTFD availability changed strongly with distance, window, and artifact;
   - usefulness-state mapping remained stable under the tested conditions.

## Reproduction limits

This document is not a full reproduction bundle.

To reproduce the v0.6 result in detail, a user needs:

- the correct Git checkout or release tag;
- the relevant `data/` artifacts;
- preserved manifests and metrics;
- transformed fire field artifacts;
- the extraction and packaging scripts;
- any environment assumptions used for the original analyses.

Some results may depend on local preserved artifacts that are not regenerated by simply running the app from a fresh clone.

The v0.6 design notes and scripts should therefore be treated as the primary audit trail, while a future formal reproduction bundle may provide a stricter artifact-complete reproduction path.

## Suggested verification commands

From a checkout containing the relevant artifacts:

```bash
git checkout v0.6
```

Inspect the v0.6 design-note sequence:

```bash
ls docs/design/v0_6_*.md
```

Check for main scripts:

```bash
ls src/extract_analysis_study_summary.py
ls src/package_v0_6_distance_window_results.py
```

Check for packaged v0.6 output:

```bash
ls results/figures/v0_6_distance_window/
```

Check for first-artifact analyses:

```bash
ls data/metrics/ana-194fc0a69b
ls data/metrics/ana-5c07ad299a
ls data/metrics/ana-efab12c047
```

Check for second-artifact analysis:

```bash
ls data/metrics/ana-70996f0076
```

Check for second physical artifact:

```bash
ls data/manifests/phy-79a8cea500.json
ls data/fields/phy-79a8cea500/fields.zarr
```

Run second-artifact extraction summary if artifacts are present:

```bash
python src/extract_analysis_study_summary.py data/metrics/ana-70996f0076 --expected-rows-per-case 5
```

## Recommended citation behavior

When citing the v0.6 result, cite the software release tag and the relevant thesis or paper text that interprets the result.

Use `CITATION.cff` for repository/software citation metadata. Cite derived papers, thesis chapters, Zenodo bundles, or archived reproduction bundles separately when applicable.
