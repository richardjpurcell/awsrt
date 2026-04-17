# AWSRT v0.4 Subgoal 01: Active Downshift on Bounded Real-Fire Windows

**Status:** Draft design note  
**Applies to:** `v0.4-subgoal-01`  
**Purpose:** Define and carry through the first controller-facing subgoal after the frozen AWSRT v0.3 closeout by re-addressing weak or absent realized active downshift behavior now that bounded transformed real-fire windows are experimentally usable and scientifically readable.

---

## 1. Purpose of this note

This note defines the first disciplined subgoal of AWSRT v0.4.

AWSRT v0.3 should now be read as having done two useful things. First, it pushed the early controller-facing line far enough to show that bounded corruption-side patching within the current active family was not producing the hoped-for non-nominal active reading. Second, it established that bounded transformed real-fire slices are already usable enough for meaningful operational and scientific interpretation.

That combination changes the next question.

The immediate problem is no longer whether the active family can be preserved through another small corruption-sensitive adjustment. The immediate problem is whether the active regime layer can be made to exhibit visible, interpretable realized downshift behavior on bounded real-fire windows without sacrificing semantic discipline.

This subgoal therefore asks for the smallest change that is still meaningfully capable of producing readable active downshift on bounded real-fire windows.

The stance for v0.4 is intentionally broader than the most cautious late-stage v0.3 posture. We still want bounded, legible, scientifically honest changes. But we do not want to remain trapped in endless tiny threshold nudges if the cleaner move is a somewhat larger but still controlled recalibration of the active seam.

This note now also records the outcome of the first Subgoal 01 pass. That first pass was informative but only partially sufficient. It produced a useful success in the opportunistic family, a weak non-nominal signal in the balanced family, and little realized active change in the corruption-focused family. The subgoal therefore remains open for one more bounded follow-up pass.

---

## 2. Background and framing

### 2.1 v0.1 scientific story

AWSRT v0.1 established the core scientific story that motivates later controller work:

- time-to-first-detection is necessary but insufficient,
- information delivery and information usefulness can diverge,
- and impairment types do not degrade the system in the same way.

The main value of the platform was not that it already solved adaptive control, but that it exposed a scientifically meaningful wedge between informational activity and belief-improving value.

That wedge is still the right background for interpreting active control work. A controller-facing regime layer should not be read as optimizing abstract activity. It should respond to conditions that affect whether current posture remains operationally justified.

### 2.2 v0.2 interpretive cleanup

AWSRT v0.2 clarified the language and semantics needed to make controller-facing work readable:

- the usefulness layer became more operationally interpretable,
- advisory and active semantics were more clearly separated,
- active mechanism behavior became more inspectable,
- and the platform became more honest about what was actually live versus only exposed on the surface.

That cleanup remains binding in v0.4. The goal is not to blur levels. The usefulness layer and the higher-level regime layer must remain distinct in role, language, and interpretation.

### 2.3 v0.3 bounded real-fire outcome

AWSRT v0.3 extended experimentation onto bounded transformed real-fire windows and showed that such windows are already usable enough for disciplined interpretation. At the same time, v0.3 also showed that bounded corruption-side patching inside the current active family was not enough to recover the hoped-for non-nominal active behavior.

That should be treated as a substantive result, not merely as an inconvenience. It suggests that the current active seam is not failing only because a single corruption threshold is slightly misplaced. It suggests that the active family may still be calibrated too narrowly or too conservatively for the signal shapes that bounded real-fire windows actually produce.

---

## 3. Control-language discipline for this subgoal

The control-language glossary should be read as active guidance here.

For this subgoal:

- **usefulness** remains the lower-level interpretation of how operationally valuable the incoming information stream appears to be;
- **regime** remains the higher-level posture or control stance taken in response to conditions;
- **advisory** remains recommendation-side or interpretation-side output;
- **active** remains realized controller behavior.

This subgoal does **not** promote usefulness into a direct synonym for regime, and it does **not** collapse advisory and active into one layer.

Instead, the intended relationship is:

- usefulness-like evidence may inform active regime decisions,
- but the regime layer still performs the posture decision,
- and the resulting realized behavior must remain distinguishable from advisory recommendation behavior.

This distinction is especially important because the point of the subgoal is to recover readable active downshift without making the semantics opportunistically vague.

---

## 4. Problem statement

The present problem can be stated more precisely as follows:

> On bounded transformed real-fire windows, the realized active regime layer still appears too nominal or too weakly expressive. We need a bounded change that makes active downshift behavior visibly present and interpretable, while preserving semantic clarity and avoiding uncontrolled redesign.

The key issue is not just whether a state transition can be forced to occur. The issue is whether the transition appears for the right reasons and can be honestly explained.

This means Subgoal 01 should be judged less by raw headline improvement and more by whether active downshift becomes:

- visibly realized,
- causally legible,
- semantically defensible,
- and experimentally readable on bounded real-fire windows.

---

## 5. Why the current active layer likely remains too nominal

The most plausible explanations are the following.

### 5.1 The active seam is still calibrated too conservatively for bounded real-fire signal scale

The active family may still require stronger or cleaner evidence than bounded real-fire windows naturally express. Signals on transformed real-fire slices may be softer, more intermittent, or more mixed than the synthetic or semi-synthetic conditions under which regime movement is easier to reveal.

If so, the active layer can remain nominal not because the windows are uninformative, but because the trigger surface is positioned above the natural operating amplitude of the relevant regime signals.

### 5.2 The active family may still be overly corruption-oriented

v0.3 showed that bounded corruption-sensitive patching was not enough. That suggests the current active logic may still be looking too narrowly for corruption-like concern and not broadly enough for degraded operational justification.

A bounded real-fire window may not exhibit sharp corruption signatures while still providing weak, intermittent, or thinning support for continued nominal posture. If the active controller mainly looks for corruption-like evidence, it can remain nominal in cases where a human reader would still expect bounded downshift.

### 5.3 Support or opportunity collapse may be underweighted

The v0.1 wedge story suggests that useful information can deteriorate before informational activity disappears. On bounded real-fire windows, the more relevant signal may be reduced actionable support rather than obviously corrupt content.

If the active regime does not sufficiently recognize persistent weakening in support or opportunity, then it may fail to downshift even when exploit-like or nominal posture has become less well justified.

### 5.4 Persistence and hysteresis may be suppressing visible realization

Even if the right preconditions are partially present, the realized state machine may still be too damped to show readable transitions on bounded windows. A short or moderate real-fire slice may never remain beyond threshold long enough to overcome entry persistence, or may do so only rarely enough that the active line still reads as nominal.

This is especially important because v0.2 already showed that mechanism settings can strongly affect realized transitions without necessarily changing headline belief outcomes.

### 5.5 The regime layer may still be too behaviorally derivative

Even if the semantics are distinct in language, the live active regime behavior may still be too weakly differentiated in practice from lower-level evidence signals. If the regime layer adds too little posture-specific interpretation, then it can remain nominal because it is not asserting a sufficiently distinct active decision boundary.

### 5.6 Family structure may matter as much as trigger structure

The first Subgoal 01 pass added a bounded weak-support active downshift path. That change did help expose non-nominal behavior, but the resulting behavior was not uniform across regime families.

The emerging evidence is that visible active downshift depends not only on whether a trigger exists, but also on whether the active family has enough internal structure for downshift to be behaviorally reachable and visually legible. A family with only a minimal opportunistic ladder, near-perfect utilization, and little behavioral spacing between levels may still read as nominal even when a new trigger has been added correctly.

This means the remaining problem is not purely a trigger-threshold problem. It is at least partly a family-structure problem.

---

## 6. Subgoal decision: bounded recalibration rather than another tiny patch

The first v0.4 step should **not** default to the smallest possible threshold adjustment.

The evidence from v0.3 was already sufficient to justify a somewhat larger but still bounded recalibration of the active seam. The first Subgoal 01 pass confirmed that judgment. A bounded weak-support trigger was scientifically worthwhile and mechanically informative, but by itself it did not restore visible active downshift across all intended families.

The recommended direction remains:

- **not** a redesign of the whole controller family,
- **not** a many-parameter uncontrolled sweep,
- **not** a collapse of usefulness and regime semantics,
- but **yes** to a bounded family-level recalibration of active downshift expression.

The reason is now sharper than before: the present problem appears structural enough that another ultra-local patch is unlikely to be the clearest or most honest move.

A bounded recalibration is the smaller scientifically responsible step if it directly addresses the apparent misalignment between the current active seam and the signal character of bounded real-fire windows.

---

## 7. Proposed v0.4 Subgoal 01 direction

### 7.1 Core recommendation

Subgoal 01 should continue with a bounded recalibrated active downshift path in which realized downshift can be entered not only through strong corruption-like concern, but also through **persistent weakening of operational support or active justification**.

The intended shift remains:

- from a predominantly corruption-sensitive downshift seam,
- toward a more balanced active seam that recognizes both concern and sustained loss of justification for remaining nominal.

This remains a regime decision, not a direct usefulness-state replay.

### 7.2 What changed in the first implementation pass

The first implementation pass introduced a bounded weak-support active downshift seam using support-oriented diagnostic ingredients already present in the active regime machinery. This made the controller more willing to downshift when opportunistic posture was weakly supported, not only when corruption-like concern was elevated.

This first pass was useful and should be retained as a meaningful result. It showed that:

- the active layer can be made more support-sensitive without semantic collapse,
- the resulting behavior can be logged and visualized cleanly,
- and active downshift can become visibly realized in at least one family on bounded real-fire windows.

At the same time, the pass also showed that the new seam is not by itself a complete solution across families.

### 7.3 Current family-level reading after the first pass

The initial bounded real-fire comparisons should currently be read as follows:

- **balanced family:** weak but real non-nominal active behavior now appears, but only lightly;
- **corruption-focused family:** active realized behavior remains mostly nominal;
- **opportunistic family:** active realized behavior becomes visibly present, multi-level, and interpretable.

This is important. The opportunistic family now functions as proof that bounded real-fire windows can support readable active downshift under an appropriate family structure. The remaining issue is therefore no longer whether visible active behavior is possible at all. The remaining issue is how to recover comparably readable behavior in the other intended families without flattening their meanings into one opportunistic template.

### 7.4 What should change conceptually in the follow-up pass

The active layer should become modestly more willing to leave nominal posture when:

- support/opportunity evidence has thinned persistently,
- recent active justification has weakened,
- or concern has risen enough in combination with weak support.

However, the next pass should now also recognize that **family structure must likely change modestly alongside trigger logic**.

The most likely bounded follow-up direction is:

- **balanced family:** add a minimal but real opportunistic ladder structure so active downshift has somewhere meaningful to go before certified behavior becomes relevant;
- **corruption-focused family:** strengthen the corruption-facing active seam separately rather than relying mainly on weak-support sensitivity;
- **opportunistic family:** retain as the current reference family demonstrating that readable active downshift is achievable on bounded real-fire windows.

### 7.5 What should not change

This subgoal should not:

- redesign the full regime-management surface,
- claim optimization of real-fire deployment,
- merge advisory and active semantics,
- flatten all regime families into the same behavior,
- or introduce a wide uncontrolled parameter surface.

The change should remain compact enough that it can be explained, audited, and frozen honestly.

---

## 8. Success criteria

Subgoal 01 should be considered successful if the recalibrated active path produces all of the following on bounded transformed real-fire windows:

1. **Visible realized downshift**  
   The active regime leaves nominal or exploit-like posture on at least some windows where the prior active path remained mostly nominal.

2. **Interpretability**  
   The resulting transitions can be explained in terms of sustained weakening of support, active justification, or mixed concern-plus-support conditions, rather than appearing arbitrary.

3. **Semantic discipline**  
   Advisory outputs and active outputs remain distinguishable, and the regime layer remains readable as a posture layer rather than a renamed usefulness layer.

4. **Boundedness**  
   The controller does not collapse into near-constant downshift across most windows.

5. **Auditability**  
   Diagnostic traces or summaries make it possible to say why the recalibrated active path transitioned when it did.

6. **Family-specific readability**  
   At least the intended main families under test should exhibit behavior that is not only technically non-nominal, but visibly readable in a way consistent with their family meaning.

These criteria are more important here than raw headline metric gains.

---

## 9. Outcome of the first Subgoal 01 pass

The first Subgoal 01 pass should be recorded as a **partial success**.

### 9.1 What succeeded

- A bounded weak-support active downshift seam was added cleanly.
- The new seam was made audit-visible in summary outputs and time-series visualizations.
- The opportunistic family became visibly active and interpretable on bounded real-fire windows.
- The active layer therefore now has a concrete bounded-real-fire case showing multi-level non-nominal realized behavior.

### 9.2 What only partially succeeded

- The balanced family showed only weak realized downshift.
- The active signal is no longer completely absent there, but it remains too light to count as a fully satisfactory Subgoal 01 endpoint.

### 9.3 What did not yet succeed

- The corruption-focused family remained mostly nominal.
- This suggests that weak-support sensitivity alone is not the right main lever for that family.

### 9.4 Main scientific interpretation of the first pass

The key new interpretation is:

> visible active downshift on bounded real-fire windows appears to require not only a trigger path, but also enough family structure for the active regime to express that trigger in a legible way.

This is the most important result of the first pass and should guide the follow-up implementation.

---

## 10. Disciplined implementation plan

### 10.1 Step A: retain the new audit layer

Keep the current weak-support diagnostics and visual outputs. They are now part of the evidence surface for explaining why active downshift does or does not occur.

This includes, at minimum:

- weak-support trigger hits,
- support-score traces,
- support-breadth traces,
- realized active-state fractions,
- and current-frame visualizer inspection.

These diagnostics should not be removed even if thresholds or family structure are adjusted in the follow-up pass.

### 10.2 Step B: retain the bounded weak-support seam

The weak-support active seam added in the first pass should remain part of the controller-facing experiment set. It is scientifically useful and helped expose the family-structure issue.

This should now be treated as a retained component, not as a failed branch.

### 10.3 Step C: add one bounded balanced-family recalibration

The next bounded change for the balanced family should **not** be another micro-threshold nudge alone.

Instead, introduce a minimal but real active ladder expansion for the balanced family, such that:

- the balanced family still reads as balanced rather than opportunistic,
- active downshift has an intermediate behavior to occupy,
- and downshift can remain visible without immediately forcing either reversion to nominal or collapse into certified behavior.

This should be small. The point is not to turn balanced into a copy of opportunistic. The point is to give balanced enough posture structure to express the already-added weak-support seam.

### 10.4 Step D: add one bounded corruption-sensitive recalibration

The corruption-focused family should be adjusted separately.

The evidence so far suggests that its problem is not mainly lack of weak-support sensitivity. Its problem is that the corruption-facing active seam is still too weak relative to the support-side health that remains present on bounded real-fire windows.

The bounded follow-up direction should therefore be to strengthen the corruption-facing active downshift path modestly while preserving semantic honesty.

The family should still read as corruption-sensitive rather than as a support-collapse clone.

### 10.5 Step E: keep schema and UI exposure compact

If new parameters are required, they should remain few and grouped. Ideally the first user-facing exposure continues to be via named presets or compact family configurations rather than a wide free-form tuning panel.

The frontend should make the experiments selectable and inspectable, not fully user-programmable.

### 10.6 Step F: evaluate again on the same bounded real-fire windows

The primary evaluation target remains the bounded transformed real-fire suite, not synthetic worlds.

The next comparison should explicitly include:

- balanced family before and after minimal ladder expansion,
- corruption family before and after bounded corruption-seam strengthening,
- opportunistic family as the current reference success case,
- advisory versus active comparison for interpretation,
- and only a small synthetic cross-check to ensure the new behavior is not obviously pathological.

### 10.7 Step G: freeze on readability, not overreach

If the follow-up pass restores visibly present, interpretable downshift in the balanced family and produces at least non-nominal readable behavior in the corruption-focused family without semantic collapse, that is enough for Subgoal 01.

The subgoal does not need to prove broad controller superiority. It needs to establish that the active regime layer can be made visibly present and readable on bounded real-fire windows.

---

## 11. Expected code and artifact touchpoints

Likely files include:

- `backend/api/routers/operational.py`
- `backend/awsrt_core/schemas/operational.py`
- `frontend/app/operational/designer/page.tsx`
- `frontend/app/operational/visualizer/page.tsx`
- `src/plots_v_0_3.py`

Expected artifacts:

- a compact active recalibration implementation,
- retained audit-friendly weak-support diagnostics,
- a minimal balanced-family ladder expansion,
- a bounded corruption-seam strengthening,
- bounded real-fire comparison plots,
- and a freeze summary describing what changed and what was learned.

---

## 12. Subgoal 01 scope boundary

This subgoal is intentionally limited.

It is **not** the final answer to active regime control on real-fire data. It is the first v0.4 step toward recovering readable active expression now that bounded real-fire windows have become experimentally viable.

The key test is not whether the platform becomes aggressively adaptive overnight. The key test is whether the active regime layer can be made visibly present, bounded, and interpretable on scientifically meaningful windows.

The first Subgoal 01 pass has already shown that this is possible in at least one family. The remaining task is to recover comparably honest and readable expression in the other intended families through one more bounded recalibration pass, not through uncontrolled redesign.

That remains the right first controller-facing objective for AWSRT v0.4.