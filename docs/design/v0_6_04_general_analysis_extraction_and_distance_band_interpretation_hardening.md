# AWSRT v0.6 Subgoal 04: General Analysis Extraction and Distance-Band Interpretation Hardening

**Status:** Draft design note  
**Applies to:** `v0.6-subgoal-04`  
**Proposed script:** `src/extract_analysis_study_summary.py`  
**Primary validation target:** `data/metrics/ana-194fc0a69b` with repair input `data/metrics/ana-5c07ad299a`  
**Purpose:** Replace one-off, subgoal-specific extraction scripts with a general, reusable analysis-study extraction utility for AWSRT analysis outputs under `data/metrics/ana-*/`.

---

## 1. Purpose of this note

This note defines AWSRT v0.6 Subgoal 04.

Subgoal 03 produced a scientifically useful distance-band result, but the extraction process was still ad hoc. A temporary script inspected:

```text
data/metrics/ana-194fc0a69b/summary.json
data/metrics/ana-194fc0a69b/table.csv
```

and a later manual audit identified two invalid cells that were repaired in:

```text
data/metrics/ana-5c07ad299a
```

That process was useful, but it revealed a recurring problem in the AWSRT workflow:

> Each subgoal has been producing its own small extraction script or inline Python audit.

Subgoal 04 should harden this into a general extraction utility that can be reused across v0.6 and later studies.

The goal is not to build a full reporting framework.

The goal is to create a disciplined, reusable script that can:

- read `summary.json`;
- read `table.csv`;
- report structural integrity;
- summarize metrics by case;
- optionally merge repair runs;
- validate expected case overrides when a schema is supplied;
- derive common grouping fields from case labels;
- produce compact CSV and Markdown outputs suitable for design notes, thesis notes, and later plotting.

---

## 2. Motivation

AWSRT now produces many analysis studies in a stable location:

```text
data/metrics/<ana-id>/
```

with standard files such as:

```text
summary.json
table.csv
```

These files can be long and difficult to inspect directly.

In recent subgoals, the immediate workflow has often been:

1. run an analysis study;
2. inspect `summary.json`;
3. inspect `table.csv`;
4. identify available columns;
5. group by `case`;
6. compute means and missingness;
7. manually derive interpretation tables;
8. write a design note.

This has led to repeated inline Python snippets and subgoal-specific extraction scripts.

Subgoal 04 should introduce one general script under `src/` so that future studies can be inspected using a common tool.

---

## 3. Scope

The script should target analysis output folders with the following structure:

```text
data/metrics/ana-*/
  summary.json
  table.csv
```

The script should live in:

```text
src/extract_analysis_study_summary.py
```

It should support the current distance-band use case, but it should not be hard-coded only for v0.6 Subgoal 03.

The design should allow future use on:

- usefulness-family studies;
- distance-band studies;
- tie-breaking studies;
- regime-family studies;
- baseline-policy comparisons;
- impairment sweeps;
- physical-artifact comparison studies;
- patched or repaired matrix outputs.

---

## 4. Non-goals

Subgoal 04 should not:

- redesign the analysis pipeline;
- change the analysis contract;
- change study execution;
- modify controller behavior;
- add frontend behavior;
- build a plotting system;
- replace existing `summary.json` generation;
- infer scientific conclusions without user review;
- require all future studies to use distance-band labels.

The output should remain a lightweight extraction layer over existing analysis products.

---

## 5. Proposed script

The proposed script is:

```text
src/extract_analysis_study_summary.py
```

The name is intentionally general.

Avoid naming it only for v0.6 or distance bands, because the goal is to stop creating ad hoc extraction scripts for every subgoal.

Example usage:

```bash
python src/extract_analysis_study_summary.py data/metrics/ana-194fc0a69b
```

Example usage with a repair run:

```bash
python src/extract_analysis_study_summary.py \
  data/metrics/ana-194fc0a69b \
  --repair data/metrics/ana-5c07ad299a \
  --replace-case dist_15_near__noise \
  --replace-case dist_60_very_far__delay
```

Example usage with a named preset:

```bash
python src/extract_analysis_study_summary.py \
  data/metrics/ana-194fc0a69b \
  --repair data/metrics/ana-5c07ad299a \
  --preset distance_band_v0_6_03
```

The first implementation may support the explicit `--replace-case` form and optionally include the `distance_band_v0_6_03` preset as a convenience.

---

## 6. Inputs

### 6.1 Required input

The script should require one main analysis directory:

```text
main_ana_dir = data/metrics/ana-*
```

Required files:

```text
summary.json
table.csv
```

### 6.2 Optional repair inputs

The script should optionally accept one or more repair analysis directories:

```text
--repair data/metrics/ana-*
```

For Subgoal 04, support for one repair folder is sufficient.

If more than one repair folder is easy to support, the script can accept repeated `--repair` arguments, but that should not complicate the first implementation.

### 6.3 Optional replacement cases

When a repair folder is supplied, the script should be able to replace named cases from the main table with rows from the repair table.

Example:

```text
--replace-case dist_15_near__noise
--replace-case dist_60_very_far__delay
```

Expected behavior:

1. Load main `table.csv`.
2. Remove rows whose `case` is in `replace_case`.
3. Load repair `table.csv`.
4. Keep repair rows whose `case` is in `replace_case`.
5. Append those repair rows.
6. Add source metadata columns.

This makes the corrected table auditable.

---

## 7. Outputs

By default, output files should be written to the main analysis directory.

For example:

```text
data/metrics/ana-194fc0a69b/
```

Recommended output files:

```text
analysis_extraction_columns.txt
analysis_extraction_integrity.json
analysis_extraction_corrected_rows.csv
analysis_extraction_case_summary.csv
analysis_extraction_group_summary.csv
analysis_extraction_interpretation.md
```

The exact names can include a prefix if useful, but they should be general rather than subgoal-specific.

For example, prefer:

```text
analysis_extraction_case_summary.csv
```

over:

```text
v0_6_04_distance_band_summary.csv
```

Subgoal-specific naming can still be produced later by copying or renaming outputs if needed for publication packaging.

---

## 8. Required behavior

### 8.1 Load and report top-level summary metadata

The script should read `summary.json` and report important top-level keys, including when present:

```text
ana_id
analysis_contract_version
baseline_policy
best
best_robust
row_count
seeds
policies
study_type
study_semantics
sweep
sweep_context
metric_semantics
metrics_catalog
created_at
```

It should write a compact JSON integrity file rather than forcing the user to inspect the entire `summary.json`.

### 8.2 Load table and report columns

The script should read `table.csv` and record:

```text
row_count
column_count
all_columns
key_columns_present
key_columns_missing
```

This should help identify whether expected columns such as `tie_breaking` or `case_kind` are present.

### 8.3 Preserve source metadata

The corrected rows output should include source metadata:

```text
source_ana_id
source_ana_dir
repair_row
```

For main rows:

```text
repair_row = false
```

For repair rows:

```text
repair_row = true
```

This is important for transparent patched-matrix interpretation.

### 8.4 Group by case

The script should always support grouping by:

```text
case
```

If `case` is not present, it should fail clearly with a helpful error.

The case summary should include:

```text
case
rows
seeds_present
seed_count
policy_values
phy_id_values
base_station_rc_values
delay_steps_values
loss_prob_values
noise_level_values
ttfd_mean
ttfd_n_finite
ttfd_missing_count
ttfd_missing_frac
mean_entropy_auc_mean
coverage_auc_mean
delivered_info_proxy_mean
mdc_residual_mean
mdc_residual_pos_frac_mean
mdc_violation_rate_mean
usefulness_regime_state_exploit_frac_mean
usefulness_regime_state_recover_frac_mean
usefulness_regime_state_caution_frac_mean
dominant_usefulness_state
source_ana_ids
repair_rows
```

Only include metric columns that exist in the table.

Missing columns should not crash the script unless they are required structural columns.

### 8.5 Derive common grouping fields

The script should attempt to derive common grouping fields from case labels.

For v0.6 distance-band labels:

```text
dist_15_near__healthy
dist_30_mid__delay
dist_50_far__noise
dist_60_very_far__healthy
```

derive:

```text
distance_band
condition
```

where:

```text
distance_band = dist_15_near | dist_30_mid | dist_50_far | dist_60_very_far
condition = healthy | delay | noise
```

More generally, for case labels containing a double underscore:

```text
left__right
```

derive:

```text
case_group = left
case_kind_derived = right
```

For v0.6 distance labels, `case_group` and `distance_band` can be the same.

### 8.6 Support optional distance metadata

For Subgoal 03 and future distance-band studies, the script should allow a built-in or user-supplied distance metadata map.

For the first implementation, a built-in `distance_band_v0_6_03` preset is acceptable.

Preset metadata:

```text
distance_band       base_station_rc   raw_distance_cells   normalized_distance
dist_15_near        (585, 640)        271.53               0.150
dist_30_mid         (777, 832)        543.06               0.300
dist_50_far         (1033, 1088)      905.10               0.500
dist_60_very_far    (1080, 1320)      1110.11              0.614
```

The script should add these columns when distance bands are recognized:

```text
raw_distance_cells
normalized_distance
distance_base_station_rc_expected
```

The row-level `base_station_rc` from `table.csv` should remain preserved separately.

### 8.7 Compute dominant usefulness state

If the usefulness state-fraction columns exist:

```text
usefulness_regime_state_exploit_frac
usefulness_regime_state_recover_frac
usefulness_regime_state_caution_frac
```

the script should compute:

```text
dominant_usefulness_state
```

using the largest mean fraction among:

```text
exploit
recover
caution
```

This should be a descriptive summary, not a statistical claim.

### 8.8 TTFD missingness

If `ttfd` exists, report:

```text
ttfd_n_finite
ttfd_missing_count
ttfd_missing_frac
ttfd_mean
ttfd_median
ttfd_min
ttfd_max
```

Do not hide missing TTFD.

For AWSRT transformed real-fire studies, missing TTFD can be scientifically meaningful.

---

## 9. Optional expected-case validation

The script should support optional expected-case validation.

For Subgoal 03, the expected cases are:

```text
dist_15_near__healthy
dist_15_near__delay
dist_15_near__noise
dist_30_mid__healthy
dist_30_mid__delay
dist_30_mid__noise
dist_50_far__healthy
dist_50_far__delay
dist_50_far__noise
dist_60_very_far__healthy
dist_60_very_far__delay
dist_60_very_far__noise
```

Expected row count per case:

```text
5
```

Expected override values:

```text
dist_15_near__healthy:
  base_station_rc = (585, 640)
  delay_steps = 0
  loss_prob = 0
  noise_level = 0

dist_15_near__delay:
  base_station_rc = (585, 640)
  delay_steps = 4
  loss_prob = 0
  noise_level = 0

dist_15_near__noise:
  base_station_rc = (585, 640)
  delay_steps = 0
  loss_prob = 0
  noise_level = 0.2

dist_30_mid__healthy:
  base_station_rc = (777, 832)
  delay_steps = 0
  loss_prob = 0
  noise_level = 0

dist_30_mid__delay:
  base_station_rc = (777, 832)
  delay_steps = 4
  loss_prob = 0
  noise_level = 0

dist_30_mid__noise:
  base_station_rc = (777, 832)
  delay_steps = 0
  loss_prob = 0
  noise_level = 0.2

dist_50_far__healthy:
  base_station_rc = (1033, 1088)
  delay_steps = 0
  loss_prob = 0
  noise_level = 0

dist_50_far__delay:
  base_station_rc = (1033, 1088)
  delay_steps = 4
  loss_prob = 0
  noise_level = 0

dist_50_far__noise:
  base_station_rc = (1033, 1088)
  delay_steps = 0
  loss_prob = 0
  noise_level = 0.2

dist_60_very_far__healthy:
  base_station_rc = (1080, 1320)
  delay_steps = 0
  loss_prob = 0
  noise_level = 0

dist_60_very_far__delay:
  base_station_rc = (1080, 1320)
  delay_steps = 4
  loss_prob = 0
  noise_level = 0

dist_60_very_far__noise:
  base_station_rc = (1080, 1320)
  delay_steps = 0
  loss_prob = 0
  noise_level = 0.2
```

This validation is what would have immediately exposed the two invalid cells in the original Subgoal 03 run.

The expected-case validation should be optional so the script remains general.

Suggested CLI:

```bash
python src/extract_analysis_study_summary.py \
  data/metrics/ana-194fc0a69b \
  --repair data/metrics/ana-5c07ad299a \
  --replace-case dist_15_near__noise \
  --replace-case dist_60_very_far__delay \
  --preset distance_band_v0_6_03 \
  --expected-rows-per-case 5
```

---

## 10. Integrity report

The script should write:

```text
analysis_extraction_integrity.json
```

Suggested contents:

```json
{
  "main_ana_id": "ana-194fc0a69b",
  "repair_ana_ids": ["ana-5c07ad299a"],
  "main_rows_loaded": 60,
  "repair_rows_loaded": 10,
  "replace_cases": [
    "dist_15_near__noise",
    "dist_60_very_far__delay"
  ],
  "rows_after_correction": 60,
  "cases_present": [],
  "cases_missing": [],
  "cases_extra": [],
  "rows_per_case": {},
  "column_count": 136,
  "key_columns_present": [],
  "key_columns_missing": [],
  "override_validation": {
    "ok": true,
    "failures": []
  },
  "warnings": []
}
```

If validation fails, the script should still write whatever outputs it safely can, but the integrity file should mark:

```text
ok = false
```

or equivalent.

---

## 11. Markdown interpretation output

The script should write a compact Markdown file:

```text
analysis_extraction_interpretation.md
```

This file should not attempt to replace human interpretation, but it should provide a clean starting point.

For a distance-band usefulness study, the Markdown should include:

- analysis IDs;
- corrected-row status;
- row and case counts;
- TTFD missingness table;
- dominant usefulness state table;
- compact metric table;
- caveats.

Example language:

```text
This extraction merges the main run with the specified repair run and replaces the named cases before summarization. The resulting corrected table contains 60 rows and 12 cases with 5 seeds per case.
```

For Subgoal 03, the interpretation should make it easy to restate:

```text
Distance strongly affects finite TTFD availability, but the compact usefulness triad remains condition-readable.
```

But the script should avoid overclaiming.

---

## 12. Subgoal 03 validation target

The first validation target for the script is the corrected Subgoal 03 matrix.

Command:

```bash
python src/extract_analysis_study_summary.py \
  data/metrics/ana-194fc0a69b \
  --repair data/metrics/ana-5c07ad299a \
  --replace-case dist_15_near__noise \
  --replace-case dist_60_very_far__delay \
  --preset distance_band_v0_6_03 \
  --expected-rows-per-case 5
```

Expected high-level output:

```text
rows_after_correction = 60
case_count = 12
rows_per_case = 5 each
override_validation = ok
```

Expected corrected dominant states:

```text
healthy -> exploit
delay   -> recover
noise   -> caution
```

Expected corrected TTFD result:

```text
dist_15_near:
  finite TTFD for healthy, delay, noise

dist_30_mid:
  finite TTFD for healthy, delay, noise

dist_50_far:
  missing TTFD for healthy, delay, noise

dist_60_very_far:
  missing TTFD for healthy, delay, noise
```

This is the first proof that the general extraction script can reproduce the hand-built Subgoal 03 interpretation.

---

## 13. Recommended implementation structure

The script should be simple and readable.

Suggested functions:

```python
def load_summary(ana_dir: Path) -> dict:
    ...

def load_table(ana_dir: Path) -> pd.DataFrame:
    ...

def get_ana_id(summary: dict, ana_dir: Path) -> str:
    ...

def add_source_columns(df: pd.DataFrame, ana_id: str, ana_dir: Path, repair_row: bool) -> pd.DataFrame:
    ...

def apply_repairs(main_df: pd.DataFrame, repair_dfs: list[pd.DataFrame], replace_cases: list[str]) -> pd.DataFrame:
    ...

def derive_case_fields(df: pd.DataFrame) -> pd.DataFrame:
    ...

def apply_preset_metadata(df: pd.DataFrame, preset: str | None) -> pd.DataFrame:
    ...

def summarize_by_case(df: pd.DataFrame) -> pd.DataFrame:
    ...

def summarize_by_group(df: pd.DataFrame) -> pd.DataFrame:
    ...

def validate_expected_cases(df: pd.DataFrame, preset: str | None, expected_rows_per_case: int | None) -> dict:
    ...

def write_integrity_report(...):
    ...

def write_markdown_interpretation(...):
    ...
```

Keep the script procedural and inspectable.

Avoid making a complex class hierarchy.

---

## 14. Column handling

The script should be tolerant of missing columns.

Required structural columns:

```text
case
```

Strongly preferred columns:

```text
seed
policy
opr_id
phy_id
base_station_rc
delay_steps
loss_prob
noise_level
ttfd
mean_entropy_auc
coverage_auc
delivered_info_proxy_mean
mdc_residual_mean
mdc_residual_pos_frac
mdc_violation_rate
usefulness_regime_state_exploit_frac
usefulness_regime_state_recover_frac
usefulness_regime_state_caution_frac
```

If strongly preferred columns are missing, the script should record warnings rather than fail.

This matters because different AWSRT studies may emit different subsets of metrics.

---

## 15. Numeric summary behavior

For each metric column present, summarize with:

```text
count
mean
median
std
min
max
missing_count
missing_frac
```

For the compact case summary, include the most important means directly as flat columns.

Avoid writing only pandas multi-index headers, because those are harder to read in downstream notes.

For example, prefer:

```text
mean_entropy_auc_mean
mean_entropy_auc_median
mean_entropy_auc_std
```

over a multi-index CSV.

---

## 16. Case-derived summary behavior

When case labels use the pattern:

```text
group__kind
```

the script should derive:

```text
case_group
case_kind_derived
```

For Subgoal 03:

```text
case_group = distance_band
case_kind_derived = condition
```

Then write a group summary by:

```text
case_group × case_kind_derived
```

If the preset identifies the labels as distance bands, also write:

```text
distance_band × condition
```

This keeps the script general while still supporting the distance-band matrix cleanly.

---

## 17. Repair semantics

Repair semantics should be explicit.

The script should not silently merge repair rows.

If `--repair` is supplied without `--replace-case`, it should either:

- fail with a clear message; or
- append repair rows only if an explicit `--append-repair` flag is supplied.

For Subgoal 04, prefer the safer behavior:

```text
--repair requires at least one --replace-case
```

This prevents accidental 70-row outputs.

The corrected rows CSV should preserve both:

```text
source_ana_id
repair_row
```

so the provenance is visible.

---

## 18. Why this belongs in `src/`

The script should live under:

```text
src/
```

rather than under `docs/` or only as an inline notebook-style snippet.

Reasons:

- it is a reusable project utility;
- it operates on standard AWSRT analysis outputs;
- it will likely be used across multiple subgoals;
- it should be versioned with the codebase;
- it reduces repeated one-off extraction code;
- it supports auditability.

This does not mean the script becomes part of the runtime system.

It is an analysis-support utility.

---

## 19. Minimal success criteria

Subgoal 04 is complete if:

1. `src/extract_analysis_study_summary.py` exists.
2. It reads `summary.json` and `table.csv` from a supplied `data/metrics/ana-*` directory.
3. It writes a column inventory.
4. It writes an integrity report.
5. It writes a corrected rows CSV.
6. It writes a case-level summary CSV.
7. It writes a group-level summary CSV when case labels can be parsed.
8. It writes a compact Markdown interpretation stub.
9. It supports repair replacement by named case.
10. It successfully reproduces the corrected Subgoal 03 matrix using:
    - main run `ana-194fc0a69b`;
    - repair run `ana-5c07ad299a`;
    - replacement cases `dist_15_near__noise` and `dist_60_very_far__delay`.
11. It validates 12 cases with 5 rows per case for the Subgoal 03 preset.
12. It does not change controller behavior or study execution.

---

## 20. Suggested next step after Subgoal 04

If Subgoal 04 succeeds, v0.6 can proceed in one of three directions.

### Option A: Clean single-artifact rerun

Rerun the corrected 60-row distance-band matrix as a single clean artifact.

This is not scientifically necessary if the repaired matrix is transparently documented, but it may be useful for thesis-ready figure generation.

### Option B: Longer-window distance probe

Rerun the distance-band matrix with a longer execution window, such as:

```text
0:250
```

or:

```text
0:300
```

This would test whether far-distance TTFD is truly unavailable or merely outside the `0:150` window.

### Option C: Second physical artifact

Apply the distance-band protocol to another transformed real-fire artifact.

This is scientifically stronger but should come after extraction is hardened.

---

## 21. Recommended immediate path

The recommended immediate path is:

```text
v0.6-subgoal-04:
  build general extraction script and validate it on corrected Subgoal 03

v0.6-subgoal-05:
  decide between clean rerun, longer-window probe, or second artifact
```

This is preferable to immediately launching another broad matrix because Subgoal 03 has already produced a real result.

The priority now is to turn that result into a clean, reusable, auditable evidence object.

---

## 22. Working conclusion

Subgoal 04 is an infrastructure-for-interpretation step.

It is not a detour from the science.

The scientific value of AWSRT depends on being able to see when metric families separate. That requires extraction tools that are consistent, auditable, and not reinvented for every subgoal.

The general script proposed here should make future AWSRT studies easier to trust.

It should also reduce the chance that case-label / override mismatches survive until interpretation.

The core principle is:

> Every completed analysis study should be easy to audit before it is easy to interpret.

Subgoal 04 exists to make that true.
