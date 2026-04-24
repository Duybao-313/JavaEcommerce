import { parseApiResponse } from './apiClient'
import { authFetch } from './authService'

export async function addToCart(productId, quantity) {
  const response = await authFetch('/cart/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, quantity }),
  })

  const payload = await parseApiResponse(response)
  return payload?.data || null
}

export async function getCart() {
  const response = await authFetch('/cart')
  const payload = await parseApiResponse(response)
  return payload?.data || null
}

export async function updateCartItem(cartItemId, quantity) {
  const response = await authFetch(`/cart/items/${cartItemId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity }),
  })

  const payload = await parseApiResponse(response)
  return payload?.data || null
}

export async function removeFromCart(cartItemId) {
  const response = await authFetch(`/cart/items/${cartItemId}`, {
    method: 'DELETE',
  })

  const payload = await parseApiResponse(response)
  return payload?.data || null
}

