"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/stores/useAppStore";
import { Header } from "@/components/layout/Header";
import { TagPill } from "@/components/tags/TagPill";
import { ActiveQuestPanel } from "@/components/quests/ActiveQuestPanel";
import { QuestList } from "@/components/quests/QuestList";
import { AddQuestModal } from "@/components/quests/AddQuestModal";
import { EditQuestModal } from "@/components/quests/EditQuestModal";
import { EditGameModal } from "@/components/games/EditGameModal";
import { DeleteGameDialog } from "@/components/games/DeleteGameDialog";
import { Button } from "@/components/ui/Button";
import { toggleFavorite } from "@/actions/games";
import toast from "react-hot-toast";
import type { Game } from "@/schema/games";
import type { Quest } from "@/schema/quests";
import type { Tag } from "@/schema/tags";
import type { UserSession, GameWithTagsAndActiveQuest } from "@/lib/types";

interface GameDetailClientProps {
  initialUser: UserSession;
  initialGame: Game;
  initialQuests: Quest[];
  initialTags: Tag[];
  initialGameTags: Tag[];
}

export function GameDetailClient({
  initialUser,
  initialGame,
  initialQuests,
  initialTags,
  initialGameTags,
}: GameDetailClientProps) {
  const router = useRouter();
  const setUser = useAppStore((s) => s.setUser);
  const user = useAppStore((s) => s.user);
  const updateGoldBalance = useAppStore((s) => s.updateGoldBalance);
  const openTagManager = useAppStore((s) => s.openTagManager);

  const [game, setGame] = useState(initialGame);
  const [quests, setQuests] = useState(initialQuests);
  const [gameTags, setGameTags] = useState(initialGameTags);
  const [imgError, setImgError] = useState(false);

  // Modals
  const [isAddQuestOpen, setIsAddQuestOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
  const [isEditGameOpen, setIsEditGameOpen] = useState(false);
  const [isDeleteGameOpen, setIsDeleteGameOpen] = useState(false);

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser, setUser]);

  const activeQuest = useMemo(
    () => quests.find((q) => q.status === "active") || null,
    [quests]
  );

  const gameStats = useMemo(() => {
    const total = quests.length;
    const completed = quests.filter((q) => q.status === "completed").length;
    const totalGold = quests
      .filter((q) => q.status === "completed")
      .reduce((sum, q) => sum + Number(q.goldReward), 0);
    return { total, completed, totalGold };
  }, [quests]);

  // Build GameWithTagsAndActiveQuest for EditGameModal
  const gameForModal: GameWithTagsAndActiveQuest = useMemo(
    () => ({ ...game, tags: gameTags, activeQuest }),
    [game, gameTags, activeQuest]
  );

  const handleQuestActivated = useCallback((activatedQuest: Quest) => {
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === activatedQuest.id) return activatedQuest;
        if (q.status === "active") return { ...q, status: "pending" as const };
        return q;
      })
    );
  }, []);

  const handleQuestUpdated = useCallback((updatedQuest: Quest) => {
    setQuests((prev) =>
      prev.map((q) => (q.id === updatedQuest.id ? updatedQuest : q))
    );
  }, []);

  const handleQuestCompleted = useCallback(
    (completedQuest: Quest, newGoldBalance: number) => {
      setQuests((prev) =>
        prev.map((q) => (q.id === completedQuest.id ? completedQuest : q))
      );
      updateGoldBalance(newGoldBalance);
    },
    [updateGoldBalance]
  );

  const handleQuestDeactivated = useCallback((deactivatedQuest: Quest) => {
    setQuests((prev) =>
      prev.map((q) => (q.id === deactivatedQuest.id ? deactivatedQuest : q))
    );
  }, []);

  const handleQuestCreated = useCallback((newQuest: Quest) => {
    setQuests((prev) => [...prev, newQuest]);
  }, []);

  const handleQuestDeleted = useCallback((questId: string) => {
    setQuests((prev) => prev.filter((q) => q.id !== questId));
  }, []);

  async function handleToggleFavorite() {
    setGame((prev) => ({ ...prev, isFavorite: !prev.isFavorite }));
    const result = await toggleFavorite(game.id);
    if (!result.success) {
      setGame((prev) => ({ ...prev, isFavorite: !prev.isFavorite }));
      toast.error("Erro ao atualizar favorito");
    }
  }

  function handleGameUpdated(updatedGame: Partial<Game>) {
    setGame((prev) => ({ ...prev, ...updatedGame }));
    setIsEditGameOpen(false);
  }

  function handleGameDeleted() {
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        username={user?.username || initialUser.username}
        goldBalance={user?.goldBalance ?? initialUser.goldBalance}
        onOpenTagManager={openTagManager}
      />

      <main className="flex-1 p-6 md:p-8 max-w-5xl mx-auto w-full">
        {/* Back link + actions */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/dashboard"
            className="text-sm text-[#71717A] hover:text-[#06E09B] transition-colors"
          >
            ← Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditGameOpen(true)}
              className="p-2 rounded-lg text-[#71717A] hover:text-[#18181B] hover:bg-[#F4F4F5] transition-colors cursor-pointer"
              aria-label="Editar jogo"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </button>
            <button
              onClick={() => setIsDeleteGameOpen(true)}
              className="p-2 rounded-lg text-[#71717A] hover:text-[#FF453A] hover:bg-[#FF453A]/5 transition-colors cursor-pointer"
              aria-label="Deletar jogo"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          </div>
        </div>

        {/* Game banner */}
        <div className="relative w-full h-[200px] md:h-[200px] rounded-[16px] overflow-hidden mb-6">
          {game.coverImageUrl && !imgError ? (
            <Image
              src={game.coverImageUrl}
              alt={`Capa do jogo: ${game.title}`}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 1024px"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#06E09B]/30 to-[#0A0A0B]/40 flex items-center justify-center">
              <span className="text-6xl font-bold text-white/40">
                {game.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <h1 className="absolute bottom-4 left-6 text-4xl font-bold text-white">
            {game.title}
          </h1>
        </div>

        {/* Tags + Favorite */}
        <div className="flex items-center gap-3 flex-wrap mb-6">
          {gameTags.map((tag) => (
            <TagPill key={tag.id} tag={tag} size="md" />
          ))}
          <button
            onClick={handleToggleFavorite}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#E4E4E7] text-xs font-medium transition-all cursor-pointer hover:border-[#F59E0B]"
          >
            <svg
              className="w-3.5 h-3.5"
              fill={game.isFavorite ? "#F59E0B" : "none"}
              stroke="#F59E0B"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
            {game.isFavorite ? "Favoritado" : "Favoritar"}
          </button>
        </div>

        {/* Stats + Active quest */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_260px] gap-6 mb-8">
          <ActiveQuestPanel
            quest={activeQuest}
            onQuestUpdated={handleQuestUpdated}
            onQuestCompleted={handleQuestCompleted}
            onQuestDeactivated={handleQuestDeactivated}
          />

          <div className="rounded-[16px] border border-[#E4E4E7] bg-white p-5 space-y-4">
            <h3 className="text-sm font-semibold text-[#18181B] uppercase tracking-wider">
              Estatísticas
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-[#71717A]">Total de Quests</span>
                <span className="text-sm font-semibold text-[#18181B]">
                  {gameStats.total}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#71717A]">Completadas</span>
                <span className="text-sm font-semibold text-[#06E09B]">
                  {gameStats.completed}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#71717A]">Ouro Ganho</span>
                <span className="text-sm font-semibold text-[#18181B] font-mono">
                  🪙 {gameStats.totalGold.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quest list */}
        <QuestList
          quests={quests}
          onActivated={handleQuestActivated}
          onDeleted={handleQuestDeleted}
          onEdit={(questId) =>
            setEditingQuest(quests.find((q) => q.id === questId) || null)
          }
          onAddQuest={() => setIsAddQuestOpen(true)}
        />
      </main>

      {/* Modals */}
      <AddQuestModal
        isOpen={isAddQuestOpen}
        onClose={() => setIsAddQuestOpen(false)}
        gameId={game.id}
        onCreated={handleQuestCreated}
      />
      <EditQuestModal
        quest={editingQuest}
        onClose={() => setEditingQuest(null)}
        onUpdated={handleQuestUpdated}
      />
      <EditGameModal
        game={isEditGameOpen ? gameForModal : null}
        onClose={() => {
          setIsEditGameOpen(false);
        }}
      />
      <DeleteGameDialog
        gameId={isDeleteGameOpen ? game.id : null}
        gameTitle={game.title}
        questCount={quests.length}
        onClose={() => {
          setIsDeleteGameOpen(false);
          handleGameDeleted();
        }}
      />
    </div>
  );
}
