import { parseApiResponse, request } from "./apiClient";
import { authFetch } from "./authService";

/**
 * Fetch public store/seller profile information.
 * GET /auth/sellers/{sellerId}
 */
export async function getStoreProfile(sellerId) {
  const response = await request(`/auth/sellers/${sellerId}`);
  const payload = await parseApiResponse(response);
  return payload?.data || null;
}

/**
 * Fetch best-selling products for a store (public).
 * GET /products/store/{sellerId}/best-sellers?limit=8
 */
export async function getBestSellers(sellerId, limit = 8) {
  const response = await request(
    `/products/store/${sellerId}/best-sellers?limit=${limit}`,
  );
  const payload = await parseApiResponse(response);
  return payload?.data || [];
}

/**
 * Fetch public store products with sorting & pagination.
 * GET /products/store/{sellerId}?page=0&size=24&sort=soldDesc
 */
export async function getStoreProducts(
  sellerId,
  { page = 0, size = 24, sort = "soldDesc" } = {},
) {
  const params = new URLSearchParams({ page, size, sort });
  const response = await request(
    `/products/store/${sellerId}?${params.toString()}`,
  );
  const payload = await parseApiResponse(response);
  return (
    payload?.data || {
      content: [],
      totalElements: 0,
      totalPages: 0,
      page: 0,
      size,
    }
  );
}

/**
 * Follow / unfollow a store (requires authentication).
 * Placeholder — backend follow endpoint needs to be added.
 */
export async function toggleFollowStore(sellerId) {
  const response = await authFetch(`/auth/sellers/${sellerId}/follow`, {
    method: "POST",
  });
  const payload = await parseApiResponse(response);
  return payload?.data || null;
}
