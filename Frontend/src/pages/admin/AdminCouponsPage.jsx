import { useEffect, useMemo, useState, useCallback } from "react";
import toast from "react-hot-toast";
import ConfirmationModal from "../../components/admin/ConfirmationModal";
import PaginationBar from "../../components/admin/PaginationBar";
import CouponForm from "../../components/admin/coupons/CouponForm";
import CouponListRow from "../../components/admin/coupons/CouponListRow";
import CouponFilterBar from "../../components/admin/coupons/CouponFilterBar";
import {
  getAdminCoupons,
  createCouponAdmin,
  updateCouponAdmin,
  patchCouponAdmin,
  deleteCouponAdmin,
} from "../../services/couponService";

const PAGE_SIZE = 12;

function normalizeText(s) {
  if (!s) return "";
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * AdminCouponsPage — Full CRUD management for coupons.
 *
 * Layout:
 *   - Filter bar (search + active status)
 *   - Coupon table (CouponListRow)
 *   - Pagination
 *   - Inline form panel (CouponForm) for create / edit
 *   - Confirmation modal for soft-delete
 *
 * States: loading, empty, error, success with toast feedback.
 */
function AdminCouponsPage() {
  // ── Data state ──────────────────────────────────────────────────────
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // ── UI state ────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ── Fetch coupons ───────────────────────────────────────────────────
  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, size: PAGE_SIZE };
      if (activeFilter !== "") params.active = activeFilter;
      const result = await getAdminCoupons(params);
      setCoupons(result?.content || []);
      setTotalElements(result?.totalElements || 0);
      setTotalPages(result?.totalPages || 0);
    } catch (err) {
      toast.error(err?.message || "Tải danh sách coupon thất bại");
      setCoupons([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [page, activeFilter]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  // Reset page when filter changes
  useEffect(() => {
    setPage(0);
  }, [activeFilter]);

  // ── Client-side search filter ───────────────────────────────────────
  const filteredCoupons = useMemo(() => {
    const keyword = normalizeText(search);
    if (!keyword) return coupons;
    return coupons.filter((c) => {
      const code = normalizeText(c.code || "");
      const title = normalizeText(c.title || "");
      const desc = normalizeText(c.description || "");
      return (
        code.includes(keyword) ||
        title.includes(keyword) ||
        desc.includes(keyword)
      );
    });
  }, [coupons, search]);

  // ── Form handlers ───────────────────────────────────────────────────
  const handleStartCreate = useCallback(() => {
    setEditingCoupon(null);
    setServerError(null);
    setShowForm(true);
  }, []);

  const handleStartEdit = useCallback((coupon) => {
    setEditingCoupon(coupon);
    setServerError(null);
    setShowForm(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setShowForm(false);
    setEditingCoupon(null);
    setServerError(null);
  }, []);

  const handleFormSubmit = useCallback(
    async (payload) => {
      setSaving(true);
      setServerError(null);
      try {
        if (editingCoupon) {
          await updateCouponAdmin(editingCoupon.id, payload);
          toast.success("Cập nhật coupon thành công");
        } else {
          await createCouponAdmin(payload);
          toast.success("Tạo coupon thành công");
        }
        handleCloseForm();
        await fetchCoupons();
      } catch (err) {
        const msg = err?.body?.message || err?.message || "Lưu coupon thất bại";
        setServerError(msg);
      } finally {
        setSaving(false);
      }
    },
    [editingCoupon, fetchCoupons, handleCloseForm],
  );

  // ── Toggle active ───────────────────────────────────────────────────
  const handleToggle = useCallback(
    async (coupon) => {
      try {
        await patchCouponAdmin(coupon.id, { isActive: !coupon.isActive });
        toast.success(coupon.isActive ? "Đã tắt coupon" : "Đã bật coupon");
        await fetchCoupons();
      } catch (err) {
        toast.error(err?.message || "Cập nhật trạng thái thất bại");
      }
    },
    [fetchCoupons],
  );

  // ── Soft delete ─────────────────────────────────────────────────────
  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteCouponAdmin(deleteTarget.id);
      toast.success(`Đã xoá coupon "${deleteTarget.code}"`);
      setDeleteTarget(null);
      await fetchCoupons();
    } catch (err) {
      toast.error(err?.message || "Xoá coupon thất bại");
      setDeleteTarget(null);
    }
  }, [deleteTarget, fetchCoupons]);

  // ── Render helpers ──────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Quản lý khuyến mãi
          </p>
          <h2 className="mt-1 text-xl font-semibold text-zinc-900">Coupons</h2>
          <p className="mt-0.5 text-sm text-zinc-500">
            {totalElements} coupon • {totalPages} trang
          </p>
        </div>
        <button
          type="button"
          onClick={handleStartCreate}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white transition-colors duration-180 ease-out-quart hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
        >
          + Tạo coupon
        </button>
      </div>

      {/* Filter bar */}
      <CouponFilterBar
        search={search}
        activeFilter={activeFilter}
        onSearch={setSearch}
        onFilter={setActiveFilter}
      />

      {/* Form panel (animated) */}
      <div
        className={`transition-all duration-260 ease-out-quart overflow-hidden ${
          showForm ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {showForm && (
          <CouponForm
            initialData={editingCoupon}
            saving={saving}
            serverError={serverError}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseForm}
          />
        )}
      </div>

      {/* Content area */}
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
              <p className="text-sm text-zinc-500">
                Đang tải danh sách coupon...
              </p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredCoupons.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="mb-3 rounded-full bg-zinc-100 p-3">
              <svg
                className="h-6 w-6 text-zinc-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 6h.008v.008H6V6z"
                />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-zinc-900">
              {search || activeFilter !== ""
                ? "Không tìm thấy coupon"
                : "Chưa có coupon nào"}
            </h3>
            <p className="mt-1 text-xs text-zinc-500 max-w-xs">
              {search || activeFilter !== ""
                ? "Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm."
                : "Tạo coupon đầu tiên để bắt đầu chương trình khuyến mãi."}
            </p>
            {!search && activeFilter === "" && (
              <button
                type="button"
                onClick={handleStartCreate}
                className="mt-4 rounded-lg border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-700 transition-colors duration-180 ease-out-quart hover:bg-zinc-50"
              >
                Tạo coupon đầu tiên
              </button>
            )}
          </div>
        )}

        {/* Table */}
        {!loading && filteredCoupons.length > 0 && (
          <div className="overflow-x-auto">
            <table
              className="w-full text-sm"
              role="table"
              aria-label="Danh sách coupon"
            >
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/80 text-left text-xs font-semibold uppercase tracking-[0.08em] text-zinc-500">
                  <th className="px-4 py-2.5">Mã / Tiêu đề</th>
                  <th className="px-4 py-2.5">Loại</th>
                  <th className="px-4 py-2.5">Giá trị</th>
                  <th className="px-4 py-2.5">Phạm vi</th>
                  <th className="px-4 py-2.5">Thời gian</th>
                  <th className="px-4 py-2.5 text-center">Đã dùng</th>
                  <th className="px-4 py-2.5">Trạng thái</th>
                  <th className="px-4 py-2.5 w-[100px]">
                    <span className="sr-only">Thao tác</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCoupons.map((coupon) => (
                  <CouponListRow
                    key={coupon.id}
                    coupon={coupon}
                    onEdit={handleStartEdit}
                    onToggle={handleToggle}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && filteredCoupons.length > 0 && (
        <PaginationBar
          page={page + 1}
          pageSize={PAGE_SIZE}
          totalItems={search ? filteredCoupons.length : totalElements}
          onPageChange={(p) => setPage(p - 1)}
        />
      )}

      {/* Delete confirmation modal */}
      <ConfirmationModal
        open={!!deleteTarget}
        title="Xoá coupon"
        message={
          deleteTarget
            ? `Bạn có chắc muốn xoá coupon "${deleteTarget.code}"? Hành động này sẽ vô hiệu hoá coupon (soft delete).`
            : ""
        }
        confirmText="Xoá"
        cancelText="Huỷ"
        danger
        loading={false}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

export default AdminCouponsPage;
