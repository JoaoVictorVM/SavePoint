"use client";

import { useState, useMemo } from "react";
import { QuestCard } from "./QuestCard";
import { CompletedQuestCard } from "./CompletedQuestCard";
import { Button } from "@/components/ui/Button";
import type { Quest } from "@/schema/quests";

interface QuestListProps {
  quests: Quest[];
  onActivated: (quest: Quest) => void;
  onDeleted: (questId: string) => void;
  onEdit: (questId: string) => void;
  onAddQuest: () => void;
}

type TabKey = "pending" | "completed";

export function QuestList({
  quests,
  onActivated,
  onDeleted,
  onEdit,
  onAddQuest,
}: QuestListProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("pending");

  const pendingQuests = useMemo(
    () => quests.filter((q) => q.status === "pending"),
    [quests]
  );

  const completedQuests = useMemo(
    () => quests.filter((q) => q.status === "completed"),
    [quests]
  );

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: "pending", label: "Pendentes", count: pendingQuests.length },
    { key: "completed", label: "Completas", count: completedQuests.length },
  ];

  const hasNoQuests = quests.length === 0;

  if (hasNoQuests) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-4xl mb-3 opacity-40">📜</div>
        <h3 className="text-lg font-semibold text-[#18181B] mb-1">
          Nenhuma quest ainda
        </h3>
        <p className="text-sm text-[#71717A] mb-4">
          Crie sua primeira quest para começar a rastrear progresso.
        </p>
        <Button onClick={onAddQuest}>+ Criar Quest</Button>
      </div>
    );
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-[#E4E4E7] mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`
              pb-3 text-sm font-medium transition-colors relative cursor-pointer
              ${
                activeTab === tab.key
                  ? "text-[#18181B]"
                  : "text-[#71717A] hover:text-[#18181B]"
              }
            `}
            role="tab"
            aria-selected={activeTab === tab.key}
          >
            {tab.label}
            <span
              className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key
                  ? "bg-[#06E09B]/15 text-[#06E09B]"
                  : "bg-[#F4F4F5] text-[#A1A1AA]"
              }`}
            >
              {tab.count}
            </span>
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#06E09B]" />
            )}
          </button>
        ))}

        <div className="ml-auto pb-3">
          <Button size="sm" onClick={onAddQuest}>
            + Nova Quest
          </Button>
        </div>
      </div>

      {/* Tab content */}
      <div className="space-y-3" role="tabpanel">
        {activeTab === "pending" && (
          <>
            {pendingQuests.length === 0 ? (
              <p className="text-sm text-[#71717A] text-center py-8">
                Nenhuma quest pendente. Crie uma nova quest!
              </p>
            ) : (
              pendingQuests.map((quest) => (
                <QuestCard
                  key={quest.id}
                  quest={quest}
                  onActivated={onActivated}
                  onDeleted={onDeleted}
                  onEdit={onEdit}
                />
              ))
            )}
          </>
        )}

        {activeTab === "completed" && (
          <>
            {completedQuests.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-[#71717A]">
                  Nenhuma quest completada ainda.
                </p>
                <p className="text-xs text-[#A1A1AA] mt-1">
                  Complete quests para vê-las aqui.
                </p>
              </div>
            ) : (
              completedQuests.map((quest) => (
                <CompletedQuestCard key={quest.id} quest={quest} />
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}
