import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Facehash } from "facehash";
import { getFacehashProps } from "../../utils/facehashTheme";
import {
  getCurrentUserDetail,
  updateCurrentUser,
} from "../../services/authService";

/* ─── Helpers ─── */

function InfoCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-zinc-50 px-5 py-4 transition-colors hover:bg-zinc-100">
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </p>
      <p className="mt-1.5 break-words text-sm font-medium text-zinc-800">
        {value ?? <span className="italic text-zinc-400">Chưa có</span>}
      </p>
    </div>
  );
}

/* ─── Page ─── */

function AdminProfilePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userDetail, setUserDetail] = useState(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
  });

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
        });
      })
      .catch((err) => setError(err?.message || "Không thể tải thông tin"))
      .finally(() => setLoading(false));
  }, []);

  /* ─── Derived ─── */

  const user = userDetail;
  const displayName = user?.fullName || user?.username || "Admin";
  const avatarUrl = user?.avatarUrl;
  const facehashProps = getFacehashProps(displayName);

  /* ─── Handlers ─── */

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setDirty(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {};
    if (form.fullName.trim()) payload.fullName = form.fullName.trim();
    if (form.email.trim()) payload.email = form.email.trim();
    if (form.phone.trim()) payload.phone = form.phone.trim();
    if (form.address.trim()) payload.address = form.address.trim();

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

  /* ─── Loading / Error ─── */

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
      {/* ─── Header ─── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            SplitGo Admin
          </p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-zinc-900">
            Thông tin quản trị viên
          </h1>
        </div>
      </div>

      {/* ─── Identity Card ─── */}
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-200/60">
        <div className="flex flex-wrap items-center gap-5">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="h-20 w-20 rounded-2xl object-cover ring-2 ring-zinc-100"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-zinc-100">
              <Facehash
                {...facehashProps}
                size="100%"
                className="rounded-2xl"
              />
            </div>
          )}

          <div className="min-w-0">
            <p className="text-xl font-semibold text-zinc-900">{displayName}</p>
            <p className="text-sm text-zinc-500">
              @{user?.username || "unknown"}
            </p>
            <div className="mt-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-900 px-2.5 py-0.5 text-xs font-semibold text-white">
                Quản trị viên
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Info Grid ─── */}
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-200/60">
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-zinc-900">Hồ sơ cá nhân</h3>
          <p className="mt-0.5 text-sm text-zinc-500">
            Thông tin tài khoản quản trị hệ thống
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoCard label="Họ tên" value={user?.fullName} />
          <InfoCard label="Tên đăng nhập" value={user?.username} />
          <InfoCard label="Email" value={user?.email} />
          <InfoCard label="Số điện thoại" value={user?.phone} />
          <InfoCard label="Địa chỉ" value={user?.address} />
          <InfoCard label="Cập nhật lần cuối" value={user?.updatedAt} />
        </div>
      </section>

      {/* ─── Edit Form ─── */}
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-200/60">
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-zinc-900">
            Chỉnh sửa thông tin
          </h3>
          <p className="mt-0.5 text-sm text-zinc-500">
            Cập nhật hồ sơ quản trị viên
          </p>
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
              <span className="text-xs text-amber-600">
                Có thay đổi chưa lưu
              </span>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}

export default AdminProfilePage;
