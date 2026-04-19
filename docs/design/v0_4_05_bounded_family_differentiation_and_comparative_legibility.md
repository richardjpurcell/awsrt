# AWSRT v0.4 Subgoal 05: Bounded Family Differentiation and Comparative Legibility

**Status:** Updated design note
**Applies to:** `v0.4-subgoal-05`
**Purpose:** Record the bounded comparative findings of Subgoal 05 and refine the governing scope accordingly: the active family question is now best read as a three-family bounded comparative-legibility result on shared transformed real-fire windows, rather than as a prompt for another immediate controller redesign.

---

## 1. Purpose of this note

This note updates the Subgoal 05 framing after the first bounded comparative pass and bounded follow-up diagnostics were completed.

Subgoal 04 should still be read as the stage that preserved corruption-family active expression and tightened the backend/frontend inspection surfaces enough that corruption-led activity became more honestly readable. Subgoal 05 began from the bounded question of whether the active families now read as meaningfully distinct controller expressions on the same transformed real-fire windows.

The comparative work now completed gives a more specific answer than the draft framing anticipated.

The question is no longer best stated only as a balanced-versus-corruption question. In practice, the bounded comparison needed to read three active family lines together:

* **balanced** as a mixed bounded support/downshift family,
* **opportunistic** as a staged opportunistic line whose realized behavior must remain distinguishable from both balanced and corruption-sensitive behavior,
* **corruption-sensitive** as a corruption-led guarded/downshift family rather than merely another generic weak-support downshift variant.

The bounded comparison and follow-up runs show that these families can now be read as meaningfully differentiated on shared bounded transformed real-fire windows, although some of that distinctness only became fully legible once the comparison was extended with a bounded hysteresis-style clarification pass.

Subgoal 05 should therefore now be read primarily as a **comparison and validation subgoal** rather than as a semantics-tightening or redesign subgoal.

---

## 2. Background and framing

### 2.1 What earlier v0.4 subgoals established

The early v0.4 sequence should now be read as a staged recovery of active-controller-facing behavior on bounded real-fire windows.

* **Subgoal 01** reopened the question of non-nominal active downshift on bounded transformed real-fire windows.
* **Subgoal 02** revisited family structure, especially for balanced and corruption lines.
* **Subgoal 03** recovered corruption-family active expression so that it could become behaviorally present rather than remaining largely absent.
* **Subgoal 04** stabilized that expression enough to make corruption-led behavior more inspectable, bounded, and honestly represented in backend summaries and frontend inspection surfaces.

That sequence moved the work from absence, to expression, to inspection.

### 2.2 What Subgoal 05 needed to resolve

What remained unresolved after Subgoal 04 was a comparative question.

Once multiple active-family lines could be run and inspected on the same bounded transformed real-fire windows, the next issue became whether those families were actually behaving as distinct bounded controller expressions or whether they still risked collapsing into nearby variants of the same realized story.

This mattered because v0.4 is increasingly about controller-facing interpretability on bounded real-fire windows. If family identities collapse in realized behavior, then the family surface becomes harder to defend scientifically, even if the backend semantics differ on paper.

### 2.3 Why a bounded comparative pass was the right next step

A direct family-differentiation pass was the right next move because it was smaller and more honest than either of the following:

* broadening immediately into a larger validation campaign before the family surface had been comparatively read,
* or reopening controller redesign before the current bounded family lines had been carefully inspected on the same windows.

That judgment still looks correct in hindsight. The bounded comparative pass was sufficient to answer the main Subgoal 05 question without forcing another redesign cycle.

---

## 3. Updated problem statement

The Subgoal 05 problem is now best stated as follows:

> After Subgoal 04, the balanced, opportunistic, and corruption-sensitive active families were all behaviorally runnable and inspectable on bounded transformed real-fire windows, but it remained unclear whether they formed meaningfully distinct realized controller expressions on the same evaluation windows or whether some family boundaries still partially collapsed.

The key questions were:

* Does **balanced** read as a mixed but distinct bounded family rather than merely generic non-nominal behavior?
* Does **opportunistic** retain a readable family identity rather than collapsing into either balanced or corruption-sensitive behavior?
* Does **corruption-sensitive** read as specifically corruption-led rather than merely another weak-support downshift variant?
* Are the differences visible not only in summaries, but also in realized transition neighborhoods?
* If distinctness remained weak, what was the smallest disciplined next step: no patch, inspection-surface tightening, or one small semantics adjustment?

---

## 4. What was actually run in Subgoal 05

### 4.1 Core bounded comparison pass

The first bounded comparison used one run per family on the same bounded transformed real-fire reference/window basis, varying only the family preset.

The core family comparison used:

1. `regime_active_balanced_semantic_probe`
2. `regime_active_opportunistic`
3. `regime_active_corruption_semantic_probe`

The comparison was interpreted at two levels:

* **summary level**, using state fractions, transition counts, and active diagnostic hit fields,
* **step-transition neighborhood level**, using transition-adjacent trigger and counter fields.

### 4.2 Initial finding from the core comparison

The first comparison already showed one strong result and one weaker boundary.

* **Balanced** separated visibly from the other two lines. It was the only core-comparison run with nonzero certified occupancy and showed a mixed structure rather than a pure corruption-led oscillatory shape.
* **Corruption-sensitive** read plausibly as corruption-led rather than generic weak-support downshift.
* **Opportunistic**, however, initially appeared too close to corruption-sensitive in the first-pass summary layer. The boundary between those two families remained less legible than desired.

This was an important intermediate result: family differentiation was partly present, but not yet fully convincing across all boundaries.

### 4.3 Bounded follow-up clarification pass

Because the opportunistic-versus-corruption-sensitive boundary still looked ambiguous after the first pass, a bounded follow-up diagnostic was run using hysteresis-style comparison presets.

The clarification pass used:

* `regime_active_balanced_hysteresis_probe`
* `regime_active_opportunistic_hysteresis_probe`

This was explicitly not treated as a new redesign campaign. It was used as a bounded mechanism/stability clarification step to determine whether the weak family boundary reflected a real semantic collapse or simply inadequate first-pass comparative legibility.

---

## 5. Comparative findings

### 5.1 Balanced now reads as a distinct bounded family

The bounded comparison supports reading **balanced** as a distinct bounded family rather than as a generic non-nominal placeholder.

In the core comparison, balanced was the only run with nonzero certified occupancy and a smaller realized transition count than the more corruption-led families. That already indicated a mixed family identity rather than a simple corruption-led nominal/downshift oscillation.

In the hysteresis follow-up, balanced did not present as corruption-led. Instead, it read as a **weak-support-led bounded downshift family** with no corruption-led hits and no certified occupancy in that particular clarification probe. This strengthened, rather than weakened, the case that balanced has its own family identity.

The correct reading is therefore not that balanced always occupies one simple operational shape, but that it remains interpretably distinct from both opportunistic and corruption-sensitive lines.

### 5.2 Opportunistic is distinguishable, but required bounded follow-up to read clearly

The key uncertainty in Subgoal 05 concerned the opportunistic family.

In the first comparison pass, opportunistic initially looked too close to corruption-sensitive. Its summary shape was near the corruption-sensitive line in transition count, nominal/downshift fractions, and corruption-led activity, which raised the possibility that the boundary between those families had not become legible enough yet.

The hysteresis-style follow-up changed that reading materially.

In the bounded follow-up, opportunistic read as a **staged opportunistic family with substantial certified occupancy** and a much lower transition count than the follow-up balanced run. It no longer read like another corruption-led guarded/downshift oscillation. Instead, it presented as a family with a more staged realized operational structure that remained visibly distinct from both balanced and corruption-sensitive behavior.

This result is important because it suggests that the earlier ambiguity reflected limited first-pass comparative legibility more than a fundamental failure of opportunistic semantics.

### 5.3 Corruption-sensitive now reads as specifically corruption-led

The corruption-sensitive line now reads as the most trigger-specific family.

In the core bounded comparison, corruption-sensitive showed strong corruption-guard and corruption-led downshift activity, with far less evidence of weak-support-driven identity and no certified occupancy. That is the intended scientific reading: the family is not simply non-nominal, but specifically **corruption-led and guarded/downshift-oriented**.

This was one of the main questions inherited from Subgoal 04, and the answer is now substantially clearer. The corruption-sensitive family no longer needs to be defended merely as “some different downshift behavior.” It is now interpretable as corruption-led bounded controller behavior.

### 5.4 What the combined comparison now supports

Taken together, the core comparison and bounded follow-up support the following three-family reading:

* **Balanced**: weak-support-led bounded downshift / mixed family, distinct from corruption-led behavior.
* **Opportunistic**: staged opportunistic family that can retain a visibly different realized structure and may include substantial certified occupancy in bounded follow-up probes.
* **Corruption-sensitive**: corruption-led guarded/downshift family.

This is not a claim of global optimality or a claim that each family always occupies a single invariant operational profile. It is a claim of **bounded family differentiation and comparative legibility** on shared transformed real-fire windows.

---

## 6. Interpretation of what changed in Subgoal 05

### 6.1 The subgoal did not force another redesign

One of the most important outcomes of Subgoal 05 is negative in the good sense: it did **not** produce evidence that would justify immediately reopening broad controller redesign.

The family surface did show one weak boundary after the first pass, but the bounded follow-up was sufficient to clarify that boundary without invoking another redesign cycle.

That matters because it means the current active-family surface is now defensible enough to move forward with disciplined comparative interpretation rather than repeated structural rewriting.

### 6.2 The main remaining issue is comparative legibility, not family absence

The remaining limitation is best understood as one of **comparative legibility across presets and surfaces**, not one of family nonexistence.

The core pass alone did not make every family boundary equally legible. In particular, opportunistic needed a bounded follow-up mechanism/stability probe before its distinct realized identity became fully convincing.

That is still a limitation worth stating. But it is a much narrower limitation than “the family semantics still collapse” or “the controller surface needs redesign.”

### 6.3 Step-level inspection still matters

Subgoal 05 also reinforced a methodological point.

Summary fields were enough to reveal broad shape differences and to expose the initial weak boundary. But step-level transition-neighborhood inspection remained important for understanding whether those differences reflected weak-support-led behavior, corruption-guarded behavior, or certified-entry/exit behavior.

This confirms that active-family comparison on bounded real-fire windows should continue to be read through both summary and transition-neighborhood layers when scientific honesty matters.

---

## 7. Updated subgoal decision

Subgoal 05 should now be considered primarily a **comparison success / no controller patch yet** subgoal.

The strongest disciplined conclusion is:

* the bounded active families are now meaningfully differentiated,
* the corruption-sensitive family remains specifically corruption-led,
* balanced retains a distinct weak-support-led or mixed bounded identity,
* opportunistic can be read as a distinct staged family when bounded follow-up clarification is allowed,
* and no immediate controller-side semantics patch is justified on the current evidence.

This updates the earlier draft expectation that Subgoal 05 might need one small controller-facing refinement. That refinement is no longer the preferred next move.

---

## 8. Success criteria, updated against observed results

Subgoal 05 should now be considered successful because it produced most or all of the following.

1. **Families were directly compared on the same bounded windows**
   The comparison remained like-for-like at the physical/windowing level.

2. **Family distinctness became interpretable**
   Balanced, opportunistic, and corruption-sensitive can now be read as distinct bounded controller expressions, even though one boundary required bounded follow-up clarification.

3. **Corruption remained specifically readable as corruption-led**
   The corruption-sensitive line did not collapse back into generic weak-support behavior.

4. **Boundedness was preserved**
   The work did not drift into broad redesign or large new validation scope.

5. **No controller refinement was required to claim meaningful differentiation**
   The family surface proved differentiable without another controller patch.

6. **Claims remain scientifically disciplined**
   The result is bounded family differentiation and comparative legibility, not final controller optimization.

---

## 9. Updated disciplined implementation reading

### 9.1 What Subgoal 05 actually accomplished

Subgoal 05 should be read as having done the following:

* preserved the Subgoal 04 stabilized state,
* performed direct bounded family comparison on shared transformed real-fire windows,
* identified one weak family boundary after the first pass,
* resolved that weak boundary sufficiently through a bounded follow-up comparison,
* and concluded that no controller patch was presently required.

### 9.2 What it did not need to do

Subgoal 05 did not need to:

* reopen family semantics broadly,
* proliferate new active families,
* trigger a new backend redesign cycle,
* or launch a broad frontend overhaul.

That restraint is part of the success of the subgoal, not a lack of ambition.

---

## 10. Backend and frontend implications

### 10.1 Backend implication

The backend implication of Subgoal 05 is primarily interpretive rather than structural.

The current active-family surface is now strong enough to support bounded comparative reading without another immediate semantic patch. Backend work should therefore prefer preserving this state and using it for further disciplined evaluation rather than destabilizing it with unnecessary redesign.

### 10.2 Frontend implication

Frontend implications remain bounded.

The designer and visualizer now appear sufficient for honest family comparison, although there is still room for small wording or presentation refinements if future reading continues to show that certain family boundaries are only obvious after deeper inspection.

That would be an **inspection-surface clarity** task, not a frontend-led reinterpretation of controller semantics.

---

## 11. Expected artifacts and how this subgoal should freeze

The Subgoal 05 freeze should now emphasize:

* the direct bounded family comparison runs,
* the bounded follow-up clarification runs,
* summary and transition-neighborhood interpretation showing where the family lines differ,
* and a freeze summary stating that family differentiation is now sufficiently legible without another controller patch.

The freeze should make clear that the key output of Subgoal 05 is comparative interpretation, not a larger code redesign.

---

## 12. Scope boundary, updated

Subgoal 05 remains intentionally limited.

It is **not**:

* a broad controller redesign,
* a new family proliferation step,
* a large validation campaign across many new windows,
* or a claim that active-controller design is solved.

It **is**:

* a bounded comparative family-reading step,
* a bounded three-family differentiation step,
* a bounded comparative-legibility validation step,
* and a disciplined conclusion that no controller patch is currently required.

That is the most scientifically honest reading of what Subgoal 05 has now shown.
