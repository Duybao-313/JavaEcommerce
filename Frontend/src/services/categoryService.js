import { parseApiResponse, request } from './apiClient'

export async function getCategories() {
  const response = await request('/categories')
  const payload = await parseApiResponse(response)
  return Array.isArray(payload?.data) ? payload.data : []
}

