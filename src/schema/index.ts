import { relations } from "drizzle-orm";
import { users } from "./users";
import { games } from "./games";
import { quests } from "./quests";
import { tags } from "./tags";
import { gameTags } from "./gameTags";

export const usersRelations = relations(users, ({ many }) => ({
  games: many(games),
  tags: many(tags),
}));

export const gamesRelations = relations(games, ({ one, many }) => ({
  user: one(users, { fields: [games.userId], references: [users.id] }),
  quests: many(quests),
  gameTags: many(gameTags),
}));

export const questsRelations = relations(quests, ({ one }) => ({
  game: one(games, { fields: [quests.gameId], references: [games.id] }),
}));

export const tagsRelations = relations(tags, ({ one, many }) => ({
  user: one(users, { fields: [tags.userId], references: [users.id] }),
  gameTags: many(gameTags),
}));

export const gameTagsRelations = relations(gameTags, ({ one }) => ({
  game: one(games, { fields: [gameTags.gameId], references: [games.id] }),
  tag: one(tags, { fields: [gameTags.tagId], references: [tags.id] }),
}));

export { users, games, quests, tags, gameTags };
