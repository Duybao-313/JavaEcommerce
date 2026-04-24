import { parseApiResponse, request } from './apiClient'

export async function getProducts() {
  const response = await request('/products')
  const payload = await parseApiResponse(response)
  return Array.isArray(payload?.data) ? payload.data : []
}

export async function getProductDetail(productId) {
  const response = await request(`/products/${productId}`)
  const payload = await parseApiResponse(response)
  return payload?.data || null
}

