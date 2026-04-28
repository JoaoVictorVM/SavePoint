"use server";

import { eq, and, sql } from "drizzle-orm";
import { unstable_cache, updateTag as updateCacheTag } from "next/cache";
import { db } from "@/lib/db";
import { tags } from "@/schema/tags";
import { gameTags } from "@/schema/gameTags";
import { getSession } from "@/lib/session";
import { CreateTagSchema, UpdateTagSchema } from "@/validations/tags";
import type { ActionResult } from "@/lib/types";
import type { Tag } from "@/schema/tags";

async function requireAuth() {
  const session = await getSession();
  if (!session) throw new Error("Não autenticado");
  return session;
}

function tagsCacheKey(userId: string): string {
  return `user-tags-${userId}`;
}

export async function getUserTags(): Promise<Tag[]> {
  const session = await requireAuth();

  // Cache por usuário; invalidado em cada mutação via revalidateTag.
  const cached = unstable_cache(
    async (userId: string): Promise<Tag[]> =>
      db
        .select()
        .from(tags)
        .where(eq(tags.userId, userId))
        .orderBy(tags.createdAt),
    [`user-tags-${session.id}`],
    { tags: [tagsCacheKey(session.id)], revalidate: 3600 }
  );

  return cached(session.id);
}

export async function createTag(
  formData: FormData
): Promise<ActionResult<Tag>> {
  const session = await requireAuth();

  const raw = {
    name: formData.get("name") as string,
    color: formData.get("color") as string,
  };

  const parsed = CreateTagSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as string;
      if (!fieldErrors[field]) fieldErrors[field] = [];
      fieldErrors[field].push(issue.message);
    }
    return { success: false, error: "Dados inválidos", fieldErrors };
  }

  const { name, color } = parsed.data;

  // Check duplicate name (case-insensitive)
  const existing = await db
    .select({ id: tags.id })
    .from(tags)
    .where(
      and(
        eq(tags.userId, session.id),
        sql`lower(${tags.name}) = ${name.toLowerCase()}`
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return {
      success: false,
      error: "Tag com este nome já existe",
      fieldErrors: { name: ["Tag com este nome já existe"] },
    };
  }

  const [newTag] = await db
    .insert(tags)
    .values({ userId: session.id, name, color })
    .returning();

  updateCacheTag(tagsCacheKey(session.id));
  return { success: true, data: newTag };
}

export async function updateTag(
  tagId: string,
  formData: FormData
): Promise<ActionResult<Tag>> {
  const session = await requireAuth();

  const raw: Record<string, unknown> = {};
  const name = formData.get("name") as string | null;
  const color = formData.get("color") as string | null;
  if (name !== null) raw.name = name;
  if (color !== null) raw.color = color;

  const parsed = UpdateTagSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: "Dados inválidos" };
  }

  const [tag] = await db
    .select()
    .from(tags)
    .where(and(eq(tags.id, tagId), eq(tags.userId, session.id)))
    .limit(1);

  if (!tag) return { success: false, error: "Tag não encontrada" };

  if (parsed.data.name && parsed.data.name.toLowerCase() !== tag.name.toLowerCase()) {
    const dup = await db
      .select({ id: tags.id })
      .from(tags)
      .where(
        and(
          eq(tags.userId, session.id),
          sql`lower(${tags.name}) = ${parsed.data.name.toLowerCase()}`
        )
      )
      .limit(1);

    if (dup.length > 0) {
      return {
        success: false,
        error: "Tag com este nome já existe",
      };
    }
  }

  const [updated] = await db
    .update(tags)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(tags.id, tagId))
    .returning();

  updateCacheTag(tagsCacheKey(session.id));
  return { success: true, data: updated };
}

export async function deleteTag(
  tagId: string
): Promise<ActionResult<{ affectedGames: number }>> {
  const session = await requireAuth();

  const [tag] = await db
    .select({ id: tags.id })
    .from(tags)
    .where(and(eq(tags.id, tagId), eq(tags.userId, session.id)))
    .limit(1);

  if (!tag) return { success: false, error: "Tag não encontrada" };

  // Count affected games
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(gameTags)
    .where(eq(gameTags.tagId, tagId));

  await db.delete(tags).where(eq(tags.id, tagId));

  updateCacheTag(tagsCacheKey(session.id));
  return { success: true, data: { affectedGames: count } };
}

export async function assignTagToGame(
  gameId: string,
  tagId: string
): Promise<ActionResult> {
  const session = await requireAuth();

  // Verify ownership of tag
  const [tag] = await db
    .select({ id: tags.id })
    .from(tags)
    .where(and(eq(tags.id, tagId), eq(tags.userId, session.id)))
    .limit(1);

  if (!tag) return { success: false, error: "Tag não encontrada" };

  // Count existing tags on game
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(gameTags)
    .where(eq(gameTags.gameId, gameId));

  if (count >= 5) {
    return { success: false, error: "Máximo de 5 tags por jogo atingido" };
  }

  // Check if already assigned
  const existing = await db
    .select({ id: gameTags.id })
    .from(gameTags)
    .where(and(eq(gameTags.gameId, gameId), eq(gameTags.tagId, tagId)))
    .limit(1);

  if (existing.length > 0) {
    return { success: false, error: "Tag já atribuída" };
  }

  await db.insert(gameTags).values({ gameId, tagId });

  return { success: true, data: undefined };
}

export async function removeTagFromGame(
  gameId: string,
  tagId: string
): Promise<ActionResult> {
  await requireAuth();

  await db
    .delete(gameTags)
    .where(and(eq(gameTags.gameId, gameId), eq(gameTags.tagId, tagId)));

  return { success: true, data: undefined };
}
