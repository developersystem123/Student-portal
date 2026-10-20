// HTTP-only signed session cookie.
//
// The cookie carries the user id, an expiry and a fingerprint of the account's current password
// hash, all covered by one HMAC. Compared with a bare `userId.signature` cookie that buys:
//
//   • an expiry the server actually enforces (not just a browser max-age);
//   • revocation — changing the password invalidates every session issued before it;
//   • no replay across purposes — password-reset tokens sign a different HMAC message.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { passwordFingerprint } from "./password";

const COOKIE_NAME = "eduportal_session";
const PURPOSE = "session";

/** How long a "remember me" sign-in lasts. Without it the cookie dies with the browser. */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

// Cached across module reloads so a dev-server hot reload doesn't sign everyone out.
const holder = globalThis as typeof globalThis & { __eduDevSecret?: string };
const DEV_SECRET_FILE = join(process.cwd(), ".next", ".edu-dev-secret");

/**
 * The app-wide signing key, also used by password-reset tokens (lib/passwordReset.ts), which
 * domain-separate their own HMAC messages so the two can never be swapped.
 *
 * There is deliberately no hard-coded fallback: an attacker who knows the fallback constant could
 * mint sessions for any user id. If SESSION_SECRET is missing we refuse to run in production and
 * use a random per-machine secret in development.
 */
export function getSigningSecret(): string {
  const secret = process.env.SESSION_SECRET?.trim();
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET environment variable is required in production.");
  }
  return devSecret();
}

function devSecret(): string {
  if (holder.__eduDevSecret) return holder.__eduDevSecret;
  try {
    if (existsSync(DEV_SECRET_FILE)) {
      const stored = readFileSync(DEV_SECRET_FILE, "utf8").trim();
      if (stored.length >= 32) return (holder.__eduDevSecret = stored);
    }
    const generated = randomBytes(32).toString("hex");
    mkdirSync(join(process.cwd(), ".next"), { recursive: true });
    writeFileSync(DEV_SECRET_FILE, generated, { mode: 0o600 });
    return (holder.__eduDevSecret = generated);
  } catch {
    // Read-only filesystem — a per-process secret still beats a shared constant.
    return (holder.__eduDevSecret = randomBytes(32).toString("hex"));
  }
}

export type Session = { userId: string; fingerprint: string; expiresAt: number };

function sign(payload: string): string {
  return createHmac("sha256", getSigningSecret()).update(`${PURPOSE}:${payload}`).digest("hex");
}

function pack(session: Session): string {
  const payload = Buffer.from(
    JSON.stringify({ u: session.userId, f: session.fingerprint, e: session.expiresAt }),
    "utf8",
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function unpack(value: string | undefined | null): Session | null {
  if (!value) return null;
  const idx = value.lastIndexOf(".");
  if (idx <= 0) return null;

  const payload = value.slice(0, idx);
  const signature = value.slice(idx + 1);
  const expected = sign(payload);

  const got = Buffer.from(signature, "hex");
  const want = Buffer.from(expected, "hex");
  if (got.length !== want.length || !timingSafeEqual(got, want)) return null;

  let decoded: { u?: unknown; f?: unknown; e?: unknown };
  try {
    decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (typeof decoded.u !== "string" || typeof decoded.f !== "string" || typeof decoded.e !== "number") {
    return null;
  }
  if (decoded.e <= Date.now()) return null;

  return { userId: decoded.u, fingerprint: decoded.f, expiresAt: decoded.e };
}

/** The signed-in session, or null when the cookie is missing, tampered with or expired. */
export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  return unpack(store.get(COOKIE_NAME)?.value);
}

/**
 * Sign a user in. `remember` keeps the cookie for 30 days; without it the cookie is a session
 * cookie, so closing the browser signs the user out.
 */
export async function setSession(
  userId: string,
  storedPasswordHash: string,
  { remember = true }: { remember?: boolean } = {},
): Promise<void> {
  const store = await cookies();
  const session: Session = {
    userId,
    fingerprint: passwordFingerprint(storedPasswordHash),
    expiresAt: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
  };
  store.set(COOKIE_NAME, pack(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    ...(remember ? { maxAge: SESSION_MAX_AGE_SECONDS } : {}),
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
