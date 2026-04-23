# AWSRT v0.5 Subgoal 06: Post-TTFD-Repair Cross-Fire Usefulness Revalidation

**Status:** Draft design note  
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

## 6. What must remain true

For Subgoal 06 to count as successful, the following conditions should remain true.

### 6.1 Sweep integrity remains correct

Each rerun must still contain exactly the intended three named usefulness-family cases:

- `healthy`
- `delay`
- `noise`

There should be no hidden extra base case, no sweep expansion, and no regression in family labeling.

### 6.2 Usefulness-family semantics remain truthful

The study metadata should still reflect the intended usefulness-family reading, including:

- `study_family = usefulness_family_compare`
- `comparison_axis = usefulness_family`
- `comparison_tier = main`
- `preset_origin = analysis_batch_usefulness_triad`
- usefulness-family case labels present as the actual three named cases

### 6.3 Repaired timing values remain coherent

At minimum:

- the prior incorrect `TTFD = 0` issue should not recur,
- `ttfd`, `ttfd_true`, and `ttfd_arrived` should appear mutually interpretable,
- delay-side runs should show timing behavior consistent with delivery lag,
- and noise-side runs should no longer show impossible zero-style timing artifacts.

### 6.4 The main usefulness-family reading remains inspectable

The repaired results should still permit readable scientific inspection of whether:

- healthy remains the least impaired case,
- delay remains recover-dominated or otherwise stale-information facing,
- noise remains distinct from delay,
- and the usefulness-family story still supports the information-delivered versus usefulness distinction.

---

## 7. What this subgoal is not

To keep scope disciplined, Subgoal 06 is **not** the place to do the following:

- redesign the compact usefulness triad;
- introduce new impairment families;
- add new policies or controller families;
- merge usefulness and regime semantics more broadly;
- launch a large all-fires campaign;
- or convert this into a broad metrics refactor.

This is a revalidation step, not a new exploration track.

---

## 8. Concrete implementation direction

The work should proceed in a small, readable sequence.

### 8.1 Re-run the bounded usefulness-family study on the selected fires

Use the repaired Subgoal 05 code path and rerun the same bounded usefulness-family comparison across the selected transformed real-fire contexts.

The study design should remain as stable as possible so that the main change under inspection is the repaired timing metric behavior.

### 8.2 Inspect each `ana-*` artifact separately first

For each fire-specific study, verify:

- row count matches `3 cases × seeds × 1 policy`,
- sweep contains only `healthy`, `delay`, `noise`,
- usefulness-family semantics remain truthful,
- repaired timing fields are present and readable,
- and no zero-valued `TTFD` truthfulness issue reappears.

### 8.3 Compare post-repair interpretation against the earlier reading

The main comparison is not only numeric.  
It is interpretive.

Questions to ask include:

- Does healthy still look like the clean reference case?
- Does delay still present a stale-information signature?
- Does noise still differ from delay in a scientifically meaningful way?
- Are the usefulness-state occupancies still legible?
- Does the delivered-information versus usefulness separation remain discussable?
- Did the repaired `TTFD` materially strengthen, weaken, or leave unchanged the earlier interpretation?

### 8.4 Write down what changed and what did not

The end product should not merely say “the bug is fixed.”

It should explicitly record one of the following outcomes:

1. **The earlier Subgoal 04 reading survives essentially unchanged.**
2. **The earlier reading survives, but with modest timing-side adjustment.**
3. **The repaired timing values materially alter part of the earlier interpretation.**

This written conclusion is important because it turns the repair into a scientific clarification rather than just a software patch note.

---

## 9. Expected evidence

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

## 10. Minimal success criteria

Subgoal 06 should be considered complete if all of the following are true:

1. The bounded usefulness-family study is rerun on the selected transformed real-fire contexts using the repaired TTFD logic.
2. Each resulting study artifact preserves the intended three-case usefulness-family structure.
3. The prior incorrect `TTFD = 0` issue does not recur.
4. `ttfd`, `ttfd_true`, and `ttfd_arrived` are readable enough to support post-repair interpretation.
5. A short synthesis can be written stating whether the earlier Subgoal 04 cross-fire reading remains intact, tightens, or needs limited revision.

---

## 11. Exit condition and likely next step

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
- and how strongly the usefulness-family reading now stands as a scientific probe.

That next step should still remain careful and should avoid overstating generality.

---

## 12. Working note

This subgoal should be carried out in the same disciplined style as the previous ones:

- small bounded reruns,
- explicit verification of sweep integrity and semantics,
- careful inspection of repaired timing fields,
- and cautious interpretation.

The main result sought here is not broader software capability.  
It is restored scientific continuity: confidence that the bounded cross-fire usefulness-family reading still means what AWSRT says it means after the TTFD repair.