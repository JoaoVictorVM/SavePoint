interface ReviewsCardProps {
  count: number;
  totalGames: number;
}

export function ReviewsCard({ count, totalGames }: ReviewsCardProps) {
  const pct =
    totalGames > 0 ? Math.round((count / totalGames) * 100) : 0;

  return (
    <div className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 flex flex-col">
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">
        Reviews escritas
      </h3>

      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <svg
          className="w-10 h-10 text-[var(--color-accent)] mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
        <p className="text-5xl font-bold text-[var(--color-text-primary)] leading-none">
          {count}
        </p>
        <p className="text-xs text-[var(--color-text-muted)] mt-2">
          {count === 1 ? "review escrita" : "reviews escritas"}
        </p>
        {totalGames > 0 && (
          <p className="text-xs text-[var(--color-text-muted)] mt-3">
            <span className="text-[var(--color-accent)] font-semibold">
              {pct}%
            </span>{" "}
            dos jogos adicionados
          </p>
        )}
      </div>
    </div>
  );
}
