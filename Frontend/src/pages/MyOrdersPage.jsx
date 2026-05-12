import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  cancelOrder,
  confirmDelivery,
  getMyOrders,
  isOrderCancellable,
  mapOrderToUiStatus,
  UI_STATUS,
  STATUS_GROUPS,
  RAW_STATUS_LABEL,
  RAW_STATUS_ICON,
  RAW_STATUS_CSS,
} from "../services/orderService";
import "./MyOrdersPage.css";

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
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

const STATUS_CONFIG = {
  [UI_STATUS.PENDING_CONFIRMATION]: {
    icon: "⏳",
    cssClass: "orders-status-pending",
    emptyTitle: "Chưa có đơn chờ xác nhận",
    emptyDesc: "Đơn hàng của bạn sau khi đặt sẽ hiển thị tại đây.",
  },
  [UI_STATUS.SHIPPING]: {
    icon: "📦",
    cssClass: "orders-status-shipping",
    emptyTitle: "Không có đơn đang giao",
    emptyDesc: "Đơn hàng đang trên đường sẽ hiển thị ở đây.",
  },
  [UI_STATUS.RECEIVED]: {
    icon: "✅",
    cssClass: "orders-status-delivered",
    emptyTitle: "Chưa có đơn đã nhận",
    emptyDesc: "Đơn hàng bạn đã xác nhận nhận hàng sẽ hiển thị tại đây.",
  },
  [UI_STATUS.CANCELLED]: {
    icon: "❌",
    cssClass: "orders-status-cancelled",
    emptyTitle: "Không có đơn đã hủy",
    emptyDesc: "Đơn hàng đã hủy sẽ hiển thị ở đây.",
  },
};

const PAGE_SIZE = 8;

export default function MyOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(UI_STATUS.PENDING_CONFIRMATION);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);
  const searchTimeoutRef = useRef(null);

  const tabs = useMemo(
    () => [
      UI_STATUS.PENDING_CONFIRMATION,
      UI_STATUS.SHIPPING,
      UI_STATUS.RECEIVED,
      UI_STATUS.CANCELLED,
    ],
    [],
  );

  // ---- Fetch ----
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Không thể tải đơn hàng");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ---- Filter by active tab ----
  const tabOrders = useMemo(() => {
    const statuses = STATUS_GROUPS[activeTab] || [];
    return orders.filter((o) =>
      statuses.includes(String(o.status || "").toUpperCase()),
    );
  }, [orders, activeTab]);

  // ---- Search ----
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [search]);

  const filteredOrders = useMemo(() => {
    if (!debouncedSearch) return tabOrders;
    const kw = normalizeText(debouncedSearch);
    return tabOrders.filter((o) => {
      return (
        normalizeText(o.orderCode || "").includes(kw) ||
        normalizeText(String(o.orderId || "")).includes(kw) ||
        normalizeText(o.phone || "").includes(kw) ||
        normalizeText(o.shippingAddress || "").includes(kw)
      );
    });
  }, [tabOrders, debouncedSearch]);

  // ---- Pagination ----
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const pageOrders = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredOrders.slice(start, start + PAGE_SIZE);
  }, [filteredOrders, safePage]);

  // ---- Order detail drawer ----
  function openDrawer(order) {
    setSelectedOrder(order);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setSelectedOrder(null);
  }

  // ---- Cancel ----
  async function handleCancel(order) {
    if (cancellingId) return;
    if (
      !window.confirm(
        `Bạn có chắc muốn hủy đơn #${order.orderCode || order.orderId}?`,
      )
    )
      return;

    setCancellingId(order.orderId);
    try {
      await cancelOrder(order.orderId);
      toast.success("Đã hủy đơn hàng thành công");
      await fetchOrders();
      if (selectedOrder?.orderId === order.orderId) {
        setSelectedOrder((prev) =>
          prev ? { ...prev, status: "CANCELLED" } : null,
        );
      }
    } catch (err) {
      toast.error(err.message || "Không thể hủy đơn hàng");
    } finally {
      setCancellingId(null);
    }
  }

  // ---- Confirm Delivery ----
  async function handleConfirmDelivery(order) {
    if (confirmingId) return;
    if (
      !window.confirm(
        `Bạn xác nhận đã nhận được đơn hàng #${order.orderCode || order.orderId}?`,
      )
    )
      return;

    setConfirmingId(order.orderId);
    try {
      await confirmDelivery(order.orderId);
      toast.success("Đã xác nhận nhận hàng thành công");
      await fetchOrders();
      if (selectedOrder?.orderId === order.orderId) {
        setSelectedOrder((prev) =>
          prev ? { ...prev, status: "DELIVERED" } : null,
        );
      }
    } catch (err) {
      toast.error(err.message || "Không thể xác nhận nhận hàng");
    } finally {
      setConfirmingId(null);
    }
  }

  // ---- Render helpers ----
  function getStatusBadge(status) {
    const s = String(status || "").toUpperCase();
    const label = RAW_STATUS_LABEL[s] || s;
    const icon = RAW_STATUS_ICON[s] || "";
    const cssClass = RAW_STATUS_CSS[s] || "orders-status-pending";
    return (
      <span className={`orders-status-badge ${cssClass}`}>
        {icon} {label}
      </span>
    );
  }

  function getFirstProductThumb(order) {
    if (!order.items || order.items.length === 0) return null;
    return order.items[0].productId
      ? `/products/${order.items[0].productId}`
      : null;
  }

  // ---- Tab counts ----
  const tabCounts = useMemo(() => {
    const counts = {};
    for (const tab of tabs) {
      const statuses = STATUS_GROUPS[tab] || [];
      counts[tab] = orders.filter((o) =>
        statuses.includes(String(o.status || "").toUpperCase()),
      ).length;
    }
    return counts;
  }, [orders, tabs]);

  return (
    <div className="orders-page">
      {/* Header */}
      <div className="orders-header">
        <Link to="/products" className="orders-back-link">
          ← Quay lại mua sắm
        </Link>
        <h1 className="orders-title">Đơn hàng của tôi</h1>
        <p className="orders-subtitle">{orders.length} đơn hàng</p>
      </div>

      {/* Search */}
      <div className="orders-search-bar">
        <svg
          className="orders-search-icon"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          placeholder="Tìm theo mã đơn, số điện thoại, địa chỉ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="orders-search-input"
          aria-label="Tìm kiếm đơn hàng"
        />
        <button
          type="button"
          className="orders-refresh-btn"
          onClick={fetchOrders}
          disabled={loading}
          aria-label="Làm mới danh sách đơn hàng"
        >
          🔄 Làm mới
        </button>
      </div>

      {/* Tabs */}
      <nav
        className="orders-tabs"
        role="tablist"
        aria-label="Trạng thái đơn hàng"
      >
        {tabs.map((tab) => {
          const config = STATUS_CONFIG[tab];
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              role="tab"
              aria-selected={isActive}
              aria-label={`${tab} (${tabCounts[tab] || 0} đơn)`}
              className={`orders-tab ${isActive ? `orders-tab-active ${config.cssClass}` : ""}`}
              onClick={() => {
                setActiveTab(tab);
                setPage(1);
                setSearch("");
                setDebouncedSearch("");
              }}
            >
              <span className="orders-tab-icon">{config.icon}</span>
              <span className="orders-tab-label">{tab}</span>
              <span
                className={`orders-tab-count ${isActive ? config.cssClass : ""}`}
              >
                {tabCounts[tab] || 0}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Content */}
      <div className="orders-content">
        {/* Order list */}
        <div className="orders-list-panel">
          {loading ? (
            <div
              className="orders-skeleton-list"
              aria-label="Đang tải danh sách đơn hàng"
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="orders-skeleton-card">
                  <div className="orders-skeleton-line orders-skeleton-line-sm" />
                  <div className="orders-skeleton-line orders-skeleton-line-lg" />
                  <div className="orders-skeleton-line orders-skeleton-line-md" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="orders-error-state" role="alert">
              <span className="orders-error-icon">⚠️</span>
              <p className="orders-error-text">{error}</p>
              <button className="orders-retry-btn" onClick={fetchOrders}>
                Thử lại
              </button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="orders-empty-state">
              <span className="orders-empty-icon">
                {STATUS_CONFIG[activeTab].icon}
              </span>
              <h3 className="orders-empty-title">
                {STATUS_CONFIG[activeTab].emptyTitle}
              </h3>
              <p className="orders-empty-desc">
                {debouncedSearch
                  ? "Không tìm thấy đơn hàng phù hợp."
                  : STATUS_CONFIG[activeTab].emptyDesc}
              </p>
              {!debouncedSearch && (
                <Link to="/products" className="orders-empty-cta">
                  Tiếp tục mua sắm
                </Link>
              )}
            </div>
          ) : (
            <>
              <ul className="orders-card-list" role="list">
                {pageOrders.map((order) => (
                  <li key={order.orderId}>
                    <div
                      className={`orders-card ${selectedOrder?.orderId === order.orderId && drawerOpen ? "orders-card-selected" : ""}`}
                    >
                      <button
                        type="button"
                        className="orders-card-clickable"
                        onClick={() => openDrawer(order)}
                        aria-label={`Đơn hàng ${order.orderCode || order.orderId}, ${mapOrderToUiStatus(order.status)}, ${formatPrice(order.totalAmount)}`}
                      >
                        <div className="orders-card-top">
                          <span className="orders-card-code">
                            #{order.orderCode || order.orderId}
                          </span>
                          {getStatusBadge(order.status)}
                        </div>
                        <div className="orders-card-body">
                          <div className="orders-card-info">
                            <p className="orders-card-amount">
                              {formatPrice(
                                order.finalAmount || order.totalAmount,
                              )}
                            </p>
                            <p className="orders-card-date">
                              {formatDateTime(order.createdAt)}
                            </p>
                            <p
                              className="orders-card-address"
                              title={order.shippingAddress}
                            >
                              📍 {order.shippingAddress}
                            </p>
                            {order.phone && (
                              <p className="orders-card-phone">
                                📞 {order.phone}
                              </p>
                            )}
                          </div>
                          <div className="orders-card-items-preview">
                            {order.items && order.items.length > 0 && (
                              <span className="orders-card-item-count">
                                {order.items.length} sản phẩm
                              </span>
                            )}
                          </div>
                        </div>
                      </button>

                      {/* Action buttons */}
                      <div
                        className="orders-card-actions"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {String(order.status || "").toUpperCase() ===
                          "SHIPPING" && (
                          <button
                            type="button"
                            className="orders-confirm-delivery-btn"
                            disabled={confirmingId === order.orderId}
                            onClick={() => handleConfirmDelivery(order)}
                          >
                            {confirmingId === order.orderId
                              ? "Đang xử lý..."
                              : "✅ Xác nhận đã nhận hàng"}
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav
                  className="orders-pagination"
                  aria-label="Phân trang đơn hàng"
                >
                  <button
                    className="orders-page-btn"
                    disabled={safePage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    aria-label="Trang trước"
                  >
                    ← Trước
                  </button>
                  <span className="orders-page-info">
                    {safePage} / {totalPages}
                  </span>
                  <button
                    className="orders-page-btn"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    aria-label="Trang sau"
                  >
                    Sau →
                  </button>
                </nav>
              )}
            </>
          )}
        </div>

        {/* Detail drawer (desktop: right panel; mobile: overlay) */}
        {drawerOpen && selectedOrder && (
          <>
            <div
              className="orders-drawer-overlay"
              onClick={closeDrawer}
              aria-hidden="true"
            />
            <aside
              className="orders-drawer"
              role="complementary"
              aria-label="Chi tiết đơn hàng"
            >
              <div className="orders-drawer-header">
                <h2 className="orders-drawer-title">
                  Chi tiết đơn #
                  {selectedOrder.orderCode || selectedOrder.orderId}
                </h2>
                <button
                  className="orders-drawer-close"
                  onClick={closeDrawer}
                  aria-label="Đóng chi tiết"
                >
                  ✕
                </button>
              </div>

              <div className="orders-drawer-body">
                {/* Status */}
                <div className="orders-drawer-section">
                  <span className="orders-drawer-label">Trạng thái</span>
                  {getStatusBadge(selectedOrder.status)}
                </div>

                {/* Order info */}
                <div className="orders-drawer-section">
                  <span className="orders-drawer-label">
                    Thông tin đơn hàng
                  </span>
                  <div className="orders-drawer-info-grid">
                    <div>
                      <span className="orders-drawer-info-label">Mã đơn</span>
                      <span className="orders-drawer-info-value">
                        {selectedOrder.orderCode || selectedOrder.orderId}
                      </span>
                    </div>
                    <div>
                      <span className="orders-drawer-info-label">Ngày đặt</span>
                      <span className="orders-drawer-info-value">
                        {formatDateTime(selectedOrder.createdAt)}
                      </span>
                    </div>
                    <div>
                      <span className="orders-drawer-info-label">
                        Thanh toán
                      </span>
                      <span className="orders-drawer-info-value">
                        {selectedOrder.paymentMethod || "COD"}
                      </span>
                    </div>
                    <div>
                      <span className="orders-drawer-info-label">
                        Điện thoại
                      </span>
                      <span className="orders-drawer-info-value">
                        {selectedOrder.phone || "—"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="orders-drawer-section">
                  <span className="orders-drawer-label">Địa chỉ giao hàng</span>
                  <p className="orders-drawer-address">
                    {selectedOrder.shippingAddress}
                  </p>
                </div>

                {/* Items */}
                <div className="orders-drawer-section">
                  <span className="orders-drawer-label">
                    Sản phẩm ({selectedOrder.items?.length || 0})
                  </span>
                  <ul className="orders-drawer-items">
                    {(selectedOrder.items || []).map((item) => (
                      <li key={item.orderItemId} className="orders-drawer-item">
                        <div className="orders-drawer-item-info">
                          <span className="orders-drawer-item-name">
                            {item.productName}
                          </span>
                          {item.variantAttributes && (
                            <span className="orders-drawer-item-variant">
                              {(() => {
                                try {
                                  const attrs =
                                    typeof item.variantAttributes === "string"
                                      ? JSON.parse(item.variantAttributes)
                                      : item.variantAttributes;
                                  return Object.entries(attrs)
                                    .map(([k, v]) => `${k}: ${v}`)
                                    .join(", ");
                                } catch {
                                  return item.variantAttributes;
                                }
                              })()}
                            </span>
                          )}
                          <span className="orders-drawer-item-seller">
                            Người bán:{" "}
                            {item.sellerUsername || `#${item.sellerId}`}
                          </span>
                          {/* Review status per item */}
                          {item.reviewed ? (
                            <span className="orders-drawer-item-reviewed">
                              ✅ Đã đánh giá
                            </span>
                          ) : String(
                              selectedOrder.status || "",
                            ).toUpperCase() === "DELIVERED" ? (
                            <Link
                              to={`/orders/${selectedOrder.orderId}`}
                              className="orders-drawer-item-review-link"
                            >
                              ⭐ Đánh giá
                            </Link>
                          ) : null}
                        </div>
                        <div className="orders-drawer-item-price">
                          <span>
                            {formatPrice(item.unitPrice)} × {item.quantity}
                          </span>
                          <span className="orders-drawer-item-total">
                            {formatPrice(item.lineTotal)}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Financial summary */}
                <div className="orders-drawer-section">
                  <span className="orders-drawer-label">Tổng tiền</span>
                  <div className="orders-drawer-financial">
                    <div className="orders-drawer-financial-row">
                      <span>Tạm tính</span>
                      <span>{formatPrice(selectedOrder.totalAmount)}</span>
                    </div>
                    {selectedOrder.discountAmount > 0 && (
                      <div className="orders-drawer-financial-row orders-drawer-financial-discount">
                        <span>Giảm giá</span>
                        <span>
                          -{formatPrice(selectedOrder.discountAmount)}
                        </span>
                      </div>
                    )}
                    <div className="orders-drawer-financial-row">
                      <span>Phí vận chuyển</span>
                      <span>{formatPrice(selectedOrder.shippingFee || 0)}</span>
                    </div>
                    <div className="orders-drawer-financial-row orders-drawer-financial-total">
                      <span>Tổng cộng</span>
                      <span>
                        {formatPrice(
                          selectedOrder.finalAmount ||
                            selectedOrder.totalAmount,
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Note */}
                {selectedOrder.note && (
                  <div className="orders-drawer-section">
                    <span className="orders-drawer-label">Ghi chú</span>
                    <p className="orders-drawer-note">{selectedOrder.note}</p>
                  </div>
                )}

                {/* Timeline */}
                <div className="orders-drawer-section">
                  <span className="orders-drawer-label">
                    Lịch sử trạng thái
                  </span>
                  <OrderTimeline order={selectedOrder} />
                </div>

                {/* Tracking */}
                {selectedOrder.shippedAt && (
                  <div className="orders-drawer-section">
                    <span className="orders-drawer-label">Vận chuyển</span>
                    <p className="orders-drawer-tracking">
                      {selectedOrder.deliveredAt
                        ? `✅ Đã giao lúc ${formatDateTime(selectedOrder.deliveredAt)}`
                        : `📦 Đang vận chuyển (gửi lúc ${formatDateTime(selectedOrder.shippedAt)})`}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="orders-drawer-actions">
                {String(selectedOrder.status || "").toUpperCase() ===
                  "SHIPPING" && (
                  <button
                    className="orders-confirm-delivery-btn"
                    style={{ width: "100%" }}
                    disabled={confirmingId === selectedOrder.orderId}
                    onClick={() => handleConfirmDelivery(selectedOrder)}
                  >
                    {confirmingId === selectedOrder.orderId
                      ? "Đang xử lý..."
                      : "✅ Xác nhận đã nhận hàng"}
                  </button>
                )}
                {String(selectedOrder.status || "").toUpperCase() ===
                  "DELIVERED" && (
                  <button
                    className="orders-btn-review-nav"
                    onClick={() => navigate(`/orders/${selectedOrder.orderId}`)}
                  >
                    ⭐ Đánh giá sản phẩm
                  </button>
                )}
                <button
                  className="orders-btn-detail"
                  onClick={() => navigate(`/orders/${selectedOrder.orderId}`)}
                >
                  Xem chi tiết đầy đủ
                </button>
                {isOrderCancellable(selectedOrder.status) && (
                  <button
                    className="orders-btn-cancel"
                    disabled={cancellingId === selectedOrder.orderId}
                    onClick={() => handleCancel(selectedOrder)}
                  >
                    {cancellingId === selectedOrder.orderId
                      ? "Đang hủy..."
                      : "Hủy đơn hàng"}
                  </button>
                )}
                <button
                  className="orders-btn-support"
                  onClick={() => {
                    toast(
                      "📞 CSKH: 1900 1234 — Vui lòng cung cấp mã đơn #" +
                        (selectedOrder.orderCode || selectedOrder.orderId) +
                        " để được hỗ trợ.",
                      { duration: 6000 },
                    );
                  }}
                >
                  Liên hệ hỗ trợ
                </button>
              </div>
            </aside>
          </>
        )}
      </div>
    </div>
  );
}

// ---- Order Timeline Component ----
function OrderTimeline({ order }) {
  const timelineSteps = useMemo(() => {
    const steps = [
      { label: "Đơn hàng đã đặt", status: "PENDING", date: order.createdAt },
      { label: "Đã xác nhận", status: "CONFIRMED", date: null },
      { label: "Đang chuẩn bị", status: "PREPARING", date: null },
      { label: "Đang vận chuyển", status: "SHIPPING", date: order.shippedAt },
      { label: "Đã giao hàng", status: "DELIVERED", date: order.deliveredAt },
    ];

    const currentStatus = String(order.status || "").toUpperCase();
    const isCancelled = currentStatus === "CANCELLED";

    if (isCancelled) {
      return [
        { label: "Đơn hàng đã đặt", status: "PENDING", date: order.createdAt },
        {
          label: "Đã hủy",
          status: "CANCELLED",
          date: order.updatedAt,
          isCancelled: true,
        },
      ];
    }

    const statusOrder = [
      "PENDING",
      "CONFIRMED",
      "PREPARING",
      "SHIPPING",
      "DELIVERED",
    ];
    const currentIdx = statusOrder.indexOf(currentStatus);

    return steps.map((step, i) => ({
      ...step,
      completed: i <= currentIdx && currentIdx >= 0,
      active: statusOrder[i] === currentStatus,
    }));
  }, [order]);

  return (
    <ul className="orders-timeline" role="list">
      {timelineSteps.map((step, i) => (
        <li
          key={step.status}
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
  );
}
