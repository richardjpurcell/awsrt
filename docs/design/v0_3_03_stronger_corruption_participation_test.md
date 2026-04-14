# AWSRT v0.3 Subgoal 03: Stronger Corruption Participation Test

**Status:** Draft design note  
**Applies to:** `v0.3-subgoal-03`  
**Purpose:** Define the next bounded controller-facing step after the Subgoal 02 corruption-signal checkpoint by testing whether corruption-facing evidence must participate more strongly than as an auxiliary trigger component if the active machine is to express corruption-side caution honestly.

---

## 1. Purpose of this note

This note defines the next disciplined step after AWSRT v0.3 Subgoal 02.

Subgoal 02 began from a narrow and scientifically reasonable question: whether the active regime surface needed an explicitly corruption-facing signal rather than still more threshold-only tuning on the existing support-heavy trigger family.

That was the right question to ask first. It produced a real checkpoint result.

In particular, Subgoal 02 established that:

- a corruption-facing signal can be inserted cleanly into the active trigger surface,
- that signal can be constructed from controller-visible quantities,
- and the insertion can be done without redesigning the machine or reopening the controller-boundary question.

However, the bounded Subgoal 02 probe also showed that this first corruption-facing signal did **not** materially change the corruption/noise active reading when introduced only as an auxiliary trigger component.

That means the next question is now more specific than before. The issue is no longer:

> can corruption-facing evidence be added at all?

The issue is now:

> what role must corruption-facing evidence play if it is actually going to matter in realized active behavior?

This note defines Subgoal 03 as the first bounded test of that stronger participation question.

---

## 2. Starting point inherited from Subgoal 02

Subgoal 02 should now be treated as a meaningful narrowing checkpoint.

### 2.1 What Subgoal 02 achieved

Subgoal 02 achieved several useful things:

- it identified a defensible corruption-facing signal shape,
- it implemented that signal inside the active downshift / switch trigger surface,
- it preserved the current machine shape and recovery semantics,
- and it validated that this kind of controller-visible corruption signal can be added without architectural drift.

That is important progress. The project is no longer debating the corruption-facing idea in the abstract.

### 2.2 What Subgoal 02 did not achieve

Subgoal 02 did **not** achieve the intended behavioral outcome.

In the bounded compact probe:

- the corruption/noise case still remained trivially nominal,
- realized active state occupancy did not become meaningfully more corruption-sensitive,
- and the auxiliary corruption-facing component did not materially alter the active machine.

So Subgoal 02 should be read as a successful bounded implementation checkpoint but an incomplete behavioral result.

### 2.3 Why that matters

This means the next design question should not be phrased as:

> should we keep relaxing the same auxiliary thresholds?

That is now too weak and too local a framing.

The better question is:

> does corruption-facing evidence need to act as more than an auxiliary strengthening term if the active surface is to express corruption-side caution honestly?

That is the core reason for Subgoal 03.

---

## 3. Why Subgoal 03 is the right next step

### 3.1 The signal is no longer the main uncertainty

After Subgoal 02, the main uncertainty is not whether the project can compute a corruption-facing signal. It can.

The main uncertainty is now whether the **combiner role** of that signal is too weak.

That is a more precise and more valuable design question than continuing to treat the problem as generic threshold calibration.

### 3.2 This is still the highest-payoff near-term control question

The strongest scientific and thesis-facing payoff is still in adaptive control, not in broad realism work or general UI cleanup.

Subgoal 03 remains well aligned with that priority because it addresses a live controller question:

- how should the active machine react when corruption-adjacent evidence is high,
- and how can that reaction be made readable without exaggeration?

### 3.3 This remains a disciplined continuation of v0.2

Subgoal 03 is still downstream of the v0.2 interpretive checkpoint rather than a reopening of it.

It preserves the inherited discipline that:

- the compact usefulness path remains distinct in identity,
- regime management remains the broader active/advisory mechanism layer,
- and controller improvement should proceed without pretending that all late-stage control surfaces have unified.

That makes Subgoal 03 a true control-development continuation, not another boundary debate.

---

## 4. Main development question

The central question for Subgoal 03 is:

> what is the smallest stronger participation role for corruption-facing evidence that can materially affect the corruption/noise active reading without redesigning the state machine?

More concretely:

> if auxiliary corruption participation is too weak, should corruption-facing evidence become a co-primary condition, a direct downshift path, or a dedicated corruption-sensitive probe condition?

This is the main question the subgoal should answer.

---

## 5. Scope

Subgoal 03 should remain narrow.

It should focus on one compact class of changes:

- testing one stronger participation role for already-identified corruption-facing evidence.

That does **not** mean:

- redesigning the active state machine,
- adding new public controller families,
- inventing many new signals,
- or broadening the schema/frontend surface without need.

Instead, it means choosing one stronger role and evaluating it honestly.

Subgoal 03 should therefore remain:

- bounded,
- mechanism-facing,
- and explicitly comparative.

---

## 6. What Subgoal 03 is and is not

### 6.1 What Subgoal 03 is

Subgoal 03 is a bounded test of stronger corruption participation.

It is about:

- determining whether corruption-facing evidence must play a stronger trigger role,
- improving corruption-side active interpretability if possible,
- and doing so without disturbing the current machine more than necessary.

### 6.2 What Subgoal 03 is not

Subgoal 03 is not:

- a broad controller rewrite,
- a new regime family,
- a new public ontology,
- a realism bridge subgoal,
- a frontend overhaul,
- or a license to proliferate special-case logic everywhere.

It is also not yet a claim that a final corruption-aware controller architecture has been found.

---

## 7. Working diagnosis entering Subgoal 03

At the start of Subgoal 03, the current working diagnosis is:

### 7.1 Auxiliary corruption participation is structurally feasible

The first Subgoal 02 pass showed that corruption-facing evidence can be inserted into the active trigger dictionaries cleanly.

So structural feasibility is no longer the issue.

### 7.2 Auxiliary participation is behaviorally too weak

The main problem now appears to be that corruption-facing evidence, when treated as an auxiliary component, does not materially influence the machine’s realized behavior under the compact semantic probe.

That is the main behavioral diagnosis inherited from Subgoal 02.

### 7.3 The next question is about participation role, not signal existence

This is the key shift.

The question is no longer whether corruption evidence exists or can be computed.

The question is whether corruption evidence must be allowed to participate in a stronger way than:

- “one more auxiliary boolean in a support-dominated combiner.”

That is the point of Subgoal 03.

---

## 8. Recommended development stance

Subgoal 03 should follow these principles.

### 8.1 Test only one stronger role at a time

It is better to test one stronger participation role clearly than to mix several new trigger semantics in one patch.

### 8.2 Preserve the machine shape first

The first stronger-participation test should preserve:

- the current active state geometry,
- the current certified path,
- and the current recovery path.

The goal is to test signal role, not machine redesign.

### 8.3 Prefer causal readability over cleverness

If corruption-facing evidence becomes stronger, the resulting rule should still be explainable in plain operational terms.

The project should avoid introducing a role that is numerically effective but semantically opaque.

### 8.4 Keep the compact probe in place

The same compact semantic-probe study shape should remain the main evaluation tool unless it clearly becomes insufficient.

That keeps the result comparable to Subgoal 02 and prevents scope drift.

---

## 9. Candidate stronger participation roles

Several bounded stronger roles are possible.

### 9.1 Co-primary downshift condition

One option is to let corruption-facing evidence act as a co-primary downshift condition in selected active presets.

Interpretation:

- corruption-heavy conditions should be able to trigger downshift even when support-heavy signals are not the only dominant story.

This is a strong candidate because it still preserves the existing state machine and reads naturally.

### 9.2 Direct corruption-to-downshift path

A second option is to let clearly corruption-heavy conditions create a direct downshift path inside the active trigger logic.

This would still not require a new state, but it would give corruption evidence more independent force than a generic auxiliary role.

### 9.3 Dedicated corruption-sensitive semantic probe

A third option is to leave the general active families unchanged for now, but define one dedicated semantic probe in which corruption-facing evidence is intentionally allowed a stronger role.

This is attractive if the project wants to test the idea without immediately altering the broader preset family interpretation.

### 9.4 Stronger certified participation

A less attractive but still possible option is to let corruption evidence participate more strongly in switch-to-certified.

This may be worth testing later, but for the first stronger-role pass it is probably less desirable than strengthening downshift first, because certification should remain the stronger intervention.

---

## 10. Preferred target

The preferred first target is:

> test corruption-facing evidence as a stronger downshift participant before giving it a stronger certified-escalation role.

This is the best next step because:

- it is smaller than redesigning switch/certified semantics first,
- it matches the intuition that corruption-side caution should first show up as non-nominal active behavior,
- it avoids making certification the immediate answer to all corruption-heavy conditions,
- and it is likely to be more interpretable in the compact probe.

### 10.1 Preferred first concrete form

The preferred first concrete form is:

- keep the current corruption-facing signal definition,
- keep recovery semantics unchanged,
- keep the state machine unchanged,
- but let corruption-facing evidence participate as more than an auxiliary condition for downshift.

This can be done in a bounded way without broadening the controller surface.

### 10.2 What should wait

For this subgoal, the project should avoid:

- redesigning the full switch-to-certified combiner,
- adding multiple new corruption signals,
- or changing both downshift and recovery semantics together.

The first stronger-role test should stay very small.

---

## 11. Preferred implementation stance

The preferred implementation order is:

### Step 1

Retain the current corruption-facing signal construction from Subgoal 02.

### Step 2

Choose one stronger participation role for **downshift** only.

### Step 3

Rerun the compact semantic-probe comparison:
- healthy,
- stale/delay,
- corruption/noise,
- and optionally one mixed case if needed.

### Step 4

Interpret the result honestly:
- did corruption-side non-nominal behavior actually appear,
- did healthy behavior remain readable,
- and did stale versus corruption become easier to distinguish?

This keeps the next step tightly comparable to Subgoal 02.

---

## 12. Experiment design for Subgoal 03

Subgoal 03 should again use a compact study family.

### 12.1 Recommended study shape

The main study should still include:

- one healthy reference,
- one stale/delay case,
- one corruption/noise case,
- and optionally one mixed case only if needed.

This continuity is important because it preserves comparability across:
- Subgoal 01,
- Subgoal 02,
- and now Subgoal 03.

### 12.2 Recommended comparison logic

The main comparison should now be:

- Subgoal 02 auxiliary corruption participation,
- versus Subgoal 03 stronger corruption participation.

That is a much cleaner comparison than starting over from scratch.

### 12.3 Recommended evaluation emphasis

Evaluation should prioritize:

- realized active state occupancy,
- transition counts,
- whether corruption/noise stops reading as trivially nominal,
- whether delay remains more recoverable than corruption,
- and whether the resulting reading stays interpretable.

Headline belief metrics still matter, but they should remain secondary to the mechanism-facing reading here.

---

## 13. Relation to real-fire deployment-simulation work

Subgoal 03 should still remain ahead of the real-fire bridge in priority unless workflow needs force otherwise.

The reason remains the same:

- the higher-payoff near-term thesis question is still controller sensitivity and active interpretability,
- and the corruption-versus-staleness distinction is still a more central control question than horizon-limiting real-fire execution support.

That real-fire bridge still matters, but it should remain downstream of this controller-facing clarification unless immediate workflow constraints change that priority.

---

## 14. Likely implementation touchpoints

The most likely files for Subgoal 03 are:

- `backend/api/routers/operational.py`
- `docs/design/v0_3_03_stronger_corruption_participation_test.md`
- possibly `frontend/app/operational/designer/page.tsx` only if one dedicated stronger-participation semantic probe preset becomes necessary

The expected emphasis should remain:

### First pass

- backend trigger-role adjustment
- compact rerun comparison
- note-level interpretation

### Only if justified

- one small preset adjustment in the designer
- one small note-level clarification of preset meaning

Large refactor remains out of scope.

---

## 15. Suggested success criteria

Subgoal 03 should be considered successful if:

- one stronger corruption-participation role is tested,
- the corruption/noise case stops appearing trivially nominal,
- healthy behavior remains broadly readable,
- stale and corruption become more distinguishable in realized active behavior,
- and the result remains explainable without changing the machine shape.

A strong success outcome would be:

- corruption/noise now produces visible non-nominal active behavior,
- while delay still reads as more recoverable than corruption,
- and certification does not become the default answer to everything.

---

## 16. Warning signs

Subgoal 03 should be treated as drifting if:

- it turns into a broad rewrite of the active machine,
- it changes downshift, switch, and recovery all at once,
- it introduces multiple new corruption-facing signals in one pass,
- it begins using controller-invisible quantities,
- or it broadens the public controller surface prematurely.

A specific warning sign would be:

- making corruption participation stronger in a way that finally changes the noise case, but at the cost of making healthy and delay cases much less readable.

Another warning sign would be:

- jumping directly from “auxiliary was too weak” to “corruption should dominate everything.”

The goal is not to force corruption evidence to override all other logic. The goal is to test whether a **moderately stronger and still interpretable** participation role is enough.

---

## 17. Relationship to likely next steps

A plausible sequence after this note is:

### 17.1 Subgoal 03 implementation pass

Test one stronger corruption-participation role, preferably on downshift first.

### 17.2 Compact validation checkpoint

Freeze and interpret the result of that stronger-role test.

### 17.3 Real-fire execution-window bridge

Only after the controller-facing question is clearer should the project shift main attention toward bounded real-fire deployment-simulation support, unless workflow pressure makes that bridge more urgent sooner.

### 17.4 Later v0.3 continuation

Only after those steps should the project consider:

- broader corruption-aware active refinements,
- broader robustness studies,
- or more general platform catch-up work.

---

## 18. Short summary

Subgoal 03 is the next bounded controller-facing step after the Subgoal 02 corruption-signal checkpoint. Subgoal 02 showed that corruption-facing evidence can be inserted cleanly into the active trigger surface, but also showed that auxiliary participation alone does not materially change the corruption/noise active reading. The next disciplined question is therefore not whether corruption-facing evidence can be added, but whether it must be allowed to participate more strongly than as an auxiliary component if the active machine is to express corruption-side caution honestly. The preferred first test is to strengthen corruption participation on downshift before changing the broader machine. This keeps the work compact, interpretable, and tightly aligned with the highest-payoff near-term control questions in AWSRT v0.3.