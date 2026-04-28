"use server";

import { eq, and, sql } from "drizzle-orm";
import { unstable_cache, updateTag } from "next/cache";
import { db } from "@/lib/db";
import { platforms } from "@/schema/platforms";
import { getSession } from "@/lib/session";
import { CreatePlatformSchema, UpdatePlatformSchema } from "@/validations/platforms";
import type { ActionResult } from "@/lib/types";
import type { Platform } from "@/schema/platforms";

async function requireAuth() {
  const session = await getSession();
  if (!session) throw new Error("Não autenticado");
  return session;
}

function platformsCacheKey(userId: string): string {
  return `user-platforms-${userId}`;
}

export async function getUserPlatforms(): Promise<Platform[]> {
  const session = await requireAuth();

  const cached = unstable_cache(
    async (userId: string): Promise<Platform[]> =>
      db
        .select()
        .from(platforms)
        .where(eq(platforms.userId, userId))
        .orderBy(platforms.createdAt),
    [`user-platforms-${session.id}`],
    { tags: [platformsCacheKey(session.id)], revalidate: 3600 }
  );

  return cached(session.id);
}

export async function createPlatform(
  formData: FormData
): Promise<ActionResult<Platform>> {
  const session = await requireAuth();

  const raw = {
    name: formData.get("name") as string,
    color: formData.get("color") as string,
  };

  const parsed = CreatePlatformSchema.safeParse(raw);
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
    .select({ id: platforms.id })
    .from(platforms)
    .where(
      and(
        eq(platforms.userId, session.id),
        sql`lower(${platforms.name}) = ${name.toLowerCase()}`
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return {
      success: false,
      error: "Plataforma com este nome já existe",
      fieldErrors: { name: ["Plataforma com este nome já existe"] },
    };
  }

  const [newPlatform] = await db
    .insert(platforms)
    .values({ userId: session.id, name, color })
    .returning();

  updateTag(platformsCacheKey(session.id));
  return { success: true, data: newPlatform };
}

export async function updatePlatform(
  platformId: string,
  formData: FormData
): Promise<ActionResult<Platform>> {
  const session = await requireAuth();

  const raw: Record<string, unknown> = {};
  const name = formData.get("name") as string | null;
  const color = formData.get("color") as string | null;
  if (name !== null) raw.name = name;
  if (color !== null) raw.color = color;

  const parsed = UpdatePlatformSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: "Dados inválidos" };
  }

  const [platform] = await db
    .select()
    .from(platforms)
    .where(and(eq(platforms.id, platformId), eq(platforms.userId, session.id)))
    .limit(1);

  if (!platform) return { success: false, error: "Plataforma não encontrada" };

  if (parsed.data.name && parsed.data.name.toLowerCase() !== platform.name.toLowerCase()) {
    const dup = await db
      .select({ id: platforms.id })
      .from(platforms)
      .where(
        and(
          eq(platforms.userId, session.id),
          sql`lower(${platforms.name}) = ${parsed.data.name.toLowerCase()}`
        )
      )
      .limit(1);

    if (dup.length > 0) {
      return {
        success: false,
        error: "Plataforma com este nome já existe",
      };
    }
  }

  const [updated] = await db
    .update(platforms)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(platforms.id, platformId))
    .returning();

  updateTag(platformsCacheKey(session.id));
  return { success: true, data: updated };
}

export async function deletePlatform(
  platformId: string
): Promise<ActionResult> {
  const session = await requireAuth();

  const [platform] = await db
    .select({ id: platforms.id })
    .from(platforms)
    .where(and(eq(platforms.id, platformId), eq(platforms.userId, session.id)))
    .limit(1);

  if (!platform) return { success: false, error: "Plataforma não encontrada" };

  await db.delete(platforms).where(eq(platforms.id, platformId));

  updateTag(platformsCacheKey(session.id));
  return { success: true, data: undefined };
}
