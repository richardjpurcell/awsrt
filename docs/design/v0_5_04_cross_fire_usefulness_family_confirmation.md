<!-- Path: docs/design/v0_5_04_cross_fire_usefulness_family_confirmation.md -->

# AWSRT v0.5 Subgoal 04: Cross-Fire Usefulness-Family Confirmation

**Status:** Completed design note  
**Applies to:** `v0.5-subgoal-04`  
**Purpose:** Confirm whether the usefulness-family reading established in bounded transformed real-fire study slices remains scientifically legible across multiple fires, now that the bounded batch-sweep path and related analysis semantics have been corrected.

---

## 1. Purpose of this note

This note defines and now closes AWSRT v0.5 Subgoal 04.

Subgoal 03 should be read as an important cleanup-and-confirmation step. It established that the bounded usefulness-family batch-sweep path can now produce the intended three-case comparison without silently inserting an extra base case, and that the resulting analysis artifacts preserve the expected family semantics in both study metadata and summary outputs.

That mattered because AWSRT is not trying to operationalize a controller surface for its own sake. The scientific question remained narrower and more important: whether the distinction between **information delivered** and **information operationally useful for belief maintenance** remains visible once the system is confronted with transformed real-fire conditions.

Subgoal 04 moved one step outward. It did **not** broaden into a large campaign, a new family of controllers, or a major visualization rewrite. Instead, it asked whether the now-correct bounded usefulness-family comparison remained stable and interpretable when repeated across more than one transformed real-fire context.

That confirmation step has now been carried out.

---

## 2. Scientific intent

The scientific intent of this subgoal was to test the **cross-context stability** of the usefulness-family reading.

More specifically, the question was:

> When the same bounded usefulness-family study is run across multiple transformed real-fire windows, do the healthy / delay / noise contrasts continue to produce a legible and scientifically coherent separation?

This was not a claim of generality across all real fires. It was a disciplined intermediate question:

- does the usefulness-family comparison survive replication across several fire contexts,
- does it remain readable in the current analysis surfaces,
- and does it continue to support the intended interpretation of usefulness as distinct from raw information delivery?

The aim was therefore **confirmation of interpretability across contexts**, not optimization.

---

## 3. Subgoal framing

At the current AWSRT stage, this subgoal should be understood as a **cross-fire confirmation slice**.

Subgoal 03 established that one bounded transformed real-fire study could now be run correctly and summarized honestly.  
Subgoal 04 asked whether that same study pattern remained coherent when repeated across additional fires.

This meant the subgoal was about:

- **replication**, not redesign;
- **scientific consistency**, not broadened functionality;
- **family confirmation**, not controller expansion;
- **careful comparison across fires**, not pooling everything into one large unreadable batch.

That framing should remain attached to this subgoal at closeout.

---

## 4. Expected study shape

The intended experimental shape was deliberately narrow.

For each selected transformed real-fire context:

- use one bounded execution window,
- use one participating policy: `usefulness_proto`,
- use the canonical three-case usefulness-family contrast:
  - `healthy`
  - `delay`
  - `noise`
- use the same small seed set,
- and preserve the corrected bounded batch-sweep semantics from Subgoal 03.

The expectation was that each fire would produce one compact `ana-*` study artifact, rather than mixing all fires into one large first-pass analysis object.

This was important because the immediate question was whether **each fire individually** supported the same usefulness-family reading.  
Only after that became clear would any cross-fire aggregation or summary layer be considered.

---

## 5. What remained true

Subgoal 04 should be read as having successfully preserved the intended bounded usefulness-family structure across the repeated runs.

### 5.1 Sweep integrity remained correct

The bounded usefulness-family sweep continued to produce exactly the intended three cases:

- `healthy`
- `delay`
- `noise`

There was no reappearance of an implicit extra base case, no hidden empty-overrides insertion, and no semantic fallback that altered the intended case family.

### 5.2 Study semantics remained truthful

The resulting study metadata continued to reflect the real intent of the run, including:

- `study_family = usefulness_family_compare`
- `comparison_axis = usefulness_family`
- `comparison_tier = main`
- usefulness-family case labels present as the actual three named cases
- corrected preset origin semantics for the bounded usefulness-family workflow

### 5.3 Impairment naming remained aligned with case intent

The impairment-level or family-facing labels remained readable and truthful for the canonical three-case usefulness-family study.

In particular, the analysis outputs did **not** regress into misleading generic labels such as:

- `custom`
- `ideal`
- `moderate`

when the intended scientific reading was explicitly:

- `healthy`
- `delay`
- `noise`

### 5.4 Analysis surfaces remained readable enough for scientific inspection

The current analysis surfaces remained readable enough to support quick scientific inspection.

In practice, this allowed inspection of whether:

- healthy remained the cleanest reference case,
- delay remained interpretable as stale-information,
- noise remained distinct from delay,
- and the information/usefulness relationship remained scientifically discussable.

---

## 6. What the runs showed

The completed cross-fire runs support a cautious positive reading.

### 6.1 Healthy remained the cleanest case

Across the tested transformed real-fire contexts, the healthy case remained the cleanest reference condition.

In broad terms, healthy continued to read as the least impaired condition and the most straightforward baseline against which delay and noise could be interpreted.

### 6.2 Delay remained interpretable as stale-information

Across the tested transformed real-fire contexts, delay remained legible as a stale-information condition.

Its scientific reading was carried primarily by:

- degraded timeliness,
- stronger recover-side occupancy relative to healthy,
- and a pattern more consistent with lateness and staleness than with corruption.

### 6.3 Noise remained distinct from delay

Across the tested transformed real-fire contexts, noise remained distinct from delay.

However, Subgoal 04 should be read carefully here: the distinction remained present, but the **exact realized usefulness-state pattern** varied by fire. In some runs, noise appeared strongly caution-dominated. In others, it remained distinct from delay more through its belief-quality and informational profile than through a uniform caution-dominated occupancy pattern.

This is an important cross-fire nuance, not a failure of the family reading.

### 6.4 The delivered-information versus usefulness separation remained visible

Most importantly, the completed runs continued to support the scientific distinction between:

- **information delivered**, and
- **information operationally useful for belief maintenance**.

In particular, the noise case continued to show the clearest version of that wedge: informational activity could remain present or even rise while headline belief-quality behavior worsened.

This is the strongest scientific outcome of Subgoal 04.

---

## 7. Important limitation discovered during closeout

Subgoal 04 also surfaced a now-unavoidable truthfulness issue:

- some noise-side runs reported `TTFD = 0`,
- and that value is now judged to be **incorrect**.

This matters because `TTFD` is one of the headline metrics and is too central to leave semantically ambiguous or wrong, especially when the subgoal is explicitly about interpretation under impairment.

The key point is that this issue does **not** invalidate the completed structural confirmation work of Subgoal 04:

- the sweep structure was correct,
- the metadata remained truthful,
- the case family remained legible across fires,
- and the delivered-information versus usefulness separation remained visible.

However, the `TTFD = 0` issue does mean that Subgoal 04 should **not** be treated as the final interpretive or synthesis stage for this line.

Instead, it should now be read as:

- a successful cross-fire confirmation of the usefulness-family comparison structure and broad scientific legibility,
- followed by the discovery of a metric-truthfulness issue that must be repaired before stronger synthesis claims are made.

---

## 8. What this subgoal is not

To keep scope disciplined, Subgoal 04 was **not** the place to do the following:

- introduce a new usefulness controller;
- redesign the compact usefulness triad;
- merge usefulness and regime semantics into one grand framework;
- launch a large all-fires batch campaign;
- claim statistical generality from a small number of transformed fire contexts;
- optimize the frontend beyond what is needed for truthful reading;
- or absorb a broader headline-metric repair effort into the same closeout step.

That final point is now especially important.  
The `TTFD = 0` issue should be handled in the next subgoal as a **separate narrow repair task**, not folded back into Subgoal 04.

---

## 9. Concrete closeout reading

The main work of Subgoal 04 was organized around repeatable execution and careful reading, not broad code churn.

That work is now complete enough to support the following closeout reading:

1. the corrected usefulness-family preset ran successfully on multiple transformed real-fire contexts;
2. each resulting study artifact contained exactly the intended named cases;
3. study semantics and sweep metadata remained truthful and usefulness-family specific;
4. the displayed case labels remained scientifically readable as `healthy` / `delay` / `noise`;
5. cross-fire inspection suggested that the usefulness-family interpretation remained coherent rather than collapsing or becoming arbitrary.

That is enough to close the subgoal as a successful confirmation step.

---

## 10. Expected evidence from this subgoal

By the end of this subgoal, the expected evidence consisted of a small set of bounded real-fire usefulness-family studies showing that:

- the corrected three-case sweep structure was stable;
- the analysis surfaces remained semantically honest;
- the healthy / delay / noise contrast was still readable across multiple fires;
- and the usefulness-family story was not just a one-fire artifact.

That evidence was obtained.

A careful claim supported by this subgoal is therefore:

> The bounded usefulness-family comparison is operationally usable as a scientific probe across multiple transformed real-fire contexts, and the intended healthy / delay / noise reading remains inspectable in the current analysis surface.

However, because the `TTFD = 0` issue has now been identified as incorrect, this claim should be read as **structurally and scientifically supportive but not yet final at the headline-metric level**.

---

## 11. Minimal success criteria

Subgoal 04 should be considered complete because all of the following were achieved:

1. The corrected usefulness-family preset ran successfully on multiple transformed real-fire contexts.
2. Each resulting study artifact contained exactly the intended named cases.
3. Study semantics and sweep metadata remained truthful and usefulness-family specific.
4. The displayed case labels remained scientifically readable as healthy / delay / noise.
5. Cross-fire inspection suggested that the usefulness-family interpretation remained coherent rather than collapsing or becoming arbitrary.

The `TTFD = 0` issue does not reverse that completion judgment, but it does constrain what should happen next.

---

## 12. Exit condition and actual next step

If Subgoal 04 succeeded, AWSRT would move from:

- **one corrected bounded usefulness-family smoke-confirmation**

to:

- **a small cross-fire confirmation that the same scientific reading survives replication across contexts**

That move has now occurred.

However, the likely next step is **not yet** a synthesis note or comparison layer.

Because the `TTFD = 0` values are now judged incorrect and may affect interpretation, the immediate next step should instead be a **new, narrowly scoped subgoal focused on TTFD truthfulness and repair**.

That next subgoal should answer questions such as:

- why some noise-side runs report `TTFD = 0`,
- whether the issue lies in event definition, arrival semantics, impairment handling, or summary extraction,
- whether `ttfd`, `ttfd_true`, and `ttfd_arrived` are being conflated or mishandled,
- and what the smallest truthful fix is.

Only after that repair is complete should AWSRT proceed to a stronger synthesis layer for the cross-fire usefulness-family results.

---

## 13. Working note

This subgoal should be remembered as having been carried out in the same disciplined style used in the previous steps:

- small patches,
- explicit smoke tests,
- verification of metadata and case integrity,
- and cautious interpretation.

The main result achieved here was not software breadth.  
It was increased confidence that the usefulness-family comparison is a real scientific probe rather than a one-off artifact of a single corrected run.

The next step should preserve that same discipline by treating the `TTFD = 0` issue as a separate truthfulness-repair task rather than allowing it to blur the meaning of this completed subgoal.