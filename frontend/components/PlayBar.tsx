import React, { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  t: number;
  setT: React.Dispatch<React.SetStateAction<number>>;
  T: number; // horizon length (#frames)
  loop: boolean;
  setLoop: (v: boolean) => void;
};

const FRAME_MS = 140; // playback speed (matches prior behavior)

export function PlayBar({ t, setT, T, loop, setLoop }: Props) {
  const [playing, setPlaying] = useState(false);

  // ---- Canonical, clamped timeline values ----
  const safeT = Math.max(0, Math.floor(T || 0));
  const maxIdx = Math.max(0, safeT - 1);
  const safeIdx = clamp(Math.floor(t || 0), 0, maxIdx);

  // ---- Playback clock state (RAF-driven) ----
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number | null>(null);

  // Clamp external t when T changes
  useEffect(() => {
    setT((prev) => clamp(prev, 0, maxIdx));
    if (safeT <= 1) setPlaying(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeT, maxIdx]);

  // Reset playback clock when external t changes (scrub/jump/load).
  useEffect(() => {
    lastTickRef.current = null;
  }, [t]);

  // ---- Main playback loop (requestAnimationFrame) ----
  useEffect(() => {
    if (!playing) return;
    if (safeT <= 1) return;

    function step(ts: number) {
      if (lastTickRef.current == null) {
        lastTickRef.current = ts;
      }

      const dt = ts - lastTickRef.current;

      if (dt >= FRAME_MS) {
        const steps = Math.max(1, Math.floor(dt / FRAME_MS));
        lastTickRef.current += steps * FRAME_MS;

        setT((prev) => {
          const cur = clamp(prev, 0, maxIdx);
          const nxt = cur + steps;
          if (nxt <= maxIdx) return nxt;
          if (loop) return nxt % Math.max(1, safeT);
          setPlaying(false);
          return maxIdx;
        });
      }

      rafRef.current = requestAnimationFrame(step);
    }

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastTickRef.current = null;
    };
  }, [playing, safeT, maxIdx, loop, setT]);

  const label = useMemo(
    () => `${safeIdx}/${safeT > 0 ? safeT - 1 : 0}`,
    [safeIdx, safeT],
  );

  return (
    <div className="row" style={{ alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <button onClick={() => setPlaying((p) => !p)} disabled={safeT <= 1}>
        {playing ? "Pause" : "Play"}
      </button>

      <button
        onClick={() => setT(0)}
        disabled={safeT <= 0}
        title="Jump to start"
      >
        ⏮
      </button>

      <input
        type="range"
        min={0}
        max={maxIdx}
        value={safeIdx}
        onChange={(e) => setT(parseInt(e.target.value, 10) || 0)}
        disabled={safeT <= 0}
        style={{ width: 240 }}
      />

      <button
        onClick={() => setT((prev) => clamp(prev - 1, 0, maxIdx))}
        disabled={safeT <= 0}
      >
        −
      </button>
      <button
        onClick={() => setT((prev) => clamp(prev + 1, 0, maxIdx))}
        disabled={safeT <= 0}
      >
        +
      </button>

      <label className="row" style={{ gap: 6, margin: 0 }}>
        <input
          type="checkbox"
          checked={loop}
          onChange={(e) => setLoop(e.target.checked)}
          disabled={safeT <= 1}
        />
        Loop
      </label>

      <div className="small" style={{ opacity: 0.8 }}>
        t={label}
      </div>
    </div>
  );
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}
