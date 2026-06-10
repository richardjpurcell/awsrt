# AWSRT v0.9-subgoal-13 — Epistemic Visualizer–Metric Alignment and Misalignment Review

## Working title

**Epistemic visualizer–metric alignment and misalignment review**

## Version-track context

AWSRT v0.9 is the interpretability / inspectability track:

> From reproducible handoff to interpretable inspection.

Thesis-facing wording:

> From reproducible handoff to epistemic and operational inspectability.

Subgoal 11 established a clean-channel Epistemic Surface baseline using a support-geometry × belief-decay matrix. Subgoal 12 extended that baseline by introducing impairment under selected support geometries, making the distinction between prescribed support and realized arrivals scientifically active.

This subgoal asks a different question. It does not primarily ask whether another experimental condition changes the metrics. Instead, it asks whether the Epistemic Visualizer helps interpret the metrics responsibly.

## Project framing

AWSRT is a research instrument for studying adaptive sensing, impaired information flow, uncertainty-aware belief maintenance, and usefulness under wildfire-like dynamic fields.

AWSRT is **not**:

- an operational wildfire simulator;
- a high-fidelity physical wildfire simulator;
- a physical twin or digital twin;
- a decision-automation system.

The Epistemic Visualizer should therefore be read as an inspectability instrument, not as an operational display. Its purpose is to help examine belief, entropy, entropy change, prescribed support, and realized arrivals alongside quantitative summaries.

## Immediate purpose of this subgoal

The immediate purpose is to review whether selected Epistemic Visualizer panels agree with, qualify, or potentially overstate the corresponding metric summaries.

The thesis uses visual inspection to explain belief maintenance, but the visualizer must not become merely persuasive. A visually compelling pattern is not automatically a result. Likewise, a visually modest panel may still correspond to strong metric behaviour. This subgoal establishes a disciplined way to read the visualizer.

## Main research question

> When does the Epistemic Visualizer accurately communicate metric-level belief-maintenance differences, and when must visual impressions be qualified?

## Subquestions

1. Do visual impressions of belief, entropy, entropy change, support, and arrival panels agree with entropy AUC and terminal entropy?
2. Do visually structured support geometries always correspond to stronger entropy-side belief maintenance?
3. Do high arrived-information proxy cases look visually persuasive even when entropy-side belief maintenance remains weak?
4. Do impairment-response panels make loss, delay, and noise mechanisms legible in ways that metrics alone do not?
5. What discipline should the thesis use when moving from visual impression to scientific claim?

## Recommended scope

This subgoal should be bounded and interpretive.

Do **not** run new experiments by default.

Use existing outputs from:

- `v0.9-subgoal-11` clean support-geometry × decay matrix;
- `v0.9-subgoal-12` impairment-response matrix.

The subgoal may produce:

- a design note;
- a short visualizer–metric alignment table;
- a thesis subsection replacing or expanding the existing future-experiment slug;
- possibly one manually assembled representative figure if the needed images already exist.

Avoid new backend or frontend code unless a clear visualizer bug is discovered.

## Candidate clean-matrix cases

Use a small number of representative clean-channel cases.

Suggested cases:

| Case | Expected role |
|---|---|
| `scanline_support`, `decay=0.1` | Strong entropy maintenance and structured visual story. |
| `center_out_support`, `decay=0.1` | Strong entropy maintenance and radial/expansion visual story. |
| `block_sweep_support`, `decay=0.6` | High arrived-information proxy but weak global entropy maintenance. |
| `ring_support`, `decay=0.6` | High arrived-information proxy but weak global entropy maintenance; visually coherent support. |
| `random_support`, `decay=1.0` | High-decay control where support geometry visually differs but entropy outcome collapses. |

These cases are useful because they include both visual/metric alignment and visual/metric tension.

## Candidate impairment-response cases

Use selected cases from the impairment-response matrix, especially those already discussed in subgoal 12.

Suggested sets:

| Support geometry | Decay | Channels | Expected role |
|---|---:|---|---|
| `scanline_support` | `0.1` | healthy, loss, delay, noise | Most legible structured support case; useful for seeing how impairment affects a visually clear geometry. |
| `ring_support` | `0.6` | healthy, loss, delay, noise | Visually coherent support and high arrived-info activity, but not necessarily strongest entropy maintenance. |

The scanline set is likely the best thesis-facing example of visual clarity. The ring set is useful as a caution: visual coherence and high arrived-information proxy activity do not automatically mean strong belief maintenance.

## Metrics to compare against visual impressions

For each selected run, compare visual impressions against:

- entropy AUC;
- terminal mean entropy;
- delta mean entropy summary, if useful;
- arrived-information proxy mean;
- MDC violation rate;
- support/arrival panel readability;
- qualitative entropy-change panel impression.

The goal is not to make the visualizer “pass” or “fail.” The goal is to identify which claims the visualizer can responsibly support.

## Proposed review table

Create a compact working table like this:

| Run / condition | Visual impression | Metric summary | Alignment judgment | Thesis use |
|---|---|---|---|---|
| `scanline_support`, `decay=0.1` | Structured scanline pattern; belief/entropy changes appear organized. | Low entropy AUC and low terminal entropy. | Visual and metrics align. | Good representative success case. |
| `ring_support`, `decay=0.6` | Coherent ring support; visually strong structure. | High arrived-info proxy but entropy remains relatively high. | Visual needs qualification. | Good caution case. |
| `block_sweep_support`, `decay=0.6` | Block-like visual structure. | High information proxy but weak entropy maintenance. | Visual needs qualification. | Supports separation of information activity and belief quality. |
| `random_support`, `decay=1.0` | Speckled support; little persistent belief structure. | High entropy AUC; high terminal entropy. | Visual and metrics align as control. | Useful non-accumulating reference. |

The actual table should use the run IDs and metric values from the packaged summaries.

## Possible alignment categories

Use simple categories rather than over-complicated scoring:

1. **Aligned** — the visual impression and metric summary tell the same story.
2. **Qualified** — the visual impression is useful but must be constrained by the metrics.
3. **Misleading risk** — the visual impression could over-persuade if shown without metric context.
4. **Control / neutral** — the visualizer mainly confirms the experimental setup rather than showing a substantive effect.

These categories can be used in the design note, working table, or thesis prose.

## Expected findings

These are expectations to test, not claims to assume.

### Clean scanline / center-out at `decay=0.1`

These should likely be alignment cases. The visual structure should correspond to stronger entropy-side belief maintenance.

### Ring and block sweep at `decay=0.6`

These are likely qualified cases. They may look visually coherent and may produce high arrived-information proxy values, but their entropy AUC remains closer to the high-entropy regime. These cases are useful because they demonstrate that visual coherence and information activity do not automatically establish belief-quality improvement.

### Random support at `decay=1.0`

This should function as a control. The support pattern may be visible, but the belief state does not retain enough evidence for geometry to matter globally.

### Impairment cases

Loss should be visually and metrically legible as reduced realized arrival activity. Delay may be harder visually because arrivals still occur but are temporally displaced. Noise may be the most conceptually important because arrival-like activity can remain while belief improvement weakens.

## Scientific value criteria

This subgoal has scientific value if it produces a disciplined account of visualizer interpretation, especially one or more of the following:

1. Identifies cases where visual impressions and metrics strongly agree.
2. Identifies cases where visual impressions require metric qualification.
3. Shows that the visualizer is useful as an inspectability tool, not a replacement for metrics.
4. Strengthens thesis claims by preventing visual overinterpretation.
5. Provides a reusable reading discipline for later AWSRT figures.

This subgoal has weaker value if it only repeats that figures “look good” without comparing them to metrics.

## Non-goals

Do not do the following in this subgoal:

- do not run a new support-budget sweep by default;
- do not create new support geometries;
- do not redesign the Epistemic Visualizer;
- do not change belief update semantics;
- do not change entropy computation;
- do not add new impairment modes;
- do not reopen v0.6 experiments;
- do not treat visual impressions as sufficient evidence;
- do not claim operational wildfire validity.

## Relation to support-budget sensitivity

The chapter still contains another possible future experiment:

> support-budget sensitivity under selected geometries.

That should remain separate. It is a valid possible later subgoal, but it introduces a new swept parameter and is less central to the v0.9 inspectability theme than visualizer–metric alignment.

Recommended ordering:

1. `v0.9-subgoal-13` — visualizer–metric alignment and misalignment review.
2. `v0.9-subgoal-14` — optional support-budget sensitivity, only if the thesis needs it.

## Suggested workflow

### 1. Start from clean `main`

```bash
git status
git checkout main
git pull origin main
git status
git checkout -b v0.9-subgoal-13
```

### 2. Add this design note first

Place this file at:

```text
docs/design/v0_9_13_epistemic_visualizer_metric_alignment_review.md
```

Then commit and push:

```bash
git add docs/design/v0_9_13_epistemic_visualizer_metric_alignment_review.md
git diff --check
git commit -m "Add epistemic visualizer metric alignment review note"
git push origin HEAD:refs/heads/v0.9-subgoal-13
git status
```

### 3. Inspect available evidence

Use existing run summaries, PDFs, screenshots, and thesis figures from subgoals 11 and 12.

Possible useful checks:

```bash
ls results/figures/epistemic_surface
find data/metrics -maxdepth 2 -name summary.json | head
```

If a local working document or PDF already contains the visual panels, use that as evidence rather than generating new data.

### 4. Create a visualizer–metric alignment table

The first useful artifact after the design note is likely a Markdown or LaTeX table that records:

- run ID;
- support geometry;
- decay;
- channel, if applicable;
- visual impression;
- entropy AUC;
- terminal entropy;
- arrived-info proxy;
- alignment judgment;
- thesis use.

### 5. Patch the thesis chapter only after the table is stable

If the table produces a clear story, convert the existing future-experiment slug into either:

- a completed subsection, if the review is sufficient; or
- a sharper future-work note, if more evidence is needed.

## Possible stopping points

A clean stopping point could be one of the following:

1. **Design-only stop**
   - design note committed and pushed;
   - no thesis changes yet.

2. **Review-table stop**
   - design note committed;
   - visualizer–metric alignment table created;
   - decision made about thesis integration.

3. **Thesis-subsection stop**
   - design note committed;
   - alignment review completed;
   - future-experiment slug replaced or updated;
   - claims remain bounded.

The recommended stopping point is either review-table completion or a short thesis subsection, depending on how clear the evidence is.

## Expected thesis integration

If successful, this subgoal can replace the current future-experiment placeholder with a section such as:

> Visualizer--metric alignment and misalignment

Possible thesis-facing result statement:

> The Epistemic Visualizer is most useful when its panels are read with metric discipline. In some cases, such as strong-retention scanline support, visual structure and entropy-side metrics align. In other cases, such as high-proxy ring or block-sweep support, visual coherence and information activity require qualification because entropy-side belief maintenance remains weak. The visualizer therefore supports inspection, but it does not replace entropy and information-proxy summaries.

This would strengthen AWSRT's credibility as a research instrument by showing that visual outputs are interpreted cautiously rather than used as persuasion.
