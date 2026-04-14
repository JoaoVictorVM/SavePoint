"use client";

import { useState } from "react";
import { QuestItem } from "./QuestItem";
import type { Quest } from "@/schema/quests";

interface QuestGroupProps {
  gameTitle: string;
  quests: Quest[];
  onQuestToggled: (quest: Quest, newGoldBalance: number) => void;
  onQuestDeleted: (questId: string) => void;
  onEditQuest: (quest: Quest) => void;
}

export function QuestGroup({
  gameTitle,
  quests,
  onQuestToggled,
  onQuestDeleted,
  onEditQuest,
}: QuestGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-bg-surface)] overflow-hidden">
      {/* Game header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 px-4 py-3 hover:bg-[var(--color-bg-hover)]/50 transition-colors cursor-pointer"
      >
        <svg
          className={`w-4 h-4 text-[var(--color-text-muted)] transition-transform duration-200 ${
            isExpanded ? "" : "-rotate-90"
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{gameTitle}</h3>
        <span className="text-xs text-[var(--color-text-muted)] ml-1">
          {quests.length}
        </span>
      </button>

      {/* Quests list */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-0.5">
          {quests.map((quest) => (
            <QuestItem
              key={quest.id}
              quest={quest}
              onToggled={onQuestToggled}
              onDeleted={onQuestDeleted}
              onEdit={onEditQuest}
            />
          ))}
        </div>
      )}
    </div>
  );
}
