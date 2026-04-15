# AWSRT v0.3 Subgoal 06: Bounded Real-Fire Slice Study

**Status:** Draft design note  
**Applies to:** `v0.3-subgoal-06`  
**Purpose:** Define the first disciplined experiment subgoal after bounded execution-window support, using small real-fire operational slices to test whether the core AWSRT distinctions from v0.1 and the cleaner interpretation surfaces from v0.2 remain readable outside the simple synthetic reference worlds.

---

## 1. Purpose of this note

This note defines the next bounded step after Subgoal 05.

Subgoal 05 added the practical capability needed to make long-horizon transformed real-fire runs experimentally tractable: bounded execution-window support. That was enabling work. It made later experimentation possible, but it was not itself the next scientific reading step.

Subgoal 06 is the first subgoal that should directly use that new capability.

Its purpose is not to launch a broad real-fire campaign and not to search immediately for a final best controller on transformed real-fire data. Its purpose is narrower and more disciplined:

- to determine whether bounded real-fire operational slices are already scientifically readable,
- to test whether the main AWSRT distinctions from v0.1 still appear there in recognizable form,
- and to check whether the cleaner v0.2 interpretation surfaces remain honest and useful on those slices.

In short, Subgoal 06 is the first **bounded real-fire operational reading study**.

---

## 2. Why this is the right next step now

### 2.1 The early controller-facing line already reached a useful pause

The early v0.3 control line was productive, but it also reached a natural stopping point.

Subgoal 01 produced a useful recovery-side refinement and a semantic-probe workflow. Subgoals 02–04 then formed a disciplined boundary-finding sequence showing that corruption-side caution did not become meaningfully legible through the bounded interventions tested.

That means the project should not continue patching the same controller seam without reframing.

### 2.2 Subgoal 05 created the missing bridge

The roadmap beyond v0.2 already identified bounded real-fire deployment support as the most justified near-term realism bridge. Subgoal 05 implemented that bridge.

Now that the execution-window feature exists, the next question should no longer be whether such a bridge is needed. The next question is whether it is scientifically usable.

### 2.3 The strongest remaining uncertainty is now experimental, not infrastructural

The main open issue is no longer:

- can the platform run bounded real-fire windows?

It is now:

- what becomes readable once it does?

This is the right kind of next question because it moves from enabling infrastructure to bounded scientific interpretation.

### 2.4 This is still not a broad realism phase

Subgoal 06 should remain disciplined.

It is not a realism-validation campaign, not a claim of operational realism maturity, and not a full expansion into real-fire benchmarking. It is the first careful test of whether bounded real-fire slices can carry meaningful AWSRT operational interpretation.

---

## 3. Main development question

The central question for Subgoal 06 is:

> can bounded transformed real-fire windows already support meaningful operational reading of AWSRT’s core distinctions, especially the difference between information delivery and information usefulness for belief improvement?

More concretely:

> when baseline policy families are run on bounded real-fire slices, do the layered AWSRT metric meanings and control interpretations remain readable enough to support disciplined continuation of v0.3?

This is the main question the subgoal should answer.

---

## 4. Scope

Subgoal 06 should stay narrow.

It should focus on one compact class of work:

- small real-fire bounded-slice operational experiments,
- interpreted through the existing AWSRT metric and control-reading framework.

That likely includes:

- selecting a small number of bounded windows from one transformed real-fire source,
- running a compact baseline policy set on those windows,
- reading the results through v0.1-style layered metrics,
- and checking selected v0.2 interpretation surfaces for honesty and usefulness.

It should **not** include:

- broad real-fire campaign packaging,
- a large multi-source benchmarking phase,
- strong validation claims about real wildfire realism,
- large new control redesign,
- or broad frontend expansion.

Subgoal 06 is a **first slice study**, not a full real-fire program.

---

## 5. What Subgoal 06 is and is not

### 5.1 What Subgoal 06 is

Subgoal 06 is the first bounded scientific use of the real-fire execution-window bridge.

It is about:

- running compact operational comparisons on bounded transformed real-fire slices,
- checking whether the main AWSRT distinctions remain readable there,
- and using those results to decide what kind of v0.3 controller or experiment question deserves to come next.

### 5.2 What Subgoal 06 is not

Subgoal 06 is not:

- a search for a universal best controller on real-fire data,
- a full real-fire validation chapter,
- a broad repeated-seed campaign,
- a major active-regime redesign phase,
- or a claim that transformed real-fire experiments have replaced the synthetic comparison worlds.

It is also not yet a full thesis-facing figure campaign.

Its role is earlier than that.

---

## 6. Working diagnosis entering Subgoal 06

At the start of Subgoal 06, the relevant diagnosis is:

### 6.1 The platform now has the needed bounded-run capability

The new execution-window support means the platform can now run tractable operational slices on long-horizon transformed real-fire inputs.

That removes the main practical blocker that had prevented this kind of experiment from being convenient.

### 6.2 The main scientific story still comes from v0.1

The strongest established AWSRT scientific interpretation remains the v0.1 story:

- policy families are operationally distinct,
- information delivered and information useful can separate,
- delay and noise degrade usefulness differently,
- and TTFD is necessary but insufficient.

Subgoal 06 should not discard that framework. It should carry it forward.

### 6.3 The main semantic discipline still comes from v0.2

The strongest late-stage interpretive clarification remains the v0.2 story:

- compact usefulness is an interpretation layer,
- advisory and active are distinct semantic surfaces,
- and active mechanism behavior can be meaningfully inspected.

Subgoal 06 should preserve that discipline rather than collapsing everything into headline outcome metrics alone.

### 6.4 The main risk is overreach

The danger now is not lack of ideas. It is asking too much of the first bounded real-fire study.

The first real-fire slice study only needs to establish whether meaningful reading is already possible. It does not need to settle the whole real-fire future of AWSRT.

---

## 7. Recommended development stance

Subgoal 06 should follow these principles.

### 7.1 Start with baseline policy families first

The first slice study should begin with the baseline policy families most closely tied to the v0.1 scientific story:

- `greedy`
- `uncertainty`
- `mdc_info`

These remain the cleanest first comparison set because they preserve the original exploit / explore / information-seeking contrast.

### 7.2 Treat active-regime runs as secondary, not primary

The first question is whether the baseline scientific distinctions remain readable on bounded real-fire slices.

Only after that is established should the subgoal consider a small active-regime follow-up. Even then, it should remain secondary and scoped.

### 7.3 Preserve layered metric reading

The real-fire slice study should be interpreted through the same layered questions used in the v0.1 chapter:

- timeliness,
- belief quality,
- information or arrival activity,
- coverage or support engagement,
- and usefulness or mechanism-facing quantities where applicable.

This layered reading is more important than simple ranking.

### 7.4 Preserve semantic honesty from v0.2

If compact usefulness or regime-management outputs are inspected, the subgoal should keep the v0.2 reading boundaries explicit:

- usefulness is not identical to the broader regime-management layer,
- advisory is not the same as active,
- and mechanism audit is not the same as headline outcome comparison.

### 7.5 Keep the first experiment family compact

A small number of windows and a small number of policies is enough.

The goal is scientific readability, not breadth.

---

## 8. Recommended first experiment family

The first experiment family should be intentionally small and interpretable.

### 8.1 Recommended policy set

The recommended first comparison set is:

- `greedy`
- `uncertainty`
- `mdc_info`

These are the best starting policies because:

- they directly continue the strongest v0.1 story,
- they are already operationally interpretable,
- and they avoid prematurely shifting the real-fire bridge into a regime-family comparison problem.

### 8.2 Recommended window set

The recommended first bounded window set is:

- one early window,
- one middle window,
- one later or more operationally difficult window,

all taken from the same transformed real-fire source if possible.

This gives enough variation to test whether slice position materially changes interpretability without turning the subgoal into a large multi-source matrix.

### 8.3 Recommended run mode

The first slice study should emphasize:

- `dynamic` mode,
- with the embedded belief update enabled,
- and with operationally readable defaults that remain close to the current baseline deployment assumptions unless there is a strong reason to change them.

### 8.4 Recommended tie-breaking

The first pass should probably begin with:

- deterministic tie-breaking for inspection and mechanism clarity,

and only add stochastic follow-up if the first readings are promising enough to justify a second pass.

---

## 9. Relationship to existing Operational Designer presets

The current Operational Designer taxonomy is useful here because it already exposes a disciplined compact set of baseline, MDC, usefulness, and regime presets.

For Subgoal 06, the most relevant starting points are the existing baseline and MDC presets:

- `baseline_greedy_dynamic_ideal`
- `baseline_uncertainty_dynamic_ideal`
- `mdc_info_reward_light_ideal`

These are the best first presets for the bounded slice study because they preserve the clearest policy-family contrasts while avoiding unnecessary early complication from regime overlays.

The `mdc_info_reward_strong_ideal` preset may be used as a secondary sensitivity check if the first pass suggests that real-fire slices are especially sensitive to stronger information weighting, but it should not be the default starting point.

The `usefulness_proto_diagnostic_ideal` preset may be useful later as a compact interpretive probe, but should not define the first main comparison family for this subgoal.

The active-regime presets such as:

- `regime_active_balanced`
- `regime_active_opportunistic`
- `regime_active_certified`

should be treated as follow-on probes only if the baseline slice results are already readable and suggest a worthwhile controller-facing next question.

The hysteresis and semantic-probe presets are even more clearly secondary for this subgoal. They remain diagnostic tools, not the first scientific reading family for the bounded real-fire bridge.

---

## 10. Main reading questions for the first slice study

The first slice study should be interpreted through a small number of concrete questions.

### 10.1 Policy identity question

Do `greedy`, `uncertainty`, and `mdc_info` still look operationally distinct on bounded real-fire slices?

This is the first question because it tests whether the baseline-family reading survives outside the simple synthetic worlds.

### 10.2 Wedge question

Do delivery-side or activity-side quantities separate from belief-quality quantities on any bounded real-fire slices?

This is the most important scientific carryover question from v0.1.

### 10.3 Slice-position question

Do early, middle, and later slices produce materially different operational readings?

This matters because the bounded-window bridge may reveal that some parts of the transformed real-fire timeline are much more informative than others.

### 10.4 Control-surface honesty question

Where compact usefulness or regime summaries are present, do they remain honest and readable on bounded real-fire slices?

This is the main carryover question from v0.2.

---

## 11. Likely implementation and workflow touchpoints

Subgoal 06 should require only limited new implementation work if Subgoal 05 is already complete.

The likely touchpoints are:

- `frontend/app/operational/designer/page.tsx`
- `frontend/app/operational/visualizer/page.tsx`
- existing study-design or run-comparison workflow surfaces, if used
- possibly small analysis-side packaging helpers only if needed for compact interpretation

The emphasis should remain:

### First pass

- select bounded windows
- run compact baseline family comparisons
- inspect results honestly
- preserve notes on which slices are readable and which are not

### Only if justified

- add one small usefulness or active-regime follow-up
- add one compact study packaging layer for comparison
- add one figure or table only if it materially clarifies interpretation

Large tooling growth remains out of scope.

---

## 12. Validation plan

Subgoal 06 should be validated in a compact and practical way.

### 12.1 Minimal validation cases

A good initial validation set would be:

- one early bounded real-fire window with the three baseline policies,
- one middle bounded real-fire window with the same policies,
- one later or more difficult bounded real-fire window with the same policies.

This yields a compact but meaningful matrix.

### 12.2 What to check

Validation should confirm that:

- the bounded slices run cleanly and remain easy to inspect,
- the visualizer remains truthful about source horizon versus local window,
- the baseline policy families remain at least somewhat distinguishable,
- the layered metrics remain interpretable,
- and at least some windows support meaningful operational reading rather than collapsing into noise.

### 12.3 What not to demand yet

The first pass does not need:

- broad repeated-seed confidence claims,
- a full cross-source campaign,
- large analysis-batch automation,
- or a final judgment about the best controller for real-fire use.

It only needs to establish whether bounded real-fire slices are already scientifically usable.

---

## 13. Suggested success criteria

Subgoal 06 should be considered successful if:

- bounded transformed real-fire slices can be run and inspected cleanly,
- the baseline policy families remain at least partly operationally distinct on those slices,
- the layered AWSRT metric reading remains meaningful,
- at least some windows show recognizable separation between delivery-side activity and belief-side usefulness,
- and the v0.2 interpretation boundaries remain honest where control-facing summaries are inspected.

A strong success outcome would be:

- the slice study reveals a clear next controller-facing question for v0.3,
- grounded in actual bounded real-fire behavior rather than another abstract patch cycle.

---

## 14. Warning signs

Subgoal 06 should be treated as drifting if:

- it turns into a broad real-fire benchmarking campaign,
- it immediately expands into many sources, many windows, and many policy families,
- it treats one small slice result as a broad realism-validation claim,
- it collapses delivery, usefulness, and belief-quality metrics into a single ranking story,
- or it jumps too quickly into active-regime comparison before the baseline-family reading has been re-established.

A particularly important warning sign would be:

- using the new real-fire bridge mainly to search for a winner, rather than first asking what the slices actually reveal.

Another warning sign would be:

- abandoning the v0.1 layered reading or the v0.2 semantic discipline in favor of a flatter “best score wins” interpretation.

---

## 15. Relationship to likely next steps

A plausible sequence after this note is:

### 15.1 Subgoal 06 implementation and run selection
Choose one transformed real-fire source and define a compact set of bounded windows.

### 15.2 First baseline slice study
Run `greedy`, `uncertainty`, and `mdc_info` on those windows.

### 15.3 Compact interpretation checkpoint
Record which distinctions remain readable, which collapse, and what the most likely next controller or study question is.

### 15.4 Optional follow-on probe
Only if justified, add one small usefulness or active-regime probe on the most informative slice.

### 15.5 Next v0.3 design decision
Use the slice-study outcome to choose between:
- a broader bounded real-fire study family,
- a return to controller development under a better grounded question,
- or a small analysis or UI support step that is now clearly justified.

---

## 16. Short summary

Subgoal 06 is the first bounded scientific use of the real-fire execution-window bridge added in Subgoal 05. Its purpose is not to launch a broad real-fire campaign or search immediately for a final best controller, but to determine whether bounded transformed real-fire slices already support meaningful AWSRT operational reading. The recommended first experiment family is a compact baseline comparison using `greedy`, `uncertainty`, and `mdc_info` across a small set of early, middle, and later windows from one transformed real-fire source. The study should be interpreted through the layered v0.1 metric framework and the semantic discipline clarified in v0.2. Success means the slice study reveals that at least some bounded real-fire windows are already scientifically readable and helps expose the next justified controller or experiment question for AWSRT v0.3.