const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
const PHONE_RE = /(\+?\d[\d\s\-().]{7,}\d)/g
const URL_RE = /https?:\/\/[^\s]+/gi

export function containsContactInfo(text: string): boolean {
  EMAIL_RE.lastIndex = 0
  PHONE_RE.lastIndex = 0
  URL_RE.lastIndex = 0
  return EMAIL_RE.test(text) || PHONE_RE.test(text) || URL_RE.test(text)
}

export function maskContactInfo(text: string): string {
  return text
    .replace(EMAIL_RE, '[email masked]')
    .replace(URL_RE, '[link masked]')
    .replace(PHONE_RE, '[phone masked]')
}
