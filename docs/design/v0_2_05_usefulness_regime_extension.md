# AWSRT v0.2 Usefulness Regime Extension

**Status:** Frozen checkpoint design note  
**Applies to:** `v0.2-subgoal-e`  
**Purpose:** Record the Subgoal E controller extension, its intended scope, its implemented mechanism, and the main conclusions from the first compact audit.

---

## 1. Scope

This note freezes the **Subgoal E** usefulness-aware controller checkpoint for AWSRT `v0.2`.

Subgoal E extends the earlier validated two-state usefulness-aware prototype into a compact **three-regime** controller scaffold while preserving the same development discipline used across prior subgoals:

- small before broad,
- controlled before sweeping,
- interpretable before optimized,
- auditable before elaborate,
- one new mechanism at a time.

This note is a **checkpoint document**, not an open-ended concept note. It records what Subgoal E was intended to do, what was actually implemented, and what the first compact audit shows.

It does **not** define:

- a final paper-ready controller,
- a theorem-linked final operational policy,
- a broad v0.2 controller family,
- exhaustive calibration,
- or a full publication study.

It defines the current frozen controller step.

---

## 2. Position in the v0.2 sequence

Subgoal E follows three earlier design notes:

- `docs/design/operational_usefulness_diagnostics_v0_2.md`
- `docs/design/usefulness_aware_control_v0_2.md`
- `docs/design/usefulness_validation_v0_2.md`

Those earlier notes established:

- a first usefulness-diagnostic layer,
- a first usefulness-aware control bridge,
- and a compact validation of that first bridge.

Subgoal D validated the usefulness-aware bridge as real and interpretable. It showed that:

- ideal runs remained exploitative,
- delay-heavy runs became caution-dominant for staleness-side reasons,
- noise-impaired runs became caution-dominant for corruption-side reasons,
- and the compact usefulness diagnostics remained readable across representative cases.

Subgoal E begins **after** that checkpoint.

---

## 3. Motivation

The main limitation of the Subgoal D controller was not that it failed to react. The limitation was that its reaction remained too coarse.

The earlier controller mainly distinguished:

- a healthy / exploit-like condition,
- versus a degraded / caution-like condition.

That was sufficient for a first validation pass, but it left several useful operational distinctions only partially expressed. In particular:

- a run may no longer justify full exploit, but may not yet warrant strong caution;
- a run may be partially requalifying after degradation;
- moderate corruption and strong corruption should not necessarily collapse into the same regime expression;
- a direct exploit/caution split can hide intermediate controller logic that is better expressed explicitly.

The design question for Subgoal E was therefore:

> what is the smallest controller extension that adds meaningful structure without sacrificing auditability?

Subgoal E answers that question with a three-regime scaffold.

---

## 4. Subgoal E controller definition

### 4.1 Regime set

Subgoal E extends the earlier two-state controller into the following three-regime scaffold:

- **exploit**
- **recover**
- **caution**

These are encoded as:

- `exploit = 0`
- `recover = 1`
- `caution = 2`

### 4.2 Regime semantics

The intended semantics are:

- **exploit**  
  healthy, sufficiently useful conditions; aggressive or opportunistic behavior remains justified

- **recover**  
  weakened but not fully collapsed support; full exploit is no longer justified, but strong caution is not yet required, or the controller is partially requalifying after degradation

- **caution**  
  clearly degraded usefulness conditions; conservative behavior is justified because usefulness support has weakened materially

The middle regime is intentionally compact and should be read as an intermediate usefulness condition, not as a vague miscellaneous state.

### 4.3 Effective control mapping

The implemented Subgoal E controller uses the following policy bridge:

- **exploit** → `greedy`
- **recover** → `uncertainty`
- **caution** → `mdc_info`

This mapping is a compact operational bridge for v0.2 experimentation. It should not be treated as a final scientific claim about optimal policy structure.

---

## 5. Mechanism shape

### 5.1 Support quantities reused from earlier work

Subgoal E intentionally reuses the already validated usefulness-support quantities from Subgoal D rather than introducing a new signal family.

The regime logic is driven primarily by rolling recent-window summaries of:

- valid observation age,
- misleading activity,
- misleading-activity positive fraction,
- and delayed-aligned driver-information support.

This preserves continuity with the validated usefulness-diagnostic layer.

### 5.2 Trigger structure

The first implemented three-regime scaffold includes explicit trigger booleans for:

- **recover entry**
- **caution entry**
- **recover-from-caution requalification**
- **exploit requalification**

and explicit persistence counters for each trigger direction.

The design intent is that the controller should support direct audit questions such as:

- why did the run leave exploit?
- why did it enter recover instead of caution?
- why did it remain in caution?
- why did it leave caution?
- why did it fail to re-enter exploit?

### 5.3 Transition stance

The transition logic is deliberately explicit and threshold-based. It favors:

- recent-window support quantities,
- named trigger conditions,
- named persistence counters,
- and directly inspectable regime-state traces.

This is intentional. Subgoal E is meant to be auditable first, not optimized first.

---

## 6. What was implemented and verified

The Subgoal E implementation included:

- backend regime-state extension from two states to three,
- explicit usefulness trigger series,
- explicit persistence-counter series,
- summary fields for regime fractions and trigger-hit counts,
- and frontend visualizer support for the expanded usefulness traces.

A frontend plotting issue initially hid some of the intended usefulness traces. That issue was repaired during Subgoal E debugging. This is part of the practical checkpoint record: the implemented controller is now trace-visible rather than only summary-visible.

The resulting controller can now be inspected through:

- regime-state traces,
- trigger traces,
- persistence-counter traces,
- rolling support traces,
- and compact summary fields.

---

## 7. Compact audit result

The first compact audit used representative cases including:

- ideal,
- delay-impaired,
- and noise-impaired runs,

with several severity levels examined during the implementation cycle.

The important outcome is that the three-regime controller is **doing real work**. It is not a cosmetic refactor.

### 7.1 Ideal case

Observed pattern:

- exploit-dominant or fully exploit-dominant
- negligible or zero recover occupancy
- negligible or zero caution occupancy

Interpretation:

- healthy conditions still read as healthy
- the added regime structure does not create spurious intermediate-state behavior in ideal runs

This is a strong success condition and was met.

### 7.2 Moderate noise case

Observed pattern:

- exploit collapses quickly,
- recover becomes the dominant regime,
- caution is present but not dominant.

Interpretation:

- this is the clearest success of Subgoal E
- the new middle regime is doing useful work
- moderate corruption no longer has to collapse immediately into the strongest degraded state

This is the main evidence that the three-regime extension adds genuine explanatory value over the earlier two-state controller.

### 7.3 Strong noise case

Observed pattern:

- exploit is negligible,
- recover is brief,
- caution becomes dominant.

Interpretation:

- the controller still has a meaningful degraded end-state
- caution remains operationally distinct and appropriate for strong corruption-side degradation

This is also a success.

### 7.4 Delay-impaired cases

Observed pattern:

- exploit weakens or disappears,
- recover is usually brief,
- caution becomes dominant.

Interpretation:

- the controller clearly recognizes stale-but-active degradation
- however, delay response still appears somewhat **saturated**
- delay severity does not yet produce as clean or as smoothly graded an internal ladder as desired

This is the main remaining limitation of the current checkpoint.

---

## 8. Main checkpoint conclusion

The Subgoal E controller should be considered a **successful qualitative extension** of the earlier two-state usefulness-aware prototype.

The key reasons are:

- ideal runs remain quiet and exploitive,
- the new middle regime is real rather than decorative,
- moderate noise now occupies recover in a legible way,
- strong noise still maps to caution,
- delay still maps away from exploit in the correct qualitative direction,
- and the full mechanism is visible in trace form.

The strongest substantive gain is:

> the controller now expresses a meaningful corruption-side ladder: ideal → recover-dominant moderate corruption → caution-dominant strong corruption.

The main remaining caveat is:

> the delay path still tends to saturate into caution rather quickly, so delay severity is not yet expressed as smoothly as the corruption ladder.

That caveat does **not** invalidate the checkpoint. It limits the claims that should be made from it.

---

## 9. What Subgoal E achieved

Subgoal E achieved the following:

### 9.1 Added controller structure
The usefulness-aware controller is no longer limited to a direct exploit/caution split.

### 9.2 Preserved healthy-case behavior
Ideal runs still read as healthy and remain exploit-dominant.

### 9.3 Reduced two-state compression
The clearest reduction in compression occurs on the corruption side, especially under moderate noise.

### 9.4 Preserved degraded caution semantics
Caution remains meaningful under strongly degraded conditions.

### 9.5 Preserved auditability
The controller is still readable through compact tables and aligned traces.

---

## 10. What Subgoal E did not achieve

Subgoal E did **not** yet achieve:

### 10.1 Smooth delay severity grading
Delay-heavy runs are recognized, but delay severity is not yet expressed through a clean internal ladder.

### 10.2 Final regime calibration
The present thresholds and persistence values are checkpoint-quality, not final-quality.

### 10.3 Final semantic refinement of recover
The middle regime is already useful, but its semantics are still somewhat broad: weakened support, guarded operation, stabilization, and requalification remain close together in the current implementation.

### 10.4 Final publication-ready controller logic
This remains an experimental, auditable v0.2 controller step.

---

## 11. Validation stance at freeze

The correct validation question for Subgoal E was never:

> does this now outperform everything?

The right questions were:

1. Is the three-regime logic interpretable?
2. Does the middle regime appear for understandable reasons?
3. Does it reduce the most obvious compression of the earlier two-state controller?
4. Does the added structure remain compact and auditable?

At this checkpoint, the answers are:

- **yes, qualitatively**
- **yes, especially on the corruption side**
- **yes**
- **yes**

with one explicit caveat:

- **delay-side calibration remains somewhat coarse**

That is the right frozen reading of this checkpoint.

---

## 12. Frozen interpretation of the regimes

At this checkpoint, the regimes should be interpreted as follows.

### Exploit
Healthy usefulness support. Full exploitive control remains justified.

### Recover
Intermediate usefulness support. This regime currently covers:
- weakened but not collapsed support,
- guarded operation,
- partial requalification,
- and intermediate corruption-side conditions.

### Caution
Clearly degraded usefulness support. Conservative control remains justified.

This interpretation is intentionally modest. It is enough to support v0.2 experimental reading without over-claiming that the regime semantics are already final.

---

## 13. Recommended frozen experiment set

The minimal frozen comparison set for this checkpoint is:

- **ideal**
- **delay = 2**
- **delay = 8**
- **noise = 0.1**
- **noise = 0.45**

These runs are sufficient to support the checkpoint-level conclusions:

- ideal remains exploit-dominant,
- moderate noise becomes recover-dominant,
- stronger noise becomes caution-dominant,
- delay becomes caution-dominant,
- and the controller’s internal logic is visible in traces.

Broader expansion should wait until a later step.

---

## 14. Recommended frozen outputs

The stable output set for this checkpoint should be:

### 14.1 Compact regime audit table
Recommended columns:
- case
- exploit_frac
- recover_frac
- caution_frac
- final_state
- trigger counts
- recent_age_last
- recent_misleading_pos_frac_last
- recent_driver_info_last

### 14.2 Representative trace figure
Recommended aligned panels:
- recent valid observation age
- recent misleading-activity positive fraction
- recent driver-info mean
- regime state
- recover trigger
- caution trigger
- recover-from-caution trigger
- exploit trigger
- persistence counters

### 14.3 Short written synthesis
Recommended content:
- what the middle regime is doing,
- where the controller clearly improved,
- and where delay response remains coarse.

---

## 15. Success criteria for this frozen checkpoint

This checkpoint should be considered successful because:

- the regime set remains interpretable,
- ideal runs remain mostly or entirely exploit,
- the middle regime is meaningful rather than noisy,
- degraded cases still leave exploit appropriately,
- the traces remain readable,
- and the controller offers real incremental value over the earlier two-state version.

This checkpoint should **not** be described as fully calibrated. It should be described as:

> a successful qualitative three-regime extension with the clearest gains on the corruption side and an identifiable remaining limitation on the delay side.

---

## 16. Failure conditions that remain relevant later

Future work should treat the following as warning signs if they persist:

- ideal runs spending unexplained time outside exploit,
- recover becoming frequent but hard to interpret,
- delay severity remaining poorly ordered,
- traces becoming harder rather than easier to read,
- or added regime structure ceasing to add explanatory value.

At the Subgoal E freeze point, the main live warning sign is still:

- **delay-side saturation / coarse grading**

Everything else is currently consistent with a successful checkpoint.

---

## 17. Implementation touchpoints

The principal Subgoal E touchpoints are:

- `backend/api/routers/operational.py`
- `backend/awsrt_core/schemas/operational.py`
- `frontend/app/operational/designer/page.tsx`
- `frontend/app/operational/visualizer/page.tsx`

### Backend
Implemented:
- three-regime usefulness state,
- trigger logic,
- persistence counters,
- summary fields,
- step-level trace persistence.

### Schema
Implemented:
- threshold and persistence exposure for the new usefulness scaffold.

### Designer
Implemented:
- controlled exposure of the new usefulness parameters.

### Visualizer
Implemented:
- regime-state trace,
- trigger traces,
- persistence-counter traces,
- rolling support traces.

The visualizer repair that restored missing usefulness plots is part of the practical implementation record of this checkpoint.

---

## 18. Relation to later development

If later development continues from this checkpoint, the most natural next directions are:

1. refine the semantics of the recover regime,
2. improve delay-side grading,
3. tighten threshold and persistence calibration,
4. preserve the current auditability while making the controller slightly more discriminating,
5. and only then broaden the experiment family.

The wrong next step would be to add substantial new controller complexity before the current three-regime interpretation is fully absorbed.

---

## 19. Frozen summary

Subgoal E freezes as a compact, auditable three-regime usefulness-aware controller extension for AWSRT `v0.2`. The controller now distinguishes **exploit, recover, and caution**, and this added structure is genuinely useful rather than cosmetic. Ideal runs remain exploit-dominant. Moderate noise runs are now expressed primarily through **recover**, which is the clearest improvement over the earlier two-state controller. Strong noise and delay-heavy runs remain caution-dominant, preserving a clear degraded regime. The mechanism is readable in trace form through support quantities, triggers, and persistence counters. The main remaining limitation is that delay response still appears somewhat saturated rather than smoothly graded. Accordingly, this checkpoint should be treated as a successful qualitative controller extension and an appropriate Subgoal E freeze point, with later refinement focused primarily on delay-side calibration rather than on expanding controller complexity.