import React from "react";
import { motion, AnimatePresence } from "motion/react";

/* ── Icons ────────────────────────────────────────────────────── */
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

/* ── Helpers ──────────────────────────────────────────────────── */
function formatPriceVND(value) {
  return new Intl.NumberFormat("vi-VN").format(value || 0);
}

/* ── Category Pills ───────────────────────────────────────────── */
function CategoryPills({ categories, selectedId, onChange }) {
  if (!categories || categories.length === 0) return null;

  return (
    <div className="fp-cat-scroll">
      <button
        type="button"
        onClick={() => onChange("all")}
        className={`fp-cat-pill ${selectedId === "all" ? "fp-cat-pill--active" : ""}`}
      >
        Tất cả
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          type="button"
          onClick={() => onChange(String(cat.id))}
          className={`fp-cat-pill ${String(selectedId) === String(cat.id) ? "fp-cat-pill--active" : ""}`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}

/* ── Stock Segmented Control ──────────────────────────────────── */
const STOCK_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "inStock", label: "Còn hàng" },
  { value: "lowStock", label: "Sắp hết" },
  { value: "outOfStock", label: "Hết hàng" },
];

function StockSegmented({ value, onChange }) {
  return (
    <div className="fp-segmented">
      {STOCK_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`fp-segmented-btn ${value === opt.value ? "fp-segmented-btn--active" : ""}`}
          aria-pressed={value === opt.value}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/* ── Price Range ──────────────────────────────────────────────── */
function PriceRange({ minPrice, maxPrice, onMinChange, onMaxChange }) {
  return (
    <div className="fp-price-range">
      <div className="fp-price-field">
        <label htmlFor="fp-min-price" className="fp-price-label">
          Từ
        </label>
        <div className="fp-price-input-wrap">
          <input
            id="fp-min-price"
            type="number"
            min="0"
            step="10000"
            value={minPrice}
            onChange={(e) => onMinChange(e.target.value)}
            placeholder="0"
            className="fp-price-input"
          />
          <span className="fp-price-unit">₫</span>
        </div>
      </div>
      <span className="fp-price-sep" aria-hidden="true">
        <svg width="16" height="2" viewBox="0 0 16 2" fill="none">
          <line
            x1="0"
            y1="1"
            x2="16"
            y2="1"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      </span>
      <div className="fp-price-field">
        <label htmlFor="fp-max-price" className="fp-price-label">
          Đến
        </label>
        <div className="fp-price-input-wrap">
          <input
            id="fp-max-price"
            type="number"
            min="0"
            step="10000"
            value={maxPrice}
            onChange={(e) => onMaxChange(e.target.value)}
            placeholder="∞"
            className="fp-price-input"
          />
          <span className="fp-price-unit">₫</span>
        </div>
      </div>

      {/* Visual price indicator */}
      {(minPrice || maxPrice) && (
        <div className="fp-price-visual">
          {minPrice && Number(minPrice) > 0 ? formatPriceVND(minPrice) : "0₫"}
          <span className="fp-price-visual-sep">—</span>
          {maxPrice && Number(maxPrice) > 0 ? formatPriceVND(maxPrice) : "∞"}
        </div>
      )}
    </div>
  );
}

/* ── Main FilterPanel ─────────────────────────────────────────── */
export default function FilterPanel({
  isOpen,
  categories = [],
  selectedCategory,
  stockFilter,
  minPrice,
  maxPrice,
  onCategoryChange,
  onStockChange,
  onMinPriceChange,
  onMaxPriceChange,
  onReset,
  onClose,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="fp-root"
        >
          <div className="fp-inner">
            {/* Header */}
            <div className="fp-header">
              <h3 className="fp-title">Bộ lọc</h3>
              <button
                type="button"
                onClick={onClose}
                className="fp-close-btn"
                aria-label="Đóng bộ lọc"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Filter sections */}
            <div className="fp-body">
              {/* Category */}
              <fieldset className="fp-section">
                <legend className="fp-section-title">Danh mục</legend>
                <CategoryPills
                  categories={categories}
                  selectedId={selectedCategory}
                  onChange={onCategoryChange}
                />
              </fieldset>

              {/* Price range */}
              <fieldset className="fp-section">
                <legend className="fp-section-title">Khoảng giá</legend>
                <PriceRange
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  onMinChange={onMinPriceChange}
                  onMaxChange={onMaxPriceChange}
                />
              </fieldset>

              {/* Stock */}
              <fieldset className="fp-section">
                <legend className="fp-section-title">Tình trạng</legend>
                <StockSegmented value={stockFilter} onChange={onStockChange} />
              </fieldset>
            </div>

            {/* Footer */}
            <div className="fp-footer">
              <button type="button" onClick={onReset} className="fp-reset-btn">
                Đặt lại
              </button>
            </div>
          </div>

          {/* Inline styles */}
          <style>{`
            /* ── Root ───────────────────────────────────────── */
            .fp-root {
              overflow: hidden;
              border-radius: 1rem;
              border: 1px solid oklch(0.88 0.01 90);
              background: oklch(0.99 0.002 85);
            }
            .fp-inner {
              padding: 1.25rem;
            }

            /* ── Header ────────────────────────────────────── */
            .fp-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 1rem;
            }
            .fp-title {
              margin: 0;
              font-size: 0.8125rem;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              color: oklch(0.35 0.01 270);
            }
            .fp-close-btn {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 1.75rem;
              height: 1.75rem;
              border: none;
              border-radius: 0.5rem;
              background: transparent;
              color: oklch(0.45 0.01 270);
              cursor: pointer;
              transition: background 0.12s ease;
            }
            .fp-close-btn:hover {
              background: oklch(0 0 0 / 0.06);
            }

            /* ── Body ──────────────────────────────────────── */
            .fp-body {
              display: flex;
              flex-direction: column;
              gap: 1.25rem;
            }

            /* ── Section ───────────────────────────────────── */
            .fp-section {
              border: none;
              padding: 0;
              margin: 0;
            }
            .fp-section-title {
              display: block;
              margin-bottom: 0.5rem;
              font-size: 0.6875rem;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.08em;
              color: oklch(0.5 0.01 260);
            }

            /* ── Category pills ────────────────────────────── */
            .fp-cat-scroll {
              display: flex;
              flex-wrap: wrap;
              gap: 0.375rem;
            }
            .fp-cat-pill {
              display: inline-flex;
              align-items: center;
              height: 2rem;
              padding: 0 0.875rem;
              border: 1px solid oklch(0.88 0.01 90);
              border-radius: 999px;
              background: oklch(0.99 0.002 85);
              font-size: 0.8125rem;
              font-weight: 500;
              color: oklch(0.35 0.01 270);
              cursor: pointer;
              transition: border-color 0.12s ease, background 0.12s ease, color 0.12s ease;
              white-space: nowrap;
            }
            .fp-cat-pill:hover {
              border-color: oklch(0.62 0.18 55);
              color: oklch(0.5 0.16 55);
            }
            .fp-cat-pill--active {
              border-color: oklch(0.62 0.18 55);
              background: oklch(0.62 0.18 55 / 0.12);
              color: oklch(0.5 0.18 55);
              font-weight: 700;
            }

            /* ── Stock segmented ───────────────────────────── */
            .fp-segmented {
              display: inline-flex;
              border: 1px solid oklch(0.88 0.01 90);
              border-radius: 0.625rem;
              overflow: hidden;
              background: oklch(0.97 0.003 85);
            }
            .fp-segmented-btn {
              height: 2rem;
              padding: 0 0.75rem;
              border: none;
              border-right: 1px solid oklch(0.88 0.01 90);
              background: transparent;
              font-size: 0.75rem;
              font-weight: 600;
              color: oklch(0.4 0.01 270);
              cursor: pointer;
              transition: background 0.12s ease, color 0.12s ease;
              white-space: nowrap;
            }
            .fp-segmented-btn:last-child {
              border-right: none;
            }
            .fp-segmented-btn:hover {
              background: oklch(0.62 0.18 55 / 0.06);
            }
            .fp-segmented-btn--active {
              background: oklch(0.62 0.18 55);
              color: #fff;
            }

            /* ── Price range ───────────────────────────────── */
            .fp-price-range {
              display: flex;
              align-items: center;
              gap: 0.5rem;
              flex-wrap: wrap;
            }
            .fp-price-field {
              display: flex;
              flex-direction: column;
              gap: 0.25rem;
            }
            .fp-price-label {
              font-size: 0.6875rem;
              font-weight: 600;
              color: oklch(0.5 0.01 260);
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            .fp-price-input-wrap {
              position: relative;
            }
            .fp-price-input {
              width: 8rem;
              height: 2.25rem;
              padding: 0 2rem 0 0.75rem;
              border: 1px solid oklch(0.88 0.01 90);
              border-radius: 0.5625rem;
              background: oklch(0.99 0.002 85);
              font-size: 0.875rem;
              font-weight: 500;
              color: oklch(0.15 0.01 270);
              outline: none;
              transition: border-color 0.12s ease, box-shadow 0.12s ease;
              -moz-appearance: textfield;
            }
            .fp-price-input::-webkit-inner-spin-button,
            .fp-price-input::-webkit-outer-spin-button {
              -webkit-appearance: none;
              margin: 0;
            }
            .fp-price-input::placeholder {
              color: oklch(0.6 0.01 260);
            }
            .fp-price-input:focus {
              border-color: oklch(0.62 0.18 55);
              box-shadow: 0 0 0 2px oklch(0.62 0.18 55 / 0.12);
            }
            .fp-price-unit {
              position: absolute;
              right: 0.625rem;
              top: 50%;
              transform: translateY(-50%);
              font-size: 0.75rem;
              font-weight: 600;
              color: oklch(0.45 0.01 270);
              pointer-events: none;
            }
            .fp-price-sep {
              display: flex;
              align-items: center;
              color: oklch(0.55 0.01 260);
              padding-top: 1rem;
            }
            .fp-price-visual {
              width: 100%;
              margin-top: 0.25rem;
              font-size: 0.75rem;
              font-weight: 600;
              color: oklch(0.5 0.16 55);
              text-align: center;
            }
            .fp-price-visual-sep {
              margin: 0 0.375rem;
              color: oklch(0.6 0.01 260);
            }

            /* ── Footer ────────────────────────────────────── */
            .fp-footer {
              margin-top: 1rem;
              padding-top: 0.75rem;
              border-top: 1px solid oklch(0.88 0.01 90);
              display: flex;
              justify-content: flex-end;
            }
            .fp-reset-btn {
              height: 2rem;
              padding: 0 0.875rem;
              border: 1px solid oklch(0.88 0.01 90);
              border-radius: 0.5625rem;
              background: oklch(0.99 0.002 85);
              font-size: 0.75rem;
              font-weight: 600;
              color: oklch(0.45 0.01 270);
              cursor: pointer;
              transition: border-color 0.12s ease, color 0.12s ease;
            }
            .fp-reset-btn:hover {
              border-color: oklch(0.62 0.18 55);
              color: oklch(0.5 0.16 55);
            }

            /* ── Responsive ────────────────────────────────── */
            @media (max-width: 540px) {
              .fp-inner {
                padding: 1rem;
              }
              .fp-price-input {
                width: 6.5rem;
              }
              .fp-segmented {
                width: 100%;
              }
              .fp-segmented-btn {
                flex: 1;
                text-align: center;
                padding: 0 0.375rem;
                font-size: 0.6875rem;
              }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
