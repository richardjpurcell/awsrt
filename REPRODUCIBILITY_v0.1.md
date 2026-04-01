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


Two small notes:
- You can also include Node here, since you checked it earlier: `18.20.5`
- Git is usually better written as `Git version: 2.41.0` rather than `git 2.41.0`

So an even better Host environment block would be:

```md id="6dxj8l"
## Host environment

- Python version: `3.10.14`
- Git version: `2.41.0`
- Node version: `18.20.5`
- npm version: `10.8.2`