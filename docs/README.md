# AWSRT Documentation Index

This directory contains project documentation for AWSRT, including installation notes, reproducibility notes, development workflow guidance, JOSS/open-science readiness notes, and versioned design records.

AWSRT is a research instrument for studying adaptive sensing, belief maintenance, impaired information flow, epistemic inspectability, and usefulness under wildfire-like dynamic fields. The documentation here supports that research use. It should not be read as operational wildfire-deployment guidance.

The current documentation goal is to align the repository after the v0.9 interpretability/inspectability work and prepare the public-facing documentation for JOSS/open-science review.

---

## Start here

* [`../README.md`](../README.md) — project overview, research framing, quickstart, testing notes, and repository structure.
* [`overview/awsrt_committee_orientation.md`](overview/awsrt_committee_orientation.md) — committee-facing orientation to AWSRT’s thesis role, four research surfaces, and bounded interpretation.
* [`install/local_install.md`](install/local_install.md) — local setup instructions for backend and frontend development.
* [`install/clean_machine_check.md`](install/clean_machine_check.md) — v0.8 clean-machine / reproducible-handoff verification note.
* [`reproducibility/reproduce_v0_6.md`](reproducibility/reproduce_v0_6.md) — notes for reproducing or inspecting the frozen v0.6 result state.
* [`reproducibility/minimal_first_run.md`](reproducibility/minimal_first_run.md) — minimal v0.8 first-run workflow for starting AWSRT, creating a small smoke artifact, and opening it in the Physical Visualizer.
* [`design/v0_10_01_joss_open_science_doc_refresh.md`](design/v0_10_01_joss_open_science_doc_refresh.md) — current documentation-refresh design goal for README, install, reproducibility, citation, contribution, and JOSS/open-science readiness.

---

## Development workflow

* [`development/subgoal_freeze_checklist.md`](development/subgoal_freeze_checklist.md) — lightweight checklist for freezing AWSRT development subgoals.
* [`development/backend_smoke_test.md`](development/backend_smoke_test.md) — backend import, health, and pytest smoke-test workflow.
* [`development/frontend_build_check.md`](development/frontend_build_check.md) — frontend install, production-build, and dev-server validation workflow.
* [`development/joss_community_readiness_review.md`](development/joss_community_readiness_review.md) — v0.8 JOSS/community readiness review and gap triage, retained as the starting point for the v0.10 documentation refresh.

Use this checklist when finishing frontend, backend, documentation, or mixed changes. In particular, frontend-touching work should normally run:

```bash
npm --prefix frontend run build
```

before freeze/push.

---

## Design notes

* [`design/`](design/) — versioned design notes, subgoal plans, freeze notes, and interpretation records.

The design notes preserve the reasoning behind AWSRT development decisions. They are intentionally more detailed and historical than the root README.

Recent v0.10 design notes include:

* `v0_10_01_joss_open_science_doc_refresh.md`

Recent v0.9 design notes include:

* `v0_9_01_operational_visualizer_view_window_controls.md`
* `v0_9_02_operational_visualizer_stabilization.md`
* `v0_9_03_epistemic_inspectability_probe.md`
* `v0_9_04_builtin_epistemic_support_geometry_presets.md`
* `v0_9_05_epistemic_support_geometry_smoke_check_and_visual_readability_review.md`
* `v0_9_06_epistemic_visualizer_panel_simplification.md`
* `v0_9_07_diagnostic_prominence_triage.md`
* `v0_9_08_support_arrival_pairing.md`
* `v0_9_09_optional_cloud_impressionistic_rendering.md`
* `v0_9_13_epistemic_visualizer_metric_alignment_review.md`
* `v0_9_14_interpretability_freeze_review.md`
* `v0_9_15_freeze_checklist_and_release_note.md`

These notes document the shift from reproducible handoff toward interpretable inspection, including operational visualizer readability, Epistemic Surface support-geometry probes, Epistemic Visualizer support/arrival inspection, metric/figure refresh, visualizer--metric alignment, and interpretability freeze planning.

Recent v0.8 design notes include:

* `v0_8_01_roadmap_and_backlog_triage.md`
* `v0_8_02_clean_machine_install_verification.md`
* `v0_8_03_minimal_reproducible_first_run_workflow.md`
* `v0_8_04_backend_smoke_test_workflow.md`
* `v0_8_05_frontend_build_and_runtime_check_discipline.md`
* `v0_8_06_joss_and_community_readiness_review.md`
* `v0_8_07_repository_metadata_and_hygiene_cleanup.md`
* `v0_8_08_committee_facing_orientation_guide.md`
* `v0_8_09_consolidation_and_handoff_freeze_planning.md`

The historical v0.8 backlog is:

* [`backlog/v0_8_backlog.md`](backlog/v0_8_backlog.md)

Recent v0.7 design notes include:

* `v0_7_01_shareable_research_tool_roadmap.md`
* `v0_7_02_surface_terminology_and_splash_reframing.md`
* `v0_7_03_readme_and_local_installation_docs.md`
* `v0_7_04_ui_maturity_pass.md`
* `v0_7_05_physical_surface_abstraction_pass.md`
* `v0_7_06_sensor_trajectory_movement_auditability.md`
* `v0_7_07_batch_origin_cases_geometry_study_design.md`
* `v0_7_08_frontend_production_build_hardening.md`
* `v0_7_09_freeze_checklist_and_developer_workflow.md`
* `v0_7_10_readme_and_docs_index_alignment.md`

---

## Other documentation areas

* [`backlog/`](backlog/) — historical backlog files and deferred platform follow-ups.
* [`foundations/`](foundations/) — foundational notes and theoretical framing.
* [`install/`](install/) — installation and local development setup.
* [`reproducibility/`](reproducibility/) — reproduction notes for frozen result states.
* [`development/backend_smoke_test.md`](development/backend_smoke_test.md) — backend import, health, and pytest smoke-test workflow.
* [`development/frontend_build_check.md`](development/frontend_build_check.md) — frontend install, production-build, and dev-server validation workflow.
* [`development/joss_community_readiness_review.md`](development/joss_community_readiness_review.md) — v0.8 JOSS/community readiness review and gap triage.
* [`overview/`](overview/) — committee-facing and high-level orientation documents.

---

## Historical notes

Older top-level files such as `REPRODUCIBILITY_v0.1.md`, `RESULTS_MANIFEST_v0.1.md`, and `VERSION_NOTES_v0.*.md` are retained for auditability.
