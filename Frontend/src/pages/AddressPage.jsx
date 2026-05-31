import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "motion/react";
import {
  getMyAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../services/addressService";

const ADDRESS_TYPE_LABELS = {
  HOME: "Nhà riêng",
  OFFICE: "Văn phòng",
  OTHER: "Khác",
};

const ADDRESS_TYPE_ICONS = {
  HOME: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  OFFICE: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <rect x="6" y="12" width="3" height="2" />
      <rect x="11" y="12" width="3" height="2" />
      <rect x="16" y="12" width="3" height="2" />
    </svg>
  ),
  OTHER: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
};

const INITIAL_FORM = {
  recipientName: "",
  phone: "",
  detail: "",
  type: "HOME",
  isDefault: false,
};

/* ── Skeleton ─────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-zinc-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-2.5 flex-1">
          <div className="h-4 w-32 rounded bg-zinc-200" />
          <div className="h-3 w-24 rounded bg-zinc-100" />
          <div className="h-3 w-48 rounded bg-zinc-100" />
        </div>
        <div className="flex gap-2">
          <div className="h-7 w-14 rounded-lg bg-zinc-200" />
          <div className="h-7 w-14 rounded-lg bg-zinc-200" />
        </div>
      </div>
    </div>
  );
}

/* ── Address Form Modal ────────────────────────── */
function AddressFormModal({ isOpen, onClose, onSave, editing, maxReached }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      setForm({
        recipientName: editing.recipientName || "",
        phone: editing.phone || "",
        detail: editing.detail || "",
        type: editing.type || "HOME",
        isDefault: editing.isDefault || false,
      });
    } else {
      setForm({ ...INITIAL_FORM, isDefault: maxReached ? false : INITIAL_FORM.isDefault });
    }
  }, [editing, isOpen, maxReached]);

  const handleChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: inputType === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.recipientName.trim() || !form.phone.trim() || !form.detail.trim()) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (!/^[0-9]{10,11}$/.test(form.phone.trim())) {
      toast.error("Số điện thoại không hợp lệ (10-11 số)");
      return;
    }
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      toast.error(err?.message || "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-zinc-900">
              {editing ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}
            </h3>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm text-zinc-700">
              Người nhận
              <input
                name="recipientName"
                value={form.recipientName}
                onChange={handleChange}
                placeholder="Nguyễn Văn A"
                className="mt-1 min-h-[44px] w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900"
                required
              />
            </label>

            <label className="block text-sm text-zinc-700">
              Số điện thoại
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="0912345678"
                className="mt-1 min-h-[44px] w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900"
                required
              />
            </label>

            <label className="block text-sm text-zinc-700">
              Địa chỉ chi tiết
              <input
                name="detail"
                value={form.detail}
                onChange={handleChange}
                placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành"
                className="mt-1 min-h-[44px] w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900"
                required
              />
            </label>

            <label className="block text-sm text-zinc-700">
              Loại địa chỉ
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="mt-1 min-h-[44px] w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900"
              >
                {Object.entries(ADDRESS_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-2 text-sm text-zinc-700 cursor-pointer">
              <input
                type="checkbox"
                name="isDefault"
                checked={form.isDefault}
                onChange={handleChange}
                className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
              />
              Đặt làm địa chỉ mặc định
            </label>

            <button
              type="submit"
              disabled={saving}
              className="w-full min-h-[44px] rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 disabled:bg-zinc-400 disabled:cursor-not-allowed"
            >
              {saving ? "Đang lưu..." : editing ? "Cập nhật" : "Thêm địa chỉ"}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ── Main Page ────────────────────────────────── */
export default function AddressPage() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchAddresses = useCallback(async () => {
    try {
      const data = await getMyAddresses();
      setAddresses(data);
    } catch {
      toast.error("Không thể tải danh sách địa chỉ");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleSave = async (form) => {
    if (editingAddress) {
      await updateAddress(editingAddress.id, form);
      toast.success("Đã cập nhật địa chỉ");
    } else {
      await createAddress(form);
      toast.success("Đã thêm địa chỉ mới");
    }
    await fetchAddresses();
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteAddress(deleteConfirm.id);
      toast.success("Đã xóa địa chỉ");
      setDeleteConfirm(null);
      await fetchAddresses();
    } catch (err) {
      toast.error(err?.message || "Không thể xóa địa chỉ");
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await setDefaultAddress(id);
      toast.success("Đã đặt làm địa chỉ mặc định");
      await fetchAddresses();
    } catch (err) {
      toast.error(err?.message || "Không thể cập nhật");
    }
  };

  const openEdit = (addr) => {
    setEditingAddress(addr);
    setModalOpen(true);
  };

  const openAdd = () => {
    setEditingAddress(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingAddress(null);
  };

  const maxReached = addresses.length >= 10;

  /* ── Empty State ─────────────────────────────── */
  if (!loading && addresses.length === 0) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#f7f7f4_0%,#f4f4ef_45%,#ffffff_100%)] px-6 py-10">
        <div className="mx-auto w-full max-w-2xl">
          <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                SplitGo
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
                Sổ địa chỉ
              </h1>
            </div>
            <Link
              to="/me"
              className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-800 hover:border-zinc-900"
            >
              Tài khoản
            </Link>
          </header>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center rounded-3xl border border-zinc-200 bg-white px-4 py-20 text-center shadow-sm"
          >
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-amber-50">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-300">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-zinc-800">
              Chưa có địa chỉ nào
            </h2>
            <p className="mt-2 max-w-sm text-sm text-zinc-500">
              Thêm địa chỉ giao hàng để thanh toán nhanh hơn.
            </p>
            <button
              onClick={openAdd}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-700"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Thêm địa chỉ
            </button>
          </motion.div>

          <AddressFormModal
            isOpen={modalOpen}
            onClose={closeModal}
            onSave={handleSave}
            editing={editingAddress}
            maxReached={maxReached}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f7f4_0%,#f4f4ef_45%,#ffffff_100%)] px-6 py-10">
      <div className="mx-auto w-full max-w-2xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              SplitGo
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
              Sổ địa chỉ
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              {addresses.length}/10 địa chỉ
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/me"
              className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-800 hover:border-zinc-900"
            >
              Tài khoản
            </Link>
            {!maxReached && (
              <button
                onClick={openAdd}
                className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-zinc-700"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Thêm
              </button>
            )}
          </div>
        </header>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr) => (
              <motion.div
                key={addr.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`rounded-2xl border bg-white p-5 shadow-sm transition-colors ${
                  addr.isDefault
                    ? "border-amber-300 ring-1 ring-amber-200"
                    : "border-zinc-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-zinc-900 truncate">
                        {addr.recipientName}
                      </span>
                      <span className="text-sm text-zinc-500 tabular-nums">
                        {addr.phone}
                      </span>
                      {addr.isDefault && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-700">
                          Mặc định
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-sm text-zinc-500">
                      <span className="text-zinc-400">
                        {ADDRESS_TYPE_ICONS[addr.type] || ADDRESS_TYPE_ICONS.OTHER}
                      </span>
                      <span>{ADDRESS_TYPE_LABELS[addr.type] || addr.type}</span>
                    </div>
                    <p className="mt-1 text-sm text-zinc-600 break-words">
                      {addr.detail}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {!addr.isDefault && (
                      <button
                        onClick={() => handleSetDefault(addr.id)}
                        className="rounded-lg p-1.5 text-zinc-400 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                        title="Đặt làm mặc định"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => openEdit(addr)}
                      className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
                      title="Sửa"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(addr)}
                      className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                      title="Xóa"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <AddressFormModal
          isOpen={modalOpen}
          onClose={closeModal}
          onSave={handleSave}
          editing={editingAddress}
          maxReached={maxReached}
        />

        {/* ── Delete Confirmation Modal ─────────── */}
        <AnimatePresence>
          {deleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
              onClick={() => setDeleteConfirm(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl text-center"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-red-500">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-zinc-900">Xóa địa chỉ?</h3>
                <p className="mt-2 text-sm text-zinc-500">
                  Bạn có chắc muốn xóa địa chỉ của{" "}
                  <strong>{deleteConfirm.recipientName}</strong>?
                </p>
                <div className="mt-5 flex gap-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 min-h-[44px] rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 min-h-[44px] rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 transition-colors"
                  >
                    Xóa
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
