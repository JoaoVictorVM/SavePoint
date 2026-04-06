"use client";

import { GameCard } from "./GameCard";
import type { GameWithTagsAndActiveQuest } from "@/lib/types";

interface GameGridProps {
  games: GameWithTagsAndActiveQuest[];
  onToggleFavorite: (gameId: string) => void;
  onEdit: (gameId: string) => void;
  onDelete: (gameId: string) => void;
}

export function GameGrid({
  games,
  onToggleFavorite,
  onEdit,
  onDelete,
}: GameGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {games.map((game) => (
        <GameCard
          key={game.id}
          game={game}
          onToggleFavorite={onToggleFavorite}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
