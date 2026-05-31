# v0.9-subgoal-08 — Epistemic Visualizer Support/Arrival Pairing Review

## Version context

AWSRT v0.8 remains the frozen handoff-ready baseline. v0.9 is the interpretability / inspectability track.

Completed so far in v0.9:

- v0.9-subgoal-01: Operational Visualizer view-window and map-readability controls.
- v0.9-subgoal-02: Operational Visualizer view-window stabilization note.
- v0.9-subgoal-03: Epistemic Surface inspectability probe.
- v0.9-subgoal-04: Built-in Epistemic Support Geometry Presets.
- v0.9-subgoal-05: Epistemic Support Geometry Smoke Check and Visual Readability Review.
- v0.9-subgoal-06: Epistemic Visualizer Thesis-Style Panel Simplification.
- v0.9-subgoal-07: Epistemic Visualizer Panel Triage and Diagnostic Prominence Review.

The subgoal-06 and subgoal-07 work made the Epistemic Visualizer more thesis-facing by moving the visual panels upward, keeping useful delivered information visible but compact, and collapsing secondary diagnostics by default.

The next interpretability bottleneck is the relationship between prescribed support and realized arrivals. Those two panels are currently both visible, but they still read as separate windows. This subgoal asks whether the Epistemic Visualizer should make the support/arrival relationship more explicit.

## Subgoal name

`v0.9-subgoal-08`

## Branch

`v0.9-subgoal-08`

## Design note path

`docs/design/v0_9_08_epistemic_visualizer_support_arrival_pairing_review.md`

## Immediate purpose

Improve the visual inspectability of the relationship between:

```text
prescribed support
→ realized arrivals over prescribed support
```

without changing backend semantics, support geometry generation, impairment semantics, belief update semantics, or the image endpoints.

The goal is not to invent a new metric. The goal is to make the existing support/arrival distinction easier to see and explain.

## Motivation

The Epistemic Visualizer now foregrounds the thesis-style visual story:

```text
belief
→ entropy / uncertainty
→ entropy change
→ prescribed support
→ arrivals over prescribed support
```

This is a good first-order structure. However, the last two windows are conceptually paired. The prescribed support mask shows where information was requested. The arrivals-over-support panel shows what actually arrived after impairment. In the current layout, they appear as two neighboring tiles, but the relationship between them may still require verbal explanation.

For thesis demonstrations and committee-facing inspection, the page should help users quickly see the difference between:

- where sensing was prescribed;
- what arrived;
- where prescribed support failed to produce arrivals;
- how that realized arrival pattern relates to belief and uncertainty change.

This subgoal keeps the current five-panel story intact unless inspection shows an obvious safe pairing improvement.

## Core framing

This is an interpretability/layout subgoal.

AWSRT remains a research instrument. This subgoal should be framed as:

- belief/uncertainty inspection;
- prescribed-support versus realized-arrival inspection;
- epistemic storytelling under controlled support and impairment conditions.

It should not be framed as:

- operational wildfire prediction;
- real-world sensor fleet planning;
- physical wildfire simulation;
- a digital twin;
- operational deployment optimization.

## Current state after subgoal 07

The Epistemic Visualizer currently presents:

```text
controls
→ current frame summary
→ epistemic frame panels
→ compact delivered-information diagnostic
→ collapsed secondary diagnostics
```

The visual panel group contains:

1. Belief field
2. Entropy field
3. Entropy change field
4. Prescribed support mask
5. Arrivals over prescribed support

Secondary diagnostics are collapsed by default.

The useful delivered-information plot remains visible as a compact diagnostic.

## Key question

Should support and arrivals remain as separate equal-status visual tiles, or should they be visually paired so their relationship is more explicit?

Candidate answers:

1. **Leave separate but label more clearly.**
   - Lowest-risk change.
   - Better tile labels or a short pair caption may be enough.

2. **Wrap support and arrivals in a paired sub-card.**
   - Moderate-risk layout change.
   - Could make the support/arrival relationship explicit without changing data or rendering.

3. **Create a two-column support/arrival pair inside the frame panel group.**
   - Keeps separate images but visually binds them.
   - May require small layout changes only.

4. **Add a combined overlay image.**
   - Higher-risk because it may require backend rendering or a new endpoint.
   - Not preferred for this subgoal unless the existing frontend already has enough information.

5. **Defer pairing and move to cloud-style rendering later.**
   - Appropriate if current layout is good enough and the next real bottleneck is rendering style.

## Preferred direction

Start with the smallest safe change:

- keep all five panels;
- keep the existing image endpoints;
- preserve support and arrival tiles as separate images;
- make support and arrivals visibly paired through layout and labels;
- do not add new backend routes or new image products.

A good first patch would likely:

```text
belief / entropy / entropy-change
support + arrivals pair
```

or:

```text
belief / entropy / entropy-change
prescribed support | realized arrivals
```

The support/arrival pair can be introduced with a short caption:

```text
Support asks where observations were prescribed; arrivals show what actually arrived after impairment.
```

## Functional non-goals

Do not change:

- support geometry generation;
- backend support masks;
- arrival mask semantics;
- impairment semantics;
- belief update semantics;
- entropy computation;
- MDC residual semantics;
- delivered-information proxy semantics;
- image endpoint names;
- v0.6 frozen experiments;
- v0.6 scientific interpretation.

Do not add in this subgoal:

- cloud/impressionistic rendering;
- new support geometries;
- custom uploaded mask workflows;
- new backend metrics;
- a new combined support-arrival endpoint unless inspection shows it is already trivial and safe;
- broad redesign of the Epistemic Surface.

## Visual non-goals

Do not remove any visual panel in the first patch.

Do not make support/arrival pairing look like an operational sensor deployment plan.

Do not make the page more beautiful at the expense of interpretability.

Do not hide the distinction between prescribed support and realized arrivals.

## Later deferred rendering idea

A later v0.9 visual-inspectability refinement should revisit the idea of turning point-like visual marks in the Epistemic Visualizer into more of a cloud or impressionistic field.

That idea is intentionally deferred here.

The current subgoal is about layout and pairing, not rendering style.

## Likely implementation target

Primary file:

- `frontend/app/epistemic/visualizer/page.tsx`

Likely no backend changes.

Possible supporting files only if needed:

- `docs/design/v0_9_08_epistemic_visualizer_support_arrival_pairing_review.md`
- `frontend/app/globals.css`

## Inspection targets before patching

Inspect the current panel group and tile components:

```bash
grep -n "function Tile\|function TrailTile\|Epistemic frame panels\|Prescribed support mask\|Arrivals over prescribed support"   frontend/app/epistemic/visualizer/page.tsx
```

```bash
sed -n '1,220p' frontend/app/epistemic/visualizer/page.tsx
sed -n '1200,1285p' frontend/app/epistemic/visualizer/page.tsx
```

If the tile component is simple and flexible, prefer a frontend-only wrapper around the two existing tiles.

## Candidate patch shape

A good first patch should be mostly layout and copy.

Likely patch options:

### Option A — Label-only improvement

Update the two tile titles:

```text
Prescribed support mask — where observations were requested
Arrivals over prescribed support — what actually arrived after impairment
```

Add a short sentence above the visual group:

```text
The final two panels should be read as a pair: support is the requested observation region; arrivals are the realized observations after delay/loss/noise effects.
```

This is lowest risk but may not visually solve much.

### Option B — Pair-card inside visual group

Keep belief, entropy, and entropy-change as normal tiles. Wrap support and arrivals inside a small paired card:

```text
Support / arrival pair
[Prescribed support mask] [Arrivals over prescribed support]
```

Caption:

```text
Support shows where observations were prescribed; arrivals show what was actually received over that support.
```

This likely gives the clearest interpretive gain with minimal semantic risk.

### Option C — Two-row frame panel layout

Use a layout that reads:

```text
Belief field | Entropy field | Entropy change field
Prescribed support mask | Arrivals over prescribed support
```

This may be slightly cleaner than a five-tile wrap but could require more CSS/layout judgment.

## Recommended first patch

Prefer Option B if the current tile component can be nested safely.

Expected story after patch:

```text
Belief / entropy / entropy-change
→ support-arrival pair
→ compact delivered-information diagnostic
→ collapsed secondary diagnostics
```

The support-arrival pair should preserve both images as independent visual evidence.

## Design risks

### Risk 1 — Pairing makes support and arrivals look like the same object

Mitigation:

- label one as prescribed/requested;
- label the other as realized/arrived;
- include a short caption that explicitly distinguishes them.

### Risk 2 — Layout becomes awkward on smaller screens

Mitigation:

- preserve `flexWrap`;
- avoid fixed widths unless already used by Tile;
- inspect in browser at the normal development width.

### Risk 3 — Pairing hides the five-panel thesis story

Mitigation:

- keep all panels visible;
- pair only the two support/arrival panels;
- do not collapse support or arrivals.

### Risk 4 — Prematurely pushes toward combined overlay rendering

Mitigation:

- do not add a new image endpoint;
- defer combined/cloud/overlay rendering to a later subgoal.

## Manual smoke checks

After patching, open an existing Belief Lab run and check:

- page loads;
- run selector works;
- playback controls work;
- belief, entropy, entropy-change panels still render;
- support and arrivals both render;
- support and arrivals are more clearly related than before;
- compact delivered-information diagnostic still renders;
- secondary diagnostics remain collapsed and expandable;
- no visual panel endpoint names changed;
- page still works with temporal trail on and off.

## Validation commands

Because this subgoal should be frontend-only:

```bash
npm --prefix frontend run build
git diff --check
git status
```

If backend files are touched unexpectedly:

```bash
PYTHONPATH=backend python -c "from api.main import app; print(app.title, app.version)"
python -m pytest backend/tests
npm --prefix frontend run build
git diff --check
git status
```

## Starting branch sequence

From clean, synchronized `main`:

```bash
git checkout main
git pull origin main
git status
git checkout -b v0.9-subgoal-08
```

Add this design note:

```bash
mkdir -p docs/design
cp ~/Downloads/v0_9_08_epistemic_visualizer_support_arrival_pairing_review.md   docs/design/v0_9_08_epistemic_visualizer_support_arrival_pairing_review.md
```

Or create the file directly at:

```text
docs/design/v0_9_08_epistemic_visualizer_support_arrival_pairing_review.md
```

Then:

```bash
git add docs/design/v0_9_08_epistemic_visualizer_support_arrival_pairing_review.md
git diff --check
git commit -m "Add epistemic visualizer support arrival pairing note"
git push origin HEAD:refs/heads/v0.9-subgoal-08
```

## Expected outcome

After this subgoal, the Epistemic Visualizer should make the support/arrival relationship easier to inspect.

The core relationship should be more visually explicit:

```text
prescribed support
→ realized arrivals over that support
→ delivered-information diagnostic
→ belief / uncertainty / entropy-change interpretation
```

The page should remain technically faithful, but the support/arrival distinction should require less explanation during demos, committee review, and internal development.
