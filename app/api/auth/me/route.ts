import { getCurrentUserWithPlan } from "@/lib/auth-server";

export async function GET() {
  try {
    const user = await getCurrentUserWithPlan();
    return Response.json({ user });
  } catch (err) {
    // A database blip must not read as a crash on every page that asks who is signed in — the
    // client simply treats it as "signed out".
    console.error("[api/auth/me]", err);
    return Response.json({ user: null });
  }
}
