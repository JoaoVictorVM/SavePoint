"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { KanbanColumn } from "./KanbanColumn";
import { JourneyCard } from "./JourneyCard";
import { AddToJourneyModal } from "./AddToJourneyModal";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { removeFromJourney, moveJourneyItem } from "@/actions/journey";
import {
  JOURNEY_COLUMNS,
  JOURNEY_COLUMN_LABELS,
  type JourneyColumnId,
  type JourneyGameCard,
  type JourneyData,
} from "@/lib/journey-constants";
import toast from "react-hot-toast";

interface KanbanBoardProps {
  initialData: JourneyData;
}

export function KanbanBoard({ initialData }: KanbanBoardProps) {
  const [data, setData] = useState<JourneyData>(initialData);
  const [activeCard, setActiveCard] = useState<JourneyGameCard | null>(null);

  // Add modal
  const [addModalColumn, setAddModalColumn] = useState<JourneyColumnId | null>(null);

  // Remove confirmation
  const [removingItem, setRemovingItem] = useState<{ id: string; title: string } | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function findCardColumn(journeyItemId: string): JourneyColumnId | null {
    for (const col of JOURNEY_COLUMNS) {
      if (data[col].some((c) => c.journeyItemId === journeyItemId)) {
        return col;
      }
    }
    return null;
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const col = findCardColumn(active.id as string);
    if (col) {
      const card = data[col].find((c) => c.journeyItemId === active.id);
      setActiveCard(card || null);
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeCol = findCardColumn(activeId);
    // over can be a column id or a card id
    let overCol = JOURNEY_COLUMNS.includes(overId as JourneyColumnId)
      ? (overId as JourneyColumnId)
      : findCardColumn(overId);

    if (!activeCol || !overCol || activeCol === overCol) return;

    setData((prev) => {
      const activeCards = [...prev[activeCol]];
      const overCards = [...prev[overCol]];

      const activeIndex = activeCards.findIndex((c) => c.journeyItemId === activeId);
      const [movedCard] = activeCards.splice(activeIndex, 1);
      movedCard.column = overCol;

      const overIndex = overCards.findIndex((c) => c.journeyItemId === overId);
      if (overIndex >= 0) {
        overCards.splice(overIndex, 0, movedCard);
      } else {
        overCards.push(movedCard);
      }

      return {
        ...prev,
        [activeCol]: activeCards,
        [overCol]: overCards,
      };
    });
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeCol = findCardColumn(activeId);
    if (!activeCol) return;

    let overCol = JOURNEY_COLUMNS.includes(overId as JourneyColumnId)
      ? (overId as JourneyColumnId)
      : findCardColumn(overId);

    if (!overCol) overCol = activeCol;

    if (activeCol === overCol) {
      // Reorder within same column
      const cards = [...data[activeCol]];
      const oldIndex = cards.findIndex((c) => c.journeyItemId === activeId);
      const newIndex = cards.findIndex((c) => c.journeyItemId === overId);

      if (oldIndex !== newIndex && newIndex >= 0) {
        const reordered = arrayMove(cards, oldIndex, newIndex);
        setData((prev) => ({ ...prev, [activeCol]: reordered }));

        // Persist position
        await moveJourneyItem(activeId, activeCol, newIndex);
      }
    } else {
      // Moved to different column — already handled in handleDragOver
      const newIndex = data[overCol].findIndex((c) => c.journeyItemId === activeId);
      await moveJourneyItem(activeId, overCol, newIndex >= 0 ? newIndex : 0);
    }
  }

  const handleRemoveClick = useCallback((journeyItemId: string) => {
    // Find the card to get its title
    for (const col of JOURNEY_COLUMNS) {
      const card = data[col].find((c) => c.journeyItemId === journeyItemId);
      if (card) {
        setRemovingItem({ id: journeyItemId, title: card.title });
        return;
      }
    }
  }, [data]);

  async function handleConfirmRemove() {
    if (!removingItem) return;

    setIsRemoving(true);
    const result = await removeFromJourney(removingItem.id);

    if (result.success) {
      setData((prev) => {
        const next = { ...prev };
        for (const col of JOURNEY_COLUMNS) {
          next[col] = prev[col].filter((c) => c.journeyItemId !== removingItem.id);
        }
        return next;
      });
      toast.success("Jogo removido da Journey!");
    } else {
      toast.error(result.error);
    }

    setIsRemoving(false);
    setRemovingItem(null);
  }

  const handleAddClick = useCallback((columnId: JourneyColumnId) => {
    setAddModalColumn(columnId);
  }, []);

  const handleGamesAdded = useCallback((cards: JourneyGameCard[]) => {
    if (cards.length === 0) return;
    const col = cards[0].column;
    setData((prev) => ({
      ...prev,
      [col]: [...prev[col], ...cards],
    }));
  }, []);

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-5 overflow-x-auto pb-4 min-h-[calc(100vh-180px)]">
          {JOURNEY_COLUMNS.map((col) => (
            <KanbanColumn
              key={col}
              columnId={col}
              label={JOURNEY_COLUMN_LABELS[col]}
              cards={data[col]}
              onRemoveCard={handleRemoveClick}
              onAddClick={handleAddClick}
            />
          ))}
        </div>

        <DragOverlay>
          {activeCard && (
            <div className="w-[256px] rotate-3 opacity-90">
              <JourneyCard card={activeCard} onRemove={() => {}} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Add to Journey Modal */}
      <AddToJourneyModal
        isOpen={!!addModalColumn}
        column={addModalColumn}
        columnLabel={addModalColumn ? JOURNEY_COLUMN_LABELS[addModalColumn] : ""}
        onClose={() => setAddModalColumn(null)}
        onAdded={handleGamesAdded}
      />

      {/* Remove confirmation */}
      <Modal
        isOpen={!!removingItem}
        onClose={() => setRemovingItem(null)}
        title="Remover da Journey"
      >
        <div className="space-y-4">
          <p className="text-sm text-[#18181B]">
            Tem certeza que deseja remover{" "}
            <strong>&quot;{removingItem?.title}&quot;</strong> da Journey?
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setRemovingItem(null)} disabled={isRemoving}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleConfirmRemove} isLoading={isRemoving}>
              Remover
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
