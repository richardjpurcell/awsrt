# AWSRT v0.1 Reproducibility Notes

## Purpose

This document records the practical information needed to reproduce the AWSRT v0.1 codebase, figures, and thesis-results chapter associated with the frozen `v0.1` tag.

AWSRT v0.1 should be understood as the frozen thesis-results version of the platform. Any code changes, preset changes, experiment changes, or figure-generation changes made after the `v0.1` tag belong to `v0.2-dev` or later unless explicitly backported and tagged separately.

## Repository state

- Frozen Git tag: `v0.1`
- Development branch after freeze: `v0.2-dev`

To return to the frozen version:

```bash
git checkout v0.1