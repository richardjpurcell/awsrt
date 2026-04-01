// frontend/app/epistemic/designer/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { getJSON, postJSON } from "@/lib/api";
import { RunPicker } from "@/components/RunPicker";

type ListRes = { ids: string[] };
type EpiCreateRes = { epi_id: string; belief_lab_id?: string };
type OkRes = { ok: boolean; epi_id: string };
type RunSummaryRes = {
  entropy_auc?: number | null;
  mean_entropy_t0?: number | null;
  mean_entropy_t_end?: number | null;
  delta_mean_entropy_min?: number | null;
  delta_mean_entropy_max?: number | null;
  mdc_eps?: number | null;
  mdc_violation_rate?: number | null;
  mdc_residual_driver?: string | null;
  mdc_residual_c?: number | null;
  mdc_c_arrival?: number | null;
  mdc_c_info?: number | null;
  arrived_info_proxy_sum?: number | null;
  arrived_info_proxy_mean?: number | null;
  arrival_frac_mean?: number | null;
  support_model?: string | null;
  support_budget?: number | null;
  support_seed?: number | null;
  loss_prob?: number | null;
  delay_geom_p?: number | null;
  max_delay_steps?: number | null;
  impairment_mode?: string | null;
};

// Presets (Batch-style UX)
type PresetId =
  | ""
  | "reference_clean"
  | "loss_visible"
  | "delay_visible"
  | "mixed_visible"
  | "budget_edge"
  | "harsh_extreme";

type PresetConfig = {
  supportBudget: number;
  lossProb: number;
  delayGeomP: number;
  maxDelaySteps: number;
  supportModel: "random_support" | "fixed_support_mask";
  supportSeed: number;
  fixedSupportMaskPath: string;
  prior: number;
  decay: number;
  fp: number;
  fn: number;
  units: "bits" | "nats";
  mdcEps: number;
  residualDriver: "arrival_frac" | "arrived_info_proxy";
  residualC: number;
};

function clamp01(x: number) {
  if (!Number.isFinite(x)) return 0;
  return Math.min(1, Math.max(0, x));
}

function fmt(x: number, digits = 4) {
  if (!Number.isFinite(x)) return "—";
  // Avoid "-0.0000"
  const v = Math.abs(x) < 1e-12 ? 0 : x;
  return v.toFixed(digits);
}

function fmtInt(x: number) {
  if (!Number.isFinite(x)) return "—";
  return String(Math.trunc(x));
}

export default function BeliefLabDesignerPage() {
  const [phyIds, setPhyIds] = useState<string[]>([]);
  const [phyId, setPhyId] = useState("");

  // Presets (Batch-style UX)
  const [presetId, setPresetId] = useState<PresetId>("");

  // Support + impairment knobs (owned by manifest)
  const [supportBudget, setSupportBudget] = useState(512);
  const [lossProb, setLossProb] = useState(0.0);
  const [delayGeomP, setDelayGeomP] = useState(1.0);
  const [maxDelaySteps, setMaxDelaySteps] = useState(0);

  // Optional but recommended (Advanced)
  const [supportModel, setSupportModel] = useState<"random_support" | "fixed_support_mask">("random_support");
  const [supportSeed, setSupportSeed] = useState(0);
  const [fixedSupportMaskPath, setFixedSupportMaskPath] = useState<string>("");

  const [prior, setPrior] = useState(0.5);
  const [decay, setDecay] = useState(1.0);
  const [fp, setFp] = useState(0.01);
  const [fn, setFn] = useState(0.05);
  const [units, setUnits] = useState<"bits" | "nats">("bits");
  const [created, setCreated] = useState(""); 
  const [runSummaryData, setRunSummaryData] = useState<RunSummaryRes | null>(null);


  // MDC controls (owned by manifest)
  const [mdcEps, setMdcEps] = useState(0.0);
  const [residualDriver, setResidualDriver] = useState<"arrival_frac" | "arrived_info_proxy">("arrival_frac");
  const [residualC, setResidualC] = useState(0.0);

  // UX state
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    getJSON<ListRes>("/physical/list")
      .then((r) => setPhyIds(r.ids))
      .catch((e) => {
        console.error(e);
        setError(String(e?.message ?? e));
      });
  }, []);

  function numOr(prev: number, raw: string) {
    const v = parseFloat(raw);
    return Number.isFinite(v) ? v : prev;
  }

  const fixedSupportMaskPathOk = supportModel !== "fixed_support_mask" || (fixedSupportMaskPath?.trim()?.length ?? 0) > 0;
  const canSubmit = Boolean(phyId) && !busy && fixedSupportMaskPathOk;

  function supportModelLabel(model: "random_support" | "fixed_support_mask") {
    return model === "fixed_support_mask" ? "Fixed support mask" : "Random support";
  }

  function residualDriverLabel(driver: "arrival_frac" | "arrived_info_proxy") {
    return driver === "arrival_frac" ? "Arrival fraction" : "Arrived information proxy";
  }

  function decayInterpretation(x: number) {
    const v = clamp01(x);
    if (v >= 0.95) return "fast reset toward prior each step";
    if (v <= 0.25) return "long memory / slow reset";
    return "intermediate memory";
  }

  function delayInterpretation(p: number, maxSteps: number) {
    if (maxSteps <= 0 || p >= 1) return "no delay";
    if (p >= 0.7) return "usually short delay";
    if (p >= 0.4) return "moderate delay";
    return "heavy delay";
  }

  function channelStressLabel() {
    if (lossC > 0.25 || fnC > 0.15 || maxDelaySteps >= 6) return "harsh";
    if (lossC > 0 || fnC > 0.05 || maxDelaySteps > 0 || fpC > 0.01) return "moderate";
    return "near-ideal";
  }

  // ----------------------------
  // Presets (dropdown; batch-style UX)
  // ----------------------------
  const PRESET_GROUPS: { label: string; options: { id: PresetId; label: string; hint: string }[] }[] = [
    {
      label: "Visualizer reference presets",
      options: [
        { id: "reference_clean", label: "Reference clean", hint: "Static sanity check: no loss, no delay, no noise" },
        { id: "loss_visible", label: "Loss visible", hint: "Readable support-vs-arrival separation from observation loss" },
        { id: "delay_visible", label: "Delay visible", hint: "Temporal smearing / trail-friendly delay case" },
        { id: "mixed_visible", label: "Mixed visible", hint: "Balanced loss+delay case tuned for the visualizer" },
        { id: "budget_edge", label: "Budget edge", hint: "Lower budget but still dense enough to remain readable" },
      ],
    },
    {
      label: "Extreme stress presets",
      options: [
        { id: "harsh_extreme", label: "Harsh extreme", hint: "Stress-test regime; useful scientifically, not primarily for readability" },
      ],
    },
    {
      label: "Mask geometry experiments",
      options: [
        { id: "", label: "(use Fixed support mask in Advanced)", hint: "Create geometry experiments by switching support pattern below" },
      ],
    },
  ];

  const PRESETS: Record<Exclude<PresetId, "">, PresetConfig> = {
    reference_clean: {
      supportBudget: 512,
      lossProb: 0.0,
      delayGeomP: 1.0,
      maxDelaySteps: 0,
      supportModel: "random_support",
      supportSeed: 0,
      fixedSupportMaskPath: "",
      prior: 0.5,
      decay: 1.0,
      fp: 0.0,
      fn: 0.0,
      units: "bits",
      mdcEps: 0.0,
      residualDriver: "arrival_frac",
      residualC: 0.0,
    },
    loss_visible: {
      supportBudget: 512,
      lossProb: 0.25,
      delayGeomP: 1.0,
      maxDelaySteps: 0,
      supportModel: "random_support",
      supportSeed: 0,
      fixedSupportMaskPath: "",
      prior: 0.5,
      decay: 1.0,
      fp: 0.01,
      fn: 0.05,
      units: "bits",
      mdcEps: 0.0001,
      residualDriver: "arrival_frac",
      residualC: 0.0,
    },
    delay_visible: {
      supportBudget: 512,
      lossProb: 0.0,
      delayGeomP: 0.45,
      maxDelaySteps: 6,
      supportModel: "random_support",
      supportSeed: 0,
      fixedSupportMaskPath: "",
      prior: 0.5,
      decay: 1.0,
      fp: 0.01,
      fn: 0.05,
      units: "bits",
      mdcEps: 0.0001,
      residualDriver: "arrival_frac",
      residualC: 0.0,
    },
    mixed_visible: {
      supportBudget: 384,
      lossProb: 0.15,
      delayGeomP: 0.50,
      maxDelaySteps: 4,
      supportModel: "random_support",
      supportSeed: 0,
      fixedSupportMaskPath: "",
      prior: 0.5,
      decay: 1.0,
      fp: 0.01,
      fn: 0.05,
      units: "bits",
      mdcEps: 0.0001,
      residualDriver: "arrival_frac",
      residualC: 0.0,
    },
    budget_edge: {
      supportBudget: 384,
      lossProb: 0.10,
      delayGeomP: 0.60,
      maxDelaySteps: 4,
      supportModel: "random_support",
      supportSeed: 0,
      fixedSupportMaskPath: "",
      prior: 0.5,
      decay: 1.0,
      fp: 0.01,
      fn: 0.05,
      units: "bits",
      mdcEps: 0.0001,
      residualDriver: "arrival_frac",
      residualC: 0.0,
    },
    harsh_extreme: {
      supportBudget: 128,
      lossProb: 0.40,
      delayGeomP: 0.35,
      maxDelaySteps: 8,
      supportModel: "random_support",
      supportSeed: 0,
      fixedSupportMaskPath: "",
      prior: 0.5,
      decay: 1.0,
      fp: 0.05,
      fn: 0.20,
      units: "bits",
      mdcEps: 0.0002,
      residualDriver: "arrived_info_proxy",
      residualC: 0.0,
    },
  };

  function applyPreset(id: PresetId) {
    if (!id) return;
    setCreated("");
    setRunSummaryData(null);
    setStatus("");
    setError("");
    const p = PRESETS[id as Exclude<PresetId, "">];
    if (!p) return;

    setSupportBudget(p.supportBudget);
    setLossProb(p.lossProb);
    setDelayGeomP(p.delayGeomP);
    setMaxDelaySteps(p.maxDelaySteps);
    setSupportModel(p.supportModel);
    setSupportSeed(p.supportSeed);
    setFixedSupportMaskPath(p.fixedSupportMaskPath);
    setPrior(p.prior);
    setDecay(p.decay);
    setFp(p.fp);
    setFn(p.fn);
    setUnits(p.units);
    setMdcEps(p.mdcEps);
    setResidualDriver(p.residualDriver);
    setResidualC(p.residualC);
  }

  // ----------------------------
  // Derived / displayed equation values
  // ----------------------------
  const fpC = clamp01(fp);
  const fnC = clamp01(fn);
  const lossC = clamp01(lossProb);
  const delayPC = clamp01(delayGeomP);
  const epsC = Math.max(0, mdcEps);

  const delaySummary =
    maxDelaySteps <= 0 || delayPC >= 1
      ? "D = 0 (no delay)"
      : `D ~ Geom(p=${fmt(delayPC, 2)}) on {0,1,2,…} capped at ${fmtInt(maxDelaySteps)}`;

  const supportSummary =
    supportModel === "fixed_support_mask"
      ? `Fixed support mask (${fixedSupportMaskPath?.trim() || "path required"})`
      : "Random support sampled each step";

  const channelSummary =
    maxDelaySteps <= 0 || delayPC >= 1
      ? `observation loss=${fmt(lossC, 3)} · no delay · false positive=${fmt(fpC, 3)} · false negative=${fmt(fnC, 3)}`
      : `observation loss=${fmt(lossC, 3)} · ${delaySummary} · false positive=${fmt(fpC, 3)} · false negative=${fmt(fnC, 3)}`;

  const updateSummary = `prior=${fmt(clamp01(prior), 3)} · decay=${fmt(clamp01(decay), 3)} (${decayInterpretation(decay)}) · entropy=${units}`;

  const residualSummary = `decrease threshold ε=${fmt(epsC, 6)} · residual driver=${residualDriverLabel(residualDriver)} · ${
    Math.abs(residualC) > 0 ? `c=${fmt(residualC, 4)}` : "c=auto"
  }`;

  const experimentInterpretation = useMemo(() => {
    const parts: string[] = [];

    if (supportModel === "fixed_support_mask") parts.push("fixed support geometry");
    else if (supportBudget <= 128) parts.push("budget-limited random support");
    else parts.push("randomized support");

    if (lossC > 0.25 || fnC > 0.15 || maxDelaySteps >= 6) parts.push("harsh channel stress");
    else if (lossC > 0 || fnC > 0.05 || maxDelaySteps > 0) parts.push("moderately impaired channel");
    else parts.push("near-ideal channel");

    if (clamp01(decay) < 0.5) parts.push("long-memory belief update");
    else if (clamp01(decay) >= 0.95) parts.push("fast-reset belief update");
    else parts.push("intermediate belief memory");

    return parts.join(" · ");
  }, [supportModel, supportBudget, lossC, fnC, maxDelaySteps, decay]);

  const residualScaleNote = Math.abs(residualC) > 0
      ? `c = ${fmt(residualC, 4)} (forced; used for both a(t) and Ĩ(t))`
      : "c_a, c_I = auto (robust scale match per driver)";

  const presetLabel =
    presetId === "reference_clean"
      ? "Reference clean"
      : presetId === "loss_visible"
      ? "Loss visible"
      : presetId === "delay_visible"
      ? "Delay visible"
      : presetId === "mixed_visible"
      ? "Mixed visible"
      : presetId === "budget_edge"
      ? "Budget edge"
      : presetId === "harsh_extreme"
      ? "Harsh extreme"
      : "Custom";

  const runSummary = [
    `Preset: ${presetLabel}`,
    `phy=${phyId || "—"}`,
    `support=${supportModelLabel(supportModel)}`,
    `budget=${supportBudget}`,
    `seed=${supportSeed}`,
    supportModel === "fixed_support_mask" ? `mask=${fixedSupportMaskPath?.trim() || "—"}` : null,
    `loss=${lossProb}`,
    `delay_p=${delayGeomP}`,
    `Dmax=${maxDelaySteps}`,
    `fp=${fp}`,
    `fn=${fn}`,
    `prior=${prior}`,
    `decay=${decay}`,
    `units=${units}`,
    `eps=${mdcEps}`,
    `driver=${residualDriverLabel(residualDriver)}`,
    Math.abs(residualC) > 0 ? `c=${residualC}` : "c=auto",
  ]
    .filter(Boolean)
    .join(" · ");

  // ----------------------------
  // Run creation
  // ----------------------------
  async function createAndRun() {
    if (!phyId || busy) return;

    setCreated("");
    setRunSummaryData(null);
    setError("");
    setBusy(true);

    try {
      setStatus("Creating manifest…");

      const manifest = {
        phy_id: phyId,
        belief: { prior_p: prior, decay, noise: { false_pos: fp, false_neg: fn } },
        entropy: { units },

        support: {
          model: supportModel,
          budget: supportBudget,
          seed: supportSeed,
          fixed_mask_path: supportModel === "fixed_support_mask" ? fixedSupportMaskPath.trim() : null,
        },
        impairment: {
          mode: "model_a_iid",
          loss_prob: lossProb,
          delay_geom_p: delayGeomP,
          max_delay_steps: maxDelaySteps,
        },

        mdc: {
          eps: mdcEps,
          residual_driver: residualDriver,
          residual_c: residualC,
        },
      };

      const { epi_id } = await postJSON<EpiCreateRes>("/epistemic/manifest", manifest);

      setStatus("Running Belief Lab simulation (this may take a while)…");
      await postJSON<OkRes>("/epistemic/run", { id: epi_id });
      try {
        const s = await getJSON<RunSummaryRes>(`/metrics/${epi_id}/summary`);
        setRunSummaryData(s);
      } catch {
        setRunSummaryData(null);
      }

      setCreated(epi_id);
      setStatus("Done.");
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
      <h2>Belief Lab Designer</h2>
      <div aria-hidden className="section-stripe section-stripe--epistemic" />
      <div className="small" style={{ opacity: 0.86, lineHeight: 1.45, marginTop: 8 }}>
        Belief Lab is AWSRT&apos;s policy-free support / channel / belief-update laboratory.
        It uses fixed or randomized sensing support together with the same impairment and
        belief-update semantics used by Operational, but without closed-loop deployment policy.
      </div>

      <RunPicker label="Physical Run" ids={phyIds} value={phyId} onChange={setPhyId} />

      <div className="card" style={{ marginTop: 10 }}>
        <h2 style={{ marginTop: 0 }}>Why use Belief Lab?</h2>
        <div className="small" style={{ opacity: 0.86, lineHeight: 1.5 }}>
          Belief Lab is for support-and-channel experiments, not deployment optimization.
          It removes motion policy and closed-loop decision logic so you can isolate
          support geometry, channel impairment, and belief-memory effects on what
          information actually arrives and how entropy changes.
        </div>
     </div>

      {/* Presets (Batch-style; dropdown) */}
      <div className="card" style={{ marginTop: 10 }}>
        <h2 style={{ marginTop: 0 }}>Belief Lab preset taxonomy</h2>
        <div className="small" style={{ opacity: 0.85, lineHeight: 1.4 }}>
          Presets populate fields but do not auto-run. Reference presets are intended for clear
          visualizer interpretation, stress presets push the channel and support harder, and mask
          geometry experiments are configured by switching support pattern below.
        </div>
        <div className="row" style={{ marginTop: 10, alignItems: "center" }}>
          <label>Taxonomy</label>
          <select
            value={presetId}
            onChange={(e) => setPresetId(e.target.value as PresetId)}
            disabled={busy}
            style={{ minWidth: 360 }}
            title="Pick a standardized Belief Lab regime, then Apply preset"
          >
            <option value="">(choose preset…)</option>
            {PRESET_GROUPS.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.options.map((p, idx) => (
                  <option key={`${group.label}-${p.id || idx}`} value={p.id} title={p.hint}>
                    {p.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <button type="button" disabled={busy || !presetId} onClick={() => applyPreset(presetId)}>
            Apply preset
          </button>
          <div className="small" style={{ opacity: 0.75 }}>
            Applying a preset overwrites relevant fields.
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 10 }}>
        <h2 style={{ marginTop: 0 }}>Support design</h2>
        <div className="small" style={{ opacity: 0.85, lineHeight: 1.4 }}>
          These settings define the prescribed sensing support before impairment or belief update.
          Use them to control how many cells are sensed each step and whether support is randomized
          or imposed through a fixed mask geometry.
        </div>

        <div className="row" style={{ marginTop: 10 }}>
          <label>cells sensed per step</label>
          <input
            type="number"
            step="1"
            min="1"
            value={supportBudget}
            onChange={(e) => setSupportBudget(Math.max(1, Math.floor(numOr(supportBudget, e.target.value))))}
            disabled={busy}
          />

          <label>support pattern</label>
          <select value={supportModel} onChange={(e) => setSupportModel(e.target.value as any)} disabled={busy}>
            <option value="random_support">Random support</option>
            <option value="fixed_support_mask">Fixed support mask</option>
          </select>

          <label>random seed</label>
          <input
            type="number"
            step="1"
            value={supportSeed}
            onChange={(e) => setSupportSeed(Math.floor(numOr(supportSeed, e.target.value)))}
            disabled={busy}
          />
        </div>

        {supportModel === "fixed_support_mask" ? (
          <div className="row">
            <label>support mask path</label>
            <input
              type="text"
              placeholder="path/to/mask.npy"
              value={fixedSupportMaskPath}
              onChange={(e) => setFixedSupportMaskPath(e.target.value)}
              disabled={busy}
            />
          </div>
        ) : null}

        <div className="small" style={{ marginTop: 8, opacity: 0.8 }}>
          Summary: <b>{supportSummary}</b>. Belief Lab uses this prescribed support to decide where
          sensing is attempted, then studies what actually arrives after impairment.
        </div>
      </div>

      <div className="card" style={{ marginTop: 10 }}>
        <h2 style={{ marginTop: 0 }}>Observation channel</h2>
        <div className="small" style={{ opacity: 0.85, lineHeight: 1.4 }}>
          These settings control whether attempted observations arrive, arrive late, or arrive
          corrupted. They define the impaired channel that sits between prescribed support and
          belief update.
        </div>

        <div className="row" style={{ marginTop: 10 }}>
          <label>observation loss</label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="1"
            value={lossProb}
            onChange={(e) => setLossProb(Math.min(1, Math.max(0, numOr(lossProb, e.target.value))))}
            disabled={busy}
          />

          <label>delay probability p</label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="1"
            value={delayGeomP}
            onChange={(e) => setDelayGeomP(Math.min(1, Math.max(0, numOr(delayGeomP, e.target.value))))}
            disabled={busy}
          />

          <label>maximum delay steps</label>
          <input
            type="number"
            step="1"
            min="0"
            value={maxDelaySteps}
            onChange={(e) => setMaxDelaySteps(Math.max(0, Math.floor(numOr(maxDelaySteps, e.target.value))))}
            disabled={busy}
          />
        </div>
        <div className="row">
          <label>false positive rate</label>
          <input type="number" step="0.01" value={fp} onChange={(e) => setFp(numOr(fp, e.target.value))} disabled={busy} />
          <label>false negative rate</label>
          <input type="number" step="0.01" value={fn} onChange={(e) => setFn(numOr(fn, e.target.value))} disabled={busy} />
        </div>

        <div className="small" style={{ marginTop: 8, opacity: 0.8 }}>
          Summary: <b>{channelStressLabel()}</b> channel · {channelSummary}.
        </div>
      </div>

      <div className="card" style={{ marginTop: 10 }}>
        <h2 style={{ marginTop: 0 }}>Belief update</h2>
        <div className="small" style={{ opacity: 0.85, lineHeight: 1.4 }}>
          These settings control how arrived observations update belief and how entropy is computed.
          Belief Lab uses the same belief/update semantics as Operational, but without closed-loop movement policy.
        </div>

        <div className="row" style={{ marginTop: 10 }}>
          <label>belief prior</label>
          <input type="number" step="0.05" value={prior} onChange={(e) => setPrior(numOr(prior, e.target.value))} disabled={busy} />
          <label>belief decay</label>
          <input type="number" step="0.05" value={decay} onChange={(e) => setDecay(numOr(decay, e.target.value))} disabled={busy} />
          <label>Entropy units</label>
          <select value={units} onChange={(e) => setUnits(e.target.value as any)} disabled={busy}>
            <option value="bits">bits</option>
            <option value="nats">nats</option>
          </select>
        </div>

        <div className="small" style={{ marginTop: 8, opacity: 0.8 }}>
          Summary: {updateSummary}.
        </div>
      </div>

      <div className="card" style={{ marginTop: 10 }}>
        <h2 style={{ marginTop: 0 }}>Residual and decrease diagnostics</h2>
        <div className="small" style={{ opacity: 0.85, lineHeight: 1.4 }}>
          These settings do not change the observation channel directly. They control how
          mean-entropy motion is interpreted through decrease thresholds and residual-style
          explanatory diagnostics.
        </div>

        <div className="row" style={{ marginTop: 10 }}>
          <label>decrease threshold ε</label>
          <input type="number" step="0.000001" value={mdcEps} onChange={(e) => setMdcEps(numOr(mdcEps, e.target.value))} disabled={busy} />

          <label>Residual driver</label>
          <select value={residualDriver} onChange={(e) => setResidualDriver(e.target.value as any)} disabled={busy}>
            <option value="arrival_frac">Arrival fraction</option>
            <option value="arrived_info_proxy">Arrived information proxy</option>
          </select>

          <label>Residual scale c</label>
          <input type="number" step="0.01" value={residualC} onChange={(e) => setResidualC(numOr(residualC, e.target.value))} disabled={busy} />
        </div>

        <div className="small" style={{ marginTop: 8, opacity: 0.8 }}>
          Summary: {residualSummary}.
        </div>
      </div>

      {/* Belief Lab experiment summary */}
      <details style={{ marginTop: 10 }} open>
        <summary className="small" style={{ cursor: "pointer" }}>
          Belief Lab experiment summary
        </summary>

        <div
          style={{
            marginTop: 10,
            border: "1px solid rgba(0,0,0,0.12)",
            borderRadius: 12,
            padding: 12,
            background: "rgba(255,255,255,0.7)",
          }}
        >
          <div className="small" style={{ opacity: 0.88, lineHeight: 1.45 }}>
            This run isolates how a prescribed sensing support, an impaired observation channel,
            and a chosen belief-update rule shape belief, entropy, and residual diagnostics
            without introducing closed-loop deployment policy.
          </div>
          <div className="small" style={{ opacity: 0.78, lineHeight: 1.45, marginTop: 6 }}>
            Think of this as a support-and-channel experiment: you prescribe where sensing is allowed,
            then study how impairment and belief memory change what information actually arrives.
          </div>

          <div className="labGrid" style={{ marginTop: 10 }}>
            <div className="labCard">
              <div className="small labTitle">Support configuration</div>
              <div className="small labBody">
                support pattern: <b>{supportModelLabel(supportModel)}</b><br />
                support budget: <b>{fmtInt(supportBudget)}</b> cells/step<br />
                support seed: <b>{fmtInt(supportSeed)}</b><br />
                summary: <b>{supportSummary}</b>
              </div>
            </div>

            <div className="labCard">
              <div className="small labTitle">Channel impairments</div>
              <div className="small labBody">
                channel stress: <b>{channelStressLabel()}</b><br />
                {channelSummary}
              </div>
            </div>

            <div className="labCard">
              <div className="small labTitle">Belief update</div>
              <div className="small labBody">
                {updateSummary}
              </div>
            </div>

            <div className="labCard">
              <div className="small labTitle">Residual interpretation</div>
              <div className="small labBody">
                {residualSummary}<br />
                {residualScaleNote}
              </div>
            </div>

            <div className="labCard labCard--wide">
              <div className="small labTitle">What this run isolates</div>
              <div className="small labBody">
                <b>{experimentInterpretation}</b>
                <div style={{ marginTop: 6, opacity: 0.82 }}>
                  delay profile: <b>{delayInterpretation(delayGeomP, maxDelaySteps)}</b>
                </div>
                <div style={{ marginTop: 6, opacity: 0.82 }}>
                  use this when you want to answer questions like:
                  {" "}“how much does channel impairment matter?”,
                  {" "}“how sensitive is entropy drift to belief memory?”,
                  {" "}or “what happens if sensing is constrained to this support geometry?”
                </div>
              </div>
            </div>
          </div>
        </div>
      </details>

      <div className="row" style={{ alignItems: "center", gap: 12 }}>
        <button onClick={createAndRun} disabled={!canSubmit}>
          {busy ? "Generating…" : "Generate Belief Lab Run"}

        </button>

        {busy ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              aria-label="Loading"
              style={{ width: 18, height: 18, borderRadius: "50%", border: "3px solid rgba(0,0,0,0.15)", borderTopColor: "rgba(0,0,0,0.6)", animation: "spin 0.9s linear infinite" }}

            />
            <span className="small">{status}</span>
          </div>

        ) : created ? (
          <span className="small">
            Created: <b>{created}</b>
            <a className="small" href={`/epistemic/visualizer?id=${created}`} style={{ marginLeft: 10 }}>
              Open Belief Lab Visualizer →
            </a>
          </span>
        ) : status ? (
          <span className="small">{status}</span>
        ) : null}
      </div>

      {!fixedSupportMaskPathOk ? (
        <div className="small" style={{ marginTop: 8, color: "#b00020" }}>
          fixed_support_mask requires a non-empty fixed_support_mask_path.
        </div>
      ) : null}

      <div className="small" style={{ opacity: 0.82, marginTop: 8, lineHeight: 1.35 }}>
        <span title={runSummary} style={{ display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {runSummary}
        </span>
      </div>

      {runSummaryData ? (
        <div className="card" style={{ marginTop: 12 }}>
          <h2 style={{ marginTop: 0 }}>Belief Lab run summary</h2>
          <div className="small" style={{ lineHeight: 1.45 }}>
            {(typeof runSummaryData.entropy_auc === "number" ||
              typeof runSummaryData.mdc_violation_rate === "number" ||
              typeof runSummaryData.arrival_frac_mean === "number") ? (
              <div>
                {typeof runSummaryData.entropy_auc === "number" ? (
                  <>
                    entropy_auc=<b>{runSummaryData.entropy_auc.toFixed(6)}</b>
                  </>
                ) : null}
                {typeof runSummaryData.mdc_violation_rate === "number" ? (
                  <>
                    {" "}· mdc_violation_rate=<b>{runSummaryData.mdc_violation_rate.toFixed(6)}</b>
                  </>
                ) : null}
                {typeof runSummaryData.arrival_frac_mean === "number" ? (
                  <>
                    {" "}· arrival_frac_mean=<b>{runSummaryData.arrival_frac_mean.toFixed(6)}</b>
                  </>
                ) : null}
              </div>
            ) : null}

            {(typeof runSummaryData.arrived_info_proxy_mean === "number" ||
              typeof runSummaryData.arrived_info_proxy_sum === "number") ? (
              <div>
                {typeof runSummaryData.arrived_info_proxy_mean === "number" ? (
                  <>
                    arrived_info_proxy_mean=<b>{runSummaryData.arrived_info_proxy_mean.toFixed(6)}</b>
                  </>
                ) : null}
                {typeof runSummaryData.arrived_info_proxy_sum === "number" ? (
                  <>
                    {" "}· arrived_info_proxy_sum=<b>{runSummaryData.arrived_info_proxy_sum.toFixed(6)}</b>
                  </>
                ) : null}
              </div>
            ) : null}

            {(typeof runSummaryData.mean_entropy_t0 === "number" ||
              typeof runSummaryData.mean_entropy_t_end === "number" ||
              typeof runSummaryData.delta_mean_entropy_min === "number" ||
              typeof runSummaryData.delta_mean_entropy_max === "number") ? (
              <div>
                {typeof runSummaryData.mean_entropy_t0 === "number" ? (
                  <>
                    mean_entropy_t0=<b>{runSummaryData.mean_entropy_t0.toFixed(6)}</b>
                  </>
                ) : null}
                {typeof runSummaryData.mean_entropy_t_end === "number" ? (
                  <>
                    {" "}· mean_entropy_t_end=<b>{runSummaryData.mean_entropy_t_end.toFixed(6)}</b>
                  </>
                ) : null}
                {typeof runSummaryData.delta_mean_entropy_min === "number" ? (
                  <>
                    {" "}· ΔH̄_min=<b>{runSummaryData.delta_mean_entropy_min.toFixed(6)}</b>
                  </>
                ) : null}
                {typeof runSummaryData.delta_mean_entropy_max === "number" ? (
                  <>
                    {" "}· ΔH̄_max=<b>{runSummaryData.delta_mean_entropy_max.toFixed(6)}</b>
                  </>
                ) : null}
              </div>
            ) : null}

            {(typeof runSummaryData.mdc_eps === "number" ||
              typeof runSummaryData.mdc_c_arrival === "number" ||
              typeof runSummaryData.mdc_c_info === "number" ||
              runSummaryData.mdc_residual_driver) ? (
              <div>
                {typeof runSummaryData.mdc_eps === "number" ? (
                  <>
                    mdc_eps=<b>{runSummaryData.mdc_eps.toFixed(6)}</b>
                  </>
                ) : null}
                {runSummaryData.mdc_residual_driver ? (
                  <>
                    {" "}· residual_driver=<b>{String(runSummaryData.mdc_residual_driver)}</b>
                  </>
                ) : null}
                {typeof runSummaryData.mdc_residual_c === "number" ? (
                  <>
                    {" "}· residual_c=<b>{runSummaryData.mdc_residual_c.toFixed(6)}</b>
                  </>
                ) : null}
                {typeof runSummaryData.mdc_c_arrival === "number" ? (
                  <>
                    {" "}· c_arrival=<b>{runSummaryData.mdc_c_arrival.toFixed(6)}</b>
                  </>
                ) : null}
                {typeof runSummaryData.mdc_c_info === "number" ? (
                  <>
                    {" "}· c_info=<b>{runSummaryData.mdc_c_info.toFixed(6)}</b>
                  </>
                ) : null}
              </div>
            ) : null}

            {(runSummaryData.support_model ||
              typeof runSummaryData.support_budget === "number" ||
              typeof runSummaryData.support_seed === "number" ||
              typeof runSummaryData.loss_prob === "number" ||
              typeof runSummaryData.delay_geom_p === "number" ||
              typeof runSummaryData.max_delay_steps === "number") ? (
              <div>
                {runSummaryData.support_model ? (
                  <>
                    support_pattern=<b>{String(runSummaryData.support_model)}</b>
                  </>
                ) : null}
                {typeof runSummaryData.support_budget === "number" ? (
                  <>
                    {" "}· support_budget=<b>{runSummaryData.support_budget}</b>
                  </>
               ) : null}
                {typeof runSummaryData.support_seed === "number" ? (
                  <>
                    {" "}· support_seed=<b>{runSummaryData.support_seed}</b>
                  </>
                ) : null}
                {typeof runSummaryData.loss_prob === "number" ? (
                  <>
                    {" "}· observation_loss=<b>{runSummaryData.loss_prob.toFixed(4)}</b>
                  </>
                ) : null}
                {typeof runSummaryData.delay_geom_p === "number" ? (
                  <>
                    {" "}· delay_probability_p=<b>{runSummaryData.delay_geom_p.toFixed(4)}</b>
                  </>
                ) : null}
                {typeof runSummaryData.max_delay_steps === "number" ? (
                  <>
                    {" "}· maximum_delay_steps=<b>{runSummaryData.max_delay_steps}</b>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Indeterminate progress bar while busy */}
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

      {error ? (
        <div className="small" style={{ marginTop: 10, color: "#b00020" }}>
          {error}
        </div>
      ) : null}

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

        .labGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          align-items: start;
        }
        @media (max-width: 1100px) {
          .small[style*="grid-template-columns: repeat(4, minmax(0, 1fr))"] {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }
        @media (max-width: 720px) {
          .small[style*="grid-template-columns: repeat(4, minmax(0, 1fr))"] {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 980px) {
          .labGrid {
            grid-template-columns: 1fr;
          }
        }

        .labCard { 
          border: 1px solid rgba(0, 0, 0, 0.12);
          background: #fff;
          border-radius: 12px;
          padding: 10px;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
        }
        .labCard--wide {
          grid-column: 1 / -1;
        }
        .labTitle {
          font-weight: 600;
          margin-bottom: 6px;
        }
        .labBody {
          font-size: 12.5px;
          line-height: 1.45;
          color: rgba(0, 0, 0, 0.86);
        }
        .labBody b {
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
