import { pgTable, uuid, timestamp, unique } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { games } from "./games";
import { tags } from "./tags";

export const gameTags = pgTable(
  "game_tags",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    gameId: uuid("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [unique().on(table.gameId, table.tagId)]
);

export type GameTag = typeof gameTags.$inferSelect;
export type NewGameTag = typeof gameTags.$inferInsert;
