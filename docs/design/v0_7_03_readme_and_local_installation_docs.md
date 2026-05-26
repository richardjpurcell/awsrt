# AWSRT v0.7 Subgoal 03: README and Local Installation Documentation

## Status

Draft design note with repository-inventory findings.

## Branch

`v0.7-subgoal-03`

## Purpose

Update AWSRT's repository-facing documentation so that the project can be understood and run as a shareable research tool.

This subgoal follows the v0.7 Subgoal 02 terminology pass, which aligned the frontend around the four-surface framing:

- Physical Surface
- Epistemic Surface
- Operational Surface
- Analysis Surface

Subgoal 03 shifts from interface framing to repository framing. The goal is to make the GitHub landing page and local installation path consistent with the current thesis, journal, and v0.6 release framing.

AWSRT should be presented as the Adaptive Wildfire Sensing Research Tool: a research instrument for studying adaptive sensing, belief maintenance, information impairment, and usefulness under wildfire-like dynamic fields. It should not be presented as an operational wildfire simulator, a physical twin, or a digital twin.

## Repository Inventory

The repository root currently contains:

```text
backend/
CHANGELOG.md
CITATION.cff
CODE_OF_CONDUCT.md
CONTRIBUTING.md
data/
docs/
frontend/
LICENSE
Makefile
notes/
paper/
pyproject.toml
README.md
REPRODUCIBILITY_v0.1.md
results/
RESULTS_MANIFEST_v0.1.md
src/
VERSION_NOTES_v0.1.md
VERSION_NOTES_v0.2.md
```

A shallow documentation and dependency-file scan found:

```text
./frontend/.next/package.json
./frontend/package.json
./pyproject.toml
./backend/.pytest_cache/README.md
./docs/design/v0_7_03_readme_and_local_installation_docs.md
./docs/README.md
./README.md
```

Immediate implication:

- There is a top-level `README.md`, but it still reflects the older v0.2 release framing.
- There is a `docs/README.md`, which should be inspected before deciding whether to update it during this subgoal.
- There is no obvious existing `docs/install/local_install.md`.
- There is no obvious existing `environment.yml` or `requirements.txt` in the shallow scan.
- Python packaging appears to be through `pyproject.toml`.
- Frontend packaging appears to be through `frontend/package.json`.
- A `Makefile` exists and should be inspected before writing install instructions, because it may already encode useful run/test commands.
- Historical v0.1/v0.2 reproducibility/version files remain at the repository root and should likely be preserved as historical release artifacts rather than rewritten.

## Current README Assessment

The current README begins:

```text
# AWSRT: Adaptive Wildfire Sensing Research Tool

AWSRT is an information-centric research software platform for studying adaptive wildfire sensing in dynamic and uncertain environments.
```

This is directionally compatible with the current project, but the rest of the opening is now out of date. The README currently says:

```text
The platform supports four linked research layers:
```

and then lists Physical, Epistemic, Operational, and Analysis as layers. For v0.7, this should become the four-surface framing.

The current README also contains a v0.2-centered release statement:

```text
This repository contains the frozen AWSRT v0.2 research software release.
```

This is now misleading at the top level because `main` has advanced through v0.6 and v0.7 frontend terminology work. Historical v0.2 notes can remain, but the README should describe the current repository state rather than present v0.2 as the current release identity.

The current README includes a substantial `What v0.2 adds` section. This should either be removed from the top-level README or moved into a historical release note pointer. The top-level README should instead summarize:

- current status;
- v0.6 frozen scientific evidence base;
- v0.7 shareability/terminology transition;
- what AWSRT is and is not.

The current README includes backend and frontend run instructions:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -U pip
pip install -e .
uvicorn backend.api.main:app --reload --port 8000
```

and:

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

These are useful and should be preserved, but they should be checked against the user's actual working environment. The current development environment appears to use conda environment `PhD_general`, so the installation docs should either:

1. document the generic virtual-environment path already in the README; and/or
2. document the tested conda-based development path as the known-good path.

The current README also contains environment-variable documentation for:

- `AWSRT_DATA_DIR`;
- `AWSRT_RENDER_PX_PER_CELL`;
- `AWSRT_RENDER_MAX_SIDE_PX`;
- `AWSRT_RENDER_DPI`.

This content is useful and should not be lost. It can remain in the README if the README is kept longer, or it can move into `docs/install/local_install.md` / `docs/configuration.md` with a README pointer.

The current README contains smoke-test curl examples, but the pasted output is truncated in the operational example. Before rewriting the smoke-test section, the full current README should be inspected to decide whether the examples are still valid.

## Context

AWSRT v0.6 has been frozen as the distance-window and cross-artifact synthesis release. The v0.6 result supports the thesis-level claim that normalized deployment geometry and observation-window structure strongly affect detection timing, especially finite TTFD availability, while the compact usefulness triad remains condition-readable across the tested transformed real-fire artifacts.

v0.7 is not intended to reopen the v0.6 evidence base. Its immediate purpose is to make AWSRT more coherent and shareable before forward app development continues.

The README and installation documentation are currently a high-priority part of that transition. A defence committee member or external reader may not run the full pipeline, but they may open the repository. The repository should therefore give a clear and current account of what AWSRT is, what it is not, how to start it, and what limitations remain.

## Non-goals

This subgoal does not introduce new experiments.

This subgoal does not alter the frozen v0.6 result pipeline.

This subgoal does not require Dockerization unless the local-install documentation process reveals that local installation is too fragile.

This subgoal does not promise that AWSRT is a polished public software product.

This subgoal does not attempt to document every internal API in full. Formal API pages can follow after the README and local installation path are stabilized.

This subgoal should not rewrite historical v0.1/v0.2 release files unless they are factually wrong. Historical files can retain historical terminology if doing so preserves auditability.

## Documentation Targets

### 1. README update

The top-level `README.md` should be updated so that it no longer reads as an older v0.2-era project description.

The README should include:

- expanded project title;
- short current description;
- what AWSRT is;
- what AWSRT is not;
- current project status;
- four-surface overview;
- v0.6 frozen result summary;
- quickstart or local run summary;
- repository structure;
- documentation links;
- known limitations;
- citation/publication notes if appropriate.

Suggested short description:

> AWSRT is a research tool for studying adaptive sensing, belief maintenance, information impairment, and usefulness under wildfire-like dynamic fields. It is not an operational wildfire simulator and does not claim high-fidelity physical prediction.

### 2. Local installation documentation

Create a local installation document if one does not already exist.

Suggested path:

`docs/install/local_install.md`

This document should include:

- expected operating system assumptions;
- Python/conda or virtual-environment requirements;
- Node/npm requirements for the frontend;
- backend installation steps;
- frontend installation steps;
- how to run the backend;
- how to run the frontend;
- how to check that the app is running;
- where data are stored;
- common troubleshooting notes.

The initial version can be honest and Mac/developer-centric if that is what has actually been tested. It is better to state the tested environment clearly than to imply portability that has not been verified.

### 3. v0.6 reproduction/readme note

Create or update a short note explaining the frozen v0.6 state.

Possible path:

`docs/install/reproduce_v0_6.md`

or:

`docs/reproducibility/reproduce_v0_6.md`

This should not attempt to re-document the entire v0.6 experimental history. It should point to the relevant design notes and explain the high-level artifact chain.

Minimum content:

- v0.6 release tag;
- main purpose of v0.6;
- key design notes from `v0_6_01` through `v0_6_10`;
- expected data/artifact assumptions;
- known limits of reproduction;
- note that v0.6 is a bounded research release, not an operational wildfire product.

### 4. Known limitations

The README or a separate document should state current limitations clearly.

Possible limitations:

- AWSRT is research software.
- Installation has not yet been tested broadly across machines.
- The frontend/backend are under active development.
- Some pages are prototype or research-instrument surfaces rather than polished product workflows.
- The Physical Surface uses structured wildfire-like fields and transformed fire artifacts; it is not a high-fidelity physical simulator.
- Some historical design notes preserve older terminology for auditability.
- v0.6 results are bounded transformed-real-fire results, not universal wildfire generalization.

### 5. Optional API documentation placeholder

Formal API documentation is useful but should not dominate this subgoal.

A minimal README section can point users to FastAPI's autogenerated docs when the backend is running, if applicable.

Example:

> When the backend is running, FastAPI route documentation may be available through the local API docs endpoint. A more complete route guide will be added in a later v0.7 subgoal.

Do not overbuild formal API pages before the basic README and installation path are clear.

## Recommended Work Sequence

### Step 1: Inspect current project metadata

Run:

```bash
sed -n '1,260p' pyproject.toml
sed -n '1,240p' frontend/package.json
sed -n '1,220p' Makefile
sed -n '1,220p' docs/README.md
sed -n '1,320p' README.md
```

Purpose: identify actual package names, Python version assumptions, frontend scripts, make targets, and existing docs structure before writing installation instructions.

### Step 2: Update README

Rewrite the top-level README around the current v0.7 framing.

Recommended README structure:

```text
# AWSRT — Adaptive Wildfire Sensing Research Tool

## Current status

## What AWSRT is

## What AWSRT is not

## Four surfaces

## v0.6 frozen result

## Quickstart

## Repository structure

## Documentation map

## Known limitations

## Citation / publications

## License
```

### Step 3: Add local install notes

Create:

```text
docs/install/local_install.md
```

Start with the actual tested development setup. Do not pretend the install is more general than it is.

The first version should probably include both:

- a generic Python virtual environment path, because that already appears in the existing README; and
- a tested conda path, because current development is being run from `PhD_general`.

### Step 4: Add v0.6 reproduction pointer

Create one concise reproduction pointer if needed.

Possible path:

```text
docs/reproducibility/reproduce_v0_6.md
```

or, if keeping install-related docs together:

```text
docs/install/reproduce_v0_6.md
```

### Step 5: Verify no stale top-level framing remains

Search for stale README-facing terms:

```bash
grep -R "digital twin\|physical twin\|AWSRT v0.2\|AWSRT v0.1\|high-fidelity\|research layers" -n README.md docs/install docs/reproducibility 2>/dev/null
```

Historical mentions may be acceptable in older design notes, but new shareable docs should avoid misleading framing.

## README Framing Draft

The README should open with something close to the following:

> AWSRT is the Adaptive Wildfire Sensing Research Tool, a research instrument for studying adaptive sensing, belief maintenance, information impairment, and usefulness under wildfire-like dynamic fields.
>
> The tool is organized around four research surfaces: a Physical Surface for structured environmental fields and transformed fire artifacts; an Epistemic Surface for maintained belief state and uncertainty; an Operational Surface for adaptive sensing policies and impairment response; and an Analysis Surface for metrics, manifests, and interpretation.
>
> AWSRT is not an operational wildfire simulator and does not claim high-fidelity physical prediction. Its purpose is to make separations between timing, information delivery, belief quality, and usefulness-state behavior inspectable under controlled experimental conditions.

## Installation Documentation Draft Scope

The first local-install document should answer only practical first-run questions:

1. What software do I need?
2. How do I create the Python environment?
3. How do I install frontend dependencies?
4. How do I start the backend?
5. How do I start the frontend?
6. What URL do I open?
7. Where does AWSRT write data?
8. How do I know the install worked?
9. What common failures should I expect?

Do not yet turn this into full deployment documentation.

## Suggested README Current-Status Text

The top-level README should include a current-status paragraph similar to:

> The current `main` branch includes the frozen AWSRT v0.6 result state and the beginning of v0.7 shareability updates. v0.6 is the distance-window and cross-artifact synthesis release used to support current thesis and journal-paper interpretation. v0.7 is focused on making the tool more coherent and shareable through updated terminology, documentation, installation notes, and usability improvements.

## Suggested v0.6 Result Summary Text

The README should summarize v0.6 at a high level:

> The frozen v0.6 result shows that normalized deployment geometry and observation-window structure strongly affect timing access, especially finite time-to-first-detection availability. Across the tested transformed real-fire artifacts, however, the compact usefulness triad remained condition-readable: healthy cases mapped to exploit-dominant behavior, delay cases to recover-dominant behavior, and noise cases to caution-dominant behavior. The result supports the thesis-level separation between timing access, information delivery, belief quality, and usefulness-state interpretation.

## Freeze Criteria

This subgoal can be frozen when:

1. The top-level README no longer reflects the old v0.2 framing.
2. The README expands AWSRT as Adaptive Wildfire Sensing Research Tool.
3. The README describes AWSRT as a research tool or research instrument, not as a physical/digital twin.
4. The README uses the four-surface framing.
5. A local installation document exists or the README contains a clearly marked local installation section.
6. Known limitations are documented.
7. The v0.6 frozen result is summarized or linked.
8. The working tree is clean and changes are committed.
9. No new experiments have been launched as part of this documentation subgoal.

## Recommended Next Subgoal

After Subgoal 03, the next likely step is:

`v0.7-subgoal-04: UI maturity pass`

Possible scope:

- hide or relabel prototype pages;
- add deletion spinner/status for Analysis Raw;
- improve incorrect deletion-key feedback;
- identify first-run usability issues after README/local-install cleanup.
