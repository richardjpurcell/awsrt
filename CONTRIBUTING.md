# Contributing to AWSRT

Thank you for your interest in AWSRT.

AWSRT is an academic research software project focused on adaptive wildfire
sensing in dynamic and uncertain environments. At this stage, the project is
still evolving, so contributions are welcome, but they should be made with care
for reproducibility, clarity, and research integrity.

## How to contribute

You can contribute by:

- reporting bugs,
- suggesting documentation improvements,
- proposing new research workflows or analysis features,
- improving tests,
- or submitting code changes through pull requests.

For substantial changes, please open an issue first so the proposed change can
be discussed before implementation.

## Development principles

Please keep the following in mind when contributing:

- preserve reproducibility where possible;
- avoid breaking frozen or tagged research releases;
- document user-visible changes clearly;
- prefer small, reviewable pull requests;
- keep research-facing terminology consistent with the repository documentation.

## Branching and releases

The repository may contain both frozen research-release states and active
development branches.

- Tagged releases such as `v0.1` represent preserved research software states.
- Ongoing development may continue on later branches such as `v0.2-dev`.

Contributors should avoid rewriting public history associated with tagged
research releases.

## Reporting bugs

When reporting a bug, please include:

- your operating system,
- Python and/or Node versions if relevant,
- the command or workflow you ran,
- the expected behavior,
- the observed behavior,
- and any relevant logs or screenshots.

## Code style

Please follow existing project conventions where possible. Consistency,
readability, and traceability matter more than stylistic novelty.

## Testing

Where feasible, changes should include or preserve tests. If a change affects
research workflows, manifests, or outputs, describe how it was verified.

## Questions

If you are unsure whether a contribution is appropriate, open an issue and
describe the proposed change before starting implementation.