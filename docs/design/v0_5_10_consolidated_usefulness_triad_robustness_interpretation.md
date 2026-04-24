# AWSRT v0.5 Subgoal 10: Consolidated Usefulness-Triad Robustness Interpretation for Transformed Real-Fire Windows

**Status:** Draft design note  
**Applies to:** `v0.5-subgoal-10`  
**Purpose:** Consolidate the Subgoal 07–09 findings into a thesis-facing interpretation of usefulness-triad robustness under bounded structural variation in transformed real-fire windows.

---

## 1. Purpose of this note

This note defines AWSRT v0.5 Subgoal 10.

Subgoals 07, 08, and 09 formed a connected sequence:

- Subgoal 07 made deterministic movement tie-breaking visible as a structural artifact.
- Subgoal 08 tested whether bounded deployment-origin variation disrupts the usefulness-triad interpretation.
- Subgoal 09 tested whether deterministic versus stochastic tie-breaking disrupts the same interpretation.

Together, these subgoals moved AWSRT v0.5 beyond a narrow implementation check.

They established a broader robustness question:

> Does the usefulness-triad interpretation remain readable under bounded structural variation in transformed real-fire settings?

Subgoal 10 should consolidate that answer.

This is not primarily a new experiment subgoal.

It is a synthesis and interpretation subgoal.

The goal is to gather the evidence from Subgoals 07–09 into a clear, disciplined, thesis-facing statement about what v0.5 has shown and what it has not shown.

---

## 2. Scientific intent

The scientific intent remains aligned with the core AWSRT thesis direction:

> Does the distinction between delivered information and operational usefulness survive contact with more realistic conditions?

Earlier v0.5 work showed that transformed real-fire windows can be used for bounded operational studies.

Subgoals 07–09 then tested whether usefulness-triad behavior remains interpretable when the system is exposed to structural variation that could plausibly confound interpretation.

The structural axes tested were:

- deterministic movement tie-breaking;
- deployment-origin geometry;
- deterministic versus stochastic tie-breaking.

The core scientific question for this consolidation is:

> Can AWSRT still separate detection timing, information delivery, belief-quality summaries, and usefulness-state behavior when structural deployment conditions vary?

The answer from Subgoals 07–09 appears to be:

> Yes, but not because structure is irrelevant. The usefulness triad remains readable while structural factors remain visible and scientifically important.

That distinction is central.

Subgoal 10 should avoid claiming invariance.

The stronger and more honest claim is:

> The usefulness-triad interpretation is robust enough to remain readable under bounded structural variation, while AWSRT exposes the ways that timing, movement structure, information flow, and belief quality diverge.

---

## 3. Background

### 3.1 Subgoal 07: deterministic structure becomes visible

Subgoal 07 identified that deterministic tie-breaking can introduce a non-neutral spatial artifact under tied or nearly tied movement-score conditions.

The observed behavior suggested that deterministic movement selection can favor lower row and/or column ordering under some circumstances.

The scientific lesson was not simply that a bug or nuisance existed.

The lesson was:

> Deployment behavior is conditioned by implementation semantics, not only by policy scoring.

This made movement tie-breaking a legitimate experimental condition.

### 3.2 Subgoal 08: deployment geometry matters, but does not collapse the triad

Subgoal 08 used the deployment-origin variation capability introduced after Subgoal 07.

The final stronger matrix used:

- physical artifact: `phy-b7edba9ac3`;
- three deployment origins:
  - `origin_near_initial` -> `[300, 465]`;
  - `origin_south_central` -> `[650, 725]`;
  - `origin_east_corridor` -> `[350, 1000]`;
- three impairment/usefulness-family cases:
  - healthy;
  - delay;
  - noise;
- five seeds:
  - `0,1,2,3,4`;
- fixed policy:
  - `usefulness_proto`;
- execution window:
  - `0:150`;
- analysis artifact:
  - `ana-eaf1a8dd3f`.

The key result was:

> Deployment origin strongly affects TTFD and access timing, but the usefulness-triad interpretation remains readable.

The final matrix showed a clean impairment-to-state mapping:

```text
healthy -> exploit-dominant
delay   -> recover-dominant
noise   -> caution-dominant
```

across the tested deployment origins.

This supported a bounded geometry-robustness interpretation:

> Deployment geometry is a conditioning factor, especially for detection timing, but it does not destroy the usefulness-triad reading in the tested transformed real-fire window.

### 3.3 Subgoal 09: tie-breaking affects secondary behavior, but not dominant triad mapping

Subgoal 09 reused the Subgoal 08 geometry and usefulness-family structure, then added deterministic versus stochastic tie-breaking.

The final matrix used:

- physical artifact: `phy-b7edba9ac3`;
- three deployment origins;
- three usefulness-family conditions;
- two tie-breaking modes:
  - deterministic;
  - stochastic;
- five seeds;
- fixed policy:
  - `usefulness_proto`;
- execution window:
  - `0:150`;
- analysis artifact:
  - `ana-7583d20635`.

The matrix shape was:

```text
3 origins × 3 conditions × 2 tie-breaking modes × 5 seeds = 90 rows
```

The central result was:

> No dominant usefulness-state changes were detected between deterministic and stochastic tie-breaking within matched origin × condition groups.

The same impairment-to-state mapping held:

```text
healthy -> exploit-dominant
delay   -> recover-dominant
noise   -> caution-dominant
```

However, stochastic tie-breaking was not behaviorally neutral.

It affected:

- TTFD availability;
- TTFD timing;
- state-occupancy balance inside the dominant state;
- some entropy and MDC residual/violation summaries.

The Subgoal 09 closeout interpretation was therefore:

> Tie-breaking semantics are structurally visible but do not overturn the dominant usefulness-triad interpretation under the tested bounded conditions.

---

## 4. Core consolidation question

Subgoal 10 centers on this question:

> What can be cautiously claimed from the Subgoal 07–09 sequence about usefulness-triad robustness under transformed real-fire structural variation?

The answer should be organized around four separations:

1. **Detection timing is not belief quality.**
2. **Information delivery is not necessarily operational usefulness.**
3. **Structural deployment conditions matter, but do not necessarily dominate interpretation.**
4. **The usefulness triad remains readable under bounded real-fire structural variation.**

The aim is to produce a disciplined synthesis that can later support:

- thesis results chapter language;
- figure captions;
- appendix discussion;
- release notes;
- future paper framing.

---

## 5. What Subgoal 10 should produce

Subgoal 10 should produce a compact consolidation note.

The note should gather and interpret the main evidence from:

```text
v0.5-subgoal-07
v0.5-subgoal-08
v0.5-subgoal-09
```

It should not primarily add new controller code.

It may add a small documentation file, such as:

```text
docs/design/v0_5_10_consolidated_usefulness_triad_robustness_interpretation.md
```

Optionally, it may also add a thesis-facing summary section to an existing v0.5 overview document if such a document already exists.

The output should be a structured interpretation, not a broad experiment plan.

---

## 6. Evidence to consolidate

### 6.1 Subgoal 07 evidence

Record the following:

- deterministic tie-breaking can create directional movement artifacts;
- this artifact is visible enough to deserve explicit reporting;
- movement behavior depends on selection semantics as well as policy scores;
- deterministic behavior remains useful for reproducible debugging;
- stochastic behavior may be useful for robustness/presentation checks.

Do not overclaim that deterministic tie-breaking is invalid.

The correct interpretation is:

> Deterministic tie-breaking is valid but structurally non-neutral.

### 6.2 Subgoal 08 evidence

Record the following:

- deployment origin is an auditable operational input via `network.base_station_rc`;
- `phy_id` and `base_station_rc` are available in analysis rows;
- TTFD is strongly geometry-sensitive;
- mean entropy AUC is less geometry-sensitive than TTFD in the tested window;
- usefulness-state occupancy remains interpretable across bounded origin changes;
- the final origin × healthy/delay/noise matrix supports the triad reading:
  - healthy -> exploit;
  - delay -> recover;
  - noise -> caution.

Do not claim deployment-geometry invariance.

The correct interpretation is:

> Deployment geometry conditions the run, especially timing and access, but does not collapse the usefulness-triad interpretation in the tested window.

### 6.3 Subgoal 09 evidence

Record the following:

- the deterministic versus stochastic matrix ran as intended:
  - 90 rows;
  - 18 grouped cases;
  - 3 origins;
  - 3 conditions;
  - 2 tie-breaking modes;
  - 5 seeds;
- no dominant usefulness-state changes occurred across matched deterministic/stochastic groups;
- stochastic tie-breaking changed TTFD availability and timing in several cases;
- stochastic tie-breaking shifted internal state-occupancy balances;
- stochastic tie-breaking affected some mean entropy and MDC metrics;
- the dominant usefulness-family interpretation remained stable.

Do not claim tie-breaking invariance.

The correct interpretation is:

> Tie-breaking affects secondary behavior but does not overturn the dominant triad mapping in the tested bounded structure.

---

## 7. Proposed consolidated interpretation

The main Subgoal 10 interpretation should be:

> Across Subgoals 07–09, AWSRT v0.5 shows that the compact usefulness triad remains readable under bounded transformed real-fire structural variation. Deployment origin and tie-breaking semantics materially affect movement, timing, and some secondary summaries, but they do not overturn the core impairment-to-usefulness-state mapping observed in the tested window.

A more compact thesis-facing version:

> In the tested transformed real-fire window, healthy, delay, and noise conditions continued to map onto exploit-, recover-, and caution-dominant behavior even when deployment origin and tie-breaking semantics were varied. This supports a cautious robustness reading of the usefulness triad, while also showing that timing and movement structure must be reported rather than hidden.

The most important nuance:

> Robustness here means interpretive readability under bounded variation, not metric invariance.

---

## 8. Interpretation of the usefulness triad after Subgoals 07–09

The triad can now be described as follows.

### 8.1 Exploit

Exploit-dominant behavior corresponds to comparatively healthy information flow.

In the tested matrices, healthy cases remained exploit-dominant across deployment origins and tie-breaking modes.

This supports the reading of exploit as the state associated with usable information flow.

However, stochastic tie-breaking reduced exploit occupancy in some healthy cases, especially where it introduced more varied movement and encounter behavior.

Therefore, exploit dominance should be interpreted qualitatively, not as a fixed fraction.

### 8.2 Recover

Recover-dominant behavior corresponds to delay or staleness pressure.

In the tested matrices, delay cases remained recover-dominant across deployment origins and tie-breaking modes.

This supports the reading of recover as the state associated with stale or delayed information flow.

However, stochastic tie-breaking sometimes shifted part of the delay condition into caution occupancy.

This suggests that recovery and caution can interact when structural movement variation changes encounter and update patterns.

That is a useful nuance rather than a failure.

### 8.3 Caution

Caution-dominant behavior corresponds to corrupted or suspect information flow.

In the tested matrices, noise cases remained caution-dominant across deployment origins and tie-breaking modes.

This supports the reading of caution as the state associated with corruption-like information health.

Noise remained the clearest and most stable caution case.

This strengthens the interpretation that caution is not merely a byproduct of geometry or deterministic movement selection.

---

## 9. TTFD interpretation

Subgoals 08 and 09 both reinforce the same lesson:

> TTFD is necessary but insufficient.

TTFD is important because first detection matters operationally.

However, TTFD is strongly affected by:

- deployment origin;
- execution window;
- movement tie-breaking;
- whether the deployment path encounters the fire within the bounded window.

Subgoal 09 especially showed that stochastic tie-breaking can convert some no-detection deterministic cases into finite-TTFD cases.

This does not mean stochastic tie-breaking is automatically better.

It means TTFD is path-sensitive and should be interpreted as an access/timing metric, not as a complete belief-quality or usefulness metric.

The consolidation should explicitly state:

> TTFD is a geometry- and path-sensitive metric. It should be reported, but it should not be allowed to stand in for information usefulness or belief-state quality.

---

## 10. Mean entropy and belief-quality interpretation

Mean entropy AUC behaved differently from TTFD.

Subgoal 08 showed that mean entropy AUC was less sensitive to deployment origin than TTFD in the tested window.

Subgoal 09 showed that stochastic tie-breaking could improve TTFD availability while still worsening or shifting mean entropy AUC in some matched cases.

This supports the important AWSRT distinction:

> Earlier or more frequent detection opportunities do not automatically translate into better aggregate belief quality.

Mean entropy should therefore be interpreted as a belief-quality summary, not as a detection-timing proxy.

---

## 11. MDC and information-usefulness interpretation

The MDC-style metrics help separate information delivery from operational usefulness.

Across Subgoals 08 and 09, metrics such as:

- `delivered_info_proxy_mean`;
- `mdc_residual_mean`;
- `mdc_residual_pos_frac`;
- `mdc_violation_rate`;

showed that impairment conditions can differ in ways not fully captured by TTFD or mean entropy.

Delay can create violation/usefulness stress even when entropy remains close to healthy.

Noise can preserve apparent informational activity while still producing caution-dominant behavior.

This reinforces the core AWSRT claim:

> Information activity and operational usefulness are not the same thing.

Subgoal 10 should preserve this distinction clearly.

---

## 12. Structural truthfulness

A major v0.5 outcome is improved structural truthfulness.

Subgoals 07–09 made previously hidden or implicit structural factors visible:

- deterministic tie-breaking behavior;
- deployment-origin geometry;
- `phy_id`;
- `base_station_rc`;
- case labels encoding origin, condition, and tie-breaking;
- analysis rows that support audit of the structural setup.

This matters because scientific interpretation depends on knowing what varied.

Subgoal 10 should state:

> The platform is becoming more truthful about the structural conditions under which operational behavior is produced.

This does not mean the platform is complete.

It means the v0.5 path is improving interpretability and auditability.

---

## 13. What should not be claimed

Subgoal 10 should avoid overclaiming.

Do not claim:

- the usefulness triad is invariant;
- deployment geometry does not matter;
- stochastic tie-breaking is superior;
- deterministic tie-breaking is invalid;
- TTFD is unimportant;
- mean entropy fully captures usefulness;
- the transformed real-fire result generalizes to all physical artifacts;
- the current controller is optimized;
- AWSRT has solved operational wildfire sensing.

The correct claim is narrower:

> In the tested transformed real-fire window, the usefulness-triad interpretation remained readable under bounded deployment-origin and tie-breaking variation, while structural factors produced visible and scientifically meaningful secondary effects.

---

## 14. Suggested final wording for v0.5 interpretation

The following paragraph may be reused in later thesis or release material:

```text
AWSRT v0.5 shows that the compact usefulness triad remains interpretable under bounded structural variation in transformed real-fire windows. Deployment geometry and tie-breaking semantics materially affect movement paths, detection timing, and some secondary summaries, but they do not overturn the dominant impairment-to-state mapping observed in the tested cases: healthy conditions remain exploit-dominant, delay conditions remain recover-dominant, and noise conditions remain caution-dominant. The result is not invariance. Rather, it is a robustness-of-interpretation result: AWSRT makes structural sensitivity visible while preserving a readable distinction among detection timing, information delivery, belief-quality summaries, and operational usefulness.
```

A shorter version:

```text
The usefulness triad survives bounded structural variation, but the structure matters. AWSRT’s value is that it exposes both facts at once.
```

---

## 15. Possible figure/table outputs

Subgoal 10 may optionally define or prepare figure/table ideas for later use.

Recommended tables:

1. **Subgoal 07–09 evidence table**

| Subgoal | Structural axis | Main finding | Interpretation |
|---|---|---|---|
| 07 | deterministic tie-breaking | directional artifact visible | movement semantics are structural |
| 08 | deployment origin | TTFD sensitive, triad readable | geometry matters but does not collapse interpretation |
| 09 | tie-breaking mode | dominant triad stable, secondary metrics shift | tie-breaking visible but not interpretation-dominating |

2. **Metric-separation table**

| Metric family | What it shows | What it does not show |
|---|---|---|
| TTFD | first encounter timing | belief quality or usefulness |
| mean entropy AUC | aggregate belief uncertainty | timing/access mechanism |
| delivered info proxy | information activity | guaranteed usefulness |
| MDC residual/violation | usefulness stress | complete operational success |
| usefulness state occupancy | controller interpretation of information health | optimized policy performance |

3. **Triad interpretation table**

| Condition | Dominant state | Interpretation |
|---|---|---|
| healthy | exploit | usable information flow |
| delay | recover | stale/delayed information flow |
| noise | caution | corrupted/suspect information flow |

Recommended figures, if needed later:

- grouped bar chart of exploit/recover/caution occupancy by condition and tie-breaking mode;
- TTFD finite-count / missingness chart by origin and tie-breaking;
- compact Subgoal 07–09 narrative diagram.

Figures are optional for this subgoal.

Do not let figure generation expand the scope unless needed.

---

## 16. Minimal success criteria

Subgoal 10 is complete if:

1. The Subgoal 07–09 findings are consolidated in one clear design note.
2. The note records the relevant artifact IDs:
   - `ana-eaf1a8dd3f`;
   - `ana-7583d20635`.
3. The note states the main interpretation:
   - usefulness triad remains readable under bounded structural variation.
4. The note also states the limitation:
   - structural factors materially affect timing and secondary behavior.
5. The note avoids invariance or optimization claims.
6. The note clearly separates:
   - TTFD;
   - information delivery;
   - belief-quality summaries;
   - usefulness-state behavior.
7. The note identifies likely next work without starting a broad new experiment.
8. The repository is left with a compact, thesis-facing v0.5 synthesis artifact.

---

## 17. Likely next step after Subgoal 10

If Subgoal 10 succeeds as a consolidation note, the next step should depend on the desired v0.5 endpoint.

Possible next steps:

### Option A: Freeze v0.5 after consolidation

This is appropriate if v0.5 is meant to close as a structural-robustness interpretation phase.

This would frame v0.5 as having shown:

- transformed real-fire windows are experimentally usable;
- structural deployment factors are visible;
- usefulness-triad interpretation survives bounded structural variation;
- TTFD, information delivery, belief quality, and usefulness-state behavior separate.

### Option B: Add one final figure/table packaging subgoal

This is appropriate if the thesis needs presentation-ready outputs.

A possible Subgoal 11 would be:

```text
AWSRT v0.5 Subgoal 11: Thesis-Facing Tables and Figures for Usefulness-Triad Robustness
```

This should only produce packaging artifacts, not new controller behavior.

### Option C: Begin v0.6

This is appropriate if the next scientific move requires a new phase.

Possible v0.6 directions include:

- multiple transformed real-fire artifacts;
- broader physical-context variation;
- usefulness-triad behavior under longer windows;
- additional impairment combinations;
- explicit movement-path audit visualizations.

Do not start v0.6 inside Subgoal 10.

---

## 18. Working note

Subgoal 10 should stay disciplined.

The purpose is not to make AWSRT look stronger than the evidence allows.

The purpose is to say clearly what the evidence now supports:

> The usefulness triad remains interpretable under bounded structural variation, and AWSRT makes the relevant structural sensitivities visible.

That is enough.

The value of v0.5 is not that all metrics agree.

The value is that they do not agree, and that the platform can show where and why they separate.

This is directly aligned with the broader AWSRT thesis direction:

> operationally useful information is not the same as information delivery, detection timing, or aggregate belief quality.

Subgoal 10 should preserve that distinction as the main result.
