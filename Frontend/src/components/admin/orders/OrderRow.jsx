import React, { useState } from "react";
import {
  STATUS_LABEL,
  STATUS_ICON,
  STATUS_COLOR,
} from "../../../constants/orderStatus";
import {
  formatPrice,
  formatDateTime,
  resolveImageUrl,
  getItemImageUrl,
} from "../../../pages/admin/adminHelpers";

export default function OrderRow({
  order,
  selected,
  onSelect,
  onOpenDrawer,
  onStatusChange,
  savingId,
}) {
  const items = order.items || [];
  const visibleThumbs = items.slice(0, 3);
  const extraCount = Math.max(0, items.length - 3);
  const isSaving = savingId === order.orderId;
  const sellerName =
    order.seller?.storeName ||
    order.seller?.username ||
    (order.sellerId ? `#${order.sellerId}` : "—");

  return (
    <tr>
      <td className="col-checkbox" data-label="">
        <input
          type="checkbox"
          className="orders-row-checkbox"
          checked={selected}
          onChange={(e) => onSelect(order.orderId, e.target.checked)}
          aria-label={`Chọn đơn hàng ${order.orderCode || order.orderId}`}
        />
      </td>
      <td data-label="Mã đơn">
        <button
          className="orders-order-code"
          onClick={() => onOpenDrawer(order)}
          title="Xem chi tiết đơn hàng"
        >
          {order.orderCode || `#${order.orderId}`}
        </button>
      </td>
      <td data-label="Sản phẩm">
        <div className="orders-item-thumbs">
          {visibleThumbs.map((item, i) => (
            <OrderItemThumb key={i} item={item} />
          ))}
          {extraCount > 0 && (
            <span className="orders-item-thumb-more">+{extraCount}</span>
          )}
        </div>
      </td>
      <td data-label="Người mua">
        {order.buyerUsername || (order.buyerId ? `#${order.buyerId}` : "—")}
      </td>
      <td data-label="Người bán">{sellerName}</td>
      <td data-label="Thanh toán">{order.paymentMethod || "COD"}</td>
      <td data-label="Tổng tiền" style={{ fontWeight: 600, color: "#18181b" }}>
        {formatPrice(order.finalAmount ?? order.totalAmount)}
      </td>
      <td data-label="Trạng thái">
        <span
          className={`orders-status-badge ${
            STATUS_COLOR[order.status] ||
            "bg-zinc-50 text-zinc-600 border-zinc-200/60"
          }`}
        >
          {STATUS_ICON[order.status] || ""}{" "}
          {STATUS_LABEL[order.status] || order.status}
        </span>
      </td>
      <td data-label="Ngày tạo">{formatDateTime(order.createdAt)}</td>
      <td data-label="" className="orders-row-actions-cell">
        <div className="orders-row-actions">
          <button
            className="orders-action-btn"
            title="Xem chi tiết"
            onClick={() => onOpenDrawer(order)}
            aria-label={`Xem chi tiết đơn ${order.orderCode || order.orderId}`}
          >
            👁
          </button>
          {isSaving ? (
            <span
              className="orders-action-btn"
              style={{ opacity: 0.5 }}
              title="Đang cập nhật..."
            >
              <span
                style={{
                  animation: "spin 1s linear infinite",
                  display: "inline-block",
                }}
              >
                ⏳
              </span>
            </span>
          ) : (
            <select
              className="orders-select"
              value={order.status}
              onChange={(e) => onStatusChange(order, e.target.value)}
              style={{
                fontSize: "0.75rem",
                padding: "0.25rem 1.75rem 0.25rem 0.5rem",
              }}
              aria-label={`Đổi trạng thái đơn ${order.orderCode || order.orderId}`}
            >
              <option value="PENDING">PENDING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="PREPARING">PREPARING</option>
              <option value="SHIPPING">SHIPPING</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="RETURNED">RETURNED</option>
            </select>
          )}
        </div>
      </td>
    </tr>
  );
}

// Small thumb with image error fallback
function OrderItemThumb({ item }) {
  const [failed, setFailed] = useState(false);
  const imgSrc = resolveImageUrl(getItemImageUrl(item));

  if (!imgSrc || failed) {
    return (
      <span
        className="orders-item-thumb-more"
        style={{ fontSize: "0.75rem", cursor: "default" }}
        title={item.productName || ""}
      >
        📦
      </span>
    );
  }

  return (
    <img
      className="orders-item-thumb"
      src={imgSrc}
      alt={item.productName || ""}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
