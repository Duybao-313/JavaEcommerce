import { parseApiResponse } from "./apiClient";
import { authFetch } from "./authService";

async function parseListResponse(response) {
  const payload = await parseApiResponse(response);
  return Array.isArray(payload?.data) ? payload.data : [];
}

export async function getAdminProducts() {
  const response = await authFetch("/products/admin");
  return parseListResponse(response);
}

export async function createAdminProduct(formData) {
  const response = await authFetch("/products", {
    method: "POST",
    body: formData,
  });
  const payload = await parseApiResponse(response);
  return payload?.data || null;
}

export async function updateAdminProduct(productId, body) {
  const response = await authFetch(`/products/${productId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await parseApiResponse(response);
  return payload?.data || null;
}

export async function updateProductStatus(productId, status) {
  const response = await authFetch(`/products/${productId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  const payload = await parseApiResponse(response);
  return payload?.data || null;
}

export async function deleteAdminProduct(productId) {
  const response = await authFetch(`/products/${productId}`, {
    method: "DELETE",
  });
  await parseApiResponse(response);
}

export async function getAdminOrders() {
  const response = await authFetch("/orders");
  return parseListResponse(response);
}

export async function updateOrderStatus(orderId, status) {
  const response = await authFetch(`/orders/${orderId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  const payload = await parseApiResponse(response);
  return payload?.data || null;
}

export async function getAdminReviews() {
  const response = await authFetch("/reviews/admin");
  return parseListResponse(response);
}

export async function deleteReview(reviewId) {
  const response = await authFetch(`/reviews/${reviewId}`, {
    method: "DELETE",
  });
  await parseApiResponse(response);
}

export async function getShippings() {
  const response = await authFetch("/shippings");
  return parseListResponse(response);
}

export async function createShipping(body) {
  const response = await authFetch("/shippings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await parseApiResponse(response);
  return payload?.data || null;
}

export async function updateShipping(shippingId, body) {
  const response = await authFetch(`/shippings/${shippingId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await parseApiResponse(response);
  return payload?.data || null;
}

export async function markShippingInTransit(shippingId) {
  const response = await authFetch(`/shippings/${shippingId}/mark-in-transit`, {
    method: "POST",
  });
  await parseApiResponse(response);
}

export async function markShippingDelivered(shippingId) {
  const response = await authFetch(`/shippings/${shippingId}/mark-delivered`, {
    method: "POST",
  });
  await parseApiResponse(response);
}

export async function trackShipping(trackingCode) {
  const response = await authFetch(
    `/shippings/track?trackingCode=${encodeURIComponent(trackingCode)}`,
  );
  const payload = await parseApiResponse(response);
  return payload?.data || null;
}

export async function getShippingByOrderId(orderId) {
  const response = await authFetch(`/shippings/order/${orderId}`);
  const payload = await parseApiResponse(response);
  return payload?.data || null;
}

// ==================== User Management ====================

export async function getAdminUsers(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.role) query.set("role", params.role);
  if (
    params.isActive !== undefined &&
    params.isActive !== null &&
    params.isActive !== ""
  )
    query.set("isActive", params.isActive);
  if (params.page) query.set("page", String(params.page));
  if (params.size) query.set("size", String(params.size));
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortDir) query.set("sortDir", params.sortDir);

  const qs = query.toString();
  const response = await authFetch(`/admin/users${qs ? `?${qs}` : ""}`);
  const payload = await parseApiResponse(response);
  return (
    payload?.data || {
      content: [],
      totalElements: 0,
      totalPages: 0,
      currentPage: 1,
    }
  );
}

export async function getAdminUserDetail(userId) {
  const response = await authFetch(`/admin/users/${userId}`);
  const payload = await parseApiResponse(response);
  return payload?.data || null;
}

export async function updateAdminUser(userId, body) {
  const response = await authFetch(`/admin/users/${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await parseApiResponse(response);
  return payload?.data || null;
}

export async function assignUserRole(userId, role) {
  const response = await authFetch(`/admin/users/${userId}/role`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });
  const payload = await parseApiResponse(response);
  return payload?.data || null;
}

export async function verifySeller(userId, status) {
  const response = await authFetch(`/admin/users/${userId}/seller/verify`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  const payload = await parseApiResponse(response);
  return payload?.data || null;
}

export async function updateStoreStatus(userId, status) {
  const response = await authFetch(`/admin/users/${userId}/store/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  const payload = await parseApiResponse(response);
  return payload?.data || null;
}

export async function toggleUserActive(userId, isActive) {
  const response = await authFetch(`/admin/users/${userId}/active`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isActive }),
  });
  const payload = await parseApiResponse(response);
  return payload?.data || null;
}

export async function deleteAdminUser(userId) {
  const response = await authFetch(`/admin/users/${userId}`, {
    method: "DELETE",
  });
  if (response.status !== 204) {
    await parseApiResponse(response);
  }
}
