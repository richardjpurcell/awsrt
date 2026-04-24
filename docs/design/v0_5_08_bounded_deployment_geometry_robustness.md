# AWSRT v0.5 Subgoal 08: Bounded Deployment-Geometry Robustness of the Usefulness Triad

**Status:** Closed design note  
**Applies to:** `v0.5-subgoal-08`  
**Primary analysis artifact:** `ana-eaf1a8dd3f`  
**Purpose:** Close out the bounded deployment-origin robustness probe introduced after Subgoal 07 by testing whether the usefulness-triad interpretation remains readable under controlled deployment-geometry variation.

---

## 1. Purpose of this note

This note closes AWSRT v0.5 Subgoal 08.

Subgoal 07 clarified that:

- deterministic tie-breaking can introduce a non-neutral spatial artifact under tied movement-score conditions;
- deployment origin, via `network.base_station_rc`, is a structural input to operational behavior;
- Analysis Batch can vary deployment origin in a bounded and auditable way;
- `phy_id` and `base_station_rc` are visible in analysis rows.

Those changes enabled a tightly scoped scientific question:

> Does the usefulness-triad interpretation remain readable under bounded variation in deployment geometry?

Subgoal 08 used this capability to perform a controlled robustness probe, not a broad experimental expansion.

The study used `phy-b7edba9ac3`, a transformed real-fire artifact with grid size approximately `1085 × 1448`, where the fire begins in the upper-left quadrant and spreads in multiple directions. This physical context is useful because deployment origin can be moved relative to a nontrivial fire geometry while holding the physical artifact fixed.

The final Subgoal 08 matrix extended the earlier smoke test into a compact but stronger design:

- three bounded deployment origins;
- three usefulness-family impairment conditions;
- five seeds;
- fixed physical artifact;
- fixed policy, `usefulness_proto`;
- fixed execution window, `0:150`.

The main result is cautious but positive:

> Deployment geometry strongly conditions access and detection timing, but it does not destroy the usefulness-triad interpretation under the tested transformed real-fire window.

---

## 2. Scientific intent

The scientific intent remains aligned with the core AWSRT thesis direction:

> Does the distinction between delivered information and operational usefulness survive contact with more realistic conditions?

Subgoal 08 extends this question from impairment variation to deployment-geometry variation.

The key concern was:

> Are usefulness-triad observations genuinely about information flow and belief maintenance, or are they merely artifacts of one deployment-origin geometry?

This subgoal therefore tested whether the compact usefulness triad:

- exploit;
- recover;
- caution;

remains interpretable when deployment geometry is perturbed in a bounded way.

This is especially important after Subgoal 07 because deterministic dynamic movement can prefer lower row indices under tied conditions. If that structural behavior interacted strongly with base-station placement, then usefulness-family interpretation could be more geometry-conditioned than previously visible.

Subgoal 08 does not claim geometry invariance. Instead, it asks whether bounded geometry variation leaves the triad readable enough to support cautious interpretation.

---

## 3. Subgoal framing

Subgoal 08 should be understood as:

- a bounded robustness test, not a new campaign;
- a structure-aware validation, not controller redesign;
- a multi-case extension of existing studies, not a new workflow;
- a check on interpretation, not an optimization exercise.

The study remained:

- compact;
- named;
- screenshot-readable;
- compatible with current Analysis Batch;
- aligned with usefulness-family comparison patterns.

The goal was not to prove invariance. The goal was to determine whether deployment-origin variation produces:

- stable usefulness-triad readings;
- mild, interpretable sensitivity;
- or strong geometry sensitivity that must be treated as a core experimental axis.

The final result falls between the first two outcomes:

> The triad interpretation is stable at the impairment-family level, while access and TTFD remain strongly geometry-conditioned.

---

## 4. Core question

Subgoal 08 centered on one question:

> When deployment origin is varied within a bounded study, do usefulness-triad signals remain consistent enough to support cautious interpretation?

This included:

- state occupancy fractions:
  - exploit;
  - recover;
  - caution;
- trigger behavior:
  - recover hits;
  - caution hits;
  - recover-from-caution hits;
  - exploit hits;
- headline outcomes:
  - `ttfd`;
  - `mean_entropy_auc`;
  - `coverage_auc`;
- information/usefulness metrics:
  - `delivered_info_proxy_mean`;
  - `mdc_residual_mean`;
  - `mdc_residual_pos_frac`;
  - `mdc_violation_rate`.

The answer from the final matrix is:

> Yes, with qualification. Deployment origin strongly affects access and detection timing, but the usefulness-triad state identity remains highly readable across the tested origins.

---

## 5. Study design

### 5.1 Fixed physical context

The study held the physical artifact fixed:

```text
phy-b7edba9ac3
```

This ensured that:

- the physical fire context remained constant;
- the transformed real-fire field remained fixed;
- deployment origin varied while the physical context did not.

A later subgoal may combine deployment-origin and physical-context variation. Subgoal 08 deliberately did not combine those axes.

### 5.2 Bounded deployment-origin variation

The study used three manually chosen deployment origins via the operational override:

```json
{
  "network.base_station_rc": [r, c]
}
```

In the UI, this object is entered directly in the case override field. The outer `overrides` wrapper is not entered manually; the UI constructs that wrapper internally.

The deployment-origin cases were:

```text
origin_near_initial    -> [300, 465]
origin_south_central  -> [650, 725]
origin_east_corridor  -> [350, 1000]
```

These origins were chosen to provide a compact spread across the fixed physical context:

- one origin nearer the initial upper-left fire region;
- one origin in a more south-central deployment geometry;
- one origin farther east along a plausible corridor geometry.

This was sufficient for a bounded deployment-geometry robustness probe.

### 5.3 Usefulness-family impairment structure

The final matrix crossed deployment origin with three usefulness-family impairment conditions:

```text
healthy -> delay_steps = 0, noise_level = 0.0, loss_prob = 0.0
delay   -> delay_steps = 4, noise_level = 0.0, loss_prob = 0.0
noise   -> delay_steps = 0, noise_level = 0.2, loss_prob = 0.0
```

The resulting nine cases were:

```text
origin_near_initial__healthy
origin_near_initial__delay
origin_near_initial__noise
origin_south_central__healthy
origin_south_central__delay
origin_south_central__noise
origin_east_corridor__healthy
origin_east_corridor__delay
origin_east_corridor__noise
```

The fixed policy was:

```text
usefulness_proto
```

This is important: the study is not a policy comparison. It is a geometry-by-impairment robustness probe of the compact usefulness triad.

### 5.4 Seeds and execution window

The final matrix used five seeds:

```text
0,1,2,3,4
```

The execution window was:

```text
execution_window.start_step = 0
execution_window.end_step_exclusive = 150
```

The 150-step window was long enough to expose meaningful TTFD behavior in several cases while remaining compact enough for quick iteration and visual inspection.

The window also exposed an important limitation: several cases did not detect within 150 steps. That missingness is not a failure of the study. It is part of the result, because it shows that TTFD is strongly conditioned by deployment origin and finite-window access.

---

## 6. Final Analysis Batch settings

The final Subgoal 08 matrix used the following settings:

```text
Physical run:        phy-b7edba9ac3
Analysis artifact:   ana-eaf1a8dd3f
Study preset:        Main · Usefulness family comparison
Policy:              usefulness_proto only
Sweep cases:         deployment origin × usefulness-family impairment
Mode:                dynamic
Tie-breaking:        deterministic
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

The final matrix had:

```text
row_count = 45
cases     = 9
seeds     = 5
policy    = usefulness_proto
```

The analysis contract was:

```text
analysis_contract_version = analysis_v2
```

---

## 7. Metrics of interest

Primary metrics:

- `ttfd`
- `mean_entropy_auc`
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
- `coverage_auc`

Audit fields:

- `case`
- `policy`
- `seed`
- `phy_id`
- `base_station_rc`
- `deployment_mode`
- `n_sensors`

The audit fields matter because this subgoal is partly about structural truthfulness. The study must be able to show exactly which deployment geometry produced each row.

---

## 8. Initial smoke-test observations

Before the final matrix, Subgoal 08 used a smaller deployment-origin-only smoke test under a shared moderate impairment setting.

That smoke test established that:

- Analysis Batch could vary deployment origin using `network.base_station_rc` overrides;
- `base_station_rc` appeared in `table.csv` and summary artifacts;
- case labels remained interpretable when entered without quotes;
- TTFD was strongly deployment-origin sensitive;
- mean entropy AUC varied less than TTFD;
- usefulness-state occupancy showed mild-to-moderate origin sensitivity.

One early UI-entry issue accidentally included quotes in a label:

```text
"origin_south_central"
```

That was only a UI-entry issue. The label field should contain raw label text, without quotes.

The smoke test was useful, but it was not the final evidence because it used a shared moderate impairment setting. The final matrix replaced that with an explicit deployment-origin × healthy/delay/noise structure.

---

## 9. Final matrix result

### 9.1 Matrix identity

The closing result is based on:

```text
ana-eaf1a8dd3f
```

The matrix crossed:

```text
3 deployment origins × 3 impairment conditions × 5 seeds = 45 runs
```

with policy fixed to:

```text
usefulness_proto
```

The main interpretation is:

> Under bounded deployment-origin variation, the usefulness triad is not geometry-free, but its impairment-family interpretation remains robust.

### 9.2 Usefulness triad remains highly readable

The strongest finding is that the triad separates clearly by impairment condition across all three deployment origins.

Healthy cases are exploit-dominant:

```text
origin_east_corridor__healthy:   exploit ≈ 1.000
origin_near_initial__healthy:    exploit ≈ 0.980
origin_south_central__healthy:   exploit ≈ 1.000
```

Delay cases are recover-dominant:

```text
origin_east_corridor__delay:     recover ≈ 0.967
origin_near_initial__delay:      recover ≈ 0.967
origin_south_central__delay:     recover ≈ 0.967
```

Noise cases are caution-dominant:

```text
origin_east_corridor__noise:     caution ≈ 0.987
origin_near_initial__noise:      caution ≈ 0.987
origin_south_central__noise:     caution ≈ 0.987
```

This is the central Subgoal 08 result.

Deployment origin does not collapse the usefulness-triad interpretation. The compact usefulness surface remains readable:

- healthy maps to exploit;
- delay maps to recover;
- noise maps to caution.

This is stronger than the earlier smoke-test result. In the moderate shared-impairment smoke test, deployment geometry shifted the caution/recover balance. In the explicit healthy/delay/noise matrix, impairment-family identity dominates the usefulness-state reading.

### 9.3 Trigger behavior supports the state interpretation

Trigger counts support the same reading.

Delay cases produce recover behavior:

```text
usefulness_trigger_recover_hits ≈ 2.0
```

Noise cases produce caution behavior:

```text
usefulness_trigger_caution_hits ≈ 3.0
```

Healthy cases mostly remain exploit-oriented, with the near-initial case showing a small recover fraction and exploit-trigger activity:

```text
origin_near_initial__healthy:
  exploit_frac ≈ 0.980
  recover_frac ≈ 0.020
  usefulness_trigger_recover_hits ≈ 2.0
  usefulness_trigger_exploit_hits ≈ 3.0
```

This small near-initial healthy deviation should be treated as structured sensitivity, not failure. The dominant state remains exploit.

### 9.4 TTFD is strongly geometry-sensitive and often missing

TTFD is the most geometry-sensitive metric in this matrix.

The final matrix had:

```text
ttfd finite rows: 22 / 45
ttfd missing fraction: ≈ 51.1%
```

This means that in more than half the rows, first detection did not occur within the 150-step execution window.

Representative finite TTFD values include:

```text
origin_near_initial__healthy:   mean ttfd = 110.0, n = 5
origin_near_initial__delay:     mean ttfd = 127.0, n = 5
origin_near_initial__noise:     mean ttfd = 70.5,  n = 2
origin_south_central__noise:    mean ttfd = 102.4, n = 5
origin_east_corridor__noise:    mean ttfd = 127.8, n = 5
```

Several healthy and delay cases for south-central and east-corridor origins had no finite TTFD within the 150-step window.

This reinforces a thesis-facing caution:

> TTFD is necessary but insufficient. It is strongly shaped by deployment geometry, access, finite execution windows, and encounter timing. It should not be treated as a standalone proxy for belief quality or usefulness.

### 9.5 Mean entropy AUC is much less geometry-sensitive

Mean entropy AUC varied much less by deployment origin than TTFD.

Approximate impairment-family pattern:

```text
healthy: ≈ 21.1695–21.1721
delay:   ≈ 21.1723–21.1746
noise:   ≈ 21.2487–21.2489
```

The broad ordering is:

```text
healthy ≈ delay < noise
```

Within each impairment condition, deployment-origin differences are small.

This is important because it shows that deployment geometry strongly affects first encounter timing, while the aggregate belief-quality summary is comparatively stable across the bounded origin set.

### 9.6 MDC/usefulness metrics add a different reading

The MDC-style metrics provide a distinct information-health view.

The clearest example is `mdc_violation_rate`:

```text
healthy: ≈ 0.0067
delay:   ≈ 0.0336
noise:   ≈ 0.0067–0.0081
```

Delay produces a higher violation rate even though its mean entropy AUC is close to healthy.

This matters scientifically because it shows that delay can be visible in usefulness and residual structure even when aggregate belief quality remains close to the healthy condition.

The result supports the broader AWSRT distinction among:

- timeliness;
- delivered information;
- belief quality;
- operational usefulness.

### 9.7 Noise is the clearest caution case

Noise cases produce a consistent caution-dominant signature across all three deployment origins:

```text
caution_frac ≈ 0.987
caution_hits ≈ 3.0
mean_entropy_auc ≈ 21.249
```

Noise also raises delivered-information and residual magnitudes relative to healthy and delay:

```text
delivered_info_proxy_mean ≈ 5.30e-05 to 5.33e-05
mdc_residual_mean         ≈ 5.49e-05 to 5.50e-05
```

This supports an important AWSRT reading:

> Noise does not simply remove information. It can preserve or increase apparent informational activity while producing a caution-dominant usefulness state.

That is consistent with the larger thesis claim that delivered information and operationally useful information are not equivalent.

### 9.8 Regime metrics are not interpreted in this subgoal

The final matrix includes regime-centered columns for schema consistency, but regime control was disabled.

Representative regime metrics are zero:

```text
regime_active_transition_count = 0
regime_utilization_mean = 0
regime_effective_eta_mean = 0
regime_effective_move_budget_cells_mean = 0
```

These should not be interpreted as regime-family findings.

For Subgoal 08, the relevant operational surface is the compact usefulness triad, not advisory or active regime management.

---

## 10. Closed interpretation

The closed interpretation is:

> The usefulness-triad reading is not geometry-invariant, but it remains robustly readable under bounded deployment-origin variation.

More specifically:

- deployment origin strongly affects access and TTFD;
- TTFD is frequently missing within the 150-step window, making it a fragile standalone metric;
- mean entropy AUC is much less sensitive to deployment origin than TTFD;
- the usefulness triad remains strongly organized by impairment condition;
- healthy cases are exploit-dominant;
- delay cases are recover-dominant;
- noise cases are caution-dominant;
- MDC residual and violation summaries add information-health structure not captured by TTFD alone;
- regime metrics are present but not meaningful here because regime control is disabled.

The result does not show that deployment geometry is irrelevant. It shows that deployment geometry is an important conditioning factor, especially for access and detection timing, but not one that destroys the compact usefulness-triad interpretation in this bounded test.

A concise thesis-facing statement is:

> Deployment origin affects when and whether fire is first encountered within a finite window, but the compact usefulness triad still separates healthy, delayed, and noisy information-flow conditions in a readable way.

---

## 11. Outcome classification

Subgoal 08 considered three possible outcomes.

### 11.1 Stable usefulness-triad interpretation

If results were similar across deployment origins, then the usefulness-triad interpretation would be deployment-geometry robust for the tested window.

The final matrix partially supports this outcome at the impairment-family level. State identity remains stable across origins.

### 11.2 Mild, interpretable variation

If differences existed but were explainable by access, encounter timing, or finite-window effects, then the results would remain scientifically usable.

The final matrix also supports this outcome. TTFD variation and missingness are substantial, but interpretable. They reflect deployment geometry and finite-window access rather than collapse of the usefulness triad.

### 11.3 Strong sensitivity to deployment origin

If usefulness behavior changed substantially across deployment origins, then deployment geometry would need to be treated as a core experimental axis before making usefulness-family claims.

The final matrix does not support this stronger warning for the compact usefulness triad. It does support treating geometry as a reported conditioning factor, especially for TTFD.

Final classification:

> Mild, interpretable geometry sensitivity with robust usefulness-family readability.

---

## 12. What this subgoal did not do

Subgoal 08 did not:

- introduce full stochastic deployment-origin sampling;
- randomize all starting positions;
- combine all variation axes at once;
- redesign movement or tie-breaking;
- change the usefulness controller;
- create a broad Monte Carlo campaign;
- make an active regime-family claim.

It deliberately remained narrow:

> bounded deployment-geometry variation within the existing Analysis Batch study model.

The question of automatically randomizing base-station assignment remains valid, but it should not be added to this subgoal. A random base-station feature would need to know grid bounds from the selected `phy_id` and use seeded sampling to generate reproducible `network.base_station_rc` values. That may be useful later, but Subgoal 08 closes on the manual bounded-origin path.

---

## 13. Minimal success criteria review

Subgoal 08 is complete if:

1. A bounded multi-deployment-origin study runs successfully.
2. Deployment origin is visible and auditable per row.
3. Usefulness-triad metrics are compared across deployment origins.
4. A clear statement can be made about robustness:
   - stable;
   - mildly sensitive;
   - or strongly sensitive.
5. The study remains compact and interpretable.
6. No controller redesign or broad stochastic campaign is introduced.

Subgoal 08 satisfies these criteria.

The final artifact `ana-eaf1a8dd3f` provides a compact 45-row matrix with deployment origin, impairment condition, seed, policy, physical artifact, and usefulness metrics visible in the analysis output.

The robustness statement is:

> The usefulness triad remains readable under bounded deployment-origin variation. Geometry strongly conditions TTFD and access, but impairment-family state identity remains stable across the tested origins.

---

## 14. Thesis-facing significance

Subgoal 08 strengthens the AWSRT thesis direction because it shows that the platform can expose differences among:

- detection timing;
- information delivery;
- belief-quality summaries;
- usefulness-state behavior;
- deployment geometry.

The study does not collapse these into one metric.

Instead, it shows that:

- TTFD can be strongly geometry-sensitive and missing under finite windows;
- entropy can remain comparatively stable across deployment origins;
- delay can be visible through recover-state occupancy and MDC violation structure;
- noise can preserve informational activity while producing caution-dominant behavior;
- the compact usefulness triad remains interpretable under bounded real-fire deployment variation.

This supports the broader AWSRT claim that delivered information and operational usefulness should be treated as distinct but related scientific objects.

---

## 15. Recommended next step

The most natural next step is not automatic random base-station sampling.

A better follow-on is:

```text
AWSRT v0.5 Subgoal 09: Deterministic versus Stochastic Tie-Breaking Under Bounded Usefulness-Triad Geometry
```

Rationale:

- Subgoal 07 identified deterministic tie-breaking as a structural source of spatial artifact.
- Subgoal 08 showed that bounded deployment-origin variation does not destroy the usefulness-triad interpretation.
- The next disciplined probe is whether deterministic versus stochastic tie-breaking materially changes the same usefulness-family reading.

A consolidation-oriented alternative would be:

```text
AWSRT v0.5 Subgoal 09: Consolidated Interpretation of Usefulness-Triad Robustness Under Real-Fire Structural Variation
```

However, the stronger scientific continuation is the deterministic-versus-stochastic tie-breaking check.

---

## 16. Closeout note

Subgoal 08 closes with a cautious but useful conclusion:

> Deployment geometry matters, especially for access and TTFD, but the compact usefulness triad remains interpretable under bounded deployment-origin variation in the tested transformed real-fire window.

This is not a claim of invariance.

It is a claim of bounded interpretive robustness.

That distinction is important. AWSRT is not showing that geometry can be ignored. It is showing that geometry can be made visible, audited, and separated from the usefulness-family interpretation rather than remaining a hidden confound.

That is scientifically useful and sufficient to close `v0.5-subgoal-08`.
