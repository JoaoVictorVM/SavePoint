import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { games } from "./games";

export const journeyItems = pgTable(
  "journey_items",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    gameId: uuid("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    column: varchar("column", { length: 50 }).notNull(),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [unique("journey_items_game_id_unique").on(table.gameId)]
);

export type JourneyItem = typeof journeyItems.$inferSelect;
export type NewJourneyItem = typeof journeyItems.$inferInsert;
