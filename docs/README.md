# AWSRT Documentation Index

This directory contains project documentation for AWSRT, including installation notes, reproducibility notes, development workflow guidance, and versioned design records.

AWSRT is a research instrument for studying adaptive sensing, belief maintenance, impaired information flow, and usefulness under wildfire-like dynamic fields. The documentation here supports that research use. It should not be read as operational wildfire-deployment guidance.

---

## Start here

- [`../README.md`](../README.md) — project overview, research framing, quickstart, and repository structure.
- [`install/local_install.md`](install/local_install.md) — local setup instructions for backend and frontend development.
- [`install/clean_machine_check.md`](install/clean_machine_check.md) — v0.8 clean-machine / reproducible-handoff verification note.
- [`reproducibility/reproduce_v0_6.md`](reproducibility/reproduce_v0_6.md) — notes for reproducing or inspecting the frozen v0.6 result state.
- [`reproducibility/minimal_first_run.md`](reproducibility/minimal_first_run.md) — minimal v0.8 first-run workflow for starting AWSRT, creating a small smoke artifact, and opening it in the Physical Visualizer.

---

## Development workflow

- [`development/subgoal_freeze_checklist.md`](development/subgoal_freeze_checklist.md) — lightweight checklist for freezing AWSRT development subgoals.

Use this checklist when finishing frontend, backend, documentation, or mixed changes. In particular, frontend-touching work should normally run:

```bash
npm --prefix frontend run build
```

before freeze/push.

---

## Design notes

- [`design/`](design/) — versioned design notes, subgoal plans, freeze notes, and interpretation records.

The design notes preserve the reasoning behind AWSRT development decisions. They are intentionally more detailed and historical than the root README.

Recent v0.8 design notes include:

- `v0_8_01_roadmap_and_backlog_triage.md`
- `v0_8_02_clean_machine_install_verification.md`
- `v0_8_03_minimal_reproducible_first_run_workflow.md`

The active v0.8 backlog is:

- [`backlog/v0_8_backlog.md`](backlog/v0_8_backlog.md)

Recent v0.7 design notes include:

- `v0_7_01_shareable_research_tool_roadmap.md`
- `v0_7_02_surface_terminology_and_splash_reframing.md`
- `v0_7_03_readme_and_local_installation_docs.md`
- `v0_7_04_ui_maturity_pass.md`
- `v0_7_05_physical_surface_abstraction_pass.md`
- `v0_7_06_sensor_trajectory_movement_auditability.md`
- `v0_7_07_batch_origin_cases_geometry_study_design.md`
- `v0_7_08_frontend_production_build_hardening.md`
- `v0_7_09_freeze_checklist_and_developer_workflow.md`
- `v0_7_10_readme_and_docs_index_alignment.md`

---

## Other documentation areas

- [`backlog/`](backlog/) — active v0.8 backlog and deferred platform follow-ups.
- [`foundations/`](foundations/) — foundational notes and theoretical framing.
- [`install/`](install/) — installation and local development setup.
- [`reproducibility/`](reproducibility/) — reproduction notes for frozen result states.

---

## Historical notes

Older top-level files such as `REPRODUCIBILITY_v0.1.md`, `RESULTS_MANIFEST_v0.1.md`, and `VERSION_NOTES_v0.*.md` are retained for auditability.
