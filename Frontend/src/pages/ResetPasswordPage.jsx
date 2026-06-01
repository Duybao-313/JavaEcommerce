import React, { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { resetPassword } from "../services/authService";

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get("token") || "";
  const navigate = useNavigate();

  const [form, setForm] = useState({
    token: tokenFromUrl,
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.token.trim()) {
      toast.error("Thiếu token đặt lại mật khẩu");
      return;
    }

    if (form.newPassword.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        token: form.token.trim(),
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      };
      await resetPassword(payload);
      toast.success("Đặt lại mật khẩu thành công");
      navigate("/login");
    } catch (err) {
      toast.error(err?.message || "Không thể đặt lại mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f7f4_0%,#f4f4ef_45%,#ffffff_100%)] px-6 py-10">
      <div className="mx-auto w-full max-w-lg">
        <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            SplitGo
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">
            Đặt lại mật khẩu
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600">
            Nhập mật khẩu mới cho tài khoản của bạn.
          </p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                className="mb-2 block text-sm font-medium text-zinc-700"
                htmlFor="token"
              >
                Token đặt lại
              </label>
              <input
                id="token"
                name="token"
                value={form.token}
                onChange={handleChange}
                placeholder="Nhập token từ email"
                className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
                required
              />
            </div>

            <div>
              <label
                className="mb-2 block text-sm font-medium text-zinc-700"
                htmlFor="newPassword"
              >
                Mật khẩu mới
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                value={form.newPassword}
                onChange={handleChange}
                placeholder="Ít nhất 6 ký tự"
                className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
                required
              />
            </div>

            <div>
              <label
                className="mb-2 block text-sm font-medium text-zinc-700"
                htmlFor="confirmPassword"
              >
                Xác nhận mật khẩu
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Nhập lại mật khẩu mới"
                className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
            </button>

            <div className="text-center">
              <Link
                to="/login"
                className="text-sm font-semibold text-zinc-900 hover:underline"
              >
                Quay lại đăng nhập
              </Link>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
