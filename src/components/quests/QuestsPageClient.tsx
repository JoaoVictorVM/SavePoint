"use client";

import { useEffect, useState, useCallback } from "react";
import { useAppStore } from "@/stores/useAppStore";
import { AppShell } from "@/components/layout/AppShell";
import { GoldDisplay } from "@/components/layout/GoldDisplay";
import { TagManager } from "@/components/tags/TagManager";
import { PlatformManager } from "@/components/platforms/PlatformManager";
import { QuestGroup } from "./QuestGroup";
import { AddQuestModal } from "./AddQuestModal";
import { EditQuestModal } from "./EditQuestModal";
import { Button } from "@/components/ui/Button";
import type { Quest } from "@/schema/quests";
import type { Game } from "@/schema/games";
import type { UserSession } from "@/lib/types";
import type { QuestsGroupedByGame } from "@/actions/quests";

interface QuestsPageClientProps {
  initialUser: UserSession;
  initialGroups: QuestsGroupedByGame[];
  initialGames: Pick<Game, "id" | "title">[];
}

export function QuestsPageClient({
  initialUser,
  initialGroups,
  initialGames,
}: QuestsPageClientProps) {
  const setUser = useAppStore((s) => s.setUser);
  const user = useAppStore((s) => s.user);
  const updateGoldBalance = useAppStore((s) => s.updateGoldBalance);
  const openTagManager = useAppStore((s) => s.openTagManager);
  const isTagManagerOpen = useAppStore((s) => s.isTagManagerOpen);
  const closeTagManager = useAppStore((s) => s.closeTagManager);
  const openPlatformManager = useAppStore((s) => s.openPlatformManager);
  const isPlatformManagerOpen = useAppStore((s) => s.isPlatformManagerOpen);
  const closePlatformManager = useAppStore((s) => s.closePlatformManager);

  const [groups, setGroups] = useState(initialGroups);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser, setUser]);

  const handleQuestCreated = useCallback((quest: Quest) => {
    setGroups((prev) => {
      const existing = prev.find((g) => g.game.id === quest.gameId);
      if (existing) {
        return prev.map((g) =>
          g.game.id === quest.gameId
            ? { ...g, quests: [quest, ...g.quests] }
            : g
        );
      }
      // New game group — find game title from initialGames
      const gameInfo = initialGames.find((g) => g.id === quest.gameId);
      return [
        ...prev,
        {
          game: { id: quest.gameId, title: gameInfo?.title || "Jogo" },
          quests: [quest],
        },
      ];
    });
  }, [initialGames]);

  const handleQuestToggled = useCallback((updatedQuest: Quest, newGoldBalance: number) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.game.id === updatedQuest.gameId
          ? {
              ...g,
              quests: g.quests.map((q) =>
                q.id === updatedQuest.id ? updatedQuest : q
              ),
            }
          : g
      )
    );
    updateGoldBalance(newGoldBalance);
  }, [updateGoldBalance]);

  const handleQuestDeleted = useCallback((questId: string) => {
    setGroups((prev) => {
      const updated = prev.map((g) => ({
        ...g,
        quests: g.quests.filter((q) => q.id !== questId),
      }));
      // Remove groups with no quests
      return updated.filter((g) => g.quests.length > 0);
    });
  }, []);

  const handleQuestUpdated = useCallback((updatedQuest: Quest) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.game.id === updatedQuest.gameId
          ? {
              ...g,
              quests: g.quests.map((q) =>
                q.id === updatedQuest.id ? updatedQuest : q
              ),
            }
          : g
      )
    );
  }, []);

  return (
    <AppShell
      username={user?.username || initialUser.username}
      goldBalance={user?.goldBalance ?? initialUser.goldBalance}
      onOpenTagManager={openTagManager}
      onOpenPlatformManager={openPlatformManager}
    >
      <div className="p-6 md:p-8 max-w-3xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Quests</h1>
            <GoldDisplay amount={user?.goldBalance ?? initialUser.goldBalance} animate />
          </div>
          <Button onClick={() => setIsAddOpen(true)}>+ Nova Quest</Button>
        </div>

        {/* Quest groups */}
        {groups.length > 0 ? (
          <div className="space-y-4">
            {groups.map((group) => (
              <QuestGroup
                key={group.game.id}
                gameTitle={group.game.title}
                quests={group.quests}
                onQuestToggled={handleQuestToggled}
                onQuestDeleted={handleQuestDeleted}
                onEditQuest={setEditingQuest}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center">
              <svg className="w-8 h-8 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1">
              Nenhuma quest ainda
            </h3>
            <p className="text-sm text-[var(--color-text-muted)] mb-4">
              Crie sua primeira quest para começar a ganhar ouro!
            </p>
            <Button onClick={() => setIsAddOpen(true)}>+ Nova Quest</Button>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddQuestModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        games={initialGames}
        onCreated={handleQuestCreated}
      />
      <EditQuestModal
        quest={editingQuest}
        onClose={() => setEditingQuest(null)}
        onUpdated={handleQuestUpdated}
      />
      <TagManager
        isOpen={isTagManagerOpen}
        onClose={closeTagManager}
      />
      <PlatformManager
        isOpen={isPlatformManagerOpen}
        onClose={closePlatformManager}
      />
    </AppShell>
  );
}
