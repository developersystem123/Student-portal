// "Forgot password" links without a database table.
//
// A reset token is a base64url payload (`userId` + expiry) plus an HMAC signature the server can
// verify on its own. The signature also covers a fingerprint of the account's *current* password
// hash, which buys three things for free:
//
//   • single use — the moment the password changes the fingerprint changes, so the link that was
//     just used (and any other outstanding link) stops verifying;
//   • no stale links after an admin resets a password from the portal;
//   • nothing sensitive at rest — a database dump contains no replayable tokens.
//
// The HMAC message is prefixed with the purpose, so a session cookie can never be replayed as a
// reset token (or vice versa). See lib/session.ts for the shared signing key.

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { RESET_TTL_MINUTES } from "./authConstants";
import { prisma } from "./db";
import { getSigningSecret } from "./session";

const TTL_MS = RESET_TTL_MINUTES * 60 * 1000;

const PURPOSE = "password-reset";

function signPayload(payload: string, fingerprint: string): string {
  return createHmac("sha256", getSigningSecret())
    .update(`${PURPOSE}:${payload}:${fingerprint}`)
    .digest("base64url");
}

/** Short, non-reversible stand-in for the stored password hash. */
function fingerprint(storedPasswordHash: string): string {
  return createHash("sha256").update(storedPasswordHash).digest("hex").slice(0, 32);
}

/** The `?token=` value for a user's reset link. `now` is injectable so tests can age a token. */
export function createResetToken(
  userId: string,
  storedPasswordHash: string,
  now: number = Date.now(),
): string {
  const payload = Buffer.from(
    JSON.stringify({ u: userId, e: now + TTL_MS }),
    "utf8",
  ).toString("base64url");
  return `${payload}.${signPayload(payload, fingerprint(storedPasswordHash))}`;
}

export type ResetTokenCheck =
  | { ok: true; userId: string; expiresAt: Date }
  | { ok: false; reason: "invalid" | "expired" | "stale" };

/** Verify a token in isolation, given the password hash it was minted against. */
export function verifyResetToken(
  token: string,
  storedPasswordHash: string,
  now: number = Date.now(),
): ResetTokenCheck {
  const raw = (token ?? "").trim();
  const dot = raw.lastIndexOf(".");
  if (dot <= 0) return { ok: false, reason: "invalid" };

  const payload = raw.slice(0, dot);
  const signature = raw.slice(dot + 1);
  const expected = signPayload(payload, fingerprint(storedPasswordHash));

  const got = Buffer.from(signature);
  const want = Buffer.from(expected);
  if (got.length !== want.length || !timingSafeEqual(got, want)) {
    return { ok: false, reason: "invalid" };
  }

  let decoded: { u?: unknown; e?: unknown };
  try {
    decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return { ok: false, reason: "invalid" };
  }
  if (typeof decoded.u !== "string" || typeof decoded.e !== "number") {
    return { ok: false, reason: "invalid" };
  }
  if (decoded.e <= now) return { ok: false, reason: "expired" };

  return { ok: true, userId: decoded.u, expiresAt: new Date(decoded.e) };
}

export type ResolvedResetToken =
  | { ok: true; user: { id: string; name: string; email: string }; expiresAt: Date }
  | { ok: false; reason: "invalid" | "expired" | "stale" };

/**
 * Usable by both the reset page (to decide between the form and an "expired link" state) and the
 * reset API. The token's own user id picks the row; the signature is then checked against that
 * row's stored hash, so a token can only ever reset the account it was issued for.
 */
export async function resolveResetToken(rawToken: string): Promise<ResolvedResetToken> {
  const raw = (rawToken ?? "").trim();
  if (!raw) return { ok: false, reason: "invalid" };

  // The payload is unsigned until we've checked the signature, so only read it to find the row.
  const dot = raw.lastIndexOf(".");
  if (dot <= 0) return { ok: false, reason: "invalid" };

  let userId: string | null = null;
  try {
    const decoded = JSON.parse(Buffer.from(raw.slice(0, dot), "base64url").toString("utf8")) as {
      u?: unknown;
    };
    if (typeof decoded.u === "string") userId = decoded.u;
  } catch {
    return { ok: false, reason: "invalid" };
  }
  if (!userId) return { ok: false, reason: "invalid" };

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { ok: false, reason: "invalid" };

  const check = verifyResetToken(raw, user.password);
  if (!check.ok) {
    // A bad signature on a well-formed token usually means it was already spent → "stale".
    return { ok: false, reason: check.reason === "expired" ? "expired" : "stale" };
  }

  return { ok: true, user: { id: user.id, name: user.name, email: user.email }, expiresAt: check.expiresAt };
}

/** User-facing copy for a token that didn't check out. */
export function resetLinkProblem(reason: "invalid" | "expired" | "stale"): string {
  if (reason === "expired") {
    return `This reset link has expired. Links are valid for ${RESET_TTL_MINUTES} minutes.`;
  }
  if (reason === "stale") {
    return "This reset link has already been used, or your password was changed since it was sent.";
  }
  return "This reset link isn't valid. Check that you copied the whole link from your email.";
}

/* Throttling for the endpoints that use these tokens lives in lib/rateLimit.ts. */
