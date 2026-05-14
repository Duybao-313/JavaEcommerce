import { parseApiResponse } from "./apiClient";
import { authFetch } from "./authService";

const BASE = "/wishlist";

export async function addToWishlist(productId) {
  const res = await authFetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId }),
  });
  const payload = await parseApiResponse(res);
  return payload?.data || null;
}

export async function removeFromWishlist(productId) {
  const res = await authFetch(`${BASE}/${productId}`, {
    method: "DELETE",
  });
  const payload = await parseApiResponse(res);
  return payload?.data || null;
}

export async function getWishlist() {
  const res = await authFetch(BASE);
  const payload = await parseApiResponse(res);
  return Array.isArray(payload?.data) ? payload.data : [];
}

export async function checkWishlist(productId) {
  const res = await authFetch(`${BASE}/check/${productId}`);
  const payload = await parseApiResponse(res);
  return payload?.data === true;
}
