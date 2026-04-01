"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { deleteJSON, getJSON, imgSrc } from "@/lib/api";
import { PlayBar } from "@/components/PlayBar";
import { RunPicker } from "@/components/RunPicker";

type ListRes = { ids: string[] };
type RunItem = { id: string; label?: string; disabled?: boolean };

type MetaRes = {
  id: string;
  H: number;
  W: number;
  T: number;
  dt_seconds: number;
  horizon_steps: number;
  crs_code: string;
  cell_size_m: number;
};

type FieldsRes = { fields: string[] };

type DeleteRes = { ok: boolean; run_id: string; removed: string[] };

type BgKind = "terrain" | "dem" | "fuels" | "temperature" | "humidity" | "wind" | "blank";
type ImgSize = { w: number; h: number };

const VIEWPORT_W = 860;
const VIEWPORT_H = 484;


function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

/**
 * Keep rendering the previous image until the next src is fully loaded.
 * This prevents transparent overlays (fire/grid) from flickering during playback.
 */
function useAtomicImage(src: string, enabled: boolean = true) {
  // shown is what we actually put in <img src=...>
  const [shown, setShown] = useState<string>("");
  // lastGoodRef tracks the last successfully displayed src
  const lastGoodRef = useRef<string>("");

  useEffect(() => {
    // If disabled or src is empty, do NOT blank the image.
    // The caller controls visibility (by conditional rendering).
    if (!enabled) return;
    if (!src) return;

    // If it's already the one we’re showing, do nothing.
    if (src === lastGoodRef.current) return;

    let alive = true;
    const im = new Image();
    im.decoding = "async";
    im.onload = async () => {
      if (!alive) return;
      // Ensure decode completes before swapping to avoid "loaded but not painted" flashes.
      try {
        // @ts-ignore - decode exists in modern browsers
        if (typeof im.decode === "function") await im.decode();
      } catch {
        // ignore decode errors, still swap on load
      }
      if (!alive) return;
      lastGoodRef.current = src;
      setShown(src);
    };
    im.onerror = () => {
      // Keep showing the last good image; don’t blank (prevents flicker).
    };
    im.src = src;

    return () => {
      alive = false;
    };
  }, [src, enabled]);

  // Never return empty while enabled if we have a last-good
  return shown || lastGoodRef.current;
}


function fmtDt(dtSeconds: number) {
  const dtHr = dtSeconds / 3600;
  if (Number.isFinite(dtHr) && Math.abs(dtHr - Math.round(dtHr)) < 1e-9) return `${dtHr.toFixed(0)}h`;
  return `${dtSeconds}s`;
}

function isReplayManifest(man: any): boolean {
  const src = typeof man?.source === "string" ? man.source : "";
  return !!man?.historical || src.startsWith("historical");
}

function replayLabelFromManifest(id: string, man: any): string {
  const fireId = typeof man?.historical?.fire_id === "string" ? man.historical.fire_id : "";
  if (fireId) return `replay ${fireId} (${id})`;
  if (isReplayManifest(man)) return `replay (${id})`;
  return id;
}


function useRunList() {
  const [ids, setIds] = useState<string[]>([]);
  const [items, setItems] = useState<RunItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const r = await getJSON<ListRes>("/physical/list");
      const nextIds = (r.ids ?? []).slice().sort();
      setIds(nextIds);

      // Best-effort: build friendly labels (replays show fire_id) for the RunPicker.
      // If lots of runs, avoid fanning out too many requests.
      if (nextIds.length > 60) {
        setItems(nextIds.map((id) => ({ id, label: id })));
      } else {
        const manifests = await Promise.allSettled(nextIds.map((id) => getJSON<any>(`/physical/${id}/manifest`)));
        const nextItems: RunItem[] = nextIds.map((id, i) => {
          const res = manifests[i];
          const man = res.status === "fulfilled" ? res.value : null;
          return { id, label: replayLabelFromManifest(id, man) };
        });
        setItems(nextItems);
      }
    } catch (e: any) {
      setErr(typeof e?.message === "string" ? e.message : "Failed to load physical runs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ids, items, setIds, setItems, loading, err, refresh };
}

function useRunInfo(id: string) {
  const [meta, setMeta] = useState<MetaRes | null>(null);
  const [manifest, setManifest] = useState<any | null>(null);
  const [fields, setFields] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    setErr("");

    if (!id) {
      setMeta(null);
      setManifest(null);
      setFields([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    Promise.all([
      getJSON<MetaRes>(`/physical/${id}/meta`),
      getJSON<any>(`/physical/${id}/manifest`),
      getJSON<FieldsRes>(`/physical/${id}/fields`),
    ])
      .then(([m, man, fr]) => {
        if (!alive) return;
        setMeta(m);
        setManifest(man);
        setFields((fr?.fields ?? []).slice().sort());
      })
      .catch((e: any) => {
        if (!alive) return;
        setMeta(null);
        setManifest(null);
        setFields([]);
        setErr(typeof e?.message === "string" ? e.message : "Failed to load run.");
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [id]);

  return { meta, manifest, fields, loading, err };
}

function Panel({
  title,
  ids,
  items,
  setIds,
  setItems,
  id,
  setId,
  sharedT,
  sharedLoop,
  onHorizon,
}: {
  title: string;
  ids: string[];
  items: RunItem[];
  setIds: React.Dispatch<React.SetStateAction<string[]>>;
  setItems: React.Dispatch<React.SetStateAction<RunItem[]>>;
  id: string;
  setId: (v: string) => void;
  sharedT: number;
  sharedLoop: boolean;
  onHorizon: (T: number) => void;
}) {
  const { meta, manifest, fields, loading, err } = useRunInfo(id);
  const [panelErr, setPanelErr] = useState("");

  const [bg, setBg] = useState<BgKind>("terrain");
  const [legendErr, setLegendErr] = useState<string>("");
  const [showFire, setShowFire] = useState(true);
  const [showGrid, setShowGrid] = useState(false);

  const warmedKeyRef = useRef<string>("");


  const isReplay = useMemo(() => isReplayManifest(manifest), [manifest]);
  const replayFireId = useMemo(() => {
    return typeof manifest?.historical?.fire_id === "string" ? manifest.historical.fire_id : "";
  }, [manifest]);

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [vp, setVp] = useState({ w: VIEWPORT_W, h: VIEWPORT_H });


  // Pixel scale factor for backend renders
  const px =
    typeof window !== "undefined"
      ? Math.min(3, Math.max(1, Math.round(window.devicePixelRatio || 1)))
      : 1;

  /**
   * Request a render close to viewport resolution (no severe quality hit),
   * capped to a max to avoid huge backend renders.
   *
   * NOTE: Must be shared across base/fire/wind to keep overlay alignment.
   */
  const maxDim = useMemo(() => {
    if (typeof window === "undefined") return 4096;
    const dpr = window.devicePixelRatio || 1;
    const target = Math.ceil(Math.max(vp.w, vp.h) * dpr * 1.25);
    return clamp(target, 512, 4096);
  }, [vp.w, vp.h]);

  // ✅ Atomic view transform (prevents stale closure bugs)
  const [view, setView] = useState({ scale: 1, panX: 0, panY: 0 });

  const [imgSize, setImgSize] = useState<ImgSize | null>(null);
  const didInitRef = useRef(false);
  const draggingRef = useRef<null | { startX: number; startY: number; panX: number; panY: number }>(null);

  // Track actual viewport size (responsive fit/zoom)
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const update = () => {
      const r = el.getBoundingClientRect();
      const w = Math.max(1, Math.floor(r.width));
      const h = Math.max(1, Math.floor(r.height));
      setVp((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
    };

    update();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => update());
      ro.observe(el);
    } else {
      window.addEventListener("resize", update);
    }

    return () => {
      if (ro) ro.disconnect();
      else window.removeEventListener("resize", update);
    };
  }, []);

  const T = meta?.T ?? 0;
  useEffect(() => onHorizon(T), [T, onHorizon]);

  const t = meta ? Math.min(sharedT, Math.max(0, meta.T - 1)) : 0;

  // Canonical availability: trust /physical/{id}/fields
  const fieldSet = useMemo(() => new Set(fields), [fields]);
  const hasTerrain = fieldSet.has("terrain");
  const hasDem = fieldSet.has("terrain_dem_m");
  const hasFuels = fieldSet.has("fuels");
  const hasTemperature = fieldSet.has("temperature_c");
  const hasHumidity = fieldSet.has("humidity_rh");
  const hasWind = fieldSet.has("wind_u") && fieldSet.has("wind_v");
  const hasFire = fieldSet.has("fire_state");

  const preferredBg = useMemo<BgKind>(() => {
    if (hasTerrain) return "terrain";
    if (hasTemperature) return "temperature";
    if (hasHumidity) return "humidity";
    if (hasFuels) return "fuels";
    if (hasWind) return "wind";
    return "blank";
  }, [hasTerrain, hasTemperature, hasHumidity, hasFuels, hasWind]);

  useEffect(() => {
    if (!meta) return;
    setBg((prev) => {
      // If the panel is currently blank but this run has a more informative
      // background available, auto-upgrade to that preferred view.
      if (prev === "blank" && preferredBg !== "blank") {
        return preferredBg;
      }

      const prevStillValid =
        (prev === "terrain" && hasTerrain) ||
        (prev === "dem" && hasDem) ||
        (prev === "fuels" && hasFuels) ||
        (prev === "temperature" && hasTemperature) ||
        (prev === "humidity" && hasHumidity) ||
        (prev === "wind" && hasWind) ||
        prev === "blank";
      return prevStillValid ? prev : preferredBg;
    });
  }, [meta, preferredBg, hasTerrain, hasDem, hasFuels, hasTemperature, hasHumidity, hasWind]);



  const runIntentTags = useMemo(() => {
    const tags: string[] = [];
    if (isReplay) tags.push("historical replay");
    else tags.push("simulated run");

    if (hasTerrain) tags.push("terrain");
    if (hasWind) tags.push("wind");
    if (hasFuels) tags.push("fuels");
    if (hasTemperature || hasHumidity) tags.push("weather");
    if (hasFire) tags.push("fire");

    if (!hasTerrain && !hasWind && !hasFuels && !hasTemperature && !hasHumidity) {
      tags.push("clean baseline");
    }

    return tags.join(" · ");
  }, [isReplay, hasTerrain, hasWind, hasFuels, hasTemperature, hasHumidity, hasFire]);

  const viewExplanation = useMemo(() => {
    switch (bg) {
      case "terrain":
        return "Terrain shows the synthetic elevation field used for slope-biased spread when terrain is enabled.";
      case "dem":
        return "Terrain DEM shows stored elevation in meters, useful when a run provides a DEM-specific terrain field.";
      case "fuels":
        return "Fuels shows the categorical fuel map. Differences in spread can reflect patch structure, fuel spread multipliers, and fuel burn multipliers.";
      case "temperature":
        return "Temperature shows the stored temperature field. In weather-coupling runs, hotter cells can increase spread when temp_gain is positive.";
      case "humidity":
        return "Humidity shows the stored relative-humidity field. In weather-coupling runs, drier cells can increase spread when rh_gain is positive.";
      case "wind":
        return "Wind shows wind-speed background plus arrow direction. Static-wind runs keep a fixed field; dynamic-wind runs add temporal drift.";
      case "blank":
        return "Blank removes the background field so you can inspect the fire footprint or compare overlays without physical context.";
      default:
        return "";
    }
  }, [bg]);

  // If fire overlay requested but fire_state missing, hide it (prevents 404 spam).
  useEffect(() => {
    if (!meta) return;
    if (showFire && !hasFire) setShowFire(false);
  }, [meta, showFire, hasFire]);

  useEffect(() => {
    if (!id) {
      setBg("blank");
      setShowFire(true);
    }
    setPanelErr("");
    setLegendErr("");
  }, [id]);

  useEffect(() => {
    didInitRef.current = false;
    setImgSize(null);
    setView({ scale: 1, panX: 0, panY: 0 });
  }, [id]);

  // Initial fit once we know image size AND viewport size
  useEffect(() => {
    if (!imgSize) return;
    if (didInitRef.current) return;

    const fitScale = Math.min(vp.w / imgSize.w, vp.h / imgSize.h);
    const panX = (vp.w - imgSize.w * fitScale) / 2;
    const panY = (vp.h - imgSize.h * fitScale) / 2;

    setView({ scale: fitScale, panX, panY });
    didInitRef.current = true;
  }, [imgSize, vp.w, vp.h]);

  const infoLine = useMemo(() => {
    if (!meta) return "";
    const widthKm = (meta.W * meta.cell_size_m) / 1000;
    const heightKm = (meta.H * meta.cell_size_m) / 1000;
    return `Grid ${meta.H}×${meta.W} (~${heightKm.toFixed(1)}km × ${widthKm.toFixed(1)}km), cell ${
      meta.cell_size_m
    }m, CRS ${meta.crs_code}, dt=${fmtDt(meta.dt_seconds)}, T=${meta.T}`;
  }, [meta]);

  // Backend base endpoint supports:
  // terrain|terrain_dem_m|blank|wind_speed|wind_u|wind_v|fuels|temperature|humidity
  const baseBg =
    bg === "blank"
      ? "blank"
      : bg === "dem"
        ? "terrain_dem_m"
      : bg === "fuels"
        ? "fuels"
        : bg === "temperature"
          ? "temperature"
          : bg === "humidity"
            ? "humidity"
            : bg === "wind"
              ? "wind_speed"
              : "terrain";

  const baseAvailable =
    bg === "blank" ||
    (bg === "terrain" && hasTerrain) ||
    (bg === "dem" && hasDem) ||
    (bg === "fuels" && hasFuels) ||
    (bg === "temperature" && hasTemperature) ||
    (bg === "humidity" && hasHumidity) ||
    (bg === "wind" && hasWind);

  useEffect(() => {
    setLegendErr("");
  }, [bg, t, id]);

  // Frontend-ready knob for higher-res rendering; backend can opt-in later.

  // Backend grid overlay flag for rendered PNGs
  const gridQ = showGrid ? "&grid=1" : "";

  // Static backgrounds (terrain/dem/fuels/blank) don't change over t in replays/sims.
  // Avoid re-fetching them every frame -> faster playback + less flicker.
  const baseT =
    bg === "terrain" || bg === "dem" || bg === "fuels" || bg === "blank"
      ? 0
      : t;

  const baseUrl =
    id && meta && baseAvailable
      ? imgSrc(
          `/physical/${id}/t/${baseT}/base.png?bg=${baseBg}&px=${px}&max_dim=${maxDim}${gridQ}`,
          `${id}-${baseT}-${baseBg}-px${px}-m${maxDim}-g${showGrid ? 1 : 0}`,
        )
      : "";

  const fireUrl =
    id && meta && showFire && hasFire
      ? imgSrc(
          // IMPORTANT: match base params to keep alignment + caching consistent
          `/physical/${id}/t/${t}/fire_alpha.png?px=${px}&max_dim=${maxDim}${gridQ}`,
          `${id}-${t}-fire-px${px}-m${maxDim}-g${showGrid ? 1 : 0}`,
        )
      : "";

  const windUrl =
    id && meta && bg === "wind" && hasWind
      ? imgSrc(
          `/physical/${id}/t/${t}/wind_arrows.png?px=${px}&max_dim=${maxDim}`,
          `${id}-${t}-wind-px${px}-m${maxDim}`,
        )
       : "";

  // Atomic-swap display sources (prevents flicker)
  const shownBaseUrl = useAtomicImage(baseUrl, !!(id && meta && baseAvailable));
  const shownFireUrl = useAtomicImage(fireUrl, !!(id && meta && showFire && hasFire));
  const shownWindUrl = useAtomicImage(windUrl, !!(id && meta && bg === "wind" && hasWind));
  
  const legendUrl = useMemo(() => {
    if (!id || !meta) return "";
    if (bg === "blank") return "";

    if (bg === "fuels" && hasFuels) return imgSrc(`/physical/${id}/legend/bg.png?bg=fuels`, `${id}-legend-fuels`);
    if (bg === "dem" && hasDem) return imgSrc(`/physical/${id}/legend/bg.png?bg=terrain_dem_m`, `${id}-legend-dem`);
    if (bg === "temperature" && hasTemperature)
      return imgSrc(`/physical/${id}/legend/bg.png?bg=temperature`, `${id}-legend-temperature`);
    if (bg === "humidity" && hasHumidity) return imgSrc(`/physical/${id}/legend/bg.png?bg=humidity`, `${id}-legend-humidity`);
    if (bg === "wind" && hasWind) return imgSrc(`/physical/${id}/legend/bg.png?bg=wind_speed`, `${id}-legend-wind_speed`);
    if (bg === "terrain" && hasTerrain) return imgSrc(`/physical/${id}/legend/bg.png?bg=terrain`, `${id}-legend-terrain`);

    return "";
  }, [id, meta, bg, hasFuels, hasTemperature, hasHumidity, hasWind, hasTerrain]);

  // Warm cache on selection / view change to reduce "slow initial playback".
  // This forces backend to render+write the first few frames before you hit play.
  useEffect(() => {
    if (!id || !meta) return;
    const warmN = Math.min(meta.T, 6);

    // Only warm once per key to avoid stampedes (especially in 2-panel compare)
    const warmKey = `${id}|bg=${baseBg}|baseT=${baseT}|px=${px}|maxDim=${maxDim}|grid=${showGrid ? 1 : 0}|fire=${showFire ? 1 : 0}|wind=${bg === "wind" ? 1 : 0}`;
    if (warmedKeyRef.current === warmKey) return;
    warmedKeyRef.current = warmKey;

    const doWarm = () => {
      // base (often static at baseT=0)
      if (baseAvailable) {
        const im0 = new Image();
        im0.src = imgSrc(
          `/physical/${id}/t/${baseT}/base.png?bg=${baseBg}&px=${px}&max_dim=${maxDim}${gridQ}`,
          `${id}-${baseT}-${baseBg}-px${px}-m${maxDim}-g${showGrid ? 1 : 0}`,
        );
      }

      // fire frames
      if (showFire && hasFire) {
        for (let k = 0; k < warmN; k++) {
          const im = new Image();
          im.src = imgSrc(
            `/physical/${id}/t/${k}/fire_alpha.png?px=${px}&max_dim=${maxDim}${gridQ}`,
            `${id}-${k}-fire-px${px}-m${maxDim}-g${showGrid ? 1 : 0}`,
          );
        }
      }

      // wind frames (only if wind view selected)
      if (bg === "wind" && hasWind) {
        for (let k = 0; k < warmN; k++) {
          const im = new Image();
          im.src = imgSrc(
            `/physical/${id}/t/${k}/wind_arrows.png?px=${px}&max_dim=${maxDim}`,
            `${id}-${k}-wind-px${px}-m${maxDim}`,
          );
        }
      }
    };

    // don't block UI thread
    // @ts-ignore
    if (typeof requestIdleCallback !== "undefined") requestIdleCallback(doWarm);
    else setTimeout(doWarm, 0);
  }, [id, meta?.T, baseAvailable, baseBg, baseT, px, maxDim, gridQ, showFire, hasFire, bg, hasWind]);

  // Preload next frame (keeps playback smooth once rolling)
  useEffect(() => {
    if (!meta || !id) return;
    if (meta.T <= 1) return;

    const nextT = t + 1 < meta.T ? t + 1 : sharedLoop ? 0 : t;
    if (nextT === t) return;

    if (baseAvailable) {
      const pre = new Image();
      pre.src = imgSrc(
        `/physical/${id}/t/${baseT}/base.png?bg=${baseBg}&px=${px}&max_dim=${maxDim}${gridQ}`,
        `${id}-${baseT}-${baseBg}-px${px}-m${maxDim}-g${showGrid ? 1 : 0}`,
      );
    }

    if (bg === "wind" && hasWind) {
      const preW = new Image();
      preW.src = imgSrc(
        `/physical/${id}/t/${nextT}/wind_arrows.png?px=${px}&max_dim=${maxDim}`,
        `${id}-${nextT}-wind-px${px}-m${maxDim}`,
      );
    }

    const lbg =
      bg === "fuels"
        ? (hasFuels ? "fuels" : null)
        : bg === "dem"
          ? (hasDem ? "terrain_dem_m" : null)
        : bg === "temperature"
          ? (hasTemperature ? "temperature" : null)
          : bg === "humidity"
            ? (hasHumidity ? "humidity" : null)
            : bg === "wind"
              ? (hasWind ? "wind_speed" : null)
              : bg === "terrain"
                ? (hasTerrain ? "terrain" : null)
                : null;

    if (lbg) {
      const preL = new Image();
      preL.src = imgSrc(`/physical/${id}/legend/bg.png?bg=${lbg}`, `${id}-legend-${lbg}`);
    }

    if (showFire && hasFire) {
      const preF = new Image();
      preF.src = imgSrc(
        `/physical/${id}/t/${nextT}/fire_alpha.png?px=${px}&max_dim=${maxDim}${gridQ}`,
        `${id}-${nextT}-fire-px${px}-m${maxDim}-g${showGrid ? 1 : 0}`,
      );
    }
  }, [id, meta, t, sharedLoop, bg, baseBg, baseAvailable, showFire, showGrid, hasWind, hasFire, hasFuels, hasTemperature, hasHumidity, hasTerrain, px, maxDim, gridQ, baseT]);
 


  function fit() {
    if (!imgSize) return;
    const fitScale = Math.min(vp.w / imgSize.w, vp.h / imgSize.h);
    const panX = (vp.w - imgSize.w * fitScale) / 2;
    const panY = (vp.h - imgSize.h * fitScale) / 2;
    setView({ scale: fitScale, panX, panY });
  }

  function reset() {
    if (!imgSize) {
      setView({ scale: 1, panX: 0, panY: 0 });
      return;
    }
    setView({
      scale: 1,
      panX: (vp.w - imgSize.w) / 2,
      panY: (vp.h - imgSize.h) / 2,
    });
  }

  function zoomAround(mx: number, my: number, factor: number) {
    setView((prev) => {
      const nextScale = clamp(prev.scale * factor, 0.25, 12);

      const wx = (mx - prev.panX) / prev.scale;
      const wy = (my - prev.panY) / prev.scale;

      const panX = mx - wx * nextScale;
      const panY = my - wy * nextScale;

      return { scale: nextScale, panX, panY };
    });
  }

  function zoomBy(factor: number) {
    const cx = vp.w / 2;
    const cy = vp.h / 2;
    zoomAround(cx, cy, factor);
  }

  function onWheel(e: React.WheelEvent<HTMLDivElement>) {
    if (!meta) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    zoomAround(mx, my, factor);
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!meta) return;
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    draggingRef.current = { startX: e.clientX, startY: e.clientY, panX: view.panX, panY: view.panY };
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const st = draggingRef.current;
    if (!st) return;
    const dx = e.clientX - st.startX;
    const dy = e.clientY - st.startY;
    setView((prev) => ({ ...prev, panX: st.panX + dx, panY: st.panY + dy }));
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return;
    draggingRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  }

  async function deleteCurrent() {
    if (!id) return;
    if (isReplay) {
      window.alert("This run is a historical replay and cannot be deleted from the visualizer UI.");
      return;
    }
    const ok0 = window.confirm(`Delete ${id} and all its files under data/?`);
    if (!ok0) return;

    setPanelErr("");
    try {
      await deleteJSON<DeleteRes>(`/physical/${id}`);
      setIds((prev) => prev.filter((x) => x !== id));
      setItems((prev) => prev.filter((x) => x.id !== id));
      setId("");
    } catch (e: any) {
      // If backend returns 409 with dependents, offer a warning confirm then retry with force=true.
      let status: number | undefined = e?.status ?? e?.response?.status;
      let detail: any = e?.detail ?? e?.response?.data?.detail ?? e?.data?.detail ?? e?.data;

      // Some api wrappers stringify JSON into message; attempt to recover.
      if (!detail && typeof e?.message === "string") {
        const msg = e.message;
        // Try to parse JSON object embedded in message
        const i0 = msg.indexOf("{");
        const i1 = msg.lastIndexOf("}");
        if (i0 >= 0 && i1 > i0) {
          try {
            detail = JSON.parse(msg.slice(i0, i1 + 1));
          } catch {}
        }
        // Best-effort status extraction
        const m = msg.match(/\b409\b/);
        if (!status && m) status = 409;
      }

      const is409 = status === 409;
      const d = detail?.message ? detail : (typeof detail === "object" ? detail : null);
      const dependents: string[] | null =
        is409 && d && Array.isArray(d.dependents) ? (d.dependents as string[]) : null;

      if (is409 && dependents && dependents.length) {
        const msg =
          `This physical run (${id}) is referenced by ${dependents.length} epistemic run(s):\n\n` +
          dependents.map((x) => `• ${x}`).join("\n") +
          `\n\nDeleting the physical run will NOT delete those epistemic runs.\n` +
          `They will remain viewable (epistemic meta is stored), but provenance links to the physical source will be gone.\n\n` +
          `Delete anyway?`;

        const okForce = window.confirm(msg);
        if (!okForce) return;

        try {
          await deleteJSON<DeleteRes>(`/physical/${id}?force=true`);
          setIds((prev) => prev.filter((x) => x !== id));
          setItems((prev) => prev.filter((x) => x.id !== id));
          setId("");
          return;
        } catch (e2: any) {
          setPanelErr(typeof e2?.message === "string" ? e2.message : "Delete failed.");
          return;
        }
      }

      setPanelErr(typeof e?.message === "string" ? e.message : "Delete failed.");
    }
  }

  return (
    <div className="card" style={{ flex: "1 1 520px", minWidth: 320 }}>
      <div className="row" style={{ justifyContent: "space-between", alignItems: "baseline" }}>
        <h3 style={{ margin: 0 }}>
          {title}
          {isReplay ? (
            <span className="small" style={{ marginLeft: 10, opacity: 0.9 }}>
              replay{replayFireId ? `: ${replayFireId}` : ""}
            </span>
          ) : null}
        </h3>
      </div>

      {err || panelErr ? (
        <div className="small" style={{ color: "crimson", marginTop: 6 }}>
          {panelErr || err}
        </div>
      ) : null}

      <div className="row" style={{ alignItems: "flex-end", justifyContent: "space-between", gap: 10 }}>
        <div style={{ flex: 1, minWidth: 260 }}>
          <RunPicker label="Select Physical Run" ids={ids} items={items} value={id} onChange={setId} />
        </div>

        <button
          onClick={deleteCurrent}
          disabled={!id || isReplay}
          style={{ height: 38, whiteSpace: "nowrap" }}
          title={!id ? "No run selected" : isReplay ? "Historical replays are protected" : `Delete ${id}`}
        >
          Delete
        </button>
      </div>

      <div
        style={{
          minHeight: 86,
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
        }}
      >
        {loading ? <div className="small">Loading…</div> : null}

        {meta ? (
          <div className="small">{infoLine}</div>
        ) : (
          <div className="small" style={{ opacity: 0.72 }}>
            No run selected.
          </div>
        )}

        {meta ? (
          <div className="small" style={{ marginTop: 6, opacity: 0.86, lineHeight: 1.4 }}>
            Run type: <b>{runIntentTags}</b>
          </div>
        ) : (
          <div className="small" style={{ marginTop: 6, opacity: 0.0, lineHeight: 1.4 }}>
            placeholder
          </div>
        )}

        {meta ? (
          <div className="small" style={{ marginTop: 6, opacity: 0.84, lineHeight: 1.45 }}>
            {viewExplanation}
          </div>
        ) : (
          <div className="small" style={{ marginTop: 6, opacity: 0.0, lineHeight: 1.45 }}>
            placeholder
          </div>
        )}
      </div>

      <div className="row" style={{ alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <label className="small">View</label>
        <select value={bg} onChange={(e) => setBg(e.target.value as BgKind)} disabled={!meta}>
          {hasTerrain ? <option value="terrain">Terrain</option> : null}
          {hasDem ? <option value="dem">Terrain DEM (m)</option> : null}
          {hasFuels ? <option value="fuels">Fuels</option> : null}
          {hasTemperature ? <option value="temperature">Temperature</option> : null}
          {hasHumidity ? <option value="humidity">Humidity</option> : null}
          {hasWind ? <option value="wind">Wind (arrows)</option> : null}
          <option value="blank">Blank</option>
        </select>

        <label className="row" style={{ gap: 6, margin: 0 }}>
          <input type="checkbox" checked={showFire} disabled={!meta || !hasFire} onChange={(e) => setShowFire(e.target.checked)} />
          Fire
        </label>

        <label className="row" style={{ gap: 6, margin: 0 }}>
          <input type="checkbox" checked={showGrid} disabled={!meta} onChange={(e) => setShowGrid(e.target.checked)} />
          Grid
        </label>

        <div className="row" style={{ gap: 6 }}>
          <button onClick={() => zoomBy(1.15)} disabled={!meta}>
            +
          </button>
          <button onClick={() => zoomBy(1 / 1.15)} disabled={!meta}>
            –
          </button>
          <button onClick={fit} disabled={!meta}>
            Fit
          </button>
          <button onClick={reset} disabled={!meta}>
            Reset
          </button>
        </div>
      </div>

      <div
        ref={viewportRef}
        className="viewer-viewport"
        style={{
          width: "100%",
          maxWidth: VIEWPORT_W,
          aspectRatio: `${VIEWPORT_W} / ${VIEWPORT_H}`,
          height: "auto",
          marginTop: 10,
          background: "#0f1115",
          overflow: "hidden",
          touchAction: "none",
        }}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {meta ? (
          <div
            className="viewer-stage"
            style={{
              position: "relative",
              width: imgSize?.w ?? VIEWPORT_W,
              height: imgSize?.h ?? VIEWPORT_H,
              transform: `translate(${view.panX}px, ${view.panY}px) scale(${view.scale})`,
              transformOrigin: "0 0",
            }}
          >
            {shownBaseUrl ? (
              <img 
                decoding="async"
                src={shownBaseUrl}
                alt="base"
                draggable={false}
                onLoad={(e) => {
                  const w = e.currentTarget.naturalWidth || VIEWPORT_W;
                  const h = e.currentTarget.naturalHeight || VIEWPORT_H;
                  setImgSize((prev) => (prev && prev.w === w && prev.h === h ? prev : { w, h }));
                }}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: imgSize?.w ?? VIEWPORT_W,
                  height: imgSize?.h ?? VIEWPORT_H,
                  imageRendering: "auto",
                }}
              />
            ) : null}

            {bg === "wind" && hasWind && shownWindUrl ? (
              <img 
                decoding="async"
                src={shownWindUrl}
                alt="wind arrows"
                draggable={false}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: imgSize?.w ?? VIEWPORT_W,
                  height: imgSize?.h ?? VIEWPORT_H,
                  imageRendering: "auto",
                }}
              />
            ) : null}

            {showFire && hasFire && shownFireUrl ? (
              <img 
                decoding="async"
                src={shownFireUrl}
                alt="fire overlay"
                draggable={false}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: imgSize?.w ?? VIEWPORT_W,
                  height: imgSize?.h ?? VIEWPORT_H,
                  imageRendering: "auto",
                }}
              />
            ) : null}

            {/* Grid is rendered server-side via ?grid=1 */}
          </div>
        ) : (
          <div className="small" style={{ padding: 12, color: "rgba(255,255,255,0.7)" }}>
            No run selected.
          </div>
        )}
      </div>

      {legendErr ? (
        <div className="small" style={{ color: "crimson", marginTop: 8 }}>
          {legendErr}
        </div>
      ) : null}

      {meta && bg !== "blank" && legendUrl ? (
        <div style={{ marginTop: 8 }}>
          <img 
            decoding="async"
            src={legendUrl}
            alt={
              bg === "fuels"
                ? "fuels legend"
                : bg === "temperature"
                  ? "temperature legend"
                  : bg === "humidity"
                    ? "humidity legend"
                    : bg === "wind"
                      ? "wind legend"
                      : "legend"
            }
            style={{ maxWidth: "100%", height: "auto" }}
            onError={() => setLegendErr("Legend not available for this view (check backend /physical/{id}/legend/bg.png).")}
            onLoad={() => setLegendErr("")}
          />
        </div>
      ) : null}

      {manifest ? (
        <details style={{ marginTop: 10 }}>
          <summary className="small">Run details (manifest)</summary>
          <pre className="small manifestPre" style={{ whiteSpace: "pre-wrap", marginTop: 8, maxHeight: 260, overflow: "auto" }}>
            {JSON.stringify({ manifest, fields }, null, 2)}
          </pre>
        </details>
      ) : null}
    </div>
  );
}

export default function PhysicalVisualizerPage() {
  const { ids, items, setIds, setItems, loading, err, refresh } = useRunList();

  const [t, setT] = useState(0);
  const [loop, setLoop] = useState(true);

  const [idA, setIdA] = useState("");
  const [idB, setIdB] = useState("");

  const [TA, setTA] = useState(0);
  const [TB, setTB] = useState(0);

  const globalT = Math.max(TA, TB);

  // Step 5 polish: parse query params (designer → visualizer deep link)
  // Supported:
  //   ?id=<run>        -> Panel A
  //   ?a=<run>&b=<run> -> Panel A/B
  //   ?t=<int>         -> timeline
  //   ?loop=0|1        -> loop flag
  const didInitFromUrl = useRef(false);
  useEffect(() => {
    if (didInitFromUrl.current) return;

    const sp = new URLSearchParams(window.location.search);

    const a = sp.get("a") || "";
    const b = sp.get("b") || "";
    const single = sp.get("id") || "";

    const tStr = sp.get("t");
    const loopStr = sp.get("loop");

    if (loopStr === "0" || loopStr === "1") setLoop(loopStr === "1");
    if (tStr && Number.isFinite(Number(tStr))) setT(Math.max(0, Math.floor(Number(tStr))));

    if (a) setIdA(a);
    if (b) setIdB(b);
    if (!a && single) setIdA(single);

    didInitFromUrl.current = true;
  }, []);

  // Auto-refresh run list when returning to tab/window (so new runs show up immediately)
  useEffect(() => {
    const onFocus = () => refresh();
    const onVis = () => {
      if (!document.hidden) refresh();
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [refresh]);

  // Default selection when list loads (only if panels not already set by URL)
  useEffect(() => {
    if (ids.length === 0) return;

    // If panel ids already set (e.g., deep link), don't override
    if (!idA) setIdA(ids[ids.length - 1]);
    // Panel B intentionally defaults to None; user opts into comparison.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids]);

  // IMPORTANT Step 5 fix:
  // Do NOT clear idA/idB just because it's not in the list yet.
  // (RunPicker now supports showing a "direct" id; list refresh will catch up.)
  // We intentionally remove the old behavior that forced setIdA("").

  useEffect(() => {
    if (globalT <= 0) {
      setT(0);
      return;
    }
    setT((prev) => clamp(prev, 0, Math.max(0, globalT - 1)));
  }, [globalT]);

  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>Physical Visualizer</h2>
      <div aria-hidden className="section-stripe section-stripe--physical" />

      <div className="small" style={{ opacity: 0.86, lineHeight: 1.45, marginTop: 8 }}>
        The Physical Visualizer is for inspecting generated wildfire worlds and comparing runs side by side.
        Use it to compare reference worlds, layer-isolation diagnostics, or protected historical replays.
        The most useful workflow is usually to hold time fixed and compare backgrounds, or hold the background fixed and compare different runs. For example: compare a clean reference world against a terrain-only or wind-only diagnostic, or compare a simulated run against a replay-based run to see how structure differs.
      </div>

      {err ? (
        <div className="small" style={{ color: "crimson", marginBottom: 8 }}>
          {err}
        </div>
      ) : null}

      <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <div className="small">{loading ? "Loading runs…" : `${ids.length} run(s)`}</div>
        <button onClick={refresh}>Refresh list</button>
      </div>

      <PlayBar t={t} setT={setT} T={globalT} loop={loop} setLoop={setLoop} />

      <div className="row" style={{ gap: 12, alignItems: "stretch", flexWrap: "wrap" }}>
        <Panel title="Panel A" ids={ids} items={items} setIds={setIds} setItems={setItems} id={idA} setId={setIdA} sharedT={t} sharedLoop={loop} onHorizon={setTA} />
        <Panel title="Panel B" ids={ids} items={items} setIds={setIds} setItems={setItems} id={idB} setId={setIdB} sharedT={t} sharedLoop={loop} onHorizon={setTB} />
      </div>

      <div className="small" style={{ marginTop: 8, opacity: 0.8 }}>
        Tips: mouse wheel to zoom, drag to pan. Each panel clamps to its own horizon; the PlayBar uses max(TA,TB).
      </div>

      <div className="small" style={{ marginTop: 6, opacity: 0.8, lineHeight: 1.4 }}>
        Comparison hint: terrain, fuels, temperature, humidity, and wind views explain background structure.
        The fire overlay then shows how that structure interacts with spread over time.
        Historical replay runs are protected and cannot be deleted from this page.
      </div>
    </div>
  );
}
