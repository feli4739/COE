const TOKEN_KEYS = ["authorization", "token", "jwt", "password", "cookie", "set-cookie"];

export function sanitizeText(input: string): string {
  if (!input) return input;
  return input
    .replace(/Bearer\s+[A-Za-z0-9\-_.]+/gi, "Bearer ***")
    .replace(/("password"\s*:\s*")[^"]+(")/gi, '$1***$2')
    .replace(/(password=)[^&\s]+/gi, "$1***")
    .replace(/(token=)[^&\s]+/gi, "$1***");
}

export function sanitizeHeaders(
  headers: Record<string, string> | undefined
): Record<string, string> | undefined {
  if (!headers) return undefined;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) {
    out[k] = TOKEN_KEYS.includes(k.toLowerCase()) ? "***" : sanitizeText(v);
  }
  return out;
}

export function safeError(error: unknown): string {
  if (error instanceof Error) return sanitizeText(error.message);
  return sanitizeText(String(error));
}
