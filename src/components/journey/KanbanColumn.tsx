"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { JourneyCard } from "./JourneyCard";
import type { JourneyGameCard, JourneyColumnId } from "@/lib/journey-constants";

interface KanbanColumnProps {
  columnId: JourneyColumnId;
  label: string;
  cards: JourneyGameCard[];
  onRemoveCard: (journeyItemId: string) => void;
  onAddClick: (columnId: JourneyColumnId) => void;
}

export function KanbanColumn({
  columnId,
  label,
  cards,
  onRemoveCard,
  onAddClick,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: columnId });

  const sortableIds = cards.map((c) => c.journeyItemId);

  return (
    <div
      className={`
        flex flex-col w-[280px] min-w-[280px] rounded-[16px] bg-[#F4F4F5]/60 border
        transition-colors duration-200
        ${isOver ? "border-[#06E09B] bg-[#06E09B]/5" : "border-transparent"}
      `}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="text-sm font-semibold text-[#18181B]">{label}</h3>
        <span className="text-xs text-[#A1A1AA] bg-white px-2 py-0.5 rounded-full">
          {cards.length}
        </span>
      </div>

      {/* Cards area */}
      <div
        ref={setNodeRef}
        className="flex-1 px-3 pb-3 space-y-3 min-h-[100px] overflow-y-auto"
      >
        <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <JourneyCard
              key={card.journeyItemId}
              card={card}
              onRemove={onRemoveCard}
            />
          ))}
        </SortableContext>

        {/* Add to journey button */}
        <button
          onClick={() => onAddClick(columnId)}
          className="w-full py-3 rounded-[12px] border-2 border-dashed border-[#E4E4E7] text-sm text-[#A1A1AA] hover:border-[#06E09B] hover:text-[#06E09B] transition-colors cursor-pointer"
        >
          + Adicionar a Jornada
        </button>
      </div>
    </div>
  );
}
