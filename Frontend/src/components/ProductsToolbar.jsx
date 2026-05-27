import React from "react";

const SORT_OPTIONS = [
  { value: "soldDesc", label: "Bán chạy" },
  { value: "newest", label: "Mới nhất" },
  { value: "priceAsc", label: "Giá thấp → cao" },
  { value: "priceDesc", label: "Giá cao → thấp" },
];

export default function ProductsToolbar({
  total = 0,
  sort = "soldDesc",
  onSortChange,
  viewMode = "grid",
  onToggleView,
  filtersCount = 0,
  onToggleFilters,
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200/70 bg-white px-4 py-2.5 sm:px-5">
      {/* Left: total count */}
      <p className="text-xs font-semibold text-zinc-500 sm:text-sm">
        <span className="tabular-nums text-zinc-900">
          {Number(total).toLocaleString("vi-VN")}
        </span>{" "}
        sản phẩm
      </p>

      {/* Right: controls */}
      <div className="flex items-center gap-2">
        {/* Filter toggle (mobile) */}
        {onToggleFilters && (
          <button
            type="button"
            onClick={onToggleFilters}
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] transition-colors sm:hidden ${
              filtersCount > 0
                ? "border-zinc-900 bg-zinc-900 text-white"
                : "border-zinc-200 text-zinc-600 hover:border-zinc-400"
            }`}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Bộ lọc
            {filtersCount > 0 && (
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-bold text-zinc-900">
                {filtersCount}
              </span>
            )}
          </button>
        )}

        {/* Sort */}
        <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500">
          <span className="hidden sm:inline">Sắp xếp:</span>
          <select
            value={sort}
            onChange={(e) => onSortChange?.(e.target.value)}
            className="cursor-pointer appearance-none rounded-full border border-zinc-200 bg-white py-1.5 pl-3 pr-7 text-xs font-semibold text-zinc-900 outline-none transition-colors hover:border-zinc-400 focus:border-zinc-900"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        {/* View toggle */}
        {onToggleView && (
          <div className="hidden items-center gap-px rounded-full border border-zinc-200 bg-zinc-100 p-0.5 sm:flex">
            <button
              type="button"
              onClick={() => onToggleView("grid")}
              className={`rounded-full p-1.5 transition-colors ${
                viewMode === "grid" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
              }`}
              aria-label="Xem dạng lưới"
              aria-pressed={viewMode === "grid"}
            >
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 16 16">
                <path d="M1 1h6v6H1V1zm0 8h6v6H1V9zm8-8h6v6H9V1zm0 8h6v6H9V9z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => onToggleView("list")}
              className={`rounded-full p-1.5 transition-colors ${
                viewMode === "list" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
              }`}
              aria-label="Xem dạng danh sách"
              aria-pressed={viewMode === "list"}
            >
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M1 2h14v2H1V2zm0 5h14v2H1V7zm0 5h14v2H1v-2z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
