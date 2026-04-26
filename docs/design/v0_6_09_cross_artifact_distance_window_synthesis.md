# AWSRT v0.6 Subgoal 09: Cross-Artifact Distance-Window Synthesis

**Status:** Draft design note  
**Applies to:** `v0.6-subgoal-09`  
**Recommended file:** `docs/design/v0_6_09_cross_artifact_distance_window_synthesis.md`  
**Depends on:** `v0.6-subgoal-03`, `v0.6-subgoal-04`, `v0.6-subgoal-05`, `v0.6-subgoal-06`, `v0.6-subgoal-07`, `v0.6-subgoal-08`  
**Primary first artifact:** `phy-b7edbai9ac3`  
**Primary second artifact:** `phy-79a8cea500` / CFSDS fire `2017_856`  
**Purpose:** Synthesize the v0.6 distance-window evidence across two transformed real-fire artifacts, identify what survives across artifacts, record artifact-specific boundary conditions, and decide whether v0.6 is ready for freeze or requires one more targeted probe.

---

## 1. Purpose of this note

This note defines AWSRT v0.6 Subgoal 09.

Subgoals 03 through 08 established a bounded but now cross-artifact distance/usefulness result.

The first artifact was:

```text
phy-b7edba9ac3
```

It was studied through short and longer windows:

```text
0:150
0:450
```

The second artifact was:

```text
phy-79a8cea500 / 2017_856
```

It was studied through an artifact-appropriate engagement window:

```text
700:1200
```

Subgoal 09 is a synthesis step.

It should not immediately launch another matrix.

Its purpose is to compare the first-artifact and second-artifact findings, identify what appears stable, identify what is artifact-specific, and decide whether v0.6 is ready to freeze or needs one more carefully scoped experiment.

---

## 2. Scientific motivation

The v0.6 question has evolved from a simple distance probe into a more careful structural-geometry question.

The original v0.6 framing was:

> Treat distance between the initial fire context and the base station as a measurable structural variable.

The first artifact showed that this variable mattered strongly for finite TTFD availability and that the effect depended on window length.

The second artifact showed that the same usefulness-triad interpretation could remain stable in a different transformed real-fire context, but also introduced a richer spatial complication: the fire later engaged or encircled the usual central base-station region.

Subgoal 09 should synthesize this as follows:

> Base-station geometry affects timing access, but the exact timing surface is artifact- and window-dependent. Across the tested artifacts, the compact usefulness triad remains condition-readable even when TTFD availability changes.

This is aligned with the broader AWSRT thesis direction:

> timing, information delivery, belief quality, and usefulness-state behavior are related, but they are not the same thing.

---

## 3. Relationship to previous v0.6 subgoals

### 3.1 Subgoal 03

Subgoal 03 ran the first distance-band matrix on:

```text
phy-b7edba9ac3
execution_window = 0:150
```

The corrected short-window result showed:

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

The compact usefulness-state mapping remained:

```text
healthy -> exploit
delay   -> recover
noise   -> caution
```

Interpretation:

> Distance strongly affected finite TTFD availability within the fixed `0:150` window, but the compact usefulness triad remained condition-readable.

### 3.2 Subgoal 04

Subgoal 04 created the general extraction script:

```text
src/extract_analysis_study_summary.py
```

This moved the project away from one-off extraction scripts and made later results more auditable.

Subgoal 09 should rely on extracted summaries rather than raw `summary.json` alone.

### 3.3 Subgoal 05

Subgoal 05 extended the first-artifact distance matrix to:

```text
execution_window = 0:450
```

The longer window showed that some far-distance TTFD missingness was horizon-limited.

Key long-window pattern:

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

The compact usefulness mapping remained:

```text
healthy -> exploit
delay   -> recover
noise   -> caution
```

Interpretation:

> Extending the window converted some far-distance failures into late detections, but noise-side far-distance cases remained TTFD-resistant and the triad remained stable.

### 3.4 Subgoal 06

Subgoal 06 packaged the first-artifact two-window result into combined tables and figures.

Its central packaged message was:

> Distance from the initial fire context to the base station is a real structural variable. It strongly affects whether first detection appears within a finite observation window. Extending the window reveals that some far-distance failures are late detections rather than absolute failures, but noise-side far-distance cases remain resistant. Across these timing changes, the compact usefulness triad remains stable.

### 3.5 Subgoal 07

Subgoal 07 synthesized the first-artifact result into thesis-facing language.

It clarified that the first-artifact result should not be overgeneralized, but was strong enough to motivate a bounded second-artifact check.

### 3.6 Subgoal 08

Subgoal 08 selected and ran a second transformed real-fire artifact:

```text
fire_id = 2017_856
phy_id  = phy-79a8cea500
```

Primary window:

```text
700:1200
```

This window was selected because visual inspection indicated meaningful fire engagement around the usual central base-station region near:

```text
(750, 600)
```

The second artifact produced a clean 60-run matrix:

```text
4 distance bands × 3 conditions × 5 seeds = 60 runs
```

The main result was a partial replication with artifact-specific structure:

```text
near and mid:
  finite TTFD across healthy, delay, noise

far:
  healthy and delay finite
  noise missing

very far:
  healthy and delay partially finite
  noise missing
```

The compact usefulness-state mapping again remained:

```text
healthy -> exploit
delay   -> recover
noise   -> caution
```

---

## 4. Main synthesis question

Subgoal 09 centers on this question:

> Across the first and second transformed real-fire artifacts, what aspects of the distance/window/usefulness result survive, and what aspects are artifact- or window-dependent?

More specifically:

1. Does base-station geometry affect finite TTFD availability across both artifacts?
2. Does the exact TTFD surface depend on the physical artifact and observation window?
3. Does noise remain the most TTFD-resistant condition at larger distances?
4. Does the compact usefulness triad remain condition-readable across artifacts?
5. Do timing access and usefulness-state behavior separate in a way that strengthens the AWSRT thesis?
6. Is v0.6 ready to freeze, or is one more targeted probe needed?

---

## 5. Evidence inputs

Subgoal 09 should use the extracted and packaged outputs already produced.

### 5.1 First artifact, short window

```text
analysis: data/metrics/ana-194fc0a69b
repair:   data/metrics/ana-5c07ad299a
window:   0:150
artifact: phy-b7edba9ac3
```

Important extracted files:

```text
data/metrics/ana-194fc0a69b/analysis_extraction_integrity.json
data/metrics/ana-194fc0a69b/analysis_extraction_case_summary.csv
data/metrics/ana-194fc0a69b/analysis_extraction_group_summary.csv
data/metrics/ana-194fc0a69b/analysis_extraction_interpretation.md
```

### 5.2 First artifact, longer window

```text
analysis: data/metrics/ana-efab12c047
window:   0:450
artifact: phy-b7edba9ac3
```

Important extracted files:

```text
data/metrics/ana-efab12c047/analysis_extraction_integrity.json
data/metrics/ana-efab12c047/analysis_extraction_case_summary.csv
data/metrics/ana-efab12c047/analysis_extraction_group_summary.csv
data/metrics/ana-efab12c047/analysis_extraction_interpretation.md
```

### 5.3 First-artifact packaging outputs

```text
results/figures/v0_6_distance_window/
```

Expected files include:

```text
v0_6_distance_window_ttfd_availability.csv
v0_6_distance_window_dominant_state.csv
v0_6_distance_window_metric_snapshot.csv
v0_6_distance_window_interpretation.md
figure_v0_6_distance_window_ttfd_missingness.png
figure_v0_6_distance_window_ttfd_mean.png
figure_v0_6_distance_window_dominant_state.png
```

### 5.4 Second artifact

```text
analysis: data/metrics/ana-70996f0076
window:   700:1200
artifact: phy-79a8cea500 / 2017_856
```

Important extracted files:

```text
data/metrics/ana-70996f0076/analysis_extraction_integrity.json
data/metrics/ana-70996f0076/analysis_extraction_case_summary.csv
data/metrics/ana-70996f0076/analysis_extraction_group_summary.csv
data/metrics/ana-70996f0076/analysis_extraction_interpretation.md
```

---

## 6. First-artifact synthesis

The first artifact supports the following interpretation:

```text
Artifact: phy-b7edba9ac3
Distance axis: ignition-to-base-station distance
Windows: 0:150 and 0:450
```

Short-window behavior:

```text
near/mid:
  finite TTFD across all conditions

far/very far:
  missing TTFD across all conditions
```

Longer-window behavior:

```text
near/mid:
  finite TTFD across all conditions

far:
  healthy and delay become finite
  noise remains missing

very far:
  healthy and delay become partially finite
  noise remains missing
```

Usefulness-state behavior:

```text
healthy -> exploit
delay   -> recover
noise   -> caution
```

Interpretation:

> The first artifact shows that finite TTFD availability is strongly shaped by distance and observation window. Some far-distance missingness is horizon-limited, but far-distance noise remains resistant. The compact usefulness triad remains stable across both windows.

---

## 7. Second-artifact synthesis

The second artifact supports the following interpretation:

```text
Artifact: phy-79a8cea500 / 2017_856
Distance axis: northwest distance from native ignition reference
Window: 700:1200
```

Artifact-specific setup:

```text
grid: (1314, 1144)
domain_diagonal_cells: 1742.2204223346712
ignition_reference_rc: (1079, 767)
```

Distance bands:

```text
dist_15_near        (894, 582)   norm ≈ 0.150
dist_30_mid         (709, 397)   norm ≈ 0.300
dist_50_far         (463, 151)   norm ≈ 0.500
dist_60_very_far    (340, 28)    norm ≈ 0.600
```

Timing behavior:

```text
near/mid:
  finite TTFD across healthy, delay, noise

far:
  healthy and delay finite
  noise missing

very far:
  healthy and delay partially finite
  noise missing
```

Usefulness-state behavior:

```text
healthy -> exploit
delay   -> recover
noise   -> caution
```

Interpretation:

> The second artifact partially replicates the first-artifact distance/usefulness separation. The timing surface differs because the artifact and window differ, but the larger-distance noise cases remain resistant and the compact usefulness triad remains stable.

---

## 8. Cross-artifact comparison

### 8.1 Stable findings

Across both artifacts, the following findings appear stable:

1. **Base-station geometry affects finite TTFD availability.**

   Timing access is not invariant to deployment geometry.

2. **Noise is more timing-resistant at larger distances.**

   In both artifacts, far or very-far noise cases remain missing where healthy or delay cases can become finite or partially finite.

3. **The compact usefulness triad remains condition-readable.**

   Across the tested matrices:

   ```text
   healthy -> exploit
   delay   -> recover
   noise   -> caution
   ```

4. **TTFD and usefulness-state occupancy do not collapse into the same story.**

   TTFD availability changes with distance and window, but dominant usefulness-state interpretation remains stable.

5. **Distance should be treated as a structural experimental variable.**

   It is not merely a nuisance parameter.

### 8.2 Artifact-dependent findings

The following findings are artifact- or window-dependent:

1. **Exact TTFD missingness surface.**

   The first artifact required explicit short/long window comparison to show horizon-limited far detections. The second artifact used a later engagement window and produced a different finite/missing pattern.

2. **Meaning of the observation window.**

   For the first artifact, the window comparison was explicitly short versus long from the start of the replay.

   For the second artifact, the window was selected around a visually meaningful engagement period.

3. **Geometry is not only ignition distance.**

   The second artifact suggests that later fire engagement around an operational base region can matter alongside distance from the ignition reference.

4. **Distance-band direction differs by artifact.**

   The first artifact used a southeast progression from ignition. The second artifact used a northwest progression because of boundary constraints and ignition location.

---

## 9. Recommended synthesis claim

A careful v0.6 claim is:

> Across two transformed real-fire artifacts, base-station geometry affects finite detection timing, especially TTFD availability under bounded observation windows. The exact timing surface is artifact- and window-dependent, but the compact usefulness triad remains condition-readable across the tested distance bands and impairment conditions. This supports the AWSRT distinction between timing access and usefulness-state interpretation.

A stronger but still bounded version is:

> The v0.6 results show that deployment geometry can stress timing access without collapsing the usefulness-state interpretation. Healthy, delay, and noise cases remain distinguishable through the compact triad even when finite first detection becomes distance- and horizon-dependent.

Avoid saying:

```text
distance always causes missing TTFD
noise always prevents detection at far distance
the triad is universally robust
base-station distance alone explains all geometry effects
```

Those claims are too broad for two artifacts.

---

## 10. Thesis-facing interpretation

Possible thesis-facing paragraph:

```text
The v0.6 distance studies extend the AWSRT usefulness argument from a single transformed fire to a bounded cross-artifact check. In the first artifact, increasing ignition-to-base-station distance removed finite TTFD within the short window, while extending the window recovered some far healthy and delay detections but not far noise detections. In the second artifact, an engagement-window study showed a similar separation: near and mid cases remained detectable, far and very-far noise cases remained timing-resistant, and healthy/delay cases were more likely to retain finite or partially finite TTFD. Across both artifacts, the dominant usefulness-state mapping remained stable: healthy conditions were exploit-dominant, delay conditions recover-dominant, and noise conditions caution-dominant. These results support the thesis that timing access, information condition, and operational usefulness are separable dimensions of adaptive wildfire sensing.
```

Shorter version:

```text
Across two transformed real-fire artifacts, distance and observation window strongly shaped whether first detection became visible, but they did not erase the compact usefulness-triad interpretation. This reinforces the AWSRT claim that detection timing and operational usefulness are related but distinct.
```

---

## 11. Interpretation cautions

### 11.1 Cross-window AUC caution

AUC-style metrics such as:

```text
mean_entropy_auc
coverage_auc
```

should not be compared directly across unequal windows unless their normalization is confirmed.

For cross-window synthesis, prioritize:

```text
TTFD finite count
TTFD missing fraction
dominant usefulness state
relative within-window patterns
```

### 11.2 Cross-artifact caution

The two artifacts differ in:

```text
grid shape
ignition location
fire morphology
selected distance direction
observation window
spatial engagement around operational regions
```

Therefore, the synthesis should be framed as bounded support, not full generalization.

### 11.3 Distance is not the only geometry variable

The second artifact introduces an important nuance:

> later fire engagement around a base-station region may matter in addition to initial ignition-to-base distance.

This should be treated as a productive refinement, not a problem.

---

## 12. Possible figures or tables for Subgoal 09

Subgoal 09 may create a small synthesis table, either manually in this note or through a helper script.

Suggested table:

```text
artifact
window
near/mid TTFD pattern
far TTFD pattern
very-far TTFD pattern
noise behavior
dominant usefulness mapping
interpretation
```

Suggested rows:

```text
phy-b7edba9ac3, 0:150
phy-b7edba9ac3, 0:450
phy-79a8cea500, 700:1200
```

Possible output path if a curated table is created:

```text
results/figures/v0_6_cross_artifact_synthesis/
```

or, if small and thesis-facing:

```text
docs/results/v0_6_cross_artifact_distance_window_synthesis.md
```

Do not create large packaging infrastructure unless needed.

---

## 13. Decision point: freeze or run one more probe?

Subgoal 09 should explicitly decide between two paths.

### Option A: Freeze v0.6 after synthesis

This is recommended if the synthesis is judged strong enough.

Rationale:

- v0.6 already has one first-artifact distance/window study;
- a reusable extractor exists;
- a first-artifact package exists;
- a second-artifact check exists;
- the compact usefulness triad remained stable across all tested matrices;
- the cross-artifact result is scientifically useful and bounded.

This would lead to:

```text
v0.6-subgoal-10: Final v0.6 Freeze and Thesis Packaging
```

### Option B: Run one more targeted probe

This may be justified only if Subgoal 09 identifies a specific unresolved issue.

Possible targeted probes:

1. **Second-artifact alternate window**

   If `700:1200` is judged too artifact-specific, run a more directly comparable window.

2. **Second-artifact central-base comparison**

   Use the usual base region around `(750, 600)` as an explicit comparison point.

3. **Third artifact smoke check**

   Run a smaller third-artifact check only if cross-artifact robustness is still too weak for the intended thesis claim.

Avoid launching another broad matrix by default.

---

## 14. Recommended path

The recommended path is **Option A: prepare to freeze v0.6 after synthesis**, unless a concrete gap emerges while writing.

The current evidence already supports a disciplined v0.6 contribution:

```text
v0.6 shows that base-station geometry and observation window shape timing access, while the compact usefulness triad remains condition-readable across two transformed real-fire artifacts.
```

This is enough for a bounded release-level finding.

A third artifact could be useful later, but it is not necessary before preserving the v0.6 result.

---

## 15. Minimal success criteria

Subgoal 09 is complete if:

1. The first-artifact short-window result is summarized.
2. The first-artifact long-window result is summarized.
3. The second-artifact engagement-window result is summarized.
4. Stable findings across artifacts are identified.
5. Artifact- and window-dependent findings are identified.
6. The synthesis avoids overgeneralization.
7. A thesis-facing interpretation paragraph is drafted.
8. A clear decision is made:
   - freeze v0.6 next; or
   - run one more targeted probe.
9. No new controller changes are introduced.
10. No new broad experiment is launched before the synthesis is written.

---

## 16. What this subgoal is not

Subgoal 09 should not:

- run a new matrix by default;
- add a third artifact immediately;
- change the usefulness controller;
- vary tie-breaking;
- introduce regime management;
- over-compare AUC values across unequal windows;
- claim universal cross-fire robustness;
- treat artifact-specific differences as failures;
- erase the distinction between ignition-distance and later engagement geometry.

It is a synthesis and decision subgoal.

---

## 17. Likely next step after Subgoal 09

If Subgoal 09 supports freezing v0.6, the next note should be:

```text
docs/design/v0_6_10_final_freeze_and_thesis_packaging.md
```

Possible title:

```text
AWSRT v0.6 Subgoal 10: Final Freeze and Thesis Packaging
```

Purpose:

```text
Finalize v0.6 as a bounded cross-artifact distance/usefulness release, preserve the evidence tables and figures, and prepare thesis-facing prose.
```

If Subgoal 09 identifies a specific gap, then Subgoal 10 should instead be a narrowly scoped targeted probe.

---

## 18. Working conclusion

Subgoal 09 is where v0.6 becomes more than a collection of matrices.

The first artifact showed a clean distance/window effect: short-window far TTFD missingness, longer-window partial recovery, and persistent far-noise resistance.

The second artifact showed that a different transformed real-fire context can produce a related but not identical timing surface, while preserving the compact usefulness-triad mapping.

The emerging v0.6 conclusion is:

> Base-station geometry is a real structural variable in AWSRT. It shapes whether and when first detection appears, and this timing surface depends on artifact geometry and observation window. However, across the tested artifacts, the compact usefulness triad remains condition-readable, preserving the distinction between timing access and usefulness-state behavior.

That is the result Subgoal 09 should test, refine, and prepare for freeze.
