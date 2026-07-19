import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { SESSION_COOKIE_NAME, signSession, verifySession, type SessionPayload } from "@/lib/session";
import type { SafeUser } from "@/lib/types";

export async function getCurrentUser(): Promise<SafeUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = await verifySession(token);
  if (!payload) return null;

  const user = await db.user.findUnique({ where: { id: payload.sub } });
  if (!user) return null;

  return toSafeUser(user);
}

export async function requireUser(): Promise<SafeUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHENTICATED");
  }
  return user;
}

export async function setSessionCookie(payload: Omit<SessionPayload, "exp">): Promise<void> {
  const token = await signSession(payload);
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
}

export function isPremiumActive(user: SafeUser): boolean {
  if (user.plan !== "premium") return false;
  if (!user.planExpiresAt) return false;
  return new Date(user.planExpiresAt).getTime() > Date.now();
}

function toSafeUser(u: {
  id: string;
  name: string;
  email: string;
  role: string;
  plan: string;
  avatarColor: string;
  planExpiresAt: Date | null;
  createdAt: Date;
}): SafeUser {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role as "user" | "admin",
    plan: u.plan as "free" | "premium",
    avatarColor: u.avatarColor,
    planExpiresAt: u.planExpiresAt ? u.planExpiresAt.toISOString() : null,
    createdAt: u.createdAt.toISOString(),
  };
}
