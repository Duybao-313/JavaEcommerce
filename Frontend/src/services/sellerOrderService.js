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

// ---- Action rules: which status can transition to what ----
export const NEXT_ACTIONS = {
  [ORDER_STATUS.PENDING]: {
    nextStatus: ORDER_STATUS.CONFIRMED,
    label: "Xác nhận",
    confirmTitle: "Xác nhận đơn hàng",
    confirmMessage: (order) =>
      `Xác nhận đơn #${order.orderCode || order.orderId}? Đơn sẽ chuyển sang trạng thái "Đã xác nhận".`,
    cssClass: "bg-blue-600 hover:bg-blue-700 text-white",
  },
  [ORDER_STATUS.CONFIRMED]: {
    nextStatus: ORDER_STATUS.PREPARING,
    label: "Chuẩn bị hàng",
    confirmTitle: "Bắt đầu chuẩn bị",
    confirmMessage: (order) =>
      `Chuyển đơn #${order.orderCode || order.orderId} sang "Đang chuẩn bị"?`,
    cssClass: "bg-purple-600 hover:bg-purple-700 text-white",
  },
  [ORDER_STATUS.PREPARING]: {
    nextStatus: ORDER_STATUS.SHIPPING,
    label: "Giao hàng",
    confirmTitle: "Xác nhận giao hàng",
    confirmMessage: (order) =>
      `Chuyển đơn #${order.orderCode || order.orderId} sang "Đang giao"?`,
    cssClass: "bg-orange-600 hover:bg-orange-700 text-white",
  },
  [ORDER_STATUS.SHIPPING]: {
    nextStatus: ORDER_STATUS.DELIVERED,
    label: "Đã giao",
    confirmTitle: "Xác nhận đã giao",
    confirmMessage: (order) =>
      `Xác nhận đơn #${order.orderCode || order.orderId} đã giao thành công?`,
    cssClass: "bg-emerald-600 hover:bg-emerald-700 text-white",
  },
};

// Terminal statuses — seller cannot act on SHIPPING (buyer confirms delivery)
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
