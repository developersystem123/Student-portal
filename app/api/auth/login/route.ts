import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { setSession } from "@/lib/session";
import { errorResponse } from "@/lib/auth-server";
import { clientIp, rateLimit } from "@/lib/rateLimit";
import { crossOriginResponse, isSameOrigin } from "@/lib/sameOrigin";

export async function POST(request: Request) {
  try {
    if (!isSameOrigin(request)) return crossOriginResponse();
    const { email, password, remember } = (await request.json()) as {
      email?: string;
      password?: string;
      remember?: boolean;
    };
    if (!email || !password) {
      return Response.json({ error: "Email and password are required." }, { status: 400 });
    }
    const limited = rateLimit(`login:${clientIp(request)}`, { max: 10, windowMs: 15 * 60 * 1000 });
    if (!limited.ok) {
      return Response.json(
        { error: `Too many sign-in attempts. Try again in ${limited.retryAfterSeconds} seconds.` },
        { status: 429 },
      );
    }
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    // One message for both "no such account" and "wrong password", so the endpoint can't be used
    // to find out which emails are registered.
    if (!user || !verifyPassword(password, user.password)) {
      return Response.json({ error: "Email or password is incorrect." }, { status: 401 });
    }
    await setSession(user.id, user.password, { remember: remember !== false });
    const { password: _p, ...safe } = user;
    return Response.json({ user: safe });
  } catch (err) {
    return errorResponse(err);
  }
}
