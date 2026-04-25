# AWSRT v0.6 Subgoal 07: Thesis Distance-Window Synthesis

**Status:** Draft design note  
**Applies to:** `v0.6-subgoal-07`  
**Recommended file:** `docs/design/v0_6_07_thesis_distance_window_synthesis.md`  
**Depends on:** `v0.6-subgoal-03`, `v0.6-subgoal-04`, `v0.6-subgoal-05`, `v0.6-subgoal-06`  
**Primary short-window analysis:** corrected `data/metrics/ana-194fc0a69b` with repair input `data/metrics/ana-5c07ad299a`  
**Primary long-window analysis:** `data/metrics/ana-efab12c047`  
**Primary packaging script:** `src/package_v0_6_distance_window_results.py`  
**Primary packaging output:** `results/figures/v0_6_distance_window/`  
**Purpose:** Convert the v0.6 distance-window result into disciplined thesis-facing prose, figure captions, and a concise interpretation before expanding to another physical artifact.

---

## 1. Purpose of this note

This note defines AWSRT v0.6 Subgoal 07.

Subgoal 06 packaged the v0.6 distance-window result into auditable tables and figures. The result is now strong enough to synthesize before widening the experimental scope.

Subgoal 07 is a writing and interpretation consolidation step.

It should turn the v0.6 distance-window result into:

- a thesis-facing result paragraph;
- a concise figure caption for the preferred TTFD missingness figure;
- an appendix-style evidence note;
- a clear statement of scope and limitations;
- and a decision record about whether the next scientific step should be a second physical artifact.

This subgoal should not run another matrix.

Its purpose is to prevent the v0.6 result from remaining only as design-note fragments, CSV tables, and generated figures.

---

## 2. Why this subgoal is needed

The v0.6 sequence has produced a meaningful scientific result:

> ignition-to-base-station distance is a structural variable that affects detection timing and TTFD availability, while the compact usefulness triad remains condition-readable across the tested windows.

The result is subtle enough that it should be written carefully before more experiments are added.

Without a synthesis step, there is a risk of moving too quickly into another matrix and losing the clean interpretation:

```text
distance affects timing access;
time horizon resolves some far-distance missingness;
noise remains far-distance TTFD-resistant;
the compact usefulness triad remains stable.
```

Subgoal 07 exists to preserve that interpretation in thesis-ready language.

---

## 3. Relationship to earlier v0.6 subgoals

### 3.1 Subgoal 03

Subgoal 03 ran the first distance-band usefulness matrix using:

```text
window = 0:150
```

Corrected short-window run:

```text
main analysis:   data/metrics/ana-194fc0a69b
repair analysis: data/metrics/ana-5c07ad299a
```

Key result:

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

But the usefulness-state mapping remained readable:

```text
healthy -> exploit
delay   -> recover
noise   -> caution
```

### 3.2 Subgoal 04

Subgoal 04 created the general extraction utility:

```text
src/extract_analysis_study_summary.py
```

This replaced ad hoc inspection scripts with a reusable analysis-study extractor for:

```text
data/metrics/ana-*/summary.json
data/metrics/ana-*/table.csv
```

Subgoal 04 matters for the thesis because it improves auditability.

### 3.3 Subgoal 05

Subgoal 05 ran the longer-window distance probe using:

```text
window = 0:450
```

Long-window run:

```text
data/metrics/ana-efab12c047
```

Key result:

```text
dist_50_far:
  healthy: finite
  delay:   finite
  noise:   missing

dist_60_very_far:
  healthy: partially finite
  delay:   partially finite
  noise:   missing
```

The usefulness-state mapping again remained readable:

```text
healthy -> exploit
delay   -> recover
noise   -> caution
```

### 3.4 Subgoal 06

Subgoal 06 created the packaging script:

```text
src/package_v0_6_distance_window_results.py
```

and generated packaged outputs under:

```text
results/figures/v0_6_distance_window/
```

Preferred thesis-facing figure:

```text
figure_v0_6_distance_window_ttfd_missingness_by_condition.png
```

This figure shows TTFD missingness by normalized distance, separated into healthy, delay, and noise panels.

---

## 4. Scientific synthesis

The v0.6 result should be summarized as follows:

> In the tested transformed real-fire artifact, increasing ignition-to-base-station distance strongly affected whether first detection appeared inside the observation window. In the short `0:150` window, far and very-far deployments failed to produce finite TTFD across healthy, delay, and noise conditions. Extending the window to `0:450` showed that some of this missingness was horizon-limited: far healthy and delay cases became finite, and very-far healthy and delay cases became partially finite. However, noise cases at far and very-far distances remained TTFD-missing even under the longer window. Across both windows, the compact usefulness triad remained stable: healthy cases were exploit-dominant, delay cases were recover-dominant, and noise cases were caution-dominant.

This is the central thesis-facing result of v0.6 so far.

---

## 5. Main thesis-facing claim

The main claim should be disciplined and bounded:

> Base-station distance from the initial fire context is not merely a geometric nuisance. In this transformed real-fire case, it acts as a structural condition that shapes detection timing and finite TTFD availability. However, the compact usefulness-state interpretation remains readable across the tested distance bands and time windows.

A stronger but still bounded version:

> The v0.6 distance-window study shows that timing access and usefulness-state behavior can separate: extending the observation window changes finite-detection availability, while the dominant usefulness mapping remains stable across healthy, delay, and noise conditions.

Avoid claiming:

```text
distance always behaves this way;
the triad is universally robust;
noise always prevents far-distance detection;
all real fires will show the same pattern;
```

This result is for one transformed real-fire artifact and one controlled distance protocol.

---

## 6. Preferred figure

The preferred figure for thesis use is:

```text
results/figures/v0_6_distance_window/figure_v0_6_distance_window_ttfd_missingness_by_condition.png
```

Reason:

It uses:

```text
x-axis: normalized ignition-to-base distance
y-axis: TTFD missing fraction
panels: healthy, delay, noise
lines/markers: 0:150 and 0:450 windows
```

This figure avoids implying continuity across unlike condition categories.

It directly shows:

```text
healthy:
  short window: far and very-far missing
  long window: far resolves, very-far partly resolves

delay:
  short window: far and very-far missing
  long window: far resolves, very-far partly resolves

noise:
  short window: far and very-far missing
  long window: far and very-far still missing
```

The `3/5` and `2/5` labels mark finite-detection counts for partially resolved cases. The y-axis remains missing fraction.

---

## 7. Draft figure caption

Suggested thesis caption:

```text
Figure X. TTFD missingness by normalized ignition-to-base-station distance for the v0.6 distance-window probe on physical artifact phy-b7edba9ac3. Each panel separates one usefulness-family condition: healthy, delay, or noise. The short 0:150 window shows complete TTFD missingness at far and very-far distances across all conditions. Extending the window to 0:450 resolves far healthy and delay cases and partially resolves very-far healthy and delay cases, but far and very-far noise cases remain TTFD-missing. Annotations indicate finite-detection counts out of five seeds for partially resolved cases.
```

Shorter version:

```text
Figure X. TTFD missingness by normalized ignition-to-base-station distance. Extending the window from 0:150 to 0:450 resolves some far-distance healthy and delay cases, but far-distance noise remains TTFD-missing. The annotations show finite detections out of five seeds where detections are partial.
```

---

## 8. Draft result paragraph

Suggested thesis paragraph:

```text
The distance-window probe shows that deployment geometry can alter the timing surface without collapsing the usefulness-state interpretation. In the 0:150 window, both far distance bands produced missing TTFD across healthy, delay, and noise conditions, despite the compact usefulness triad remaining readable. When the window was extended to 0:450, the healthy and delay cases at far distance became finite, and the very-far healthy and delay cases became partially finite. Noise behaved differently: far and very-far noise cases remained TTFD-missing even under the longer window. Thus, the short-window result was partly a horizon effect, but not uniformly so. Distance, window length, and impairment type interact, while the dominant usefulness mapping remains stable: healthy to exploit, delay to recover, and noise to caution.
```

Even shorter version:

```text
The distance-window probe shows that distance affects timing access more sharply than it affects the compact usefulness-state interpretation. Extending the window from 0:150 to 0:450 converted some far-distance healthy and delay cases from missing to finite TTFD, but far-distance noise remained TTFD-missing. Across both windows, the dominant usefulness mapping remained stable: healthy/exploit, delay/recover, and noise/caution.
```

---

## 9. Draft appendix evidence text

Suggested appendix note:

```text
The v0.6 distance-window study used the same transformed real-fire artifact, ignition reference, distance-band base-station placements, usefulness-family conditions, and seeds across two execution windows. The short-window matrix used 0:150 and the longer-window matrix used 0:450. The short-window result was corrected using a repair run for two mislabeled/incorrectly overridden cases; the corrected matrix was then extracted using the general analysis extraction utility. The longer-window matrix passed the same preset validation without repair. Packaged evidence tables were generated from the extraction outputs rather than from hand-edited summaries.
```

Add the analysis IDs:

```text
Short-window corrected matrix:
  main:   ana-194fc0a69b
  repair: ana-5c07ad299a

Long-window matrix:
  ana-efab12c047
```

---

## 10. Core evidence artifacts

Generated packaging artifacts:

```text
results/figures/v0_6_distance_window/
  v0_6_distance_window_ttfd_availability.csv
  v0_6_distance_window_dominant_state.csv
  v0_6_distance_window_metric_snapshot.csv
  v0_6_distance_window_interpretation.md
  figure_v0_6_distance_window_ttfd_missingness.png
  figure_v0_6_distance_window_ttfd_missingness_by_condition.png
  figure_v0_6_distance_window_ttfd_mean.png
  figure_v0_6_distance_window_dominant_state.png
```

Most important artifact:

```text
figure_v0_6_distance_window_ttfd_missingness_by_condition.png
```

Most important table:

```text
v0_6_distance_window_ttfd_availability.csv
```

Secondary table:

```text
v0_6_distance_window_dominant_state.csv
```

Appendix table:

```text
v0_6_distance_window_metric_snapshot.csv
```

---

## 11. Claims supported by the current evidence

The current evidence supports these claims:

### 11.1 Distance affects finite TTFD availability

The short-window result showed complete TTFD missingness at far and very-far distances across all tested conditions.

### 11.2 Some short-window missingness is horizon-limited

The long-window result resolved far healthy and delay cases and partially resolved very-far healthy and delay cases.

### 11.3 Noise is more persistent at far distances

Far and very-far noise cases remained TTFD-missing even under `0:450`.

### 11.4 The compact triad remains condition-readable

Across both windows and all distance bands:

```text
healthy -> exploit
delay   -> recover
noise   -> caution
```

### 11.5 Timing and usefulness-state behavior separate

Changing the window altered finite TTFD availability but did not collapse the dominant usefulness-state mapping.

This is the most important scientific framing.

---

## 12. Claims not supported yet

The current evidence does not yet support these claims:

```text
distance effects generalize across all transformed real-fire artifacts;
the triad is universally robust;
noise always prevents far-distance TTFD;
0:450 is sufficient for all far-distance cases;
AUC differences across 0:150 and 0:450 are directly comparable as absolute improvement/degradation;
base-station distance is the only geometric variable that matters.
```

These should be avoided in thesis prose unless future subgoals add evidence.

---

## 13. AUC/window-length caution

Because the two windows have different lengths:

```text
0:150
0:450
```

absolute values of AUC-style metrics such as:

```text
mean_entropy_auc
coverage_auc
```

should not be interpreted as direct cross-window improvement or degradation unless the metric normalization is confirmed.

Safer cross-window comparisons are:

- TTFD finite count;
- TTFD missing fraction;
- dominant usefulness state;
- qualitative condition mapping;
- whether missingness resolves, persists, or partially resolves.

Within each window, AUC-style metrics can still be used to inspect relative patterns across distance and condition.

---

## 14. Suggested thesis section placement

This result likely belongs after the v0.5 usefulness-triad robustness discussion.

Possible section sequence:

```text
1. Baseline usefulness triad under transformed real-fire conditions
2. Structural variation and deployment geometry
3. Ignition-to-base-station distance as a structural axis
4. Window-length sensitivity of TTFD availability
5. Separation of timing, belief summaries, and usefulness-state behavior
```

Subgoal 07 contributes primarily to sections 3–5.

Possible section title:

```text
Distance and Time Horizon as Structural Conditions
```

or:

```text
When Detection Timing Separates from Usefulness-State Interpretation
```

---

## 15. Suggested thesis framing

Suggested framing paragraph:

```text
The distance-window study reframes deployment geometry as an experimental variable rather than a nuisance parameter. By holding the physical artifact, ignition reference, policy, impairment families, and seeds fixed while varying base-station distance and observation window, AWSRT exposes a separation between timing access and usefulness-state interpretation. TTFD availability is highly sensitive to both distance and time horizon, but the compact usefulness triad remains condition-readable across the tested settings. This supports the broader AWSRT argument that timing, information delivery, belief quality, and usefulness are coupled but not interchangeable.
```

---

## 16. Suggested limitations paragraph

Suggested limitations paragraph:

```text
This result is intentionally bounded. It is based on one transformed real-fire artifact, one manually selected distance-band protocol, one compact usefulness controller, and two observation windows. The result should therefore be read as evidence that distance can act as a structural variable, not as a claim about all wildfire geometries. The next scientific extension is to test whether the same distance/window separation appears in a second transformed real-fire artifact.
```

---

## 17. Recommended final wording for v0.6 current conclusion

Recommended current v0.6 conclusion:

```text
At this stage, v0.6 shows that base-station distance can strongly reshape finite first-detection timing without destroying the compact usefulness-triad interpretation. Extending the window demonstrates that some far-distance detection failures are late contacts rather than absolute failures, but noise-side far-distance cases remain resistant. This gives AWSRT a sharper scientific role: it can show when timing access, information conditions, and usefulness-state behavior separate under controlled structural variation.
```

---

## 18. Minimal success criteria

Subgoal 07 is complete if:

1. A thesis-facing synthesis of the v0.6 distance-window result is written.
2. A preferred figure caption is drafted.
3. A result paragraph is drafted.
4. An appendix-style evidence note is drafted.
5. Scope and limitation language is included.
6. Supported and unsupported claims are separated.
7. AUC/window-length caution is preserved.
8. The next-step decision is recorded.
9. No new matrix is introduced.
10. The result remains explicitly bounded to `phy-b7edba9ac3`.

---

## 19. What this subgoal is not

Subgoal 07 should not:

- run another experiment;
- change extraction scripts;
- change plotting scripts;
- add a new physical artifact;
- revise controller behavior;
- broaden claims beyond the evidence;
- convert generated figures into tracked release artifacts unless deliberately chosen;
- decide final thesis figure numbering.

It is a synthesis step.

---

## 20. Recommended next step after Subgoal 07

After Subgoal 07, the scientifically stronger next step is:

```text
AWSRT v0.6 Subgoal 08: Second-Artifact Distance Protocol Check
```

Suggested file:

```text
docs/design/v0_6_08_second_artifact_distance_protocol_check.md
```

Purpose:

Test whether the distance/window/usefulness separation survives outside `phy-b7edba9ac3`.

However, this should only begin after the v0.6 distance-window synthesis is committed and tagged.

The synthesis should become the reference interpretation for the first artifact.

---

## 21. Working conclusion

Subgoal 07 preserves the scientific meaning of the v0.6 distance-window result.

The key result is:

> distance and time horizon strongly affect finite detection timing, but the usefulness-state mapping remains stable across the tested conditions.

The broader AWSRT contribution is:

> timing, information delivery, belief quality, and usefulness-state behavior are related but separable.

That is exactly the kind of metric separation AWSRT is intended to expose.
