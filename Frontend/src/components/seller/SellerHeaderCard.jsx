import React from "react";

function formatPrice(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

const STATUS_BADGES = {
  ACTIVE: {
    label: "Đang hoạt động",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  SUSPENDED: {
    label: "Tạm khóa",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  APPROVED: {
    label: "Đã xác thực",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  PENDING: {
    label: "Chờ xác thực",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  REJECTED: {
    label: "Từ chối",
    className: "bg-red-50 text-red-700 border-red-200",
  },
};

function SellerHeaderCard({
  storeName,
  storeLogo,
  storeBanner,
  storeRating,
  totalSales,
  storeStatus,
  sellerVerified,
  compact = false,
}) {
  const statusBadge = STATUS_BADGES[storeStatus] || null;
  const verifiedBadge = STATUS_BADGES[sellerVerified] || null;

  return (
    <article className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
      {/* Banner */}
      <div className="relative h-32 w-full bg-zinc-100 sm:h-40 md:h-48">
        {storeBanner ? (
          <img
            src={storeBanner}
            alt={`${storeName || "Cửa hàng"} banner`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-r from-zinc-100 to-zinc-50">
            <span className="text-sm font-medium uppercase tracking-[0.14em] text-zinc-400">
              Store Banner
            </span>
          </div>
        )}
      </div>

      <div className={`px-5 pb-5 ${compact ? "pt-3" : "pt-14 sm:pt-16"}`}>
        {/* Logo */}
        <div
          className={`-mt-10 flex ${compact ? "justify-start" : "justify-center sm:justify-start"}`}
        >
          <div className="h-20 w-20 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-md sm:h-24 sm:w-24">
            {storeLogo ? (
              <img
                src={storeLogo}
                alt={`${storeName || "Cửa hàng"} logo`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-zinc-200 text-2xl font-bold text-zinc-500">
                {(storeName || "S").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Store Info */}
        <div
          className={`mt-3 flex flex-wrap items-start gap-3 ${compact ? "" : "justify-center sm:justify-between"}`}
        >
          <div className="min-w-0">
            <h2 className="text-xl font-semibold tracking-tight text-zinc-900 truncate">
              {storeName || "Cửa hàng chưa đặt tên"}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {statusBadge && (
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusBadge.className}`}
                >
                  {statusBadge.label}
                </span>
              )}
              {verifiedBadge && (
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${verifiedBadge.className}`}
                >
                  {verifiedBadge.label}
                </span>
              )}
            </div>
          </div>

          {/* Metrics */}
          <div className="flex items-center gap-4">
            {storeRating != null && (
              <div className="text-center">
                <p className="text-2xl font-bold text-zinc-900">
                  ⭐ {Number(storeRating).toFixed(1)}
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  Đánh giá
                </p>
              </div>
            )}
            <div className="text-center">
              <p className="text-2xl font-bold text-zinc-900">
                {Number(totalSales || 0).toLocaleString("vi-VN")}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                Đã bán
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default SellerHeaderCard;
