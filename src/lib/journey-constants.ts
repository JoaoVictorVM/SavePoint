import type { Tag } from "@/schema/tags";

export const JOURNEY_COLUMNS = [
  "para_jogar",
  "jogando_zerar",
  "zerado",
  "jogando_platinar",
  "platinado",
] as const;

export type JourneyColumnId = (typeof JOURNEY_COLUMNS)[number];

export const JOURNEY_COLUMN_LABELS: Record<JourneyColumnId, string> = {
  para_jogar: "Para Jogar",
  jogando_zerar: "Jogando (Zerar)",
  zerado: "Zerado",
  jogando_platinar: "Jogando (Platinar)",
  platinado: "Platinado",
};

export type JourneyGameCard = {
  journeyItemId: string;
  gameId: string;
  title: string;
  coverImageUrl: string | null;
  tags: Tag[];
  column: JourneyColumnId;
  position: number;
};

export type JourneyData = Record<JourneyColumnId, JourneyGameCard[]>;
