# AWSRT v0.2 Subgoal I: Usefulness Continuation from the Cleaned Surface

**Status:** Frozen design note  
**Applies to:** `v0.2-subgoal-i`  
**Purpose:** Record the bounded controller-facing continuation step taken after Subgoal H, preserving H’s surface-discipline gains while making one small usefulness-scaffold refinement and one small mechanism-audit truthfulness correction.

---

## 1. Scope

This note defines **Subgoal I** for AWSRT v0.2.

Subgoal H was an alignment and cleanup checkpoint. It did not primarily change controller behavior. Its role was to make the current usefulness-related operational surface more honest, better classified, and easier to reason about across:

- schema,
- designer,
- visualizer,
- and router.

That was the right step. However, H was intentionally not a stopping point for controller work. Its purpose was to create a cleaner baseline from which a next controller-facing step could proceed without repeated ambiguity about what was active, what was experimental, and what was only partially wired.

Subgoal I was therefore framed as the next **behavior-facing continuation** after H.

It was not intended to repeat H. It was also not intended to become a final controller-unification step.

Its purpose was to continue usefulness-oriented controller development from the cleaner baseline established by H, while preserving H’s surface discipline.

---

## 2. Why Subgoal I was the right next step

After H, the project was in a better position to resume controller-facing work.

The main reasons were:

### 2.1 H reduced semantic ambiguity enough to move forward again
Before H, controller-facing changes were becoming entangled with surface-legibility concerns. It was too easy to change behavior while also changing presentation weight, naming, or implied maturity. H improved that situation materially.

### 2.2 The compact usefulness scaffold remained unfinished but clearer
The compact usefulness scaffold selected by `network.policy="usefulness_proto"` remained the most identifiable live usefulness-aware controller path in v0.2. Its delay/noise semantics were more defensible after G, and its presentation was more honest after H. That made it the right place for the next controlled development step.

### 2.3 H exposed a small truthfulness seam worth carrying forward
H did not reveal a need for broad redesign, but it did leave at least one follow-up item clearly on radar:

- `regime_mechanism_audit_available` needed a small truthfulness cleanup, since some active opportunistic runs showed meaningful mechanism-audit content while that summary flag remained false.

That was not, by itself, a whole subgoal. But it was exactly the kind of small honesty/behavior seam that fit naturally inside a controlled continuation step.

### 2.4 v0.2 still needed one more controller-facing checkpoint
If v0.2 had ended immediately after H, it would have ended on a cleanup pass rather than on a final controller-facing checkpoint. A small next step was warranted so that v0.2 progressed from:

- semantic refinement (G),
- to surface cleanup (H),
- to a final disciplined usefulness continuation (I),

before later validation and release-facing steps.

---

## 3. Main development question

The central question for Subgoal I was:

> given the cleaner and more honest surface produced by H, what is the next small usefulness-controller improvement that can be made without reopening broad architectural or surface questions?

Equivalently:

> what controller-facing refinement is now worth making on the compact usefulness path, while preserving H’s classification of core vs experimental vs deferred surface?

This was a **controller continuation question**, but still under strict discipline.

Subgoal I was therefore not asking:

> should we redesign the whole controller stack?

It was asking:

> what is the next bounded usefulness-oriented improvement that benefits from H’s cleanup, but does not undo it?

---

## 4. Development stance

Subgoal I followed the same v0.2 discipline as recent subgoals:

- preserve the frozen H checkpoint,
- keep H’s surface-honesty improvements intact,
- prefer a small behavior refinement over broad redesign,
- avoid re-expanding the UI/schema surface casually,
- and resist any temptation to merge controller families prematurely.

Subgoal I was **not** meant to become:

- another broad alignment audit,
- a full usefulness/advisory/active controller merger,
- a total regime-management redesign,
- a full router refactor,
- or a release-engineering subgoal.

It was intended to remain a **controlled usefulness continuation** from the cleaned baseline.

---

## 5. What Subgoal I is and is not

### 5.1 What Subgoal I is
Subgoal I is the next disciplined usefulness-controller step after H.

Its implemented themes were:

- tightening one controller-facing seam in the compact usefulness scaffold,
- making one small truthfulness correction where summary/audit semantics lagged actual live behavior,
- improving the usefulness-oriented interpretation path without broadening surface complexity,
- and preserving the distinction between:
  - the compact usefulness scaffold,
  - the broader regime-management layer,
  - and deeper mechanism audit.

### 5.2 What Subgoal I is not
Subgoal I is not:

- H again,
- a broad schema/frontend cleanup,
- a full controller-family unification,
- a major advisory/active redesign,
- or the final v0.2 freeze step.

This distinction matters. H improved the surface. I improved a behavior-facing seam while keeping that cleaner surface intact.

---

## 6. Working diagnosis entering Subgoal I

The cleaned H baseline left the system in a better state, but a few tensions remained.

### 6.1 The compact usefulness scaffold was still the clearest live usefulness-aware identity
The compact usefulness scaffold remained the clearest live usefulness-aware path in v0.2. That gave I a natural target.

### 6.2 Regime-management remained real but still experimental
`regime_management` was implemented and behaviorally live, but it still read as an overlay/experimental layer rather than the definitive controller identity. That was acceptable for now and was not casually undone in I.

### 6.3 Some summary/audit surfaces still understated reality
The main example entering I was:

- `regime_mechanism_audit_available`

This was a surface-truthfulness issue rather than a controller-family redesign issue, and therefore fit the style of a bounded continuation step.

### 6.4 The router remained monolithic, but that was not yet the main problem
The router remained monolithic. However, after H, the more urgent problem was not raw file size. The more urgent problem was deciding what small behavior-facing step was worth taking next before any larger structural refactor.

---

## 7. Recommended Subgoal I direction

The recommended direction for Subgoal I was:

### 7.1 Continue from the compact usefulness scaffold, not from a merged controller abstraction
The compact usefulness scaffold remained the main usefulness-facing target for this subgoal. This kept the work legible and avoided prematurely absorbing regime-management into a single larger architecture.

### 7.2 Pair one behavior refinement with one small truthfulness cleanup
A good Subgoal I was expected to include:

- one bounded controller-facing improvement,
- and one small reporting/audit truthfulness correction,

as long as both remained tightly scoped.

That turned out to be the shape actually implemented.

### 7.3 Preserve H’s classification boundaries
Subgoal I preserved the H-style interpretation:

- **core active** operational path remained centered on the ordinary operational manifest plus live backend policy behavior,
- **experimental but real** regime-management remained available but not re-promoted to dominant identity,
- **partially wired or deferred** usefulness manifest richness was not casually treated as fully authoritative.

### 7.4 Avoid introducing new visible surface unless behavior clearly justified it
Subgoal I preferred backend behavior and summary truthfulness changes over new user-facing control surface. In the implemented version, no frontend expansion was required.

---

## 8. Candidate directions considered for the actual I implementation

Subgoal I was deliberately kept small. Plausible candidate directions included the following.

### Candidate A — small usefulness-scaffold refinement
Improve one controller-facing seam in the compact usefulness scaffold while preserving G’s delay/noise semantics and H’s surface cleanup.

This was the leading candidate, and it became the main implemented direction.

### Candidate B — mechanism-audit truthfulness cleanup
Address the `regime_mechanism_audit_available` seam so that the summary better reflects whether meaningful mechanism-audit content is actually present for a run.

This became the implemented complementary cleanup.

### Candidate C — compact behavior plus compact reporting improvement
A combined subgoal could:

- make one small usefulness behavior refinement,
- and make one small audit/summary truthfulness refinement,

provided that both were tightly contained.

This turned out to be the best shape for I in practice.

### Candidate D — larger controller-family bridge
Begin explicitly bridging the compact usefulness scaffold and regime-management machinery.

This was **not recommended** for I and was not attempted.

---

## 9. What did not change first in I

Subgoal I intentionally avoided changing all of the following together:

- compact usefulness transition semantics broadly,
- regime-management semantics broadly,
- summary contract structure broadly,
- visualizer section hierarchy,
- and router structure.

It also avoided:

- introducing “unified controller” language before the code supported it,
- expanding the usefulness manifest surface to match aspiration rather than reality,
- or turning a small continuation subgoal into a broad theory or architecture step.

I remained a **continuation checkpoint**, not a platform reset.

---

## 10. Specific questions Subgoal I needed to answer

### 10.1 Compact usefulness scaffold
- What was the next small behavior-facing refinement worth making?
- Did one compact transition seam still deserve tightening after G?
- Was there one compact diagnostic or summary quantity that should better match the scaffold’s real behavior?

### 10.2 Mechanism-audit truthfulness
- Should `regime_mechanism_audit_available` be recomputed or redefined so it better reflects actual available audit content?
- Was this best handled in summary construction, visualizer interpretation, or both?

### 10.3 Surface discipline preservation
- Could the next behavior refinement be made without reopening H’s surface cleanup?
- Could the designer and visualizer remain stable except for strictly necessary clarifying adjustments?

### 10.4 Boundary preservation
- Could the compact usefulness scaffold remain the main usefulness identity for this subgoal?
- Could regime-management remain clearly real-but-experimental rather than being silently re-promoted to the main controller identity?

---

## 11. Implemented direction

Subgoal I ultimately implemented two tightly scoped changes in `backend/api/routers/operational.py`.

### 11.1 Compact usefulness-scaffold refinement
The compact usefulness scaffold was refined by tightening the `recover -> exploit` re-entry condition.

Specifically:

- `_usefulness_trigger_exploit(...)` was extended to require arrivals-side health in addition to:
  - low recent valid observation age,
  - low recent misleading-activity fraction,
  - and sufficiently recovered recent information-driver strength.

This made exploit re-entry slightly stricter and more causally aligned with current delivered opportunity. The intended interpretation is:

- the controller should not return from `recover` to `exploit` merely because the recent window looks cleaner,
- it should also require that delivered opportunity remains substantively present at the current step.

This was a compact refinement, not a scaffold redesign.

### 11.2 Mechanism-audit truthfulness cleanup
`regime_mechanism_audit_available` was corrected so it no longer depended on an early/default regime local before the actual manifest-backed regime configuration and emitted audit series were available.

Instead, the flag is now computed late and truthfully from the presence of meaningful mechanism-audit content already produced by the run, including regime/debug series and related support diagnostics.

This change was intentionally:

- local,
- backward-compatible at the summary-key level,
- and truthfulness-oriented rather than surface-expanding.

### 11.3 What did not change
Subgoal I did **not**:

- add new frontend control surface,
- change the designer classification introduced in H,
- merge usefulness-proto with regime-management into a single controller abstraction,
- or refactor the router structurally.

---

## 12. Validation approach

Subgoal I was validated on a compact representative set:

- one active regime-management case with meaningful mechanism-audit content,
- one ideal `usefulness_proto` case,
- one representative delay case,
- one representative noise case.

This validation set was chosen to answer the two central implementation questions:

1. was the mechanism-audit flag now truthful?
2. did the tighter exploit re-entry remain bounded and interpretable across healthy, delay-heavy, and corruption-heavy cases?

---

## 13. Validation outcomes

### 13.1 Mechanism-audit truthfulness outcome
The truthfulness fix behaved as intended.

In the representative active opportunistic case:

- `regime_mechanism_audit_available` became `true`,
- and the run also showed meaningful mechanism-audit content, including:
  - nonzero active transitions,
  - nontrivial leave-certified activity,
  - debug trigger/counter content,
  - utilization-margin ranges,
  - and requalification-support summaries.

This was the key motivating seam entering I, and the result now reads as materially more faithful.

### 13.2 Ideal usefulness-proto outcome
The ideal `usefulness_proto` case remained entirely healthy and interpretable.

Observed summary shape:

- exploit fraction remained `1.0`,
- recover fraction remained `0.0`,
- caution fraction remained `0.0`,
- no usefulness triggers fired.

This was important because it showed that the stricter exploit re-entry gate did **not** damage the healthy baseline or make clean cases sticky.

### 13.3 Delay-case outcome
The representative delay case remained predominantly **recover**, not **caution**.

Observed summary shape:

- exploit fraction remained very small,
- recover fraction dominated,
- caution fraction remained `0.0`,
- the final usefulness state remained recover.

This is consistent with the intended post-G semantics: stale-but-active degradation should default toward recover rather than corruption-style caution.

### 13.4 Noise-case outcome
The representative noise case remained predominantly **caution**, with some recover occupancy and almost no exploit occupancy.

Observed summary shape:

- caution fraction dominated,
- recover fraction remained secondary,
- exploit fraction remained near zero,
- caution and recover-from-caution triggers both appeared.

This is consistent with the intended corruption-side semantics: noise-heavy misleadingness should bias toward caution rather than toward a recover-dominant interpretation.

### 13.5 Overall validation read
The combined result was encouraging:

- the truthfulness fix solved a real under-reporting seam,
- the compact-controller refinement remained modest,
- healthy cases stayed healthy,
- delay cases remained recover-biased,
- noise cases remained caution-biased.

The main residual observation is simply that exploit re-entry remains conservative in the tested impaired runs, which is acceptable for this checkpoint and should be kept on later validation radar rather than treated as a Subgoal I failure.

---

## 14. Suggested success criteria

Subgoal I should be considered successful if:

- one bounded usefulness-facing improvement is achieved,
- H’s cleaned surface remains intact,
- the compact usefulness path remains interpretable,
- any truthfulness cleanup made is clearly justified and reflected in verification,
- and the next subgoals can proceed without needing to reopen H’s classification work.

A strong success outcome would be:

- the next discussion can describe v0.2 as having
  - a cleaner surface after H,
  - and one additional disciplined usefulness continuation step after I.

Subgoal I now meets that standard.

---

## 15. Warning signs that were avoided

Subgoal I would have been drifting or unsuccessful if:

- it turned back into another general cleanup subgoal,
- it quietly re-expanded the user-facing surface,
- it blurred the distinction between compact usefulness and broader regime-management without explicit justification,
- or it changed multiple controller layers at once in a way that became hard to audit.

It also would have been weak if it solved only cosmetic reporting issues without any real controller-facing value.

The implemented version avoided those warning signs:

- it kept the surface stable,
- it fixed a genuine truthfulness seam,
- and it paired that fix with one real compact-controller refinement.

---

## 16. Relationship to later v0.2 steps

Subgoal I is not expected to conclude v0.2 by itself.

Instead, it prepares the way for the remaining disciplined steps to a v0.2 release.

A plausible path after I remains:

### 16.1 Subgoal J — boundary decision or consolidation direction
Decide whether:

- the compact usefulness scaffold and regime-management layer remain clearly separate through the rest of v0.2,
- or whether a limited, principled bridge is now justified.

This should still avoid grand unification unless the code and semantics clearly support it.

### 16.2 Subgoal K — modest router structure cleanup
Once the controller direction is clearer, perform a contained internal cleanup of `backend/api/routers/operational.py`:

- better helper locality,
- cleaner grouping of state-machine logic,
- cleaner summary/series packing boundaries,

but still no uncontrolled rewrite.

### 16.3 Subgoal L — audit and validation hardening
Strengthen the final v0.2 validation story:

- representative presets,
- summary consistency checks,
- controller-identity audit checks,
- and explicit confirmation that the final surface is explainable and reproducible.

### 16.4 Subgoal M — v0.2 freeze and release packaging
Prepare the v0.2 release checkpoint:

- finalize the control surface,
- clean remaining naming/documentation rough edges,
- ensure the design-note sequence tells a coherent story,
- and produce the final branch/tag/release framing for the v0.2 endpoint.

These future steps remain intentionally brief here. Their purpose in this note is only to show that I is one continuation step inside a larger disciplined path to a v0.2 release.

---

## 17. Relationship to future refactor work

This note does **not** propose a full refactor of:

- `backend/api/routers/operational.py`

That remains on radar, but only after controller direction is clearer. If later work includes code cleanup, it should remain local and behavior-supporting until the post-I controller direction is more settled.

---

## 18. Implementation touchpoints

The implemented touchpoints for Subgoal I were:

- `backend/api/routers/operational.py`
- `docs/design/v0_2_09_subgoal_i_usefulness_continuation.md`

Frontend files were reviewed in the Subgoal I framing, but no designer or visualizer changes were required for the bounded implementation that was actually taken.

This is consistent with I being primarily behavior-facing rather than surface-facing.

---

## 19. Recommended freeze interpretation

Subgoal I should be frozen as:

- a **small but real** usefulness continuation checkpoint,
- preserving H’s cleaned surface,
- refining compact usefulness behavior in one bounded place,
- and correcting one meaningful audit/reporting truthfulness seam.

That is a satisfactory and disciplined endpoint for this subgoal.

---

## 20. Short summary

Subgoal I is the controller-facing continuation step after Subgoal H. Its purpose was to continue usefulness-oriented development from the cleaner v0.2 surface without reopening broad alignment questions or prematurely merging controller families. In its implemented form, Subgoal I made one bounded usefulness-scaffold refinement by tightening exploit re-entry on the `usefulness_proto` path, and one small truthfulness correction by recomputing `regime_mechanism_audit_available` from actual emitted mechanism-audit content rather than from an early/default configuration state. Validation on ideal, delay, noise, and active regime-management cases indicated that the compact usefulness path remained interpretable, H’s surface-discipline gains remained intact, and the audit flag now behaved more faithfully. Subgoal I therefore serves as a credible controlled continuation checkpoint on the way to later v0.2 validation, cleanup, and release.