import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { verifyEmail } from "../services/authService";

function EmailVerificationPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Thiếu token xác thực. Vui lòng kiểm tra lại link trong email.");
      return;
    }

    async function doVerify() {
      try {
        await verifyEmail(token);
        setStatus("success");
        setMessage("Email đã được xác thực thành công!");
        toast.success("Xác thực email thành công");
      } catch (err) {
        setStatus("error");
        setMessage(err?.message || "Không thể xác thực email. Token không hợp lệ hoặc đã hết hạn.");
      }
    }

    doVerify();
  }, [token]);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f7f4_0%,#f4f4ef_45%,#ffffff_100%)] px-6 py-10">
      <div className="mx-auto w-full max-w-lg">
        <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            SplitGo
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">
            Xác thực Email
          </h1>

          {status === "loading" && (
            <div className="mt-8 space-y-3">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900" />
              <p className="text-sm text-zinc-600">Đang xác thực email...</p>
            </div>
          )}

          {status === "success" && (
            <div className="mt-8 space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-lg font-semibold text-green-700">{message}</p>
              <Link
                to="/login"
                className="inline-block rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-700"
              >
                Đăng nhập ngay
              </Link>
            </div>
          )}

          {status === "error" && (
            <div className="mt-8 space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-lg font-semibold text-red-700">{message}</p>
              <Link
                to="/login"
                className="inline-block rounded-full border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-800 hover:border-zinc-900"
              >
                Về đăng nhập
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default EmailVerificationPage;
