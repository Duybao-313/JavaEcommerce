import React from "react";

/**
 * ProductReviewFilters — filter bar for admin product review page.
 * Tab-style status filter + search input with accessible labeling.
 */
export default function ProductReviewFilters({
  activeTab,
  onTabChange,
  search,
  onSearchChange,
}) {
  const tabs = [
    { key: "ALL", label: "Tất cả" },
    { key: "PENDING_REVIEW", label: "Chờ duyệt" },
    { key: "REJECTED", label: "Từ chối" },
    { key: "PENDING_CHANGES", label: "Cần sửa" },
    { key: "ACTIVE", label: "Đã duyệt" },
    { key: "INACTIVE", label: "Đã khóa" },
  ];

  return (
    <div
      className="review-filters"
      role="search"
      aria-label="Lọc sản phẩm chờ duyệt"
    >
      <div className="review-filters__search">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <label htmlFor="review-search" className="sr-only">
          Tìm kiếm sản phẩm
        </label>
        <input
          id="review-search"
          type="text"
          placeholder="Tìm theo tên, SKU, mã đơn..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div
        className="review-filters__tabs"
        role="tablist"
        aria-label="Lọc theo trạng thái"
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            className={`review-filters__tab ${
              activeTab === tab.key ? "review-filters__tab--active" : ""
            }`}
            onClick={() => onTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
