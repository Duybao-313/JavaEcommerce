import { authFetch } from "./authService";
import { parseApiResponse } from "./apiClient";

// ---- Fetch seller's orders ----
export async function getSellerOrders() {
  const response = await authFetch("/seller/orders");
  const payload = await parseApiResponse(response);
  return payload?.data || [];
}

// ---- Update seller order status ----
export async function updateSellerOrderStatus(orderId, status) {
  const response = await authFetch(`/seller/orders/${orderId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  const payload = await parseApiResponse(response);
  return payload?.data || null;
}

// ---- Cancel order (seller) ----
export async function cancelSellerOrder(orderId) {
  const response = await authFetch(`/seller/orders/${orderId}/cancel`, {
    method: "POST",
  });
  const payload = await parseApiResponse(response);
  return payload?.data || null;
}

// ---- Shipping APIs ----
export async function createShipping({ orderId, carrier, estimatedDelivery }) {
  const response = await authFetch("/shippings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId, carrier, estimatedDelivery }),
  });
  const payload = await parseApiResponse(response);
  return payload?.data || null;
}

export async function getShippingByOrderId(orderId) {
  const response = await authFetch(`/shippings/order/${orderId}`);
  const payload = await parseApiResponse(response);
  return payload?.data || null;
}

export async function markShippingInTransit(shippingId) {
  const response = await authFetch(`/shippings/${shippingId}/mark-in-transit`, {
    method: "POST",
  });
  const payload = await parseApiResponse(response);
  return payload;
}

export async function markShippingDelivered(shippingId) {
  const response = await authFetch(`/shippings/${shippingId}/mark-delivered`, {
    method: "POST",
  });
  const payload = await parseApiResponse(response);
  return payload;
}

// ---- Carrier list ----
export const CARRIERS = [
  { value: "GHN", label: "GHN", icon: "📦" },
  { value: "GHTK", label: "GHTK", icon: "📮" },
  { value: "VIETTEL_POST", label: "Viettel Post", icon: "🏣" },
  { value: "JT_EXPRESS", label: "J&T Express", icon: "🚛" },
  { value: "GRAB_EXPRESS", label: "GrabExpress", icon: "🛵" },
  { value: "AHAMOVE", label: "Ahamove", icon: "🏍️" },
  { value: "LALAMOVE", label: "Lalamove", icon: "🚐" },
  { value: "OTHER", label: "Khác", icon: "📋" },
];

// ---- Status metadata ----
export const ORDER_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  PREPARING: "PREPARING",
  SHIPPING: "SHIPPING",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
};

export const STATUS_LABEL = {
  [ORDER_STATUS.PENDING]: "Chờ xác nhận",
  [ORDER_STATUS.CONFIRMED]: "Đã xác nhận",
  [ORDER_STATUS.PREPARING]: "Đang chuẩn bị",
  [ORDER_STATUS.SHIPPING]: "Đang giao",
  [ORDER_STATUS.DELIVERED]: "Đã giao",
  [ORDER_STATUS.CANCELLED]: "Đã hủy",
};

export const STATUS_COLOR = {
  [ORDER_STATUS.PENDING]: "bg-amber-100 text-amber-700 border-amber-200",
  [ORDER_STATUS.CONFIRMED]: "bg-blue-100 text-blue-700 border-blue-200",
  [ORDER_STATUS.PREPARING]: "bg-purple-100 text-purple-700 border-purple-200",
  [ORDER_STATUS.SHIPPING]: "bg-orange-100 text-orange-700 border-orange-200",
  [ORDER_STATUS.DELIVERED]:
    "bg-emerald-100 text-emerald-700 border-emerald-200",
  [ORDER_STATUS.CANCELLED]: "bg-red-100 text-red-700 border-red-200",
};

export const STATUS_ICON = {
  [ORDER_STATUS.PENDING]: "⏳",
  [ORDER_STATUS.CONFIRMED]: "✓",
  [ORDER_STATUS.PREPARING]: "📦",
  [ORDER_STATUS.SHIPPING]: "🚚",
  [ORDER_STATUS.DELIVERED]: "✅",
  [ORDER_STATUS.CANCELLED]: "❌",
};

// All orderable statuses
export const STATUS_FILTERS = [
  { value: "ALL", label: "Tất cả", icon: "📋" },
  { value: ORDER_STATUS.PENDING, label: "Chờ xác nhận", icon: "⏳" },
  { value: ORDER_STATUS.CONFIRMED, label: "Đã xác nhận", icon: "✓" },
  { value: ORDER_STATUS.PREPARING, label: "Đang chuẩn bị", icon: "📦" },
  { value: ORDER_STATUS.SHIPPING, label: "Đang giao", icon: "🚚" },
  { value: ORDER_STATUS.DELIVERED, label: "Đã giao", icon: "✅" },
  { value: ORDER_STATUS.CANCELLED, label: "Đã hủy", icon: "❌" },
];

// ---- Action rules for shipping-integrated flow ----
// After PREPARING, seller uses Shipping actions (create → markInTransit → markDelivered)
export const NEXT_ACTIONS = {
  [ORDER_STATUS.PENDING]: {
    type: "confirm",
    nextStatus: ORDER_STATUS.CONFIRMED,
    label: "Xác nhận",
    confirmTitle: "Xác nhận đơn hàng",
    confirmMessage: (order) =>
      `Xác nhận đơn #${order.orderCode || order.orderId}? Đơn sẽ chuyển sang trạng thái "Đã xác nhận".`,
    cssClass: "bg-blue-600 hover:bg-blue-700 text-white",
  },
  [ORDER_STATUS.CONFIRMED]: {
    type: "prepare",
    nextStatus: ORDER_STATUS.PREPARING,
    label: "Chuẩn bị hàng",
    confirmTitle: "Bắt đầu chuẩn bị",
    confirmMessage: (order) =>
      `Chuyển đơn #${order.orderCode || order.orderId} sang "Đang chuẩn bị"?`,
    cssClass: "bg-purple-600 hover:bg-purple-700 text-white",
  },
  // PREPARING: handled separately with shipping flow (create shipping / mark-in-transit)
  // SHIPPING: handled separately with mark-delivered
};

// Terminal statuses (seller cannot act on SHIPPING — buyer confirms delivery)
export const TERMINAL_STATUSES = [
  ORDER_STATUS.DELIVERED,
  ORDER_STATUS.CANCELLED,
  ORDER_STATUS.SHIPPING,
];

export function isTerminal(status) {
  return TERMINAL_STATUSES.includes(String(status || "").toUpperCase());
}

export function getNextAction(status) {
  return NEXT_ACTIONS[String(status || "").toUpperCase()] || null;
}

// Check if order status allows shipping actions
export function isShippingActionable(status) {
  const s = String(status || "").toUpperCase();
  return s === ORDER_STATUS.PREPARING || s === ORDER_STATUS.SHIPPING;
}
