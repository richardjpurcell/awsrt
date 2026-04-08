# AWSRT v0.2 Subgoal F: Usefulness Delay Refinement

**Status:** Closure / findings note  
**Applies to:** `v0.2-subgoal-f`  
**Purpose:** Record the question, experiments, and outcome of the Subgoal F delay-side refinement attempt, and define the handoff to the next design step.

---

## 1. Scope

This note records **Subgoal F** for AWSRT v0.2 as a completed refinement attempt.

Subgoal F followed the frozen Subgoal E checkpoint for the compact three-regime usefulness scaffold:

- **exploit**
- **recover**
- **caution**

The purpose of Subgoal F was not to redesign the controller. It was to test whether the existing scaffold could be improved on the **delay side** through small, explicit, auditable transition refinements while preserving the corruption-side gains already achieved in Subgoal E.

In particular, Subgoal F asked whether delay-impaired runs could be made to spend more meaningful time in **recover** rather than collapsing too quickly into **caution**, without damaging the now-useful corruption-side recover/caution separation.

Subgoal F therefore remained intentionally narrow:

- no new usefulness states,
- no merge with advisory/active regime management,
- no large new signal families,
- no broad optimization campaign,
- and no opaque weighted redesign.

It was a targeted attempt to refine the current scaffold rather than replace it.

---

## 2. Checkpoint inherited from Subgoal E

Subgoal E provided the frozen baseline for this work.

At the Subgoal E checkpoint, the main behavioral picture was:

### 2.1 Ideal
Ideal runs were acceptable as a baseline:
- mostly exploit-dominant,
- not spuriously caution-heavy,
- and operationally interpretable.

### 2.2 Moderate corruption
Moderate noise had improved materially relative to earlier versions:
- recover occupancy had become meaningful,
- the middle regime was doing real work,
- and noise no longer collapsed immediately into caution in the same way as before.

### 2.3 Strong corruption
Strong noise remained clearly degraded and typically caution-dominant. This was desirable.

### 2.4 Delay
Delay-heavy cases still moved rapidly into caution and tended to remain there. This was interpretable in the sense that stale information does degrade support, but it remained coarser and more compressed than desired.

So by the end of Subgoal E, the scaffold was no longer broken. It was instead **asymmetric**:

- corruption-side structure had improved materially,
- delay-side structure remained too compressed.

That asymmetry motivated Subgoal F.

---

## 3. Main question of Subgoal F

The central question of Subgoal F was:

> can the existing three-regime usefulness scaffold be refined, using only small explicit transition changes, so that delay-impaired runs occupy recover more meaningfully before caution, while preserving the corruption-side recover/caution separation?

Equivalently:

> can the delay-side exploit-to-caution compression be reduced without weakening the now-useful corruption-side interpretation?

This question was pursued within the existing three-state semantics and with a strong preference for minimal, auditable mechanism changes.

---

## 4. Development stance used in Subgoal F

Subgoal F followed the same v0.2 discipline used in earlier subgoals:

- one mechanism change at a time,
- preserve the frozen checkpoint,
- prefer structural clarity over broad retuning,
- keep traces compact and auditable,
- and avoid adding complexity merely to make plots look more balanced.

This meant that Subgoal F explicitly avoided:

- adding a fourth usefulness state,
- redefining the full controller family,
- introducing many interacting thresholds at once,
- or entangling the work with advisory/active regime-management machinery.

The intended standard was not “make delay look nicer,” but rather:

> make the smallest principled change that improves delay-side legibility while staying faithful to the usefulness signals.

---

## 5. Diagnosis at the start of Subgoal F

The working diagnosis was that age degradation was still mapped too directly into caution.

The approximate frozen Subgoal E pattern was:

- ideal: exploit-dominant,
- moderate noise: recover-heavy,
- strong noise: caution-dominant,
- delay-heavy: caution-dominant very quickly.

This suggested that the delay pathway was still too close to:

- age support crosses threshold,
- recover appears only briefly or not at all,
- caution then dominates.

The problem was not that delay should look healthy. It should not. The problem was that the existing scaffold left too little room for:

- guarded continuation,
- prolonged recover occupancy,
- or a staged degradation under stale-but-still-active information flow.

---

## 6. Refinement candidates considered in Subgoal F

Subgoal F considered the following small refinement directions:

### 6.1 Stricter age-only caution qualification
Make age-driven caution harder to enter than corruption-driven caution.

### 6.2 Asymmetric persistence
Require longer persistence for age-driven caution than for corruption-driven caution while preserving the corruption-side caution pathway.

### 6.3 Recover-biased delay pathway
Bias delay-heavy cases toward remaining in recover unless degradation becomes especially severe or corruption-side evidence is also present.

These were all attempts to stay within the same scaffold rather than introducing a new semantic design.

---

## 7. Implemented Subgoal F experiments

Several disciplined backend-local refinement attempts were tried in `backend/api/routers/operational.py`, with the rest of the surface largely held fixed.

The main experiment types were:

### 7.1 Age-only caution persistence refinement
Age-only caution was made to require longer persistence than corruption-driven caution.

### 7.2 Stricter age-only caution threshold refinement
Age-only caution was given a stricter threshold than the shared caution threshold.

### 7.3 Separate age-side caution counter
A distinct age-driven caution persistence path was introduced rather than reusing only the same caution counter used for corruption-side caution.

### 7.4 Recover-biased age-only routing
Age-only degradation was biased toward recover before caution, again without weakening the corruption-side caution path.

These changes were intentionally kept local and explicit. They were not exposed through broader schema/frontend redesign because the first question was whether the current mechanism family could be made to work at all.

---

## 8. Validation subset used

All Subgoal F experiments were validated first on the compact six-case sanity subset:

- ideal
- delay 1
- delay 4
- delay 8
- noise 0.1
- noise 0.45

The main audit quantities used were:

- exploit fraction
- recover fraction
- caution fraction
- final state
- trigger hit counts
- recent age last
- recent misleading positive fraction last
- recent driver info last

Representative traces were then inspected only after compact summaries.

---

## 9. Main empirical outcome of Subgoal F

The overall outcome was mixed.

### 9.1 What improved
Subgoal F did show that small transition refinements could improve the **mild delay** case:

- delay 1 became meaningfully recover-dominant rather than caution-collapsed,
- ideal remained clean,
- moderate corruption retained recover-heavy structure,
- and strong corruption retained caution.

This was useful evidence: the controller was not completely rigid on the delay side.

### 9.2 What did not improve enough
However, the more important moderate and strong delay cases did **not** materially de-compress:

- delay 4 remained strongly caution-dominant,
- delay 8 remained strongly caution-dominant,
- recover occupancy improved only marginally in those cases,
- and repeated small refinements did not produce a qualitatively different delay-side structure.

In other words, the changes could nudge the delay side, but they did not materially change the overall story for moderate and strong delay.

### 9.3 What remained preserved
Importantly, the corruption-side behavior remained broadly intact across these experiments:

- moderate noise still retained meaningful recover occupancy,
- strong noise still retained strong access to caution,
- ideal did not become spuriously recover-heavy.

So Subgoal F did not damage the most important Subgoal E gain. The main issue was that it also did not materially solve the delay-side compression problem.

---

## 10. Interpretation

The main conclusion of Subgoal F is:

> within the current exploit / recover / caution scaffold, small transition-level patching was sufficient to preserve corruption-side structure and improve mild delay, but not sufficient to materially restructure moderate/strong delay behavior.

This suggests that the present usefulness scaffold may still be semantically too eager to interpret persistent staleness as caution, even when the intended interpretation for delay-heavy but still-active information flow is closer to recover.

So the practical lesson is not that the usefulness scaffold failed altogether. It is that this particular **refinement path** appears to have reached diminishing returns.

---

## 11. What Subgoal F did and did not establish

### 11.1 What Subgoal F established
Subgoal F established that:

- the Subgoal E corruption-side gains are reasonably stable under small local refinements,
- mild delay can be made more recover-like,
- but moderate and strong delay are not materially fixed by further threshold/persistence patching alone.

### 11.2 What Subgoal F did not establish
Subgoal F did **not** establish that the current three-state semantics are the best possible semantics for delay-heavy cases.

It also did not establish that delay-side improvement is impossible. Rather, it suggests that further progress likely requires a more explicit semantic design step rather than continued micro-calibration inside the same local mechanism family.

---

## 12. Outcome classification

Subgoal F should therefore be treated as:

- **useful exploratory work**,
- **not a frozen controller success**, and
- **not a dead end**, but a boundary result showing what this refinement path could and could not achieve.

A fair summary is:

- mild success on delay 1,
- preservation of corruption-side structure,
- insufficient success on delay 4 and delay 8,
- and clear evidence that the next step should be conceptual rather than another small patch.

---

## 13. Handoff to the next design step

The appropriate handoff after Subgoal F is **not** to continue layering more small age-threshold and persistence tweaks into the same scaffold.

Instead, the next subgoal should ask a more explicit semantic question, such as:

> should stale-but-still-active delay behavior be treated more explicitly as a recover-style condition, with caution reserved more specifically for corruption or severe sustained breakdown?

That next step should still remain disciplined and compact, but it should be framed as a new design move rather than as another minor calibration pass inside Subgoal F.

---

## 14. Expected implementation touchpoints for the next step

The next subgoal will still likely begin with:

- `backend/api/routers/operational.py`

and should continue to avoid unnecessary schema/frontend expansion until the new semantic direction is clear.

Other files remain on the radar:

- `backend/awsrt_core/schemas/operational.py`
- `frontend/app/operational/designer/page.tsx`
- `frontend/app/operational/visualizer/page.tsx`

but the first design step should remain backend-local unless and until a more stable mechanism emerges.

---

## 15. Recommended closeout sequence for Subgoal F

### Step 1
Reset `backend/api/routers/operational.py` to the clean Subgoal F baseline after exploratory edits.

### Step 2
Retain this note as the closure/findings record for Subgoal F.

### Step 3
Start a new branch/subgoal for the next design step.

### Step 4
Create a new design note centered on the next semantic question rather than on further micro-patching.

---

## 16. Short summary

Subgoal F tested whether the frozen Subgoal E usefulness scaffold could be improved on the delay side through small explicit refinements such as stricter age-only caution qualification, asymmetric persistence, separate age-side caution persistence, and recover-biased delay routing. These experiments preserved the useful corruption-side recover/caution separation and improved the mild delay case, but they did not materially de-compress moderate and strong delay behavior. The main conclusion is that the small-patch Subgoal F refinement path has likely reached diminishing returns. The next step should therefore be a new design subgoal focused on the semantics of stale-but-still-active delay behavior rather than further threshold/persistence patching inside the current local mechanism family.