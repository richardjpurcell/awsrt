# AWSRT v0.4 Subgoal 06: Bounded Cross-Window Family Validation

**Status:** Updated design note  
**Applies to:** `v0.4-subgoal-06`  
**Purpose:** Record the bounded cross-window validation results of Subgoal 06 and refine the governing scope accordingly: the active family surface now survives a small curated cross-window validation pass well enough to justify no immediate family patch, while also identifying the remaining weak boundary as balanced versus corruption-sensitive rather than opportunistic versus corruption-sensitive.

---

## 1. Purpose of this note

This note updates the Subgoal 06 framing after the bounded cross-window validation pass was completed.

Subgoal 05 should still be read as the stage that established bounded family differentiation on the original transformed real-fire comparison basis. It showed that:

- **balanced** could be read as a distinct bounded family,
- **opportunistic** could be read as a distinct staged family when bounded follow-up clarification was allowed,
- **corruption-sensitive** could be read as specifically corruption-led rather than as another generic non-nominal line.

That was enough to stop revising family semantics on the original evidence base and move into a modest cross-window test.

Subgoal 06 asked whether that reading survived contact with a small curated set of different bounded transformed real-fire windows.

The answer is now clear enough to update the subgoal reading.

The current family surface does **survive** this bounded cross-window validation pass. In particular:

- **corruption-sensitive** remains the most stable and recognizably corruption-led family across all four tested contexts,
- **opportunistic** remains clearly distinguishable across all four contexts, even though its realized shape varies materially by context,
- **balanced** remains serviceable and distinguishable in intent, but its realized summary shape still tends to sit too close to corruption-sensitive.

Subgoal 06 should therefore now be read primarily as a **cross-window validation success / no family patch** subgoal, with one explicit caveat:

> The remaining weak family boundary is now best read as **balanced versus corruption-sensitive**, not opportunistic versus corruption-sensitive.

This is not yet strong enough to justify reopening controller redesign. It is, however, strong enough to remain on the radar as the first candidate boundary for any later bounded refinement if future work requires one.

---

## 2. Background and framing

### 2.1 What earlier v0.4 subgoals established

The v0.4 sequence should now be read as a staged controller-facing progression on bounded transformed real-fire windows.

- **Subgoal 01** reopened the problem of non-nominal active downshift on bounded transformed real-fire windows.
- **Subgoal 02** revisited family structure, especially for balanced and corruption lines.
- **Subgoal 03** recovered corruption-family active expression so that it could become behaviorally present.
- **Subgoal 04** stabilized that expression and tightened the inspection surfaces so corruption-led behavior became more honestly readable.
- **Subgoal 05** used bounded direct comparison and bounded follow-up clarification to show that the active family surface is now meaningfully differentiated on the original bounded comparison basis.
- **Subgoal 06** carried that question onto a small curated set of additional bounded transformed real-fire contexts.

That means the work has moved from:

- absence,
- to expression,
- to inspection,
- to comparative legibility,
- to bounded cross-window validation.

### 2.2 What Subgoal 06 was meant to resolve

What remained unresolved after Subgoal 05 was no longer primarily a family-design question.

The remaining uncertainty was whether the Subgoal 05 family reading was:

- **modestly stable across different bounded transformed real-fire windows**, or
- **too dependent on the original comparison basis** that produced the current interpretation.

That was the right next question because v0.4 is increasingly about controller-facing interpretability on realistic bounded windows rather than only about producing one successful window-specific comparison.

### 2.3 Why bounded cross-window validation was the right next step

A bounded cross-window validation step remained the right next move because it was more disciplined than either of the following:

- reopening family redesign immediately even though Subgoal 05 did not justify it,
- or jumping into a broader validation campaign before the current family surface had been tested modestly beyond the original bounded reference basis.

That judgment now looks correct in hindsight. The bounded Subgoal 06 matrix was sufficient to test whether the current family reading was still scientifically defensible beyond the original comparison basis.

---

## 3. Updated problem statement

The Subgoal 06 problem is now best stated as follows:

> After Subgoal 05, the balanced, opportunistic, and corruption-sensitive active families were meaningfully differentiated on the original bounded transformed real-fire comparison basis, but it remained unclear whether that family differentiation would remain scientifically readable on a small curated set of different bounded transformed real-fire windows.

The key questions were:

- Does **balanced** remain legible as a distinct bounded family on other windows?
- Does **opportunistic** remain legible as its own staged family rather than collapsing into balanced or corruption-sensitive behavior on other windows?
- Does **corruption-sensitive** remain specifically corruption-led across other windows?
- Are the family differences still visible at both:
  - summary level, and
  - step-level transition-neighborhood level?
- If family boundaries weaken on new windows, is that:
  - a window-specific effect,
  - an inspection-surface problem,
  - or a repeated family-boundary weakness that may justify one bounded refinement later?

The completed run set now provides a bounded answer to those questions.

---

## 4. What was actually run in Subgoal 06

### 4.1 First-pass run design

The current first-pass design remained intentionally compact.

It used **3 fires total** and **4 comparison contexts**:

- **C1** — Fort McMurray `2016_255`, current standard origin
- **C2** — Fort McMurray `2016_255`, alternate origin
- **C3** — Historical fire `2003_663`, primary selected origin
- **C4** — Historical fire `2017_856` (`phy-79a8cea500`), primary selected origin, with a later frame window chosen because that fire’s more useful activity occurred later in the data

Within each context, the same three family lines were run:

- **Balanced** — `regime_active_balanced_semantic_probe`
- **Opportunistic** — `regime_active_opportunistic`
- **Corruption-sensitive** — `regime_active_corruption_semantic_probe`

### 4.2 Practical run matrix actually executed

The completed 12-run matrix was:

| Run ID | Context | Fire | Deployment origin | Family | Start | End |
|---|---|---|---|---|---:|---:|
| A1 | C1 | Fort McMurray `2016_255` | Current standard origin | Balanced | 0 | 400 |
| A2 | C1 | Fort McMurray `2016_255` | Current standard origin | Opportunistic | 0 | 400 |
| A3 | C1 | Fort McMurray `2016_255` | Current standard origin | Corruption-sensitive | 0 | 400 |
| B1 | C2 | Fort McMurray `2016_255` | Alternate origin | Balanced | 0 | 400 |
| B2 | C2 | Fort McMurray `2016_255` | Alternate origin | Opportunistic | 0 | 400 |
| B3 | C2 | Fort McMurray `2016_255` | Alternate origin | Corruption-sensitive | 0 | 400 |
| C1 | C3 | `2003_663` | Primary selected origin | Balanced | 0 | 400 |
| C2 | C3 | `2003_663` | Primary selected origin | Opportunistic | 0 | 400 |
| C3 | C3 | `2003_663` | Primary selected origin | Corruption-sensitive | 0 | 400 |
| D1 | C4 | `2017_856` (`phy-79a8cea500`) | Primary selected origin | Balanced | 800 | 1200 |
| D2 | C4 | `2017_856` (`phy-79a8cea500`) | Primary selected origin | Opportunistic | 800 | 1200 |
| D3 | C4 | `2017_856` (`phy-79a8cea500`) | Primary selected origin | Corruption-sensitive | 800 | 1200 |

A useful shorthand for interpretation remains:

- **within-context comparisons**: `A1/A2/A3`, `B1/B2/B3`, `C1/C2/C3`, `D1/D2/D3`
- **same-family cross-context comparisons**:
  - Balanced = `A1, B1, C1, D1`
  - Opportunistic = `A2, B2, C2, D2`
  - Corruption-sensitive = `A3, B3, C3, D3`

### 4.3 Interpretation method

As planned, the run set was read through both:

- **summary-level family shape**, using transition counts, state fractions, and diagnostic hit composition,
- and **transition-neighborhood inspection**, where needed, using active-state changes and local trigger composition.

The summary layer alone turned out to be strong enough to support the main Subgoal 06 conclusion.

---

## 5. Cross-window findings

### 5.1 Corruption-sensitive is the most stable family identity

The strongest cross-window result is that **corruption-sensitive** remains the most stable and interpretable family.

Across all four contexts, corruption-sensitive stayed remarkably consistent:

- transition counts remained high: `58–66`
- nominal fraction remained around `0.5875–0.6375`
- downshift fraction remained around `0.3625–0.4125`
- certified occupancy remained `0`
- weak-support hits remained near zero: `0–1`
- corruption-guard and corruption-led hit counts remained high and nearly matched realized transition counts

This is exactly the sort of stability Subgoal 06 was meant to test. It means corruption-sensitive is not merely readable on the original Fort McMurray basis; it remains recognizably corruption-led across changed origin and changed fires.

### 5.2 Opportunistic remains clearly distinguishable, but its realized shape varies by context

The second important result is that **opportunistic** remains clearly distinguishable across all four contexts, even though its realized operational shape is not invariant.

Its behavior varied materially:

- in **A2 / C1**, it showed a mixed nominal/downshift/certified structure with substantial certified occupancy,
- in **B2 / C2**, it became extremely certified-heavy and almost stage-settled,
- in **C2 / C3**, it remained mostly nominal/downshift with no certified occupancy,
- in **D2 / C4**, it became even more nominal-dominant with no certified occupancy.

But across all contexts, opportunistic still remained unlike corruption-sensitive in the main ways that matter:

- transition counts stayed much lower than corruption-sensitive,
- weak-support hits stayed much higher than corruption-sensitive,
- corruption-led hit counts stayed much lower than corruption-sensitive,
- and in some contexts certified occupancy was present in ways not seen in the other families.

So opportunistic is not invariant, but it is still legibly its own family.

### 5.3 Balanced remains serviceable, but its realized shape stays too close to corruption-sensitive

The weakest part of the validated family surface is now **balanced**.

Balanced remained usable and did not disappear as a family line, but its summary-layer realized behavior stayed too close to corruption-sensitive in all four contexts.

Across all four comparisons, balanced and corruption-sensitive remained near-neighbors in:

- transition count,
- nominal fraction,
- downshift fraction,
- and corruption-led hit counts.

What still distinguishes balanced is that it consistently retains more weak-support activity than corruption-sensitive. That difference is real and should not be ignored.

But in realized occupancy and transition shape, balanced still sits closer to corruption-sensitive than would be ideal for a fully relaxed family surface.

That is the main caveat produced by Subgoal 06.

### 5.4 What the combined cross-window pass now supports

Taken together, the completed run set supports the following bounded reading:

- **Corruption-sensitive** is the most stable family and remains specifically corruption-led.
- **Opportunistic** remains clearly distinguishable and survives cross-window validation, even though its realized form varies by context.
- **Balanced** remains serviceable and interpretable, but it is still the least cleanly separated family in realized summary shape.

This means the family surface as a whole **passes** Subgoal 06, but not every boundary is equally strong.

---

## 6. Interpretation of what changed in Subgoal 06

### 6.1 The family surface survived cross-window validation

The most important outcome of Subgoal 06 is that the family surface did **not** collapse once the comparison moved beyond the original Subgoal 05 basis.

That matters because it means the Subgoal 05 reading was not just a narrow window-specific success. The current family surface is now defensible across at least a modest set of different transformed real-fire contexts.

### 6.2 The weak boundary moved

Subgoal 06 also sharpened the location of the remaining weakness.

The major unresolved boundary is no longer best read as **opportunistic versus corruption-sensitive**.

Instead, the repeated weak boundary is now best read as:

> **balanced versus corruption-sensitive**

That is a more useful and more specific diagnosis than what was available earlier.

### 6.3 The weakness is real, but not yet redesign-forcing

The balanced-versus-corruption-sensitive closeness is not a one-off artifact. It repeated across all four contexts in the summary layer, which means it is a real bounded concern rather than just a local anomaly.

However, it is still not strong enough to justify reopening controller redesign immediately, because:

- corruption-sensitive remains strong,
- opportunistic remains strong,
- balanced is weak but not absent,
- and the family surface overall remains interpretable enough to proceed.

This means the right reading is:

- **note the weak boundary**
- **do not patch yet**
- **keep it as the first candidate boundary if later work requires bounded refinement**

### 6.4 Step-level inspection still matters, but summary was sufficient for the subgoal call

As in Subgoal 05, step-level transition-neighborhood inspection remains useful for local trigger interpretation.

But for the Subgoal 06 decision itself, the summary layer was already strong enough to support the main conclusion:

- the family surface survives,
- no immediate patch is required,
- the weak boundary is balanced versus corruption-sensitive.

---

## 7. Updated subgoal decision

Subgoal 06 should now be considered primarily a **cross-window validation success / no family patch** subgoal.

The strongest disciplined conclusion is:

- the bounded active family surface survives a small curated cross-window validation pass,
- corruption-sensitive remains specifically and stably corruption-led,
- opportunistic remains clearly distinguishable across contexts,
- balanced remains usable but still somewhat close to corruption-sensitive in realized summary shape,
- and no immediate controller-side family revision is justified on the current evidence.

This updates the earlier draft expectation that repeated cross-window weakness might force the next refinement decision immediately. The evidence is not yet strong enough to require that.

---

## 8. Success criteria, updated against observed results

Subgoal 06 should now be considered successful because it produced most or all of the following.

1. **The current family surface was tested on different bounded windows**  
   The comparison moved beyond the original Subgoal 05 basis while preserving like-for-like discipline within each local comparison.

2. **Family differentiation remained at least modestly readable across windows**  
   The active families did not collapse into an indistinguishable story once the window basis changed.

3. **Corruption-sensitive remained specifically readable as corruption-led**  
   This was the strongest and most stable family-level reading in the run set.

4. **Opportunistic remained a readable family line**  
   Even though its realized operational shape varied by context, it remained clearly distinguishable.

5. **Balanced remained serviceable, though less cleanly separated**  
   Balanced did not vanish as a family line, but it remained the weakest boundary against corruption-sensitive.

6. **Claims remain scientifically modest**  
   The result is bounded cross-window validation success, not broad proof or final controller optimization.

7. **The likely future refinement target became more honestly diagnosed**  
   If later work requires a bounded family refinement, the first candidate boundary is now clearly balanced versus corruption-sensitive.

### 8.1 Practical decision rules, updated after execution

The completed run set supports the following updated decision rule reading.

#### Pass / proceed without family revision
Treat Subgoal 06 as a validation success because:

- **corruption-sensitive** remained recognizably corruption-led in all contexts,
- **opportunistic** remained readable as its own family in all contexts,
- the overall three-family pattern remained present across the matrix,
- and no total collapse of the family surface appeared across the run set.

#### Hold the weak boundary on the radar, but do not patch
Treat the current result as “usable but not perfect” because:

- **balanced** repeatedly remained too close to corruption-sensitive in summary shape,
- but that weakness did not destroy the overall three-family reading,
- and the surface is still strong enough to proceed without immediate semantics revision.

#### Consider later bounded refinement only if future work requires it
Only treat the current result as justification for a later refinement candidate in the following narrow sense:

- the repeated weak boundary is now known,
- it is **balanced versus corruption-sensitive**,
- and it should remain the first candidate boundary if a later subgoal needs to improve family separation further.

---

## 9. Updated disciplined implementation reading

### 9.1 What Subgoal 06 actually accomplished

Subgoal 06 should now be read as having done the following:

- preserved the frozen Subgoal 05 family surface,
- tested that surface across four bounded transformed real-fire contexts,
- confirmed that corruption-sensitive remains strongly stable,
- confirmed that opportunistic remains clearly distinct,
- identified balanced versus corruption-sensitive as the repeated weak boundary,
- and concluded that no family patch is yet required.

### 9.2 What it did not need to do

Subgoal 06 did not need to:

- reopen family semantics broadly,
- proliferate new active families,
- trigger a new backend redesign cycle,
- or launch a broader campaign before the family surface had passed a modest validation gate.

That restraint is part of the success of the subgoal, not a lack of progress.

---

## 10. Backend and frontend implications

### 10.1 Backend implication

The backend implication of Subgoal 06 is mainly interpretive rather than structural.

The current family surface is now strong enough to support bounded cross-window comparison without another immediate semantic patch. Backend work should therefore prefer preserving this state and using it for further disciplined evaluation rather than destabilizing it unnecessarily.

### 10.2 Frontend implication

Frontend implications remain bounded.

The current surface appears sufficient to support honest cross-window family comparison, although later work could still justify small wording or presentation improvements if balanced versus corruption-sensitive continues to be hard to read at a glance.

That would still be an **inspection-surface clarity** task, not a frontend-led reinterpretation of controller semantics.

---

## 11. Expected artifacts and how this subgoal should freeze

The Subgoal 06 freeze should now emphasize:

- the completed 12-run cross-window family comparison set,
- summary tables and notes showing where family lines remained stable,
- clear acknowledgment that the repeated weak boundary is balanced versus corruption-sensitive,
- and a freeze summary stating that the family surface passed bounded cross-window validation without requiring a patch.

The freeze should make clear that the key output of Subgoal 06 is **bounded validation**, not another semantics redesign.

---

## 12. Scope boundary, updated

Subgoal 06 remains intentionally limited.

It is **not**:

- a broad controller redesign,
- a new family proliferation step,
- a large-scale validation campaign,
- a claim that the family surface is universally stable,
- or a claim that active-controller design is solved.

It **is**:

- a bounded cross-window validation step,
- a bounded test of whether the current family surface remains scientifically readable beyond the original comparison basis,
- a disciplined bridge from family-shaping into modest validation,
- a 12-run first-pass comparison across 4 curated contexts,
- and a disciplined conclusion that no immediate family patch is required.

The one important retained caution is that the repeated weak boundary is now best understood as **balanced versus corruption-sensitive**.

That is the most scientifically honest reading of what Subgoal 06 has now shown.