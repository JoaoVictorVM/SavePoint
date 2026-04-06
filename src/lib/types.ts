import type { Game } from "@/schema/games";
import type { Quest } from "@/schema/quests";
import type { Tag } from "@/schema/tags";

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export type GameWithTagsAndActiveQuest = Game & {
  tags: Tag[];
  activeQuest: Quest | null;
};

export type UserSession = {
  id: string;
  username: string;
  email: string;
  goldBalance: number;
};
