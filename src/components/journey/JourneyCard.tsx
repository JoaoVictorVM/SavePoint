"use client";

import Image from "next/image";
import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TagPill } from "@/components/tags/TagPill";
import type { JourneyGameCard } from "@/lib/journey-constants";

interface JourneyCardProps {
  card: JourneyGameCard;
  onRemove: (journeyItemId: string) => void;
}

export function JourneyCard({ card, onRemove }: JourneyCardProps) {
  const [imgError, setImgError] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.journeyItemId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative rounded-[16px] border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-medium)] transition-all duration-200 overflow-hidden"
    >
      {/* Drag handle — the cover area */}
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <div className="relative h-[120px] overflow-hidden">
          {card.coverImageUrl && !imgError ? (
            <Image
              src={card.coverImageUrl}
              alt={`Capa do jogo: ${card.title}`}
              fill
              className="object-cover"
              sizes="250px"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[var(--color-accent)]/30 to-[var(--color-bg-base)]/20 flex items-center justify-center">
              <span className="text-3xl font-bold text-[var(--color-text-primary)]/40">
                {card.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Remove button */}
      <button
        onClick={() => onRemove(card.journeyItemId)}
        className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm hover:bg-[var(--color-error)]/80 text-white transition-all cursor-pointer opacity-0 group-hover:opacity-100"
        aria-label="Remover da Journey"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Content */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
          {card.title}
        </h3>

        {card.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {card.tags.map((tag) => (
              <TagPill key={tag.id} tag={tag} size="sm" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
