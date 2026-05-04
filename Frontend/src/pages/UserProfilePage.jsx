import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Facehash } from "facehash";
import { getFacehashProps } from "../utils/facehashTheme";
import {
  getCurrentUserDetail,
  updateCurrentUser,
} from "../services/authService";
import { clearAuth, getAuthSession, hasRole } from "../services/sessionService";

function UserProfilePage() {
  const [session, setSession] = useState(() => getAuthSession());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userDetail, setUserDetail] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (!session?.token) {
      navigate("/login", { replace: true });
      return;
    }

    async function loadUserDetail() {
      setLoading(true);
      setError("");

      try {
        const detail = await getCurrentUserDetail();
        setUserDetail(detail);
        setForm({
          fullName: detail?.fullName || "",
          email: detail?.email || "",
          phone: detail?.phone || "",
          address: detail?.address || "",
        });
      } catch (err) {
        setError(err?.message || "Không thể tải thông tin tài khoản");
      } finally {
        setLoading(false);
      }
    }

    loadUserDetail();
  }, [navigate, session?.token]);

  const user = useMemo(() => {
    return userDetail ?? session?.user ?? null;
  }, [session?.user, userDetail]);

  const displayName = user?.fullName || user?.username || "Tài khoản";
  const avatarUrl = user?.avatarUrl;
  const facehashProps = getFacehashProps(displayName);
  const backToLabel = hasRole(session, "SELLER")
    ? "Về trang quản lý"
    : "Về sản phẩm";
  const backToPath = hasRole(session, "SELLER") ? "/seller" : "/products";

  const missingFields = useMemo(() => {
    const checks = [
      { key: "fullName", label: "Họ tên" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Số điện thoại" },
      { key: "address", label: "Địa chỉ" },
    ];

    return checks
      .filter(({ key }) => {
        const value = user?.[key];
        if (value === null || value === undefined) return true;
        if (typeof value !== "string") return false;
        const normalized = value.trim();
        return normalized.length === 0 || normalized === "-";
      })
      .map(({ label }) => label);
  }, [user]);

  const isProfileIncomplete = !loading && missingFields.length > 0;

  const handleLogout = () => {
    clearAuth();
    toast.success("Đã đăng xuất");
    navigate("/login");
  };

  const handleUpdateInfo = () => {
    setIsEditing(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancelEdit = () => {
    setForm({
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
    });
    setIsEditing(false);
  };

  const handleSubmitUpdate = async (event) => {
    event.preventDefault();

    const payload = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
    };

    if (
      !payload.fullName ||
      !payload.email ||
      !payload.phone ||
      !payload.address
    ) {
      toast.error("Vui lòng cập nhật thông tin");
      return;
    }

    setSaving(true);
    try {
      const updated = await updateCurrentUser(payload);
      setUserDetail((prev) => ({ ...prev, ...updated }));
      setSession((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          user: {
            ...(prev.user || {}),
            ...updated,
          },
        };
      });
      setIsEditing(false);
      toast.success("Cập nhật thông tin thành công");
    } catch (err) {
      toast.error(err?.message || "Không thể cập nhật thông tin");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f7f4_0%,#f4f4ef_45%,#ffffff_100%)] px-6 py-10">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              SplitGo
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
              Thông tin người dùng
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to={backToPath}
              className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-800 hover:border-zinc-900"
            >
              {backToLabel}
            </Link>
            {isProfileIncomplete && (
              <button
                onClick={handleUpdateInfo}
                className="rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-amber-800 hover:border-amber-500"
              >
                Cập nhật thông tin
              </button>
            )}
            {!isProfileIncomplete && (
              <button
                onClick={handleUpdateInfo}
                className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-800 hover:border-zinc-900"
              >
                Chỉnh sửa
              </button>
            )}
            <button
              onClick={handleLogout}
              className="rounded-full border border-red-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-red-700 hover:border-red-500"
            >
              Đăng xuất
            </button>
          </div>
        </header>

        {isProfileIncomplete && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-semibold">Vui lòng cập nhật thông tin</p>
            <p className="mt-1">Thiếu: {missingFields.join(", ")}</p>
          </div>
        )}

        <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-center gap-4">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-zinc-100">
                <Facehash
                  {...facehashProps}
                  size="100%"
                  className="rounded-full"
                />
              </div>
            )}

            <div>
              <p className="text-2xl font-semibold text-zinc-900">
                {displayName}
              </p>
              <p className="text-sm text-zinc-600">
                @{user?.username || "unknown"}
              </p>
            </div>
          </div>

          {loading && (
            <p className="mt-6 text-sm text-zinc-600">
              Đang tải thông tin tài khoản...
            </p>
          )}
          {!loading && error && (
            <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              {error}
            </p>
          )}

          {isEditing && (
            <form
              onSubmit={handleSubmitUpdate}
              className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                Cập nhật thông tin
              </p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="text-sm text-zinc-700">
                  Họ tên
                  <input
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900"
                    required
                  />
                </label>
                <label className="text-sm text-zinc-700">
                  Email
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900"
                    required
                  />
                </label>
                <label className="text-sm text-zinc-700">
                  Số điện thoại
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900"
                    required
                  />
                </label>
                <label className="text-sm text-zinc-700">
                  Địa chỉ
                  <input
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900"
                    required
                  />
                </label>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving ? "Đang lưu..." : "Lưu"}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-800 hover:border-zinc-900 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Hủy
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                Họ tên
              </p>
              <p className="mt-1 font-medium text-zinc-900">
                {user?.fullName || "-"}
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                Tên đăng nhập
              </p>
              <p className="mt-1 font-medium text-zinc-900">
                {user?.username || "-"}
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                Email
              </p>
              <p className="mt-1 font-medium text-zinc-900">
                {user?.email || "-"}
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                Vai trò
              </p>
              <p className="mt-1 font-medium text-zinc-900">
                {String(user?.role || session?.role || "-").replace(
                  "ROLE_",
                  "",
                )}
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                Số điện thoại
              </p>
              <p className="mt-1 font-medium text-zinc-900">
                {user?.phone || "-"}
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                Địa chỉ
              </p>
              <p className="mt-1 font-medium text-zinc-900">
                {user?.address || "-"}
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 md:col-span-2">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                Cập nhật lần cuối
              </p>
              <p className="mt-1 font-medium text-zinc-900">
                {user?.updatedAt || "-"}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default UserProfilePage;
