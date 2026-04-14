"use client";

import { useState } from "react";

const PRESET_COLORS = [
  "#EF4444", "#F97316", "#EAB308", "#22C55E",
  "#06B6D4", "#3B82F6", "#8B5CF6", "#EC4899",
  "#2FE0AE", "#F59E0B", "#71717A", "#18181B",
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [customInput, setCustomInput] = useState("");

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer ${
              value === color
                ? "border-[var(--color-accent)] scale-110"
                : "border-transparent hover:scale-105"
            }`}
            style={{ backgroundColor: color }}
            aria-label={`Cor ${color}`}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-full border border-[var(--color-border)] shrink-0"
          style={{ backgroundColor: value }}
        />
        <input
          type="text"
          value={customInput || value}
          onChange={(e) => {
            const v = e.target.value;
            setCustomInput(v);
            if (/^#[0-9A-Fa-f]{6}$/.test(v)) {
              onChange(v);
            }
          }}
          placeholder="#2FE0AE"
          className="w-24 h-8 px-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
        />
      </div>
    </div>
  );
}
