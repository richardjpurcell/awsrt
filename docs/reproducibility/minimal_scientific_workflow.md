# AWSRT Minimal Scientific Workflow

## Purpose

This workflow provides a small deterministic demonstration of a central
experimental separation in AWSRT:

> An observation opportunity affects the maintained belief only when the
> resulting observation is delivered.

The workflow is intended as a scientific first run for a researcher who has
already installed AWSRT. It is more than an application smoke test, but it is
not a reproduction of the larger historical v0.6 experiments.

The experiment uses one small physical truth and compares two epistemic runs
with the same deterministic sensing configuration:

- a delivered case with zero observation loss;
- a total-loss case in which all attempted observations are lost.

The controlled difference is therefore information delivery, not the physical
truth or sensing configuration.

## Prerequisites

Install AWSRT using:

```text
docs/install/local_install.md
```

The example uses only the Python standard library in addition to the installed
AWSRT backend.

Start the backend from the repository root:

```bash
make backend
```

The example expects the backend at:

```text
http://127.0.0.1:8000
```

## Run the experiment

In a second terminal, from the repository root:

```bash
python examples/minimal_scientific_workflow.py
```

The script performs the following sequence through the public AWSRT HTTP API:

```text
create deterministic physical truth
        |
        +--> run deterministic sensing with zero loss
        |        |
        |        +--> received observations --> maintained belief
        |
        +--> run the same sensing configuration with total loss
                 |
                 +--> no received observations --> prior belief retained
```

Specifically, the script:

1. creates and runs one deterministic 8 x 8 physical artifact;
2. creates a Belief Lab run using deterministic scanline support and zero
   delivery loss;
3. creates a second Belief Lab run referencing the same physical artifact and
   using the same sensing configuration, but with total delivery loss;
4. retrieves the public time-series outputs for both runs;
5. compares arrival fraction and mean entropy;
6. verifies the expected relationship and exits with an error if it is broken.

## Expected result

Artifact IDs are generated for each run and should not be treated as fixed
expected values.

A successful run should show the following qualitative pattern:

```text
Delivered arrival fraction: nonzero at each step
Total-loss arrival fraction: zero at each step

Delivered mean entropy: below 1 bit for at least one step
Total-loss mean entropy: 1 bit at every step

Verification: PASS
```

During the v0.11 JOSS-preparation audit, repeated executions produced:

```text
Delivered arrival fraction: [0.125, 0.125, 0.125]
Total-loss arrival fraction: [0.0, 0.0, 0.0]

Delivered mean entropy:      [0.9897869825363159, 0.9897869825363159, 0.9897869825363159]
Total-loss mean entropy:     [1.0, 1.0, 1.0]

Verification: PASS
```

The exact artifact IDs changed between executions while these scientific
outputs reproduced.

## Interpretation

Both epistemic runs refer to the same generated physical truth and use the
same deterministic sensing configuration. The controlled difference is the
delivery-loss probability.

In the zero-loss case, attempted observations are delivered. The public
time-series output therefore reports a nonzero arrival fraction, and the
delivered evidence reduces mean belief entropy below the 1-bit Bernoulli
maximum.

In the total-loss case, no attempted observations arrive. With the configured
prior probability of 0.5 and the workflow's belief settings, mean entropy
remains at 1 bit.

The example therefore demonstrates a basic AWSRT distinction:

```text
observation opportunity != received evidence != belief consequence
```

An observation opportunity is not sufficient by itself. Delivery determines
whether the resulting evidence becomes available to the maintained belief.

The entropy change in this deliberately small example is modest because the
scanline support observes only part of the 8 x 8 domain. The purpose is to
make the controlled separation quick and inspectable, not to demonstrate a
large effect size.

## Automated invariant check

The corresponding automated integration test is:

```text
backend/tests/test_belief_integration.py
```

Run it with:

```bash
python -m pytest backend/tests/test_belief_integration.py
```

The integration test checks the same experiment at a stronger cell-level
resolution. In particular, it verifies that:

- the delivered and total-loss runs attempt identical nonzero sensing support;
- with zero loss and zero delay, attempted observations arrive;
- with total loss, no observations arrive despite the sensing opportunity;
- without arrivals, belief remains at the 0.5 prior and Bernoulli entropy
  remains at 1 bit;
- delivered observations change belief on observed cells and reduce entropy
  on at least one arrived cell.

The executable example and the integration test therefore have different
roles: the example exposes the scientific comparison through the public API,
while the test protects the underlying invariant automatically.

## Relationship to other reproducibility documentation

For a basic application startup and visualization smoke test, use:

```text
docs/reproducibility/minimal_first_run.md
```

For orientation to the frozen v0.6 transformed-real-fire result state, use:

```text
docs/reproducibility/reproduce_v0_6.md
```

The v0.6 material represents a larger historical experimental evidence state.
This minimal workflow does not reproduce those experiments and should not be
interpreted as doing so.

The separately archived paper reproduction bundle supports inspection and
regeneration of paper-facing analysis outputs from preserved artifacts. It is
also distinct from this current-software scientific first run.

## Scope and limitations

This workflow is a controlled research-instrument demonstration.

It does not establish:

- operational wildfire prediction performance;
- generalization to real wildfire behavior;
- operational sensor-network performance;
- superiority of one sensing policy over another;
- reproduction of the full v0.6 experimental result state.

Its purpose is narrower: to demonstrate, using the current AWSRT software,
that sensing opportunity, information delivery, and belief consequence are
separable stages of the experiment.
