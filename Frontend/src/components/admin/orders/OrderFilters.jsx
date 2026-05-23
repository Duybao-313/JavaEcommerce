import React from "react";
import { STATUS_TABS } from "../../../constants/orderStatus";

export default function OrderFilters({
  activeStatus,
  onStatusChange,
  search,
  onSearchChange,
  sort,
  onSortChange,
}) {
  return (
    <div className="orders-filters-container">
      {/* Status tabs */}
      <div
        className="orders-status-tabs"
        role="tablist"
        aria-label="Lọc theo trạng thái đơn hàng"
      >
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeStatus === tab.key}
            className={`orders-status-tab${
              activeStatus === tab.key ? " orders-status-tab--active" : ""
            }`}
            onClick={() => onStatusChange(tab.key)}
          >
            <span aria-hidden="true">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search + sort row */}
      <div className="orders-filters-row" style={{ marginTop: "0.75rem" }}>
        <input
          type="text"
          className="orders-search-input"
          placeholder="Tìm theo mã đơn, người mua, SKU sản phẩm..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Tìm kiếm đơn hàng"
        />

        <select
          className="orders-select"
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          aria-label="Sắp xếp đơn hàng"
        >
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
          <option value="amount_desc">Giá cao → thấp</option>
          <option value="amount_asc">Giá thấp → cao</option>
        </select>
      </div>
    </div>
  );
}
