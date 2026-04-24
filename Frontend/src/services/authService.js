import { parseApiResponse, request } from './apiClient'
import {
  getStoredRefreshToken,
  getStoredToken,
  persistAuthResult,
} from './sessionService'

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

export async function login(payload) {
  const response = await request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const apiResponse = await parseApiResponse(response)
  return {
    ...apiResponse,
    data: normalizeAuthData(apiResponse),
  }
}

export async function register(payload) {
  const response = await request('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const apiResponse = await parseApiResponse(response)
  return {
    ...apiResponse,
    data: normalizeAuthData(apiResponse),
  }
}

export async function refreshAuthToken(token = getStoredRefreshToken()) {
  if (!token) {
    throw new Error('Khong co token de lam moi')
  }

  const response = await request('/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  })

  const apiResponse = await parseApiResponse(response)
  const normalized = {
    ...apiResponse,
    data: normalizeAuthData(apiResponse),
  }

  persistAuthResult(normalized)
  return normalized
}

export async function authFetch(path, init = {}) {
  const headers = new Headers(init.headers || {})
  const token = getStoredToken()

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await request(path, {
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

  return request(path, {
    ...init,
    headers: nextHeaders,
  })
}

export async function getCurrentUserDetail() {
  const response = await authFetch('/auth/userdetail')
  const apiResponse = await parseApiResponse(response)
  return apiResponse?.data || null
}

