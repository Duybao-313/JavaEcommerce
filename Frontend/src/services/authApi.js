const API_BASE = '/api'

async function parseResponse(response) {
  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(payload?.message || `HTTP ${response.status}`)
  }

  if (payload && payload.success === false) {
    throw new Error(payload.message || 'Yêu cầu không thành công')
  }

  return payload
}

function normalizeAuthData(payload) {
  const data = payload?.data ?? null

  if (!data || typeof data !== 'object') {
    return data
  }

  const token = data.token || data.accessToken || data.jwt || null
  const refreshToken = data.refreshToken || null
  const user = data.user || data.profile || data

  return {
    ...data,
    token,
    refreshToken,
    user,
  }
}

export async function login(payload) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const apiResponse = await parseResponse(response)
  return {
    ...apiResponse,
    data: normalizeAuthData(apiResponse),
  }
}

export async function register(payload) {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const apiResponse = await parseResponse(response)
  return {
    ...apiResponse,
    data: normalizeAuthData(apiResponse),
  }
}

export function persistAuthResult(payload) {
  if (!payload?.data) return

  const authData = payload.data
  localStorage.setItem('splitgo_auth', JSON.stringify(authData))

  if (authData.token) {
    localStorage.setItem('splitgo_token', authData.token)
  }

  if (authData.refreshToken) {
    localStorage.setItem('splitgo_refresh_token', authData.refreshToken)
  }
}

