import React from "react";
import {
  STATUS_LABEL,
  DANGEROUS_TRANSITIONS,
} from "../../../constants/orderStatus";

export default function BulkActions({
  selectedIds,
  onBulkStatusChange,
  onBulkExport,
  loading,
}) {
  if (selectedIds.length === 0) return null;

  return (
    <div
      className="orders-bulk-bar"
      role="region"
      aria-label="Thao tác hàng loạt"
    >
      <span>
        <strong>{selectedIds.length}</strong> đơn hàng được chọn
      </span>

      <div
        style={{
          display: "flex",
          gap: "0.375rem",
          marginLeft: "auto",
          flexWrap: "wrap",
        }}
      >
        {/* Quick status changes */}
        <button
          className="orders-btn orders-btn--sm"
          onClick={() => onBulkStatusChange("CONFIRMED")}
          disabled={loading}
        >
          Xác nhận
        </button>
        <button
          className="orders-btn orders-btn--amber orders-btn--sm"
          onClick={() => onBulkStatusChange("SHIPPING")}
          disabled={loading}
        >
          Đang giao
        </button>
        <button
          className="orders-btn orders-btn--primary orders-btn--sm"
          onClick={() => onBulkStatusChange("DELIVERED")}
          disabled={loading}
        >
          Đã giao
        </button>
        <button
          className="orders-btn orders-btn--danger orders-btn--sm"
          onClick={() => onBulkStatusChange("CANCELLED")}
          disabled={loading}
        >
          Hủy đơn
        </button>

        {/* Export */}
        <button
          className="orders-btn orders-btn--sm"
          onClick={onBulkExport}
          disabled={loading}
          style={{ marginLeft: "0.5rem" }}
        >
          📥 Xuất CSV
        </button>
      </div>
    </div>
  );
}
