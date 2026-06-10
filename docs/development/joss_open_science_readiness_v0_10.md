# AWSRT JOSS/Open-Science Readiness Review — v0.10

**Project:** AWSRT — Adaptive Wildfire Sensing Research Tool
**Version track:** v0.10
**Subgoal:** v0.10-subgoal-01 — JOSS/open-science documentation refresh and epistemic README alignment
**Status:** Current readiness review
**Date:** 2026-06-10

---

## 1. Purpose

This document reviews AWSRT from the perspective of an external technical reader, especially a potential Journal of Open Source Software (JOSS) reviewer, open-science software reviewer, thesis examiner, or technically motivated community user.

The review asks whether a reader can understand, install, run, test, cite, and evaluate AWSRT as research software without relying on private project history.

This is not a JOSS paper draft and not a submission package. It is a repository-readiness review and triage note for the v0.10 documentation refresh.

---

## 2. Current framing

AWSRT is the Adaptive Wildfire Sensing Research Tool. It is a bounded diagnostic research instrument for studying adaptive sensing, belief maintenance, information impairment, epistemic inspectability, and usefulness under wildfire-like dynamic fields.

AWSRT should not be read as:

* an operational wildfire-management system;
* a high-fidelity physical wildfire simulator;
* a physical twin or digital twin of a specific fire;
* a universally optimal adaptive-sensing controller;
* a claim that one metric captures usefulness by itself;
* a claim that Epistemic Surface support geometries are operational search policies.

The current public-facing documentation correctly frames AWSRT as research software for inspecting separations among sensing activity, information delivery, belief quality, usefulness-state diagnostics, support/arrival structure, visual inspectability, and structural variables such as deployment geometry and observation windows.

---

## 3. Review basis

The v0.10 documentation refresh has so far inspected or updated:

```text
README.md
docs/README.md
docs/install/local_install.md
docs/design/v0_10_01_joss_open_science_doc_refresh.md
```

The previous v0.8 readiness review remains available at:

```text
docs/development/joss_community_readiness_review.md
```

The v0.8 review should be read as historical. This document supersedes it as the current readiness-triage note.

---

## 4. Validation status

During the v0.10 documentation refresh, the following validation checks were run successfully:

```bash
python -m pytest
```

Observed result:

```text
18 passed
```

Frontend production build:

```bash
npm --prefix frontend run build
```

Observed result:

```text
Compiled successfully
Linting and checking validity of types
Generating static pages (14/14)
```

These checks validate the current local backend test suite and frontend production build in the development environment. They do not reproduce thesis results by themselves.

---

## 5. Readiness strengths now in place

AWSRT now has a coherent external-reader entry path:

```text
README.md
docs/README.md
docs/install/local_install.md
docs/development/backend_smoke_test.md
docs/development/frontend_build_check.md
docs/development/subgoal_freeze_checklist.md
docs/reproducibility/reproduce_v0_6.md
docs/reproducibility/minimal_first_run.md
```

The strongest current readiness features are:

* clear research-instrument framing;
* explicit “what AWSRT is not” boundaries;
* updated v0.8 and v0.9 status in the root README;
* Epistemic Surface and Epistemic Visualizer framing in the root README;
* local install path for backend and frontend;
* explicit backend pytest and frontend build checks;
* smoke-test path through the major research surfaces;
* documentation index updated for v0.10;
* versioned design notes preserving the development audit trail;
* frozen v0.6 reproduction pointer;
* completed v0.9 interpretability/inspectability design record.

---

## 6. Remaining readiness gaps

The following items should be checked before a JOSS/open-science submission.

### 6.1 License metadata

Confirm that `LICENSE` contains a real copyright holder and no placeholder text.

Recommended check:

```bash
sed -n '1,120p' LICENSE
```

If the file still contains placeholder-style text, replace it with the correct rights holder.

### 6.2 Citation metadata

Confirm that `CITATION.cff` matches the current software framing.

Recommended check:

```bash
sed -n '1,220p' CITATION.cff
```

The citation metadata should avoid framing AWSRT as a wildfire simulator or replay tool. It should describe AWSRT as research software for adaptive sensing, belief maintenance, impaired information flow, epistemic inspectability, and wildfire-like dynamic fields.

### 6.3 Contribution guidance

Check whether the repository has a `CONTRIBUTING.md` file.

Recommended check:

```bash
ls CONTRIBUTING.md
```

If absent, add a short contribution guide covering issue reports, development setup, tests/build checks, documentation changes, and the non-operational wildfire scope.

### 6.4 Code of conduct

JOSS submissions commonly benefit from a basic community-governance file.

Recommended check:

```bash
ls CODE_OF_CONDUCT.md
```

This may be optional for the thesis repository, but should be considered before submission.

### 6.5 Reproducibility notes for v0.9 epistemic results

The repository has v0.6 reproduction notes. The v0.9 Epistemic Surface work is currently preserved through design notes and thesis-facing outputs, but may need a dedicated reproducibility note.

Candidate file:

```text
docs/reproducibility/reproduce_v0_9_epistemic_surface.md
```

This should explain how to inspect or regenerate the v0.9 Epistemic Surface runs, figures, or metrics if the relevant scripts and artifacts are preserved in the repository.

### 6.6 JOSS paper skeleton

Check whether `paper/paper.md` exists and whether it matches JOSS expectations.

Recommended check:

```bash
find paper -maxdepth 2 -type f | sort
```

If a JOSS paper skeleton exists, it should use the current research-instrument framing and avoid operational wildfire-simulator claims.

### 6.7 Continuous integration

The repository has local validation commands. A future improvement would be a GitHub Actions workflow that runs at least:

```bash
python -m pytest
npm --prefix frontend run build
```

This is not strictly required for the current documentation refresh, but it would strengthen open-science review readiness.

---

## 7. Suggested next actions

The next documentation-refresh actions should be:

1. Inspect and update `LICENSE` if needed.
2. Inspect and update `CITATION.cff`.
3. Add `CONTRIBUTING.md` if absent.
4. Decide whether to add `CODE_OF_CONDUCT.md`.
5. Add a v0.9 Epistemic Surface reproducibility note if the relevant artifacts/scripts can be clearly documented.
6. Inspect `paper/` and align any JOSS paper draft with the current README framing.
7. Re-run validation checks before freezing the subgoal.

---

## 8. Current readiness conclusion

AWSRT is substantially closer to JOSS/open-science readiness than it was at v0.8. The root README, documentation index, and local install notes now describe the completed v0.8 reproducible-handoff work and the completed v0.9 interpretability/inspectability work.

The remaining readiness work is mostly repository-governance and citation hygiene: license metadata, citation metadata, contribution guidance, optional code-of-conduct guidance, and reproducibility notes for the v0.9 epistemic work.

The scientific framing is now coherent: AWSRT is a bounded diagnostic research instrument for making information/usefulness separation inspectable under adaptive wildfire-like sensing conditions. It should not be presented as an operational wildfire simulator, physical twin, digital twin, or universal controller.
