const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'

function buildUrl(path) {
  if (/^https?:\/\//i.test(path)) return path
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`
}

export async function request(path, options = {}) {
  return fetch(buildUrl(path), options)
}

export async function parseApiResponse(response) {
  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(payload?.message || `HTTP ${response.status}`)
  }

  if (payload?.success === false) {
    throw new Error(payload?.message || 'Yeu cau khong thanh cong')
  }

  return payload
}

export { API_BASE, buildUrl }

