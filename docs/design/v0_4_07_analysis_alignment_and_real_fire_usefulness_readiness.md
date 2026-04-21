# AWSRT v0.4 Subgoal 07: Analysis Alignment and Real-Fire Usefulness Readiness

**Status:** Final v0.4 bridge note
**Applies to:** `v0.4-subgoal-07`
**Purpose:** Define the final bounded subgoal of AWSRT v0.4 by checking whether the analysis surfaces now lagging behind the operational real-fire workflow can be brought into sufficient alignment to support a disciplined usefulness-style verification slice on transformed real-fire data, without yet committing the project to a full new sweep campaign.

---

## 1. Purpose of this note

This note defines the seventh disciplined subgoal of AWSRT v0.4.

Subgoal 06 should now be read as having completed the intended bounded controller-facing checkpoint. The active-family surface survived a bounded cross-window validation pass on transformed real-fire windows. In particular:

* **corruption-sensitive** remained the most stable family identity,
* **opportunistic** remained clearly distinguishable across contexts,
* **balanced** remained usable but still somewhat close to corruption-sensitive,
* and no immediate family redesign was justified.

That was enough to stop revising the active-family surface for the moment and to close the bounded family-validation line of v0.4 on disciplined terms.

The next question therefore changes again.

The question is no longer:

> Do the current active families remain readable across bounded transformed real-fire windows?

The next question is:

> Are the analysis batch, graphic, and raw surfaces sufficiently aligned with the current operational real-fire workflow to support a disciplined usefulness-style verification slice on transformed real-fire data?

This question matters because the broader AWSRT scientific arc still contains an unfinished thread.

At the end of AWSRT v0.1, the most important scientific story was that a wedge was forming between **information delivered** and the **operational usefulness** of that information. That wedge was established partly through sweep-style analysis using the analysis section of the platform. Since then, AWSRT has moved forward substantially on controller-facing real-fire experimentation, but the analysis section has lagged behind the operational section in both backend assumptions and frontend readiness.

Subgoal 07 is therefore not a return to broad controller redesign and not yet a full real-fire usefulness campaign. It is a bounded readiness and alignment subgoal.

Its purpose is to answer a practical and scientific question at the same time:

* can the analysis surfaces now be trusted enough to support a small usefulness-style real-fire verification slice,
* and, if so, is the platform ready for a next-phase usefulness-triad line on real-fire data?

---

## 2. Background and framing

### 2.1 What earlier phases established

The relevant AWSRT progression should now be read as follows.

* **AWSRT v0.1** established the main scientific wedge: the system could deliver information that was not equally useful for belief improvement, especially under impairment.
* **AWSRT v0.2** clarified several controller- and usefulness-facing interpretation surfaces so they became cleaner and more truthful.
* **AWSRT v0.3** made bounded transformed real-fire experimentation operationally tractable and showed that controller-facing overlays could become meaningfully realized on that surface.
* **AWSRT v0.4 Subgoals 01–06** strengthened the controller-facing side further by recovering, stabilizing, comparing, and cross-validating active-family behavior on bounded transformed real-fire windows.

This means the operational side of the platform has advanced farther than the analysis side.

### 2.2 What now lags behind

The main lagging surfaces are:

* **analysis batch**
* **analysis graphic**
* **analysis raw**

These surfaces were useful in earlier sweep-driven work, but they have not kept pace with the operational real-fire workflow that now exists. As a result, the project is at risk of having:

* a controller-facing real-fire path that is experimentally stronger,
* but an analysis-facing sweep and reporting path that is not yet sufficiently aligned to support disciplined usefulness verification on that same substrate.

That misalignment does not yet invalidate the operational results. But it does make it premature to jump directly into a full real-fire usefulness-triad campaign without first checking whether the analysis surfaces are ready.

### 2.3 Why this is the right final subgoal for v0.4

A bounded analysis-alignment and readiness subgoal is the right next move because it is more disciplined than either of the following:

* closing v0.4 immediately and beginning a usefulness-triad phase with unclear analysis readiness,
* or trying to complete a full new real-fire usefulness sweep campaign inside v0.4 before the analysis surfaces have been inspected and minimally aligned.

Subgoal 07 should therefore serve as a bridge.

It should connect the controller-facing real-fire progress of v0.4 back toward the earlier usefulness-wedge line of the thesis, while keeping scope small enough that the version can still close cleanly.

---

## 3. Problem statement

The current problem can be stated as follows:

> After the controller-facing bounded real-fire progress of AWSRT v0.4, it remains unclear whether the analysis batch, graphic, and raw surfaces are sufficiently aligned with the current operational real-fire workflow to support a disciplined usefulness-style verification slice on transformed real-fire data.

The key questions are:

* Which parts of the analysis stack are merely outdated in presentation or assumptions, and which parts are functionally misaligned with the current operational workflow?
* Can the analysis backend accept and summarize the kinds of operational real-fire runs now being produced?
* Can the analysis frontend surfaces display and compare those outputs honestly enough for a small usefulness-style verification slice?
* Is a **small pilot usefulness-style real-fire sweep** now feasible without broad rework?
* If not, what is the minimum diagnosis needed before the next version begins?

This is therefore a readiness and alignment problem, not yet a broad scientific campaign problem.

---

## 4. Subgoal decision

Subgoal 07 should be a **bounded analysis-alignment and real-fire usefulness-readiness step**.

It should be:

* **not** a broad analysis overhaul,
* **not** a broad controller redesign,
* **not** yet a full real-fire usefulness-triad campaign,
* **not** a full results-chapter expansion,

but **yes** to:

* inspecting where analysis batch / graphic / raw lag behind the current operational real-fire workflow,
* making only the minimum bounded alignment changes needed,
* running one small pilot usefulness-style verification slice if feasible,
* and deciding whether the next version should begin the real-fire usefulness-triad line in earnest.

This keeps the scope disciplined while still reconnecting AWSRT v0.4 to the earlier usefulness-wedge thread.

---

## 5. What Subgoal 07 should focus on

### 5.1 Inspect the current analysis-operational mismatch

The first task is diagnostic.

The backend and frontend analysis surfaces should be inspected against the current operational real-fire path to determine:

* what assumptions are stale,
* what schemas or expected fields no longer line up cleanly,
* what UI surfaces are missing or misleading,
* and what can still already work without modification.

This should be done before new analysis code is added broadly.

### 5.2 Prefer minimum viable alignment, not broad rebuild

The aim is not to modernize the entire analysis section in one pass.

The aim is to make the **minimum bounded alignment changes** needed so that the platform can support a small usefulness-style verification slice on transformed real-fire data.

That means changes should be:

* local,
* audit-friendly,
* directly tied to current operational real-fire outputs,
* and justified by immediate readiness needs rather than by general cleanup ambition.

### 5.3 Use a pilot usefulness-style verification slice, not a full campaign

If alignment reaches a usable state, Subgoal 07 should run a **small pilot slice** rather than a full sweep campaign.

That pilot should be designed to answer a narrow readiness question:

* can the platform now generate, summarize, and inspect usefulness-relevant real-fire comparisons in a way that is scientifically readable?

The point is not yet to exhaust the wedge story again. The point is to test whether the tooling and workflow are ready for that next phase.

### 5.4 Keep the pilot scientifically connected to the v0.1 wedge

Even though this is a readiness subgoal, the pilot should still be guided by the original wedge logic.

That means the slice should, as much as possible, preserve the distinction between:

* information delivered,
* belief improvement,
* and the usefulness gap between them.

The pilot does not need to reproduce the v0.1 synthetic sweep exactly. It should instead test whether a similar scientific distinction can now be investigated on transformed real-fire data.

### 5.5 End with a clear next-version decision

Subgoal 07 should end with an explicit decision, not just a collection of tweaks.

It should decide among the following:

1. **analysis surfaces are aligned enough; begin real-fire usefulness-triad work next**
2. **analysis surfaces need one more bounded preparation step before that**
3. **analysis-side readiness is still too weak; next version should open with analysis infrastructure first**

The point of the subgoal is to make that decision on evidence rather than intuition.

---

## 6. Proposed Subgoal 07 direction

### 6.1 Core recommendation

Subgoal 07 should combine:

* one bounded analysis-alignment pass, and
* one small pilot usefulness-readiness probe on transformed real-fire data if alignment is sufficient.

The intended shift is:

* from “the controller-facing real-fire surface is now scientifically usable,”
* to “the broader platform is now, or is not yet, ready to revisit the usefulness-wedge line on transformed real-fire data.”

### 6.2 Backend direction

Backend work should remain small and directly tied to readiness.

The main backend direction should be:

#### A. Inspect analysis batch compatibility with current operational outputs

Check whether the current operational real-fire artifacts can be consumed, grouped, summarized, and compared by the analysis backend without hidden mismatch.

#### B. Patch only what blocks a pilot slice

If there are schema, routing, summarization, or field-surface mismatches, fix only those that materially block a bounded usefulness-style pilot.

#### C. Preserve current operational truthfulness

Do not introduce analysis-side shortcuts that would distort the now-stable operational real-fire readings just to make the analysis path easier.

### 6.3 Frontend direction

Frontend work should remain bounded and practical.

The analysis surfaces to inspect are:

* batch
* graphic
* raw

Acceptable bounded changes would be:

* small UI updates so current operational outputs can be selected and compared,
* wording or labeling fixes where old assumptions no longer match the workflow,
* small data-display fixes so the pilot slice can be inspected honestly.

This is still not a frontend redesign subgoal.

---

## 7. Success criteria

Subgoal 07 should be considered successful if it produces most or all of the following.

1. **The current analysis-operational mismatch is made explicit**
   The project should know what is stale, what is broken, and what already works.

2. **Minimum viable alignment is achieved where needed**
   The analysis surfaces should be updated only as much as necessary to support a bounded pilot.

3. **A small real-fire usefulness-style pilot slice becomes possible**
   The platform should be able to run and inspect at least one disciplined verification slice that is meaningfully connected to the earlier wedge logic.

4. **The usefulness thread is reconnected without overcommitting**
   The work should re-establish a bridge to the usefulness-wedge story without pretending that a full new campaign has already been completed.

5. **The next-version decision becomes evidence-based**
   At the end of the subgoal, the project should know whether the next version should:

   * begin the real-fire usefulness-triad phase directly,
   * do one more preparation step,
   * or begin with analysis readiness work first.

6. **Claims remain scientifically modest**
   The subgoal should be framed as readiness and bounded verification, not as a completed new usefulness chapter.

---

## 8. Disciplined implementation plan

### 8.1 Step A: preserve the frozen Subgoal 06 state

Begin from the current v0.4 freeze point after bounded cross-window family validation.

Do not reopen family redesign while assessing analysis readiness.

### 8.2 Step B: inspect analysis batch, graphic, and raw against current operational outputs

Read the backend and frontend analysis surfaces with the current operational real-fire workflow in mind.

Identify:

* schema mismatches,
* missing fields or broken assumptions,
* outdated grouping or labeling logic,
* and any UI barriers to pilot inspection.

### 8.3 Step C: implement only minimum bounded alignment changes

Make only the changes needed to support a pilot usefulness-style slice.

Avoid turning this into a general modernization effort.

### 8.4 Step D: design and run one pilot usefulness-style verification slice

If the surfaces are aligned enough, run one small pilot slice.

That slice should be chosen to test whether usefulness-relevant distinctions can now be inspected on transformed real-fire data in a way that is scientifically readable.

### 8.5 Step E: interpret readiness honestly

At the end of the pilot, ask:

* did the analysis surfaces support the slice cleanly?
* were the outputs interpretable?
* is the platform ready for a larger usefulness-triad phase?

### 8.6 Step F: freeze with a next-version decision

Document:

* what was aligned,
* what remains imperfect,
* whether a pilot slice succeeded,
* and what the next version should focus on.

---

## 9. Expected code and artifact touchpoints

Likely backend areas:

* analysis-related routing / summary generation
* any manifest or metrics grouping assumptions needed for analysis compatibility

Likely frontend files if touched:

* `frontend/app/analysis/batch/page.tsx`
* `frontend/app/analysis/graphic/page.tsx`
* `frontend/app/analysis/raw/page.tsx`

Possible operational touchpoint only if needed:

* fields or manifest outputs required so analysis can read current real-fire runs honestly

Expected artifacts:

* one alignment note or checklist,
* possibly small backend/frontend patches,
* one pilot usefulness-style verification slice or readiness probe,
* and a freeze summary that decides whether the next version should begin the real-fire usefulness-triad line.

---

## 10. Scope boundary

Subgoal 07 is intentionally limited.

It is **not**:

* a broad analysis rewrite,
* a broad real-fire sweep campaign,
* a return to family redesign,
* a full new results chapter,
* or a claim that the real-fire usefulness wedge has now been re-established at scale.

It **is**:

* a bounded analysis-alignment step,
* a bounded readiness check for usefulness-style real-fire verification,
* a bridge between the controller-facing real-fire progress of v0.4 and the earlier usefulness-wedge thread of AWSRT,
* and a disciplined basis for deciding what the next version should do.

That is the most appropriate final subgoal for AWSRT v0.4 before opening the next major phase.

---

## 11. Version-closing interpretation

If Subgoal 07 succeeds on bounded terms, AWSRT v0.4 should likely be read as complete.

That would mean v0.4 as a whole accomplished three things:

1. it recovered and stabilized an active-family surface on bounded transformed real-fire windows,
2. it verified that surface across a small curated cross-window bundle,
3. and it checked whether the lagging analysis path is ready to reconnect the platform to the usefulness-wedge thread on real-fire data.

That is a coherent version shape.

Under that interpretation, the next version should not be another continuation of bounded family stabilization. It should open from the evidence produced here and either:

* begin a disciplined real-fire usefulness-triad phase,
* or begin with one bounded analysis/readiness preparation step if Subgoal 07 shows that more preparation is still needed.

In other words, Subgoal 07 is both a final bounded subgoal of v0.4 and the decision bridge into the next major phase.
