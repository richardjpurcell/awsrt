# AWSRT v0.3 Subgoal 01: Diagnostic-Linked Adaptive Control

**Status:** Draft design note  
**Applies to:** `v0.3-subgoal-01`  
**Purpose:** Define the first disciplined implementation subgoal after the frozen AWSRT v0.2 release by strengthening adaptive-control behavior from the clarified v0.2 baseline, with specific emphasis on tighter linkage between diagnosed degradation conditions and realized control transitions.

---

## 1. Purpose of this note

This note defines the first actual development subgoal after the AWSRT v0.2 freeze.

Its purpose is to turn the post-v0.2 roadmap into a concrete and disciplined first step. That step should preserve the interpretive and boundary gains of AWSRT v0.2 while moving the project back into substantive controller development.

The core planning conclusion from the roadmap was:

- AWSRT v0.3 should be the first post-v0.2 adaptive-control stage,
- the highest-payoff near-term work remains adaptive-control improvement and experimentation,
- and realism work should remain bounded to what directly supports meaningful experimentation.

Subgoal 01 therefore focuses first on adaptive control itself. It is not a broad realism note, not a platform-redesign note, and not a general UI catch-up note.

---

## 2. Starting point inherited from v0.2

AWSRT v0.2 left the project in a cleaner but intentionally limited state.

It clarified that:

- the compact usefulness path is now operationally legible,
- advisory and active regime summaries should not be read interchangeably,
- active mechanism behavior is more inspectable,
- and the compact usefulness path and broader regime-management layer remain related but not fully unified.

This matters because the first v0.3 step should not reopen those questions. It should inherit them as baseline discipline.

In particular, the controller-boundary interpretation from the v0.2 J decision remains in force:

- `usefulness_proto` remains the clearest compact usefulness-controller identity,
- usefulness remains behaviorally active on that path,
- `regime_management` remains the broader advisory/active mechanism layer,
- and later work should improve control behavior from within that boundary rather than casually erasing it.

Subgoal 01 should therefore be read as the first control-development step taken **after** interpretive cleanup, not as another interpretive cleanup step.

---

## 3. Why this is the right first v0.3 subgoal

### 3.1 The highest-payoff work is still adaptive control
The strongest remaining thesis and scientific payoff still lies in adaptive control rather than in broad realism or broad platform polishing.

AWSRT already established:

- that information delivered and information useful for belief improvement can diverge,
- that impairments degrade usefulness differently,
- and that operational-control interpretation became cleaner in v0.2.

The next question is therefore no longer primarily:

> can we interpret the late-stage control surface honestly?

It is now:

> can the active control layer respond more clearly and more interpreably to diagnosed degraded-information conditions?

That is the natural next scientific step.

### 3.2 v0.2 made mechanism reading possible, so v0.3 should use that
The active mechanism layer is now more inspectable than it was before. That means the project is in a better position to make small but real control improvements and then study those improvements through mechanism-facing outputs, rather than only through headline aggregate outcomes.

This is a strong reason to begin v0.3 with a control-facing note rather than with a realism or UI note.

### 3.3 Real-fire work is important, but should not define the first subgoal
A bounded real-fire deployment-simulation bridge is now justified, especially because long-horizon real-fire runs require execution-window control. However, that is still best understood as enabling work rather than as the core scientific identity of the first v0.3 subgoal.

Subgoal 01 should therefore keep the real-fire bridge secondary and bounded.

---

## 4. Main development question

The central question for Subgoal 01 is:

> how should AWSRT strengthen adaptive control so that realized transition behavior is more clearly linked to diagnosed degradation conditions, without reopening controller-boundary ambiguity or overexpanding the platform surface?

More concretely:

> what is the smallest scientifically meaningful adaptive-control improvement that makes transition behavior more causally readable with respect to staleness, corruption, weakened support, or related degraded-information conditions?

This is the core question that should govern the subgoal.

---

## 5. Scope

Subgoal 01 should focus on one compact class of improvements:

- tightening the linkage between diagnostic conditions and active-control transitions.

That means the subgoal should aim to do some combination of the following:

- make one small but real improvement to active transition logic,
- make the logic more clearly responsive to diagnosed degraded-information conditions,
- preserve mechanism readability,
- and support one compact experimental study family that can evaluate the change honestly.

Subgoal 01 should stay disciplined. It is not meant to solve all controller questions at once.

---

## 6. What Subgoal 01 is and is not

### 6.1 What Subgoal 01 is
Subgoal 01 is the first post-v0.2 controller-development step.

It is about:

- adaptive-control improvement,
- diagnostic-linked transition behavior,
- failure-mode-aware experiment design,
- and mechanism-legible evaluation.

It should be small enough that the resulting behavior remains readable and the experiment family remains compact.

### 6.2 What Subgoal 01 is not
Subgoal 01 is not:

- a controller-unification step,
- a broad regime-family redesign,
- a major realism expansion,
- a broad UI parity pass,
- a major refactor of `backend/api/routers/operational.py`,
- or a large sweep campaign without a tight scientific question.

It is also not a return to static policy-ranking logic as the main development frontier.

---

## 7. Working diagnosis entering Subgoal 01

At the start of v0.3, AWSRT appears to have three relevant assets:

### 7.1 Interpretable usefulness-side signals
AWSRT already has usefulness-adjacent signals and diagnostic quantities that can distinguish meaningful degraded-information conditions better than earlier versions of the platform could.

These include signals related to:

- support weakening,
- staleness / observation age,
- corruption-style misleading activity,
- delivered informational activity,
- and related driver quantities.

The exact final signal set does not need to be expanded dramatically at the start of Subgoal 01. The more important issue is how clearly those signals are connected to behavior.

### 7.2 A more readable active mechanism layer
AWSRT v0.2 established that active regime behavior is now more inspectable through quantities such as:

- transition counts,
- effective control summaries,
- hysteresis-sensitive responses,
- and related mechanism-facing outputs.

This means Subgoal 01 can target control behavior without giving up the ability to read what the machine is doing.

### 7.3 A still-monolithic implementation surface
The backend operational router remains structurally heavy and likely contains more logic in one place than is ideal. However, that should be treated as a constraint on how disciplined the subgoal must remain, not as proof that refactor should become the first priority.

The rule should be:

> only perform the internal cleanup needed to support the control improvement cleanly and truthfully.

---

## 8. Recommended development stance

Subgoal 01 should follow these principles.

### 8.1 Improve behavior before broadening ontology
The next step should improve actual adaptive behavior before introducing a broader controller vocabulary or a larger controller family surface.

### 8.2 Prefer causal readability over threshold proliferation
The key gain should be that transitions become easier to explain in terms of diagnosed conditions. The goal is not to pile on many new thresholds or create a large parameter surface without interpretive benefit.

### 8.3 Preserve the v0.2 boundary discipline
The compact usefulness path and broader regime-management layer should remain distinct in identity, even if this subgoal improves the active behavior inside the broader regime-management machinery or sharpens the relationship between usefulness-side diagnostics and active decisions.

### 8.4 Keep the experiment family compact
The first v0.3 study family should be small enough that it is still possible to explain:

- what changed,
- what conditions were tested,
- what behavior shifted,
- and why the result matters.

---

## 9. Candidate improvement direction

The most promising first direction is:

> strengthen one active transition seam so that movement among active operating states is more clearly tied to diagnosed degraded-information conditions rather than to a looser threshold mixture alone.

This could take one of several forms.

### 9.1 Degradation-type-aware trigger refinement
One option is to refine active transition logic so that:

- stale-but-still-informative conditions,
- corruption-dominated conditions,
- and weak-support conditions

produce more clearly differentiated control responses.

This would directly extend the impairment-sensitive interpretation work that motivated v0.1 and was clarified in v0.2.

### 9.2 Better recovery versus caution distinction
Another promising option is to strengthen the distinction between:

- conditions that call for recovery-oriented behavior,
- and conditions that call for stronger caution-oriented behavior.

This is attractive because it lines up closely with the compact usefulness triad interpretation while still remaining compatible with the broader active mechanism layer.

### 9.3 Better re-entry logic after degraded conditions
A third option is to focus on the return path:

- when should the active machine leave degraded-response behavior,
- what evidence should it require before re-entering a stronger exploit-like stance,
- and how can that re-entry be made more causally tied to current opportunity rather than merely to the passage of time or relaxation of one threshold?

This is scientifically attractive because recovery and re-entry behavior often determine whether a controller is merely reactive or genuinely adaptive.

At the start of Subgoal 01, one of these directions should be chosen explicitly rather than blended together.

---

## 10. Preferred first target

The preferred first target is:

> improve the distinction between recovery-oriented and caution-oriented active responses under degraded-information conditions, while keeping re-entry conditions interpretable.

For the first implementation pass, this should be interpreted narrowly:

- keep the active state-machine shape unchanged,
- keep the existing certified-escalation path unchanged,
- and refine recovery semantics first rather than broadening controller ontology.

The preferred first concrete adjustment is:

- remove `local_drift_rate` as positive recovery evidence in the active trigger path,
- while leaving degradation and switch-to-certified semantics unchanged for this first pass.

The intended interpretation is that recovery should mean renewed usable opportunity and reduced degradation burden, not merely the sign-flipped counterpart of every degradation-side signal.

This is the best first target because:

- it builds directly on the strongest compact usefulness interpretation inherited from v0.2,
- it has clear failure-mode meaning,
- it is likely to be experimentally legible,
- and it can improve behavior without implying broad controller unification.

It is also likely to produce results that are useful both scientifically and for later design sequencing.

Early validation note:

- the first recovery-side refinement appears safe and worth retaining,
- but the stronger limitation exposed by early active-regime validation is not recovery semantics alone,
- it is the calibration of the active trigger surface itself.

In particular, early semantic-probe validation indicates that the active machine still tends to:

- over-certify healthy conditions,
- under-express corruption-side caution in some noise cases,
- and therefore blur the intended healthy / stale / corruption reading.

Accordingly, Subgoal 01 should now be read as containing two tightly related steps: first a small recovery-side refinement, then a small trigger-surface alignment pass aimed at making healthy and corruption-sensitive active behavior more honest and more readable.

Extended validation note:

- the recovery-side refinement remains worth retaining,
- and modest healthy / delay trigger-surface adjustments can improve readability somewhat,
- but repeated bounded attempts to make the current active surface more corruption-sensitive through local-drift participation did not materially change the corruption-side active reading.

This matters because it sharpens the diagnosis of what Subgoal 01 did and did not accomplish.

Subgoal 01 now supports the following more precise interpretation:

- a small recovery-semantics improvement was implemented successfully,
- a bounded semantic-probe validation workflow was established,
- healthy and delay-side calibration can be nudged,
- but the present active regime surface still does not robustly express corruption-side caution from the currently available trigger composition.

That should now be treated as a substantive checkpoint result rather than as a reason for unlimited additional threshold tuning inside the same bounded step.


---

## 11. Experiment design for Subgoal 01

Subgoal 01 should be paired with one compact but disciplined study family.

That study family should not try to exhaust the design space. Its purpose should be to determine whether the new transition logic behaves more meaningfully under contrasting degraded-information conditions.

### 11.1 Recommended study shape
A good initial study family would likely include:

- one healthy reference condition,
- one delay-heavy or stale-information condition,
- one corruption-heavy or noise-heavy condition,
- and optionally one mixed or borderline condition if needed to test ambiguity.

This keeps the study aligned with the established impairment logic of the project without turning it into a broad campaign.

For the first pass, the central experimental comparison should be read as:

- baseline active transition behavior before recovery refinement,
- versus active transition behavior after recovery refinement,
- with particular attention to whether delay-heavy and noise-heavy cases remain more cleanly separated as recover-oriented versus caution/escalation-oriented responses.

After the first validation pass, the study should now also be read as asking:

- whether healthy conditions remain insufficiently close to nominal active behavior,
- whether corruption-side cases are still too likely to remain nominal,
- and whether a small trigger-surface adjustment improves that semantic separation without reopening the controller boundary or broadening the state machine.

This keeps the study compact while acknowledging that the first recovery refinement did not by itself resolve the more important active-surface misalignment.

After the extended validation pass, the study should now also be read as having established a useful negative result:

- bounded recovery refinement and bounded trigger-surface retuning do not by themselves make the current active regime surface corruption-sensitive in the desired way,
- and repeated local-drift-based probe adjustments are insufficient to produce a robust corruption-side caution reading under the present surface.

This is still scientifically useful because it narrows the next design question. The issue is no longer merely whether thresholds should be shifted again inside the current surface. The issue is whether a later bounded step should introduce or test a more explicit corruption-facing active signal rather than continuing threshold-only tuning.


### 11.2 Recommended evaluation emphasis
Evaluation should prioritize:

- realized transition behavior,
- state occupancy or transition counts where appropriate,
- belief-quality summaries,
- timeliness only as one layer rather than the whole result,
- and mechanism-facing interpretability of the change.

### 11.3 Recommended scientific question
The study should answer a question like:

> does the revised transition logic produce more interpretable and more condition-appropriate active behavior under contrasting degradation modes, without requiring overclaiming from headline outcome changes alone?

That is the right level of ambition for Subgoal 01.

A revised formulation, in light of early validation, is:

> does the combination of a small recovery-side refinement and a small active trigger-surface alignment produce more interpretable and more condition-appropriate active behavior under healthy, stale, and corruption-sensitive conditions, without requiring broad controller redesign?

This revised formulation remains within Subgoal 01 scope because it still targets a narrow active-transition seam rather than a broader controller-family rewrite.

After the extended probe work, the most accurate bounded formulation is now:

> does a small recovery-side refinement, together with bounded trigger-surface probing, improve active readability enough to justify the current surface as a useful near-term basis for healthy versus stale behavior, while honestly recording that corruption-side caution remains under-expressed?

This revised framing keeps the subgoal truthful. It preserves the value of the work already done without overstating what the current active surface now supports.

---

## 12. Relation to real-fire deployment-simulation work

The real-fire bridge should be handled carefully relative to this subgoal.

### 12.1 What is allowed in Subgoal 01
If bounded execution-window support is immediately needed to keep early experiments or tooling aligned, very small enabling work may occur during this subgoal.

That work should remain tightly limited to:

- support for bounded deployment windows,
- any minimal schema/backend/UI plumbing required for that support,
- and only the testing necessary to confirm that long-horizon real-fire runs can be sliced for tractable experimentation.

### 12.2 What is not the focus of Subgoal 01
Subgoal 01 should not become:

- the main real-fire bridge subgoal,
- a broad real-data integration effort,
- or a realism-validation note.

If bounded execution-window work becomes substantial, it should be explicitly split into the next v0.3 subgoal rather than allowed to silently take over this one.

---

## 13. Likely implementation touchpoints

The most likely files for Subgoal 01 are:

- `backend/api/routers/operational.py`
- `backend/awsrt_core/schemas/operational.py` only if a small manifest/control surface clarification is needed
- `frontend/app/operational/designer/page.tsx` only if a small surface adjustment is needed to expose the control setting or improve experiment setup clarity
- one or more design notes and compact validation artifacts

Expected emphasis should remain:

### First pass
- transition logic
- diagnostic linkage
- compact experimental framing

### Only if justified
- one or two small schema/UI support edits
- minimal helper cleanup required for clarity or truthfulness

Large structural cleanup is out of scope.

---

## 14. Suggested success criteria

Subgoal 01 should be considered successful if:

- one compact adaptive-control improvement is implemented,
- the improvement is clearly linked to diagnosed degradation conditions,
- realized transition behavior becomes more interpretable under the study conditions,
- the experimental readout remains compact and honest,
- and no controller-boundary overclaim is introduced.

A strong success outcome would be:

- the first v0.3 study can say not only that behavior changed,
- but that it changed in a way that is more clearly aligned with specific degraded-information conditions.

Given the validation work already performed, a more specific success condition is now:

- healthy cases should not be driven into strong certified occupancy by default,
- stale-information cases should remain capable of visible degraded-but-recoverable behavior,
- and corruption-sensitive cases should no longer read as trivially nominal when corruption-side diagnostics are clearly elevated.

These are not final optimization criteria. They are semantic and mechanism-facing criteria for determining whether the active surface is becoming more scientifically readable.

Based on the bounded probe work completed so far, the current status is mixed:

- the recovery-side refinement passes a keep-or-revert test and should be kept,
- healthy / delay readability can be improved somewhat through bounded surface adjustment,
- but the corruption-sensitive criterion is not yet met.

That means Subgoal 01 should now be considered successful only in a partial and disciplined sense:

- it established a valid bounded refinement,
- it established a usable semantic-probe workflow,
- and it clarified a real limit of the current active surface.

This is still a meaningful success outcome for an early v0.3 control subgoal because it reduces ambiguity about what the current surface can honestly support.

---

## 15. Warning signs

Subgoal 01 should be treated as drifting or unsuccessful if:

- it turns into a broad active-controller redesign,
- it adds many new thresholds without better explanatory power,
- it reopens the usefulness-versus-regime boundary question,
- it turns into a large real-fire bridge effort,
- or it becomes a large refactor-first phase.

Another warning sign would be:

- an experiment family so broad that it becomes hard to tell what the new logic actually improved.

An additional warning sign, now supported by early validation experience, would be:

- a semantic-probe preset that still drives healthy runs into strong certification,
- or that leaves corruption-sensitive runs almost entirely nominal despite clearly elevated corruption-side diagnostics.

That kind of result would suggest trigger-surface misalignment rather than meaningful recovery-versus-caution refinement.


A further warning sign is:

- continuing to apply small threshold-only or local-drift-only patches after repeated bounded probe attempts have stopped producing meaningful corruption-side behavior changes.

At that point, the disciplined response is not endless local tuning. It is to record the limit honestly and defer the broader corruption-facing signal question to the next bounded design step.

This first v0.3 step should reduce ambiguity, not relocate it.

---

## 16. Relationship to likely next subgoals

A plausible sequence after Subgoal 01 is:

### 16.1 Subgoal 02 — bounded real-fire execution-window support
If not already completed as tiny enabling work, add the minimal schema/backend/UI support needed to limit operational run horizons for tractable deployment experiments on transformed real-fire data.

### 16.2 Subgoal 03 — corruption-facing active signal follow-on
If the project chooses to continue the adaptive-control line immediately, the next bounded controller-facing step should likely not be more threshold-only retuning of the current semantic probe. It should instead ask whether an explicitly corruption-facing active signal should be introduced, tested, or audited as a separate bounded follow-on.

That follow-on would be justified by Subgoal 01 precisely because Subgoal 01 has now shown that:

- recovery refinement alone is not enough,
- bounded trigger-surface alignment helps only partially,
- and the current active surface still under-expresses corruption-side caution.


### 16.2 Subgoal 04 — compact v0.3 experiment and validation checkpoint
Freeze and interpret the first v0.3 control study family with disciplined attention to mechanism, transition behavior, and belief-quality outcomes.

### 16.3 Later v0.3 steps
Only after those are in place should the project consider:

- broader robustness studies,
- additional adaptive-control refinements,
- or further platform catch-up tasks.

This keeps the development sequence aligned with the roadmap beyond v0.2.

---

## 17. Short summary

Subgoal 01 is the first real controller-development step after the frozen AWSRT v0.2 release. Its purpose is to strengthen adaptive control by making realized transition behavior more clearly linked to diagnosed degraded-information conditions. The preferred direction is to improve the distinction between recovery-oriented and caution-oriented active responses while keeping re-entry conditions interpretable. The subgoal should remain compact, mechanism-legible, and scientifically disciplined. It should support one small but meaningful failure-mode-centered study family and should treat bounded real-fire execution-window work only as minor enabling support unless that work clearly deserves its own follow-on subgoal.