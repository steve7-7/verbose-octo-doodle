import { SignJWT, jwtVerify } from "jose";

const SESSION_COOKIE = "ge_session";
const ALG = "HS256";

function getSecret(): Uint8Array {
  const raw = process.env.JWT_SECRET;
  if (!raw || raw.length < 16) {
    // In development, auto-generate a stable secret per process.
    // In production, this will throw — forcing the operator to set JWT_SECRET.
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET environment variable must be set (min 16 characters) in production.");
    }
    const devSecret = process.env.JWT_SECRET_DEV || "goaledge-dev-secret-do-not-use-in-prod";
    return new TextEncoder().encode(devSecret);
  }
  return new TextEncoder().encode(raw);
}

export interface SessionPayload {
  sub: string; // user id
  email: string;
  role: "user" | "admin";
  plan: "free" | "premium";
  exp?: number;
}

export async function signSession(payload: Omit<SessionPayload, "exp">): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: [ALG] });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
