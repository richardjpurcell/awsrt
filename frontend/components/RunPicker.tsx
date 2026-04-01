"use client";

import React from "react";

type RunItem = { id: string; label?: string; disabled?: boolean };

function isRunItemArray(x: unknown): x is RunItem[] {
  return Array.isArray(x) && x.every((v) => v && typeof (v as any).id === "string");
}

export function RunPicker({
  label,
  ids,
  value,
  onChange,
  items,
}: {
  label: string;
  ids: string[]; // backward-compatible: old callers still pass ids
  value: string;
  onChange: (v: string) => void;

  // Optional: richer items for friendly names + protected/disabled options.
  // If provided, it takes precedence over `ids`.
  items?: RunItem[];
}) {
  /**
   * Canonical option list:
   * - Prefer `items` when provided (labels, disabled flags).
   * - Fall back to `ids` otherwise.
   *
   * IMPORTANT:
   * We never implicitly drop `value` even if it is not yet in the list.
   * This avoids transient value="" during refreshes or deep links.
   */
  const list: RunItem[] = React.useMemo(() => {
    if (isRunItemArray(items)) return items;
    return (ids ?? []).map((id) => ({ id }));
  }, [ids, items]);

  const idSet = React.useMemo(() => new Set(list.map((x) => x.id)), [list]);

  // If value isn't in the list yet (fresh run, direct link),
  // keep it selectable and visible.
  const hasDirectValue = !!value && !idSet.has(value);

  const titleText = value || "No run selected";

  return (
    <div className="row" style={{ alignItems: "center" }}>
      <label className="small" style={{ width: 160 }}>
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ minWidth: 260 }}
        title={titleText}
      >
        <option value="">None</option>

        {hasDirectValue ? (
          <option value={value}>{value} (direct)</option>
        ) : null}

        {list.map((x) => {
          const text = x.label?.trim() ? x.label : x.id;
          return (
            <option key={x.id} value={x.id} disabled={!!x.disabled}>
              {text}
            </option>
          );
        })}
      </select>
    </div>
  );
}
