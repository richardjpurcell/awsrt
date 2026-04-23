# AWSRT v0.5 Subgoal 05: TTFD Truthfulness Repair

**Status:** Draft design note  
**Applies to:** `v0.5-subgoal-05`  
**Purpose:** Repair the identified headline-`TTFD` truthfulness issue in bounded usefulness-family transformed real-fire runs by restoring `ttfd` to a truthful first-detection metric, while preserving the corrected usefulness-family study structure and avoiding broader controller or campaign changes.

---

## 1. Purpose of this note

This note defines AWSRT v0.5 Subgoal 05.

Subgoal 04 should now be read as a successful but qualified cross-fire confirmation step. It showed that the corrected bounded usefulness-family comparison remained structurally stable across multiple transformed real-fire contexts, and that the healthy / delay / noise family remained scientifically legible in a cautious thesis-facing sense.

However, that closeout also surfaced an issue that could no longer be deferred:

- some noise-side runs reported `TTFD = 0`,
- that value was judged to be incorrect,
- and because `TTFD` is a headline metric, the issue risked distorting interpretation if left unresolved.

Subgoal 05 therefore did **not** broaden the usefulness-family study.  
It did **not** redesign the controller.  
It did **not** launch a bigger campaign.

Instead, it isolated one narrow but important question:

> Why are some bounded transformed real-fire runs reporting `TTFD = 0`, and what is the smallest truthful repair needed?

That diagnosis has now been carried through far enough to support a clearer conclusion:

> the headline `ttfd` field had been tracking the wrong first-detection stream under impaired conditions, and the truthful repair was to restore `ttfd` to the truth-aligned first-detection event rather than the arrived/impaired detection stream.

This is therefore a metric-truthfulness subgoal, now with an implemented repair and smoke-test confirmation.

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

The resulting interpretation should now be read as:

- `ttfd` is the canonical headline first-detection timing field,
- `ttfd_true` is the explicit truth-aligned companion field,
- `ttfd_arrived` remains the delayed / impaired arrival-stream timing field,
- and these should not be conflated in impairment-facing interpretation.

---

## 3. Subgoal framing

At the current AWSRT stage, this subgoal should be understood as a **headline-metric truthfulness repair slice**.

Subgoal 03 repaired the bounded usefulness-family sweep shape.  
Subgoal 04 confirmed that the corrected usefulness-family family remained legible across fires.  
Subgoal 05 then repaired a metric-level truthfulness issue discovered during that confirmation work.

This means the subgoal is about:

- **metric semantics**, not controller redesign;
- **truthful interpretation**, not broader functionality;
- **minimal repair**, not campaign expansion;
- **audit-friendly diagnosis**, not speculative rewrites.

The important outcome is not merely that a suspicious number disappeared.  
It is that the headline timing metric is now better aligned with the event AWSRT actually intends to summarize.

---

## 4. The concrete problem

The immediate problem was that some bounded transformed real-fire runs reported:

- `TTFD = 0`

and this value was believed to be incorrect.

Because the same summaries also showed nontrivial behavior elsewhere, the issue was unlikely to be a simple “everything happened instantly” reading. Instead, the problem lay in the definition and propagation of first-detection timing under impaired conditions.

The key possibilities initially included:

- `ttfd` being computed from the wrong event definition;
- `ttfd_true` and `ttfd_arrived` being conflated;
- first-generated versus first-arrived detection semantics being mixed incorrectly;
- missing or sentinel values collapsing to zero during summary extraction;
- impairment-side observation timing being mishandled in the presence of noise;
- or a noise-side branch incorrectly satisfying a “detection happened” condition at step zero.

The diagnosis now supports a narrower reading:

- the headline `ttfd` field had been following the arrived/impaired detection stream rather than the truth-aligned first-detection event,
- and this produced misleading headline values under impairment, especially on the noise side where the arrived stream could behave very differently from the underlying true first-detection timing.

So the repair target was not a broad analysis rewrite.  
It was a narrow restoration of semantic alignment.

---

## 5. Working metric question

The core metric question for this subgoal was:

> What does AWSRT mean by `TTFD`, and is the current implementation actually measuring that quantity?

At minimum, the relationship among the following fields needed to be clarified:

- `ttfd`
- `ttfd_true`
- `ttfd_arrived`

The system needed to answer, clearly and consistently:

- which one is the canonical headline metric,
- what event marks the first detection,
- whether the event is based on generation, arrival, or validated arrival,
- how impairments such as delay and noise are supposed to influence it,
- and what value should be emitted when no valid detection occurs.

The resulting answer for Subgoal 05 is:

- `ttfd` should be the canonical headline timing field,
- its semantics should match the truth-aligned first-detection event,
- `ttfd_true` should remain available explicitly for auditability,
- `ttfd_arrived` should remain available for impairment-channel interpretation,
- and impairment effects should still appear in `ttfd_arrived` and related diagnostics rather than silently redefining the headline metric.

This keeps the timing story interpretable:

- truth-aligned first detection answers **when the system first truly had fire under sensor support**, while
- arrived/impaired first detection answers **when the channel-delivered observation stream first reflected that event**.

Both are useful, but they are not the same metric.

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

This subgoal remains tightly focused on the smallest truthful repair.

---

## 7. Concrete implementation direction

The main work for this subgoal was organized in a narrow, auditable order.

### 7.1 Clarify the intended semantics first

Before changing code, the intended semantics of:

- `ttfd`
- `ttfd_true`
- `ttfd_arrived`

had to be distinguished explicitly.

That clarification now reads as follows:

- `ttfd` is the headline metric for first detection,
- `ttfd_true` is the explicit truth-aligned audit field,
- `ttfd_arrived` is the delayed / impaired channel-arrival field.

The repair goal was to ensure that the headline metric was not accidentally inheriting the wrong event stream.

### 7.2 Trace the value path end to end

The `TTFD` path was traced through the relevant pipeline:

1. where truth detections were created,
2. where impairments altered observation arrival or content,
3. where per-run summary fields were written,
4. where study rows were assembled,
5. and where summary statistics exposed `ttfd`.

This tracing showed that the problem was not primarily in batch-analysis ranking logic.  
The critical issue was upstream in the operational metric semantics.

### 7.3 Reproduce the issue on the smallest possible slice

The issue was reproduced using the smallest bounded usefulness-family slice that still showed the problem:

- one fire,
- one policy,
- the canonical three-case usefulness-family sweep,
- and a compact seed set.

This kept the diagnosis audit-friendly and avoided unnecessary campaign reruns.

### 7.4 Repair the problem narrowly

Once the issue location was identified, the repair was made narrowly.

The preferred repair order was:

1. fix event-definition logic if wrong;
2. otherwise fix metric propagation if wrong;
3. otherwise fix summary extraction if zero was being introduced there;
4. avoid touching unrelated usefulness-family, controller, or frontend logic.

The resulting repair should be read as an **operational metric-semantics fix**:

- restore `ttfd` to the truth-aligned first-detection timing,
- preserve `ttfd_true` explicitly,
- preserve `ttfd_arrived` explicitly,
- and keep arrived/impaired timing available without allowing it to overwrite the headline interpretation.

### 7.5 Re-run smoke validation

After the patch, a compact bounded usefulness-family smoke slice was rerun.

The smoke validation now supports the following conclusions:

- incorrect zero-valued headline `ttfd` outputs no longer appear,
- row-level `ttfd` values are now aligned with `ttfd_true`,
- `ttfd_arrived` remains distinct where impairment semantics demand it,
- delay still reads as a stale-information case,
- noise-side runs no longer produce impossible headline timing values,
- study semantics and usefulness-family labels remain unchanged,
- and the corrected Subgoal 03/04 sweep structure remains intact.

---

## 8. Validation outcome

The smoke-test evidence is now strong enough to summarize directly.

In the repaired bounded usefulness-family smoke slice:

- healthy-side rows reported `ttfd = 24` and `ttfd_true = 24`,
- delay-side rows reported `ttfd = 24` and `ttfd_true = 24`,
- noise-side rows reported nonzero `ttfd` values that matched `ttfd_true`,
- and the old `TTFD = 0` headline symptom did not reappear.

Just as importantly, the explicit impairment-side distinction remained visible:

- healthy rows showed `ttfd_true = 24` and `ttfd_arrived = 24`,
- delay rows showed `ttfd_true = 24` and `ttfd_arrived = 28`,
- noise rows showed nonzero `ttfd_true` values while `ttfd_arrived` remained distinct.

This means the repair did **not** erase impairment behavior.  
It restored the correct separation between:

- the headline truth-aligned timing field, and
- the delayed / impaired arrival-stream timing field.

That is the desired scientific outcome.

---

## 9. Expected evidence

By the end of this subgoal, the expected evidence consisted of:

- a precise explanation of why `TTFD = 0` appeared,
- a narrow patch correcting that issue,
- a compact rerun showing the corrected behavior,
- and a short interpretive note stating whether the repair materially changed the earlier Subgoal 04 reading.

That evidence is now substantially in place.

The strongest outcome for this subgoal was:

1. the issue was traced cleanly,
2. the patch remained narrow,
3. the corrected `TTFD` values now behave truthfully under noise and delay,
4. and the main usefulness-family reading remains broadly intact.

This is the reading Subgoal 05 should now support.

---

## 10. Minimal success criteria

Subgoal 05 should be considered complete if all of the following are true:

1. The source of the incorrect `TTFD = 0` values is identified precisely.
2. A minimal patch is made at the correct point in the pipeline.
3. Compact smoke runs show that incorrect zero-valued headline `TTFD` outputs no longer occur.
4. The bounded usefulness-family study semantics remain unchanged and truthful.
5. A brief note can be written stating whether the Subgoal 04 cross-fire interpretation remains intact or needs limited revision.

At the current stage, those conditions appear to be satisfied.

---

## 11. Exit condition and likely next step

If Subgoal 05 is accepted as complete, AWSRT will have moved from:

- **cross-fire usefulness-family confirmation with a known headline-metric caveat**

to:

- **cross-fire usefulness-family confirmation with repaired TTFD truthfulness**

At that point, the likely next step would be one of two things:

- a short synthesis note confirming that the Subgoal 04 reading survives the metric repair, or
- a very small follow-on validation slice if the repair meaningfully changes the timing interpretation on additional fires.

At present, the smoke evidence suggests the more likely reading is the first one:

- the Subgoal 04 usefulness-family interpretation appears to survive,
- but it now rests on a more truthful headline timing metric.

That next step should still remain scientifically careful and should avoid turning the repair into a broad redesign effort.

---

## 12. Working note

This subgoal should be read in the same disciplined style used in the previous steps:

- small patches,
- explicit smoke tests,
- path-level diagnosis,
- and cautious interpretation.

The main result sought here was not new functionality.  
It was restored confidence that AWSRT’s headline timing metric is truthful enough to support thesis-facing interpretation under impaired transformed real-fire conditions.

The current smoke evidence suggests that this goal has been met:

- the zero-valued headline `TTFD` symptom has disappeared,
- `ttfd` is again aligned with the truth-facing first-detection interpretation,
- `ttfd_arrived` remains available as a distinct impairment-channel timing field,
- and the usefulness-family study remains structurally intact.