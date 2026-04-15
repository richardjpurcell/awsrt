# AWSRT v0.3 Subgoal 04: Corruption-Sensitive Semantic Probe

**Status:** Draft design note  
**Applies to:** `v0.3-subgoal-04`  
**Purpose:** Define the next bounded controller-facing step after the Subgoal 03 checkpoint by introducing a dedicated corruption-sensitive semantic probe, so the project can test corruption-side caution in a probe family intentionally positioned nearer the corruption/noise decision neighborhood rather than continuing small trigger-role tweaks inside the current active family.

---

## 1. Purpose of this note

This note defines the next disciplined step after AWSRT v0.3 Subgoal 03.

Subgoal 02 established that a corruption-facing signal can be inserted cleanly into the active trigger surface, but that auxiliary participation alone did not materially change the corruption/noise active reading.

Subgoal 03 then tested a stronger bounded role for that same corruption-facing evidence on the active downshift path. That was the right next question. It preserved the state machine, preserved recovery semantics, preserved switch semantics, and asked whether a modest increase in corruption participation strength was enough to make the corruption/noise case stop reading as trivially nominal.

The answer was still negative.

That is now a meaningful narrowing result. It suggests that the next question should no longer be framed mainly as:

> how should corruption-facing evidence be weighted inside the current active semantic probe family?

Instead, the next question should be framed as:

> is the current active semantic-probe family itself too far from the corruption/noise decision neighborhood, such that corruption-side caution cannot become legible without changing the probe family rather than only the combiner?

This note defines Subgoal 04 as the first bounded attempt to answer that question.

---

## 2. Starting point inherited from Subgoals 02 and 03

Subgoals 02 and 03 together should now be treated as a two-step narrowing sequence.

### 2.1 What Subgoal 02 established

Subgoal 02 established that:

- a corruption-facing signal can be defined from controller-visible quantities,
- that signal can be inserted into the active trigger surface cleanly,
- and the project can test corruption-side participation without broadening the machine or reopening the controller-boundary question.

This was an important implementation and interpretive checkpoint.

### 2.2 What Subgoal 03 established

Subgoal 03 established that:

- stronger bounded downshift participation for corruption-facing evidence is also implementable,
- but even that stronger role still did not materially change the corruption/noise active reading inside the compact semantic probe.

That means the project has now tested both:

- auxiliary corruption participation,
- and stronger bounded downshift participation,

without obtaining a meaningful corruption-side active reading.

### 2.3 Why this matters

This means the remaining ambiguity is no longer most usefully described as a local trigger-weight or trigger-role problem alone.

The more likely issue is now:

- the current active semantic-probe family may simply not be operating in a region of behavior space where corruption-side caution can become legible,
- even when corruption-facing diagnostics are elevated,
- and even when corruption-facing evidence is given a somewhat stronger bounded role.

That is the reason for Subgoal 04.

---

## 3. Why Subgoal 04 is the right next step

### 3.1 Two bounded negative checkpoints justify a probe-family shift

If only Subgoal 02 had failed, it would still be reasonable to suspect that corruption evidence was merely too weakly integrated.

But after Subgoal 03, the project now has two bounded negative checkpoints:

- one for auxiliary participation,
- one for stronger bounded downshift participation.

That is enough to justify moving the experiment one level up, from trigger-role tuning to probe-family design.

### 3.2 This is still a control-facing continuation, not a reset

Subgoal 04 does not abandon the control-facing thread. It deepens it.

The issue is still adaptive control, active interpretability, and corruption-versus-staleness reading. The change is only that the next bounded step should be made in the **probe family** rather than by another small router-side combiner tweak.

### 3.3 This keeps the work compact and scientifically legible

A dedicated corruption-sensitive semantic probe is attractive because it allows the project to test a more corruption-aware active reading **without** immediately claiming that the broader active family has been solved.

That keeps the experiment compact, honest, and legible.

---

## 4. Main development question

The central question for Subgoal 04 is:

> can a dedicated corruption-sensitive semantic probe produce a more honest and legible corruption-side active reading than the current compact active probe family, without requiring a broad controller redesign?

More concretely:

> if the current active semantic-probe family is too far from the corruption/noise decision neighborhood, what is the smallest probe-family adjustment that moves the experiment closer to that neighborhood while preserving machine interpretability?

This is the main question the subgoal should answer.

---

## 5. Scope

Subgoal 04 should remain narrow.

It should focus on one compact class of changes:

- introducing and evaluating one dedicated corruption-sensitive semantic probe.

That does **not** mean:

- redesigning the active state machine,
- inventing a new public controller family,
- introducing many new backend signals,
- or broadening the schema/frontend surface unnecessarily.

Instead, it means changing the **experimental probe family** in a bounded and explicit way.

Subgoal 04 should therefore remain:

- bounded,
- mechanism-facing,
- preset/probe-oriented,
- and explicitly comparative.

---

## 6. What Subgoal 04 is and is not

### 6.1 What Subgoal 04 is

Subgoal 04 is a bounded corruption-sensitive semantic-probe subgoal.

It is about:

- defining a dedicated active semantic probe more likely to expose corruption-side caution,
- testing whether that probe yields a more legible corruption/noise reading,
- and doing so without pretending that the broader active family has already become corruption-aware by default.

### 6.2 What Subgoal 04 is not

Subgoal 04 is not:

- a broad controller rewrite,
- a new general regime family,
- a claim of full corruption-aware controller completion,
- a realism bridge subgoal,
- a large frontend redesign,
- or a reason to add many new backend semantics at once.

It is also not a rejection of Subgoals 02 and 03. It is the next disciplined step made possible by them.

---

## 7. Working diagnosis entering Subgoal 04

At the start of Subgoal 04, the current working diagnosis is:

### 7.1 The current compact active probe is support-dominated

The current active semantic probe appears to remain dominated by support-heavy logic such as:

- utilization,
- strict drift proxy,
- and related support/degradation structure.

That helps explain why healthy- and stale-side differences can become readable while corruption-side caution remains weak.

### 7.2 Corruption-side evidence exists but remains under-expressed behaviorally

The project already has corruption-adjacent quantities such as:

- misleading activity,
- recent misleading activity support,
- recent driver information,
- and arrivals-side activity.

So the main issue is not whether corruption can be measured. It can.

The issue is whether the current probe family gives that evidence a context where it can matter behaviorally.

### 7.3 The next question is about experimental positioning

This is the key shift.

The question is no longer mainly:

- how can corruption evidence be patched into the existing probe more strongly?

The question is now:

- what probe family places the machine in a configuration where corruption-side caution can become visible and interpretable?

That is the real content of Subgoal 04.

---

## 8. Recommended development stance

Subgoal 04 should follow these principles.

### 8.1 Change the probe family before changing the machine again

The next bounded step should prefer a probe-family change over another machine/combiner change.

That keeps the work disciplined and avoids overfitting the router logic to the current negative checkpoints.

### 8.2 Keep the state machine intact

The first corruption-sensitive semantic probe should preserve:

- the current active state machine,
- the current recovery semantics,
- the current certified semantics,
- and the current advisory/active distinction.

The main change should be in the probe setup and interpretation surface.

### 8.3 Make the probe explicitly experimental

The dedicated corruption-sensitive probe should be described plainly as:

- an experimental semantic probe,
- not the new default meaning of the broader active family.

This matters for honesty and for continuity with the v0.2 boundary discipline.

### 8.4 Preserve comparability

The new corruption-sensitive semantic probe should still be tested against the same compact study family:

- healthy,
- delay/staleness,
- corruption/noise,
- and optionally one mixed case if needed.

That will make the result comparable to Subgoals 01–03.

---

## 9. Candidate forms for the corruption-sensitive semantic probe

Several bounded probe-family designs are possible.

### 9.1 Threshold-neighborhood probe

One option is to define a probe preset whose thresholds place the machine closer to the corruption-side decision boundary from the start.

Interpretation:

- the current compact probe may simply be living too far from the region where corruption evidence matters,
- so adjust the probe family to sit nearer that region without changing the machine.

This is attractive because it is simple and may require little or no backend change.

### 9.2 Signal-profile probe

Another option is to define a probe preset that gives corruption-adjacent evidence a clearer experimental profile by changing which signals are emphasized together.

For example, a corruption-sensitive probe might intentionally:

- reduce reliance on support-heavy stable signals,
- and place more experimental weight on corruption-adjacent conditions in the probe design itself.

This may still be possible without broad backend change.

### 9.3 Dedicated corruption probe plus tiny backend allowance

A third option is to define a dedicated corruption-sensitive preset in the designer, and pair it with one very small backend semantic allowance if truly necessary.

This is a plausible compromise if the probe family alone is not enough.

### 9.4 Probe-only first, backend changes second

The most conservative option is:

- first create the corruption-sensitive semantic probe in the frontend/preset layer,
- test it against the current backend,
- and only then decide whether one tiny backend allowance is justified.

This is likely the best first posture unless early inspection strongly suggests it cannot work.

---

## 10. Preferred target

The preferred first target is:

> define one dedicated corruption-sensitive semantic probe preset and test it against the existing active machine before making any further substantial router-side changes.

This is the best next step because:

- it follows directly from the Subgoal 02 and 03 negative checkpoints,
- it changes the experimental positioning rather than overworking the same combiner seam,
- it remains compact and reversible,
- and it lets the project test whether the active machine can produce a better corruption-side reading when the probe family is intentionally positioned for it.

### 10.1 Preferred first concrete form

The preferred first concrete form is:

- introduce one dedicated corruption-sensitive active semantic probe preset in the designer,
- keep the current active machine intact,
- keep the same compact trio of runs,
- and read the result as a probe-family test rather than a broad controller claim.

### 10.2 What should wait

For this subgoal, the project should avoid:

- redesigning the broader active family,
- adding multiple new corruption-facing backend signals,
- changing downshift, switch, and recovery together,
- or claiming that the new probe is the new default controller interpretation.

The first move should stay clearly probe-level.

---

## 11. Preferred implementation stance

The preferred implementation order is:

### Step 1

Define the intended meaning of the corruption-sensitive semantic probe in the note before touching code.

### Step 2

Inspect `frontend/app/operational/designer/page.tsx` and identify the current semantic-probe preset structure.

### Step 3

Create one dedicated corruption-sensitive active semantic probe preset.

### Step 4

Run the compact comparison:
- healthy,
- stale/delay,
- corruption/noise,
- and optionally one mixed case.

### Step 5

Interpret the result honestly:
- did the corruption/noise case stop reading as trivially nominal,
- did delay remain more recoverable than corruption,
- and did the new reading become easier to explain?

This is the most disciplined next sequence.

---

## 12. Experiment design for Subgoal 04

Subgoal 04 should again use a compact study family.

### 12.1 Recommended study shape

The main study should still include:

- one healthy reference,
- one stale/delay case,
- one corruption/noise case,
- and optionally one mixed case if needed.

This continuity matters because it preserves comparability across:

- Subgoal 01,
- Subgoal 02,
- Subgoal 03,
- and now Subgoal 04.

### 12.2 Recommended comparison logic

The main comparison should now be:

- current compact active semantic probe,
- versus dedicated corruption-sensitive semantic probe.

That is a cleaner and more appropriate comparison now than continuing to compare only small combiner variants.

### 12.3 Recommended evaluation emphasis

Evaluation should prioritize:

- realized active state occupancy,
- transition counts,
- whether corruption/noise stops reading as trivially nominal,
- whether delay remains more recoverable than corruption,
- and whether the new probe remains interpretable.

Headline belief metrics still matter, but they should remain secondary to the mechanism-facing reading here.

---

## 13. Relation to real-fire deployment-simulation work

Subgoal 04 still remains a control-facing continuation and therefore should remain ahead of the real-fire bridge unless workflow needs force a change.

However, the situation is now slightly different than it was before.

Because the project has already produced multiple bounded negative checkpoints on the corruption-side active reading, it becomes more reasonable to manage two possible paths after this subgoal:

- continue the adaptive-control thread if the corruption-sensitive probe yields something legible,
- or shift more attention to bounded real-fire execution-window support if the control-side line continues to stall locally.

This note does not decide that sequence fully, but it makes the possible branching clearer.

---

## 14. Likely implementation touchpoints

The most likely files for Subgoal 04 are:

- `docs/design/v0_3_04_corruption_sensitive_semantic_probe.md`
- `frontend/app/operational/designer/page.tsx`
- possibly `backend/api/routers/operational.py` only if the new probe truly requires one tiny backend allowance

The expected emphasis should remain:

### First pass

- note-level probe definition
- designer preset work
- compact rerun comparison

### Only if justified

- one tiny backend patch
- one small explanation update in designer text

Large refactor remains out of scope.

---

## 15. Suggested success criteria

Subgoal 04 should be considered successful if:

- one dedicated corruption-sensitive semantic probe is defined,
- the corruption/noise case stops appearing trivially nominal under that probe,
- healthy behavior remains broadly readable,
- delay remains more recoverable than corruption,
- and the result is explainable without claiming broad controller redesign.

A strong success outcome would be:

- the corruption-sensitive probe yields visible non-nominal active behavior in the noise case,
- while still preserving a readable separation between healthy, delay, and corruption conditions.

---

## 16. Warning signs

Subgoal 04 should be treated as drifting if:

- it becomes another long series of backend combiner tweaks without ever defining the new probe family clearly,
- it quietly broadens the public controller surface,
- it introduces multiple new corruption-sensitive presets at once,
- it changes the state machine while also changing the probe family,
- or it starts making broad corruption-aware controller claims from one experimental preset.

A specific warning sign would be:

- defining a corruption-sensitive probe so extreme that it makes every non-ideal case collapse into the same reading.

The goal is not to force the desired result. The goal is to place the experiment nearer the corruption-side decision neighborhood and see whether a legible reading becomes possible.

---

## 17. Relationship to likely next steps

A plausible sequence after this note is:

### 17.1 Subgoal 04 implementation pass

Define and test one dedicated corruption-sensitive semantic probe preset.

### 17.2 Compact validation checkpoint

Freeze and interpret the result of that probe-family comparison.

### 17.3 Decide between two follow-on paths

After that checkpoint, the project can decide more honestly whether to:

- continue the corruption-sensitive control thread,
- or shift near-term attention toward bounded real-fire execution-window support.

### 17.4 Later v0.3 continuation

Only after that should the project consider:

- broader corruption-aware active-family design,
- broader robustness studies,
- or more general platform catch-up work.

---

## 18. Short summary

Subgoal 04 is the next bounded controller-facing step after the Subgoal 03 checkpoint. Subgoal 02 showed that corruption-facing evidence can be inserted cleanly into the active trigger surface, and Subgoal 03 showed that even a stronger bounded downshift-participation role still did not materially change the corruption/noise active reading. The next disciplined question is therefore no longer just how corruption evidence participates inside the current trigger combiner, but whether the current active semantic-probe family is itself too far from the corruption/noise decision neighborhood. Subgoal 04 answers that by defining a dedicated corruption-sensitive semantic probe and testing whether it can produce a more honest and legible corruption-side active reading without requiring a broad controller redesign.