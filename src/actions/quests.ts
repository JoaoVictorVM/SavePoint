"use server";

import { eq, and, sql, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { games } from "@/schema/games";
import { quests } from "@/schema/quests";
import { users } from "@/schema/users";
import { getSession, updateSessionGold } from "@/lib/session";
import { CreateQuestSchema, UpdateQuestSchema } from "@/validations/quests";
import type { ActionResult } from "@/lib/types";
import type { Quest } from "@/schema/quests";
import type { Game } from "@/schema/games";

async function requireAuth() {
  const session = await getSession();
  if (!session) throw new Error("Não autenticado");
  return session;
}

async function verifyQuestOwnership(questId: string, userId: string) {
  const [quest] = await db
    .select({
      id: quests.id,
      gameId: quests.gameId,
      completed: quests.completed,
      title: quests.title,
      description: quests.description,
    })
    .from(quests)
    .innerJoin(games, eq(quests.gameId, games.id))
    .where(and(eq(quests.id, questId), eq(games.userId, userId)))
    .limit(1);
  return quest;
}

export type QuestWithGame = Quest & {
  gameTitle: string;
};

export type QuestsGroupedByGame = {
  game: Pick<Game, "id" | "title">;
  quests: Quest[];
};

export async function getQuestsGroupedByGame(): Promise<QuestsGroupedByGame[]> {
  const session = await requireAuth();

  const rows = await db
    .select({
      quest: quests,
      gameTitle: games.title,
    })
    .from(quests)
    .innerJoin(games, eq(quests.gameId, games.id))
    .where(eq(games.userId, session.id))
    .orderBy(games.title, desc(quests.createdAt));

  const groupMap = new Map<string, QuestsGroupedByGame>();

  for (const row of rows) {
    const gameId = row.quest.gameId;
    if (!groupMap.has(gameId)) {
      groupMap.set(gameId, {
        game: { id: gameId, title: row.gameTitle },
        quests: [],
      });
    }
    groupMap.get(gameId)!.quests.push(row.quest);
  }

  return Array.from(groupMap.values());
}

export async function createQuest(
  formData: FormData
): Promise<ActionResult<Quest>> {
  const session = await requireAuth();

  const raw = {
    gameId: formData.get("gameId") as string,
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || undefined,
  };

  const parsed = CreateQuestSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as string;
      if (!fieldErrors[field]) fieldErrors[field] = [];
      fieldErrors[field].push(issue.message);
    }
    return { success: false, error: "Dados inválidos", fieldErrors };
  }

  // Verify game ownership
  const [game] = await db
    .select({ id: games.id })
    .from(games)
    .where(and(eq(games.id, parsed.data.gameId), eq(games.userId, session.id)))
    .limit(1);

  if (!game) return { success: false, error: "Jogo não encontrado" };

  const [newQuest] = await db
    .insert(quests)
    .values({
      gameId: parsed.data.gameId,
      title: parsed.data.title,
      description: parsed.data.description || null,
    })
    .returning();

  return { success: true, data: newQuest };
}

export async function updateQuest(
  questId: string,
  formData: FormData
): Promise<ActionResult<Quest>> {
  const session = await requireAuth();
  const quest = await verifyQuestOwnership(questId, session.id);
  if (!quest) return { success: false, error: "Quest não encontrada" };

  if (quest.completed) {
    return { success: false, error: "Quest concluída não pode ser editada" };
  }

  const raw = {
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || undefined,
  };

  const parsed = UpdateQuestSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as string;
      if (!fieldErrors[field]) fieldErrors[field] = [];
      fieldErrors[field].push(issue.message);
    }
    return { success: false, error: "Dados inválidos", fieldErrors };
  }

  const [updated] = await db
    .update(quests)
    .set({
      title: parsed.data.title,
      description: parsed.data.description || null,
      updatedAt: new Date(),
    })
    .where(eq(quests.id, questId))
    .returning();

  return { success: true, data: updated };
}

export async function toggleQuestComplete(
  questId: string
): Promise<ActionResult<{ quest: Quest; newGoldBalance: number }>> {
  const session = await requireAuth();
  const quest = await verifyQuestOwnership(questId, session.id);
  if (!quest) return { success: false, error: "Quest não encontrada" };

  const wasCompleted = quest.completed;
  const goldDelta = wasCompleted ? -1 : 1;

  const result = await db.transaction(async (tx) => {
    const [updatedQuest] = await tx
      .update(quests)
      .set({
        completed: !wasCompleted,
        completedAt: wasCompleted ? null : new Date(),
        updatedAt: new Date(),
      })
      .where(eq(quests.id, questId))
      .returning();

    await tx
      .update(users)
      .set({
        goldBalance: sql`${users.goldBalance} + ${goldDelta}`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.id));

    const [user] = await tx
      .select({ goldBalance: users.goldBalance })
      .from(users)
      .where(eq(users.id, session.id))
      .limit(1);

    return {
      quest: updatedQuest,
      newGoldBalance: Number(user.goldBalance),
    };
  });

  await updateSessionGold(result.newGoldBalance);

  return { success: true, data: result };
}

export async function deleteQuest(questId: string): Promise<ActionResult> {
  const session = await requireAuth();
  const quest = await verifyQuestOwnership(questId, session.id);
  if (!quest) return { success: false, error: "Quest não encontrada" };

  // If quest was completed, subtract 1 gold
  if (quest.completed) {
    await db.transaction(async (tx) => {
      await tx.delete(quests).where(eq(quests.id, questId));
      await tx
        .update(users)
        .set({
          goldBalance: sql`GREATEST(${users.goldBalance} - 1, 0)`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, session.id));
    });

    // Update session gold
    const [user] = await db
      .select({ goldBalance: users.goldBalance })
      .from(users)
      .where(eq(users.id, session.id))
      .limit(1);
    if (user) await updateSessionGold(Number(user.goldBalance));
  } else {
    await db.delete(quests).where(eq(quests.id, questId));
  }

  return { success: true, data: undefined };
}

export async function getUserGamesForSelect(): Promise<Pick<Game, "id" | "title">[]> {
  const session = await requireAuth();
  return db
    .select({ id: games.id, title: games.title })
    .from(games)
    .where(eq(games.userId, session.id))
    .orderBy(games.title);
}
