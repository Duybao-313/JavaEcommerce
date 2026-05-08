import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/admin/LoadingSpinner";
import PaginationBar from "../../components/admin/PaginationBar";
import {
  getAdminOrders,
  getShippingByOrderId,
  markShippingDelivered,
  updateOrderStatus,
} from "../../services/adminService";
import {
  formatDateTime,
  formatPrice,
  normalizeText,
  paginate,
} from "./adminHelpers";

const pageSize = 10;
const statuses = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "SHIPPING",
  "DELIVERED",
  "CANCELLED",
];

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PREPARING: "bg-purple-100 text-purple-800",
  SHIPPING: "bg-cyan-100 text-cyan-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await getAdminOrders();
        if (isMounted) {
          setOrders(data || []);
        }
      } catch (err) {
        if (isMounted) {
          toast.error(err?.message || "Tải danh sách đơn hàng thất bại");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const keyword = normalizeText(search);
    return orders.filter(
      (item) =>
        !keyword ||
        normalizeText(String(item?.orderId || "")).includes(keyword) ||
        normalizeText(item?.buyerUsername || "").includes(keyword) ||
        normalizeText(item?.status || "").includes(keyword),
    );
  }, [orders, search]);

  const pageItems = useMemo(
    () => paginate(filtered, page, pageSize),
    [filtered, page],
  );

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filtered.length / pageSize));
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [filtered.length, page]);

  async function handleStatusChange(order, status) {
    if (status === order.status) return;
    setSavingId(order.orderId);
    try {
      const updated = await updateOrderStatus(order.orderId, status);
      setOrders((prev) =>
        prev.map((item) =>
          item.orderId === order.orderId ? { ...item, ...updated } : item,
        ),
      );

      if (status === "DELIVERED") {
        try {
          const shipping = await getShippingByOrderId(order.orderId);
          if (shipping?.id) {
            await markShippingDelivered(shipping.id);
          }
        } catch {
          // Order status updated, shipping sync is optional
        }
      }

      toast.success("Cập nhật trạng thái thành công");
    } catch (err) {
      toast.error(err?.message || "Cập nhật thất bại");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Đơn hàng</h1>
        <p className="mt-1 text-sm text-zinc-600">{filtered.length} đơn hàng</p>
      </div>

      <div>
        <input
          type="text"
          placeholder="Tìm theo ID đơn hàng, tên người mua, trạng thái..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-zinc-900 focus:outline-none"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
        {loading ? (
          <LoadingSpinner />
        ) : pageItems.length === 0 ? (
          <div className="p-6 text-center text-sm text-zinc-600">
            {search ? "Không tìm thấy đơn hàng nào" : "Chưa có đơn hàng nào"}
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50">
                <th className="px-4 py-3 font-semibold text-zinc-900">ID</th>
                <th className="px-4 py-3 font-semibold text-zinc-900">
                  Người mua
                </th>
                <th className="px-4 py-3 font-semibold text-zinc-900">
                  Tổng tiền
                </th>
                <th className="px-4 py-3 font-semibold text-zinc-900">
                  Trạng thái
                </th>
                <th className="px-4 py-3 font-semibold text-zinc-900">
                  Ngày tạo
                </th>
                <th className="px-4 py-3 text-right font-semibold text-zinc-900">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((order) => (
                <tr
                  key={order.orderId}
                  className="border-b border-zinc-100 hover:bg-zinc-50"
                >
                  <td className="px-4 py-3 font-medium text-zinc-900">
                    #{order.orderId}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {order.buyerUsername || `#${order.buyerId}`}
                  </td>
                  <td className="px-4 py-3 font-medium text-zinc-900">
                    {formatPrice(order.totalAmount)}
                  </td>
                  <td className="px-4 py-3">
                              <span className={`inline-block rounded px-2 py-1 text-xs font-semibold ${statusColors[order.status] || "bg-gray-100 text-gray-800"}`}>
   {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-600">
                    {formatDateTime(order.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(order, e.target.value)
                      }
                      disabled={savingId === order.orderId}
                      className="rounded border border-zinc-300 px-2 py-1 text-xs font-semibold text-zinc-900 focus:border-zinc-900 focus:outline-none disabled:opacity-50"
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && pageItems.length > 0 && (
        <PaginationBar
          page={page}
          pageSize={pageSize}
          totalItems={filtered.length}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}

export default AdminOrdersPage;
