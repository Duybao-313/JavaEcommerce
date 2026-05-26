import { parseApiResponse, request } from './apiClient'
import { authFetch } from './authService'

export async function getCategories() {
  const response = await request('/categories')
  const payload = await parseApiResponse(response)
  return Array.isArray(payload?.data) ? payload.data : []
}

// ==================== Admin Category Management ====================

export async function getCategoryTree() {
  const response = await authFetch('/categories/tree')
  const payload = await parseApiResponse(response)
  return Array.isArray(payload?.data) ? payload.data : []
}

export async function createCategory(body, parentId = null) {
  const query = parentId ? `?parentId=${parentId}` : ''
  const response = await authFetch(`/categories${query}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const payload = await parseApiResponse(response)
  return payload?.data || null
}

export async function updateCategory(categoryId, body) {
  const response = await authFetch(`/categories/${categoryId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const payload = await parseApiResponse(response)
  return payload?.data || null
}

export async function deleteCategory(categoryId) {
  const response = await authFetch(`/categories/${categoryId}`, {
    method: 'DELETE',
  })
  await parseApiResponse(response)
}

export async function getCategoryProductCount(categoryId) {
  const response = await request(`/categories/${categoryId}/product-count`)
  const payload = await parseApiResponse(response)
  return payload?.data ?? 0
}

