-- Performance indexes — apenas adiciona índices em tabelas existentes.
-- Use IF NOT EXISTS pra ser idempotente caso já tenham sido aplicados.

-- games: filtros por userId, ordenação principal, dashboard, status, platform
CREATE INDEX IF NOT EXISTS "games_user_id_idx" ON "games" ("user_id");
CREATE INDEX IF NOT EXISTS "games_user_favorite_created_idx" ON "games" ("user_id", "is_favorite", "created_at");
CREATE INDEX IF NOT EXISTS "games_user_created_idx" ON "games" ("user_id", "created_at");
CREATE INDEX IF NOT EXISTS "games_user_status_idx" ON "games" ("user_id", "status");
CREATE INDEX IF NOT EXISTS "games_platform_id_idx" ON "games" ("platform_id");

-- quests: joins por gameId, dashboard por completedAt
CREATE INDEX IF NOT EXISTS "quests_game_id_idx" ON "quests" ("game_id");
CREATE INDEX IF NOT EXISTS "quests_completed_at_idx" ON "quests" ("completed_at");

-- tags / platforms: filtra por userId
CREATE INDEX IF NOT EXISTS "tags_user_id_idx" ON "tags" ("user_id");
CREATE INDEX IF NOT EXISTS "platforms_user_id_idx" ON "platforms" ("user_id");

-- journey_items: filtra/ordena por column + position
CREATE INDEX IF NOT EXISTS "journey_items_column_position_idx" ON "journey_items" ("column", "position");

-- game_tags: índice no tagId pra count em deleteTag (caminho inverso da unique)
CREATE INDEX IF NOT EXISTS "game_tags_tag_id_idx" ON "game_tags" ("tag_id");
