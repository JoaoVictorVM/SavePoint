"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppStore } from "@/stores/useAppStore";
import { AppShell } from "@/components/layout/AppShell";
import { SearchBar } from "@/components/library/SearchBar";
import { FilterBar } from "@/components/library/FilterBar";
import { GameGrid } from "@/components/games/GameGrid";
import { EmptyGamesState } from "@/components/games/EmptyGamesState";
import { AddGameModal } from "@/components/games/AddGameModal";
import { EditGameModal } from "@/components/games/EditGameModal";
import { DeleteGameDialog } from "@/components/games/DeleteGameDialog";
import { TagManager } from "@/components/tags/TagManager";
import { PlatformManager } from "@/components/platforms/PlatformManager";
import { Button } from "@/components/ui/Button";
import { toggleFavorite } from "@/actions/games";
import toast from "react-hot-toast";
import type { GameWithTags, UserSession } from "@/lib/types";
import type { Tag } from "@/schema/tags";
import type { Platform } from "@/schema/platforms";

interface LibraryClientProps {
  initialUser: UserSession;
  initialGames: GameWithTags[];
  initialTags: Tag[];
  initialPlatforms: Platform[];
}

export function LibraryClient({
  initialUser,
  initialGames,
  initialTags,
  initialPlatforms,
}: LibraryClientProps) {
  const setUser = useAppStore((s) => s.setUser);
  const setGames = useAppStore((s) => s.setGames);
  const setTags = useAppStore((s) => s.setTags);
  const setPlatforms = useAppStore((s) => s.setPlatforms);
  const games = useAppStore((s) => s.games);
  const user = useAppStore((s) => s.user);
  const searchQuery = useAppStore((s) => s.searchQuery);
  const activeTagFilters = useAppStore((s) => s.activeTagFilters);
  const favoritesOnly = useAppStore((s) => s.favoritesOnly);
  const clearAllFilters = useAppStore((s) => s.clearAllFilters);
  const toggleGameFavorite = useAppStore((s) => s.toggleGameFavorite);

  // Modals
  const isAddGameModalOpen = useAppStore((s) => s.isAddGameModalOpen);
  const openAddGameModal = useAppStore((s) => s.openAddGameModal);
  const closeAddGameModal = useAppStore((s) => s.closeAddGameModal);
  const editingGameId = useAppStore((s) => s.editingGameId);
  const openEditGameModal = useAppStore((s) => s.openEditGameModal);
  const closeEditGameModal = useAppStore((s) => s.closeEditGameModal);
  const isTagManagerOpen = useAppStore((s) => s.isTagManagerOpen);
  const openTagManager = useAppStore((s) => s.openTagManager);
  const closeTagManager = useAppStore((s) => s.closeTagManager);
  const isPlatformManagerOpen = useAppStore((s) => s.isPlatformManagerOpen);
  const openPlatformManager = useAppStore((s) => s.openPlatformManager);
  const closePlatformManager = useAppStore((s) => s.closePlatformManager);

  // Delete dialog
  const [deletingGameId, setDeletingGameId] = useState<string | null>(null);

  // Hydrate store on mount
  useEffect(() => {
    setUser(initialUser);
    setGames(initialGames);
    setTags(initialTags);
    setPlatforms(initialPlatforms);
  }, [initialUser, initialGames, initialTags, initialPlatforms, setUser, setGames, setTags, setPlatforms]);

  // Filtered games
  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        if (!game.title.toLowerCase().includes(q)) return false;
      }
      if (favoritesOnly && !game.isFavorite) return false;
      if (activeTagFilters.length > 0) {
        const gameTagIds = game.tags.map((t) => t.id);
        if (!activeTagFilters.some((id) => gameTagIds.includes(id)))
          return false;
      }
      return true;
    });
  }, [games, searchQuery, favoritesOnly, activeTagFilters]);

  const hasFilters =
    searchQuery.trim() !== "" ||
    activeTagFilters.length > 0 ||
    favoritesOnly;

  const editingGame = editingGameId
    ? games.find((g) => g.id === editingGameId) || null
    : null;

  const deletingGame = deletingGameId
    ? games.find((g) => g.id === deletingGameId)
    : null;

  async function handleToggleFavorite(gameId: string) {
    // Optimistic
    toggleGameFavorite(gameId);

    const result = await toggleFavorite(gameId);
    if (!result.success) {
      toggleGameFavorite(gameId); // Revert
      toast.error("Erro ao atualizar favorito");
    }
  }

  return (
    <AppShell
      username={user?.username || initialUser.username}
      goldBalance={user?.goldBalance ?? initialUser.goldBalance}
      onOpenTagManager={openTagManager}
      onOpenPlatformManager={openPlatformManager}
    >
      <div className="p-6 md:p-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <SearchBar />
          <div className="ml-auto">
            <Button onClick={openAddGameModal}>+ Novo Jogo</Button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="mb-6">
          <FilterBar />
        </div>

        {/* Content */}
        {filteredGames.length > 0 ? (
          <GameGrid
            games={filteredGames}
            onToggleFavorite={handleToggleFavorite}
            onEdit={openEditGameModal}
            onDelete={setDeletingGameId}
          />
        ) : (
          <EmptyGamesState
            hasFilters={hasFilters}
            searchQuery={searchQuery}
            onAddGame={openAddGameModal}
            onClearFilters={clearAllFilters}
          />
        )}
      </div>

      {/* Modals */}
      <AddGameModal
        isOpen={isAddGameModalOpen}
        onClose={closeAddGameModal}
      />
      <EditGameModal game={editingGame} onClose={closeEditGameModal} />
      <DeleteGameDialog
        gameId={deletingGameId}
        gameTitle={deletingGame?.title || ""}
        questCount={0}
        onClose={() => setDeletingGameId(null)}
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
