import React from "react";
import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f7f4_0%,#f4f4ef_45%,#ffffff_100%)] px-6 py-10">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center rounded-3xl border border-zinc-200 bg-white p-10 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
          SplitGo
        </p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-zinc-900">
          404
        </h1>
        <p className="mt-3 text-base text-zinc-600">
          Trang bạn truy cập không tồn tại hoặc bạn không có quyền truy cập.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            to="/"
            className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-700"
          >
            Về trang chủ
          </Link>
          <Link
            to="/login"
            className="rounded-full border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-800 hover:bg-zinc-100"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
