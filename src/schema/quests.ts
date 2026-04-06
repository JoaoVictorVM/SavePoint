import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  decimal,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { games } from "./games";

export const questStatusEnum = pgEnum("quest_status", [
  "pending",
  "active",
  "completed",
]);

export const quests = pgTable("quests", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  gameId: uuid("game_id")
    .notNull()
    .references(() => games.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  status: questStatusEnum("status").notNull().default("pending"),
  progress: integer("progress").notNull().default(0),
  progressMax: integer("progress_max").notNull().default(100),
  goldReward: decimal("gold_reward", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Partial unique index applied via migration:
// CREATE UNIQUE INDEX quests_one_active_per_game ON quests (game_id) WHERE status = 'active';

export type Quest = typeof quests.$inferSelect;
export type NewQuest = typeof quests.$inferInsert;
