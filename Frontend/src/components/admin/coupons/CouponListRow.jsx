import {
  COUPON_TYPE_LABEL,
  COUPON_SCOPE_LABEL,
} from "../../../services/couponService";

/**
 * Format a date string for display. Handles both LocalDateTime and Instant formats.
 */
function formatDateShort(dateStr) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function formatPrice(value) {
  if (value == null) return "—";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

const STATUS_CONFIG = {
  ACTIVE: {
    label: "Đang chạy",
    cls: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  EXPIRED: {
    label: "Hết hạn",
    cls: "bg-zinc-100 text-zinc-500 border-zinc-200",
  },
  DISABLED: {
    label: "Đã tắt",
    cls: "bg-zinc-100 text-zinc-500 border-zinc-200",
  },
  EXHAUSTED: {
    label: "Hết lượt",
    cls: "bg-amber-100 text-amber-800 border-amber-200",
  },
  UPCOMING: {
    label: "Sắp diễn ra",
    cls: "bg-blue-100 text-blue-800 border-blue-200",
  },
};

function deriveStatus(coupon) {
  if (!coupon.isActive) return "DISABLED";
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit)
    return "EXHAUSTED";
  const now = new Date();
  const start = coupon.startAt ? new Date(coupon.startAt) : null;
  const end = coupon.endAt ? new Date(coupon.endAt) : null;
  if (start && now < start) return "UPCOMING";
  if (end && now > end) return "EXPIRED";
  return "ACTIVE";
}

/**
 * CouponListRow — Single row in admin coupon table.
 *
 * Props:
 *   coupon      (object)
 *   onEdit      (coupon) => void
 *   onToggle    (coupon) => void
 *   onDelete    (coupon) => void
 */
function CouponListRow({ coupon, onEdit, onToggle, onDelete }) {
  const status = deriveStatus(coupon);
  const statusInfo = STATUS_CONFIG[status] || STATUS_CONFIG.DISABLED;
  const typeLabel = COUPON_TYPE_LABEL[coupon.type] || coupon.type;
  const scopeLabel = COUPON_SCOPE_LABEL[coupon.scope] || coupon.scope;
  const targetIds = Array.isArray(coupon.targetIds)
    ? coupon.targetIds.join(", ")
    : coupon.targetIds || "—";

  return (
    <tr className="border-b border-zinc-100 transition-colors duration-150 ease-out-quart hover:bg-zinc-50/70">
      {/* Code + Title */}
      <td className="px-4 py-3">
        <div>
          <span className="font-mono text-sm font-semibold text-zinc-900">
            {coupon.code}
          </span>
          <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">
            {coupon.title}
          </p>
        </div>
      </td>

      {/* Type */}
      <td className="px-4 py-3">
        <span className="inline-block rounded-md border border-zinc-200 bg-white px-2 py-0.5 text-xs font-medium text-zinc-600">
          {typeLabel}
        </span>
      </td>

      {/* Value */}
      <td className="px-4 py-3 text-sm text-zinc-700">
        {coupon.type === "PERCENT" ? (
          <>
            <span className="font-semibold">{coupon.value}%</span>
            {coupon.maxDiscountAmount && (
              <span className="text-xs text-zinc-500 block">
                Tối đa {formatPrice(coupon.maxDiscountAmount)}
              </span>
            )}
          </>
        ) : (
          <span className="font-semibold">{formatPrice(coupon.value)}</span>
        )}
      </td>

      {/* Scope */}
      <td className="px-4 py-3">
        <span className="text-sm text-zinc-600">{scopeLabel}</span>
        {coupon.scope !== "ALL" && (
          <p
            className="text-xs text-zinc-400 mt-0.5 max-w-[120px] truncate"
            title={targetIds}
          >
            ID: {targetIds}
          </p>
        )}
      </td>

      {/* Duration */}
      <td className="px-4 py-3 text-xs text-zinc-500">
        <p>{formatDateShort(coupon.startAt)}</p>
        <p className="text-zinc-400">→ {formatDateShort(coupon.endAt)}</p>
      </td>

      {/* Usage */}
      <td className="px-4 py-3 text-center text-sm text-zinc-600">
        <span className="font-semibold text-zinc-900">
          {coupon.usedCount || 0}
        </span>
        {coupon.usageLimit != null && (
          <span className="text-zinc-400"> / {coupon.usageLimit}</span>
        )}
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <span
          className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusInfo.cls}`}
        >
          {statusInfo.label}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(coupon)}
            className="rounded-md p-1.5 text-zinc-500 transition-colors duration-150 ease-out-quart hover:bg-zinc-100 hover:text-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-zinc-900"
            aria-label={`Chỉnh sửa coupon ${coupon.code}`}
            title="Chỉnh sửa"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => onToggle(coupon)}
            className={`rounded-md p-1.5 transition-colors duration-150 ease-out-quart focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-zinc-900 ${
              coupon.isActive
                ? "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
                : "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
            }`}
            aria-label={
              coupon.isActive
                ? `Tắt coupon ${coupon.code}`
                : `Bật coupon ${coupon.code}`
            }
            title={coupon.isActive ? "Tắt" : "Bật"}
          >
            {coupon.isActive ? (
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
            ) : (
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5.636 18.364a9 9 0 0012.728 0m-12.728 0L12 12m6.364 6.364L12 12m0 0L5.636 5.636M12 12l6.364-6.364"
                />
              </svg>
            )}
          </button>

          <button
            type="button"
            onClick={() => onDelete(coupon)}
            className="rounded-md p-1.5 text-zinc-400 transition-colors duration-150 ease-out-quart hover:bg-red-50 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-red-500"
            aria-label={`Xoá coupon ${coupon.code}`}
            title="Xoá"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
}

export default CouponListRow;
