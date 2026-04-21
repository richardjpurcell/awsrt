# AWSRT v0.5 Subgoal 01a: Designer Truthfulness Pass for the Usefulness Triad

**Status:** Draft implementation-facing companion note  
**Applies to:** `v0.5-subgoal-01`  
**Suggested file:** `docs/design/v0_5_01a_usefulness_triad_designer_truthfulness_pass.md`  
**Purpose:** Record the first bounded implementation step for AWSRT v0.5 Subgoal 01 by improving designer-side truthfulness and visibility for the live compact usefulness layer, without changing controller behavior or expanding the controller surface.

---

## 1. Purpose of this note

This note defines the first implementation-facing pass inside AWSRT v0.5 Subgoal 01.

The governing opening note already established the main question of the v0.5 opening move:

> can the compact usefulness triad become scientifically readable and operationally inspectable on transformed real-fire conditions as its own layer, without being collapsed into the broader regime-managed layer?

Inspection of the current backend, schema, designer, and visualizer suggests that the first weakness is **not** primarily missing controller machinery.

Instead, the first weakness is more modest:

* the live compact usefulness layer already exists,
* the visualizer already exposes much of it,
* but the designer still presents the usefulness line somewhat too much through the richer experimental manifest surface rather than foregrounding the live compact path.

The first bounded v0.5 implementation move should therefore be a **designer truthfulness pass**, not a controller rewrite.

---

## 2. Why this pass is justified

### 2.1 The compact usefulness layer is already live

The current backend already contains a behaviorally active compact usefulness path through `network.policy="usefulness_proto"`.

That path already includes:

* exploit / recover / caution state logic,
* compact trigger conditions,
* state persistence counters,
* summary emission,
* per-step series emission,
* and frontend-readable outputs.

This means AWSRT does not need to invent the usefulness layer before it can inspect it.

### 2.2 The visualizer is already closer to the desired Subgoal 01 reading

The current visualizer already contains:

* a usefulness prototype summary,
* current-frame usefulness state and trigger visibility,
* dedicated usefulness scaffold traces,
* and a clear separation between usefulness, advisory regime, active regime, and deeper mechanism audit.

This means the visualizer is already substantially aligned with the intended v0.5 scientific reading.

### 2.3 The designer is the weaker surface

The designer is already careful in wording, but it still has a structural imbalance:

* when `usefulness_proto` is selected, the usefulness-facing section is still centered on the richer experimental manifest surface,
* while the live compact usefulness layer is described mostly through cautionary text rather than being foregrounded as the main active path.

This is a truthfulness and emphasis issue, not yet a controller-behavior issue.

That is why the first bounded implementation step should target the designer.

---

## 3. Scope of this pass

This pass is intentionally small.

It **is**:

* a designer-side truthfulness and visibility pass,
* a compact foregrounding of the live usefulness layer,
* a small improvement in usefulness-triad summary visibility,
* and a bounded preparation step for the first transformed real-fire usefulness verification slice.

It is **not**:

* a usefulness-controller redesign,
* a threshold retuning pass,
* a richer usefulness-regime wiring effort,
* a schema/backend unification effort,
* or a usefulness/regime merge.

---

## 4. Main file to change

Primary file:

```text
frontend/app/operational/designer/page.tsx
```

No backend changes should be made in this pass unless a very small compatibility adjustment becomes clearly necessary.

---

## 5. What this pass should establish

The designer should make the following reading easier and more truthful:

1. **The live compact usefulness path is real**  
   `network.policy="usefulness_proto"` is the current live usefulness-aware controller path.

2. **The usefulness layer is distinct from the regime layer**  
   The usefulness triad should not read as merely a shadow of advisory/active regime-management semantics.

3. **The richer usefulness manifest surface is still experimental**  
   It may remain visible, but it should not appear to be the primary operational truth of the current system.

4. **Single-run usefulness inspection should become easier**  
   A user running a single `usefulness_proto` run from the designer should be able to see a compact summary of exploit / recover / caution behavior without needing to go straight to the visualizer.

---

## 6. Recommended bounded changes

### 6.1 Reframe the usefulness section so the live compact layer is foregrounded

The usefulness section should no longer lead primarily with the experimental manifest-surface framing.

Instead, it should foreground the live reading first.

Preferred reading order:

1. live compact usefulness path,
2. compact exploit / recover / caution interpretation,
3. experimental richer manifest alignment surface below.

This can likely be done through:

* a section-title revision,
* a short status summary at the top of the section,
* and slightly reduced visual emphasis on the experimental controls.

A possible high-level title direction would be:

* **Compact usefulness layer**
* or
* **Live usefulness triad**
* or
* **Usefulness triad (live compact path)**

The exact wording can remain modest, but the live compact path should come first.

### 6.2 Add usefulness summary fields to the designer run-summary type

The backend already emits useful compact usefulness summary fields.

These should be added to `RunSummaryRes` in the designer:

* `usefulness_proto_enabled`
* `usefulness_regime_state_last`
* `usefulness_regime_state_exploit_frac`
* `usefulness_regime_state_recover_frac`
* `usefulness_regime_state_caution_frac`
* `usefulness_trigger_recover_hits`
* `usefulness_trigger_caution_hits`
* `usefulness_trigger_recover_from_caution_hits`
* `usefulness_trigger_exploit_hits`

These are already emitted by the backend summary path and therefore do not require new controller work.

### 6.3 Add a compact usefulness-triad summary block to the designer run summary

A new small block should be added to the existing run-summary area.

It should appear when usefulness summary data is available.

The block should include:

* whether `usefulness_proto` was enabled,
* the last usefulness state,
* exploit / recover / caution occupancy fractions,
* and the compact trigger hit counts.

This makes single-run usefulness inspection possible directly from the designer while staying bounded.

### 6.4 Keep the experimental manifest controls visible but explicitly secondary

The richer usefulness manifest controls do not need to be removed.

However, they should be read as:

* alignment-oriented,
* experimental,
* partially wired,
* and not yet the main authoritative control surface.

This is already partly true in the current wording, but the structural emphasis should better match that wording.

---

## 7. What should not change in this pass

The following should remain unchanged in this step unless a very small compatibility issue appears:

### 7.1 No controller logic changes

Do not change:

* usefulness trigger semantics,
* persistence values,
* exploit / recover / caution mapping,
* or backend usefulness thresholds.

### 7.2 No richer usefulness-regime wiring effort

Do not begin wiring the richer `usefulness_regime` manifest block into the live controller path in this pass.

That would turn a bounded truthfulness pass into a broader controller-surface project.

### 7.3 No usefulness/regime unification attempt

Do not attempt to unify:

* compact usefulness semantics,
* advisory regime semantics,
* and active realized regime semantics

into one bigger controller surface here.

Subgoal 01 should remain explicitly layered.

---

## 8. Expected result of this pass

If this pass succeeds, the designer should more clearly communicate the following:

* the compact usefulness triad is the live usefulness-facing path,
* the usefulness layer is distinct from the broader regime-management layer,
* the richer usefulness manifest controls are still experimental,
* and a single-run usefulness inspection can begin directly from the designer without pretending that the richer manifest controls are already the full authoritative controller API.

That is sufficient for the first bounded transformed real-fire usefulness slice.

---

## 9. Next step after this pass

After the designer truthfulness pass, the next step should be:

* run one bounded transformed real-fire usefulness verification slice,
* using a small curated window bundle,
* with a healthy / low-impairment condition,
* a delay-heavy condition,
* and a noise-heavy condition.

The purpose of that first slice is to ask:

* does exploit remain the healthy-usefulness reading?
* does recover remain the stale-but-restorable reading?
* does caution remain the corruption-like or strongly compromised reading?
* and are those readings inspectable enough with the current live outputs?

Only after that slice should AWSRT decide whether a further backend usefulness-audit enrichment pass is needed.

---

## 10. Decision boundary after this pass

After this designer pass and the first bounded real-fire slice, AWSRT should decide among three possibilities:

1. **The current compact usefulness layer is readable enough to proceed directly**  
   Continue into a deeper v0.5 usefulness-triad phase.

2. **The compact usefulness layer is promising but still too compressed diagnostically**  
   Add a small backend audit-enrichment pass for usefulness trigger-reason visibility.

3. **The compact usefulness layer remains too unclear even after the truthfulness pass**  
   Reassess whether one more bounded clarification step is needed before a larger usefulness-focused phase.

At this stage, the most likely outcome is still the first or second, not a broad redesign.
