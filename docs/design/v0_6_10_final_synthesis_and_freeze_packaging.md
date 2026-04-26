# AWSRT v0.6 Subgoal 10: Final Synthesis and Freeze Packaging

**Status:** Draft design note  
**Applies to:** `v0.6-subgoal-10`  
**Recommended file:** `docs/design/v0_6_10_final_synthesis_and_freeze_packaging.md`  
**Depends on:** `v0.6-subgoal-03`, `v0.6-subgoal-05`, `v0.6-subgoal-06`, `v0.6-subgoal-07`, `v0.6-subgoal-08`, `v0.6-subgoal-09`  
**Primary first artifact:** `phy-b7edba9ac3`  
**Primary second artifact:** `phy-79a8cea500` / CFSDS fire `2017_856`  
**Purpose:** Finalize AWSRT v0.6 as a bounded distance-window and cross-artifact synthesis release.  

---

## 1. Purpose of this subgoal

Subgoal 10 is the final packaging and freeze step for AWSRT v0.6.

It does **not** introduce another experiment. It does **not** expand the matrix, add another physical artifact, change the compact usefulness controller, or revise the v0.6 scientific question. Instead, it consolidates the evidence already produced across the v0.6 sequence and prepares the branch for a disciplined release freeze.

The purpose of this subgoal is to:

1. record the final v0.6 synthesis claim;
2. identify the evidence base supporting that claim;
3. state what v0.6 does and does not claim;
4. check that the relevant design notes, analyses, and packaged results are present;
5. prepare the repository for a final `v0.6` freeze tag.

The subgoal should be interpreted as release packaging, not scientific expansion.

---

## 2. v0.6 scientific frame being frozen

AWSRT v0.6 reframed deployment geometry as a structural scientific variable.

The key geometry variable is normalized ignition-to-base-station distance. The key temporal variable is the observation window used to evaluate whether fire engagement becomes visible to the sensing system.

The central v0.6 question is:

> Do normalized deployment distance and observation-window structure change detection access without collapsing the compact usefulness interpretation?

This question is directly connected to the broader thesis claim that timing, information delivery, belief quality, and usefulness-state behavior should not be collapsed into a single performance score.

The v0.6 result is not an operational-control optimization result. It is a scientific probe of whether the delivered-information versus usefulness separation survives contact with transformed real-fire conditions when deployment geometry and observation-window effects are made explicit.

---

## 3. Evidence base

### 3.1 First artifact: short-window distance matrix

**Physical artifact:** `phy-b7edba9ac3`  
**Main analysis:** `data/metrics/ana-194fc0a69b`  
**Repair analysis:** `data/metrics/ana-5c07ad299a`  
**Window:** `0:150`  
**Rows:** 60  
**Cases:** 12  
**Seeds per case:** 5  

The first-artifact short-window matrix tested four normalized distance bands across three impairment conditions:

- healthy;
- delay;
- noise.

The distance bands were:

- `dist_15_near`;
- `dist_30_mid`;
- `dist_50_far`;
- `dist_60_very_far`.

The main short-window result was:

- near and mid-distance cases produced finite TTFD across healthy, delay, and noise;
- far and very-far distance cases produced missing TTFD across healthy, delay, and noise;
- the compact usefulness triad remained stable:
  - healthy -> exploit;
  - delay -> recover;
  - noise -> caution.

This established the first v0.6 separation:

> Normalized deployment distance strongly affects finite detection availability in a short observation window, while the compact usefulness-state mapping remains condition-readable.

---

### 3.2 First artifact: long-window distance matrix

**Physical artifact:** `phy-b7edba9ac3`  
**Analysis:** `data/metrics/ana-efab12c047`  
**Window:** `0:450`  
**Rows:** 60  
**Cases:** 12  
**Seeds per case:** 5  

The long-window matrix extended the first-artifact horizon from 150 to 450 steps.

The main long-window result was:

- near and mid-distance cases remained finite;
- `dist_50_far` healthy and delay became finite;
- `dist_50_far` noise remained missing;
- `dist_60_very_far` healthy and delay became partially finite or sparse;
- `dist_60_very_far` noise remained missing;
- the compact usefulness triad remained stable:
  - healthy -> exploit;
  - delay -> recover;
  - noise -> caution.

This clarified the interpretation of missing short-window TTFD values.

Some short-window missingness was horizon-limited: extending the observation window converted some far-distance failures into late detections. However, the distance effect did not disappear, and noise remained especially timing-resistant at larger distances.

The first-artifact short/long comparison supports the claim:

> Observation-window length changes timing access, but it does not collapse the compact usefulness-state interpretation in the tested first-artifact matrix.

---

### 3.3 First artifact: packaged result

**Packaging subgoal:** Subgoal 06  
**Script:** `src/package_v0_6_distance_window_results.py`  
**Output directory:** `results/figures/v0_6_distance_window/`  

Subgoal 06 packaged the first-artifact short/long distance-window result.

The main packaged interpretation was:

> Extending the window from 150 to 450 steps converted some far-distance TTFD failures into late detections, showing that short-window missingness was partly horizon-limited. However, the compact usefulness triad remained stable, and far-distance noise remained TTFD-resistant.

This packaged result provides the first thesis-facing v0.6 evidence block.

---

### 3.4 Second artifact: distance-window protocol check

**Subgoal:** Subgoal 08  
**CFSDS fire:** `2017_856`  
**Physical artifact:** `phy-79a8cea500`  
**Existing manifest:** `data/manifests/phy-79a8cea500.json`  
**Fields:** `data/fields/phy-79a8cea500/fields.zarr`  
**Window:** `700:1200`  
**Analysis:** `data/metrics/ana-70996f0076`  
**Rows:** 60  
**Cases:** 12  
**Seeds per case:** 5  

The second artifact introduced a different transformed real-fire context.

The ignition reference was derived from the centroid of the earliest positive day-of-burn cells:

- grid: `(1314, 1144)`;
- domain diagonal: `1742.2204223346712`;
- minimum positive day of burn: `1`;
- earliest burned cell count: `559`;
- earliest burned-cell bbox rows: `857..1144`;
- earliest burned-cell bbox cols: `236..944`;
- earliest centroid rc: `(1079.21, 767.30)`;
- official ignition reference rc: `(1079, 767)`.

A sanity check against `fire_state[0]` showed:

- first nonempty fire-state time: `0`;
- burning count at `fire_state[0]`: `23`;
- `fire_state[0]` centroid rc: `(1096.87, 839.35)`;
- distance to day-of-burn centroid: `74.18` cells.

Visual inspection indicated that the fire engaged or encircled the usual central base-station region near `(750, 600)` around time slots `800..1100`. Therefore the selected execution window was:

```text
700:1200
```

This was an artifact-appropriate engagement window, not a direct clone of the first artifact's `0:150` or `0:450` windows.

The second-artifact distance bands were selected along a northwest ray from the ignition reference:

- `dist_15_near`: `(894, 582)`, normalized distance `0.150`;
- `dist_30_mid`: `(709, 397)`, normalized distance `0.300`;
- `dist_50_far`: `(463, 151)`, normalized distance `0.500`;
- `dist_60_very_far`: `(340, 28)`, normalized distance `0.600`.

The usual central reference `(750, 600)` was not one of the clean bands, but it contextualized the selected window. Its distance from the ignition reference was approximately `368.96` cells, or normalized distance `0.212`.

The second-artifact matrix used:

- four distance bands;
- three impairment conditions;
- five seeds;
- policy `usefulness_proto`;
- stochastic tie-breaking explicitly set in every override;
- regime disabled;
- O1 enabled.

The main second-artifact result was:

- near and mid-distance cases produced finite TTFD across healthy, delay, and noise;
- far healthy and delay cases produced finite TTFD;
- far noise remained missing;
- very-far healthy and delay were partially finite or sparse;
- very-far noise remained missing;
- the compact usefulness triad remained stable:
  - healthy -> exploit;
  - delay -> recover;
  - noise -> caution.

This partially replicated the first-artifact distance/usefulness separation in a second transformed real-fire context.

---

### 3.5 Cross-artifact synthesis

**Subgoal:** Subgoal 09  
**Design note:** `docs/design/v0_6_09_cross_artifact_distance_window_synthesis.md`  

Subgoal 09 synthesized the first-artifact and second-artifact evidence.

The main synthesis was:

1. Across two transformed real-fire artifacts, base-station geometry affects timing access, especially finite TTFD availability.
2. The exact timing surface is artifact- and window-dependent.
3. Noise is consistently timing-resistant at larger distance bands.
4. The compact usefulness triad remains condition-readable across the tested variation:
   - healthy -> exploit;
   - delay -> recover;
   - noise -> caution.
5. Timing behavior and usefulness-state interpretation separate: TTFD availability changes strongly with distance, window, and artifact, while the usefulness-state mapping remains stable.

This is the core result to preserve in the final v0.6 freeze.

---

## 4. Final v0.6 claim

The final v0.6 claim should be stated cautiously:

> AWSRT v0.6 shows that normalized deployment geometry and observation-window structure strongly affect detection timing, especially finite TTFD availability, while the compact usefulness triad remains condition-readable across the tested transformed real-fire artifacts.

A thesis-facing version is:

> Across two transformed real-fire artifacts, normalized ignition-to-base-station distance and observation-window choice change whether fire engagement becomes detectable within the evaluated horizon. However, this geometry-sensitive timing surface does not collapse the compact usefulness interpretation: healthy cases remain exploit-dominant, delay cases remain recover-dominant, and noise cases remain caution-dominant across the tested distance bands and windows.

A shorter release-facing version is:

> Distance and windowing shape timing access; the compact usefulness triad remains readable.

---

## 5. What v0.6 does not claim

The v0.6 freeze should avoid overclaiming.

It does **not** claim that deployment geometry is irrelevant. Geometry is a major structural condition, especially for timing access.

It does **not** claim that TTFD behavior is invariant across artifacts. The exact timing surface is artifact- and window-dependent.

It does **not** claim that missing TTFD means detection is impossible. Missing TTFD means no finite first detection occurred within the specified execution window.

It does **not** claim that two transformed real-fire artifacts establish broad wildfire generalization. The result is stronger than a single-artifact check, but it remains a bounded cross-artifact synthesis.

It does **not** claim that `usefulness_proto` is an optimized controller. The compact usefulness triad is an interpretive operational layer used to probe information-health structure.

It does **not** claim strict metric invariance. The claim is qualitative condition-readability under visible structural sensitivity.

---

## 6. Structural interpretation

The scientific value of v0.6 is that it makes deployment geometry and observation-window choice explicit enough to interpret.

A missing TTFD value cannot be interpreted without knowing:

- the physical artifact;
- the ignition reference;
- the base-station location;
- the normalized distance band;
- the execution window;
- the impairment condition;
- the seed structure;
- the active usefulness policy.

The v0.6 sequence shows that these details are not bookkeeping. They condition the scientific meaning of the result.

The most important interpretive separation is:

> TTFD is an access-and-timing metric. The usefulness state is an information-health interpretation. The two interact, but they are not the same measurement.

This reinforces the thesis-wide AWSRT argument that information delivery, belief quality, timeliness, and usefulness should remain analytically distinct.

---

## 7. Required packaging checks

Before freezing v0.6, confirm the following.

### 7.1 Design notes

The following design notes should exist and be committed:

- `docs/design/v0_6_02_manual_distance_band_case_selection.md`
- `docs/design/v0_6_03_distance_band_usefulness_matrix_execution.md`
- `docs/design/v0_6_08_second_artifact_distance_protocol_check.md`
- `docs/design/v0_6_09_cross_artifact_distance_window_synthesis.md`
- `docs/design/v0_6_10_final_synthesis_and_freeze_packaging.md`

Additional v0.6 design notes may also exist depending on the exact subgoal sequence. The important requirement is that the distance-window sequence, the second-artifact protocol check, and the final synthesis are all preserved.

### 7.2 Analysis artifacts

The following analysis directories should exist locally or be clearly referenced:

- `data/metrics/ana-194fc0a69b`
- `data/metrics/ana-5c07ad299a`
- `data/metrics/ana-efab12c047`
- `data/metrics/ana-70996f0076`

Because some data and results directories may be git-ignored, the release note should distinguish between repository-tracked design material and local analysis artifacts.

### 7.3 Physical artifacts and manifests

The following physical-artifact references should be preserved:

- `phy-b7edba9ac3`
- `phy-79a8cea500`

The second-artifact manifest path should remain visible:

- `data/manifests/phy-79a8cea500.json`

The second-artifact fields path should remain visible:

- `data/fields/phy-79a8cea500/fields.zarr`

### 7.4 Packaged first-artifact result

Confirm that the first-artifact packaged output path is documented:

- `results/figures/v0_6_distance_window/`

Confirm that the packaging script path is documented:

- `src/package_v0_6_distance_window_results.py`

If the generated figures are intentionally git-ignored, this should be acceptable. The script and interpretation are the important tracked pieces unless the release policy changes.

### 7.5 Thesis-facing wording

Confirm that the thesis draft includes the v0.6 interpretation in cautious form:

- distance and windowing affect timing access;
- missing TTFD is bounded-window missingness;
- far-distance noise remains timing-resistant in the tested cases;
- the compact usefulness triad remains condition-readable;
- no claim is made about universal wildfire generalization.

---

## 8. Expected outputs of Subgoal 10

The expected output of this subgoal is small:

1. this design note;
2. any minor README or release-note wording needed to identify v0.6 as the current frozen release;
3. optional thesis-facing wording if not already added elsewhere;
4. final commit and tag sequence for `v0.6-subgoal-10` and `v0.6`.

No new matrix is expected.

No new repair analysis is expected.

No new physical artifact is expected.

No controller change is expected.

---

## 9. Freeze criteria

AWSRT v0.6 is ready to freeze when the following are true:

1. Subgoal 09 synthesis is committed.
2. This Subgoal 10 packaging note is committed.
3. The final v0.6 claim is stated in bounded language.
4. The evidence base is traceable to the relevant analysis IDs.
5. The distinction between tracked design material and local/generated analysis artifacts is clear.
6. No additional experiment is required to support the stated claim.
7. The branch is clean except for intentionally untracked or git-ignored local outputs.
8. A final `v0.6` tag can be placed on the release commit.

The most important scientific freeze criterion is:

> The claim being frozen must be supported by the existing evidence without requiring another matrix expansion.

At this point, the existing evidence is sufficient for a bounded v0.6 synthesis.

---

## 10. Recommended git closeout

A typical closeout sequence is:

```bash
git status

git add docs/design/v0_6_10_final_synthesis_and_freeze_packaging.md

git commit -m "Finalize Subgoal 10 v0.6 synthesis and freeze packaging"

git tag v0.6-subgoal-10

git push origin v0.6-subgoal-10

git push origin refs/tags/v0.6-subgoal-10
```

After final inspection, tag the release:

```bash
git tag v0.6

git push origin refs/tags/v0.6
```

If `main` is intended to point to the v0.6 release state, update it only after confirming that the subgoal branch is the desired release commit.

One possible sequence is:

```bash
git checkout main

git merge --ff-only v0.6-subgoal-10

git push origin main
```

If branch/tag ambiguity appears, use explicit refspecs, as in prior AWSRT release work:

```bash
git push origin refs/heads/v0.6-subgoal-10

git push origin refs/tags/v0.6-subgoal-10

git push origin refs/tags/v0.6
```

---

## 11. Final release interpretation

AWSRT v0.6 should close with the following interpretation:

> v0.6 establishes normalized deployment geometry and observation-window choice as explicit structural conditions for transformed real-fire usefulness studies. Across two tested artifacts, these conditions strongly affect detection timing and finite TTFD availability, especially at larger distances and under noise. However, the compact usefulness triad remains condition-readable: healthy cases remain exploit-dominant, delay cases remain recover-dominant, and noise cases remain caution-dominant. The result strengthens the thesis-level separation between timing access, information delivery, belief quality, and usefulness-state interpretation.

This is the intended frozen scientific contribution of AWSRT v0.6.

