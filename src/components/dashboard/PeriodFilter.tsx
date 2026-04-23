"use client";

import type { DashboardPeriod } from "@/actions/dashboard";

interface PeriodFilterProps {
  value: DashboardPeriod;
  onChange: (period: DashboardPeriod) => void;
  disabled?: boolean;
}

const options: { value: DashboardPeriod; label: string }[] = [
  { value: "weekly", label: "Semanal" },
  { value: "monthly", label: "Mensal" },
  { value: "yearly", label: "Anual" },
];

export function PeriodFilter({ value, onChange, disabled }: PeriodFilterProps) {
  return (
    <div
      className="inline-flex rounded-[12px] border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-1"
      role="tablist"
      aria-label="Filtro de período"
    >
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            disabled={disabled}
            onClick={() => onChange(opt.value)}
            className={`
              px-4 py-1.5 text-sm font-medium rounded-[8px] transition-colors cursor-pointer
              disabled:opacity-50 disabled:cursor-not-allowed
              ${
                active
                  ? "bg-[var(--color-accent-dark)] text-[var(--color-accent)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              }
            `}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
