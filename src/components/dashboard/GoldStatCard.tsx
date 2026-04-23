interface GoldStatCardProps {
  goldEarned: number;
  goldEarnedPrev: number;
  changePercent: number | null;
}

export function GoldStatCard({
  goldEarned,
  goldEarnedPrev,
  changePercent,
}: GoldStatCardProps) {
  // null = sem base de comparação (prev = 0, current > 0)
  const isNewHigh = changePercent === null;
  const isDown = changePercent !== null && changePercent < 0;
  const isFlat = changePercent === 0;

  const arrowColor = isDown
    ? "var(--color-error)"
    : isFlat
    ? "var(--color-text-muted)"
    : "var(--color-accent)";

  const arrowPath = isDown
    ? "M19 14l-7 7m0 0l-7-7m7 7V3" // seta para baixo
    : isFlat
    ? "M5 12h14" // traço
    : "M5 10l7-7m0 0l7 7m-7-7v18"; // seta para cima

  const pctLabel = isNewHigh
    ? "+∞"
    : changePercent !== null
    ? `${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(1)}%`
    : "—";

  const pctColor = isDown
    ? "var(--color-error)"
    : isFlat
    ? "var(--color-text-muted)"
    : "var(--color-accent)";

  return (
    <div className="rounded-[16px] border border-[var(--color-gold)]/30 bg-[var(--color-bg-surface)] p-5 relative overflow-hidden">
      {/* Gradient decorativo */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, var(--color-gold) 0%, transparent 60%)",
        }}
      />

      <div className="relative">
        <div className="flex items-start justify-between mb-2">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
            Gold ganho
          </p>
          <svg
            className="w-4 h-4"
            fill="var(--color-gold)"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <text
              x="12"
              y="16"
              textAnchor="middle"
              fontSize="12"
              fontWeight="bold"
              fill="var(--color-bg-base)"
            >
              G
            </text>
          </svg>
        </div>

        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold text-[var(--color-gold)]">
            {goldEarned.toLocaleString("pt-BR")}
          </p>
          <div className="flex items-center gap-0.5">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke={arrowColor}
              strokeWidth={2.5}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d={arrowPath} />
            </svg>
            <span
              className="text-xs font-semibold"
              style={{ color: pctColor }}
            >
              {pctLabel}
            </span>
          </div>
        </div>

        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          vs. período anterior ({goldEarnedPrev.toLocaleString("pt-BR")} gold)
        </p>
      </div>
    </div>
  );
}
