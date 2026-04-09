"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Game } from "@/schema/games";
import type { Tag } from "@/schema/tags";
import type { Platform } from "@/schema/platforms";
import type { GameWithTags, UserSession } from "@/lib/types";

interface AppState {
  // Auth
  user: UserSession | null;
  setUser: (user: UserSession | null) => void;
  updateGoldBalance: (newBalance: number) => void;

  // Games
  games: GameWithTags[];
  setGames: (games: GameWithTags[]) => void;
  addGame: (game: GameWithTags) => void;
  updateGame: (gameId: string, updates: Partial<Game>) => void;
  removeGame: (gameId: string) => void;
  toggleGameFavorite: (gameId: string) => void;

  // Tags
  tags: Tag[];
  setTags: (tags: Tag[]) => void;
  addTag: (tag: Tag) => void;
  updateTag: (tagId: string, updates: Partial<Tag>) => void;
  removeTag: (tagId: string) => void;

  // Platforms
  platforms: Platform[];
  setPlatforms: (platforms: Platform[]) => void;
  addPlatform: (platform: Platform) => void;
  updatePlatform: (platformId: string, updates: Partial<Platform>) => void;
  removePlatform: (platformId: string) => void;

  // Filters (Library)
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeTagFilters: string[];
  toggleTagFilter: (tagId: string) => void;
  clearTagFilters: () => void;
  favoritesOnly: boolean;
  toggleFavoritesOnly: () => void;
  clearAllFilters: () => void;

  // UI State
  isAddGameModalOpen: boolean;
  openAddGameModal: () => void;
  closeAddGameModal: () => void;
  editingGameId: string | null;
  openEditGameModal: (gameId: string) => void;
  closeEditGameModal: () => void;
  isTagManagerOpen: boolean;
  openTagManager: () => void;
  closeTagManager: () => void;
  isPlatformManagerOpen: boolean;
  openPlatformManager: () => void;
  closePlatformManager: () => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      // Auth
      user: null,
      setUser: (user) => set({ user }),
      updateGoldBalance: (newBalance) =>
        set((state) => ({
          user: state.user ? { ...state.user, goldBalance: newBalance } : null,
        })),

      // Games
      games: [],
      setGames: (games) => set({ games }),
      addGame: (game) => set((state) => ({ games: [game, ...state.games] })),
      updateGame: (gameId, updates) =>
        set((state) => ({
          games: state.games.map((g) =>
            g.id === gameId ? { ...g, ...updates } : g
          ),
        })),
      removeGame: (gameId) =>
        set((state) => ({
          games: state.games.filter((g) => g.id !== gameId),
        })),
      toggleGameFavorite: (gameId) =>
        set((state) => ({
          games: state.games.map((g) =>
            g.id === gameId ? { ...g, isFavorite: !g.isFavorite } : g
          ),
        })),

      // Tags
      tags: [],
      setTags: (tags) => set({ tags }),
      addTag: (tag) => set((state) => ({ tags: [...state.tags, tag] })),
      updateTag: (tagId, updates) =>
        set((state) => ({
          tags: state.tags.map((t) =>
            t.id === tagId ? { ...t, ...updates } : t
          ),
        })),
      removeTag: (tagId) =>
        set((state) => ({
          tags: state.tags.filter((t) => t.id !== tagId),
          activeTagFilters: state.activeTagFilters.filter((id) => id !== tagId),
        })),

      // Platforms
      platforms: [],
      setPlatforms: (platforms) => set({ platforms }),
      addPlatform: (platform) =>
        set((state) => ({ platforms: [...state.platforms, platform] })),
      updatePlatform: (platformId, updates) =>
        set((state) => ({
          platforms: state.platforms.map((p) =>
            p.id === platformId ? { ...p, ...updates } : p
          ),
        })),
      removePlatform: (platformId) =>
        set((state) => ({
          platforms: state.platforms.filter((p) => p.id !== platformId),
        })),

      // Filters
      searchQuery: "",
      setSearchQuery: (q) => set({ searchQuery: q }),
      activeTagFilters: [],
      toggleTagFilter: (tagId) =>
        set((state) => ({
          activeTagFilters: state.activeTagFilters.includes(tagId)
            ? state.activeTagFilters.filter((id) => id !== tagId)
            : [...state.activeTagFilters, tagId],
        })),
      clearTagFilters: () => set({ activeTagFilters: [] }),
      favoritesOnly: false,
      toggleFavoritesOnly: () =>
        set((state) => ({ favoritesOnly: !state.favoritesOnly })),
      clearAllFilters: () =>
        set({
          searchQuery: "",
          activeTagFilters: [],
          favoritesOnly: false,
        }),

      // UI State
      isAddGameModalOpen: false,
      openAddGameModal: () => set({ isAddGameModalOpen: true }),
      closeAddGameModal: () => set({ isAddGameModalOpen: false }),
      editingGameId: null,
      openEditGameModal: (gameId) => set({ editingGameId: gameId }),
      closeEditGameModal: () => set({ editingGameId: null }),
      isTagManagerOpen: false,
      openTagManager: () => set({ isTagManagerOpen: true }),
      closeTagManager: () => set({ isTagManagerOpen: false }),
      isPlatformManagerOpen: false,
      openPlatformManager: () => set({ isPlatformManagerOpen: true }),
      closePlatformManager: () => set({ isPlatformManagerOpen: false }),
    }),
    { name: "SavePoint" }
  )
);
