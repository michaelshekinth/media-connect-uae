/** Pick only allowed keys from a request body object. */
export function pickFields<T extends Record<string, unknown>>(
  body: Record<string, unknown>,
  allowed: readonly string[],
): Partial<T> {
  const out: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body && body[key] !== undefined) {
      out[key] = body[key]
    }
  }
  return out as Partial<T>
}
