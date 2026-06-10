# v0.10 Subgoal 01 — JOSS/Open-Science Documentation Refresh and Epistemic README Alignment

## Status

Proposed design document for the next AWSRT documentation subgoal.

## Context

AWSRT v0.9 is complete and the thesis document has been brought up to date with the Epistemic Surface chapter, operational Results I--III, discussion, conclusion, and abstract. The repository README and GitHub-facing documentation now need to reflect the current state of the project.

The current README still frames the repository as including the frozen v0.6 result state, the completed v0.7 pass, and active v0.8 reproducible-handoff work. That is now stale. The public-facing documentation should instead reflect that v0.8 reproducible handoff is complete and that v0.9 added interpretability/inspectability work, including Epistemic Surface support-geometry probes, Epistemic Visualizer support/arrival inspection, visualizer--metric alignment review, and release-readiness notes.

This subgoal is also an appropriate first step toward Journal of Open Source Software / open-science readiness. The goal is not to polish AWSRT into an operational wildfire product, but to make the research software understandable, installable, citable, testable, and reproducible enough for reviewers and future users to evaluate its scientific purpose.

## Goal

Bring AWSRT's public-facing repository documentation up to date after v0.9 so that a reader, thesis examiner, or open-science reviewer can understand:

- what AWSRT is;
- what AWSRT is not;
- how v0.9 changed the Epistemic Surface and interpretability story;
- how to install and smoke-test the tool locally;
- how to run backend tests and frontend build checks;
- where reproducibility notes and thesis-facing artifacts live;
- how to cite the software; and
- how the repository supports bounded research use rather than operational wildfire deployment.

## Scope

This is a documentation and repository-readiness subgoal, not a feature-development subgoal.

The subgoal may update:

- `README.md`
- `docs/README.md`
- `docs/install/local_install.md`
- `docs/reproducibility/`
- `docs/development/subgoal_freeze_checklist.md`
- `CITATION.cff`
- `CONTRIBUTING.md` if absent or stale
- JOSS/paper-facing files under `paper/`, if present
- lightweight testing or verification notes

## Non-goals

This subgoal should not:

- change AWSRT scientific results;
- add new experiments;
- regenerate thesis figures unless a documentation reference is broken;
- reframe AWSRT as an operational wildfire simulator;
- treat Epistemic Surface support geometries as operational search policies;
- overclaim JOSS readiness before install, tests, citation metadata, and paper-facing materials have been checked.

## Proposed branch

```bash
git checkout main
git pull origin main
git checkout -b v0.10-subgoal-01-joss-doc-refresh
```

If the remote branch already exists, use:

```bash
git fetch origin
git checkout v0.10-subgoal-01-joss-doc-refresh
```

## Primary documentation tasks

### 1. Update `README.md`

Refresh the README so that it no longer describes v0.8 as active work. It should describe:

- v0.6 frozen thesis-facing result state;
- v0.7 shareability/coherence pass;
- v0.8 reproducible-handoff pass as complete;
- v0.9 interpretability/inspectability pass as complete;
- Epistemic Surface support-geometry probes;
- Epistemic Visualizer belief, entropy, entropy-change, support, and arrivals-over-support windows;
- support geometries as epistemic probes, not operational search policies;
- visualizer outputs as inspection aids, not standalone evidence;
- the next repository-readiness goal as JOSS/open-science documentation review.

### 2. Update `docs/README.md`

Make the documentation index useful to a new reader. It should point to:

- installation instructions;
- reproducibility notes;
- design notes;
- development/freeze workflow;
- testing/build instructions;
- citation and licensing information;
- JOSS/open-science orientation if added.

### 3. Review `docs/install/local_install.md`

Ensure the local install path is current:

- clone repository;
- create Python environment;
- install backend package;
- start backend;
- check `/health`;
- install frontend dependencies;
- start frontend;
- open local UI;
- set or override `AWSRT_DATA_DIR` if needed;
- run a minimal smoke test.

### 4. Add or update v0.9 reproducibility notes

Add a focused reproducibility note for the v0.9 epistemic/interpretability work, for example:

```text
docs/reproducibility/reproduce_v0_9_epistemic_surface.md
```

This file should describe, at minimum:

- the purpose of the v0.9 epistemic result set;
- the clean support-geometry by decay matrix;
- the impairment-response matrix;
- where generated figures or metrics are expected to live;
- what should and should not be inferred from the Epistemic Surface results;
- that support geometries are controlled epistemic probes rather than operational wildfire search policies.

### 5. Review `CITATION.cff`

Confirm that citation metadata is current:

- title;
- authors;
- repository URL;
- license;
- version or release tag if appropriate;
- date-released if a release is being prepared;
- preferred citation message;
- DOI placeholder or Zenodo DOI if available later.

### 6. Review license and contribution guidance

Confirm that:

- `LICENSE` exists and is clear;
- the license is appropriate for open-source research software;
- `CONTRIBUTING.md` exists or is added with lightweight guidance;
- issue-reporting expectations are clear enough for a reviewer or future user.

### 7. Review test/build instructions

Ensure documentation tells users how to run the basic verification commands, such as:

```bash
python -m pytest
cd frontend
npm run build
```

Use the actual project commands if they differ.

### 8. Review paper-facing materials

If a JOSS paper draft exists under `paper/`, check that its statement of need matches AWSRT's current identity:

- AWSRT is a bounded research instrument;
- AWSRT studies adaptive sensing, belief maintenance, impaired information flow, and usefulness under wildfire-like dynamic fields;
- AWSRT is not an operational wildfire simulator or digital twin;
- the Epistemic Surface is part of the inspectability contribution.

## Acceptance criteria

The subgoal is complete when:

- `README.md` accurately describes v0.9 and no longer says v0.8 is active;
- the Epistemic Surface and Epistemic Visualizer changes are documented without overclaiming;
- documentation clearly distinguishes operational sensing from epistemic probes;
- install and smoke-test guidance is current;
- backend test and frontend build commands are documented;
- citation, license, and contribution guidance have been reviewed;
- v0.9 reproducibility notes exist or a clear reason is recorded for deferring them;
- `git status` is clean after commit;
- the branch can be pushed for review.

## Suggested verification commands

Run these before freezing the subgoal, adjusting commands if the repository uses different scripts:

```bash
git status
python -m pytest
cd frontend
npm run build
cd ..
git status
```

Optional documentation checks:

```bash
find docs -maxdepth 3 -type f | sort
sed -n '1,220p' README.md
sed -n '1,220p' docs/README.md
```

## Suggested commit message

```text
Refresh README and docs for v0.9 epistemic inspectability
```

## Suggested push command

```bash
git push -u origin v0.10-subgoal-01-joss-doc-refresh
```

## Notes for interpretation

The documentation should preserve the thesis discipline:

- information arrival is not automatically belief improvement;
- entropy-side belief quality is central but not the whole of usefulness;
- usefulness-state diagnostics are bounded internal information-health readings;
- transformed wildfire-like artifacts are structured experimental substrates, not operational wildfire reconstructions;
- Epistemic Surface support geometries are controlled probes, not deployment policies;
- visual inspection must remain accountable to metrics.
