const PENDING_REDIRECT_KEY = 'mc_pending_redirect'

export function setPendingRedirectPath(path: string) {
  sessionStorage.setItem(PENDING_REDIRECT_KEY, path)
}

export function getPendingRedirect(): string | null {
  return sessionStorage.getItem(PENDING_REDIRECT_KEY)
}

export function clearPendingRedirect() {
  sessionStorage.removeItem(PENDING_REDIRECT_KEY)
}
