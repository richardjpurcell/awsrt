# AWSRT v0.8 Subgoal 08 — Committee-Facing Orientation Guide

**Project:** AWSRT — Adaptive Wildfire Sensing Research Tool  
**Branch:** `v0.8-subgoal-08`  
**Design note:** `docs/design/v0_8_08_committee_facing_orientation_guide.md`  
**Status:** Draft design note  
**Date:** 2026-05-30  

---

## 1. Purpose

This subgoal follows the v0.8 repository metadata and hygiene cleanup completed in Subgoal 07.

The v0.8 theme remains:

```text
From shareable repository to reproducible handoff.
```

Subgoals 01–07 have made AWSRT more inspectable as research software:

- roadmap and backlog triage;
- clean-machine installation verification;
- minimal first-run workflow;
- backend smoke-test workflow;
- frontend build/runtime check workflow;
- JOSS/community readiness review;
- repository metadata and hygiene cleanup.

Subgoal 08 should now focus on thesis committee readability.

The purpose is to create a concise committee-facing orientation guide that explains what AWSRT is, what it is not, how the four research surfaces support the thesis, what v0.6 contributed scientifically, and how a committee member can inspect the tool without needing development history.

This is a reader-orientation subgoal, not a new implementation subgoal.

---

## 2. Guiding question

The guiding question for this subgoal is:

> Can a thesis committee member understand how AWSRT supports the thesis argument without mistaking it for an operational wildfire simulator or needing to reconstruct the project history from design notes?

The orientation should help a reader answer:

- What is AWSRT?
- Why does it exist?
- What thesis question does it support?
- What are the four surfaces?
- What does v0.6 provide as evidence?
- What did v0.7 and v0.8 improve?
- What can a committee member run or inspect?
- What should they not overinterpret?

---

## 3. Relationship to previous v0.8 subgoals

### Subgoal 01

Established the v0.8 roadmap and backlog:

```text
docs/design/v0_8_01_roadmap_and_backlog_triage.md
docs/backlog/v0_8_backlog.md
```

### Subgoal 02

Verified local installation and startup:

```text
docs/install/local_install.md
docs/install/clean_machine_check.md
```

### Subgoal 03

Documented the minimal first-run workflow:

```text
docs/reproducibility/minimal_first_run.md
```

### Subgoal 04

Documented backend validation:

```text
docs/development/backend_smoke_test.md
```

### Subgoal 05

Documented frontend validation:

```text
docs/development/frontend_build_check.md
```

### Subgoal 06

Reviewed JOSS/community readiness:

```text
docs/development/joss_community_readiness_review.md
```

### Subgoal 07

Cleaned repository metadata and hygiene items identified during the readiness review.

Subgoal 08 should use this foundation to produce a concise committee-facing entry document.

---

## 4. Intended audience

The primary audience is a thesis committee member.

Assumptions:

- They may understand the thesis question and methods at a conceptual level.
- They may not want to inspect every design note.
- They may not be familiar with the AWSRT repository structure.
- They may not care about implementation details unless those details affect validity.
- They may be skeptical about whether AWSRT is being overclaimed as a wildfire simulator.
- They may want to know how the software supports the thesis evidence.

The secondary audience is a technically capable external reader who wants a non-developer overview before running the first-run workflow.

---

## 5. Framing constraints

The orientation must preserve these boundaries:

```text
AWSRT is a research instrument.
AWSRT is not an operational wildfire simulator.
AWSRT is not a high-fidelity physical wildfire model.
AWSRT is not a physical twin or digital twin.
AWSRT is not a universal adaptive-sensing controller.
AWSRT does not make universal wildfire generalization claims.
```

The orientation should explain that AWSRT studies:

- adaptive sensing;
- belief maintenance;
- impaired information flow;
- timing vs information delivery;
- belief quality;
- usefulness-state interpretation;
- wildfire-like dynamic fields as experimental substrates.

The orientation should avoid language that makes the Physical Surface sound like a predictive fire model.

---

## 6. Candidate output file

The likely primary deliverable is:

```text
docs/overview/awsrt_committee_orientation.md
```

This may require creating a new directory:

```text
docs/overview/
```

Rationale:

- `docs/development/` is too developer-focused.
- `docs/reproducibility/` is too workflow/result-focused.
- `docs/install/` is too setup-focused.
- `docs/overview/` gives committee and external readers a clean conceptual entry point.

Possible supporting edits:

```text
docs/README.md
README.md
```

Only edit these if needed for discoverability.

---

## 7. Proposed structure of the orientation guide

The committee-facing guide should be short compared to design notes.

Recommended sections:

```text
1. Purpose of this guide
2. One-paragraph summary of AWSRT
3. What AWSRT is
4. What AWSRT is not
5. How AWSRT supports the thesis argument
6. The four research surfaces
7. What the frozen v0.6 evidence state contributes
8. What v0.7 and v0.8 changed
9. What a committee member can inspect or run
10. How to read the results without overclaiming
11. Pointers to detailed docs
```

The guide should be direct and readable.

It should not become another long design note.

---

## 8. Suggested content emphasis

### 8.1 Thesis role

The guide should explain that AWSRT supports the thesis claim:

```text
Information that arrives is not always useful.
```

AWSRT helps make this inspectable by separating:

- detection timing;
- information delivery;
- belief quality;
- usefulness-state diagnostics;
- movement/effort and structural variables.

### 8.2 Four surfaces

The guide should explain the four surfaces in committee-readable terms:

```text
Physical Surface   -> creates or imports dynamic wildfire-like field substrates
Epistemic Surface  -> maintains belief and uncertainty over the field
Operational Surface -> runs adaptive sensing behavior under impairments
Analysis Surface   -> extracts metrics, figures, and audit traces
```

The guide should clarify that the surfaces are methodological separations, not claims about a real wildfire-response system.

### 8.3 v0.6 evidence state

The guide should summarize v0.6 as the frozen evidence state:

```text
v0.6 tested deployment geometry and observation-window effects under transformed real-fire conditions.
```

Key interpretation:

```text
geometry/window structure strongly affects timing access;
the compact usefulness triad remained condition-readable under tested conditions;
healthy -> exploit-dominant;
delay -> recover-dominant;
noise -> caution-dominant.
```

Also include limitation:

```text
This is bounded transformed-real-fire evidence, not universal wildfire generalization.
```

### 8.4 v0.7 and v0.8 roles

The guide should explain:

```text
v0.7 did not reopen v0.6 experiments.
v0.7 improved shareability, terminology, documentation, build hardening, and auditability.
v0.8 did not reopen v0.6 experiments by default.
v0.8 improved reproducible handoff: install, first-run, backend checks, frontend checks, metadata, and community-readiness review.
```

### 8.5 Inspection path

The guide should give a committee member a lightweight path:

```text
1. Read README.md.
2. Read docs/overview/awsrt_committee_orientation.md.
3. Optionally run docs/reproducibility/minimal_first_run.md.
4. Inspect docs/reproducibility/reproduce_v0_6.md for frozen evidence context.
5. Use backend/frontend check docs only if validating software health.
```

---

## 9. Suggested inspection commands before writing

Inspect the current high-level docs:

```bash
sed -n '1,260p' README.md
sed -n '1,220p' docs/README.md
sed -n '1,220p' docs/reproducibility/minimal_first_run.md
sed -n '1,220p' docs/reproducibility/reproduce_v0_6.md
sed -n '1,220p' docs/development/joss_community_readiness_review.md
```

Optionally inspect the v0.8 backlog:

```bash
sed -n '1,220p' docs/backlog/v0_8_backlog.md
```

---

## 10. Expected deliverables

Likely deliverables:

```text
docs/design/v0_8_08_committee_facing_orientation_guide.md
docs/overview/awsrt_committee_orientation.md
```

Possible supporting edits:

```text
docs/README.md
README.md
```

The support edits should be small and only for discoverability.

---

## 11. Validation expectations

Because this is a documentation-facing subgoal, run:

```bash
git diff --check
git status
```

No frontend build or backend pytest is required unless frontend/backend files are touched.

If `docs/README.md` is edited, inspect the rendered/linked path manually enough to ensure the relative links are correct.

---

## 12. Non-goals

Subgoal 08 should not:

- rewrite the thesis;
- create a slide deck;
- create screenshots unless explicitly decided;
- change code behavior;
- rerun v0.6 experiments;
- modify scientific claims;
- add new evidence;
- draft a JOSS paper;
- create full public-facing website content.

This is a committee-orientation guide only.

---

## 13. Freeze criteria

Subgoal 08 can be frozen when:

1. A committee-facing orientation guide exists.
2. The guide clearly states what AWSRT is and is not.
3. The guide explains the four research surfaces.
4. The guide explains how AWSRT supports the thesis argument.
5. The guide identifies v0.6 as the frozen evidence state.
6. The guide explains that v0.7 and v0.8 are shareability/handoff improvements, not new result states.
7. The guide points to the minimal first-run and v0.6 reproduction docs.
8. Documentation entry points link to the guide.
9. `git diff --check` passes.
10. The working tree is clean.
11. Changes are committed and pushed.

---

## 14. Suggested commit messages

For the design note:

```text
Add committee orientation design
```

For the orientation guide:

```text
Add committee-facing AWSRT orientation guide
```

For docs-index alignment:

```text
Update docs index for committee orientation guide
```

---

## 15. Expected outcome

At the end of Subgoal 08, AWSRT should have a committee-facing entry document that bridges the gap between the thesis argument and the repository.

This should make the software easier to discuss in a defense or committee review without requiring the reader to navigate all design notes or development history.
