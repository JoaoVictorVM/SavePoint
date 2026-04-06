"use server";

import { eq, and, sql, ilike } from "drizzle-orm";
import { db } from "@/lib/db";
import { games } from "@/schema/games";
import { quests } from "@/schema/quests";
import { tags } from "@/schema/tags";
import { gameTags } from "@/schema/gameTags";
import { getSession } from "@/lib/session";
import { CreateGameSchema, UpdateGameSchema } from "@/validations/games";
import type { ActionResult, GameWithTagsAndActiveQuest } from "@/lib/types";
import type { Game } from "@/schema/games";
import type { Tag } from "@/schema/tags";
import type { Quest } from "@/schema/quests";

async function requireAuth() {
  const session = await getSession();
  if (!session) throw new Error("Não autenticado");
  return session;
}

export async function createGame(
  formData: FormData
): Promise<ActionResult<Game>> {
  const session = await requireAuth();

  const raw = {
    title: formData.get("title") as string,
    coverImageUrl: (formData.get("coverImageUrl") as string) || undefined,
  };

  const parsed = CreateGameSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as string;
      if (!fieldErrors[field]) fieldErrors[field] = [];
      fieldErrors[field].push(issue.message);
    }
    return { success: false, error: "Dados inválidos", fieldErrors };
  }

  const { title, coverImageUrl } = parsed.data;

  // Check duplicate title (case-insensitive)
  const existing = await db
    .select({ id: games.id })
    .from(games)
    .where(
      and(eq(games.userId, session.id), ilike(games.title, title))
    )
    .limit(1);

  if (existing.length > 0) {
    return {
      success: false,
      error: "Jogo com este título já existe",
      fieldErrors: { title: ["Jogo com este título já existe"] },
    };
  }

  const [newGame] = await db
    .insert(games)
    .values({
      userId: session.id,
      title,
      coverImageUrl: coverImageUrl || null,
    })
    .returning();

  return { success: true, data: newGame };
}

export async function updateGame(
  gameId: string,
  formData: FormData
): Promise<ActionResult<Game>> {
  const session = await requireAuth();

  const raw: Record<string, unknown> = {};
  const title = formData.get("title") as string | null;
  const coverImageUrl = formData.get("coverImageUrl") as string | null;
  const isFavorite = formData.get("isFavorite");

  if (title !== null) raw.title = title;
  if (coverImageUrl !== null) raw.coverImageUrl = coverImageUrl || undefined;
  if (isFavorite !== null) raw.isFavorite = isFavorite === "true";

  const parsed = UpdateGameSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as string;
      if (!fieldErrors[field]) fieldErrors[field] = [];
      fieldErrors[field].push(issue.message);
    }
    return { success: false, error: "Dados inválidos", fieldErrors };
  }

  // Verify ownership
  const [game] = await db
    .select()
    .from(games)
    .where(and(eq(games.id, gameId), eq(games.userId, session.id)))
    .limit(1);

  if (!game) {
    return { success: false, error: "Jogo não encontrado" };
  }

  // Check title uniqueness if changed
  if (parsed.data.title && parsed.data.title.toLowerCase() !== game.title.toLowerCase()) {
    const dup = await db
      .select({ id: games.id })
      .from(games)
      .where(
        and(
          eq(games.userId, session.id),
          ilike(games.title, parsed.data.title)
        )
      )
      .limit(1);

    if (dup.length > 0) {
      return {
        success: false,
        error: "Jogo com este título já existe",
        fieldErrors: { title: ["Jogo com este título já existe"] },
      };
    }
  }

  const [updated] = await db
    .update(games)
    .set({
      ...parsed.data,
      coverImageUrl: parsed.data.coverImageUrl || null,
      updatedAt: new Date(),
    })
    .where(eq(games.id, gameId))
    .returning();

  return { success: true, data: updated };
}

export async function deleteGame(gameId: string): Promise<ActionResult> {
  const session = await requireAuth();

  const [game] = await db
    .select({ id: games.id })
    .from(games)
    .where(and(eq(games.id, gameId), eq(games.userId, session.id)))
    .limit(1);

  if (!game) {
    return { success: false, error: "Jogo não encontrado" };
  }

  await db.delete(games).where(eq(games.id, gameId));

  return { success: true, data: undefined };
}

export async function toggleFavorite(
  gameId: string
): Promise<ActionResult<{ isFavorite: boolean }>> {
  const session = await requireAuth();

  const [game] = await db
    .select({ id: games.id, isFavorite: games.isFavorite })
    .from(games)
    .where(and(eq(games.id, gameId), eq(games.userId, session.id)))
    .limit(1);

  if (!game) {
    return { success: false, error: "Jogo não encontrado" };
  }

  const newValue = !game.isFavorite;

  await db
    .update(games)
    .set({ isFavorite: newValue, updatedAt: new Date() })
    .where(eq(games.id, gameId));

  return { success: true, data: { isFavorite: newValue } };
}

export async function getGames(): Promise<GameWithTagsAndActiveQuest[]> {
  const session = await requireAuth();

  // Fetch games
  const userGames = await db
    .select()
    .from(games)
    .where(eq(games.userId, session.id))
    .orderBy(sql`${games.isFavorite} DESC, ${games.createdAt} DESC`);

  if (userGames.length === 0) return [];

  const gameIds = userGames.map((g) => g.id);

  // Fetch tags for all games
  const gameTagRows = await db
    .select({
      gameId: gameTags.gameId,
      tagId: tags.id,
      tagName: tags.name,
      tagColor: tags.color,
    })
    .from(gameTags)
    .innerJoin(tags, eq(gameTags.tagId, tags.id))
    .where(sql`${gameTags.gameId} IN ${gameIds}`);

  // Fetch active quests for all games
  const activeQuests = await db
    .select()
    .from(quests)
    .where(
      and(
        sql`${quests.gameId} IN ${gameIds}`,
        eq(quests.status, "active")
      )
    );

  // Map
  const tagsByGame = new Map<string, Tag[]>();
  for (const row of gameTagRows) {
    const arr = tagsByGame.get(row.gameId) || [];
    arr.push({
      id: row.tagId,
      userId: session.id,
      name: row.tagName,
      color: row.tagColor,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    tagsByGame.set(row.gameId, arr);
  }

  const activeQuestByGame = new Map<string, Quest>();
  for (const q of activeQuests) {
    activeQuestByGame.set(q.gameId, q);
  }

  return userGames.map((game) => ({
    ...game,
    tags: tagsByGame.get(game.id) || [],
    activeQuest: activeQuestByGame.get(game.id) || null,
  }));
}
