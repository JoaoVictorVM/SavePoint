"use server";

import { eq, and, sql, ilike } from "drizzle-orm";
import { db } from "@/lib/db";
import { games } from "@/schema/games";
import { tags } from "@/schema/tags";
import { gameTags } from "@/schema/gameTags";
import { getSession } from "@/lib/session";
import { CreateGameSchema, UpdateGameSchema } from "@/validations/games";
import type { ActionResult, GameWithTags } from "@/lib/types";
import type { Game } from "@/schema/games";
import type { Tag } from "@/schema/tags";

async function requireAuth() {
  const session = await getSession();
  if (!session) throw new Error("Não autenticado");
  return session;
}

export async function createGame(
  formData: FormData
): Promise<ActionResult<Game>> {
  const session = await requireAuth();

  const ratingStr = formData.get("rating") as string;

  const raw = {
    title: formData.get("title") as string,
    coverImageUrl: (formData.get("coverImageUrl") as string) || undefined,
    platformId: (formData.get("platformId") as string) || undefined,
    rating: ratingStr ? Number(ratingStr) : undefined,
    review: (formData.get("review") as string) || undefined,
    status: (formData.get("status") as string) || undefined,
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
      platformId: parsed.data.platformId || null,
      rating: parsed.data.rating != null ? String(parsed.data.rating) : null,
      review: parsed.data.review || null,
      status: parsed.data.status || null,
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
  const platformId = formData.get("platformId") as string | null;
  const ratingStr = formData.get("rating") as string | null;
  const review = formData.get("review") as string | null;
  const status = formData.get("status") as string | null;

  if (title !== null) raw.title = title;
  if (coverImageUrl !== null) raw.coverImageUrl = coverImageUrl || undefined;
  if (isFavorite !== null) raw.isFavorite = isFavorite === "true";
  if (platformId !== null) raw.platformId = platformId || undefined;
  if (ratingStr !== null) raw.rating = ratingStr ? Number(ratingStr) : undefined;
  if (review !== null) raw.review = review || undefined;
  if (status !== null) raw.status = status || undefined;

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

  const updateData: Record<string, unknown> = {
    ...parsed.data,
    coverImageUrl: parsed.data.coverImageUrl || null,
    updatedAt: new Date(),
  };
  if ("platformId" in parsed.data) updateData.platformId = parsed.data.platformId || null;
  if ("rating" in parsed.data) updateData.rating = parsed.data.rating != null ? String(parsed.data.rating) : null;
  if ("review" in parsed.data) updateData.review = parsed.data.review || null;
  if ("status" in parsed.data) updateData.status = parsed.data.status || null;

  const [updated] = await db
    .update(games)
    .set(updateData)
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

export async function getGames(): Promise<GameWithTags[]> {
  const session = await requireAuth();

  // Single LEFT JOIN: games + tags in one round-trip.
  // Cada jogo aparece N vezes (uma por tag) ou 1 vez se não tem tag (LEFT JOIN).
  const rows = await db
    .select({
      // game fields (todos os necessários para GameWithTags)
      id: games.id,
      userId: games.userId,
      title: games.title,
      coverImageUrl: games.coverImageUrl,
      isFavorite: games.isFavorite,
      platformId: games.platformId,
      rating: games.rating,
      review: games.review,
      status: games.status,
      createdAt: games.createdAt,
      updatedAt: games.updatedAt,
      // tag fields (nullable — LEFT JOIN)
      tagId: tags.id,
      tagName: tags.name,
      tagColor: tags.color,
      tagCreatedAt: tags.createdAt,
      tagUpdatedAt: tags.updatedAt,
    })
    .from(games)
    .leftJoin(gameTags, eq(games.id, gameTags.gameId))
    .leftJoin(tags, eq(gameTags.tagId, tags.id))
    .where(eq(games.userId, session.id))
    .orderBy(sql`${games.isFavorite} DESC, ${games.createdAt} DESC`);

  if (rows.length === 0) return [];

  // Agrupa as linhas por gameId
  const gameMap = new Map<string, GameWithTags>();
  for (const r of rows) {
    let game = gameMap.get(r.id);
    if (!game) {
      game = {
        id: r.id,
        userId: r.userId,
        title: r.title,
        coverImageUrl: r.coverImageUrl,
        isFavorite: r.isFavorite,
        platformId: r.platformId,
        rating: r.rating,
        review: r.review,
        status: r.status,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        tags: [],
      };
      gameMap.set(r.id, game);
    }
    if (r.tagId && r.tagName && r.tagColor) {
      game.tags.push({
        id: r.tagId,
        userId: session.id,
        name: r.tagName,
        color: r.tagColor,
        createdAt: r.tagCreatedAt ?? new Date(),
        updatedAt: r.tagUpdatedAt ?? new Date(),
      } as Tag);
    }
  }

  return Array.from(gameMap.values());
}
