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

// ---- Status mapping (backend → UI) ----
export const UI_STATUS = {
  PENDING_CONFIRMATION: "Chờ xác nhận",
  SHIPPING: "Đang giao",
  DELIVERED: "Giao hàng thành công",
  CANCELLED: "Đã hủy",
};

export const STATUS_GROUPS = {
  [UI_STATUS.PENDING_CONFIRMATION]: ["PENDING", "CONFIRMED"],
  [UI_STATUS.SHIPPING]: ["PREPARING", "SHIPPING"],
  [UI_STATUS.DELIVERED]: ["DELIVERED"],
  [UI_STATUS.CANCELLED]: ["CANCELLED"],
};

export function mapOrderToUiStatus(orderStatus) {
  const s = String(orderStatus || "").toUpperCase();
  if (STATUS_GROUPS[UI_STATUS.PENDING_CONFIRMATION].includes(s))
    return UI_STATUS.PENDING_CONFIRMATION;
  if (STATUS_GROUPS[UI_STATUS.SHIPPING].includes(s)) return UI_STATUS.SHIPPING;
  if (STATUS_GROUPS[UI_STATUS.DELIVERED].includes(s))
    return UI_STATUS.DELIVERED;
  if (STATUS_GROUPS[UI_STATUS.CANCELLED].includes(s))
    return UI_STATUS.CANCELLED;
  return UI_STATUS.PENDING_CONFIRMATION;
}

export function isOrderCancellable(orderStatus) {
  const s = String(orderStatus || "").toUpperCase();
  return ["PENDING", "CONFIRMED", "PREPARING"].includes(s);
}
