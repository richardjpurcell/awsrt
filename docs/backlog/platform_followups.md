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
- **Status:** Open
- **Why it matters:** This may undermine confidence in a core timeliness metric.
- **Question:** Is the issue caused by indexing, initialization, event timing semantics, or summary/reporting logic?
- **Next check:** Revisit when doing metrics validation or summary auditing.

---

## Parking lot

_Add lower-priority ideas here._

---

## Promoted / moved out

_Add items here once they become dedicated design notes or subgoals._