import React from "react";
import OrderRow from "./OrderRow";
import "./orders.css";

export default function OrderTable({
  orders,
  loading,
  selectedIds,
  onSelect,
  onSelectAll,
  allSelected,
  onOpenDrawer,
  onStatusChange,
  savingId,
}) {
  if (loading) {
    return (
      <div className="orders-table-wrapper">
        <div className="orders-skeleton">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="orders-skeleton-row">
              <div
                className="orders-skeleton-cell"
                style={{ width: "2rem", flexShrink: 0 }}
              />
              <div className="orders-skeleton-cell" style={{ width: "15%" }} />
              <div className="orders-skeleton-cell" style={{ width: "10%" }} />
              <div className="orders-skeleton-cell" style={{ width: "12%" }} />
              <div className="orders-skeleton-cell" style={{ width: "10%" }} />
              <div className="orders-skeleton-cell" style={{ width: "10%" }} />
              <div className="orders-skeleton-cell" style={{ width: "10%" }} />
              <div className="orders-skeleton-cell" style={{ width: "10%" }} />
              <div className="orders-skeleton-cell" style={{ width: "8%" }} />
              <div className="orders-skeleton-cell" style={{ width: "8%" }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="orders-table-wrapper">
      <table
        className="orders-table"
        role="grid"
        aria-label="Danh sách đơn hàng"
      >
        <thead>
          <tr>
            <th className="col-checkbox">
              <input
                type="checkbox"
                className="orders-row-checkbox"
                checked={allSelected}
                onChange={(e) => onSelectAll(e.target.checked)}
                aria-label="Chọn tất cả đơn hàng"
              />
            </th>
            <th>Mã đơn</th>
            <th>Sản phẩm</th>
            <th>Người mua</th>
            <th>Người bán</th>
            <th>Thanh toán</th>
            <th>Tổng tiền</th>
            <th>Trạng thái</th>
            <th>Ngày tạo</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <OrderRow
              key={order.orderId}
              order={order}
              selected={selectedIds.includes(order.orderId)}
              onSelect={onSelect}
              onOpenDrawer={onOpenDrawer}
              onStatusChange={onStatusChange}
              savingId={savingId}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
