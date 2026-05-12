import React from "react";

function StatusDot({ label, verified, description }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ${
          verified
            ? "bg-emerald-100 text-emerald-700"
            : "bg-amber-100 text-amber-700"
        }`}
      >
        {verified ? "✓" : "⏳"}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-zinc-900">{label}</p>
        <p className="text-xs text-zinc-500">{description}</p>
      </div>
      <span
        className={`ml-auto shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
          verified
            ? "bg-emerald-50 text-emerald-700"
            : "bg-amber-50 text-amber-700"
        }`}
      >
        {verified ? "Đã xác thực" : "Chưa xác thực"}
      </span>
    </div>
  );
}

function VerificationStatusPanel({
  emailVerified,
  phoneVerified,
  sellerVerified,
  isActive,
  storeStatus,
}) {
  const sellerVerifiedLabel = {
    APPROVED: "Đã xác thực",
    PENDING: "Chờ xác thực",
    REJECTED: "Từ chối",
  };

  const storeStatusLabel = {
    ACTIVE: "Đang hoạt động",
    SUSPENDED: "Tạm khóa",
  };

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-zinc-900">
          Trạng thái xác minh
        </h3>
        {!isActive && (
          <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
            Tài khoản bị vô hiệu hóa
          </span>
        )}
      </div>

      <div className="mt-4 space-y-2">
        <StatusDot
          label="Email"
          verified={emailVerified}
          description={
            emailVerified
              ? "Email của bạn đã được xác nhận"
              : "Xác nhận email để tăng độ tin cậy"
          }
        />
        <StatusDot
          label="Số điện thoại"
          verified={phoneVerified}
          description={
            phoneVerified
              ? "Số điện thoại đã được xác nhận"
              : "Xác nhận số điện thoại để bảo mật tài khoản"
          }
        />
        <StatusDot
          label="Xác thực người bán"
          verified={sellerVerified === "APPROVED"}
          description={
            sellerVerified === "APPROVED"
              ? "Bạn đã được xác thực là người bán đáng tin cậy"
              : sellerVerified === "REJECTED"
                ? "Yêu cầu xác thực của bạn đã bị từ chối"
                : "Đang chờ xét duyệt xác thực người bán"
          }
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${
            isActive
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          Tài khoản: {isActive ? "Hoạt động" : "Vô hiệu"}
        </span>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${
            storeStatus === "ACTIVE"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          Cửa hàng:{" "}
          {storeStatusLabel[storeStatus] || storeStatus || "Không xác định"}
        </span>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${
            sellerVerified === "APPROVED"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : sellerVerified === "REJECTED"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-amber-200 bg-amber-50 text-amber-700"
          }`}
        >
          Seller:{" "}
          {sellerVerifiedLabel[sellerVerified] || sellerVerified || "Chưa rõ"}
        </span>
      </div>

      {storeStatus === "SUSPENDED" && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold">⚠ Cửa hàng của bạn đang bị tạm khóa</p>
          <p className="mt-1">
            Vui lòng liên hệ quản trị viên để được hỗ trợ mở khóa.
          </p>
        </div>
      )}

      {!isActive && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold">
            ⚠ Tài khoản của bạn đang bị vô hiệu hóa
          </p>
          <p className="mt-1">
            Vui lòng liên hệ quản trị viên để kích hoạt lại tài khoản.
          </p>
        </div>
      )}
    </section>
  );
}

export default VerificationStatusPanel;
