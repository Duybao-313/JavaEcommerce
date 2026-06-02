import React, { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { forgotPassword } from "../services/authService";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email.trim()) {
      toast.error("Vui lòng nhập email");
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setEmailSent(true);
      toast.success(
        "Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư.",
      );
    } catch (err) {
      toast.error(err?.message || "Không thể xử lý yêu cầu");
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
            Quên mật khẩu
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600">
            Nhập email đã đăng ký để nhận link đặt lại mật khẩu.
          </p>

          {!emailSent ? (
            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label
                  className="mb-2 block text-sm font-medium text-zinc-700"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Đang xử lý..." : "Gửi yêu cầu"}
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
          ) : (
            <div className="mt-8 space-y-4">
              <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                <p className="font-semibold">Email đã được gửi</p>
                <p className="mt-2">
                  Vui lòng kiểm tra hộp thư và làm theo hướng dẫn để đặt lại mật
                  khẩu. Link đặt lại mật khẩu sẽ hết hạn sau 15 phút.
                </p>
              </div>
              <Link
                to="/login"
                className="block w-full rounded-full bg-zinc-900 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-zinc-700"
              >
                Quay lại đăng nhập
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
