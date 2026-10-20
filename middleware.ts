// Cross-site request forgery guard for the API.
//
// The session cookie is SameSite=Lax, which already stops another origin from *reading* a
// response — but it does not stop a cross-site POST from forcing an action (e.g. silently signing
// a visitor into an attacker's account, or triggering a state change on a form we own).
//
// Every mutating API request therefore has to prove it came from this origin. Same-origin fetch
// and form posts always send `Origin`; anything without an Origin header (server-to-server calls,
// webhooks, curl) is left alone, since a browser attacker can't remove that header.

import { NextResponse, type NextRequest } from "next/server";

const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function blocked() {
  return NextResponse.json({ error: "Cross-site request blocked." }, { status: 403 });
}

export function middleware(request: NextRequest) {
  if (!MUTATING.has(request.method)) return NextResponse.next();

  const origin = request.headers.get("origin");
  if (origin) {
    const host = request.headers.get("host");
    let originHost: string;
    try {
      originHost = new URL(origin).host;
    } catch {
      return blocked();
    }
    if (!host || originHost !== host) return blocked();
    return NextResponse.next();
  }

  // No Origin: fall back to Fetch Metadata when the browser sent it.
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin" && site !== "none") return blocked();

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
