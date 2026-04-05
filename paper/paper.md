---
title: "AWSRT: Adaptive Wildfire Sensing Research Tool for Dynamic and Uncertain Environments"
tags:
  - Python
  - TypeScript
  - FastAPI
  - Next.js
  - wildfire sensing
  - adaptive sensing
  - uncertainty
  - simulation
  - sensor networks
authors:
  - name: Richard Purcell
    affiliation: 1
affiliations:
  - name: Dalhousie University, Halifax, Nova Scotia, Canada
    index: 1
date: 2026-04-05
bibliography: paper.bib
---

# Summary

AWSRT (Adaptive Wildfire Sensing Research Tool) is a research software platform for studying adaptive sensing in wildfire environments under uncertainty. It supports linked workflows for physical wildfire environment generation and replay, belief-state and uncertainty analysis, sensing-policy experiments, impairment studies involving delay, noise, and loss, and comparative analysis through preserved manifests, metrics, and figures.

The software is designed for research settings in which the usefulness of sensed information cannot be captured by simple coverage or delivery counts alone. AWSRT makes it possible to study not only whether information is collected or transmitted, but also whether it remains operationally useful for maintaining timely and informative beliefs about a changing wildfire environment.

This paper documents the frozen AWSRT `v0.1` research software release, which provides a stable basis for the first thesis-results version of the platform. Ongoing platform development continues in later public versions.

# Statement of need

Adaptive wildfire sensing research combines several tightly coupled problems: evolving physical fire environments, uncertain and impaired observations, adaptive deployment of sensing resources, belief updating, and the analysis of timeliness and uncertainty. In practice, these layers are often addressed separately or connected through ad hoc scripts and one-off pipelines. This makes it difficult to compare sensing strategies under matched assumptions, preserve reproducible experiment states, and evaluate whether delivered information remains useful to operational belief quality.

AWSRT was created to address this gap. It provides a unified research software environment in which wildfire environment generation or replay, epistemic belief evolution, sensing-policy comparison, impairment modeling, and experiment analysis can be studied together. The intended users are researchers working on adaptive sensing, sensor networks, uncertainty-aware inference, information quality, and simulation-based decision support in dynamic environments.

AWSRT is not presented as a finished operational wildfire response product. Its role is instead that of a reusable research platform: a software basis for structured experiments, comparative studies, reproducible workflows, and continuing methodological development.

# State of the field

Software relevant to AWSRT typically emphasizes only part of the broader adaptive wildfire sensing workflow. Wildfire-focused systems often concentrate on physical spread simulation, environmental forcing, or historical replay. Sensor-network and adaptive sensing research software often emphasizes deployment, routing, or coordination logic in more abstract environments. Other packages support probabilistic inference, uncertainty quantification, or analysis workflows, but not in a form that directly couples wildfire-oriented physical evolution, impaired observations, adaptive sensing actions, and experiment recovery.

AWSRT was developed for the gap between these categories. Its purpose is not simply to model wildfire spread, nor simply to test generic sensing strategies, but to provide an integrated research platform in which physical environments, belief updates, sensing policies, impairments, and downstream analysis can be studied together under matched assumptions. This makes it possible to ask software-supported research questions that are awkward to study with separate tools stitched together only through custom scripts.

That integrated role is particularly important for research questions where timeliness, uncertainty reduction, detection performance, and operational usefulness do not move together. In AWSRT, these can be examined jointly through linked physical, epistemic, operational, and analysis layers. The software was therefore built not as a replacement for specialized fire simulators or general inference packages, but as a research platform for comparative adaptive sensing studies in dynamic and uncertain wildfire environments.

# Software design

AWSRT is organized around four linked research layers: physical, epistemic, operational, and analysis. The physical layer supports synthetic wildfire environment generation and historical replay workflows. The epistemic layer supports belief-state construction and uncertainty summaries over physical runs. The operational layer supports sensing-network experiments with multiple policy families and explicit impairment settings. The analysis layer supports experiment comparison through manifests, metrics, visualizations, and figure-generation workflows.

The platform uses a backend/frontend design. The backend provides experiment creation, execution, storage, and data-serving functionality. The frontend supports visualization, design inspection, and comparative analysis of runs and studies. This separation was chosen to support both reproducible programmatic workflows and interactive inspection of experiment states and outputs.

A central design choice in AWSRT is the preservation of manifests and associated experiment artifacts. Runs and studies are intended to be recoverable, comparable, and reviewable without depending on undocumented local state. Another deliberate design choice in the `v0.1` release is the use of simple, swappable policy families rather than a single highly specialized control method. This supports comparative research and extensibility while keeping the initial release understandable and reusable.

The frozen `v0.1` release documented here is intended to be meaningful as research software while remaining open to later refinement in simulation realism, policy design, regime logic, and analysis workflows.

# Research impact statement

AWSRT already serves as the software basis for the thesis-results version of the broader AWSRT research program. In that role, it supports reproducible workflows for generating or replaying wildfire environments, constructing belief-state analyses, comparing sensing-policy families, running impairment studies involving delay, noise, and loss, and preserving the manifests and figure outputs associated with those studies.

Its research significance lies in enabling structured comparison across layers of a problem that are otherwise easy to fragment: physical evolution, uncertain observation, adaptive sensing, and the analysis of information quality over time. In particular, AWSRT supports experiments in which the distinction between information delivered and information still operationally useful can be studied directly rather than assumed away. This includes cases where observations continue to arrive but cease to improve belief quality in time, and cases where different impairment modes produce different failure patterns.

AWSRT therefore contributes research value in two ways. First, it provides a reproducible software basis for the author’s ongoing thesis and associated software, methods, and results papers. Second, it offers a reusable starting point for other researchers studying adaptive sensing in dynamic environments where belief quality, timeliness, and control logic must be examined together rather than in isolation.

# AI usage disclosure

OpenAI language-model tools were used in the drafting and editorial revision of repository documentation and manuscript text. All technical claims, software descriptions, and final wording were reviewed and validated by the author against the repository, the software release structure, and the intended scholarly framing.

# Acknowledgements

AWSRT was developed as part of ongoing research on adaptive wildfire sensing in dynamic and uncertain environments. Specific institutional, funding, and collaboration acknowledgements will be added as appropriate for the submission release.

# References