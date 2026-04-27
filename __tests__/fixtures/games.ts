import type { Game } from "@/schema/games";
import type { Tag } from "@/schema/tags";
import type { GameWithTags } from "@/lib/types";
import { mockSession } from "./session";

export const mockTags: Tag[] = [
  {
    id: "11111111-0000-0000-0000-000000000001",
    userId: mockSession.id,
    name: "RPG",
    color: "#88C0D0",
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  },
  {
    id: "11111111-0000-0000-0000-000000000002",
    userId: mockSession.id,
    name: "SoulsLike",
    color: "#5E81AC",
    createdAt: new Date("2026-01-02"),
    updatedAt: new Date("2026-01-02"),
  },
];

export const mockGame: Game = {
  id: "22222222-0000-0000-0000-000000000001",
  userId: mockSession.id,
  title: "Hollow Knight",
  coverImageUrl: "https://example.com/cover.jpg",
  isFavorite: false,
  platformId: null,
  rating: "4.5",
  review: null,
  status: "jogando",
  createdAt: new Date("2026-04-01"),
  updatedAt: new Date("2026-04-01"),
};

export const mockGames: Game[] = [
  mockGame,
  {
    ...mockGame,
    id: "22222222-0000-0000-0000-000000000002",
    title: "Elden Ring",
    isFavorite: true,
    rating: "5.0",
    status: "zerado",
  },
  {
    ...mockGame,
    id: "22222222-0000-0000-0000-000000000003",
    title: "Stardew Valley",
    rating: null,
    status: "para_jogar",
  },
];

export const mockGamesWithTags: GameWithTags[] = mockGames.map((g, idx) => ({
  ...g,
  tags: idx === 0 ? mockTags : [],
}));
