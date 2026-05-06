import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/admin/LoadingSpinner";
import PaginationBar from "../../components/admin/PaginationBar";
import {
  createShipping,
  getShippings,
  markShippingDelivered,
  markShippingInTransit,
  trackShipping,
} from "../../services/adminService";
import { normalizeText, paginate } from "./adminHelpers";

const pageSize = 10;

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  IN_TRANSIT: "bg-blue-100 text-blue-800",
  DELIVERED: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
};

const defaultForm = {
  orderId: "",
  carrierName: "",
  trackingCode: "",
  estimatedDelivery: "",
};

function AdminShippingsPage() {
  const [shippings, setShippings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(defaultForm);
  const [trackingSearch, setTrackingSearch] = useState("");
  const [trackingResult, setTrackingResult] = useState(null);
  const [trackingError, setTrackingError] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await getShippings();
        if (isMounted) {
          setShippings(data || []);
        }
      } catch (err) {
        if (isMounted) {
          toast.error(err?.message || "Tải danh sách vận chuyển thất bại");
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
    return shippings.filter(
      (item) =>
        !keyword ||
        normalizeText(item?.trackingCode || "").includes(keyword) ||
        normalizeText(item?.carrierName || "").includes(keyword) ||
        normalizeText(String(item?.orderId || "")).includes(keyword),
    );
  }, [shippings, search]);

  const pageItems = useMemo(() => paginate(filtered, page, pageSize), [filtered, page]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filtered.length / pageSize));
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [filtered.length, page]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      orderId: Number(form.orderId),
      carrierName: form.carrierName.trim(),
      trackingCode: form.trackingCode.trim(),
      estimatedDelivery: form.estimatedDelivery,
    };

    if (!payload.orderId || !payload.carrierName || !payload.estimatedDelivery) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setSaving(true);
    try {
      const created = await createShipping(payload);
      setShippings((p) => [created, ...p]);
      setForm(defaultForm);
      setShowForm(false);
      toast.success("Tạo vận chuyển thành công");
    } catch (err) {
      toast.error(err?.message || "Lỗi");
    } finally {
      setSaving(false);
    }
  }

  async function handleTrack(e) {
    e.preventDefault();
    if (!trackingSearch.trim()) {
      toast.error("Nhập mã theo dõi");
      return;
    }

    setTrackingError("");
    try {
      const result = await trackShipping(trackingSearch);
      setTrackingResult(result);
    } catch (err) {
      setTrackingError(err?.message || "Không tìm thấy vận chuyển");
      setTrackingResult(null);
    }
  }

  async function handleMarkInTransit(shippingId) {
    setSaving(true);
    try {
      await markShippingInTransit(shippingId);
      setShippings((p) =>
        p.map((item) => (item.id === shippingId ? { ...item, status: "IN_TRANSIT" } : item)),
      );
      toast.success("Cập nhật thành công");
    } catch (err) {
      toast.error(err?.message || "Lỗi");
    } finally {
      setSaving(false);
    }
  }

  async function handleMarkDelivered(shippingId) {
    setSaving(true);
    try {
      await markShippingDelivered(shippingId);
      setShippings((p) =>
        p.map((item) => (item.id === shippingId ? { ...item, status: "DELIVERED" } : item)),
      );
      toast.success("Cập nhật thành công");
    } catch (err) {
      toast.error(err?.message || "Lỗi");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Vận chuyển</h1>
          <p className="mt-1 text-sm text-zinc-600">{filtered.length} đơn vận chuyển</p>
        </div>
        <button
          onClick={() => {
            setForm(defaultForm);
            setShowForm(true);
          }}
          className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 md:w-auto"
        >
          Tạo vận chuyển
        </button>
      </div>

      {/* Create Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
            <h2 className="text-lg font-bold text-zinc-900">Tạo vận chuyển mới</h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <input
                name="orderId"
                type="number"
                value={form.orderId}
                onChange={handleChange}
                placeholder="ID đơn hàng"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
                required
              />
              <input
                name="carrierName"
                value={form.carrierName}
                onChange={handleChange}
                placeholder="Hãng vận chuyển"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
                required
              />
              <input
                name="trackingCode"
                value={form.trackingCode}
                onChange={handleChange}
                placeholder="Mã theo dõi (tùy chọn)"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
              />
              <input
                name="estimatedDelivery"
                type="datetime-local"
                value={form.estimatedDelivery}
                onChange={handleChange}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
                required
              />
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-75"
                >
                  {saving ? "Đang lưu..." : "Tạo"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tracking Lookup */}
      <form onSubmit={handleTrack} className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <input
          type="text"
          value={trackingSearch}
          onChange={(e) => setTrackingSearch(e.target.value)}
          placeholder="Nhập mã theo dõi..."
          className="flex-1 rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm focus:border-amber-900 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
        >
          Tìm
        </button>
      </form>

      {/* Tracking Result */}
      {trackingResult && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="font-semibold text-green-900">Theo dõi #{trackingResult.trackingCode}</p>
          <p className="mt-1 text-sm text-green-800">Trạng thái: {trackingResult.status}</p>
          <p className="text-sm text-green-800">Đơn hàng #: {trackingResult.orderId}</p>
        </div>
      )}

      {trackingError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{trackingError}</p>
        </div>
      )}

      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Tìm theo mã theo dõi, hãng vận chuyển, ID đơn hàng..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-zinc-900 focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
        {loading ? (
          <LoadingSpinner />
        ) : pageItems.length === 0 ? (
          <div className="p-6 text-center text-sm text-zinc-600">
            {search ? "Không tìm thấy vận chuyển nào" : "Chưa có vận chuyển nào"}
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50">
                <th className="px-4 py-3 font-semibold text-zinc-900">ID</th>
                <th className="px-4 py-3 font-semibold text-zinc-900">Đơn hàng</th>
                <th className="px-4 py-3 font-semibold text-zinc-900">Hãng</th>
                <th className="px-4 py-3 font-semibold text-zinc-900">Mã theo dõi</th>
                <th className="px-4 py-3 font-semibold text-zinc-900">Trạng thái</th>
                <th className="px-4 py-3 text-right font-semibold text-zinc-900">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((shipping) => (
                <tr key={shipping.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                  <td className="px-4 py-3 font-medium text-zinc-900">#{shipping.id}</td>
                  <td className="px-4 py-3 text-zinc-600">#{shipping.orderId}</td>
                  <td className="px-4 py-3 text-zinc-600">{shipping.carrierName}</td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-600">
                    {shipping.trackingCode || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded px-2 py-1 text-xs font-semibold ${statusColors[shipping.status] || "bg-gray-100 text-gray-800"}`}>
                      {shipping.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleMarkInTransit(shipping.id)}
                        disabled={saving || shipping.status === "IN_TRANSIT" || shipping.status === "DELIVERED"}
                        className="rounded px-2 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                      >
                        In Transit
                      </button>
                      <button
                        onClick={() => handleMarkDelivered(shipping.id)}
                        disabled={saving || shipping.status === "DELIVERED"}
                        className="rounded px-2 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-50 disabled:opacity-50"
                      >
                        Delivered
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && pageItems.length > 0 && (
        <PaginationBar page={page} pageSize={pageSize} totalItems={filtered.length} onPageChange={setPage} />
      )}
    </div>
  );
}

export default AdminShippingsPage;




