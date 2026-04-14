# Future Direction: Environment Composition Layer

**Status:** Future design note  
**Applies to:** Post-v0.2 / future environment-architecture work  
**Purpose:** Record a possible future architectural direction for AWSRT: reframing the current physical layer as a compositional environment layer so that it is not over-read as a full wildfire simulator.

---

## 1. Purpose of this note

This note records a future architectural observation that emerged during late v0.2 and early v0.3 reflection.

Its purpose is not to authorize immediate refactor work. It is to preserve a design direction that may become important later, especially if the current physical layer continues to be interpreted more literally than intended.

In particular, this note addresses a recurring representational risk:

> the current physical layer can be read by operational or domain-specialist audiences as though AWSRT is claiming to be a full wildfire simulator.

That is not the intended identity of AWSRT. The platform is better understood as an information-centric research system for studying adaptive sensing, belief, uncertainty, operational usefulness, and higher-level control in evolving environments.

The physical layer is therefore important, but its role is instrumental rather than totalizing. It provides dynamic worlds in which sensing and inference can be studied. It is not meant to imply comprehensive or production-grade wildfire physics.

This note records a possible future reframing that would make that identity clearer.

---

## 2. The problem this note is recording

The current layer name and feature surface invite a natural but potentially misleading interpretation.

Because AWSRT visibly includes:

- fire evolution,
- terrain,
- fuels,
- wind,
- weather-like influences,
- and historical replay support,

a reader can reasonably infer that the platform is attempting to function as a wildfire simulator in the stronger physical-science sense.

Once that interpretation is made, omissions or simplifications can be read as deficiencies of realism rather than as deliberate scoping choices. For example, a reader may ask why rain, suppression, moisture, or other climatological and operational influences are not included, and may interpret their absence as evidence that the layer is incomplete on the wrong axis.

That reaction is understandable. It does not necessarily mean the current layer is badly designed. It means the layer may be too easy to over-read.

The underlying issue is therefore not only model scope. It is representational framing.

---

## 3. Why this matters

This matters for three reasons.

### 3.1 It affects how the platform is judged
If the physical layer is read as a full wildfire simulator, AWSRT may be judged against expectations it was not designed to satisfy. That creates confusion about what counts as a success or limitation.

### 3.2 It affects architectural extensibility
As more environmental influences are added over time, the current framing may encourage an ad hoc accumulation of “missing realism features” rather than a more coherent compositional model of environment construction.

### 3.3 It affects scientific honesty
AWSRT is strongest when its layers are explicit, interpretable, and appropriately bounded. A future reframing that better matches the actual scientific purpose of the platform would improve conceptual honesty without requiring immediate new claims.

---

## 4. Proposed future direction

A plausible future direction is to reframe the current physical layer as an **environment composition layer** or **environment dynamics layer**.

Under this interpretation, the layer would no longer be introduced primarily as “the wildfire simulator.” Instead, it would be introduced as the layer that defines the evolving environment in which sensing, belief update, usefulness, and control are studied.

Wildfire would remain an important target process within that environment, but not the sole conceptual anchor of the layer.

This would better align the environment-facing part of AWSRT with the broader architecture of the platform, which is already strongest when it is understood as:

- compositional,
- interpretable,
- explicitly layered,
- and designed for controlled research worlds rather than for overclaimed realism.

---

## 5. Candidate compositional decomposition

One promising decomposition is to build environments from three classes of components.

### 5.1 Dynamic target process
This is the main evolving phenomenon the sensing system is trying to detect, track, or infer.

Examples include:

- wildfire spread,
- hotspot emergence,
- front movement,
- or, in future abstractions, any evolving event field of operational interest.

In the current AWSRT context, wildfire remains the most important target process.

### 5.2 Static structural fields
These are persistent background fields or constraints that shape the environment without changing rapidly during the run.

Examples include:

- terrain,
- fuels,
- land-cover structure,
- barriers or boundaries,
- infrastructure layout,
- access constraints,
- sensor exclusion zones.

These fields define the structural context in which the target process evolves.

### 5.3 Dynamic contextual fields
These are time-varying exogenous influences that modify or interact with the target process and sensing conditions.

Examples include:

- wind,
- temperature,
- humidity,
- precipitation,
- suppression effects,
- smoke or visibility effects,
- other changing environmental or operational modifiers.

Under this decomposition, rain is not a “missing wildfire feature” in a simulator checklist. It becomes one possible contextual field that may or may not be instantiated depending on study purpose.

---

## 6. Scales and composition

A key advantage of this future direction is that it naturally supports explicit scale choices.

Each component could be defined at one or more of the following scales:

- spatial scale,
- temporal scale,
- coupling strength,
- update cadence,
- and observational relevance.

This would encourage environment construction through explicit composition rather than through implicit accumulation.

A user-facing environment builder could eventually allow the user to compose a study world in a way analogous to how cases are composed in the Analysis Batch workflow. For example, a user might specify:

- one target dynamic,
- one or more static structural fields,
- one or more dynamic contextual fields,
- and the spatial/temporal scales at which they interact.

This is not yet a near-term implementation requirement. It is a future architectural direction that would make the environment layer more modular, explicit, and extensible.

---

## 7. Why this reframing is attractive

### 7.1 It reduces misleading expectations
Readers would be less likely to interpret the layer as claiming complete wildfire realism. The platform would instead be understood as generating operationally meaningful dynamic sensing worlds.

### 7.2 It improves extensibility
New environmental influences could be added without changing the conceptual identity of the layer. Rain, suppression, smoke, infrastructure, or human intervention could all be introduced as environment components rather than as ad hoc “realism patches.”

### 7.3 It aligns better with AWSRT’s actual scientific center
AWSRT is primarily about information, uncertainty, usefulness, and control in evolving environments. A compositional environment layer fits that scientific center better than a framing that invites interpretation as a standalone domain simulator.

### 7.4 It supports cleaner future UI and manifest design
A future environment-composition approach could eventually support more explicit manifest surfaces and better user-facing configuration tools for building controlled worlds.

---

## 8. What this note does not imply

This note should be read carefully.

It does **not** imply:

- that the current physical layer is invalid,
- that immediate v0.3 work should be redirected toward a broad environment refactor,
- that AWSRT should abandon wildfire as its central motivating domain,
- or that the platform must become domain-agnostic to be scientifically useful.

It also does **not** mean that future additions such as rain are automatically required. The point is not to enlarge the checklist of omitted variables. The point is to improve the conceptual framing so that future additions, when they occur, fit a coherent architectural model.

This note therefore records a future direction, not an implementation commitment.

---

## 9. Relation to current AWSRT identity

For now, AWSRT may continue to use the current physical-layer language where operationally convenient, especially because wildfire remains the central motivating application.

However, if future design work revisits environment architecture, manifest structure, or user-facing world composition, the following reframing should be considered:

> AWSRT’s environment-facing layer is best understood not as a full wildfire simulator, but as a compositional environment layer built from target dynamics, static structural fields, and dynamic contextual fields at explicit spatial and temporal scales.

This phrasing is closer to the platform’s actual role and avoids unnecessary overclaiming.

---

## 10. Recommended future use of this note

This note should be treated as a future reference point for:

- post-v0.2 roadmap refinement,
- later v0.3 or v0.4 environment-architecture discussions,
- future manifest/schema redesign involving the current physical layer,
- and possible user-facing environment-builder concepts.

It should not be used to justify immediate broad-scope refactoring unless a future subgoal explicitly adopts this direction.

A brief roadmap-style mention elsewhere, if needed, would be:

> Future environment architecture may revisit the current physical layer as a compositional environment layer to reduce over-reading as a full wildfire simulator.

---

## 11. Short summary

This note records a future architectural direction for AWSRT. The current physical layer can be over-read as a full wildfire simulator, especially by operational or domain-specialist audiences. A promising future direction is to reframe that layer as an environment composition layer built from three component classes: a dynamic target process, static structural fields, and dynamic contextual fields. This would reduce misleading expectations, improve extensibility, and better align the environment-facing architecture with AWSRT’s actual scientific purpose as an information-centric research platform for adaptive sensing, uncertainty, usefulness, and control in evolving worlds. The note is intentionally non-binding: it preserves the idea for future design work without making it an immediate implementation requirement.