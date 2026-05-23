import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  STATUS_LABEL,
  STATUS_ICON,
  STATUS_COLOR,
  ALLOWED_TRANSITIONS,
  DANGEROUS_TRANSITIONS,
  SHIPPING_STATUS_LABEL,
} from "../../../constants/orderStatus";
import {
  formatPrice,
  formatDateTime,
  resolveImageUrl,
  getItemImageUrl,
} from "../../../pages/admin/adminHelpers";
import OrderActions from "./OrderActions";

export default function OrderDrawer({
  order,
  shipping,
  open,
  closing,
  onClose,
  onStatusChange,
  onCreateShipping,
  onUpdateShipping,
  onMarkInTransit,
  onMarkDelivered,
  saving,
}) {
  if (!open || !order) return null;

  const items = order.items || [];
  const buyer =
    order.buyerUsername || (order.buyerId ? `#${order.buyerId}` : "—");
  const sellerName =
    order.seller?.storeName ||
    order.seller?.username ||
    (order.sellerId ? `#${order.sellerId}` : "—");
  const buyerEmail = order.buyerEmail || "";

  // Build timeline from statuses
  const allStatuses = [
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "SHIPPING",
    "DELIVERED",
  ];
  const currentIdx = allStatuses.indexOf(order.status);
  const timeline = allStatuses.map((s, i) => ({
    status: s,
    label: STATUS_LABEL[s],
    completed: i <= currentIdx && currentIdx >= 0,
    active: s === order.status,
  }));

  if (order.status === "CANCELLED") {
    timeline.length = 0;
    timeline.push(
      {
        status: "PENDING",
        label: "Đơn hàng đã đặt",
        completed: true,
        active: false,
      },
      { status: "CANCELLED", label: "Đã hủy", completed: true, active: true },
    );
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="orders-drawer-overlay"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`orders-drawer${closing ? " orders-drawer--closing" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={`Chi tiết đơn ${order.orderCode || order.orderId}`}
      >
        {/* Header */}
        <div className="orders-drawer-header">
          <h2>Đơn {order.orderCode || `#${order.orderId}`}</h2>
          <button
            className="orders-drawer-close"
            onClick={onClose}
            aria-label="Đóng chi tiết đơn hàng"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="orders-drawer-body">
          {/* Status badge */}
          <div className="orders-drawer-section">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                flexWrap: "wrap",
              }}
            >
              <span
                className={`orders-status-badge ${
                  STATUS_COLOR[order.status] ||
                  "bg-zinc-50 text-zinc-600 border-zinc-200/60"
                }`}
                style={{ fontSize: "0.75rem", padding: "0.25rem 0.625rem" }}
              >
                {STATUS_ICON[order.status] || ""}{" "}
                {STATUS_LABEL[order.status] || order.status}
              </span>
              <span style={{ fontSize: "0.75rem", color: "#a1a1aa" }}>
                {formatDateTime(order.createdAt)}
              </span>
            </div>
          </div>

          {/* Timeline */}
          <div className="orders-drawer-section">
            <h4>Dòng thời gian</h4>
            <div className="orders-timeline">
              {timeline.map((step, i) => (
                <div key={i} className="orders-timeline-item">
                  <span
                    className={`orders-timeline-dot${
                      step.active ? " orders-timeline-dot--active" : ""
                    }`}
                    style={
                      step.completed && !step.active
                        ? { background: "#a1a1aa" }
                        : {}
                    }
                  />
                  <span
                    style={{
                      color: step.active
                        ? "#18181b"
                        : step.completed
                          ? "#52525b"
                          : "#a1a1aa",
                      fontWeight: step.active ? 600 : 400,
                    }}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Items */}
          <div className="orders-drawer-section">
            <h4>Sản phẩm ({items.length})</h4>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              {items.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    padding: "0.5rem 0",
                    borderBottom:
                      i < items.length - 1 ? "1px solid #f4f4f5" : "none",
                  }}
                >
                  <DrawerItemImage item={item} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "0.8125rem",
                        fontWeight: 500,
                        color: "#18181b",
                        lineHeight: 1.3,
                      }}
                    >
                      {item.productName || `Sản phẩm #${item.productId}`}
                    </div>
                    {item.variantAttributes &&
                      Object.keys(item.variantAttributes).length > 0 && (
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "#71717a",
                            marginTop: "0.125rem",
                          }}
                        >
                          {Object.entries(item.variantAttributes)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(" · ")}
                        </div>
                      )}
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#a1a1aa",
                        marginTop: "0.125rem",
                      }}
                    >
                      SL: {item.quantity} ×{" "}
                      {formatPrice(item.unitPrice || item.price)}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      color: "#18181b",
                      flexShrink: 0,
                    }}
                  >
                    {formatPrice(
                      (item.unitPrice || item.price || 0) *
                        (item.quantity || 1),
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping info */}
          <div className="orders-drawer-section">
            <h4>Vận chuyển</h4>
            {shipping ? (
              <div className="orders-shipping-card">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontWeight: 600, color: "#18181b" }}>
                    {shipping.carrier || "Chưa rõ đơn vị"}
                  </span>
                  <span
                    className="orders-status-badge"
                    style={{ fontSize: "0.65rem" }}
                  >
                    {SHIPPING_STATUS_LABEL[shipping.status] ||
                      shipping.status ||
                      "PENDING"}
                  </span>
                </div>
                {shipping.trackingCode && (
                  <div>
                    Mã vận đơn: <code>{shipping.trackingCode}</code>
                  </div>
                )}
                {shipping.estimatedDelivery && (
                  <div style={{ color: "#71717a" }}>
                    Dự kiến: {formatDateTime(shipping.estimatedDelivery)}
                  </div>
                )}
                {shipping.deliveredAt && (
                  <div style={{ color: "#16a34a" }}>
                    Đã giao: {formatDateTime(shipping.deliveredAt)}
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    gap: "0.375rem",
                    marginTop: "0.375rem",
                  }}
                >
                  <button
                    className="orders-btn orders-btn--sm"
                    onClick={() => onUpdateShipping(shipping)}
                    disabled={saving}
                  >
                    Cập nhật
                  </button>
                  {shipping.status !== "IN_TRANSIT" &&
                    shipping.status !== "DELIVERED" && (
                      <button
                        className="orders-btn orders-btn--amber orders-btn--sm"
                        onClick={() => onMarkInTransit(shipping.id)}
                        disabled={saving}
                      >
                        Đang vận chuyển
                      </button>
                    )}
                  {shipping.status !== "DELIVERED" && (
                    <button
                      className="orders-btn orders-btn--primary orders-btn--sm"
                      onClick={() => onMarkDelivered(shipping.id)}
                      disabled={saving}
                    >
                      Đã giao
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ fontSize: "0.8125rem", color: "#a1a1aa" }}>
                Chưa có thông tin vận chuyển.{" "}
                <button
                  className="orders-btn orders-btn--sm"
                  style={{ marginLeft: "0.25rem" }}
                  onClick={() => onCreateShipping(order.orderId)}
                >
                  Tạo vận đơn
                </button>
              </div>
            )}
          </div>

          {/* Buyer & Seller info */}
          <div className="orders-drawer-section">
            <h4>Thông tin liên hệ</h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.75rem",
                fontSize: "0.8125rem",
              }}
            >
              <div>
                <div
                  style={{
                    color: "#a1a1aa",
                    fontSize: "0.6875rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                  }}
                >
                  Người mua
                </div>
                <div style={{ fontWeight: 500, color: "#18181b" }}>{buyer}</div>
                {buyerEmail && (
                  <div style={{ color: "#71717a" }}>{buyerEmail}</div>
                )}
              </div>
              <div>
                <div
                  style={{
                    color: "#a1a1aa",
                    fontSize: "0.6875rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                  }}
                >
                  Người bán
                </div>
                <div style={{ fontWeight: 500, color: "#18181b" }}>
                  {sellerName}
                </div>
                <Link
                  to={`/store/${order.sellerId}`}
                  style={{ fontSize: "0.75rem", color: "#d97706" }}
                >
                  Xem cửa hàng →
                </Link>
              </div>
            </div>
          </div>

          {/* Financial summary */}
          <div className="orders-drawer-section">
            <h4>Tổng kết tài chính</h4>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.25rem",
                fontSize: "0.8125rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#71717a" }}>Tạm tính</span>
                <span>{formatPrice(order.totalAmount || 0)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: "#71717a" }}>Giảm giá</span>
                  <span style={{ color: "#16a34a" }}>
                    -{formatPrice(order.discountAmount)}
                  </span>
                </div>
              )}
              {order.shippingFee > 0 && (
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: "#71717a" }}>Phí vận chuyển</span>
                  <span>{formatPrice(order.shippingFee)}</span>
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: 700,
                  color: "#18181b",
                  paddingTop: "0.375rem",
                  borderTop: "1px solid #e4e4e7",
                  marginTop: "0.25rem",
                }}
              >
                <span>Tổng cộng</span>
                <span>
                  {formatPrice(order.finalAmount ?? order.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="orders-drawer-footer">
          <OrderActions
            order={order}
            onStatusChange={onStatusChange}
            saving={saving}
          />
          <button
            className="orders-btn"
            style={{ marginLeft: "auto" }}
            onClick={onClose}
          >
            ✕ Đóng
          </button>
        </div>
      </div>
    </>
  );
}

function DrawerItemImage({ item }) {
  const [failed, setFailed] = useState(false);
  const imgSrc = resolveImageUrl(getItemImageUrl(item));

  if (!imgSrc || failed) {
    return (
      <span
        style={{
          width: "3rem",
          height: "3rem",
          borderRadius: "0.5rem",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.25rem",
          background: "#f4f4f5",
          border: "1px solid #e4e4e7",
          flexShrink: 0,
        }}
        aria-hidden="true"
      >
        📦
      </span>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={item.productName || ""}
      style={{
        width: "3rem",
        height: "3rem",
        borderRadius: "0.5rem",
        objectFit: "cover",
        border: "1px solid #e4e4e7",
        flexShrink: 0,
      }}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
