# AWSRT Development Roadmap Beyond v0.2

**Status:** Draft planning note  
**Applies to:** `post-v0.2 / pre-v0.3`  
**Purpose:** Define the staged development roadmap beyond the frozen AWSRT v0.2 release, using the older beyond-v0.1 roadmap as historical guidance while revising priorities in light of what AWSRT v0.2 actually achieved.

---

## 1. Purpose of this note

This note defines the next disciplined planning step after the AWSRT v0.2 freeze.

Its purpose is to state, in one place and in plain terms:

- where AWSRT now stands after the frozen v0.2 release,
- what v0.3 should and should not be,
- what work deserves near-term priority for thesis and scientific payoff,
- what realism work is justified now versus later,
- and which software and UI catch-up tasks matter immediately versus which should remain secondary.

This is not an implementation note and not yet a subgoal note. It is a planning note meant to establish the staged development roadmap that should guide the start of AWSRT v0.3.

---

## 2. Starting point after AWSRT v0.2

AWSRT v0.2 is now best understood as a **disciplined operational/control checkpoint** built after the broader AWSRT v0.1 scientific results phase.

Its main achievements are interpretive, structural, and release-facing rather than expansive in the sense of a new broad campaign. In particular, AWSRT v0.2 established:

- a clearer compact usefulness interpretation path,
- a clearer advisory-versus-active regime boundary,
- more inspectable active mechanism behavior,
- cleaner operational reporting and validation truthfulness,
- and a compact frozen evidence bundle suitable for release-facing and thesis-facing interpretation.

This matters because the platform now enters its next phase from a cleaner baseline. AWSRT v0.2 did not produce a final unified controller and did not replace the broader v0.1 scientific chapter. What it did produce is a more honest and more legible operational/control baseline from which the next stage of controller development can proceed.

That is the key inheritance for planning beyond v0.2.

---

## 3. What v0.2 leaves settled and what it leaves open

### 3.1 What v0.2 leaves settled

The following should now be treated as frozen baseline assumptions rather than reopened planning questions.

- The compact usefulness path is now readable as an operational interpretation layer rather than only as a software-facing scaffold.
- Advisory and active regime summaries should not be read interchangeably.
- The active mechanism layer is now more inspectable, especially through the opportunistic-family package.
- The compact usefulness path and broader regime-management layer are related but not fully unified.
- The final v0.2 release should be read through a compact curated evidence bundle rather than through a disguised second large campaign.

These are not small cosmetic gains. They materially improve the truthfulness and legibility of the platform’s late-stage operational/control surfaces.

### 3.2 What v0.2 leaves open

At the same time, AWSRT v0.2 intentionally leaves several questions unresolved.

- It does not establish a final unified controller architecture.
- It does not settle the full relationship between compact usefulness control and broader regime-management logic.
- It does not provide a broad repeated-run adaptive-control evidence base.
- It does not establish strong realism or validation claims tied to real wildfire operations.
- It does not resolve all software-surface parity gaps across operational, belief, and analysis sections.
- It does not eliminate the architectural pressure created by a still-monolithic `backend/api/routers/operational.py`.

These open questions define the terrain for the next stage.

---

## 4. Main planning conclusion beyond v0.2

The main conclusion of this note is:

> AWSRT should not treat post-v0.2 work as another semantic cleanup cycle. It should treat v0.3 as the first post-v0.2 adaptive-control development stage, while allowing one narrow realism bridge where that bridge directly supports meaningful experimentation.

This preserves the logic of the older beyond-v0.1 roadmap while updating it in light of what v0.2 actually accomplished.

The older roadmap was directionally correct:

- v0.2 should make usefulness actionable,
- v0.3 should strengthen adaptive control,
- broader realism and validation should come later.

That sequence should still hold.

However, it now needs one important refinement. Because AWSRT v0.2 froze a cleaner and more interpretable operational/control baseline, one bounded realism bridge is now justified earlier than the older roadmap would have implied: the ability to run deployment simulations meaningfully on transformed real-fire data through bounded execution windows.

That bridge should remain narrow and disciplined. It should not be allowed to turn v0.3 into a broad realism-expansion phase.

---

## 5. What v0.3 should be

AWSRT v0.3 should be the stage that **strengthens adaptive control from the now-cleaner v0.2 baseline**.

Its scientific identity should be:

- post-interpretive rather than interpretation-repair,
- control-facing rather than release-packaging-facing,
- failure-mode-aware rather than static-ranking-centered,
- and mechanism-legible rather than optimization-heavy for its own sake.

More concretely, v0.3 should focus on the following.

### 5.1 Stronger adaptive-control logic

The next control step should move beyond a merely readable usefulness/control surface and toward more capable adaptive behavior.

That includes:

- richer active-control behavior where scientifically justified,
- better response to diagnosed degradation,
- more disciplined use of impairment-facing and usefulness-facing signals,
- and tighter transition logic that is easier to interpret causally.

This does not require broad controller unification. It does require better active behavior.

### 5.2 Tighter linkage between diagnostics and transitions

A central v0.3 aim should be to make control transitions more clearly grounded in diagnosed conditions rather than in only loosely associated thresholds.

That means:

- more explicit use of degradation signals,
- clearer distinction among stale, corrupted, and otherwise weakened information conditions,
- and stronger causal readability between what the diagnostics say and how control responds.

This is one of the highest-payoff continuations of the wedge story from v0.1 and the interpretive cleanup from v0.2.

### 5.3 Systematic failure-mode experiments

The next stage should not primarily be about adding more policy families or building a large policy zoo.

Instead, it should focus on:

- failure-mode-centered experiments,
- controlled transition stress tests,
- repeated-run studies where they materially improve interpretability,
- and compact but disciplined study families that clarify how adaptive control behaves under degraded information conditions.

This is where the strongest thesis and scientific payoff is most likely to lie.

### 5.4 Mechanism-sensitive active-control studies

Because AWSRT v0.2 made the active mechanism layer more legible, AWSRT v0.3 should capitalize on that by designing experiments that are mechanism-sensitive rather than outcome-only.

That includes:

- studies where transition activity itself is meaningful,
- studies where hysteresis, persistence, or trigger-severity variations are scientifically interpretable,
- and studies where comparable headline outcomes can still hide meaningful control differences.

This should be treated as a feature of the research program, not as a distraction from it.

---

## 6. What v0.3 should not be

AWSRT v0.3 should explicitly avoid becoming any of the following.

- a broad realism-expansion program,
- a major platform redesign,
- a full controller-unification effort,
- a UI-polish-first release cycle,
- a large benchmark-suite phase without a sharp scientific question,
- or an optimization-heavy controller search program detached from interpretability.

In particular, v0.3 should not begin by reopening the controller-boundary discipline established during v0.2. The limited-bridge interpretation remains the right frozen baseline:

- the compact usefulness path remains the clearest compact usefulness-controller identity,
- the broader regime-management layer remains the richer advisory/active mechanism surface,
- and later work should improve control behavior from within that boundary rather than erasing it prematurely.

---

## 7. Near-term priority categories beyond v0.2

The roadmap beyond v0.2 should be organized into four distinct priority categories.

### 7.1 Near-term v0.3 scientific/control priorities

This is the primary category and should define the identity of v0.3.

Highest-priority work includes:

- stronger adaptive active-control logic,
- tighter diagnostic-to-transition linkage,
- systematic failure-mode experiments,
- compact robustness and repeated-run studies where scientifically useful,
- and mechanism-facing evaluation that keeps active behavior readable.

This category has the strongest payoff for the thesis because it most directly extends the core AWSRT scientific narrative:

- information delivered is not the same as information operationally useful,
- impairments degrade usefulness differently,
- and adaptive control should respond to those distinctions in an interpretable way.

### 7.2 Targeted real-fire deployment-simulation bridge

This is the most important near-term realism task, but it should remain tightly bounded.

The planning goal is not a large realism expansion. It is to establish whether the current operational/deployment stack can run meaningfully on already transformed real-fire datasets.

At present, one concrete blocker is especially clear:

- real-fire runs can span very long horizons,
- the current operational path appears to inherit the full physical-run horizon by default,
- and deployment experimentation therefore needs bounded execution-window support.

The near-term bridge should therefore focus on:

- adding bounded deployment-window support for operational runs,
- exposing that support cleanly enough for experimentation,
- testing current control/deployment surfaces against selected real-fire windows,
- and fixing only the backend or UI seams that block this bounded bridge.

This should not be framed as broad validation. It is a tractable realism bridge and an execution-surface test.

### 7.3 Secondary UI and parity catch-up work

Several parts of the platform appear to lag behind the operational section or to remain structurally rougher than ideal.

Examples include:

- Belief designer and visualizer catch-up,
- Analysis batch page catch-up,
- Analysis graphic page catch-up,
- Analysis raw page catch-up,
- and broader cleanup pressure around `backend/api/routers/operational.py`.

These tasks matter, but they should be triaged carefully.

Near-term rule:

> only do these tasks immediately if they block adaptive-control experimentation or the bounded real-fire deployment-simulation bridge.

Otherwise, they should remain secondary to the scientific/control agenda.

### 7.4 Longer-term realism and platform expansion

This category should remain later.

It includes:

- broader real-fire scenario libraries,
- stronger operational realism and validation claims,
- heterogeneous sensing expansions,
- stronger real-world constraint modeling,
- broader deployment tooling,
- major architectural decomposition,
- and any serious controller-surface redesign or full controller unification effort.

These are important, but they should not define the first stage beyond v0.2.

---

## 8. Realism work: what is worth doing now versus later

Because realism is now becoming more relevant, it is useful to state the planning rule explicitly.

### 8.1 Realism work worth doing now

Realism work is worth doing now only if it directly supports the next scientific/control question.

That currently points to:

- bounded execution-window support for deployment simulation,
- targeted testing on transformed real-fire slices,
- and selective UI/backend support needed to make those runs practical and interpretable.

This kind of realism work is justified because it tests whether the current control/deployment surfaces can operate meaningfully outside short controlled synthetic horizons.

### 8.2 Realism work that should wait

The following should remain later-stage work:

- broad real-fire scenario-library buildup,
- strong operational validation claims,
- large-scale benchmark campaigns on real-fire archives,
- broad realism-driven UI redesign,
- and realism expansion that outruns the maturity of the adaptive-control core.

The planning principle remains:

> realism should support scientific tightening, not replace it.

---

## 9. Software and UI priorities: what matters now and what can wait

### 9.1 Software and UI work that matters immediately

Immediate software and UI work should be limited to the work that directly enables the next scientific stage.

That currently includes:

- any schema, backend, and UI support needed for bounded deployment windows,
- any small control-surface support changes needed to run the next adaptive-control studies cleanly,
- and any minimal reporting or export support needed to evaluate those studies reproducibly.

This is enabling work, not broad cleanup.

### 9.2 Software and UI work that can wait

The following can remain secondary unless they become blockers:

- broad designer polish,
- broad visualizer parity work,
- analysis-page polish beyond immediate experiment support,
- major router modularization,
- and frontend/backend cleanup performed mainly for aesthetic or architectural reasons.

This does not mean those tasks are unimportant. It means they should not displace the more scientifically valuable near-term work.

---

## 10. Updated staged roadmap beyond v0.2

The roadmap beyond v0.2 should now be read as follows.

| Stage | Core aim | Primary focus | Priority |
|---|---|---|---|
| **v0.3** | Strengthen adaptive control from the clarified v0.2 baseline | Diagnostic-linked transition logic; stronger active-control behavior; failure-mode-centered studies; mechanism-legible repeated and stress experiments | **Must do next** |
| **v0.3 bridge work** | Make real-fire deployment simulation experimentally tractable | Bounded execution windows; targeted real-fire slice testing; selective backend/UI support for tractable deployment runs | **Do alongside early v0.3** |
| **Later** | Expand realism, validation, and platform maturity | Broader real-fire scenario libraries; stronger realism claims; heterogeneous sensing; major architecture and parity cleanup; later controller convergence questions | **Later** |

This staging preserves the older roadmap’s scientific logic while incorporating what AWSRT v0.2 actually made possible.

---

## 11. Best first milestone after v0.2

The best first milestone after the v0.2 freeze is:

> define and run the first disciplined v0.3 control studies while adding bounded deployment-window support for real-fire deployment simulation.

This milestone is strong for several reasons.

- It preserves the primary identity of v0.3 as an adaptive-control stage.
- It turns the v0.2 baseline into active scientific progress rather than more interpretation repair.
- It gives the project an immediate realism bridge without allowing realism to take over the roadmap.
- It forces the next control logic and experiment design to remain compact, interpretable, and thesis-relevant.
- It creates a natural bridge to later v0.3 subgoal notes.

A good first implementation-facing formulation of that milestone would likely be:

- choose one compact adaptive-control improvement target,
- define one small but systematic failure-mode study family around it,
- add bounded execution-window support needed for real-fire deployment slices,
- and validate that both the synthetic and real-fire-facing paths remain interpretable.

---

## 12. Suggested v0.3 note sequence

A plausible early v0.3 note sequence would be:

### 12.1 v0.3 planning / launch note
Define the first actual v0.3 subgoal from this roadmap.

### 12.2 first adaptive-control subgoal
Focus on one bounded control improvement:
- stronger transition logic,
- better degradation-response distinction,
- or a comparable mechanism-readable improvement.

### 12.3 bounded real-fire execution-window note
Add the minimal schema/backend/UI support needed to limit operational run horizons for real-fire deployment simulation.

### 12.4 experiment and validation note
Define the first compact v0.3 study family and the criteria for interpreting it honestly.

This sequence would keep the work disciplined and prevent the project from collapsing into one large mixed implementation phase.

---

## 13. Bottom line

The right next step beyond AWSRT v0.2 is not to reopen semantic cleanup and not to expand realism broadly.

It is to begin AWSRT v0.3 as the first **post-v0.2 adaptive-control development stage**, using the cleaner and more truthful v0.2 operational/control baseline to pursue:

- stronger adaptive behavior,
- clearer diagnostic-to-transition linkage,
- more systematic failure-mode experiments,
- and mechanism-legible active-control studies.

Alongside that, one narrow realism bridge is now justified:

- bounded deployment-window support for running deployment simulations on transformed real-fire data.

Everything else should be prioritized relative to those two aims. If a software, UI, or cleanup task directly enables them, it is near-term work. If it does not, it should remain secondary or later.

That gives AWSRT a disciplined path beyond v0.2: scientifically tighter than a broad expansion, more operationally ambitious than v0.2 itself, and better aligned with the strongest remaining thesis payoff.

---

## 14. Short planning summary

AWSRT v0.2 froze a cleaner operational/control checkpoint rather than a final unified controller. The correct next step is therefore not another interpretive cleanup cycle, but a new stage centered on stronger adaptive control. AWSRT v0.3 should focus on diagnostic-linked active-control improvement, failure-mode-aware experiment design, and mechanism-legible study families. A narrow real-fire bridge is now justified, specifically through bounded deployment-window support for deployment simulation on transformed real-fire data. Broader realism expansion, broad UI catch-up, and major architectural cleanup should remain secondary unless they directly block those near-term goals.