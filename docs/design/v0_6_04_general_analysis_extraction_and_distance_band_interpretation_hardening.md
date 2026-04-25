# AWSRT v0.6 Subgoal 04: General Analysis Extraction and Distance-Band Interpretation Hardening

**Status:** Closed design / completed subgoal  
**Applies to:** `v0.6-subgoal-04`  
**Implemented script:** `src/extract_analysis_study_summary.py`  
**Primary validation target:** `data/metrics/ana-194fc0a69b` with repair input `data/metrics/ana-5c07ad299a`  
**Purpose:** Replace one-off, subgoal-specific extraction scripts with a general, reusable analysis-study extraction utility for AWSRT analysis outputs under `data/metrics/ana-*/`.

---i

## 1. Purpose of this note

This note records AWSRT v0.6 Subgoal 04.

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

> Each subgoal had been producing its own small extraction script or inline Python audit.

Subgoal 04 hardened this into a general extraction utility that can be reused across v0.6 and later studies.

The goal was not to build a full reporting framework.

The goal was to create a disciplined, reusable script that can:

- read `summary.json`;
- read `table.csv`;
- report structural integrity;
- summarize metrics by case;
- optionally merge repair runs;
- validate expected case overrides when a preset is supplied;
- derive common grouping fields from case labels;
- produce compact CSV and Markdown outputs suitable for design notes, thesis notes, and later plotting.

This goal has been met for the first validation target.

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

In recent subgoals, the immediate workflow had often been:

1. run an analysis study;
2. inspect `summary.json`;
3. inspect `table.csv`;
4. identify available columns;
5. group by `case`;
6. compute means and missingness;
7. manually derive interpretation tables;
8. write a design note.

This led to repeated inline Python snippets and subgoal-specific extraction scripts.

Subgoal 04 introduced one general script under `src/` so that future studies can be inspected using a common tool.

---

## 3. Scope

The script targets analysis output folders with the following structure:

```text
data/metrics/ana-*/
  summary.json
  table.csv
```

The script lives in:

```text
src/extract_analysis_study_summary.py
```

It supports the current distance-band use case, but it is not hard-coded only for v0.6 Subgoal 03.

The design allows future use on:

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

Subgoal 04 did not:

- redesign the analysis pipeline;
- change the analysis contract;
- change study execution;
- modify controller behavior;
- add frontend behavior;
- build a plotting system;
- replace existing `summary.json` generation;
- infer scientific conclusions without user review;
- require all future studies to use distance-band labels.

The output remains a lightweight extraction layer over existing analysis products.

---

## 5. Implemented script

The implemented script is:

```text
src/extract_analysis_study_summary.py
```

The name is intentionally general.

It avoids being named only for v0.6 or distance bands because the goal is to stop creating ad hoc extraction scripts for every subgoal.

Basic usage:

```bash
python src/extract_analysis_study_summary.py data/metrics/ana-194fc0a69b
```

Usage with repair replacement:

```bash
python src/extract_analysis_study_summary.py \
  data/metrics/ana-194fc0a69b \
  --repair data/metrics/ana-5c07ad299a \
  --replace-case dist_15_near__noise \
  --replace-case dist_60_very_far__delay \
  --preset distance_band_v0_6_03 \
  --expected-rows-per-case 5
```

The first implementation supports:

- explicit `--replace-case`;
- optional `--repair`;
- safe failure when repair is supplied without replacement unless `--append-repair` is used;
- built-in `distance_band_v0_6_03` preset;
- optional expected row count per case;
- custom output directory;
- custom output prefix.

---

## 6. Inputs

### 6.1 Required input

The script requires one main analysis directory:

```text
main_ana_dir = data/metrics/ana-*
```

Required files:

```text
summary.json
table.csv
```

### 6.2 Optional repair inputs

The script accepts repair analysis directories:

```text
--repair data/metrics/ana-*
```

The implementation supports repeated `--repair` arguments.

### 6.3 Optional replacement cases

When a repair folder is supplied, the script can replace named cases from the main table with rows from the repair table.

Example:

```text
--replace-case dist_15_near__noise
--replace-case dist_60_very_far__delay
```

Implemented behavior:

1. Load main `table.csv`.
2. Remove rows whose `case` is in `replace_case`.
3. Load repair `table.csv`.
4. Keep repair rows whose `case` is in `replace_case`.
5. Append those repair rows.
6. Add source metadata columns.

This makes the corrected table auditable.

---

## 7. Outputs

By default, output files are written to the main analysis directory.

For example:

```text
data/metrics/ana-194fc0a69b/
```

The implemented output files are:

```text
analysis_extraction_columns.txt
analysis_extraction_integrity.json
analysis_extraction_corrected_rows.csv
analysis_extraction_case_summary.csv
analysis_extraction_group_summary.csv
analysis_extraction_interpretation.md
```

The output names are general rather than subgoal-specific.

For example:

```text
analysis_extraction_case_summary.csv
```

not:

```text
v0_6_04_distance_band_summary.csv
```

Subgoal-specific naming can still be produced later by copying or renaming outputs if needed for publication packaging.

---

## 8. Implemented behavior

### 8.1 Summary metadata loading

The script reads `summary.json` and extracts compact top-level metadata when present, including:

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
sweep_context
created_at
```

This is written into:

```text
analysis_extraction_integrity.json
```

rather than forcing the user to inspect the entire `summary.json`.

### 8.2 Table loading and column reporting

The script reads `table.csv` and records:

```text
row_count
column_count
all_columns
key_columns_present
key_columns_missing
```

This is written to:

```text
analysis_extraction_columns.txt
```

and summarized in:

```text
analysis_extraction_integrity.json
```

For the Subgoal 03 validation target, the expected missing row-level metadata columns were:

```text
tie_breaking
network_tie_breaking
case_family
case_kind
```

These were not fatal because the sweep overrides and case labels preserve the intended semantics.

### 8.3 Source metadata preservation

The corrected rows output includes:

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

The script supports grouping by:

```text
case
```

If `case` is not present, it fails clearly.

The case summary includes identity, provenance, missingness, metric summaries, and dominant usefulness state where available.

### 8.5 Derived grouping fields

The script derives common grouping fields from case labels.

For labels containing a double underscore:

```text
left__right
```

it derives:

```text
case_group = left
case_kind_derived = right
```

For v0.6 distance-band labels:

```text
dist_15_near__healthy
dist_30_mid__delay
dist_50_far__noise
dist_60_very_far__healthy
```

it also derives:

```text
distance_band
condition
```

where:

```text
distance_band = dist_15_near | dist_30_mid | dist_50_far | dist_60_very_far
condition = healthy | delay | noise
```

### 8.6 Distance metadata preset

The script implements a built-in preset:

```text
distance_band_v0_6_03
```

Preset metadata:

```text
distance_band       base_station_rc   raw_distance_cells   normalized_distance
dist_15_near        (585, 640)        271.53               0.150
dist_30_mid         (777, 832)        543.06               0.300
dist_50_far         (1033, 1088)      905.10               0.500
dist_60_very_far    (1080, 1320)      1110.11              0.614
```

The script adds these columns when the preset is used:

```text
raw_distance_cells
normalized_distance
distance_base_station_rc_expected
```

The row-level `base_station_rc` from `table.csv` remains preserved separately.

### 8.7 Dominant usefulness state

If the usefulness state-fraction columns exist:

```text
usefulness_regime_state_exploit_frac
usefulness_regime_state_recover_frac
usefulness_regime_state_caution_frac
```

the script computes:

```text
dominant_usefulness_state
```

using the largest mean fraction among:

```text
exploit
recover
caution
```

This is a descriptive summary, not a statistical claim.

### 8.8 TTFD missingness

If `ttfd` exists, the script reports:

```text
ttfd_count
ttfd_missing_count
ttfd_missing_frac
ttfd_mean
ttfd_median
ttfd_min
ttfd_max
```

Missing TTFD is not hidden.

For AWSRT transformed real-fire studies, missing TTFD can be scientifically meaningful.

---

## 9. Expected-case validation

The script supports optional expected-case validation.

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

The expected-case validation remains optional so the script is still general.

---

## 10. Integrity report

The script writes:

```text
analysis_extraction_integrity.json
```

For the Subgoal 03 validation run, the integrity report showed:

```text
main_ana_id = ana-194fc0a69b
repair_ana_ids = [ana-5c07ad299a]
main_rows_loaded = 60
repair_rows_loaded = 10
replace_cases = [dist_15_near__noise, dist_60_very_far__delay]
rows_after_correction = 60
cases_missing = []
cases_extra = []
rows_per_case = 5 each
override validation ok = true
warnings = []
```

The exact observed high-level integrity values were:

```text
ok = true
rows_after_correction = 60
case_count = 12
expected_rows_per_case = 5
failures = []
warnings = []
```

The validation also confirmed that the two repaired cells were sourced from:

```text
ana-5c07ad299a
```

while the remaining valid cells were sourced from:

```text
ana-194fc0a69b
```

---

## 11. Markdown interpretation output

The script writes:

```text
analysis_extraction_interpretation.md
```

This file does not attempt to replace human interpretation, but it provides a clean starting point.

For the Subgoal 03 validation run, it included:

- analysis IDs;
- repair and replacement-case status;
- row and case counts;
- validation status;
- TTFD missingness table;
- dominant usefulness state table;
- group summary table;
- interpretation prompt.

The generated interpretation stub correctly made it easy to restate:

```text
Distance strongly affects finite TTFD availability, but the compact usefulness triad remains condition-readable.
```

The script itself avoids making the final scientific claim automatically.

---

## 12. Subgoal 03 validation target

The first validation target for the script was the corrected Subgoal 03 matrix.

Command used:

```bash
python src/extract_analysis_study_summary.py \
  data/metrics/ana-194fc0a69b \
  --repair data/metrics/ana-5c07ad299a \
  --replace-case dist_15_near__noise \
  --replace-case dist_60_very_far__delay \
  --preset distance_band_v0_6_03 \
  --expected-rows-per-case 5
```

Observed high-level output:

```text
Extraction complete.
Main analysis: ana-194fc0a69b
Rows after correction: 60
Cases: 12
Validation ok: True
```

Generated outputs:

```text
data/metrics/ana-194fc0a69b/analysis_extraction_columns.txt
data/metrics/ana-194fc0a69b/analysis_extraction_integrity.json
data/metrics/ana-194fc0a69b/analysis_extraction_corrected_rows.csv
data/metrics/ana-194fc0a69b/analysis_extraction_case_summary.csv
data/metrics/ana-194fc0a69b/analysis_extraction_group_summary.csv
data/metrics/ana-194fc0a69b/analysis_extraction_interpretation.md
```

Expected corrected dominant states were reproduced:

```text
healthy -> exploit
delay   -> recover
noise   -> caution
```

Expected corrected TTFD result was reproduced:

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

This validates that the general extraction script can reproduce the hand-built Subgoal 03 interpretation.

---

## 13. Implementation structure

The script is procedural and inspectable.

Implemented functional structure includes:

```python
def load_summary(ana_dir: Path) -> dict:
    ...

def load_table(ana_dir: Path) -> pd.DataFrame:
    ...

def get_ana_id(summary: dict, ana_dir: Path) -> str:
    ...

def add_source_columns(df: pd.DataFrame, ana_id: str, ana_dir: Path, repair_row: bool) -> pd.DataFrame:
    ...

def apply_repairs(...):
    ...

def derive_case_fields(df: pd.DataFrame) -> pd.DataFrame:
    ...

def apply_preset_metadata(df: pd.DataFrame, preset: str | None) -> pd.DataFrame:
    ...

def summarize_by_case(df: pd.DataFrame) -> pd.DataFrame:
    ...

def summarize_by_group(df: pd.DataFrame) -> pd.DataFrame:
    ...

def validate_expected_cases(...):
    ...

def write_integrity_report(...):
    ...

def write_markdown_interpretation(...):
    ...
```

The implementation avoids a complex class hierarchy.

---

## 14. Column handling

The script is tolerant of missing columns.

Required structural columns:

```text
case
```

Strongly preferred columns include:

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

If strongly preferred columns are missing, the script records them in the column report rather than failing.

This matters because different AWSRT studies may emit different subsets of metrics.

---

## 15. Numeric summary behavior

For each metric column present, the script summarizes with:

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

For the case summary, the important means and missingness values are written directly as flat columns.

The output avoids pandas multi-index headers, because those are harder to read in downstream notes.

For example, the output uses fields like:

```text
mean_entropy_auc_mean
mean_entropy_auc_median
mean_entropy_auc_std
```

rather than a multi-index CSV.

---

## 16. Case-derived summary behavior

When case labels use the pattern:

```text
group__kind
```

the script derives:

```text
case_group
case_kind_derived
```

For Subgoal 03:

```text
case_group = distance_band
case_kind_derived = condition
```

When the preset identifies the labels as distance bands, it also writes:

```text
distance_band × condition
```

This keeps the script general while still supporting the distance-band matrix cleanly.

---

## 17. Repair semantics

Repair semantics are explicit.

The script does not silently merge repair rows.

If `--repair` is supplied without `--replace-case`, the script fails unless `--append-repair` is explicitly supplied.

This prevents accidental outputs such as a 70-row table when a 60-row corrected matrix is intended.

The corrected rows CSV preserves both:

```text
source_ana_id
repair_row
```

so the provenance is visible.

---

## 18. Source tracking and ignored scratch scripts

The reusable extraction utility belongs in:

```text
src/
```

and should be tracked by git.

During Subgoal 04, the project also had a number of older ad hoc plotting and inspection scripts. These are useful local working artifacts but are not part of the frozen reusable source surface.

They were moved under:

```text
src/do_not_track/
```

The intended `.gitignore` convention is:

```gitignore
# Source utilities are tracked by default.
# Scratch/ad hoc source scripts are kept here and ignored.
src/do_not_track/
```

The broad top-level ignore rule:

```gitignore
/src/
```

should not be used, because it prevents reusable source utilities such as:

```text
src/extract_analysis_study_summary.py
```

from being tracked.

The generated analysis outputs under:

```text
data/metrics/
```

remain ignored.

This is correct: the script is reusable code, while the generated extraction artifacts are reproducible outputs.

---

## 19. Minimal success criteria review

Subgoal 04 is complete.

1. `src/extract_analysis_study_summary.py` exists.
2. It reads `summary.json` and `table.csv` from a supplied `data/metrics/ana-*` directory.
3. It writes a column inventory.
4. It writes an integrity report.
5. It writes a corrected rows CSV.
6. It writes a case-level summary CSV.
7. It writes a group-level summary CSV when case labels can be parsed.
8. It writes a compact Markdown interpretation stub.
9. It supports repair replacement by named case.
10. It successfully reproduced the corrected Subgoal 03 matrix using:
    - main run `ana-194fc0a69b`;
    - repair run `ana-5c07ad299a`;
    - replacement cases `dist_15_near__noise` and `dist_60_very_far__delay`.
11. It validated 12 cases with 5 rows per case for the Subgoal 03 preset.
12. It did not change controller behavior or study execution.
13. The repository ignore strategy was adjusted so reusable `src/` utilities can be tracked while scratch scripts remain ignored under `src/do_not_track/`.

---

## 20. Suggested next step after Subgoal 04

After Subgoal 04, v0.6 can proceed in one of three directions.

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
  freeze after committing the general extractor, .gitignore adjustment, and this completed note

v0.6-subgoal-05:
  decide between clean rerun, longer-window probe, or second artifact
```

A reasonable default for Subgoal 05 is the longer-window probe, because Subgoal 03 showed that distance strongly structures finite TTFD availability within `0:150`.

The clean single-artifact rerun remains optional unless thesis-ready artifact cleanliness is needed immediately.

---

## 22. Working conclusion

Subgoal 04 was an infrastructure-for-interpretation step.

It was not a detour from the science.

The scientific value of AWSRT depends on being able to see when metric families separate. That requires extraction tools that are consistent, auditable, and not reinvented for every subgoal.

The general script added here makes future AWSRT studies easier to trust.

It also reduces the chance that case-label / override mismatches survive until interpretation.

The core principle is:

> Every completed analysis study should be easy to audit before it is easy to interpret.

Subgoal 04 makes that principle operational for AWSRT analysis outputs.
