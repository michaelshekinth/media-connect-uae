/** Express 5 route params may be string | string[]. */
export function param(value: string | string[] | undefined): string {
  if (value === undefined) return ''
  return Array.isArray(value) ? (value[0] ?? '') : value
}
