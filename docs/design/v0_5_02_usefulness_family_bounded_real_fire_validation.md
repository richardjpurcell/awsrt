# AWSRT v0.5 Subgoal 02: Bounded Real-Fire Validation of the Usefulness Family

**Status:** Completed bounded validation design note  
**Applies to:** `v0.5-subgoal-02`  
**Suggested file:** `docs/design/v0_5_02_usefulness_family_bounded_real_fire_validation.md`  
**Purpose:** Define and now close the bounded AWSRT v0.5 step that treated the usefulness triad as a real scientific family and validated it across a small but disciplined transformed real-fire slice.

---

## 1. Purpose of this note

This note defines and closes AWSRT v0.5 Subgoal 02.

AWSRT v0.5 Subgoal 01 established three important things.

First, the compact usefulness triad is now presented more truthfully in the designer and visualizer as a live compact layer rather than being visually conflated with the broader regime-management layer.

Second, the visualizer/designer now display usefulness summaries and traces only when the run is actually a usefulness run.

Third, the bounded delay-side refinement improved the semantic balance of the compact usefulness controller enough that the intended triad reading appeared to hold across the initially checked transformed real-fire windows:

- healthy conditions read primarily as **exploit**,
- delay-heavy conditions read primarily as **recover**,
- noise-heavy conditions read primarily as **caution**.

That meant AWSRT had crossed an important threshold.

The usefulness triad should no longer be treated only as a tiny local diagnostic curiosity. It should be treated as a bounded but real scientific family worth validating more deliberately across transformed real-fire conditions.

This note defined that next step. That step has now been carried out in a bounded form and is ready to be closed.

---

## 2. Why this subgoal was needed

Subgoal 01 was deliberately narrow.

Its role was to determine whether the usefulness triad could become both:

- **truthfully inspectable**, and
- **semantically credible**

on transformed real-fire runs.

That question was answered positively enough to justify a broader but still controlled next step.

The next question was no longer:

> can the usefulness triad be seen at all?

It became:

> does the usefulness triad remain scientifically legible as a bounded family across a modest real-fire validation slice, rather than only across a few hand-checked probes?

That is the question this subgoal addressed.

---

## 3. Core scientific question

The main question of this subgoal was:

> does the compact usefulness family preserve the distinction between healthy, stale-but-restorable, and corruption-like information conditions across a bounded but nontrivial transformed real-fire slice?

In practical terms, the question was whether the usefulness-family reading remained recognizable across multiple bounded real-fire windows, not just one or two carefully chosen examples.

That question has now been answered **positively, but not uniformly**.

---

## 4. What had already been established at the start

At the start of this subgoal, AWSRT assumed the following were already established and not to be re-litigated unless a new failure appeared.

### 4.1 The compact usefulness layer is live

The usefulness controller path through `network.policy="usefulness_proto"` is live and behaviorally active.

### 4.2 The frontend truthfulness problem had been sufficiently improved

The designer and visualizer now present the usefulness layer more honestly and avoid incorrectly showing usefulness summaries for non-usefulness runs.

### 4.3 The first semantic stabilization had succeeded well enough to proceed

The bounded delay-side refinement produced a more credible stale-versus-corrupt separation:

- healthy → exploit,
- delay → recover,
- noise → caution.

This was not proof of finality, but it was enough to justify broader bounded validation.

---

## 5. Scope of this subgoal

This subgoal remained intentionally bounded.

It **was**:

- a usefulness-family validation step,
- a bounded transformed-real-fire scientific slice,
- a legibility and robustness check,
- and a family-level comparison step.

It **was not**:

- a broad controller redesign,
- a usefulness/regime merge,
- a large preset explosion,
- a wide hyperparameter sweep,
- or a claim that the usefulness family is final or universal.

That scope discipline should be preserved in how this subgoal is now closed.

---

## 6. Main objective

The main objective was to move from:

- **three canonical usefulness probes**

to:

- **a small bounded usefulness-family validation bundle**,

while preserving scientific readability.

In other words, AWSRT was to test whether the usefulness family still told the same story when subjected to a modest increase in window diversity.

That objective has been met well enough to close the subgoal.

---

## 7. What was to be validated

The usefulness family was validated along the following dimensions.

### 7.1 Semantic consistency

The family was expected to continue to support the intended mapping:

- **healthy / low impairment** → exploit-facing
- **delay-heavy / stale-but-active** → recover-facing
- **noise-heavy / corruption-like** → caution-facing

This did not require perfect purity. It required recognizable dominant reading.

### 7.2 Cross-window robustness

The family was expected to remain interpretable across more than one transformed real-fire window.

The main risk here was not outright controller failure, but semantic collapse or drift:

- delay drifting back toward caution,
- healthy drifting into unstable recover/caution cycling,
- or noise drifting toward recover in a way that weakens the corruption-like reading.

### 7.3 Inspectability

Even where the family was imperfect, the reason was expected to remain visible enough in current usefulness summaries and traces that AWSRT could tell what was happening without immediately needing a new large audit surface.

---

## 8. Experimental form used

### 8.1 The usefulness family remained compact

No large new usefulness preset expansion was introduced.

The canonical usefulness-family probes remained:

- healthy probe,
- delay probe,
- noise probe.

### 8.2 Expansion occurred across windows, not controller variants

The first expansion was in **window diversity**, not in controller diversity.

That meant:

- the same usefulness presets were retained,
- they were applied to a modest curated set of bounded transformed real-fire windows,
- and resulting usefulness-state occupancies and trigger behavior were compared.

### 8.3 The slice remained bounded

The validation bundle remained small enough to inspect directly and interpret without broad automation-heavy reporting.

That boundedness is important to preserve in the scientific reading of the result.

---

## 9. Validation structure used

The bounded validation bundle consisted of:

- a small number of fire cases,
- a small number of bounded windows/origins,
- and the three canonical usefulness probes applied to each.

The spirit remained:

- more than a single anecdotal case,
- less than a broad brute-force batch campaign.

The point was to test semantic stability, not to maximize run count.

---

## 10. Measurements used

The most important measurements remained the compact usefulness outputs already exposed by the system.

### 10.1 Primary usefulness-family outputs

Primary reading variables:

- `usefulness_regime_state_last`
- `usefulness_regime_state_exploit_frac`
- `usefulness_regime_state_recover_frac`
- `usefulness_regime_state_caution_frac`

These were the main family-level semantic outputs.

### 10.2 Trigger summaries

Useful supporting summaries:

- `usefulness_trigger_recover_hits`
- `usefulness_trigger_caution_hits`
- `usefulness_trigger_recover_from_caution_hits`
- `usefulness_trigger_exploit_hits`

These helped interpret why a run occupied a given usefulness regime.

### 10.3 Step-level interpretive support

Where needed, bounded neighborhoods around state changes were inspected using step-level fields such as:

- `recent_obs_age_mean_valid`
- `recent_misleading_activity_pos_frac`
- `recent_driver_info_true_mean`
- `arrivals_frac`
- `misleading_activity`
- usefulness trigger booleans
- usefulness counters

These were not treated as a large aggregate reporting surface, but they were important for diagnosing ambiguous cases.

---

## 11. Extraction/reporting style used

This subgoal favored lightweight, auditable extracts rather than overbuilt reporting machinery.

The extraction style was intentionally simple:

- per-run summary fields,
- state-change indices,
- bounded neighborhoods around usefulness-state changes,
- and cross-run comparison tables.

That was sufficient for this validation step.

This remained a scientific validation slice, not yet a polished release artifact.

---

## 12. What should count as success

This subgoal was to count as successful if the bounded usefulness-family slice showed that, across the chosen windows:

- healthy runs were usually exploit-dominant or clearly exploit-facing,
- delay runs were usually recover-dominant or clearly recover-leaning,
- noise runs were usually caution-dominant,
- and deviations remained interpretable rather than opaque.

The bar was **scientific legibility**, not perfection.

---

## 13. What should count as partial success

Partial success was expected to look like this:

- the intended triad reading holds in many but not all windows,
- some windows show compression or ambiguity,
- but the ambiguity is still interpretable through existing usefulness summaries and traces.

That outcome would still justify continuing the usefulness line, though perhaps with one more bounded refinement or audit-enrichment step.

This is the category into which Subgoal 02 now falls.

---

## 14. What should count as failure

Failure in this subgoal was never meant to mean that a single run looked imperfect.

Failure would have meant something stronger, such as:

- delay regularly collapsing back into caution across many windows,
- healthy regularly failing to remain exploit-facing,
- or the usefulness-family readings becoming too inconsistent or too opaque to interpret as a real family.

That stronger failure did **not** occur in this validation slice.

---

## 15. What was actually found

The bounded validation slice produced a clear overall result.

### 15.1 Main finding

The compact usefulness family appears to survive bounded transformed real-fire validation as a **real but not universal** scientific family.

Across the checked contexts, the intended family reading remained largely visible:

- **healthy** was generally exploit-facing,
- **delay** was generally recover-facing,
- **noise** was often caution-facing.

This is enough to treat the usefulness line as scientifically substantive rather than merely anecdotal.

### 15.2 Stronger parts of the result

The strongest parts of the family reading were:

- **healthy → exploit**, which remained recognizable across contexts even when some healthy runs showed moderate recover/caution occupancy,
- and **delay → recover**, which appeared especially robust.

The delay-side refinement should therefore be read as having held up well enough under this bounded real-fire expansion.

### 15.3 Boundary case exposed by this subgoal

The main limitation exposed by the validation slice was on the **noise side**.

Most notably, one context showed a noise run that remained strongly **recover-occupied** rather than becoming clearly **caution-dominant**. More generally, the validation bundle showed that the expected noise → caution mapping is not uniformly guaranteed across all bounded transformed real-fire contexts.

This did not make the usefulness family unreadable. It did, however, identify the main boundary question that now deserves its own subgoal.

### 15.4 Interpretability of the deviations

Importantly, the deviations were still inspectable.

The state fractions, trigger counts, and bounded state-change neighborhoods were sufficient to reveal that the issue was not a generic collapse of the usefulness line. Instead, it was a more specific instability or context-dependence in the corruption-like/noise-side separation.

That means the family remains scientifically usable, but not yet fully stabilized.

---

## 16. Interpretation of the result

This subgoal should be read as a **bounded validation success with a meaningful exception**.

The correct interpretation is not:

> the usefulness family is final and uniformly stable.

It is also not:

> the usefulness family failed under real-fire validation.

Instead, the correct reading is:

> the usefulness family remains scientifically legible across a bounded transformed real-fire slice, with healthy and delay appearing relatively robust, while noise-side caution separation shows at least one important context-dependent boundary case.

That is a strong enough outcome to close the subgoal and continue the usefulness line.

---

## 17. What should not change because of this result

### 17.1 Do not broaden the controller surface yet

This result does not justify wiring the richer usefulness manifest surface into full controller authority.

### 17.2 Do not unify usefulness and regime layers

The usefulness layer and regime-management layer should remain distinct.

### 17.3 Do not immediately launch a large broad batch campaign

The key scientific issue is now already visible. A large undirected sweep would likely produce volume before sharpening explanation.

### 17.4 Do not overfit the controller inside this subgoal

The main job of this subgoal was validation, and that job has been completed. The newly exposed anomaly should be handled in a separate bounded follow-on subgoal.

---

## 18. Expected result of this subgoal

If this subgoal succeeded, AWSRT was expected to emerge with a stronger scientific claim:

- not that the usefulness triad is final,
- but that it behaves as a **real bounded family** on transformed real-fire conditions,
- preserving the exploit / recover / caution distinction in a meaningful and inspectable way.

That result has now been achieved, with the important qualification that the noise-side caution reading is not yet uniformly stable across all checked contexts.

---

## 19. Final disposition of Subgoal 02

Subgoal 02 should now be considered **complete and ready to freeze**.

It should be closed as:

- a **successful bounded family-validation step**,
- a **partial but scientifically meaningful confirmation** that the usefulness triad survives contact with transformed real-fire conditions,
- and a **clean handoff point** to a new subgoal focused specifically on the boundary case exposed here.

The key output of this subgoal is therefore twofold:

1. **confirmation** that the usefulness family is scientifically real enough to continue,
2. **localization** of the next important question to the noise-side separation boundary.

---

## 20. Decision boundary after this subgoal

After this bounded usefulness-family validation slice, AWSRT should decide among three main outcomes.

1. **The usefulness family is stable enough to continue directly**  
   Proceed into a deeper usefulness-family phase with modest confidence.

2. **The usefulness family is promising but still uneven**  
   Add one more bounded clarification step, likely in boundary characterization, audit enrichment, or semantics refinement.

3. **The usefulness family is not yet stable enough across windows**  
   Reassess whether the compact usefulness line needs more foundational clarification before broader use.

The correct reading after Subgoal 02 is the **second**.

The usefulness family is promising and scientifically real enough to continue, but still uneven at an important boundary. The next v0.5 subgoal should therefore focus on the specific question exposed here:

> under what bounded transformed real-fire conditions does the expected noise → caution separation fail or compress into recover-like behavior?

That is the right next step, and it should be handled as a new subgoal rather than by continuing to extend this one.