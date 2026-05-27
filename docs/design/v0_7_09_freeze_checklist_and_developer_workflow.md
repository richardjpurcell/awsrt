# AWSRT v0.7 Subgoal 09 — Freeze Checklist and Developer Workflow

**Project:** AWSRT — Adaptive Wildfire Sensing Research Tool  
**Branch:** `v0.7-subgoal-09`  
**Design note:** `docs/design/v0_7_09_freeze_checklist_and_developer_workflow.md`  
**Status:** Draft design note  
**Date:** 2026-05-27

---

## 1. Purpose

This subgoal creates a lightweight, repeatable workflow for freezing AWSRT development subgoals.

The immediate motivation comes from v0.7 Subgoals 07 and 08. Subgoal 07 added Analysis Batch deployment-origin case support. During validation, the frontend appeared to work locally, but `npm --prefix frontend run build` exposed production-build and TypeScript issues that the development server had not made obvious. Subgoal 08 then fixed the remaining production-build issue around `useSearchParams()` and Suspense boundaries.

The lesson is simple:

> A subgoal is not fully safe to freeze just because the local dev server appears to work.

AWSRT should now have a small, documented freeze checklist so that future subgoals remain buildable, auditable, and reproducible without turning the project into a polished public product or adding unnecessary process burden.

---

## 2. Framing

AWSRT is a research instrument, not a commercial software product. The workflow should therefore be modest.

The aim is not to introduce heavyweight engineering ceremony. The aim is to prevent avoidable breakage as the tool becomes more shareable for:

- thesis defense review;
- future local development;
- reproducibility checks;
- committee-facing demonstrations;
- possible future external collaborators.

This subgoal asks:

> What minimal validation workflow should AWSRT use after each subgoal so that the research tool remains buildable, auditable, and reproducible without over-formalizing development?

---

## 3. Background from recent subgoals

### 3.1 Subgoal 07 lesson

Subgoal 07 added a frontend helper for Analysis Batch deployment-origin cases. It made geometry variation explicit by materializing ordinary sweep cases with `network.base_station_rc` overrides.

Manual UI validation succeeded:

```text
usefulness_family preset
→ apply v0.6 three-origin reference set
→ 9 origin × condition cases appear
→ each generated override contains network.base_station_rc
```

However, frontend build validation exposed additional issues elsewhere in the frontend. These were not caused by the Subgoal 07 feature, but they mattered for shareability.

### 3.2 Subgoal 08 lesson

Subgoal 08 resolved the production-build failure caused by `useSearchParams()` usage in query-parameter-driven pages.

The frontend build then completed successfully:

```text
npm --prefix frontend run build
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
```

This confirmed that production build validation is a useful freeze criterion for frontend-facing work.

---

## 4. Scope

### 4.1 In scope

This subgoal may add:

- a developer-facing freeze checklist document;
- clear guidance on when to run frontend build validation;
- clear guidance on when to run backend checks;
- a short branch/commit/push convention;
- a distinction between manual smoke checks and production build checks;
- a lightweight definition of what it means to “freeze” a subgoal;
- notes on what to do when validation exposes unrelated pre-existing issues.

### 4.2 Out of scope

This subgoal should not add:

- GitHub Actions;
- CI/CD infrastructure;
- release automation;
- packaging automation;
- a full test-suite redesign;
- public contributor-guide polish;
- pre-commit hooks;
- automated deployment;
- large changes to README structure unless explicitly chosen.

This is a workflow/documentation subgoal, not an automation subgoal.

---

## 5. Candidate output document

The likely output document is:

```text
docs/development/subgoal_freeze_checklist.md
```

Alternative locations:

```text
docs/development/developer_workflow.md
docs/reproducibility/subgoal_freeze_checklist.md
docs/install/local_install.md
```

The recommended location is:

```text
docs/development/subgoal_freeze_checklist.md
```

because this is primarily a developer workflow note, not a reproducibility artifact and not an installation guide.

If `docs/development/` does not yet exist, this subgoal may create it.

---

## 6. Proposed freeze checklist

A subgoal should normally be frozen only after the following checks are considered.

### 6.1 Always

```bash
git status
```

Expected result before final commit/push:

```text
nothing to commit, working tree clean
```

Also check the recent commit sequence:

```bash
git log --oneline -5
```

### 6.2 If frontend files changed

Run:

```bash
npm --prefix frontend run build
```

This should be considered the primary frontend validation command because it catches problems that the development server may not expose.

Frontend files include:

```text
frontend/app/...
frontend/components/...
frontend/lib/...
frontend/package.json
frontend/package-lock.json
```

A successful build should complete without TypeScript, syntax, or Next.js production-build errors.

Warnings may be acceptable if they are known and non-blocking, but they should be noted.

### 6.3 If backend files changed

Use the most appropriate backend validation available for the touched area.

Potential checks include:

```bash
python -m pytest backend/tests
```

or, for a narrower targeted check:

```bash
python -m pytest backend/tests/<relevant_test_file>.py
```

If no applicable test exists, run a manual API or UI smoke test and record what was checked.

Backend files include:

```text
backend/api/...
backend/awsrt_core/...
backend/tests/...
```

### 6.4 If docs only changed

For docs-only subgoals, build/test commands are optional unless the docs contain generated artifacts, commands, or links that should be verified.

At minimum:

```bash
git status
git diff --check
```

### 6.5 If schemas or manifest semantics changed

Use extra caution.

Schema or manifest changes require a compatibility note unless the change is explicitly internal and non-breaking.

Ask:

- Does this rename an existing field?
- Does this invalidate existing manifests?
- Does this affect v0.6 reproducibility?
- Does this change a research interpretation?
- Does this require a migration or compatibility path?

For v0.7, avoid backend schema renames unless a compatibility strategy is explicitly designed.

---

## 7. Manual smoke checks

Manual checks remain useful because AWSRT is an interactive research tool.

Examples:

### 7.1 Frontend UI change

Check that the edited page loads and the changed control behaves as intended.

Example from Subgoal 07:

```text
Analysis → Batch
choose usefulness_family preset
apply preset
apply v0.6 origin set
confirm 9 generated cases
confirm each override contains network.base_station_rc
```

### 7.2 Visualizer change

Check that the relevant visualizer loads an existing artifact and that the edited display/control behaves as intended.

### 7.3 Backend route change

Check that the relevant route responds through the UI or direct API call.

### 7.4 Documentation change

Check that the file is in the intended path, has a clear title, and does not conflict with existing terminology.

---

## 8. Handling validation failures

Validation failures should be classified before patching.

### A. Directly caused by the current subgoal

Fix before freezing.

Example:

```text
New frontend helper introduces TypeScript error.
```

### B. Nearby pre-existing issue exposed by validation

Usually fix in a separate commit if small.

Example from Subgoal 07 validation:

```text
A missing ComparisonAxis help entry caused a TypeScript build failure.
```

### C. Broader project issue outside current scope

Document and defer unless it blocks the subgoal.

Example:

```text
ESLint setup requires dependency decisions unrelated to the current UI patch.
```

### D. Production-build issue affecting shareability

If the subgoal is about shareability or frontend hardening, fix it. Otherwise document as a known issue and decide whether to create a follow-on subgoal.

---

## 9. Commit style

Prefer small, meaningful commits.

A typical subgoal may have:

```text
1. Add design note
2. Implement feature
3. Fix validation issue
```

or:

```text
1. Implement feature and design note
2. Fix build typing
```

Good commit messages are short and action-oriented:

```text
Add batch deployment-origin case helper
Fix frontend production build typing
Wrap query-param pages in Suspense
```

Avoid vague messages such as:

```text
updates
fix stuff
more changes
```

---

## 10. Branch and push convention

Use subgoal branches:

```bash
git checkout -b v0.7-subgoal-09
```

Push with the full ref form when useful:

```bash
git push origin refs/heads/v0.7-subgoal-09
```

This avoids ambiguity and matches recent successful branch-push practice.

---

## 11. Suggested document structure for the checklist

The developer-facing checklist should be short enough to use repeatedly.

Possible structure:

```text
# AWSRT Subgoal Freeze Checklist

## Purpose
## Quick checklist
## Frontend checks
## Backend checks
## Docs-only checks
## Manual smoke checks
## Handling failures
## Commit and push
## What “frozen” means
```

The checklist should be practical, not discursive.

The design note can explain why the checklist exists; the checklist itself should be concise.

---

## 12. Proposed implementation steps

1. Create this design note:
   ```text
   docs/design/v0_7_09_freeze_checklist_and_developer_workflow.md
   ```

2. Create:
   ```text
   docs/development/subgoal_freeze_checklist.md
   ```

3. Keep the development checklist concise.

4. Optionally add a short pointer from `README.md` or `docs/install/local_install.md`, but do not do this unless it is clearly useful.

5. Run:
   ```bash
   git diff --check
   ```

6. Because this is documentation-only, frontend build is optional. However, if the subgoal touches README commands or frontend workflow notes, consider running:
   ```bash
   npm --prefix frontend run build
   ```

7. Commit.

---

## 13. Non-goals and cautions

Do not overbuild.

This subgoal should not turn into:

- CI setup;
- public contributor onboarding;
- release management;
- versioning policy;
- packaging policy;
- code-style standardization;
- broad README rewrite.

The right output is a small internal workflow aid.

---

## 14. Freeze criteria

Subgoal 09 can be frozen when:

1. The design note exists.
2. A concise developer-facing freeze checklist exists.
3. The checklist distinguishes frontend, backend, docs-only, and schema/manifest changes.
4. The checklist includes `npm --prefix frontend run build` for frontend-touching subgoals.
5. The checklist includes `git status` and commit/push guidance.
6. No backend or frontend behavior is changed unless explicitly chosen.
7. The working tree is clean.
8. Changes are committed.
9. The branch is pushed to GitHub.

---

## 15. Suggested commit messages

For design note only:

```text
Add subgoal freeze workflow design note
```

For the design note plus development checklist:

```text
Add subgoal freeze checklist
```

If a README pointer is also added:

```text
Document subgoal freeze workflow
```

---

## 16. Expected result

After this subgoal, AWSRT should have a documented, repeatable end-of-subgoal workflow.

The intended practical effect is that future work ends with a small but meaningful validation habit:

```text
manual smoke check when relevant
npm --prefix frontend run build when frontend changed
backend tests or targeted smoke check when backend changed
git status clean
commit
push
```

This supports the v0.7 goal of making AWSRT more coherent, shareable, and defensible as a research instrument without pretending it is a polished public product.
