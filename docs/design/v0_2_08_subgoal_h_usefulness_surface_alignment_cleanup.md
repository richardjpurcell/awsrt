# AWSRT v0.2 Subgoal H: Usefulness Surface and Controller Alignment Cleanup

**Status:** Draft design note  
**Applies to:** `v0.2-subgoal-h`  
**Purpose:** Define the next disciplined step after Subgoal G by reducing the growing mismatch between the declared usefulness configuration surface, the frontend exposure of that surface, and the actual active controller logic implemented in the router.

---

## 1. Scope

This note defines **Subgoal H** for AWSRT v0.2.

Subgoal G refined the semantic treatment of staleness inside the compact usefulness-regime scaffold and produced a more defensible frozen checkpoint for delay-heavy cases. That was the right next controller-facing step. However, the work leading up to and through Subgoal G also made a broader structural issue more visible:

- the schema declares a growing usefulness-related configuration surface,
- the designer exposes much of that surface as though it were operationally meaningful,
- the visualizer presents traces and summaries from multiple overlapping controller layers,
- but the router remains the true source of behavior, and not all exposed surface elements are equally active, stable, or semantically real.

This creates a growing risk that AWSRT v0.2 will become hard to reason about for the wrong reason. The problem is not yet that the controller is too sophisticated. The problem is that the **declared surface is drifting ahead of the stable implemented semantics**.

Subgoal H therefore does **not** primarily aim to improve controller quality. Its purpose is to improve **controller legibility, alignment, and discipline**.

This is a cleanup/alignment subgoal, not a broad controller redesign.

It does **not** aim to deliver:

- a new usefulness-controller family,
- a merged usefulness/advisory/active control architecture,
- a major frontend redesign,
- a full router refactor,
- or a final long-term operational API.

It is instead a disciplined step to make the current v0.2 controller surface more honest and more maintainable.

---

## 2. Why Subgoal H is warranted now

The main reason to do Subgoal H now is that the project has reached a point where continued controller iteration without alignment cleanup would likely compound technical ambiguity.

The practical symptoms are now visible:

### 2.1 Schema growth exceeds stable controller meaning
`schemas/operational.py` contains a substantial declared usefulness and regime-management surface. Some of this is genuinely active and meaningful. Some of it is partially wired. Some of it is aspirational. As this grows, it becomes harder to know which knobs are scientifically meaningful versus merely available.

### 2.2 Designer exposure implies stronger support than the router actually provides
`operational/designer/page.tsx` exposes a large amount of usefulness/regime configuration and presents it in a polished authoring flow. This is useful for experimentation, but it also risks implying that the full surface is stably implemented, equally meaningful, or equally recommended.

### 2.3 Visualizer semantics are becoming layered and overlapping
`operational/visualizer/page.tsx` now carries:
- compact usefulness-prototype traces,
- advisory regime-management traces,
- active realized regime traces,
- mechanism audit traces,
- and MDC diagnostic traces.

Individually, many of these are useful. Collectively, they increase the risk that the visual surface becomes ahead of the stable controller identity.

### 2.4 Router remains monolithic and is the real behavioral source
`backend/api/routers/operational.py` is still where the true implemented logic lives. That file has become increasingly monolithic. As a result, the distance between:
- declared schema semantics,
- exposed frontend semantics,
- and actual behavioral semantics
is now too large to leave unattended much longer.

So Subgoal H is justified not because progress has stalled, but because progress has created enough surface-area debt that a cleanup pass is now the higher-value disciplined step.

---

## 3. Main development question

The central question for Subgoal H is:

> how do we make the usefulness/controller surface more honest, more aligned, and easier to reason about, without prematurely collapsing useful experimental flexibility?

Equivalently:

> which parts of the current usefulness-related schema/UI/visualization surface are truly active and stable enough to expose as first-class controls, and which parts should be hidden, deferred, simplified, or relabeled until the controller direction stabilizes further?

This is fundamentally an **alignment question**, not a controller-optimization question.

Subgoal H is therefore not asking:

> what is the next controller trick?

It is asking:

> what exactly is real in the current v0.2 operational usefulness surface, and how should that reality be reflected consistently across schema, router, designer, and visualizer?

---

## 4. Development stance

Subgoal H should follow the same disciplined v0.2 style:

- preserve the frozen Subgoal G checkpoint,
- prefer explicit cleanup over speculative expansion,
- keep real experimental flexibility where it is genuinely useful,
- but remove or soften implied guarantees that are ahead of implementation,
- improve naming and surface honesty before adding more behavior,
- and avoid turning cleanup into an architecture rewrite.

This means Subgoal H should still avoid, at least initially:

- a full router decomposition,
- a total reorganization of the operational UI,
- a merged controller framework,
- or a new general theory of usefulness-state semantics.

The goal is not to make the system smaller at all costs. The goal is to make it **truer to itself**.

---

## 5. Diagnosis carried into Subgoal H

The current issue is best understood as a three-layer mismatch.

### 5.1 Declared surface
The schema describes a rich operational control/configuration space. This is where the system says what may exist.

### 5.2 Presented surface
The designer and visualizer present that space to the user. This is where the system suggests what is meaningful now.

### 5.3 Active surface
The router implements a subset of that space with real causal force. This is where the system actually behaves.

Subgoal H begins from the diagnosis that these three are no longer aligned enough.

This does **not** mean the existing work is wrong. Much of the current surface was useful to get to the present checkpoint. The issue is that experimental scaffolding is beginning to harden into apparent platform semantics before the controller direction is fully stable.

The most important distinction for Subgoal H is therefore:

- **active and stable enough to expose clearly**
versus
- **experimental, partial, deferred, or aspirational**

That distinction should become visible in the code surface.

---

## 6. Intended Subgoal H outcome

The target outcome for Subgoal H is a cleaner, more disciplined usefulness/control surface with the following properties.

### 6.1 The schema becomes more honest
The schema should better distinguish:
- core active controls,
- experimental controls still under active interpretation,
- and deferred/aspirational surface that should not yet be treated as first-class.

### 6.2 The designer becomes more honest
The designer should expose what is useful for disciplined experimentation, but it should not imply that every visible field is equally mature or equally recommended.

### 6.3 The visualizer becomes easier to interpret
The visualizer should still support mechanism auditing, but the page should better reflect which traces correspond to:
- the compact usefulness scaffold,
- the separate regime-management system,
- and general MDC diagnostics.

### 6.4 The router remains the immediate behavioral source, but with cleaner semantic boundaries
Subgoal H does not require a full router refactor. However, the behavioral boundaries inside `operational.py` should become easier to identify and less dependent on UI/schema overstatement.

### 6.5 Future controller work becomes safer
After H, a future controller-facing subgoal should be able to proceed with less ambiguity about what is:
- part of the stable scaffold,
- part of regime-management experimentation,
- and part of deferred future direction.

---

## 7. Recommended mechanism direction

Subgoal H should begin with **alignment by classification**, not by deletion.

The recommended first move is:

### 7.1 Classify the current usefulness/control surface
Each relevant surface element should be treated as one of:

1. **Core active**  
   Meaningfully implemented, behaviorally live, and appropriate for ordinary exposure.

2. **Experimental but real**  
   Implemented enough to support controlled experimentation, but should be labeled/scoped accordingly.

3. **Aspirational / deferred**  
   Present in the schema or UI, but not yet sufficiently active or semantically stable to present as a normal control.

This classification should be the backbone of Subgoal H.

### 7.2 Align labels and descriptions to that classification
The next step is not necessarily to delete fields. It is to make labels, grouping, and descriptions match the real status of each element.

### 7.3 Reduce misleading exposure before reducing capability
Where possible, Subgoal H should prefer:
- hiding,
- collapsing,
- moving behind “advanced experimental” framing,
- or clarifying text

before removing useful engineering surface entirely.

### 7.4 Keep G’s usefulness semantics frozen unless cleanup reveals a direct contradiction
Subgoal H is not the place to casually reopen the Subgoal G controller logic unless an alignment issue makes that unavoidable.

---

## 8. Candidate cleanup directions

Subgoal H should consider compact cleanup candidates such as the following.

### Candidate A — expose only what is behaviorally active
Narrow the schema/UI emphasis to the active usefulness scaffold and currently meaningful regime-management pieces, while leaving broader surface in place but de-emphasized or hidden.

This is the best first candidate.

### Candidate B — relabel experimental surfaces explicitly
Keep broader exposure, but clearly mark sections as:
- experimental,
- diagnostic,
- deferred,
- or not currently used in mainline operational comparison.

This is likely complementary to Candidate A.

### Candidate C — simplify visualizer section hierarchy
Preserve all useful traces, but reorganize them into a clearer semantic stack:
- core operational traces,
- usefulness scaffold traces,
- regime-management traces,
- mechanism audit traces.

This is probably the best visualizer-facing move.

### Candidate D — establish internal cleanup boundaries in the router
Without a full refactor, improve code locality and naming inside `operational.py` so usefulness scaffold logic, regime-management logic, and diagnostics logic are less intertwined.

This should be modest in H, not a full rewrite.

The disciplined order should be:

1. classify active vs experimental vs aspirational,
2. align schema/designer/visualizer wording and exposure,
3. make only modest router-structure cleanup as needed,
4. defer major architectural refactor until controller direction is more stable.

---

## 9. What should not change first

Subgoal H should avoid changing all of the following at once:

- controller semantics,
- surface semantics,
- visualization hierarchy,
- schema field structure,
- and router internals.

It should also avoid:

- deleting large portions of useful experimental surface prematurely,
- pretending the current architecture is final,
- or turning a cleanup subgoal into a broad refactor campaign.

Subgoal H is about **alignment and cleanup**, not about winning elegance points.

---

## 10. Specific alignment questions to answer

Subgoal H should explicitly answer questions like these:

### 10.1 Usefulness scaffold
- Which `usefulness_regime` fields are truly active and should remain first-class?
- Which are experimental but meaningful?
- Are any fields currently exposed but not meaningfully active?

### 10.2 Regime management
- Which `regime_management` controls are real and behaviorally live?
- Which parts are only diagnostic scaffolding or future-facing structure?
- Is the current designer overexposing this layer for ordinary single-run work?

### 10.3 Designer semantics
- Does the current layout imply maturity or recommendation that is not actually intended?
- Which sections should move behind advanced/experimental framing?
- Which summary text should be made more explicit about status?

### 10.4 Visualizer semantics
- Are the usefulness scaffold and regime-management traces clearly separated enough?
- Are “advisory,” “active,” and “mechanism audit” currently too close in presentation weight?
- What should count as the mainline interpretation path for a run?

### 10.5 Router semantics
- Where are active controller semantics actually decided?
- Where is the code mixing active behavior with broad surface accommodation?
- What minimal internal cleanup would improve legibility without derailing progress?

---

## 11. Validation goals

The main questions for Subgoal H are:

1. Is the declared usefulness/control surface now closer to the real implemented behavior?
2. Does the designer better distinguish ordinary controls from experimental ones?
3. Does the visualizer better separate compact usefulness semantics from broader regime-management machinery?
4. Is the router easier to reason about after minimal cleanup?
5. Can future subgoals proceed with less semantic ambiguity?
6. Did we preserve useful experimental capability while improving honesty?

Subgoal H is therefore a **surface-discipline** subgoal, not a controller-performance subgoal.

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
Make the smallest changes that improve alignment:
- wording,
- grouping,
- hiding/de-emphasizing,
- or modest internal cleanup.

### 12.3 Layer 3 — sanity verification
Confirm that ordinary single-run behavior still works for:
- ideal usefulness-proto case,
- representative delay case,
- representative noise case,
- and one regime-management diagnostic case if needed.

### 12.4 Layer 4 — discussion handoff readiness
Check whether the post-H codebase is easier to explain in a fresh discussion:
- what is core,
- what is experimental,
- what is deferred,
- and what future subgoal should tackle next.

---

## 13. Suggested success criteria

Subgoal H should be considered successful if:

- schema, designer, visualizer, and router semantics are visibly better aligned,
- the usefulness scaffold is easier to explain as a compact controller,
- regime-management remains available without dominating the main identity,
- experimental/aspirational surface is clearly framed as such,
- and the next controller-facing subgoal can proceed from a cleaner baseline.

A strong success outcome would be:

- future discussions no longer need repeated clarification about which controls are real, which are diagnostic, and which are future-facing.

---

## 14. Warning signs

Subgoal H should be treated as unsuccessful or incomplete if:

- the cleanup removes useful experimentation surface without replacing it with clarity,
- the router becomes more tangled while trying to tidy UI/schema semantics,
- visualizer simplification hides important mechanism-audit capability,
- or the project loses flexibility without gaining much honesty.

Another warning sign would be:

- trying to fully solve architecture in H.

That would likely be too much for one disciplined subgoal.

---

## 15. Relationship to future controller work

Subgoal H is recommended **because** future controller work is still desirable.

A likely future direction after H is a new controller-facing subgoal that builds on the cleaned surface. That future direction may include:

- further usefulness-controller refinement,
- stronger separation between compact usefulness semantics and broader regime management,
- or a more principled consolidation of controller families.

But that should come **after** the current surface becomes easier to trust.

So H is not a retreat from forward progress. It is a way of making future forward progress less semantically expensive.

---

## 16. Relationship to future refactor work

This note does **not** propose a full refactor of:

- `backend/api/routers/operational.py`

However, it explicitly acknowledges that the router is becoming monolithic and should remain on the near-future refactor radar once controller direction stabilizes further.

Subgoal H may include:
- modest internal cleanup,
- helper extraction if clearly local and safe,
- or better code-local semantic grouping.

It should not become:
- a full architectural decomposition subgoal.

That larger refactor likely deserves its own later checkpoint once the controller surface is more settled.

---

## 17. Expected implementation touchpoints

Likely files:

- `backend/api/routers/operational.py`
- `backend/awsrt_core/schemas/operational.py`
- `frontend/app/operational/designer/page.tsx`
- `frontend/app/operational/visualizer/page.tsx`

Recommended emphasis:

### First pass
- `backend/awsrt_core/schemas/operational.py`
- `frontend/app/operational/designer/page.tsx`
- `frontend/app/operational/visualizer/page.tsx`

### Then
- `backend/api/routers/operational.py`

Reason:
Subgoal H is primarily about **surface alignment**, so schema/UI/visualization should probably be audited first, even though the router remains the behavioral source.

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
Make the smallest cleanup changes that improve that alignment:
- wording,
- grouping,
- visibility,
- and minimal code-local cleanup.

### Step 5
Verify that representative usefulness-proto runs still behave as expected.

### Step 6
Freeze H if the surface is now more honest and easier to reason about.

---

## 19. Short summary

Subgoal H is the recommended next step after Subgoal G. Its purpose is not to push the usefulness controller further immediately, but to reduce the growing mismatch between the declared usefulness configuration surface, the frontend exposure of that surface, and the actual controller behavior implemented in the router. The goal is to classify what is truly active, what is experimental, and what is still aspirational, then align schema, designer, visualizer, and router semantics accordingly. This should preserve useful experimentation while making AWSRT v0.2 easier to reason about and putting future controller work on a cleaner footing.