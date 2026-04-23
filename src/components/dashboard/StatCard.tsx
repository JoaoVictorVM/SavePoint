interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  icon?: React.ReactNode;
  accent?: boolean;
}

export function StatCard({
  label,
  value,
  sublabel,
  icon,
  accent = false,
}: StatCardProps) {
  return (
    <div
      className={`
        rounded-[16px] border bg-[var(--color-bg-surface)] p-5
        ${accent ? "border-[var(--color-accent)]/40" : "border-[var(--color-border)]"}
      `}
    >
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
          {label}
        </p>
        {icon && (
          <div className="text-[var(--color-text-muted)]">{icon}</div>
        )}
      </div>
      <p
        className={`text-3xl font-bold ${
          accent
            ? "text-[var(--color-accent)]"
            : "text-[var(--color-text-primary)]"
        }`}
      >
        {value}
      </p>
      {sublabel && (
        <p className="text-xs text-[var(--color-text-muted)] mt-1">{sublabel}</p>
      )}
    </div>
  );
}
