import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  decimal,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { platforms } from "./platforms";

export const games = pgTable(
  "games",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 200 }).notNull(),
    coverImageUrl: text("cover_image_url"),
    isFavorite: boolean("is_favorite").notNull().default(false),
    platformId: uuid("platform_id").references(() => platforms.id, {
      onDelete: "set null",
    }),
    rating: decimal("rating", { precision: 2, scale: 1 }),
    review: text("review"),
    status: varchar("status", { length: 30 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    // Filtra por userId em todas as queries de jogos
    index("games_user_id_idx").on(table.userId),
    // Ordenação principal: ORDER BY isFavorite DESC, createdAt DESC dentro do user
    index("games_user_favorite_created_idx").on(
      table.userId,
      table.isFavorite,
      table.createdAt
    ),
    // Filtros do dashboard por createdAt no período
    index("games_user_created_idx").on(table.userId, table.createdAt),
    // Filtros do dashboard por status
    index("games_user_status_idx").on(table.userId, table.status),
    // Filtros por plataforma
    index("games_platform_id_idx").on(table.platformId),
  ]
);

// Unique index applied via migration:
// CREATE UNIQUE INDEX games_user_title_unique ON games (user_id, lower(title));

export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;
