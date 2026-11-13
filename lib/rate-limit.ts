/**
 * Tiny in-memory sliding-window limiter. It is per server instance, so on
 * serverless/multi-instance hosting treat it as a courtesy guard and use a
 * shared store (Upstash, Supabase, etc.) if you need hard limits.
 */
const hits = new Map<string, number[]>();

export function rateLimit(key: string, limit = 8, windowMs = 60_000) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);

  if (recent.length >= limit) {
    hits.set(key, recent);
    return { ok: false, retryAfter: Math.ceil((windowMs - (now - recent[0])) / 1000) };
  }

  recent.push(now);
  hits.set(key, recent);

  // Opportunistic cleanup so the map cannot grow without bound.
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (v.every((t) => now - t >= windowMs)) hits.delete(k);
    }
  }
  return { ok: true, retryAfter: 0 };
}
