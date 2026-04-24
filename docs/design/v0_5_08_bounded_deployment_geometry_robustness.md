# AWSRT v0.5 Subgoal 08: Bounded Deployment-Geometry Robustness of the Usefulness Triad

**Status:** Draft design note  
**Applies to:** `v0.5-subgoal-08`  
**Purpose:** Use the bounded deployment-origin variation capability introduced in Subgoal 07 to test whether the usefulness-triad interpretation remains stable under controlled changes in deployment geometry.

---

## 1. Purpose of this note

This note defines AWSRT v0.5 Subgoal 08.

Subgoal 07 clarified that:

- deterministic tie-breaking can introduce a non-neutral spatial artifact under tied conditions;
- deployment origin, via `network.base_station_rc`, is a structural input to system behavior;
- Analysis Batch can vary deployment origin in a bounded and auditable way;
- `phy_id` and `base_station_rc` are now visible in analysis rows.

This enables a new, tightly scoped scientific question:

> Does the usefulness-triad interpretation remain stable under bounded variation in deployment geometry?

Subgoal 08 uses this capability to perform a controlled robustness probe, not a large experimental expansion.

---

## 2. Scientific intent

The scientific intent remains aligned with the core AWSRT thesis direction:

> Does the distinction between delivered information and operational usefulness survive contact with more realistic conditions?

Subgoal 08 extends this question from impairment variation to deployment-geometry variation.

The key concern is:

> Are usefulness-triad observations genuinely about information flow and belief maintenance, or are they partly shaped by specific deployment-origin geometry?

This subgoal therefore tests whether the triad:

- exploit
- recover
- caution

remains interpretable and stable when deployment geometry is perturbed in a bounded way.

---

## 3. Subgoal framing

This subgoal should be understood as:

- a bounded robustness test, not a new campaign;
- a structure-aware validation, not controller redesign;
- a multi-case extension of existing studies, not a new workflow.

The study shape should remain:

- compact;
- named;
- screenshot-readable;
- compatible with current Analysis Batch;
- aligned with usefulness-family comparison patterns.

---

## 4. Core question

Subgoal 08 centers on one precise question:

> When deployment origin is varied within a bounded study, do usefulness-triad signals remain consistent?

This includes:

- state occupancy fractions:
  - exploit
  - recover
  - caution
- trigger behavior:
  - recover hits
  - caution hits
- headline outcomes:
  - mean entropy AUC
  - coverage AUC
- MDC-aligned metrics:
  - delivered information proxy
  - residual or violation summaries

The goal is not perfect invariance.

The goal is to determine:

- whether variation is small and interpretable; or
- whether usefulness-family conclusions are fragile to deployment geometry.

---

## 5. Study design

### 5.1 Bounded deployment-origin variation

Use Analysis Batch to define a small set of deployment origins via the operational override:

    network.base_station_rc: [r, c]

Example cases:

- center-ish deployment
- left-shifted deployment
- right-shifted deployment
- upper-shifted deployment, optional
- lower-shifted deployment, optional

The number of cases should remain small, ideally 2 to 5.

### 5.2 Fixed physical context initially

To isolate deployment-origin effects, hold `phy_id` fixed within the first study.

This ensures that:

- the physical fire context is constant;
- the transformed real-fire field remains fixed;
- only sensor deployment origin changes.

A later subgoal may combine deployment-origin and physical-context variation, but Subgoal 08 should begin with one fixed physical artifact.

### 5.3 Usefulness-family structure

Retain the current usefulness-family framing.

The expected study shape is one of the following:

1. A deployment-origin-only diagnostic:
   - origin A
   - origin B
   - origin C

2. A deployment-origin by usefulness-family matrix:
   - origin A × healthy
   - origin A × delay
   - origin A × noise
   - origin B × healthy
   - origin B × delay
   - origin B × noise

The second is scientifically stronger but should only be used if it remains compact.

### 5.4 Minimal seeds

Use minimal seeds initially, for example 1 to 3.

The purpose is not stochastic averaging.  
The purpose is to inspect whether deployment geometry changes the qualitative usefulness-triad reading.

---

## 6. Metrics of interest

Primary metrics:

- `mean_entropy_auc`
- `usefulness_regime_state_exploit_frac`
- `usefulness_regime_state_recover_frac`
- `usefulness_regime_state_caution_frac`

Secondary metrics:

- `usefulness_trigger_recover_hits`
- `usefulness_trigger_caution_hits`
- `usefulness_trigger_recover_from_caution_hits`
- `delivered_info_proxy_mean`
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

---

## 7. Expected outcomes

### 7.1 Stable usefulness-triad interpretation

If results are similar across deployment origins, then the usefulness-triad interpretation is deployment-geometry robust for the tested window.

This would strengthen the thesis-facing reading that the triad is responding to information-health structure rather than merely to one fixed geometry.

### 7.2 Mild, interpretable variation

If differences exist but are explainable, for example due to earlier or later access to informative regions, then the results remain scientifically usable.

In this outcome, deployment geometry becomes a secondary factor that should be acknowledged but does not dominate the usefulness-triad interpretation.

### 7.3 Strong sensitivity to deployment origin

If usefulness behavior changes substantially across deployment origins, then the interpretation is geometry-sensitive.

Warning signs include:

- large shifts in exploit/recover/caution occupancy;
- substantially different trigger counts;
- large changes in belief-quality metrics;
- different conclusions about which impairment family is most characteristic.

This would not invalidate AWSRT, but it would indicate that deployment geometry must be treated as a core experimental axis in later studies.

---

## 8. What this subgoal is not

Subgoal 08 should not:

- introduce full stochastic deployment-origin sampling;
- randomize all starting positions;
- combine all variation axes at once;
- redesign movement or tie-breaking;
- change the usefulness controller;
- create a broad Monte Carlo campaign.

It is deliberately narrow:

> bounded deployment-geometry variation within the existing Analysis Batch study model.

---

## 9. Concrete implementation steps

1. Select one physical context, keeping `phy_id` fixed.
2. Define 2 to 4 deployment-origin cases using `network.base_station_rc`.
3. Keep policy selection narrow, likely `usefulness_proto` first.
4. Use minimal seeds.
5. Run a compact Analysis Batch study.
6. Confirm `base_station_rc` appears in `table.csv`.
7. Confirm rows are grouped correctly by case.
8. Compare:
   - usefulness state occupancy;
   - trigger counts;
   - entropy;
   - delivered information proxy;
   - MDC residual or violation metrics.
9. Write a compact interpretation:
   - stable;
   - mildly sensitive;
   - strongly sensitive.

---

## 10. Minimal success criteria

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

---

## 11. Working interpretation

Subgoal 07 showed that execution structure can introduce spatial artifacts.

Subgoal 08 now asks:

> Does that structure materially affect usefulness-triad conclusions?

The expected outcome is that some geometric sensitivity will exist, but that the core usefulness separation should remain visible.

If that holds, it strengthens the claim that:

> AWSRT is probing information-usefulness structure, not merely geometric artifacts.

If it does not hold, that is also scientifically useful: it would show that deployment geometry is a stronger conditioning factor than expected and should be made explicit in later thesis-facing comparisons.

---

## 12. Likely next step

Depending on results, the next subgoal may be one of:

- a bounded deployment-origin by usefulness-family robustness package;
- a small stochastic tie-breaking comparison;
- a controlled study combining deployment-origin and physical-context variation;
- or a documentation-oriented consolidation of v0.5 results.

All of these should remain controlled and interpretable.

---

## 13. Working note

As with prior v0.5 work, maintain:

- small, auditable patches;
- compact study design;
- explicit interpretation;
- disciplined scope.

The goal is not volume.

The goal is confidence that usefulness-triad behavior survives modest structural variation.
