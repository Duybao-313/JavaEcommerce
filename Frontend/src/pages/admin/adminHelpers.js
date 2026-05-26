export function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function paginate(items, page, pageSize) {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export function formatPrice(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

// Resolve image URL: prepend API base if relative, fallback to placeholder
export function resolveImageUrl(url) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  if (/^data:/i.test(url)) return url;

  // Prepend API base for relative URLs
  const base = import.meta.env.VITE_API_BASE || "http://localhost:8080";
  const cleanBase = base.replace(/\/+$/, "");
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  return `${cleanBase}${cleanPath}`;
}

// Get the best image URL from an order item, trying all known field names
export function getItemImageUrl(item) {
  return item?.productImageUrl || item?.imageUrl || item?.productImage || null;
}

// ─── Product review status map ─────────────────────────────────────
export const REVIEW_STATUS_MAP = {
  PENDING_REVIEW: {
    label: "Chờ duyệt",
    cls: "bg-amber-100 text-amber-800 border-amber-200",
    icon: "⏳",
  },
  APPROVED: {
    label: "Đã duyệt",
    cls: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: "✓",
  },
  ACTIVE: {
    label: "Đã duyệt",
    cls: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: "✓",
  },
  REJECTED: {
    label: "Từ chối",
    cls: "bg-red-100 text-red-800 border-red-200",
    icon: "✕",
  },
  PENDING_CHANGES: {
    label: "Cần chỉnh sửa",
    cls: "bg-orange-100 text-orange-800 border-orange-200",
    icon: "↩",
  },
  INACTIVE: {
    label: "Đã khóa",
    cls: "bg-zinc-100 text-zinc-600 border-zinc-200",
    icon: "⊘",
  },
};

export function getReviewStatusInfo(status) {
  return (
    REVIEW_STATUS_MAP[status] || {
      label: status || "Không rõ",
      cls: "bg-zinc-100 text-zinc-600 border-zinc-200",
      icon: "?",
    }
  );
}
