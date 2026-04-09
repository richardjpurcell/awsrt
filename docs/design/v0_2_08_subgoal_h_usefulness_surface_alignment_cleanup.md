# AWSRT v0.2 Subgoal H: Usefulness Surface and Controller Alignment Cleanup

**Status:** Frozen checkpoint design note  
**Applies to:** `v0.2-subgoal-h`  
**Purpose:** Record the disciplined cleanup/alignment step taken after Subgoal G to reduce mismatch between the declared usefulness configuration surface, the frontend exposure of that surface, and the actual active controller logic implemented in the router.

---

## 1. Scope

This note defines **Subgoal H** for AWSRT v0.2.

Subgoal G refined the semantic treatment of staleness inside the compact usefulness-regime scaffold and produced a more defensible checkpoint for delay-heavy cases. That was the right next controller-facing step. However, the work leading up to and through Subgoal G also made a broader structural issue more visible:

- the schema declared a growing usefulness-related configuration surface,
- the designer exposed much of that surface as though it were operationally meaningful,
- the visualizer presented traces and summaries from multiple overlapping controller layers,
- but the router remained the true source of behavior, and not all exposed surface elements were equally active, stable, or semantically real.

This created a growing risk that AWSRT v0.2 would become harder to reason about for the wrong reason. The problem was not yet that the controller was too sophisticated. The problem was that the **declared surface was drifting ahead of the stable implemented semantics**.

Subgoal H therefore did **not** primarily aim to improve controller quality. Its purpose was to improve **controller legibility, alignment, and discipline**.

This was a cleanup/alignment subgoal, not a broad controller redesign.

It did **not** aim to deliver:

- a new usefulness-controller family,
- a merged usefulness/advisory/active control architecture,
- a major frontend redesign,
- a full router refactor,
- or a final long-term operational API.

It was instead a disciplined step to make the current v0.2 controller surface more honest and more maintainable.

---

## 2. Why Subgoal H was warranted

The main reason to do Subgoal H was that the project had reached a point where continued controller iteration without alignment cleanup would likely compound technical ambiguity.

The practical symptoms were visible.

### 2.1 Schema growth exceeded stable controller meaning
`schemas/operational.py` contained a substantial declared usefulness and regime-management surface. Some of this was genuinely active and meaningful. Some of it was partially wired. Some of it was aspirational. As this grew, it became harder to know which knobs were scientifically meaningful versus merely available.

### 2.2 Designer exposure implied stronger support than the router actually provided
`frontend/app/operational/designer/page.tsx` exposed a large amount of usefulness/regime configuration and presented it in a polished authoring flow. This was useful for experimentation, but it also risked implying that the full surface was stably implemented, equally meaningful, or equally recommended.

### 2.3 Visualizer semantics had become layered and overlapping
`frontend/app/operational/visualizer/page.tsx` carried:
- compact usefulness-prototype traces,
- advisory regime-management traces,
- active realized regime traces,
- mechanism audit traces,
- and MDC diagnostic traces.

Individually, many of these were useful. Collectively, they increased the risk that the visual surface would move ahead of the stable controller identity.

### 2.4 Router remained monolithic and was the real behavioral source
`backend/api/routers/operational.py` remained where the true implemented logic lived. That file had become increasingly monolithic. As a result, the distance between:
- declared schema semantics,
- exposed frontend semantics,
- and actual behavioral semantics

had become too large to leave unattended much longer.

So Subgoal H was justified not because progress had stalled, but because progress had created enough surface-area debt that a cleanup pass had become the higher-value disciplined step.

---

## 3. Main development question

The central question for Subgoal H was:

> how do we make the usefulness/controller surface more honest, more aligned, and easier to reason about, without prematurely collapsing useful experimental flexibility?

Equivalently:

> which parts of the current usefulness-related schema/UI/visualization surface are truly active and stable enough to expose as first-class controls, and which parts should be hidden, deferred, simplified, or relabeled until the controller direction stabilizes further?

This was fundamentally an **alignment question**, not a controller-optimization question.

Subgoal H was therefore not asking:

> what is the next controller trick?

It was asking:

> what exactly is real in the current v0.2 operational usefulness surface, and how should that reality be reflected consistently across schema, router, designer, and visualizer?

---

## 4. Development stance

Subgoal H followed the same disciplined v0.2 style:

- preserve the frozen Subgoal G checkpoint,
- prefer explicit cleanup over speculative expansion,
- keep real experimental flexibility where it is genuinely useful,
- but remove or soften implied guarantees that are ahead of implementation,
- improve naming and surface honesty before adding more behavior,
- and avoid turning cleanup into an architecture rewrite.

This meant Subgoal H still avoided:

- a full router decomposition,
- a total reorganization of the operational UI,
- a merged controller framework,
- or a new general theory of usefulness-state semantics.

The goal was not to make the system smaller at all costs. The goal was to make it **truer to itself**.

---

## 5. Diagnosis carried into Subgoal H

The issue was best understood as a three-layer mismatch.

### 5.1 Declared surface
The schema described a rich operational control/configuration space. This was where the system said what may exist.

### 5.2 Presented surface
The designer and visualizer presented that space to the user. This was where the system suggested what was meaningful now.

### 5.3 Active surface
The router implemented a subset of that space with real causal force. This was where the system actually behaved.

Subgoal H began from the diagnosis that these three were no longer aligned enough.

This did **not** mean the existing work was wrong. Much of the current surface had been useful to get to the present checkpoint. The issue was that experimental scaffolding was beginning to harden into apparent platform semantics before the controller direction was fully stable.

The most important distinction for Subgoal H was therefore:

- **active and stable enough to expose clearly**
versus
- **experimental, partial, deferred, or aspirational**

That distinction needed to become visible in the code surface.

---

## 6. Intended Subgoal H outcome

The target outcome for Subgoal H was a cleaner, more disciplined usefulness/control surface with the following properties.

### 6.1 The schema would become more honest
The schema should better distinguish:
- core active controls,
- experimental controls still under active interpretation,
- and deferred/aspirational surface that should not yet be treated as first-class.

### 6.2 The designer would become more honest
The designer should expose what was useful for disciplined experimentation, but it should not imply that every visible field was equally mature or equally recommended.

### 6.3 The visualizer would become easier to interpret
The visualizer should still support mechanism auditing, but the page should better reflect which traces corresponded to:
- the compact usefulness scaffold,
- the separate regime-management system,
- and general MDC diagnostics.

### 6.4 The router would remain the immediate behavioral source, but with cleaner semantic boundaries
Subgoal H did not require a full router refactor. However, the behavioral boundaries inside `operational.py` should become easier to identify and less dependent on UI/schema overstatement.

### 6.5 Future controller work would become safer
After H, a future controller-facing subgoal should be able to proceed with less ambiguity about what was:
- part of the stable scaffold,
- part of regime-management experimentation,
- and part of deferred future direction.

---

## 7. Recommended mechanism direction

Subgoal H proceeded by **alignment through classification**, not by deletion.

### 7.1 Classify the usefulness/control surface
Each relevant surface element was treated as one of:

1. **Core active**  
   Meaningfully implemented, behaviorally live, and appropriate for ordinary exposure.

2. **Experimental but real**  
   Implemented enough to support controlled experimentation, but needing explicit labeling and scope.

3. **Aspirational / deferred**  
   Present in the schema or UI, but not yet sufficiently active or semantically stable to present as a normal control.

### 7.2 Align labels and descriptions to that classification
The next step was not necessarily to delete fields. It was to make labels, grouping, and descriptions match the real status of each element.

### 7.3 Reduce misleading exposure before reducing capability
Where possible, Subgoal H preferred:
- hiding,
- collapsing,
- moving behind advanced or experimental framing,
- or clarifying text

before removing useful engineering surface entirely.

### 7.4 Keep G’s usefulness semantics frozen unless cleanup revealed direct contradiction
Subgoal H was not the place to casually reopen the Subgoal G controller logic unless an alignment issue made that unavoidable.

---

## 8. Candidate cleanup directions

Subgoal H considered compact cleanup candidates such as the following.

### Candidate A — expose only what is behaviorally active
Narrow schema/UI emphasis to the active usefulness scaffold and currently meaningful regime-management pieces, while leaving broader surface in place but de-emphasized or hidden.

This was the best first candidate.

### Candidate B — relabel experimental surfaces explicitly
Keep broader exposure, but clearly mark sections as:
- experimental,
- diagnostic,
- deferred,
- or not currently used in mainline operational comparison.

This was complementary to Candidate A.

### Candidate C — simplify visualizer section hierarchy
Preserve useful traces, but reorganize them into a clearer semantic stack:
- core operational traces,
- usefulness scaffold traces,
- regime-management traces,
- mechanism audit traces.

This was the best visualizer-facing move.

### Candidate D — establish internal cleanup boundaries in the router
Without a full refactor, improve code locality and naming inside `operational.py` so usefulness scaffold logic, regime-management logic, and diagnostics logic were less intertwined.

This was kept modest in H, not turned into a full rewrite.

The disciplined order remained:

1. classify active vs experimental vs aspirational,
2. align schema/designer/visualizer wording and exposure,
3. make only modest router-structure cleanup as needed,
4. defer major architectural refactor until controller direction is more stable.

---

## 9. What should not change first

Subgoal H avoided changing all of the following at once:

- controller semantics,
- surface semantics,
- visualization hierarchy,
- schema field structure,
- and router internals.

It also avoided:

- deleting large portions of useful experimental surface prematurely,
- pretending the current architecture was final,
- or turning a cleanup subgoal into a broad refactor campaign.

Subgoal H was about **alignment and cleanup**, not about winning elegance points.

---

## 10. Specific alignment questions

Subgoal H explicitly needed to answer questions like these.

### 10.1 Usefulness scaffold
- Which `usefulness_regime` fields were truly active and should remain first-class?
- Which were experimental but meaningful?
- Were any fields exposed but not meaningfully active?

### 10.2 Regime management
- Which `regime_management` controls were real and behaviorally live?
- Which parts were only diagnostic scaffolding or future-facing structure?
- Was the designer overexposing this layer for ordinary single-run work?

### 10.3 Designer semantics
- Did the layout imply maturity or recommendation that was not actually intended?
- Which sections should move behind advanced/experimental framing?
- Which summary text should be made more explicit about status?

### 10.4 Visualizer semantics
- Were the usefulness scaffold and regime-management traces clearly separated enough?
- Were “advisory,” “active,” and “mechanism audit” too close in presentation weight?
- What should count as the mainline interpretation path for a run?

### 10.5 Router semantics
- Where were active controller semantics actually decided?
- Where was the code mixing active behavior with broad surface accommodation?
- What minimal internal cleanup would improve legibility without derailing progress?

---

## 11. Validation goals

The main questions for Subgoal H were:

1. Is the declared usefulness/control surface now closer to the real implemented behavior?
2. Does the designer better distinguish ordinary controls from experimental ones?
3. Does the visualizer better separate compact usefulness semantics from broader regime-management machinery?
4. Is the router easier to reason about after minimal cleanup?
5. Can future subgoals proceed with less semantic ambiguity?
6. Did we preserve useful experimental capability while improving honesty?

Subgoal H was therefore a **surface-discipline** subgoal, not a controller-performance subgoal.

---

## 12. Validation layers

### 12.1 Layer 1 — alignment audit
Inspect and classify the current surface across:

- `backend/awsrt_core/schemas/operational.py`
- `frontend/app/operational/designer/page.tsx`
- `frontend/app/operational/visualizer/page.tsx`
- `backend/api/routers/operational.py`

Goal:
- identify active,
- experimental,
- and aspirational elements.

### 12.2 Layer 2 — minimal cleanup pass
Make the smallest changes that improved alignment:
- wording,
- grouping,
- hiding/de-emphasizing,
- or modest internal cleanup.

### 12.3 Layer 3 — sanity verification
Confirm that ordinary single-run behavior still worked for:
- ideal usefulness-proto case,
- representative delay case,
- representative noise case,
- and one active regime-management case.

### 12.4 Layer 4 — discussion handoff readiness
Check whether the post-H codebase was easier to explain in a fresh discussion:
- what was core,
- what was experimental,
- what was deferred,
- and what future subgoal should tackle next.

---

## 13. Suggested success criteria

Subgoal H would be considered successful if:

- schema, designer, visualizer, and router semantics were visibly better aligned,
- the usefulness scaffold was easier to explain as a compact controller,
- regime-management remained available without dominating the main identity,
- experimental/aspirational surface was clearly framed as such,
- and the next controller-facing subgoal could proceed from a cleaner baseline.

A strong success outcome would be:

- future discussions no longer needing repeated clarification about which controls were real, which were diagnostic, and which were future-facing.

---

## 14. Warning signs

Subgoal H would be treated as unsuccessful or incomplete if:

- the cleanup removed useful experimentation surface without replacing it with clarity,
- the router became more tangled while trying to tidy UI/schema semantics,
- visualizer simplification hid important mechanism-audit capability,
- or the project lost flexibility without gaining much honesty.

Another warning sign would be:

- trying to fully solve architecture in H.

That would have been too much for one disciplined subgoal.

---

## 15. Relationship to future controller work

Subgoal H was recommended **because** future controller work remained desirable.

A likely future direction after H is a new controller-facing subgoal that builds on the cleaned surface. That future direction may include:

- further usefulness-controller refinement,
- stronger separation between compact usefulness semantics and broader regime management,
- or a more principled consolidation of controller families.

But that should come **after** the current surface becomes easier to trust.

So H was not a retreat from forward progress. It was a way of making future forward progress less semantically expensive.

---

## 16. Relationship to future refactor work

This note did **not** propose a full refactor of:

- `backend/api/routers/operational.py`

However, it explicitly acknowledged that the router was becoming monolithic and should remain on the near-future refactor radar once controller direction stabilized further.

Subgoal H could include:
- modest internal cleanup,
- helper extraction if clearly local and safe,
- or better code-local semantic grouping.

It should not become:
- a full architectural decomposition subgoal.

That larger refactor likely deserves its own later checkpoint once the controller surface is more settled.

---

## 17. Expected implementation touchpoints

Primary files:

- `backend/api/routers/operational.py`
- `backend/awsrt_core/schemas/operational.py`
- `frontend/app/operational/designer/page.tsx`
- `frontend/app/operational/visualizer/page.tsx`

Recommended emphasis remained:

### First pass
- `backend/awsrt_core/schemas/operational.py`
- `frontend/app/operational/designer/page.tsx`
- `frontend/app/operational/visualizer/page.tsx`

### Then
- `backend/api/routers/operational.py`

Reason:
Subgoal H was primarily about **surface alignment**, so schema/UI/visualization were audited first, even though the router remained the behavioral source.

---

## 18. Recommended working sequence

### Step 1
Freeze Subgoal G and branch to Subgoal H.

### Step 2
Perform an explicit alignment audit across:
- schema,
- designer,
- visualizer,
- router.

### Step 3
Classify the current usefulness/control surface into:
- core active,
- experimental but real,
- aspirational/deferred.

### Step 4
Make the smallest cleanup changes that improved that alignment:
- wording,
- grouping,
- visibility,
- and minimal code-local cleanup.

### Step 5
Verify that representative usefulness-proto and regime-management runs still behaved as expected.

### Step 6
Freeze H if the surface was more honest and easier to reason about.

---

## 19. Subgoal H implementation summary

Subgoal H produced a disciplined alignment pass rather than a controller redesign.

### 19.1 Schema-side outcome
The schema was clarified to better reflect the real status of the current surface:

- the ordinary active operational surface remained centered on
  `run_mode`, `phy_id`, `impairments`, `network`, and `o1`,
- `regime_management` remained available as an implemented but still experimental overlay,
- `usefulness_regime` was explicitly framed as a retained richer manifest surface that is still only partially wired relative to the compact live router-side `usefulness_proto` scaffold,
- and several realism-oriented network knobs remained present but more clearly described as reserved or not currently in the main live backend path.

This improved schema honesty without prematurely deleting useful future-facing structure.

### 19.2 Designer-side outcome
The Operational Designer was revised to better communicate maturity and scope:

- the page more clearly foregrounded single-run operational authoring,
- comparison-study work remained explicitly directed to the Analysis Study Designer,
- `usefulness_regime` was presented only in the `usefulness_proto` context and explicitly labeled as partially wired experimental surface,
- `regime_management` was presented as an overlay/control family rather than the defining identity of the page,
- and advanced regime detail remained available, but behind clearer framing and toggled exposure.

This reduced the risk that users would interpret all visible controls as equally authoritative.

### 19.3 Visualizer-side outcome
The Operational Visualizer was tightened into a clearer semantic stack:

- core operational and current-frame interpretation remained primary,
- compact usefulness-prototype summaries and traces were kept distinct from regime-management summaries,
- advisory regime summaries were separated from realized active behavior,
- mechanism-audit material was retained but more clearly marked as diagnostic rather than identity-defining,
- and the interpretation path for a run became easier to explain:
  operational behavior first, overlay/controller machinery second, deep mechanism audit last.

This preserved useful diagnostic depth while improving readability.

### 19.4 Router-side outcome
The router remained monolithic, but modest cleanup improved semantic boundaries without changing intended controller behavior:

- advisory-summary naming was tightened so canonical advisory keys remained primary,
- redundant alias writing was reduced while compatibility remained supported at the reader/series layer,
- summary packing was reorganized into smaller helper-grouped semantic regions,
- and the distinction between compact usefulness scaffold summaries, advisory regime summaries, and active regime summaries became easier to identify in code.

This was intentionally modest. Subgoal H did not attempt a full router decomposition.

---

## 20. Validation outcome and freeze assessment

Subgoal H was verified against a small representative set of runs.

### 20.1 Ideal usefulness-proto case
The ideal `usefulness_proto` run remained entirely in exploit, with no recover or caution triggers, zero valid observation age, and matched true/arrived first detection timing. This confirmed that the cleanup did not introduce spurious regime activity in healthy conditions.

### 20.2 Delay-heavy usefulness-proto case
A representative delay case remained predominantly in `recover`, not `caution`, with elevated valid observation age and recover-trigger activity but no caution-trigger activity. This preserved the key Subgoal G semantic outcome that delay-heavy degradation should map to recover by default rather than to corruption-style caution.

### 20.3 Noise-heavy usefulness-proto case
A representative corruption/noise case still drove substantial time in `caution`, with clearly elevated misleading-activity statistics and distinct true-versus-arrived detection timing behavior. This preserved the intended corruption-side wedge and showed that the cleanup did not blur the delay/noise semantic distinction.

### 20.4 Active regime-management case
A representative active opportunistic regime run still showed nontrivial realized active behavior:
- multiple realized active transitions,
- meaningful split between downshift and certified occupancy,
- nontrivial leave-certified trigger activity,
- and interpretable active effective-control summaries.

This confirmed that the alignment pass did not break the live experimental regime-management layer.

### 20.5 Overall freeze judgment
The verification set supported the conclusion that Subgoal H achieved its intended outcome:

- no new controller-semantics regression was introduced by the alignment cleanup,
- the declared/presented/active surfaces became more consistent,
- and the codebase became easier to explain without sacrificing useful experimentation.

Subgoal H is therefore an appropriate **frozen cleanup/alignment checkpoint**.

---

## 21. Remaining radar after H

Subgoal H intentionally did not solve everything.

The main items that remain on radar after this checkpoint are:

- `backend/api/routers/operational.py` is still monolithic and remains a likely future refactor target once controller direction stabilizes further,
- the `regime_mechanism_audit_available` surface may still deserve a small honesty cleanup, since some runs show meaningful mechanism-audit content even when that summary flag does not fully reflect it,
- and future controller-facing work can now proceed from a cleaner baseline without needing to reopen H’s surface-legibility cleanup.

These are post-H follow-up items, not reasons to treat H as incomplete.

---

## 22. Short frozen summary

Subgoal H was the disciplined cleanup/alignment step after Subgoal G. Its purpose was not to push the usefulness controller further immediately, but to reduce the growing mismatch between the declared usefulness configuration surface, the frontend exposure of that surface, and the actual controller behavior implemented in the router. The subgoal classified what was truly active, what was experimental but real, and what remained aspirational or deferred, then aligned schema, designer, visualizer, and router semantics accordingly. The result is a cleaner and more honest v0.2 surface that preserves useful experimentation while making AWSRT easier to reason about and placing future controller work on a safer footing.