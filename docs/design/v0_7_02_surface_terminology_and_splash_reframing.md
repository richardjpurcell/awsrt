# AWSRT v0.7 Subgoal 02: Surface Terminology and Splash Reframing

## Status

Draft design note.

## Branch

`v0.7-subgoal-02`

## Purpose

Reframe the first visible AWSRT interface and major user-facing terminology so that the app matches the current thesis and v0.6 framing.

This subgoal removes outdated v0.1, physical-twin, digital-twin, and overly literal physical-simulation language where it appears in the visible interface. It also shifts the main app vocabulary from `layers` to `surfaces`.

## Non-goals

- Do not change the frozen v0.6 result pipeline.
- Do not redesign the full frontend.
- Do not rename backend concepts aggressively unless required by visible UI.
- Do not implement new experiment capability.
- Do not fully redesign the Epistemic Surface.

## Required terminology

Use:

- `Adaptive Wildfire Sensing Research Tool`
- `Physical Surface`
- `Epistemic Surface`
- `Operational Surface`
- `Analysis Surface`
- `structured environmental fields`
- `wildfire-like dynamic fields`
- `research instrument` or `research tool`

Avoid or remove from user-facing text:

- `AWSRT v0.1`
- `digital twin`
- `physical twin`
- claims of high-fidelity wildfire simulation
- overly literal claims that AWSRT simulates actual wind, temperature, or humidity unless explicitly framed as variables/proxies

## Splash screen target wording

Title:

```text
AWSRT
Adaptive Wildfire Sensing Research Tool
```

Subtitle:

```text
A research instrument for studying adaptive sensing, belief maintenance,
information impairment, and usefulness under wildfire-like dynamic fields.
```

## Physical Surface framing

The Physical Surface should be described as a structured environmental-field surface, not as a high-fidelity physical simulator.

Preferred wording:

```text
The Physical Surface defines structured environmental fields used by AWSRT experiments. These fields may represent or stand in for wildfire-like structure such as directional spread bias, terrain-like variation, ignition geometry, arrival fields, or other spatial drivers. They are experimental variables, not claims of high-fidelity physical simulation.
```

## Implementation targets

1. Locate the splash/home page.
2. Replace `AWSRT v0.1` with the expanded title.
3. Update or remove the outdated first-screen diagram.
4. Replace visible `layer` terminology with `surface` terminology where safe.
5. Search visible UI text for `digital twin`, `physical twin`, and literal simulator language.
6. Make minimal terminology patches only.
7. Leave deeper backend/schema renaming for later subgoals unless strictly necessary.

## Suggested search commands

```bash
grep -R "AWSRT v0.1\|digital twin\|physical twin\|Physical Layer\|Epistemic Layer\|Operational Layer\|Analysis Layer" -n .
grep -R "layer\|Layer" -n frontend backend src docs | head -200
grep -R "wind\|temperature\|humidity\|simulator\|simulation" -n frontend backend src docs | head -200
```

## Freeze criteria

This subgoal can be frozen when:

1. The first visible app page no longer says `AWSRT v0.1`.
2. The acronym is expanded at least once in the visible UI.
3. The major visible app areas are framed as surfaces.
4. Outdated digital/physical-twin language is removed or softened in visible UI.
5. The Physical Surface is described as structured environmental fields rather than high-fidelity physical simulation.
6. The working tree is clean and the changes are committed.
