# AWSRT v0.7 Subgoal 04: UI Maturity Pass

## Status

Draft design note.

## Branch

`v0.7-subgoal-04`

## Purpose

Improve the immediate usability and maturity of the AWSRT frontend after the v0.7 terminology and documentation updates.

Subgoal 02 aligned the frontend around the four-surface framing. Subgoal 03 updated the README and installation/reproduction documentation. Subgoal 04 now addresses small but visible usability issues that could confuse a defence committee member, outside reader, or future developer during first contact with the app.

The goal is not to redesign AWSRT. The goal is to reduce misleading or unfinished-feeling interface behavior while keeping the app clearly framed as research software.

## Context

AWSRT v0.7 is focused on making the tool coherent and shareable after the frozen v0.6 result state.

The current priority is not new experiments. The current priority is making the existing app easier to understand, less misleading, and safer to operate during basic inspection.

Known immediate UI concerns include:

- some prototype pages may appear more mature than they are;
- Analysis Raw deletion currently lacks sufficient progress/error feedback;
- page labels and surface framing have improved, but some pages may still need maturity cues;
- first-run usability should be checked after the README and local-install documentation updates.

## Non-goals

This subgoal does not reopen the frozen v0.6 evidence base.

This subgoal does not add new experiment matrices.

This subgoal does not implement systematic deployment-origin batch cases.

This subgoal does not implement sensor trajectory recording.

This subgoal does not fully redesign the Epistemic Surface.

This subgoal does not attempt to make AWSRT a polished public product.

## Main UI Maturity Questions

### 1. Should prototype pages be hidden or relabeled?

The Epistemic Surface and some visualizer/designer pages may lag behind the more mature Operational and Analysis Surfaces.

Options:

1. Leave pages visible as-is.
2. Hide incomplete pages from the main navigation.
3. Keep pages visible but label them as prototype or experimental.
4. Keep pages visible but add short explanatory maturity text.

Recommended stance:

Do not hide the Epistemic Surface entirely. Belief maintenance is central to AWSRT and to the thesis. Hiding it would create a conceptual gap.

Instead, label immature epistemic tools honestly, for example:

```text
Epistemic Surface — Prototype
```

or:

```text
Experimental epistemic tools for belief-state inspection and uncertainty analysis.
```

The exact wording should be decided after inspecting the current Epistemic Designer and Epistemic Visualizer pages.

### 2. Should Analysis Raw deletion show progress and errors?

Yes.

Analysis Raw deletion is a destructive or semi-destructive action. If deletion takes time or requires a key, the UI should communicate state clearly.

Minimum expected behavior:

- disable repeated deletion clicks while deletion is running;
- show a spinner, loading state, or text such as `Deleting...`;
- show success feedback after deletion completes;
- show explicit error feedback when the deletion key is incorrect;
- refresh the study/artifact list after successful deletion.

This is probably the most concrete implementation target for Subgoal 04.

### 3. Should page maturity cues be added?

Yes, but lightly.

Some pages can include short text such as:

```text
This surface is a research-instrument view. It exposes internal artifacts and diagnostics for inspection rather than presenting a polished operational workflow.
```

For prototype pages:

```text
This page is currently a prototype inspection surface. It is retained because belief-state and uncertainty inspection are central to AWSRT, but the workflow is less mature than the Operational and Analysis Surfaces.
```

The goal is honesty, not apology.

### 4. Should the first-run path be checked?

Yes.

After the README and local-install docs, the app should support a simple first-run inspection path:

1. open splash page;
2. visit Physical Surface;
3. visit Epistemic Surface;
4. visit Operational Surface;
5. visit Analysis Surface;
6. confirm no first-contact page is obviously mislabeled or misleading.

This check can be manual. It does not require a new automated test for this subgoal.

## Proposed Implementation Targets

### Target A: Epistemic Surface maturity labels

Inspect:

```text
frontend/app/epistemic/designer/page.tsx
frontend/app/epistemic/visualizer/page.tsx
```

Potential changes:

- update headings if needed;
- add a short maturity/prototype note;
- clarify that the surface is for belief-state and uncertainty inspection;
- avoid implying that the epistemic workflow is as mature as the Operational or Analysis Surfaces.

Do not hide the pages unless they are actively broken.

### Target B: Analysis Raw deletion feedback

Inspect:

```text
frontend/app/analysis/raw/page.tsx
```

Look for:

- deletion key input;
- delete button handler;
- fetch call or action that deletes studies/artifacts;
- state variables for loading/error/success;
- whether the list refreshes after deletion.

Potential changes:

- add `deleteBusy` state;
- add `deleteError` state;
- add `deleteMessage` or `deleteSuccess` state;
- disable delete button while deletion is active;
- show `Deleting...` or spinner while active;
- show explicit incorrect-key message where backend response allows it;
- refresh data after successful deletion.

### Target C: Analysis Surface wording consistency

Inspect:

```text
frontend/app/analysis/batch/page.tsx
frontend/app/analysis/graphic/page.tsx
frontend/app/analysis/raw/page.tsx
```

Potential changes:

- ensure the three pages are consistently named:
  - Analysis Surface
  - Analysis Visualizer
  - Analysis Raw
- ensure the division of labor is clear:
  - Batch/Study Designer creates studies;
  - Visualizer provides polished reading;
  - Raw provides audit and row-level inspection.

### Target D: First-run interface check

Manually run:

```bash
npm --prefix frontend run dev
```

and backend as needed:

```bash
uvicorn backend.api.main:app --reload --port 8000
```

Then inspect:

```text
http://127.0.0.1:3000
```

Check:

- splash page;
- top navigation;
- each surface landing page;
- obvious error states;
- deletion interaction if safe to test.

## Suggested Search Commands

Find deletion-related code:

```bash
grep -R "delete\|Delete\|deletion\|deleting\|key" -n frontend/app/analysis/raw/page.tsx
```

Find possible prototype/maturity labels:

```bash
grep -R "prototype\|experimental\|Belief Lab\|Epistemic Surface" -n frontend/app/epistemic frontend/app/analysis frontend/app/operational frontend/app/physical
```

Find remaining old analysis labels:

```bash
grep -R "Analysis · Graphic\|Analysis · Batch\|Analysis · Raw\|Belief Lab ·" -n --exclude-dir=node_modules frontend/app
```

Find possible old physical/digital-twin or simulator language in visible frontend text:

```bash
grep -R "digital twin\|physical twin\|high-fidelity\|simulator\|simulation" -n --exclude-dir=node_modules frontend/app
```

## Recommended Work Sequence

### Step 1: Inspect current Epistemic Surface pages

Decide whether they need prototype labels, softer text, or no change.

### Step 2: Inspect Analysis Raw deletion flow

Identify current state variables and deletion handlers before patching.

### Step 3: Implement deletion feedback

Add the smallest safe frontend change that gives the user clear feedback during and after deletion.

### Step 4: Add maturity labels only where useful

Do not label everything as prototype. Use maturity labels only where a page could mislead a new user.

### Step 5: Manual UI smoke test

Run the app and inspect the changed surfaces.

### Step 6: Commit and freeze Subgoal 04

Commit only UI maturity changes. Do not include unrelated feature development.

## Freeze Criteria

This subgoal can be frozen when:

1. Analysis Raw provides clear deletion progress and success/error feedback.
2. Repeated deletion actions are prevented while deletion is in progress.
3. Incorrect deletion key or deletion failure produces visible feedback where possible.
4. Prototype or less mature pages are either clearly labeled or deliberately left unchanged with rationale.
5. The first-run surface navigation remains coherent after the v0.7 terminology pass.
6. No new experiment or result-generation capability is introduced.
7. The app runs locally after the changes.
8. The working tree is clean and changes are committed.

## Recommended Next Subgoal

After Subgoal 04, the next likely subgoal is:

```text
v0.7-subgoal-05: Physical Surface abstraction pass
```

Possible scope:

- continue shifting Physical Surface visible terminology from literal variables to structured environmental fields;
- decide whether backend schema names should remain stable while UI labels become abstract;
- document any compatibility strategy before renaming deeper backend concepts.

A different next subgoal may be chosen if Subgoal 04 reveals a more urgent usability or installation issue.
