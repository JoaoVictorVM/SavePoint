"use client";

import type { DashboardRatingBucket } from "@/actions/dashboard";

interface RatingDistributionProps {
  data: DashboardRatingBucket[];
  totalRated: number;
}

/**
 * Renderiza a label de estrelas para a nota indicada.
 * Nota em incrementos de 0.5 → metade estrela cheia.
 */
function StarLabel({ rating }: { rating: number }) {
  if (rating === -1) {
    return (
      <span className="text-xs text-[var(--color-text-muted)]">Sem nota</span>
    );
  }

  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  const stars: React.ReactNode[] = [];

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(<Star key={i} fill={1} />);
    } else if (i === fullStars && hasHalf) {
      stars.push(<Star key={i} fill={0.5} />);
    } else {
      stars.push(<Star key={i} fill={0} />);
    }
  }

  return (
    <div className="flex items-center gap-0.5" aria-label={`Nota ${rating}`}>
      {stars}
    </div>
  );
}

function Star({ fill }: { fill: 0 | 0.5 | 1 }) {
  const gold = "var(--color-gold)";
  const empty = "var(--color-bg-elevated)";

  if (fill === 1) {
    return (
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill={gold}>
        <path d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.6 7-6.2-3.7L5.8 21l1.6-7L2 9.5l7.1-.6L12 2z" />
      </svg>
    );
  }
  if (fill === 0.5) {
    return (
      <svg className="w-3 h-3" viewBox="0 0 24 24">
        <defs>
          <linearGradient id={`half-${Math.random()}`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="50%" stopColor={gold} />
            <stop offset="50%" stopColor={empty} />
          </linearGradient>
        </defs>
        <path
          d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.6 7-6.2-3.7L5.8 21l1.6-7L2 9.5l7.1-.6L12 2z"
          fill={`url(#half-${Math.random()})`}
        />
      </svg>
    );
  }
  return (
    <svg className="w-3 h-3" viewBox="0 0 24 24" fill={empty}>
      <path d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.6 7-6.2-3.7L5.8 21l1.6-7L2 9.5l7.1-.6L12 2z" />
    </svg>
  );
}

export function RatingDistribution({
  data,
  totalRated,
}: RatingDistributionProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const hasData = data.some((d) => d.value > 0);

  // Ordem: maior nota em cima (5.0, 4.5, ... 0.5), depois "Sem nota"
  const sorted = [
    ...data.filter((d) => d.rating !== -1).sort((a, b) => b.rating - a.rating),
    ...data.filter((d) => d.rating === -1),
  ];

  return (
    <div className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
            Distribuição de notas
          </h3>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            {totalRated} {totalRated === 1 ? "jogo avaliado" : "jogos avaliados"}
          </p>
        </div>
      </div>

      {hasData ? (
        <div className="space-y-1.5 flex-1">
          {sorted.map((bucket) => {
            const pct = (bucket.value / maxValue) * 100;
            const isEmpty = bucket.value === 0;
            return (
              <div
                key={bucket.rating}
                className="flex items-center gap-3 text-xs"
              >
                <div className="w-[90px] shrink-0 flex items-center">
                  <StarLabel rating={bucket.rating} />
                </div>
                <div className="flex-1 h-5 bg-[var(--color-bg-elevated)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300 ease-out"
                    style={{
                      width: isEmpty ? 0 : `${Math.max(pct, 4)}%`,
                      backgroundColor:
                        bucket.rating === -1
                          ? "var(--color-text-muted)"
                          : "var(--color-gold)",
                    }}
                  />
                </div>
                <span
                  className={`w-8 text-right font-medium ${
                    isEmpty
                      ? "text-[var(--color-text-muted)]"
                      : "text-[var(--color-text-primary)]"
                  }`}
                >
                  {bucket.value}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="h-[260px] flex items-center justify-center">
          <p className="text-sm text-[var(--color-text-muted)]">
            Sem dados no período
          </p>
        </div>
      )}
    </div>
  );
}
