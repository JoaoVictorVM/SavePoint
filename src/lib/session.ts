import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { UserSession } from "./types";

const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || "dev-secret-change-in-production-min32chars!"
);

const COOKIE_NAME = "savepoint-session";
const EXPIRATION = "7d";

export async function createSession(user: UserSession): Promise<void> {
  const token = await new SignJWT({
    id: user.id,
    username: user.username,
    email: user.email,
    goldBalance: user.goldBalance,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(EXPIRATION)
    .setIssuedAt()
    .sign(SECRET);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET);
    return {
      id: payload.id as string,
      username: payload.username as string,
      email: payload.email as string,
      goldBalance: Number(payload.goldBalance),
    };
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function updateSessionGold(newBalance: number): Promise<void> {
  const session = await getSession();
  if (!session) return;
  await createSession({ ...session, goldBalance: newBalance });
}
