"use client";

import { useState } from "react";
import type { DashboardRatingBucket } from "@/actions/dashboard";

interface RatingDistributionProps {
  data: DashboardRatingBucket[];
  totalRated: number;
}

export function RatingDistribution({
  data,
  totalRated,
}: RatingDistributionProps) {
  // 0 = nenhuma estrela selecionada; 0.5 ... 5.0 = selecionada
  const [selected, setSelected] = useState(0);

  // Map rating -> count para lookup rápido
  const countByRating = new Map<number, number>();
  let semNota = 0;
  for (const bucket of data) {
    if (bucket.rating === -1) {
      semNota = bucket.value;
    } else {
      countByRating.set(bucket.rating, bucket.value);
    }
  }

  function handleClick(starIndex: number, isLeftHalf: boolean) {
    const newValue = isLeftHalf ? starIndex + 0.5 : starIndex + 1;
    setSelected(newValue === selected ? 0 : newValue);
  }

  const selectedCount = selected > 0 ? countByRating.get(selected) ?? 0 : 0;

  return (
    <div className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 flex flex-col h-full">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
          Distribuição de notas
        </h3>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
          {totalRated} {totalRated === 1 ? "jogo avaliado" : "jogos avaliados"}
          {semNota > 0 && (
            <>
              {" "}
              ·{" "}
              <span>
                {semNota} {semNota === 1 ? "jogo sem nota" : "jogos sem nota"}
              </span>
            </>
          )}
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center gap-6 py-4">
        {/* Estrelas interativas */}
        <div
          className="flex items-center gap-1"
          role="radiogroup"
          aria-label="Selecione uma nota"
        >
          {[0, 1, 2, 3, 4].map((starIndex) => {
            const filled = selected - starIndex;
            const isFull = filled >= 1;
            const isHalf = !isFull && filled >= 0.5;

            return (
              <div
                key={starIndex}
                className="relative w-12 h-12"
              >
                {/* Estrela vazia (fundo) */}
                <svg
                  className="w-12 h-12 text-[var(--color-bg-elevated)]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>

                {/* Estrela preenchida (overlay) */}
                {(isFull || isHalf) && (
                  <div
                    className="absolute inset-0 overflow-hidden pointer-events-none"
                    style={{ width: isFull ? "100%" : "50%" }}
                  >
                    <svg
                      className="w-12 h-12 text-[var(--color-gold)]"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                    </svg>
                  </div>
                )}

                {/* Áreas de clique: metade esquerda (0.5) e metade direita (1.0) */}
                <button
                  type="button"
                  className="absolute inset-y-0 left-0 w-1/2 cursor-pointer hover:scale-110 transition-transform"
                  onClick={() => handleClick(starIndex, true)}
                  aria-label={`${starIndex + 0.5} estrelas`}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 w-1/2 cursor-pointer hover:scale-110 transition-transform"
                  onClick={() => handleClick(starIndex, false)}
                  aria-label={`${starIndex + 1} estrelas`}
                />
              </div>
            );
          })}
        </div>

        {/* Contador ao lado */}
        <div className="min-w-[120px] flex flex-col items-start border-l border-[var(--color-border)] pl-6">
          {selected > 0 ? (
            <>
              <p className="text-3xl font-bold text-[var(--color-text-primary)] leading-none">
                {selectedCount}
              </p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1.5">
                {selectedCount === 1 ? "jogo" : "jogos"} com{" "}
                <span className="text-[var(--color-gold)] font-semibold">
                  {selected.toFixed(1).replace(/\.0$/, "")}{" "}
                  {selected === 1 ? "estrela" : "estrelas"}
                </span>
              </p>
            </>
          ) : (
            <p className="text-xs text-[var(--color-text-muted)]">
              Clique em uma estrela para ver a quantidade de jogos com aquela nota
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
