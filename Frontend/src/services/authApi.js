// API Base URL
// Dev: '/api' routes through vite proxy to http://localhost:8080
// The vite proxy rewrites /api prefix to target backend
const API_BASE = '/api'

async function parseResponse(response) {
  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(payload?.message || `HTTP ${response.status}`)
  }

  if (payload && payload.success === false) {
    throw new Error(payload.message || 'Yêu cầu không thành công')
  }

  // Payload format: { success, code, message, data, timestamp }
  return payload
}

function normalizeAuthData(payload) {
  const data = payload?.data ?? null

  if (!data || typeof data !== 'object') {
    return data
  }

  const token = data.token || data.accessToken || data.jwt || null
  const refreshToken = data.refreshToken || data.token || data.jwt || null
  const user = data.user || data.a || data.profile || data

  return {
    ...data,
    token,
    refreshToken,
    user,
  }
}

export function getStoredAuth() {
  const raw = localStorage.getItem('splitgo_auth')
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function getStoredToken() {
  return localStorage.getItem('splitgo_token') || ''
}

export function getStoredRefreshToken() {
  return localStorage.getItem('splitgo_refresh_token') || getStoredToken()
}

export function clearAuth() {
  localStorage.removeItem('splitgo_auth')
  localStorage.removeItem('splitgo_token')
  localStorage.removeItem('splitgo_refresh_token')
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
    localStorage.setItem('splitgo_refresh_token', authData.refreshToken || authData.token)
  }
}

export async function refreshAuthToken(token = getStoredRefreshToken()) {
  if (!token) {
    throw new Error('Không có token để làm mới')
  }

  const response = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  })

  const apiResponse = await parseResponse(response)
  const normalized = {
    ...apiResponse,
    data: normalizeAuthData(apiResponse),
  }

  persistAuthResult(normalized)
  return normalized
}

export async function authFetch(input, init = {}) {
  const headers = new Headers(init.headers || {})
  const token = getStoredToken()

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(input, {
    ...init,
    headers,
  })

  if (response.status !== 401) {
    return response
  }

  const refreshed = await refreshAuthToken()
  const nextHeaders = new Headers(init.headers || {})
  const nextToken = refreshed?.data?.token || getStoredToken()

  if (nextToken) {
    nextHeaders.set('Authorization', `Bearer ${nextToken}`)
  }

  return fetch(input, {
    ...init,
    headers: nextHeaders,
  })
}

export async function getCurrentUserDetail() {
  const response = await authFetch(`${API_BASE}/auth/userdetail`)
  const apiResponse = await parseResponse(response)
  // Response: { success, code, message, data: UserDetail, timestamp }
  return apiResponse?.data || null
}

export async function addToCart(productId, quantity) {
  const response = await authFetch(`${API_BASE}/cart/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, quantity }),
  })
  const apiResponse = await parseResponse(response)
  // Response: { success, code, message, data: CartResponse, timestamp }
  return apiResponse?.data || null
}

export async function getCart() {
  const response = await authFetch(`${API_BASE}/cart`)
  const apiResponse = await parseResponse(response)
  // Response: { success, code, message, data: CartResponse, timestamp }
  return apiResponse?.data || null
}

export async function updateCartItem(cartItemId, quantity) {
  const response = await authFetch(`${API_BASE}/cart/items/${cartItemId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity }),
  })
  const apiResponse = await parseResponse(response)
  // Response: { success, code, message, data: CartResponse, timestamp }
  return apiResponse?.data || null
}

export async function removeFromCart(cartItemId) {
  const response = await authFetch(`${API_BASE}/cart/items/${cartItemId}`, {
    method: 'DELETE',
  })
  const apiResponse = await parseResponse(response)
  // Response: { success, code, message, data: CartResponse, timestamp }
  return apiResponse?.data || null
}

export async function getProductDetail(productId) {
  const response = await fetch(`${API_BASE}/products/${productId}`)
  const apiResponse = await parseResponse(response)
  
  // Response format: { success, code, message, data: ProductResponse, timestamp }
  // Extract product data from wrapper
  if (apiResponse?.data && typeof apiResponse.data === 'object') {
    return apiResponse.data
  }
  return null
}



