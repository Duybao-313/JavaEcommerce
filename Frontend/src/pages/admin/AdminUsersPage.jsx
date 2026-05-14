import { useEffect, useMemo, useState, useCallback } from "react";
import toast from "react-hot-toast";
import ConfirmationModal from "../../components/admin/ConfirmationModal";
import PaginationBar from "../../components/admin/PaginationBar";
import {
  getAdminUsers,
  getAdminUserDetail,
  updateAdminUser,
  assignUserRole,
  verifySeller,
  updateStoreStatus,
  toggleUserActive,
  deleteAdminUser,
} from "../../services/adminService";
import { normalizeText, formatDateTime } from "./adminHelpers";

const PAGE_SIZE = 20;

// ==================== Constants ====================

const ROLE_MAP = {
  ROLE_USER: {
    label: "Người dùng",
    cls: "bg-zinc-100 text-zinc-700 border-zinc-200",
  },
  ROLE_SELLER: {
    label: "Người bán",
    cls: "bg-blue-100 text-blue-700 border-blue-200",
  },
  ROLE_ADMIN: {
    label: "Quản trị viên",
    cls: "bg-red-100 text-red-700 border-red-200",
  },
};

const VERIFY_MAP = {
  PENDING: {
    label: "Chờ xét duyệt",
    cls: "bg-amber-100 text-amber-700 border-amber-200",
  },
  APPROVED: {
    label: "✓ Đã xác thực",
    cls: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  REJECTED: {
    label: "✗ Bị từ chối",
    cls: "bg-red-100 text-red-700 border-red-200",
  },
};

const STORE_STATUS_MAP = {
  ACTIVE: {
    label: "Hoạt động",
    cls: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  SUSPENDED: {
    label: "Tạm khóa",
    cls: "bg-red-100 text-red-700 border-red-200",
  },
};

const SORT_OPTIONS = [
  { value: "createdAt", label: "Ngày tạo" },
  { value: "username", label: "Tên đăng nhập" },
  { value: "email", label: "Email" },
  { value: "fullName", label: "Họ tên" },
  { value: "storeRating", label: "Đánh giá" },
];

const TABS = [
  { key: "basic", label: "Thông tin cơ bản" },
  { key: "seller", label: "Người bán" },
  { key: "verification", label: "Xác thực & Trạng thái" },
  { key: "actions", label: "Hành động" },
];

const EMPTY_FORM = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  avatarUrl: "",
  storeName: "",
  storeLogo: "",
  storeBanner: "",
  storeAddress: "",
  bankAccount: "",
  bankName: "",
};

// ==================== Component ====================

function AdminUsersPage() {
  // --- State ---
  const [users, setUsers] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);

  // Detail modal
  const [detailUser, setDetailUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [form, setForm] = useState(EMPTY_FORM);

  // Confirmations
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [roleChangeTarget, setRoleChangeTarget] = useState(null);
  const [toggleActiveTarget, setToggleActiveTarget] = useState(null);

  // --- Load users ---
  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size: PAGE_SIZE,
        sortBy,
        sortDir,
      };
      if (search.trim()) params.search = search.trim();
      if (roleFilter) params.role = roleFilter;
      if (activeFilter !== "" && activeFilter !== null) {
        params.isActive = activeFilter === "true";
      }

      const data = await getAdminUsers(params);
      setUsers(data?.content || []);
      setTotalElements(data?.totalElements || 0);
      setTotalPages(data?.totalPages || 0);
    } catch (err) {
      toast.error(err?.message || "Tải danh sách người dùng thất bại");
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, activeFilter, sortBy, sortDir]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [search, roleFilter, activeFilter]);

  // --- Open detail modal ---
  const openDetail = async (userId) => {
    setDetailLoading(true);
    setShowModal(true);
    setActiveTab("basic");
    try {
      const user = await getAdminUserDetail(userId);
      setDetailUser(user);
      setForm({
        fullName: user?.fullName || "",
        email: user?.email || "",
        phone: user?.phone || "",
        address: user?.address || "",
        avatarUrl: user?.avatarUrl || "",
        storeName: user?.storeName || "",
        storeLogo: user?.storeLogo || "",
        storeBanner: user?.storeBanner || "",
        storeAddress: user?.storeAddress || "",
        bankAccount: user?.bankAccount || "",
        bankName: user?.bankName || "",
      });
    } catch (err) {
      toast.error(err?.message || "Tải thông tin người dùng thất bại");
      setShowModal(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setDetailUser(null);
    setForm(EMPTY_FORM);
    setActiveTab("basic");
  };

  // --- Save basic/seller info ---
  const handleSaveDetail = async () => {
    if (!detailUser) return;
    setSaving(true);
    try {
      const body = {};
      if (form.fullName !== (detailUser.fullName || ""))
        body.fullName = form.fullName;
      if (form.email !== (detailUser.email || "")) body.email = form.email;
      if (form.phone !== (detailUser.phone || "")) body.phone = form.phone;
      if (form.address !== (detailUser.address || ""))
        body.address = form.address;
      if (form.avatarUrl !== (detailUser.avatarUrl || ""))
        body.avatarUrl = form.avatarUrl;

      if (detailUser.role === "ROLE_SELLER") {
        if (form.storeName !== (detailUser.storeName || ""))
          body.storeName = form.storeName;
        if (form.storeLogo !== (detailUser.storeLogo || ""))
          body.storeLogo = form.storeLogo;
        if (form.storeBanner !== (detailUser.storeBanner || ""))
          body.storeBanner = form.storeBanner;
        if (form.storeAddress !== (detailUser.storeAddress || ""))
          body.storeAddress = form.storeAddress;
        if (form.bankAccount !== (detailUser.bankAccount || ""))
          body.bankAccount = form.bankAccount;
        if (form.bankName !== (detailUser.bankName || ""))
          body.bankName = form.bankName;
      }

      if (Object.keys(body).length === 0) {
        toast("Không có thay đổi nào");
        setSaving(false);
        return;
      }

      const updated = await updateAdminUser(detailUser.id, body);
      setDetailUser(updated);
      toast.success("Cập nhật người dùng thành công");
      loadUsers();
    } catch (err) {
      toast.error(err?.message || "Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  // --- Role change ---
  const handleRoleChange = async () => {
    if (!roleChangeTarget) return;
    setSaving(true);
    try {
      const { userId, newRole } = roleChangeTarget;
      const updated = await assignUserRole(userId, newRole);
      if (detailUser?.id === userId) setDetailUser(updated);
      toast.success(
        newRole === "ROLE_SELLER"
          ? "Nâng cấp người dùng thành người bán thành công"
          : newRole === "ROLE_USER"
            ? "Hạ cấp xuống người dùng thành công"
            : "Thay đổi vai trò thành công",
      );
      setRoleChangeTarget(null);
      loadUsers();
    } catch (err) {
      toast.error(err?.message || "Thay đổi vai trò thất bại");
    } finally {
      setSaving(false);
    }
  };

  // --- Verify seller ---
  const handleVerifySeller = async (status) => {
    if (!detailUser) return;
    setSaving(true);
    try {
      const updated = await verifySeller(detailUser.id, status);
      setDetailUser(updated);
      toast.success(
        status === "APPROVED"
          ? "Xác thực người bán thành công"
          : "Từ chối xác thực người bán",
      );
      loadUsers();
    } catch (err) {
      toast.error(err?.message || "Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  // --- Store status ---
  const handleStoreStatus = async (status) => {
    if (!detailUser) return;
    setSaving(true);
    try {
      const updated = await updateStoreStatus(detailUser.id, status);
      setDetailUser(updated);
      toast.success(
        status === "ACTIVE"
          ? "Cửa hàng đã được kích hoạt"
          : "Cửa hàng đã bị tạm khóa",
      );
      loadUsers();
    } catch (err) {
      toast.error(err?.message || "Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  // --- Toggle active ---
  const handleToggleActive = async () => {
    if (!toggleActiveTarget) return;
    setSaving(true);
    try {
      const { userId, isActive } = toggleActiveTarget;
      const updated = await toggleUserActive(userId, isActive);
      if (detailUser?.id === userId) setDetailUser(updated);
      toast.success(
        isActive ? "Đã kích hoạt tài khoản" : "Đã tạm khóa tài khoản",
      );
      setToggleActiveTarget(null);
      loadUsers();
    } catch (err) {
      toast.error(err?.message || "Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  // --- Delete user ---
  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await deleteAdminUser(deleteTarget);
      toast.success("Đã xóa người dùng");
      setDeleteTarget(null);
      if (detailUser?.id === deleteTarget) closeModal();
      loadUsers();
    } catch (err) {
      toast.error(err?.message || "Xóa người dùng thất bại");
    } finally {
      setSaving(false);
    }
  };

  // --- Helpers ---
  const roleBadge = (role) => {
    const r = ROLE_MAP[role] || {
      label: role,
      cls: "bg-zinc-100 text-zinc-600 border-zinc-200",
    };
    return (
      <span
        className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${r.cls}`}
      >
        {r.label}
      </span>
    );
  };

  const verifyBadge = (status) => {
    if (!status) return <span className="text-xs text-zinc-400">-</span>;
    const v = VERIFY_MAP[status] || {
      label: status,
      cls: "bg-zinc-100 text-zinc-600 border-zinc-200",
    };
    return (
      <span
        className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${v.cls}`}
      >
        {v.label}
      </span>
    );
  };

  const storeStatusBadge = (status) => {
    if (!status) return <span className="text-xs text-zinc-400">-</span>;
    const s = STORE_STATUS_MAP[status] || {
      label: status,
      cls: "bg-zinc-100 text-zinc-600 border-zinc-200",
    };
    return (
      <span
        className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${s.cls}`}
      >
        {s.label}
      </span>
    );
  };

  const renderStars = (rating) => {
    if (!rating && rating !== 0)
      return <span className="text-xs text-zinc-400">-</span>;
    const r = Number(rating);
    const full = Math.floor(r);
    const half = r - full >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    return (
      <span className="inline-flex items-center gap-0.5 text-amber-500">
        {Array.from({ length: full }, (_, i) => (
          <svg
            key={`f${i}`}
            className="h-3.5 w-3.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        {half && (
          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
            <defs>
              <linearGradient id="halfStar">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="#D1D5DB" />
              </linearGradient>
            </defs>
            <path
              fill="url(#halfStar)"
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
            />
          </svg>
        )}
        {Array.from({ length: empty }, (_, i) => (
          <svg
            key={`e${i}`}
            className="h-3.5 w-3.5 text-zinc-300"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-1 text-xs text-zinc-500">{r.toFixed(1)}</span>
      </span>
    );
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // --- Derived ---
  const isSeller = detailUser?.role === "ROLE_SELLER";

  return (
    <section>
      {/* ========== Header ========== */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Người dùng</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {totalElements} tài khoản
          </p>
        </div>
      </div>

      {/* ========== Search & Filter Bar ========== */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Tìm theo tên, email, điện thoại..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 py-2 pl-10 pr-8 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Role filter */}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-lg border border-zinc-300 py-2 pl-3 pr-8 text-sm focus:border-zinc-900 focus:outline-none"
        >
          <option value="">Tất cả vai trò</option>
          <option value="ROLE_USER">Người dùng</option>
          <option value="ROLE_SELLER">Người bán</option>
          <option value="ROLE_ADMIN">Quản trị viên</option>
        </select>

        {/* Active filter */}
        <select
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value)}
          className="rounded-lg border border-zinc-300 py-2 pl-3 pr-8 text-sm focus:border-zinc-900 focus:outline-none"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="true">Kích hoạt</option>
          <option value="false">Tạm khóa</option>
        </select>

        {/* Sort */}
        <select
          value={`${sortBy}-${sortDir}`}
          onChange={(e) => {
            const [by, dir] = e.target.value.split("-");
            setSortBy(by);
            setSortDir(dir);
          }}
          className="rounded-lg border border-zinc-300 py-2 pl-3 pr-8 text-sm focus:border-zinc-900 focus:outline-none"
        >
          {SORT_OPTIONS.flatMap((opt) => [
            <option key={`${opt.value}-desc`} value={`${opt.value}-desc`}>
              {opt.label} ↓
            </option>,
            <option key={`${opt.value}-asc`} value={`${opt.value}-asc`}>
              {opt.label} ↑
            </option>,
          ])}
        </select>

        {/* Refresh */}
        <button
          onClick={loadUsers}
          disabled={loading}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50 disabled:opacity-50"
          title="Làm mới"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {/* ========== Loading State ========== */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900" />
          <span className="ml-3 text-sm text-zinc-500">Đang tải...</span>
        </div>
      )}

      {/* ========== Empty State ========== */}
      {!loading && users.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
          <svg
            className="mb-3 h-12 w-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <p className="text-sm">Không tìm thấy người dùng nào</p>
        </div>
      )}

      {/* ========== Desktop Table ========== */}
      {!loading && users.length > 0 && (
        <>
          <div className="hidden overflow-x-auto rounded-xl border border-zinc-200 bg-white lg:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Người dùng</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Vai trò</th>
                  <th className="px-4 py-3">Kích hoạt</th>
                  <th className="px-4 py-3">Người bán</th>
                  <th className="px-4 py-3">Xác thực</th>
                  <th className="px-4 py-3">Đánh giá</th>
                  <th className="px-4 py-3">Ngày tạo</th>
                  <th className="px-4 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="transition-colors hover:bg-zinc-50"
                  >
                    {/* User info */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.username}
                            className="h-9 w-9 rounded-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-200 text-xs font-semibold text-zinc-600">
                            {getInitials(user.fullName || user.username)}
                          </span>
                        )}
                        <div>
                          <button
                            onClick={() => openDetail(user.id)}
                            className="font-medium text-zinc-900 hover:text-blue-600 hover:underline"
                          >
                            {user.username}
                          </button>
                          <p className="text-xs text-zinc-500">
                            {user.fullName || "-"}
                          </p>
                        </div>
                      </div>
                    </td>
                    {/* Email */}
                    <td className="max-w-[180px] truncate px-4 py-3 text-zinc-600">
                      {user.email}
                    </td>
                    {/* Role */}
                    <td className="px-4 py-3">{roleBadge(user.role)}</td>
                    {/* Active */}
                    <td className="px-4 py-3">
                      {user.isActive ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                          <svg
                            className="h-4 w-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Kích hoạt
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600">
                          <svg
                            className="h-4 w-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Tạm khóa
                        </span>
                      )}
                    </td>
                    {/* Seller status */}
                    <td className="px-4 py-3">
                      {user.role === "ROLE_SELLER" ? (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-zinc-700">
                            {user.storeName || "-"}
                          </p>
                          {storeStatusBadge(user.storeStatus)}
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-400">-</span>
                      )}
                    </td>
                    {/* Verification */}
                    <td className="px-4 py-3">
                      {user.role === "ROLE_SELLER" ? (
                        verifyBadge(user.sellerVerified)
                      ) : (
                        <div className="flex items-center gap-1 text-xs">
                          {user.emailVerified ? (
                            <span
                              className="text-emerald-600"
                              title="Email đã xác thực"
                            >
                              ✓ Email
                            </span>
                          ) : (
                            <span
                              className="text-zinc-400"
                              title="Email chưa xác thực"
                            >
                              ✗ Email
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    {/* Rating */}
                    <td className="px-4 py-3">
                      {user.role === "ROLE_SELLER" ? (
                        renderStars(user.storeRating)
                      ) : (
                        <span className="text-xs text-zinc-400">-</span>
                      )}
                    </td>
                    {/* Created */}
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-zinc-500">
                      {formatDateTime(user.createdAt)}
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openDetail(user.id)}
                          className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100"
                          title="Xem chi tiết"
                        >
                          Xem
                        </button>
                        {user.role !== "ROLE_ADMIN" && (
                          <button
                            onClick={() => setDeleteTarget(user.id)}
                            className="rounded-lg px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                            title="Xóa"
                          >
                            Xóa
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ========== Mobile Cards ========== */}
          <div className="space-y-3 lg:hidden">
            {users.map((user) => (
              <div
                key={user.id}
                className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.username}
                      className="h-10 w-10 rounded-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-xs font-semibold text-zinc-600">
                      {getInitials(user.fullName || user.username)}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openDetail(user.id)}
                        className="font-semibold text-zinc-900 hover:text-blue-600"
                      >
                        {user.username}
                      </button>
                      {roleBadge(user.role)}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-zinc-500">
                      {user.email}
                    </p>
                    {user.fullName && (
                      <p className="text-xs text-zinc-600">{user.fullName}</p>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                  <span
                    className={
                      user.isActive ? "text-emerald-600" : "text-red-600"
                    }
                  >
                    {user.isActive ? "✓ Kích hoạt" : "✗ Tạm khóa"}
                  </span>
                  {user.role === "ROLE_SELLER" && (
                    <>
                      {verifyBadge(user.sellerVerified)}
                      {storeStatusBadge(user.storeStatus)}
                      <span>{renderStars(user.storeRating)}</span>
                    </>
                  )}
                  {user.role !== "ROLE_SELLER" && (
                    <span
                      className={
                        user.emailVerified
                          ? "text-emerald-600"
                          : "text-zinc-400"
                      }
                    >
                      {user.emailVerified ? "✓ Email" : "✗ Email"}
                    </span>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3">
                  <span className="text-xs text-zinc-400">
                    {formatDateTime(user.createdAt)}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openDetail(user.id)}
                      className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700"
                    >
                      Chi tiết
                    </button>
                    {user.role !== "ROLE_ADMIN" && (
                      <button
                        onClick={() => setDeleteTarget(user.id)}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ========== Pagination ========== */}
      {!loading && totalElements > 0 && (
        <PaginationBar
          page={page}
          pageSize={PAGE_SIZE}
          totalItems={totalElements}
          onPageChange={setPage}
        />
      )}

      {/* ========== Detail Modal ========== */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-zinc-900/50 p-4 pt-10"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
          role="dialog"
          aria-label="Chi tiết người dùng"
        >
          <div className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-zinc-900">
                Chi tiết người dùng
              </h2>
              <button
                onClick={closeModal}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                aria-label="Đóng"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {detailLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900" />
              </div>
            ) : detailUser ? (
              <>
                {/* User summary bar */}
                <div className="flex items-center gap-4 border-b border-zinc-100 px-6 py-4">
                  {detailUser.avatarUrl ? (
                    <img
                      src={detailUser.avatarUrl}
                      alt={detailUser.username}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-200 text-sm font-semibold text-zinc-600">
                      {getInitials(detailUser.fullName || detailUser.username)}
                    </span>
                  )}
                  <div>
                    <p className="font-semibold text-zinc-900">
                      {detailUser.username}
                    </p>
                    <p className="text-sm text-zinc-500">{detailUser.email}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    {roleBadge(detailUser.role)}
                    {detailUser.isActive ? (
                      <span className="text-xs font-medium text-emerald-600">
                        ✓ Kích hoạt
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-red-600">
                        ✗ Tạm khóa
                      </span>
                    )}
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-zinc-200 px-6">
                  <nav
                    className="-mb-px flex gap-4 overflow-x-auto"
                    role="tablist"
                  >
                    {TABS.map((tab) => (
                      <button
                        key={tab.key}
                        role="tab"
                        aria-selected={activeTab === tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                          activeTab === tab.key
                            ? "border-zinc-900 text-zinc-900"
                            : "border-transparent text-zinc-500 hover:text-zinc-700"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="max-h-[55vh] overflow-y-auto px-6 py-5">
                  {/* TAB 1: Basic Info */}
                  {activeTab === "basic" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-medium text-zinc-500">
                            Họ tên
                          </label>
                          <input
                            type="text"
                            value={form.fullName}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                fullName: e.target.value,
                              }))
                            }
                            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-zinc-500">
                            Email
                          </label>
                          <input
                            type="email"
                            value={form.email}
                            onChange={(e) =>
                              setForm((f) => ({ ...f, email: e.target.value }))
                            }
                            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-zinc-500">
                            Số điện thoại
                          </label>
                          <input
                            type="text"
                            value={form.phone}
                            onChange={(e) =>
                              setForm((f) => ({ ...f, phone: e.target.value }))
                            }
                            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-zinc-500">
                            URL ảnh đại diện
                          </label>
                          <input
                            type="text"
                            value={form.avatarUrl}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                avatarUrl: e.target.value,
                              }))
                            }
                            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-zinc-500">
                          Địa chỉ
                        </label>
                        <input
                          type="text"
                          value={form.address}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, address: e.target.value }))
                          }
                          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-zinc-500">
                            Ngày tạo
                          </label>
                          <p className="mt-1 text-sm text-zinc-700">
                            {formatDateTime(detailUser.createdAt)}
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-zinc-500">
                            Cập nhật lần cuối
                          </label>
                          <p className="mt-1 text-sm text-zinc-700">
                            {formatDateTime(detailUser.updatedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: Seller Info */}
                  {activeTab === "seller" && (
                    <div className="space-y-4">
                      {isSeller ? (
                        <>
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                              <label className="block text-xs font-medium text-zinc-500">
                                Tên cửa hàng
                              </label>
                              <input
                                type="text"
                                value={form.storeName}
                                onChange={(e) =>
                                  setForm((f) => ({
                                    ...f,
                                    storeName: e.target.value,
                                  }))
                                }
                                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-zinc-500">
                                Địa chỉ cửa hàng
                              </label>
                              <input
                                type="text"
                                value={form.storeAddress}
                                onChange={(e) =>
                                  setForm((f) => ({
                                    ...f,
                                    storeAddress: e.target.value,
                                  }))
                                }
                                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-zinc-500">
                                Logo cửa hàng (URL)
                              </label>
                              <input
                                type="text"
                                value={form.storeLogo}
                                onChange={(e) =>
                                  setForm((f) => ({
                                    ...f,
                                    storeLogo: e.target.value,
                                  }))
                                }
                                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                                placeholder="https://..."
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-zinc-500">
                                Banner cửa hàng (URL)
                              </label>
                              <input
                                type="text"
                                value={form.storeBanner}
                                onChange={(e) =>
                                  setForm((f) => ({
                                    ...f,
                                    storeBanner: e.target.value,
                                  }))
                                }
                                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                                placeholder="https://..."
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-zinc-500">
                                Tài khoản ngân hàng
                              </label>
                              <input
                                type="text"
                                value={form.bankAccount}
                                onChange={(e) =>
                                  setForm((f) => ({
                                    ...f,
                                    bankAccount: e.target.value,
                                  }))
                                }
                                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-zinc-500">
                                Tên ngân hàng
                              </label>
                              <input
                                type="text"
                                value={form.bankName}
                                onChange={(e) =>
                                  setForm((f) => ({
                                    ...f,
                                    bankName: e.target.value,
                                  }))
                                }
                                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 rounded-lg bg-zinc-50 p-4">
                            <div>
                              <label className="block text-xs font-medium text-zinc-500">
                                Đánh giá
                              </label>
                              <p className="mt-1">
                                {renderStars(detailUser.storeRating)}
                              </p>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-zinc-500">
                                Tổng bán hàng
                              </label>
                              <p className="mt-1 text-sm font-semibold text-zinc-900">
                                {detailUser.totalSales || 0}
                              </p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="py-8 text-center text-sm text-zinc-400">
                          <svg
                            className="mx-auto mb-3 h-10 w-10"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                          <p>Người dùng này không phải là người bán.</p>
                          <p className="mt-1">
                            Sử dụng tab "Hành động" để nâng cấp lên Người bán.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: Verification & Status */}
                  {activeTab === "verification" && (
                    <div className="space-y-5">
                      {/* Verification flags */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-lg border border-zinc-200 p-4">
                          <p className="text-xs font-medium text-zinc-500">
                            Email xác thực
                          </p>
                          <p
                            className={`mt-1 text-sm font-semibold ${detailUser.emailVerified ? "text-emerald-600" : "text-red-600"}`}
                          >
                            {detailUser.emailVerified
                              ? "✓ Đã xác thực"
                              : "✗ Chưa xác thực"}
                          </p>
                        </div>
                        <div className="rounded-lg border border-zinc-200 p-4">
                          <p className="text-xs font-medium text-zinc-500">
                            SĐT xác thực
                          </p>
                          <p
                            className={`mt-1 text-sm font-semibold ${detailUser.phoneVerified ? "text-emerald-600" : "text-red-600"}`}
                          >
                            {detailUser.phoneVerified
                              ? "✓ Đã xác thực"
                              : "✗ Chưa xác thực"}
                          </p>
                        </div>
                      </div>

                      {/* Seller verification (only for sellers) */}
                      {isSeller && (
                        <div className="rounded-lg border border-zinc-200 p-4">
                          <p className="text-xs font-medium text-zinc-500">
                            Xác thực người bán
                          </p>
                          <div className="mt-2 flex items-center gap-3">
                            {verifyBadge(detailUser.sellerVerified)}
                            <select
                              value={detailUser.sellerVerified || ""}
                              onChange={(e) => {
                                if (e.target.value)
                                  handleVerifySeller(e.target.value);
                              }}
                              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm focus:border-zinc-900 focus:outline-none"
                            >
                              <option value="">Thay đổi...</option>
                              <option value="PENDING">Chờ xét duyệt</option>
                              <option value="APPROVED">Phê duyệt</option>
                              <option value="REJECTED">Từ chối</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {/* Store status (only for sellers) */}
                      {isSeller && (
                        <div className="rounded-lg border border-zinc-200 p-4">
                          <p className="text-xs font-medium text-zinc-500">
                            Trạng thái cửa hàng
                          </p>
                          <div className="mt-2 flex items-center gap-3">
                            {storeStatusBadge(detailUser.storeStatus)}
                            <select
                              value={detailUser.storeStatus || ""}
                              onChange={(e) => {
                                if (e.target.value)
                                  handleStoreStatus(e.target.value);
                              }}
                              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm focus:border-zinc-900 focus:outline-none"
                            >
                              <option value="">Thay đổi...</option>
                              <option value="ACTIVE">Kích hoạt</option>
                              <option value="SUSPENDED">Tạm khóa</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {/* Account active toggle */}
                      <div className="rounded-lg border border-zinc-200 p-4">
                        <p className="text-xs font-medium text-zinc-500">
                          Trạng thái tài khoản
                        </p>
                        <div className="mt-2 flex items-center gap-3">
                          <span
                            className={`text-sm font-semibold ${detailUser.isActive ? "text-emerald-600" : "text-red-600"}`}
                          >
                            {detailUser.isActive
                              ? "✓ Đang kích hoạt"
                              : "✗ Đang tạm khóa"}
                          </span>
                          <button
                            onClick={() =>
                              setToggleActiveTarget({
                                userId: detailUser.id,
                                isActive: !detailUser.isActive,
                              })
                            }
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium text-white ${
                              detailUser.isActive
                                ? "bg-red-600 hover:bg-red-700"
                                : "bg-emerald-600 hover:bg-emerald-700"
                            }`}
                          >
                            {detailUser.isActive ? "Tạm khóa" : "Kích hoạt"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: Actions */}
                  {activeTab === "actions" && (
                    <div className="space-y-5">
                      {/* Change role */}
                      <div className="rounded-lg border border-zinc-200 p-4">
                        <p className="text-xs font-medium text-zinc-500">
                          Thay đổi vai trò
                        </p>
                        <p className="mt-1 text-sm text-zinc-600">
                          Vai trò hiện tại:{" "}
                          {ROLE_MAP[detailUser.role]?.label || detailUser.role}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          {["ROLE_USER", "ROLE_SELLER", "ROLE_ADMIN"].map(
                            (role) => {
                              if (role === detailUser.role) return null;
                              // Prevent downgrading other admins
                              if (
                                detailUser.role === "ROLE_ADMIN" &&
                                role !== "ROLE_ADMIN"
                              )
                                return null;
                              return (
                                <button
                                  key={role}
                                  onClick={() =>
                                    setRoleChangeTarget({
                                      userId: detailUser.id,
                                      newRole: role,
                                    })
                                  }
                                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                                    ROLE_MAP[role]?.cls ||
                                    "border-zinc-300 text-zinc-700"
                                  } hover:opacity-80`}
                                >
                                  Đổi sang {ROLE_MAP[role]?.label || role}
                                </button>
                              );
                            },
                          )}
                        </div>
                      </div>

                      {/* Danger zone */}
                      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                        <p className="text-xs font-semibold text-red-700">
                          Vùng nguy hiểm
                        </p>
                        <p className="mt-1 text-xs text-red-600">
                          Các hành động dưới đây không thể hoàn tác. Hãy cẩn
                          thận.
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            onClick={() =>
                              setToggleActiveTarget({
                                userId: detailUser.id,
                                isActive: !detailUser.isActive,
                              })
                            }
                            className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                          >
                            {detailUser.isActive
                              ? "🚫 Tạm khóa tài khoản"
                              : "✅ Kích hoạt tài khoản"}
                          </button>
                          {detailUser.role !== "ROLE_ADMIN" && (
                            <button
                              onClick={() => setDeleteTarget(detailUser.id)}
                              className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                            >
                              🗑️ Xóa người dùng
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-between border-t border-zinc-200 px-6 py-4">
                  <button
                    onClick={closeModal}
                    className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                  >
                    Đóng
                  </button>
                  {(activeTab === "basic" || activeTab === "seller") && (
                    <button
                      onClick={handleSaveDetail}
                      disabled={saving}
                      className="rounded-lg bg-zinc-900 px-5 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
                    >
                      {saving ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* ========== Confirmation Modals ========== */}

      {/* Delete confirmation */}
      <ConfirmationModal
        open={!!deleteTarget}
        title="Xóa người dùng"
        message="Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        danger
        loading={saving}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteUser}
      />

      {/* Role change confirmation */}
      <ConfirmationModal
        open={!!roleChangeTarget}
        title="Thay đổi vai trò"
        message={
          roleChangeTarget
            ? `Bạn có chắc muốn đổi vai trò của người dùng này thành "${ROLE_MAP[roleChangeTarget.newRole]?.label || roleChangeTarget.newRole}"?`
            : ""
        }
        confirmText="Xác nhận"
        loading={saving}
        onCancel={() => setRoleChangeTarget(null)}
        onConfirm={handleRoleChange}
      />

      {/* Toggle active confirmation */}
      <ConfirmationModal
        open={!!toggleActiveTarget}
        title={
          toggleActiveTarget?.isActive
            ? "Kích hoạt tài khoản"
            : "Tạm khóa tài khoản"
        }
        message={
          toggleActiveTarget?.isActive
            ? "Bạn có chắc muốn kích hoạt tài khoản này?"
            : "Bạn có chắc muốn tạm khóa tài khoản này? Người dùng sẽ không thể đăng nhập."
        }
        confirmText="Xác nhận"
        danger={!toggleActiveTarget?.isActive}
        loading={saving}
        onCancel={() => setToggleActiveTarget(null)}
        onConfirm={handleToggleActive}
      />
    </section>
  );
}

export default AdminUsersPage;
