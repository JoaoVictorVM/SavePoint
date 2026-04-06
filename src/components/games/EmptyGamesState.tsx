"use client";

import { Button } from "@/components/ui/Button";

interface EmptyGamesStateProps {
  hasFilters: boolean;
  searchQuery: string;
  onAddGame: () => void;
  onClearFilters: () => void;
}

export function EmptyGamesState({
  hasFilters,
  searchQuery,
  onAddGame,
  onClearFilters,
}: EmptyGamesStateProps) {
  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-5xl mb-4 opacity-40">🔍</div>
        <h2 className="text-2xl font-semibold text-[#18181B] mb-2">
          Nenhum resultado encontrado
        </h2>
        <p className="text-sm text-[#71717A] mb-6">
          {searchQuery
            ? `Nenhum jogo encontrado para "${searchQuery}"`
            : "Tente ajustar os filtros ou busca."}
        </p>
        <Button variant="ghost" onClick={onClearFilters}>
          Limpar filtros
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="text-5xl mb-4 opacity-40">🎮</div>
      <h2 className="text-2xl font-semibold text-[#18181B] mb-2">
        Nenhum Jogo Encontrado
      </h2>
      <p className="text-sm text-[#71717A] mb-6">
        Adicione seu primeiro jogo para começar sua jornada.
      </p>
      <Button size="lg" onClick={onAddGame}>
        + Adicionar Primeiro Jogo
      </Button>
    </div>
  );
}
