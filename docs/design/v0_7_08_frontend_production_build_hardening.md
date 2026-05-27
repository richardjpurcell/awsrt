# AWSRT v0.7 Subgoal 08 — Frontend Production-Build Hardening

**Project:** AWSRT — Adaptive Wildfire Sensing Research Tool  
**Branch:** `v0.7-subgoal-08`  
**Design note:** `docs/design/v0_7_08_frontend_production_build_hardening.md`  
**Status:** Draft design note  
**Date:** 2026-05-27

---

## 1. Purpose

This subgoal hardens the AWSRT frontend production-build path without changing the research semantics of the application.

During validation of v0.7 Subgoal 07, the frontend successfully compiled and passed TypeScript validity checks, but the production build/export process failed during static page generation because several query-parameter-driven pages use `useSearchParams()` without a Suspense boundary.

The goal of this subgoal is therefore narrow:

> Make the frontend production build complete cleanly by resolving existing Next.js `useSearchParams()` Suspense-boundary failures, while preserving AWSRT's current research workflows, manifests, routes, API calls, visualizer behavior, and analysis semantics.

This is a shareability and maintainability task. It is not a scientific-methodology change.

---

## 2. Context

AWSRT v0.7 is focused on making the tool more coherent, shareable, and defensible as a research instrument.

Recent v0.7 work has:

- reframed the frontend around four research surfaces:
  - Physical Surface;
  - Epistemic Surface;
  - Operational Surface;
  - Analysis Surface;
- improved UI maturity feedback;
- refined Physical Surface abstraction wording;
- added movement/path auditability;
- added an Analysis Batch deployment-origin case helper.

Subgoal 07 validation exposed several frontend production-build issues. Some TypeScript and syntax issues were corrected in a follow-up build-typing commit. After those fixes, the remaining build failure was not a type error. It was a Next.js prerender/export issue involving pages that read URL search parameters.

The affected routes reported by the build were:

```text
/analysis/raw
/analysis/graphic
/epistemic/visualizer
/operational/visualizer
```

The observed error was of the form:

```text
useSearchParams() should be wrapped in a suspense boundary
```

This subgoal addresses that issue directly.

---

## 3. Initial question

The guiding question is:

> How can AWSRT keep its visualizer and raw-analysis pages query-parameter driven while satisfying Next.js production prerender requirements?

This matters because these pages are intentionally URL-driven. For example, visualizers and raw-analysis pages often receive identifiers such as `ana_id`, `opr_id`, or related run IDs through the query string. That pattern is useful for shareable links and workflow navigation. The problem is not the use of query parameters itself; the problem is the production-rendering contract around `useSearchParams()`.

---

## 4. Scope

### 4.1 In scope

This subgoal may:

- inspect all current uses of `useSearchParams()`;
- identify pages that trigger production prerender/export failures;
- wrap query-parameter-reading client components in appropriate `Suspense` boundaries;
- split page components into a lightweight outer page and an inner content component where useful;
- add minimal loading fallbacks;
- rerun `npm --prefix frontend run build`;
- document any remaining frontend build warnings or limitations.

### 4.2 Out of scope

This subgoal should not:

- change backend API routes;
- change manifest schemas;
- rename research-surface concepts;
- change analysis metrics or study semantics;
- change operational, epistemic, or physical simulation behavior;
- modify v0.6 artifacts or reproducibility documentation;
- introduce a new routing architecture;
- redesign visualizer workflows;
- perform a broad UI refactor;
- solve unrelated ESLint dependency setup unless it blocks the production build.

---

## 5. Current known issue

The production build reached the static-page generation step and then failed on routes that use `useSearchParams()`.

The relevant build status after the Subgoal 07 validation fixes was approximately:

```text
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
⨯ useSearchParams() should be wrapped in a suspense boundary
```

The affected paths were:

```text
/analysis/raw
/analysis/graphic
/epistemic/visualizer
/operational/visualizer
```

This suggests that the main TypeScript surface is healthy enough for the build to reach prerendering, but the affected pages need Suspense-safe handling of URL search parameters.

---

## 6. Likely implementation pattern

The likely pattern is to move the current page body into an inner client component and wrap it with `Suspense`.

A typical page currently may look conceptually like:

```tsx
"use client";

import { useSearchParams } from "next/navigation";

export default function SomePage() {
  const searchParams = useSearchParams();

  return (
    <div>
      ...
    </div>
  );
}
```

The preferred patch pattern is:

```tsx
"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function SomePageContent() {
  const searchParams = useSearchParams();

  return (
    <div>
      ...
    </div>
  );
}

export default function SomePage() {
  return (
    <Suspense fallback={<div className="card">Loading…</div>}>
      <SomePageContent />
    </Suspense>
  );
}
```

The exact component names should follow each page's existing naming style.

---

## 7. Initial inspection commands

Start by locating all uses of `useSearchParams()`:

```bash
grep -R "useSearchParams" -n frontend/app frontend/components
```

Then inspect the known failing pages:

```bash
sed -n '1,140p' frontend/app/analysis/raw/page.tsx
sed -n '1,140p' frontend/app/analysis/graphic/page.tsx
sed -n '1,140p' frontend/app/epistemic/visualizer/page.tsx
sed -n '1,140p' frontend/app/operational/visualizer/page.tsx
```

If the pages are very large, inspect the top imports, the default export, and the first use of `useSearchParams()`:

```bash
grep -n "import .*Suspense\|useSearchParams\|export default function\|function .*Page" frontend/app/analysis/raw/page.tsx
grep -n "import .*Suspense\|useSearchParams\|export default function\|function .*Page" frontend/app/analysis/graphic/page.tsx
grep -n "import .*Suspense\|useSearchParams\|export default function\|function .*Page" frontend/app/epistemic/visualizer/page.tsx
grep -n "import .*Suspense\|useSearchParams\|export default function\|function .*Page" frontend/app/operational/visualizer/page.tsx
```

---

## 8. Classification of findings

After inspection, classify each page as one of the following.

### A. Direct `useSearchParams()` in default page component

Likely patch:

- rename the current default component to `PageContent`;
- add a new default wrapper component;
- wrap `PageContent` in `Suspense`.

### B. `useSearchParams()` already in child component

Likely patch:

- wrap the child component in `Suspense` at the page level;
- avoid unnecessary component splitting if the child is already isolated.

### C. Multiple query-param readers on the same page

Likely patch:

- use one Suspense boundary around the full query-parameter-dependent page body;
- avoid several small Suspense wrappers unless there is a clear reason.

### D. Search params used only to initialize optional IDs

Likely patch:

- preserve behavior exactly;
- only change the render boundary.

### E. Existing dynamic/no-static workaround

Likely patch:

- consider whether a route-level dynamic configuration is already present;
- prefer Suspense wrapping unless there is a specific reason to force dynamic rendering.

---

## 9. Design constraints

The patch should preserve the following:

- URL-driven workflows remain intact.
- Existing query parameter names remain unchanged.
- Existing route paths remain unchanged.
- Existing API requests remain unchanged.
- Existing visualizer behavior remains unchanged.
- Existing default fallback behavior for missing IDs remains unchanged.
- No backend change is introduced.
- No scientific interpretation changes are introduced.

The Suspense fallback should be plain and unobtrusive. This is not a UI redesign.

A suitable fallback is:

```tsx
<div className="card">Loading…</div>
```

or, where a page already has a layout style:

```tsx
<main className="page">
  <div className="card">Loading…</div>
</main>
```

Use the smallest fallback compatible with the page's existing structure.

---

## 10. Validation plan

The primary validation command is:

```bash
npm --prefix frontend run build
```

A successful outcome should reach a completed Next.js build without the previous `useSearchParams()` Suspense-boundary failures.

Also verify:

```bash
git status
```

The working tree should be clean before freezing.

Manual smoke checks, if the local app is running, should include:

- `/analysis/raw?id=<ana-id>` or equivalent current query pattern;
- `/analysis/graphic?id=<ana-id>`;
- `/epistemic/visualizer?...`;
- `/operational/visualizer?...`.

The exact IDs do not need to be newly generated for this subgoal. Existing local artifacts are sufficient if available.

---

## 11. Non-goals and cautions

Do not use this subgoal to make broader architectural changes.

In particular, avoid:

- replacing URL query workflows;
- moving data loading to server components;
- changing API response shapes;
- changing analysis visualization semantics;
- touching movement trails, deployment-origin cases, or batch-study generation unless a build dependency requires it;
- suppressing the error by disabling build checks globally.

If a route can be fixed by adding a Suspense wrapper, prefer that.

---

## 12. Expected outcome

At the end of this subgoal:

- all known `useSearchParams()` production-build failures are resolved;
- `npm --prefix frontend run build` completes successfully;
- the frontend remains compatible with the current local research workflow;
- the change is recorded as frontend build hardening, not scientific or methodological change.

---

## 13. Freeze criteria

Subgoal 08 can be considered frozen when:

1. All uses of `useSearchParams()` in the frontend are inspected.
2. The four known failing routes are patched or explicitly accounted for.
3. Query parameter names and route paths are unchanged.
4. No backend API or schema change is made.
5. `npm --prefix frontend run build` completes successfully.
6. Manual smoke checks, if feasible, show that query-driven pages still load.
7. The working tree is clean.
8. Changes are committed.
9. The branch is pushed to GitHub.

---

## 14. Suggested commit message

```text
Fix frontend search-param Suspense boundaries
```

Alternative if the patch touches only the four known pages:

```text
Wrap query-param visualizer pages in Suspense
```

---

## 15. Carry-forward note

This subgoal follows directly from v0.7 Subgoal 07 validation.

Subgoal 07 made deployment-origin geometry cases explicit in Analysis Batch and confirmed that geometry variation can be materialized through ordinary `network.base_station_rc` sweep overrides. During validation, the frontend type surface was hardened enough for the production build to reach prerendering. Subgoal 08 now closes the remaining production-build gap caused by query-parameter-driven client pages.

This is consistent with the broader v0.7 direction: make AWSRT more shareable, coherent, and defensible as a research instrument, without turning it into a polished public product or reopening v0.6 experiments.
