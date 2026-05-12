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
