# AWSRT v0.4 Subgoal 05: Bounded Family Differentiation and Comparative Legibility

**Status:** Draft design note  
**Applies to:** `v0.4-subgoal-05`  
**Purpose:** Define the next bounded step after the Subgoal 04 freeze by testing and tightening whether the balanced and corruption active families now exhibit meaningfully distinct bounded behavior on the same transformed real-fire windows, without reopening broad controller redesign.

---

## 1. Purpose of this note

This note defines the fifth disciplined subgoal of AWSRT v0.4.

Subgoal 04 should now be read as having accomplished two important things. First, it preserved the Subgoal 03 result that corruption-family active expression can be behaviorally present on bounded transformed real-fire windows. Second, it tightened the backend and frontend inspection surfaces enough that corruption-led activity is more honestly readable and auditable.

That is real progress. But it also sharpens the next question.

The next question is no longer whether corruption-family activity can exist, nor whether it can be inspected. The next question is whether the currently available active families now read as **meaningfully distinct bounded controller expressions** on the same evaluation windows.

Put simply:

- the balanced family should not merely be “generic non-nominal behavior,”
- the corruption family should not merely be “another way to downshift,”
- and the difference between them should be interpretable without over-claiming optimization.

Subgoal 05 therefore asks:

> On the same bounded transformed real-fire windows, do the balanced and corruption active families now exhibit meaningfully different bounded realized behavior, and if not, what is the smallest disciplined refinement needed to keep their identities distinct and scientifically readable?

This is still not a broad redesign. It is a bounded family-differentiation step.

---

## 2. Background and framing

### 2.1 What earlier v0.4 subgoals established

The early v0.4 sequence should now be read as a staged recovery of active-controller-facing behavior on bounded real-fire windows.

- **Subgoal 01** reopened the question of non-nominal active downshift on bounded transformed real-fire windows.
- **Subgoal 02** revisited family structure, especially for balanced and corruption lines.
- **Subgoal 03** recovered corruption-family active expression so that it could become behaviorally present rather than remaining largely absent.
- **Subgoal 04** stabilized that expression enough to make corruption-led behavior more inspectable, bounded, and honestly represented in backend summaries and frontend inspection surfaces.

That sequence means the project has moved from absence, to expression, to inspection.

### 2.2 What remains unresolved

What remains unresolved is a comparative question.

Now that both balanced and corruption families can be run and inspected, we need to know whether they are actually behaving as different bounded controller lines or whether they still risk collapsing into nearby variants of the same story.

This matters because v0.4 is increasingly about controller-facing interpretability on bounded real-fire windows. If family identities collapse, then the family surface becomes harder to defend scientifically.

### 2.3 Why this is the right next step

A direct family-differentiation subgoal is the right next move because it is smaller and more honest than either of the following:

- broadening immediately into a large multi-window validation campaign before family semantics are settled,
- or reopening broad controller redesign before the current bounded family lines have been comparatively read.

Subgoal 05 should therefore sit at the boundary between controller refinement and controlled comparative evaluation.

---

## 3. Problem statement

The current problem can be stated as follows:

> After Subgoal 04, the balanced and corruption active families are both more behaviorally visible and more inspectable, but it remains unclear whether they now form meaningfully distinct bounded realized behavior lines on the same transformed real-fire windows or whether they still partially collapse into one another.

The key questions are:

- When balanced and corruption differ, how do they differ?
- Are those differences realized in occupancy, transitions, and timing, or only in backend diagnostic traces?
- Can those differences be explained honestly without claiming one family is globally better?
- If distinctness is still weak, what is the smallest bounded controller-facing refinement needed to preserve family identity?

---

## 4. Subgoal decision

Subgoal 05 should be a **bounded family-differentiation and comparative-legibility step**.

It should be:

- **not** a broad redesign of active regime management,
- **not** a large schema expansion,
- **not** a new family explosion,
- **not** a broad plotting/UI overhaul,

but **yes** to:

- direct bounded comparison of balanced and corruption on the same transformed real-fire windows,
- tightening family interpretation where needed,
- and allowing one small controller-facing refinement only if the families still collapse too strongly in realized behavior.

This keeps the scope disciplined while pushing the work forward meaningfully.

---

## 5. What Subgoal 05 should focus on

### 5.1 Compare families on the same windows

The first task is comparative.

Balanced and corruption should be run on the same bounded transformed real-fire windows already used in the recent v0.4 sequence. The point is not to widen the evaluation target yet, but to make the comparison direct and readable.

The main outputs of interest are:

- realized active state occupancy,
- transition counts and transition timing,
- nominal/downshift/certified fractions,
- corruption-led hits and guard activity where relevant,
- and any differences in effective applied controls.

### 5.2 Distinguish generic non-nominal response from corruption-specific response

The key interpretive question is whether corruption-family activity is now specifically corruption-led, rather than merely another path into generic non-nominal active behavior.

Subgoal 05 should therefore inspect where the corruption family differs from balanced in terms of:

- entry conditions,
- hold semantics,
- release timing,
- and realized occupancy patterns.

This is not a “winner selection” exercise. It is a bounded identity clarification exercise.

### 5.3 Preserve boundedness and scientific honesty

A strong temptation at this point would be to tune the corruption family until it “looks more different.” That is not the right goal.

The goal is not maximal separation. The goal is **honest bounded distinctness**.

Subgoal 05 should therefore preserve:

- bounded semantics,
- bounded interpretability,
- and cautious claims.

It is acceptable if the families are only modestly different, provided those differences are real, interpretable, and honestly stated.

### 5.4 Refine only if distinctness is too weak

If comparative inspection shows that balanced and corruption remain too collapsed in realized behavior, Subgoal 05 may allow one small controller-facing refinement.

That refinement should be:

- compact,
- local,
- clearly motivated by observed family collapse,
- and not the beginning of a new redesign cycle.

---

## 6. Proposed Subgoal 05 direction

### 6.1 Core recommendation

Subgoal 05 should combine:

- one bounded comparative evaluation pass, and
- at most one bounded family-separation refinement if needed.

The intended shift is:

- from “corruption-family behavior exists and is inspectable,”
- to “balanced and corruption families now read as meaningfully distinct bounded controller expressions.”

### 6.2 Backend direction

Backend work should likely focus on three things.

#### A. Preserve Subgoal 04 stabilization
Do not undo the stabilized corruption-family expression and tightened inspection surface.

#### B. Compare realized family behavior directly
Use the same bounded windows and inspect family differences through the active-state and audit traces already available.

#### C. Refine only where collapse is specific and local
If balanced and corruption remain too behaviorally similar, make the smallest possible adjustment to preserve family identity.

### 6.3 Frontend direction

Frontend should remain bounded in this subgoal.

The visualizer and designer were brought forward in Subgoal 04 as inspection-truthfulness surfaces. Subgoal 05 should only touch them if comparative family reading is still awkward or misleading.

Acceptable bounded updates would be:

- small wording refinements that better distinguish balanced vs corruption,
- tiny visualizer clarifications if family comparison remains hard to read,
- or preset text cleanup if the designer language no longer matches the actual family distinction.

This is not a frontend-led subgoal.

---

## 7. Success criteria

Subgoal 05 should be considered successful if it produces most or all of the following.

1. **Balanced and corruption are directly compared on the same bounded windows**  
   The comparison should be like-for-like, not based on shifted evaluation targets.

2. **Family distinctness becomes more interpretable**  
   The work should make it clearer where balanced and corruption diverge in realized behavior.

3. **Corruption remains specifically readable as corruption-led**  
   The corruption family should not collapse back into generic weak-support behavior.

4. **Boundedness is preserved**  
   Neither family should become an over-tuned or over-claimed controller.

5. **Any controller refinement remains small and local**  
   If refinement is needed, it should be minimal and clearly justified by observed family collapse.

6. **Claims remain scientifically disciplined**  
   The outcome should be framed as bounded family differentiation, not final controller optimization.

---

## 8. Disciplined implementation plan

### 8.1 Step A: preserve the Subgoal 04 state

Start from the frozen Subgoal 04 result without reopening broad redesign.

### 8.2 Step B: run direct family comparisons

Evaluate balanced and corruption on the same bounded transformed real-fire windows used in the recent subgoals.

### 8.3 Step C: inspect where divergence actually appears

Read differences in:

- active-state occupancy,
- transitions,
- corruption-led diagnostics,
- and effective control traces.

### 8.4 Step D: decide whether refinement is actually needed

Only if the families still collapse too strongly should a controller-side tweak be made.

### 8.5 Step E: apply at most one bounded refinement

If required, make one compact refinement whose purpose is preserving family distinctness rather than broad performance tuning.

### 8.6 Step F: freeze with comparative interpretation

Document not just what changed, but how balanced and corruption now read relative to one another and what remains unresolved.

---

## 9. Expected code and artifact touchpoints

Likely backend file:

- `backend/api/routers/operational.py`

Possible frontend files only if needed:

- `frontend/app/operational/visualizer/page.tsx`
- `frontend/app/operational/designer/page.tsx`

Expected artifacts:

- direct bounded family comparison runs,
- summary comparison notes or tables,
- possibly one compact refinement to preserve family identity,
- and a freeze summary describing comparative findings and remaining limits.

---

## 10. Scope boundary

Subgoal 05 is intentionally limited.

It is **not**:

- a broad controller redesign,
- a new family proliferation step,
- a large validation campaign across many new windows,
- or a claim that the active-controller problem is solved.

It **is**:

- a bounded comparative family-reading step,
- a bounded family-distinctness clarification step,
- and, only if needed, a small controller-facing refinement to keep balanced and corruption from collapsing into the same realized story.

That is the most disciplined next step after Subgoal 04.