# AWSRT v0.2 Usefulness-Aware Control

**Status:** Draft design note  
**Applies to:** `v0.2-dev`  
**Purpose:** Define the first use of operational usefulness diagnostics as inputs to control or regime logic in AWSRT closed-loop runs.

---

## 1. Scope

This note defines the next development step after the addition of AWSRT `v0.2` operational usefulness diagnostics. The goal is to move from **diagnosing** usefulness degradation to **responding** to it in control logic.

This note does **not** attempt to introduce a full adaptive meta-controller, a complete theory of usefulness-aware control, or a final policy architecture. Instead, it defines a minimal and scientifically interpretable first step:

- use controller-available usefulness-related signals,
- convert them into compact regime-relevant support quantities,
- and influence operational behavior in a way that remains auditable and experimentally comparable.

This note applies to closed-loop operational runs only.

---

## 2. Motivation

AWSRT `v0.1` established that adaptive sensing performance cannot be understood only through raw observation activity or simple timing metrics. In particular, it suggested a wedge between:

- **information continuing to arrive**, and
- **information remaining operationally useful for belief improvement**.

AWSRT `v0.2` Subgoal B introduced the first diagnostics needed to inspect that wedge during operational runs. Those diagnostics now distinguish, at least in a first-pass way, among:

- continuing delivered activity,
- staleness due to delay,
- reduced information value,
- and activity that appears operationally misleading.

The next question is no longer only:
> what kind of degradation is happening?

It is now:
> should the controller respond differently when usefulness degradation is detected?

This note defines the first intended answer to that question.

---

## 3. Development stance

The first use of usefulness-aware control in AWSRT `v0.2` should be:

- **minimal**
- **interpretable**
- **auditable**
- **compatible with existing comparison structure**

This means the first implementation should avoid:

- a large new controller family,
- opaque meta-optimization,
- direct dependence on privileged latent-state correctness labels,
- or heavy refactoring of all policy score logic at once.

Instead, the first implementation should reuse the existing operational and regime-management structure where possible.

---

## 4. Main design decision

For the first usefulness-aware control step in AWSRT `v0.2`, the preferred target is:

## **regime support and regime response first, not full direct policy redesign**

That is, the first use of the new diagnostics should be to influence:

- advisory regime signals,
- active regime transitions,
- or regime-dependent control quantities,

before attempting a larger rewrite of the core deployment policy logic.

### Rationale

This is preferred because:

1. AWSRT already has regime-management scaffolding.
2. Regime response is easier to interpret than a large change to all policy scorers.
3. It preserves comparison discipline:
   - baseline policies remain baseline policies,
   - usefulness-aware response can be added in a controlled layer above them.
4. It reduces technical risk.
5. It is scientifically closer to the v0.1 lesson that static policy comparisons are insufficient under impairment.

---

## 5. Core control question

The first control question is:

> When the delivered observation stream remains active but becomes stale or misleading, should the controller remain in its nominal opportunistic mode?

The intended answer is:

- **not always**,
- and the first response should likely be some form of **downshift, certification support, or conservative regime adjustment** rather than unrestricted continued opportunistic behavior.

---

## 6. Controller-visible signals

Only signals that are plausibly available online to the controller should influence usefulness-aware control.

The following are acceptable candidates in the first pass.

### 6.1 Delivery activity
- `arrivals_frac`
- `detections_arrived_frac`

These describe whether observations are still arriving and whether arrived positive detections remain frequent.

### 6.2 Staleness
- `obs_age_steps`
- rolling or recent summaries derived from delivered age

These provide a direct online indicator of timing degradation.

### 6.3 Information-value proxy
- `driver_info_true` as currently implemented from belief and configured impairment assumptions

This is an operational information-value proxy, not a privileged ground-truth correctness label.

### 6.4 Misleadingness proxy
- `misleading_activity`
- or a short-window summary derived from recent positive values

This is not a correctness oracle, but it is a useful warning signal that delivered activity may be worsening belief.

### 6.5 Existing regime-compatible signals
The existing regime framework already uses quantities such as:
- utilization,
- strict drift proxy,
- local drift rate,
- cumulative exposure.

The first usefulness-aware extension should supplement rather than replace these.

---

## 7. Signals that should remain excluded

The following should **not** be used directly in first-pass usefulness-aware control:

- privileged latent-state mismatch labels,
- true corruption labels not inferable from delivered observations,
- offline-only analysis quantities,
- counterfactual what-would-have-happened quantities,
- ground-truth-only future information.

This preserves the distinction between:
- realistic online control inputs,
- and audit-only experimental diagnostics.

---

## 8. First control response options considered

Several possible first implementations were considered.

### 8.1 Direct policy-score modulation
Example:
- directly alter `mdc_info`, `uncertainty`, or greedy score maps based on recent usefulness degradation.

**Pros**
- immediate effect on deployment choices

**Cons**
- entangles usefulness logic with policy semantics quickly
- harder to compare cleanly
- higher implementation risk

### 8.2 New controller family
Example:
- create a new “usefulness-aware” operational policy

**Pros**
- conceptually clean as a separate label

**Cons**
- large scope jump
- risks premature controller proliferation
- weakens disciplined comparison at this stage

### 8.3 Regime support / regime response first
Example:
- use usefulness signals to support downshift or certification logic,
- or alter regime-controlled quantities such as effective movement budget or conservative mode choice.

**Pros**
- minimal and interpretable
- leverages existing architecture
- closer to the v0.1 lesson that regime-managed control is the next development step
- lower implementation risk

**Cons**
- less dramatic than a fully new controller

### Decision
For AWSRT `v0.2`, **Option 8.3 is preferred**.

---

## 9. First proposed implementation

The first usefulness-aware control implementation should be:

## **use recent staleness and misleadingness support as additional regime evidence**

In practical terms, this means introducing one or two compact support quantities such as:

- **staleness support**
- **misleadingness support**

and using them to strengthen:
- downshift decisions,
- certified-mode entry support,
- or recovery suppression when degradation persists.

### 9.1 Staleness support
A compact signal derived from recent observation age, for example:
- rolling mean delivered age,
- fraction of recent steps with age above a threshold,
- or a normalized age score.

Interpretation:
- higher values mean the stream remains active but stale.

### 9.2 Misleadingness support
A compact signal derived from recent `misleading_activity`, for example:
- rolling mean misleading activity,
- fraction of recent steps with misleading activity > 0,
- or a normalized misleadingness score.

Interpretation:
- higher values mean the stream remains active but belief is increasingly being worsened rather than improved.

### 9.3 Optional low-information support
A compact signal derived from reduced `driver_info_true`, especially under corruption-heavy conditions.

Interpretation:
- higher values mean the delivered stream may still be active but carries little expected information value.

---

## 10. Intended operational use

The first pass should not yet let usefulness signals fully determine control on their own. Instead, they should act as:

- **supporting evidence**
- **gating evidence**
- or **persistence-strengthening evidence**

for regime logic.

### Recommended first use
The cleanest first use is:

- strengthen **downshift** or **switch-to-certified** evidence when:
  - staleness is sustained,
  - misleadingness is sustained,
  - or information-value proxy collapses.

### Recommended non-use in the first pass
Do **not** yet:
- fully override regime state using usefulness signals alone,
- directly steer every policy by usefulness-derived penalties,
- or create many new coupled thresholds at once.

---

## 11. Proposed first mechanism

A minimal first mechanism could look like this:

### 11.1 Rolling support summaries
Introduce recent-window summaries such as:

- `recent_obs_age_mean`
- `recent_misleading_activity_mean`
- `recent_misleading_activity_pos_frac`
- `recent_driver_info_mean`

### 11.2 Normalized support values
Map these into bounded support quantities such as:
- `staleness_support ∈ [0,1]`
- `misleadingness_support ∈ [0,1]`

### 11.3 Regime integration
Use those support quantities in one of the following ways:

#### Conservative option
Add them only to advisory logging first.

#### Moderate option
Use them as auxiliary components in downshift / certification trigger logic.

#### Preferred first active option
Use them to:
- strengthen downshift persistence,
- suppress recovery when misleadingness remains high,
- and support certified-style conservative response under sustained usefulness degradation.

The moderate or preferred first active option is recommended.

---

## 12. Non-goals for Subgoal C

This first usefulness-aware control step is **not** intended to achieve:

- full impairment diagnosis from observations alone,
- optimal control under all impairment modes,
- unified theoretical certification,
- a final regime-management architecture,
- or paper-final conclusions about the best usefulness-aware controller.

The purpose is narrower:
- make the controller respond in a limited, interpretable way to the usefulness degradation already being diagnosed.

---

## 13. Experimental plan for the first Subgoal C pass

The first experiments should remain small and structured.

### 13.1 Comparison families
Compare:

- baseline current regime behavior
- versus usefulness-aware regime support

under the same base operational policy.

### 13.2 Minimal test cases
Use the same three-case discipline already used for Subgoal B:

- ideal
- delay
- noise

### 13.3 Questions to ask
1. Does usefulness-aware regime support remain quiet in ideal runs?
2. Does it respond under delay without falsely treating staleness as corruption?
3. Does it respond more strongly under heavy corruption than under ideal?
4. Does it reduce obviously misleading behavior without collapsing movement entirely?
5. Does it improve the relation between arrived activity and belief improvement?

### 13.4 First evaluation outputs
Inspect:
- regime state summaries,
- arrived versus true TTFD,
- usefulness diagnostics,
- movement summaries,
- and entropy-side summaries.

---

## 14. Files and code areas likely affected

The first usefulness-aware control pass is likely to affect:

- `backend/api/routers/operational.py`
  - where current operational loop and regime logic already live
- regime helper functions currently embedded there
- possibly later extraction targets if the file continues to grow

Potential later refactor targets may include:
- `backend/awsrt_core/operational/regime.py`
- `backend/awsrt_core/operational/diagnostics.py`
- `backend/awsrt_core/operational/usefulness.py`

However, that refactor is not required to begin the first Subgoal C implementation.

---

## 15. Recommended implementation sequence

### Step 1
Define one short support-layer design:
- what recent-window summaries exist,
- which are controller-visible,
- and how they map into bounded support values.

### Step 2
Log those support values first without changing control.

### Step 3
Use them as auxiliary regime evidence in advisory mode.

### Step 4
Only after advisory behavior looks sensible, allow them to influence active regime transitions or recovery suppression.

### Step 5
Compare ideal, delay, and noise cases again before any larger controller redesign.

---

## 16. Success condition for the first Subgoal C pass

This design direction is considered successful if:

- usefulness-aware support stays quiet or mild in ideal runs,
- staleness support rises in delayed runs,
- misleadingness support rises more strongly in high-noise runs,
- regime behavior becomes more responsive to usefulness degradation,
- and the implementation remains compact, interpretable, and experimentally auditable.

---

## 17. Short summary

The first usefulness-aware control step in AWSRT `v0.2` should not be a large controller rewrite. It should be a minimal extension of the existing regime-management layer using controller-visible signals for staleness, reduced information value, and misleading activity. The preferred implementation is to add usefulness-derived support quantities that influence advisory or active regime response before attempting broader policy redesign.