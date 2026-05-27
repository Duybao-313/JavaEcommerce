import { useState, useCallback } from "react";

/**
 * CouponFilterBar — Search and active/inactive filter for coupon list.
 *
 * Props:
 *   search        (string)
 *   activeFilter  (string)   — "", "true", "false"
 *   onSearch      (value: string) => void
 *   onFilter      (value: string) => void
 */
function CouponFilterBar({ search = "", activeFilter = "", onSearch, onFilter }) {
  const [localSearch, setLocalSearch] = useState(search);

  const handleSearchChange = useCallback(
    (e) => {
      const val = e.target.value;
      setLocalSearch(val);
      if (onSearch) onSearch(val);
    },
    [onSearch],
  );

  const handleClearSearch = useCallback(() => {
    setLocalSearch("");
    if (onSearch) onSearch("");
  }, [onSearch]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search input */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
          />
        </svg>
        <input
          type="text"
          value={localSearch}
          onChange={handleSearchChange}
          placeholder="Tìm theo mã hoặc tiêu đề..."
          aria-label="Tìm kiếm coupon"
          className="w-full min-h-[38px] rounded-lg border border-zinc-300 bg-white pl-9 pr-8 text-sm outline-none transition-colors duration-180 ease-out-quart focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/20"
        />
        {localSearch && (
          <button
            type="button"
            onClick={handleClearSearch}
            aria-label="Xoá tìm kiếm"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-zinc-400 hover:text-zinc-600 transition-colors duration-150"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Active/Inactive filter */}
      <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Lọc trạng thái">
        {[
          { value: "", label: "Tất cả" },
          { value: "true", label: "Đang hoạt động" },
          { value: "false", label: "Đã tắt" },
        ].map((opt) => {
          const isSelected = activeFilter === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onFilter && onFilter(opt.value)}
              className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors duration-180 ease-out-quart focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 ${
                isSelected
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CouponFilterBar;
