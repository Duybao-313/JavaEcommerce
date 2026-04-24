const AUTH_KEY = 'splitgo_auth'
const TOKEN_KEY = 'splitgo_token'
const REFRESH_TOKEN_KEY = 'splitgo_refresh_token'

export function getStoredAuth() {
  const raw = localStorage.getItem(AUTH_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY) || ''
}

export function getStoredRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY) || getStoredToken()
}

export function clearAuth() {
  localStorage.removeItem(AUTH_KEY)
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export function persistAuthResult(payload) {
  if (!payload?.data) return

  const previous = getStoredAuth() || {}
  const authData = {
    ...previous,
    ...payload.data,
  }

  if (!authData.user && previous.user) {
    authData.user = previous.user
  }

  localStorage.setItem(AUTH_KEY, JSON.stringify(authData))

  if (authData.token) {
    localStorage.setItem(TOKEN_KEY, authData.token)
    localStorage.setItem(REFRESH_TOKEN_KEY, authData.refreshToken || authData.token)
  }
}

export function getAuthSession() {
  const token = getStoredToken()
  if (!token) return null

  const auth = getStoredAuth() || {}
  return {
    ...auth,
    token,
    user: auth.user || auth.a || auth,
  }
}

