//frontend/app/operational/designer/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { apiUrl, getJSON, postJSON } from "@/lib/api";
import { RunPicker } from "@/components/RunPicker";

type ListRes = { ids: string[] };
type CreateRes = { opr_id: string };
type OkRes = { ok: boolean; opr_id: string };

type RunSummaryRes = {
  ttfd?: number | null;
  mean_entropy_auc?: number | null;
  coverage_auc?: number | null;
  movement_total_mean_l1?: number | null;
  moves_per_step_mean?: number | null;
  moved_frac_mean?: number | null;
  k_update_proxy?: number | null;
  mdc_info_regime?: string | null;
  driver_info_kind?: string | null;
  driver_info_true_kind?: string | null;
  driver_info_mean?: number | null;
  driver_info_true_mean?: number | null;
  residual_info_mean?: number | null;
  residual_cov_mean?: number | null;
  residual_info_pos_frac?: number | null;
  residual_cov_pos_frac?: number | null;
  residual_info_in_band_frac?: number | null;
  residual_cov_in_band_frac?: number | null;
  eps_ref?: number | null;
  eps_ref_eff_info?: number | null;
  eps_ref_eff_cov?: number | null;
  usefulness_proto_enabled?: boolean;
  usefulness_regime_state_last?: number | null;
  usefulness_regime_state_exploit_frac?: number | null;
  usefulness_regime_state_recover_frac?: number | null;
  usefulness_regime_state_caution_frac?: number | null;
  usefulness_trigger_recover_hits?: number | null;
  usefulness_trigger_caution_hits?: number | null;
  usefulness_trigger_recover_from_caution_hits?: number | null;
  usefulness_trigger_exploit_hits?: number | null;
  regime_enabled?: boolean;
  regime_mode?: string | null;
  regime_utilization_mean?: number | null;
  regime_strict_drift_proxy_mean?: number | null;
  regime_local_drift_rate_mean?: number | null;
  regime_cumulative_exposure_final?: number | null;
  regime_advisory_downshift_trigger_hits?: number | null;
  regime_advisory_switch_to_certified_trigger_hits?: number | null;
  regime_advisory_recovery_trigger_hits?: number | null;
  regime_last_state?: number | null;
  regime_last_certified_stage_id?: string | null;
  regime_last_opportunistic_level_id?: string | null;
  regime_active_enabled?: boolean;
  regime_active_transition_count?: number | null;
  regime_active_last_state?: number | null;
  regime_active_last_certified_stage_id?: string | null;
  regime_active_last_opportunistic_level_id?: string | null;
  regime_effective_eta_mean?: number | null;
  regime_effective_move_budget_cells_mean?: number | null;
  regime_active_state_nominal_frac?: number | null;
  regime_active_state_downshift_frac?: number | null;
  regime_active_state_certified_frac?: number | null;
  debug_active_downshift_support_score_mean?: number | null;
  debug_active_downshift_support_score_min?: number | null;
  debug_active_downshift_weak_support_hits?: number | null;
  debug_active_corruption_guard_hits?: number | null;
  debug_active_corruption_led_downshift_hits?: number | null;
  debug_corruption_guard_counter_max?: number | null;
};



type Policy =
  | "greedy"
  | "uncertainty"
  | "mdc_info"
  | "mdc_arrival"
  | "usefulness_proto"
  | "balance"
  | "rl"
  | "random_feasible";

type Mode = "static" | "dynamic";
type TieBreaking = "deterministic" | "stochastic";
type RegimeMode = "advisory" | "active";

type UsefulnessMiddleLabel = "recover" | "guarded";

type UsefulnessPolicyChoice =
  | "greedy"
  | "uncertainty"
  | "mdc_info"
  | "mdc_arrival";

type UsefulnessThresholds = {
  age_threshold: number;
  misleading_pos_frac_threshold: number;
  driver_info_threshold: number;
  arrivals_high_threshold: number;
  persistence_steps: number;
};

type UsefulnessExploitThresholds = {
  age_threshold: number;
  misleading_pos_frac_threshold: number;
  driver_info_recover_threshold: number;
  persistence_steps: number;
};

function makeUsefulnessThresholds(
  age_threshold: number,
  misleading_pos_frac_threshold: number,
  driver_info_threshold: number,
  arrivals_high_threshold: number,
  persistence_steps: number
): UsefulnessThresholds {
  return {
    age_threshold,
    misleading_pos_frac_threshold,
    driver_info_threshold,
    arrivals_high_threshold,
    persistence_steps,
  };
}

function makeUsefulnessExploitThresholds(
  age_threshold: number,
  misleading_pos_frac_threshold: number,
  driver_info_recover_threshold: number,
  persistence_steps: number
): UsefulnessExploitThresholds {
  return {
    age_threshold,
    misleading_pos_frac_threshold,
    driver_info_recover_threshold,
    persistence_steps,
  };
}

type HealthyUtilizationRange = {
  min: number;
  max: number;
};

type CertifiedStage = {
  stage_id: string;
  label: string;
  eta: number;
  expected_certified_rate: number;
  entropy_threshold: number;
  healthy_utilization_range: HealthyUtilizationRange;
};

type OpportunisticLevel = {
  level_id: string;
  label: string;
  eta_adjustment: number;
  motion_adjustment: number;
  healthy_utilization_target: number;
  notes: string;
};

type RegimeThresholds = {
  utilization_threshold: number;
  strict_drift_proxy_threshold: number;
  cumulative_exposure_threshold: number;
  local_drift_rate_threshold: number;
  persistence_steps: number;
  hysteresis_band: number;
};

function normalizeIdToken(x: string): string {
  return x.trim();
}

function validateOpportunisticLadder(ladder: OpportunisticLevel[]): string[] {
  const errs: string[] = [];
  const seen = new Set<string>();

  ladder.forEach((lvl, idx) => {
    const id = normalizeIdToken(lvl.level_id);
    if (!id) {
      errs.push(`Opportunistic ladder row ${idx + 1} has an empty level_id.`);
      return;
    }
    if (seen.has(id)) {
      errs.push(`Opportunistic ladder level_id "${id}" is duplicated.`);
    } else {
      seen.add(id);
    }
  });

  return errs;
}

function sanitizeOpportunisticLadder(ladder: OpportunisticLevel[]): OpportunisticLevel[] {
  return ladder.map((lvl) => ({
    ...lvl,
    level_id: normalizeIdToken(lvl.level_id),
    label: lvl.label.trim(),
    notes: lvl.notes.trim(),
  }));
}

function describeOpportunisticLadder(ladder: OpportunisticLevel[]): string {
  if (!ladder.length) return "none";
  return ladder
    .map((lvl) => `${lvl.level_id}:${lvl.motion_adjustment}/${lvl.eta_adjustment}`)
    .join(", ");
}

// Presets (Batch-style UX)
type PresetId =
  | ""
  | "baseline_random_feasible_dynamic_ideal"
  | "baseline_greedy_dynamic_ideal"
  | "usefulness_proto_healthy_probe"
  | "usefulness_proto_delay_probe"
  | "usefulness_proto_noise_probe"
  | "baseline_uncertainty_dynamic_ideal"
  | "usefulness_proto_diagnostic_ideal"
  | "mdc_info_reward_light_ideal"
  | "mdc_info_reward_strong_ideal"
  | "delay_moderate"
  | "delay_harsh"
  | "observation_channel_moderate"
  | "static_greedy_ideal"
  | "regime_advisory_balanced"
  | "regime_advisory_opportunistic"
  | "regime_advisory_certified"
  | "mdc_info_reward_light_move_high"
  | "observation_channel_harsh"
  | "regime_active_balanced"
  | "regime_active_opportunistic"
  | "regime_active_certified"
  | "regime_active_balanced_semantic_probe"
  | "regime_active_corruption_semantic_probe"
  | "regime_active_balanced_hysteresis_probe"
  | "regime_active_opportunistic_hysteresis_probe"
  | "regime_active_balanced_verify"
  | "regime_active_opportunistic_verify"
  | "regime_active_certified_verify";

function makeThresholds(
  utilization_threshold: number,
  strict_drift_proxy_threshold: number,
  persistence_steps: number,
  hysteresis_band: number,
  cumulative_exposure_threshold = 0,
  local_drift_rate_threshold = 0
): RegimeThresholds {
  return {
    utilization_threshold,
    strict_drift_proxy_threshold,
    cumulative_exposure_threshold,
    local_drift_rate_threshold,
    persistence_steps,
    hysteresis_band,
  };
}

function makeBalancedCertifiedStages(): CertifiedStage[] {
  return [
    {
      stage_id: "C0",
      label: "Stage 0 · strict band",
      eta: 0.10,
      expected_certified_rate: 1.6887,
      entropy_threshold: 51.68,
      healthy_utilization_range: { min: 0.80, max: 1.00 },
    },
    {
      stage_id: "C1",
      label: "Stage 1 · widened band",
      eta: 0.05,
      expected_certified_rate: 0.9219,
      entropy_threshold: 35.06,
      healthy_utilization_range: { min: 0.70, max: 1.00 },
    },
    {
      stage_id: "C2",
      label: "Stage 2 · widest certified band",
      eta: 0.02,
      expected_certified_rate: 0.3901,
      entropy_threshold: 21.87,
      healthy_utilization_range: { min: 0.60, max: 1.00 },
    },
  ];
}

function makeOpportunisticCertifiedStages(): CertifiedStage[] {
  return [
    {
      stage_id: "C0",
      label: "Stage 0 · strict band",
      eta: 0.10,
      expected_certified_rate: 1.6887,
      entropy_threshold: 51.68,
      healthy_utilization_range: { min: 0.92, max: 1.00 },
    },
    {
      stage_id: "C1",
      label: "Stage 1 · widened band",
      eta: 0.05,
      expected_certified_rate: 0.9219,
      entropy_threshold: 35.06,
      healthy_utilization_range: { min: 0.84, max: 1.00 },
    },
  ];
}

function makeCertifiedHeavyStages(): CertifiedStage[] {
  return [
    {
      stage_id: "C0",
      label: "Stage 0 · strict band",
      eta: 0.10,
      expected_certified_rate: 1.6887,
      entropy_threshold: 51.68,
      healthy_utilization_range: { min: 0.85, max: 1.00 },
    },
    {
      stage_id: "C1",
      label: "Stage 1 · widened band",
      eta: 0.08,
      expected_certified_rate: 1.3984,
      entropy_threshold: 45.60,
      healthy_utilization_range: { min: 0.80, max: 1.00 },
    },
    {
      stage_id: "C2",
      label: "Stage 2 · moderate certified widening",
      eta: 0.05,
      expected_certified_rate: 0.9219,
      entropy_threshold: 35.06,
      healthy_utilization_range: { min: 0.75, max: 1.00 },
    },
    {
      stage_id: "C3",
      label: "Stage 3 · widest certified band",
      eta: 0.02,
      expected_certified_rate: 0.3901,
      entropy_threshold: 21.87,
      healthy_utilization_range: { min: 0.65, max: 1.00 },
    },
  ];
}

function makeBalancedLadder(): OpportunisticLevel[] {
  return [
    {
      level_id: "L0",
      label: "Balanced nominal",
      eta_adjustment: 0.0,
      motion_adjustment: 0.0,
      healthy_utilization_target: 0.94,
      notes: "Default balanced opportunistic posture",
    },
    {
      level_id: "L1",
      label: "Balanced tempered",
      eta_adjustment: -0.01,
      motion_adjustment: -80.0,
      healthy_utilization_target: 0.86,
      notes: "First bounded downshift rung; mild movement reduction while retaining a balanced reading",
    },
    {
      level_id: "L2",
      label: "Balanced guarded",
      eta_adjustment: -0.02,
      motion_adjustment: -150.0,
      healthy_utilization_target: 0.76,
      notes: "Clearer guarded balanced posture before certified behavior becomes relevant",
    },
    {
      level_id: "L3",
      label: "Balanced deep-guarded",
      eta_adjustment: -0.03,
      motion_adjustment: -220.0,
      healthy_utilization_target: 0.68,
      notes: "Last balanced rung; still not a certified posture, but visibly more guarded than nominal",
    },
  ];
}

function makeCorruptionLadder(): OpportunisticLevel[] {
  return [
    {
      level_id: "L0",
      label: "Corruption nominal",
      eta_adjustment: 0.0,
      motion_adjustment: 0.0,
      healthy_utilization_target: 0.92,
      notes: "Nominal corruption-sensitive posture",
    },
    {
      level_id: "L1",
      label: "Corruption guarded",
      eta_adjustment: -0.01,
      motion_adjustment: -60.0,
      healthy_utilization_target: 0.84,
      notes: "First corruption-sensitive guarded rung under mixed concern",
    },
    {
      level_id: "L2",
      label: "Corruption defensive",
      eta_adjustment: -0.03,
      motion_adjustment: -140.0,
      healthy_utilization_target: 0.74,
      notes: "More defensive corruption-sensitive posture before certified behavior becomes relevant",
    },
  ];
}

function makeOpportunisticLadder(): OpportunisticLevel[] {
  return [
    {
      level_id: "L0",
      label: "Aggressive opportunistic",
      eta_adjustment: 0.0,
      motion_adjustment: 250.0,
      healthy_utilization_target: 0.85,
      notes: "Highest-speed regime",
    },
    {
      level_id: "L1",
      label: "Nominal opportunistic",
      eta_adjustment: -0.01,
      motion_adjustment: 0.0,
      healthy_utilization_target: 0.75,
      notes: "Moderate speed after first downshift",
    },
    {
      level_id: "L2",
      label: "Intermediate guarded opportunistic",
      eta_adjustment: -0.01,
      motion_adjustment: -150.0,
      healthy_utilization_target: 0.68,
      notes:
        "Intermediate guarded rung that remains visibly opportunistic before certified switch",
    },
    {
      level_id: "L3",
      label: "Guarded opportunistic",
      eta_adjustment: -0.04,
      motion_adjustment: -220.0,
      healthy_utilization_target: 0.62,
      notes: "Last opportunistic rung before certified switch, still mobile enough to read distinctly from certified",
    },
  ];
}

function makeCertifiedLadder(): OpportunisticLevel[] {
  return [
    {
      level_id: "L0",
      label: "Guarded opportunistic",
      eta_adjustment: -0.02,
      motion_adjustment: -250.0,
      healthy_utilization_target: 0.90,
      notes: "Short opportunistic runway before certified descent",
    },
  ];
}

export default function OperationalDesignerPage() {

  // O1: select physical run directly
  const [phyIds, setPhyIds] = useState<string[]>([]);
  const [phyId, setPhyId] = useState("");
  const [executionWindowEnabled, setExecutionWindowEnabled] = useState(false);
  const [executionWindowStartStep, setExecutionWindowStartStep] = useState(0);
  const [executionWindowEndStepExclusive, setExecutionWindowEndStepExclusive] = useState("");

  // Presets (Batch-style UX)
  const [presetId, setPresetId] = useState<PresetId>("");

  const [policy, setPolicy] = useState<Policy>("greedy");
  const [mode, setMode] = useState<Mode>("dynamic");
  const [tieBreaking, setTieBreaking] = useState<TieBreaking>("deterministic");

  const [n, setN] = useState(20);
  const [radiusM, setRadiusM] = useState(250);
  const [moveM, setMoveM] = useState(500);
  const [maxMovesPerStep, setMaxMovesPerStep] = useState(0);

  // Default: prevent sensor "blob" behavior by encouraging footprint-scale spacing.
  const [minSepM, setMinSepM] = useState(250);
  // Track whether user manually changed minSep; if not, keep it tied to radius.
  const [minSepTouched, setMinSepTouched] = useState(false);
  const [bsR, setBsR] = useState(50);
  const [bsC, setBsC] = useState(50);

  const [created, setCreated] = useState("");
  
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [err, setErr] = useState("");
  const [runSummaryData, setRunSummaryData] = useState<RunSummaryRes | null>(null);


  // Observation-channel settings that affect what eventually arrives to the belief update
  const [noiseLevel, setNoiseLevel] = useState(0.1);
  const [delaySteps, setDelaySteps] = useState(1);
  const [lossProb, setLossProb] = useState(0.05);

  // O1 epistemic settings
  const [o1Enabled, setO1Enabled] = useState(true);
  const [seed, setSeed] = useState(0);
  const [priorP, setPriorP] = useState(0.02);
  const [alphaPos, setAlphaPos] = useState(0.35);
  const [alphaNeg, setAlphaNeg] = useState(0.15);
  const [storeEpiTrace, setStoreEpiTrace] = useState(true);
  const [frontBandCells, setFrontBandCells] = useState(1);
  const [cInfo, setCInfo] = useState(1.0);
  const [cCov, setCCov] = useState(1.0);
  const [epsRef, setEpsRef] = useState(0.0);
  const [showRegimeAdvanced, setShowRegimeAdvanced] = useState(false);
  const [showUsefulnessAdvanced, setShowUsefulnessAdvanced] = useState(false);

  // Uncertainty policy parameters
  const [uncertaintyDecay, setUncertaintyDecay] = useState(0.985);
  const [uncertaintyGain, setUncertaintyGain] = useState(0.35);
  const [uncertaintyGamma, setUncertaintyGamma] = useState(6.0);
  const [uncertaintyBeta, setUncertaintyBeta] = useState(2.0);
  const [uncertaintyLambda, setUncertaintyLambda] = useState(0.15);


  // Regime management
  const [regimeEnabled, setRegimeEnabled] = useState(false);
  const [regimeMode, setRegimeMode] = useState<RegimeMode>("advisory");
  const [useUtilization, setUseUtilization] = useState(true);
  const [useStrictDriftProxy, setUseStrictDriftProxy] = useState(true);
  const [useLocalDriftRate, setUseLocalDriftRate] = useState(true);
  const [useCumulativeExposure, setUseCumulativeExposure] = useState(true);
  const [useTriggerBools, setUseTriggerBools] = useState(true);
  const [downshiftThresholds, setDownshiftThresholds] = useState<RegimeThresholds>(
    makeThresholds(0.75, 0.80, 3, 0.05)
  );
  const [switchToCertifiedThresholds, setSwitchToCertifiedThresholds] = useState<RegimeThresholds>(
    makeThresholds(0.50, 0.50, 4, 0.05)
  );
  const [recoveryThresholds, setRecoveryThresholds] = useState<RegimeThresholds>(
    makeThresholds(0.85, 1.00, 4, 0.05)
  );
  const [opportunisticLadder, setOpportunisticLadder] = useState<OpportunisticLevel[]>(makeBalancedLadder());
  const [certifiedStages, setCertifiedStages] = useState<CertifiedStage[]>(makeBalancedCertifiedStages());
  const [storeRegimeStepTrace, setStoreRegimeStepTrace] = useState(true);
  const [storeTriggerComponents, setStoreTriggerComponents] = useState(true);
  const [storeTransitionDetails, setStoreTransitionDetails] = useState(true);

  // Usefulness regime (Subgoal E)
  const [usefulnessRegimeEnabled, setUsefulnessRegimeEnabled] = useState(false);
  const [usefulnessMiddleLabel, setUsefulnessMiddleLabel] = useState<UsefulnessMiddleLabel>("recover");
  const [usefulnessExploitPolicy, setUsefulnessExploitPolicy] = useState<UsefulnessPolicyChoice>("greedy");
  const [usefulnessRecoverPolicy, setUsefulnessRecoverPolicy] = useState<UsefulnessPolicyChoice>("uncertainty");
  const [usefulnessCautionPolicy, setUsefulnessCautionPolicy] = useState<UsefulnessPolicyChoice>("mdc_info");
  const [usefulnessRecoverEntry, setUsefulnessRecoverEntry] = useState<UsefulnessThresholds>(
    makeUsefulnessThresholds(1.0, 0.15, 5.0e-4, 0.80, 2)
  );
  const [usefulnessCautionEntry, setUsefulnessCautionEntry] = useState<UsefulnessThresholds>(
    makeUsefulnessThresholds(2.0, 0.30, 2.0e-4, 0.80, 3)
  );
  const [usefulnessRecoverExit, setUsefulnessRecoverExit] = useState<UsefulnessExploitThresholds>(
    makeUsefulnessExploitThresholds(1.0, 0.20, 1.0e-5, 2)
  );
  const [usefulnessExploitEntry, setUsefulnessExploitEntry] = useState<UsefulnessExploitThresholds>(
    makeUsefulnessExploitThresholds(0.5, 0.10, 1.0e-5, 3)
  );
 

  // Must be defined AFTER mode/policy state exists (fixes "Cannot access 'mode' before initialization")
  const isMdcPolicy = (p: Policy) => p === "mdc_info" || p === "mdc_arrival";
  const mdcAllowed = mode === "dynamic";

  function regimeSignalProfileLabel() {
    if (!regimeEnabled) return "off";
    const enabled: string[] = [];
    if (useUtilization) enabled.push("u");
    if (useStrictDriftProxy) enabled.push("strict");
    if (useLocalDriftRate) enabled.push("local");
    if (useCumulativeExposure) enabled.push("exposure");
    if (!useTriggerBools) enabled.push("trigger_bools=off");
    return enabled.length ? enabled.join("+") : "none";
  }

  function thresholdTripletLabel(name: string, x: RegimeThresholds): string {
    return `${name}[u=${x.utilization_threshold.toFixed(2)}, strict=${x.strict_drift_proxy_threshold.toFixed(2)}, p=${x.persistence_steps}, h=${x.hysteresis_band.toFixed(2)}]`;
  }

  function setReducedActiveVerifySignals() {
    setUseUtilization(true);
    setUseStrictDriftProxy(true);
    setUseLocalDriftRate(false);
    setUseCumulativeExposure(false);
    setUseTriggerBools(true);
  }

  // Batch-style presets: populate fields, but do not auto-run.
  function applyPreset(id: PresetId) {
    if (!id) return;

    // Clear stale outputs when the configuration changes materially.
    setCreated("");
    setRunSummaryData(null);
    setStatus("");
    setErr("");

    const setIdealObservationChannel = () => {
      setNoiseLevel(0.0);
      setDelaySteps(0);
      setLossProb(0.0);
    };

    const setModerateObservationChannel = () => {
      setNoiseLevel(0.1);
      setDelaySteps(1);
      setLossProb(0.05);
    };

    const setHarshObservationChannel = () => {
      setNoiseLevel(0.2);
      setDelaySteps(4);
      setLossProb(0.3);
    };

    const setCorruptionProbeChannel = () => {
      setNoiseLevel(0.25);
      setDelaySteps(0);
      setLossProb(0.0);
    };

    const setDelayModerateChannel = () => {
      // Delay-focused diagnostic:
      // keep noise/loss ideal so delay is the main degrading factor
      setNoiseLevel(0.0);
      setDelaySteps(2);
      setLossProb(0.0);
    };

    const setDelayHarshChannel = () => {
      // Delay-focused diagnostic:
      // harsher delay ladder point with clean channel otherwise
      setNoiseLevel(0.0);
      setDelaySteps(6);
      setLossProb(0.0);
    };

    const setCoreDefaults = () => {
      setTieBreaking("deterministic");
      setN(20);
      setRadiusM(250);
      setMoveM(500);
      setMaxMovesPerStep(0);
      setBsR(50);
      setBsC(50);

      // keep minSep synced to radius by default
      setMinSepTouched(false);
      setMinSepM(250);

      // O1 defaults
      setO1Enabled(true);
      setSeed(0);
      setPriorP(0.02);
      setAlphaPos(0.35);
      setAlphaNeg(0.15);
      setStoreEpiTrace(true);
      setFrontBandCells(1);
      setCCov(1.0);
      setEpsRef(0.0);

      // canonical uncertainty defaults
      setUncertaintyDecay(0.985);
      setUncertaintyGain(0.35);
      setUncertaintyGamma(6.0);
      setUncertaintyBeta(2.0);
      setUncertaintyLambda(0.15);
    };

    const setRegimeFamilyDefaults = (family: "balanced" | "opportunistic" | "certified", modeIn: RegimeMode) => {
      setRegimeEnabled(true);
      setRegimeMode(modeIn);
      setUseUtilization(true);
      setUseStrictDriftProxy(true);
      setUseLocalDriftRate(true);
      setUseCumulativeExposure(true);
      setUseTriggerBools(true);
      setStoreRegimeStepTrace(true);
      setStoreTriggerComponents(true);
      setStoreTransitionDetails(true);

      if (family === "balanced") {
        setCertifiedStages(makeBalancedCertifiedStages());
        setOpportunisticLadder(makeBalancedLadder());
        // v0.4 Subgoal 02:
        // Give balanced its own readable multi-rung structure.
        // Keep certification meaningfully harder than downshift so
        // balanced active runs have room to occupy non-nominal states
        // without collapsing immediately into certified behavior.
        setDownshiftThresholds(makeThresholds(0.86, 0.22, 3, 0.05));
        setSwitchToCertifiedThresholds(makeThresholds(0.60, 0.60, 5, 0.05));
        setRecoveryThresholds(makeThresholds(0.82, 0.28, 3, 0.05));
      } else if (family === "opportunistic") {
        setCertifiedStages(makeOpportunisticCertifiedStages());
        setOpportunisticLadder(makeOpportunisticLadder());
        // Opportunistic preset:
        // - downshift early so weakening support is visible before certification
        // - make certified entry substantially harder so certification becomes a rarer fallback
        // - let recovery / leave-certified happen sooner so certified does not dominate occupancy
        // - keep guarded opportunistic levels distinct from certified rather than near-certified
        setDownshiftThresholds(makeThresholds(0.84, 0.80, 2, 0.06));
        setSwitchToCertifiedThresholds(makeThresholds(0.16, 0.16, 28, 0.10));
        setRecoveryThresholds(makeThresholds(0.78, 0.74, 2, 0.03));
      } else {
        setCertifiedStages(makeCertifiedHeavyStages());
        setOpportunisticLadder(makeCertifiedLadder());
        setDownshiftThresholds(makeThresholds(0.90, 0.95, 3, 0.05));
        setSwitchToCertifiedThresholds(makeThresholds(0.82, 0.95, 3, 0.05));
        setRecoveryThresholds(makeThresholds(0.95, 1.10, 6, 0.05));
      }
    };

    const setHysteresisProbeDefaults = (family: "balanced" | "opportunistic") => {
      setRegimeFamilyDefaults(family, "active");

      // Probe presets are diagnostic families. Their purpose is not to be
      // scientifically "best", but to keep the live signal closer to the
      // decision neighborhood so hysteresis / persistence / cooldown become
      // visibly testable.
      setUseUtilization(true);
      setUseStrictDriftProxy(true);
      setUseLocalDriftRate(false);
      setUseCumulativeExposure(false);
      setUseTriggerBools(true);

      if (family === "balanced") {
        setModerateObservationChannel();
        setCInfo(0.1);
        setMoveM(500);
        setDownshiftThresholds(makeThresholds(0.72, 0.50, 2, 0.10));
        setSwitchToCertifiedThresholds(makeThresholds(0.58, 0.42, 3, 0.10));
        setRecoveryThresholds(makeThresholds(0.80, 0.55, 2, 0.10));
      } else {
        setIdealObservationChannel();
        setCInfo(0.1);
        setMoveM(1500);
        setDownshiftThresholds(makeThresholds(0.62, 0.48, 2, 0.12));
        setSwitchToCertifiedThresholds(makeThresholds(0.18, 0.16, 14, 0.12));
        setRecoveryThresholds(makeThresholds(0.56, 0.34, 2, 0.08));
      }
    };

    const setSemanticProbeDefaults = (family: "balanced") => {
      setRegimeFamilyDefaults(family, "active");

      // Semantic probe presets are meant for recovery-vs-caution reading,
      // not permissive verify-style exercise. Keep the threshold neighborhood
      // mild, but leave cumulative exposure enabled so backend heuristic
      // verify-style stays false.
      setUseUtilization(true);
      setUseStrictDriftProxy(true);
      // Re-enable local drift on the degradation side so corruption-sensitive
      // trouble has one more path into downshift / switch behavior, while the
      // backend recovery refinement still prevents local_drift_rate from
      // counting as positive recovery evidence.
      setUseLocalDriftRate(true);
      setUseCumulativeExposure(true);
      setUseTriggerBools(true);

      setModerateObservationChannel();
      setCInfo(0.1);
      setMoveM(800);
      // Subgoal 02 balanced structural probe:
      // - preserve mixed support/downshift reading
      // - give balanced more room to occupy intermediate active levels
      // - make certification harder so balanced does not read as certified-heavy
      setDownshiftThresholds({
        ...makeThresholds(0.70, 0.56, 2, 0.10),
        local_drift_rate_threshold: 2.0e-5,
      });
      setSwitchToCertifiedThresholds({
        ...makeThresholds(0.34, 0.28, 6, 0.10),
        local_drift_rate_threshold: 3.0e-5,
      });
      setRecoveryThresholds(makeThresholds(0.78, 0.42, 2, 0.10));
    };

    const setCorruptionSemanticProbeDefaults = () => {
      setRegimeFamilyDefaults("balanced", "active");
      setOpportunisticLadder(makeCorruptionLadder());

      // Subgoal 02 corruption structural probe:
      // keep corruption sensitivity, but stop reusing the balanced ladder.
      // Give corruption its own guarded / defensive posture structure.
      setUseUtilization(true);
      setUseStrictDriftProxy(true);
      setUseLocalDriftRate(true);
      setUseCumulativeExposure(false);
      setUseTriggerBools(true);

      setCorruptionProbeChannel();
      setCInfo(0.1);
      setMoveM(700);

      setDownshiftThresholds({
        ...makeThresholds(0.74, 0.56, 2, 0.10),
        local_drift_rate_threshold: 2.0e-5,
      });
      setSwitchToCertifiedThresholds({
        ...makeThresholds(0.28, 0.22, 7, 0.10),
        local_drift_rate_threshold: 3.0e-5,
      });
      setRecoveryThresholds(makeThresholds(0.82, 0.48, 2, 0.10));
    };

    const setRegimeFamilyVerifyDefaults = (
      family: "balanced" | "opportunistic" | "certified",
      modeIn: RegimeMode
    ) => {
      setRegimeFamilyDefaults(family, modeIn);
      setReducedActiveVerifySignals();
    };

    const setUsefulnessProbeDefaults = (
      channel: "healthy" | "delay" | "noise"
    ) => {
      setRegimeEnabled(false);
      setMode("dynamic");
      setPolicy("usefulness_proto");
      setCInfo(0.1);

      // Keep the compact usefulness layer visible and repeatable.
      // The richer manifest surface remains present for alignment,
      // but the live controller reading still comes from the compact path.
      setUsefulnessRegimeEnabled(true);
      setUsefulnessMiddleLabel("recover");
      setUsefulnessExploitPolicy("greedy");
      setUsefulnessRecoverPolicy("uncertainty");
      setUsefulnessCautionPolicy("mdc_info");
      setUsefulnessRecoverEntry(makeUsefulnessThresholds(1.0, 0.15, 5.0e-4, 0.80, 2));
      setUsefulnessCautionEntry(makeUsefulnessThresholds(2.0, 0.30, 2.0e-4, 0.80, 3));
      setUsefulnessRecoverExit(makeUsefulnessExploitThresholds(1.0, 0.20, 1.0e-5, 2));
      setUsefulnessExploitEntry(makeUsefulnessExploitThresholds(0.5, 0.10, 1.0e-5, 3));

      if (channel === "healthy") {
        setIdealObservationChannel();
      } else if (channel === "delay") {
        setNoiseLevel(0.0);
        setDelaySteps(4);
        setLossProb(0.0);
      } else {
        setNoiseLevel(0.25);
        setDelaySteps(0);
        setLossProb(0.0);
      }
    };
    setCoreDefaults();

    switch (id) {
      case "baseline_random_feasible_dynamic_ideal":
        setRegimeEnabled(false);
        setMode("dynamic");
        setPolicy("random_feasible");
        setIdealObservationChannel();
        setCInfo(1.0);
        return;
      case "baseline_greedy_dynamic_ideal":
        setRegimeEnabled(false);
        setMode("dynamic");
        setPolicy("greedy");
        setIdealObservationChannel();
        setCInfo(1.0);
        return;
      case "baseline_uncertainty_dynamic_ideal":
        setRegimeEnabled(false);
        setMode("dynamic");
        setPolicy("uncertainty");
        setIdealObservationChannel();
        setCInfo(1.0);
        return;
      case "usefulness_proto_healthy_probe":
        setUsefulnessProbeDefaults("healthy");
        return;
      case "usefulness_proto_delay_probe":
        setUsefulnessProbeDefaults("delay");
        return;
      case "usefulness_proto_noise_probe":
        setUsefulnessProbeDefaults("noise");
        return;
      case "usefulness_proto_diagnostic_ideal":
        setRegimeEnabled(false);
        setMode("dynamic");
        setPolicy("usefulness_proto");
        setIdealObservationChannel();
        setCInfo(0.1);
        setUsefulnessRegimeEnabled(true);
        setUsefulnessMiddleLabel("recover");
        setUsefulnessExploitPolicy("greedy");
        setUsefulnessRecoverPolicy("uncertainty");
        setUsefulnessCautionPolicy("mdc_info");
        setUsefulnessRecoverEntry(makeUsefulnessThresholds(1.0, 0.15, 5.0e-4, 0.80, 2));
        setUsefulnessCautionEntry(makeUsefulnessThresholds(2.0, 0.30, 2.0e-4, 0.80, 3));
        setUsefulnessRecoverExit(makeUsefulnessExploitThresholds(1.0, 0.20, 1.0e-5, 2));
        setUsefulnessExploitEntry(makeUsefulnessExploitThresholds(0.5, 0.10, 1.0e-5, 3));
        return;
      case "mdc_info_reward_light_ideal":
        setRegimeEnabled(false);
        setMode("dynamic");
        setPolicy("mdc_info");
        setIdealObservationChannel();
        // Light information-seeking
        setCInfo(0.1);
        return;
      case "mdc_info_reward_strong_ideal":
        setRegimeEnabled(false);
        setMode("dynamic");
        setPolicy("mdc_info");
        setIdealObservationChannel();
        // Stronger information-seeking
        setCInfo(0.6);
        return;
      case "delay_moderate":
        setRegimeEnabled(false);
        setMode("dynamic");
        setPolicy("mdc_info");
        setDelayModerateChannel();
        // match the light-info setting used in the delay batch work
        setCInfo(0.1);
        return;
      case "delay_harsh":
        setRegimeEnabled(false);
        setMode("dynamic");
        setPolicy("mdc_info");
        setDelayHarshChannel();
        // match the light-info setting used in the delay batch work
        setCInfo(0.1);
        return;
      case "mdc_info_reward_light_move_high":
        setRegimeEnabled(false);
        setMode("dynamic");
        setPolicy("mdc_info");
        setIdealObservationChannel();
        setCInfo(0.1);
        setMoveM(1500);
        return;
      case "observation_channel_moderate":
        setRegimeEnabled(false);
        setMode("dynamic");
        setPolicy("mdc_info");
        setModerateObservationChannel();
        setCInfo(0.1);
        return;
      case "observation_channel_harsh":
        setRegimeEnabled(false);
        setMode("dynamic");
        setPolicy("mdc_info");
        setHarshObservationChannel();
        setCInfo(0.1);
        return;
      case "static_greedy_ideal":
        setRegimeEnabled(false);
        setMode("static");
        setPolicy("greedy");
        setIdealObservationChannel();
        setCInfo(1.0);
        return;
      case "regime_advisory_balanced":
        setMode("dynamic");
        setPolicy("mdc_info");
        setModerateObservationChannel();
        setCInfo(0.1);
        setRegimeFamilyDefaults("balanced", "advisory");
        return;
      case "regime_advisory_opportunistic":
        setMode("dynamic");
        setPolicy("mdc_info");
        setIdealObservationChannel();
        setCInfo(0.1);
        setMoveM(1500);
        setRegimeFamilyDefaults("opportunistic", "advisory");
        return;
      case "regime_advisory_certified":
        setMode("dynamic");
        setPolicy("mdc_info");
        setModerateObservationChannel();
        setCInfo(0.6);
        setRegimeFamilyDefaults("certified", "advisory");
        return;
      case "regime_active_balanced":
        setMode("dynamic");
        setPolicy("mdc_info");
        setModerateObservationChannel();
        setCInfo(0.1);
        setRegimeFamilyDefaults("balanced", "active");
        return;
      case "regime_active_opportunistic":
        setMode("dynamic");
        setPolicy("mdc_info");
        setIdealObservationChannel();
        setCInfo(0.1);
        setMoveM(1500);
        setRegimeFamilyDefaults("opportunistic", "active");
        return;
      case "regime_active_certified":
        setMode("dynamic");
        setPolicy("mdc_info");
        setModerateObservationChannel();
        setCInfo(0.6);
        setRegimeFamilyDefaults("certified", "active");
        return;
      case "regime_active_balanced_semantic_probe":
        setMode("dynamic");
        setPolicy("mdc_info");
        setSemanticProbeDefaults("balanced");
        return;
      case "regime_active_corruption_semantic_probe":
        setMode("dynamic");
        setPolicy("mdc_info");
        setCInfo(0.1);
        setCorruptionSemanticProbeDefaults();
        return;
      case "regime_active_balanced_hysteresis_probe":
        setMode("dynamic");
        setPolicy("mdc_info");
        setHysteresisProbeDefaults("balanced");
        return;
      case "regime_active_opportunistic_hysteresis_probe":
        setMode("dynamic");
        setPolicy("mdc_info");
        setHysteresisProbeDefaults("opportunistic");
        return;
      case "regime_active_balanced_verify":
        setMode("dynamic");
        setPolicy("mdc_info");
        setModerateObservationChannel();
        setCInfo(0.1);
        setRegimeFamilyVerifyDefaults("balanced", "active");
        return;
      case "regime_active_opportunistic_verify":
        setMode("dynamic");
        setPolicy("mdc_info");
        setIdealObservationChannel();
        setCInfo(0.1);
        setMoveM(1500);
        setRegimeFamilyVerifyDefaults("opportunistic", "active");
        return;
      case "regime_active_certified_verify":
        setMode("dynamic");
        setPolicy("mdc_info");
        setModerateObservationChannel();
        setCInfo(0.6);
        setRegimeFamilyVerifyDefaults("certified", "active");
        return;
      default:
        return;
    }
  }

  useEffect(() => {
    getJSON<ListRes>("/physical/list")
      .then((r) => setPhyIds((r.ids ?? []).slice().sort()))
      .catch((e) => {
        console.error(e);
        setErr(typeof (e as any)?.message === "string" ? (e as any).message : "Failed to load physical runs.");
      });
  }, []);

  // If the user hasn't manually set min separation, keep it aligned with radius.
  useEffect(() => {
    if (!minSepTouched) setMinSepM(radiusM);
  }, [radiusM, minSepTouched]);
  

  // Guard: MDC-live policies currently only make sense for dynamic mode (O1 controller).
  // If user switches mode to static while an MDC policy is selected, fall back to uncertainty.
  useEffect(() => {
    if (mode === "static" && isMdcPolicy(policy)) {
      setPolicy("uncertainty");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  async function createAndRun() {
    if (!phyId || busy) return;

    setErr("");
    setStatus("");
    setCreated("");
    setRunSummaryData(null);
    setBusy(true);

    try {
      setStatus("Creating manifest…");
      const manifest = buildOperationalManifest(policy);

      const { opr_id } = await postJSON<CreateRes>("/operational/manifest", manifest);
      setStatus("Running operational simulation (this may take a while)…");
      await postJSON<OkRes>("/operational/run", { id: opr_id });
      try {
        const s = await getJSON<RunSummaryRes>(`/metrics/${opr_id}/summary`);
        setRunSummaryData(s);
      } catch {
        setRunSummaryData(null);
      }
      setCreated(opr_id);
      setStatus("Done.");
    } catch (e: any) {
      console.error(e);
      setErr(typeof e?.message === "string" ? e.message : "Failed to create/run operational job.");
      setStatus("");
    } finally {
      setBusy(false);
    }
  }

  const activeRegimeInvalid =
    regimeEnabled &&
    regimeMode === "active" &&
    certifiedStages.length === 0;

  const advisoryRegimeSuspicious =
    regimeEnabled &&
    regimeMode === "advisory" &&
    certifiedStages.length === 0;

  const canSubmit =
    Boolean(phyId) &&
    !busy &&
    !activeRegimeInvalid;

  // Small UI hint: after the mdc_info sign fix, positive c_info rewards
  // information-rich candidate footprints while the controller still minimizes
  // a single score. k_update_proxy remains useful as a rough scale indicator,
  // but no longer defines a suppress/explore sign flip.
  const kUpdateProxy = 0.5 * (alphaPos + alphaNeg);
  const mdcInfoRegime =
    Math.abs(cInfo) <= 1e-12 ? "off" : cInfo < kUpdateProxy ? "light" : cInfo < 2 * kUpdateProxy ? "moderate" : "strong";
  const advisoryDownshiftHits =
    typeof runSummaryData?.regime_advisory_downshift_trigger_hits === "number"
      ? runSummaryData.regime_advisory_downshift_trigger_hits
      : null;

  const advisorySwitchHits =
    typeof runSummaryData?.regime_advisory_switch_to_certified_trigger_hits === "number"
      ? runSummaryData.regime_advisory_switch_to_certified_trigger_hits
      : null;

  const advisoryRecoveryHits =
    typeof runSummaryData?.regime_advisory_recovery_trigger_hits === "number"
      ? runSummaryData.regime_advisory_recovery_trigger_hits
      : null;

  const hasAdvisorySummary =
    Boolean(runSummaryData?.regime_enabled) &&
    (
      typeof runSummaryData?.regime_utilization_mean === "number" ||
      typeof runSummaryData?.regime_strict_drift_proxy_mean === "number" ||
      typeof runSummaryData?.regime_local_drift_rate_mean === "number" ||
      typeof runSummaryData?.regime_cumulative_exposure_final === "number" ||
      typeof advisoryDownshiftHits === "number" ||
      typeof advisorySwitchHits === "number" ||
      typeof advisoryRecoveryHits === "number"
    );

  const hasActiveSummary =
    Boolean(runSummaryData?.regime_active_enabled) &&
    (
      typeof runSummaryData?.regime_active_transition_count === "number" ||
      typeof runSummaryData?.regime_effective_eta_mean === "number" ||
      typeof runSummaryData?.regime_effective_move_budget_cells_mean === "number" ||
      typeof runSummaryData?.regime_active_state_nominal_frac === "number" ||
      typeof runSummaryData?.regime_active_state_downshift_frac === "number" ||
      typeof runSummaryData?.regime_active_state_certified_frac === "number"
    );

  const usefulnessStateLabel = (code: number | null | undefined) => {
    switch (Number(code)) {
      case 0:
        return "exploit";
      case 1:
        return "recover";
      case 2:
        return "caution";
      default:
        return "—";
    }
  };

  const hasUsefulnessSummary =
    Boolean(runSummaryData?.usefulness_proto_enabled) &&
    (
      typeof runSummaryData?.usefulness_regime_state_last === "number" ||
      typeof runSummaryData?.usefulness_regime_state_exploit_frac === "number" ||
      typeof runSummaryData?.usefulness_regime_state_recover_frac === "number" ||
      typeof runSummaryData?.usefulness_regime_state_caution_frac === "number"
    );

  const ladderValidationErrors = useMemo(
    () => validateOpportunisticLadder(opportunisticLadder),
    [opportunisticLadder]
  );
  const policyHelp: Record<Policy, { label: string; title: string; dynamicOnly?: boolean }> = {
    greedy: {
      label: "Greedy (belief) · greedy",
      title: "Per-cell score = belief. Placement/moves maximize belief map.",
    },
    uncertainty: {
      label: "Uncertainty (variance × novelty + entropy bonus) · uncertainty",
      title: "Per-cell score = posterior-variance / novelty shaping with entropy bonus. Placement/moves maximize the uncertainty score map.",
    },
    mdc_info: {
      label: "MDC-live (info driver) · mdc_info",
      title:
        "Dynamic MDC-style controller. Backend diagnostics now distinguish a legacy expected-entropy-drop proxy from a truthier delayed-aligned information driver.",
      dynamicOnly: true,
    },
    mdc_arrival: {
      label: "MDC-live (arrival proxy) · mdc_arrival",
      title:
        "Dynamic MDC-style controller using an arrival/budget-style residual interpretation.",
      dynamicOnly: true,
    },
    usefulness_proto: {
      label: "Usefulness prototype scaffold · usefulness_proto",
      title:
        "Experimental usefulness-aware controller scaffold. The live backend behavior currently comes primarily from a compact router-side usefulness prototype; the richer usefulness_regime manifest surface below is retained for alignment and future convergence, but is not yet the full authoritative controller interface.",
      dynamicOnly: true,
    },
    balance: {
      label: "Balance (belief × entropy) · balance",
      title: "Per-cell score = belief × entropy (simple exploit/explore blend).",
    },
    random_feasible: {
      label: "Random feasible (baseline) · random_feasible",
      title: "Random score map with separation constraints; useful as a baseline.",
    },
    rl: {
      label: "RL (stub) · rl",
      title: "Stub policy (currently behaves like balance).",
    },
  };
 

  function buildOperationalManifest(runPolicy: Policy) {
    const sanitizedLadder = sanitizeOpportunisticLadder(opportunisticLadder);
    const ladderErrors = validateOpportunisticLadder(sanitizedLadder);

    if (ladderErrors.length) {
      throw new Error(
        [
          "Regime opportunistic ladder is invalid:",
          ...ladderErrors.map((e) => `- ${e}`),
        ].join("\n")
      );
    }

    return {
      run_mode: "closed_loop",
      phy_id: phyId,
      execution_window: executionWindowEnabled
        ? {
            start_step: Math.max(0, executionWindowStartStep),
            end_step_exclusive:
              executionWindowEndStepExclusive.trim() === ""
                ? null
                : Math.max(1, parseInt(executionWindowEndStepExclusive, 10) || 1),
          }
        : null,
      impairments: {
        noise_level: noiseLevel,
        delay_steps: delaySteps,
        loss_prob: lossProb,
      },
      network: {
        policy: runPolicy,
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
        seed,
        prior_p: priorP,
        alpha_pos: alphaPos,
        alpha_neg: alphaNeg,
        store_epi_trace: storeEpiTrace,
        front_band_cells: frontBandCells,
        c_info: cInfo,
        c_cov: cCov,
        eps_ref: epsRef,
        uncertainty_decay: uncertaintyDecay,
        uncertainty_gain: uncertaintyGain,
        uncertainty_gamma: uncertaintyGamma,
        uncertainty_beta: uncertaintyBeta,
        uncertainty_lambda: uncertaintyLambda,
        obs_model: "detections_binary",
      },
      usefulness_regime: {
        enabled: usefulnessRegimeEnabled,
        middle_label: usefulnessMiddleLabel,
        policies: {
          exploit_policy: usefulnessExploitPolicy,
          recover_policy: usefulnessRecoverPolicy,
          caution_policy: usefulnessCautionPolicy,
        },
        transition_logic: {
          recover_entry: usefulnessRecoverEntry,
          caution_entry: usefulnessCautionEntry,
          recover_exit: usefulnessRecoverExit,
          exploit_entry: usefulnessExploitEntry,
        },
        logging: {
          store_step_trace: true,
          store_transition_counters: true,
        },
      },
      regime_management: {
        enabled: regimeEnabled,
        mode: regimeMode,
        signals: {
          use_utilization: useUtilization,
          use_strict_drift_proxy: useStrictDriftProxy,
          use_local_drift_rate: useLocalDriftRate,
          use_cumulative_exposure: useCumulativeExposure,
          use_trigger_bools: useTriggerBools,
        },
        transition_logic: {
          downshift_thresholds: downshiftThresholds,
          switch_to_certified_thresholds: switchToCertifiedThresholds,
          recovery_thresholds: recoveryThresholds,
        },
        opportunistic: {
          ladder: sanitizedLadder,
        },
        certified: {
          stages: certifiedStages,
        },
        logging: {
          store_step_trace: storeRegimeStepTrace,
          store_trigger_components: storeTriggerComponents,
          store_transition_details: storeTransitionDetails,
        },
      },
    };
  }

  // Small "what am I about to run?" line for screenshot-friendly presets/results.
  // Keep concise so it fits in one line on most screens.
  const presetLabel =
    presetId === "baseline_random_feasible_dynamic_ideal"
      ? "Baseline · random feasible · dynamic · ideal observation channel"
      : presetId === "usefulness_proto_healthy_probe"
      ? "Usefulness · healthy probe"
      : presetId === "usefulness_proto_delay_probe"
      ? "Usefulness · delay probe"
      : presetId === "usefulness_proto_noise_probe"
      ? "Usefulness · noise probe"
      : presetId === "baseline_greedy_dynamic_ideal"
      ? "Baseline · greedy belief · dynamic · ideal observation channel"
      : presetId === "baseline_uncertainty_dynamic_ideal"
      ? "Baseline · uncertainty entropy · dynamic · ideal observation channel"
      : presetId === "usefulness_proto_diagnostic_ideal"
      ? "Diagnostic · usefulness prototype · dynamic · ideal observation channel"
      : presetId === "mdc_info_reward_light_ideal"
      ? "MDC · info-driver · light reward · dynamic · ideal"
      : presetId === "mdc_info_reward_strong_ideal"
      ? "MDC · info-driver · stronger reward · dynamic · ideal"
      : presetId === "delay_moderate"
      ? "Diagnostic · delay-focused · moderate delay · clean channel"
      : presetId === "delay_harsh"
      ? "Diagnostic · delay-focused · harsh delay · clean channel"
      : presetId === "observation_channel_moderate"
      ? "MDC · info-driver · light reward · dynamic · moderate observation channel"
      : presetId === "observation_channel_harsh"
      ? "MDC · info-driver · light reward · dynamic · harsh observation channel"
      : presetId === "static_greedy_ideal"
      ? "Baseline · greedy belief · static · ideal observation channel"
      : presetId === "regime_advisory_balanced"
      ? "Advisory regime · balanced"
      : presetId === "regime_advisory_opportunistic"
      ? "Advisory regime · opportunistic"
      : presetId === "regime_advisory_certified"
      ? "Advisory regime · certified"
      : presetId === "regime_active_balanced"
      ? "Active regime · balanced"
      : presetId === "regime_active_opportunistic"
      ? "Active regime · opportunistic"
      : presetId === "mdc_info_reward_light_move_high"
      ? "MDC · info-driver · light reward · high-move · dynamic · ideal observation channel"
      : presetId === "regime_active_balanced_verify"
      ? "Active regime · balanced · verify"
      : presetId === "regime_active_opportunistic_verify"
      ? "Active regime · opportunistic · verify"
      : presetId === "regime_active_certified_verify"
      ? "Active regime · certified · verify"
      : presetId === "regime_active_certified"
      ? "Active regime · certified"
      : presetId === "regime_active_balanced_hysteresis_probe"
      ? "Active regime · balanced · hysteresis probe"
      : presetId === "regime_active_balanced_semantic_probe"
      ? "Active regime · balanced · structural semantic probe"
      : presetId === "regime_active_corruption_semantic_probe"
      ? "Active regime · corruption-sensitive · structural semantic probe"
      : presetId === "regime_active_opportunistic_hysteresis_probe"
      ? "Active regime · opportunistic · hysteresis probe"
      : "Custom";

  const runSummary = [
    `Preset: ${presetLabel}`,
    `policy=${policy}`,
    `mode=${mode}`,
    `tie=${tieBreaking}`,
    `N=${n}`,
    `r=${radiusM}m`,
    `move=${moveM}m`,
    maxMovesPerStep > 0 ? `cap=${maxMovesPerStep}` : "cap=∞",
    `sep=${minSepM}m`,
    `loss=${lossProb}`,
    `noise=${noiseLevel}`,
    `delay=${delaySteps}`,
    regimeEnabled ? `signals=${regimeSignalProfileLabel()}` : null,
    regimeEnabled ? thresholdTripletLabel("down", downshiftThresholds) : null,
    regimeEnabled ? thresholdTripletLabel("switch", switchToCertifiedThresholds) : null,
    regimeEnabled ? thresholdTripletLabel("recovery", recoveryThresholds) : null,
    regimeEnabled
      ? `regime:on ${regimeMode} stages=${certifiedStages.length} ladder=${opportunisticLadder.length} [${describeOpportunisticLadder(opportunisticLadder)}]`
      : "regime:off",
    o1Enabled
      ? `belief_update:on seed=${seed} c_info=${cInfo} c_cov=${cCov} eps_ref=${epsRef} k≈${kUpdateProxy.toFixed(3)}`
      : "belief_update:off",
    policy === "uncertainty"
      ? `uncertainty: decay=${uncertaintyDecay} gamma=${uncertaintyGamma} beta=${uncertaintyBeta} lambda=${uncertaintyLambda}`
      : null,
  ].filter(Boolean).join(" · ");

  const regimeHeadline = !regimeEnabled
    ? "Regime management disabled"
    : `${regimeMode === "active" ? "Active" : "Advisory"} · stages=${certifiedStages.length} · ladder=${opportunisticLadder.length}`;
  const embeddedBeliefSummary = o1Enabled
    ? [
        `belief update on`,
        `prior=${priorP}`,
        `seed=${seed}`,
        `α+=${alphaPos}`,
        `α-=${alphaNeg}`,
        `front_band=${frontBandCells}`,
        `store_trace=${storeEpiTrace ? "yes" : "no"}`,
      ].join(" · ")
    : "belief update off";
  const residualControlSummary = [
    `c_info=${cInfo}`,
    `c_cov=${cCov}`,
    `eps_ref=${epsRef}`,
    `k_update≈${kUpdateProxy.toFixed(3)}`,
    `mdc_info=${mdcInfoRegime}`,
  ].join(" · ");

  return (
    <div className="card">
      <h2>Operational Designer</h2>
      <div aria-hidden className="section-stripe section-stripe--operational" />

      {err ? (
        <div className="small" style={{ color: "crimson", marginBottom: 8 }}>
          {err}
        </div>
      ) : null}

      <RunPicker label="Physical Run" ids={phyIds} value={phyId} onChange={setPhyId} />
      <div className="card" style={{ marginTop: 10 }}>
        <h2 style={{ marginTop: 0 }}>Execution window</h2>
        <div className="small" style={{ opacity: 0.85, lineHeight: 1.4 }}>
          Optional bounded execution interval within the selected source physical run.
          This limits the local operational run horizon, but does not modify the source physical run itself.
        </div>

        <div className="row" style={{ marginTop: 10 }}>
          <label>enabled</label>
          <select
            value={executionWindowEnabled ? "yes" : "no"}
            onChange={(e) => setExecutionWindowEnabled(e.target.value === "yes")}
            disabled={busy}
          >
            <option value="no">no</option>
            <option value="yes">yes</option>
          </select>

          <label>start_step</label>
          <input
            type="number"
            min={0}
            value={executionWindowStartStep}
            onChange={(e) => setExecutionWindowStartStep(Math.max(0, parseInt(e.target.value, 10) || 0))}
            disabled={busy || !executionWindowEnabled}
          />

          <label>end_step_exclusive</label>
          <input
            type="number"
            min={1}
            value={executionWindowEndStepExclusive}
            onChange={(e) => setExecutionWindowEndStepExclusive(e.target.value)}
            disabled={busy || !executionWindowEnabled}
            placeholder="leave blank = source horizon end"
          />
        </div>
      </div>

      {/* Presets (Batch-style) */}
      <div className="card" style={{ marginTop: 10 }}>
        <h2 style={{ marginTop: 0 }}>Operational preset taxonomy</h2>
        <div className="small" style={{ opacity: 0.85, lineHeight: 1.4 }}>
          Presets populate fields but do not auto-run. Main comparison presets are the
          recommended scientific comparison set for reported operational results.
          This page is for <b>single-run authoring</b>: choose one operational configuration,
          generate one <b>opr-*</b> run, and inspect it in the Operational Visualizer.
        </div>
        <div className="small" style={{ opacity: 0.82, lineHeight: 1.4, marginTop: 6 }}>
          For multi-run comparison studies and <b>ana-*</b> artifacts, use <b>Analysis · Study Designer</b>.
          Diagnostic presets remain available for sanity checks, stress tests, and engineering verification.
          Regime management is one control overlay inside AWSRT, not the whole platform identity.
        </div>
        <div className="row" style={{ marginTop: 10, alignItems: "center" }}>
          <label>Taxonomy</label>
          <select
            value={presetId}
            onChange={(e) => setPresetId(e.target.value as PresetId)}
            disabled={busy}
            style={{ minWidth: 360 }}
            title="Pick a standardized regime, then Apply preset"
          >
            <option value="">(choose preset…)</option>
            <optgroup label="Main comparison · Baseline families">
              <option value="baseline_random_feasible_dynamic_ideal">Baseline · random feasible · dynamic · ideal observation channel</option>
              <option value="baseline_greedy_dynamic_ideal">Baseline · greedy belief · dynamic · ideal observation channel</option>
              <option value="baseline_uncertainty_dynamic_ideal">Baseline · uncertainty entropy · dynamic · ideal observation channel</option>
            </optgroup>
            <optgroup label="Diagnostic · Usefulness triad probes">
              <option value="usefulness_proto_healthy_probe">
                Usefulness · healthy probe
              </option>
              <option value="usefulness_proto_delay_probe">
                Usefulness · delay probe
              </option>
              <option value="usefulness_proto_noise_probe">
                Usefulness · noise probe
              </option>
            </optgroup>
            <optgroup label="Main comparison · MDC families">
              <option value="mdc_info_reward_light_ideal">MDC · info-driver · light reward · dynamic · ideal</option>
              <option value="mdc_info_reward_strong_ideal">MDC · info-driver · stronger reward · dynamic · ideal</option>
              <option value="observation_channel_moderate">MDC · info-driver · light reward · dynamic · moderate observation channel</option>
            </optgroup>
            <optgroup label="Main comparison · Active regime families">
              <option value="regime_active_balanced">Active regime · balanced</option>
              <option value="regime_active_opportunistic">Active regime · opportunistic</option>
              <option value="regime_active_certified">Active regime · certified</option>
              <option value="regime_active_balanced_semantic_probe">
                Active regime · balanced · semantic probe (mixed support/downshift)
              </option>
              <option value="regime_active_corruption_semantic_probe">
                Active regime · corruption-sensitive semantic probe
              </option>
            </optgroup>
            <optgroup label="Diagnostic · Hysteresis probe presets">
              <option value="regime_active_balanced_hysteresis_probe">
                Active regime · balanced · hysteresis probe
              </option>
              <option value="regime_active_opportunistic_hysteresis_probe">
                Active regime · opportunistic · hysteresis probe
              </option>
            </optgroup>
            <optgroup label="Diagnostic · Baseline checks">
              <option value="static_greedy_ideal">Baseline · greedy belief · static · ideal observation channel</option>
              <option value="usefulness_proto_diagnostic_ideal">
                Diagnostic · usefulness prototype · dynamic · ideal observation channel
              </option>
            </optgroup>
            <optgroup label="Diagnostic · MDC stress tests">
              <option value="delay_moderate">Diagnostic · delay-focused · moderate delay · clean channel</option>
              <option value="delay_harsh">Diagnostic · delay-focused · harsh delay · clean channel</option>
              <option value="mdc_info_reward_light_move_high">MDC · info-driver · light reward · high-move · dynamic · ideal observation channel</option>
              <option value="observation_channel_harsh">MDC · info-driver · light reward · dynamic · harsh observation channel</option>
            </optgroup>
            <optgroup label="Diagnostic · Advisory regime inspection">
              <option value="regime_advisory_balanced">Advisory regime · balanced</option>
              <option value="regime_advisory_opportunistic">Advisory regime · opportunistic</option>
              <option value="regime_advisory_certified">Advisory regime · certified</option>
            </optgroup>
            <optgroup label="Verify / diagnostic active presets">
              <option value="regime_active_balanced_verify">Active regime · balanced · verify (utilization + strict only)</option>
              <option value="regime_active_opportunistic_verify">Active regime · opportunistic · verify (utilization + strict only)</option>
              <option value="regime_active_certified_verify">Active regime · certified · verify (utilization + strict only)</option>
            </optgroup>
          </select>
          <button type="button" disabled={busy || !presetId} onClick={() => applyPreset(presetId)}>
            Apply preset
          </button>
          <div className="small" style={{ opacity: 0.75 }}>
            Applying a preset overwrites relevant fields (pattern matches Analysis Batch).
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 10 }}>
        <h2 style={{ marginTop: 0 }}>Operational deployment</h2>
        <div className="small" style={{ opacity: 0.85, lineHeight: 1.4 }}>
          Core policy, motion, geometry, and base-station settings used by the operational run.
          These are the main deployment controls that presets usually set first, before any regime-specific tuning.
        </div>

        <div className="row" style={{ marginTop: 10 }}>
          <label>Policy</label>
          <select
            value={policy}
            onChange={(e) => setPolicy(e.target.value as Policy)}
            disabled={busy}
            title={policyHelp[policy]?.title}
          >
            <option value="random_feasible" title={policyHelp.random_feasible.title}>
              {policyHelp.random_feasible.label}
            </option>
            <option value="greedy" title={policyHelp.greedy.title}>
              {policyHelp.greedy.label}
            </option>
            <option value="uncertainty" title={policyHelp.uncertainty.title}>
              {policyHelp.uncertainty.label}
            </option>

            <option value="mdc_info" title={policyHelp.mdc_info.title} disabled={!mdcAllowed}>
              {policyHelp.mdc_info.label}
              {!mdcAllowed ? " (dynamic only)" : ""}
            </option>
            <option value="mdc_arrival" title={policyHelp.mdc_arrival.title} disabled={!mdcAllowed}>
              {policyHelp.mdc_arrival.label}
              {!mdcAllowed ? " (dynamic only)" : ""}
            </option>
            <option value="usefulness_proto" title={policyHelp.usefulness_proto.title} disabled={!mdcAllowed}>
              {policyHelp.usefulness_proto.label}
              {!mdcAllowed ? " (dynamic only)" : ""}
            </option>
            <option value="balance" title={policyHelp.balance.title}>
              {policyHelp.balance.label}
            </option>
            <option value="rl" title={policyHelp.rl.title}>
              {policyHelp.rl.label}
            </option>
          </select>

          <label>Mode</label>
          <select value={mode} onChange={(e) => setMode(e.target.value as Mode)} disabled={busy}>
            <option value="dynamic">dynamic</option>
            <option value="static">static</option>
          </select>

          <label>Tie-break</label>
          <select value={tieBreaking} onChange={(e) => setTieBreaking(e.target.value as TieBreaking)} disabled={busy}>
            <option value="deterministic">deterministic</option>
            <option value="stochastic">stochastic</option>
          </select>
        </div>

        <div className="row">
          <label>Sensors</label>
          <input
            type="number"
            value={n}
            min={1}
            onChange={(e) => setN(parseInt(e.target.value, 10) || 1)}
            disabled={busy}
          />

          <label>Radius (m)</label>
          <input
            type="number"
            value={radiusM}
            min={1}
            onChange={(e) => setRadiusM(parseFloat(e.target.value) || 1)}
            disabled={busy}
          />

          <label>Move/step (m)</label>
          <input
            type="number"
            value={moveM}
            min={0}
            onChange={(e) => setMoveM(Math.max(0, parseFloat(e.target.value) || 0))}
            disabled={busy}
          />

          <label>Max moves/step</label>
          <input
            type="number"
            value={maxMovesPerStep}
            min={0}
            onChange={(e) => setMaxMovesPerStep(Math.max(0, parseInt(e.target.value, 10) || 0))}
            disabled={busy}
            title="0 = unlimited; if >0, cap the number of sensors allowed to move each step"
          />

          <label>Min separation (m)</label>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="number"
              value={minSepM}
              min={0}
              onChange={(e) => {
                setMinSepTouched(true);
                setMinSepM(Math.max(0, parseFloat(e.target.value) || 0));
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
        </div>

        <div className="row">
          <label>Base station r</label>
          <input
            type="number"
            value={bsR}
            onChange={(e) => setBsR(parseInt(e.target.value, 10) || 0)}
            disabled={busy}
          />
          <label>Base station c</label>
          <input
            type="number"
            value={bsC}
            onChange={(e) => setBsC(parseInt(e.target.value, 10) || 0)}
            disabled={busy}
          />
        </div>
      </div>
      {policy === "usefulness_proto" ? (
        <div className="card" style={{ marginTop: 10 }}>
          <h2 style={{ marginTop: 0 }}>Compact usefulness layer</h2>
          <div className="small" style={{ opacity: 0.85, lineHeight: 1.4 }}>
            This section corresponds to the live compact usefulness-facing path used by
            <b> usefulness_proto</b>. It is separate from the broader regime-management layer.
          </div>
          <div className="small" style={{ opacity: 0.82, lineHeight: 1.4, marginTop: 6 }}>
            Live compact reading:
            {" "}exploit → <b>greedy</b>,
            {" "}recover → <b>uncertainty</b>,
            {" "}caution → <b>mdc_info</b>.
            The current backend usefulness behavior is already <b>behaviorally active</b> through
            this compact path.
          </div>
          <div className="small" style={{ opacity: 0.8, lineHeight: 1.4, marginTop: 6 }}>
            The editable exploit / recover / caution manifest controls below are retained for alignment
            and future convergence, but should currently be treated as a
            <b> partially wired experimental surface</b>, not yet as the fully authoritative controller API.
          </div>
          <div className="row" style={{ marginTop: 10, alignItems: "center" }}>
            <div className="small" style={{ opacity: 0.82 }}>
              Status: <b>live compact usefulness path + experimental richer manifest surface</b>
            </div>
            <button
              type="button"
              onClick={() => setShowUsefulnessAdvanced((v) => !v)}
              disabled={busy}
              style={{ marginLeft: "auto" }}
            >
              {showUsefulnessAdvanced ? "Hide experimental manifest controls" : "Show experimental manifest controls"}
            </button>
          </div>
          <div className="small" style={{ marginTop: 10, opacity: 0.82, lineHeight: 1.4 }}>
            This section should be read in two layers:
            {" "}first, the <b>live compact usefulness triad</b>;
            {" "}second, the <b>experimental richer manifest surface</b> shown below.
          </div>

          <div className="row" style={{ marginTop: 10 }}>
            <label>enabled</label>
            <select
              value={usefulnessRegimeEnabled ? "yes" : "no"}
              onChange={(e) => setUsefulnessRegimeEnabled(e.target.value === "yes")}
              disabled={busy}
            >
              <option value="yes">yes</option>
              <option value="no">no</option>
            </select>

            <label>middle regime</label>
            <select
              value={usefulnessMiddleLabel}
              onChange={(e) => setUsefulnessMiddleLabel(e.target.value as UsefulnessMiddleLabel)}
              disabled={busy}
            >
              <option value="recover">recover</option>
              <option value="guarded">guarded</option>
            </select>
            <div className="small" style={{ opacity: 0.75, alignSelf: "center" }}>
              Experimental / partially wired
            </div>
          </div>

          <div className="small" style={{ marginTop: 8, opacity: 0.82, lineHeight: 1.4 }}>
            Experimental manifest summary:
            {" "}exploit=<b>{usefulnessExploitPolicy}</b>,
            {" "}{usefulnessMiddleLabel}=<b>{usefulnessRecoverPolicy}</b>,
            {" "}caution=<b>{usefulnessCautionPolicy}</b>.
            {" "}Recover entry p=<b>{usefulnessRecoverEntry.persistence_steps}</b>,
            {" "}caution entry p=<b>{usefulnessCautionEntry.persistence_steps}</b>,
            {" "}recover exit p=<b>{usefulnessRecoverExit.persistence_steps}</b>,
            {" "}exploit entry p=<b>{usefulnessExploitEntry.persistence_steps}</b>.
          </div>

          <div className="small" style={{ marginTop: 6, opacity: 0.78, lineHeight: 1.4 }}>
            This manifest summary is useful for alignment and future cleanup, but it should not yet be
            read as the primary operational truth of the current usefulness controller.
          </div>

          {showUsefulnessAdvanced ? (
            <>
              <div className="row">
                <label>exploit policy</label>
                <select
                  value={usefulnessExploitPolicy}
                  onChange={(e) => setUsefulnessExploitPolicy(e.target.value as UsefulnessPolicyChoice)}
                  disabled={busy}
                >
                  <option value="greedy">greedy</option>
                  <option value="uncertainty">uncertainty</option>
                  <option value="mdc_info">mdc_info</option>
                  <option value="mdc_arrival">mdc_arrival</option>
                </select>

                <label>{usefulnessMiddleLabel} policy</label>
                <select
                  value={usefulnessRecoverPolicy}
                  onChange={(e) => setUsefulnessRecoverPolicy(e.target.value as UsefulnessPolicyChoice)}
                  disabled={busy}
                >
                  <option value="greedy">greedy</option>
                  <option value="uncertainty">uncertainty</option>
                  <option value="mdc_info">mdc_info</option>
                  <option value="mdc_arrival">mdc_arrival</option>
                </select>

                <label>caution policy</label>
                <select
                  value={usefulnessCautionPolicy}
                  onChange={(e) => setUsefulnessCautionPolicy(e.target.value as UsefulnessPolicyChoice)}
                  disabled={busy}
                >
                  <option value="greedy">greedy</option>
                  <option value="uncertainty">uncertainty</option>
                  <option value="mdc_info">mdc_info</option>
                  <option value="mdc_arrival">mdc_arrival</option>
                </select>
              </div>

              {[
                ["Recover entry", usefulnessRecoverEntry, setUsefulnessRecoverEntry],
                ["Caution entry", usefulnessCautionEntry, setUsefulnessCautionEntry],
              ].map(([title, thresholds, setter]) => {
                const t = thresholds as UsefulnessThresholds;
                const setT = setter as (x: UsefulnessThresholds) => void;
                return (
                  <div key={String(title)} style={{ marginTop: 10 }}>
                    <div className="small" style={{ marginBottom: 6, opacity: 0.85 }}>
                      <b>{String(title)}</b>
                    </div>
                    <div className="row">
                      <label>age</label>
                      <input
                        type="number"
                        step="0.1"
                        value={t.age_threshold}
                        disabled={busy}
                        onChange={(e) => setT({ ...t, age_threshold: Math.max(0, parseFloat(e.target.value) || 0) })}
                      />
                      <label>misleading_pos_frac</label>
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        max={1}
                        value={t.misleading_pos_frac_threshold}
                        disabled={busy}
                        onChange={(e) =>
                          setT({ ...t, misleading_pos_frac_threshold: Math.max(0, Math.min(1, parseFloat(e.target.value) || 0)) })
                        }
                      />
                      <label>driver_info</label>
                      <input
                        type="number"
                        step="0.00001"
                        min={0}
                        value={t.driver_info_threshold}
                        disabled={busy}
                        onChange={(e) => setT({ ...t, driver_info_threshold: Math.max(0, parseFloat(e.target.value) || 0) })}
                      />
                      <label>arrivals_high</label>
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        max={1}
                        value={t.arrivals_high_threshold}
                        disabled={busy}
                        onChange={(e) =>
                          setT({ ...t, arrivals_high_threshold: Math.max(0, Math.min(1, parseFloat(e.target.value) || 0)) })
                        }
                      />
                      <label>persistence</label>
                      <input
                        type="number"
                        min={1}
                        value={t.persistence_steps}
                        disabled={busy}
                        onChange={(e) => setT({ ...t, persistence_steps: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                      />
                    </div>
                  </div>
                );
              })}

              {[
                ["Recover exit", usefulnessRecoverExit, setUsefulnessRecoverExit],
                ["Exploit entry", usefulnessExploitEntry, setUsefulnessExploitEntry],
              ].map(([title, thresholds, setter]) => {
                const t = thresholds as UsefulnessExploitThresholds;
                const setT = setter as (x: UsefulnessExploitThresholds) => void;
                return (
                  <div key={String(title)} style={{ marginTop: 10 }}>
                    <div className="small" style={{ marginBottom: 6, opacity: 0.85 }}>
                      <b>{String(title)}</b>
                    </div>
                    <div className="row">
                      <label>age</label>
                      <input
                        type="number"
                        step="0.1"
                        value={t.age_threshold}
                        disabled={busy}
                        onChange={(e) => setT({ ...t, age_threshold: Math.max(0, parseFloat(e.target.value) || 0) })}
                      />
                      <label>misleading_pos_frac</label>
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        max={1}
                        value={t.misleading_pos_frac_threshold}
                        disabled={busy}
                        onChange={(e) =>
                          setT({ ...t, misleading_pos_frac_threshold: Math.max(0, Math.min(1, parseFloat(e.target.value) || 0)) })
                        }
                      />
                      <label>driver_info_recover</label>
                      <input
                        type="number"
                        step="0.00001"
                        min={0}
                        value={t.driver_info_recover_threshold}
                        disabled={busy}
                        onChange={(e) =>
                          setT({ ...t, driver_info_recover_threshold: Math.max(0, parseFloat(e.target.value) || 0) })
                        }
                      />
                      <label>persistence</label>
                      <input
                        type="number"
                        min={1}
                        value={t.persistence_steps}
                        disabled={busy}
                        onChange={(e) => setT({ ...t, persistence_steps: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                      />
                    </div>
                  </div>
                );
              })}
            </>
          ) : null}
        </div>
      ) : null}

      <div className="card" style={{ marginTop: 10 }}>
        <h2 style={{ marginTop: 0 }}>Regime management overlay</h2>
        <div className="small" style={{ opacity: 0.85 }}>
          Advisory-first experimental scaffolding for utilization-aware regime management, staged certified descent, and opportunistic downshift ladders.
          This is one overlay/control family inside AWSRT; baseline, MDC, and diagnostic families remain first-class.
        </div>

        <div className="row" style={{ marginTop: 10, alignItems: "center" }}>
          <label>enabled</label>
          <select value={regimeEnabled ? "yes" : "no"} onChange={(e) => setRegimeEnabled(e.target.value === "yes")} disabled={busy}>
            <option value="yes">yes</option>
            <option value="no">no</option>
          </select>

          <label>mode</label>
          <select value={regimeMode} onChange={(e) => setRegimeMode(e.target.value as RegimeMode)} disabled={busy}>
            <option value="advisory">advisory</option>
            <option value="active">active</option>
          </select>

          <div className="small" style={{ opacity: 0.8, alignSelf: "center" }}>
            <b>{regimeHeadline}</b>
          </div>

          <button
            type="button"
            onClick={() => setShowRegimeAdvanced((v) => !v)}
            disabled={busy}
            style={{ marginLeft: "auto" }}
          >
            {showRegimeAdvanced ? "Hide advanced overlay controls" : "Show advanced overlay controls"}
          </button>
        </div>

        <div className="small" style={{ marginTop: 8, lineHeight: 1.4 }}>
          Summary: {regimeEnabled ? (
            <>
              current preset contributes <b>{certifiedStages.length}</b> certified stages and <b>{opportunisticLadder.length}</b> opportunistic ladder levels.
              Downshift uses u&lt;<b>{downshiftThresholds.utilization_threshold.toFixed(2)}</b>, switch-to-certified uses u&lt;<b>{switchToCertifiedThresholds.utilization_threshold.toFixed(2)}</b>,
              and recovery uses u&gt;<b>{recoveryThresholds.utilization_threshold.toFixed(2)}</b>.
            </>
          ) : (
            <>regime logic is omitted from the manifest.</>
          )}
        </div>
        {regimeEnabled ? (
          <div className="small" style={{ marginTop: 6, opacity: 0.82, lineHeight: 1.4 }}>
            Hysteresis separates enter/leave behavior near thresholds to reduce chatter.
            Larger hysteresis bands widen that separation; persistence still governs how long a trigger must hold before a realized active transition occurs.
          </div>
        ) : null}
        {regimeEnabled && presetId === "regime_active_opportunistic" ? (
          <div className="small" style={{ marginTop: 6, opacity: 0.82, lineHeight: 1.4 }}>
            Opportunistic active preset now treats certification as a rarer
            fallback. Certified entry is materially harder, guarded
            opportunistic levels remain more mobile, and recovery is easier so
            nominal/downshift occupancy can remain visible.
          </div>
        ) : null}
        {regimeEnabled && presetId === "regime_active_opportunistic_verify" ? (
          <div className="small" style={{ marginTop: 6, opacity: 0.82, lineHeight: 1.4 }}>
            Opportunistic verify preset is calibrated as a mechanism probe:
            switch-to-certified is intentionally much harder and recovery
            easier so leave-certified behavior can persist long enough to
            inspect cleanly.
          </div>
        ) : null}
        {regimeEnabled ? (
          <div className="small" style={{ marginTop: 6, opacity: 0.85 }}>
            Trigger signal profile: <b>{regimeSignalProfileLabel()}</b>
            {useUtilization && useStrictDriftProxy && !useLocalDriftRate && !useCumulativeExposure ? (
              <> · verification-style utilization+strict active test profile</>
            ) : null}
          </div>
        ) : null}
        {regimeEnabled && regimeMode === "active" ? (
          <div className="small" style={{ marginTop: 6, opacity: 0.82, lineHeight: 1.4 }}>
            v0.4 active-downshift probe: active downshift may now become visible not only under corruption-sensitive
            degradation, but also when opportunistic posture is persistently weakly supported on bounded real-fire windows.
          </div>
        ) : null}

        {ladderValidationErrors.length > 0 ? (
          <div className="small" style={{ color: "crimson", marginTop: 8 }}>
            {ladderValidationErrors.map((msg, i) => (
              <div key={`${msg}-${i}`}>{msg}</div>
            ))}
          </div>
        ) : null}

        {activeRegimeInvalid ? (
          <div className="small" style={{ color: "crimson", marginTop: 8 }}>
            Active regime requires at least one certified stage. Add a stage or switch back to advisory.
          </div>
        ) : advisoryRegimeSuspicious ? (
          <div className="small" style={{ color: "#8a6d3b", marginTop: 8 }}>
            Advisory regime currently has zero certified stages, so certified-stage summaries will be mostly inert.
          </div>
        ) : null}

        {regimeEnabled || showRegimeAdvanced ? (
          <>
            <div className="card" style={{ marginTop: 10, background: "var(--opr)" }}>
              <h2 style={{ marginTop: 0 }}>Signals + logging</h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(220px, 1fr))",
                  gap: 8,
                }}
              >
                {[
                  ["use_utilization", useUtilization, setUseUtilization],
                  ["use_strict_drift_proxy", useStrictDriftProxy, setUseStrictDriftProxy],
                  ["use_local_drift_rate", useLocalDriftRate, setUseLocalDriftRate],
                  ["use_cumulative_exposure", useCumulativeExposure, setUseCumulativeExposure],
                  ["use_trigger_bools", useTriggerBools, setUseTriggerBools],
                  ["store_step_trace", storeRegimeStepTrace, setStoreRegimeStepTrace],
                  ["store_trigger_components", storeTriggerComponents, setStoreTriggerComponents],
                  ["store_transition_details", storeTransitionDetails, setStoreTransitionDetails],
                ].map(([label, value, setter]) => (
                  <label key={String(label)} className="small" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                      type="checkbox"
                      checked={Boolean(value)}
                      disabled={busy}
                      onChange={(e) => (setter as (v: boolean) => void)(e.target.checked)}
                    />
                    <span>{String(label)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="card" style={{ marginTop: 10, background: "var(--opr)" }}>
              <div className="small" style={{ opacity: 0.84, marginTop: -6, marginBottom: 10, lineHeight: 1.4 }}>
                Thresholds define the signal neighborhood for downshift, certification, and recovery.
                Hysteresis is shown separately because it is not another raw threshold; it offsets the effective trigger boundary to reduce chatter near the decision line.
              </div>

              {[
                ["Downshift", downshiftThresholds, setDownshiftThresholds],
                ["Switch to certified", switchToCertifiedThresholds, setSwitchToCertifiedThresholds],
                ["Recovery", recoveryThresholds, setRecoveryThresholds],
              ].map(([title, thresholds, setter]) => {
                const t = thresholds as RegimeThresholds;
                const setT = setter as (x: RegimeThresholds) => void;
                return (
                  <div key={String(title)} style={{ marginTop: 10 }}>
                    <div className="small" style={{ marginBottom: 6, opacity: 0.85 }}>
                      <b>{String(title)}</b>
                    </div>
                    <div className="small" style={{ marginBottom: 6, opacity: 0.78, lineHeight: 1.4 }}>
                      {title === "Downshift" ? (
                        <>Operational meaning: downshift protects against weakening certificate-covered budget before a stronger certified switch is required.</>
                      ) : title === "Switch to certified" ? (
                        <>Operational meaning: certification is a stronger intervention than ordinary downshift and is meant to express sustained evidence for certified descent. For the opportunistic family, this threshold should usually be much harder than downshift so certification reads as fallback, not as the default story.</>
                      ) : (
                        <>Operational meaning: recovery should require enough evidence to avoid chatter, but in the opportunistic family it should still be clearly easier than certified re-entry so leave-certified exits can persist visibly.</>
                      )}
                    </div>
                    <div className="row">
                      <label>utilization_threshold</label>
                      <input
                        type="number"
                        step="0.01"
                        value={t.utilization_threshold}
                        disabled={busy}
                        onChange={(e) => setT({ ...t, utilization_threshold: Math.max(0, Math.min(1, parseFloat(e.target.value) || 0)) })}
                      />
                      <label>strict_drift_proxy_threshold</label>
                      <input
                        type="number"
                        step="0.01"
                        value={t.strict_drift_proxy_threshold}
                        disabled={busy}
                        onChange={(e) => setT({ ...t, strict_drift_proxy_threshold: parseFloat(e.target.value) || 0 })}
                      />
                      <label>persistence_steps</label>
                      <input
                        type="number"
                        min={1}
                        value={t.persistence_steps}
                        disabled={busy}
                        onChange={(e) => setT({ ...t, persistence_steps: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                      />
                    </div>
                    <div className="row" style={{ marginTop: 8, alignItems: "center" }}>
                      <label>
                        hysteresis_band
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        value={t.hysteresis_band}
                        disabled={busy}
                        onChange={(e) => setT({ ...t, hysteresis_band: Math.max(0, parseFloat(e.target.value) || 0) })}
                      />
                      <div className="small" style={{ opacity: 0.78, alignSelf: "center" }}>
                        reduces chatter by separating enter/leave behavior near thresholds
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="card" style={{ marginTop: 10, background: "var(--opr)" }}>
              <h2 style={{ marginTop: 0 }}>Certified stages</h2>
              <div className="small" style={{ opacity: 0.8 }}>
                Presets populate this table; values remain editable here for experimentation.
              </div>
              <div style={{ overflowX: "auto", marginTop: 8 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr>
                      {["stage_id", "label", "eta", "expected_certified_rate", "entropy_threshold", "healthy_u[min,max]"].map((k) => (
                        <th key={k} style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 6 }}>{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {certifiedStages.map((s, idx) => (
                      <tr key={s.stage_id}>
                        <td style={{ borderBottom: "1px solid #eee", padding: 6 }}>{s.stage_id}</td>
                        <td style={{ borderBottom: "1px solid #eee", padding: 6 }}>{s.label}</td>
                        <td style={{ borderBottom: "1px solid #eee", padding: 6 }}>
                          <input
                            type="number"
                            step="0.01"
                            min={0}
                            max={0.5}
                            value={s.eta}
                            disabled={busy}
                            onChange={(e) => {
                              const next = [...certifiedStages];
                              next[idx] = { ...s, eta: Math.max(0, Math.min(0.5, parseFloat(e.target.value) || 0)) };
                              setCertifiedStages(next);
                            }}
                            style={{ width: 90 }}
                          />
                        </td>
                        <td style={{ borderBottom: "1px solid #eee", padding: 6 }}>
                          <input
                            type="number"
                            step="0.0001"
                            min={0}
                            value={s.expected_certified_rate}
                            disabled={busy}
                            onChange={(e) => {
                              const next = [...certifiedStages];
                              next[idx] = { ...s, expected_certified_rate: Math.max(0, parseFloat(e.target.value) || 0) };
                              setCertifiedStages(next);
                            }}
                            style={{ width: 110 }}
                          />
                        </td>
                        <td style={{ borderBottom: "1px solid #eee", padding: 6 }}>
                          <input
                            type="number"
                            step="0.01"
                            min={0}
                            value={s.entropy_threshold}
                            disabled={busy}
                            onChange={(e) => {
                              const next = [...certifiedStages];
                              next[idx] = { ...s, entropy_threshold: Math.max(0, parseFloat(e.target.value) || 0) };
                              setCertifiedStages(next);
                            }}
                            style={{ width: 110 }}
                          />
                        </td>
                        <td style={{ borderBottom: "1px solid #eee", padding: 6 }}>
                          {s.healthy_utilization_range.min.toFixed(2)} – {s.healthy_utilization_range.max.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card" style={{ marginTop: 10, background: "var(--opr)" }}>
              <h2 style={{ marginTop: 0 }}>Opportunistic ladder</h2>
              <div style={{ overflowX: "auto", marginTop: 8 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr>
                      {["level_id", "label", "eta_adjustment", "motion_adjustment", "healthy_utilization_target", "notes"].map((k) => (
                        <th key={k} style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 6 }}>{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {opportunisticLadder.map((lvl, idx) => (
                      <tr key={lvl.level_id || `lvl-${idx}`}>
                        <td style={{ borderBottom: "1px solid #eee", padding: 6 }}>
                          <input
                            type="text"
                            value={lvl.level_id}
                            disabled={busy}
                            onChange={(e) => {
                              const next = [...opportunisticLadder];
                              next[idx] = { ...lvl, level_id: e.target.value };
                              setOpportunisticLadder(next);
                            }}
                            style={{ width: 90 }}
                          />
                        </td>
                        <td style={{ borderBottom: "1px solid #eee", padding: 6 }}>{lvl.label}</td>
                        <td style={{ borderBottom: "1px solid #eee", padding: 6 }}>
                          <input
                            type="number"
                            step="0.01"
                            value={lvl.eta_adjustment}
                            disabled={busy}
                            onChange={(e) => {
                              const next = [...opportunisticLadder];
                              next[idx] = { ...lvl, eta_adjustment: parseFloat(e.target.value) || 0 };
                              setOpportunisticLadder(next);
                            }}
                            style={{ width: 90 }}
                          />
                        </td>
                        <td style={{ borderBottom: "1px solid #eee", padding: 6 }}>
                          <input
                            type="number"
                            step="10"
                            value={lvl.motion_adjustment}
                            disabled={busy}
                            onChange={(e) => {
                              const next = [...opportunisticLadder];
                              next[idx] = { ...lvl, motion_adjustment: parseFloat(e.target.value) || 0 };
                              setOpportunisticLadder(next);
                            }}
                            style={{ width: 110 }}
                          />
                        </td>
                        <td style={{ borderBottom: "1px solid #eee", padding: 6 }}>
                          {lvl.healthy_utilization_target.toFixed(2)}
                        </td>
                        <td style={{ borderBottom: "1px solid #eee", padding: 6 }}>{lvl.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="small" style={{ marginTop: 8, opacity: 0.8 }}>
                  Suggested ordering for the opportunistic preset:
                  {" "}L0 = aggressive,
                  {" "}L1 = nominal,
                  {" "}L2 = intermediate guarded,
                  {" "}L3 = guarded.
                </div>
              </div>
            </div>
          </>
        ) : null}

        {!regimeEnabled && !showRegimeAdvanced ? (
          <div className="small" style={{ marginTop: 8, opacity: 0.78, lineHeight: 1.4 }}>
            Advanced overlay controls are currently hidden because regime management is disabled.
            Enable the overlay or expand advanced controls to inspect/edit the full experimental surface.
          </div>
        ) : null}
      </div>


      <div className="card" style={{ background: "var(--opr)" }}>
        <h2 style={{ marginTop: 0 }}>Embedded belief update</h2>
        <div className="small" style={{ opacity: 0.9, marginTop: -6, marginBottom: 10 }}>
          This section controls the internal belief-and-entropy state used by dynamic deployment policies.
          Arrived observations update local belief inside covered cells, entropy is recomputed from that updated belief field,
          and the next operational step uses the updated state.
        </div>
        <div className="small" style={{ opacity: 0.82, marginTop: -2, marginBottom: 10 }}>
          In other words: <b>observe → update belief → recompute entropy → choose next action</b>.
          This is an embedded operational belief update, not a separate standalone epistemic run.
        </div>
        <div className="small" style={{ opacity: 0.8, marginTop: -2, marginBottom: 10 }}>
          Legacy internal/backend name: <b>O1</b>.
        </div>
        <div className="small" style={{ opacity: 0.8, marginTop: -2, marginBottom: 10 }}>
          <span
            title={`${embeddedBeliefSummary} · ${residualControlSummary}`}
            style={{
              display: "block",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {embeddedBeliefSummary} · {residualControlSummary}
          </span>
        </div>

        <div className="card" style={{ marginTop: 10, background: "rgba(255,255,255,0.55)" }}>
          <h2 style={{ marginTop: 0 }}>Belief update settings</h2>
          <div className="small" style={{ opacity: 0.84, marginTop: -6, marginBottom: 10 }}>
            These parameters define how arrived observations update local belief and whether the embedded trace is stored.
          </div>

          <div className="row">
            <label>enabled</label>
            <select value={o1Enabled ? "yes" : "no"} onChange={(e) => setO1Enabled(e.target.value === "yes")} disabled={busy}>
              <option value="yes">yes</option>
              <option value="no">no</option>
            </select>

            <label>random seed</label>
            <input
              type="number"
              value={seed}
              onChange={(e) => setSeed(parseInt(e.target.value, 10) || 0)}
              disabled={busy}
              title="Random seed for embedded belief-update behavior"
            />

            <label>prior belief</label>
            <input
              type="number"
              step="0.01"
              value={priorP}
              onChange={(e) => setPriorP(Math.max(0, Math.min(1, parseFloat(e.target.value) || 0)))}
              disabled={busy}
              title="Initial prior belief assigned before any arrived observations are incorporated"
            />

            <label>front-band width (cells)</label>
            <input
              type="number"
              value={frontBandCells}
              min={0}
              onChange={(e) => setFrontBandCells(parseInt(e.target.value, 10) || 0)}
              disabled={busy}
              title="Width of the front-band diagnostic region used by embedded operational metrics"
            />
          </div>

          <div className="row">
            <label>positive update weight</label>
            <input
              type="number"
              step="0.05"
              value={alphaPos}
              onChange={(e) => setAlphaPos(Math.max(0, Math.min(1, parseFloat(e.target.value) || 0)))}
              disabled={busy}
              title="Belief increment applied after a positive arrived detection"
            />
            <label>negative update weight</label>
            <input
              type="number"
              step="0.05"
              value={alphaNeg}
              onChange={(e) => setAlphaNeg(Math.max(0, Math.min(1, parseFloat(e.target.value) || 0)))}
              disabled={busy}
              title="Belief decrement / counter-evidence weight applied after a negative arrived detection"
            />

            <label>store belief trace</label>
            <select
              value={storeEpiTrace ? "yes" : "no"}
              onChange={(e) => setStoreEpiTrace(e.target.value === "yes")}
              disabled={busy}
              title="Store the per-step embedded belief/entropy trace for later inspection"
            >
              <option value="yes">yes</option>
              <option value="no">no</option>
            </select>
          </div>
        </div>

        <div className="card" style={{ marginTop: 10, background: "rgba(255,255,255,0.55)" }}>
          <h2 style={{ marginTop: 0 }}>Residual and control coefficients</h2>
          <div className="small" style={{ opacity: 0.84, marginTop: -6, marginBottom: 10 }}>
            These coefficients do not change how belief is updated directly. They scale the MDC-style control score and residual-style diagnostics used by the operational policies.
          </div>

          <div className="row">
          <label>information coefficient</label>
          <input
            type="number"
            step="0.1"
            value={cInfo}
            onChange={(e) => setCInfo(Math.max(0, parseFloat(e.target.value) || 0))}
            disabled={busy}
            title="Information reward weight used by the MDC-style deployment score"
          />
          <div className="small" style={{ opacity: 0.85, alignSelf: "center" }}>
            update scale≈{kUpdateProxy.toFixed(3)} → mdc_info reward strength: <b>{mdcInfoRegime}</b>
          </div>
          <label>coverage coefficient</label>
          <input
            type="number"
            step="0.1"
            value={cCov}
            onChange={(e) => setCCov(Math.max(0, parseFloat(e.target.value) || 0))}
            disabled={busy}
            title="Coverage-driver coefficient used by residual-style MDC diagnostics/control"
          />
          <label>reference residual band</label>
          <input
            type="number"
            step="0.01"
            value={epsRef}
            onChange={(e) => setEpsRef(Math.max(0, parseFloat(e.target.value) || 0))}
            disabled={busy}
            title="Reference residual band; 0 lets the backend choose an effective scale automatically"
          />
            <div className="small" style={{ opacity: 0.78, alignSelf: "center" }}>
              0 = auto
            </div>
        </div>
        </div>

        <div className="card" style={{ marginTop: 10, background: "rgba(255,255,255,0.55)" }}>
          <h2 style={{ marginTop: 0 }}>Uncertainty policy parameters</h2>
          <div className="small" style={{ opacity: 0.84, marginTop: -6, marginBottom: 10 }}>
            These parameters are used only by the <b>uncertainty</b> policy. They control
            how recent coverage suppresses repeated exploration and how strongly novelty is rewarded.
          </div>

          <div className="row">
            <label>uncertainty decay</label>
            <input
              type="number"
              step="0.001"
              min={0}
              max={1}
              value={uncertaintyDecay}
              onChange={(e) => setUncertaintyDecay(Math.max(0, Math.min(1, parseFloat(e.target.value) || 0)))}
              disabled={busy}
              title="Persistence of recent-coverage memory"
            />

            <label>uncertainty gain</label>
            <input
              type="number"
              step="0.01"
              min={0}
              max={1}
              value={uncertaintyGain}
              onChange={(e) => setUncertaintyGain(Math.max(0, Math.min(1, parseFloat(e.target.value) || 0)))}
              disabled={busy}
              title="Strength of fresh coverage imprint into uncertainty memory"
            />
          </div>

          <div className="row">
            <label>uncertainty gamma</label>
            <input
              type="number"
              step="0.1"
              min={0}
              value={uncertaintyGamma}
              onChange={(e) => setUncertaintyGamma(Math.max(0, parseFloat(e.target.value) || 0))}
              disabled={busy}
              title="Power on novelty shaping"
            />

            <label>uncertainty beta</label>
            <input
              type="number"
              step="0.1"
              min={0}
              value={uncertaintyBeta}
              onChange={(e) => setUncertaintyBeta(Math.max(0, parseFloat(e.target.value) || 0))}
              disabled={busy}
              title="Power on variance shaping / novelty bonus balance"
            />

            <label>uncertainty lambda</label>
            <input
              type="number"
              step="0.01"
              min={0}
              value={uncertaintyLambda}
              onChange={(e) => setUncertaintyLambda(Math.max(0, parseFloat(e.target.value) || 0))}
              disabled={busy}
              title="Additive novelty bonus weight"
            />
          </div>
        </div>
      </div>

      <div className="card" style={{ background: "var(--opr)" }}>
        <h2 style={{ marginTop: 0 }}>Observation channel</h2>
        <div className="small" style={{ opacity: 0.9, marginTop: -6, marginBottom: 10 }}>
          These settings change the arrived observation stream used by the embedded belief update.
          They determine whether an observation arrives, whether it arrives late, and whether an arrived bit is flipped.
        </div>
        <div className="small" style={{ opacity: 0.82, marginTop: -2, marginBottom: 10 }}>
          In other words: <b>generate observation → apply loss/noise → delay arrival → update belief when it arrives</b>.
        </div>
        <div className="small" style={{ opacity: 0.8, marginTop: -2, marginBottom: 10 }}>
          Residual/control coefficients are configured above in <b>Embedded belief update</b>.
        </div>

        <div className="row">
          <label>observation noise</label>
          <input
            type="number"
            step="0.05"
            value={noiseLevel}
            onChange={(e) => setNoiseLevel(parseFloat(e.target.value))}
            disabled={busy}
            title="Probability that an arrived binary observation flips 0↔1"
          />
          <label>observation delay (steps)</label>
          <input
            type="number"
            value={delaySteps}
            onChange={(e) => setDelaySteps(parseInt(e.target.value, 10) || 0)}
            disabled={busy}
            title="Number of steps an observation waits before being applied"
          />
          <label>observation loss probability</label>
          <input
            type="number"
            step="0.01"
            value={lossProb}
            onChange={(e) => setLossProb(parseFloat(e.target.value))}
            disabled={busy}
            title="Probability that an observation packet never arrives"
          />        </div>
      </div>

      <div className="row" style={{ alignItems: "center" }}>
        <button onClick={createAndRun} disabled={!canSubmit}>
          {busy ? "Generating…" : "Generate Operational RUN"}
        </button>

        {busy ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: 12 }}>
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
            <span className="small">{status || "Working…"}</span>
          </div>
        ) : created ? (
          <span className="small" style={{ marginLeft: 12 }}>
            Created: <b>{created}</b>{" "}
            <a className="small" href={`/operational/visualizer?id=${created}`} style={{ marginLeft: 10 }}>
              Open Visualizer →
            </a>
          </span>
        ) : status ? (
          <span className="small" style={{ marginLeft: 12 }}>
            {status}
          </span>
        ) : null}

      </div>

      {/* Screenshot-friendly one-liner: helps interpret plots without hunting for form values */}
      <div className="small" style={{ opacity: 0.82, marginTop: 8, lineHeight: 1.35 }}>
        <span title={runSummary} style={{ display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {runSummary}
        </span>        
        <span style={{ display: "block", marginTop: 4 }}>
          Comparison studies live in <b>Analysis · Study Designer</b>.
        </span>
      </div>

      {runSummaryData ? (
        <div className="card" style={{ marginTop: 12 }}>
          <h2 style={{ marginTop: 0 }}>Run summary</h2>
          <div className="small" style={{ lineHeight: 1.45 }}>
            {typeof runSummaryData.k_update_proxy === "number" ? (
              <div>
                k_update_proxy=<b>{runSummaryData.k_update_proxy.toFixed(4)}</b>
                {runSummaryData.mdc_info_regime ? (
                  <> · regime=<b>{runSummaryData.mdc_info_regime}</b></>
                ) : null}
              </div>
            ) : null}

            {(typeof runSummaryData.driver_info_mean === "number" ||
              typeof runSummaryData.driver_info_true_mean === "number") ? (
              <div>
                {typeof runSummaryData.driver_info_mean === "number" ? (
                  <>
                    driver_info_mean=<b>{runSummaryData.driver_info_mean.toFixed(5)}</b>
                  </>
                ) : null}
                {typeof runSummaryData.driver_info_true_mean === "number" ? (
                  <>
                    {" "}· driver_info_true_mean=<b>{runSummaryData.driver_info_true_mean.toFixed(5)}</b>
                  </>
                ) : null}
              </div>
            ) : null}

            {(typeof runSummaryData.residual_info_mean === "number" ||
              typeof runSummaryData.residual_cov_mean === "number") ? (
              <div>
                {typeof runSummaryData.residual_info_mean === "number" ? (
                  <>
                    residual_info_mean=<b>{runSummaryData.residual_info_mean.toFixed(6)}</b>
                  </>
                ) : null}
                {typeof runSummaryData.residual_cov_mean === "number" ? (
                  <>
                    {" "}· residual_cov_mean=<b>{runSummaryData.residual_cov_mean.toFixed(6)}</b>
                  </>
                ) : null}
              </div>
            ) : null}

            {(typeof runSummaryData.residual_info_pos_frac === "number" ||
              typeof runSummaryData.residual_info_in_band_frac === "number" ||
              typeof runSummaryData.eps_ref_eff_info === "number") ? (
              <div>
                {typeof runSummaryData.residual_info_pos_frac === "number" ? (
                  <>
                    r_info_pos_frac=<b>{runSummaryData.residual_info_pos_frac.toFixed(3)}</b>
                  </>
                ) : null}
                {typeof runSummaryData.residual_info_in_band_frac === "number" ? (
                  <>
                    {" "}· r_info_in_band_frac=<b>{runSummaryData.residual_info_in_band_frac.toFixed(3)}</b>
                  </>
                ) : null}
                {typeof runSummaryData.eps_ref_eff_info === "number" ? (
                  <>
                    {" "}· eps_ref_eff_info=<b>{runSummaryData.eps_ref_eff_info.toFixed(6)}</b>
                  </>
                ) : null}
              </div>
            ) : null}

            {(typeof runSummaryData.ttfd === "number" ||
              typeof runSummaryData.mean_entropy_auc === "number" ||
              typeof runSummaryData.coverage_auc === "number") ? (
              <div>
                {typeof runSummaryData.ttfd === "number" ? (
                  <>
                    ttfd=<b>{runSummaryData.ttfd}</b>
                  </>
                ) : null}
                {typeof runSummaryData.mean_entropy_auc === "number" ? (
                  <>
                    {" "}· mean_entropy_auc=<b>{runSummaryData.mean_entropy_auc.toFixed(4)}</b>
                  </>
                ) : null}
                {typeof runSummaryData.coverage_auc === "number" ? (
                  <>
                    {" "}· coverage_auc=<b>{runSummaryData.coverage_auc.toFixed(4)}</b>
                  </>
                ) : null}
              </div>
            ) : null}

            {(typeof runSummaryData.movement_total_mean_l1 === "number" ||
              typeof runSummaryData.moves_per_step_mean === "number" ||
              typeof runSummaryData.moved_frac_mean === "number") ? (
              <div>
                {typeof runSummaryData.movement_total_mean_l1 === "number" ? (
                  <>
                    movement_total_mean_l1=<b>{runSummaryData.movement_total_mean_l1.toFixed(4)}</b>
                  </>
                ) : null}
                {typeof runSummaryData.moves_per_step_mean === "number" ? (
                  <>
                    {" "}· moves_per_step_mean=<b>{runSummaryData.moves_per_step_mean.toFixed(4)}</b>
                  </>
                ) : null}
                {typeof runSummaryData.moved_frac_mean === "number" ? (
                  <>
                    {" "}· moved_frac_mean=<b>{runSummaryData.moved_frac_mean.toFixed(4)}</b>
                  </>
                ) : null}
              </div>
            ) : null}
            {hasUsefulnessSummary ? (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontWeight: 600 }}>
                  Usefulness triad summary
                </div>
                <div className="small" style={{ opacity: 0.82, marginBottom: 2 }}>
                  This summarizes the live compact usefulness layer, not the broader regime-management overlay.
                </div>
                <div>
                  usefulness_proto_enabled=<b>{runSummaryData.usefulness_proto_enabled ? "yes" : "no"}</b>
                  {" "}· last_state=<b>{usefulnessStateLabel(runSummaryData.usefulness_regime_state_last)}</b>
                </div>
                <div>
                  exploit_frac=<b>{typeof runSummaryData.usefulness_regime_state_exploit_frac === "number" ? runSummaryData.usefulness_regime_state_exploit_frac.toFixed(3) : "—"}</b>
                  {" "}· recover_frac=<b>{typeof runSummaryData.usefulness_regime_state_recover_frac === "number" ? runSummaryData.usefulness_regime_state_recover_frac.toFixed(3) : "—"}</b>
                  {" "}· caution_frac=<b>{typeof runSummaryData.usefulness_regime_state_caution_frac === "number" ? runSummaryData.usefulness_regime_state_caution_frac.toFixed(3) : "—"}</b>
                </div>
                <div>
                  recover_hits=<b>{typeof runSummaryData.usefulness_trigger_recover_hits === "number" ? runSummaryData.usefulness_trigger_recover_hits : "—"}</b>
                  {" "}· caution_hits=<b>{typeof runSummaryData.usefulness_trigger_caution_hits === "number" ? runSummaryData.usefulness_trigger_caution_hits : "—"}</b>
                  {" "}· recover_from_caution_hits=<b>{typeof runSummaryData.usefulness_trigger_recover_from_caution_hits === "number" ? runSummaryData.usefulness_trigger_recover_from_caution_hits : "—"}</b>
                  {" "}· exploit_hits=<b>{typeof runSummaryData.usefulness_trigger_exploit_hits === "number" ? runSummaryData.usefulness_trigger_exploit_hits : "—"}</b>
                </div>
              </div>
            ) : null}

            {hasAdvisorySummary ? (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontWeight: 600 }}>
                  Advisory regime summary
                </div>
                <div className="small" style={{ opacity: 0.82, marginBottom: 2 }}>
                  Advisory trigger hits indicate criteria/recommendation hits. They do not by themselves imply realized active-state transitions.
                </div>
                <div>
                  regime_mode=<b>{runSummaryData.regime_mode ?? "—"}</b>
                  {typeof runSummaryData.regime_utilization_mean === "number" ? (
                    <> · utilization_mean=<b>{runSummaryData.regime_utilization_mean.toFixed(4)}</b></>
                  ) : null}
                  {typeof runSummaryData.regime_strict_drift_proxy_mean === "number" ? (
                    <> · strict_proxy_mean=<b>{runSummaryData.regime_strict_drift_proxy_mean.toFixed(4)}</b></>
                  ) : null}
                  {typeof runSummaryData.regime_local_drift_rate_mean === "number" ? (
                    <> · local_drift_mean=<b>{runSummaryData.regime_local_drift_rate_mean.toFixed(4)}</b></>
                  ) : null}
                  {typeof runSummaryData.regime_cumulative_exposure_final === "number" ? (
                    <> · exposure_final=<b>{runSummaryData.regime_cumulative_exposure_final.toFixed(4)}</b></>
                  ) : null}
                </div>
                <div>
                  {typeof advisoryDownshiftHits === "number" ? (
                    <>advisory_downshift_trigger_hits=<b>{advisoryDownshiftHits}</b></>
                  ) : null}
                  {typeof advisorySwitchHits === "number" ? (
                    <> · advisory_switch_to_certified_trigger_hits=<b>{advisorySwitchHits}</b></>
                  ) : null}
                  {typeof advisoryRecoveryHits === "number" ? (
                    <> · advisory_recovery_trigger_hits=<b>{advisoryRecoveryHits}</b></>
                  ) : null}
                </div>
              </div>
            ) : null}

            {hasActiveSummary ? (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontWeight: 600 }}>
                  Active regime summary
                </div>
                <div className="small" style={{ opacity: 0.82, marginBottom: 2 }}>
                  These are realized active-state quantities: actual active transitions, effective control settings, and active-state occupancy fractions.
                </div>
                <div>
                  active_last_state=<b>{runSummaryData.regime_active_last_state ?? "—"}</b>
                  {runSummaryData.regime_active_last_certified_stage_id ? (
                    <> · active_last_stage=<b>{runSummaryData.regime_active_last_certified_stage_id}</b></>
                  ) : null}
                  {runSummaryData.regime_active_last_opportunistic_level_id ? (
                    <> · active_last_ladder=<b>{runSummaryData.regime_active_last_opportunistic_level_id}</b></>
                  ) : null}
                </div>
                {(typeof runSummaryData.debug_active_downshift_support_score_mean === "number" ||
                  typeof runSummaryData.debug_active_downshift_support_score_min === "number" ||
                  typeof runSummaryData.debug_active_downshift_weak_support_hits === "number") ? (
                  <div>
                    {typeof runSummaryData.debug_active_downshift_support_score_mean === "number" ? (
                      <>
                        weak_support_score_mean=<b>{runSummaryData.debug_active_downshift_support_score_mean.toFixed(4)}</b>
                      </>
                    ) : null}
                    {typeof runSummaryData.debug_active_downshift_support_score_min === "number" ? (
                      <>
                        {" "}· weak_support_score_min=<b>{runSummaryData.debug_active_downshift_support_score_min.toFixed(4)}</b>
                      </>
                    ) : null}
                    {typeof runSummaryData.debug_active_downshift_weak_support_hits === "number" ? (
                      <>
                        {" "}· weak_support_hits=<b>{runSummaryData.debug_active_downshift_weak_support_hits}</b>
                      </>
                    ) : null}
                  </div>
                ) : null}
                {(typeof runSummaryData.debug_active_corruption_guard_hits === "number" ||
                  typeof runSummaryData.debug_active_corruption_led_downshift_hits === "number" ||
                  typeof runSummaryData.debug_corruption_guard_counter_max === "number") ? (
                  <div>
                    {typeof runSummaryData.debug_active_corruption_guard_hits === "number" ? (
                      <>
                        corruption_guard_hits=<b>{runSummaryData.debug_active_corruption_guard_hits}</b>
                      </>
                    ) : null}
                    {typeof runSummaryData.debug_active_corruption_led_downshift_hits === "number" ? (
                      <>
                        {" "}· corruption_led_downshift_hits=<b>{runSummaryData.debug_active_corruption_led_downshift_hits}</b>
                      </>
                    ) : null}
                    {typeof runSummaryData.debug_corruption_guard_counter_max === "number" ? (
                      <>
                        {" "}· corruption_guard_counter_max=<b>{runSummaryData.debug_corruption_guard_counter_max}</b>
                      </>
                    ) : null}
                  </div>
                ) : null}
                <div>
                  active_transition_count=<b>{runSummaryData.regime_active_transition_count ?? "—"}</b>
                  {typeof runSummaryData.regime_effective_eta_mean === "number" ? (
                    <> · effective_eta_mean=<b>{runSummaryData.regime_effective_eta_mean.toFixed(4)}</b></>
                  ) : null}
                  {typeof runSummaryData.regime_effective_move_budget_cells_mean === "number" ? (
                    <> · effective_move_budget_cells_mean=<b>{runSummaryData.regime_effective_move_budget_cells_mean.toFixed(4)}</b></>
                  ) : null}
                </div>
                <div>
                  {typeof runSummaryData.regime_active_state_nominal_frac === "number" ? (
                    <>nominal_state_frac=<b>{runSummaryData.regime_active_state_nominal_frac.toFixed(3)}</b></>
                  ) : null}
                  {typeof runSummaryData.regime_active_state_downshift_frac === "number" ? (
                    <> · downshift_state_frac=<b>{runSummaryData.regime_active_state_downshift_frac.toFixed(3)}</b></>
                  ) : null}
                  {typeof runSummaryData.regime_active_state_certified_frac === "number" ? (
                    <> · certified_state_frac=<b>{runSummaryData.regime_active_state_certified_frac.toFixed(3)}</b></>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Indeterminate progress bar while busy (match Epistemic Designer pattern) */}
      {busy ? (
        <div style={{ marginTop: 10 }}>
          <div
            style={{
              height: 8,
              borderRadius: 999,
              background: "rgba(0,0,0,0.08)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: "40%",
                borderRadius: 999,
                background: "rgba(0,0,0,0.35)",
                animation: "bar 1.1s ease-in-out infinite",
              }}
            />
          </div>
        </div>
      ) : null}
      {/* Legacy compare UI removed:
          This page now focuses on single-run operational authoring only.
          Comparison studies live in Analysis · Study Designer. */}

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes bar {
          0% {
            transform: translateX(-120%);
          }
          100% {
            transform: translateX(300%);
          }
        }
      `}</style>
    </div>
  );
}

