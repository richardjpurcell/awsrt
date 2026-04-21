# AWSRT v0.5 Subgoal 01b: Delay-Side Refinement for the Compact Usefulness Triad

**Status:** Draft design note  
**Applies to:** `v0.5-subgoal-01`  
**Suggested file:** `docs/design/v0_5_01b_usefulness_triad_delay_refinement.md`  
**Purpose:** Record the first bounded controller-facing refinement step after the usefulness designer/visualizer truthfulness pass by addressing the delay-side compression of the compact usefulness triad on transformed real-fire conditions.

---

## 1. Purpose of this note

This note defines the next bounded step inside AWSRT v0.5 Subgoal 01.

The designer/visualizer truthfulness pass has now made the compact usefulness layer more readable and more honestly separated from the broader regime-management layer. That pass clarified an important fact:

* the compact usefulness layer is live,
* the usefulness summaries and traces are now visible for usefulness runs,
* and those summaries/traces are no longer incorrectly shown for non-usefulness regime runs.

That means the next weakness is no longer primarily one of frontend truthfulness.

It is now a scientific/controller-facing weakness in the current compact usefulness reading itself.

The initial three usefulness probes, extended to the 400-step slice, now suggest the following first bounded reading:

* the healthy probe reads **partly as intended**, with exploit the largest occupancy but with noticeable recover/caution cycling,
* the noise probe reads **strongly as caution-dominant**,
* but the delay probe currently also collapses mostly into **caution** rather than reading primarily as **recover**.

This note therefore defines a bounded delay-side refinement pass whose purpose is **not** to redesign the usefulness controller, but to test whether the compact triad can better preserve the intended stale-but-restorable reading on transformed real-fire runs.

---

## 2. Why a new note is needed

A new note is preferable to extending the designer truthfulness note because the project has crossed a boundary.

The previous note was about:

* wording,
* emphasis,
* section structure,
* summary visibility,
* trace visibility,
* and honest frontend presentation of the live compact path.

The next step is about something else:

* the behavioral balance of the compact usefulness triad itself,
* especially the separation between **recover** and **caution** under delay-heavy conditions.

That is a different subproblem and should be recorded separately.

---

## 3. Current scientific reading after the first 400-step usefulness probes

The first bounded usefulness probe family already gives a usable reading.

It does **not** yet justify saying the triad is fully stabilized, but it is now strong enough to show where the real weakness lies.

### 3.1 Healthy probe

The healthy probe is the most mixed case, but it still leans in the intended direction.

Observed reading:

* exploit is the largest occupancy fraction,
* exploit/recover/caution all appear,
* recover-from-caution and exploit re-entry are both active,
* recent observation age remains low,
* and misleading-activity indicators remain small.

This means the healthy run is **not** a clean pure-exploit case, but it is still plausibly readable as a healthy-usefulness condition whose dominant posture is exploit.

That is good enough, at this stage, to treat the exploit side of the compact usefulness triad as **promising but not yet perfectly settled**.

### 3.2 Noise probe

The noise probe is the clearest current success.

Observed reading:

* caution is overwhelmingly dominant,
* caution is the final usefulness state,
* exploit occupancy is nearly absent,
* recover occupancy is only brief,
* and the run collapses into caution very early, with only a brief later re-entry toward recover before returning to caution.

This is close to the intended corruption-like reading.

It suggests that the caution side of the compact usefulness triad is already scientifically legible under noise-heavy impairment.

### 3.3 Delay probe

The delay probe is the problematic case.

It does show strong staleness evidence:

* recent observation age is elevated,
* delay semantics are clearly present in the compact outputs,
* the run does not read as healthy,
* and recover does appear early.

However, the present compact usefulness reading does **not** settle primarily into recover.

Instead, the delay probe remains mostly caution-dominant, with recover present but secondary.

That means the current compact usefulness controller is still compressing severe staleness too strongly toward caution.

This is the main issue addressed by this note.

---

## 4. Main question of this pass

The bounded question is:

> can the compact usefulness layer preserve a more distinct **recover** reading under delay-heavy transformed real-fire conditions, while keeping healthy runs exploit-leaning and noise-heavy runs caution-dominant?

This is a refinement question, not a redesign question.

---

## 5. Scope of this pass

This pass is intentionally small.

It **is**:

* a delay-side refinement pass,
* a compact usefulness-controller interpretation pass,
* a scientific probe of recover-versus-caution separation,
* and a bounded tuning/inspection step.

It is **not**:

* a full usefulness-controller redesign,
* a schema rewrite,
* a usefulness/regime merge,
* a broad threshold sweep across all controller surfaces,
* or a claim that the compact triad is now final.

---

## 6. What this pass should try to preserve

Any delay-side refinement should preserve the two readings that already appear promising.

### 6.1 Preserve healthy → exploit-leaning

The healthy probe should remain recognizably healthy and primarily exploit-facing.

This does **not** require a perfectly pure exploit occupancy. Some cycling may remain acceptable. What matters is that healthy conditions should still read as belonging mainly to the exploit side of the triad rather than drifting toward persistent caution.

The goal is not to make the controller more active everywhere. The goal is to keep healthy conditions reading as healthy.

### 6.2 Preserve noise/corruption → caution

The noise probe should remain strongly caution-facing.

The goal is not to weaken caution globally. The goal is to avoid overusing caution for conditions that are primarily stale rather than corruption-like.

---

## 7. What this pass should try to change

The target change is narrow.

### 7.1 Reduce delay-side compression into caution

Under delay-heavy but otherwise non-corruption-like conditions, the compact usefulness path should have more room to occupy **recover** rather than being pulled too quickly or too persistently into **caution**.

### 7.2 Preserve the meaning of recover

Recover should remain the middle regime associated with:

* stale-but-restorable information conditions,
* weakened timeliness,
* but not necessarily corruption-like misleadingness.

### 7.3 Keep caution more reserved for corruption-like compromise

Caution should remain available for severe impairment, but it should not absorb too much of the pure-delay case if the scientific story is supposed to preserve a stale-versus-corrupt distinction.

---

## 8. Recommended bounded implementation direction

This note does not prescribe exact code changes yet, but it does define the preferred direction.

### 8.1 Favor a narrow delay-side adjustment first

The first refinement should be delay-side and minimal.

Good candidate directions include:

* making caution entry harder when the dominant issue is age/staleness rather than misleading activity,
* making recover more persistent under high-age / low-misleading conditions,
* refining the stale-versus-corruption boundary so delay-heavy cases can stabilize in recover more often,
* or tightening the specific conditions under which severe delay is allowed to promote from recover into caution.

### 8.2 Prefer semantic clarification over raw retuning

The first move should preferably preserve the current triad interpretation rather than simply moving thresholds around blindly.

The strongest direction is to clarify the intended meaning of:

* **recover** = stale-but-active, weakened but still restorable,
* **caution** = corruption-like, strongly compromised, or severe stale-and-misleading conditions.

That means a narrow semantic clarification is preferable to a broad numerical retuning pass.

### 8.3 Avoid broad cross-signal redesign

Do **not** begin by rewriting the full compact usefulness trigger system.

Do **not** expand the richer manifest surface into authoritative control.

Do **not** combine usefulness logic with regime-management logic in this pass.

### 8.4 Keep the first evaluation loop simple

After any bounded refinement, rerun the same three probes:

* healthy,
* delay,
* noise.

This preserves comparability and keeps the scientific question tight.

---

## 9. Files most likely involved

The main logic is likely still in the compact backend usefulness-controller path.

Primary likely file:

```text
backend/api/routers/operational.py
```

In particular, the refinement is likely to touch the live compact usefulness trigger/transition helpers rather than frontend code.

Frontend files should change only if a tiny visibility or wording adjustment becomes necessary after the refinement.

This note is therefore primarily backend-facing, unlike `01a`.

---

## 10. What should not change in this pass

### 10.1 No usefulness/regime unification

Do not try to unify compact usefulness with advisory/active regime management here.

### 10.2 No broad frontend restructuring

The designer and visualizer are already good enough for the next slice.

### 10.3 No large preset-family expansion yet

The three usefulness probes are enough for this refinement loop.

They can remain a seed family while their scientific reading is being stabilized.

### 10.4 No claim of final triad semantics yet

Even if the next pass improves the delay reading, AWSRT should still treat the compact usefulness triad as an actively investigated scientific layer rather than a fully closed interpretation.

---

## 11. Expected result of this pass

If this pass succeeds, the next three-run usefulness slice should read more like this:

* **healthy** → clearly exploit-leaning or exploit-dominant,
* **delay** → clearly recover-leaning or recover-dominant,
* **noise** → clearly caution-dominant.

That would make the compact usefulness triad more scientifically legible on transformed real-fire conditions without requiring a larger redesign.

If this pass does **not** succeed, that is still informative: it would suggest that the current compact usefulness controller may not yet support the stale-versus-corrupt separation strongly enough in this setting.

---

## 12. Immediate evaluation target after refinement

The next rerun should continue to inspect only the same bounded three-run family.

The immediate evaluation questions should be:

1. Does the delay run remain visibly stale while shifting more of its occupancy into recover?
2. Does the noise run remain strongly caution-dominant?
3. Does the healthy run remain mainly exploit-facing rather than becoming overly active or overly cautious?
4. Does the refinement improve semantic separation without simply flattening all three probes into similar mixed behavior?

These questions should be answered before any wider usefulness family expansion.

---

## 13. Decision boundary after this pass

After the bounded delay-side refinement and rerun of the three usefulness probes, AWSRT should decide among three readings:

1. **The triad now reads distinctly enough**  
   Proceed with the usefulness family as a real v0.5 scientific line.

2. **The triad is improved but still compressed**  
   Add one more small usefulness-audit or threshold-semantics refinement pass.

3. **The triad still does not separate recover from caution adequately**  
   Reassess whether the compact usefulness layer needs a more substantive semantic clarification before wider use.

At present, the most disciplined expectation is the second or first, not an immediate broad redesign.

## 14. Cross-fire confirmation outcome

After the bounded delay-side refinement, the three usefulness probes were rerun on a second transformed real-fire case (`2017_856`).

The resulting reading remained aligned with the intended compact usefulness semantics:

- healthy remained exploit-dominant,
- delay remained recover-dominant,
- noise remained caution-dominant.

This matters because it suggests that the refined compact usefulness triad is not merely overfit to a single bounded window. At least across the two currently inspected transformed real-fire cases, the triad now preserves the intended stale-versus-corrupt separation more credibly than before.

Accordingly, AWSRT should treat this bounded refinement as a successful Subgoal 01b stabilization step and should avoid further local tuning unless a later broader usefulness slice reveals a new failure mode.
