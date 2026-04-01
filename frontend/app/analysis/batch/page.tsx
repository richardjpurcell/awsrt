//awsrt/frontend/app/analysis/batch/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { apiUrl, getJSON, postJSON } from "@/lib/api";
import { RunPicker } from "@/components/RunPicker";
import { useRouter } from "next/navigation";

type ListRes = { ids: string[] };
type BatchRes = { ok: boolean; ana_id: string; protocol_id?: string; opr_ids?: string[]; table_csv?: string; summary?: string; row_count?: number };

type SweepCase = { label: string; overrides: Record<string, any> };
type StudyFamily =
  | "baseline_compare"
  | "mdc_compare"
  | "regime_advisory_compare"
  | "regime_active_compare"
  | "impairment_diagnostic"
  | "verification";

type ComparisonAxis =
  | "policy"
  | "regime_family"
  | "impairment"
  | "budget"
  | "persistence"
  | "persistence_balanced"
  | "persistence_opportunistic"
  | "hysteresis_balanced"
  | "hysteresis_opportunistic"
  | "hysteresis";

type ComparisonTier = "main" | "diagnostic";

type StudyPresetId =
  | ""
  | "baseline_policy_main"
  | "mdc_policy_main"
  | "budget_main"
  | "regime_advisory_main"
  | "regime_active_main"
  | "impairment_diagnostic"
  | "delay_diagnostic"
  | "noise_diagnostic"
  | "regime_persistence_diagnostic"
  | "regime_hysteresis_diagnostic"
  | "regime_persistence_balanced_diagnostic"
  | "regime_persistence_opportunistic_diagnostic"
  | "regime_hysteresis_balanced_diagnostic"
  | "regime_hysteresis_opportunistic_diagnostic"
  | "verification_quick";

type PresetId =
  | ""
  | "loss"
  | "delay"
  | "noise"
  | "budget_n_sensors"
  | "regime_mode_family"
  | "regime_family_active"
  | "regime_persistence"
  | "regime_hysteresis"
  | "regime_persistence_balanced"
  | "regime_persistence_opportunistic"
  | "regime_hysteresis_balanced"
  | "regime_hysteresis_opportunistic"
  | "regime_family_by_impairment";

function regimeOverridesForFamily(
  family: "balanced" | "opportunistic" | "certified",
  mode: "advisory" | "active"
): Record<string, any> {
  const common = {
    "regime_management.enabled": true,
    "regime_management.mode": mode,
  };

  if (family === "balanced") {
    return {
      ...common,
      "regime_management.transition_logic.downshift_thresholds.utilization_threshold": 0.75,
      "regime_management.transition_logic.switch_to_certified_thresholds.utilization_threshold": 0.55,
      "regime_management.transition_logic.recovery_thresholds.utilization_threshold": 0.85,
      "regime_management.transition_logic.downshift_thresholds.persistence_steps": 2,
      "regime_management.transition_logic.switch_to_certified_thresholds.persistence_steps": 2,
      "regime_management.transition_logic.recovery_thresholds.persistence_steps": 2,
      "regime_management.transition_logic.downshift_thresholds.hysteresis_band": 0.05,
      "regime_management.transition_logic.switch_to_certified_thresholds.hysteresis_band": 0.05,
      "regime_management.transition_logic.recovery_thresholds.hysteresis_band": 0.05,
    };
  }

  if (family === "opportunistic") {
    return {
      ...common,
      "regime_management.transition_logic.downshift_thresholds.utilization_threshold": 0.60,
      "regime_management.transition_logic.switch_to_certified_thresholds.utilization_threshold": 0.40,
      "regime_management.transition_logic.recovery_thresholds.utilization_threshold": 0.90,
      "regime_management.transition_logic.downshift_thresholds.persistence_steps": 3,
      "regime_management.transition_logic.switch_to_certified_thresholds.persistence_steps": 3,
      "regime_management.transition_logic.recovery_thresholds.persistence_steps": 2,
      "regime_management.transition_logic.downshift_thresholds.hysteresis_band": 0.08,
      "regime_management.transition_logic.switch_to_certified_thresholds.hysteresis_band": 0.08,
      "regime_management.transition_logic.recovery_thresholds.hysteresis_band": 0.05,
    };
  }

  return {
    ...common,
    "regime_management.transition_logic.downshift_thresholds.utilization_threshold": 0.85,
    "regime_management.transition_logic.switch_to_certified_thresholds.utilization_threshold": 0.70,
    "regime_management.transition_logic.recovery_thresholds.utilization_threshold": 0.82,
    "regime_management.transition_logic.downshift_thresholds.persistence_steps": 1,
    "regime_management.transition_logic.switch_to_certified_thresholds.persistence_steps": 1,
    "regime_management.transition_logic.recovery_thresholds.persistence_steps": 3,
    "regime_management.transition_logic.downshift_thresholds.hysteresis_band": 0.03,
    "regime_management.transition_logic.switch_to_certified_thresholds.hysteresis_band": 0.03,
    "regime_management.transition_logic.recovery_thresholds.hysteresis_band": 0.08,
  };
}

function mergeOverrides(...parts: Record<string, any>[]): Record<string, any> {
  return Object.assign({}, ...parts);
}

function familyActiveBaseOverrides(
  family: "balanced" | "opportunistic" | "certified"
): Record<string, any> {
  return regimeOverridesForFamily(family, "active");
}

function persistenceSweepCasesForFamily(
  family: "balanced" | "opportunistic"
): SweepCase[] {
  const familyBase = familyActiveBaseOverrides(family);
  const values = family === "balanced" ? [1, 2, 3, 5] : [1, 2, 3, 5, 7];
  return values.map((v) => ({
    label: `${family}-persistence=${v}`,
    overrides: mergeOverrides(familyBase, {
      "regime_management.transition_logic.downshift_thresholds.persistence_steps": v,
      "regime_management.transition_logic.switch_to_certified_thresholds.persistence_steps": v,
      "regime_management.transition_logic.recovery_thresholds.persistence_steps": v,
      "study.case_family": family,
      "study.case_kind": "persistence",
    }),
  }));
}

function hysteresisSweepCasesForFamily(
  family: "balanced" | "opportunistic"
): SweepCase[] {
  const familyBase = familyActiveBaseOverrides(family);
  const values =
    family === "opportunistic"
      ? [0.00, 0.01, 0.03, 0.05, 0.10, 0.20, 0.35]
      : [0.00, 0.01, 0.05, 0.10, 0.35];
  return values.map((v) => ({
    label: `${family}-hysteresis=${v.toFixed(2)}`,
    overrides: mergeOverrides(familyBase, {
      "regime_management.transition_logic.downshift_thresholds.hysteresis_band": v,
      "regime_management.transition_logic.switch_to_certified_thresholds.hysteresis_band": v,
      "regime_management.transition_logic.recovery_thresholds.hysteresis_band": v,
      "study.case_family": family,
      "study.case_kind": "hysteresis",
    }),
  }));
}

const SWEEP_PRESETS: Array<{ id: PresetId; label: string; cases: SweepCase[] }> = [
  {
    id: "loss",
    label: "Loss Sweep (impairments.loss_prob)",
    cases: [0.0, 0.1, 0.2, 0.3, 0.4].map((v) => ({
      label: `loss=${v.toFixed(2)}`,
      overrides: { "impairments.loss_prob": v },
    })),
  },
  {
    id: "delay",
    label: "Delay Sweep (impairments.delay_steps)",
    cases: [0, 1, 2, 4, 8].map((v) => ({
      label: `delay=${v}`,
      overrides: { "impairments.delay_steps": v },
    })),
  },
  {
    id: "noise",
    label: "Noise Sweep (impairments.noise_level)",
    cases: [0.0, 0.05, 0.1, 0.2].map((v) => ({
      label: `noise=${v.toFixed(2)}`,
      overrides: { "impairments.noise_level": v },
    })),
  },
  {
    id: "budget_n_sensors",
    label: "Budget Sweep: n_sensors (network.n_sensors)",
    cases: [5, 10, 20, 30, 40].map((v) => ({
      label: `n=${v}`,
      overrides: { "network.n_sensors": v },
    })),
  },
  {
    id: "regime_mode_family",
    label: "Regime Sweep: advisory vs active × family",
    cases: [
      { label: "advisory-balanced", overrides: regimeOverridesForFamily("balanced", "advisory") },
      { label: "active-balanced", overrides: regimeOverridesForFamily("balanced", "active") },
      { label: "advisory-opportunistic", overrides: regimeOverridesForFamily("opportunistic", "advisory") },
      { label: "active-opportunistic", overrides: regimeOverridesForFamily("opportunistic", "active") },
      { label: "advisory-certified", overrides: regimeOverridesForFamily("certified", "advisory") },
      { label: "active-certified", overrides: regimeOverridesForFamily("certified", "active") },
    ],
  },
  {
    id: "regime_persistence_balanced",
    label: "Regime Sweep: balanced active persistence",
    cases: persistenceSweepCasesForFamily("balanced"),
  },
  {
    id: "regime_persistence_opportunistic",
    label: "Regime Sweep: opportunistic active persistence",
    cases: persistenceSweepCasesForFamily("opportunistic"),
  },
  {
    id: "regime_hysteresis_balanced",
    label: "Regime Sweep: balanced active hysteresis",
    cases: hysteresisSweepCasesForFamily("balanced"),
  },
  {
    id: "regime_hysteresis_opportunistic",
    label: "Regime Sweep: opportunistic active hysteresis",
    cases: hysteresisSweepCasesForFamily("opportunistic"),
  },
  {
    id: "regime_family_active",
    label: "Regime Sweep: active family only",
    cases: [
      { label: "active-balanced", overrides: regimeOverridesForFamily("balanced", "active") },
      { label: "active-opportunistic", overrides: regimeOverridesForFamily("opportunistic", "active") },
      { label: "active-certified", overrides: regimeOverridesForFamily("certified", "active") },
    ],
  },
  {
    id: "regime_persistence",
    label: "Regime Sweep: persistence steps",
    cases: [1, 3, 5].map((v) => ({
      label: `persistence=${v}`,
      overrides: {
        "regime_management.enabled": true,
        "regime_management.mode": "active",
        "regime_management.transition_logic.downshift_thresholds.persistence_steps": v,
        "regime_management.transition_logic.switch_to_certified_thresholds.persistence_steps": v,
        "regime_management.transition_logic.recovery_thresholds.persistence_steps": v,
      },
    })),
  },
  {
    id: "regime_hysteresis",
    label: "Regime Sweep: hysteresis band",
    cases: [0.00, 0.01, 0.05, 0.10, 0.35].map((v) => ({
      label: `hysteresis=${v.toFixed(2)}`,
      overrides: {
        "regime_management.enabled": true,
        "regime_management.mode": "active",
        "regime_management.transition_logic.downshift_thresholds.hysteresis_band": v,
        "regime_management.transition_logic.switch_to_certified_thresholds.hysteresis_band": v,
        "regime_management.transition_logic.recovery_thresholds.hysteresis_band": v,
      },
    })),
  },
  {
    id: "regime_family_by_impairment",
    label: "Regime Sweep: active family × impairment",
    cases: [
      { label: "balanced-ideal", overrides: { ...regimeOverridesForFamily("balanced", "active"), "impairments.noise_level": 0.0, "impairments.delay_steps": 0, "impairments.loss_prob": 0.0 } },
      { label: "balanced-moderate", overrides: { ...regimeOverridesForFamily("balanced", "active"), "impairments.noise_level": 0.1, "impairments.delay_steps": 1, "impairments.loss_prob": 0.05 } },
      { label: "balanced-harsh", overrides: { ...regimeOverridesForFamily("balanced", "active"), "impairments.noise_level": 0.2, "impairments.delay_steps": 4, "impairments.loss_prob": 0.3 } },
      { label: "opportunistic-ideal", overrides: { ...regimeOverridesForFamily("opportunistic", "active"), "impairments.noise_level": 0.0, "impairments.delay_steps": 0, "impairments.loss_prob": 0.0 } },
      { label: "opportunistic-moderate", overrides: { ...regimeOverridesForFamily("opportunistic", "active"), "impairments.noise_level": 0.1, "impairments.delay_steps": 1, "impairments.loss_prob": 0.05 } },
      { label: "opportunistic-harsh", overrides: { ...regimeOverridesForFamily("opportunistic", "active"), "impairments.noise_level": 0.2, "impairments.delay_steps": 4, "impairments.loss_prob": 0.3 } },
      { label: "certified-ideal", overrides: { ...regimeOverridesForFamily("certified", "active"), "impairments.noise_level": 0.0, "impairments.delay_steps": 0, "impairments.loss_prob": 0.0 } },
      { label: "certified-moderate", overrides: { ...regimeOverridesForFamily("certified", "active"), "impairments.noise_level": 0.1, "impairments.delay_steps": 1, "impairments.loss_prob": 0.05 } },
      { label: "certified-harsh", overrides: { ...regimeOverridesForFamily("certified", "active"), "impairments.noise_level": 0.2, "impairments.delay_steps": 4, "impairments.loss_prob": 0.3 } },
    ],
  },
];

type StudyPresetConfig = {
  id: StudyPresetId;
  group:
    | "Main comparison · Policy studies"
    | "Main comparison · Resource / budget studies"
    | "Main comparison · Regime studies"
    | "Diagnostic · Impairment studies"
    | "Diagnostic · Regime sensitivity"
    | "Verification / compact checks";
  label: string;
  description: string;
  studyFamily: StudyFamily;
  comparisonAxis: ComparisonAxis;
  comparisonTier: ComparisonTier;
  chooseBestBy: "ttfd" | "mean_entropy_auc" | "coverage_auc";
  policies: Record<string, boolean>;
  presetId: PresetId;
  studyLabel: string;
};

const STUDY_PRESETS: StudyPresetConfig[] = [
  {
    id: "baseline_policy_main",
    group: "Main comparison · Policy studies",
    label: "Main · Baseline policy comparison",
    description: "A screenshot-friendly main study comparing baseline deployment policies under a common setup.",
    studyFamily: "baseline_compare",
    comparisonAxis: "policy",
    comparisonTier: "main",
    chooseBestBy: "ttfd",
    policies: {
      random_feasible: true,
      greedy: true,
      uncertainty: true,
      mdc_info: false,
    },
    presetId: "",
    studyLabel: "Baseline policy comparison",
  },
  {
    id: "mdc_policy_main",
    group: "Main comparison · Policy studies",
    label: "Main · MDC vs baseline policies",
    description: "A main study contrasting MDC-style information policy against baseline policy families.",
    studyFamily: "mdc_compare",
    comparisonAxis: "policy",
    comparisonTier: "main",
    chooseBestBy: "ttfd",
    policies: {
      random_feasible: true,
      greedy: true,
      uncertainty: true,
      mdc_info: true,
    },
    presetId: "",
    studyLabel: "MDC vs baseline policy comparison",
  },
  {
    id: "budget_main",
    group: "Main comparison · Resource / budget studies",
    label: "Main · Budget sweep",
    description: "A main study where deployment budget is the primary comparison axis.",
    studyFamily: "baseline_compare",
    comparisonAxis: "budget",
    comparisonTier: "main",
    chooseBestBy: "ttfd",
    policies: {
      random_feasible: false,
      greedy: true,
      uncertainty: true,
      mdc_info: true,
    },
    presetId: "budget_n_sensors",
    studyLabel: "Budget sweep",
  },
  {
    id: "regime_advisory_main",
    group: "Main comparison · Regime studies",
    label: "Main · Regime advisory family comparison",
    description: "A main study centered on advisory-vs-active family semantics across regime bundles.",
    studyFamily: "regime_advisory_compare",
    comparisonAxis: "regime_family",
    comparisonTier: "main",
    chooseBestBy: "mean_entropy_auc",
    policies: {
      random_feasible: false,
      greedy: false,
      uncertainty: true,
      mdc_info: true,
    },
    presetId: "regime_mode_family",
    studyLabel: "Regime advisory family comparison",
  },
  {
    id: "regime_active_main",
    group: "Main comparison · Regime studies",
    label: "Main · Regime active family comparison",
    description: "A main study focused on active regime families as the primary experimental contrast.",
    studyFamily: "regime_active_compare",
    comparisonAxis: "regime_family",
    comparisonTier: "main",
    chooseBestBy: "mean_entropy_auc",
    policies: {
      random_feasible: false,
      greedy: false,
      uncertainty: true,
      mdc_info: true,
    },
    presetId: "regime_family_active",
    studyLabel: "Regime active family comparison",
  },
  {
    id: "impairment_diagnostic",
    group: "Diagnostic · Impairment studies",
    label: "Diagnostic · Impairment stress study",
    description: "A diagnostic study for stress-testing channel impairments rather than producing headline comparison claims.",
    studyFamily: "impairment_diagnostic",
    comparisonAxis: "impairment",
    comparisonTier: "diagnostic",
    chooseBestBy: "mean_entropy_auc",
    policies: {
      random_feasible: false,
      greedy: true,
      uncertainty: true,
      mdc_info: true,
    },
    presetId: "loss",
    studyLabel: "Impairment diagnostic",
  },
  {
    id: "delay_diagnostic",
    group: "Diagnostic · Impairment studies",
    label: "Diagnostic · Delay stress study",
    description:
      "A diagnostic study that isolates observation delay as the primary impairment axis, rather than mixing delay with loss or noise.",
    studyFamily: "impairment_diagnostic",
    comparisonAxis: "impairment",
    comparisonTier: "diagnostic",
    chooseBestBy: "mean_entropy_auc",
    policies: {
      random_feasible: false,
      greedy: true,
      uncertainty: true,
      mdc_info: true,
    },
    presetId: "delay",
    studyLabel: "Delay diagnostic",
  },
  {
    id: "noise_diagnostic",
    group: "Diagnostic · Impairment studies",
    label: "Diagnostic · Noise stress study",
    description:
      "A diagnostic study that isolates observation noise as the primary impairment axis, rather than mixing noise with delay or loss.",
    studyFamily: "impairment_diagnostic",
    comparisonAxis: "impairment",
    comparisonTier: "diagnostic",
    chooseBestBy: "mean_entropy_auc",
    policies: {
      random_feasible: false,
      greedy: true,
      uncertainty: true,
      mdc_info: true,
    },
    presetId: "noise",
    studyLabel: "Noise diagnostic",
  },
  {
    id: "regime_persistence_diagnostic",
    group: "Diagnostic · Regime sensitivity",
    label: "Diagnostic · Regime persistence sensitivity",
    description: "A diagnostic study for sensitivity to regime persistence thresholds.",
    studyFamily: "regime_active_compare",
    comparisonAxis: "persistence",
    comparisonTier: "diagnostic",
    chooseBestBy: "mean_entropy_auc",
    policies: {
      random_feasible: false,
      greedy: false,
      uncertainty: true,
      mdc_info: true,
    },
    presetId: "regime_persistence",
    studyLabel: "Regime persistence sensitivity",
  },
  {
    id: "regime_persistence_balanced_diagnostic",
    group: "Diagnostic · Regime sensitivity",
    label: "Diagnostic · Balanced persistence sensitivity",
    description: "A balanced-family active study for sensitivity to persistence thresholds.",
    studyFamily: "regime_active_compare",
    comparisonAxis: "persistence_balanced",
    comparisonTier: "diagnostic",
    chooseBestBy: "mean_entropy_auc",
    policies: {
      random_feasible: false,
      greedy: false,
      uncertainty: true,
      mdc_info: true,
    },
    presetId: "regime_persistence_balanced",
    studyLabel: "Balanced persistence sensitivity",
  },
  {
    id: "regime_persistence_opportunistic_diagnostic",
    group: "Diagnostic · Regime sensitivity",
    label: "Diagnostic · Opportunistic persistence sensitivity",
    description: "An opportunistic-family active study for sensitivity to persistence thresholds.",
    studyFamily: "regime_active_compare",
    comparisonAxis: "persistence_opportunistic",
    comparisonTier: "diagnostic",
    chooseBestBy: "mean_entropy_auc",
    policies: {
      random_feasible: false,
      greedy: false,
      uncertainty: true,
      mdc_info: true,
    },
    presetId: "regime_persistence_opportunistic",
    studyLabel: "Opportunistic persistence sensitivity",
  },
  {
    id: "regime_hysteresis_diagnostic",
    group: "Diagnostic · Regime sensitivity",
    label: "Diagnostic · Regime hysteresis sensitivity",
    description: "A diagnostic study for sensitivity to hysteresis-band settings.",
    studyFamily: "regime_active_compare",
    comparisonAxis: "hysteresis",
    comparisonTier: "diagnostic",
    chooseBestBy: "mean_entropy_auc",
    policies: {
      random_feasible: false,
      greedy: false,
      uncertainty: true,
      mdc_info: true,
    },
    presetId: "regime_hysteresis",
    studyLabel: "Regime hysteresis sensitivity",
  },
  {
    id: "regime_hysteresis_balanced_diagnostic",
    group: "Diagnostic · Regime sensitivity",
    label: "Diagnostic · Balanced hysteresis sensitivity",
    description: "A balanced-family active study for sensitivity to hysteresis-band settings.",
    studyFamily: "regime_active_compare",
    comparisonAxis: "hysteresis_balanced",
    comparisonTier: "diagnostic",
    chooseBestBy: "mean_entropy_auc",
    policies: {
      random_feasible: false,
      greedy: false,
      uncertainty: true,
      mdc_info: true,
    },
    presetId: "regime_hysteresis_balanced",
    studyLabel: "Balanced hysteresis sensitivity",
  },
  {
    id: "regime_hysteresis_opportunistic_diagnostic",
    group: "Diagnostic · Regime sensitivity",
    label: "Diagnostic · Opportunistic hysteresis sensitivity",
    description: "An opportunistic-family active study for sensitivity to hysteresis-band settings.",
    studyFamily: "regime_active_compare",
    comparisonAxis: "hysteresis_opportunistic",
    comparisonTier: "diagnostic",
    chooseBestBy: "mean_entropy_auc",
    policies: {
      random_feasible: false,
      greedy: false,
      uncertainty: true,
      mdc_info: true,
    },
    presetId: "regime_hysteresis_opportunistic",
    studyLabel: "Opportunistic hysteresis sensitivity",
  },
  {
    id: "verification_quick",
    group: "Verification / compact checks",
    label: "Verification · Quick confidence run",
    description: "A compact verification-oriented study for checking expected behavior on a trusted setup.",
    studyFamily: "verification",
    comparisonAxis: "policy",
    comparisonTier: "diagnostic",
    chooseBestBy: "ttfd",
    policies: {
      random_feasible: false,
      greedy: true,
      uncertainty: true,
      mdc_info: true,
    },
    presetId: "",
    studyLabel: "Quick verification study",
  },
];

const STUDY_PRESET_GROUP_ORDER: StudyPresetConfig["group"][] = [
  "Main comparison · Policy studies",
  "Main comparison · Resource / budget studies",
  "Main comparison · Regime studies",
  "Diagnostic · Impairment studies",
  "Diagnostic · Regime sensitivity",
  "Verification / compact checks",
];

function numOr(prev: number, raw: string) {
  const v = parseFloat(raw);
  return Number.isFinite(v) ? v : prev;
}

function intOr(prev: number, raw: string) {
  const v = parseInt(raw, 10);
  return Number.isFinite(v) ? v : prev;
}

function summarizeSelectedPolicies(policies: string[]): string {
  if (!policies.length) return "none";
  return policies.join(", ");
}

function summarizeSeeds(seeds: number[]): string {
  if (!seeds.length) return "none";
  return seeds.join(", ");
}

function summarizeBaseManifestContext(args: {
  mode: "static" | "dynamic";
  tieBreaking: "deterministic" | "stochastic";
  n: number;
  radiusM: number;
  moveM: number;
  maxMovesPerStep: number;
  minSepM: number;
  noiseLevel: number;
  delaySteps: number;
  lossProb: number;
  o1Enabled: boolean;
  cInfo: number;
  cCov: number;
  epsRef: number;
  regimeEnabled: boolean;
  regimeMode: "advisory" | "active";
}): string {
  const parts: string[] = [];
  parts.push(`mode=${args.mode}`);
  parts.push(`tie=${args.tieBreaking}`);
  parts.push(`N=${args.n}`);
  parts.push(`r=${args.radiusM}m`);
  parts.push(`move=${args.moveM}m`);
  parts.push(args.maxMovesPerStep > 0 ? `cap=${args.maxMovesPerStep}` : "cap=∞");
  parts.push(`sep=${args.minSepM}m`);
  parts.push(`noise=${args.noiseLevel}`);
  parts.push(`delay=${args.delaySteps}`);
  parts.push(`loss=${args.lossProb}`);
  parts.push(
    args.o1Enabled
      ? `belief_update:on c_info=${args.cInfo} c_cov=${args.cCov} eps_ref=${args.epsRef}`
      : "belief_update:off"
  );
  parts.push(
    args.regimeEnabled
      ? `regime=${args.regimeMode}`
      : "regime=off"
  );
  return parts.join(" · ");
}

function studyDesignerRoleText(): string {
  return "This is the canonical place to create ana-* comparison artifacts. Operational Designer now focuses on single-run opr-* authoring.";
}

export default function AnalysisBatchPage() {
  const router = useRouter();
  const [phyIds, setPhyIds] = useState<string[]>([]);
  const [phyId, setPhyId] = useState("");
  const [studyPresetId, setStudyPresetId] = useState<StudyPresetId>("");
  const [presetId, setPresetId] = useState<PresetId>("");
  const [studyFamily, setStudyFamily] = useState<StudyFamily>("baseline_compare");
  const [comparisonAxis, setComparisonAxis] = useState<ComparisonAxis>("policy");
  const [comparisonTier, setComparisonTier] = useState<ComparisonTier>("main");
  const [studyLabel, setStudyLabel] = useState("");

  // Base operational knobs (keep minimal; advanced users can edit JSON overrides per-case)
  const [mode, setMode] = useState<"static" | "dynamic">("dynamic");
  const [tieBreaking, setTieBreaking] = useState<"deterministic" | "stochastic">("deterministic");
  const [n, setN] = useState(20);
  const [radiusM, setRadiusM] = useState(250);
  const [moveM, setMoveM] = useState(500);
  const [maxMovesPerStep, setMaxMovesPerStep] = useState(0);
  const [minSepM, setMinSepM] = useState(250);
  const [minSepTouched, setMinSepTouched] = useState(false);
  const [bsR, setBsR] = useState(50);
  const [bsC, setBsC] = useState(50);

  // Impairments (base; swept via cases)
  const [noiseLevel, setNoiseLevel] = useState(0.1);
  const [delaySteps, setDelaySteps] = useState(1);
  const [lossProb, setLossProb] = useState(0.05);

  // O1 knobs (base; swept via cases)
  const [o1Enabled, setO1Enabled] = useState(true);
  const [priorP, setPriorP] = useState(0.02);
  const [alphaPos, setAlphaPos] = useState(0.35);
  const [alphaNeg, setAlphaNeg] = useState(0.15);
  const [storeEpiTrace, setStoreEpiTrace] = useState(true);
  const [frontBandCells, setFrontBandCells] = useState(1);
  // After the mdc_info sign fix, larger c_info means stronger reward for
  // information-rich candidate footprints. Treat this as reward strength,
  // not an explore/suppress polarity switch.
  const [cInfo, setCInfo] = useState(1.0);
  const [cCov, setCCov] = useState(1.0);
  const [epsRef, setEpsRef] = useState(0.0);

  // Base regime-management settings
  const [regimeEnabled, setRegimeEnabled] = useState(false);
  const [regimeMode, setRegimeMode] = useState<"advisory" | "active">("advisory");
  const [downshiftUtil, setDownshiftUtil] = useState(0.75);
  const [switchUtil, setSwitchUtil] = useState(0.55);
  const [recoveryUtil, setRecoveryUtil] = useState(0.85);
  const [downshiftPersistence, setDownshiftPersistence] = useState(2);
  const [switchPersistence, setSwitchPersistence] = useState(2);
  const [recoveryPersistence, setRecoveryPersistence] = useState(2);
  const [downshiftHysteresis, setDownshiftHysteresis] = useState(0.05);
  const [switchHysteresis, setSwitchHysteresis] = useState(0.05);
  const [recoveryHysteresis, setRecoveryHysteresis] = useState(0.05);
  const [oppNominalTarget, setOppNominalTarget] = useState(0.90);
  const [oppConservativeTarget, setOppConservativeTarget] = useState(0.65);
  const [oppNominalMotionAdj, setOppNominalMotionAdj] = useState(0);
  const [oppConservativeMotionAdj, setOppConservativeMotionAdj] = useState(-2);
  const [certEtaLo, setCertEtaLo] = useState(0.10);
  const [certEtaHi, setCertEtaHi] = useState(0.20);

  // Batch settings
  const [seedsText, setSeedsText] = useState("0,1,2,3,4");
  const [policies, setPolicies] = useState<Record<string, boolean>>({
    random_feasible: true,
    greedy: true,
    uncertainty: true,
    mdc_info: true,
  });
  const [chooseBestBy, setChooseBestBy] = useState<"ttfd" | "mean_entropy_auc" | "coverage_auc">("ttfd");

  // Sweep cases (JSON overrides)
  const [cases, setCases] = useState<SweepCase[]>([
    { label: "base", overrides: {} },
    { label: "lossy", overrides: { "impairments.loss_prob": 0.3 } },
    { label: "delayed", overrides: { "impairments.delay_steps": 4 } },
  ]);
  const [caseJsonErr, setCaseJsonErr] = useState<Record<number, string>>({});

  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [createdStudy, setCreatedStudy] = useState<string>("");
  const [autoOpenGraphic, setAutoOpenGraphic] = useState<boolean>(true);
  const [autoOpenRaw, setAutoOpenRaw] = useState<boolean>(false);

  // Keep editable JSON text per case so users can type invalid JSON temporarily without losing edits.
  const [caseOverridesText, setCaseOverridesText] = useState<Record<number, string>>(() => {
    const init: Record<number, string> = {};
    const baseCases: SweepCase[] = [
      { label: "base", overrides: {} },
      { label: "lossy", overrides: { "impairments.loss_prob": 0.3 } },
      { label: "delayed", overrides: { "impairments.delay_steps": 4 } },
    ];
    baseCases.forEach((c, i) => (init[i] = JSON.stringify(c.overrides ?? {}, null, 2)));
    return init;
  });

  useEffect(() => {
    // Keep study-family semantics aligned with the currently selected preset.
    if (presetId === "loss" || presetId === "delay" || presetId === "noise" || presetId === "regime_family_by_impairment") {
      setStudyFamily("impairment_diagnostic");
      setComparisonAxis("impairment");
      setComparisonTier("diagnostic");
      return;
    }
    if (presetId === "budget_n_sensors") {
      setStudyFamily("baseline_compare");
      setComparisonAxis("budget");
      setComparisonTier("main");
      return;
    }
    if (presetId === "regime_mode_family") {
      setStudyFamily("regime_advisory_compare");
      setComparisonAxis("regime_family");
      setComparisonTier("main");
      return;
    }
    if (presetId === "regime_family_active") {
      setStudyFamily("regime_active_compare");
      setComparisonAxis("regime_family");
      setComparisonTier("main");
      return;
    }
    if (presetId === "regime_persistence_balanced") {
      setStudyFamily("regime_active_compare");
      setComparisonAxis("persistence_balanced");
      setComparisonTier("diagnostic");
      return;
    }
    if (presetId === "regime_persistence_opportunistic") {
      setStudyFamily("regime_active_compare");
      setComparisonAxis("persistence_opportunistic");
      setComparisonTier("diagnostic");
      return;
    }
    if (presetId === "regime_persistence") {
      setStudyFamily("regime_active_compare");
      setComparisonAxis("persistence");
      setComparisonTier("diagnostic");
      return;
    }
    if (presetId === "regime_hysteresis_balanced") {
      setStudyFamily("regime_active_compare");
      setComparisonAxis("hysteresis_balanced");
      setComparisonTier("diagnostic");
      return;
    }
    if (presetId === "regime_hysteresis_opportunistic") {
      setStudyFamily("regime_active_compare");
      setComparisonAxis("hysteresis_opportunistic");
      setComparisonTier("diagnostic");
      return;
    }
    if (presetId === "regime_hysteresis") {
      setStudyFamily("regime_active_compare");
      setComparisonAxis("hysteresis");
      setComparisonTier("diagnostic");
      return;
    }
  }, [presetId]);
  
  function applyPreset(id: PresetId) {

    if (!id) return;
    const p = SWEEP_PRESETS.find((x) => x.id === id);
    if (!p) return;

    // Replace cases (Phase B: standardized sweep families).
    const nextCases = p.cases.map((c) => ({
      label: String(c.label || ""),
      overrides: (c.overrides && typeof c.overrides === "object") ? c.overrides : {},
    }));
    setCases(nextCases);

    // Reset JSON text buffers to match the preset exactly
    const nextText: Record<number, string> = {};
    nextCases.forEach((c, i) => {
      nextText[i] = JSON.stringify(c.overrides ?? {}, null, 2);
    });
    setCaseOverridesText(nextText);

    // Clear JSON errors
    setCaseJsonErr({});
  }

  function applyStudyPreset(id: StudyPresetId) {
    if (!id) return;
    const p = STUDY_PRESETS.find((x) => x.id === id);
    if (!p) return;

    setStudyPresetId(p.id);
    setStudyFamily(p.studyFamily);
    setComparisonAxis(p.comparisonAxis);
    setComparisonTier(p.comparisonTier);
    setChooseBestBy(p.chooseBestBy);
    setPolicies({ ...p.policies });
    setStudyLabel(p.studyLabel);

    if (p.presetId) {
      setPresetId(p.presetId);
      applyPreset(p.presetId);
    } else {
      setPresetId("");
      const nextCases: SweepCase[] = [{ label: "base", overrides: {} }];
      setCases(nextCases);
      setCaseOverridesText({ 0: JSON.stringify({}, null, 2) });
      setCaseJsonErr({});
    }
  }

  useEffect(() => {
    getJSON<ListRes>("/physical/list")
      .then((r) => setPhyIds((r.ids ?? []).slice().sort()))
      .catch((e) => {
        console.error(e);
        setError(String(e?.message ?? e));
      });
  }, []);

  // Keep minSep tied to radius unless user changes it (simple heuristic)
  useEffect(() => {
    if (!minSepTouched) setMinSepM(radiusM);
  }, [radiusM, minSepTouched]);

  const selectedPolicies = useMemo(() => {
    return Object.entries(policies)
      .filter(([, on]) => !!on)
      .map(([k]) => k);
  }, [policies]);

  const seeds = useMemo(() => {
    const raw = String(seedsText || "")
      .split(/[,\s]+/)
      .map((x) => x.trim())
      .filter(Boolean);
    const out: number[] = [];
    for (const t of raw) {
      const v = parseInt(t, 10);
      if (Number.isFinite(v)) out.push(v);
    }
    // unique + stable
    return Array.from(new Set(out));
  }, [seedsText]);

  const runCountEstimate = useMemo(() => {
    const c = Math.max(1, cases.length);
    const s = Math.max(1, seeds.length);
    const p = Math.max(1, selectedPolicies.length);
    return c * s * p;
  }, [cases.length, seeds.length, selectedPolicies.length]);

  const mainStudy = comparisonTier === "main";
  const selectedStudyPreset = useMemo(
    () => STUDY_PRESETS.find((p) => p.id === studyPresetId) ?? null,
    [studyPresetId]
  );
  const groupedStudyPresets = useMemo(() => {
    return STUDY_PRESET_GROUP_ORDER.map((group) => ({
      group,
      items: STUDY_PRESETS.filter((p) => p.group === group),
    })).filter((x) => x.items.length > 0);
  }, []);
  const selectedPresetMeta = useMemo(
    () => SWEEP_PRESETS.find((p) => p.id === presetId) ?? null,
    [presetId]
  );

  const baseManifestSummary = useMemo(
    () =>
      summarizeBaseManifestContext({
        mode,
        tieBreaking,
        n,
        radiusM,
        moveM,
        maxMovesPerStep,
        minSepM,
        noiseLevel,
        delaySteps,
        lossProb,
        o1Enabled,
        cInfo,
        cCov,
        epsRef,
        regimeEnabled,
        regimeMode,
      }),
    [mode, tieBreaking, n, radiusM, moveM, maxMovesPerStep, minSepM, noiseLevel, delaySteps, lossProb, o1Enabled, cInfo, cCov, epsRef, regimeEnabled, regimeMode]

  );

  const studyFamilyHelp: Record<StudyFamily, string> = {
    baseline_compare: "Compare baseline deployment policies under a controlled study design.",
    mdc_compare: "Compare MDC-style information policies against baseline deployment families.",
    regime_advisory_compare: "Study regime-managed behavior where advisory semantics are part of the interpretation.",
    regime_active_compare: "Study active regime families where realized motion-control behavior is central.",
    impairment_diagnostic: "Stress the system with impairment sweeps for diagnostic interpretation rather than headline claims.",
    verification: "Compact verification studies used to confirm expected behavior on trusted setups.",
  };

  const axisHelp: Record<ComparisonAxis, string> = {
    policy: "Use when the main comparison is across policy families.",
    regime_family: "Use when the comparison centers on balanced / opportunistic / certified regime bundles.",
    impairment: "Use when channel impairment or observation degradation is the main swept factor.",
    budget: "Use when sensor count or deployment budget is the main varying quantity.",
    persistence_balanced: "Use when persistence is swept specifically within the balanced active family.",
    persistence_opportunistic: "Use when persistence is swept specifically within the opportunistic active family.",
    hysteresis: "Use when hysteresis-band sensitivity is the main varying quantity.",
    hysteresis_balanced: "Use when hysteresis is swept specifically within the balanced active family.",
    hysteresis_opportunistic: "Use when hysteresis is swept specifically within the opportunistic active family.",
  };

  async function onRunBatch() {
    if (!phyId || busy) return;
    if (!selectedPolicies.length) return;
    if (!seeds.length) return;

    setBusy(true);
    setError("");
    setStatus("");
    setCreatedStudy("");

    try {
      setStatus("Creating operational study…");

      const manifest = {
        run_mode: "closed_loop",
        phy_id: phyId,

        impairments: {
          // delta/epsilon/rho/tau are operational MDC knobs; keep defaults consistent with Operational Designer
          noise_level: noiseLevel,
          delay_steps: delaySteps,
          loss_prob: lossProb,
        },

        network: {
          // policy overridden per-run by batch endpoint
          policy: "greedy",
          deployment_mode: mode,
          tie_breaking: tieBreaking,
          n_sensors: n,
          sensor_radius_m: radiusM,
          sensor_move_max_m: moveM,
          max_moves_per_step: maxMovesPerStep,
          min_separation_m: minSepM,
          base_station_rc: [bsR, bsC],
        },

        o1: {
          enabled: o1Enabled,
          // seed overridden per-run by batch endpoint
          seed: 0,
          prior_p: priorP,
          alpha_pos: alphaPos,
          alpha_neg: alphaNeg,
          store_epi_trace: storeEpiTrace,
          front_band_cells: frontBandCells,
          c_info: cInfo,
          c_cov: cCov,
          eps_ref: epsRef,
          obs_model: "detections_binary",
        },

        regime_management: {
          enabled: regimeEnabled,
          mode: regimeMode,
          signals: {
            use_utilization: true,
            use_strict_drift_proxy: true,
            use_local_drift_rate: true,
            use_cumulative_exposure: true,
            use_trigger_bools: true,
          },
          transition_logic: {
            downshift_thresholds: {
              utilization_threshold: downshiftUtil,
              strict_drift_proxy_threshold: 0.0,
              cumulative_exposure_threshold: 0.0,
              local_drift_rate_threshold: 0.0,
              persistence_steps: downshiftPersistence,
              hysteresis_band: downshiftHysteresis,
            },
            switch_to_certified_thresholds: {
              utilization_threshold: switchUtil,
              strict_drift_proxy_threshold: 0.0,
              cumulative_exposure_threshold: 0.0,
              local_drift_rate_threshold: 0.0,
              persistence_steps: switchPersistence,
              hysteresis_band: switchHysteresis,
            },
            recovery_thresholds: {
              utilization_threshold: recoveryUtil,
              strict_drift_proxy_threshold: 0.0,
              cumulative_exposure_threshold: 0.0,
              local_drift_rate_threshold: 0.0,
              persistence_steps: recoveryPersistence,
              hysteresis_band: recoveryHysteresis,
            },
          },
          opportunistic: {
            ladder: [
              {
                level_id: "nominal",
                healthy_utilization_target: oppNominalTarget,
                motion_adjustment: oppNominalMotionAdj,
              },
              {
                level_id: "conservative",
                healthy_utilization_target: oppConservativeTarget,
                motion_adjustment: oppConservativeMotionAdj,
              },
            ],
          },
          certified: {
            stages: [
              {
                stage_id: "cert_lo",
                entropy_threshold: 0.75,
                eta: certEtaLo,
                expected_certified_rate: 0.75,
              },
              {
                stage_id: "cert_hi",
                entropy_threshold: 0.55,
                eta: certEtaHi,
                expected_certified_rate: 0.55,
              },
            ],
          },
        },
      };

      const r = await postJSON<BatchRes>("/analysis/create_operational_study", {
        manifest,
        semantics: {
          study_family: studyFamily,
          comparison_axis: comparisonAxis,
          comparison_tier: comparisonTier,
          preset_origin: presetId || "analysis_batch_custom",
          study_label: studyLabel.trim(),
        },
        policies: selectedPolicies,
        seeds,
        sweep: cases,
        choose_best_by: chooseBestBy,
      });

      setCreatedStudy(r.ana_id);
      setStatus(`Done. Created ${r.ana_id} (${r.row_count ?? "?"} rows).`);
      if (autoOpenGraphic) {
        router.push(`/analysis/graphic?id=${encodeURIComponent(r.ana_id)}`);
      }
      if (autoOpenRaw) {
        // Pop-up blockers may block this if triggered outside a direct click.
        try {
          window.open(`/analysis/raw?id=${encodeURIComponent(r.ana_id)}`, "_blank", "noopener,noreferrer");
        } catch {
          // ignore
        }
      }
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Failed.");
      setStatus("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <h2>Analysis · Study Designer</h2>
      <div aria-hidden className="section-stripe section-stripe--analysis" />
      <div className="small" style={{ opacity: 0.85, lineHeight: 1.45 }}>
        Create a single <b>operational study</b> that produces one <b>ana-*</b> artifact with many <b>opr-*</b> runs.
        Analysis is where multi-run comparison studies now live.
      </div>
      <div className="small" style={{ opacity: 0.82, lineHeight: 1.45, marginTop: 6 }}>
        <b>{studyDesignerRoleText()}</b>
      </div>

      <div className="card" style={{ marginTop: 10, background: "rgba(0,0,0,0.02)" }}>
        <h2 style={{ marginTop: 0, fontSize: 16 }}>Role of this page</h2>
        <div className="small" style={{ lineHeight: 1.5 }}>
          Use this page for policy comparisons, regime-family comparisons, impairment sweeps, persistence/hysteresis sensitivity studies,
          and other multi-run analysis artifacts intended for screenshot-ready summary reading in <b>Analysis · Graphic</b>.
        </div>
        <div className="small" style={{ marginTop: 8, opacity: 0.8 }}>Operational Designer now handles single-run authoring only.</div>

      </div>

      <div style={{ marginTop: 10 }}>
        <RunPicker label="Physical Run" ids={phyIds} value={phyId} onChange={setPhyId} />
      </div>

      <div className="card" style={{ marginTop: 10 }}>
        <h2 style={{ marginTop: 0 }}>Start from a study preset</h2>
        <div className="small" style={{ opacity: 0.8, marginBottom: 10 }}>
          Choose a top-level study preset to pre-populate study semantics, participating policies, headline metric,
          and an appropriate sweep-family starting point.
        </div>

        <div className="row" style={{ alignItems: "center" }}>
          <label>Study preset</label>
          <select
            value={studyPresetId}
            onChange={(e) => setStudyPresetId(e.target.value as StudyPresetId)}
            disabled={busy}
            style={{ minWidth: 360 }}
          >
            <option value="">(choose study preset…)</option>
            {groupedStudyPresets.flatMap(({ group, items }) => [
              <option key={`group-${group}`} value="" disabled>
                {group}
              </option>,
              ...items.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              )),
            ])}
          </select>
          <button
            type="button"
            disabled={busy || !studyPresetId}
            onClick={() => applyStudyPreset(studyPresetId)}
            title="Apply the selected study preset"
          >
            Apply study preset
          </button>
        </div>

        {selectedStudyPreset ? (
          <div
            className="card"
            style={{
              marginTop: 10,
              border: selectedStudyPreset.comparisonTier === "main"
                ? "1px solid rgba(0,0,0,0.08)"
                : "1px solid #f2d38a",
              background: selectedStudyPreset.comparisonTier === "main"
                ? "rgba(0,0,0,0.02)"
                : "rgba(242, 211, 138, 0.14)",
            }}
          >
            <h2 style={{ marginTop: 0, fontSize: 16 }}>Selected study preset</h2>
            <div className="small" style={{ lineHeight: 1.6 }}>
              <div><b>{selectedStudyPreset.label}</b></div>
              <div style={{ marginTop: 6, opacity: 0.85 }}>{selectedStudyPreset.description}</div>
              <div style={{ marginTop: 8 }}>
                family: <b>{selectedStudyPreset.studyFamily}</b>
                {" · "}axis: <b>{selectedStudyPreset.comparisonAxis}</b>
                {" · "}tier: <b>{selectedStudyPreset.comparisonTier}</b>
              </div>
              <div>
                choose-best-by: <b>{selectedStudyPreset.chooseBestBy}</b>
                {" · "}sweep preset: <b>{selectedStudyPreset.presetId || "manual base case"}</b>
              </div>
            </div>
          </div>
        ) : null}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 12,
            marginTop: 10,
          }}
        >
          <div className="card" style={{ marginTop: 0, background: "rgba(0,0,0,0.02)" }}>
            <h2 style={{ marginTop: 0, fontSize: 16 }}>Good first main studies</h2>
            <div className="small" style={{ lineHeight: 1.5 }}>
              <b>baseline_policy_main</b>, <b>mdc_policy_main</b>, <b>budget_main</b>, <b>regime_active_main</b>
            </div>
          </div>
          <div className="card" style={{ marginTop: 0, background: "rgba(0,0,0,0.02)" }}>
            <h2 style={{ marginTop: 0, fontSize: 16 }}>Good first diagnostic studies</h2>
            <div className="small" style={{ lineHeight: 1.5 }}>
              <b>impairment_diagnostic</b>, <b>delay_diagnostic</b>, <b>noise_diagnostic</b>, <b>regime_persistence_diagnostic</b>, <b>regime_hysteresis_diagnostic</b>, <b>verification_quick</b>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 10 }}>
        <h2 style={{ marginTop: 0 }}>Study intent</h2>
        <div className="small" style={{ opacity: 0.8, marginBottom: 10 }}>
          Start by stating what kind of comparison this study is meant to support. These fields define the analysis semantics
          that Graphic and later figures should trust.
        </div>

        <div className="row">
          <label>Study family</label>
          <select value={studyFamily} onChange={(e) => setStudyFamily(e.target.value as StudyFamily)} disabled={busy}>
            <option value="baseline_compare">baseline_compare</option>
            <option value="mdc_compare">mdc_compare</option>
            <option value="regime_advisory_compare">regime_advisory_compare</option>
            <option value="regime_active_compare">regime_active_compare</option>
            <option value="impairment_diagnostic">impairment_diagnostic</option>
            <option value="verification">verification</option>
          </select>

          <label>Comparison axis</label>
          <select value={comparisonAxis} onChange={(e) => setComparisonAxis(e.target.value as ComparisonAxis)} disabled={busy}>
            <option value="policy">policy</option>
            <option value="regime_family">regime_family</option>
            <option value="impairment">impairment</option>
            <option value="budget">budget</option>
            <option value="persistence">persistence</option>
            <option value="persistence_balanced">persistence_balanced</option>
            <option value="persistence_opportunistic">persistence_opportunistic</option>
            <option value="hysteresis">hysteresis</option>
            <option value="hysteresis_balanced">hysteresis_balanced</option>
            <option value="hysteresis_opportunistic">hysteresis_opportunistic</option>
          </select>
        </div>

        <div className="row">
          <label>Tier</label>
          <select value={comparisonTier} onChange={(e) => setComparisonTier(e.target.value as ComparisonTier)} disabled={busy}>
            <option value="main">main</option>
            <option value="diagnostic">diagnostic</option>
          </select>

          <label>Study label</label>
          <input
            type="text"
            value={studyLabel}
            onChange={(e) => setStudyLabel(e.target.value)}
            disabled={busy}
            placeholder="optional human-readable label"
            style={{ minWidth: 280 }}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 12,
            marginTop: 10,
          }}
        >
          <div
            className="card"
            style={{
              marginTop: 0,
              border: "1px solid rgba(0,0,0,0.08)",
              background: "rgba(0,0,0,0.02)",
            }}
          >
            <h2 style={{ marginTop: 0, fontSize: 16 }}>Selected family</h2>
            <div className="small" style={{ lineHeight: 1.5 }}>
              <b>{studyFamily}</b>
              <div style={{ marginTop: 6, opacity: 0.85 }}>{studyFamilyHelp[studyFamily]}</div>
            </div>
          </div>
          <div
            className="card"
            style={{
              marginTop: 0,
              border: mainStudy ? "1px solid rgba(0,0,0,0.08)" : "1px solid #f2d38a",
              background: mainStudy ? "rgba(0,0,0,0.02)" : "rgba(242, 211, 138, 0.14)",
            }}
          >
            <h2 style={{ marginTop: 0, fontSize: 16 }}>Interpretation tier</h2>
            <div className="small" style={{ lineHeight: 1.5 }}>
              <b>{comparisonTier}</b>
              <div style={{ marginTop: 6, opacity: 0.85 }}>
                {mainStudy
                  ? "Use for screenshot-friendly comparisons and headline interpretation."
                  : "Use for parameter sensitivity, stress tests, and secondary diagnostic reading."}
              </div>
            </div>
          </div>
        </div>

        <div className="small" style={{ marginTop: 10, opacity: 0.8 }}>
          Axis note: <b>{comparisonAxis}</b> — {axisHelp[comparisonAxis]}
        </div>
        <div className="small" style={{ marginTop: 6, opacity: 0.72 }}>
          The study preset above is the fastest way to get these semantics into a coherent starting state.
        </div>
      </div>

      <div className="card" style={{ marginTop: 10 }}>
        <h2 style={{ marginTop: 0 }}>Study execution</h2>
        <div className="small" style={{ opacity: 0.8, marginBottom: 10 }}>
          Choose which policy families participate and how many repeated seeds support the comparison.
        </div>

        <div className="row">
          <label>Policies</label>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {["random_feasible", "greedy", "uncertainty", "mdc_info"].map((p) => (
              <label key={p} className="small" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={!!policies[p]}
                  onChange={(e) => setPolicies((prev) => ({ ...prev, [p]: !!e.target.checked }))}
                  disabled={busy}
                />
                {p}
              </label>
            ))}
          </div>
        </div>

        <div className="row">
          <label>Seeds</label>
          <input
            type="text"
            value={seedsText}
            onChange={(e) => setSeedsText(e.target.value)}
            disabled={busy}
            placeholder="e.g., 0,1,2,3,4"
            style={{ minWidth: 340 }}
          />

          <label>Choose best by</label>
          <select value={chooseBestBy} onChange={(e) => setChooseBestBy(e.target.value as any)} disabled={busy}>
            <option value="ttfd">ttfd</option>
            <option value="mean_entropy_auc">mean_entropy_auc</option>
            <option value="coverage_auc">coverage_auc</option>
          </select>
        </div>

        <div className="small" style={{ marginTop: 6, opacity: 0.8 }}>
          Estimated runs: <b>{runCountEstimate}</b> (= cases × seeds × policies). This runs synchronously.
        </div>
        <div className="small" style={{ marginTop: 6, opacity: 0.78 }}>
          Selected policies: <b>{summarizeSelectedPolicies(selectedPolicies)}</b>
        </div>
        <div className="small" style={{ marginTop: 4, opacity: 0.78 }}>
          Seeds: <b>{summarizeSeeds(seeds)}</b>
        </div>
        <div className="small" style={{ marginTop: 8, opacity: 0.78 }}>
          This page creates a study from one shared <b>base manifest</b> plus a sweep/case family and policy/seed expansion.
        </div>
        <div className="small" style={{ marginTop: 4, opacity: 0.78 }}>
          Base manifest snapshot: <span title={baseManifestSummary}>{baseManifestSummary}</span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 12,
            marginTop: 10,
          }}
        >
          <div className="card" style={{ marginTop: 0, background: "rgba(0,0,0,0.02)" }}>
            <h2 style={{ marginTop: 0, fontSize: 16 }}>Policies</h2>
            <div className="small">
              <b>{selectedPolicies.length}</b> selected
              <div style={{ marginTop: 6, opacity: 0.8 }}>
                {selectedPolicies.length ? selectedPolicies.join(", ") : "No policies selected."}
              </div>
            </div>
          </div>
          <div className="card" style={{ marginTop: 0, background: "rgba(0,0,0,0.02)" }}>
            <h2 style={{ marginTop: 0, fontSize: 16 }}>Seeds</h2>
            <div className="small">
              <b>{seeds.length}</b> distinct seeds
              <div style={{ marginTop: 6, opacity: 0.8 }}>
                {seeds.length ? seeds.join(", ") : "No valid seeds parsed."}
              </div>
            </div>
          </div>
          <div className="card" style={{ marginTop: 0, background: "rgba(0,0,0,0.02)" }}>
            <h2 style={{ marginTop: 0, fontSize: 16 }}>Headline metric</h2>
            <div className="small">
              <b>{chooseBestBy}</b>
              <div style={{ marginTop: 6, opacity: 0.8 }}>
                Used for the recorded “best” study result in summary artifacts.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 10 }}>
        <h2 style={{ marginTop: 0 }}>Base operational settings</h2>
        <div className="small" style={{ opacity: 0.8, marginBottom: 10 }}>
          These settings define the common execution context shared by all cases in the study.
        </div>

        <div className="row">
          <label>Mode</label>
          <select value={mode} onChange={(e) => setMode(e.target.value as any)} disabled={busy}>
            <option value="dynamic">dynamic</option>
            <option value="static">static</option>
          </select>

          <label>Tie-break</label>
          <select value={tieBreaking} onChange={(e) => setTieBreaking(e.target.value as any)} disabled={busy}>
            <option value="deterministic">deterministic</option>
            <option value="stochastic">stochastic</option>
          </select>
        </div>

        <div className="row">
          <label>Sensors</label>
          <input type="number" value={n} min={1} onChange={(e) => setN(Math.max(1, intOr(n, e.target.value)))} disabled={busy} />

          <label>Radius (m)</label>
          <input type="number" value={radiusM} min={1} onChange={(e) => setRadiusM(Math.max(1, numOr(radiusM, e.target.value)))} disabled={busy} />

          <label>Move/step (m)</label>
          <input type="number" value={moveM} min={0} onChange={(e) => setMoveM(Math.max(0, numOr(moveM, e.target.value)))} disabled={busy} />

          <label>Max moves/step</label>
          <input
            type="number"
            value={maxMovesPerStep}
            min={0}
            onChange={(e) => setMaxMovesPerStep(Math.max(0, intOr(maxMovesPerStep, e.target.value)))}
            disabled={busy}
            title="0 = unlimited"
          />
        </div>

        <div className="row">
          <label>Min separation (m)</label>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="number"
              value={minSepM}
              min={0}
              onChange={(e) => {
                setMinSepTouched(true);
                setMinSepM(Math.max(0, numOr(minSepM, e.target.value)));
              }}
              disabled={busy}
              style={{ minWidth: 140 }}
            />
            <button
              type="button"
              onClick={() => {
                setMinSepTouched(false);
                setMinSepM(radiusM);
              }}
              disabled={busy}
              title="Set min separation equal to radius and keep it synced"
              style={{ height: 34, whiteSpace: "nowrap" }}
            >
              ↺ = radius
            </button>
          </div>
          <label>Base station r</label>
          <input type="number" value={bsR} onChange={(e) => setBsR(intOr(bsR, e.target.value))} disabled={busy} />
          <label>Base station c</label>
          <input type="number" value={bsC} onChange={(e) => setBsC(intOr(bsC, e.target.value))} disabled={busy} />
        </div>
      </div>

      <details style={{ marginTop: 10 }}>
        <summary className="small" style={{ cursor: "pointer" }}>
          Base impairments + O1 knobs (optional)
        </summary>

        <div className="row" style={{ marginTop: 8 }}>
          <label>noise_level</label>
          <input type="number" step="0.01" value={noiseLevel} onChange={(e) => setNoiseLevel(Math.max(0, numOr(noiseLevel, e.target.value)))} disabled={busy} />
          <label>delay_steps</label>
          <input type="number" value={delaySteps} onChange={(e) => setDelaySteps(Math.max(0, intOr(delaySteps, e.target.value)))} disabled={busy} />
          <label>loss_prob</label>
          <input type="number" step="0.01" value={lossProb} onChange={(e) => setLossProb(Math.max(0, numOr(lossProb, e.target.value)))} disabled={busy} />
        </div>

        <div className="row">
          <label>O1 enabled</label>
          <select value={o1Enabled ? "yes" : "no"} onChange={(e) => setO1Enabled(e.target.value === "yes")} disabled={busy}>
            <option value="yes">yes</option>
            <option value="no">no</option>
          </select>
          <label>prior_p</label>
          <input type="number" step="0.01" value={priorP} onChange={(e) => setPriorP(Math.max(0, Math.min(1, numOr(priorP, e.target.value))))} disabled={busy} />
          <label>front_band_cells</label>
          <input type="number" value={frontBandCells} min={0} onChange={(e) => setFrontBandCells(Math.max(0, intOr(frontBandCells, e.target.value)))} disabled={busy} />
        </div>

        <div className="row">
          <label>alpha_pos</label>
          <input type="number" step="0.05" value={alphaPos} onChange={(e) => setAlphaPos(Math.max(0, Math.min(1, numOr(alphaPos, e.target.value))))} disabled={busy} />
          <label>alpha_neg</label>
          <input type="number" step="0.05" value={alphaNeg} onChange={(e) => setAlphaNeg(Math.max(0, Math.min(1, numOr(alphaNeg, e.target.value))))} disabled={busy} />
          <label>store_epi_trace</label>
          <select value={storeEpiTrace ? "yes" : "no"} onChange={(e) => setStoreEpiTrace(e.target.value === "yes")} disabled={busy}>
            <option value="yes">yes</option>
            <option value="no">no</option>
          </select>
        </div>

        <div className="row">
          <label>c_info</label>
          <input type="number" step="0.1" value={cInfo} onChange={(e) => setCInfo(Math.max(0, numOr(cInfo, e.target.value)))} disabled={busy} />
          <label>c_cov</label>
          <input type="number" step="0.1" value={cCov} onChange={(e) => setCCov(Math.max(0, numOr(cCov, e.target.value)))} disabled={busy} />
          <label>eps_ref</label>
          <input type="number" step="0.01" value={epsRef} onChange={(e) => setEpsRef(Math.max(0, numOr(epsRef, e.target.value)))} disabled={busy} />
        </div>
      </details>

      <details style={{ marginTop: 10 }}>
        <summary className="small" style={{ cursor: "pointer" }}>
          Base regime-management knobs (optional)
        </summary>

        <div className="row" style={{ marginTop: 8 }}>
          <label>Regime enabled</label>
          <select value={regimeEnabled ? "yes" : "no"} onChange={(e) => setRegimeEnabled(e.target.value === "yes")} disabled={busy}>
            <option value="yes">yes</option>
            <option value="no">no</option>
          </select>

          <label>Mode</label>
          <select value={regimeMode} onChange={(e) => setRegimeMode(e.target.value as "advisory" | "active")} disabled={busy}>
            <option value="advisory">advisory</option>
            <option value="active">active</option>
          </select>
        </div>

        <div className="row">
          <label>Downshift u</label>
          <input type="number" step="0.01" value={downshiftUtil} onChange={(e) => setDownshiftUtil(Math.max(0, Math.min(1, numOr(downshiftUtil, e.target.value))))} disabled={busy} />
          <label>Switch u</label>
          <input type="number" step="0.01" value={switchUtil} onChange={(e) => setSwitchUtil(Math.max(0, Math.min(1, numOr(switchUtil, e.target.value))))} disabled={busy} />
          <label>Recovery u</label>
          <input type="number" step="0.01" value={recoveryUtil} onChange={(e) => setRecoveryUtil(Math.max(0, Math.min(1, numOr(recoveryUtil, e.target.value))))} disabled={busy} />
        </div>

        <div className="row">
          <label>Downshift persistence</label>
          <input type="number" min={1} value={downshiftPersistence} onChange={(e) => setDownshiftPersistence(Math.max(1, intOr(downshiftPersistence, e.target.value)))} disabled={busy} />
          <label>Switch persistence</label>
          <input type="number" min={1} value={switchPersistence} onChange={(e) => setSwitchPersistence(Math.max(1, intOr(switchPersistence, e.target.value)))} disabled={busy} />
          <label>Recovery persistence</label>
          <input type="number" min={1} value={recoveryPersistence} onChange={(e) => setRecoveryPersistence(Math.max(1, intOr(recoveryPersistence, e.target.value)))} disabled={busy} />
        </div>

        <div className="row">
          <label>Downshift hysteresis</label>
          <input type="number" step="0.01" value={downshiftHysteresis} onChange={(e) => setDownshiftHysteresis(Math.max(0, numOr(downshiftHysteresis, e.target.value)))} disabled={busy} />
          <label>Switch hysteresis</label>
          <input type="number" step="0.01" value={switchHysteresis} onChange={(e) => setSwitchHysteresis(Math.max(0, numOr(switchHysteresis, e.target.value)))} disabled={busy} />
          <label>Recovery hysteresis</label>
          <input type="number" step="0.01" value={recoveryHysteresis} onChange={(e) => setRecoveryHysteresis(Math.max(0, numOr(recoveryHysteresis, e.target.value)))} disabled={busy} />
        </div>

        <div className="row">
          <label>Opp nominal target</label>
          <input type="number" step="0.01" value={oppNominalTarget} onChange={(e) => setOppNominalTarget(Math.max(0, Math.min(1, numOr(oppNominalTarget, e.target.value))))} disabled={busy} />
          <label>Opp conservative target</label>
          <input type="number" step="0.01" value={oppConservativeTarget} onChange={(e) => setOppConservativeTarget(Math.max(0, Math.min(1, numOr(oppConservativeTarget, e.target.value))))} disabled={busy} />
          <label>Nominal motion adj</label>
          <input type="number" step="1" value={oppNominalMotionAdj} onChange={(e) => setOppNominalMotionAdj(intOr(oppNominalMotionAdj, e.target.value))} disabled={busy} />
          <label>Conservative motion adj</label>
          <input type="number" step="1" value={oppConservativeMotionAdj} onChange={(e) => setOppConservativeMotionAdj(intOr(oppConservativeMotionAdj, e.target.value))} disabled={busy} />
        </div>

        <div className="row">
          <label>cert_lo eta</label>
          <input type="number" step="0.01" value={certEtaLo} onChange={(e) => setCertEtaLo(Math.max(0, Math.min(0.5, numOr(certEtaLo, e.target.value))))} disabled={busy} />
          <label>cert_hi eta</label>
          <input type="number" step="0.01" value={certEtaHi} onChange={(e) => setCertEtaHi(Math.max(0, Math.min(0.5, numOr(certEtaHi, e.target.value))))} disabled={busy} />
        </div>
      </details>

      <div className="card" style={{ marginTop: 10 }}>
        <h2 style={{ marginTop: 0 }}>Sweep cases</h2>
        <div className="small" style={{ opacity: 0.85 }}>
          Each case applies <b>dotpath</b> overrides to the base manifest (e.g., <code>impairments.loss_prob</code>, <code>impairments.delay_steps</code>,{" "}
          <code>o1.c_info</code>, <code>network.max_moves_per_step</code>).
        </div>
        <div className="small" style={{ opacity: 0.72, marginTop: 6 }}>
          Use <code>impairments.noise_level</code>, <code>impairments.delay_steps</code>, and <code>impairments.loss_prob</code>
          {" "}for channel impairment sweeps.
        </div>
        <div className="small" style={{ opacity: 0.72, marginTop: 6 }}>
          For MDC-style studies, treat <code>o1.c_info</code> as an information-reward strength knob.
          Larger values reward information-rich candidate footprints more strongly.
        </div>
        <div className="row" style={{ marginTop: 10, alignItems: "center" }}>
          <label>Presets</label>
          <select
            value={presetId}
            onChange={(e) => setPresetId(e.target.value as PresetId)}
            disabled={busy}
            style={{ minWidth: 320 }}
            title="Apply a standardized sweep family (replaces current cases)"
          >
            <option value="">(choose preset…)</option>
            {SWEEP_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={busy || !presetId}
            onClick={() => applyPreset(presetId)}
            title="Replace cases with the preset sweep family"
          >
            Apply preset
          </button>
          <div className="small" style={{ opacity: 0.75 }}>
            Sweep presets define the exact case family. Study presets above define the broader semantic intent.
          </div>
        </div>

        {selectedPresetMeta ? (
          <div
            className="card"
            style={{
              marginTop: 10,
              border: mainStudy ? "1px solid rgba(0,0,0,0.08)" : "1px solid #f2d38a",
              background: mainStudy ? "rgba(0,0,0,0.02)" : "rgba(242, 211, 138, 0.14)",
            }}
          >
            <h2 style={{ marginTop: 0, fontSize: 16 }}>Selected preset</h2>
            <div className="small" style={{ lineHeight: 1.5 }}>
              <b>{selectedPresetMeta.label}</b>
              <div style={{ marginTop: 6, opacity: 0.85 }}>
                {selectedPresetMeta.cases.length} cases · interpreted as{" "}
                <b>{comparisonTier}</b> / <b>{comparisonAxis}</b>.
              </div>
            </div>
          </div>
        ) : null}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 12,
            marginTop: 10,
          }}
        >
          <div className="card" style={{ marginTop: 0, background: "rgba(0,0,0,0.02)" }}>
            <h2 style={{ marginTop: 0, fontSize: 16 }}>Main comparison studies</h2>
            <div className="small" style={{ lineHeight: 1.5 }}>
              Prefer presets that isolate one clean scientific contrast for screenshots and summary claims.
            </div>
            <div className="small" style={{ marginTop: 8, opacity: 0.8 }}>
              Good examples: <b>budget_n_sensors</b>, <b>regime_family_active</b>, <b>regime_mode_family</b>,
              {" "}and family-specific sensitivity studies when the question is about one active family only.
            </div>
          </div>
          <div className="card" style={{ marginTop: 0, background: "rgba(0,0,0,0.02)" }}>
            <h2 style={{ marginTop: 0, fontSize: 16 }}>Diagnostic studies</h2>
            <div className="small" style={{ lineHeight: 1.5 }}>
              Prefer these for sensitivity checks, impairment stress tests, and supporting evidence rather than headline comparisons.
            </div>
            <div className="small" style={{ marginTop: 8, opacity: 0.8 }}>
              Good examples: <b>loss</b>, <b>delay</b>, <b>noise</b>, <b>regime_persistence_balanced</b>,
              {" "}<b>regime_persistence_opportunistic</b>, <b>regime_hysteresis_balanced</b>,
              {" "}<b>regime_hysteresis_opportunistic</b>
            </div>
          </div>
        </div>

        {cases.map((c, idx) => (
          <div key={idx} className="card" style={{ marginTop: 10 }}>
            <div className="row" style={{ alignItems: "center" }}>
              <label>label</label>
              <input
                type="text"
                value={c.label}
                onChange={(e) =>
                  setCases((prev) => prev.map((x, i) => (i === idx ? { ...x, label: e.target.value } : x)))
                }
                disabled={busy}
                style={{ minWidth: 220 }}
              />
              <button
                type="button"
                disabled={busy || cases.length <= 1}
                onClick={() => {
                  setCases((prev) => prev.filter((_, i) => i !== idx));
                  setCaseJsonErr((prevErr) => {
                    const next: Record<number, string> = {};
                    for (const [kStr, msg] of Object.entries(prevErr)) {
                      const k = Number(kStr);
                      if (!Number.isFinite(k)) continue;
                      if (k < idx) next[k] = msg;
                      else if (k > idx) next[k - 1] = msg; // shift down
                      // if k === idx, drop it (case removed)
                    }
                    return next;
                  });
                  setCaseOverridesText((prevText) => {
                    const next: Record<number, string> = {};
                    for (const [kStr, txt] of Object.entries(prevText)) {
                      const k = Number(kStr);
                      if (!Number.isFinite(k)) continue;
                      if (k < idx) next[k] = txt;
                      else if (k > idx) next[k - 1] = txt; // shift down
                    }
                    return next;
                  });
                }}
                style={{ marginLeft: "auto" }}
                title="Remove case"
              >
                Remove
              </button>
            </div>
            <div className="small" style={{ opacity: 0.8, marginTop: 6 }}>
              overrides (JSON)
            </div>
            <textarea
              value={caseOverridesText[idx] ?? JSON.stringify(c.overrides ?? {}, null, 2)}
              onChange={(e) => {
                const raw = e.target.value;
                // Always store raw text so user can type invalid JSON temporarily.
                setCaseOverridesText((prev) => ({ ...prev, [idx]: raw }));
                // Try parse; if valid, update overrides and clear error.
                try {
                  const j = JSON.parse(raw || "{}");
                  setCases((prev) =>
                    prev.map((x, i) => (i === idx ? { ...x, overrides: j && typeof j === "object" ? j : {} } : x))
                  );
                  setCaseJsonErr((prevErr) => {
                    const out = { ...prevErr };
                    delete out[idx];
                    return out;
                  });
                } catch {
                  setCaseJsonErr((prevErr) => ({ ...prevErr, [idx]: "Invalid JSON (not saved yet)." }));
                }
              }}
              disabled={busy}
              rows={6}
              style={{ width: "100%", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace" }}
            />
            <div className="small" style={{ marginTop: 6, opacity: 0.75 }}>
              Tip: invalid JSON is allowed while editing; it will block “Run Batch” until fixed.
            </div>
            {caseJsonErr[idx] ? (
              <div className="small" style={{ marginTop: 6, color: "crimson" }}>
                {caseJsonErr[idx]}
              </div>
            ) : null}
          </div>
        ))}

        <div className="row" style={{ marginTop: 10 }}>
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setCases((prev) => {
                const next = [...prev, { label: `case${prev.length}`, overrides: {} }];
                return next;
              });
              setCaseOverridesText((prev) => {
                const idx = cases.length;
                return { ...prev, [idx]: JSON.stringify({}, null, 2) };
              });
            }}
          >
            Add case
          </button>
        </div>
      </div>

      <div className="row" style={{ marginTop: 10, alignItems: "center", gap: 12 }}>
        <button onClick={onRunBatch} disabled={!phyId || busy || !selectedPolicies.length || !seeds.length || Object.keys(caseJsonErr).length > 0}>
          {busy ? "Generating…" : "Create Study (creates ana-*)"}
        </button>
        <label className="small" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={autoOpenGraphic}
            onChange={(e) => setAutoOpenGraphic(e.target.checked)}
            disabled={busy}
          />
          Auto-open Graphic after run
        </label>

        <label className="small" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={autoOpenRaw}
            onChange={(e) => setAutoOpenRaw(e.target.checked)}
            disabled={busy}
          />
          Also open Raw in new tab
        </label>

        {busy ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              aria-label="Loading"
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                border: "3px solid rgba(0,0,0,0.15)",
                borderTopColor: "rgba(0,0,0,0.6)",
                animation: "spin 0.9s linear infinite",
              }}
            />
            <span className="small">{status || "Running…"}</span>
          </div>
        ) : createdStudy ? (
          <span className="small">
            Study: <b>{createdStudy}</b>{" "}
            <a className="small" href={`/analysis/graphic?id=${createdStudy}`} style={{ marginLeft: 10 }}>
              Open Analysis · Graphic →
            </a>
            <a className="small" href={`/analysis/raw?id=${createdStudy}`} style={{ marginLeft: 10 }}>
              Open Analysis · Raw →
            </a>
            <a className="small" href={apiUrl(`/analysis/${createdStudy}/table.csv`)} style={{ marginLeft: 10 }} target="_blank" rel="noreferrer">
              Download CSV →
            </a>
          </span>
        ) : status ? (
          <span className="small">{status}</span>
        ) : null}
      </div>

      {!busy ? (
        <div
          className="card"
          style={{
            marginTop: 10,
            border: mainStudy ? "1px solid rgba(0,0,0,0.08)" : "1px solid #f2d38a",
            background: mainStudy ? "rgba(0,0,0,0.02)" : "rgba(242, 211, 138, 0.12)",
          }}
        >
          <h2 style={{ marginTop: 0, fontSize: 16 }}>Pre-run summary</h2>
          <div className="small" style={{ lineHeight: 1.6 }}>
            <div>
              physical run: <b>{phyId || "—"}</b>
            </div>
            <div>
              study family: <b>{studyFamily}</b> · axis: <b>{comparisonAxis}</b> · tier: <b>{comparisonTier}</b>
            </div>
            <div>
              preset: <b>{selectedPresetMeta?.label || "custom / manual cases"}</b>
            </div>
            <div>
              study preset: <b>{selectedStudyPreset?.label || "custom / manual study intent"}</b>
            </div>
            <div>
              base manifest: <span title={baseManifestSummary}><b>{baseManifestSummary}</b></span>
            </div>
            <div>
              cases: <b>{cases.length}</b> · seeds: <b>{seeds.length}</b> · policies: <b>{selectedPolicies.length}</b> · estimated runs: <b>{runCountEstimate}</b>
            </div>
          </div>
        </div>
      ) : null}

      {busy ? (
        <div style={{ marginTop: 10 }}>
          <div style={{ height: 8, borderRadius: 999, background: "rgba(0,0,0,0.08)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: "40%", borderRadius: 999, background: "rgba(0,0,0,0.35)", animation: "bar 1.1s ease-in-out infinite" }} />
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="small" style={{ marginTop: 10, color: "#b00020" }}>
          {error}
        </div>
      ) : null}

      <style jsx>{`
        @media (max-width: 980px) {
          .row {
            flex-wrap: wrap;
          }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bar {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}