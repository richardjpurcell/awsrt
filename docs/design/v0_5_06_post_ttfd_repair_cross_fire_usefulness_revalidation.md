# AWSRT v0.5 Subgoal 06: Post-TTFD-Repair Cross-Fire Usefulness Revalidation

**Status:** Updated design note  
**Applies to:** `v0.5-subgoal-06`  
**Purpose:** Revalidate the bounded cross-fire usefulness-family reading after the Subgoal 05 TTFD truthfulness repair, using the same small transformed real-fire comparison style and checking whether the earlier scientific interpretation remains intact, tightens, or requires limited revision.

---

## 1. Purpose of this note

This note defines AWSRT v0.5 Subgoal 06.

Subgoal 03 established the corrected bounded usefulness-family batch-sweep structure.  
Subgoal 04 extended that structure into a small cross-fire confirmation step.  
Subgoal 05 then repaired the identified `TTFD` truthfulness issue so that the headline timeliness metric is no longer carrying the known `TTFD = 0` defect.

That sequence matters.

The usefulness-family reading has now passed through three different stages:

1. **structural correction** of the batch sweep,
2. **cross-fire confirmation** of the family reading,
3. **headline-metric repair** for `TTFD`.

The next disciplined step is therefore not a new controller idea or a broader campaign. It is to ask:

> After the TTFD repair, does the cross-fire usefulness-family interpretation still hold?

Subgoal 06 is the step that answers that question.

---

## 2. Scientific intent

The scientific intent of this subgoal is to restore interpretive continuity after the TTFD repair.

More specifically, the purpose is to determine whether the bounded cross-fire usefulness-family reading remains scientifically coherent when rerun under the repaired timing semantics.

This means checking whether the following still remain legible across the selected transformed real-fire contexts:

- `healthy` as the cleanest case,
- `delay` as a stale-information case,
- `noise` as a distinct impairment case rather than merely a copy of delay,
- and the continuing separation between **information delivered** and **information operationally useful for belief maintenance**.

This is not a new claim of universality.  
It is a careful post-repair revalidation step.

---

## 3. Subgoal framing

At the current AWSRT stage, this subgoal should be understood as a **post-repair scientific revalidation slice**.

Subgoal 04 provided the earlier cross-fire reading, but it carried a known caveat because `TTFD` had not yet been repaired.  
Subgoal 05 repaired that caveat.  
Subgoal 06 now checks what the repaired metric does to the earlier reading.

This means the subgoal is about:

- **revalidation**, not redesign;
- **scientific continuity**, not feature expansion;
- **post-repair interpretation**, not metric invention;
- **small cross-fire confirmation**, not a broad campaign.

---

## 4. Core question

The core question for this subgoal is:

> When the bounded usefulness-family study is rerun across the selected transformed real-fire contexts after the TTFD repair, does the original cross-fire usefulness-family interpretation remain valid?

This question has two parts.

### 4.1 Metric truthfulness part

First, verify that the repaired timing fields now behave coherently:

- `ttfd`
- `ttfd_true`
- `ttfd_arrived`

In particular, the repaired outputs should no longer contain the previously identified incorrect zero-valued headline timing behavior.

### 4.2 Scientific interpretation part

Second, verify whether the repaired timing values materially alter the usefulness-family reading.

The goal is not only to show that the bug is gone.  
The goal is to determine whether the scientific story that depended partly on timing still stands.

---

## 5. Expected study shape

The intended experimental shape remains deliberately narrow and should follow the established bounded usefulness-family pattern.

For each selected transformed real-fire context:

- use one bounded execution window,
- use one participating policy: `usefulness_proto`,
- use the canonical usefulness-family sweep:
  - `healthy`
  - `delay`
  - `noise`
- use the same small seed set,
- and preserve the corrected batch semantics and preset-origin semantics from Subgoal 03.

As before, each fire should produce one compact `ana-*` artifact.

The immediate goal is not to pool everything into one first-pass mega-study.  
It is to inspect whether each fire still supports the same post-repair family reading.

---

## 6. What the post-repair reruns now indicate

The post-repair reruns support a more truthful cross-fire reading than the earlier pre-repair state.

Most importantly:

- the prior **incorrect `TTFD = 0` behavior does not recur** in the rerun studies,
- repaired runs now show either:
  - finite positive `ttfd` values, or
  - missing / non-finite `ttfd` where no valid first detection is available,
- which is scientifically preferable to a false zero-valued headline timing result.

This matters because the post-repair outputs now distinguish between:

- **late first detection**, and
- **no valid first detection available under the metric semantics**,

rather than collapsing both situations into an impossible or misleading zero.

The current revalidation evidence therefore suggests that the Subgoal 05 repair improved **metric truthfulness**, not merely software cleanliness.

---

## 7. What appears to remain true after repair

At the current reading, the repaired reruns support the following cautious cross-fire interpretation.

### 7.1 The bounded usefulness-family structure remains intact

The study semantics and sweep structure remain correct:

- `study_family = usefulness_family_compare`
- `comparison_axis = usefulness_family`
- `comparison_tier = main`
- `preset_origin = analysis_batch_usefulness_triad`

and the intended three cases remain present:

- `healthy`
- `delay`
- `noise`

There is no sign of the old extra-base-case regression reappearing.

### 7.2 The TTFD repair appears successful

Across the post-repair reruns:

- no study shows the earlier incorrect `TTFD = 0` artifact,
- finite `ttfd` values appear where detections are available,
- and one rerun now shows meaningful `ttfd` missingness rather than a false zero.

That is the right direction scientifically.

### 7.3 The usefulness-family reading remains legible

The repaired runs still support a bounded family reading in which:

- `healthy` remains the clean reference condition,
- `delay` remains a stale-information-facing case,
- `noise` remains a distinct impairment case rather than merely delay repeated under another name.

The exact expression varies by fire, but the family remains scientifically inspectable.

### 7.4 Noise remains the hardest timing case

In the repaired reruns, the noise-side case is no longer associated with impossible zero timing. Instead it tends to show one of the following:

- much later finite first-detection timing than healthy/delay, or
- partial missingness in `ttfd`, indicating that valid first detection was not always available under the canonical metric semantics.

This is much more compatible with the intended interpretation of corruption/noise as a difficult usefulness condition.

---

## 8. Important qualification about TTFD missingness

One of the post-repair studies shows nontrivial `ttfd` missingness rather than incorrect zero-valued timing.

At present, the most plausible working interpretation is that this missingness may be influenced by:

- **deterministic tie breaking**, and
- **the travel direction / geometry of the fire relative to the deployment and sensing pattern**.

That is, the repaired metric may now be truthfully exposing a structural edge case in the experiment setup rather than a bug in the metric itself.

This should be treated carefully.

The current evidence does **not** suggest that the old zero-valued bug has returned.  
Instead, it suggests that under some bounded transformed real-fire setups, the combination of deterministic movement resolution and fire evolution may prevent a valid first detection from occurring within the metric’s canonical semantics.

That is a scientifically meaningful distinction.

For the purposes of Subgoal 06, this should be recorded as:

- **truthful post-repair missingness**, not
- **a recurrence of false zero-valued timing**.

---

## 9. What must remain true

For Subgoal 06 to count as successful, the following conditions should remain true.

### 9.1 Sweep integrity remains correct

Each rerun must still contain exactly the intended three named usefulness-family cases:

- `healthy`
- `delay`
- `noise`

There should be no hidden extra base case, no sweep expansion, and no regression in family labeling.

### 9.2 Usefulness-family semantics remain truthful

The study metadata should still reflect the intended usefulness-family reading, including:

- `study_family = usefulness_family_compare`
- `comparison_axis = usefulness_family`
- `comparison_tier = main`
- `preset_origin = analysis_batch_usefulness_triad`
- usefulness-family case labels present as the actual three named cases

### 9.3 Repaired timing values remain coherent

At minimum:

- the prior incorrect `TTFD = 0` issue should not recur,
- `ttfd`, `ttfd_true`, and `ttfd_arrived` should appear mutually interpretable,
- delay-side runs should show timing behavior consistent with delivery lag,
- noise-side runs should no longer show impossible zero-style timing artifacts,
- and missing `ttfd` should be interpreted as unavailable valid first detection rather than silently collapsed numeric output.

### 9.4 The main usefulness-family reading remains inspectable

The repaired results should still permit readable scientific inspection of whether:

- healthy remains the least impaired case,
- delay remains recover-dominated or otherwise stale-information facing,
- noise remains distinct from delay,
- and the usefulness-family story still supports the information-delivered versus usefulness distinction.

---

## 10. What this subgoal is not

To keep scope disciplined, Subgoal 06 is **not** the place to do the following:

- redesign the compact usefulness triad;
- introduce new impairment families;
- add new policies or controller families;
- merge usefulness and regime semantics more broadly;
- launch a large all-fires campaign;
- or convert this into a broad metrics refactor.

This is a revalidation step, not a new exploration track.

---

## 11. Concrete implementation direction

The work should proceed in a small, readable sequence.

### 11.1 Re-run the bounded usefulness-family study on the selected fires

Use the repaired Subgoal 05 code path and rerun the same bounded usefulness-family comparison across the selected transformed real-fire contexts.

The study design should remain as stable as possible so that the main change under inspection is the repaired timing metric behavior.

### 11.2 Inspect each `ana-*` artifact separately first

For each fire-specific study, verify:

- row count matches `3 cases × seeds × 1 policy`,
- sweep contains only `healthy`, `delay`, `noise`,
- usefulness-family semantics remain truthful,
- repaired timing fields are present and readable,
- and no zero-valued `TTFD` truthfulness issue reappears.

### 11.3 Compare post-repair interpretation against the earlier reading

The main comparison is not only numeric.  
It is interpretive.

Questions to ask include:

- Does healthy still look like the clean reference case?
- Does delay still present a stale-information signature?
- Does noise still differ from delay in a scientifically meaningful way?
- Are the usefulness-state occupancies still legible?
- Does the delivered-information versus usefulness separation remain discussable?
- Did the repaired `TTFD` materially strengthen, weaken, or leave unchanged the earlier interpretation?

### 11.4 Record the meaning of missingness explicitly

Where repaired studies show partial `ttfd` missingness, do not treat that as a failed run by default.

Instead, record explicitly whether the missingness appears to reflect:

- truthful non-detection / unavailable first-detection timing,
- deterministic tie-breaking behavior,
- fire-direction geometry,
- or some still-unresolved interaction.

The important thing is to preserve semantic honesty rather than force every run into a finite timing summary.

### 11.5 Write down what changed and what did not

The end product should not merely say “the bug is fixed.”

It should explicitly record one of the following outcomes:

1. **The earlier Subgoal 04 reading survives essentially unchanged.**
2. **The earlier reading survives, but with modest timing-side adjustment.**
3. **The repaired timing values materially alter part of the earlier interpretation.**

At present, the most likely reading is the second:

- the earlier cross-fire usefulness-family interpretation appears to survive,
- but it should now be phrased with a more truthful timing-side caveat:
  noise may produce **late** or **missing** first-detection timing rather than impossible zero timing.

This written conclusion is important because it turns the repair into a scientific clarification rather than just a software patch note.

---

## 12. Expected evidence

By the end of this subgoal, the expected evidence should consist of:

- a small set of post-repair bounded cross-fire usefulness-family studies,
- verification that the corrected timing behavior is stable,
- confirmation that the usefulness-family semantics remain truthful,
- and a concise interpretive statement about whether the earlier Subgoal 04 reading survives the TTFD repair.

The strongest outcome would be:

1. repaired timing behavior is clean,
2. the usefulness-family sweep remains structurally correct,
3. the cross-fire usefulness-family reading remains legible,
4. and the earlier scientific interpretation stands with little or no revision.

A weaker but still acceptable outcome would be:

- the family structure remains sound,
- but the timing-side interpretation needs modest revision.

That would still be a scientifically useful and honest result.

---

## 13. Minimal success criteria

Subgoal 06 should be considered complete if all of the following are true:

1. The bounded usefulness-family study is rerun on the selected transformed real-fire contexts using the repaired TTFD logic.
2. Each resulting study artifact preserves the intended three-case usefulness-family structure.
3. The prior incorrect `TTFD = 0` issue does not recur.
4. `ttfd`, `ttfd_true`, and `ttfd_arrived` are readable enough to support post-repair interpretation.
5. Where `ttfd` is missing, that missingness is treated and documented truthfully rather than silently normalized away.
6. A short synthesis can be written stating whether the earlier Subgoal 04 cross-fire reading remains intact, tightens, or needs limited revision.

---

## 14. Follow-on investigation now on the radar

A useful follow-on investigation is now visible, but it should remain outside the main scope of this subgoal.

### 14.1 Stochastic tie-breaking follow-up

Because current `ttfd` missingness may plausibly be influenced by deterministic tie breaking, a later targeted check should investigate whether the same bounded usefulness-family studies behave differently under:

- **stochastic tie breaking** rather than deterministic tie breaking.

This would help separate:

- genuine fire/context difficulty,
- from deterministic path-locking effects in the deployment behavior.

### 14.2 Batch-study support for multiple fire origins within one study

A second follow-on is now worth keeping on the platform/design radar:

- extending the Analysis Batch Designer so that one study can include **multiple randomized fire origins** using the case system.

That would make it easier to test whether timing-side missingness is driven by:

- one particular origin geometry,
- one particular fire travel direction,
- or something more stable across origin variation.

This follow-on should be treated as a later experimental/platform extension, not a requirement for Subgoal 06 completion.

---

## 15. Exit condition and likely next step

If Subgoal 06 succeeds, AWSRT will have moved from:

- **a corrected cross-fire usefulness-family reading with a repaired timing metric**

to:

- **a post-repair revalidated cross-fire usefulness-family reading**

That is a stronger thesis-facing position because it means the usefulness-family interpretation has now survived:

- batch-structure repair,
- cross-fire confirmation,
- and headline timing repair.

At that point, the likely next step would be a small synthesis note or thesis-facing summary layer that states:

- what remained stable across fires,
- what varied across fires,
- what the repaired timing metric changed,
- how missing timing values should now be interpreted,
- and how strongly the usefulness-family reading now stands as a scientific probe.

That next step should still remain careful and should avoid overstating generality.

---

## 16. Working note

This subgoal should be carried out in the same disciplined style as the previous ones:

- small bounded reruns,
- explicit verification of sweep integrity and semantics,
- careful inspection of repaired timing fields,
- truthful treatment of missingness,
- and cautious interpretation.

The main result sought here is not broader software capability.  
It is restored scientific continuity: confidence that the bounded cross-fire usefulness-family reading still means what AWSRT says it means after the TTFD repair.

A secondary lesson now emerging is also worth preserving:

- once the false-zero timing defect is removed,
- the system becomes better able to expose real experimental edge cases,
- including cases that may depend on deterministic tie breaking and fire-travel geometry.

That is not a setback.  
It is part of making the probe more scientifically honest.