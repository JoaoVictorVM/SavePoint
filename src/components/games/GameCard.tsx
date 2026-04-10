"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { TagPill } from "@/components/tags/TagPill";
import type { GameWithTags } from "@/lib/types";

interface GameCardProps {
  game: GameWithTags;
  onToggleFavorite: (gameId: string) => void;
  onEdit: (gameId: string) => void;
  onDelete: (gameId: string) => void;
}

export function GameCard({
  game,
  onToggleFavorite,
  onEdit,
  onDelete,
}: GameCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="group relative rounded-[16px] border border-[var(--color-border)] bg-[var(--color-dark)] shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-medium)] hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
      {/* Cover image */}
      <Link href={`/games/${game.id}`} className="block">
        <div className="relative h-[160px] overflow-hidden">
          {game.coverImageUrl && !imgError ? (
            <Image
              src={game.coverImageUrl}
              alt={`Capa do jogo: ${game.title}`}
              fill
              className="object-cover transition-opacity duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#fb7895]/30 to-[#fee042]/20 flex items-center justify-center">
              <span className="text-4xl font-bold text-white/60">
                {game.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Favorite button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(game.id);
        }}
        className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-all cursor-pointer"
        aria-label={
          game.isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"
        }
      >
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${
            game.isFavorite ? "scale-110" : ""
          }`}
          fill={game.isFavorite ? "#F59E0B" : "none"}
          stroke={game.isFavorite ? "#F59E0B" : "white"}
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
          />
        </svg>
      </button>

      {/* Content */}
      <div className="p-4">
        <Link href={`/games/${game.id}`}>
          <h3 className="text-lg font-semibold text-[var(--color-text)] truncate hover:text-[var(--color-text-hover)] transition-colors">
            {game.title}
          </h3>
        </Link>

        {/* Tags */}
        {game.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {game.tags.map((tag) => (
              <TagPill key={tag.id} tag={tag} size="sm" />
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-end gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(game.id);
            }}
            className="p-1.5 rounded-lg text-[#71717A] hover:text-[#18181B] hover:bg-[#F4F4F5] transition-colors cursor-pointer"
            aria-label="Editar jogo"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
              />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(game.id);
            }}
            className="p-1.5 rounded-lg text-[#71717A] hover:text-[#FF453A] hover:bg-[#FF453A]/5 transition-colors cursor-pointer"
            aria-label="Deletar jogo"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
