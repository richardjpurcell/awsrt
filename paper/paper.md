---
title: "AWSRT: Adaptive Wildfire Sensing Research Tool for Belief Maintenance Under Impaired Information Flow"
tags:
  - Python
  - TypeScript
  - FastAPI
  - Next.js
  - wildfire sensing
  - adaptive sensing
  - uncertainty
  - research software
  - sensor networks
authors:
  - name: Richard Purcell
    affiliation: 1
    orcid: 0009-0005-1526-8338
affiliations:
  - name: Dalhousie University, Halifax, Nova Scotia, Canada
    index: 1
bibliography: paper.bib
---

# Summary

AWSRT (Adaptive Wildfire Sensing Research Tool) is research software for studying how adaptive sensing systems maintain an estimate of a changing environment when information is delayed, noisy, or lost. It brings together controlled field generation, sensing-policy experiments, communication impairments, uncertainty and belief-state analysis, inspection of attempted and received observations, and reproducible experiment artifacts within one environment.

AWSRT is designed for experiments in which sensing activity, information delivery, and maintained belief quality must remain distinguishable. It allows researchers to examine whether observations are available, whether they arrive, and how delivered evidence affects an uncertainty-aware belief state. AWSRT is a bounded diagnostic research instrument rather than an operational wildfire simulator, digital twin, or emergency-response product.

# Statement of need

Adaptive sensing in dynamic environments couples evolving fields, uncertain observations, constrained sensing resources, information impairment, and belief updating. When these layers are studied separately or connected through ad hoc scripts, it becomes difficult to compare sensing strategies under matched assumptions, preserve reproducible experiment states, or determine how delivery conditions affect maintained belief quality.

AWSRT provides a common experimental environment for these layers. Researchers can vary field structure, sensing behavior, observation support, delay, noise, and loss while retaining the resulting arrivals, belief states, metrics, and experiment artifacts for comparison and inspection. This supports research questions in which an observation being attempted, delivered, timely, or belief-improving are distinct events rather than interchangeable measures of sensing success. Existing tools typically provide depth within individual parts of this chain; AWSRT is intended to make the transitions between sensing opportunity, information delivery, and maintained belief experimentally inspectable.

The intended users are researchers studying adaptive sensing, sensor networks, uncertainty-aware inference, information quality, and simulation-assisted analysis in dynamic environments.

# State of the field

Adaptive and informative sensing research already provides sophisticated methods for deciding where, when, and what to observe. Informative path-planning methods select sensing actions or trajectories according to information objectives under resource constraints [@popovic2024adaptiveipp]. Related work on Value of Information and Uncertainty of Information explicitly distinguishes the receipt of observations from their value for estimating or maintaining knowledge of an underlying state [@wang2022voi; @chen2022uoi]. Age-of-information research similarly establishes timeliness as a property distinct from simple message delivery [@kaul2012; @kosta2017]. AWSRT therefore does not introduce uncertainty-aware sensing, information value, or freshness as concepts.

Existing research software also provides substantially greater specialization on individual parts of the problem. Wildfire simulators such as Cell2Fire model fire growth for wildfire-management and planning studies [@pais2021cell2fire], while network-simulation frameworks such as INET provide detailed communication-network, protocol, mobility, and physical-layer models [@meszaros2019inet]. AWSRT does not attempt to reproduce either level of physical-fire or communication-network fidelity. Its wildfire-like fields and delivery impairments instead provide controlled experimental conditions for studying their downstream consequences for sensing and maintained belief.

AWSRT occupies the experimental junction between these areas. It exposes external-field structure, observation opportunity and support, delivery impairment, realized arrivals, belief updates, sensing behavior, and downstream information-quality diagnostics as separately inspectable stages within one research environment. This permits matched experiments in which information collection, delivery, timeliness, uncertainty reduction, and belief-maintenance usefulness need not be treated as interchangeable. AWSRT was developed as a separate research instrument because the required experimental junction crosses the boundaries of these existing tools. Extending a wildfire-growth simulator would not by itself provide the controlled belief-maintenance and information-delivery experiments required here, while extending a network simulator would not provide the wildfire-like dynamic fields and belief-oriented diagnostics. The purpose of AWSRT is therefore not to replace these tools, but to provide a controlled experimental layer in which their relevant consequences can be studied together. The contribution is a reusable experimental instrument for studying these separations, rather than a new wildfire model, network simulator, information-value theory, or universally optimal sensing controller.

# Software design

AWSRT is organized around four linked research surfaces: External-field, Epistemic, Operational, and Analysis. The External-field Surface provides structured dynamic fields and transformed wildfire-like artifacts as experimental substrates. The Epistemic Surface maintains belief and uncertainty representations, including belief updates, entropy measures, and controlled probes of prescribed observation support and realized arrivals. The Operational Surface executes sensing policies, deployment configurations, delivery impairments, and usefulness diagnostics. The Analysis Surface preserves study manifests and supports metric extraction, figure generation, artifact inspection, and comparison across experimental conditions.

The platform uses a backend/frontend architecture. The backend provides experiment creation, execution, storage, and data-serving functionality, while the frontend supports experiment design, visualization, and comparative inspection. This permits both programmatic workflows and interactive examination of experiment states and outputs.

AWSRT deliberately preserves manifests and associated artifacts so runs and studies remain recoverable and comparable without undocumented local state. It also favors simple, inspectable policy families and diagnostic probes over a single specialized controller. This design favors controlled experimental structure and inspectability over high-fidelity simulation of either wildfire physics or communication networks. The trade-off allows the effects of sensing configuration and information impairment to be isolated without requiring AWSRT to serve as a full physical-fire or network simulator. This supports controlled comparison and extension while keeping the relationships among sensing opportunity, information delivery, belief state, and downstream diagnostics visible.

# Research impact statement

AWSRT has been used as the experimental research instrument for a PhD thesis on belief maintenance under impaired adaptive sensing and an associated journal manuscript on information delivery versus information usefulness. Paper-facing manifests, metric tables, figures, summaries, and analysis artifacts from this work are preserved in a published reproduction bundle [@purcell2026reproduction].

This research use progressed from sensing-policy comparison through controlled delay, noise, and loss studies to tests of sensitivity to environmental context, deployment geometry, and observation window. AWSRT enabled detection timing, coverage or contact, delivered-information activity, belief quality, and usefulness diagnostics to be examined separately. Subsequent Epistemic Surface studies further separated prescribed observation support, realized arrivals, information activity, and maintained belief quality. The current release-preparation workflow also provides a deterministic scientific first run that exposes the separation among observation opportunity, information delivery, and belief consequence through the public interface.

AWSRT's demonstrated research role is therefore as an inspectable experimental instrument for studying how sensing opportunity and impaired information delivery affect maintained belief. Its design permits reuse in other dynamic sensing experiments, although external adoption is not claimed here.

# Acknowledgements

The author thanks Dr. Srini Sampalli for supervision and guidance throughout this research. The author also thanks Dr. Marzia Zaman and Dr. Darshana Upadhyay of the MYTech Lab for their support.

# Scope and limitations

AWSRT is bounded research software, not an operational wildfire model or emergency-management platform. Its wildfire-like fields and transformed artifacts are experimental substrates rather than complete wildfire reconstructions. Epistemic support geometries are controlled belief-maintenance probes rather than operational search policies, and usefulness diagnostics describe internal information health rather than validated external decision quality. These boundaries define AWSRT's role as an experimental instrument for studying belief maintenance under impaired information flow.

# AI usage disclosure

OpenAI ChatGPT was used during software development, testing and reproducibility work, documentation preparation, and drafting and editing of manuscript text. Multiple GPT model versions available through ChatGPT were used over the development period; complete historical model-version records were not retained. Assistance included code and test suggestions, debugging and review support, documentation development, and editorial and reasoning support. The author made the primary research, software-architecture, and design decisions and reviewed, modified, tested, and validated AI-assisted outputs through repository inspection, software execution, automated testing, reproducibility checks, and comparison with the intended research design. The author takes responsibility for the software and manuscript content.

# References
