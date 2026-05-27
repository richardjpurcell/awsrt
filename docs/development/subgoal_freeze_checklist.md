# AWSRT Subgoal Freeze Checklist

Use this checklist before freezing, committing, and pushing an AWSRT subgoal.

AWSRT is a research instrument, not a polished public product. The goal is a lightweight validation habit: make sure the changed work is auditable, buildable, and does not accidentally disturb reproducibility.

---

## 1. Identify what changed

Use:

```bash
git status
git diff --stat
```

Classify the subgoal:

- docs only
- frontend change
- backend change
- schema / manifest / artifact-semantics change
- mixed change

---

## 2. Always do a manual sanity check

For any non-trivial change, verify the edited workflow directly.

Examples:

- open the changed frontend page;
- confirm the new control appears and behaves as expected;
- inspect generated JSON/manifest output if the change affects studies;
- call the changed backend route or exercise it through the UI;
- check that a new documentation file is in the intended location.

---

## 3. Frontend changes

If anything under `frontend/` changed, run:

```bash
npm --prefix frontend run build
```

This is stronger than the dev server. It catches TypeScript, syntax, routing, and Next.js production-build problems that may not appear during local interactive use.

Frontend build must pass before freezing a frontend-touching subgoal unless the failure is explicitly documented as unrelated and deferred.

---

## 4. Backend changes

If anything under `backend/` changed, run the most relevant backend check available.

General check:

```bash
python -m pytest backend/tests
```

For the backend smoke-test workflow, see backend_smoke_test.md.

Targeted check:

```bash
python -m pytest backend/tests/<relevant_test_file>.py
```

If no test exists for the touched area, do a manual API/UI smoke check and record what was checked.

---

## 5. Docs-only changes

For docs-only changes, run:

```bash
git diff --check
```

Confirm that the document path, title, and terminology match the current AWSRT framing.

---

## 6. Schema, manifest, or reproducibility-sensitive changes

Use extra caution if a change affects:

- manifest fields;
- schema names;
- artifact IDs;
- analysis table columns;
- reproducibility docs;
- v0.6 frozen behavior.

Ask:

- Does this rename an existing field?
- Does this break existing manifests?
- Does this change a thesis interpretation?
- Does this affect v0.6 reproducibility?
- Is a compatibility note needed?

Avoid backend schema renames unless a compatibility strategy is explicitly designed.

---

## 7. Review the final diff

Before committing:

```bash
git diff --stat
git diff --check
```

Optionally inspect changed files:

```bash
git diff
```

---

## 8. Commit

Stage only intended files:

```bash
git add <files>
git commit -m "<short action-oriented message>"
```

Good commit examples:

```text
Add batch deployment-origin case helper
Fix frontend production build typing
Wrap query-param pages in Suspense
Add subgoal freeze checklist
```

Avoid vague messages such as:

```text
updates
fix stuff
more changes
```

---

## 9. Confirm clean tree

After commit:

```bash
git status
```

Expected:

```text
nothing to commit, working tree clean
```

---

## 10. Push

Use the full ref form when pushing a subgoal branch:

```bash
git push origin refs/heads/<branch-name>
```

Example:

```bash
git push origin refs/heads/v0.7-subgoal-09
```

---

## Minimal freeze checklist

For most subgoals:

```text
1. Manual smoke check
2. Relevant validation command
   - frontend: npm --prefix frontend run build
   - backend: python -m pytest backend/tests or targeted test
   - docs: git diff --check
3. git diff --stat
4. git status
5. commit
6. git status clean
7. push branch
```
