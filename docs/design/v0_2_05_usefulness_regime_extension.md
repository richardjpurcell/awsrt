# AWSRT v0.2 Usefulness Regime Extension

**Status:** Draft design note  
**Applies to:** `v0.2-subgoal-e`  
**Purpose:** Define the next disciplined controller step after Subgoal D by extending the current two-state usefulness-aware prototype into a slightly richer, still-auditable usefulness-regime controller.

---

## 1. Scope

This note defines **Subgoal E** for AWSRT `v0.2`: extending the currently validated usefulness-aware controller beyond the minimal two-state exploit/caution prototype used in Subgoal D.

The purpose of Subgoal E is **not** to redesign AWSRT broadly, and it is **not** to jump immediately to a fully elaborate controller architecture. Its purpose is narrower:

- preserve what Subgoal D has already validated,
- address the main limitations of the current two-state prototype,
- introduce one disciplined next-step regime extension,
- and keep the resulting controller interpretable, auditable, and experimentally manageable.

This note follows three earlier design notes:

- `docs/design/operational_usefulness_diagnostics_v0_2.md`
- `docs/design/usefulness_aware_control_v0_2.md`
- `docs/design/usefulness_validation_v0_2.md`

Together, those notes established:
- a first usefulness-diagnostic layer,
- a first exploit/caution control bridge,
- and a compact first-pass validation of that bridge.

Subgoal E begins **after** that validation checkpoint.

It does **not** define:
- a final paper-ready controller,
- a final theorem-linked operational policy,
- a full v0.2 study campaign,
- or a large family of regime-management variants.

It defines the next compact controller step.

---

## 2. Motivation

Subgoal D established a useful and important first result:

- ideal runs remain exploitative,
- delay-heavy runs become caution-dominant for staleness-driven reasons,
- noise-impaired runs become caution-dominant for corruption-driven reasons,
- the same compact usefulness diagnostics remain interpretable across several fixed baselines,
- and the core qualitative story survives a limited harder-world check.

That is enough to say the current usefulness bridge is **real**.

However, Subgoal D also clarified a key limitation of the present prototype:

- the controller is still fundamentally **two-state**,
- corruption-side cases can compress into broadly similar caution occupancy,
- and the current exploit/caution split is useful for first validation but still coarse for the next design step.

In other words, Subgoal D did what it needed to do:
it showed that the usefulness-aware bridge is worth extending.

The main development question is now no longer:

> is there any interpretable usefulness-aware signal worth using?

That question has been answered in the affirmative.

The new question is:

> what is the smallest next controller extension that preserves interpretability while giving the controller a more legible internal structure than simple exploit versus caution?

Subgoal E addresses that question.

---

## 3. Development stance

Subgoal E should follow the same overall v0.2 development discipline already used in earlier subgoals:

- **small before broad**
- **controlled before sweeping**
- **interpretable before optimized**
- **auditable before elaborate**
- **one new mechanism at a time**

This means Subgoal E should avoid:

- immediately adding many new controller states,
- mixing several unrelated new diagnostics into one step,
- introducing a large preset taxonomy before the mechanism is clear,
- or chasing policy-performance claims before the new regime logic is readable.

Subgoal E should remain a compact design increment.

The right question is not:
> how much richer can we make the controller right away?

The right question is:
> what is the smallest regime extension that makes the controller’s response more expressive without making it harder to understand?

---

## 4. What Subgoal E is trying to improve

The current two-state prototype has already shown value. Its core limitation is not that it fails to react. Rather, its limitation is that its reaction is still too coarse.

At present, the controller mainly distinguishes:

- a healthy / exploit-like operating condition,
- versus a degraded / caution-like operating condition.

That is enough for first validation, but it leaves several operational distinctions only partially expressed.

For example:

- a run may no longer be fully healthy, but also may not yet warrant strong caution;
- a run may be emerging from caution, but not yet be ready for full exploit;
- delay-heavy and corruption-heavy cases may both be caution-dominant, even though their operational implications differ;
- the transition logic may benefit from a more explicit intermediate regime rather than a direct exploit/caution flip.

Subgoal E therefore aims to add a modest internal structure between those extremes.

The central goal is:

> retain the validated usefulness-aware logic from Subgoal D, but introduce a more expressive regime scaffold that remains compact and auditable.

---

## 5. Proposed Subgoal E controller increment

### 5.1 High-level proposal

Subgoal E should extend the current two-state exploit/caution controller into a **three-regime usefulness-aware scaffold**.

A recommended first-pass regime set is:

- **exploit**
- **recover** (or guarded / stabilization)
- **caution**

The precise naming can be adjusted, but the intended semantics should be:

- **exploit**  
  healthy, sufficiently useful operating conditions; controller can act aggressively / opportunistically

- **recover**  
  intermediate regime for partial support, stabilization, or requalification; controller is not fully healthy but is not in strong caution either

- **caution**  
  degraded usefulness conditions; controller acts conservatively because support has weakened for staleness or corruption-side reasons

This is the smallest meaningful extension beyond the current prototype.

### 5.2 Why a three-regime scaffold

A three-regime scaffold is preferable to a direct jump to a much larger controller because it offers three advantages:

1. it introduces more controller structure without overwhelming interpretability,
2. it lets the controller express intermediate support conditions explicitly,
3. it provides a better bridge to later regime-management or certified-style ideas without collapsing everything into those ideas too early.

In particular, a middle regime is useful because Subgoal D already suggested that the current two-state response may be too compressed in some corruption-side cases. A middle regime creates room for:

- partial recovery,
- guarded continuation,
- or a stabilization phase,

without forcing every non-ideal condition immediately into the strongest degraded state.

### 5.3 Recommended semantic stance for the middle regime

The middle regime should **not** be treated as a vague catch-all.

It should have a clear operational meaning. A good first-pass interpretation is:

> the controller is seeing enough weakening or uncertainty that full exploit is no longer justified, but support is not degraded enough to require full caution.

This can be described as:

- guarded exploit,
- stabilization,
- recovery,
- or intermediate support.

For v0.2, **recover** is a useful name if the regime is mainly about requalification after degraded conditions.  
**guarded** is a useful name if the regime is mainly about moderated operation under partial support.

Either can work. The important point is that the semantics must remain explicit.

---

## 6. Recommended mechanism shape

### 6.1 Reuse the existing usefulness supports first

Subgoal E should, as much as possible, reuse the already validated support quantities from Subgoal D rather than inventing a fresh signal family.

That means the new regime logic should continue to draw primarily from quantities such as:

- recent observation age support,
- recent misleadingness support,
- recent driver-information support,
- and their already established compact summaries.

This is important because Subgoal D already established that these signals are interpretable across:

- the usefulness-aware prototype,
- fixed-policy baselines,
- and a limited harder-world subset.

The controller extension should build on that validated diagnostic core.

### 6.2 Avoid overfitting to one impairment type

The new regime logic should not become:

- merely a delay detector,
- or merely a corruption detector.

It should remain usefulness-oriented.

That means the regime logic should respond to **support quality**, not only to impairment labels. Delay and corruption should still be distinguishable in interpretation, but they should influence the controller through support degradation rather than through special-case hardcoding whenever possible.

### 6.3 Keep the transition logic explicit

The Subgoal E controller should make transition logic easy to inspect.

At minimum, the controller should support plainly interpretable answers to questions like:

- why did the run leave exploit?
- why did it not go all the way to caution?
- why did it leave caution?
- why did it remain in the middle regime?
- what support quantity made the difference?

This means transition logic should favor:

- explicit thresholds,
- recent-window support conditions,
- persistence where needed,
- and clearly named regime states.

It should avoid opaque composite logic unless that composite is still easy to audit.

---

## 7. Recommended Subgoal E behavior

The controller extension should aim for the following first-pass behavioral pattern.

### 7.1 Ideal case
Expected behavior:

- mostly or entirely **exploit**
- little or no time in recover / guarded
- little or no time in caution

Interpretation:

- healthy conditions should still read as healthy
- the new middle regime must not appear merely because a middle regime exists

### 7.2 Delay-heavy case
Expected behavior:

- exploit should weaken or disappear
- the controller may pass through **recover/guarded**
- sustained degradation should still justify **caution**

Interpretation:

- the controller should still clearly recognize stale-but-active degradation
- if recovery or guarded behavior appears, it should be explainable as an intermediate stage rather than noise

### 7.3 Noise-heavy case
Expected behavior:

- exploit should weaken under corruption-side degradation
- moderate corruption may occupy **recover/guarded**
- stronger corruption may still occupy **caution**

Interpretation:

- Subgoal E should create room for a more legible corruption ladder than the current two-state compression, if possible
- but only insofar as that can be done without ad hoc over-tuning

### 7.4 Mixed case
Expected behavior:

- the regime logic should remain interpretable
- mixed degraded support may move between recover and caution depending on severity and persistence

Interpretation:

- mixed cases should not become opaque simply because multiple support channels move at once

---

## 8. Validation goals for Subgoal E

Subgoal E validation should be narrower than a full study campaign.

The first question is not:
> does the new controller outperform everything else?

The first questions are:

1. Is the three-regime logic interpretable?
2. Does the middle regime appear for understandable reasons?
3. Does it reduce the most obvious compression of the current two-state controller?
4. Does the added structure survive compact audit inspection?

These are the right validation goals for this subgoal.

---

## 9. Subgoal E validation layers

Validation should proceed in compact layers.

### 9.1 Layer 1 — mechanism sanity check
Purpose:
- verify that the new regime states exist and transition as intended in controlled runs

Questions:
- do all intended regime states appear when expected?
- does the middle regime actually mean something, or is it effectively unused?
- are transitions auditable?

### 9.2 Layer 2 — compact impairment audit
Purpose:
- compare ideal, delay-heavy, and noise-heavy cases under the new regime logic

Questions:
- does ideal remain mostly exploit?
- does delay remain clearly caution-oriented or pass through a meaningful middle regime?
- does noise now gain a more legible intermediate regime where appropriate?

### 9.3 Layer 3 — representative trace inspection
Purpose:
- inspect one representative delay run and one representative noise run in detail

Questions:
- why did the controller enter recover or caution?
- what support quantities explain the timing?
- does the middle regime improve interpretability rather than reduce it?

### 9.4 Layer 4 — compact cross-policy context
Purpose:
- compare the new Subgoal E controller against the already validated Subgoal D fixed-policy context

Questions:
- does the new regime structure still sit coherently on top of the established usefulness-diagnostic story?
- does it appear to use the diagnostic layer rather than fight it?

### 9.5 Layer 5 — limited harder-world confirmation
Purpose:
- ensure the new regime structure is not purely an artifact of the easiest geometry

Questions:
- do exploit / recover / caution remain legible under the harder-world compact subset?
- does the middle regime remain interpretable there?

---

## 10. Recommended experiment family

Subgoal E should keep a deliberately small experiment family.

### Experiment Group 1 — regime mechanism sanity check
**Purpose:** verify that the new regime logic behaves as designed.

**Recommended cases:**
- one ideal case
- one delay-heavy case
- one noise-heavy case

**Primary quantities to inspect:**
- regime state fractions
- trigger counts
- final regime state
- recent support summaries
- transition timing

### Experiment Group 2 — compact controller audit
**Purpose:** audit the new three-regime controller directly.

**Recommended controller under test:**
- Subgoal E usefulness-aware regime extension

**Recommended cases:**
- ideal
- delay = 4
- noise = 0.1
- noise = 0.2
- noise = 0.3
- optionally one mixed case

**Primary quantities to inspect:**
- exploit fraction
- recover/guarded fraction
- caution fraction
- trigger counts by regime direction
- recent age support
- recent misleadingness support
- recent driver-information support

### Experiment Group 3 — representative trace audit
**Purpose:** inspect controller causality.

**Recommended cases:**
- one representative delay run
- one representative moderate-noise run
- optionally one stronger-noise run

**Primary outputs:**
- aligned support traces
- regime-state timeline
- transition markers

### Experiment Group 4 — limited harder-world confirmation
**Purpose:** confirm that the new regime logic survives beyond the easiest geometry.

**Recommended subset:**
- ideal
- delay-heavy
- noise-heavy

**Recommended scope:**
- keep compact
- do not broaden until the simple-world controller logic is clearly validated

---

## 11. Recommended outputs

Subgoal E should produce a small and stable output set.

### 11.1 Compact regime audit table
Recommended columns:
- case
- exploit_frac
- recover_frac (or guarded_frac)
- caution_frac
- final_state
- transition counts
- recent_age_last
- recent_misleading_last
- recent_driver_info_last

### 11.2 Representative transition figure
Recommended aligned panels:
- recent age support
- recent misleadingness support
- recent driver-info support
- regime state over time
- trigger activity over time

Purpose:
- show why the controller moved among the three regimes

### 11.3 Compact comparison note
A short written synthesis explaining:
- whether the new middle regime is doing useful work,
- whether it improves interpretability,
- and whether it reduces the most obvious two-state compression

---

## 12. Success criteria

Subgoal E should be considered successful if the following hold.

### 12.1 Regime interpretability
The new regime set must remain easy to explain in operational terms.

### 12.2 Healthy-case quietness
Ideal runs should remain predominantly exploitative.

### 12.3 Intermediate-regime usefulness
The new middle regime should appear for understandable reasons and should not merely act as noise.

### 12.4 Degraded-case responsiveness
Delay-heavy and corruption-heavy cases should still move away from exploit in a way that matches the support signals.

### 12.5 Compactness
The new controller should still be understandable through compact audit tables and representative traces.

### 12.6 Incremental value
Subgoal E should provide a real improvement over the Subgoal D two-state controller, either by:
- improving interpretability,
- reducing compression,
- or clarifying transition structure.

---

## 13. Failure conditions / warning signs

Subgoal E should be treated as incomplete if one or more of the following occurs:

- ideal runs spend substantial unexplained time outside exploit,
- the new middle regime appears frequently but cannot be interpreted,
- delay and noise become less distinguishable than they were in Subgoal D,
- the new logic requires many ad hoc exceptions,
- the extra regime adds complexity without adding explanatory value,
- or the traces become harder, not easier, to read.

These would indicate that the extension is not yet a useful improvement over the Subgoal D checkpoint.

---

## 14. Non-goals

Subgoal E is **not** intended to deliver:

- the final usefulness-aware controller,
- a production-grade regime-management stack,
- exhaustive tuning,
- broad policy-comparison claims,
- full paper-ready figures,
- or final thesis-stage controller conclusions.

It is also **not** intended to erase the value of the Subgoal D checkpoint.  
Subgoal D remains the validated baseline against which Subgoal E should be judged.

---

## 15. Expected implementation touchpoints

The likely implementation touchpoints for Subgoal E are:

- `backend/api/routers/operational.py`
- `backend/awsrt_core/schemas/operational.py`
- `frontend/app/operational/designer/page.tsx`
- `frontend/app/operational/visualizer/page.tsx`

### Expected backend work
Backend work will likely include:

- extending usefulness-regime state representation,
- adding new summary fields for the middle regime,
- preserving compact summary outputs,
- and ensuring per-step traces remain interpretable.

### Expected schema work
Schema work will likely include:

- adding any new controller parameters,
- keeping defaults disciplined,
- and preserving backward clarity in manifests.

### Expected designer work
Designer work will likely include:

- exposing the new regime settings without overwhelming the page,
- preserving preset discipline,
- and keeping the page focused on authoring rather than interpretation overload.

### Expected visualizer work
Visualizer work will likely include:

- showing the new regime-state timeline,
- surfacing the main interpretation there rather than overloading the designer,
- and keeping mechanism-audit detail available but secondary.

---

## 16. Artifact and checkpoint discipline

Subgoal E should preserve the same artifact discipline used earlier in v0.2.

Recommended categories:

- regime extension mechanism checks
- compact controller audit
- representative trace audit
- limited harder-world confirmation

A new design note should exist before major controller edits proceed.  
This note is that design note.

A new checkpoint should be made once:
- the controller logic is stable enough to run compact audits,
- and the resulting regime structure is at least minimally interpretable.

---

## 17. Recommended working sequence

### Step 1
Freeze the Subgoal D checkpoint and treat it as the comparison baseline.

### Step 2
Implement the smallest viable three-regime extension.

### Step 3
Run a mechanism sanity subset on ideal, delay-heavy, and noise-heavy cases.

### Step 4
Inspect representative traces to verify transition causality.

### Step 5
Run the compact audit ladder for the new controller.

### Step 6
Run a limited harder-world confirmation.

### Step 7
Decide whether the Subgoal E extension is:
- good enough to freeze,
- still needs calibration,
- or should be simplified before further expansion.

---

## 18. Relation to later development

If Subgoal E succeeds, likely next directions include:

1. refining the semantics of the middle regime,
2. improving bounded support calibration,
3. integrating the usefulness-aware regime logic more cleanly with broader operational control structure,
4. and widening the study family for a more publication-oriented v0.2 controller story.

If Subgoal E fails, the correct response should usually be:
- simplify,
- re-audit,
- and avoid adding more controller complexity on top of an unclear intermediate design.

---

## 19. Short summary

Subgoal E is the next disciplined controller step after the validated Subgoal D checkpoint. Its purpose is to extend the current two-state usefulness-aware prototype into a small, interpretable three-regime scaffold that remains auditable and experimentally compact. The intended value of this step is not broad performance optimization, but improved controller structure: preserving healthy exploit behavior, retaining clear degraded caution behavior, and introducing a meaningful intermediate regime that better expresses partial support, guarded operation, or recovery. Success means the added structure is genuinely useful, readable in traces, and an improvement over the Subgoal D two-state baseline.