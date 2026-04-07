"use server";

import { eq, and, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { games } from "@/schema/games";
import { quests } from "@/schema/quests";
import { users } from "@/schema/users";
import { getSession, updateSessionGold } from "@/lib/session";
import { CreateQuestSchema, UpdateQuestSchema, UpdateProgressSchema } from "@/validations/quests";
import type { ActionResult } from "@/lib/types";
import type { Quest } from "@/schema/quests";

async function requireAuth() {
  const session = await getSession();
  if (!session) throw new Error("Não autenticado");
  return session;
}

async function verifyGameOwnership(gameId: string, userId: string) {
  const [game] = await db
    .select({ id: games.id })
    .from(games)
    .where(and(eq(games.id, gameId), eq(games.userId, userId)))
    .limit(1);
  return game;
}

async function verifyQuestOwnership(questId: string, userId: string) {
  const [quest] = await db
    .select({
      id: quests.id,
      gameId: quests.gameId,
      status: quests.status,
      progress: quests.progress,
      progressMax: quests.progressMax,
      goldReward: quests.goldReward,
      title: quests.title,
    })
    .from(quests)
    .innerJoin(games, eq(quests.gameId, games.id))
    .where(and(eq(quests.id, questId), eq(games.userId, userId)))
    .limit(1);
  return quest;
}

export async function getQuestsForGame(gameId: string): Promise<Quest[]> {
  const session = await requireAuth();
  const game = await verifyGameOwnership(gameId, session.id);
  if (!game) return [];

  return db
    .select()
    .from(quests)
    .where(eq(quests.gameId, gameId))
    .orderBy(
      sql`CASE ${quests.status} WHEN 'active' THEN 0 WHEN 'pending' THEN 1 WHEN 'completed' THEN 2 END`,
      quests.createdAt
    );
}

export async function createQuest(
  gameId: string,
  formData: FormData
): Promise<ActionResult<Quest>> {
  const session = await requireAuth();
  const game = await verifyGameOwnership(gameId, session.id);
  if (!game) return { success: false, error: "Jogo não encontrado" };

  const raw = {
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || undefined,
    progressMax: Number(formData.get("progressMax")),
    goldReward: Number(formData.get("goldReward")),
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

  const [newQuest] = await db
    .insert(quests)
    .values({
      gameId,
      title: parsed.data.title,
      description: parsed.data.description || null,
      progressMax: parsed.data.progressMax,
      goldReward: String(parsed.data.goldReward),
      status: "pending",
      progress: 0,
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

  if (quest.status === "completed") {
    return { success: false, error: "Quest completa não pode ser editada" };
  }

  const raw: Record<string, unknown> = {};
  const title = formData.get("title") as string | null;
  const description = formData.get("description") as string | null;
  const progressMax = formData.get("progressMax");
  const goldReward = formData.get("goldReward");

  if (title !== null) raw.title = title;
  if (description !== null) raw.description = description || undefined;
  if (progressMax !== null) raw.progressMax = Number(progressMax);
  if (goldReward !== null) raw.goldReward = Number(goldReward);

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

  // Validate progressMax not below current progress
  if (parsed.data.progressMax !== undefined && parsed.data.progressMax < quest.progress) {
    return {
      success: false,
      error: `Máximo não pode ser menor que o progresso atual (${quest.progress})`,
      fieldErrors: { progressMax: [`Máximo não pode ser menor que o progresso atual (${quest.progress})`] },
    };
  }

  const updateData: Record<string, unknown> = { ...parsed.data, updatedAt: new Date() };
  if (parsed.data.goldReward !== undefined) {
    updateData.goldReward = String(parsed.data.goldReward);
  }

  const [updated] = await db
    .update(quests)
    .set(updateData)
    .where(eq(quests.id, questId))
    .returning();

  return { success: true, data: updated };
}

export async function activateQuest(
  questId: string
): Promise<ActionResult<Quest>> {
  const session = await requireAuth();
  const quest = await verifyQuestOwnership(questId, session.id);
  if (!quest) return { success: false, error: "Quest não encontrada" };

  if (quest.status === "completed") {
    return { success: false, error: "Quest já está completa, não pode ser ativada" };
  }

  // Transaction: deactivate current active + activate this one
  const result = await db.transaction(async (tx) => {
    // Deactivate any active quest for this game
    await tx
      .update(quests)
      .set({ status: "pending", updatedAt: new Date() })
      .where(and(eq(quests.gameId, quest.gameId), eq(quests.status, "active")));

    // Activate this quest
    const [activated] = await tx
      .update(quests)
      .set({ status: "active", updatedAt: new Date() })
      .where(eq(quests.id, questId))
      .returning();

    return activated;
  });

  return { success: true, data: result };
}

export async function deactivateQuest(
  questId: string
): Promise<ActionResult<Quest>> {
  const session = await requireAuth();
  const quest = await verifyQuestOwnership(questId, session.id);
  if (!quest) return { success: false, error: "Quest não encontrada" };

  if (quest.status !== "active") {
    return { success: false, error: "Quest não está ativa" };
  }

  const [updated] = await db
    .update(quests)
    .set({ status: "pending", updatedAt: new Date() })
    .where(eq(quests.id, questId))
    .returning();

  return { success: true, data: updated };
}

export async function updateQuestProgress(
  questId: string,
  newProgress: number
): Promise<ActionResult<Quest>> {
  const session = await requireAuth();
  const quest = await verifyQuestOwnership(questId, session.id);
  if (!quest) return { success: false, error: "Quest não encontrada" };

  if (quest.status !== "active") {
    return { success: false, error: "Quest não está ativa" };
  }

  const parsed = UpdateProgressSchema.safeParse({ progress: newProgress });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  if (newProgress <= quest.progress && newProgress !== 0) {
    return { success: false, error: "Progresso não pode diminuir" };
  }

  if (newProgress > quest.progressMax) {
    return { success: false, error: "Progresso excede o máximo" };
  }

  const [updated] = await db
    .update(quests)
    .set({ progress: newProgress, updatedAt: new Date() })
    .where(eq(quests.id, questId))
    .returning();

  return { success: true, data: updated };
}

export async function completeQuest(
  questId: string
): Promise<ActionResult<{ quest: Quest; newGoldBalance: number; goldReward: number }>> {
  const session = await requireAuth();
  const quest = await verifyQuestOwnership(questId, session.id);
  if (!quest) return { success: false, error: "Quest não encontrada" };

  if (quest.status !== "active") {
    return { success: false, error: "Quest não está ativa" };
  }

  const goldReward = Number(quest.goldReward);

  const result = await db.transaction(async (tx) => {
    // Complete the quest
    const [completedQuest] = await tx
      .update(quests)
      .set({
        status: "completed",
        progress: quest.progressMax,
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(quests.id, questId))
      .returning();

    // Add gold to user
    if (goldReward > 0) {
      await tx
        .update(users)
        .set({
          goldBalance: sql`${users.goldBalance} + ${goldReward}`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, session.id));
    }

    // Get new balance
    const [user] = await tx
      .select({ goldBalance: users.goldBalance })
      .from(users)
      .where(eq(users.id, session.id))
      .limit(1);

    return {
      quest: completedQuest,
      newGoldBalance: Number(user.goldBalance),
      goldReward,
    };
  });

  // Update session with new gold balance
  await updateSessionGold(result.newGoldBalance);

  return { success: true, data: result };
}

export async function deleteQuest(questId: string): Promise<ActionResult> {
  const session = await requireAuth();
  const quest = await verifyQuestOwnership(questId, session.id);
  if (!quest) return { success: false, error: "Quest não encontrada" };

  if (quest.status === "completed") {
    return { success: false, error: "Quests completas não podem ser deletadas" };
  }

  await db.delete(quests).where(eq(quests.id, questId));

  return { success: true, data: undefined };
}
