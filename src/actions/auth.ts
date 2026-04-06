"use server";

import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users } from "@/schema/users";
import { createSession, destroySession, getSession } from "@/lib/session";
import { RegisterSchema, LoginSchema } from "@/validations/auth";
import type { ActionResult, UserSession } from "@/lib/types";
import { redirect } from "next/navigation";

export async function registerUser(
  formData: FormData
): Promise<ActionResult<{ userId: string }>> {
  const raw = {
    username: formData.get("username") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = RegisterSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as string;
      if (!fieldErrors[field]) fieldErrors[field] = [];
      fieldErrors[field].push(issue.message);
    }
    return { success: false, error: "Dados inválidos", fieldErrors };
  }

  const { username, email, password } = parsed.data;

  // Check existing email
  const existingEmail = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  if (existingEmail.length > 0) {
    return {
      success: false,
      error: "Email já em uso",
      fieldErrors: { email: ["Email já em uso"] },
    };
  }

  // Check existing username
  const existingUsername = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (existingUsername.length > 0) {
    return {
      success: false,
      error: "Username já em uso",
      fieldErrors: { username: ["Username já em uso"] },
    };
  }

  // Hash password and insert
  const passwordHash = await bcrypt.hash(password, 12);

  const [newUser] = await db
    .insert(users)
    .values({
      username,
      email: email.toLowerCase(),
      passwordHash,
    })
    .returning({ id: users.id, username: users.username, email: users.email, goldBalance: users.goldBalance });

  // Create session
  await createSession({
    id: newUser.id,
    username: newUser.username,
    email: newUser.email,
    goldBalance: Number(newUser.goldBalance),
  });

  return { success: true, data: { userId: newUser.id } };
}

export async function loginUser(
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = LoginSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as string;
      if (!fieldErrors[field]) fieldErrors[field] = [];
      fieldErrors[field].push(issue.message);
    }
    return { success: false, error: "Dados inválidos", fieldErrors };
  }

  const { email, password } = parsed.data;

  // Find user — same error for not-found and wrong-password (no enumeration)
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  if (!user) {
    return { success: false, error: "Credenciais inválidas" };
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) {
    return { success: false, error: "Credenciais inválidas" };
  }

  await createSession({
    id: user.id,
    username: user.username,
    email: user.email,
    goldBalance: Number(user.goldBalance),
  });

  return { success: true, data: undefined };
}

export async function logoutUser(): Promise<void> {
  await destroySession();
  redirect("/login");
}

export async function getCurrentUser(): Promise<UserSession | null> {
  return getSession();
}
