# AWSRT v0.5 Subgoal 09: Deterministic versus Stochastic Tie-Breaking Under Bounded Usefulness-Triad Geometry

**Status:** Closed / freeze-ready design note  
**Applies to:** `v0.5-subgoal-09`  
**Purpose:** Test whether the deterministic movement tie-breaking artifact identified in Subgoal 07 materially affects the usefulness-triad interpretation established under bounded deployment-geometry variation in Subgoal 08.

---

## 1. Purpose of this note

This note records the design, execution, and closeout interpretation for AWSRT v0.5 Subgoal 09.

Subgoal 07 clarified that deterministic tie-breaking can introduce a non-neutral spatial artifact under tied movement-score conditions. In particular, deterministic behavior appeared to favor movement toward lower row indices and lower column indices when candidate movements were otherwise tied or nearly tied.

Subgoal 08 then tested whether the usefulness-triad interpretation remained readable under bounded variation in deployment geometry. That subgoal used three manually selected deployment origins on a fixed transformed real-fire physical artifact and concluded that deployment geometry matters, especially for TTFD, but does not destroy the usefulness-triad reading.

Subgoal 09 asked the narrower follow-on question:

> Does deterministic tie-breaking materially affect the usefulness-triad interpretation under the same bounded deployment-geometry conditions?

The result is a robustness finding rather than a redesign finding:

> Stochastic tie-breaking does not overturn the dominant usefulness-triad mapping, but it does materially affect secondary behavior, especially TTFD availability/timing and the internal balance among exploit, recover, and caution.

This subgoal therefore closes as a structure-facing robustness probe. It is not a controller redesign, not an optimization exercise, and not a broad stochastic campaign.

---

## 2. Scientific intent

The scientific intent remains aligned with the core AWSRT thesis direction:

> Does the distinction between delivered information and operational usefulness survive contact with more realistic conditions?

Subgoal 08 tested that question against bounded deployment-origin variation.

Subgoal 09 tested it against tie-breaking semantics.

The concern was not merely technical. If deterministic tie-breaking systematically shaped deployment paths, then some observed usefulness behavior might have been partly an artifact of implementation structure rather than a response to information-health conditions.

The scientific question was therefore:

> Are exploit/recover/caution readings stable enough when deterministic tie-breaking is replaced with stochastic tie-breaking?

The closeout answer is:

> Yes, at the level of dominant usefulness-state interpretation. No, if one expects exact invariance in TTFD, movement behavior, belief-quality summaries, or state-occupancy balance.

This matters because AWSRT is increasingly being used to interpret differences among:

- detection timing;
- delivered information;
- belief-quality summaries;
- usefulness-state behavior;
- and structural deployment conditions.

Subgoal 09 strengthens that interpretation by showing that these categories remain separable.

---

## 3. Background from Subgoals 07 and 08

### 3.1 Subgoal 07 result

Subgoal 07 showed that deterministic movement behavior is not necessarily spatially neutral.

When movement-score ties occur, deterministic selection can create an ordering artifact. Visually, this appeared as a tendency for deployments to favor up-left movement under some conditions.

That observation did not invalidate prior results, but it made the movement-selection structure scientifically relevant.

The important Subgoal 07 lesson was:

> Deployment behavior is not only a function of policy scoring; it is also conditioned by tie-breaking semantics.

### 3.2 Subgoal 08 result

Subgoal 08 introduced bounded deployment-origin variation using `network.base_station_rc`.

The final stronger matrix used:

- fixed physical artifact: `phy-b7edba9ac3`;
- three deployment origins:
  - `origin_near_initial` -> `[300, 465]`;
  - `origin_south_central` -> `[650, 725]`;
  - `origin_east_corridor` -> `[350, 1000]`;
- three usefulness-family conditions:
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

The central interpretation was:

> Deployment origin strongly conditions access and TTFD, but the usefulness-triad reading remains robustly interpretable. Healthy cases are exploit-dominant, delay cases are recover-dominant, and noise cases are caution-dominant across the tested deployment origins.

Subgoal 09 reused this shape as closely as possible and added tie-breaking mode as the only new experimental axis.

---

## 4. Core question

Subgoal 09 centered on one precise question:

> Under bounded deployment-origin and usefulness-family variation, does stochastic tie-breaking produce the same qualitative usefulness-triad interpretation as deterministic tie-breaking?

The key comparison was not whether every metric value remained identical.

The key comparison was whether the scientific reading changed.

Specifically:

- Does healthy remain exploit-dominant?
- Does delay remain recover-dominant?
- Does noise remain caution-dominant?
- Does TTFD remain structurally sensitive?
- Do MDC/usefulness metrics still separate impairment-family behavior?
- Does tie-breaking affect secondary behavior without overturning the usefulness-family conclusion?

The final answer is:

> The impairment-to-state mapping survives. Tie-breaking affects secondary behavior, but not the dominant usefulness-triad interpretation.

---

## 5. Subgoal framing

This subgoal should be understood as:

- a bounded robustness check;
- a continuation of Subgoals 07 and 08;
- a structure-aware interpretation test;
- a comparison of tie-breaking semantics;
- a compact Analysis Batch study.

It should not be treated as:

- a movement-policy redesign;
- a broad randomization study;
- a new controller family;
- a new stochastic deployment-origin generator;
- a search for the best tie-breaking mode.

The goal was not to prove that stochastic tie-breaking is better.

The goal was to determine whether deterministic tie-breaking materially changes the usefulness-triad interpretation.

The closeout result is best described as:

> robust-but-not-neutral.

Tie-breaking semantics are visible in the metrics, but they do not dominate the qualitative usefulness-triad reading.

---

## 6. Study design

### 6.1 Fixed physical context

The study used the same transformed real-fire artifact as Subgoal 08:

```text
phy-b7edba9ac3
```

This kept the physical context constant and made the comparison directly interpretable against the Subgoal 08 result.

### 6.2 Deployment origins

The study reused the same three deployment origins from Subgoal 08:

```text
origin_near_initial    -> [300, 465]
origin_south_central  -> [650, 725]
origin_east_corridor  -> [350, 1000]
```

These origins were already documented and interpreted. Reusing them avoided introducing a new geometry axis.

### 6.3 Usefulness-family conditions

The study reused the same three impairment-family cases from the final Subgoal 08 matrix.

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

These cases had produced a clean usefulness-triad separation in Subgoal 08:

```text
healthy -> exploit
delay   -> recover
noise   -> caution
```

Subgoal 09 tested whether that separation survived a change in tie-breaking semantics.

### 6.4 Tie-breaking comparison

The primary comparison was:

```text
tie_breaking = deterministic
tie_breaking = stochastic
```

Cases explicitly set tie-breaking mode using `network.tie_breaking` in the case overrides.

For deterministic cases:

```json
{
  "network.tie_breaking": "deterministic"
}
```

For stochastic cases:

```json
{
  "network.tie_breaking": "stochastic"
}
```

Explicit per-case values were preferred for auditability.

### 6.5 Matrix shape

The final matrix was:

```text
3 origins × 3 impairment conditions × 2 tie-breaking modes × 5 seeds
```

This produced:

```text
3 × 3 × 2 × 5 = 90 runs
```

The final analysis artifact was:

```text
ana-7583d20635
```

The extraction summary confirmed:

```text
Rows:          90
Grouped cases: 18
Seeds:         0,1,2,3,4
```

### 6.6 Execution window

The study used the same execution window as Subgoal 08:

```text
execution_window.start_step = 0
execution_window.end_step_exclusive = 150
```

This preserved comparability.

The 150-step window remained scientifically useful because Subgoal 08 had already shown that missing TTFD is itself meaningful under bounded transformed real-fire windows.

### 6.7 Policy

The study used:

```text
network.policy = usefulness_proto
```

No other policies were introduced.

The objective was to test compact usefulness-triad behavior under tie-breaking variation, not to compare policy families.

---

## 7. Analysis Batch settings used

The final study used the following structure:

```text
Physical run:        phy-b7edba9ac3
Study preset:        Main · Usefulness family comparison
Policy:              usefulness_proto only
Sweep cases:         origin × impairment family × tie-breaking mode
Mode:                dynamic
Tie-breaking:        explicit per case
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

Because tie-breaking was the axis under test, it was made auditable through explicit case labels and sweep overrides.

The case labels encoded the tie-breaking mode using:

```text
__det
__stoch
```

This made the exported analysis easy to group by origin, impairment condition, and tie-breaking mode.

---

## 8. Case labels used

The final matrix used the following case-label structure:

```text
origin_label__condition_label__tie_label
```

The full set of labels was:

```text
origin_near_initial__healthy__det
origin_near_initial__healthy__stoch
origin_near_initial__delay__det
origin_near_initial__delay__stoch
origin_near_initial__noise__det
origin_near_initial__noise__stoch

origin_south_central__healthy__det
origin_south_central__healthy__stoch
origin_south_central__delay__det
origin_south_central__delay__stoch
origin_south_central__noise__det
origin_south_central__noise__stoch

origin_east_corridor__healthy__det
origin_east_corridor__healthy__stoch
origin_east_corridor__delay__det
origin_east_corridor__delay__stoch
origin_east_corridor__noise__det
origin_east_corridor__noise__stoch
```

This was sufficient for grouping even if `tie_breaking` was not separately emitted as a table column.

---

## 9. Metrics of interest

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

Structural/audit fields:

- `case`
- `policy`
- `seed`
- `opr_id`
- `phy_id`
- `base_station_rc`
- `deployment_mode`
- `n_sensors`
- `delay_steps`
- `noise_level`
- `loss_prob`

---

## 10. Extraction artifacts

The Subgoal 09 extraction script produced the following derived files from:

```text
data/metrics/ana-7583d20635/
```

Key extracted artifacts:

```text
tie_breaking_focused_rows.csv
tie_breaking_summary_by_case.csv
tie_breaking_summary_by_origin_condition_tie.csv
tie_breaking_paired_deltas.csv
tie_breaking_interpretation.md
```

The most important files for interpretation were:

```text
tie_breaking_interpretation.md
tie_breaking_paired_deltas.csv
tie_breaking_summary_by_origin_condition_tie.csv
```

The extraction confirmed the full intended matrix:

```text
Analysis artifact: ana-7583d20635
Rows: 90
Grouped cases: 18
Expected matrix: 3 origins × 3 conditions × 2 tie-breaking modes × 5 seeds = 90 rows
```

---

## 11. Final results: dominant usefulness state

The dominant usefulness-state mapping remained stable across all matched origin × condition groups.

The final result was:

```text
healthy -> exploit-dominant
delay   -> recover-dominant
noise   -> caution-dominant
```

under both:

```text
deterministic tie-breaking
stochastic tie-breaking
```

No dominant usefulness-state changes were detected between deterministic and stochastic tie-breaking within matched origin × condition groups.

This is the central Subgoal 09 finding.

It means that the main usefulness-triad interpretation from Subgoal 08 is not an artifact of deterministic tie-breaking.

---

## 12. Final results: tie-breaking was not neutral

Although the dominant state mapping remained stable, stochastic tie-breaking was not behaviorally neutral.

It affected:

- TTFD availability;
- TTFD timing;
- state-occupancy balance;
- mean entropy AUC;
- MDC violation rate;
- movement/path-dependent secondary behavior.

The correct closeout interpretation is therefore not:

> tie-breaking has no effect.

The correct interpretation is:

> tie-breaking does not change the qualitative usefulness-triad interpretation, but it does materially affect secondary behavior.

This distinction is important for thesis-facing interpretation.

---

## 13. TTFD findings

TTFD was one of the most tie-breaking-sensitive outputs.

Under deterministic tie-breaking, several healthy and delay cases had no finite TTFD within the 150-step window:

```text
origin_east_corridor__healthy__det: ttfd n = 0
origin_east_corridor__delay__det:   ttfd n = 0
origin_south_central__healthy__det: ttfd n = 0
origin_south_central__delay__det:   ttfd n = 0
```

Under stochastic tie-breaking, those same origin/condition groups produced finite TTFD values:

```text
origin_east_corridor__healthy__stoch: ttfd n = 4
origin_east_corridor__delay__stoch:   ttfd n = 5
origin_south_central__healthy__stoch: ttfd n = 5
origin_south_central__delay__stoch:   ttfd n = 5
```

This suggests that deterministic tie-breaking can sometimes steer deployment trajectories away from early detection opportunities in the bounded window, while stochastic tie-breaking can open alternative encounter paths.

This does not mean stochastic tie-breaking is universally better. It means TTFD is structurally sensitive to tie-breaking semantics.

This reinforces the broader AWSRT caution:

> TTFD is necessary but insufficient, and it should not be interpreted without structural context.

---

## 14. State-occupancy findings

Dominant states were stable, but state fractions shifted materially in some cases.

Examples:

```text
origin_near_initial__healthy:
  deterministic: exploit ≈ 0.980, recover ≈ 0.020, caution ≈ 0.000
  stochastic:    exploit ≈ 0.541, recover ≈ 0.448, caution ≈ 0.011
```

```text
origin_near_initial__delay:
  deterministic: exploit ≈ 0.033, recover ≈ 0.967, caution ≈ 0.000
  stochastic:    exploit ≈ 0.033, recover ≈ 0.604, caution ≈ 0.363
```

```text
origin_south_central__healthy:
  deterministic: exploit ≈ 1.000, recover ≈ 0.000, caution ≈ 0.000
  stochastic:    exploit ≈ 0.656, recover ≈ 0.080, caution ≈ 0.264
```

These shifts show that stochastic tie-breaking can expose more varied operational paths and more mixed usefulness-state occupancy while preserving the dominant interpretation.

The result is therefore:

> dominant-state robustness with within-state-balance sensitivity.

---

## 15. Entropy and MDC findings

Mean entropy AUC did not overturn the usefulness interpretation, but stochastic tie-breaking often increased entropy slightly or moderately.

Largest stochastic-minus-deterministic increases included:

```text
origin_near_initial__delay:   +0.0260
origin_near_initial__healthy: +0.0217
origin_south_central__delay:  +0.0154
```

This is scientifically useful because stochastic tie-breaking sometimes improved TTFD availability while not necessarily improving aggregate belief quality.

That supports a core AWSRT distinction:

> Better or earlier detection access does not automatically imply better aggregate belief quality.

MDC violation rate also increased in some stochastic healthy/delay cases, including:

```text
origin_south_central__delay: +0.0349
origin_near_initial__delay:  +0.0201
```

This suggests that stochastic movement can produce more active or varied encounter behavior, while also introducing more usefulness stress in some cases.

Again, the result is not simple superiority of one tie-breaking mode.

The result is structural sensitivity made visible.

---

## 16. Noise condition findings

Noise remained the clearest caution-dominant condition under both tie-breaking modes.

Across origins, deterministic noise cases had caution fractions near:

```text
0.9867
```

Stochastic noise cases remained caution-dominant, with caution fractions near:

```text
0.972 to 0.976
```

This is a strong robustness result.

It indicates that the noise-to-caution relationship is not dependent on deterministic tie-breaking.

This supports the AWSRT reading that noise produces a corruption-like information-health condition in which apparent information flow may persist, but operational usefulness becomes caution-dominant.

---

## 17. Regime metrics caution

Regime metrics may appear in the analysis output for schema consistency.

For this subgoal, regime control remained disabled.

Therefore, regime-centered metrics such as:

- `regime_active_transition_count`;
- `regime_utilization_mean`;
- `regime_effective_eta_mean`;
- `regime_effective_move_budget_cells_mean`;

should not be interpreted as active control evidence.

The operational surface under test was the compact usefulness triad.

The distinction remains:

```text
usefulness_proto behavior: interpreted
regime-family behavior: not active in this subgoal
```

---

## 18. Interpretation criteria and closeout result

### 18.1 Robust usefulness-triad interpretation

The most important criterion was:

```text
healthy remains exploit-dominant
delay remains recover-dominant
noise remains caution-dominant
```

under both deterministic and stochastic tie-breaking.

This criterion was satisfied.

### 18.2 Mild-to-material tie-breaking sensitivity

The secondary criterion was whether tie-breaking affected TTFD, coverage, information metrics, or state fractions.

This criterion was also satisfied.

Tie-breaking was clearly visible in:

- finite TTFD counts;
- TTFD timing;
- exploit/recover/caution fractions;
- mean entropy AUC deltas;
- MDC violation-rate deltas.

### 18.3 Strong interpretation-breaking sensitivity

The concerning outcome would have been a change in dominant usefulness-state mapping.

That did not occur.

No matched origin × condition group changed dominant state when moving from deterministic to stochastic tie-breaking.

Therefore, Subgoal 09 does not require a controller redesign or a broad tie-breaking campaign.

---

## 19. Final interpretation

The final Subgoal 09 interpretation is:

> The usefulness-triad interpretation is robust to deterministic-versus-stochastic tie-breaking at the level of dominant impairment-family mapping, but tie-breaking semantics are structurally visible and materially affect secondary behavior.

More specifically:

- healthy remains exploit-dominant under both tie-breaking modes;
- delay remains recover-dominant under both tie-breaking modes;
- noise remains caution-dominant under both tie-breaking modes;
- stochastic tie-breaking changes TTFD availability and timing in several cases;
- stochastic tie-breaking changes state-occupancy balance even when the dominant state is unchanged;
- stochastic tie-breaking may improve encounter availability while worsening or shifting entropy/MDC summaries in some cases;
- tie-breaking should be reported as an experimental condition rather than hidden as an implementation detail.

This result strengthens the AWSRT v0.5 line because it shows that structural movement semantics matter, but do not collapse the central usefulness-triad interpretation.

---

## 20. Minimal success criteria check

Subgoal 09 is complete if:

1. A bounded deterministic-versus-stochastic tie-breaking study runs successfully.
2. The study uses the fixed physical artifact `phy-b7edba9ac3`.
3. The study reuses the three Subgoal 08 deployment origins.
4. The study includes healthy, delay, and noise usefulness-family cases.
5. Tie-breaking mode is auditable through either a table column or explicit case labels/sweep metadata.
6. Usefulness-triad occupancy is compared across tie-breaking modes.
7. TTFD missingness and finite TTFD values are reported cautiously.
8. A clear interpretation is written:
   - robust;
   - mildly sensitive;
   - or strongly sensitive.
9. No controller redesign or broad stochastic campaign is introduced.

Status against criteria:

```text
1. Complete
2. Complete
3. Complete
4. Complete
5. Complete through case labels and sweep metadata
6. Complete
7. Complete
8. Complete: robust dominant interpretation with material secondary sensitivity
9. Complete
```

Subgoal 09 is therefore freeze-ready.

---

## 21. What this subgoal is not

Subgoal 09 does not claim that stochastic tie-breaking is generally superior.

It does not claim that deterministic tie-breaking is invalid.

It does not redesign movement selection.

It does not introduce stochastic base-station generation.

It does not compare all policy families.

It does not combine physical-context variation with tie-breaking variation.

The subgoal remains deliberately narrow:

> Compare deterministic and stochastic tie-breaking under the bounded deployment-origin/usefulness-family structure already established in Subgoal 08.

The result is structural interpretability, not optimization.

---

## 22. Thesis-facing interpretation

Subgoal 09 contributes to the thesis-facing AWSRT argument by showing that:

- implementation structure can shape operational behavior;
- TTFD is especially sensitive to movement and geometry structure;
- dominant usefulness-state interpretation can remain robust despite secondary structural sensitivity;
- detection timing, belief quality, information usefulness, and movement semantics should not be collapsed into a single metric;
- AWSRT can expose these differences rather than hiding them.

The concise thesis-facing statement is:

> Under bounded transformed real-fire conditions, tie-breaking semantics materially affect trajectories, detection availability, and usefulness-state balance, but they do not overturn the dominant usefulness-triad mapping from impairment condition to operational state.

This is scientifically useful because it shows both robustness and sensitivity in the same study.

---

## 23. Likely next step after Subgoal 09

Because Subgoal 09 produced a robust-but-not-neutral result, the next step should be consolidation rather than expansion.

A likely Subgoal 10 is:

```text
AWSRT v0.5 Subgoal 10: Consolidated Usefulness-Triad Robustness Interpretation for Transformed Real-Fire Windows
```

That subgoal would gather the Subgoal 07-09 line into a thesis-facing interpretation:

- deterministic artifacts are visible;
- deployment geometry matters;
- TTFD is geometry-sensitive;
- usefulness-state behavior remains readable;
- impairment families map cleanly onto exploit/recover/caution;
- tie-breaking affects secondary behavior but not dominant triad mapping;
- structural variation should be reported, not hidden.

A less consolidation-oriented alternative would be a small design-focused note treating tie-breaking semantics as an explicit experimental axis. However, the present evidence does not require another immediate experiment.

---

## 24. Working closeout note

Maintain the v0.5 discipline:

- small study;
- fixed physical artifact;
- bounded origins;
- explicit tie-breaking labels;
- no controller redesign;
- no broad random sampling;
- cautious interpretation.

The purpose was not to remove all structural artifacts.

The purpose was to make structural artifacts visible and determine whether they materially affect the scientific interpretation.

Subgoal 09 shows that they do matter, but not in a way that breaks the usefulness-triad reading.

The appropriate closeout phrase is:

> qualitative interpretation robustness under structurally visible tie-breaking sensitivity.

Subgoal 09 is ready to freeze.
