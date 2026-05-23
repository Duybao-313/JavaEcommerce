// ---- Centralized order status configuration for admin ----
// Reuses backend enum values from sellerOrderService.js

export const ORDER_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  PREPARING: "PREPARING",
  SHIPPING: "SHIPPING",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
  RETURNED: "RETURNED",
};

export const STATUS_LABEL = {
  [ORDER_STATUS.PENDING]: "Chờ xác nhận",
  [ORDER_STATUS.CONFIRMED]: "Đã xác nhận",
  [ORDER_STATUS.PREPARING]: "Đang chuẩn bị",
  [ORDER_STATUS.SHIPPING]: "Đang giao",
  [ORDER_STATUS.DELIVERED]: "Đã giao",
  [ORDER_STATUS.CANCELLED]: "Đã hủy",
  [ORDER_STATUS.RETURNED]: "Hoàn trả",
};

export const STATUS_COLOR = {
  [ORDER_STATUS.PENDING]:
    "bg-amber-50 text-amber-700 border border-amber-200/60",
  [ORDER_STATUS.CONFIRMED]:
    "bg-blue-50 text-blue-700 border border-blue-200/60",
  [ORDER_STATUS.PREPARING]:
    "bg-purple-50 text-purple-700 border border-purple-200/60",
  [ORDER_STATUS.SHIPPING]: "bg-cyan-50 text-cyan-700 border border-cyan-200/60",
  [ORDER_STATUS.DELIVERED]:
    "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
  [ORDER_STATUS.CANCELLED]: "bg-red-50 text-red-700 border border-red-200/60",
  [ORDER_STATUS.RETURNED]: "bg-rose-50 text-rose-700 border border-rose-200/60",
};

export const STATUS_ICON = {
  [ORDER_STATUS.PENDING]: "⏳",
  [ORDER_STATUS.CONFIRMED]: "✓",
  [ORDER_STATUS.PREPARING]: "📦",
  [ORDER_STATUS.SHIPPING]: "🚚",
  [ORDER_STATUS.DELIVERED]: "✅",
  [ORDER_STATUS.CANCELLED]: "❌",
  [ORDER_STATUS.RETURNED]: "↩️",
};

// Valid status transitions per role (admin can override any)
export const ALLOWED_TRANSITIONS = {
  [ORDER_STATUS.PENDING]: [
    ORDER_STATUS.CONFIRMED,
    ORDER_STATUS.CANCELLED,
    ORDER_STATUS.PREPARING,
  ],
  [ORDER_STATUS.CONFIRMED]: [
    ORDER_STATUS.PREPARING,
    ORDER_STATUS.SHIPPING,
    ORDER_STATUS.CANCELLED,
  ],
  [ORDER_STATUS.PREPARING]: [ORDER_STATUS.SHIPPING, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.SHIPPING]: [ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.DELIVERED]: [ORDER_STATUS.RETURNED],
  [ORDER_STATUS.CANCELLED]: [],
  [ORDER_STATUS.RETURNED]: [],
};

// Status tabs shown in filter bar
export const STATUS_TABS = [
  { key: "ALL", label: "Tất cả", icon: "📋" },
  {
    key: ORDER_STATUS.PENDING,
    label: STATUS_LABEL[ORDER_STATUS.PENDING],
    icon: STATUS_ICON[ORDER_STATUS.PENDING],
  },
  {
    key: ORDER_STATUS.CONFIRMED,
    label: STATUS_LABEL[ORDER_STATUS.CONFIRMED],
    icon: STATUS_ICON[ORDER_STATUS.CONFIRMED],
  },
  {
    key: ORDER_STATUS.SHIPPING,
    label: STATUS_LABEL[ORDER_STATUS.SHIPPING],
    icon: STATUS_ICON[ORDER_STATUS.SHIPPING],
  },
  {
    key: ORDER_STATUS.DELIVERED,
    label: STATUS_LABEL[ORDER_STATUS.DELIVERED],
    icon: STATUS_ICON[ORDER_STATUS.DELIVERED],
  },
  {
    key: ORDER_STATUS.CANCELLED,
    label: STATUS_LABEL[ORDER_STATUS.CANCELLED],
    icon: STATUS_ICON[ORDER_STATUS.CANCELLED],
  },
  {
    key: ORDER_STATUS.RETURNED,
    label: STATUS_LABEL[ORDER_STATUS.RETURNED],
    icon: STATUS_ICON[ORDER_STATUS.RETURNED],
  },
];

// Dangerous transitions that require extra confirmation + reason
export const DANGEROUS_TRANSITIONS = [
  ORDER_STATUS.CANCELLED,
  ORDER_STATUS.RETURNED,
];

// Carriers for shipping
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

// Shipping statuses
export const SHIPPING_STATUS = {
  PENDING: "PENDING",
  IN_TRANSIT: "IN_TRANSIT",
  DELIVERED: "DELIVERED",
};

export const SHIPPING_STATUS_LABEL = {
  [SHIPPING_STATUS.PENDING]: "Chờ lấy hàng",
  [SHIPPING_STATUS.IN_TRANSIT]: "Đang vận chuyển",
  [SHIPPING_STATUS.DELIVERED]: "Đã giao",
};
