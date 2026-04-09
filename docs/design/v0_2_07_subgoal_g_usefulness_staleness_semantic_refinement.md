# AWSRT v0.2 Subgoal G: Usefulness Staleness Semantics Refinement

**Status:** Frozen checkpoint design note  
**Applies to:** `v0.2-subgoal-g`  
**Purpose:** Define and freeze the controller refinement that gives stale-but-still-active delay behavior a clearer recover-style interpretation within the usefulness-regime scaffold, while preserving stronger corruption-side caution behavior.

---

## 1. Scope

This note defines **Subgoal G** for AWSRT v0.2.

Subgoal F tested whether the frozen Subgoal E usefulness scaffold could be improved on the delay side through small, explicit transition refinements. Those experiments were useful, but they did not materially de-compress the moderate and strong delay cases. Delay 1 improved, and the corruption-side recover/caution separation remained intact, but delay 4 and delay 8 still remained too caution-heavy to read cleanly as stale-but-still-active cases.

Subgoal G therefore did **not** begin from the assumption that one more small persistence or threshold tweak would solve the problem. Instead, it asked whether the controller needed a clearer semantic treatment of **stale-but-still-active information flow**.

The key motivating observation was:

- corruption and staleness are both degradations,
- but they do not necessarily belong to the same degraded class operationally,
- and the exploit / recover / caution scaffold was still too eager to map persistent staleness into the same caution semantics used for stronger corruption-side breakdown.

Subgoal G was therefore a **semantic refinement step**, not a broad redesign.

It did **not** aim to deliver:

- a final controller,
- a fourth usefulness state,
- a merge with advisory/active regime-management,
- or a broad optimization campaign.

It remained a compact, auditable usefulness-controller subgoal.

---

## 2. Checkpoint inherited from Subgoal F

Subgoal F should be treated as the immediate empirical precursor.

The main Subgoal F findings were:

### 2.1 Ideal
Ideal runs remained clean and mostly exploit-dominant. This remained the required baseline.

### 2.2 Moderate corruption
Moderate noise retained meaningful recover occupancy. This was one of the most important gains from the Subgoal E/F line and needed to be preserved.

### 2.3 Strong corruption
Strong noise remained caution-dominant. This was still desirable.

### 2.4 Mild delay
Delay 1 became more recover-like under some of the Subgoal F refinements. This suggested that the delay-side issue was not completely rigid.

### 2.5 Moderate and strong delay
Delay 4 and delay 8 remained too caution-dominant across multiple disciplined patch variants. This was the central reason for moving to Subgoal G.

So the inherited situation was:

- corruption-side structure was usable,
- ideal remained acceptable,
- but moderate and strong delay still did not inhabit recover in a meaningful enough way.

---

## 3. Main development question

The central question for Subgoal G was:

> should stale-but-still-active delay behavior be treated more explicitly as a recover-style condition, rather than as a weakened path to the same caution semantics used for corruption-side degradation?

Equivalently:

> can the usefulness scaffold remain compact and auditable while assigning a clearer operational meaning to persistent staleness, so that caution is reserved more specifically for stronger breakdown modes?

This was a semantic question before it was a calibration question.

Subgoal G was therefore not asking:

> how do we slightly delay caution again?

It was asking:

> what does recover actually mean for the delay case, and when should delay truly count as caution rather than prolonged recover?

---

## 4. Development stance

Subgoal G remained disciplined in the same v0.2 style:

- one mechanism change at a time,
- preserve the Subgoal E/F baseline for comparison,
- prefer explicit, interpretable logic over composite scoring,
- keep traces compact and auditable,
- and avoid expanding the controller family prematurely.

This meant Subgoal G still avoided, at least initially:

- introducing a fourth usefulness state,
- adding large new signal families,
- blending everything into weighted continuous scores,
- or entangling the work with advisory/active regime management.

The point was to refine meaning, not to inflate machinery.

---

## 5. Diagnosis carried into Subgoal G

The exploit / recover / caution scaffold was semantically under-specified for delay-heavy cases.

The problem was not merely that the thresholds were wrong. The stronger diagnosis from Subgoal F was:

- persistent age degradation was still being interpreted too close to a strong degraded regime,
- but operationally, stale information was often better understood as **not healthy enough for exploit, but not yet in the same class as corruption-driven caution**.

In other words, the scaffold was conflating two different degraded conditions:

1. **stale but still active**
2. **actively misleading / strongly broken**

Recover already existed as the natural candidate for the first condition. Subgoal G therefore explored whether the meaning of recover should be made more explicit on the delay side rather than merely making caution harder to reach.

---

## 6. Intended Subgoal G behavior

The target behavior for Subgoal G was:

### 6.1 Ideal
- still mostly exploit,
- little or no recover,
- little or no caution.

### 6.2 Mild delay
- recover should appear naturally,
- caution should remain absent or very limited.

### 6.3 Moderate delay
- recover should become the clearly meaningful dominant intermediate regime,
- caution may appear transiently or under stronger sustained conditions,
- but the run should no longer look like a near-direct exploit-to-caution latch.

### 6.4 Strong delay
- caution could still appear,
- but the path should look like staged degradation,
- with recover functioning as a true stale-information regime rather than a momentary waypoint.

### 6.5 Moderate corruption
- recover-heavy or mixed recover/caution structure should remain possible.

### 6.6 Strong corruption
- caution should remain clearly available as the strong degraded regime.

This meant Subgoal G aimed for a more semantically legible separation:

- **recover** = degraded but still operationally active
- **caution** = stronger breakdown / higher-risk degradation

without introducing more states.

---

## 7. Recommended mechanism direction

Subgoal G began from an explicit **delay-side semantic rule**, not another round of small threshold patching.

The intended first move was:

### 7.1 Make recover the default regime for age-driven degradation
If degradation was primarily age-driven and corruption-side evidence was absent, the controller should prefer to interpret that condition as recover.

This should hold even when age remained persistently elevated, unless a stronger delay-specific caution qualification was met.

### 7.2 Reserve caution more specifically for stronger breakdown
Caution should remain sharp for corruption-side degradation. For delay-heavy cases, caution should only become dominant when staleness had become severe enough that recover was no longer an adequate interpretation.

### 7.3 Keep corruption-side caution intact
Subgoal G had to preserve the corruption-side story already achieved:
- moderate noise remains recover-meaningful,
- strong noise remains caution-heavy.

This was the main preservation constraint.

---

## 8. Candidate design directions

Subgoal G considered compact semantic candidates such as:

### Candidate A — recover-default age semantics
Treat age-driven degradation as recover by default, with caution entering only after a clearly stronger age-specific qualification.

This was the preferred first candidate.

### Candidate B — recover with explicit severe-delay escape
Let age-heavy cases remain in recover until a separate severe-delay condition is sustained long enough to justify caution.

This was similar to Candidate A but made the severe-delay transition more explicit.

### Candidate C — caution reserved for corruption or joint breakdown
Allow caution to be entered readily under corruption or mixed degradation, but treat pure staleness much more conservatively.

This was the strongest semantic version and was to be considered only if A/B remained too weak.

The disciplined order was:

1. try recover-default age semantics,
2. then add an explicit severe-delay escape if needed,
3. only then consider stronger reinterpretations of caution entry.

In practice, the Subgoal G revision achieved usable behavior without needing to expand the state family.

---

## 9. What did not change first

Subgoal G avoided changing all of the following at once:

- age thresholds,
- recover thresholds,
- exploit thresholds,
- misleadingness thresholds,
- driver-info thresholds,
- and full state semantics across all cases.

It also avoided:

- adding a fourth state,
- redefining corruption behavior,
- or turning the controller into a continuous weighted policy family.

The objective was not to replace the scaffold. It was to make the delay interpretation more explicit within it.

---

## 10. Validation goals

The main validation questions for Subgoal G were:

1. Does delay 4 now spend meaningfully more time in recover?
2. Does delay 8 show a more staged path rather than collapsing immediately into caution?
3. Does ideal remain clean?
4. Does noise 0.1 remain recover-meaningful?
5. Does noise 0.45 remain strongly caution-dominant?
6. Is the resulting controller easier to explain, not harder?

Subgoal G remained a regime-structure subgoal, not a performance-ranking subgoal.

---

## 11. Validation layers

### 11.1 Layer 1 — compact sanity subset
Run:
- ideal
- delay 1
- delay 4
- delay 8
- noise 0.1
- noise 0.45

### 11.2 Layer 2 — compact audit table
Compare:
- exploit fraction
- recover fraction
- caution fraction
- final state
- trigger hit counts
- recent age last
- recent misleading positive fraction last
- recent driver info last

### 11.3 Layer 3 — representative traces
Inspect:
- one delay 4 run
- one delay 8 run
- one noise 0.1 run

Purpose:
- verify that delay-side recover is causally legible,
- verify that corruption-side caution remains intact,
- and check that the new semantics are genuinely visible in traces rather than only in aggregate fractions.

### 11.4 Layer 4 — limited harder-world confirmation
Only after the simple world looks stable.

---

## 12. Validation outcome

Subgoal G should now be treated as a **successful frozen checkpoint** on its intended scope.

The compact six-case sanity subset supports the intended semantic interpretation.

### 12.1 Ideal
Ideal remained clean and exploit-dominant:

- exploit fraction = 1.00
- recover fraction = 0.00
- caution fraction = 0.00

This preserved the required healthy baseline.

### 12.2 Mild delay
Delay 1 became strongly recover-dominant rather than caution-heavy:

- exploit fraction ≈ 0.01
- recover fraction ≈ 0.99
- caution fraction = 0.00

This is the intended stale-but-still-active reading.

### 12.3 Moderate delay
Delay 4 no longer read as a caution-collapsed run. In the revised checkpoint it became recover-dominant with only limited caution occupancy:

- exploit fraction ≈ 0.025
- recover fraction ≈ 0.925
- caution fraction ≈ 0.050

This is the central Subgoal G success.

### 12.4 Strong delay
Delay 8 remained degraded, but no longer read as a direct exploit-to-caution latch. It stayed primarily recover-dominant, with some caution occupancy:

- exploit fraction ≈ 0.045
- recover fraction ≈ 0.895
- caution fraction ≈ 0.060

This is a more legible staged-degradation result than the earlier caution-dominant behavior.

### 12.5 Moderate corruption
Noise 0.1 remained degraded and semantically distinct from ideal. In the present checkpoint it is recover-dominant with a nontrivial caution excursion:

- exploit fraction ≈ 0.005
- recover fraction ≈ 0.900
- caution fraction ≈ 0.095

This preserves meaningful corruption-side degradation without collapsing directly into strong caution.

### 12.6 Strong corruption
Noise 0.45 remained caution-dominant:

- exploit fraction ≈ 0.005
- recover fraction ≈ 0.005
- caution fraction ≈ 0.990

This preserves the intended strong-breakdown interpretation.

So the frozen Subgoal G semantic picture is now:

- **ideal** → exploit
- **mild/moderate/strong delay** → primarily recover, with stronger delay allowing limited caution
- **moderate corruption** → recover-dominant but degraded
- **strong corruption** → caution

That is the intended qualitative separation.

---

## 13. Trace-based interpretation

The representative traces support the summary-level conclusion and should be treated as the decisive audit layer for freezing Subgoal G.

### 13.1 Delay traces
For delay 4 and delay 8, the traces show:

- `Recent valid observation age` rises immediately and then stays flat at the delayed level.
- `Usefulness regime state` shows only a brief early caution excursion and then spends the long remainder in **recover**.
- `Usefulness trigger: recover` fires early.
- `Usefulness trigger: caution` also fires early, but does not dominate the episode.
- `Usefulness trigger: recover from caution` fires and the regime returns to **recover**.
- `Usefulness trigger: exploit` remains off.
- `Recent driver-info mean` stays positive rather than collapsing.
- `Recent misleading-activity positive fraction` becomes active at times, but not enough to force persistent caution.

This is the intended stale-active interpretation:
delay creates persistent age burden, the controller recognizes that degradation, but because information flow remains meaningfully present, the run lives mainly in **recover**, not **caution**.

### 13.2 Moderate corruption trace
For noise 0.1, the traces show:

- age remains near zero,
- misleading activity remains materially active,
- driver-info remains present,
- the regime leaves exploit and becomes mostly **recover**,
- caution appears as a real but non-dominant degraded excursion.

This remains a useful intermediate corruption regime and does not collapse into either ideal behavior or strong caution.

### 13.3 Strong corruption interpretation
Although the compact trace subset focused on delay 4, delay 8, and noise 0.1, the summary statistics for noise 0.45 remain clear enough to support freeze:
the controller is overwhelmingly caution-dominant under strong corruption, which is exactly the intended strong-breakdown semantics.

### 13.4 What the traces now mean
The trace layer shows that the Subgoal G revision is not merely a change in occupancy fractions. It changes the **causal reading** of delay-heavy runs:

- delay now looks like a stale-active recover regime,
- caution remains available,
- but caution is no longer the default semantic fate of persistent staleness.

That is the main substantive success of Subgoal G.

---

## 14. Frozen Subgoal G interpretation

The frozen interpretation of Subgoal G is:

> moderate and strong delay should read primarily as stale-but-still-active recover regimes, with only brief or limited caution excursions, while stronger corruption should still support caution as the dominant degraded regime.

This is intentionally not a claim that caution is impossible under delay. Rather, it is a claim that delay should not be semantically collapsed into the same degraded class as stronger corruption.

The resulting semantics are now more explainable:

- **exploit** means healthy enough for normal operation,
- **recover** means degraded but still informationally active,
- **caution** means stronger breakdown or higher-risk degradation.

That is a more legible controller story than the earlier delay-heavy caution latch.

---

## 15. Suggested success criteria

Subgoal G should be considered successful because:

- ideal remains mostly exploit,
- noise 0.1 still shows meaningful degraded structure and remains largely recover-like,
- noise 0.45 still supports strong caution,
- delay 4 is no longer caution-collapsed,
- delay 8 still looks degraded but now follows a more interpretable staged path,
- and the resulting traces are easier to explain as semantics, not just threshold artifacts.

---

## 16. Remaining warning signs and limits

Subgoal G is a successful checkpoint, but not a final controller.

The following cautions remain important:

### 16.1 Early transient caution tendency
The revised delay traces still show a brief early caution excursion before settling into recover. This does **not** block freezing the checkpoint, because the long-run semantics are now correct, but it should be noted honestly.

### 16.2 Stronger-world confirmation still pending
The present freeze is based on the compact sanity subset on the simpler world. Harder-world confirmation should remain a later step.

### 16.3 Broader controller cleanup still pending
The usefulness-controller surface is accumulating aspirational structure faster than the router logic is fully stabilizing. There is a growing mismatch between:

- the declared usefulness configuration surface in the schema/frontend,
- and the actual active usefulness-controller logic in the router.

That mismatch should remain on the cleanup/refactor radar rather than being ignored.

### 16.4 Recover must not become a vague catch-all
One continuing warning sign would be recover becoming too broad or semantically weak. The present checkpoint still preserves a meaningful distinction, but future work should guard against recover degenerating into a generic holding state.

---

## 17. Expected implementation touchpoints

The main touchpoints remained:

- `backend/api/routers/operational.py`
- `backend/awsrt_core/schemas/operational.py`
- `frontend/app/operational/designer/page.tsx`
- `frontend/app/operational/visualizer/page.tsx`

In practice, the main semantic work remained primarily in:

- `backend/api/routers/operational.py`

Schema and frontend surfaces now expose more than the currently stable controller meaning in some places, so further frontend/schema cleanup should wait until the controller direction stabilizes.

Also still on the radar:

- `backend/api/routers/operational.py` is becoming monolithic and should remain a near-future refactor target once the usefulness-controller direction stabilizes.

---

## 18. Recommended working sequence after freeze

### Step 1
Freeze Subgoal G as the current usefulness-semantics checkpoint.

### Step 2
Do **not** immediately broaden the usefulness scaffold again.

### Step 3
Treat the next work as either:
- cleanup/refactor and alignment of schema/frontend/router meaning,
- or a new, explicitly scoped successor subgoal.

### Step 4
If a successor subgoal is opened, begin from the frozen Subgoal G semantic interpretation rather than from the older Subgoal E/F delay behavior.

---

## 19. Short summary

Subgoal G is now a successful frozen checkpoint in the AWSRT v0.2 usefulness-controller line. Its purpose was to refine the semantic treatment of delay-heavy but still active information flow within the usefulness-regime scaffold. The main idea was that persistent staleness should be treated more explicitly as a **recover-style** condition rather than as a weakened path into the same **caution** semantics used for stronger corruption-side degradation.

The resulting checkpoint achieves that intended behavior on the compact sanity subset. Ideal remains exploit-dominant. Moderate corruption remains degraded and still meaningfully recover-oriented. Strong corruption remains caution-dominant. Most importantly, moderate and strong delay now read primarily as **stale-active recover regimes**, with only brief or limited caution excursions rather than caution collapse. The representative traces support that interpretation directly.

Subgoal G should therefore be frozen as the current semantics checkpoint, with future work focusing on cleanup, alignment, and only then any broader controller expansion.