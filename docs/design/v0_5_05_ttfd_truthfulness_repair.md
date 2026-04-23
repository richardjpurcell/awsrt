# AWSRT v0.5 Subgoal 05: TTFD Truthfulness Repair

**Status:** Draft design note  
**Applies to:** `v0.5-subgoal-05`  
**Purpose:** Repair the now-identified `TTFD = 0` truthfulness issue in bounded usefulness-family transformed real-fire runs, while preserving the corrected usefulness-family study structure and avoiding broader controller or campaign changes.

---

## 1. Purpose of this note

This note defines AWSRT v0.5 Subgoal 05.

Subgoal 04 should now be read as a successful but qualified cross-fire confirmation step. It showed that the corrected bounded usefulness-family comparison remained structurally stable across multiple transformed real-fire contexts, and that the healthy / delay / noise family remained scientifically legible in a cautious thesis-facing sense.

However, that closeout also surfaced an issue that can no longer be deferred:

- some noise-side runs reported `TTFD = 0`,
- that value is now judged to be incorrect,
- and because `TTFD` is a headline metric, the issue may affect interpretation if left unresolved.

Subgoal 05 therefore does **not** broaden the usefulness-family study.  
It does **not** redesign the controller.  
It does **not** launch a bigger campaign.

Instead, it isolates one narrow but important question:

> Why are some bounded transformed real-fire runs reporting `TTFD = 0`, and what is the smallest truthful repair needed?

This is a metric-truthfulness subgoal.

---

## 2. Scientific intent

The scientific intent of this subgoal is limited but important.

AWSRT has been using `TTFD` as a headline timeliness metric, especially when interpreting how delay and noise affect the usefulness of delivered information. If `TTFD` can take an incorrect value such as `0` under some impairment conditions, then one of the main scientific handles on timeliness is no longer trustworthy enough for thesis-facing use.

The purpose here is therefore:

- to restore confidence in `TTFD` as a truthful metric,
- to clarify exactly what event `TTFD` is supposed to represent,
- and to ensure that impairment-side readings are not being distorted by a faulty headline timing value.

This subgoal is not about optimizing detection.  
It is about making sure the timing metric means what AWSRT says it means.

---

## 3. Subgoal framing

At the current AWSRT stage, this subgoal should be understood as a **headline-metric truthfulness repair slice**.

Subgoal 03 repaired the bounded usefulness-family sweep shape.  
Subgoal 04 confirmed that the corrected usefulness-family family remained legible across fires.  
Subgoal 05 now repairs a metric-level truthfulness issue discovered during that confirmation work.

This means the subgoal is about:

- **metric semantics**, not controller redesign;
- **truthful interpretation**, not broader functionality;
- **minimal repair**, not campaign expansion;
- **audit-friendly diagnosis**, not speculative rewrites.

---

## 4. The concrete problem

The immediate problem is that some bounded transformed real-fire runs reported:

- `TTFD = 0`

and this value is believed to be incorrect.

Because the same summaries also showed nontrivial behavior elsewhere, the issue is unlikely to be a simple “everything happened instantly” reading. Instead, the problem is likely to lie somewhere in the definition, propagation, or summarization of first-detection timing.

The key possibilities include:

- `ttfd` being computed from the wrong event definition;
- `ttfd_true` and `ttfd_arrived` being conflated;
- first-generated versus first-arrived detection semantics being mixed incorrectly;
- missing or sentinel values collapsing to zero during summary extraction;
- impairment-side observation timing being mishandled in the presence of noise;
- or a noise-side branch incorrectly satisfying a “detection happened” condition at step zero.

The purpose of this subgoal is to narrow that down precisely rather than speculate broadly.

---

## 5. Working metric question

The core metric question for this subgoal is:

> What does AWSRT mean by `TTFD`, and is the current implementation actually measuring that quantity?

At minimum, the relationship among the following fields needs to be clarified:

- `ttfd`
- `ttfd_true`
- `ttfd_arrived`

The system should be able to answer, clearly and consistently:

- which one is the canonical headline metric,
- what event marks the first detection,
- whether the event is based on generation, arrival, or validated arrival,
- how impairments such as delay and noise are supposed to influence it,
- and what value should be emitted when no valid detection occurs.

Until that is clarified and repaired, thesis-facing use of `TTFD` should remain cautious.

---

## 6. What this subgoal is not

To keep scope disciplined, Subgoal 05 is **not** the place to do the following:

- redesign the usefulness controller;
- change the healthy / delay / noise family definition;
- rerun a large multi-fire campaign before diagnosis;
- replace `TTFD` with a new family of timing metrics;
- merge this issue into a larger metric-refactor effort;
- or broaden into a general analysis overhaul.

Those may become later tasks if necessary, but they are not the purpose here.

This subgoal should remain tightly focused on the smallest truthful repair.

---

## 7. Concrete implementation direction

The main work should proceed in a narrow, auditable order.

### 7.1 Clarify the intended semantics first

Before changing code, identify the intended semantics of:

- `ttfd`
- `ttfd_true`
- `ttfd_arrived`

This should be done by reading the current implementation path and deciding which field is supposed to support the headline timing interpretation in impaired runs.

If the intended semantics are already present but the emitted value is wrong, then the task is a bug fix.  
If the semantics themselves are ambiguous, then the first task is to make them explicit.

### 7.2 Trace the value path end to end

Trace `TTFD` through the relevant pipeline:

1. where the first-detection event is created,
2. where impairment effects alter observation timing or validity,
3. where per-run fields are written,
4. where study rows are assembled,
5. and where summary statistics expose `ttfd`.

The goal is to identify the narrowest point at which an incorrect `0` is introduced.

### 7.3 Reproduce the issue on the smallest possible slice

Do not begin with a large campaign rerun.

Instead, reproduce the `TTFD = 0` issue using the smallest bounded usefulness-family slice that still shows the problem, ideally:

- one fire,
- one policy,
- the canonical three-case usefulness-family sweep,
- and only enough seeds to confirm reproduction.

This keeps the diagnosis audit-friendly.

### 7.4 Repair the problem narrowly

Once the issue location is identified, make the smallest patch that restores truthful behavior.

Preferred repair order:

1. fix event-definition logic if wrong;
2. otherwise fix metric propagation if wrong;
3. otherwise fix summary extraction if zero is being introduced there;
4. avoid touching unrelated usefulness-family, controller, or frontend logic.

### 7.5 Re-run smoke validation

After the patch, rerun a compact smoke slice and verify at minimum:

- `TTFD` is no longer incorrectly `0`,
- delay still reads as a stale-information case,
- noise-side runs no longer produce impossible timing values,
- study semantics and usefulness-family labels remain unchanged,
- no extra base case reappears,
- and the patch does not disturb the corrected Subgoal 03/04 sweep structure.

---

## 8. Expected evidence

By the end of this subgoal, the expected evidence should consist of:

- a precise explanation of why `TTFD = 0` appeared,
- a narrow patch correcting that issue,
- a compact rerun showing the corrected behavior,
- and a short interpretive note stating whether the repair materially changes the earlier Subgoal 04 reading.

The strongest outcome would be:

1. the issue is traced cleanly,
2. the patch is very small,
3. the corrected `TTFD` values now behave truthfully under noise and delay,
4. and the main Subgoal 04 usefulness-family reading remains broadly intact.

A weaker but still acceptable outcome would be:

- the issue is repaired,
- but some earlier interpretation must be modestly revised.

That would still be scientifically honest and acceptable.

---

## 9. Minimal success criteria

Subgoal 05 should be considered complete if all of the following are true:

1. The source of the incorrect `TTFD = 0` values is identified precisely.
2. A minimal patch is made at the correct point in the pipeline.
3. Compact smoke runs show that incorrect zero-valued `TTFD` outputs no longer occur.
4. The bounded usefulness-family study semantics remain unchanged and truthful.
5. A brief note can be written stating whether the Subgoal 04 cross-fire interpretation remains intact or needs limited revision.

---

## 10. Exit condition and likely next step

If Subgoal 05 succeeds, AWSRT will have moved from:

- **cross-fire usefulness-family confirmation with a known headline-metric caveat**

to:

- **cross-fire usefulness-family confirmation with repaired TTFD truthfulness**

At that point, the likely next step would be one of two things:

- a short synthesis note confirming that the Subgoal 04 reading survives the metric repair, or
- a very small follow-on validation slice if the repair meaningfully changes the timing interpretation.

That next step should still remain scientifically careful and should avoid turning the repair into a broad redesign effort.

---

## 11. Working note

This subgoal should be carried out in the same disciplined style used in the previous steps:

- small patches,
- explicit smoke tests,
- path-level diagnosis,
- and cautious interpretation.

The main result sought here is not new functionality.  
It is restored confidence that AWSRT’s headline timing metric is truthful enough to support thesis-facing interpretation under impaired transformed real-fire conditions.