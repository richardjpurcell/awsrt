# AWSRT v0.2 Subgoal J: Boundary Decision and Limited Consolidation Direction

**Status:** Draft design note  
**Applies to:** `v0.2-subgoal-j`  
**Purpose:** Define the next disciplined step after Subgoal I by explicitly adopting a limited-bridge interpretation for the remainder of v0.2: the compact usefulness scaffold remains the clearest compact usefulness-controller identity, regime-management remains the richer experimental mechanism layer, and later subgoals may align selected semantics and audit interpretation without claiming full controller unification.

---

## 1. Scope

This note defines **Subgoal J** for AWSRT v0.2.

Subgoal I was a small but real continuation step after the cleaned-surface checkpoint of H. It did two things:

- tightened one compact usefulness-scaffold seam by making `recover -> exploit` re-entry slightly stricter and more causally tied to current delivered opportunity,
- corrected a real truthfulness seam by making `regime_mechanism_audit_available` reflect actual emitted mechanism-audit content rather than an early/default configuration state.

That was the right kind of step. It moved v0.2 forward behaviorally without reopening broad surface cleanup, broad controller merger, or router-architecture work.

However, after I, an important strategic question becomes harder to defer:

> for the remainder of v0.2, should the compact usefulness scaffold and broader regime-management machinery remain clearly separate, or is a limited and principled bridge now justified?

This note answers that question.

Subgoal J is therefore a **boundary-decision / consolidation-direction** subgoal. It is not yet a broad implementation subgoal.

---

## 2. Why Subgoal J is the right next step

### 2.1 H and I created a cleaner decision point
Before H and I, a boundary decision would have been premature. The project still had too much surface ambiguity, and the compact usefulness scaffold still needed at least one more bounded refinement before its role could be judged more clearly.

Now that:

- H cleaned the surface and classification,
- and I produced one additional disciplined compact-controller checkpoint,

the project is in a better position to decide whether the current separation should remain explicit through the rest of v0.2 or whether a controlled consolidation direction should now be named.

### 2.2 v0.2 should not drift into accidental architecture
Without an explicit Subgoal J, there is a risk of drifting into one of two unhelpful patterns:

- **accidental separation:** the compact usefulness scaffold and regime-management layer remain separate only because no one explicitly decided otherwise,
- **accidental merger:** small later patches gradually blur the distinction without a disciplined statement of what the controller identity actually is.

Subgoal J is meant to prevent both failure modes.

### 2.3 The question is now one of direction, not yet refactor
The main issue after I is not yet “how should we refactor the router?”  
It is “what controller boundary should we preserve or relax for the rest of v0.2?”

That is why J should come before any meaningful router-cleanup subgoal.

### 2.4 v0.2 needs a coherent endgame
The remaining path to a v0.2 release should tell a coherent story. Right now the likely story is:

- G: semantics,
- H: surface honesty and alignment,
- I: bounded usefulness continuation,
- J: boundary decision,
- later: cleanup, validation, release.

That is a more coherent progression than continuing with ad hoc local patches without deciding what the controller boundary actually is.

---

## 3. Main development question

The central question for Subgoal J is:

> should the compact usefulness scaffold and regime-management layer remain explicitly separate through the rest of v0.2, or is a limited and principled consolidation direction now justified?

More concretely:

> what is the correct boundary interpretation of the live controller surface after H and I?

This is not yet asking:

> how do we build a single fully unified controller?

Instead, it is asking:

> what relationship between the compact usefulness scaffold and regime-management machinery should v0.2 explicitly adopt for the remaining subgoals?

That makes J a **direction-setting** subgoal rather than a broad implementation subgoal.

---

## 4. Development stance

Subgoal J should follow the same discipline as recent v0.2 subgoals:

- preserve the frozen I checkpoint,
- keep H’s surface-honesty improvements intact,
- avoid broadening visible surface casually,
- avoid introducing “unified controller” language unless the implementation really supports it,
- prefer a clear architectural interpretation over premature code movement.

Subgoal J should **not** become:

- a full controller-family merger,
- a broad router refactor,
- a large frontend rewrite,
- or a release-packaging subgoal.

It should first answer the boundary question clearly and modestly.

---

## 5. What Subgoal J is and is not

### 5.1 What Subgoal J is
Subgoal J is the subgoal where v0.2 explicitly adopts a boundary interpretation for the remainder of the release path.

That interpretation should state:

- what the compact usefulness scaffold is,
- what regime-management is,
- how they differ,
- and what kinds of limited alignment are now allowed without overstating controller consolidation.

It is therefore primarily about:

- controller identity,
- boundary discipline,
- and consolidation direction.

### 5.2 What Subgoal J is not
Subgoal J is not:

- a broad code rewrite,
- a stealth unification step,
- a new surface-expansion step,
- or a final release-freeze step.

It is also not an excuse to casually rename current components as unified if the runtime behavior still clearly separates them.

---

## 6. Working diagnosis entering Subgoal J

After I, the current system appears to have three relevant layers.

### 6.1 Compact usefulness scaffold
This remains the clearest live usefulness-aware identity in a narrow sense:

- selected by `network.policy="usefulness_proto"`,
- compact,
- backend-local,
- and interpretable in terms of exploit / recover / caution state.

It now has slightly tighter exploit re-entry semantics after I.

Importantly, this compact usefulness scaffold is **not merely advisory**. It is already behaviorally active on the `usefulness_proto` path, because usefulness-state interpretation changes the effective deployment policy:

- exploit -> `greedy`
- recover -> `uncertainty`
- caution -> `mdc_info`

So usefulness in v0.2 is not just a passive label or post hoc diagnostic. On the compact path, it is already part of the live deployment logic.

### 6.2 Broader regime-management layer
This remains real and behaviorally live:

- advisory and active machinery exist,
- summaries and debug surfaces are richer than before,
- mechanism-audit truthfulness has improved after I.

But it still reads as an experimental or overlay-style layer, not yet obviously the single controller identity of the system.

### 6.3 Shared diagnostic/usefulness ideas
There is now a growing conceptual overlap between the two:

- both are trying to interpret degraded vs healthy conditions,
- both use usefulness-adjacent signals,
- both have regime-style semantics,
- but they differ substantially in scope, richness, and declared surface weight.

This overlap is exactly why J is needed.

---

## 7. Why the limited bridge makes sense scientifically and architecturally

Relative to v0.1, the shift in v0.2 is now clearer.

### 7.1 v0.1 emphasis
v0.1 was more directly organized around **belief-state structure itself** as the operational signal.

In practice, that meant the operational question was closer to:

> where is uncertainty or belief structure concentrated, and how should deployment respond to that state?

This included:

- entropy structure,
- uncertainty structure,
- band-like regions of epistemic interest,
- and controller behavior driven more directly by belief-state geometry.

### 7.2 v0.2 emphasis
v0.2 shifts emphasis toward **usefulness-oriented signals**:

> are incoming observations still operationally useful for improving belief, or are they merely arriving?

This is where the following become central:

- arrivals,
- staleness,
- corruption,
- misleading activity,
- information-driver strength,
- and the wedge between delivered informational activity and actual belief improvement.

This is an important conceptual shift. It means that usefulness in v0.2 is not just a new dashboard layer. It is a candidate operational signal family in its own right.

### 7.3 Why this supports Option B
This shift makes a cautious bridge more sensible than either extreme.

On one side, it would be too conservative to describe usefulness as merely advisory, because on the `usefulness_proto` path it is already behaviorally active.

On the other side, it would be too aggressive to claim that compact usefulness and regime-management are already one unified controller architecture, because the implementation still clearly separates them in scope, richness, and surface weight.

That is why the limited-bridge interpretation is the most honest and disciplined choice.

---

## 8. Boundary options considered

Subgoal J effectively had three broad options.

### Option A — preserve separation through the rest of v0.2
Interpretation:

- the compact usefulness scaffold remains the main usefulness-aware controller identity,
- regime-management remains a broader experimental/overlay layer,
- the two are intentionally not unified in v0.2.

This is the most conservative option.

### Option B — declare a limited bridge, but do not fully merge
Interpretation:

- the compact usefulness scaffold remains primary for compact usefulness-controller explanation,
- regime-management remains the richer broader mechanism layer,
- but one limited and principled bridge between them is now acknowledged,
- and later subgoals may align selected semantics, audit interpretation, and local naming/reporting structure under that explicit boundary.

This is the selected direction.

### Option C — begin explicit consolidation toward one controller identity
Interpretation:

- v0.2 would now move toward treating compact usefulness and regime-management as parts of a single controller direction.

This option was judged too large and too likely to reopen surface ambiguity before release.

---

## 9. Selected direction

Subgoal J explicitly adopts **Option B: limited bridge, no full merger**.

The selected interpretation is:

- the compact usefulness scaffold remains the clearest compact usefulness-controller identity,
- usefulness remains behaviorally active on the `usefulness_proto` path rather than merely advisory,
- regime-management remains the richer and broader experimental mechanism layer,
- the two are **not** treated as fully unified,
- but later v0.2 subgoals may align selected semantics, audit interpretation, and local naming/reporting structure where doing so improves truthfulness and explainability without collapsing the two layers into one controller abstraction.

This is the core boundary decision of Subgoal J.

---

## 10. What the limited bridge means in practice

The limited bridge is a **declared interpretation plus a narrow allowance**, not a merger.

### 10.1 What remains distinct
The system still keeps two distinct layers:

- **compact usefulness scaffold** = active but compact usefulness-aware deployment controller path via `network.policy="usefulness_proto"`
- **regime-management** = richer broader mechanism layer with advisory/active machinery and deeper mechanism-audit content

These are not relabeled as one unified controller.

### 10.2 What later subgoals are allowed to align
Under the selected limited-bridge interpretation, later v0.2 subgoals may align:

- interpretation language for healthy vs degraded vs corrupted conditions,
- audit/reporting truthfulness where the two layers are currently more different than necessary,
- local helper organization or summary packing where doing so improves clarity,
- design-note and release-note explanations so the final story is coherent.

### 10.3 What later subgoals are not allowed to do under this interpretation
The limited bridge does **not** authorize:

- silent controller merger,
- treating `usefulness_proto` as a thin alias for regime-management,
- flattening compact usefulness and regime-management into one giant controller ontology,
- broad UI/schema expansion to “prepare for unification,”
- or rebranding the current code as unified when it is not.

This restriction is essential. It is what keeps Option B disciplined.

---

## 11. Preserve asymmetry explicitly

If J adopts a limited-bridge interpretation, it must preserve the asymmetry explicitly:

- the compact usefulness scaffold remains the cleaner, narrower, more compact explanatory path,
- regime-management remains the broader and richer mechanism layer,
- shared ideas do not yet imply identical controller identity.

That asymmetry matters for honesty. It prevents later notes from overstating the degree of consolidation achieved.

---

## 12. What should not happen in J

Subgoal J should avoid the following:

- renaming the current system as unified without corresponding implementation support,
- changing compact usefulness semantics, regime-management semantics, and summary contracts all at once,
- broadening the frontend usefulness surface,
- introducing large schema surface to “prepare for future unification,”
- performing router cleanup before the controller boundary is stated clearly.

J should stay at the level of:

- explicit interpretation,
- limited directional decision,
- and possibly very small support edits if needed.

---

## 13. Questions Subgoal J should answer

### 13.1 Identity question
- What is the clearest truthful description of the controller landscape after I?
- Which component is primary for compact usefulness-controller interpretation?

### 13.2 Boundary question
- Are compact usefulness and regime-management intentionally separate for the remainder of v0.2?
- If not fully separate, what limited bridge is justified and what bridge is not?

### 13.3 Surface question
- Can later cleanup and validation proceed without expanding the visible surface?
- Does any language in the designer/visualizer/docs now need slight interpretation tightening?

### 13.4 Implementation-direction question
- What kinds of later changes are allowed under the J decision?
- What kinds of later changes should be deferred until after v0.2?

---

## 14. Proposed implementation stance

Subgoal J should probably proceed in this order.

### Step 1
Re-read the frozen notes and key code with the boundary question in mind:

- `docs/design/v0_2_08_subgoal_h_usefulness_surface_alignment_cleanup.md`
- `docs/design/v0_2_09_subgoal_i_usefulness_continuation.md`
- `backend/api/routers/operational.py`
- `frontend/app/operational/designer/page.tsx`
- `frontend/app/operational/visualizer/page.tsx`

### Step 2
Write down the strongest honest interpretations of the current state:

- strict-separation interpretation,
- limited-bridge interpretation,
- and merger-leaning interpretation.

### Step 3
Adopt one explicit direction for the remainder of v0.2.

That direction is now:
- **limited bridge, no full merger**

### Step 4
If needed, make only the smallest code or wording changes necessary to support that decision.

### Step 5
Freeze J once:
- the boundary is explicit,
- later subgoals can proceed under it,
- and no unnecessary surface churn was introduced.

---

## 15. Likely implementation shapes for J

Subgoal J may end up taking one of the following shapes.

### Shape A — document-first, no code
This is entirely plausible and may be the best outcome.

J would:
- define the boundary direction clearly,
- update no code,
- and simply constrain later subgoals.

This is attractive if the current runtime already supports a clean enough interpretation.

### Shape B — document plus tiny wording alignment
J could include:
- a design-note decision,
- and one or two tiny wording adjustments in designer/visualizer text or labels.

This is acceptable if the current wording subtly conflicts with the chosen boundary interpretation.

### Shape C — document plus one tiny backend naming/summary clarification
J could include:
- the design-note decision,
- and one tiny backend clarification if some summary naming still obscures the chosen boundary.

This should remain very limited if used at all.

### Shape D — hidden merger step
This is not acceptable for J.

If the work starts to require:
- larger summary restructuring,
- cross-layer controller rewiring,
- or broader schema/frontend changes,

then J has drifted out of scope.

---

## 16. Validation goals

The main questions for Subgoal J are:

1. Did we make the controller boundary more explicit after I?
2. Did we avoid overclaiming consolidation?
3. Did we avoid leaving later subgoals to drift architecturally?
4. Can later cleanup and validation now proceed under a clearer interpretation?
5. Did we preserve H/I’s surface discipline while improving architectural honesty?

J succeeds if the remaining v0.2 subgoals become easier to define and harder to misframe.

---

## 17. Suggested success criteria

Subgoal J should be considered successful if:

- the relationship between compact usefulness and regime-management is stated clearly,
- the chosen interpretation is honest with respect to the current code,
- later subgoals can name their scope relative to that interpretation,
- no broad surface regression is introduced,
- and the design-note sequence from H to I to J reads as coherent.

A strong success outcome would be:

- future notes can say not only what changed in H and I,
- but also what boundary interpretation v0.2 is now explicitly using for the rest of the release path.

---

## 18. Warning signs

Subgoal J should be treated as drifting or unsuccessful if:

- it quietly turns into an implementation-heavy unification step,
- it introduces new visible surface without clear need,
- it makes claims of controller consolidation stronger than the code supports,
- or it leaves the boundary still vague at the end.

Another warning sign would be:

- adopting “bridge” language so vague that later subgoals could justify almost anything under it.

J should reduce ambiguity, not rename it.

---

## 19. Relationship to later v0.2 steps

Subgoal J should make the next steps easier to define.

A plausible path after J is:

### 19.1 Subgoal K — modest router structure cleanup
Once the controller boundary is explicit, perform a contained internal cleanup of `backend/api/routers/operational.py`:

- helper locality,
- cleaner state-machine grouping,
- better packing boundaries for summary/series construction,

but still no uncontrolled rewrite.

### 19.2 Subgoal L — audit and validation hardening
Strengthen the final v0.2 validation story:

- representative presets,
- summary consistency checks,
- controller-identity audit checks,
- confirmation that the final surface is explainable and reproducible,
- and explicit confirmation that the limited bridge did not drift into false unification.

### 19.3 Subgoal M — v0.2 freeze and release packaging
Prepare the v0.2 release checkpoint:

- finalize the control surface,
- clean remaining naming/documentation rough edges,
- ensure the design-note sequence tells a coherent story,
- and produce the final branch/tag/release framing for the v0.2 endpoint.

J should therefore be understood as a directional bridge between I and the later cleanup/validation/release subgoals.

---

## 20. Relationship to future refactor work

This note does **not** propose a full refactor of:

- `backend/api/routers/operational.py`

If J leads to any implementation work, that work should remain boundary-supporting, not architecture-driven.

Large structural cleanup still belongs later, once the chosen controller interpretation is explicit and stable.

---

## 21. Expected implementation touchpoints

Likely files for Subgoal J:

- `docs/design/v0_2_10_subgoal_j_boundary_decision_or_consolidation_direction.md`
- `backend/api/routers/operational.py` only if a tiny clarification becomes necessary
- possibly `frontend/app/operational/designer/page.tsx`
- possibly `frontend/app/operational/visualizer/page.tsx`

Expected emphasis:

### First pass
- design notes
- router/controller interpretation
- designer/visualizer wording only as needed

### Then, only if justified
- one or two tiny alignment edits

Reason:
J is expected to be primarily a **boundary-decision** subgoal, not a large implementation subgoal.

---

## 22. Short summary

Subgoal J is the next disciplined step after Subgoal I. Its purpose is to decide explicitly how the compact usefulness scaffold and broader regime-management machinery should be interpreted for the rest of v0.2. The selected direction is a **limited bridge, not full merger**. Under this interpretation, the compact usefulness scaffold remains the clearest compact usefulness-controller identity, usefulness remains behaviorally active on the `usefulness_proto` path rather than merely advisory, and regime-management remains the richer experimental mechanism layer. Later v0.2 subgoals may align selected semantics, audit interpretation, and local naming/reporting structure where doing so improves truthfulness and explainability, but without collapsing the two layers into one controller abstraction. Subgoal J therefore clarifies architectural direction for the remainder of v0.2 while preserving the surface-discipline gains established in H and the bounded controller continuation achieved in I.