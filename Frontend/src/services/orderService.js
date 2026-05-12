import { parseApiResponse } from "./apiClient";
import { authFetch } from "./authService";

export async function checkout(checkoutRequest) {
  const response = await authFetch("/orders/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(checkoutRequest),
  });

  const payload = await parseApiResponse(response);
  return payload?.data || null;
}

export async function getMyOrders() {
  const response = await authFetch("/orders/my");
  const payload = await parseApiResponse(response);
  return payload?.data || [];
}

export async function getOrderById(orderId) {
  const response = await authFetch(`/orders/${orderId}`);
  const payload = await parseApiResponse(response);
  return payload?.data || null;
}

export async function cancelOrder(orderId) {
  const response = await authFetch(`/orders/${orderId}/cancel`, {
    method: "POST",
  });
  const payload = await parseApiResponse(response);
  return payload?.data || null;
}

export async function confirmDelivery(orderId) {
  const response = await authFetch(`/orders/${orderId}/confirm-delivery`, {
    method: "POST",
  });
  const payload = await parseApiResponse(response);
  return payload?.data || null;
}

export async function getReviewableItems(orderId) {
  const response = await authFetch(`/orders/${orderId}/reviewable-items`);
  const payload = await parseApiResponse(response);
  return payload?.data || [];
}

// ---- Status mapping (backend → UI) ----
export const UI_STATUS = {
  PENDING_CONFIRMATION: "Chờ xác nhận",
  SHIPPING: "Đang giao",
  RECEIVED: "Đã nhận hàng",
  DELIVERED: "Giao hàng thành công",
  CANCELLED: "Đã hủy",
};

export const STATUS_GROUPS = {
  [UI_STATUS.PENDING_CONFIRMATION]: ["PENDING"],
  [UI_STATUS.SHIPPING]: ["CONFIRMED", "PREPARING", "SHIPPING"],
  [UI_STATUS.RECEIVED]: ["DELIVERED"],
  [UI_STATUS.CANCELLED]: ["CANCELLED"],
};

export function mapOrderToUiStatus(orderStatus) {
  const s = String(orderStatus || "").toUpperCase();
  if (STATUS_GROUPS[UI_STATUS.PENDING_CONFIRMATION].includes(s))
    return UI_STATUS.PENDING_CONFIRMATION;
  if (STATUS_GROUPS[UI_STATUS.SHIPPING].includes(s)) return UI_STATUS.SHIPPING;
  if (STATUS_GROUPS[UI_STATUS.RECEIVED].includes(s)) return UI_STATUS.RECEIVED;
  if (STATUS_GROUPS[UI_STATUS.CANCELLED].includes(s))
    return UI_STATUS.CANCELLED;
  return UI_STATUS.PENDING_CONFIRMATION;
}

export function isOrderCancellable(orderStatus) {
  const s = String(orderStatus || "").toUpperCase();
  return ["PENDING", "CONFIRMED"].includes(s);
}

// ---- Raw status display (per backend status, not grouped) ----
export const RAW_STATUS_LABEL = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  PREPARING: "Đang chuẩn bị",
  SHIPPING: "Đang giao",
  DELIVERED: "Đã giao",
  CANCELLED: "Đã hủy",
};

export const RAW_STATUS_ICON = {
  PENDING: "⏳",
  CONFIRMED: "✓",
  PREPARING: "📦",
  SHIPPING: "🚚",
  DELIVERED: "✅",
  CANCELLED: "❌",
};

export const RAW_STATUS_CSS = {
  PENDING: "orders-status-pending",
  CONFIRMED: "orders-status-shipping",
  PREPARING: "orders-status-shipping",
  SHIPPING: "orders-status-shipping",
  DELIVERED: "orders-status-delivered",
  CANCELLED: "orders-status-cancelled",
};
