import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  cancelOrder,
  getOrderById,
  isOrderCancellable,
  mapOrderToUiStatus,
  UI_STATUS,
} from "../services/orderService";

// ---- Helpers ----
function formatPrice(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

const STATUS_META = {
  [UI_STATUS.PENDING_CONFIRMATION]: {
    cssClass: "orders-status-pending",
    icon: "⏳",
  },
  [UI_STATUS.SHIPPING]: { cssClass: "orders-status-shipping", icon: "📦" },
  [UI_STATUS.DELIVERED]: { cssClass: "orders-status-delivered", icon: "✅" },
  [UI_STATUS.CANCELLED]: { cssClass: "orders-status-cancelled", icon: "❌" },
};

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrderById(orderId);
      setOrder(data);
    } catch (err) {
      setError(err.message || "Không thể tải chi tiết đơn hàng");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  async function handleCancel() {
    if (cancelling || !order) return;
    if (
      !window.confirm(
        `Bạn có chắc muốn hủy đơn #${order.orderCode || order.orderId}?`,
      )
    )
      return;

    setCancelling(true);
    try {
      const updated = await cancelOrder(order.orderId);
      setOrder(updated);
      toast.success("Đã hủy đơn hàng thành công");
    } catch (err) {
      toast.error(err.message || "Không thể hủy đơn hàng");
    } finally {
      setCancelling(false);
    }
  }

  const uiStatus = order ? mapOrderToUiStatus(order.status) : null;
  const statusMeta = uiStatus ? STATUS_META[uiStatus] : null;

  // ---- Timeline steps ----
  const timelineSteps = useMemo(() => {
    if (!order) return [];
    const currentStatus = String(order.status || "").toUpperCase();

    if (currentStatus === "CANCELLED") {
      return [
        { label: "Đơn hàng đã đặt", date: order.createdAt, completed: true },
        {
          label: "Đã hủy",
          date: order.updatedAt,
          completed: true,
          isCancelled: true,
        },
      ];
    }

    const all = [
      { key: "PENDING", label: "Đơn hàng đã đặt", date: order.createdAt },
      { key: "CONFIRMED", label: "Đã xác nhận", date: null },
      { key: "PREPARING", label: "Đang chuẩn bị hàng", date: null },
      { key: "SHIPPING", label: "Đang vận chuyển", date: order.shippedAt },
      { key: "DELIVERED", label: "Đã giao hàng", date: order.deliveredAt },
    ];

    const orderIdx = [
      "PENDING",
      "CONFIRMED",
      "PREPARING",
      "SHIPPING",
      "DELIVERED",
    ].indexOf(currentStatus);

    return all.map((step, i) => ({
      ...step,
      completed: i <= orderIdx && orderIdx >= 0,
      active: all[i].key === currentStatus,
    }));
  }, [order]);

  if (loading) {
    return (
      <div className="orders-page" aria-label="Đang tải chi tiết đơn hàng">
        <div className="orders-skeleton-list">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="orders-skeleton-card">
              <div className="orders-skeleton-line orders-skeleton-line-sm" />
              <div className="orders-skeleton-line orders-skeleton-line-lg" />
              <div className="orders-skeleton-line orders-skeleton-line-md" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-page">
        <div className="orders-error-state" role="alert">
          <span className="orders-error-icon">⚠️</span>
          <p className="orders-error-text">{error}</p>
          <button className="orders-retry-btn" onClick={fetchOrder}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="orders-page">
        <div className="orders-empty-state">
          <span className="orders-empty-icon">🔍</span>
          <h3 className="orders-empty-title">Không tìm thấy đơn hàng</h3>
          <p className="orders-empty-desc">
            Đơn hàng này không tồn tại hoặc bạn không có quyền truy cập.
          </p>
          <Link to="/orders" className="orders-empty-cta">
            Quay lại danh sách đơn hàng
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      {/* Breadcrumb */}
      <nav className="orders-breadcrumb" aria-label="Đường dẫn">
        <Link to="/orders" className="orders-breadcrumb-link">
          ← Đơn hàng của tôi
        </Link>
        <span className="orders-breadcrumb-sep">/</span>
        <span className="orders-breadcrumb-current">
          #{order.orderCode || order.orderId}
        </span>
      </nav>

      {/* Header */}
      <div className="orders-detail-header">
        <div className="orders-detail-header-left">
          <h1 className="orders-detail-title">
            Đơn hàng #{order.orderCode || order.orderId}
          </h1>
          <p className="orders-detail-date">
            Đặt ngày {formatDateTime(order.createdAt)}
          </p>
        </div>
        {statusMeta && (
          <span
            className={`orders-detail-status orders-status-badge ${statusMeta.cssClass}`}
          >
            {statusMeta.icon} {uiStatus}
          </span>
        )}
      </div>

      <div className="orders-detail-grid">
        {/* Left column */}
        <div className="orders-detail-main">
          {/* Timeline */}
          <section className="orders-detail-section">
            <h2 className="orders-detail-section-title">Lịch sử trạng thái</h2>
            <ul className="orders-timeline" role="list">
              {timelineSteps.map((step, i) => (
                <li
                  key={step.key || i}
                  className={`orders-timeline-step ${step.completed ? "orders-timeline-step-completed" : ""} ${step.active ? "orders-timeline-step-active" : ""} ${step.isCancelled ? "orders-timeline-step-cancelled" : ""}`}
                >
                  <div className="orders-timeline-marker">
                    {step.isCancelled ? "✕" : step.completed ? "✓" : "○"}
                  </div>
                  <div className="orders-timeline-content">
                    <span className="orders-timeline-label">{step.label}</span>
                    {step.date && (
                      <span className="orders-timeline-date">
                        {formatDateTime(step.date)}
                      </span>
                    )}
                  </div>
                  {i < timelineSteps.length - 1 && (
                    <div
                      className={`orders-timeline-line ${step.completed ? "orders-timeline-line-completed" : ""}`}
                    />
                  )}
                </li>
              ))}
            </ul>
          </section>

          {/* Items */}
          <section className="orders-detail-section">
            <h2 className="orders-detail-section-title">
              Sản phẩm ({order.items?.length || 0})
            </h2>
            <div className="orders-detail-items">
              {(order.items || []).map((item) => (
                <div key={item.orderItemId} className="orders-detail-item">
                  <div className="orders-detail-item-thumb">
                    <div className="orders-detail-item-placeholder">📦</div>
                  </div>
                  <div className="orders-detail-item-info">
                    <Link
                      to={`/products/${item.productId}`}
                      className="orders-detail-item-name"
                    >
                      {item.productName}
                    </Link>
                    <span className="orders-detail-item-seller">
                      Người bán: {item.sellerUsername || `#${item.sellerId}`}
                    </span>
                    <span className="orders-detail-item-meta">
                      {formatPrice(item.unitPrice)} × {item.quantity}
                    </span>
                  </div>
                  <div className="orders-detail-item-total">
                    {formatPrice(item.lineTotal)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right column */}
        <div className="orders-detail-sidebar">
          {/* Shipping info */}
          <section className="orders-detail-section">
            <h2 className="orders-detail-section-title">Thông tin giao hàng</h2>
            <div className="orders-detail-info-list">
              <div className="orders-detail-info-row">
                <span className="orders-detail-info-label">Người nhận</span>
                <span className="orders-detail-info-value">
                  {order.recipientName || order.buyerUsername || "—"}
                </span>
              </div>
              <div className="orders-detail-info-row">
                <span className="orders-detail-info-label">Số điện thoại</span>
                <span className="orders-detail-info-value">
                  {order.phone || "—"}
                </span>
              </div>
              <div className="orders-detail-info-row">
                <span className="orders-detail-info-label">Địa chỉ</span>
                <span className="orders-detail-info-value">
                  {order.shippingAddress}
                </span>
              </div>
            </div>
          </section>

          {/* Payment */}
          <section className="orders-detail-section">
            <h2 className="orders-detail-section-title">Thanh toán</h2>
            <div className="orders-detail-info-list">
              <div className="orders-detail-info-row">
                <span className="orders-detail-info-label">Phương thức</span>
                <span className="orders-detail-info-value">
                  {order.paymentMethod === "COD"
                    ? "Thanh toán khi nhận hàng (COD)"
                    : order.paymentMethod === "BANK_TRANSFER"
                      ? "Chuyển khoản ngân hàng"
                      : order.paymentMethod || "—"}
                </span>
              </div>
              <div className="orders-detail-info-row">
                <span className="orders-detail-info-label">Tạm tính</span>
                <span className="orders-detail-info-value">
                  {formatPrice(order.totalAmount)}
                </span>
              </div>
              {order.discountAmount > 0 && (
                <div className="orders-detail-info-row orders-detail-info-row-green">
                  <span className="orders-detail-info-label">Giảm giá</span>
                  <span className="orders-detail-info-value">
                    -{formatPrice(order.discountAmount)}
                  </span>
                </div>
              )}
              <div className="orders-detail-info-row">
                <span className="orders-detail-info-label">Phí vận chuyển</span>
                <span className="orders-detail-info-value">
                  {formatPrice(order.shippingFee || 0)}
                </span>
              </div>
              <div className="orders-detail-info-row orders-detail-info-row-total">
                <span className="orders-detail-info-label">Tổng cộng</span>
                <span className="orders-detail-info-value">
                  {formatPrice(order.finalAmount || order.totalAmount)}
                </span>
              </div>
            </div>
          </section>

          {/* Tracking */}
          {(order.shippedAt || order.deliveredAt) && (
            <section className="orders-detail-section">
              <h2 className="orders-detail-section-title">Vận chuyển</h2>
              <div className="orders-detail-tracking">
                {order.deliveredAt ? (
                  <div className="orders-detail-tracking-delivered">
                    <span>✅</span>
                    <span>Đã giao lúc {formatDateTime(order.deliveredAt)}</span>
                  </div>
                ) : order.shippedAt ? (
                  <div className="orders-detail-tracking-shipping">
                    <span>📦</span>
                    <span>
                      Đang vận chuyển — Gửi lúc{" "}
                      {formatDateTime(order.shippedAt)}
                    </span>
                  </div>
                ) : null}
              </div>
            </section>
          )}

          {/* Note */}
          {order.note && (
            <section className="orders-detail-section">
              <h2 className="orders-detail-section-title">Ghi chú</h2>
              <p className="orders-detail-note">{order.note}</p>
            </section>
          )}

          {/* Actions */}
          <section className="orders-detail-section">
            <div className="orders-detail-actions">
              {isOrderCancellable(order.status) && (
                <button
                  className="orders-btn-cancel orders-btn-cancel-block"
                  disabled={cancelling}
                  onClick={handleCancel}
                >
                  {cancelling ? "Đang hủy..." : "🗑️ Hủy đơn hàng"}
                </button>
              )}
              <button
                className="orders-btn-support orders-btn-support-block"
                onClick={() => {
                  toast(
                    "📞 CSKH: 1900 1234 — Vui lòng cung cấp mã đơn #" +
                      (order.orderCode || order.orderId) +
                      " để được hỗ trợ.",
                    { duration: 6000 },
                  );
                }}
              >
                📞 Liên hệ hỗ trợ
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
