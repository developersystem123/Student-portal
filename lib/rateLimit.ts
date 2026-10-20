// Small in-process fixed-window rate limiter for the public endpoints (sign-in, sign-up, password
// reset, contact). Per-instance only — it resets with the server — which is enough to stop casual
// brute force and form spam. Behind several instances this would move to a shared store.

const buckets = new Map<string, number[]>();
const MAX_KEYS = 5000;

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSeconds: number };

/**
 * Record an attempt against `key`. Returns `ok: false` once the key has used up its allowance,
 * with roughly how long the caller should wait.
 */
export function rateLimit(
  key: string,
  { max = 5, windowMs = 15 * 60 * 1000, now = Date.now() }: { max?: number; windowMs?: number; now?: number } = {},
): RateLimitResult {
  const recent = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);

  if (recent.length >= max) {
    buckets.set(key, recent);
    const oldest = recent[0] ?? now;
    return { ok: false, retryAfterSeconds: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)) };
  }

  recent.push(now);
  buckets.set(key, recent);

  // Keep the map from growing without bound.
  if (buckets.size > MAX_KEYS) {
    for (const [k, v] of buckets) {
      if (!v.some((t) => now - t < windowMs)) buckets.delete(k);
    }
  }
  return { ok: true };
}

/** The caller's IP, honouring the proxy headers Next sets behind a load balancer. */
export function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

/** Test seam. */
export function resetRateLimits(): void {
  buckets.clear();
}
