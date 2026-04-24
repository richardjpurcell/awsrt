# AWSRT v0.5 Subgoal 07: Deterministic Tie-Breaking and Bounded Deployment-Origin Variation

**Status:** Draft design note  
**Applies to:** `v0.5-subgoal-07`  
**Purpose:** Clarify what deterministic tie-breaking is currently doing in bounded usefulness-family transformed real-fire studies, assess whether it is introducing directional bias into deployment behavior, and add a bounded Analysis Batch mechanism for varying **sensor deployment origins** within a single study so that usefulness-family interpretation is less coupled to one fixed deployment geometry.

---

## 1. Purpose of this note

This note defines AWSRT v0.5 Subgoal 07.

Subgoal 06 should now be read as a successful post-TTFD-repair cross-fire revalidation step. The bounded usefulness-family comparison remained scientifically usable after the timing repair, and the repaired studies continued to support a cautious thesis-facing usefulness-family reading.

However, that revalidation also sharpened an important remaining question.

The current bounded studies still rely on a fixed study structure in which:

- tie-breaking is typically deterministic,
- sensor deployment origin is fixed within a study,
- and some observed behaviors may therefore reflect geometric or ordering artifacts rather than only the intended impairment/usefulness semantics.

In particular, there was a concrete empirical suspicion that deterministic tie-breaking may be producing a directional preference that visually looks like deployment motion favoring **up and left** under tied candidate conditions.

That possibility matters because it introduces a new interpretive question:

> How much of the observed bounded usefulness-family behavior is genuinely about impairment and usefulness, and how much may be shaped by deterministic tie-resolution and fixed deployment geometry?

Subgoal 07 therefore does not broaden into a large campaign.  
It does not redesign the usefulness controller.  
It does not invalidate the earlier usefulness-family work.

Instead, it isolates a bounded follow-on question:

> What is deterministic tie-breaking actually doing now, and how should AWSRT support bounded within-study deployment-origin variation so that usefulness-family readings are less hostage to one fixed sensor-origin geometry?

---

## 2. Scientific intent

The scientific intent of this subgoal is to improve the interpretability of bounded usefulness-family results by reducing avoidable structural artifacts.

At this stage, AWSRT is using transformed real-fire bounded studies as a scientific probe of whether the distinction between:

- information delivered,
- and information operationally useful for belief maintenance

remains visible under more realistic conditions.

For that probe to remain disciplined, the study structure itself must be legible.

If deterministic tie-breaking introduces a hidden spatial preference, then some part of the observed deployment pattern may be due to implementation ordering rather than to the intended controller or impairment logic. Likewise, if every bounded study uses one fixed sensor deployment origin, then case readings may be over-coupled to that one geometry.

The purpose here is therefore:

- to make tie-resolution behavior explicit and inspectable,
- to determine whether deterministic tie-breaking is introducing directional bias,
- and to add a bounded deployment-origin variation capability that improves robustness without turning the study into a large stochastic campaign.

This is not a general randomness project.  
It is a bounded interpretability and robustness subgoal.

---

## 3. Subgoal framing

At the current AWSRT stage, this subgoal should be understood as a **study-structure truthfulness and robustness slice**.

The earlier v0.5 work repaired:

- usefulness-family batch structure,
- cross-fire confirmation,
- `TTFD` truthfulness,
- and post-repair revalidation.

Subgoal 07 now turns to a different kind of truthfulness issue:

- whether the study execution structure itself is quietly injecting directional or geometric bias.

This means the subgoal is about:

- **execution semantics**, not controller redesign;
- **bounded robustness**, not broad randomization;
- **study-structure legibility**, not a large experiment campaign;
- **audit-friendly inspection**, not speculative rewriting.

---

## 4. The concrete questions

This subgoal centers on two tightly related questions.

### 4.1 Deterministic tie-breaking question

The first question is:

> What does AWSRT currently mean by deterministic tie-breaking, and how does it actually resolve ties in practice?

This must be answered concretely, not descriptively.

The system should be able to say:

- where tie situations arise,
- how candidate actions or placements are ordered,
- what deterministic rule is applied,
- whether that rule depends on row/column ordering, enumeration order, sorting, or another stable traversal,
- and whether that rule systematically favors a spatial direction such as up/left.

The visual suspicion that deployments appear to favor up and left was strong enough that it needed to be treated as a real diagnosis target rather than a passing impression.

The inspection performed for this subgoal confirms that the effect is real for dynamic greedy-style movement under tied or flat score conditions, but the precise statement is narrower and more careful than “the controller moves up-left.”

The confirmed statement is:

> Dynamic deterministic greedy movement resolves equal local movement scores using row-major first-maximum selection. This creates a stable preference for lower row indices first, and lower column indices second, under tied conditions.

Thus, the main effect is best described as an **upward or upper-fan deterministic tie artifact**, with a possible leftward component depending on candidate geometry and separation constraints.

### 4.2 Deployment-origin variation question

The second question is:

> How can AWSRT create bounded within-study sensor deployment-origin variation without abandoning the compact Analysis Batch study pattern?

At present, a study typically uses one fixed sensor deployment origin and then varies usefulness-family cases and seeds. That is useful for auditability, but it may over-anchor interpretation to one deployment geometry.

The initial phrasing of this subgoal used the word “origin,” which could be confused with fire ignition origin or physical-manifest origin. The implementation inspection clarifies the exact meaning intended here:

> In Subgoal 07, origin variation means **sensor deployment-origin variation**, implemented through case-level overrides of `network.base_station_rc`.

That means the practical target is:

- use Analysis Batch case overrides to vary the operational manifest’s `network.base_station_rc`;
- keep the same selected `phy_id` unless the study intentionally changes physical context;
- ensure both `phy_id` and `base_station_rc` are visible in analysis output for auditability.

The study can then inspect:

- the same usefulness-family logic,
- under multiple deployment-origin contexts,
- while still remaining compact, named, and screenshot-friendly.

---

## 5. Why this matters now

This subgoal is timely for three reasons.

### 5.1 The usefulness-family reading is now mature enough to deserve structure-level scrutiny

Earlier subgoals were about making the usefulness-family study possible and truthful at all. That work is now far enough along that the next likely source of interpretive distortion is no longer a broken metric, but the study scaffold itself.

### 5.2 Deterministic artifacts can masquerade as scientific effects

If deterministic tie-breaking injects a consistent directional preference, then observed deployment differences may partially reflect:

- traversal order,
- action ranking fallback behavior,
- stable coordinate bias,
- shared base-station initialization,
- fixed sensor iteration order,
- or minimum-separation filtering,

rather than just usefulness-state logic.

That does not invalidate earlier results, but it does need to be known and described.

### 5.3 Fixed deployment geometry is a real limitation for bounded transformed real-fire studies

A single sensor deployment origin can interact strongly with:

- fire travel direction,
- terrain or front geometry,
- sensor starting positions,
- and tie-resolution behavior.

A bounded deployment-origin variation capability would not solve all robustness questions, but it is a meaningful step forward while preserving the compact study model.

---

## 6. What this subgoal is not

To keep scope disciplined, Subgoal 07 is **not** the place to do the following:

- redesign the usefulness controller;
- replace deterministic tie-breaking globally with randomness everywhere;
- launch a broad Monte Carlo study over many origins and many fires;
- refactor the physical-run generation pipeline;
- mutate fire ignition origins inside operational batch cases;
- merge this into a full stochastic-controller campaign;
- or reopen the `TTFD` truthfulness repair unless new evidence forces it.

This subgoal should remain narrowly focused on:

1. understanding deterministic tie behavior, and  
2. adding bounded deployment-origin variation support in Analysis Batch through auditable `network.base_station_rc` variation.

---

## 7. Deterministic tie-breaking: intended work and confirmed findings

The first implementation track is diagnostic and explanatory.

### 7.1 Trace where ties occur

Inspection identified the relevant deterministic tie-breaking path in the operational code.

The operational schema exposes:

```python
network.tie_breaking: Literal["deterministic", "stochastic"] = "deterministic"
```

The main operational route reads this as:

```python
deterministic = m.network.tie_breaking == "deterministic"
```

and then resolves an effective runtime flag through:

```python
deterministic_eff = _resolve_active_tie_breaking(...)
```

That flag is passed into deployment helpers including:

- `backend/awsrt_core/operational/policies.py::topk_with_separation`
- `backend/awsrt_core/operational/sensors.py::move_sensors_greedy`
- `backend/awsrt_core/operational/sensors.py::_move_sensors_greedy_masked`
- `backend/awsrt_core/operational/policies.py::move_sensors_mdc`
- `backend/awsrt_core/operational/policies.py::move_sensors_mdc_limited`

The most important confirmed path for the observed visual effect is dynamic greedy movement.

### 7.2 Trace how deterministic mode resolves ties

For dynamic greedy movement, the decisive line is:

```python
idx = np.unravel_index(int(np.nanargmax(window)), window.shape)
```

The movement window is constructed from smaller row to larger row and smaller column to larger column. Therefore, when local score values are tied, `np.nanargmax` returns the first maximum in row-major order.

In grid terms, deterministic tied movement prefers:

1. lower row index first, visually upward;
2. then lower column index within the same row, visually leftward.

This confirms that deterministic dynamic greedy movement is not spatially neutral under tied score conditions.

### 7.3 Confirm visually and numerically

A minimal flat-field test confirmed the behavior.

With one sensor initialized at `(4, 4)` on a flat score field:

```text
R=1 -> (3,4)
R=2 -> (2,4)
R=3 -> (1,4)
```

This confirms a strong upward deterministic tie effect.

A multi-sensor flat-field test with four sensors initialized at the same base station, movement radius `3`, and minimum separation `2` produced:

```text
[[2,5],
 [3,3],
 [3,7],
 [4,5]]
```

This reflects the combined effect of:

- fixed sensor index order,
- shared base-station initialization,
- row-major first-maximum tie resolution,
- and minimum-separation filtering against already chosen sensors.

The resulting deployment can visually resemble an upper or upper-left fan, even though there is no explicit controller instruction to move up-left.

### 7.4 Static placement is different

Static placement uses:

```python
flat_idx = np.argsort(score.reshape(-1))[::-1]
```

For exact full-map ties, this reversed argsort can prefer larger flat indices first. Since flat index is:

```text
flat = row * W + col
```

static exact-tie behavior should not be described as identical to the dynamic greedy up/left effect.

The directional artifact is therefore most clearly confirmed for dynamic greedy-style movement, not for every deployment mode equally.

### 7.5 MDC movement is also distinct

MDC movement uses candidate enumeration and residual-style scoring. For small movement radii, candidates are generated in row-major order by `candidates_within_move`.

Deterministic MDC also adds a tiny coordinate-dependent perturbation:

```python
j = (int(t) * 1000003 + int(i) * 9176 + int(rr) * 127 + int(cc) * 131) % 1000003
rscore = float(rscore) + 1e-12 * float(j)
```

Because lower residual score is preferred, this can also favor smaller row and column indices in tied or near-tied conditions, though the mechanism differs from `np.nanargmax`.

The broad conclusion is therefore:

> deterministic tie-breaking is not direction-neutral under tied conditions, but the exact mechanism differs across helper paths.

### 7.6 Decide whether the issue is explanatory or corrective

The immediate treatment should be explanatory and audit-facing rather than corrective.

The current conclusion is:

> Deterministic dynamic movement resolves tied local deployment scores by row-major first-maximum selection. Combined with fixed sensor index order, shared base-station initialization, and minimum-separation filtering, this can produce stable upward or upper-fan deployment patterns that may visually appear as an up-left bias.

This should be documented as an implementation artifact, not an intended controller behavior.

A later subgoal may decide whether stochastic tie-breaking or a neutral deterministic tie policy is scientifically necessary. Subgoal 07 only needs to make the current behavior explicit and reduce overdependence on one fixed deployment geometry.

---

## 8. Bounded deployment-origin variation: intended work and confirmed direction

The second implementation track adds a narrow but useful study capability.

### 8.1 Goal

The goal is to let Analysis Batch represent multiple sensor deployment-origin contexts inside one study, using the existing case system rather than inventing a new large workflow.

The intended effect is that one `ana-*` study can include a compact set of cases such as:

- deployment origin A × healthy
- deployment origin A × delay
- deployment origin A × noise
- deployment origin B × healthy
- deployment origin B × delay
- deployment origin B × noise

or another similarly bounded structure.

### 8.2 Scope discipline

This should remain bounded.

The target is **not** arbitrary large-scale origin randomization.  
The target is a small, named, case-driven way to vary sensor deployment origin while preserving:

- compact study semantics,
- auditability,
- screenshot-readability,
- and compatibility with the existing usefulness-family study model.

### 8.3 Confirmed implementation direction

The relevant operational field is:

```python
network.base_station_rc
```

Dynamic operational runs initialize all sensors at this base station before policy-driven movement begins. Therefore, bounded deployment-origin variation can be expressed directly through case-level overrides of:

```json
{
  "network.base_station_rc": [300, 465]
}
```

A smoke test confirmed that Analysis Batch can create two deployment-origin cases using the same `phy_id` and different `network.base_station_rc` values:

```text
deploy_origin_current -> (300, 465)
deploy_origin_alt     -> (100, 465)
```

The generated operational manifests confirmed the override:

```text
opr-0b062974b7 [300, 465]
opr-04de01a0c7 [100, 465]
```

A later smoke test confirmed that `base_station_rc` is visible in `table.csv`, for example:

```text
deploy_origin_current -> "(300, 465)"
deploy_origin_alt     -> "(100, 465)"
```

The `phy_id` column remains useful physical-context audit support, but varying `phy_id` is not the primary mechanism for Subgoal 07 deployment-origin variation.

### 8.4 Preserve semantics

If deployment-origin variation is added, the resulting study semantics must remain interpretable.

The system should still be able to tell the user:

- which usefulness-family case each run belongs to,
- which deployment-origin variant it belongs to,
- which physical artifact (`phy_id`) it used,
- and whether the study is primarily varying impairment, deployment origin, or both.

The practical audit requirement is that both `phy_id` and `base_station_rc` appear per row in the analysis table. Without `base_station_rc`, a deployment-origin study would not be sufficiently auditable from `table.csv`.

This has now been implemented by exposing:

```python
phy_id
base_station_rc
```

in Analysis Batch rows.

### 8.5 Random deployment-origin sampling is a possible follow-on

It would be possible to add bounded random sampling of deployment origins in a future subgoal. Such a mechanism would need to:

- read grid bounds from the selected physical artifact;
- optionally respect a margin from grid edges;
- use an explicit origin-sampling seed;
- record every sampled `base_station_rc` in `table.csv`;
- and avoid conflating sampled deployment-origin variation with controller stochasticity.

Subgoal 07 intentionally does **not** require this. Fixed named deployment origins are more thesis-safe, easier to audit, and sufficient for the current structural truthfulness goal.

---

## 9. Concrete implementation order

The work proceeded in a disciplined sequence.

### 9.1 First: deterministic diagnosis

This has been done at the code-path level.

The confirmed diagnosis is:

- dynamic greedy movement uses `np.nanargmax(window)`;
- tied values are resolved by row-major first maximum;
- this favors lower row first and lower column second;
- multi-sensor shared-origin deployments can therefore form stable upper or upper-left-looking patterns under tied conditions.

### 9.2 Second: add physical-context audit support

A minimal backend patch exposed `phy_id` per row in `table.csv`.

This is a small truthfulness patch. It does not change controller behavior and does not change physical generation.

The row addition is:

```python
"phy_id": m2.phy_id,
```

and `phy_id` is included in the guaranteed CSV columns.

### 9.3 Third: add deployment-origin audit support

A second minimal backend patch exposed `base_station_rc` per row in `table.csv`.

The row extraction uses the operational manifest’s network configuration:

```python
if "base_station_rc" in net:
    row["base_station_rc"] = net.get("base_station_rc")
```

and `base_station_rc` is included in the guaranteed CSV columns.

### 9.4 Fourth: test case-level `network.base_station_rc` override

A compact smoke study confirmed that case-level overrides of `network.base_station_rc` work.

The tested cases were:

```json
[
  {
    "label": "deploy_origin_current",
    "overrides": {
      "network.base_station_rc": [300, 465]
    }
  },
  {
    "label": "deploy_origin_alt",
    "overrides": {
      "network.base_station_rc": [100, 465]
    }
  }
]
```

The resulting study produced separate cases, preserved the same physical artifact, and exposed the deployment origin in `table.csv`.

### 9.5 Fifth: defer frontend preset unless needed

A frontend preset may be useful later, but it is not required for Subgoal 07 completion.

The backend and case-override path is already sufficient to support bounded deployment-origin variation.

---

## 10. Expected evidence

By the end of this subgoal, the expected evidence should consist of:

- a precise statement of how deterministic tie-breaking currently works;
- a judgment about whether it produces meaningful directional bias;
- Analysis Batch audit support exposing per-row `phy_id`;
- Analysis Batch audit support exposing per-row `base_station_rc`;
- a bounded case-level demonstration of varying deployment origin through `network.base_station_rc`;
- and a compact smoke study showing that the new structure works.

The strongest outcome is:

1. deterministic tie-breaking is traced cleanly;
2. the suspected up-left bias is refined into a truthful row-major upward/upper-fan diagnosis;
3. Analysis Batch can represent bounded multi-deployment-origin usefulness-family studies through case-level `network.base_station_rc` overrides;
4. and the resulting study remains compact and scientifically legible.

A weaker but still acceptable outcome would have been:

- deterministic behavior is clarified;
- the audit columns are added;
- and the design path for deployment-origin variation is made concrete,
- even if fuller frontend preset support requires a follow-on patch.

---

## 11. Minimal success criteria

Subgoal 07 should be considered complete if all of the following are true:

1. The current deterministic tie-breaking behavior is identified precisely in code-path terms.
2. A clear statement can be written that dynamic deterministic movement can introduce upward or upper-fan spatial bias under tied score conditions.
3. Analysis Batch exposes per-row `phy_id` for physical-context auditability.
4. Analysis Batch exposes per-row `base_station_rc` for deployment-origin auditability.
5. A bounded mechanism exists for varying deployment-origin context within one Analysis Batch study through `network.base_station_rc` case overrides.
6. The usefulness-family case semantics remain readable and truthful under the extended study shape.
7. A compact smoke test confirms that the new study structure is usable without broad rework.

---

## 12. Working interpretation of the issue

The earlier suspicion is now partially confirmed.

Deterministic tie-breaking in the current dynamic movement path resolves ties using row-major first-maximum selection. This creates a consistent preference for:

- smaller row indices, visually upward;
- then smaller column indices, visually leftward within a row.

In isolation, the dominant effect is upward. In multi-sensor settings with shared initialization and separation constraints, this can produce visually structured deployments that resemble an upper or upper-left spread.

This is not an intended controller behavior.  
It is a consequence of deterministic enumeration and tie resolution.

The remaining question for AWSRT is therefore not whether the effect exists, but:

> whether this deterministic spatial bias is acceptable as an implementation detail, or whether bounded mitigation or inspection support is required for scientific interpretability.

For Subgoal 07, the appropriate treatment is documentation plus audit support, not controller redesign.

---

## 13. Likely next step after this subgoal

If Subgoal 07 succeeds, the likely next step would be one of two things:

- a bounded usefulness-family robustness note that incorporates multiple fixed deployment-origin variants explicitly; or
- a modest follow-on on stochastic tie-breaking, if deterministic bias turns out to be scientifically consequential enough that a bounded stochastic comparison becomes necessary.

A later deployment-origin sampling feature could also be considered, but only if it remains seed-controlled, grid-aware, and fully auditable.

That later step should still remain cautious.  
The immediate purpose here is first to understand the current deterministic behavior and then to improve bounded deployment-origin robustness in a controlled way.

---

## 14. Working note

This subgoal should be carried out in the same disciplined style as the earlier v0.5 steps:

- small patches,
- path-level diagnosis,
- explicit smoke tests,
- bounded study-shape changes,
- and cautious interpretation.

The main result sought here is not more experimental volume.  
It is improved structural truthfulness: confidence that bounded usefulness-family readings are not being silently over-shaped by deterministic tie-resolution or one fixed sensor deployment geometry.
