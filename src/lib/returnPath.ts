/** Preserve a learning destination without accepting external redirects. */
export function safeReturnPath(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u0020\u007f]/.test(value)) return "/";
  try {
    const url = new URL(value, "https://neuralclone.site");
    if (url.origin !== "https://neuralclone.site" || !/^\/(?:learn\/[a-z0-9-]+|courses(?:\/[a-z0-9-]+)?|lab|search|playground|account)?$/.test(url.pathname)) return "/";
    return url.pathname + url.search + url.hash;
  } catch { return "/"; }
}
export function authHref(mode: "login" | "register", destination: unknown): string {
  const next = safeReturnPath(destination);
  return `/${mode}${next === "/" ? "" : `?next=${encodeURIComponent(next)}`}`;
}
