# AWSRT v0.8 Subgoal 02 - Clean-Machine Install Verification

**Project:** AWSRT - Adaptive Wildfire Sensing Research Tool  
**Branch:** `v0.8-subgoal-02`  
**Design note:** `docs/design/v0_8_02_clean_machine_install_verification.md`  
**Status:** Draft design note  
**Date:** 2026-05-27

---

## 1. Purpose

This subgoal begins the implementation path for AWSRT v0.8 after the roadmap and backlog triage completed in Subgoal 01.

The v0.8 theme is:

```text
From shareable repository to reproducible handoff.
```

Subgoal 02 tests the most direct form of that claim:

> Can a technically capable new user clone the repository, install the required dependencies, start the backend and frontend, and confirm that AWSRT is reachable using only the repository documentation?

The purpose is not to add new features. The purpose is to inspect the actual setup path, identify where the handoff breaks or becomes unclear, and patch documentation or small setup defects only where needed.

---

## 2. Context from v0.8 Subgoal 01

Subgoal 01 created the v0.8 roadmap and backlog documents:

```text
docs/design/v0_8_01_roadmap_and_backlog_triage.md
docs/backlog/v0_8_backlog.md
```

Those documents identified clean-machine installation verification as the strongest next step because reproducible handoff depends on whether the repository can be used by someone outside the original development context.

Subgoal 02 should therefore move from planning to inspection.

---

## 3. Guiding question

The guiding question for this subgoal is:

> What would fail, confuse, or remain implicit if a new technical user tried to set up AWSRT from scratch?

A successful outcome does not require a perfect automated installer. It requires a clear, tested, documented path.

---

## 4. Scope

### 4.1 In scope

This subgoal may include:

- inspecting the current installation documentation;
- checking Python and Node version assumptions;
- checking whether the backend starts from the documented command;
- checking whether the frontend installs/builds/starts from the documented command;
- documenting the minimum known-good command sequence;
- documenting expected environment assumptions;
- adding a clean-machine verification note;
- making small documentation patches to install or docs index files;
- making small code or config patches only if setup exposes a real defect.

### 4.2 Out of scope

This subgoal should not:

- rerun v0.6 experiments;
- modify experimental interpretation;
- change policy logic;
- change impairment semantics;
- redesign frontend pages;
- redesign backend architecture;
- add broad CI infrastructure before the manual path is understood;
- solve every dependency or packaging problem at once;
- turn AWSRT into a packaged product.

---

## 5. Working principle

Inspect before patching.

This subgoal should begin by reading the current repository state and running the documented commands as written. Documentation should be patched only after actual gaps or ambiguities are observed.

The preferred change style is:

```text
small
additive
reversible
documentation-first
```

If a code or configuration change becomes necessary, it should be justified by a specific setup failure discovered during inspection.

---

## 6. Candidate files to inspect

Start with the current documentation and project metadata:

```bash
sed -n '1,260p' README.md
sed -n '1,260p' docs/README.md
sed -n '1,260p' docs/install/local_install.md
sed -n '1,260p' docs/reproducibility/reproduce_v0_6.md
sed -n '1,260p' docs/backlog/v0_8_backlog.md
find . -maxdepth 3 -iname '*requirements*' -o -iname 'pyproject.toml' -o -iname 'environment.yml' -o -iname 'package.json'
find backend -maxdepth 3 -type f | sort | sed -n '1,220p'
find frontend -maxdepth 2 -type f | sort | sed -n '1,220p'
```

The purpose of this first inspection is to determine what setup files exist and what the documentation currently claims.

---

## 7. Candidate verification path

The exact commands should be adjusted based on inspection, but the likely verification path is below.

### 7.1 Repository state

```bash
git status
git branch --show-current
```

Expected branch:

```text
v0.8-subgoal-02
```

### 7.2 Python environment

Confirm the active Python environment and version:

```bash
which python
python --version
python -m pip --version
```

If the repository uses a conda environment, confirm:

```bash
conda info --envs
```

### 7.3 Backend dependency and import check

Inspect before choosing the command. Possible checks include:

```bash
python -m pip install -r requirements.txt
```

or, if backend-specific requirements exist:

```bash
python -m pip install -r backend/requirements.txt
```

Then run a narrow import or startup check. Likely backend startup command:

```bash
python -m uvicorn api.main:app --reload --port 8000
```

If that command must be run from a specific directory, document the directory explicitly.

### 7.4 Backend health check

If a health route exists, verify it in a second terminal:

```bash
curl http://127.0.0.1:8000/health
```

If the health endpoint path is different, document the actual path.

### 7.5 Frontend dependency and build check

Likely frontend setup:

```bash
npm --prefix frontend install
npm --prefix frontend run build
```

If the project prefers `npm ci`, document when to use it.

### 7.6 Frontend local run check

Likely frontend startup:

```bash
npm --prefix frontend run dev
```

Then inspect the local URL printed by Next.js, likely:

```text
http://localhost:3000
```

Document the expected visible success condition, such as the AWSRT landing page or a specific surface page loading.

---

## 8. Expected deliverables

The likely primary deliverable is:

```text
docs/install/clean_machine_check.md
```

This document should record:

- what was checked;
- the expected setup path;
- known-good command sequence;
- backend startup command;
- frontend setup/build/start commands;
- expected success indicators;
- known assumptions or limitations;
- what remains for later v0.8 work.

Possible secondary edits:

```text
docs/install/local_install.md
docs/README.md
README.md
```

These should be edited only if inspection shows that the current entry points are incomplete or misleading.

---

## 9. Suggested structure for `docs/install/clean_machine_check.md`

```markdown
# AWSRT Clean-Machine Check

## Purpose

## Scope

## Tested environment

## Repository state

## Python/backend setup

## Backend smoke check

## Node/frontend setup

## Frontend build check

## Frontend run check

## Known assumptions

## Known limitations

## Follow-up items
```

The file should distinguish between:

- commands that were actually tested;
- commands that are expected but not yet tested;
- known limitations;
- future improvements.

---

## 10. Success criteria

Subgoal 02 can be considered successful when:

1. The current install/run documentation has been inspected.
2. Python and Node assumptions have been identified.
3. A backend startup or smoke path has been checked or clearly documented as blocked.
4. A frontend install/build/start path has been checked or clearly documented as blocked.
5. Any discovered documentation gaps have been patched.
6. A clean-machine check document has been added or the existing install documentation has been updated with equivalent information.
7. No experimental logic or v0.6 interpretation has changed.
8. Any code/config changes, if needed, are small and directly tied to setup failure.
9. `git diff --check` passes.
10. Relevant validation commands pass or their failures are explicitly documented.
11. The working tree is clean before freeze.

---

## 11. Validation expectations

For documentation-only changes:

```bash
git diff --check
git status
```

For frontend changes or frontend verification:

```bash
npm --prefix frontend run build
```

For backend verification, use the narrowest reliable command identified during inspection. Candidate examples:

```bash
python -m pytest backend/tests
```

or:

```bash
python -m uvicorn api.main:app --port 8000
curl http://127.0.0.1:8000/health
```

Do not require a full backend test suite unless it is already reliable and documented.

---

## 12. Freeze criteria

Before freezing Subgoal 02:

```bash
git diff --check
git status
```

If frontend setup/build was touched or verified:

```bash
npm --prefix frontend run build
```

If backend setup was touched or verified, record the backend command that passed.

The working tree should be clean after commit.

---

## 13. Suggested commit message

If the subgoal only adds documentation:

```text
Add clean-machine install check documentation
```

If small setup fixes are also needed:

```text
Document and harden clean-machine setup path
```

---

## 14. Expected outcome

At the end of Subgoal 02, AWSRT should have a clearer, more trustworthy setup path for outside readers.

The repository should be closer to the v0.8 goal:

```text
From shareable repository to reproducible handoff.
```

The next likely subgoal after this is:

```text
v0.8-subgoal-03 - Minimal reproducible first-run workflow
```

Subgoal 03 should build on the setup path confirmed here by showing a concise first-run workflow through the tool itself.
