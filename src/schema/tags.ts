import { pgTable, uuid, varchar, timestamp, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";

export const tags = pgTable(
  "tags",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 50 }).notNull(),
    color: varchar("color", { length: 7 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [index("tags_user_id_idx").on(table.userId)]
);

// Unique index applied via migration:
// CREATE UNIQUE INDEX tags_user_name_unique ON tags (user_id, lower(name));

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
