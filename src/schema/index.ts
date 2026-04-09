import { relations } from "drizzle-orm";
import { users } from "./users";
import { games } from "./games";
import { quests } from "./quests";
import { tags } from "./tags";
import { gameTags } from "./gameTags";
import { journeyItems } from "./journeyItems";
import { platforms } from "./platforms";

export const usersRelations = relations(users, ({ many }) => ({
  games: many(games),
  tags: many(tags),
  platforms: many(platforms),
}));

export const gamesRelations = relations(games, ({ one, many }) => ({
  user: one(users, { fields: [games.userId], references: [users.id] }),
  platform: one(platforms, { fields: [games.platformId], references: [platforms.id] }),
  quests: many(quests),
  gameTags: many(gameTags),
  journeyItem: many(journeyItems),
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

export const journeyItemsRelations = relations(journeyItems, ({ one }) => ({
  game: one(games, { fields: [journeyItems.gameId], references: [games.id] }),
}));

export const platformsRelations = relations(platforms, ({ one }) => ({
  user: one(users, { fields: [platforms.userId], references: [users.id] }),
}));

export { users, games, quests, tags, gameTags, journeyItems, platforms };
