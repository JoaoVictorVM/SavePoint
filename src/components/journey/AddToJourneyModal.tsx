"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { getGamesNotInJourney, addGamesToJourney } from "@/actions/journey";
import toast from "react-hot-toast";
import type { JourneyColumnId, JourneyGameCard } from "@/lib/journey-constants";

interface AddToJourneyModalProps {
  isOpen: boolean;
  column: JourneyColumnId | null;
  columnLabel: string;
  onClose: () => void;
  onAdded: (cards: JourneyGameCard[]) => void;
}

type AvailableGame = {
  id: string;
  title: string;
  coverImageUrl: string | null;
};

export function AddToJourneyModal({
  isOpen,
  column,
  columnLabel,
  onClose,
  onAdded,
}: AddToJourneyModalProps) {
  const [availableGames, setAvailableGames] = useState<AvailableGame[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsFetching(true);
      setSelectedIds(new Set());
      getGamesNotInJourney().then((games) => {
        setAvailableGames(games);
        setIsFetching(false);
      });
    }
  }, [isOpen]);

  function toggleGame(gameId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(gameId)) {
        next.delete(gameId);
      } else {
        next.add(gameId);
      }
      return next;
    });
  }

  async function handleAdd() {
    if (!column || selectedIds.size === 0) return;

    setIsLoading(true);
    const result = await addGamesToJourney(Array.from(selectedIds), column);

    if (result.success) {
      onAdded(result.data);
      toast.success(
        `${result.data.length} jogo${result.data.length > 1 ? "s" : ""} adicionado${result.data.length > 1 ? "s" : ""} à jornada!`
      );
      onClose();
    } else {
      toast.error(result.error);
    }

    setIsLoading(false);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Adicionar a "${columnLabel}"`}>
      <div className="space-y-4">
        {isFetching ? (
          <div className="flex justify-center py-8">
            <svg className="animate-spin h-6 w-6 text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : availableGames.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)] text-center py-8">
            Todos os jogos já estão na Journey.
          </p>
        ) : (
          <>
            <p className="text-sm text-[var(--color-text-muted)]">
              Selecione os jogos para adicionar:
            </p>
            <div className="max-h-[300px] overflow-y-auto space-y-2">
              {availableGames.map((game) => {
                const isSelected = selectedIds.has(game.id);
                return (
                  <button
                    key={game.id}
                    onClick={() => toggleGame(game.id)}
                    className={`
                      w-full flex items-center gap-3 p-2.5 rounded-[12px] text-left transition-colors cursor-pointer
                      ${isSelected
                        ? "bg-[var(--color-accent)]/10 border border-[var(--color-accent)]"
                        : "border border-[var(--color-border)] hover:bg-[var(--color-bg-hover)]"
                      }
                    `}
                  >
                    {/* Checkbox */}
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? "bg-[var(--color-accent)] border-[var(--color-accent)]"
                          : "border-[var(--color-border)]"
                      }`}
                    >
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>

                    {/* Game thumbnail */}
                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-[var(--color-bg-elevated)]">
                      {game.coverImageUrl ? (
                        <Image
                          src={game.coverImageUrl}
                          alt={game.title}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[var(--color-accent)]/30 to-[var(--color-bg-base)]/20 flex items-center justify-center">
                          <span className="text-xs font-bold text-[var(--color-text-primary)]/60">
                            {game.title.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                      {game.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleAdd}
            isLoading={isLoading}
            disabled={selectedIds.size === 0 || isFetching}
          >
            Adicionar ({selectedIds.size})
          </Button>
        </div>
      </div>
    </Modal>
  );
}
