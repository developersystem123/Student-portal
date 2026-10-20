// Values shared by the server-side auth code and the client-side auth forms.
//
// Nothing in here may import a server-only module (node:crypto, Prisma, next/headers) — the
// sign-in, sign-up and reset forms all import it. The rest of the password-reset logic lives in
// lib/passwordReset.ts, which is server-only.

/** How long an emailed password-reset link stays valid. Matches the FAQ's "30 minutes". */
export const RESET_TTL_MINUTES = 30;
