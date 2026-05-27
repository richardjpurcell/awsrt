# AWSRT v0.7 Subgoal 10 — README and Documentation Index Alignment

**Project:** AWSRT — Adaptive Wildfire Sensing Research Tool  
**Branch:** `v0.7-subgoal-10`  
**Design note:** `docs/design/v0_7_10_readme_and_docs_index_alignment.md`  
**Status:** Draft design note  
**Date:** 2026-05-27

---

## 1. Purpose

This subgoal aligns the root `README.md` and documentation map with the v0.7 shareability work completed so far.

The current README already gives a strong research-facing overview of AWSRT as a research instrument for adaptive sensing, belief maintenance, information impairment, and usefulness under wildfire-like dynamic fields. It correctly avoids presenting AWSRT as an operational wildfire simulator, a physical twin, or a digital twin.

However, recent v0.7 work has added several useful documentation files and developer workflow notes that should now be discoverable from the README and/or a documentation index.

The purpose of this subgoal is therefore:

> Make the root README and documentation map accurately point to the current v0.7 installation, reproducibility, development, and design documentation without rewriting the whole README or changing AWSRT's research framing.

This is a documentation-alignment subgoal, not a new feature subgoal.

---

## 2. Current README reference

The current root `README.md` already includes the following major sections:

- project title and research-instrument framing;
- current status;
- what AWSRT is;
- what AWSRT is not;
- four research surfaces:
  - Physical Surface;
  - Epistemic Surface;
  - Operational Surface;
  - Analysis Surface;
- frozen v0.6 result summary;
- core capabilities;
- repository structure;
- quickstart;
- render configuration;
- smoke test;
- documentation map;
- known limitations;
- citation and publications;
- license.

This structure is good and should be preserved.

The likely issue is not the README's conceptual framing. The issue is that the documentation map and quickstart sections may now lag behind newly added v0.7 docs.

---

## 3. Recent documentation additions to account for

Recent v0.7 subgoals added or referenced documents such as:

```text
docs/install/local_install.md
docs/reproducibility/reproduce_v0_6.md
docs/development/subgoal_freeze_checklist.md
docs/design/v0_7_07_batch_origin_cases_geometry_study_design.md
docs/design/v0_7_08_frontend_production_build_hardening.md
docs/design/v0_7_09_freeze_checklist_and_developer_workflow.md
```

Earlier v0.7 work also improved:

- README framing;
- local install documentation;
- v0.6 reproducibility documentation;
- UI maturity notes;
- Physical Surface abstraction language;
- movement/path auditability;
- deployment-origin case support;
- frontend production-build hardening;
- subgoal freeze workflow.

These should be discoverable without requiring someone to search the commit history or know the subgoal sequence.

---

## 4. Initial question

The guiding question is:

> How should the root README and documentation index guide a new reader from the high-level AWSRT framing to the right installation, reproducibility, development, and design documents?

A good outcome is that a committee member, future collaborator, or future version of the developer can answer:

- What is AWSRT?
- How do I run it locally?
- How do I reproduce the frozen v0.6 result state?
- Where are the design notes?
- Where is the subgoal freeze checklist?
- What should I not over-interpret AWSRT as doing?

---

## 5. Scope

### 5.1 In scope

This subgoal may:

- update the root `README.md` documentation map;
- add or update `docs/README.md` if it exists or should exist;
- add links to:
  - local installation instructions;
  - v0.6 reproducibility instructions;
  - developer freeze checklist;
  - design notes directory;
- clarify that v0.7 is shareability and documentation work, not a new experimental evidence base;
- add a short "Developer workflow" pointer;
- keep Quickstart concise while pointing to detailed install docs;
- ensure terminology matches the four research surfaces.

### 5.2 Out of scope

This subgoal should not:

- rewrite the full README;
- change research claims;
- change the v0.6 result summary;
- change backend or frontend code;
- alter installation behavior;
- add CI/CD;
- add new experiments;
- change manifests or artifacts;
- rename AWSRT surfaces or schemas;
- turn the README into a polished public-product landing page.

---

## 6. Likely files to inspect

Start with:

```bash
ls docs
find docs -maxdepth 2 -type f | sort
```

Then inspect key docs:

```bash
sed -n '1,220p' README.md
sed -n '220,520p' README.md
```

If present:

```bash
sed -n '1,220p' docs/README.md
sed -n '1,220p' docs/install/local_install.md
sed -n '1,220p' docs/reproducibility/reproduce_v0_6.md
sed -n '1,220p' docs/development/subgoal_freeze_checklist.md
```

If `docs/README.md` is missing, decide whether to add one.

---

## 7. Classification of findings

Classify the documentation state as follows.

### A. README framing already correct

Preserve the existing conceptual framing if it continues to state that AWSRT is:

- a research instrument;
- not a high-fidelity wildfire simulator;
- not a physical/digital twin;
- focused on adaptive sensing, belief maintenance, impairment, and usefulness.

### B. README documentation map stale or incomplete

Patch the documentation map rather than rewriting the README.

Likely additions:

```text
docs/install/local_install.md
docs/reproducibility/reproduce_v0_6.md
docs/development/subgoal_freeze_checklist.md
docs/design/
```

### C. Quickstart duplicates detailed install docs

If the README Quickstart is adequate, keep it short and add a pointer:

```text
For fuller local setup details, see docs/install/local_install.md.
```

Avoid duplicating long install instructions in two places.

### D. No docs index exists

If `docs/README.md` is absent, add a concise documentation index.

### E. Existing docs index exists but is stale

Update it to include the new install, reproducibility, development, and design paths.

---

## 8. Candidate README patch areas

The most likely README sections to touch are:

### 8.1 Current status

Add a short note that v0.7 now includes shareability and developer-workflow documentation.

Avoid implying that v0.7 changes the frozen v0.6 result evidence.

### 8.2 Repository structure

Ensure the repository structure mentions:

```text
docs/install/          Local installation and setup notes
docs/reproducibility/ Reproduction instructions for frozen result states
docs/development/     Developer workflow and subgoal freeze checklist
```

### 8.3 Quickstart

Keep the current quickstart but add:

```text
For more detailed setup instructions, see docs/install/local_install.md.
```

### 8.4 Smoke test

Optionally add:

```text
For frontend-touching development work, run npm --prefix frontend run build before freezing a subgoal.
```

This may fit better in a developer workflow pointer than in the smoke test section.

### 8.5 Documentation map

Update this section most directly.

Candidate map:

```text
docs/install/local_install.md
  Local development setup.

docs/reproducibility/reproduce_v0_6.md
  Frozen v0.6 reproduction notes.

docs/development/subgoal_freeze_checklist.md
  Lightweight freeze checklist for future subgoals.

docs/design/
  Versioned design notes and subgoal plans.
```

---

## 9. Candidate `docs/README.md`

If a docs index is added, it should be short.

Suggested structure:

```markdown
# AWSRT Documentation Index

## Start here
- Root README
- Local install
- v0.6 reproducibility

## Development workflow
- Subgoal freeze checklist

## Design notes
- docs/design/

## Historical notes
- v0.1/v0.2 reproducibility/version files
```

The docs index should not repeat the full README. It should help readers find the right file.

---

## 10. Terminology constraints

Preserve the current v0.7 terminology:

- AWSRT is a research instrument.
- Use "wildfire-like" for experimental fields.
- Use "Physical Surface", "Epistemic Surface", "Operational Surface", and "Analysis Surface".
- Avoid "digital twin" except when explicitly saying AWSRT is not one.
- Avoid operational deployment claims.
- Treat deployment geometry as a structural experimental variable.
- Treat v0.6 evidence as bounded, transformed-real-fire evidence.

---

## 11. Validation plan

Because this is documentation-only, validation is lightweight.

Run:

```bash
git diff --check
git status
```

Optionally inspect the rendered Markdown in an editor or GitHub preview.

If README links are changed, verify that the target files exist:

```bash
test -f docs/install/local_install.md
test -f docs/reproducibility/reproduce_v0_6.md
test -f docs/development/subgoal_freeze_checklist.md
```

If `docs/README.md` is added:

```bash
test -f docs/README.md
```

No frontend build is required unless frontend files are touched.

---

## 12. Proposed implementation steps

1. Inspect current docs layout:

   ```bash
   find docs -maxdepth 2 -type f | sort
   ```

2. Decide whether `docs/README.md` exists and whether it should be updated or created.

3. Patch the root `README.md` documentation map and possibly repository structure.

4. Add or update `docs/README.md`.

5. Run:

   ```bash
   git diff --check
   git diff --stat
   git status
   ```

6. Commit.

---

## 13. Non-goals and cautions

Do not let this become a README rewrite.

The root README already has a useful structure and a careful research framing. This subgoal should mainly improve discoverability and alignment with the v0.7 documentation surface.

Avoid adding new scientific claims. Avoid making v0.7 sound like a new experimental release. Avoid changing v0.6 interpretation.

---

## 14. Freeze criteria

Subgoal 10 can be frozen when:

1. The design note exists.
2. The root README documentation map points to current v0.7 docs.
3. The local install, v0.6 reproducibility, and subgoal freeze checklist docs are discoverable.
4. `docs/README.md` is added or updated if useful.
5. The README still preserves AWSRT's research-instrument framing.
6. No backend or frontend code is changed.
7. `git diff --check` passes.
8. The working tree is clean.
9. Changes are committed.
10. The branch is pushed to GitHub.

---

## 15. Suggested commit messages

If only README is updated:

```text
Update README documentation map
```

If README and docs index are updated:

```text
Align README and docs index
```

If a new docs index is created:

```text
Add documentation index
```

---

## 16. Expected outcome

After this subgoal, a reader should be able to start at the root README and quickly find:

- what AWSRT is;
- what AWSRT is not;
- how to run it locally;
- how to reproduce the frozen v0.6 result state;
- where design notes live;
- how development subgoals should be frozen.

This supports the v0.7 objective: make AWSRT more coherent and shareable as a research instrument without over-polishing it into a public product.
