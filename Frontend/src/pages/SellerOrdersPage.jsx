import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";
import ConfirmationModal from "../components/admin/ConfirmationModal";
import {
  getSellerOrders,
  updateSellerOrderStatus,
  cancelSellerOrder,
  createShipping,
  getShippingByOrderId,
  markShippingInTransit,
  CARRIERS,
  STATUS_LABEL,
  STATUS_COLOR,
  STATUS_ICON,
  STATUS_FILTERS,
  ORDER_STATUS,
  getNextAction,
  isTerminal,
} from "../services/sellerOrderService";
import "./SellerOrdersPage.css";

// ---- Helpers ----
function formatPrice(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "short",
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

const PAGE_SIZE = 10;

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchTimeoutRef = useRef(null);

  // Pagination
  const [page, setPage] = useState(1);

  // Confirm modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmData, setConfirmData] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Cancel confirm
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  // Detail drawer
  const [drawerOrder, setDrawerOrder] = useState(null);

  // Shipping state
  const [shippingMap, setShippingMap] = useState({}); // orderId → shipping record
  const [carrierModal, setCarrierModal] = useState(null); // order for carrier picker
  const [selectedCarrier, setSelectedCarrier] = useState("");
  const [shippingProcessing, setShippingProcessing] = useState(false);

  // ---- Fetch ----
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSellerOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ---- Debounced search ----
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

  // ---- Filter & search ----
  const filteredOrders = useMemo(() => {
    let result = orders;

    // Status filter
    if (statusFilter !== "ALL") {
      result = result.filter(
        (o) => String(o.status || "").toUpperCase() === statusFilter,
      );
    }

    // Search
    if (debouncedSearch) {
      const kw = normalizeText(debouncedSearch);
      result = result.filter(
        (o) =>
          normalizeText(o.orderCode || "").includes(kw) ||
          normalizeText(o.buyerUsername || "").includes(kw) ||
          normalizeText(o.phone || "").includes(kw),
      );
    }

    return result;
  }, [orders, statusFilter, debouncedSearch]);

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

  // ---- Summary counts ----
  const summary = useMemo(() => {
    const counts = { total: orders.length };
    for (const s of Object.values(ORDER_STATUS)) {
      counts[s] = orders.filter(
        (o) => String(o.status || "").toUpperCase() === s,
      ).length;
    }
    return counts;
  }, [orders]);

  // ---- Confirm action ----
  function openConfirm(order) {
    const action = getNextAction(order.status);
    if (!action) return;
    setConfirmData({ order, action });
    setConfirmOpen(true);
  }

  function closeConfirm() {
    setConfirmOpen(false);
    setConfirmData(null);
  }

  async function handleConfirm() {
    if (!confirmData || updating) return;
    const { order, action } = confirmData;
    setUpdating(true);
    try {
      await updateSellerOrderStatus(order.orderId, action.nextStatus);
      toast.success(
        `Đơn #${order.orderCode || order.orderId} → ${STATUS_LABEL[action.nextStatus]}`,
      );
      closeConfirm();
      await fetchOrders();
    } catch (err) {
      toast.error(err.message || "Không thể cập nhật trạng thái");
    } finally {
      setUpdating(false);
    }
  }

  // ---- Cancel order ----
  function openCancel(order) {
    setCancelTarget(order);
    setCancelOpen(true);
  }

  function closeCancel() {
    setCancelOpen(false);
    setCancelTarget(null);
  }

  async function handleCancel() {
    if (!cancelTarget || cancelling) return;
    setCancelling(true);
    try {
      await cancelSellerOrder(cancelTarget.orderId);
      toast.success(
        `Đã hủy đơn #${cancelTarget.orderCode || cancelTarget.orderId}`,
      );
      closeCancel();
      await fetchOrders();
    } catch (err) {
      toast.error(err.message || "Không thể hủy đơn hàng");
    } finally {
      setCancelling(false);
    }
  }

  // ---- Shipping handlers ----
  function openCarrierModal(order) {
    setCarrierModal(order);
    setSelectedCarrier("");
  }

  function closeCarrierModal() {
    setCarrierModal(null);
    setSelectedCarrier("");
  }

  async function handleCreateShipping() {
    if (!carrierModal || !selectedCarrier || shippingProcessing) return;
    setShippingProcessing(true);
    try {
      const estimated = new Date();
      estimated.setDate(estimated.getDate() + 5);
      const shipping = await createShipping({
        orderId: carrierModal.orderId,
        carrier: selectedCarrier,
        estimatedDelivery: estimated.toISOString(),
      });
      setShippingMap((prev) => ({
        ...prev,
        [carrierModal.orderId]: shipping,
      }));
      toast.success(
        `Đã tạo vận chuyển cho đơn #${carrierModal.orderCode || carrierModal.orderId} qua ${CARRIERS.find((c) => c.value === selectedCarrier)?.label || selectedCarrier}`,
      );
      closeCarrierModal();
    } catch (err) {
      toast.error(err.message || "Không thể tạo vận chuyển");
    } finally {
      setShippingProcessing(false);
    }
  }

  async function handleMarkInTransit(order) {
    const shipping = shippingMap[order.orderId];
    if (!shipping || shippingProcessing) return;
    setShippingProcessing(true);
    try {
      await markShippingInTransit(shipping.id);
      toast.success(
        `Đơn #${order.orderCode || order.orderId} đã chuyển sang đang giao`,
      );
      await fetchOrders();
      setShippingMap((prev) => {
        const next = { ...prev };
        delete next[order.orderId];
        return next;
      });
    } catch (err) {
      toast.error(err.message || "Không thể cập nhật vận chuyển");
    } finally {
      setShippingProcessing(false);
    }
  }

  // Load shipping records for PREPARING/SHIPPING orders
  useEffect(() => {
    async function loadShippings() {
      const targets = orders.filter(
        (o) =>
          String(o.status || "").toUpperCase() === ORDER_STATUS.PREPARING ||
          String(o.status || "").toUpperCase() === ORDER_STATUS.SHIPPING,
      );
      const map = {};
      for (const o of targets) {
        if (shippingMap[o.orderId]) {
          map[o.orderId] = shippingMap[o.orderId];
          continue;
        }
        try {
          const s = await getShippingByOrderId(o.orderId);
          if (s) map[o.orderId] = s;
        } catch {
          // no shipping yet — expected for PREPARING without shipping
        }
      }
      setShippingMap((prev) => ({ ...prev, ...map }));
    }
    if (orders.length > 0) loadShippings();
  }, [orders]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- Status badge ----
  function StatusBadge({ status }) {
    const s = String(status || "").toUpperCase();
    return (
      <span
        className={`seller-orders-badge ${STATUS_COLOR[s] || STATUS_COLOR[ORDER_STATUS.PENDING]}`}
      >
        {STATUS_ICON[s] || ""} {STATUS_LABEL[s] || s}
      </span>
    );
  }

  // ---- Summary cards ----
  const summaryCards = [
    {
      label: "Tổng đơn",
      value: summary.total,
      icon: "📋",
      color: "border-zinc-300",
    },
    {
      label: "Chờ xác nhận",
      value: summary[ORDER_STATUS.PENDING] || 0,
      icon: "⏳",
      color: "border-amber-300",
    },
    {
      label: "Đang xử lý",
      value:
        (summary[ORDER_STATUS.CONFIRMED] || 0) +
        (summary[ORDER_STATUS.PREPARING] || 0),
      icon: "📦",
      color: "border-blue-300",
    },
    {
      label: "Đang giao",
      value: summary[ORDER_STATUS.SHIPPING] || 0,
      icon: "🚚",
      color: "border-orange-300",
    },
    {
      label: "Đã giao",
      value: summary[ORDER_STATUS.DELIVERED] || 0,
      icon: "✅",
      color: "border-emerald-300",
    },
    {
      label: "Đã hủy",
      value: summary[ORDER_STATUS.CANCELLED] || 0,
      icon: "❌",
      color: "border-red-300",
    },
  ];

  return (
    <div className="seller-orders-page">
      {/* Header */}
      <header className="seller-orders-header">
        <div>
          <p className="seller-orders-eyebrow">Order Management</p>
          <h1 className="seller-orders-title">Quản lý đơn hàng</h1>
          <p className="seller-orders-sub">
            Theo dõi và xử lý đơn hàng từ khách mua sản phẩm của bạn
          </p>
        </div>
        <button
          type="button"
          onClick={fetchOrders}
          disabled={loading}
          className="seller-orders-refresh"
          aria-label="Làm mới danh sách"
        >
          🔄 Làm mới
        </button>
      </header>

      {/* Summary cards */}
      <div className="seller-orders-summary">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className={`seller-orders-summary-card ${card.color}`}
          >
            <span className="seller-orders-summary-icon">{card.icon}</span>
            <div>
              <p className="seller-orders-summary-label">{card.label}</p>
              <p className="seller-orders-summary-value">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filter bar */}
      <div className="seller-orders-toolbar">
        {/* Search */}
        <div className="seller-orders-search">
          <svg
            className="seller-orders-search-icon"
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
            placeholder="Tìm mã đơn, khách hàng, SĐT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="seller-orders-search-input"
            aria-label="Tìm kiếm đơn hàng"
          />
        </div>

        {/* Status filter pills */}
        <div className="seller-orders-filters">
          {STATUS_FILTERS.map((f) => {
            const isActive = statusFilter === f.value;
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => {
                  setStatusFilter(f.value);
                  setPage(1);
                }}
                className={`seller-orders-filter-pill ${isActive ? "seller-orders-filter-active" : ""}`}
                aria-pressed={isActive}
              >
                <span className="seller-orders-filter-icon">{f.icon}</span>
                {f.label}
                {f.value !== "ALL" && (
                  <span className="seller-orders-filter-count">
                    {summary[f.value] || 0}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="seller-orders-content">
        {loading ? (
          /* Skeleton */
          <div className="seller-orders-skeleton" aria-label="Đang tải...">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="seller-orders-skeleton-row">
                <div className="seller-orders-skeleton-cell seller-orders-skeleton-sm" />
                <div className="seller-orders-skeleton-cell seller-orders-skeleton-md" />
                <div className="seller-orders-skeleton-cell seller-orders-skeleton-sm" />
                <div className="seller-orders-skeleton-cell seller-orders-skeleton-sm" />
                <div className="seller-orders-skeleton-cell seller-orders-skeleton-sm" />
              </div>
            ))}
          </div>
        ) : error ? (
          /* Error */
          <div className="seller-orders-empty" role="alert">
            <span className="seller-orders-empty-icon">⚠️</span>
            <h3 className="seller-orders-empty-title">Lỗi tải dữ liệu</h3>
            <p className="seller-orders-empty-desc">{error}</p>
            <button className="seller-orders-empty-cta" onClick={fetchOrders}>
              Thử lại
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          /* Empty */
          <div className="seller-orders-empty">
            <span className="seller-orders-empty-icon">
              {debouncedSearch ? "🔍" : "📭"}
            </span>
            <h3 className="seller-orders-empty-title">
              {debouncedSearch
                ? "Không tìm thấy đơn hàng"
                : "Chưa có đơn hàng nào"}
            </h3>
            <p className="seller-orders-empty-desc">
              {debouncedSearch
                ? "Thử lại với từ khóa khác."
                : "Khi có khách đặt sản phẩm, đơn hàng sẽ xuất hiện tại đây."}
            </p>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="seller-orders-table-wrapper">
              <table className="seller-orders-table">
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Khách hàng</th>
                    <th>Trạng thái</th>
                    <th>Vận chuyển</th>
                    <th>Sản phẩm</th>
                    <th className="seller-orders-col-right">Tổng tiền</th>
                    <th className="seller-orders-col-right">Phí ship</th>
                    <th>Ngày tạo</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {pageOrders.map((order) => {
                    const status = String(order.status || "").toUpperCase();
                    const action = getNextAction(order.status);
                    const terminal = isTerminal(order.status);
                    const shipping = shippingMap[order.orderId];
                    const hasShipping = !!shipping;
                    return (
                      <tr
                        key={order.orderId}
                        className="seller-orders-row"
                        tabIndex={0}
                        role="button"
                        aria-label={`Đơn ${order.orderCode || order.orderId}`}
                        onClick={() =>
                          setDrawerOrder(
                            drawerOrder?.orderId === order.orderId
                              ? null
                              : order,
                          )
                        }
                      >
                        <td className="seller-orders-code">
                          <span className="seller-orders-code-text">
                            #{order.orderCode || order.orderId}
                          </span>
                        </td>
                        <td>
                          <div className="seller-orders-buyer">
                            <span className="seller-orders-buyer-name">
                              {order.buyerUsername || "—"}
                            </span>
                            {order.phone && (
                              <span className="seller-orders-buyer-phone">
                                {order.phone}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <StatusBadge status={order.status} />
                        </td>
                        <td>
                          {hasShipping ? (
                            <div className="seller-orders-shipping-info">
                              <span className="seller-orders-carrier">
                                {CARRIERS.find(
                                  (c) => c.value === shipping.carrierName,
                                )?.icon || "📦"}{" "}
                                {CARRIERS.find(
                                  (c) => c.value === shipping.carrierName,
                                )?.label || shipping.carrierName}
                              </span>
                              {shipping.trackingCode && (
                                <span className="seller-orders-tracking">
                                  {shipping.trackingCode}
                                </span>
                              )}
                              <span
                                className={`seller-orders-shipping-status ${shipping.status}`}
                              >
                                {shipping.status}
                              </span>
                            </div>
                          ) : (
                            <span className="seller-orders-no-shipping">—</span>
                          )}
                        </td>
                        <td>
                          <span className="seller-orders-item-count">
                            {order.items?.length || 0} SP
                          </span>
                        </td>
                        <td className="seller-orders-col-right seller-orders-amount">
                          {formatPrice(order.finalAmount || order.totalAmount)}
                        </td>
                        <td className="seller-orders-col-right seller-orders-shipping-fee">
                          {formatPrice(order.shippingFee)}
                        </td>
                        <td className="seller-orders-date">
                          {formatDate(order.createdAt)}
                        </td>
                        <td>
                          <div
                            className="seller-orders-actions"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {terminal ? (
                              <span className="seller-orders-terminal-badge">
                                {STATUS_LABEL[order.status] || order.status}
                              </span>
                            ) : status === ORDER_STATUS.PREPARING &&
                              !hasShipping ? (
                              <button
                                type="button"
                                className="seller-orders-action-btn bg-indigo-600 hover:bg-indigo-700 text-white"
                                onClick={() => openCarrierModal(order)}
                              >
                                🚚 Tạo vận chuyển
                              </button>
                            ) : status === ORDER_STATUS.PREPARING &&
                              hasShipping ? (
                              <button
                                type="button"
                                className="seller-orders-action-btn bg-orange-600 hover:bg-orange-700 text-white"
                                disabled={shippingProcessing}
                                onClick={() => handleMarkInTransit(order)}
                              >
                                {shippingProcessing
                                  ? "Đang xử lý..."
                                  : "📦 Đã giao cho ĐVVC"}
                              </button>
                            ) : action ? (
                              <button
                                type="button"
                                className={`seller-orders-action-btn ${action.cssClass}`}
                                onClick={() => openConfirm(order)}
                              >
                                {action.label}
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="seller-orders-pagination" aria-label="Phân trang">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="seller-orders-page-btn"
                >
                  ← Trước
                </button>
                <span className="seller-orders-page-info">
                  Trang {safePage} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="seller-orders-page-btn"
                >
                  Sau →
                </button>
              </nav>
            )}
          </>
        )}
      </div>

      {/* Detail drawer (expandable inline panel) */}
      {drawerOrder && (
        <div className="seller-orders-drawer">
          <div className="seller-orders-drawer-header">
            <h3 className="seller-orders-drawer-title">
              Chi tiết đơn #{drawerOrder.orderCode || drawerOrder.orderId}
            </h3>
            <button
              type="button"
              className="seller-orders-drawer-close"
              onClick={() => setDrawerOrder(null)}
              aria-label="Đóng chi tiết"
            >
              ✕
            </button>
          </div>

          <div className="seller-orders-drawer-grid">
            {/* Info column */}
            <div className="seller-orders-drawer-section">
              <h4 className="seller-orders-drawer-section-title">
                Thông tin đơn hàng
              </h4>
              <dl className="seller-orders-drawer-dl">
                <div>
                  <dt>Trạng thái</dt>
                  <dd>
                    <StatusBadge status={drawerOrder.status} />
                  </dd>
                </div>
                <div>
                  <dt>Khách hàng</dt>
                  <dd>{drawerOrder.buyerUsername || "—"}</dd>
                </div>
                <div>
                  <dt>SĐT</dt>
                  <dd>{drawerOrder.phone || "—"}</dd>
                </div>
                <div>
                  <dt>Người nhận</dt>
                  <dd>{drawerOrder.recipientName || "—"}</dd>
                </div>
                <div>
                  <dt>Thanh toán</dt>
                  <dd>{drawerOrder.paymentMethod || "COD"}</dd>
                </div>
                <div>
                  <dt>Ngày tạo</dt>
                  <dd>{formatDateTime(drawerOrder.createdAt)}</dd>
                </div>
                <div>
                  <dt>Cập nhật</dt>
                  <dd>{formatDateTime(drawerOrder.updatedAt)}</dd>
                </div>
              </dl>
            </div>

            {/* Address + Note */}
            <div className="seller-orders-drawer-section">
              <h4 className="seller-orders-drawer-section-title">Giao hàng</h4>
              <dl className="seller-orders-drawer-dl">
                <div>
                  <dt>Địa chỉ</dt>
                  <dd>{drawerOrder.shippingAddress || "—"}</dd>
                </div>
                <div>
                  <dt>Phí ship</dt>
                  <dd>{formatPrice(drawerOrder.shippingFee)}</dd>
                </div>
                <div>
                  <dt>Ghi chú</dt>
                  <dd>{drawerOrder.note || "—"}</dd>
                </div>
              </dl>

              {/* Amounts */}
              <h4 className="seller-orders-drawer-section-title mt-4">
                Thanh toán
              </h4>
              <dl className="seller-orders-drawer-dl">
                <div>
                  <dt>Tạm tính</dt>
                  <dd>{formatPrice(drawerOrder.totalAmount)}</dd>
                </div>
                <div>
                  <dt>Giảm giá</dt>
                  <dd>{formatPrice(drawerOrder.discountAmount)}</dd>
                </div>
                <div>
                  <dt>Phí ship</dt>
                  <dd>{formatPrice(drawerOrder.shippingFee)}</dd>
                </div>
                <div className="seller-orders-drawer-total">
                  <dt>Tổng thanh toán</dt>
                  <dd>
                    {formatPrice(
                      drawerOrder.finalAmount || drawerOrder.totalAmount,
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Items list */}
          <div className="seller-orders-drawer-section">
            <h4 className="seller-orders-drawer-section-title">
              Sản phẩm ({drawerOrder.items?.length || 0})
            </h4>
            {drawerOrder.items && drawerOrder.items.length > 0 ? (
              <ul className="seller-orders-drawer-items">
                {drawerOrder.items.map((item) => (
                  <li
                    key={item.orderItemId}
                    className="seller-orders-drawer-item"
                  >
                    <div className="seller-orders-drawer-item-info">
                      <span className="seller-orders-drawer-item-name">
                        {item.productName}
                      </span>
                      <span className="seller-orders-drawer-item-seller">
                        Người bán: {item.sellerUsername || `#${item.sellerId}`}
                      </span>
                    </div>
                    <div className="seller-orders-drawer-item-price">
                      <span>
                        {formatPrice(item.unitPrice)} × {item.quantity}
                      </span>
                      <span className="seller-orders-drawer-item-total">
                        {formatPrice(item.lineTotal)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="seller-orders-drawer-empty">Không có sản phẩm</p>
            )}
          </div>

          {/* Seller actions */}
          {String(drawerOrder.status || "").toUpperCase() !==
            ORDER_STATUS.DELIVERED &&
            String(drawerOrder.status || "").toUpperCase() !==
              ORDER_STATUS.CANCELLED && (
              <div className="seller-orders-drawer-actions">
                <button
                  type="button"
                  className="seller-orders-cancel-btn"
                  onClick={() => openCancel(drawerOrder)}
                >
                  ❌ Hủy đơn hàng
                </button>
              </div>
            )}
          {/* Shipping info in drawer */}
          {shippingMap[drawerOrder.orderId] && (
            <div className="seller-orders-drawer-section">
              <h4 className="seller-orders-drawer-section-title">Vận chuyển</h4>
              <dl className="seller-orders-drawer-dl">
                <div>
                  <dt>Đơn vị VC</dt>
                  <dd>
                    {CARRIERS.find(
                      (c) =>
                        c.value ===
                        shippingMap[drawerOrder.orderId].carrierName,
                    )?.label || shippingMap[drawerOrder.orderId].carrierName}
                  </dd>
                </div>
                <div>
                  <dt>Mã vận đơn</dt>
                  <dd>
                    {shippingMap[drawerOrder.orderId].trackingCode || "—"}
                  </dd>
                </div>
                <div>
                  <dt>Trạng thái VC</dt>
                  <dd>{shippingMap[drawerOrder.orderId].status}</dd>
                </div>
                <div>
                  <dt>Dự kiến giao</dt>
                  <dd>
                    {shippingMap[drawerOrder.orderId].estimatedDelivery
                      ? formatDateTime(
                          shippingMap[drawerOrder.orderId].estimatedDelivery,
                        )
                      : "—"}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      )}

      {/* Carrier picker modal */}
      {carrierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-5 shadow-lg">
            <h3 className="text-lg font-semibold text-zinc-900">
              Chọn đơn vị vận chuyển
            </h3>
            <p className="mt-1 text-sm text-zinc-600">
              Đơn #{carrierModal.orderCode || carrierModal.orderId}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {CARRIERS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setSelectedCarrier(c.value)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                    selectedCarrier === c.value
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400"
                  }`}
                >
                  <span>{c.icon}</span>
                  {c.label}
                </button>
              ))}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeCarrierModal}
                disabled={shippingProcessing}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleCreateShipping}
                disabled={!selectedCarrier || shippingProcessing}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {shippingProcessing ? "Đang xử lý..." : "Tạo vận chuyển"}
              </button>
            </div>
          </div>{" "}
        </div>
      )}

      {/* Confirm modal */}
      <ConfirmationModal
        open={confirmOpen}
        title={confirmData?.action?.confirmTitle || "Xác nhận"}
        message={
          confirmData
            ? confirmData.action.confirmMessage(confirmData.order)
            : ""
        }
        confirmText={confirmData?.action?.label || "Xác nhận"}
        cancelText="Hủy"
        loading={updating}
        onCancel={closeConfirm}
        onConfirm={handleConfirm}
      />

      {/* Cancel confirm modal */}
      <ConfirmationModal
        open={cancelOpen}
        title="Hủy đơn hàng"
        message={
          cancelTarget
            ? `Bạn có chắc muốn hủy đơn #${cancelTarget.orderCode || cancelTarget.orderId}? Hành động này không thể hoàn tác.`
            : ""
        }
        confirmText="Xác nhận hủy"
        cancelText="Giữ lại"
        danger
        loading={cancelling}
        onCancel={closeCancel}
        onConfirm={handleCancel}
      />
    </div>
  );
}
