"use server";

import { eq, and, sql, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { games } from "@/schema/games";
import { journeyItems } from "@/schema/journeyItems";
import { tags } from "@/schema/tags";
import { gameTags } from "@/schema/gameTags";
import { getSession } from "@/lib/session";
import type { ActionResult } from "@/lib/types";
import type { Tag } from "@/schema/tags";
import {
  JOURNEY_COLUMNS,
  type JourneyColumnId,
  type JourneyGameCard,
  type JourneyData,
} from "@/lib/journey-constants";

async function requireAuth() {
  const session = await getSession();
  if (!session) throw new Error("Não autenticado");
  return session;
}

export async function getJourneyData(): Promise<JourneyData> {
  const session = await requireAuth();

  // Fetch all journey items for user's games
  const items = await db
    .select({
      journeyItemId: journeyItems.id,
      gameId: journeyItems.gameId,
      column: journeyItems.column,
      position: journeyItems.position,
      title: games.title,
      coverImageUrl: games.coverImageUrl,
    })
    .from(journeyItems)
    .innerJoin(games, eq(journeyItems.gameId, games.id))
    .where(eq(games.userId, session.id))
    .orderBy(journeyItems.position);

  if (items.length === 0) {
    const empty: JourneyData = {} as JourneyData;
    for (const col of JOURNEY_COLUMNS) {
      empty[col] = [];
    }
    return empty;
  }

  // Fetch tags for all games in journey
  const gameIds = items.map((i) => i.gameId);
  const gameTagRows = await db
    .select({
      gameId: gameTags.gameId,
      tagId: tags.id,
      tagName: tags.name,
      tagColor: tags.color,
    })
    .from(gameTags)
    .innerJoin(tags, eq(gameTags.tagId, tags.id))
    .where(inArray(gameTags.gameId, gameIds));

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

  const data: JourneyData = {} as JourneyData;
  for (const col of JOURNEY_COLUMNS) {
    data[col] = [];
  }

  for (const item of items) {
    const col = item.column as JourneyColumnId;
    if (JOURNEY_COLUMNS.includes(col)) {
      data[col].push({
        journeyItemId: item.journeyItemId,
        gameId: item.gameId,
        title: item.title,
        coverImageUrl: item.coverImageUrl,
        tags: tagsByGame.get(item.gameId) || [],
        column: col,
        position: item.position,
      });
    }
  }

  return data;
}

export async function addGamesToJourney(
  gameIds: string[],
  column: JourneyColumnId
): Promise<ActionResult<JourneyGameCard[]>> {
  const session = await requireAuth();

  if (gameIds.length === 0) {
    return { success: false, error: "Nenhum jogo selecionado" };
  }

  if (!JOURNEY_COLUMNS.includes(column)) {
    return { success: false, error: "Coluna inválida" };
  }

  // Verify all games belong to user and are not already in journey
  const userGames = await db
    .select({ id: games.id, title: games.title, coverImageUrl: games.coverImageUrl })
    .from(games)
    .where(and(eq(games.userId, session.id), inArray(games.id, gameIds)));

  if (userGames.length !== gameIds.length) {
    return { success: false, error: "Um ou mais jogos não encontrados" };
  }

  // Get current max position in column
  const [maxPos] = await db
    .select({ maxPosition: sql<number>`COALESCE(MAX(${journeyItems.position}), -1)` })
    .from(journeyItems)
    .innerJoin(games, eq(journeyItems.gameId, games.id))
    .where(and(eq(games.userId, session.id), eq(journeyItems.column, column)));

  let nextPosition = (maxPos?.maxPosition ?? -1) + 1;

  const newItems = await db
    .insert(journeyItems)
    .values(
      gameIds.map((gameId) => ({
        gameId,
        column,
        position: nextPosition++,
      }))
    )
    .returning();

  // Fetch tags for inserted games
  const gameTagRows = await db
    .select({
      gameId: gameTags.gameId,
      tagId: tags.id,
      tagName: tags.name,
      tagColor: tags.color,
    })
    .from(gameTags)
    .innerJoin(tags, eq(gameTags.tagId, tags.id))
    .where(inArray(gameTags.gameId, gameIds));

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

  const gameMap = new Map(userGames.map((g) => [g.id, g]));

  const cards: JourneyGameCard[] = newItems.map((item) => {
    const game = gameMap.get(item.gameId)!;
    return {
      journeyItemId: item.id,
      gameId: item.gameId,
      title: game.title,
      coverImageUrl: game.coverImageUrl,
      tags: tagsByGame.get(item.gameId) || [],
      column: item.column as JourneyColumnId,
      position: item.position,
    };
  });

  return { success: true, data: cards };
}

export async function removeFromJourney(
  journeyItemId: string
): Promise<ActionResult> {
  const session = await requireAuth();

  // Verify ownership
  const [item] = await db
    .select({ id: journeyItems.id })
    .from(journeyItems)
    .innerJoin(games, eq(journeyItems.gameId, games.id))
    .where(and(eq(journeyItems.id, journeyItemId), eq(games.userId, session.id)))
    .limit(1);

  if (!item) return { success: false, error: "Item não encontrado" };

  await db.delete(journeyItems).where(eq(journeyItems.id, journeyItemId));

  return { success: true, data: undefined };
}

export async function moveJourneyItem(
  journeyItemId: string,
  targetColumn: JourneyColumnId,
  newPosition: number
): Promise<ActionResult> {
  const session = await requireAuth();

  if (!JOURNEY_COLUMNS.includes(targetColumn)) {
    return { success: false, error: "Coluna inválida" };
  }

  // Verify ownership
  const [item] = await db
    .select({
      id: journeyItems.id,
      column: journeyItems.column,
      position: journeyItems.position,
    })
    .from(journeyItems)
    .innerJoin(games, eq(journeyItems.gameId, games.id))
    .where(and(eq(journeyItems.id, journeyItemId), eq(games.userId, session.id)))
    .limit(1);

  if (!item) return { success: false, error: "Item não encontrado" };

  await db
    .update(journeyItems)
    .set({
      column: targetColumn,
      position: newPosition,
      updatedAt: new Date(),
    })
    .where(eq(journeyItems.id, journeyItemId));

  return { success: true, data: undefined };
}

export async function getGamesNotInJourney(): Promise<{ id: string; title: string; coverImageUrl: string | null }[]> {
  const session = await requireAuth();

  const inJourney = db
    .select({ gameId: journeyItems.gameId })
    .from(journeyItems);

  return db
    .select({
      id: games.id,
      title: games.title,
      coverImageUrl: games.coverImageUrl,
    })
    .from(games)
    .where(
      and(
        eq(games.userId, session.id),
        sql`${games.id} NOT IN (${inJourney})`
      )
    )
    .orderBy(games.title);
}
