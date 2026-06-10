---

title: "AWSRT: Adaptive Wildfire Sensing Research Tool for Belief Maintenance Under Impaired Information Flow"
tags:

* Python
* TypeScript
* FastAPI
* Next.js
* wildfire sensing
* adaptive sensing
* uncertainty
* research software
* sensor networks
  authors:
* name: Richard Purcell
  affiliation: 1
  affiliations:
* name: Dalhousie University, Halifax, Nova Scotia, Canada
  index: 1
  date: 2026-06-10
  bibliography: paper.bib

---

# Summary

AWSRT (Adaptive Wildfire Sensing Research Tool) is research software for studying adaptive sensing, belief maintenance, information impairment, epistemic inspectability, and usefulness under wildfire-like dynamic fields. It supports linked workflows for structured dynamic-field generation, transformed wildfire-like artifacts, belief-state and uncertainty analysis, sensing-policy experiments, impairment studies involving delay, noise, and loss, support-geometry probes, and comparative analysis through preserved manifests, metrics, figures, and visual inspection workflows.

AWSRT is designed for research settings in which the usefulness of sensed information cannot be captured by simple detection, coverage, or delivery counts alone. The software makes it possible to study not only whether information is collected or transmitted, but also whether it remains useful for maintaining an uncertainty-aware belief state about a changing field.

AWSRT is not an operational wildfire simulator, physical twin, digital twin, or emergency-response product. Its role is that of a bounded diagnostic research instrument: it helps researchers make separations among sensing activity, information delivery, belief quality, usefulness-state diagnostics, support/arrival structure, and structural variables inspectable under controlled experimental conditions.

This paper documents the current public research-software framing of AWSRT after the v0.8 reproducible-handoff work and v0.9 interpretability/inspectability work. The repository retains older frozen result states for auditability, while the current documentation track prepares the project for JOSS/open-science review.

# Statement of need

Adaptive wildfire-like sensing research combines several tightly coupled problems: evolving spatial fields, uncertain and impaired observations, constrained sensing resources, adaptive deployment, belief updating, and analysis of timeliness and uncertainty. These layers are often studied separately or connected through ad hoc scripts. That makes it difficult to compare sensing strategies under matched assumptions, preserve reproducible experiment states, and evaluate whether delivered information remains useful for maintaining belief quality.

AWSRT was created to address this gap. It provides a unified research software environment in which wildfire-like field structure, epistemic belief evolution, sensing-policy comparison, impairment modeling, support/arrival inspection, and experiment analysis can be studied together. The intended users are researchers working on adaptive sensing, sensor networks, uncertainty-aware inference, information quality, visualization, and simulation-assisted decision-support research in dynamic environments.

The central research need is not simply to generate wildfire-like fields or test controllers. It is to study when information that arrives at a monitoring system remains useful for belief maintenance. In impaired sensing settings, observations may be delayed, corrupted, lost, poorly located, redundant, or no longer belief-improving. AWSRT provides a research environment for making these distinctions visible.

AWSRT is therefore not presented as a finished operational wildfire-response product. Its role is instead that of reusable research software: a basis for structured experiments, comparative studies, reproducible workflows, visual inspection, and continuing methodological development.

# State of the field

Software relevant to AWSRT typically emphasizes only part of the broader adaptive sensing workflow. Wildfire-focused systems often concentrate on physical spread modeling, environmental forcing, or historical-fire analysis. Sensor-network and adaptive-sensing tools often emphasize deployment, routing, or coordination logic in more abstract environments. Other packages support probabilistic inference, uncertainty quantification, or analysis workflows, but not necessarily in a form that directly couples wildfire-like field evolution, impaired observations, adaptive sensing actions, belief maintenance, and recoverable experiment artifacts.

AWSRT was developed for the gap between these categories. Its purpose is not to replace specialized fire models or general inference packages. Rather, AWSRT provides an integrated research instrument in which external-field structure, belief updates, sensing policies, impairments, epistemic support probes, and downstream analysis can be inspected together under matched assumptions.

This integrated role is particularly important for research questions where timeliness, delivery, uncertainty reduction, and usefulness diagnostics do not move together. Age-of-information research has shown that freshness is itself an important property of status-update systems [@kaul2012; @kosta2017]. Classical information theory and entropy-based reasoning provide tools for understanding uncertainty and information content [@shannon1948; @jaynes2003]. AWSRT connects these concerns to adaptive wildfire-like sensing experiments by preserving the distinction between information arrival and belief-maintenance usefulness.

# Software design

AWSRT is organized around four linked research surfaces: Physical, Epistemic, Operational, and Analysis.

The Physical Surface defines structured environmental fields used by AWSRT experiments. These include grid structure, ignition, fire-like spread, terrain-like structure, directional-bias fields, fuel-like heterogeneity, scalar environmental fields, and transformed wildfire-like artifacts. This surface should be understood as an experimental field generator and artifact interface, not as a physical wildfire-prediction engine.

The Epistemic Surface maintains belief-state and uncertainty representations over the monitored field. It supports belief updates, uncertainty summaries, entropy calculations, belief-quality analysis, controlled support-geometry probes, and visual inspection of support/arrival structure. The v0.9 Epistemic Surface work added support-geometry inspection workflows that separate prescribed support, realized arrivals, delivered-information activity, entropy-side belief quality, and visual impressions under controlled conditions. These support geometries are epistemic probes, not operational wildfire search policies.

The Operational Surface runs adaptive sensing behavior. It includes sensing-network policies, deployment settings, impairment models, compact usefulness interpretation, and controller-facing diagnostics. The compact usefulness triad is interpreted as exploit, recover, and caution behavior: usable, stale, or suspect information flow under the tested AWSRT conditions.

The Analysis Surface supports study manifests, metric extraction, figure generation, raw artifact inspection, and thesis-facing interpretation. It is used to compare timing, information delivery, belief quality, usefulness-state behavior, epistemic support/arrival structure, movement effort, and structural variables such as deployment geometry and observation-window selection.

The platform uses a backend/frontend design. The backend provides experiment creation, execution, storage, and data-serving functionality. The frontend supports design, visualization, inspection, and comparative analysis of runs and studies. This separation supports both reproducible programmatic workflows and interactive inspection of experiment states and outputs.

A central design choice in AWSRT is the preservation of manifests and associated experiment artifacts. Runs and studies are intended to be recoverable, comparable, and reviewable without depending on undocumented local state. Another design choice is to use simple, inspectable policy families and diagnostic probes rather than a single highly specialized controller. This supports comparative research and extensibility while preserving interpretability.

# Research impact statement

AWSRT serves as the software basis for a broader research program on adaptive wildfire-like sensing, belief maintenance, and impaired information flow. In that role, it supports workflows for constructing wildfire-like fields, maintaining belief-state analyses, comparing sensing-policy families, running impairment studies involving delay, noise, and loss, inspecting support/arrival structure, and preserving manifests and figure outputs associated with those studies.

Its research significance lies in enabling structured comparison across layers of a problem that are otherwise easy to fragment: external-field evolution, uncertain observation, adaptive sensing, information impairment, belief maintenance, and analysis of information quality over time. In particular, AWSRT supports experiments in which the distinction between information delivered and information useful for maintained belief quality can be studied directly rather than assumed away.

AWSRT contributes research value in two ways. First, it provides a reproducible software basis for the author’s thesis and associated software, methods, and results papers. Second, it offers a reusable starting point for other researchers studying adaptive sensing in dynamic environments where belief quality, timeliness, impairment, visualization, and control logic must be examined together rather than in isolation.

# Scope and limitations

AWSRT is bounded research software. It does not claim full physical wildfire validity, operational readiness, or universal controller optimality. Its wildfire-like fields and transformed artifacts are experimental substrates, not complete wildfire reconstructions. Its Epistemic Surface support geometries are controlled belief-maintenance probes, not operational search policies. Its usefulness-state diagnostics are internal information-health summaries, not validated labels of external wildfire decision quality.

These limitations are deliberate. They define the software’s scientific role: AWSRT is designed to make information/usefulness separations inspectable under controlled adaptive sensing conditions. It should be evaluated as a research instrument for studying belief maintenance under impaired information flow, not as an emergency-management platform.

# AI usage disclosure

OpenAI language-model tools were used in the drafting and editorial revision of repository documentation and manuscript text. All technical claims, software descriptions, and final wording were reviewed and validated by the author against the repository, the software release structure, and the intended scholarly framing.

# Acknowledgements

AWSRT was developed as part of ongoing research on adaptive wildfire sensing, belief maintenance, and impaired information flow in dynamic and uncertain environments. Specific institutional, funding, and collaboration acknowledgements will be added as appropriate for the submission release.

# References
