# AWSRT v0.5 Subgoal 03: Bounded Batch Sweep of the Usefulness Family

**Status:** Draft design note  
**Applies to:** `v0.5-subgoal-03`  
**Suggested file:** `docs/design/v0_5_03_usefulness_family_bounded_batch_sweep.md`  
**Purpose:** Extend the bounded transformed real-fire usefulness-family validation from curated hand-inspected cases into a modest analysis-batch sweep so AWSRT can test whether the exploit / recover / caution reading survives a somewhat broader real-fire slice without losing scientific readability.

---

## 1. Purpose of this note

This note defines AWSRT v0.5 Subgoal 03.

AWSRT v0.5 Subgoal 02 treated the compact usefulness triad as a real bounded scientific family and validated it across a disciplined transformed real-fire extract.

That was an important threshold.

The usefulness family now appears strong enough that the next question is no longer whether a few curated windows can be read convincingly by hand. The next question is whether that reading survives a modest increase in coverage when the same family is pushed through a broader but still bounded batch-style slice.

This note defines that next step.

---

## 2. Why this subgoal is needed

Subgoal 02 established bounded family credibility, but it remained intentionally small and inspection-oriented.

That was the right choice for first validation, but it leaves an important gap.

A family can look coherent across a carefully curated extract and still weaken when exposed to a somewhat broader collection of windows. If AWSRT is going to continue treating the usefulness triad as a genuine scientific line, then it should now be tested under a modest increase in coverage.

The next question is therefore:

> does the usefulness-family reading remain stable enough when evaluated through a small bounded batch sweep, rather than only through manually assembled validation extracts?

That is the purpose of this subgoal.

However, there is also a practical prerequisite.

At present, the main Analysis Batch and Analysis Graphic surfaces are now materially stronger than before, but the usefulness line still needs to be treated as a first-class bounded batch study rather than only as an operationally inspected family. The batch-facing study contract, sweep context packaging, figure surface, and usefulness-centered metric support now exist in a reusable enough way that this subgoal can proceed without first redesigning the analysis stack.

So this subgoal is no longer primarily about inventing an analysis surface from scratch. It is about using the now-patched batch/summary/graphic path to run the first modest widened usefulness-family sweep.

---

## 3. Core scientific question

The main question of this subgoal is:

> does the compact usefulness family preserve its intended exploit / recover / caution distinction across a broader bounded transformed real-fire slice when evaluated through lightweight batch-style comparison rather than only through hand-picked examples?

More specifically, AWSRT wants to know whether:

- healthy conditions still read mainly as exploit-facing,
- delay-heavy conditions still read mainly as recover-facing,
- noise-heavy conditions still read mainly as caution-facing,

when the validation slice is widened modestly.

A secondary workflow question is also relevant:

> can Analysis Batch and Analysis Graphic now represent the usefulness family cleanly enough that this widening is reproducible, auditable, and scientifically legible rather than manually reconstructed?

---

## 4. What has already been established

At the start of this subgoal, AWSRT should assume the following are already established unless new evidence clearly overturns them.

### 4.1 The usefulness family is live and inspectable

The compact usefulness controller path is live, behaviorally active, and visible in a truthful enough way for usefulness runs.

### 4.2 The bounded transformed real-fire validation extract was successful enough to proceed

The bounded validation slice in Subgoal 02 showed that the usefulness family can behave as a real bounded family rather than only as a local curiosity.

### 4.3 The main scientific interest is family robustness, not operationalization for its own sake

This line is not being pursued mainly to operationalize a controller surface. It is being pursued as a scientific probe of whether the delivered-information versus usefulness distinction remains legible under transformed real-fire conditions.

### 4.4 The canonical usefulness family already exists operationally

The family that Subgoal 03 should batch-express is already known:

- healthy probe,
- delay probe,
- noise probe.

This subgoal should not start by inventing a new usefulness family.

### 4.5 The patched analysis path is now good enough to support bounded usefulness-family studies

The recent patch pass established a materially improved analysis-facing path:

- `backend/api/routers/analysis.py` now emits explicit `study_semantics`, `sweep_context`, `metrics_catalog`, `metric_semantics`, policy summaries, paired win-rate packaging, and usefulness-centered metric catalog entries;
- `frontend/app/analysis/graphic/page.tsx` now reads `primary_sweep_key`, `sweep_kind`, usefulness-centered metric family hints, and uses the summary artifact as the canonical study-level reading surface;
- `frontend/components/analysis/figures/FigureStudio.tsx` and the D1/D2/D3 figure components now support sweep-aware labels, usefulness-facing tradeoff context text, and summary-only figure generation without CSV scanning;
- `frontend/app/analysis/batch/page.tsx` already has the study-preset / sweep-preset pattern needed to add a bounded usefulness-family study without page redesign.

This does **not** mean the usefulness study surface is complete. It means the infrastructure is now sufficiently aligned that the next step can be an actual bounded sweep rather than another purely structural cleanup.

---

## 5. Scope of this subgoal

This subgoal remains bounded and disciplined.

It **is**:

- a modest analysis-batch expansion,
- a usefulness-family robustness check,
- a family-level comparison step,
- a bounded transformed real-fire sweep,
- and a bridge from curated validation toward broader scientific confidence.

It is **not**:

- a large-scale campaign,
- a full parameter sweep,
- a controller redesign,
- a usefulness/regime unification effort,
- or a thesis-packaging step.

---

## 6. Main objective

The main objective is to move from:

- **curated bounded family validation**

to:

- **bounded batch-supported family validation**.

In practice, this now means:

1. expressing the usefulness family cleanly through Analysis Batch study/preset semantics;
2. running a modest widened transformed real-fire sweep using the already-patched analysis contract;
3. reading the results through batch tables, summary artifacts, and the figure surface without collapsing the scientific question into generic plotting.

---

## 7. Scientific role of this subgoal

This subgoal plays an important methodological role.

Subgoal 02 asked whether the usefulness family could be validated by disciplined close reading.

Subgoal 03 asks whether that reading still survives when the same family is exposed to a somewhat wider set of windows and summarized in a slightly more aggregate way.

This is therefore the first step where AWSRT begins to test whether the usefulness-family story scales at all beyond hand inspection, while still staying bounded enough that failures remain diagnosable.

It is also the first step where the newly strengthened `ana-*` summary artifact path is asked to carry a usefulness-family scientific burden rather than only baseline, regime, or impairment studies.

---

## 8. Recommended experimental form

### 8.1 Keep the usefulness-family probes fixed

The canonical usefulness-family probes should remain the same:

- healthy probe,
- delay probe,
- noise probe.

Do not introduce additional usefulness-family presets unless the sweep itself reveals a very specific missing case that cannot otherwise be interpreted.

### 8.2 Expand through window coverage, not controller variation

The main expansion in this subgoal should come from applying the same family across a somewhat broader set of bounded transformed real-fire windows.

The point is not to multiply controller variants.

The point is to ask whether the same family reading remains visible across more windows.

### 8.3 Use analysis batch, but keep it bounded

This is the natural point to use the Analysis Batch surface.

However, the batch should remain modest and curated enough that the results can still be inspected directly if needed.

This is not the stage for brute-force breadth.

### 8.4 Reuse the patched summary/graphic path rather than building a second reporting lane

The preferred path is:

- Batch creates the study,
- `analysis.py` writes the summary artifact,
- Graphic and Figure Studio read directly from that summary artifact,
- Raw remains the audit surface when row-level inspection is needed.

Do not create a separate usefulness-only reporting mechanism unless the existing summary contract proves insufficient.

---

## 9. Concrete Analysis Batch shape

Using the current `frontend/app/analysis/batch/page.tsx`, the right shape is small and local.

### 9.1 Extend the batch semantic enums minimally where still needed

If not already present in the current branch, add usefulness-facing entries alongside the current study semantics.

Suggested additions:

- to `StudyFamily`:
  - `usefulness_family_compare`
  - optionally `usefulness_diagnostic`

- to `ComparisonAxis`:
  - `usefulness_family`

- to `StudyPresetId`:
  - `usefulness_family_main`
  - optionally `usefulness_family_diagnostic`

- to `PresetId`:
  - `usefulness_family`

The preferred first pass is the compact family bundle, not many separate usefulness ids.

### 9.2 Add a small usefulness preset helper

Add a helper analogous to the existing regime helper pattern.

For example:

- `usefulnessOverridesForProbe("healthy" | "delay" | "noise")`

Its purpose should be to return the minimal override bundle needed to convert the shared base manifest into one canonical usefulness-family member.

At minimum this should set:

- `network.policy = "usefulness_proto"`

and then apply the appropriate impairment-side settings for the chosen family member, while preserving the base context.

### 9.3 Add one compact sweep preset

Add a new `SWEEP_PRESETS` entry shaped like:

- `id: "usefulness_family"`
- label similar to `Usefulness family: healthy vs delay vs noise`

with three cases:

- `healthy`
- `delay`
- `noise`

Each case should use `usefulnessOverridesForProbe(...)`.

The important point is that the case labels should remain scientifically readable and should map naturally into the batch `sweep_context` and figure x-axis labeling now supported by the patched analysis surfaces.

### 9.4 Add one top-level study preset

Add at least one `STUDY_PRESETS` entry:

- `usefulness_family_main`

with semantics approximately like:

- `studyFamily: "usefulness_family_compare"`
- `comparisonAxis: "usefulness_family"`
- `comparisonTier: "main"`
- `chooseBestBy`: a justified metric, likely `mean_entropy_auc`
- policies: only `usefulness_proto`
- presetId: `"usefulness_family"`
- label: `Usefulness family bounded comparison`

A second diagnostic preset is optional but not required to begin.

### 9.5 Keep participating policies narrow

For usefulness-family studies, the policy set should not include baseline or regime families.

It should be just:

- `usefulness_proto`

The family contrast is carried by the sweep cases, not by changing policy.

This is different from baseline or regime-family studies and should be explicit in the preset.

---

## 10. Suggested sweep shape

A suitable form for this subgoal would be:

- a modest set of transformed real-fire contexts,
- each evaluated under the three canonical usefulness-family probes,
- summarized through batch tables, summary artifacts, and compact figure outputs.

The exact count can remain flexible, but the sweep should be large enough to test family stability and small enough to remain intelligible.

A good target is not “as many as possible.”  
A good target is “enough to test whether the family story survives broader contact.”

A sensible workflow is:

1. add or verify the compact usefulness-family batch preset;
2. verify it reproduces the already known family behavior on a trusted context;
3. widen to a modest transformed real-fire batch;
4. inspect summary tables, figure outputs, and flagged cases.

---

## 11. What should be measured

The core measurements should remain the compact usefulness outputs already exposed by the system and now carried through the batch summary contract.

### 11.1 Primary family-reading outputs

Primary variables:

- `usefulness_regime_state_last`
- `usefulness_regime_state_exploit_frac`
- `usefulness_regime_state_recover_frac`
- `usefulness_regime_state_caution_frac`

These remain the main semantic outputs.

### 11.2 Trigger-behavior support

Supporting variables:

- `usefulness_trigger_recover_hits`
- `usefulness_trigger_caution_hits`
- `usefulness_trigger_recover_from_caution_hits`
- `usefulness_trigger_exploit_hits`

These help interpret why a family member reads as exploit-, recover-, or caution-facing.

### 11.3 Optional supporting operational context

Where useful, it is acceptable to retain supporting metrics that help interpret family behavior, such as:

- `ttfd`
- belief-quality summaries
- delivered-information summaries
- coverage/support summaries

However, these should remain supporting context rather than replacing the usefulness-family reading itself.

The central question here is still usefulness-family semantics.

### 11.4 Use usefulness-centered metric packaging where available

Because `backend/api/routers/analysis.py` now exposes a usefulness-centered metric family inside the summary artifact, Analysis Graphic and Figure Studio can treat usefulness metrics as a recognized family rather than as accidental extra fields.

That is helpful for interpretive coherence, but it does **not** change the scientific burden: the usefulness-family reading still has to survive the widened sweep.

---

## 12. What should be compared

This subgoal should support comparison along two axes.

### 12.1 Within-context family comparison

For each context/window, compare:

- healthy,
- delay,
- noise

to see whether the expected exploit / recover / caution separation remains recognizable.

### 12.2 Same-family cross-context comparison

For each family member, compare it across contexts.

This matters because a useful family is not only separable within one context; it should also show a recognizable role across multiple contexts.

### 12.3 Study-level tradeoff reading as supporting context

The patched tradeoff figure surface can now express a bounded usefulness-style comparative reading across studies and cases.

That is useful as supporting context, especially for:

- `ttfd` vs `mean_entropy_auc`,
- `ttfd` vs delivered-information proxies,
- or similar compact study-level tradeoff views.

But that figure should remain a support tool, not a replacement for the family-semantic reading.

---

## 13. Recommended reporting style

The reporting style should remain compact and auditable.

A good form would include:

- batch summary tables,
- context-by-family comparison tables,
- same-family cross-context tables,
- one or two compact figure outputs from Figure Studio,
- and a shortlist of flagged ambiguous or interesting runs for manual inspection.

Do not overbuild the reporting surface.

The point is to support scientific judgment, not to produce a polished release artifact.

Because the summary artifact and figure surface are now stronger, this reporting can lean more heavily on:

- `summary.json`,
- `Analysis · Graphic`,
- `Figure Studio`,
- and `Analysis · Raw` for audit.

That is preferable to ad hoc post-processing unless a gap appears.

---

## 14. What should count as success

This subgoal should count as successful if the bounded batch sweep shows that:

- healthy runs are usually exploit-facing,
- delay runs are usually recover-facing,
- noise runs are usually caution-facing,
- and the usefulness-family reading remains visible across a broader transformed real-fire slice than in Subgoal 02.

Success does **not** require perfect purity or zero ambiguous cases.

It requires that the family still looks like a real bounded family under modest widening.

It also requires that Analysis Batch and the summary artifact path can now express the usefulness family cleanly enough that the sweep is reusable and not dependent on ad hoc reconstruction.

---

## 15. What should count as partial success

Partial success would mean:

- the triad reading survives in many contexts,
- some contexts show compression or role ambiguity,
- but the ambiguous cases remain interpretable,
- and the overall family story still looks more real than accidental.

That outcome would still be scientifically valuable.

Another partial-success form would be:

- the usefulness-family batch preset layer works cleanly,
- the sweep runs cleanly through the patched summary/graphic path,
- but the widened slice shows enough ambiguity that one more bounded semantics or audit-support step is justified before further widening.

---

## 16. What should count as failure

Failure would mean something stronger than a few messy runs.

It would mean that, under modest batch broadening:

- healthy frequently loses exploit-facing identity,
- delay frequently collapses into caution in a way that weakens the stale-but-restorable reading,
- noise frequently loses its corruption-like caution reading,
- or the family becomes too inconsistent to interpret as a meaningful scientific structure.

It would also count as a workflow failure if the usefulness family still cannot be represented in Analysis Batch and the summary artifact path without awkward manual reconstruction or misleading semantics.

If that happens, AWSRT should not simply broaden further. It should stop and decide whether one more bounded semantic refinement or audit-enrichment step is needed.

---

## 17. Recommended workflow stance

This subgoal should begin with **batch-surface alignment plus validation through Analysis Batch**, not with controller edits.

That means the default order should be:

1. add or verify a small usefulness-family preset/helper surface in `frontend/app/analysis/batch/page.tsx`;
2. verify that it matches the canonical operational usefulness-family intent closely enough;
3. define the bounded sweep;
4. run the sweep;
5. inspect the summary artifacts, figure outputs, and flagged cases;
6. decide whether the family remains stable enough;
7. only then decide whether any refinement is justified.

Controller changes should be evidence-driven, not assumed in advance.

---

## 18. Files likely involved

This subgoal is expected to be mainly analysis-facing.

Likely touched surfaces may include:

- this design note,
- `frontend/app/analysis/batch/page.tsx`,
- `frontend/app/analysis/graphic/page.tsx` only if a small usefulness-reading gap appears,
- `frontend/components/analysis/figures/FigureStudio.tsx` or the D1/D2/D3 figure components only if a very small labeling or interpretation gap appears,
- temporary or git-ignored results tables,
- and lightweight extraction or summarization scripts if needed.

Backend controller changes should not be assumed at the start.

---

## 19. What should not change in this subgoal

### 19.1 Do not broaden into a large generic sweep

The sweep should remain bounded and usefulness-focused.

### 19.2 Do not introduce many new usefulness variants

Keep the family fixed unless evidence strongly demands otherwise.

### 19.3 Do not merge usefulness with regime management

The compact usefulness layer and the broader regime layer should remain conceptually separate.

### 19.4 Do not jump into thesis packaging yet

This step is still about scientific testing, not chapter production.

### 19.5 Do not turn the batch update into a major page redesign

The usefulness-family additions should fit the current `SWEEP_PRESETS` / `STUDY_PRESETS` pattern.

### 19.6 Do not mistake analysis-surface improvement for scientific confirmation

The fact that the summary artifact and figure surface are now more legible does **not** itself validate the usefulness family. It only makes the next validation step cleaner and more reproducible.

---

## 20. Expected result of this subgoal

If this subgoal succeeds, AWSRT should emerge with a stronger position than after Subgoal 02.

It should be able to say not merely that the usefulness family works in a curated bounded extract, but that it remains scientifically legible under a modest bounded batch widening of transformed real-fire conditions.

It should also have a small reusable Analysis Batch path that expresses the usefulness family honestly and reproducibly, and a summary/figure surface that can present that study without falling back immediately to row-level reconstruction.

That would meaningfully strengthen the usefulness line as a scientific direction.

---

## 21. Decision boundary after this subgoal

After this bounded batch sweep, AWSRT should decide among three main outcomes.

1. **The usefulness family remains stable under modest widening**  
   Continue deeper into the usefulness line with increased confidence.

2. **The usefulness family remains promising but shows recurrent edge-case ambiguity**  
   Add one bounded follow-up step focused on semantic clarification or audit support.

3. **The usefulness family weakens materially when widened**  
   Pause broader usefulness claims and reassess the line before expanding further.

At present, the most likely expectation is the first or second outcome.

---

## 22. Surface-alignment note: current backend/schema status

The current v0.5 surface is only partially aligned, and this should remain explicitly on the radar during Subgoal 03.

Current backend inspection confirms that the compact usefulness triad remains a live router-local controller path, with recover / caution / exploit thresholds still defined and applied directly inside `backend/api/routers/operational.py`.

By contrast, the broader regime-management surface is only partially manifest-authoritative:

- the router **does** read and apply `downshift_thresholds`, `switch_to_certified_thresholds`, `recovery_thresholds`, and `recovery_support`;
- the schema in `backend/awsrt_core/schemas/operational.py` now declares additional blocks such as `active_downshift_support` and `active_downshift_thresholds`;
- but the live active-downshift logic in `backend/api/routers/operational.py` still relies materially on router-local constants such as `ACTIVE_DOWNSHIFT_*` and `ACTIVE_CORRUPTION_*`, rather than being fully driven by those newer schema blocks.

In that sense, the declared schema surface still overstates full controller externalization.

This does **not** block Subgoal 03, because Subgoal 03 is usefulness-family batch validation rather than regime-management externalization. But it does matter for honesty of interpretation:

- the usefulness path remains a compact live backend-led path;
- the regime path remains partly manifest-driven and partly router-local;
- and these should not be described as equally externalized controller surfaces.

So, for this subgoal, AWSRT should proceed with the usefulness-family sweep while keeping this mismatch visible as background technical debt rather than conflating it with the usefulness-family scientific question.

---

## 23. Immediate practical stance for this subgoal

Given the current patch state, the immediate practical stance should be:

1. do **not** spend more time on structural grep-level cleanup unless testing reveals a concrete gap;
2. move directly into bounded sweep execution;
3. use the patched summary and figure surfaces as the first reading path;
4. fall back to Raw and direct run inspection only for ambiguous or flagged cases;
5. keep notes on whether the usefulness-family preset surface feels honest, minimal, and reproducible.

That is the right next step for v0.5 Subgoal 03.