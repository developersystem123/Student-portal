// Server-side auth helpers used by route handlers. Centralizes session lookup
// and role checks so individual routes stay tiny.

import { prisma } from "./db";
import { passwordFingerprint } from "./password";
import { getSession } from "./session";
import type { Role, User } from "./generated/prisma/client";

export type SafeUser = Omit<User, "password">;
export type SafeUserWithPlan = SafeUser & { plan: string };

function stripPassword(u: User): SafeUser {
  const { password: _p, ...safe } = u;
  return safe;
}

/** The signed-in user, or null when the cookie is missing, expired, or revoked. */
export async function getCurrentUser(): Promise<SafeUser | null> {
  const session = await getSession();
  if (!session) return null;
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return null;
  // Revocation: a password change (or reset) invalidates every session issued before it.
  if (passwordFingerprint(user.password) !== session.fingerprint) return null;
  return stripPassword(user);
}

export async function getCurrentUserWithPlan(): Promise<SafeUserWithPlan | null> {
  const session = await getSession();
  if (!session) return null;
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return null;
  if (passwordFingerprint(user.password) !== session.fingerprint) return null;
  const sub = await prisma.subscription.findUnique({
    where: { userId: user.id },
    include: { plan: true },
  });
  const planKey = sub?.status === "active" ? (sub.plan?.key ?? "free") : "free";
  const { password: _p, ...safe } = user;
  return { ...safe, plan: planKey };
}

class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function requireUser(): Promise<SafeUser> {
  const user = await getCurrentUser();
  if (!user) throw new HttpError(401, "Not signed in.");
  return user;
}

export async function requireRole(role: Role): Promise<SafeUser> {
  const user = await requireUser();
  if (user.role !== role) throw new HttpError(403, `Forbidden — ${role} access only.`);
  return user;
}

export async function requireAdmin(): Promise<SafeUser> {
  return requireRole("Admin");
}

export async function requireTeacher(): Promise<SafeUser> {
  return requireRole("Instructor");
}

export async function requireStudent(): Promise<SafeUser> {
  return requireRole("Student");
}

// Turn any error (including HttpError) into a JSON Response.
export function errorResponse(err: unknown): Response {
  if (err instanceof HttpError) {
    return Response.json({ error: err.message }, { status: err.status });
  }
  // Log the real error, but never send it to the client: a driver or runtime message leaks schema
  // names, connection details and stack frames.
  console.error("[api] unexpected error:", err);
  return Response.json(
    { error: "Something went wrong on our side. Please try again." },
    { status: 500 },
  );
}

export { HttpError };
