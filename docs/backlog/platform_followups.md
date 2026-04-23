# Platform Follow-ups

## Purpose

This note tracks important issues, questions, and possible improvements that do not yet justify a dedicated subgoal or design note.

Items here are reminders and triage targets, not commitments.

---

## Active triage

### [UI] Consider hiding belief designer and visualizer for now
- **Status:** Open
- **Why it matters:** The belief pages may currently feel incomplete or out of step with the more mature operational surfaces.
- **Question:** Should they be hidden, relabeled as experimental, or left visible as-is?
- **Next check:** Revisit during the next UI-facing cleanup pass.

### [UI] Add progress indication to analysis batch
- **Status:** Open
- **Why it matters:** Longer analysis runs currently provide limited execution feedback.
- **Question:** Should the page show a spinner, completed/total counter, stage text, or fuller progress bar?
- **Next check:** Revisit when touching analysis batch UX.

### [Bug/Metrics] Investigate occasional TTFD = 0 when not actually true
- **Status:** CLOSED
- **Why it matters:** This may undermine confidence in a core timeliness metric.
- **Question:** Is the issue caused by indexing, initialization, event timing semantics, or summary/reporting logic?
- **Next check:** COMPLETED

### [UI] Summary and Trace boxes are present even if run doesn't use them
- **Status:** Open
- **Why it matters:** Too many boxes are appearing in the UI
- **Question:** For usefulness runs we have introduced visible/non-visible summaries and traces based on if usefulness is used. Can we do the same for the regimes?

### [Back/Frontend] Change Physical Designer from specific variables to more abstract case based
- **Status:** Open
- **Why it matters:** Users are expecting a complete physical simulator.
- **Question:** Can we substitute specific models for more abstract ones. i.e. wind is just a vector variable type

### [Back/Frontend] Allow batch to treat multiple origins as cases
- **Status:** Open
- **Why it matters:** We need to test multiple random locations.
- **Question:** Can we adjust the batch analysis UI/backend to allow for multiple origins, possibly each treated as a case?

---

## Parking lot

_Add lower-priority ideas here._

---

## Promoted / moved out

_Add items here once they become dedicated design notes or subgoals._