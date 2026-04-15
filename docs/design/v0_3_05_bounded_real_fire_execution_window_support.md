# AWSRT v0.3 Subgoal 05: Bounded Real-Fire Execution-Window Support

**Status:** Freeze-ready design note  
**Applies to:** `v0.3-subgoal-05`  
**Purpose:** Define and now record the bounded implementation step that adds optional execution-window support for long-horizon transformed real-fire operational runs, so deployment experiments become tractable without broad realism redesign.

---

## 1. Purpose of this note

This note defines and records the bounded implementation step taken after the early v0.3 control-line re-evaluation.

The immediate purpose was practical and bounded:

- make long-horizon real-fire operational runs experimentally tractable,
- without broadening AWSRT into a realism-redesign phase,
- and without pretending this is a larger scientific result than it is.

The project needed a way to run deployment experiments on transformed real-fire inputs without always committing to the full original horizon.

That need was already justified by workflow and experimentation value alone.

Subgoal 05 therefore shifted v0.3 into a different kind of near-term step than Subgoals 01–04. Those subgoals were controller-facing and exploratory. Subgoal 05 is enabling infrastructure for the next round of meaningful experiments.

The implementation was kept compact, honest, and implementation-focused.

---

## 2. Why this was the right next step

### 2.1 The early control line had reached a useful stopping point

The early v0.3 control line produced a meaningful sequence of findings:

- Subgoal 01 was a useful positive checkpoint,
- Subgoals 02–04 formed a disciplined boundary-finding sequence,
- and the current active family did not yield the hoped-for corruption-side reading under the bounded interventions tested.

That created a natural opportunity to shift attention rather than continue local controller tweaking immediately.

### 2.2 Real-fire experimentation was already a legitimate near-term need

Independent of the corruption-side control thread, one important near-term direction was already clear:

- run deployment simulations on transformed real-fire data,
- and make those experiments practically manageable.

This was not a new direction invented because the control line paused. It was already a legitimate next v0.3 need.

### 2.3 Long-horizon runs created workflow friction

The current real-fire-style runs were long enough that they became awkward for:

- rapid operational experimentation,
- semantic probe checks,
- iterative designer work,
- and compact validation cycles.

So even before broader realism questions were addressed, the project benefited from a bounded execution-window capability.

### 2.4 This remained enabling work, not realism inflation

Subgoal 05 was never intended to mean “AWSRT is now becoming a full real-fire simulator.”

Its purpose was much narrower:

- make already-ingested and already-transformed real-fire runs easier to use in bounded operational experiments.

That remained a practical and well-scoped step.

---

## 3. Main development question

The central question for Subgoal 05 was:

> what is the smallest schema/backend/frontend support needed to let operational runs use a bounded execution window on long-horizon real-fire inputs, while preserving clarity about what portion of the original run is actually being used?

More concretely:

> how can AWSRT let the user select and run only a bounded portion of a longer transformed real-fire horizon, without introducing ambiguity about indexing, timing, summaries, or visual interpretation?

This was the main question the subgoal needed to answer.

---

## 4. Scope

Subgoal 05 stayed narrow.

It focused on one compact class of work:

- bounded execution-window support for operational runs.

That included:

- one small schema/manifest addition,
- one backend slicing/validation addition,
- one frontend designer exposure,
- and compact validation runs showing the feature worked.

It did **not** include:

- broad new real-fire ingestion work,
- realism-model redesign,
- new fire-spread semantics,
- broad visualizer overhaul,
- or large timeline-management infrastructure.

This remained a bounded execution-window subgoal, not a realism-expansion subgoal.

---

## 5. What Subgoal 05 is and is not

### 5.1 What Subgoal 05 is

Subgoal 05 is a bounded infrastructure and experiment-enablement step.

It is about:

- limiting operational execution to a chosen subwindow of a longer physical horizon,
- making that choice explicit in manifests and summaries,
- and keeping the resulting runs interpretable and easy to validate.

### 5.2 What Subgoal 05 is not

Subgoal 05 is not:

- a new scientific campaign by itself,
- a real-fire realism-validation phase,
- a controller redesign phase,
- a major frontend catch-up pass,
- or a broad restructuring of physical or operational time semantics.

It is also not an attempt to support arbitrary timeline composition or multi-window orchestration.

The implemented subgoal remained much smaller than that.

---

## 6. Working diagnosis entering Subgoal 05

At the start of Subgoal 05, the relevant practical diagnosis was:

### 6.1 Real-fire inputs were usable, but not yet convenient enough for iterative operational work

The project had already ingested and transformed real-fire-related data into a form that could support operational experimentation.

That was a strong starting point.

But the current experience of using long-horizon runs for repeated operational tests was still too heavy.

### 6.2 Full-horizon execution was often more than the experiment needed

Many near-term experiments did not require the entire original timeline.

Often the real question was about:

- a meaningful slice,
- a manageable segment,
- or a bounded comparison window.

That made bounded-window support a natural fit.

### 6.3 The main risk was ambiguity, not just complexity

The main design risk was not that slicing was conceptually difficult.

The main risk was that poor slicing support could create ambiguity about:

- what time interval the run actually covered,
- how `T`, `horizon_steps`, and summary metrics should be interpreted,
- what the visualizer was displaying,
- and whether indexes referred to absolute physical time or window-local time.

So the key requirement was not just “support windows,” but “support windows honestly.”

---

## 7. Development stance adopted

Subgoal 05 followed these principles.

### 7.1 Prefer one simple execution-window model

The first implementation used one simple model only:

- `start_step`
- `end_step_exclusive`

It did not support multiple windows, sparse windows, or more elaborate scheduling.

### 7.2 Preserve existing default behavior

If no bounded window is specified, the system behaves exactly as before.

That preserved compatibility and kept the feature clearly optional.

### 7.3 Be explicit about local versus source horizon semantics

The implementation makes it clear that:

- the source physical run may have a longer original horizon,
- while the operational run may use only a bounded subwindow.

This distinction is now visible in summaries and in the visualizer.

### 7.4 Keep the visual interpretation honest

The user should not have to guess whether:

- step `t=0` means the beginning of the original physical run,
- or the beginning of the selected execution window.

The visualizer now surfaces that explicitly.

### 7.5 Validate before broadening

The first pass supported the bounded window cleanly and truthfully before any richer time controls were considered.

---

## 8. Execution-window design chosen

A few surface designs were possible, but the first pass stayed simple.

### 8.1 Considered shapes

Two natural candidate shapes were:

- `start_step` + `window_steps`
- `start_step` + `end_step_exclusive`

### 8.2 Chosen first-pass shape

The chosen first-pass design was:

- `start_step`
- `end_step_exclusive`

This was the clearest first-pass design because:

- it maps directly to array slicing,
- it avoids ambiguity about whether length is inclusive or exclusive,
- and it is easy to validate.

The backend then derives the local operational `T` from that range.

---

## 9. Implementation model adopted

The implemented model is:

- the physical run remains unchanged,
- the operational manifest may optionally specify a bounded execution window,
- the backend slices physical time-indexed arrays to that window before the operational loop runs,
- and the operational run behaves as if that bounded slice is its local horizon.

This keeps the feature bounded and understandable.

### 9.1 Source semantics

The physical run remains the full source timeline.

### 9.2 Local semantics

The operational run sees only the selected window and treats it as its own local `t = 0..T_window-1` timeline.

### 9.3 Summary semantics

The summary now makes both visible:

- the source physical horizon information,
- and the selected execution-window information.

This was an important truthfulness requirement and is now satisfied.

---

## 10. Schema outcome

The feature was added to the operational manifest surface as an optional execution-window block.

The implemented shape is:

- `execution_window.start_step`
- `execution_window.end_step_exclusive`

The schema enforces:

- nonnegative start,
- end greater than start when provided,
- omission means full-horizon behavior.

Validation against the linked physical horizon is handled in the backend where the source run is loaded.

Replay mode does not accept this surface.

---

## 11. Backend outcome

The backend work included the following compact changes.

### 11.1 Manifest-linked execution-window resolution

Closed-loop operational runs now resolve an optional execution window against the linked physical horizon.

Invalid ranges are rejected cleanly.

### 11.2 Physical array slicing

The backend slices the linked physical time-indexed arrays to the selected interval before entering the main operational loop.

The main operational loop then runs over the local bounded horizon rather than the full source horizon.

### 11.3 Local timeline normalization

The operational run uses window-local indexing internally.

So the operational loop still runs naturally over:

- `t in range(T_window)`

without special-case timeline logic throughout the code.

### 11.4 Summary emission

The summary now records enough information to reconstruct:

- the source physical horizon,
- whether bounded execution was enabled,
- the selected start and exclusive end steps,
- and the local operational horizon actually used.

### 11.5 Meta behavior

Operational meta now prefers the run’s own stored summary/meta values when available, so bounded runs report the actual local operational horizon rather than incorrectly defaulting to the linked full physical horizon.

### 11.6 Series behavior

The operational series endpoint now forwards the bounded-window summary fields needed by the visualizer, so the UI can present source-versus-local horizon semantics honestly.

---

## 12. Frontend outcome

The frontend work remained small.

### 12.1 Designer support

The Operational Designer now exposes a compact optional execution-window surface:

- enable/disable bounded execution,
- `start_step`,
- `end_step_exclusive`

This remains a small authoring surface rather than a broad timeline-management UI.

### 12.2 Visual clarity

The Operational Visualizer now explicitly shows:

- source physical horizon,
- selected execution window,
- local operational horizon,
- and that viewer `t` is a local operational step when bounded execution is active.

This closes the main interpretation ambiguity of the feature.

### 12.3 Preset behavior

No broad preset framework was added for this feature.

A small manual control surface was sufficient for the first pass.

---

## 13. Validation outcome

Subgoal 05 was validated in a compact and practical way.

### 13.1 Validation cases exercised

The feature was checked with:

- an ordinary run with no execution window, to confirm compatibility,
- bounded runs using selected subwindows of longer physical runs,
- and invalid-range logic during development to confirm validation behavior.

### 13.2 What was confirmed

Validation confirmed that:

- invalid execution-window ranges are rejected cleanly,
- the local operational `T` matches the requested window,
- summaries report both source and local horizon information honestly,
- meta reflects the bounded local horizon consistently,
- the visualizer shows the bounded-window semantics clearly,
- and existing full-horizon behavior remains unchanged when the feature is omitted.

### 13.3 What was intentionally not done

The first pass did not turn into a broad study campaign.

It only established that the feature is:

- correct,
- honest,
- and usable.

That was the right scale for this subgoal.

---

## 14. Main implementation touchpoints

The main files touched by Subgoal 05 were:

- `backend/awsrt_core/schemas/operational.py`
- `backend/api/routers/operational.py`
- `frontend/app/operational/designer/page.tsx`
- `frontend/app/operational/visualizer/page.tsx`

The emphasis remained:

### Core implementation

- schema addition
- backend slicing and validation
- designer exposure

### Truthfulness / legibility follow-through

- summary/meta source-versus-local horizon reporting
- series forwarding of bounded-window summary fields
- small visualizer label/readout improvement

Large refactor remained out of scope.

---

## 15. Success criteria and outcome

Subgoal 05 was intended to succeed if:

- an operational run can optionally specify a bounded execution window,
- the backend executes only that window of the linked physical run,
- the resulting local horizon is internally consistent,
- summary/meta outputs clearly distinguish source horizon from selected window,
- the feature works on long-horizon transformed real-fire runs,
- and default full-horizon behavior remains unchanged when no window is specified.

That success condition is now met.

A stronger practical success condition was that:

- the feature should immediately make real-fire operational experimentation more manageable,
- without requiring any broad realism redesign.

That also appears to be satisfied.

---

## 16. Warning signs avoided

Subgoal 05 would have drifted if it had:

- turned into a broad time-management redesign,
- introduced multiple competing window models at once,
- blurred local operational time with source physical time,
- changed default full-horizon behavior,
- or grown into a large UI overhaul.

Those warning signs were avoided.

A particularly important avoided failure mode was:

- implementing the window feature in a way that technically worked, but left the user unsure what interval the run actually covered.

The visualizer and summary updates were important precisely because they prevented that ambiguity.

---

## 17. Relationship to likely next steps

A plausible sequence after this subgoal is:

### 17.1 Freeze Subgoal 05 as enabling infrastructure

Interpret this feature as an experiment-enablement capability, not a new scientific claim.

### 17.2 Return to experiment use

Use the bounded execution-window capability to make real-fire operational experiments more tractable.

### 17.3 Continue v0.3 with the next bounded need

Only after this should the project consider further work such as:

- richer real-fire experiment design,
- broader operational experiments on real-fire windows,
- or additional platform catch-up tasks.

The important point is that those are subsequent steps, not things Subgoal 05 needed to absorb.

---

## 18. Short summary

Subgoal 05 is now a completed bounded v0.3 enabling step after the early control-line re-evaluation. Its purpose was not to redesign realism or restart the corruption-side controller thread, but to add a small, honest, and useful capability: bounded execution-window support for operational runs on long-horizon transformed real-fire inputs. The implemented design uses an optional `start_step` / `end_step_exclusive` execution window in the operational manifest, backend slicing before the operational loop, local horizon normalization, truthful summary/meta reporting, and a small visualizer readout that distinguishes source physical horizon from local operational horizon. The result is that real-fire deployment experiments are now more tractable while default behavior remains unchanged and source-versus-local time semantics remain explicit.