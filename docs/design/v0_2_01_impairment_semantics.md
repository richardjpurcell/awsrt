# AWSRT v0.2 Impairment and Usefulness Semantics
**Status:** Draft  
**Branch:** `v0.2-dev`  
**Purpose:** Establish a compact internal vocabulary for observation impairments and usefulness in AWSRT so that schemas, manifests, diagnostics, and later regime logic use the same meanings.

---

## 1. Scope

This note defines the minimal impairment and usefulness semantics needed for AWSRT `v0.2`. Its purpose is not to build a full theory of communication or sensing failure. Instead, it provides a small, explicit vocabulary for describing what can go wrong with observations and how those failures relate to belief improvement.

The definitions here are intended to support:

- experiment manifest clarity,
- consistent schema design,
- interpretable diagnostic metrics,
- later usefulness-aware regime logic.

This note applies to the simulation and experiment layer of AWSRT. It does not yet introduce detailed network realism, queueing models, or hidden-cause inference.

This note is written primarily for AWSRT `v0.2` closed-loop operational runs. Other layers, especially the epistemic layer, may currently use related but non-identical impairment parameterizations (for example bounded stochastic delay models). Those are not unified by this note and should be treated as separate modeling choices unless explicitly harmonized in a later revision.

---

## 2. Design goals

AWSRT `v0.2` should be able to distinguish:

1. whether an observation was delayed,
2. whether an observation was corrupted,
3. whether an observation was lost,
4. and whether continuing observation activity is still producing meaningful belief improvement.

The first three are **impairment classes**. The fourth is a **usefulness state**, not an impairment class.

This distinction is central to AWSRT's information-centric framing: information can continue to arrive even when its operational usefulness has degraded.

---

## 3. Observation pipeline

For semantic clarity, AWSRT distinguishes four conceptual layers in the observation pipeline.

### 3.1 Latent world state
The true wildfire or environment state at timestep `t`.

Examples:
- true fire occupancy,
- true burn status,
- true environmental conditions.

This layer is the reference truth. It is not itself impaired.

### 3.2 Generated observation
The observation as produced by the sensing process at its generation time.

This layer represents what is sensed from the world before delivery effects are applied. In AWSRT `v0.2`, content corruption is intended to enter at or before this stage.

### 3.3 Delivered observation
The observation that actually reaches the controller.

This layer reflects delivery effects such as delay and loss. A delivered observation may have nonzero age by the time it reaches the controller.

### 3.4 Controller use and belief effect
The effect of delivered observations on controller belief.

This layer concerns whether delivered observations produce meaningful belief improvement in context. This is where usefulness and usefulness degradation are interpreted.

---

## 4. Minimal impairment vocabulary

AWSRT `v0.2` uses the following impairment classes.

### 4.1 Staleness
An observation is **stale** when its content may still be correct relative to the state at its generation time, but its age at delivery reduces its ability to improve current belief effectively.

Key idea:
- the main issue is timing, not content correctness at generation.

Interpretation:
- a stale observation may be historically correct but operationally weak for the current state.

### 4.2 Corruption
An observation is **corrupted** when its delivered content deviates from the underlying state it is intended to represent, due to sensing or transmission distortion.

Key idea:
- the main issue is content quality, not age.

Interpretation:
- a corrupted observation can arrive on time and still be misleading.

### 4.3 Loss
An observation is **lost** when an observation opportunity exists, but no usable observation reaches the controller.

Key idea:
- no usable delivered content is available.

Interpretation:
- loss is absence of delivered observation, not merely degraded quality.

---

## 5. Usefulness vocabulary

Usefulness is not itself an impairment class. It is the relationship between continuing observation activity and resulting belief improvement.

### 5.1 Usefulness
Observation activity is **useful** when delivered observations continue to produce meaningful belief improvement relative to current uncertainty and operational needs.

### 5.2 Usefulness degradation
**Usefulness degradation** occurs when observations continue to arrive or sensing effort continues, but belief quality fails to improve at the expected rate, or improves too weakly to matter operationally.

Interpretation:
- this is the operational form of the wedge observed in AWSRT `v0.1`,
- namely, continued information activity without corresponding epistemic benefit.

---

## 6. Impairments versus usefulness

AWSRT explicitly separates:

- **impairment classes**: staleness, corruption, loss
- **usefulness state**: useful, weakly useful, degraded, inactive/no-input

This separation is important because:
- impairments describe possible causes or mechanisms,
- usefulness describes the belief-side consequence.

For example, a run may show usefulness degradation under delay or noise, but the degradation itself is not the same thing as delay or noise.

---

## 7. v0.2 impairment taxonomy

For `v0.2`, AWSRT uses a deliberately small impairment taxonomy.

### 7.1 Timing impairment
Primary parameter:
- `delay_steps`

Derived quantities may include:
- observation age at delivery,
- age summaries over recent windows.

### 7.2 Content impairment
Primary parameter:
- `noise_level`

Derived quantities may include:
- corruption indicators,
- corruption strength summaries if modeled.

### 7.3 Delivery impairment
Primary parameter:
- `loss_prob`

Derived quantities may include:
- delivery rate,
- loss fraction,
- non-arrival summaries over recent windows.

### 7.4 Canonical parameter names

For `v0.2`, the preferred top-level impairment parameter names are:

- `delay_steps`
- `noise_level`
- `loss_prob`

These names should be used consistently across schemas, manifests, exports, and analysis code unless a future schema refactor explicitly replaces them.

This small taxonomy is sufficient for `v0.2`. More detailed network or channel realism is out of scope for this stage.

---

## 8. Controller-visible versus audit-only information

AWSRT `v0.2` distinguishes between information that may reasonably be available online to the controller and information reserved for audit or analysis.

### 8.1 Controller-visible candidates
Reasonable online quantities include:
- delivered observation timestamp,
- observation age or lateness,
- whether an expected observation did not arrive,
- recent arrival rate,
- declared confidence or reliability metadata if explicitly modeled.

These are plausible online signals for later usefulness-aware control logic.

### 8.2 Audit-only quantities
The following should remain hidden from the controller unless explicitly justified by the experiment design:
- privileged ground-truth corruption labels,
- direct latent-state mismatch labels,
- hidden causal tags not inferable from delivered observations,
- counterfactual usefulness quantities.

This preserves the distinction between realistic control inputs and privileged analysis information.

---

## 9. Schema and manifest implications

At minimum, AWSRT schemas and manifests should distinguish among:

These distinctions separate what was configured, what actually happened during a run, and what is later summarized for analysis.

### 9.1 Configured impairment parameters
These record what the experiment requested.

Examples:
- `delay_steps`
- `noise_level`
- `loss_prob`

### 9.2 Delivered-observation metadata
These record what happened during the run.

Examples:
- `generated_at_step`
- `delivered_at_step`
- `observation_age`
- `delivered_bool`
- `loss_event_bool`
- `corruption_applied_bool`

### 9.3 Audit summaries
These record aggregate run behavior.

Examples:
- mean observation age,
- age quantiles,
- fraction lost,
- fraction corrupted,
- delivery rate.

Later `v0.2` diagnostics may add usefulness and wedge summaries on top of these fields.

---

## 10. Implementation guidance

The following design expectations apply to `v0.2`:

1. **Delay** should be modeled as delivery lag after observation generation.
2. **Noise** should be modeled as content corruption, not generic downstream randomness.
3. **Loss** should be modeled as absence of delivered observation.
4. Impairment handling should live in the simulation or observation pipeline, not inside policy logic except where explicitly documented.
5. Policies should consume delivered observations and controller-visible metadata, not privileged ground-truth impairment labels.

---

## 11. Non-goals for v0.2

The following are intentionally out of scope for this stage:

- a large ontology of impairment subtypes,
- detailed communication-network realism,
- queueing or topology models,
- partial-packet or reordering models,
- hidden-cause inference,
- a full formal theory of usefulness.

AWSRT `v0.2` only needs a minimal semantic layer sufficient to support diagnostics and first-generation usefulness-aware regime logic.

---

## 12. Success condition for this spec

This semantic layer is considered successful if:

- manifests record delay, noise, and loss as distinct causes,
- schemas cleanly distinguish configured impairments from delivered-observation metadata,
- simulation code applies impairments at conceptually appropriate stages,
- controller-visible versus audit-only information is explicit,
- and later diagnostic metrics can refer to these terms without ambiguity.


---

## 13. Short summary

AWSRT `v0.2` treats **staleness**, **corruption**, and **loss** as distinct impairment classes and treats **usefulness degradation** as a separate belief-side consequence. This distinction supports impairment-aware diagnostics and later usefulness-aware control while keeping the `v0.2` scope compact and scientifically interpretable.