import { prisma } from "@/lib/db";
import { errorResponse } from "@/lib/auth-server";
import { hashPassword } from "@/lib/password";
import { resetLinkProblem, resolveResetToken } from "@/lib/passwordReset";
import { crossOriginResponse, isSameOrigin } from "@/lib/sameOrigin";

export async function POST(request: Request) {
  try {
    if (!isSameOrigin(request)) return crossOriginResponse();
    const body = (await request.json().catch(() => ({}))) as {
      token?: string;
      password?: string;
    };
    const token = (body.token ?? "").trim();
    const password = body.password ?? "";

    // Same rules as sign-up, so the new password can always be re-entered on the login form.
    if (password.length < 8)
      return Response.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    if (password.length > 64)
      return Response.json({ error: "Password must be at most 64 characters." }, { status: 400 });

    const resolved = await resolveResetToken(token);
    if (!resolved.ok) {
      return Response.json({ error: resetLinkProblem(resolved.reason) }, { status: 400 });
    }

    // Changing the hash also burns this token: its signature covers the old hash
    // (see lib/passwordReset.ts).
    await prisma.user.update({
      where: { id: resolved.user.id },
      data: { password: hashPassword(password) },
    });

    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
