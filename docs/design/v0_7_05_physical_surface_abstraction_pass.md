# AWSRT v0.7 Subgoal 05: Physical Surface Abstraction Pass

## Status

Draft design note.

## Branch

`v0.7-subgoal-05`

## Purpose

Continue aligning the AWSRT Physical Surface with the current thesis, journal-paper, and v0.7 shareable-tool framing.

Subgoal 02 updated the visible frontend around the four-surface vocabulary. Subgoal 03 updated repository-facing documentation. Subgoal 04 improved UI maturity feedback. Subgoal 05 now focuses specifically on the Physical Surface: reducing misleading literal physical-simulation language while preserving the existing backend/schema compatibility needed by current experiments and historical artifacts.

The goal is not to remove concrete implementation concepts such as wind, terrain, fuels, temperature, or humidity from the codebase. The goal is to make the user-facing interpretation clearer: these are structured environmental fields or field modifiers used as wildfire-like experimental variables, not claims of high-fidelity physical wildfire prediction.

## Context

Earlier AWSRT language sometimes framed the physical side as if it were simulating literal wildfire environment variables. The current thesis and v0.6 result framing is more careful.

AWSRT should now be described as a research instrument for studying adaptive sensing, belief maintenance, information impairment, and usefulness under wildfire-like dynamic fields.

The Physical Surface should be described as an experimental environmental substrate. It may use variables that stand in for familiar wildfire-relevant structures, such as terrain-like gradients, wind-like directional bias, fuel-like heterogeneity, or scalar field coupling. However, these variables are used to create controlled field structure for sensing and belief-maintenance experiments, not to claim physical wildfire predictive fidelity.

## Non-goals

This subgoal does not reopen the v0.6 result pipeline.

This subgoal does not rename historical artifacts.

This subgoal does not break existing manifests.

This subgoal does not rename backend schema fields unless a compatibility-safe alias strategy is explicitly designed.

This subgoal does not remove wind, terrain, fuels, temperature, or humidity from the implementation.

This subgoal does not claim that AWSRT has become a general environmental-field simulator.

This subgoal does not introduce new experiments.

## Central Framing Decision

Use abstract interpretive language in user-facing text while preserving concrete implementation names where they are technically required.

Recommended distinction:

```text
User-facing concept:
  structured environmental field
  directional-bias field
  terrain-like scalar structure
  fuel-like categorical heterogeneity
  scalar environmental field
  field modifier
  spread modifier

Implementation / schema concept:
  wind
  terrain
  fuels
  temperature
  humidity
  fire-weather coupling
  spread_prob_base
  wind_gain
  slope_gain
  temp_gain
  rh_gain
```

The UI can show both when useful:

```text
Directional-bias field (implementation: wind)
Scalar environmental coupling (implementation: temperature / humidity)
Terrain-like structure (implementation: terrain / slope)
Fuel-like heterogeneity (implementation: fuels)
```

This avoids breaking current code while making interpretation clearer.

## Terminology Guidance

### Preferred user-facing terms

Use:

- Physical Surface
- structured environmental fields
- wildfire-like dynamic fields
- environmental substrate
- field generator
- transformed fire artifact
- terrain-like structure
- directional-bias field
- fuel-like heterogeneity
- scalar environmental field
- spread modifier
- field modifier
- fire-like spread

### Terms to avoid or qualify

Avoid unqualified:

- physical simulator
- wildfire simulator
- high-fidelity simulation
- physical twin
- digital twin
- real wildfire prediction
- actual wind / actual temperature / actual humidity

If concrete terms are necessary, qualify them:

```text
wind-like directional bias
terrain-like structure
fuel-like heterogeneity
temperature-like scalar field
humidity-like scalar field
```

or:

```text
implementation field: wind
implementation fields: temperature and humidity
```

## Immediate Target Files

Start by inspecting visible Physical Surface text:

```text
frontend/app/physical/designer/page.tsx
frontend/app/physical/visualizer/page.tsx
frontend/app/page.tsx
README.md
docs/install/local_install.md
docs/reproducibility/reproduce_v0_6.md
```

Likely main target:

```text
frontend/app/physical/designer/page.tsx
```

Secondary targets:

```text
frontend/app/physical/visualizer/page.tsx
frontend/app/page.tsx
README.md
```

Do not patch historical design notes unless they are current-facing and misleading. Older design notes can preserve historical terminology for auditability.

## Suggested Search Commands

Find visible physical-language terms in the frontend:

```bash
grep -R "wind\|terrain\|fuels\|weather\|temperature\|humidity\|physical world\|wildfire world\|simulator\|simulation" -n   --exclude-dir=node_modules   frontend/app/physical frontend/app/page.tsx
```

Find physical/digital-twin language:

```bash
grep -R "digital twin\|physical twin\|high-fidelity\|predictive\|prediction" -n   --exclude-dir=node_modules   frontend/app README.md docs/install docs/reproducibility
```

Find current Physical Surface headings and explanatory text:

```bash
grep -n "<h1\|<h2\|Physical Surface\|Physical Designer\|Physical Visualizer\|wind\|weather\|terrain\|fuels"   frontend/app/physical/designer/page.tsx   frontend/app/physical/visualizer/page.tsx
```

## Recommended Patch Strategy

### Step 1: Inspect before replacing

Do not run broad search-and-replace. Many implementation labels are still correct.

Read the surrounding text and classify each term as one of:

```text
A. user-facing interpretive text that should be abstracted;
B. technical control label that should remain concrete;
C. schema/manifest field that must remain unchanged;
D. historical/reproducibility text that should remain as-is.
```

### Step 2: Patch explanatory text first

Prioritize paragraphs that tell users what the Physical Surface is.

Good replacement pattern:

```text
The Physical Surface defines structured environmental fields used by AWSRT experiments.
```

instead of:

```text
The Physical Designer builds the underlying wildfire world.
```

### Step 3: Preserve technical labels where useful

Controls may still be named:

```text
wind_gain
slope_gain
temp_gain
rh_gain
```

or labels may still say:

```text
Wind
Terrain
Fuels
Weather coupling
```

if changing them would confuse users trying to match UI to manifests.

When needed, add explanatory text rather than renaming the control:

```text
Wind controls a directional-bias field used by the fire-like spread model.
```

### Step 4: Avoid backend/schema renaming

Do not rename backend schema fields in this subgoal unless absolutely necessary.

Backend/schema renaming risks:

- breaking existing manifests;
- invalidating historical artifacts;
- making v0.6 reproduction harder;
- creating mismatch between frontend and backend.

If deeper renaming becomes desirable, record it as a future compatibility project.

## Candidate UI Wording

### Physical Surface description

```text
The Physical Surface defines structured environmental fields used by AWSRT experiments:
grid, ignition, fire-like spread, terrain-like structure, directional-bias fields,
fuel-like heterogeneity, scalar environmental fields, and optional spread modifiers.
It produces the environmental substrate that the Epistemic and Operational Surfaces later consume.
```

### Directional-bias field

```text
Directional-bias fields stand in for wind-like structure. They bias the direction and strength of fire-like spread without claiming to model operational wind physics.
```

### Terrain-like structure

```text
Terrain-like fields provide scalar spatial structure and slope-like effects for testing how spatial gradients influence fire-like spread and sensing behavior.
```

### Fuel-like heterogeneity

```text
Fuel-like heterogeneity provides categorical spatial variation in local spread behavior. It is used as an experimental heterogeneity field, not as a complete fuel-model claim.
```

### Scalar environmental fields

```text
Scalar environmental fields can be coupled to spread modifiers. In the current implementation, temperature-like and humidity-like fields are used as structured scalar inputs.
```

### Fire-weather coupling

```text
This field modifier adjusts spread probability using stored scalar environmental fields. It is useful for testing whether fire-like behavior responds to structured environmental variation.
```

## Compatibility Strategy

Preserve the following for now:

```text
manifest field names
backend schema names
analysis artifact names
historical note terminology
v0.6 reproduction paths
existing data artifacts
```

Allow changes to:

```text
frontend explanatory paragraphs
frontend section descriptions
help text
tooltips
README wording
install/reproduction framing
surface-level captions
```

Potential compromise labels:

```text
Wind / directional bias
Terrain / scalar structure
Fuels / categorical heterogeneity
Weather coupling / scalar-field modifier
```

## Risks

### Risk 1: Over-abstraction

If the UI becomes too abstract, users may not understand which controls correspond to actual backend fields.

Mitigation: retain concrete implementation labels where they help users connect UI controls to manifests.

### Risk 2: Breaking reproduction

Backend/schema renaming could break historical runs and v0.6 reproducibility.

Mitigation: avoid backend/schema renaming in this subgoal.

### Risk 3: Hiding useful physical intuition

Terms such as wind, terrain, and fuels are intuitive. Removing them entirely could make the app harder to use.

Mitigation: qualify them rather than remove them.

### Risk 4: Terminology split between UI and artifacts

If UI labels become abstract while artifact names remain concrete, users may be confused.

Mitigation: use paired labels where needed, such as `Directional bias (wind implementation)`.

## Expected Output

A small set of UI/documentation patches that:

- improve Physical Surface interpretive language;
- reduce literal physical-simulation implications;
- preserve backend and manifest compatibility;
- maintain usability for users who already understand wind/terrain/fuels controls;
- clearly communicate that Physical Surface fields are experimental wildfire-like structures.

## Freeze Criteria

This subgoal can be frozen when:

1. User-facing Physical Surface text no longer implies a high-fidelity wildfire simulator.
2. The Physical Surface is described as structured environmental fields or an environmental substrate.
3. Wind/terrain/fuels/weather terms are either implementation labels or appropriately qualified.
4. Backend schema and manifest compatibility are preserved.
5. Historical design notes and v0.6 reproduction artifacts are not rewritten unnecessarily.
6. The app runs locally after the changes.
7. No new experiments are launched as part of this subgoal.
8. The working tree is clean and changes are committed.

## Recommended Next Subgoal

After Subgoal 05, likely next options are:

```text
v0.7-subgoal-06: Batch-origin cases design
```

or:

```text
v0.7-subgoal-06: Sensor trajectory recording design
```

The better choice depends on whether the next development priority is systematic geometry experimentation or movement/path auditability.
