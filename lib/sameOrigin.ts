// Cross-site request forgery guard for the state-changing auth routes.
//
// The session cookie is SameSite=Lax, which already stops a foreign page from *using* a signed-in
// visitor's session. Sign-in is the one case that still needs its own check: without it an attacker
// can quietly sign a visitor into an account the attacker controls, and then watch whatever that
// visitor does next. Browsers always attach Origin to a cross-origin POST (and to same-origin ones
// since 2020), so comparing it with the request's own host is enough to tell the two apart.

/** Host of an absolute URL, or null when it isn't one. */
function hostOf(url: string): string | null {
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}

/**
 * True when the request came from this same site. Requests carrying neither Origin nor Referer
 * (curl, a native app, a server-to-server call) pass — those are not the CSRF case, and SameSite
 * already covers anything a browser does with the session cookie.
 */
export function isSameOrigin(request: Request): boolean {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) return true;

  const origin = request.headers.get("origin");
  if (origin) {
    // "null" is what a sandboxed iframe or a data: URL sends — never this site.
    return origin !== "null" && hostOf(origin) === host;
  }

  const referer = request.headers.get("referer");
  if (referer) return hostOf(referer) === host;

  return true;
}

/** 403 for a request that failed the same-origin check. */
export function crossOriginResponse(): Response {
  return Response.json({ error: "Cross-origin requests are not allowed." }, { status: 403 });
}
