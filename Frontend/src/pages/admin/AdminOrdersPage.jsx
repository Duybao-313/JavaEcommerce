import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import PaginationBar from "../../components/admin/PaginationBar";
import ConfirmationModal from "../../components/admin/ConfirmationModal";
import OrderFilters from "../../components/admin/orders/OrderFilters";
import OrderTable from "../../components/admin/orders/OrderTable";
import OrderDrawer from "../../components/admin/orders/OrderDrawer";
import BulkActions from "../../components/admin/orders/BulkActions";
import ShippingModal from "../../components/admin/orders/ShippingModal";
import {
  DANGEROUS_TRANSITIONS,
  STATUS_LABEL,
} from "../../constants/orderStatus";
import {
  getAdminOrders,
  updateOrderStatus,
  bulkUpdateOrderStatus,
  getShippingByOrderId,
  createShipping,
  updateShipping,
  markShippingInTransit,
  markShippingDelivered,
} from "../../services/adminService";
import "../../components/admin/orders/orders.css";

const PAGE_SIZE = 15;

// ---- Helper: export selected orders as CSV ----
function exportToCsv(orders) {
  if (!orders || orders.length === 0) return;

  const headers = [
    "Mã đơn",
    "Người mua",
    "Người bán",
    "Thanh toán",
    "Tổng tiền",
    "Trạng thái",
    "Phí ship",
    "Giảm giá",
    "Ngày tạo",
  ];

  const rows = orders.map((o) => [
    o.orderCode || `#${o.orderId}`,
    o.buyerUsername || o.buyerId || "",
    o.seller?.storeName || o.seller?.username || o.sellerId || "",
    o.paymentMethod || "COD",
    o.finalAmount ?? o.totalAmount ?? 0,
    o.status || "",
    o.shippingFee ?? 0,
    o.discountAmount ?? 0,
    o.createdAt ? new Date(o.createdAt).toISOString() : "",
  ]);

  const csvContent =
    "\uFEFF" +
    [headers.map((h) => `"${h}"`).join(",")]
      .concat(
        rows.map((r) =>
          r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","),
        ),
      )
      .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `don-hang-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminOrdersPage() {
  // ---- State ----
  const [orders, setOrders] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [activeStatus, setActiveStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(0);

  // Selection
  const [selectedIds, setSelectedIds] = useState([]);
  const [savingId, setSavingId] = useState(null);

  // Drawer
  const [drawerOrder, setDrawerOrder] = useState(null);
  const [drawerShipping, setDrawerShipping] = useState(null);
  const [drawerClosing, setDrawerClosing] = useState(false);

  // Modals
  const [confirmModal, setConfirmModal] = useState(null);
  const [bulkConfirmModal, setBulkConfirmModal] = useState(null);
  const [shippingModal, setShippingModal] = useState(null);
  const [shippingLoading, setShippingLoading] = useState(false);

  const debounceRef = useRef(null);

  // ---- Data fetching ----
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminOrders({
        status: activeStatus,
        q: search || undefined,
        sort,
        page,
        size: PAGE_SIZE,
      });
      setOrders(data.content || []);
      setTotalElements(data.totalElements || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách đơn hàng");
      toast.error(err.message || "Tải danh sách đơn hàng thất bại");
    } finally {
      setLoading(false);
    }
  }, [activeStatus, search, sort, page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [activeStatus, search, sort]);

  // Debounce search
  const handleSearchChange = (value) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      // search already set, will be picked up by fetchOrders
    }, 300);
  };

  // ---- Single order status change ----
  const handleStatusChange = async (order, targetStatus) => {
    if (targetStatus === order.status) return;
    if (savingId) return;

    if (DANGEROUS_TRANSITIONS.includes(targetStatus)) {
      setConfirmModal({ order, targetStatus });
      return;
    }

    await executeStatusChange(order, targetStatus);
  };

  const executeStatusChange = async (order, targetStatus) => {
    setSavingId(order.orderId);
    try {
      const updated = await updateOrderStatus(order.orderId, targetStatus);
      setOrders((prev) =>
        prev.map((o) =>
          o.orderId === order.orderId
            ? { ...o, ...updated, status: targetStatus }
            : o,
        ),
      );
      setDrawerOrder((prev) =>
        prev?.orderId === order.orderId
          ? { ...prev, ...updated, status: targetStatus }
          : prev,
      );
      toast.success(
        `Đơn ${order.orderCode || `#${order.orderId}`} → "${
          STATUS_LABEL[targetStatus] || targetStatus
        }"`,
      );
    } catch (err) {
      toast.error(err.message || "Cập nhật trạng thái thất bại");
    } finally {
      setSavingId(null);
      setConfirmModal(null);
    }
  };

  // ---- Bulk status change ----
  const handleBulkStatusChange = (targetStatus) => {
    if (selectedIds.length === 0) return;
    if (DANGEROUS_TRANSITIONS.includes(targetStatus)) {
      setBulkConfirmModal({ targetStatus, count: selectedIds.length });
      return;
    }
    executeBulkStatusChange(targetStatus);
  };

  const executeBulkStatusChange = async (targetStatus) => {
    setLoading(true);
    try {
      await bulkUpdateOrderStatus(selectedIds, targetStatus);
      toast.success(
        `Đã cập nhật ${selectedIds.length} đơn → "${STATUS_LABEL[targetStatus] || targetStatus}"`,
      );
      setSelectedIds([]);
      setBulkConfirmModal(null);
      await fetchOrders();
    } catch (err) {
      toast.error("Cập nhật hàng loạt thất bại, thử từng đơn...");
      let successCount = 0;
      let failCount = 0;
      for (const id of selectedIds) {
        try {
          await updateOrderStatus(id, targetStatus);
          successCount++;
        } catch {
          failCount++;
        }
      }
      if (successCount > 0) {
        toast.success(
          `Đã cập nhật ${successCount} đơn. ${failCount > 0 ? `${failCount} thất bại.` : ""}`,
        );
      }
      setSelectedIds([]);
      setBulkConfirmModal(null);
      await fetchOrders();
    } finally {
      setLoading(false);
    }
  };

  // ---- Bulk export ----
  const handleBulkExport = () => {
    const selectedOrders = orders.filter((o) =>
      selectedIds.includes(o.orderId),
    );
    if (selectedOrders.length === 0) {
      toast.error("Chưa chọn đơn hàng nào");
      return;
    }
    exportToCsv(selectedOrders);
    toast.success(`Đã xuất ${selectedOrders.length} đơn hàng`);
  };

  // ---- Selection ----
  const handleSelect = (orderId, checked) => {
    setSelectedIds((prev) =>
      checked ? [...prev, orderId] : prev.filter((id) => id !== orderId),
    );
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(orders.map((o) => o.orderId));
    } else {
      setSelectedIds([]);
    }
  };

  const allSelected = orders.length > 0 && selectedIds.length === orders.length;

  // ---- Drawer ----
  const openDrawer = async (order) => {
    // Use order data from list — avoids GET /orders/{id} which returns 403 for admin
    setDrawerOrder(order);
    setDrawerClosing(false);
    // Only fetch shipping (the list data already has items, buyer, seller, financials)
    try {
      const shipping = await getShippingByOrderId(order.orderId).catch(
        () => null,
      );
      setDrawerShipping(shipping);
    } catch {
      // shipping fetch is optional
    }
  };

  const closeDrawer = () => {
    setDrawerClosing(true);
    setTimeout(() => {
      setDrawerOrder(null);
      setDrawerShipping(null);
      setDrawerClosing(false);
    }, 180);
  };

  const handleDrawerStatusChange = (order, targetStatus) => {
    handleStatusChange(order, targetStatus);
  };

  // ---- Shipping actions ----
  const handleCreateShipping = (orderId) => {
    setShippingModal({ open: true, initial: null, orderId });
  };

  const handleUpdateShippingModal = (shipping) => {
    setShippingModal({ open: true, initial: shipping });
  };

  const handleShippingSubmit = async (bodyOrId, body) => {
    setShippingLoading(true);
    try {
      if (body) {
        await updateShipping(bodyOrId, body);
        toast.success("Đã cập nhật vận đơn");
      } else {
        await createShipping(bodyOrId);
        toast.success("Đã tạo vận đơn");
      }
      setShippingModal(null);
      if (drawerOrder) {
        const shipping = await getShippingByOrderId(drawerOrder.orderId).catch(
          () => null,
        );
        setDrawerShipping(shipping);
      }
    } catch (err) {
      toast.error(err.message || "Thao tác vận đơn thất bại");
    } finally {
      setShippingLoading(false);
    }
  };

  const handleMarkInTransit = async (shippingId) => {
    try {
      await markShippingInTransit(shippingId);
      toast.success("Đã đánh dấu đang vận chuyển");
      if (drawerOrder) {
        const shipping = await getShippingByOrderId(drawerOrder.orderId).catch(
          () => null,
        );
        setDrawerShipping(shipping);
      }
    } catch (err) {
      toast.error(err.message || "Thất bại");
    }
  };

  const handleMarkDelivered = async (shippingId) => {
    try {
      await markShippingDelivered(shippingId);
      toast.success("Đã đánh dấu giao hàng thành công");
      if (drawerOrder) {
        const shipping = await getShippingByOrderId(drawerOrder.orderId).catch(
          () => null,
        );
        setDrawerShipping(shipping);
      }
    } catch (err) {
      toast.error(err.message || "Thất bại");
    }
  };

  return (
    <div className="admin-orders-page">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Đơn hàng</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {loading
            ? "Đang tải..."
            : `${totalElements.toLocaleString("vi-VN")} đơn hàng`}
        </p>
      </div>

      {/* Filters */}
      <OrderFilters
        activeStatus={activeStatus}
        onStatusChange={(s) => {
          setActiveStatus(s);
          setSelectedIds([]);
        }}
        search={search}
        onSearchChange={handleSearchChange}
        sort={sort}
        onSortChange={setSort}
      />

      {/* Bulk actions */}
      <BulkActions
        selectedIds={selectedIds}
        onBulkStatusChange={handleBulkStatusChange}
        onBulkExport={handleBulkExport}
        loading={loading}
      />

      {/* Error state */}
      {error && !loading && (
        <div className="orders-error" role="alert">
          <span className="orders-error-icon">⚠️</span>
          <p className="orders-error-text">{error}</p>
          <button
            className="orders-btn orders-btn--primary"
            onClick={fetchOrders}
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Table or empty state */}
      {!error && (
        <>
          {!loading && orders.length === 0 ? (
            <div className="orders-table-wrapper">
              <div className="orders-empty">
                <span className="orders-empty-icon">
                  {activeStatus !== "ALL" ? "📭" : "📋"}
                </span>
                <h3 className="orders-empty-title">
                  {search
                    ? "Không tìm thấy đơn hàng nào"
                    : activeStatus !== "ALL"
                      ? `Chưa có đơn hàng "${STATUS_LABEL[activeStatus] || activeStatus}"`
                      : "Chưa có đơn hàng nào"}
                </h3>
                <p className="orders-empty-desc">
                  {search
                    ? "Thử thay đổi từ khóa hoặc bộ lọc."
                    : "Đơn hàng sẽ xuất hiện tại đây khi khách hàng bắt đầu mua sắm."}
                </p>
                <Link
                  to="/products"
                  className="orders-btn orders-btn--primary orders-empty-cta"
                >
                  Xem sản phẩm
                </Link>
              </div>
            </div>
          ) : (
            <OrderTable
              orders={orders}
              loading={loading}
              selectedIds={selectedIds}
              onSelect={handleSelect}
              onSelectAll={handleSelectAll}
              allSelected={allSelected}
              onOpenDrawer={openDrawer}
              onStatusChange={handleStatusChange}
              savingId={savingId}
            />
          )}
        </>
      )}

      {/* Pagination */}
      {!loading && orders.length > 0 && totalPages > 1 && (
        <div className="orders-pagination-row">
          <span>
            Hiển thị {orders.length} / {totalElements.toLocaleString("vi-VN")}{" "}
            đơn
          </span>
          <PaginationBar
            page={page + 1}
            pageSize={PAGE_SIZE}
            totalItems={totalElements}
            onPageChange={(p) => setPage(p - 1)}
          />
        </div>
      )}

      {!loading && orders.length > 0 && totalPages <= 1 && (
        <div className="orders-pagination-row">
          <span>Hiển thị tất cả {orders.length} đơn hàng</span>
        </div>
      )}

      {/* Drawer */}
      <OrderDrawer
        order={drawerOrder}
        shipping={drawerShipping}
        open={!!drawerOrder}
        closing={drawerClosing}
        onClose={closeDrawer}
        onStatusChange={handleDrawerStatusChange}
        onCreateShipping={handleCreateShipping}
        onUpdateShipping={handleUpdateShippingModal}
        onMarkInTransit={handleMarkInTransit}
        onMarkDelivered={handleMarkDelivered}
        saving={!!savingId}
      />

      {/* Shipping modal */}
      <ShippingModal
        open={shippingModal?.open || false}
        onClose={() => setShippingModal(null)}
        onSubmit={handleShippingSubmit}
        loading={shippingLoading}
        initial={shippingModal?.initial}
        orderId={shippingModal?.orderId}
      />

      {/* Confirm status change modal */}
      <ConfirmationModal
        open={!!confirmModal}
        title={
          confirmModal?.targetStatus === "CANCELLED"
            ? "Xác nhận hủy đơn hàng"
            : "Xác nhận thay đổi trạng thái"
        }
        message={
          confirmModal
            ? `Bạn chắc chắn muốn chuyển đơn ${
                confirmModal.order?.orderCode ||
                `#${confirmModal.order?.orderId}`
              } sang trạng thái "${STATUS_LABEL[confirmModal.targetStatus]}"? Hành động này ${
                confirmModal.targetStatus === "CANCELLED"
                  ? "không thể hoàn tác."
                  : "có thể ảnh hưởng đến trải nghiệm người dùng."
              }`
            : ""
        }
        confirmText={
          confirmModal?.targetStatus === "CANCELLED" ? "Hủy đơn" : "Xác nhận"
        }
        danger={confirmModal?.targetStatus === "CANCELLED"}
        loading={savingId === confirmModal?.order?.orderId}
        onCancel={() => setConfirmModal(null)}
        onConfirm={() => {
          if (confirmModal) {
            executeStatusChange(confirmModal.order, confirmModal.targetStatus);
          }
        }}
      />

      {/* Confirm bulk status change modal */}
      <ConfirmationModal
        open={!!bulkConfirmModal}
        title={
          bulkConfirmModal?.targetStatus === "CANCELLED"
            ? "Xác nhận hủy nhiều đơn hàng"
            : "Xác nhận cập nhật hàng loạt"
        }
        message={
          bulkConfirmModal
            ? `Bạn chắc chắn muốn chuyển ${bulkConfirmModal.count} đơn hàng sang trạng thái "${
                STATUS_LABEL[bulkConfirmModal.targetStatus]
              }"? ${
                bulkConfirmModal.targetStatus === "CANCELLED"
                  ? "Hành động này không thể hoàn tác."
                  : ""
              }`
            : ""
        }
        confirmText={
          bulkConfirmModal?.targetStatus === "CANCELLED"
            ? `Hủy ${bulkConfirmModal?.count || ""} đơn`
            : "Xác nhận"
        }
        danger={bulkConfirmModal?.targetStatus === "CANCELLED"}
        loading={loading}
        onCancel={() => setBulkConfirmModal(null)}
        onConfirm={() => {
          if (bulkConfirmModal) {
            executeBulkStatusChange(bulkConfirmModal.targetStatus);
          }
        }}
      />
    </div>
  );
}
