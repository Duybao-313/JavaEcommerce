import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Facehash } from "facehash";
import { getFacehashProps } from "../utils/facehashTheme";
import {
  getCurrentUserDetail,
  updateCurrentUser,
} from "../services/authService";
import { uploadImage } from "../services/uploadService";

/* ─── Constants ─── */

const STATUS_BADGE = {
  ACTIVE: { label: "Đang hoạt động", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  SUSPENDED: { label: "Tạm khóa", cls: "bg-red-50 text-red-700 border-red-200" },
  APPROVED: { label: "Đã xác thực", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  PENDING: { label: "Chờ xác thực", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  REJECTED: { label: "Từ chối", cls: "bg-red-50 text-red-700 border-red-200" },
};

const VERIFIED_LABEL = { APPROVED: "Đã xác thực", PENDING: "Chờ xác thực", REJECTED: "Từ chối" };
const STORE_LABEL = { ACTIVE: "Đang hoạt động", SUSPENDED: "Tạm khóa" };

/* ─── Helpers ─── */

function formatPrice(v) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(v || 0);
}

/* ─── Sub-components ─── */

function InfoCard({ label, value, children }) {
  return (
    <div className="group rounded-2xl bg-zinc-50 px-5 py-4 transition-colors hover:bg-zinc-100">
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </p>
      {children ? (
        <div className="mt-1.5">{children}</div>
      ) : (
        <p className="mt-1.5 break-words text-sm font-medium text-zinc-800">
          {value ?? <span className="italic text-zinc-400">Chưa có</span>}
        </p>
      )}
    </div>
  );
}

function StatusDot({ label, ok, description }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 ring-1 ring-zinc-200/80">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm ${
          ok ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
        }`}
      >
        {ok ? "✓" : "⏳"}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-zinc-800">{label}</p>
        <p className="text-xs text-zinc-500">{description}</p>
      </div>
      <span
        className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
          ok ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
        }`}
      >
        {ok ? "Đã xác thực" : "Chưa xác thực"}
      </span>
    </div>
  );
}

/* ─── Page ─── */

function SellerProfilePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userDetail, setUserDetail] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [activeTab, setActiveTab] = useState("store");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    storeName: "",
    storeAddress: "",
    bankName: "",
    bankAccount: "",
  });
  const [dirty, setDirty] = useState(false);

  /* ─── Load ─── */

  useEffect(() => {
    setLoading(true);
    setError("");
    getCurrentUserDetail()
      .then((data) => {
        setUserDetail(data);
        setForm({
          fullName: data?.fullName || "",
          email: data?.email || "",
          phone: data?.phone || "",
          address: data?.address || "",
          storeName: data?.storeName || "",
          storeAddress: data?.storeAddress || "",
          bankName: data?.bankName || "",
          bankAccount: data?.bankAccount || "",
        });
      })
      .catch((err) => setError(err?.message || "Không thể tải thông tin"))
      .finally(() => setLoading(false));
  }, []);

  /* ─── Derived ─── */

  const user = userDetail;
  const displayName = user?.fullName || user?.username || "Seller";
  const avatarUrl = user?.avatarUrl;
  const facehashProps = getFacehashProps(displayName);
  const verifiedBadge = STATUS_BADGE[user?.sellerVerified];
  const statusBadge = STATUS_BADGE[user?.storeStatus];

  /* ─── Handlers ─── */

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setDirty(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {};
    const textFields = ["fullName", "email", "phone", "address", "storeName", "storeAddress", "bankName", "bankAccount"];
    textFields.forEach((k) => {
      if (form[k]?.trim()) payload[k] = form[k].trim();
    });

    if (Object.keys(payload).length === 0) {
      toast.error("Không có thông tin nào để cập nhật");
      return;
    }

    setSaving(true);
    try {
      const updated = await updateCurrentUser(payload);
      setUserDetail((prev) => ({ ...prev, ...updated }));
      setDirty(false);
      toast.success("Cập nhật thông tin thành công");
    } catch (err) {
      toast.error(err?.message || "Không thể cập nhật");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const imageUrl = await uploadImage(file);
      if (imageUrl) {
        const updated = await updateCurrentUser({ storeLogo: imageUrl });
        setUserDetail((prev) => ({ ...prev, ...updated }));
        toast.success("Logo đã được cập nhật");
      }
    } catch (err) {
      toast.error(err?.message || "Không thể tải lên logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBanner(true);
    try {
      const imageUrl = await uploadImage(file);
      if (imageUrl) {
        const updated = await updateCurrentUser({ storeBanner: imageUrl });
        setUserDetail((prev) => ({ ...prev, ...updated }));
        toast.success("Banner đã được cập nhật");
      }
    } catch (err) {
      toast.error(err?.message || "Không thể tải lên banner");
    } finally {
      setUploadingBanner(false);
    }
  };

  /* ─── Tabs ─── */

  const tabs = [
    { key: "store", label: "Cửa hàng" },
    { key: "personal", label: "Cá nhân" },
    { key: "banking", label: "Ngân hàng" },
  ];

  /* ─── Render ─── */

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-zinc-500">Đang tải thông tin...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <p className="text-sm font-semibold text-amber-800">Lỗi</p>
        <p className="mt-1 text-sm text-amber-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── Store Header Card ─── */}
      <article className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-zinc-200/60">
        {/* Banner */}
        <div className="relative h-36 w-full bg-zinc-100 sm:h-44">
          {user?.storeBanner ? (
            <img
              src={user.storeBanner}
              alt={`${user.storeName || "Cửa hàng"} banner`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-50">
              <span className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-400">
                Banner cửa hàng
              </span>
            </div>
          )}
        </div>

        <div className="px-5 pb-6 pt-14 sm:px-6 sm:pt-16">
          {/* Logo */}
          <div className="-mt-11 flex items-end gap-4 sm:-mt-14 sm:gap-5">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl ring-4 ring-white bg-white shadow-md sm:h-24 sm:w-24">
              {user?.storeLogo ? (
                <img
                  src={user.storeLogo}
                  alt={`${user.storeName || "Cửa hàng"} logo`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-zinc-200 text-2xl font-bold text-zinc-500">
                  {(user?.storeName || "S").charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 pb-1">
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-zinc-600 transition-colors hover:border-zinc-900">
                {uploadingLogo ? "Đang tải..." : "Đổi logo"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={uploadingLogo}
                  className="hidden"
                />
              </label>
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-zinc-600 transition-colors hover:border-zinc-900">
                {uploadingBanner ? "Đang tải..." : "Đổi banner"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerUpload}
                  disabled={uploadingBanner}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Store info row */}
          <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold tracking-tight text-zinc-900 truncate">
                {user?.storeName || "Cửa hàng chưa đặt tên"}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {statusBadge && (
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusBadge.cls}`}>
                    {STORE_LABEL[user?.storeStatus] || user?.storeStatus}
                  </span>
                )}
                {verifiedBadge && (
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${verifiedBadge.cls}`}>
                    {VERIFIED_LABEL[user?.sellerVerified] || user?.sellerVerified}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-5 text-sm text-zinc-600">
              <div className="text-right">
                <p className="text-[0.6875rem] uppercase tracking-[0.14em] text-zinc-400">Đánh giá</p>
                <p className="font-semibold text-zinc-800">
                  {user?.storeRating != null ? `★ ${Number(user.storeRating).toFixed(1)}` : "Chưa có"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[0.6875rem] uppercase tracking-[0.14em] text-zinc-400">Đã bán</p>
                <p className="font-semibold text-zinc-800">
                  {user?.totalSales != null ? user.totalSales.toLocaleString("vi-VN") : "0"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* ─── Tabs ─── */}
      <div className="flex gap-1 rounded-2xl bg-zinc-100 p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === t.key
                ? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200/60"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── Tab: Store ─── */}
      {activeTab === "store" && (
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-200/60">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-semibold text-zinc-900">Thông tin cửa hàng</h3>
              <p className="mt-0.5 text-sm text-zinc-500">Quản lý hình ảnh và thông tin hiển thị của gian hàng</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-zinc-700">
                Tên cửa hàng
                <input
                  name="storeName"
                  value={form.storeName}
                  onChange={handleChange}
                  placeholder="VD: Duy's Store"
                  className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/10"
                  maxLength={255}
                />
              </label>
              <label className="text-sm text-zinc-700">
                Địa chỉ cửa hàng
                <input
                  name="storeAddress"
                  value={form.storeAddress}
                  onChange={handleChange}
                  placeholder="VD: Quận 1, TP. Hồ Chí Minh"
                  className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/10"
                  maxLength={500}
                />
              </label>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={saving || !dirty}
                className="rounded-full bg-zinc-900 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
              >
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
              {dirty && (
                <span className="text-xs text-amber-600">Có thay đổi chưa lưu</span>
              )}
            </div>
          </form>
        </section>
      )}

      {/* ─── Tab: Personal ─── */}
      {activeTab === "personal" && (
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-200/60">
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-zinc-900">Thông tin cá nhân</h3>
            <p className="mt-0.5 text-sm text-zinc-500">Cập nhật hồ sơ người bán của bạn</p>
          </div>

          {/* Avatar row */}
          <div className="mb-6 flex items-center gap-4">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="h-16 w-16 rounded-full object-cover ring-2 ring-zinc-100"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-zinc-100">
                <Facehash {...facehashProps} size="100%" className="rounded-full" />
              </div>
            )}
            <div>
              <p className="text-base font-semibold text-zinc-900">{displayName}</p>
              <p className="text-sm text-zinc-500">@{user?.username || "unknown"}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-zinc-700">
                Họ tên
                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Nhập họ tên"
                  className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/10"
                  maxLength={255}
                />
              </label>
              <label className="text-sm text-zinc-700">
                Email
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/10"
                  maxLength={255}
                />
              </label>
              <label className="text-sm text-zinc-700">
                Số điện thoại
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="0123 456 789"
                  className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/10"
                  maxLength={20}
                />
              </label>
              <label className="text-sm text-zinc-700">
                Địa chỉ
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Nhập địa chỉ"
                  className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/10"
                  maxLength={500}
                />
              </label>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={saving || !dirty}
                className="rounded-full bg-zinc-900 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
              >
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
              {dirty && (
                <span className="text-xs text-amber-600">Có thay đổi chưa lưu</span>
              )}
            </div>
          </form>
        </section>
      )}

      {/* ─── Tab: Banking ─── */}
      {activeTab === "banking" && (
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-200/60">
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-zinc-900">Thông tin ngân hàng</h3>
            <p className="mt-0.5 text-sm text-zinc-500">Tài khoản nhận thanh toán từ đơn hàng</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-zinc-700">
                Tên ngân hàng
                <input
                  name="bankName"
                  value={form.bankName}
                  onChange={handleChange}
                  placeholder="VD: Vietcombank"
                  className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/10"
                  maxLength={255}
                />
              </label>
              <label className="text-sm text-zinc-700">
                Số tài khoản
                <input
                  name="bankAccount"
                  value={form.bankAccount}
                  onChange={handleChange}
                  placeholder="Nhập số tài khoản"
                  className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/10"
                  maxLength={255}
                />
              </label>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={saving || !dirty}
                className="rounded-full bg-zinc-900 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
              >
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
              {dirty && (
                <span className="text-xs text-amber-600">Có thay đổi chưa lưu</span>
              )}
            </div>
          </form>
        </section>
      )}

      {/* ─── Verification Status ─── */}
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-200/60">
        <h3 className="text-lg font-semibold text-zinc-900">Trạng thái xác thực</h3>
        <p className="mt-0.5 text-sm text-zinc-500">
          Các bước xác thực giúp tăng độ tin cậy cho gian hàng của bạn
        </p>
        <div className="mt-5 space-y-3">
          <StatusDot
            label="Email"
            ok={user?.emailVerified}
            description={user?.emailVerified ? "Email đã được xác nhận" : "Xác nhận email để bảo vệ tài khoản"}
          />
          <StatusDot
            label="Số điện thoại"
            ok={user?.phoneVerified}
            description={user?.phoneVerified ? "Số điện thoại đã xác thực" : "Xác thực số điện thoại để tăng bảo mật"}
          />
          <StatusDot
            label="Người bán"
            ok={user?.sellerVerified === "APPROVED"}
            description={
              user?.sellerVerified === "APPROVED"
                ? "Tài khoản người bán đã được phê duyệt"
                : user?.sellerVerified === "PENDING"
                  ? "Đang chờ admin xét duyệt hồ sơ người bán"
                  : user?.sellerVerified === "REJECTED"
                    ? "Hồ sơ bị từ chối, vui lòng liên hệ admin"
                    : "Hoàn tất hồ sơ để được xét duyệt"
            }
          />
          <StatusDot
            label="Tài khoản"
            ok={user?.isActive}
            description={user?.isActive ? "Tài khoản đang hoạt động bình thường" : "Tài khoản đang bị vô hiệu hóa"}
          />
        </div>
      </section>
    </div>
  );
}

export default SellerProfilePage;
