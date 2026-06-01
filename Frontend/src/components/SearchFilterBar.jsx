import React, { useRef, useEffect } from "react";

/* ── Shared icon components (inline SVGs) ─────────────────────── */
const SearchIcon = ({ className = "h-4 w-4" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.8}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
    />
  </svg>
);

const FilterIcon = ({ className = "h-4 w-4" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.8}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
    />
  </svg>
);

const XIcon = ({ className = "h-3.5 w-3.5" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const ChevronDown = ({ className = "h-3 w-3" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2.5}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

/* ── Helpers ──────────────────────────────────────────────────── */
function getFilterLabel(key, value, categories) {
  if (value == null || value === "" || value === "all") return null;

  switch (key) {
    case "category": {
      const cat = categories.find((c) => String(c.id) === String(value));
      return cat ? `Danh mục: ${cat.name}` : null;
    }
    case "stock": {
      const map = {
        inStock: "Còn hàng",
        outOfStock: "Hết hàng",
        lowStock: "Sắp hết",
      };
      return map[value] || null;
    }
    case "minPrice":
      return `Giá từ ${Number(value).toLocaleString("vi-VN")}₫`;
    case "maxPrice":
      return `Giá đến ${Number(value).toLocaleString("vi-VN")}₫`;
    default:
      return null;
  }
}

const SORT_OPTIONS = [
  { value: "soldDesc", label: "Bán chạy" },
  { value: "newest", label: "Mới nhất" },
  { value: "priceAsc", label: "Giá thấp → cao" },
  { value: "priceDesc", label: "Giá cao → thấp" },
];

/* ── Component ────────────────────────────────────────────────── */
export default function SearchFilterBar({
  searchTerm,
  onSearchChange,
  selectedCategory,
  stockFilter,
  minPrice,
  maxPrice,
  ratingFilter = 0,
  priceSort,
  onCategoryChange,
  onStockChange,
  onRatingChange,
  onPriceChange,
  onSortChange,
  onClearAll,
  categories = [],
  isFilterOpen,
  onToggleFilter,
  totalProductCount = 0,
  sellerMode = false,
  onExportCsv,
  onImportCsv,
}) {
  const inputRef = useRef(null);

  // Keyboard shortcut: Ctrl+K or / to focus search
  useEffect(() => {
    function handleKeyDown(e) {
      if (
        (e.key === "k" && (e.ctrlKey || e.metaKey)) ||
        (e.key === "/" &&
          document.activeElement?.tagName !== "INPUT" &&
          document.activeElement?.tagName !== "TEXTAREA")
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Build active filter chips
  const activeChips = [];
  if (selectedCategory && selectedCategory !== "all") {
    const label = getFilterLabel("category", selectedCategory, categories);
    if (label)
      activeChips.push({
        key: "category",
        label,
        onRemove: () => onCategoryChange("all"),
      });
  }
  if (stockFilter && stockFilter !== "all") {
    const label = getFilterLabel("stock", stockFilter);
    if (label)
      activeChips.push({
        key: "stock",
        label,
        onRemove: () => onStockChange("all"),
      });
  }
  if (minPrice && Number(minPrice) > 0) {
    activeChips.push({
      key: "minPrice",
      label: getFilterLabel("minPrice", minPrice),
      onRemove: () => onPriceChange("min", ""),
    });
  }
  if (maxPrice && Number(maxPrice) > 0) {
    activeChips.push({
      key: "maxPrice",
      label: getFilterLabel("maxPrice", maxPrice),
      onRemove: () => onPriceChange("max", ""),
    });
  }
  if (ratingFilter && ratingFilter > 0) {
    activeChips.push({
      key: "rating",
      label: `Đánh giá từ ${ratingFilter}★ trở lên`,
      onRemove: () => onRatingChange(0),
    });
  }

  const hasActiveFilters =
    activeChips.length > 0 || (searchTerm && searchTerm.trim().length > 0);
  const filterCount = activeChips.length + (searchTerm?.trim() ? 1 : 0);

  return (
    <div className="sfb-root">
      {/* ── Row 1: Search + Sort + Filter toggle ──────────────── */}
      <div className="sfb-top-row">
        {/* Search */}
        <div className="sfb-search-wrap">
          <span className="sfb-search-icon" aria-hidden="true">
            <SearchIcon />
          </span>
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm sản phẩm..."
            className="sfb-search-input"
            aria-label="Tìm kiếm sản phẩm"
          />
          {searchTerm ? (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="sfb-search-clear"
              aria-label="Xoá từ khoá tìm kiếm"
            >
              <XIcon />
            </button>
          ) : (
            <kbd className="sfb-search-kbd" aria-hidden="true">
              Ctrl+K
            </kbd>
          )}
        </div>

        {/* Quick price range (always visible) */}
        <div className="sfb-price-quick">
          <input
            type="number"
            min="0"
            step="10000"
            value={minPrice}
            onChange={(e) => onPriceChange("min", e.target.value)}
            placeholder="Giá từ"
            className="sfb-price-input"
            aria-label="Giá thấp nhất"
          />
          <span className="sfb-price-dash" aria-hidden="true">
            —
          </span>
          <input
            type="number"
            min="0"
            step="10000"
            value={maxPrice}
            onChange={(e) => onPriceChange("max", e.target.value)}
            placeholder="Giá đến"
            className="sfb-price-input"
            aria-label="Giá cao nhất"
          />
        </div>

        {/* Sort + Filter toggle (right side) */}
        <div className="sfb-controls">
          {/* Sort — separated clearly from filter */}
          <div className="sfb-sort-group">
            <label htmlFor="sfb-sort" className="sfb-sort-label">
              Sắp xếp
            </label>
            <div className="sfb-sort-select-wrap">
              <select
                id="sfb-sort"
                value={priceSort}
                onChange={(e) => onSortChange(e.target.value)}
                className="sfb-sort-select"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown />
            </div>
          </div>

          {/* Filter toggle */}
          <button
            type="button"
            onClick={onToggleFilter}
            className={`sfb-filter-toggle ${isFilterOpen ? "sfb-filter-toggle--active" : ""}`}
            aria-expanded={isFilterOpen}
            aria-label={isFilterOpen ? "Đóng bộ lọc" : "Mở bộ lọc"}
          >
            <FilterIcon />
            <span className="sfb-filter-toggle-label">Lọc</span>
            {filterCount > 0 && (
              <span className="sfb-filter-badge">{filterCount}</span>
            )}
          </button>
        </div>
      </div>

      {/* ── Row 2: Active filter chips ─────────────────────────── */}
      {hasActiveFilters && (
        <div className="sfb-chips-row">
          {/* Search term chip */}
          {searchTerm?.trim() && (
            <span className="sfb-chip sfb-chip--search">
              <SearchIcon className="h-3 w-3" />
              <span>"{searchTerm.trim()}"</span>
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="sfb-chip-remove"
                aria-label="Xoá từ khoá"
              >
                <XIcon />
              </button>
            </span>
          )}

          {/* Filter chips */}
          {activeChips.map((chip) => (
            <span key={chip.key} className="sfb-chip">
              <span>{chip.label}</span>
              <button
                type="button"
                onClick={chip.onRemove}
                className="sfb-chip-remove"
                aria-label={`Xoá bộ lọc ${chip.label}`}
              >
                <XIcon />
              </button>
            </span>
          ))}

          {/* Clear all */}
          <button type="button" onClick={onClearAll} className="sfb-clear-all">
            Xoá tất cả
          </button>
        </div>
      )}

      {/* ── Row 3: Import/Export (seller only) ───────────────── */}
      {sellerMode && onExportCsv && onImportCsv && (
        <div className="sfb-io-row">
          <button
            type="button"
            onClick={onExportCsv}
            className="sfb-io-btn"
            title="Xuất danh sách sản phẩm ra CSV"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>Xuất CSV</span>
          </button>
          <button
            type="button"
            onClick={onImportCsv}
            className="sfb-io-btn"
            title="Nhập sản phẩm từ file CSV"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <span>Nhập CSV</span>
          </button>
        </div>
      )}

      {/* ── Inline styles ─────────────────────────────────────── */}
      <style>{`
        /* ── Root ───────────────────────────────────────────── */
        .sfb-root {
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
        }

        /* ── Top row ────────────────────────────────────────── */
        .sfb-top-row {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          flex-wrap: wrap;
        }

        /* ── Search ─────────────────────────────────────────── */
        .sfb-search-wrap {
          position: relative;
          flex: 1 1 240px;
          min-width: 0;
        }
        .sfb-search-icon {
          position: absolute;
          left: 0.875rem;
          top: 50%;
          transform: translateY(-50%);
          color: oklch(0.45 0.01 270);
          pointer-events: none;
          display: flex;
          align-items: center;
        }
        .sfb-search-input {
          width: 100%;
          height: 2.625rem;
          padding: 0 2.5rem 0 2.5rem;
          border: 1.5px solid oklch(0.88 0.01 90);
          border-radius: 0.875rem;
          background: oklch(0.99 0.002 85);
          font-size: 0.875rem;
          font-weight: 500;
          color: oklch(0.15 0.01 270);
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .sfb-search-input::placeholder {
          color: oklch(0.55 0.01 250);
          font-weight: 400;
        }
        .sfb-search-input:focus {
          border-color: oklch(0.62 0.18 55);
          box-shadow: 0 0 0 3px oklch(0.62 0.18 55 / 0.12);
        }
        .sfb-search-clear {
          position: absolute;
          right: 0.5rem;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 1.5rem;
          height: 1.5rem;
          border: none;
          border-radius: 50%;
          background: oklch(0.88 0.01 90);
          color: oklch(0.45 0.01 270);
          cursor: pointer;
          transition: background 0.12s ease, color 0.12s ease;
        }
        .sfb-search-clear:hover {
          background: oklch(0.62 0.18 55);
          color: #fff;
        }
        .sfb-search-kbd {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          display: inline-flex;
          align-items: center;
          height: 1.375rem;
          padding: 0 0.375rem;
          border: 1px solid oklch(0.88 0.01 90);
          border-radius: 0.3125rem;
          background: oklch(0.97 0.003 85);
          font-family: inherit;
          font-size: 0.625rem;
          font-weight: 600;
          color: oklch(0.5 0.01 260);
          pointer-events: none;
          letter-spacing: 0.02em;
        }
        @media (max-width: 480px) {
          .sfb-search-kbd {
            display: none;
          }
        }

        /* ── Quick price range ────────────────────────────── */
        .sfb-price-quick {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          flex-shrink: 0;
        }
        .sfb-price-input {
          width: 6.5rem;
          height: 2.25rem;
          padding: 0 0.625rem;
          border: 1px solid oklch(0.88 0.01 90);
          border-radius: 0.5625rem;
          background: oklch(0.99 0.002 85);
          font-size: 0.8125rem;
          font-weight: 500;
          color: oklch(0.15 0.01 270);
          outline: none;
          transition: border-color 0.12s ease, box-shadow 0.12s ease;
          -moz-appearance: textfield;
        }
        .sfb-price-input::-webkit-inner-spin-button,
        .sfb-price-input::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .sfb-price-input::placeholder {
          color: oklch(0.55 0.01 250);
          font-weight: 400;
          font-size: 0.75rem;
        }
        .sfb-price-input:focus {
          border-color: oklch(0.62 0.18 55);
          box-shadow: 0 0 0 2px oklch(0.62 0.18 55 / 0.12);
        }
        .sfb-price-dash {
          font-size: 0.75rem;
          color: oklch(0.5 0.01 260);
          user-select: none;
        }
        @media (max-width: 380px) {
          .sfb-price-input {
            width: 5rem;
          }
        }

        /* ── Controls group ─────────────────────────────────── */
        .sfb-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        /* ── Sort ───────────────────────────────────────────── */
        .sfb-sort-group {
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }
        .sfb-sort-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: oklch(0.45 0.01 270);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          white-space: nowrap;
        }
        .sfb-sort-select-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .sfb-sort-select-wrap svg {
          position: absolute;
          right: 0.625rem;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: oklch(0.45 0.01 270);
        }
        .sfb-sort-select {
          appearance: none;
          height: 2.25rem;
          padding: 0 2rem 0 0.75rem;
          border: 1px solid oklch(0.88 0.01 90);
          border-radius: 0.625rem;
          background: oklch(0.99 0.002 85);
          font-size: 0.8125rem;
          font-weight: 600;
          color: oklch(0.2 0.01 270);
          cursor: pointer;
          outline: none;
          transition: border-color 0.12s ease;
        }
        .sfb-sort-select:hover {
          border-color: oklch(0.7 0.01 90);
        }
        .sfb-sort-select:focus {
          border-color: oklch(0.62 0.18 55);
          box-shadow: 0 0 0 2px oklch(0.62 0.18 55 / 0.12);
        }
        @media (max-width: 480px) {
          .sfb-sort-label {
            display: none;
          }
        }

        /* ── Filter toggle ──────────────────────────────────── */
        .sfb-filter-toggle {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          height: 2.25rem;
          padding: 0 0.875rem;
          border: 1px solid oklch(0.88 0.01 90);
          border-radius: 0.625rem;
          background: oklch(0.99 0.002 85);
          font-size: 0.8125rem;
          font-weight: 600;
          color: oklch(0.35 0.01 270);
          cursor: pointer;
          transition: border-color 0.12s ease, background 0.12s ease, color 0.12s ease;
        }
        .sfb-filter-toggle:hover {
          border-color: oklch(0.62 0.18 55);
          color: oklch(0.55 0.18 55);
        }
        .sfb-filter-toggle--active {
          border-color: oklch(0.62 0.18 55);
          background: oklch(0.62 0.18 55 / 0.08);
          color: oklch(0.55 0.18 55);
        }
        .sfb-filter-toggle-label {
          display: inline;
        }
        @media (max-width: 380px) {
          .sfb-filter-toggle-label {
            display: none;
          }
        }
        .sfb-filter-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 1.125rem;
          height: 1.125rem;
          padding: 0 0.25rem;
          border-radius: 999px;
          background: oklch(0.62 0.18 55);
          font-size: 0.625rem;
          font-weight: 700;
          color: #fff;
          line-height: 1;
        }

        /* ── Chips row ──────────────────────────────────────── */
        .sfb-chips-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .sfb-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.3125rem;
          height: 1.75rem;
          padding: 0 0.5rem 0 0.625rem;
          border-radius: 999px;
          background: oklch(0.62 0.18 55 / 0.1);
          font-size: 0.75rem;
          font-weight: 600;
          color: oklch(0.48 0.16 55);
          white-space: nowrap;
        }
        .sfb-chip--search {
          background: oklch(0.25 0.01 270 / 0.08);
          color: oklch(0.25 0.01 270);
        }
        .sfb-chip-remove {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 1rem;
          height: 1rem;
          border: none;
          border-radius: 50%;
          background: transparent;
          color: inherit;
          cursor: pointer;
          opacity: 0.5;
          transition: opacity 0.12s ease, background 0.12s ease;
          padding: 0;
        }
        .sfb-chip-remove:hover {
          opacity: 1;
          background: oklch(0 0 0 / 0.08);
        }
        .sfb-clear-all {
          border: none;
          background: none;
          font-size: 0.75rem;
          font-weight: 600;
          color: oklch(0.45 0.01 270);
          cursor: pointer;
          text-decoration: underline;
          text-underline-offset: 2px;
          white-space: nowrap;
          padding: 0;
        }
        .sfb-clear-all:hover {
          color: oklch(0.55 0.18 55);
        }

        /* ── Import/Export ─────────────────────────────────── */
        .sfb-io-row {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .sfb-io-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          height: 2rem;
          padding: 0 0.75rem;
          border: 1px dashed oklch(0.82 0.01 90);
          border-radius: 0.5rem;
          background: oklch(0.99 0.002 85);
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: oklch(0.45 0.01 270);
          cursor: pointer;
          transition: border-color 0.12s ease, color 0.12s ease, background 0.12s ease;
        }
        .sfb-io-btn:hover {
          border-color: oklch(0.62 0.18 55);
          color: oklch(0.5 0.16 55);
          background: oklch(0.62 0.18 55 / 0.06);
        }

        /* ── Responsive: stack on narrow screens ────────────── */
        @media (max-width: 540px) {
          .sfb-top-row {
            flex-direction: column;
            align-items: stretch;
          }
          .sfb-search-wrap {
            flex: none;
          }
          .sfb-controls {
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
}
