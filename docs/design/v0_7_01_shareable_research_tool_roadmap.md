# AWSRT v0.7 Subgoal 01: Shareable Research Tool Roadmap

## Status

Draft design note.

## Branch

`v0.7-subgoal-01`

## Context

AWSRT v0.6 has been frozen and tagged as the distance-window and cross-artifact synthesis release. The frozen v0.6 evidence base supports both the PhD thesis and the associated journal-paper framing: normalized deployment geometry and observation-window structure strongly affect detection timing, while the compact usefulness triad remains condition-readable across tested transformed real-fire artifacts.

The next development stage should not reopen the v0.6 result pipeline. Instead, v0.7 should transition AWSRT from a result-generation research codebase toward a shareable research tool that can be shown to a defence committee and continued as a forward-development platform.

This does not require AWSRT to become a polished public product before the defence. The goal is more modest and more important: the app, repository, and documentation should not contradict the thesis framing. A committee member may never run the full experiment pipeline, but if they open the app or repository, the first impression should be coherent, current, and aligned with the thesis.

## Why v0.7 Exists

v0.7 exists because the research framing has matured faster than parts of the application interface and documentation.

Earlier AWSRT language sometimes implied a more literal physical or digital-twin interpretation. The current thesis and journal framing no longer support that emphasis. AWSRT is better described as a research instrument for studying adaptive sensing, belief maintenance, information impairment, and usefulness under structured wildfire-like dynamic fields.

The physical side of AWSRT should therefore be framed as a controlled environmental substrate, not as a high-fidelity physical simulator. Variables such as wind-like direction, terrain-like structure, ignition geometry, spread structure, and transformed real-fire arrival fields should be treated as experimental variables or proxies. They may stand in for real environmental structure, but they should not be presented as claims of physical predictive fidelity.

v0.7 should also make the four major application areas match the thesis language. The preferred term is now `surface`, not `layer`:

- Physical Surface
- Epistemic Surface
- Operational Surface
- Analysis Surface

This is not only cosmetic. The surface language better matches how AWSRT is used in the thesis: as a set of inspectable experimental surfaces rather than a single operational simulator stack.

## Primary v0.7 Goal

Make AWSRT coherent as a shareable research tool whose interface, documentation, and terminology match the frozen v0.6 thesis and journal framing.

## Secondary v0.7 Goal

Prepare AWSRT for forward development after the defence-facing release, especially systematic deployment-origin testing, sensor trajectory analysis, and improved epistemic visualization.

## Non-Goals

v0.7 does not reopen the frozen v0.6 evidence base.

v0.7 does not require another experiment merely to extend the matrix.

v0.7 does not need to make AWSRT a polished commercial or operational product.

v0.7 does not need to make every prototype surface fully mature before the defence.

v0.7 should not reintroduce physical-twin or digital-twin language.

v0.7 should not hide structural limitations. It should make the maturity and purpose of each surface clear.

## Defence-Shareable Requirements

A defence-shareable version of AWSRT should satisfy the following minimum requirements.

1. The first visible screen should identify AWSRT clearly as the Adaptive Wildfire Sensing Research Tool.

2. The first visible screen should not say `AWSRT v0.1`.

3. The first visible diagram should not imply an outdated architecture or physical/digital-twin framing.

4. The app should use the terminology `surface` rather than `layer` where this is visible to the user.

5. The Physical Surface should be described as a structured environmental-field surface, not as a high-fidelity simulator of literal physical wildfire variables.

6. Prototype or incomplete pages should be hidden, relabeled, or explicitly marked as experimental.

7. The README should describe the current state of the project, not the v0.2 state.

8. Installation instructions should be clear enough for a motivated technical reader to try running the project.

9. Known limitations should be stated honestly.

10. The repository should look maintained enough that a committee member can understand what AWSRT is, what evidence v0.6 produced, and what remains under development.

## Forward-Development Requirements

The following features are important for the future development of AWSRT, but they do not all need to block a defence-shareable release.

1. Batch analysis should support multiple deployment origins as case dimensions.

2. Sensor trajectories should be recorded at per-sensor, per-time-step resolution.

3. The Epistemic Surface should become useful as a belief-state inspection surface.

4. The Analysis Surface should provide clearer user feedback during destructive or long-running actions.

5. Formal API documentation should make the project look like maintained research software.

6. Docker or a more reproducible local-install workflow should eventually be provided.

## Immediate Issue Inventory

### 1. Belief designer and visualizer maturity

The belief designer and visualizer may currently feel incomplete or out of step with the more mature Operational and Analysis Surfaces.

Recommended stance: do not delete these pages. Either hide them from the main navigation or relabel them as prototype/experimental epistemic tools.

Possible label:

`Epistemic Surface — Prototype`

or:

`Experimental Epistemic Tools`

Rationale: hiding the epistemic surface completely may be misleading because belief maintenance is central to the thesis. Leaving it visible as if fully mature may also be misleading. A prototype label is the most honest compromise.

### 2. Physical Designer abstraction

The Physical Designer should be reframed away from literal physical variables and toward abstract structured environmental fields.

Recommended stance: replace overly literal labels where possible with more general field types.

Examples:

- `wind` becomes `vector field` or `directional-bias field`
- `terrain` becomes `scalar terrain-like field` or `spatial scalar field`
- `temperature`, `humidity`, or other literal environmental variables become optional field semantics rather than hard-coded claims of physical realism

Suggested description:

> The Physical Surface defines structured environmental fields used by AWSRT experiments. These fields may represent or stand in for wildfire-like structure such as directional spread bias, terrain-like variation, ignition geometry, arrival fields, or other spatial drivers. They are experimental variables, not claims of high-fidelity physical simulation.

### 3. Multiple origins as batch cases

The batch analysis system should eventually allow deployment origins to be treated as case dimensions.

Recommended stance: design this carefully before implementation.

Desired structure:

```yaml
case_dimensions:
  - impairment_family
  - deployment_origin
  - seed

deployment_origins:
  - label: dist_15_near
    base_station_rc: [894, 582]
  - label: dist_30_mid
    base_station_rc: [709, 397]
  - label: dist_50_far
    base_station_rc: [463, 151]
```

Rationale: v0.6 showed that deployment geometry is a structural scientific variable. Future experiments should not have to encode multiple origins through manual operational-surface overrides.

### 4. Surfaces terminology

Visible UI and documentation should use `surface` rather than `layer` where appropriate.

Preferred terms:

- Physical Surface
- Epistemic Surface
- Operational Surface
- Analysis Surface

Rationale: the surface language better matches the thesis and journal framing. It also avoids implying that AWSRT is a vertically integrated operational simulator.

### 5. Sensor trajectory recording

AWSRT should record per-sensor trajectories so that movement can be analyzed and rendered.

Recommended stance: add a dedicated trajectory artifact/table rather than overloading summary metrics.

Possible schema:

```text
run_id
case_id
case_label
t
sensor_id
row
col
status
selected_action
target_row
target_col
policy_score
movement_mode
tie_breaking_mode
```

Potential output formats:

- CSV for easy inspection
- Parquet for efficient tabular analysis
- Zarr group for alignment with existing field/time-indexed data

Rationale: trajectory recording is a forward-development feature. It will support path audit visualizations, individual-sensor movement analysis, and better explanation of TTFD behavior.

### 6. Splash screen title and diagram

The current initial screen is out of date if it says `AWSRT v0.1` and does not expand the acronym.

Recommended replacement title:

```text
AWSRT
Adaptive Wildfire Sensing Research Tool
```

Suggested subtitle:

```text
A research instrument for studying adaptive sensing, belief maintenance,
information impairment, and usefulness under wildfire-like dynamic fields.
```

The first visible diagram should show the four surfaces and their relationships without suggesting a physical or digital twin.

Suggested high-level diagram concepts:

```text
Structured Environmental Fields
        ↓
Physical Surface
        ↓ observations / fire-like dynamics
Epistemic Surface
        ↓ belief state / uncertainty
Operational Surface
        ↓ sensing policy / impairment response
Analysis Surface
        ↓ metrics / manifests / interpretation
```

Or, less stack-like:

```text
Physical Surface  ↔  Epistemic Surface
        ↓                    ↓
Operational Surface  →  Analysis Surface
```

The exact diagram should be chosen after inspecting the current page.

### 7. Epistemic Surface update

The Epistemic Surface should be made useful, but this should be scoped narrowly.

Minimum useful v0.7 target:

- show belief map for a selected run/time
- show uncertainty or entropy map where available
- show aggregate entropy summary
- show how observations affect the maintained belief state
- link selected visualizations to Analysis Surface metrics

Non-goal for first pass:

- full belief-designer redesign
- new estimator development
- new theoretical machinery

Rationale: the epistemic surface should help users understand what the thesis means by belief maintenance. It does not need to become a complete design environment immediately.

### 8. Analysis deletion feedback

The Analysis Raw page should show feedback when studies are being deleted.

Recommended behavior:

- disable repeated delete button clicks while deletion is in progress
- show spinner or progress state
- show success message after deletion completes
- show explicit error if deletion key is incorrect
- refresh the study list after deletion completes

Rationale: this is a small but valuable usability fix that prevents inconsistent user behavior during destructive actions.

### 9. Installation or Docker instructions

The project needs clearer installation instructions.

Recommended first step: local installation documentation before Docker.

Suggested files:

```text
docs/install/local_install.md
docs/install/reproduce_v0_6.md
```

Minimum content:

- required Python version
- conda environment creation
- backend dependencies
- frontend dependencies
- how to run backend
- how to run frontend
- how to verify app health
- known platform assumptions
- known data/artifact requirements
- troubleshooting notes

Docker can be considered later, but should not block the first defence-shareable release unless local installation proves too fragile.

### 10. GitHub README update

The README must be updated from the v0.2 framing.

Minimum README content:

- expanded project title
- current status
- what AWSRT is
- what AWSRT is not
- v0.6 frozen result summary
- quickstart
- repository structure
- documentation links
- citation/publication status if appropriate
- known limitations
- license

Suggested short description:

> AWSRT is a research tool for studying adaptive sensing, belief maintenance, information impairment, and usefulness under wildfire-like dynamic fields. It is not an operational wildfire simulator and does not claim high-fidelity physical prediction.

### 11. Formal API pages

Formal API documentation would help the project look maintained and navigable.

Recommended first step:

- document existing backend routes
- expose generated or semi-generated FastAPI docs clearly
- add a documentation page explaining major route groups in user language

Possible locations:

```text
docs/api/backend_routes.md
docs/api/analysis_workflow.md
docs/api/manifests_and_artifacts.md
```

Rationale: formal API pages are useful but should come after the README and installation basics.

## Priority Classes

### P1: Remove framing contradictions

These should be done first because they affect every user’s interpretation.

- Update splash screen title, acronym, and diagram.
- Replace visible `layer` language with `surface` language where appropriate.
- Reframe the Physical Designer as abstract structured environmental fields.
- Update README away from v0.2 framing.

### P2: Make AWSRT shareable

These make the repository usable by a committee member or external reviewer.

- Write local installation instructions.
- Write v0.6 reproduction/readme notes.
- Document known limitations.
- Add basic API/documentation pages.

### P3: Improve immediate usability

These improve confidence in the app without changing the research model.

- Add deletion spinner/status/error handling in Analysis Raw.
- Hide or relabel incomplete/prototype pages.
- Improve first-run navigation.

### P4: Add forward research capability

These are valuable but should not block the first shareable release.

- Multiple origins as batch cases.
- Sensor trajectory recording.
- Epistemic Surface useful-minimum update.
- Richer trajectory and belief visualizations.

## Recommended v0.7 Subgoal Sequence

### v0.7-subgoal-01: Shareable research tool roadmap

Purpose: define priorities, non-goals, and the development sequence after the v0.6 freeze.

Expected output: this design note.

### v0.7-subgoal-02: Surface terminology and splash-screen reframing

Purpose: repair first impressions and remove outdated v0.1/digital-twin-style framing.

Expected outputs:

- updated splash screen title
- expanded AWSRT acronym
- updated diagram or placeholder
- `surface` terminology in visible navigation/pages where appropriate

### v0.7-subgoal-03: README and local installation documentation

Purpose: make the repository understandable and locally runnable by a motivated technical reader.

Expected outputs:

- updated README
- local installation notes
- basic run instructions
- known limitations

### v0.7-subgoal-04: UI maturity pass

Purpose: reduce misleading or confusing UI behavior.

Expected outputs:

- incomplete pages hidden or relabeled
- deletion spinner/status added
- incorrect deletion key feedback added
- user-facing labels updated where low risk

### v0.7-subgoal-05: Physical Surface abstraction pass

Purpose: align the Physical Surface with the thesis framing of structured environmental fields.

Expected outputs:

- literal physical-variable language reduced
- field-type terminology introduced
- backend/frontend naming compatibility assessed
- migration strategy recorded if needed

### v0.7-subgoal-06: Batch-origin cases design

Purpose: design and then implement support for treating multiple deployment origins as case dimensions.

Expected outputs:

- schema design
- backend support
- frontend support
- validation with a small matrix

### v0.7-subgoal-07: Sensor trajectory recording

Purpose: record per-sensor trajectories for later analysis and visualization.

Expected outputs:

- trajectory schema
- storage format decision
- first recording implementation
- simple extraction or visualization test

### v0.7-subgoal-08: Epistemic Surface minimum useful update

Purpose: make the Epistemic Surface useful as a belief-state inspection surface.

Expected outputs:

- selected run/time belief visualization
- uncertainty or entropy visualization
- links to analysis metrics
- explanatory text aligned with thesis framing

### v0.7-subgoal-09: Committee-shareable release packaging

Purpose: freeze a defence-shareable release after terminology, documentation, and minimum usability improvements.

Expected outputs:

- release note
- tag
- updated README
- known limitations
- install/reproduce notes

## Risks

### Risk 1: Overbuilding before the defence

The largest risk is turning v0.7 into a broad feature expansion before the app is conceptually aligned. This should be avoided.

Mitigation: start with framing, README, installation notes, and small usability fixes.

### Risk 2: Reintroducing physical-twin language

The app and README may still contain language that implies high-fidelity physical simulation.

Mitigation: explicitly search for and revise terms such as `digital twin`, `physical twin`, `simulator`, and overly literal environmental-variable claims.

### Risk 3: Hiding epistemic work too much

If the belief-related pages are hidden entirely, the app may underrepresent the thesis focus on belief maintenance.

Mitigation: relabel as prototype or experimental rather than removing unless the pages are actively misleading.

### Risk 4: Docker becoming a rabbit hole

Docker may help sharing but could consume time if data paths, frontend/backend dependencies, or platform-specific assumptions are complex.

Mitigation: write and test local installation first. Add Docker only if local setup remains too fragile.

### Risk 5: Batch-origin support changing experiment semantics

Adding multiple origins as batch cases could accidentally change how existing overrides and case labels work.

Mitigation: design schema first, validate with a small known matrix, and preserve v0.6 result reproducibility.

## Freeze Criteria for v0.7-subgoal-01

This subgoal can be frozen when:

1. This roadmap note is committed.
2. The next v0.7 implementation subgoal is selected.
3. The project direction is clear: repair framing and shareability before adding major new experimental capability.
4. No new experiment has been launched as part of this planning subgoal.

## Recommended Immediate Next Step

Proceed to:

```text
v0.7-subgoal-02
Surface terminology and splash-screen reframing
```

Rationale: this is the highest-leverage first implementation step. It removes the most visible contradictions between the app and the thesis framing without touching the frozen v0.6 evidence base.
