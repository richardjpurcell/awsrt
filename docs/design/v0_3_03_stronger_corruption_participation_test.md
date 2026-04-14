# AWSRT v0.3 Subgoal 03: Stronger Corruption Participation Test

**Status:** Draft design note with first implementation-pass findings  
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

Subgoal 03 therefore began from a sharper question:

> if auxiliary participation is too weak, what stronger participation role should corruption-facing evidence play if it is actually going to matter in realized active behavior?

This note now records the first bounded Subgoal 03 implementation result.

---

## 2. Starting point inherited from Subgoal 02

Subgoal 02 should be treated as a meaningful narrowing checkpoint.

### 2.1 What Subgoal 02 achieved

Subgoal 02 achieved several useful things:

- it identified a defensible corruption-facing signal shape,
- it implemented that signal inside the active downshift / switch trigger surface,
- it preserved the current machine shape and recovery semantics,
- and it validated that this kind of controller-visible corruption signal can be added without architectural drift.

That was important progress. The project was no longer debating the corruption-facing idea in the abstract.

### 2.2 What Subgoal 02 did not achieve

Subgoal 02 did **not** achieve the intended behavioral outcome.

In the bounded compact probe:

- the corruption/noise case still remained trivially nominal,
- realized active state occupancy did not become meaningfully more corruption-sensitive,
- and the auxiliary corruption-facing component did not materially alter the active machine.

So Subgoal 02 should be read as a successful bounded implementation checkpoint but an incomplete behavioral result.

### 2.3 Why that mattered for Subgoal 03

This meant the next design question should not be phrased as:

> should we keep relaxing the same auxiliary thresholds?

That framing had become too weak and too local.

The better Subgoal 03 question was:

> does corruption-facing evidence need to act as more than an auxiliary strengthening term if the active surface is to express corruption-side caution honestly?

That was the correct reason to open Subgoal 03.

---

## 3. Subgoal 03 first implementation-pass findings

The first bounded Subgoal 03 implementation pass has now been attempted.

That pass:

- retained the corruption-facing signal from Subgoal 02,
- left switch-to-certified semantics unchanged,
- left recovery semantics unchanged,
- left the state machine unchanged,
- and strengthened corruption participation only on the **active downshift** path.

In practice, this meant moving beyond mere auxiliary participation and allowing corruption-facing evidence to create a direct active downshift path in a bounded way.

This was the right first Subgoal 03 implementation shape. It stayed disciplined, did not broaden the ontology, and did not turn into a machine redesign.

However, the result is now clear:

- even this stronger downshift-participation test did **not** materially change the corruption/noise active reading,
- the corruption/noise case still remained trivially nominal in the compact semantic probe,
- and the stronger participation role still did not create visible non-nominal active behavior under the current probe family.

This is a negative result in the narrow experimental sense, but a useful one in the design sense.

It means the next question is now sharper again:

> the issue may no longer be only how corruption-facing evidence participates inside the current trigger combiner, but whether the current active semantic-probe family is operating too far from the corruption/noise decision neighborhood to express corruption-side caution at all.

That is the key takeaway of this note.

---

## 4. Why Subgoal 03 was the right next step

### 4.1 The signal was no longer the main uncertainty

After Subgoal 02, the main uncertainty was not whether the project could compute a corruption-facing signal. It could.

The main uncertainty had become whether the **combiner role** of that signal was too weak.

That was a precise and valuable design question, and it justified Subgoal 03.

### 4.2 This remained the highest-payoff near-term control question

The strongest scientific and thesis-facing payoff still lay in adaptive control, not in broad realism work or general UI cleanup.

Subgoal 03 remained aligned with that priority because it addressed a live controller question:

- how should the active machine react when corruption-adjacent evidence is high,
- and how can that reaction be made readable without exaggeration?

### 4.3 This remained a disciplined continuation of v0.2

Subgoal 03 stayed downstream of the v0.2 interpretive checkpoint rather than reopening it.

It preserved the inherited discipline that:

- the compact usefulness path remains distinct in identity,
- regime management remains the broader active/advisory mechanism layer,
- and controller improvement should proceed without pretending that all late-stage control surfaces have unified.

That made Subgoal 03 a true control-development continuation rather than another boundary debate.

---

## 5. Main development question

The original central question for Subgoal 03 was:

> what is the smallest stronger participation role for corruption-facing evidence that can materially affect the corruption/noise active reading without redesigning the state machine?

That question has now received a first bounded answer:

- a stronger downshift-participation role was tested,
- but it still did not materially affect the corruption/noise active reading.

So the live question at the end of this first Subgoal 03 pass is now:

> is the problem still one of trigger-role strength, or is the present active semantic-probe family itself too far from the corruption/noise decision neighborhood?

That is the updated development question implied by this checkpoint.

---

## 6. Scope of Subgoal 03

Subgoal 03 was intended to remain narrow.

It focused on one compact class of changes:

- testing one stronger participation role for already-identified corruption-facing evidence.

That remained the correct scope.

It did **not**:

- redesign the active state machine,
- add new public controller families,
- invent many new signals,
- or broaden the schema/frontend surface.

This note confirms that the subgoal remained disciplined in scope even though the behavioral result was still negative.

---

## 7. What Subgoal 03 is and is not

### 7.1 What Subgoal 03 is

Subgoal 03 is a bounded test of stronger corruption participation.

It is about:

- determining whether corruption-facing evidence must play a stronger trigger role,
- improving corruption-side active interpretability if possible,
- and doing so without disturbing the current machine more than necessary.

### 7.2 What Subgoal 03 is not

Subgoal 03 is not:

- a broad controller rewrite,
- a new regime family,
- a new public ontology,
- a realism bridge subgoal,
- a frontend overhaul,
- or a license to proliferate special-case logic everywhere.

It is also not yet a claim that a final corruption-aware controller architecture has been found.

This remained true through the first implementation pass.

---

## 8. Working diagnosis after the first Subgoal 03 pass

At this point, the working diagnosis has become more specific.

### 8.1 Structural feasibility is no longer the issue

The first Subgoal 02 pass already showed that corruption-facing evidence can be inserted into the active trigger dictionaries cleanly.

Subgoal 03 now reinforces that stronger bounded participation can also be implemented without structural instability.

So structural feasibility is not the problem.

### 8.2 Auxiliary participation was too weak

Subgoal 02 already showed that auxiliary participation was too weak to change the corruption/noise realized machine.

That diagnosis remains valid.

### 8.3 Stronger downshift participation still did not bite

Subgoal 03 now adds a second result:

- even a bounded stronger downshift role still did not materially change the corruption/noise active reading.

This means the next design issue is no longer simply “make the corruption signal stronger in the same neighborhood.”

### 8.4 The current probe family may be poorly positioned for corruption-side reading

The strongest working diagnosis now is:

- the present active semantic-probe family may be too far from the corruption/noise decision neighborhood to express corruption-side caution honestly,
- even when corruption-adjacent diagnostics are clearly elevated,
- and even when corruption-facing evidence is given a stronger bounded role in downshift logic.

This is the most important narrowing result now available.

---

## 9. Recommended development stance after the first Subgoal 03 pass

Subgoal 03 should now be read as a useful negative checkpoint rather than as an unfinished success.

The recommended stance is:

### 9.1 Preserve the result

Do not discard the result simply because it did not produce the hoped-for behavioral change.

The result is informative.

### 9.2 Do not keep nudging the same local role indefinitely

It would be a mistake to keep applying small router-side changes to the same strengthened downshift role without reframing the design question.

That would risk turning Subgoal 03 into another long threshold/role-tuning cycle with diminishing returns.

### 9.3 Elevate the question one level

The next question should likely be:

- whether a **dedicated corruption-sensitive semantic probe** is needed,
- or whether the current active preset family must be moved closer to the corruption-side decision neighborhood in a more explicit way.

That is a more disciplined continuation than continuing to push on the same local combiner seam.

---

## 10. Candidate directions after this checkpoint

Several directions are now visible, but they are no longer equally attractive.

### 10.1 Continue local router-side strengthening

This would mean continuing to strengthen corruption participation inside the current downshift or switch combiner.

This is now **less attractive** than before, because both:

- auxiliary participation, and
- a stronger bounded downshift role

have already failed to produce a meaningful corruption-side active change.

### 10.2 Dedicated corruption-sensitive semantic probe

This is now the most attractive next direction.

Interpretation:

- the current active family may not be positioned to express corruption-side caution clearly,
- so define a dedicated semantic probe in which corruption-facing evidence is intentionally given a more central and explicit role,
- without claiming that the broader active family has already been solved.

This would preserve discipline while moving the experiment closer to the actual design question.

### 10.3 Freeze Subgoal 03 now

Another disciplined option is to freeze Subgoal 03 immediately as a negative-but-useful checkpoint and move on.

That would also be defensible, especially if workflow pressure or real-fire bridge work becomes more urgent.

---

## 11. Preferred interpretation of this checkpoint

The preferred interpretation is:

> Subgoal 03 has now shown that stronger corruption participation on the current active downshift path is still insufficient to produce a meaningful corruption/noise reading in the compact semantic probe.

That should be stated plainly.

This is useful because it means the project can stop pretending the remaining issue is just one more local trigger-role tweak.

Instead, it can move forward with a more honest next question.

---

## 12. Experiment design reading

Subgoal 03 retained the right compact study family.

### 12.1 Study shape

The study still used:

- one healthy reference,
- one stale/delay case,
- one corruption/noise case.

That continuity was important because it preserved comparability across:
- Subgoal 01,
- Subgoal 02,
- and now Subgoal 03.

### 12.2 What the comparison now says

The comparison has now become:

- Subgoal 02 auxiliary corruption participation,
- versus Subgoal 03 stronger corruption participation.

And the answer is:

- neither version materially changed the corruption/noise realized machine inside the current compact active semantic probe.

That is now a real result, not a pending question.

### 12.3 Evaluation emphasis

The evaluation emphasis remained correct:

- realized active state occupancy,
- transition counts,
- whether corruption/noise stops reading as trivially nominal,
- whether delay remains more recoverable than corruption,
- and whether the result stays interpretable.

By those criteria, Subgoal 03 did **not** yet achieve the intended behavioral success.

But it did succeed in ruling out one more bounded design hypothesis.

---

## 13. Relation to real-fire deployment-simulation work

This checkpoint slightly changes the development posture.

The higher-payoff near-term thesis question still remains controller sensitivity and active interpretability.

However, because the current active-family corruption question has now produced two bounded negative checkpoints in a row, it becomes more reasonable to consider whether:

- the next control-facing step should be a dedicated corruption-sensitive probe design,
- or whether bounded real-fire execution-window work should temporarily move forward in parallel.

This note does not force that choice, but it does make it more plausible than before.

---

## 14. Likely implementation touchpoints from here

The most likely files after this checkpoint are now:

- `docs/design/v0_3_03_stronger_corruption_participation_test.md`
- `frontend/app/operational/designer/page.tsx` if a dedicated corruption-sensitive semantic probe preset is introduced
- `backend/api/routers/operational.py` only if that next probe requires one more bounded backend role adjustment

This is a subtle but important shift.

The next bounded step may now be better initiated from the **probe family / preset side** rather than from another small router-side combiner change.

---

## 15. Suggested success criteria

Subgoal 03 should have been considered successful if:

- one stronger corruption-participation role was tested,
- the corruption/noise case stopped appearing trivially nominal,
- healthy behavior remained broadly readable,
- stale and corruption became more distinguishable in realized active behavior,
- and the result remained explainable without changing the machine shape.

### 15.1 What was achieved

What was achieved is:

- one stronger corruption-participation role was tested,
- the implementation remained disciplined,
- healthy and delay-side readings did not collapse,
- and the result is interpretable.

### 15.2 What was not achieved

What was **not** achieved is:

- the corruption/noise case still did not stop appearing trivially nominal,
- and the active machine still did not express corruption-side caution in a meaningfully visible way under the current compact probe.

So Subgoal 03 should currently be read as a valid checkpoint rather than a completed success.

---

## 16. Warning signs

Subgoal 03 should now be treated as drifting if:

- it continues as another long sequence of local router-side strength tweaks,
- it changes downshift, switch, and recovery all at once,
- it introduces multiple new corruption-facing signals in one pass,
- it begins using controller-invisible quantities,
- or it broadens the public controller surface prematurely.

A specific warning sign now is:

- continuing to insist the problem is only one more local combiner adjustment, despite two bounded negative checkpoints already showing otherwise.

Another warning sign would be:

- reacting to these negative results by jumping directly to a large machine redesign.

The disciplined move is neither denial nor overreaction. It is to reframe the question carefully.

---

## 17. Relationship to likely next steps

A plausible sequence after this note is now:

### 17.1 Freeze Subgoal 03 as a checkpoint

Record that stronger downshift participation still did not materially change the corruption/noise case.

### 17.2 Decide whether to open a dedicated corruption-sensitive semantic probe subgoal

If the project wants to continue this line immediately, the next bounded step should likely be:

- a dedicated corruption-sensitive probe family or preset,
- not another small variant of the same strengthened downshift patch.

### 17.3 Reconsider sequencing with real-fire execution-window support

Because the current corruption-side question has now reached a clearer local stopping point, it is more reasonable than before to reconsider the timing of bounded real-fire execution-window work.

---

## 18. Short summary

Subgoal 03 is the next bounded controller-facing step after the Subgoal 02 corruption-signal checkpoint. Subgoal 02 showed that corruption-facing evidence can be inserted cleanly into the active trigger surface, but also showed that auxiliary participation alone does not materially change the corruption/noise active reading. Subgoal 03 then tested a stronger bounded downshift-participation role while preserving the current state machine, recovery semantics, and switch semantics. The result was still negative in the behavioral sense: the corruption/noise case remained trivially nominal in the compact semantic probe. This is a useful narrowing checkpoint. It suggests that the next question is no longer just how strongly corruption evidence participates inside the current combiner, but whether the current active semantic-probe family is itself too far from the corruption/noise decision neighborhood to express corruption-side caution honestly.