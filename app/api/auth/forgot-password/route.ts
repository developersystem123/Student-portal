import { prisma } from "@/lib/db";
import { errorResponse } from "@/lib/auth-server";
import { passwordResetEmail, sendEmailAsync } from "@/lib/email";
import { RESET_TTL_MINUTES } from "@/lib/authConstants";
import { createResetToken } from "@/lib/passwordReset";
import { clientIp, rateLimit } from "@/lib/rateLimit";
import { validateEmail } from "@/lib/validation";
import { crossOriginResponse, isSameOrigin } from "@/lib/sameOrigin";

// The same answer whether or not the address has an account, so this endpoint can't be used to
// find out who is registered (see F10 — same reasoning as the sign-in message).
const GENERIC_RESPONSE = {
  ok: true,
  message: "If an account exists for that email, we've sent a link to reset the password.",
};

/** Public base URL for the emailed link. APP_URL wins when set (production behind a proxy). */
function siteOrigin(request: Request): string {
  const configured = process.env.APP_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");
  return new URL(request.url).origin;
}

export async function POST(request: Request) {
  try {
    if (!isSameOrigin(request)) return crossOriginResponse();
    const body = (await request.json().catch(() => ({}))) as { email?: string };
    const email = (body.email ?? "").trim().toLowerCase();

    // A malformed address is a user typo, not an account probe, so it can be reported plainly.
    const emailError = validateEmail(email);
    if (emailError) return Response.json({ error: emailError }, { status: 400 });

    const ip = clientIp(request);
    const allowed =
      rateLimit(`forgot:ip:${ip}`, { max: 10 }) && rateLimit(`forgot:email:${email}`, { max: 5 });
    if (!allowed) {
      return Response.json(
        { error: "Too many reset requests. Please try again in a few minutes." },
        { status: 429 },
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const token = createResetToken(user.id, user.password);
      const link = `${siteOrigin(request)}/reset-password?token=${encodeURIComponent(token)}`;
      sendEmailAsync({
        to: user.email,
        ...passwordResetEmail({ name: user.name, link, minutes: RESET_TTL_MINUTES }),
      });
    }

    return Response.json(GENERIC_RESPONSE);
  } catch (err) {
    return errorResponse(err);
  }
}
