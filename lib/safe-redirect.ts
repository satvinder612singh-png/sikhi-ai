/**
 * Only allow same-site relative redirects, to prevent open-redirect abuse via
 * ?next=https://evil.example or ?next=//evil.example.
 */
export function safeNextPath(next: string | null | undefined, fallback = "/ask") {
  if (!next) return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("\\")) {
    return fallback;
  }
  return next;
}
