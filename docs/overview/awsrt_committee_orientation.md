# AWSRT Committee Orientation Guide

**Project:** AWSRT — Adaptive Wildfire Sensing Research Tool  
**Audience:** Thesis committee and external technical readers  
**Version track:** v0.8  
**Status:** Initial committee-facing orientation  
**Date:** 2026-05-30  

---

## 1. Purpose of this guide

This guide gives a concise orientation to AWSRT for thesis committee readers.

It explains what AWSRT is, what it is not, how it supports the thesis argument, and how a reader can inspect the software without needing to reconstruct the full development history from design notes.

This guide is not a substitute for the thesis. It is a bridge between the thesis argument and the software repository.

---

## 2. One-paragraph summary

AWSRT, the Adaptive Wildfire Sensing Research Tool, is a research instrument for studying adaptive sensing, belief maintenance, information impairment, and usefulness under wildfire-like dynamic fields. It is designed to make separations between timing, information delivery, belief quality, and usefulness-state behavior inspectable under controlled experimental conditions. AWSRT is not an operational wildfire simulator, not a high-fidelity wildfire prediction model, and not a physical or digital twin of a specific fire.

---

## 3. Why AWSRT exists

The thesis begins from the claim:

```text
Information that arrives is not always useful.
```

AWSRT exists to make that claim experimentally inspectable.

In adaptive sensing systems, a sensor network may detect events, transmit observations, update a belief state, and move sensors, while the maintained representation of the world becomes stale, distorted, or insufficient for decision support. AWSRT provides a controlled environment for asking when information delivery, detection timing, belief quality, and usefulness-state interpretation move together — and when they separate.

The purpose is not to predict wildfire spread. The purpose is to study how impaired sensing affects maintained belief and the usefulness of information in a dynamic monitoring task.

---

## 4. What AWSRT is

AWSRT is a bounded research software instrument for studying questions such as:

- when sensing activity and useful information diverge;
- how delay, noise, and loss affect maintained belief quality;
- how detection timing differs from belief maintenance;
- how deployment geometry and observation windows affect timing access;
- how adaptive sensing policies behave under impaired information flow;
- how compact usefulness states such as exploit, recover, and caution remain interpretable under controlled conditions.

AWSRT exposes relationships among:

- timing, such as time-to-first-detection;
- information delivery, such as whether observations arrive;
- belief quality, such as entropy-based summaries;
- usefulness-state behavior, such as exploit, recover, and caution occupancy;
- structural variables, such as deployment geometry, observation windows, transformed fire artifacts, and tie-breaking semantics.

---

## 5. What AWSRT is not

AWSRT should not be read as:

- a real-time operational wildfire management system;
- a high-fidelity physical wildfire simulator;
- a physical twin or digital twin of a specific fire;
- a universally optimal adaptive-sensing controller;
- a claim that one metric captures usefulness by itself;
- a claim that the tested results generalize to all wildfire settings.

The Physical Surface uses structured wildfire-like fields and transformed fire artifacts as experimental substrates. These fields may represent or stand in for environmental structure, but they are used to test sensing, belief maintenance, and information-usefulness questions rather than to predict real wildfire behavior.

---

## 6. How AWSRT supports the thesis argument

AWSRT supports the thesis by separating several things that are often conflated:

```text
Detection timing
Information delivery
Belief quality
Usefulness-state interpretation
Movement/effort and structural variables
```

The thesis does not only ask whether a sensing system detects fire. It asks whether the system maintains an uncertainty-aware belief state under impaired information flow.

AWSRT helps make this visible because it can compare:

- healthy, delayed, noisy, and lossy information flows;
- delivery-side metrics and belief-side metrics;
- early detection and maintained belief quality;
- sensor activity and usefulness-state occupancy;
- different deployment geometries and observation windows.

The tool therefore supports the thesis-level separation:

```text
Information arrival is not equivalent to information usefulness.
```

---

## 7. The four research surfaces

AWSRT is organized around four research surfaces. These are methodological separations, not claims about a real wildfire-response architecture.

### 7.1 Physical Surface

The Physical Surface creates or imports dynamic wildfire-like field substrates.

It includes grid structure, ignition, fire-like spread, terrain-like structure, directional-bias fields, fuel-like heterogeneity, scalar environmental fields, and transformed fire artifacts.

Committee-facing interpretation:

```text
This surface provides the changing external field that the sensing system must monitor.
```

Boundary:

```text
It is an experimental field generator and artifact interface, not a physical wildfire-prediction engine.
```

### 7.2 Epistemic Surface

The Epistemic Surface maintains belief and uncertainty representations over the monitored field.

It supports belief updates, uncertainty summaries, entropy calculations, and belief-quality analysis.

Committee-facing interpretation:

```text
This surface represents what the system believes about the external field and how uncertain that belief is.
```

This surface is central because the thesis is concerned with belief maintenance, not merely event detection.

### 7.3 Operational Surface

The Operational Surface runs adaptive sensing behavior.

It includes sensing-network policies, deployment settings, impairment models, compact usefulness interpretation, and controller-facing diagnostics.

The compact usefulness triad is interpreted as:

```text
exploit  -> usable information flow
recover  -> delayed or stale information flow
caution  -> corrupted or suspect information flow
```

Committee-facing interpretation:

```text
This surface asks how sensing behavior changes when observations are healthy, delayed, noisy, or lost.
```

### 7.4 Analysis Surface

The Analysis Surface supports study manifests, metric extraction, figure generation, raw artifact inspection, and thesis-facing interpretation.

It compares timing, information delivery, belief quality, usefulness-state behavior, effort, and structural variables such as deployment geometry and observation-window selection.

Committee-facing interpretation:

```text
This surface turns runs and artifacts into the metrics and figures used for thesis interpretation.
```

---

## 8. The frozen v0.6 evidence state

AWSRT v0.6 is the frozen evidence state supporting the current thesis and paper interpretation.

v0.6 tested deployment geometry and observation-window effects under transformed real-fire conditions.

The central v0.6 interpretation is:

```text
Normalized deployment geometry and observation-window structure strongly affect detection timing,
especially finite time-to-first-detection availability, while the compact usefulness triad remains
condition-readable across the tested transformed real-fire artifacts.
```

The compact usefulness-state mapping remained readable under the tested conditions:

```text
healthy -> exploit-dominant
delay   -> recover-dominant
noise   -> caution-dominant
```

This supports the thesis-level separation between timing access, information delivery, belief quality, and usefulness-state interpretation.

Important limitation:

```text
The v0.6 evidence base is bounded transformed-real-fire evidence, not universal wildfire generalization.
```

---

## 9. What v0.7 and v0.8 changed

### v0.7

v0.7 did not reopen or rerun the frozen v0.6 experiments.

It improved AWSRT as a shareable research repository through:

- clearer four-surface terminology;
- README and documentation improvements;
- local install notes;
- v0.6 reproducibility pointers;
- frontend production-build hardening;
- movement/path auditability;
- subgoal freeze checklist;
- repository closeout discipline.

### v0.8

v0.8 also does not reopen the frozen v0.6 evidence state by default.

It improves reproducible handoff through:

- clean-machine installation verification;
- minimal first-run workflow;
- backend smoke-test workflow;
- frontend build/runtime check workflow;
- JOSS/community readiness review;
- repository metadata and hygiene cleanup;
- committee-facing orientation.

v0.8 should be read as a handoff and readiness pass, not a new scientific result version.

---

## 10. What a committee member can inspect or run

A committee member does not need to inspect every design note.

A useful reading path is:

```text
1. README.md
2. docs/overview/awsrt_committee_orientation.md
3. docs/reproducibility/minimal_first_run.md
4. docs/reproducibility/reproduce_v0_6.md
```

A technically inclined committee member can also inspect:

```text
docs/install/local_install.md
docs/development/backend_smoke_test.md
docs/development/frontend_build_check.md
docs/development/joss_community_readiness_review.md
```

The minimal first-run workflow starts the backend and frontend, creates a small Physical Surface smoke artifact, and opens it in the Physical Visualizer.

That first-run artifact is a software/handoff check. It is not a thesis result.

---

## 11. How to read AWSRT results without overclaiming

AWSRT results should be read as controlled diagnostic evidence.

Appropriate readings:

- The tool can show when detection timing, delivered observations, belief quality, and usefulness-state behavior separate.
- The v0.6 evidence supports the thesis claim under bounded transformed-real-fire conditions.
- Deployment geometry and observation window can strongly affect timing access.
- Delay, noise, and healthy conditions can produce distinguishable usefulness-state signatures under the tested setup.

Overclaims to avoid:

- AWSRT predicts wildfire spread.
- AWSRT is an operational response tool.
- AWSRT is a digital twin.
- v0.6 proves universal wildfire generalization.
- The compact usefulness triad fully explains all sensing behavior.
- A successful smoke artifact is scientific reproduction.

---

## 12. Pointers to detailed documentation

Core entry points:

```text
README.md
docs/README.md
```

Installation and handoff:

```text
docs/install/local_install.md
docs/install/clean_machine_check.md
docs/reproducibility/minimal_first_run.md
```

Frozen evidence state:

```text
docs/reproducibility/reproduce_v0_6.md
```

Validation workflows:

```text
docs/development/backend_smoke_test.md
docs/development/frontend_build_check.md
docs/development/subgoal_freeze_checklist.md
```

Community readiness:

```text
docs/development/joss_community_readiness_review.md
```

Design-note archive:

```text
docs/design/
```

Backlog:

```text
docs/backlog/v0_8_backlog.md
```

---

## 13. Summary

AWSRT is best understood as a bounded diagnostic research instrument.

Its role in the thesis is to make the separation between information arrival and information usefulness inspectable under controlled adaptive sensing conditions.

The software should be judged by whether it supports that methodological and evidentiary role, not by whether it behaves like an operational wildfire simulator.
