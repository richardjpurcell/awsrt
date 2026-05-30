# AWSRT v0.8 Subgoal 07 — Repository Metadata and Hygiene Cleanup

**Project:** AWSRT — Adaptive Wildfire Sensing Research Tool  
**Branch:** `v0.8-subgoal-07`  
**Design note:** `docs/design/v0_8_07_repository_metadata_and_hygiene_cleanup.md`  
**Status:** Draft design note  
**Date:** 2026-05-30  

---

## 1. Purpose

This subgoal follows the v0.8 JOSS/community readiness review completed in Subgoal 06.

The v0.8 theme remains:

```text
From shareable repository to reproducible handoff.
```

Subgoal 06 found that AWSRT is now substantially more handoff-ready, with install, first-run, backend, and frontend validation workflows documented. It also identified several small repository metadata and hygiene issues that should be handled deliberately before v0.8 consolidation.

The purpose of Subgoal 07 is to clean up low-risk repository metadata and ignore-file hygiene issues that affect community/JOSS readability but do not change AWSRT behavior.

This subgoal should remain narrow.

---

## 2. Relationship to previous v0.8 subgoals

### Subgoal 01

Established the v0.8 roadmap and backlog:

```text
docs/design/v0_8_01_roadmap_and_backlog_triage.md
docs/backlog/v0_8_backlog.md
```

### Subgoal 02

Verified local installation and created/updated:

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

Documented backend smoke-test workflow:

```text
docs/development/backend_smoke_test.md
```

### Subgoal 05

Documented frontend build/runtime check workflow:

```text
docs/development/frontend_build_check.md
```

### Subgoal 06

Reviewed JOSS/community readiness:

```text
docs/development/joss_community_readiness_review.md
```

Subgoal 07 should act on the low-risk metadata/hygiene issues identified there.

---

## 3. Guiding question

The guiding question for this subgoal is:

> What small metadata and repository-hygiene fixes improve community readability without changing AWSRT behavior or reopening scientific interpretation?

---

## 4. Scope

### 4.1 In scope

This subgoal may include:

- inspecting `.gitignore`;
- adding ignore rules for local/generated files if missing;
- confirming that local `.DS_Store`, `__pycache__`, `.pytest_cache`, and `.next` files are not tracked;
- updating `LICENSE` placeholder-style holder text if the correct holder is clear;
- updating `CITATION.cff` wording so it matches the current AWSRT research-instrument framing;
- documenting any deferred metadata issues;
- updating `docs/README.md` only if the new design note or metadata note needs discoverability.

### 4.2 Out of scope

This subgoal should not:

- change backend code behavior;
- change frontend code behavior;
- rerun or reinterpret v0.6 results;
- fix npm audit warnings;
- upgrade dependencies;
- add CI;
- create `CONTRIBUTING.md`, `SUPPORT.md`, or `CODE_OF_CONDUCT.md` unless explicitly decided;
- draft a JOSS paper;
- tag v0.8.

---

## 5. Candidate issues from Subgoal 06

Subgoal 06 identified the following candidate metadata/hygiene issues.

### 5.1 License holder placeholder

The current `LICENSE` file was observed to contain placeholder-style text:

```text
Copyright (c) [2026], [Adaptive Wildfire Sensing Research Tool]
```

For community readiness, this should be replaced with the correct rights holder if known.

Candidate replacement:

```text
Copyright (c) 2026, Richard Purcell
```

This should only be applied if that is the intended holder. If institutional/legal ownership is uncertain, leave the license unchanged and record the issue as deferred.

### 5.2 CITATION.cff stale framing/version

The current `CITATION.cff` was observed to be stale relative to v0.8 and to include wording that may invite simulator-oriented interpretation.

Candidate concerns:

- `version: "v0.1"` may be stale;
- `date-released: "2026-04-05"` may be stale;
- the abstract says AWSRT supports “wildfire simulation and replay,” which may be less aligned with the current research-instrument framing.

Recommended approach:

- avoid claiming a v0.8 release until v0.8 is actually tagged;
- update abstract wording if doing so does not create citation/version ambiguity;
- consider whether version/date should remain deferred until v0.8 consolidation.

### 5.3 Git ignore coverage

Subgoal 06 observed many local generated files in the working tree, including:

```text
.DS_Store
__pycache__
.pytest_cache
```

They were not tracked by Git, which is good.

This subgoal should inspect `.gitignore` and add missing patterns if needed:

```text
.DS_Store
__pycache__/
*.py[cod]
.pytest_cache/
frontend/.next/
```

Potentially useful but more project-specific patterns:

```text
node_modules/
frontend/node_modules/
frontend/.env.local
```

Be careful not to ignore research result directories unless explicitly intended.

### 5.4 Optional local cleanup

If `.gitignore` already protects these files, the subgoal may optionally remove local generated files from the working tree.

However, do this carefully.

Safe cleanup candidates:

```bash
find . -name '.DS_Store' -delete
find . -type d -name '__pycache__' -prune -exec rm -rf {} +
rm -rf backend/.pytest_cache
```

Do not remove `data/`, `results/`, manifests, fields, metrics, or render artifacts unless explicitly intended.

Local cleanup does not need to be committed unless tracked files are affected.

---

## 6. Suggested inspection commands

Start by inspecting metadata files:

```bash
sed -n '1,220p' .gitignore
sed -n '1,120p' LICENSE
sed -n '1,220p' CITATION.cff
git status
```

Check tracked hygiene-sensitive files:

```bash
git ls-files | grep -E '(^|/)(\.DS_Store|__pycache__|\.pytest_cache|\.next|node_modules)(/|$)' || true
```

Check local generated files:

```bash
find . -name '.DS_Store' -o -path '*/__pycache__/*' -o -path '*/.pytest_cache/*' | sort
```

Check whether frontend local environment files are ignored:

```bash
git check-ignore -v frontend/.env.local || true
git check-ignore -v frontend/.next || true
git check-ignore -v .DS_Store || true
git check-ignore -v backend/.pytest_cache || true
```

---

## 7. Candidate patch decisions

### Decision A — `.gitignore`

Likely safe to patch if missing.

Expected patch type:

```text
Add local OS/cache/build ignore patterns
```

This is low-risk and should not affect behavior.

### Decision B — `LICENSE`

Patch only if the rights holder is clear.

If the holder is Richard Purcell, update the copyright line.

If not clear, leave unchanged and record deferred.

### Decision C — `CITATION.cff`

There are two possible approaches.

#### Conservative approach

Do not change version/date until v0.8 is tagged. Only update abstract wording to align with the current research-instrument framing.

#### Release-aligned approach

Defer all citation metadata changes to v0.8 consolidation, when a release/tag decision is made.

Recommended for this subgoal:

```text
Conservative wording update only, unless version/date decision is clear.
```

### Decision D — local cleanup

Optional. If done, cleanup should affect only untracked generated/cache files.

No commit should be created solely for local cleanup unless `.gitignore` changes are also made.

---

## 8. Expected deliverables

Likely deliverables:

```text
docs/design/v0_8_07_repository_metadata_and_hygiene_cleanup.md
```

Possible changed files:

```text
.gitignore
LICENSE
CITATION.cff
docs/README.md
docs/development/joss_community_readiness_review.md
```

The subgoal may also produce no additional documentation beyond this design note if the metadata patches are self-explanatory.

---

## 9. Validation expectations

At freeze, run:

```bash
git diff --check
git status
```

If only metadata/docs files change, frontend/backend validation is not required.

If `.gitignore` changes, confirm expected ignore behavior:

```bash
git check-ignore -v .DS_Store || true
git check-ignore -v backend/.pytest_cache || true
git check-ignore -v frontend/.next || true
git check-ignore -v frontend/.env.local || true
```

If `CITATION.cff` changes, optionally inspect it with:

```bash
sed -n '1,220p' CITATION.cff
```

No frontend build or backend pytest is required unless code files are touched.

---

## 10. Non-goals

Subgoal 07 should not:

- add broad governance files;
- create a JOSS paper;
- change code behavior;
- change schema compatibility;
- change experiment outputs;
- rerun v0.6;
- upgrade dependencies;
- remediate npm vulnerabilities;
- tag v0.8.

This is a metadata and hygiene cleanup pass only.

---

## 11. Freeze criteria

Subgoal 07 can be frozen when:

1. `.gitignore` coverage has been inspected and patched if needed.
2. `LICENSE` placeholder issue has been fixed or explicitly deferred.
3. `CITATION.cff` stale/framing issue has been fixed or explicitly deferred.
4. No code behavior has changed.
5. `git diff --check` passes.
6. The working tree is clean.
7. Changes are committed and pushed.

---

## 12. Suggested commit messages

For the design note:

```text
Add repository metadata hygiene design
```

For `.gitignore` cleanup:

```text
Update ignore rules for local generated files
```

For license/citation metadata:

```text
Update repository metadata for community readiness
```

For a combined small metadata patch:

```text
Clean up repository metadata for community readiness
```

---

## 13. Expected outcome

At the end of Subgoal 07, AWSRT should have cleaner repository metadata and better protection against local generated-file noise.

This should make the repository easier to inspect before the next higher-level handoff step, likely committee-facing orientation or v0.8 consolidation.
