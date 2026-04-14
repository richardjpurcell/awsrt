# AWSRT v0.3 Subgoal 02: Corruption-Facing Active Signal Follow-On

**Status:** Draft design note with first implementation-pass findings  
**Applies to:** `v0.3-subgoal-02`  
**Purpose:** Define the next bounded controller-facing step after the partial but useful checkpoint established in Subgoal 01, with specific emphasis on whether the active regime surface needs a more explicit corruption-facing signal rather than further threshold-only tuning.

---

## 1. Purpose of this note

This note defines the next disciplined step after AWSRT v0.3 Subgoal 01.

Subgoal 01 began from the idea that the first post-v0.2 controller-development step should strengthen the linkage between diagnosed degraded-information conditions and realized active-control transitions. The first preferred seam was a recovery-versus-caution distinction, pursued initially through a small recovery-side refinement and then through bounded semantic-probe validation.

That was the right place to begin. It was small, scientifically meaningful, and consistent with the interpretive boundary inherited from v0.2.

However, Subgoal 01 now leaves the project with a more specific next question than it began with. The issue is no longer simply whether one more small threshold shift inside the current active surface will solve the remaining ambiguity. The issue is now whether the active surface itself needs a more explicit corruption-facing signal if it is to express corruption-side caution honestly.

This note therefore defines Subgoal 02 as a bounded follow-on rather than a broad redesign.

---

## 2. Starting point inherited from Subgoal 01

Subgoal 01 established several things that should now be treated as known.

### 2.1 What Subgoal 01 achieved

Subgoal 01 achieved a real but partial result:

- a small recovery-side refinement was implemented,
- that refinement appeared safe and worth retaining,
- a semantic-probe workflow was established for active-regime validation,
- and bounded threshold/signal experiments improved understanding of what the current active surface can and cannot express.

This is meaningful progress. The subgoal reduced ambiguity about the active surface rather than merely moving it around.

### 2.2 What Subgoal 01 did not achieve

Subgoal 01 did **not** achieve a strong corruption-side caution reading inside the current active semantic probe.

In particular, bounded experiments suggested that:

- healthy and stale/delay cases can be separated somewhat through active-surface adjustment,
- but corruption-sensitive cases can still remain too nominal under the current surface,
- and repeated local-drift- and threshold-based probe adjustments did not materially resolve that.

This is not a failure of the project. It is a useful narrowing result.

### 2.3 Why this matters

This means the next design question should not be phrased loosely as:

> should we keep tuning thresholds?

Instead, it should now be phrased more sharply:

> does the current active regime surface need an explicitly corruption-facing signal if it is to express corruption-side caution in a scientifically legible way?

That is the core reason for Subgoal 02.

---

## 2A. First implementation-pass findings

The first bounded Subgoal 02 implementation pass has now been attempted.

That pass:

- added one explicit corruption-facing component to the active downshift and switch-to-certified trigger surface,
- based on elevated recent misleading activity together with active arrivals and weak recent information-driver magnitude,
- while leaving the state-machine structure unchanged and leaving recovery semantics unchanged.

This was the right first implementation shape for Subgoal 02. It was small, controller-visible, and did not broaden the ontology or reopen the controller-boundary question.

However, the resulting validation outcome is now clear:

- the corruption-facing component can be inserted cleanly into the active trigger surface,
- but in its current auxiliary role it did not materially change the corruption/noise case,
- and the noise-side active reading remained trivially nominal despite clearly elevated corruption-adjacent diagnostics.

This means Subgoal 02 has already produced a useful narrowing result: the next question is no longer whether a corruption-facing component can be added, but whether it must participate more strongly than as a mere auxiliary component inside the present combiner semantics.

---

## 3. Why Subgoal 02 is the right next step

### 3.1 Threshold-only tuning has reached a natural stopping point

Subgoal 01 already did the bounded and disciplined thing:

- it tried a recovery refinement,
- it tried semantic-probe threshold adjustments,
- it tried local-drift participation in a bounded way,
- and it checked whether those changes materially improved corruption-side active behavior.

Once repeated bounded attempts stop changing the interpretation meaningfully, the disciplined next step is not endless local tuning. It is to ask whether the signal family itself is insufficient for the question being asked.

### 3.2 The remaining ambiguity is scientifically specific

The unresolved issue is not “the controller is bad” in some broad sense.

After the first Subgoal 02 implementation pass, this point can now be stated more precisely:

- the current active trigger surface can tolerate a bounded corruption-facing component structurally,
- but the present combiner semantics still do not let that component meaningfully alter the corruption-side realized behavior,
- at least not in the first auxiliary-form implementation.

That is a more useful and more disciplined diagnosis than “the thresholds still need work.”

The unresolved issue is narrower:

- the current active trigger surface seems to express healthy-side and stale-side distinctions better than corruption-side caution,
- even when corruption-adjacent diagnostics such as misleading activity are clearly elevated.

That is a scientifically useful problem statement.

### 3.3 This remains within the v0.3 intent

Subgoal 02 still fits the intended role of v0.3:

- it remains control-facing,
- it remains failure-mode-aware,
- it remains diagnostically motivated,
- and it still prioritizes scientific interpretability over outward platform expansion.

So this note continues the right thread from both v0.1 and v0.2 rather than wandering away from it.

---

## 4. Main development question

The central question for Subgoal 02 is:

> if the current active regime surface under-expresses corruption-side caution, what is the smallest honest way to test whether a more explicit corruption-facing signal improves active behavior interpretation?

More concretely:

> should the active regime surface remain based only on the current support/degradation-style signal family, with more threshold tuning, or should a bounded corruption-facing signal be introduced or tested explicitly?

This is the main question the subgoal should answer.

---

## 5. Scope

Subgoal 02 should stay narrow.

It should focus on one compact class of work:

- introducing, testing, or auditing one corruption-facing active signal path.

That does **not** mean adding a large new controller family or a large new state machine. It means testing whether the present active machine becomes more scientifically readable when one corruption-facing signal is allowed to participate in active trigger construction more explicitly.

Subgoal 02 should therefore remain:

- bounded,
- mechanism-facing,
- and explicitly comparative.

---

## 6. What Subgoal 02 is and is not

### 6.1 What Subgoal 02 is

Subgoal 02 is a bounded corruption-facing active-signal follow-on.

It is about:

- diagnosing why corruption-side caution is under-expressed,
- testing one small corruption-facing signal design,
- and determining whether that addition materially improves the interpretability of active behavior.

### 6.2 What Subgoal 02 is not

Subgoal 02 is not:

- a broad controller rewrite,
- a new unified controller architecture,
- a major frontend redesign,
- a full adaptive-control campaign,
- a broad realism expansion,
- or a license to proliferate many new diagnostics without discipline.

It is also not yet a claim that the project needs a final corruption-aware controller ontology. It is only a bounded follow-on to test one explicit idea.

---

## 7. Working diagnosis entering Subgoal 02

At the start of Subgoal 02, the current working diagnosis is:

### 7.1 The present active surface is support-heavy

The present active trigger surface appears to rely mostly on support/degradation-style quantities such as:

- utilization,
- strict drift proxy,
- and related support-facing logic.

That can produce meaningful behavior on healthy- and stale-side distinctions, but it appears to leave corruption-side caution under-expressed.

### 7.2 Corruption-adjacent diagnostics already exist

AWSRT already exposes corruption-adjacent or corruption-relevant quantities, including:

- misleading activity,
- related usefulness-gap behavior,
- and other wedges between activity and true utility.

That means the project does not need to invent corruption as a concept from scratch. The main issue is whether and how one such concept should be admitted into the active trigger surface.

### 7.3 The gap is now about active use, not only measurement

The issue is not merely that corruption-side diagnostics exist in summaries.

The issue is that the active machine is not yet clearly using a corruption-facing signal strongly enough for that difference to be readable in realized active behavior.

That is what Subgoal 02 should test.

---

## 8. Recommended development stance

Subgoal 02 should follow these principles.

### 8.1 Prefer one explicit corruption-facing test over many vague ones

It is better to test one bounded corruption-facing signal clearly than to add several loosely motivated knobs at once.

### 8.2 Preserve the current machine shape if possible

The first attempt should preserve:

- the current state-machine structure,
- the current broad active/advisory distinction,
- and the v0.2 boundary discipline.

The goal is to test the signal surface, not to redesign the machine.

### 8.3 Keep the comparison honest

The subgoal should be framed as:

- current active surface,
- versus current active surface plus one corruption-facing signal path,
- under a small study family.

That makes the result interpretable whether the new signal helps or not.

### 8.4 Avoid hidden ontology growth

A corruption-facing signal should not be introduced under vague language that quietly turns the controller into something much larger. If the active surface is being broadened conceptually, that should be stated plainly and kept small.

### 8.5 Record negative bounded results early

If a bounded corruption-facing implementation pass fails to materially change the corruption-side active reading, that should be treated as a useful result rather than as a reason for indefinite small tuning loops.

That is now the case here.

The project should therefore preserve the finding that:

- auxiliary corruption-signal participation is structurally feasible,
- but auxiliary participation alone appears insufficient to alter the present active reading under the compact semantic probe.

---

## 9. Candidate directions for the corruption-facing follow-on

Several bounded directions are possible.

### 9.1 Misleading-activity-based trigger component

One candidate is to add a corruption-facing trigger component derived from misleading activity or a closely related summary.

This is attractive because it is conceptually close to the corruption-side wedge already observed in earlier work.

### 9.2 Corruption-side ratio or gap component

Another option is to derive a signal from the gap between delivered activity and useful activity, if such a quantity can be made controller-visible without cheating.

This is scientifically attractive, but it must be handled carefully so the active surface does not accidentally consume privileged information.

### 9.3 Audit-only first, active-use second

A more conservative path would be:

- first emit one corruption-facing signal into active audit summaries,
- then, only if it appears meaningful and stable, allow it to participate in active trigger logic.

This is the safest route if controller-visibility semantics are still uncertain.

### 9.4 Stronger-than-auxiliary corruption participation

The first Subgoal 02 implementation pass now motivates one additional bounded direction:

- allow corruption-facing evidence to participate more strongly than as a mere auxiliary trigger component.

This does **not** necessarily mean giving corruption evidence unconditional veto power or creating a new state. It means considering whether corruption-facing evidence should be allowed to:

- participate as a co-primary condition for downshift in specific active presets,
- short-circuit otherwise permissive nominal behavior in clearly corruption-heavy conditions,
- or be introduced into a dedicated corruption-sensitive semantic probe rather than folded into the current auxiliary slot.

This direction is now justified by the negative result of the first auxiliary-form implementation pass.

---

## 10. Preferred first target

The preferred first target is:

> test one bounded corruption-facing trigger component, ideally derived from a controller-visible corruption-adjacent quantity, while keeping the current active state machine unchanged.

The most disciplined version of this would likely be:

- introduce one corruption-facing component into the active downshift and/or switch-to-certified trigger surface,
- leave recovery semantics unchanged,
- and compare against the current semantic-probe baseline.

This is the best next target because:

- it follows directly from Subgoal 01’s negative result,
- it is still compact,
- it preserves the current machine structure,
- and it should produce an interpretable experimental question.

### 10.1 First implementation-pass outcome

The first implementation pass followed this recommendation correctly:

- one corruption-facing component was added,
- it was based on controller-visible recent misleadingness plus active-arrivals / weak-information conditions,
- and it was admitted only into the active downshift and switch-to-certified surfaces.

That implementation should be regarded as a valid first pass and not reverted simply because it did not yet materially change the corruption-side reading.

### 10.2 Revised preferred next target

After the first pass, the preferred next target is now slightly sharper:

> determine whether corruption-facing evidence must be allowed to participate more strongly than as an auxiliary component inside the current active combiner semantics.

For the next bounded step, this should still be interpreted narrowly:

- keep the active state-machine shape unchanged,
- keep recovery semantics unchanged,
- do not broaden the public controller surface,
- and test only one stronger corruption-participation role at a time.

This is now the cleanest continuation because the first auxiliary-form corruption component has already been tried and has already produced a useful negative result.

---

## 11. Preferred implementation stance

The preferred implementation order is:

### Step 1

Identify the strongest candidate corruption-facing signal that is still controller-visible and scientifically defensible.

### Step 2

Add it first in the smallest possible role:
- ideally as one additional trigger component,
- not as a new state or a broad controller rewrite.

### Step 3

Run a compact semantic-probe comparison:
- healthy,
- stale/delay,
- corruption/noise,
- and optionally one mixed case.

### Step 4

Interpret the result honestly:
- did corruption-side caution become more visible,
- did healthy behavior remain reasonable,
- and did stale-versus-corruption become easier to read?

The first implementation pass now has an honest answer:

- corruption-side caution did **not** become materially more visible,
- healthy and delay-side readings remained broadly similar to the prior compact probe,
- and stale-versus-corruption did **not** become easier to read from realized active behavior.

That means the next implementation stance should not be “keep nudging the same auxiliary thresholds indefinitely.”

It should be:

- preserve the result,
- record the failure mode,
- and test one stronger corruption-participation role next.

---

## 12. Experiment design for Subgoal 02

Subgoal 02 should again use a compact study family.

### 12.1 Recommended study shape

The study should likely include:

- one healthy reference,
- one stale/delay case,
- one corruption/noise case,
- and optionally one mixed case if the corruption-facing signal appears promising.

This first study shape has now been executed in bounded form and yielded a clear result:

- the compact semantic-probe trio remains adequate for answering the current design question,
- because it already shows that the first corruption-facing auxiliary implementation did not alter the corruption-side realized machine.

### 12.2 Recommended comparison logic

The main comparison should be:

- active semantic probe without explicit corruption-facing signal,
- versus active semantic probe with one corruption-facing signal.

That comparison has now been performed once and should remain part of the note as a completed checkpoint rather than as an unresolved intention.

### 12.3 Recommended evaluation emphasis

Evaluation should prioritize:

- realized active state occupancy,
- transition counts,
- whether corruption-side cases stop appearing trivially nominal,
- whether healthy cases remain reasonable,
- and whether stale versus corruption becomes more interpretable.

Headline belief metrics still matter, but they should not dominate the reading.

After the first implementation pass, the evaluation emphasis can now be sharpened:

- the key decision variable is not whether any corruption-facing scalar was computed,
- but whether the realized active occupancy and transition structure changed meaningfully in the corruption/noise case.

In the first pass, they did not.

That means future bounded comparisons should explicitly prioritize:

- realized corruption-side non-nominal behavior,
- over merely documenting the existence of corruption-adjacent diagnostics.

---

## 13. Relation to real-fire deployment-simulation work

Subgoal 02 should still stay ahead of the real-fire bridge in the priority order.

The reason is simple:

- the present question is still about what the controller is actually sensitive to,
- not yet whether the real-fire datasets can be run through the deployment surface efficiently.

That means the bounded real-fire execution-window work remains important, but still secondary to this controller-facing clarification unless it becomes operationally urgent for your workflow.

---

## 14. Likely implementation touchpoints

The most likely files are:

- `backend/api/routers/operational.py`
- possibly `backend/awsrt_core/schemas/operational.py` if one small trigger-signal field needs to be surfaced explicitly
- `frontend/app/operational/designer/page.tsx` if one semantic-probe preset or control flag needs to be added
- the design notes and compact validation artifacts

The expected emphasis should remain:

### First pass

- backend trigger composition
- compact experimental comparison
- note-level interpretation

### Only if justified

- one small schema addition
- one small UI exposure of the new signal or preset

Large refactor remains out of scope.

### 14.1 First implementation-pass conclusion

The first implementation pass confirms that the existing touchpoints were the right ones:

- `backend/api/routers/operational.py` was sufficient for the first corruption-facing insertion,
- no schema change was required,
- and no frontend exposure was required for the first bounded probe.

That should remain the default posture for the next bounded step as well.

The next step should still try to stay inside:

- `backend/api/routers/operational.py`
- plus design-note updates

unless a stronger corruption-participation role clearly requires a tiny preset distinction in the frontend.

---

## 15. Suggested success criteria

Subgoal 02 should be considered successful if:

- one bounded corruption-facing signal path is tested,
- the active machine becomes more interpretable on corruption-side cases,
- healthy behavior does not collapse,
- stale and corruption cases become easier to distinguish,
- and the result remains explainable without broad controller redesign.

A strong success outcome would be:

- corruption-sensitive cases no longer remain trivially nominal when corruption-adjacent diagnostics are clearly elevated,
- while the rest of the active surface remains readable.

### 15.1 Current status against success criteria

After the first implementation pass, these criteria are only partially met.

What has been achieved:

- one bounded corruption-facing signal path was tested,
- the implementation remained compact and controller-visible,
- healthy and stale-side behavior did not collapse,
- and the result is interpretable.

What has **not** yet been achieved:

- corruption-sensitive cases still remain trivially nominal in the compact semantic probe,
- despite clearly elevated corruption-adjacent diagnostics.

So Subgoal 02 should currently be interpreted as having reached a valid intermediate checkpoint rather than a completed success.

That is still a useful outcome because it clarifies that:

- signal insertion alone is not the same thing as meaningful trigger participation.

---

## 16. Warning signs

Subgoal 02 should be treated as drifting if:

- it turns into a broad rewrite of the active machine,
- it adds multiple new corruption-facing signals at once,
- it quietly consumes privileged information that the controller should not use,
- it reopens the whole controller-boundary question,
- or it becomes another long threshold-tuning cycle without a clear new signal concept.

A specific warning sign would be:

- adding a corruption-facing signal that improves the noise case only by making healthy and stale behavior obviously worse or less interpretable.

The goal is not to force caution everywhere. The goal is to improve the honesty and specificity of the active reading.

An additional warning sign, now supported by the first implementation pass, is:

- continuing to treat the corruption-facing signal as successful merely because it has been inserted into the trigger dictionaries, even when the realized active machine remains unchanged.

Another warning sign would be:

- continuing threshold-only nudges on the same auxiliary component after repeated bounded runs show no material corruption-side effect.

At that point, the disciplined move is to elevate the design question:

- should corruption-facing evidence play a stronger role than auxiliary participation?

That is now the correct next warning-boundary for Subgoal 02.

---

## 17. Relationship to likely next steps

A plausible sequence after this note is:

### 17.1 Subgoal 02 implementation pass

Introduce and test one bounded corruption-facing active signal.

This step has now been completed in a first bounded form.

### 17.2 Compact validation checkpoint

Freeze the result of that bounded comparison and decide whether the new signal is worth retaining.

The current answer is:

- retain the note-level result,
- retain the implementation history conceptually,
- but do not yet overclaim that the current corruption-facing signal materially improved the active reading.

### 17.2A Possible immediate continuation within Subgoal 02

If the project chooses to continue Subgoal 02 before freezing it, the next bounded step should likely test one stronger corruption-participation role rather than another small auxiliary threshold nudge.

### 17.3 Real-fire execution-window bridge

Only after the controller-facing question is a bit clearer should the project shift the main focus toward bounded real-fire deployment-simulation support, unless workflow pressure makes that bridge more urgent sooner.

---

## 18. Short summary

Subgoal 02 is the next bounded controller-facing step after the partial checkpoint established in Subgoal 01. Subgoal 01 showed that a small recovery-side refinement is worth keeping, but also showed that the present active regime surface still under-expresses corruption-side caution even after bounded probe tuning. The first Subgoal 02 implementation pass has now shown that one explicitly corruption-facing signal can be inserted cleanly into the active trigger surface, but that auxiliary participation alone does not materially change the corruption/noise active reading. The next disciplined question is therefore slightly sharper: not merely whether corruption-facing evidence can be added, but whether it must be allowed to participate more strongly than as an auxiliary component if the active machine is to express corruption-side caution honestly.
