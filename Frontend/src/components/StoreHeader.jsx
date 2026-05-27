import React from "react";

const STATUS_BADGE = {
  ACTIVE: { label: "Đang hoạt động", cls: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  SUSPENDED: { label: "Tạm khóa", cls: "border-red-200 bg-red-50 text-red-700" },
};

const VERIFIED_BADGE = {
  APPROVED: { label: "Đã xác thực", cls: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  PENDING: { label: "Chờ xác thực", cls: "border-amber-200 bg-amber-50 text-amber-700" },
  REJECTED: { label: "Từ chối", cls: "border-red-200 bg-red-50 text-red-700" },
};

function StarRating({ rating, count, size = "md" }) {
  const stars = Array.from({ length: 5 }, (_, i) => i < Math.round(rating || 0));
  const sizeCls = size === "lg" ? "text-xl" : "text-sm";
  return (
    <span className="inline-flex items-center gap-1" aria-label={`${rating} trên 5 sao, ${count || 0} đánh giá`}>
      <span className={`flex gap-px ${sizeCls}`} aria-hidden="true">
        {stars.map((filled, i) => (
          <span key={i} className={filled ? "text-amber-400" : "text-zinc-300"}>
            ★
          </span>
        ))}
      </span>
      <span className="text-xs font-semibold text-zinc-600">
        {rating != null ? Number(rating).toFixed(1) : "0.0"}
      </span>
      {count != null && (
        <span className="text-xs text-zinc-400">({count.toLocaleString("vi-VN")})</span>
      )}
    </span>
  );
}

export default function StoreHeader({
  store,
  isFollowing = false,
  onToggleFollow,
  followLoading = false,
}) {
  if (!store) return null;

  const {
    storeName = "Cửa hàng",
    storeLogo,
    storeBanner,
    storeRating,
    totalSales = 0,
    totalProducts = 0,
    followers = 0,
    description,
    storeAddress,
    storeStatus,
    sellerVerified,
  } = store;

  const statusBadge = STATUS_BADGE[storeStatus];
  const verifiedBadge = VERIFIED_BADGE[sellerVerified];
  const isSuspended = storeStatus === "SUSPENDED";

  return (
    <header className="overflow-hidden rounded-[2rem] border border-zinc-200/70 bg-white shadow-sm">
      {/* Banner */}
      <div className="relative h-36 w-full bg-zinc-100 sm:h-44 md:h-52">
        {storeBanner ? (
          <img
            src={storeBanner}
            alt={`${storeName} banner`}
            className="h-full w-full object-cover"
            fetchPriority="high"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-100 via-zinc-50 to-amber-50/40">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">
              {storeName}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative px-5 pb-6 pt-[4.5rem] sm:px-8 sm:pb-8">
        {/* Logo — overlaps banner */}
        <div className="absolute left-5 top-0 -translate-y-1/2 sm:left-8">
          <div className="h-[4.5rem] w-[4.5rem] overflow-hidden rounded-2xl border-[3px] border-white bg-white shadow-lg ring-1 ring-zinc-200/50 sm:h-24 sm:w-24">
            {storeLogo ? (
              <img
                src={storeLogo}
                alt={`${storeName} logo`}
                className="h-full w-full object-cover"
                fetchPriority="high"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100 text-2xl font-bold text-amber-600 sm:text-3xl">
                {(storeName || "S").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Store info row */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
              {storeName}
            </h1>

            {/* Rating line */}
            <div className="mt-1.5">
              <StarRating rating={storeRating} count={null} size="sm" />
            </div>

            {/* Badges */}
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              {statusBadge && (
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusBadge.cls}`}
                >
                  {statusBadge.label}
                </span>
              )}
              {verifiedBadge && (
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${verifiedBadge.cls}`}
                >
                  {verifiedBadge.label}
                </span>
              )}
            </div>

            {/* Description */}
            {description && (
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-zinc-500 line-clamp-2">
                {description}
              </p>
            )}

            {/* Location */}
            {storeAddress && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-zinc-400">
                <span aria-hidden="true">📍</span>
                <span>{storeAddress}</span>
              </p>
            )}
          </div>

          {/* Metrics + CTA */}
          <div className="flex shrink-0 flex-col items-end gap-3">
            {/* Stats grid */}
            <div className="flex items-center gap-5 sm:gap-6">
              <div className="text-center">
                <p className="text-lg font-bold tabular-nums text-zinc-900 sm:text-xl">
                  {Number(totalProducts || 0).toLocaleString("vi-VN")}
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                  Sản phẩm
                </p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold tabular-nums text-zinc-900 sm:text-xl">
                  {Number(totalSales || 0).toLocaleString("vi-VN")}
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                  Đã bán
                </p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold tabular-nums text-zinc-900 sm:text-xl">
                  {Number(followers || 0).toLocaleString("vi-VN")}
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                  Theo dõi
                </p>
              </div>
            </div>

            {/* Follow button */}
            {!isSuspended && onToggleFollow && (
              <button
                type="button"
                onClick={onToggleFollow}
                disabled={followLoading}
                className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition-all ${
                  isFollowing
                    ? "border-zinc-300 bg-white text-zinc-700 hover:border-red-300 hover:text-red-600"
                    : "border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800"
                } disabled:cursor-wait disabled:opacity-60`}
              >
                {followLoading ? (
                  <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : null}
                {isFollowing ? "Đang theo dõi" : "Theo dõi"}
              </button>
            )}
          </div>
        </div>

        {/* Suspended notice */}
        {isSuspended && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            ⚠️ Cửa hàng này hiện đang tạm khóa. Bạn không thể mua hàng từ cửa hàng này.
          </div>
        )}
      </div>
    </header>
  );
}
