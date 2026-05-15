import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { login } from "../services/authService";
import { hasRole, persistAuthResult } from "../services/sessionService";
import { loginDemoAccounts } from "../constants/demoAccounts";

const initialState = {
  username: "admin",
  password: "admin",
};

function LoginPage() {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const fillDemoAccount = (account) => {
    setForm({
      username: account.username,
      password: account.password,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const payload = {
      username: form.username.trim(),
      password: form.password,
    };

    const request = login(payload);

    try {
      const result = await toast.promise(request, {
        loading: "Đang đăng nhập...",
        success: (response) => response?.message || "Đăng nhập thành công",
        error: (err) => err?.message || "Đăng nhập thất bại",
      });

      persistAuthResult(result);
      const session = result?.data;

      if (hasRole(session, "ADMIN")) {
        navigate("/admin");
      } else if (hasRole(session, "SELLER")) {
        navigate("/seller");
      } else {
        navigate("/products");
      }
    } catch {
      // toast.promise đã hiển thị lỗi
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f7f4_0%,#f4f4ef_45%,#ffffff_100%)] px-6 py-10">
      <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[1fr_0.9fr]">
        <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            SplitGo
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">
            Đăng nhập tài khoản
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600">
            Truy cập đơn hàng, theo dõi thanh toán và tiếp tục mua sắm nhanh
            hơn.
          </p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                className="mb-2 block text-sm font-medium text-zinc-700"
                htmlFor="username"
              >
                Tên đăng nhập
              </label>
              <input
                id="username"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="admin"
                className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
                required
              />
            </div>

            <div>
              <label
                className="mb-2 block text-sm font-medium text-zinc-700"
                htmlFor="password"
              >
                Mật khẩu
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="admin"
                className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Đang xử lý..." : "Đăng nhập"}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between text-sm text-zinc-600">
            <Link
              to="/register"
              className="font-semibold text-zinc-900 hover:underline"
            >
              Chưa có tài khoản? Đăng ký
            </Link>
            <div className="flex items-center gap-3">
              <Link
                to="/register-seller"
                className="text-amber-700 font-medium hover:underline"
              >
                Đăng ký Seller
              </Link>
              <Link to="/" className="hover:text-zinc-900">
                Về trang chủ
              </Link>
            </div>
          </div>
        </section>

        <aside className="rounded-3xl border border-zinc-200 bg-zinc-950 p-8 text-zinc-100 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
            Tài khoản có sẵn
          </p>
          <p className="mt-3 text-sm leading-relaxed text-zinc-300">
            Nhấn vào từng nút để tự điền thông tin đăng nhập cho các vai trò
            mẫu.
          </p>

          <div className="mt-5 grid gap-3">
            {loginDemoAccounts.map((account) => (
              <button
                key={account.label}
                type="button"
                onClick={() => fillDemoAccount(account)}
                className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-left text-sm text-zinc-100 transition hover:border-zinc-500 hover:bg-zinc-800"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                  {account.label}
                </p>
                <p className="mt-2 font-semibold">{account.username}</p>
                <p className="text-zinc-400">Mật khẩu: {account.password}</p>
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-sm leading-relaxed text-zinc-200">
            <p className="text-zinc-400">JWT & refresh</p>
            <p className="mt-2">
              Đăng nhập sẽ lưu JWT và tự thử làm mới token khi gọi API bảo vệ.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default LoginPage;
