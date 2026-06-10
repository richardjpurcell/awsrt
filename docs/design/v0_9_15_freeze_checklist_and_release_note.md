# v0.9-subgoal-15 — v0.9 Freeze Checklist and Release Note

## Status

Branch: `v0.9-subgoal-15`

Theme:

> From reproducible handoff to interpretable inspection.

Thesis-facing wording:

> From reproducible handoff to epistemic and operational inspectability.

This subgoal is intended to close the v0.9 interpretability / inspectability track. It should not add new experiments, reopen v0.6 scientific results, or introduce new frontend/backend functionality unless a concrete freeze-blocking inconsistency is found.

## Purpose

The purpose of this subgoal is to decide whether AWSRT v0.9 is ready to tag as the interpretability / inspectability release.

The review should confirm that v0.9 has:

1. preserved v0.6 as the frozen scientific evidence / result state;
2. preserved v0.8 as the reproducible-handoff release;
3. added bounded inspectability improvements;
4. documented the epistemic results and their interpretation discipline;
5. avoided claims that AWSRT is an operational wildfire simulator, high-fidelity physical simulator, digital twin, or physical twin;
6. kept generated figures and `do_not_track` plotting code out of tracked source, unless already intentionally tracked as thesis/report assets; and
7. left the repository in a clean, taggable state.

## What v0.9 adds over v0.8

v0.8 made AWSRT more reproducible and handoff-ready. v0.9 adds interpretability and inspectability on top of that foundation.

At a high level, v0.9 adds:

- improved operational visualizer view-window control and stabilization;
- Epistemic Surface / Epistemic Visualizer inspectability work;
- built-in support-geometry presets for epistemic probing;
- visual and metric review of epistemic support geometry, belief decay, and impairment response;
- diagnostic prominence and panel simplification work;
- optional cloud-like / impressionistic rendering exploration;
- support-arrival pairing work;
- thesis-facing design notes for the epistemic results chapter;
- a visualizer-metric alignment / misalignment reading discipline.

The main v0.9 contribution is not a new scientific experiment suite in the v0.6 sense. It is the maturation of AWSRT as an inspectable research instrument.

## Completed v0.9 subgoal chain

The v0.9 track developed through a sequence of bounded subgoals. The exact commit history is the source of truth, but the conceptual sequence is:

1. Operational visualizer view-window controls.
2. Operational visualizer stabilization.
3. Epistemic inspectability probe.
4. Built-in epistemic support-geometry presets.
5. Support-geometry smoke review.
6. Epistemic visualizer panel simplification.
7. Diagnostic prominence triage.
8. Support-arrival pairing.
9. Optional cloud / impressionistic rendering mode.
10. Additional v0.9 stabilization / integration work as captured in repo history.
11. Clean-channel Epistemic Surface support-geometry × decay matrix.
12. Focused impairment-response matrix under selected support geometries.
13. Epistemic Visualizer–metric alignment and misalignment review.
14. v0.9 interpretability freeze review.
15. v0.9 freeze checklist and release note.

## Scientific / thesis-facing state

v0.9 supports the following bounded thesis-facing claims:

### 1. AWSRT is more inspectable

The Operational and Epistemic Visualizers make internal state, support geometry, arrivals, belief, entropy, and entropy-change behaviour easier to inspect.

This is an inspectability claim, not an operational deployment claim.

### 2. The Epistemic Surface can expose belief-maintenance regimes

The clean support-geometry by decay matrix shows that support geometry and belief decay interact. Under high decay, geometry has little global effect on entropy maintenance. Under stronger retention, support geometries become distinguishable in entropy-side and information-activity summaries.

### 3. Delivered-information proxy activity and maintained belief quality can separate

v0.9 reinforces the thesis claim that information activity, arrivals, or delivery-side summaries should not be equated directly with belief-maintenance usefulness.

### 4. Impairment makes prescribed support versus realized arrivals scientifically active

Loss, delay, and noise separate prescribed support, realized arrivals, information activity, and maintained belief quality in different ways.

### 5. Visual inspection must be disciplined by metrics

The Epistemic Visualizer is useful as an inspectability aid, but not as independent evidence. Visual impressions must remain accountable to entropy AUC, terminal entropy, arrived-information proxy, MDC violation, and entropy-change summaries.

## Boundaries preserved

v0.9 should continue to state clearly that:

- AWSRT is a research instrument.
- AWSRT is not an operational wildfire simulator.
- AWSRT is not a high-fidelity physical wildfire simulator.
- AWSRT is not a digital twin or physical twin.
- Epistemic support geometries are probes, not operational search policies.
- v0.9 inspectability work does not replace v0.6 as the frozen scientific evidence/result state.
- v0.9 results are bounded by selected artifacts, support geometries, decay settings, impairment levels, and seeds.
- Global entropy summaries do not by themselves provide a complete spatial or operational decision explanation.

## Freeze checklist

Before tagging v0.9, run the following checks from `main`.

### Git state

```bash
git checkout main
git pull origin main
git status
```

Expected:

```text
On branch main
nothing to commit, working tree clean
```

### Documentation consistency

Review the design notes and thesis-facing notes for consistency with the v0.9 framing:

```bash
ls docs/design | grep 'v0_9'
```

Look especially for outdated claims that:

- call AWSRT an operational wildfire simulator;
- imply the Epistemic Surface is a physical wildfire model;
- treat support geometries as operational search policies;
- treat delivered-information proxy as exact mutual information;
- treat visual impressions as evidence without metric qualification;
- say the visualizer-metric alignment review is still future work, if it has already been folded into the chapter.

### Search for obvious stale future-work wording

Suggested searches:

```bash
grep -Rni "visualizer--metric alignment" docs thesis* sections* . 2>/dev/null
grep -Rni "future experiment: visualizer" docs thesis* sections* . 2>/dev/null
grep -Rni "digital twin\|physical twin\|operational wildfire simulator" docs thesis* sections* . 2>/dev/null
```

Interpret these results manually. Not every occurrence is wrong. For example, a threat-to-interpretation statement saying AWSRT is *not* a digital twin is appropriate.

### Source validation

If v0.9-subgoal-15 remains documentation-only, `git diff --check` is sufficient before commit.

If code has unexpectedly changed, run the relevant validation:

Backend:

```bash
pytest
```

Frontend:

```bash
npm run build
```

Use the project-specific frontend directory if needed.

### Tag-readiness check

Before tagging, inspect recent history:

```bash
git log --oneline --decorate -12
git status
```

The head of `main` should include the merge of v0.9-subgoal-15 and should be clean.

## Recommended tag action

If the above checks pass, tag v0.9 from `main`:

```bash
git tag -a v0.9 -m "AWSRT v0.9 interpretability and inspectability release"
git push origin v0.9
```

Then confirm:

```bash
git tag --list 'v0.9'
git status
```

## Draft release note

### AWSRT v0.9 — Interpretability and Inspectability Release

AWSRT v0.9 advances the project from reproducible handoff toward interpretable inspection. It preserves v0.6 as the frozen scientific evidence/result state and v0.8 as the reproducible-handoff release, while adding a focused interpretability layer for operational and epistemic inspection.

The release improves the Operational Visualizer and substantially develops the Epistemic Surface / Epistemic Visualizer as an inspectability instrument. It adds support-geometry presets, panel simplification, diagnostic prominence improvements, support-arrival pairing, optional impressionistic/cloud-like rendering, and thesis-facing design notes for interpreting support geometry, belief decay, impairment response, and visualizer-metric alignment.

The main scientific-inspectability result is that prescribed support, realized arrivals, delivered-information proxy activity, entropy-side belief maintenance, and visual impressions can separate. In clean-channel Epistemic Surface runs, support geometry and belief decay interact: under high decay, support geometries collapse to similar high-entropy behaviour, while stronger retention exposes geometry-dependent belief-maintenance regimes. Under impairment, loss, delay, and noise make the support-arrival distinction scientifically active. The v0.9 visualizer-metric alignment review further establishes that the visualizer should be treated as an inspectability aid rather than as independent evidence: visual impressions must remain accountable to entropy AUC, terminal entropy, arrived-information proxy, MDC violation, and entropy-change summaries.

v0.9 remains bounded. AWSRT is a research instrument, not an operational wildfire simulator, high-fidelity physical simulator, digital twin, or physical twin. Epistemic support geometries are probes, not operational search policies. The release improves how AWSRT can be inspected and explained without reopening the v0.6 scientific evidence state by default.

## Known limitations carried forward

- v0.9 does not generalize the Epistemic Surface results across all possible artifacts, seeds, budgets, or impairment levels.
- v0.9 does not turn support geometries into operational search policies.
- v0.9 does not validate AWSRT as an operational wildfire simulator.
- Some visualizer refinements may still be possible, especially around representative figure packaging and thesis presentation polish.
- Further support-budget sensitivity remains optional future work.
- Stronger statistical claims would require replicated runs across artifacts, seeds, and parameter settings.

## Freeze recommendation

If this checklist is completed without discovering inconsistencies, v0.9 should be tagged.

Recommended final state:

```text
main clean
v0.9-subgoal-15 merged to main
v0.9 tag created from main
v0.6 preserved as frozen scientific evidence/result state
v0.8 preserved as reproducible-handoff release
v0.9 frozen as interpretability / inspectability release
```
