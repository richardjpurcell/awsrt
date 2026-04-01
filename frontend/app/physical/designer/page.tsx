// frontend/app/physical/designer/page.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { postJSON } from "@/lib/api";

type OkRes = { ok: boolean };

type Neighborhood = "moore" | "von_neumann";
type FireMode = "stochastic" | "deterministic";

// Match backend schema: FuelPreset = "fort_mcmurray" | "boreal_conifer" | "mixedwood" | "deciduous";
type FuelPreset = "fort_mcmurray" | "boreal_conifer" | "mixedwood" | "deciduous";

type PhysicalPresetId =
  | ""
  | "reference_center_ideal"
  | "reference_corner_ideal"
  | "terrain_only"
  | "wind_static_only"
  | "wind_dynamic_only"
  | "fuels_only_patchy"
  | "weather_coupling_combined"
  | "combined_balanced"
  | "wind_terrain_combined"
  | "fuels_weather_combined"
  | "smoke_small_grid";

function clampInt(n: number, lo: number, hi: number) {
  if (!Number.isFinite(n)) return lo;
  return Math.max(lo, Math.min(hi, Math.trunc(n)));
}
function clampNum(n: number, lo: number, hi: number) {
  if (!Number.isFinite(n)) return lo;
  return Math.max(lo, Math.min(hi, n));
}

function parseIntSafe(v: string, fallback: number) {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
}
function parseFloatSafe(v: string, fallback: number) {
  const n = Number.parseFloat(v);
  return Number.isFinite(n) ? n : fallback;
}

const FUEL_PRESETS: Record<FuelPreset, { codes: string[]; weights: number[] }> = {
  fort_mcmurray: { codes: ["C2", "C3", "M1"], weights: [0.55, 0.3, 0.15] },
  boreal_conifer: { codes: ["C2", "C3", "M1"], weights: [0.7, 0.25, 0.05] },
  mixedwood: { codes: ["M1", "C2", "C3"], weights: [0.5, 0.25, 0.25] },
  deciduous: { codes: ["D1", "M1", "C2"], weights: [0.6, 0.3, 0.1] },
};

export default function PhysicalDesignerPage() {
  const router = useRouter();
  // Presets
  const [presetId, setPresetId] = useState<PhysicalPresetId>("");

  // Grid & time
  const [H, setH] = useState(150);
  const [W, setW] = useState(150);
  const [cell, setCell] = useState(250);
  const [crs, setCrs] = useState("EPSG:3978");
  const [T, setT] = useState(72);
  const [dtSeconds, setDtSeconds] = useState(3600);
  const [seed, setSeed] = useState(0);

  // Ignition (location + timing window)
  const [ignR, setIgnR] = useState(75);
  const [ignC, setIgnC] = useState(75);
  const [ignRadius, setIgnRadius] = useState(0);
  const [ignTmin, setIgnTmin] = useState(0);
  const [ignTmax, setIgnTmax] = useState(0);
  const [ignSeed, setIgnSeed] = useState(123);

  // Fire model
  const [neighborhood, setNeighborhood] = useState<Neighborhood>("moore");
  const [mode, setMode] = useState<FireMode>("stochastic");
  const [burnTime, setBurnTime] = useState(4);
  const [spreadBase, setSpreadBase] = useState(0.35);
  const [detThresh, setDetThresh] = useState(0.5);
  const [windGain, setWindGain] = useState(1.0);
  const [slopeGain, setSlopeGain] = useState(1.0);

  // Terrain
  const [terrainEnabled, setTerrainEnabled] = useState(true);
  const [terrainSeed, setTerrainSeed] = useState(42);
  const [terrainAmp, setTerrainAmp] = useState(250);
  const [terrainSmooth, setTerrainSmooth] = useState(8);

  // Wind (u,v)
  const [windEnabled, setWindEnabled] = useState(false);
  const [windU, setWindU] = useState(0);
  const [windV, setWindV] = useState(0);

  // --- Dynamic wind controls ---
  const [windDynamic, setWindDynamic] = useState(false);
  const [windSeed, setWindSeed] = useState(0);
  const [windSpatialAmp, setWindSpatialAmp] = useState(0.0);
  const [windSpatialSmooth, setWindSpatialSmooth] = useState(10);
  const [windTemporalSigma, setWindTemporalSigma] = useState(0.25);
  const [windTauSteps, setWindTauSteps] = useState(6.0);
  const [windTerrainGain, setWindTerrainGain] = useState(0.0);

  // Fuels (FBP categorical map, uint8 IDs stored on backend)
  const [fuelsEnabled, setFuelsEnabled] = useState(false);
  const [fuelsPreset, setFuelsPreset] = useState<FuelPreset>("fort_mcmurray");
  const [fuelCode1, setFuelCode1] = useState("C2");
  const [fuelW1, setFuelW1] = useState(0.55);
  const [fuelCode2, setFuelCode2] = useState("C3");
  const [fuelW2, setFuelW2] = useState(0.3);
  const [fuelCode3, setFuelCode3] = useState("M1");
  const [fuelW3, setFuelW3] = useState(0.15);
  const [fuelsSeed, setFuelsSeed] = useState(7);
  const [fuelsPatchIters, setFuelsPatchIters] = useState(10);
  const [fuelsTerrainCorr, setFuelsTerrainCorr] = useState(0.35);

  // Weather (temperature/humidity)
  const [weatherEnabled, setWeatherEnabled] = useState(false);

  // Temperature
  const [tempEnabled, setTempEnabled] = useState(true);
  const [tempDynamic, setTempDynamic] = useState(true);
  const [tempBaseC, setTempBaseC] = useState(20.0);
  const [tempSpatialAmpC, setTempSpatialAmpC] = useState(3.0);
  const [tempSpatialSmooth, setTempSpatialSmooth] = useState(12);
  const [tempTemporalSigmaC, setTempTemporalSigmaC] = useState(0.5);
  const [tempTauSteps, setTempTauSteps] = useState(8.0);
  const [tempSeed, setTempSeed] = useState(123);

  // Humidity
  const [humEnabled, setHumEnabled] = useState(true);
  const [humDynamic, setHumDynamic] = useState(true);
  const [humBaseRh, setHumBaseRh] = useState(0.35);
  const [humSpatialAmpRh, setHumSpatialAmpRh] = useState(0.1);
  const [humSpatialSmooth, setHumSpatialSmooth] = useState(12);
  const [humTemporalSigmaRh, setHumTemporalSigmaRh] = useState(0.02);
  const [humTauSteps, setHumTauSteps] = useState(8.0);
  const [humSeed, setHumSeed] = useState(456);

  // Fire ↔ Weather coupling
  const [fireWxEnabled, setFireWxEnabled] = useState(false);
  const [fireWxTempRefC, setFireWxTempRefC] = useState(20.0);
  const [fireWxRhRef, setFireWxRhRef] = useState(0.35);

  // UI names; manifest must send temp_gain / rh_gain
  const [fireWxKTemp, setFireWxKTemp] = useState(0.0);
  const [fireWxKRh, setFireWxKRh] = useState(0.0);

  const [fireWxMultMin, setFireWxMultMin] = useState(0.25);
  const [fireWxMultMax, setFireWxMultMax] = useState(4.0);

  const [created, setCreated] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string>("");

  const PRESET_GROUPS: { label: string; options: { id: PhysicalPresetId; label: string; hint: string }[] }[] = [
    {
      label: "Main comparison · Reference physical worlds",
      options: [
        { id: "reference_center_ideal", label: "Reference · center · ideal", hint: "Clean centered ignition baseline with no extra layers enabled." },
        { id: "reference_corner_ideal", label: "Reference · corner · ideal", hint: "Harder off-center ignition baseline with no extra layers enabled." },
      ],
    },
    {
      label: "Diagnostic · Layer isolation",
      options: [
        { id: "terrain_only", label: "Terrain only", hint: "Terrain and slope effects isolated from other layers." },
        { id: "wind_static_only", label: "Wind only · static", hint: "Static wind bias isolated from terrain, fuels, and weather." },
        { id: "wind_dynamic_only", label: "Wind only · dynamic", hint: "Dynamic wind field test for backend time-varying wind logic." },
        { id: "fuels_only_patchy", label: "Fuels only · patchy", hint: "Categorical fuels map isolated for spread heterogeneity testing." },
        { id: "weather_coupling_combined", label: "Weather coupling · combined", hint: "Temperature/humidity fields plus fire-weather spread multiplier." },
      ],
    },
    {
      label: "Combined worlds · interaction tests",
      options: [
        { id: "combined_balanced", label: "Combined · balanced", hint: "Moderate terrain, dynamic wind, contrasting fuels, and weather coupling together in one readable synthetic world." },
        { id: "wind_terrain_combined", label: "Combined · wind + terrain", hint: "Slope structure and dynamic wind together, without fuels or weather confounds." },
        { id: "fuels_weather_combined", label: "Combined · fuels + weather", hint: "Contrasting fuels plus temperature/humidity coupling, without terrain or wind." },
      ],
    },
    {
      label: "Diagnostic · Smoke / regression",
      options: [
        { id: "smoke_small_grid", label: "Smoke test · small grid", hint: "Fast small-grid regression preset for backend sanity checks." },
      ],
    },
  ];

  // Basic validation / normalization
  const norm = useMemo(() => {
    const Hn = clampInt(H, 5, 2000);
    const Wn = clampInt(W, 5, 2000);
    const Tn = clampInt(T, 2, 5000);
    const dtn = clampInt(dtSeconds, 1, 365 * 24 * 3600);

    const r = clampInt(ignR, 0, Hn - 1);
    const c = clampInt(ignC, 0, Wn - 1);
    const rad = clampInt(ignRadius, 0, 500);

    // Canonical backend schema allows ignition at t=0 and requires t_max < T
    const tmin = clampInt(ignTmin, 0, Tn - 1);
    const tmax = clampInt(ignTmax, tmin, Tn - 1);

    return { Hn, Wn, Tn, dtn, r, c, rad, tmin, tmax };
  }, [H, W, T, dtSeconds, ignR, ignC, ignRadius, ignTmin, ignTmax]);

  function setCoreDefaults() {
    setH(150);
    setW(150);
    setCell(250);
    setCrs("EPSG:3978");
    setT(72);
    setDtSeconds(3600);
    setSeed(0);

    setIgnR(75);
    setIgnC(75);
    setIgnRadius(0);
    setIgnTmin(0);
    setIgnTmax(0);
    setIgnSeed(123);

    setNeighborhood("moore");
    setMode("stochastic");
    setBurnTime(4);
    setSpreadBase(0.35);
    setDetThresh(0.5);
    setWindGain(0.0);
    setSlopeGain(0.0);

    setTerrainEnabled(false);
    setTerrainSeed(42);
    setTerrainAmp(250);
    setTerrainSmooth(8);

    setWindEnabled(false);
    setWindU(0);
    setWindV(0);
    setWindDynamic(false);
    setWindSeed(0);
    setWindSpatialAmp(0.0);
    setWindSpatialSmooth(10);
    setWindTemporalSigma(0.25);
    setWindTauSteps(6.0);
    setWindTerrainGain(0.0);

    setFuelsEnabled(false);
    setFuelsPreset("fort_mcmurray");
    setFuelCode1("C2");
    setFuelW1(0.55);
    setFuelCode2("C3");
    setFuelW2(0.30);
    setFuelCode3("M1");
    setFuelW3(0.15);
    setFuelsSeed(7);
    setFuelsPatchIters(10);
    setFuelsTerrainCorr(0.0);

    setWeatherEnabled(false);

    setTempEnabled(true);
    setTempDynamic(true);
    setTempBaseC(20.0);
    setTempSpatialAmpC(3.0);
    setTempSpatialSmooth(12);
    setTempTemporalSigmaC(0.5);
    setTempTauSteps(8.0);
    setTempSeed(123);

    setHumEnabled(true);
    setHumDynamic(true);
    setHumBaseRh(0.35);
    setHumSpatialAmpRh(0.1);
    setHumSpatialSmooth(12);
    setHumTemporalSigmaRh(0.02);
    setHumTauSteps(8.0);
    setHumSeed(456);

    setFireWxEnabled(false);
    setFireWxTempRefC(20.0);
    setFireWxRhRef(0.35);
    setFireWxKTemp(0.0);
    setFireWxKRh(0.0);
    setFireWxMultMin(0.25);
    setFireWxMultMax(4.0);
  }

  function setExtendedWorld() {
    setH(200);
    setW(200);
    setT(96);
  }

  function applyFuelPreset(preset: FuelPreset) {
    const p = FUEL_PRESETS[preset];
    setFuelCode1(p.codes[0] ?? "");
    setFuelW1(p.weights[0] ?? 0);
    setFuelCode2(p.codes[1] ?? "");
    setFuelW2(p.weights[1] ?? 0);
    setFuelCode3(p.codes[2] ?? "");
    setFuelW3(p.weights[2] ?? 0);
  }

  function ensureAtLeastOneWeatherFieldEnabled() {
    if (!tempEnabled && !humEnabled) {
      setTempEnabled(true);
      setTempDynamic(true);
    }
  }

  function applyPreset(id: PhysicalPresetId) {
    if (!id) return;

    setErr("");
    setCreated("");

    switch (id) {
      case "reference_center_ideal":
        setCoreDefaults();
        setH(150);
        setW(150);
        setT(72);
        setIgnR(75);
        setIgnC(75);
        setIgnRadius(0);
        setIgnTmin(0);
        setIgnTmax(0);
        setTerrainEnabled(false);
        setWindEnabled(false);
        setFuelsEnabled(false);
        setWeatherEnabled(false);
        setFireWxEnabled(false);
        setWindGain(0.0);
        setSlopeGain(0.0);
        return;

      case "reference_corner_ideal":
        setCoreDefaults();
        setH(150);
        setW(150);
        setT(168);
        setIgnR(15);
        setIgnC(15);
        setIgnRadius(0);
        setIgnTmin(0);
        setIgnTmax(0);
        setTerrainEnabled(false);
        setWindEnabled(false);
        setFuelsEnabled(false);
        setWeatherEnabled(false);
        setFireWxEnabled(false);
        setWindGain(0.0);
        setSlopeGain(0.0);
        return;

      case "terrain_only":
        setCoreDefaults();
        setExtendedWorld();
        setT(224);
        setIgnR(100);
        setIgnC(100);
        setTerrainEnabled(true);
        setTerrainSeed(40);
        setTerrainAmp(4000);
        setTerrainSmooth(64);
        setSlopeGain(10.0);
        setWindGain(0.0);
        setWindEnabled(false);
        setFuelsEnabled(false);
        setWeatherEnabled(false);
        setFireWxEnabled(false);
        return;

      case "wind_static_only":
        setCoreDefaults();
        setExtendedWorld();
        setT(144);
        setIgnR(100);
        setIgnC(25);
        setWindEnabled(true);
        setWindDynamic(false);
        setWindU(4.0);
        setWindV(0.0);
        setWindGain(1.0);
        setSlopeGain(0.0);
        setTerrainEnabled(false);
        setFuelsEnabled(false);
        setWeatherEnabled(false);
        setFireWxEnabled(false);
        return;

      case "wind_dynamic_only":
        setCoreDefaults();
        setExtendedWorld();
        setT(192);
        setIgnR(100);
        setIgnC(25);
        setWindEnabled(true);
        setWindDynamic(true);
        setWindU(2.0);
        setWindV(0.0);
        setWindSeed(0);
        setWindSpatialAmp(1.5);
        setWindSpatialSmooth(10);
        setWindTemporalSigma(0.25);
        setWindTauSteps(6.0);
        setWindTerrainGain(0.0);
        setWindGain(1.0);
        setSlopeGain(0.0);
        setTerrainEnabled(false);
        setFuelsEnabled(false);
        setWeatherEnabled(false);
        setFireWxEnabled(false);
        return;

      case "fuels_only_patchy":
        setCoreDefaults();
        setExtendedWorld();
        setT(112);
        setIgnR(100);
        setIgnC(100);
        setFuelsEnabled(true);
        // Use a stronger-contrast custom trio for this diagnostic preset
        // so fuel-dependent spread differences are easier to see.
        setFuelsPreset("fort_mcmurray");
        setFuelCode1("C2");
        setFuelW1(0.40);
        setFuelCode2("D1");
        setFuelW2(0.35);
        setFuelCode3("O1A");
        setFuelW3(0.25);
        setFuelsSeed(7);
        setFuelsPatchIters(10);
        setFuelsTerrainCorr(0.0);
        setTerrainEnabled(false);
        setWindEnabled(false);
        setWeatherEnabled(false);
        setFireWxEnabled(false);
        setWindGain(0.0);
        setSlopeGain(0.0);
        return;

      case "weather_coupling_combined":
        setCoreDefaults();
        setExtendedWorld();
        setT(112);
        setIgnR(100);
        setIgnC(100);
        setWeatherEnabled(true);
        setTempEnabled(true);
        setTempDynamic(true);
        setTempBaseC(20.0);
        setTempSpatialAmpC(3.0);
        setTempSpatialSmooth(48);
        setTempTemporalSigmaC(0.5);
        setTempTauSteps(8.0);
        setTempSeed(123);
        setHumEnabled(true);
        setHumDynamic(true);
        setHumBaseRh(0.35);
        setHumSpatialAmpRh(0.10);
        setHumSpatialSmooth(48);
        setHumTemporalSigmaRh(0.02);
        setHumTauSteps(8.0);
        setHumSeed(456);
        setFireWxEnabled(true);
        setFireWxTempRefC(20.0);
        setFireWxRhRef(0.35);
        setFireWxKTemp(0.10);
        setFireWxKRh(0.25);
        setFireWxMultMin(0.25);
        setFireWxMultMax(4.0);
        setTerrainEnabled(false);
        setWindEnabled(false);
        setFuelsEnabled(false);
        return;

      case "combined_balanced":
        setCoreDefaults();
        setExtendedWorld();
        setT(168);
        setIgnR(100);
        setIgnC(40);

        setTerrainEnabled(true);
        setTerrainSeed(40);
        setTerrainAmp(3200);
        setTerrainSmooth(40);
        setSlopeGain(10.0);

        setWindEnabled(true);
        setWindDynamic(true);
        setWindU(1.5);
        setWindV(0.5);
        setWindSeed(0);
        setWindSpatialAmp(1.0);
        setWindSpatialSmooth(12);
        setWindTemporalSigma(0.18);
        setWindTauSteps(8.0);
        setWindTerrainGain(0.0);
        setWindGain(0.8);

        setFuelsEnabled(true);
        setFuelsPreset("fort_mcmurray");
        setFuelCode1("C2");
        setFuelW1(0.40);
        setFuelCode2("D1");
        setFuelW2(0.35);
        setFuelCode3("O1A");
        setFuelW3(0.25);
        setFuelsSeed(7);
        setFuelsPatchIters(12);
        setFuelsTerrainCorr(0.20);

        setWeatherEnabled(true);
        setTempEnabled(true);
        setTempDynamic(true);
        setTempBaseC(20.0);
        setTempSpatialAmpC(2.5);
        setTempSpatialSmooth(40);
        setTempTemporalSigmaC(0.35);
        setTempTauSteps(8.0);
        setTempSeed(123);
        setHumEnabled(true);
        setHumDynamic(true);
        setHumBaseRh(0.35);
        setHumSpatialAmpRh(0.08);
        setHumSpatialSmooth(40);
        setHumTemporalSigmaRh(0.015);
        setHumTauSteps(8.0);
        setHumSeed(456);

        setFireWxEnabled(true);
        setFireWxTempRefC(20.0);
        setFireWxRhRef(0.35);
        setFireWxKTemp(0.08);
        setFireWxKRh(0.20);
        setFireWxMultMin(0.40);
        setFireWxMultMax(2.50);
        return;

      case "wind_terrain_combined":
        setCoreDefaults();
        setExtendedWorld();
        setT(192);
        setIgnR(100);
        setIgnC(40);

        setTerrainEnabled(true);
        setTerrainSeed(40);
        setTerrainAmp(3800);
        setTerrainSmooth(80);
        setSlopeGain(10.0);

        setWindEnabled(true);
        setWindDynamic(true);
        setWindU(1.8);
        setWindV(0.0);
        setWindSeed(0);
        setWindSpatialAmp(1.1);
        setWindSpatialSmooth(12);
        setWindTemporalSigma(0.20);
        setWindTauSteps(8.0);
        setWindTerrainGain(0.0);
        setWindGain(0.9);

        setFuelsEnabled(false);
        setWeatherEnabled(false);
        setFireWxEnabled(false);
        return;

      case "fuels_weather_combined":
        setCoreDefaults();
        setExtendedWorld();
        setT(144);
        setIgnR(100);
        setIgnC(100);

        setTerrainEnabled(false);
        setWindEnabled(false);
        setWindGain(0.0);
        setSlopeGain(0.0);

        setFuelsEnabled(true);
        setFuelsPreset("fort_mcmurray");
        setFuelCode1("C2");
        setFuelW1(0.40);
        setFuelCode2("D1");
        setFuelW2(0.35);
        setFuelCode3("O1A");
        setFuelW3(0.25);
        setFuelsSeed(7);
        setFuelsPatchIters(12);
        setFuelsTerrainCorr(0.0);

        setWeatherEnabled(true);
        setTempEnabled(true);
        setTempDynamic(true);
        setTempBaseC(20.0);
        setTempSpatialAmpC(3.0);
        setTempSpatialSmooth(48);
        setTempTemporalSigmaC(0.40);
        setTempTauSteps(8.0);
        setTempSeed(123);
        setHumEnabled(true);
        setHumDynamic(true);
        setHumBaseRh(0.35);
        setHumSpatialAmpRh(0.10);
        setHumSpatialSmooth(48);
        setHumTemporalSigmaRh(0.02);
        setHumTauSteps(8.0);
        setHumSeed(456);

        setFireWxEnabled(true);
        setFireWxTempRefC(20.0);
        setFireWxRhRef(0.35);
        setFireWxKTemp(0.10);
        setFireWxKRh(0.25);
        setFireWxMultMin(0.35);
        setFireWxMultMax(3.00);
        return;

      case "smoke_small_grid":
        setCoreDefaults();
        setH(40);
        setW(40);
        setT(16);
        setIgnR(20);
        setIgnC(20);
        setIgnRadius(0);
        setIgnTmin(0);
        setIgnTmax(0);
        setBurnTime(3);
        setSpreadBase(0.30);
        setTerrainEnabled(false);
        setWindEnabled(false);
        setFuelsEnabled(false);
        setWeatherEnabled(false);
        setFireWxEnabled(false);
        setWindGain(0.0);
        setSlopeGain(0.0);
        return;
    }
  }

  const presetLabel =
    presetId === "reference_center_ideal" ? "Reference center ideal" :
    presetId === "reference_corner_ideal" ? "Reference corner ideal" :
    presetId === "terrain_only" ? "Terrain only" :
    presetId === "wind_static_only" ? "Wind static only" :
    presetId === "wind_dynamic_only" ? "Wind dynamic only" :
    presetId === "fuels_only_patchy" ? "Fuels only patchy" :
    presetId === "weather_coupling_combined" ? "Weather coupling combined" :
    presetId === "combined_balanced" ? "Combined balanced" :
    presetId === "wind_terrain_combined" ? "Wind and terrain combined" :
    presetId === "fuels_weather_combined" ? "Fuels and weather combined" :
    presetId === "smoke_small_grid" ? "Smoke small grid" :
    "Custom";

  const windSummary = !windEnabled
    ? "wind=off"
    : windDynamic
    ? `wind=dynamic u0=${windU},v0=${windV}`
    : `wind=static u=${windU},v=${windV}`;

  const terrainSummary = terrainEnabled ? `terrain=on amp=${terrainAmp}` : "terrain=off";
  const fuelsSummary = fuelsEnabled ? `fuels=on ${fuelsPreset}` : "fuels=off";
  const weatherSummary = weatherEnabled ? "weather=on" : "weather=off";
  const couplingSummary = fireWxEnabled ? "coupling=on" : "coupling=off";

  const runSummary = [
    `Preset: ${presetLabel}`,
    `grid=${H}×${W}`,
    `T=${T}`,
    `dt=${dtSeconds}s`,
    `ign=(${ignR},${ignC}) r=${ignRadius} t=[${ignTmin},${ignTmax}]`,
    `fire=${mode} ${neighborhood}`,
    terrainSummary,
    windSummary,
    fuelsSummary,
    weatherSummary,
    couplingSummary,
  ].join(" · ");

  const ignitionSummary =
    ignTmin === ignTmax
      ? `fixed ignition at t=${ignTmin}`
      : `ignition window t=[${ignTmin},${ignTmax}]`;

  const gridSummary = `${H}×${W} cells · ${T} steps · dt=${dtSeconds}s · cell=${cell}m`;

  const fireCoreSummary = [
    `${mode} spread`,
    neighborhood === "moore" ? "Moore neighborhood" : "Von Neumann neighborhood",
    `spread_base=${spreadBase.toFixed(2)}`,
    `burn=${burnTime} steps`,
  ].join(" · ");

  const terrainDetailSummary = terrainEnabled
    ? `enabled · amp=${terrainAmp} · smooth=${terrainSmooth} · slope_gain=${slopeGain.toFixed(2)}`
    : `disabled · slope_gain=${slopeGain.toFixed(2)}`;

  const windDetailSummary = !windEnabled
    ? `disabled · wind_gain=${windGain.toFixed(2)}`
    : windDynamic
    ? `dynamic · u0=${windU}, v0=${windV} · spatial_amp=${windSpatialAmp} · τ=${windTauSteps} · wind_gain=${windGain.toFixed(2)}`
    : `static · u=${windU}, v=${windV} · wind_gain=${windGain.toFixed(2)}`;

  const fuelsDetailSummary = !fuelsEnabled
    ? "disabled"
    : `${fuelsPreset} · seed=${fuelsSeed} · patch_iters=${fuelsPatchIters} · terrain_corr=${fuelsTerrainCorr.toFixed(2)}`;

  const weatherDetailSummary = !weatherEnabled
    ? "disabled"
    : [
        tempEnabled ? `temp ${tempDynamic ? "dynamic" : "static"} base=${tempBaseC}°C` : null,
        humEnabled ? `humidity ${humDynamic ? "dynamic" : "static"} base=${humBaseRh}` : null,
      ]
        .filter(Boolean)
        .join(" · ");

  const couplingDetailSummary = !fireWxEnabled
    ? "disabled"
    : `enabled · temp_gain=${fireWxKTemp.toFixed(2)} · rh_gain=${fireWxKRh.toFixed(2)} · clamp=[${fireWxMultMin}, ${fireWxMultMax}]`;
  const configWarnings = useMemo(() => {
    const warnings: string[] = [];

    if (terrainEnabled && slopeGain === 0) {
      warnings.push("Terrain is enabled, but slope_gain=0, so terrain is stored but does not currently influence spread.");
    }

    if (windEnabled && windGain === 0) {
      warnings.push("Wind is enabled, but wind_gain=0, so wind is stored but does not currently influence spread.");
    }

    if (fuelsEnabled && !terrainEnabled && fuelsTerrainCorr > 0) {
      warnings.push("Fuels terrain correlation is nonzero while terrain is disabled. That setting is not acting as a clean fuels-only control.");
    }

    if (weatherEnabled && !fireWxEnabled) {
      warnings.push("Weather fields are enabled for storage and visualization, but they do not currently influence fire because fire-weather coupling is off.");
    }

    if (fireWxEnabled && !weatherEnabled) {
      warnings.push("Fire-weather coupling implies stored weather fields. The manifest builder will auto-enable weather for consistency.");
    }

    if (mode === "stochastic" && detThresh !== 0.5) {
      warnings.push("det_threshold is currently set away from its default, but it only matters in deterministic mode.");
    }

    return warnings;
  }, [
    terrainEnabled,
    slopeGain,
    windEnabled,
    windGain,
    fuelsEnabled,
    terrainEnabled,
    fuelsTerrainCorr,
    weatherEnabled,
    fireWxEnabled,
    mode,
    detThresh,
  ]);

  const expectedSignatureText = useMemo(() => {
    switch (presetId) {
      case "reference_center_ideal":
        return "Expected signature: roughly symmetric growth around a centered ignition, with no directional bias from wind, terrain, fuels, or weather.";
      case "reference_corner_ideal":
        return "Expected signature: the same clean baseline spread law, but with boundary and geometry effects made more visible by off-center ignition.";
      case "terrain_only":
        return "Expected signature: spread asymmetry should follow the synthetic slope structure rather than a single imposed direction.";
      case "wind_static_only":
        return "Expected signature: the fire front should tilt and extend in a stable imposed wind direction over time.";
      case "wind_dynamic_only":
        return "Expected signature: directional bias should vary over time because the wind field combines fixed spatial heterogeneity with temporal drift.";
      case "fuels_only_patchy":
        return "Expected signature: spread should accelerate, slow, or fragment across strongly contrasting fuel patches without wind, terrain, or weather-driven directional bias.";
      case "weather_coupling_combined":
        return "Expected signature: hotter and drier cells should become relatively more permissive to spread when the configured gains are positive, with spatial structure plus temporal drift in the stored fields.";
      case "combined_balanced":
        return "Expected signature: no single mechanism should dominate. Fire shape and rate should reflect readable joint effects from terrain, dynamic wind, contrasting fuels, and coupled weather.";
      case "wind_terrain_combined":
        return "Expected signature: perimeter shape should reflect the interaction of slope structure and time-varying wind, without patchy fuels or weather fields competing for interpretation.";
      case "fuels_weather_combined":
        return "Expected signature: local spread differences should reflect both strong categorical fuel contrasts and broad weather permissiveness patterns, without directional wind or terrain effects.";
      case "smoke_small_grid":
        return "Expected signature: a fast regression run that exercises manifest creation, field generation, fire stepping, and visualization without requiring rich interpretation.";
      default:
        return "Expected signature: interpret behavior from the active layers shown in the summary cards and configuration warnings.";
    }
  }, [presetId]);

  const worldIsolationText = useMemo(() => {
    switch (presetId) {
      case "reference_center_ideal":
        return "A clean centered reference world with no extra physical modifiers enabled. Use this to verify baseline fire growth, rendering, and downstream Belief Lab / Operational behavior without wind, terrain, fuels, or weather confounds.";
      case "reference_corner_ideal":
        return "A clean off-center reference world intended to make search and geometry effects easier to see later in Operational runs. This is the harder baseline physical case.";
      case "terrain_only":
        return "This world is intended to isolate terrain-driven spread structure. With terrain enabled and nonzero slope gain, any directional or shape asymmetry should come primarily from elevation and slope rather than wind, fuels, or weather.";
      case "wind_static_only":
        return "This world is intended to isolate a fixed wind field. It is the simplest directional spread test and is useful for checking whether static wind bias behaves as expected in the backend and visualizer.";
      case "wind_dynamic_only":
        return "This world is intended to isolate time-varying wind. In the current backend this means fixed spatial heterogeneity plus temporal drift, without terrain, fuels, or weather coupling complicating the interpretation.";
      case "fuels_only_patchy":
        return "This world is intended to isolate heterogeneous fuels using a deliberately high-contrast categorical mix. Spread differences should emerge from the categorical fuels landscape, making it useful for checking patch generation and fuel-sensitive fire behavior without wind, terrain, or weather modifiers.";
      case "weather_coupling_combined":
        return "This world is intended to isolate temperature and humidity fields together with fire-weather coupling. In the current backend the fields use fixed spatial structure plus temporal drift, making this a useful diagnostic without wind, terrain, or fuels confounds.";
      case "combined_balanced":
        return "This world is intended as the main full-but-readable synthetic environment. Terrain, dynamic wind, contrasting fuels, and weather coupling are all active, but kept at moderate strengths so their interaction remains scientifically interpretable.";
      case "wind_terrain_combined":
        return "This world is intended to show how terrain-driven structure and dynamic wind compete or reinforce one another. It is a cleaner structural interaction test than a full-stack world because fuels and weather are absent.";
      case "fuels_weather_combined":
        return "This world is intended to show how broad coupled weather permissiveness interacts with a strongly contrasting categorical fuel landscape. It is a cleaner heterogeneity interaction test than a full-stack world because terrain and wind are absent.";
      case "smoke_small_grid":
        return "This is a fast regression world for backend smoke tests. Use it to check that basic manifest creation, field generation, fire stepping, and visualization still work after code changes. It is not intended for rich trend interpretation.";
      default:
        return "This world combines the currently selected physical layers. Use the summary cards below to verify which mechanisms are active before generating a run.";
    }
  }, [presetId]);

  const worldIntentTags = useMemo(() => {
    const tags: string[] = [];
    if (terrainEnabled) tags.push("terrain");
    if (windEnabled) tags.push(windDynamic ? "dynamic wind" : "static wind");
    if (fuelsEnabled) tags.push("fuels");
    if (weatherEnabled) tags.push("weather fields");
    if (fireWxEnabled) tags.push("fire-weather coupling");
    if (tags.length === 0) tags.push("clean baseline");
    if (ignR < Math.floor(H / 3) && ignC < Math.floor(W / 3)) tags.push("off-center ignition");
    else tags.push("centered ignition");
    return tags.join(" · ");
  }, [terrainEnabled, windEnabled, windDynamic, fuelsEnabled, weatherEnabled, fireWxEnabled, ignR, ignC, H, W]);

  async function createAndRun() {
    setErr("");
    setCreated("");
    setBusy(true);

    try {
      // If coupling is enabled, weather must be enabled (so arrays exist/stored)
      const weatherEnabledFinal = weatherEnabled || fireWxEnabled;

      if (weatherEnabledFinal && !tempEnabled && !humEnabled) {
        setErr("Weather is enabled, but neither Temperature nor Humidity is enabled. Enable at least one.");
        return;
      }

      const rawCodes = [fuelCode1, fuelCode2, fuelCode3].map((s) => String(s ?? "").trim().toUpperCase());
      const rawWeights = [fuelW1, fuelW2, fuelW3].map((x) => (Number.isFinite(x) ? x : 0));

      const pairs = rawCodes.map((code, i) => ({ code, w: rawWeights[i] })).filter((p) => p.code.length > 0);

      let dominant_codes = pairs.slice(0, 3).map((p) => p.code);
      let dominant_weights = pairs.slice(0, 3).map((p) => clampNum(p.w, 0, 1e9));

      if (fuelsEnabled && dominant_codes.length === 0) {
        const fallback = FUEL_PRESETS[fuelsPreset];
        dominant_codes = fallback.codes.slice(0, 3);
        dominant_weights = fallback.weights.slice(0, 3);
      }

      if (dominant_weights.length !== dominant_codes.length) {
        dominant_weights = dominant_codes.map((_, i) => clampNum(dominant_weights[i] ?? 0, 0, 1e9));
      }

      if (fuelsEnabled) {
        const s = dominant_weights.reduce((a, b) => a + b, 0);
        if (!(s > 0)) {
          const fallback = FUEL_PRESETS[fuelsPreset];
          dominant_codes = fallback.codes.slice(0, 3);
          dominant_weights = fallback.weights.slice(0, 3);
        }
      }

      const multMin = clampNum(fireWxMultMin, 1e-6, 1e6);
      let multMax = clampNum(fireWxMultMax, 1e-6, 1e6);
      if (multMax < multMin) multMax = multMin;

      const manifest = {
        grid: {
          H: norm.Hn,
          W: norm.Wn,
          cell_size_m: clampNum(cell, 1, 10_000),
          crs_code: crs,
          origin_x: 0.0,
          origin_y: 0.0,
        },
        dt_seconds: norm.dtn,
        horizon_steps: norm.Tn,
        seed: clampInt(seed, 0, 2_000_000_000),

        terrain: {
          enabled: terrainEnabled,
          seed: clampInt(terrainSeed, 0, 2_000_000_000),
          amplitude: clampNum(terrainAmp, 0, 1_000_000),
          smooth_iters: clampInt(terrainSmooth, 0, 200),
        },

        wind: {
          enabled: windEnabled,
          u: clampNum(windU, -1000, 1000),
          v: clampNum(windV, -1000, 1000),
          units: "m/s",

          dynamic: windDynamic,
          seed: clampInt(windSeed, 0, 2_000_000_000),

          spatial_amp: clampNum(windSpatialAmp, 0, 1000),
          spatial_smooth_iters: clampInt(windSpatialSmooth, 0, 200),

          temporal_sigma: clampNum(windTemporalSigma, 0, 1000),
          tau_steps: clampNum(windTauSteps, 1e-3, 1e6),

          terrain_gain: clampNum(windTerrainGain, 0, 1000),
        },

        weather: {
          enabled: weatherEnabledFinal,

          temperature: {
            enabled: weatherEnabledFinal && tempEnabled,
            dynamic: weatherEnabledFinal && tempEnabled && tempDynamic,

            base_c: clampNum(tempBaseC, -100.0, 100.0),
            spatial_amp_c: clampNum(tempSpatialAmpC, 0.0, 1000.0),
            spatial_smooth_iters: clampInt(tempSpatialSmooth, 0, 200),

            temporal_sigma_c: clampNum(tempTemporalSigmaC, 0.0, 1000.0),
            tau_steps: clampNum(tempTauSteps, 1e-3, 1e6),

            seed: clampInt(tempSeed, 0, 2_000_000_000),
          },

          humidity: {
            enabled: weatherEnabledFinal && humEnabled,
            dynamic: weatherEnabledFinal && humEnabled && humDynamic,

            base_rh: clampNum(humBaseRh, 0.0, 1.0),
            spatial_amp_rh: clampNum(humSpatialAmpRh, 0.0, 1.0),
            spatial_smooth_iters: clampInt(humSpatialSmooth, 0, 200),

            temporal_sigma_rh: clampNum(humTemporalSigmaRh, 0.0, 1.0),
            tau_steps: clampNum(humTauSteps, 1e-3, 1e6),

            seed: clampInt(humSeed, 0, 2_000_000_000),
          },
        },

        fuels: {
          enabled: fuelsEnabled,
          preset: fuelsPreset,
          dominant_codes,
          dominant_weights,
          seed: clampInt(fuelsSeed, 0, 2_000_000_000),
          patch_iters: clampInt(fuelsPatchIters, 0, 10_000),
          terrain_correlation: clampNum(fuelsTerrainCorr, 0, 1),
          spread_mult: {},
          burn_mult: {},
        },

        fire: {
          model: "anisotropic",
          mode,
          neighborhood,

          spread_prob_base: clampNum(spreadBase, 0, 1),
          burn_time_steps: clampInt(burnTime, 1, 10_000),

          wind_gain: clampNum(windGain, -10, 10),
          slope_gain: clampNum(slopeGain, -10, 10),

          det_threshold: clampNum(detThresh, 0, 1),

          weather_coupling: {
            enabled: !!fireWxEnabled,
            affects: "spread_prob",

            temp_ref_c: clampNum(fireWxTempRefC, -100.0, 100.0),
            rh_ref: clampNum(fireWxRhRef, 0.0, 1.0),

            temp_gain: clampNum(fireWxKTemp, -10.0, 10.0),
            rh_gain: clampNum(fireWxKRh, -10.0, 10.0),

            mult_min: multMin,
            mult_max: multMax,
          },

          ignitions: [
            {
              row: norm.r,
              col: norm.c,
              t0: null,
              radius_cells: norm.rad,
            },
          ],

          ignition_window: {
            t_min: norm.tmin,
            t_max: norm.tmax,
            seed: clampInt(ignSeed, 0, 2_000_000_000),
          },

          spotting: { enabled: false, prob: 0.0, radius_cells: 10, seed: 0 },
        },
      };

      const createRes = await postJSON<any>("/physical/manifest", manifest);
      const phy_id: string | undefined = createRes?.phy_id ?? createRes?.id ?? createRes?.data?.phy_id;
      if (!phy_id || typeof phy_id !== "string") {
        throw new Error("Backend did not return a phy_id from /physical/manifest");
      }

      const runRes = await postJSON<OkRes>("/physical/run", { id: phy_id });
      console.log("POST /physical/run response:", runRes);

      setCreated(phy_id);
    } catch (e: any) {
      const msg = typeof e?.message === "string" ? e.message : "Unknown error";
      console.error("createAndRun error:", e);
      setErr(msg);
    } finally {
      setBusy(false);
    }
  }

  function openInVisualizer() {
    if (!created) return;
    router.push(`/physical/visualizer?id=${encodeURIComponent(created)}`);
  }

  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>Physical Designer</h2>
      <div aria-hidden className="section-stripe section-stripe--physical" />
      <div className="small" style={{ opacity: 0.86, lineHeight: 1.45, marginTop: 8 }}>
        The Physical Designer builds the underlying wildfire world used by AWSRT:
        grid, ignition, fire spread law, terrain, wind, fuels, weather, and optional fire-weather coupling.
        It is the environment layer that Belief Lab and Operational later consume.
      </div>

      <div className="card" style={{ marginTop: 10 }}>
        <h2 style={{ marginTop: 0 }}>Physical preset taxonomy</h2>
        <div className="small" style={{ opacity: 0.85, lineHeight: 1.45 }}>
          Presets populate the physical-world controls but do not auto-run.
          Main comparison presets are intended as stable reference worlds.
          Diagnostic presets isolate terrain, wind, fuels, weather, or fast regression cases
          so backend generation logic can be tested one layer at a time.
        </div>

        <div className="row" style={{ marginTop: 10, alignItems: "center" }}>
          <label>Taxonomy</label>
          <select
            value={presetId}
            onChange={(e) => setPresetId(e.target.value as PhysicalPresetId)}
            disabled={busy}
            style={{ minWidth: 360 }}
            title="Pick a standardized physical world, then Apply preset"
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

          <button
            type="button"
            disabled={busy || !presetId}
            onClick={() => applyPreset(presetId)}
          >
            Apply preset
          </button>

          <div className="small" style={{ opacity: 0.75 }}>
            Applying a preset overwrites the relevant physical-world fields.
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 10 }}>
        <h2 style={{ marginTop: 0 }}>Physical experiment summary</h2>
        <div className="small" style={{ opacity: 0.86, lineHeight: 1.5 }}>
          Use this summary to confirm what kind of physical world you are about to generate.
          It is meant to play the same role as the summary panels in the Belief Lab and Operational designers:
          a compact statement of what is active, what is being isolated, and what this configuration is for.
        </div>

        <div className="small" style={{ opacity: 0.8, marginTop: 8 }}>
          Current world intent: <b>{worldIntentTags}</b>
        </div>

        <div className="physGrid" style={{ marginTop: 10 }}>
          <div className="physCard">
            <div className="small physTitle">Grid and timing</div>
            <div className="small physBody">{gridSummary}</div>
          </div>
          <div className="physCard">
            <div className="small physTitle">Ignition</div>
            <div className="small physBody">({ignR}, {ignC}) · radius={ignRadius} · {ignitionSummary}</div>
          </div>
          <div className="physCard">
            <div className="small physTitle">Core fire law</div>
            <div className="small physBody">{fireCoreSummary}</div>
          </div>
          <div className="physCard">
            <div className="small physTitle">Terrain</div>
            <div className="small physBody">{terrainDetailSummary}</div>
          </div>
          <div className="physCard">
            <div className="small physTitle">Wind</div>
            <div className="small physBody">{windDetailSummary}</div>
          </div>
          <div className="physCard">
            <div className="small physTitle">Fuels</div>
            <div className="small physBody">{fuelsDetailSummary}</div>
          </div>
          <div className="physCard">
            <div className="small physTitle">Weather fields</div>
            <div className="small physBody">{weatherDetailSummary}</div>
          </div>
          <div className="physCard">
            <div className="small physTitle">Fire-weather coupling</div>
            <div className="small physBody">{couplingDetailSummary}</div>
          </div>
          <div className="physCard physCard--wide">
            <div className="small physTitle">What this world isolates</div>
            <div className="small physBody">
              <b>{presetLabel}</b>
              <div style={{ marginTop: 6 }}>{worldIsolationText}</div>
              <div style={{ marginTop: 6, opacity: 0.82 }}>
                Read this together with the preset taxonomy and the one-line run summary below.
              </div>
              <div style={{ marginTop: 6 }}>
                <b>Expected signature:</b> {expectedSignatureText}
              </div>
              <div style={{ marginTop: 6, opacity: 0.82 }}>
                The goal is to make it obvious whether this is a clean reference world,
                a layer-isolation test, or a fast regression world.
              </div>
            </div>
          </div>
        </div>
      </div>
      {configWarnings.length > 0 ? (
        <div className="card" style={{ marginTop: 10 }}>
          <h2 style={{ marginTop: 0 }}>Configuration warnings</h2>
          <div className="small" style={{ opacity: 0.86, lineHeight: 1.45 }}>
            These are not hard errors. They flag cases where a layer may be enabled or described in the summary,
            but may not actually influence fire behavior in the way you intend.
          </div>
          <ul className="small" style={{ marginTop: 10, marginBottom: 0, paddingLeft: 18, lineHeight: 1.5 }}>
            {configWarnings.map((w, i) => (
              <li key={`${i}-${w}`}>{w}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {err ? (
        <div className="small" style={{ color: "crimson", marginBottom: 8 }}>
          {err}
        </div>
      ) : null}



      <div className="card" style={{ marginTop: 10 }}>
        <h2 style={{ marginTop: 0 }}>Grid and time</h2>
        <div className="small" style={{ opacity: 0.85, lineHeight: 1.45 }}>
          These parameters define the size, scale, and duration of the simulated world.
          Larger grids and longer horizons are usually better for trend visibility, while small grids are useful for smoke tests.
        </div>
        <div className="row" style={{ marginTop: 10 }}>
          <label>H</label>
          <input type="number" value={H} onChange={(e) => setH(parseIntSafe(e.target.value, H))} />

          <label>W</label>
          <input type="number" value={W} onChange={(e) => setW(parseIntSafe(e.target.value, W))} />

          <label>Cell size (m)</label>
          <input type="number" value={cell} onChange={(e) => setCell(parseFloatSafe(e.target.value, cell))} />

          <label>CRS</label>
          <input value={crs} onChange={(e) => setCrs(e.target.value)} />
        </div>
        <div className="row">
          <label>Horizon (steps)</label>
          <input type="number" value={T} onChange={(e) => setT(parseIntSafe(e.target.value, T))} />

          <label>dt (seconds)</label>
          <input type="number" value={dtSeconds} onChange={(e) => setDtSeconds(parseIntSafe(e.target.value, dtSeconds))} />

          <label>Seed</label>
          <input type="number" value={seed} onChange={(e) => setSeed(parseIntSafe(e.target.value, seed))} />
        </div>
      </div>

      <div className="card" style={{ marginTop: 10 }}>
        <h2 style={{ marginTop: 0 }}>Ignition</h2>
        <div className="small" style={{ opacity: 0.85, lineHeight: 1.45 }}>
          Ignition settings control where fire begins and when it first appears in the episode.
          Use fixed ignition times for cleaner comparison, including t=0 for immediate ignition, or delayed windows to create pre-fire deployment time.
        </div>
        <div className="row" style={{ marginTop: 10 }}>
          <label>Ign row</label>
          <input type="number" value={ignR} onChange={(e) => setIgnR(parseIntSafe(e.target.value, ignR))} />

          <label>Ign col</label>
          <input type="number" value={ignC} onChange={(e) => setIgnC(parseIntSafe(e.target.value, ignC))} />

          <label>Radius (cells)</label>
          <input type="number" value={ignRadius} onChange={(e) => setIgnRadius(parseIntSafe(e.target.value, ignRadius))} />

          <label>t_min</label>
          <input type="number" value={ignTmin} onChange={(e) => setIgnTmin(parseIntSafe(e.target.value, ignTmin))} />

          <label>t_max</label>
          <input type="number" value={ignTmax} onChange={(e) => setIgnTmax(parseIntSafe(e.target.value, ignTmax))} />

          <label>Ign seed</label>
          <input type="number" value={ignSeed} onChange={(e) => setIgnSeed(parseIntSafe(e.target.value, ignSeed))} />
        </div>
        <div className="small" style={{ opacity: 0.85, marginTop: 6 }}>
          Normalized: grid {norm.Hn}×{norm.Wn}, T={norm.Tn}, ignition (r,c)=({norm.r},{norm.c}), window [{norm.tmin},{norm.tmax}]
        </div>
        <div className="small" style={{ opacity: 0.78, marginTop: 6 }}>
          Note: radius currently creates a local ignition patch within the selected neighborhood window; use radius=0 for the cleanest preset comparisons.
        </div>
      </div>

      <div className="card" style={{ marginTop: 10 }}>
        <h2 style={{ marginTop: 0 }}>Fire model</h2>
        <div className="small" style={{ opacity: 0.85, lineHeight: 1.45 }}>
          This card defines the core spread law before optional terrain, wind, fuels, or weather modifiers are applied.
        </div>
        <div className="row" style={{ marginTop: 10 }}>
          <label>Neighborhood</label>
          <select value={neighborhood} onChange={(e) => setNeighborhood(e.target.value as Neighborhood)}>
            <option value="moore">Moore (8)</option>
            <option value="von_neumann">Von Neumann (4)</option>
          </select>

          <label>Mode</label>
          <select value={mode} onChange={(e) => setMode(e.target.value as FireMode)}>
            <option value="stochastic">Stochastic</option>
            <option value="deterministic">Deterministic</option>
          </select>

          <label>Burn time (steps)</label>
          <input type="number" value={burnTime} onChange={(e) => setBurnTime(parseIntSafe(e.target.value, burnTime))} />
        </div>

        <div className="row">
          <label>Spread base</label>
          <input
            type="number"
            step="0.01"
            value={spreadBase}
            onChange={(e) => setSpreadBase(parseFloatSafe(e.target.value, spreadBase))}
          />

          <label>Det thresh</label>
          <input
            type="number"
            step="0.05"
            value={detThresh}
            onChange={(e) => setDetThresh(parseFloatSafe(e.target.value, detThresh))}
          />
          <label>Wind gain</label>
          <input
            type="number"
            step="0.1"
            value={windGain}
            onChange={(e) => setWindGain(parseFloatSafe(e.target.value, windGain))}
          />

          <label>Slope gain</label>
          <input
            type="number"
            step="0.1"
            value={slopeGain}
            onChange={(e) => setSlopeGain(parseFloatSafe(e.target.value, slopeGain))}
          />
        </div>
      </div>

      {/* Fire ↔ Weather coupling */}
      <div className="card" style={{ marginTop: 10 }}>
      <h2 style={{ marginTop: 0 }}>Fire ↔ Weather coupling</h2>
      <div className="small" style={{ opacity: 0.85, lineHeight: 1.45 }}>
        This optional layer multiplies spread probability using the stored temperature and humidity fields.
        It is useful for testing whether fire behavior responds plausibly to weather structure.
      </div>
      <div className="row" style={{ flexWrap: "wrap", marginTop: 10 }}>
        <label>Enabled</label>
        <input
          type="checkbox"
          checked={fireWxEnabled}
          onChange={(e) => {
            const on = e.target.checked;
            setFireWxEnabled(on);
            if (on) {
              setWeatherEnabled(true); // coupling implies stored weather fields
              ensureAtLeastOneWeatherFieldEnabled();
            }
          }}
        />
        <span className="small" style={{ opacity: 0.85 }}>
          Applies a per-cell multiplier to spread probability using temperature/humidity fields.
        </span>
      </div>

      <div className="row" style={{ flexWrap: "wrap", marginTop: 6 }}>
        <label>Temp ref (°C)</label>
        <input
          type="number"
          step="0.5"
          value={fireWxTempRefC}
          onChange={(e) => setFireWxTempRefC(parseFloatSafe(e.target.value, fireWxTempRefC))}
          disabled={!fireWxEnabled}
        />

        <label>RH ref (0..1)</label>
        <input
          type="number"
          step="0.01"
          value={fireWxRhRef}
          onChange={(e) => setFireWxRhRef(parseFloatSafe(e.target.value, fireWxRhRef))}
          disabled={!fireWxEnabled}
        />

        <label>temp_gain</label>
        <input
          type="number"
          step="0.05"
          value={fireWxKTemp}
          onChange={(e) => setFireWxKTemp(parseFloatSafe(e.target.value, fireWxKTemp))}
          disabled={!fireWxEnabled}
        />

        <label>rh_gain</label>
        <input
          type="number"
          step="0.05"
          value={fireWxKRh}
          onChange={(e) => setFireWxKRh(parseFloatSafe(e.target.value, fireWxKRh))}
          disabled={!fireWxEnabled}
        />

        <label>mult_min</label>
        <input
          type="number"
          step="0.05"
          value={fireWxMultMin}
          onChange={(e) => setFireWxMultMin(parseFloatSafe(e.target.value, fireWxMultMin))}
          disabled={!fireWxEnabled}
        />

        <label>mult_max</label>
        <input
          type="number"
          step="0.05"
          value={fireWxMultMax}
          onChange={(e) => setFireWxMultMax(parseFloatSafe(e.target.value, fireWxMultMax))}
          disabled={!fireWxEnabled}
        />
      </div>
      </div>

      <div className="card" style={{ marginTop: 10 }}>
      <h2 style={{ marginTop: 0 }}>Terrain</h2>
      <div className="row" style={{ marginTop: 10 }}>
        <label>Enabled</label>
        <input
          type="checkbox"
          checked={terrainEnabled}
          onChange={(e) => setTerrainEnabled(e.target.checked)}
        />

        <label>Seed</label>
        <input
          type="number"
          value={terrainSeed}
          onChange={(e) => setTerrainSeed(parseIntSafe(e.target.value, terrainSeed))}
          disabled={!terrainEnabled}
        />

        <label>Amp</label>
        <input
          type="number"
          value={terrainAmp}
          onChange={(e) => setTerrainAmp(parseFloatSafe(e.target.value, terrainAmp))}
          disabled={!terrainEnabled}
        />

        <label>Smooth iters</label>
        <input
          type="number"
          value={terrainSmooth}
          onChange={(e) => setTerrainSmooth(parseIntSafe(e.target.value, terrainSmooth))}
          disabled={!terrainEnabled}
        />
      </div>
      <div className="small" style={{ opacity: 0.82, marginTop: 6 }}>
        Terrain creates an elevation field that can later bias spread through the slope term.
        Use this together with nonzero slope gain when you want terrain to matter physically. Lower smoothing values tend to produce broader, coarser terrain structure.
      </div>
      </div>

      <div className="card" style={{ marginTop: 10 }}>
      <h2 style={{ marginTop: 0 }}>Fuels (FBP categorical)</h2>
      <div className="small" style={{ opacity: 0.85, lineHeight: 1.45 }}>
        Fuels create a categorical burn landscape. This is the main way to introduce patchy fire behavior without using wind or terrain.
      </div>
      <div className="row" style={{ flexWrap: "wrap", marginTop: 10 }}>
        <label>Enabled</label>
        <input
          type="checkbox"
          checked={fuelsEnabled}
          onChange={(e) => {
            const on = e.target.checked;
            setFuelsEnabled(on);
            if (on) {
              // If user previously cleared everything, repopulate from preset.
              const codes = [fuelCode1, fuelCode2, fuelCode3].map((s) => String(s ?? "").trim());
              if (codes.every((s) => s.length === 0)) applyFuelPreset(fuelsPreset);
            }
          }}
        />

        <label>Preset</label>
        <select
          value={fuelsPreset}
          onChange={(e) => {
            const p = e.target.value as FuelPreset;
            setFuelsPreset(p);
            applyFuelPreset(p);
          }}
          disabled={!fuelsEnabled}
        >
          <option value="fort_mcmurray">Fort McMurray (C2/C3/M1)</option>
          <option value="boreal_conifer">Boreal conifer-heavy</option>
          <option value="mixedwood">Mixedwood</option>
          <option value="deciduous">Deciduous-heavy</option>
        </select>

        <label>Seed</label>
        <input
          type="number"
          value={fuelsSeed}
          onChange={(e) => setFuelsSeed(parseIntSafe(e.target.value, fuelsSeed))}
          disabled={!fuelsEnabled}
        />

        <label>Patch iters</label>
        <input
          type="number"
          value={fuelsPatchIters}
          onChange={(e) => setFuelsPatchIters(parseIntSafe(e.target.value, fuelsPatchIters))}
          disabled={!fuelsEnabled}
        />

        <label>Terrain corr (0..1)</label>
        <input
          type="number"
          step="0.05"
          value={fuelsTerrainCorr}
          onChange={(e) => setFuelsTerrainCorr(parseFloatSafe(e.target.value, fuelsTerrainCorr))}
          disabled={!fuelsEnabled}
        />
      </div>

      <div className="row" style={{ flexWrap: "wrap" }}>
        <label>Dominant 1</label>
        <input
          value={fuelCode1}
          onChange={(e) => setFuelCode1(e.target.value)}
          style={{ width: 70 }}
          disabled={!fuelsEnabled}
        />
        <label>Weight</label>
        <input
          type="number"
          step="0.05"
          value={fuelW1}
          onChange={(e) => setFuelW1(parseFloatSafe(e.target.value, fuelW1))}
          disabled={!fuelsEnabled}
        />

        <label>Dominant 2</label>
        <input
          value={fuelCode2}
          onChange={(e) => setFuelCode2(e.target.value)}
          style={{ width: 70 }}
          disabled={!fuelsEnabled}
        />
        <label>Weight</label>
        <input
          type="number"
          step="0.05"
          value={fuelW2}
          onChange={(e) => setFuelW2(parseFloatSafe(e.target.value, fuelW2))}
          disabled={!fuelsEnabled}
        />

        <label>Dominant 3</label>
        <input
          value={fuelCode3}
          onChange={(e) => setFuelCode3(e.target.value)}
          style={{ width: 70 }}
          disabled={!fuelsEnabled}
        />
        <label>Weight</label>
        <input
          type="number"
          step="0.05"
          value={fuelW3}
          onChange={(e) => setFuelW3(parseFloatSafe(e.target.value, fuelW3))}
          disabled={!fuelsEnabled}
        />
      </div>
      </div>

      <div className="card" style={{ marginTop: 10 }}>
      <h2 style={{ marginTop: 0 }}>Wind (u,v)</h2>
      <div className="small" style={{ opacity: 0.85, lineHeight: 1.45 }}>
        Wind can be static or dynamic. Static wind is best for clean direction tests; dynamic wind is best for backend verification of fixed spatial heterogeneity plus time-varying drift.
      </div>
      <div className="row" style={{ flexWrap: "wrap", marginTop: 10 }}>
        <label>Enabled</label>
        <input
          type="checkbox"
          checked={windEnabled}
          onChange={(e) => {
            const on = e.target.checked;
            setWindEnabled(on);
            if (!on) setWindDynamic(false);
          }}
        />

        <label>u (m/s)</label>
        <input
          type="number"
          step="0.1"
          value={windU}
          onChange={(e) => setWindU(parseFloatSafe(e.target.value, windU))}
          disabled={!windEnabled}
        />

        <label>v (m/s)</label>
        <input
          type="number"
          step="0.1"
          value={windV}
          onChange={(e) => setWindV(parseFloatSafe(e.target.value, windV))}
          disabled={!windEnabled}
        />
      </div>

      <div className="row" style={{ flexWrap: "wrap" }}>
        <label>Dynamic</label>
        <input
          type="checkbox"
          checked={windDynamic}
          onChange={(e) => {
            const on = e.target.checked;
            if (on && !windEnabled) setWindEnabled(true);
            setWindDynamic(on);
          }}
          disabled={!windEnabled}
        />

        <label>Wind seed</label>
        <input
          type="number"
          value={windSeed}
          onChange={(e) => setWindSeed(parseIntSafe(e.target.value, windSeed))}
          disabled={!windEnabled || !windDynamic}
        />

        <label>Spatial amp (m/s)</label>
        <input
          type="number"
          step="0.1"
          value={windSpatialAmp}
          onChange={(e) => setWindSpatialAmp(parseFloatSafe(e.target.value, windSpatialAmp))}
          disabled={!windEnabled || !windDynamic}
        />

        <label>Spatial smooth</label>
        <input
          type="number"
          value={windSpatialSmooth}
          onChange={(e) => setWindSpatialSmooth(parseIntSafe(e.target.value, windSpatialSmooth))}
          disabled={!windEnabled || !windDynamic}
        />

        <label>Temporal σ (m/s)</label>
        <input
          type="number"
          step="0.05"
          value={windTemporalSigma}
          onChange={(e) => setWindTemporalSigma(parseFloatSafe(e.target.value, windTemporalSigma))}
          disabled={!windEnabled || !windDynamic}
        />

        <label>τ (steps)</label>
        <input
          type="number"
          step="0.5"
          value={windTauSteps}
          onChange={(e) => setWindTauSteps(parseFloatSafe(e.target.value, windTauSteps))}
          disabled={!windEnabled || !windDynamic}
        />

        <label>Terrain gain (m/s)</label>
        <input
          type="number"
          step="0.05"
          value={windTerrainGain}
          onChange={(e) => setWindTerrainGain(parseFloatSafe(e.target.value, windTerrainGain))}
          disabled={!windEnabled || !windDynamic}
        />
      </div>
      </div>

      {/* Weather */}
      <div className="card" style={{ marginTop: 10 }}>
      <h2 style={{ marginTop: 0 }}>Weather (temperature + humidity)</h2>
      <div className="small" style={{ opacity: 0.85, lineHeight: 1.45 }}>
        Weather fields can be stored on their own or used together with fire-weather coupling. In the current backend they use fixed spatial structure plus optional temporal drift, which is useful both for physical validation and for later Belief Lab / Operational experiments.
      </div>
      <div className="row" style={{ flexWrap: "wrap", marginTop: 10 }}>
        <label>Enabled</label>
        <input
          type="checkbox"
          checked={weatherEnabled}
          onChange={(e) => {
            const on = e.target.checked;
            setWeatherEnabled(on);
            if (on) {
              ensureAtLeastOneWeatherFieldEnabled();
            } else {
              setFireWxEnabled(false); // keep coupling consistent with stored fields
            }
          }}
        />
        <span className="small" style={{ opacity: 0.85 }}>
          When enabled, backend stores temperature_c and/or humidity_rh as time-varying [T,H,W] float32 arrays.
        </span>
      </div>

      <div className="row" style={{ flexWrap: "wrap", marginTop: 6 }}>
        <label>Temperature enabled</label>
        <input
          type="checkbox"
          checked={tempEnabled}
          onChange={(e) => {
            const on = e.target.checked;
            setTempEnabled(on);
            if (!on && !humEnabled && weatherEnabled) setHumEnabled(true);
          }}
          disabled={!weatherEnabled}
        />

        <label>Dynamic</label>
        <input
          type="checkbox"
          checked={tempDynamic}
          onChange={(e) => setTempDynamic(e.target.checked)}
          disabled={!weatherEnabled || !tempEnabled}
        />

        <label>Base (°C)</label>
        <input
          type="number"
          step="0.5"
          value={tempBaseC}
          onChange={(e) => setTempBaseC(parseFloatSafe(e.target.value, tempBaseC))}
          disabled={!weatherEnabled || !tempEnabled}
        />

        <label>Spatial amp (°C)</label>
        <input
          type="number"
          step="0.1"
          value={tempSpatialAmpC}
          onChange={(e) => setTempSpatialAmpC(parseFloatSafe(e.target.value, tempSpatialAmpC))}
          disabled={!weatherEnabled || !tempEnabled}
        />

        <label>Smooth iters</label>
        <input
          type="number"
          value={tempSpatialSmooth}
          onChange={(e) => setTempSpatialSmooth(parseIntSafe(e.target.value, tempSpatialSmooth))}
          disabled={!weatherEnabled || !tempEnabled}
        />

        <label>Temporal σ (°C)</label>
        <input
          type="number"
          step="0.05"
          value={tempTemporalSigmaC}
          onChange={(e) => setTempTemporalSigmaC(parseFloatSafe(e.target.value, tempTemporalSigmaC))}
          disabled={!weatherEnabled || !tempEnabled || !tempDynamic}
        />

        <label>τ (steps)</label>
        <input
          type="number"
          step="0.5"
          value={tempTauSteps}
          onChange={(e) => setTempTauSteps(parseFloatSafe(e.target.value, tempTauSteps))}
          disabled={!weatherEnabled || !tempEnabled || !tempDynamic}
        />

        <label>Seed</label>
        <input
          type="number"
          value={tempSeed}
          onChange={(e) => setTempSeed(parseIntSafe(e.target.value, tempSeed))}
          disabled={!weatherEnabled || !tempEnabled}
        />
      </div>

      <div className="row" style={{ flexWrap: "wrap", marginTop: 6 }}>
        <label>Humidity enabled</label>
        <input
          type="checkbox"
          checked={humEnabled}
          onChange={(e) => {
            const on = e.target.checked;
            setHumEnabled(on);
            if (!on && !tempEnabled && weatherEnabled) setTempEnabled(true);
          }}
          disabled={!weatherEnabled}
        />

        <label>Dynamic</label>
        <input
          type="checkbox"
          checked={humDynamic}
          onChange={(e) => setHumDynamic(e.target.checked)}
          disabled={!weatherEnabled || !humEnabled}
        />

        <label>Base (0..1)</label>
        <input
          type="number"
          step="0.01"
          value={humBaseRh}
          onChange={(e) => setHumBaseRh(parseFloatSafe(e.target.value, humBaseRh))}
          disabled={!weatherEnabled || !humEnabled}
        />

        <label>Spatial amp</label>
        <input
          type="number"
          step="0.01"
          value={humSpatialAmpRh}
          onChange={(e) => setHumSpatialAmpRh(parseFloatSafe(e.target.value, humSpatialAmpRh))}
          disabled={!weatherEnabled || !humEnabled}
        />

        <label>Smooth iters</label>
        <input
          type="number"
          value={humSpatialSmooth}
          onChange={(e) => setHumSpatialSmooth(parseIntSafe(e.target.value, humSpatialSmooth))}
          disabled={!weatherEnabled || !humEnabled}
        />

        <label>Temporal σ</label>
        <input
          type="number"
          step="0.005"
          value={humTemporalSigmaRh}
          onChange={(e) => setHumTemporalSigmaRh(parseFloatSafe(e.target.value, humTemporalSigmaRh))}
          disabled={!weatherEnabled || !humEnabled || !humDynamic}
        />

        <label>τ (steps)</label>
        <input
          type="number"
          step="0.5"
          value={humTauSteps}
          onChange={(e) => setHumTauSteps(parseFloatSafe(e.target.value, humTauSteps))}
          disabled={!weatherEnabled || !humEnabled || !humDynamic}
        />

        <label>Seed</label>
        <input
          type="number"
          value={humSeed}
          onChange={(e) => setHumSeed(parseIntSafe(e.target.value, humSeed))}
          disabled={!weatherEnabled || !humEnabled}
        />
      </div>
      </div>

      <div className="row" style={{ alignItems: "center", gap: 10 }}>
        <button onClick={createAndRun} disabled={busy}>
          {busy ? "Running..." : "Generate Physical RUN"}
        </button>

        {created ? (
          <>
            <span className="small">
              Created: <b>{created}</b>
            </span>
            <button onClick={openInVisualizer} style={{ height: 38 }}>
              Open in Visualizer
            </button>
          </>
        ) : null}
      </div>
      <div className="small" style={{ opacity: 0.82, marginTop: 8, lineHeight: 1.35 }}>
        <span title={runSummary} style={{ display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {runSummary}
        </span>
      </div>

      <div className="small" style={{ marginTop: 10}}>
        Tip: set ignition window to a fixed time (e.g., t_min=t_max=10) to see “deployment time” before fire appears.
      </div>

      <div className="small" style={{ marginTop: 6, opacity: 0.85 }}>
        Tip: Fuels are categorical FBP codes; the backend stores a uint8 category-id map and can render a colored fuels PNG. Increase patch iterations for larger contiguous patches.
      </div>

      <div className="small" style={{ marginTop: 10, opacity: 0.85, lineHeight: 1.35 }}>
        <b>How the pieces influence fire (mental model):</b>{" "}
        Fire spread starts from <i>spread_prob_base</i> and then gets biased by the enabled layers:
        <ul style={{ marginTop: 6, marginBottom: 0, paddingLeft: 18 }}>
          <li>
            <b>Wind</b> (if enabled) skews spread direction and strength. Higher <i>wind_gain</i> makes spread more
            aligned with the wind field.
          </li>
          <li>
            <b>Terrain</b> (if enabled) introduces slope effects. Higher <i>slope_gain</i> typically increases
            upslope spread and reduces downslope spread.
          </li>
          <li>
            <b>Fuels</b> (if enabled) changes local spread/burn behavior by fuel category (categorical map).
          </li>
          <li>
            <b>Weather coupling</b> (if enabled) applies a per-cell multiplier based on <b>temperature</b> and/or{" "}
            <b>humidity</b>, clamped to <i>[mult_min, mult_max]</i>. Positive <i>temp_gain</i> generally increases
            spread in hotter cells; positive <i>rh_gain</i> generally reduces spread in more humid cells (depending on sign).
          </li>
        </ul>
        <div style={{ marginTop: 6 }}>
          <i>Tip:</i> If you want to isolate effects, toggle one layer at a time (e.g., wind only, then add terrain,
          then fuels, then weather coupling).
        </div>
      </div>

      <style jsx>{`
        .physGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          align-items: start;
        }

        @media (max-width: 980px) {
          .physGrid {
            grid-template-columns: 1fr;
          }
        }

        .physCard {
          border: 1px solid rgba(0, 0, 0, 0.12);
          background: #fff;
          border-radius: 12px;
          padding: 10px;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
        }

        .physCard--wide {
          grid-column: 1 / -1;
        }

        .physTitle {
          font-weight: 600;
          margin-bottom: 6px;
        }

        .physBody {
          font-size: 12.5px;
          line-height: 1.45;
          color: rgba(0, 0, 0, 0.86);
        }

        .physBody b {
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}


