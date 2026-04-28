import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { games } from "./games";

export const quests = pgTable(
  "quests",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    gameId: uuid("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description"),
    completed: boolean("completed").notNull().default(false),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    // Joins por gameId (todas as listagens de quests)
    index("quests_game_id_idx").on(table.gameId),
    // Dashboard: gold ganhado por completedAt no período
    index("quests_completed_at_idx").on(table.completedAt),
  ]
);

export type Quest = typeof quests.$inferSelect;
export type NewQuest = typeof quests.$inferInsert;
