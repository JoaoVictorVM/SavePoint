import type { Game } from "@/schema/games";
import type { Tag } from "@/schema/tags";

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export type GameWithTags = Game & {
  tags: Tag[];
};

export type UserSession = {
  id: string;
  username: string;
  email: string;
  goldBalance: number;
};
