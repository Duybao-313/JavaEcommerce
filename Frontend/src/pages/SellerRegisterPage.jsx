import React, { useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { register } from "../services/authService";
import {
  persistAuthResult,
  hasRole,
  getStoredToken,
} from "../services/sessionService";
import { buildUrl } from "../services/apiClient";

/* ─── Constants ─── */
const PASSWORD_RULES = [
  { test: (v) => v.length >= 6, label: "Ít nhất 6 ký tự" },
  { test: (v) => /[A-Z]/.test(v), label: "Ít nhất 1 chữ hoa" },
  { test: (v) => /[0-9]/.test(v), label: "Ít nhất 1 chữ số" },
  { test: (v) => /[^A-Za-z0-9]/.test(v), label: "Ít nhất 1 ký tự đặc biệt" },
];

const MAX_LOGO_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_BANNER_SIZE = 5 * 1024 * 1024; // 5MB

const INITIAL_FORM = {
  username: "",
  password: "",
  fullName: "",
  email: "",
  phone: "",
  storeName: "",
  storeAddress: "",
  businessLicense: "",
  taxCode: "",
  bankAccount: "",
  bankName: "",
};

/* ─── Helpers ─── */
function computePasswordStrength(password) {
  const score = PASSWORD_RULES.filter((r) => r.test(password)).length;
  if (!password) return { label: "", pct: 0, color: "" };
  if (score <= 1) return { label: "Yếu", pct: 20, color: "#dc2626" };
  if (score === 2) return { label: "Trung bình", pct: 45, color: "#d97706" };
  if (score === 3) return { label: "Khá", pct: 70, color: "#b45309" };
  return { label: "Mạnh", pct: 100, color: "#15803d" };
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ─── Sub-components ─── */

function FieldError({ message }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 text-xs font-medium text-red-600" role="alert">
      {message}
    </p>
  );
}

function Label({ htmlFor, required, children }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-sm font-medium text-stone-700"
    >
      {children}
      {required && <span className="ml-0.5 text-amber-600">*</span>}
    </label>
  );
}

function Input({
  id,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  error,
  autoComplete,
  disabled,
}) {
  return (
    <>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        disabled={disabled}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors
          disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-400
          ${
            error
              ? "border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-2 focus:ring-red-100"
              : "border-stone-200 bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
          }`}
      />
      {error && <FieldError message={error} />}
    </>
  );
}

function PasswordInput({ value, onChange, error, disabled }) {
  const [show, setShow] = useState(false);
  const strength = computePasswordStrength(value);

  return (
    <div>
      <div className="relative">
        <input
          id="password"
          name="password"
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder="Tối thiểu 6 ký tự"
          required
          autoComplete="new-password"
          disabled={disabled}
          aria-required="true"
          aria-invalid={!!error}
          className={`w-full rounded-xl border px-4 py-3 pr-12 text-sm outline-none transition-colors
            disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-400
            ${
              error
                ? "border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                : "border-stone-200 bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
            }`}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          disabled={disabled}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors p-1"
          aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          tabIndex={-1}
        >
          {show ? (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
      {error && <FieldError message={error} />}
      {value && (
        <div className="mt-2 space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-stone-200 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300 ease-out"
                style={{
                  width: `${strength.pct}%`,
                  backgroundColor: strength.color,
                }}
              />
            </div>
            <span className="text-xs font-medium text-stone-500 min-w-[5rem] text-right">
              {strength.label}
            </span>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5">
            {PASSWORD_RULES.map((rule) => {
              const pass = rule.test(value);
              return (
                <span
                  key={rule.label}
                  className={`text-xs transition-colors ${pass ? "text-emerald-600" : "text-stone-400"}`}
                >
                  {pass ? "✓" : "○"} {rule.label}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ImageUpload({
  id,
  label,
  accept = "image/*",
  maxSize,
  preview,
  onSelect,
  onRemove,
  error,
  disabled,
}) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    (file) => {
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        toast.error("Vui lòng chọn file ảnh (JPG, PNG, WebP)");
        return;
      }
      if (file.size > maxSize) {
        toast.error(`Dung lượng ảnh vượt quá ${formatFileSize(maxSize)}`);
        return;
      }
      onSelect(file);
    },
    [maxSize, onSelect],
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer?.files?.[0];
      handleFile(file);
    },
    [handleFile],
  );

  return (
    <div>
      <Label htmlFor={id} required={false}>
        {label}
      </Label>
      {preview ? (
        <div className="relative group rounded-xl overflow-hidden border border-stone-200">
          <img src={preview} alt={label} className="w-full h-36 object-cover" />
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            className="absolute top-2 right-2 rounded-full bg-stone-900/70 p-1.5 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:cursor-not-allowed"
            aria-label={`Xóa ${label}`}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <p className="absolute bottom-2 left-2 rounded-lg bg-stone-900/70 px-2 py-0.5 text-xs text-white">
            {formatFileSize(maxSize)} tối đa
          </p>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          aria-label={`Tải lên ${label}`}
          onClick={() => !disabled && inputRef.current?.click()}
          onKeyDown={(e) => {
            if (!disabled && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors cursor-pointer
            ${dragOver ? "border-amber-400 bg-amber-50/50" : "border-stone-200 bg-stone-50 hover:border-amber-300 hover:bg-amber-50/30"}
            ${disabled ? "cursor-not-allowed opacity-60" : ""}
            ${error ? "border-red-300 bg-red-50/50" : ""}`}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className={`mb-2 ${dragOver ? "text-amber-500" : "text-stone-400"}`}
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span
            className={`text-sm font-medium ${dragOver ? "text-amber-600" : "text-stone-500"}`}
          >
            {dragOver ? "Thả ảnh vào đây" : "Kéo thả hoặc nhấn để tải lên"}
          </span>
          <span className="mt-1 text-xs text-stone-400">
            JPG, PNG, WebP · tối đa {formatFileSize(maxSize)}
          </span>
          <input
            ref={inputRef}
            id={id}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
            disabled={disabled}
          />
        </div>
      )}
      {error && <FieldError message={error} />}
    </div>
  );
}

/* ─── Error code mapping ─── */
function mapFieldError(code) {
  const map = {
    USERNAME_NOT_NULL: "username",
    USERNAME_TOO_SHORT: "username",
    USERNAME_NOT_UNIQUE: "username",
    NAME_NOT_NULL: "fullName",
    PASSWORD_NOT_NULL: "password",
    PASSWORD_TOO_SHORT: "password",
    EMAIL_NOT_NULL: "email",
    EMAIL_INVALID: "email",
    EMAIL_ALREADY_EXISTS: "email",
    STORE_NAME_REQUIRED: "storeName",
    STORE_NAME_TOO_LONG: "storeName",
    STORE_ADDRESS_REQUIRED: "storeAddress",
    STORE_ADDRESS_TOO_LONG: "storeAddress",
    PHONE_INVALID: "phone",
  };
  return map[code] || null;
}

function extractFieldErrors(payload) {
  const fieldErrors = {};
  if (!payload) return fieldErrors;
  if (payload.errors && typeof payload.errors === "object") {
    for (const [key, val] of Object.entries(payload.errors)) {
      fieldErrors[mapFieldError(key) || key] = Array.isArray(val)
        ? val[0]
        : String(val);
    }
    return fieldErrors;
  }
  const field = mapFieldError(payload.code);
  if (field) {
    fieldErrors[field] = payload.message;
  }
  return fieldErrors;
}

/* ══════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════ */
function SellerRegisterPage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [globalError, setGlobalError] = useState("");
  const navigate = useNavigate();

  /* ── Handlers ── */
  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
    setGlobalError("");
  }, []);

  const handleLogoSelect = useCallback((file) => {
    setLogoFile(file);
    const url = URL.createObjectURL(file);
    setLogoPreview(url);
  }, []);

  const handleLogoRemove = useCallback(() => {
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoFile(null);
    setLogoPreview(null);
  }, [logoPreview]);

  const handleBannerSelect = useCallback((file) => {
    setBannerFile(file);
    const url = URL.createObjectURL(file);
    setBannerPreview(url);
  }, []);

  const handleBannerRemove = useCallback(() => {
    if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    setBannerFile(null);
    setBannerPreview(null);
  }, [bannerPreview]);

  const fillDemoSeller = useCallback((demo) => {
    setForm({
      ...INITIAL_FORM,
      username: demo.user,
      password: "Seller@123",
      fullName: "Nguyễn Văn Bán",
      email: demo.email,
      phone: "0912345678",
      storeName: demo.store,
      storeAddress: demo.address,
      businessLicense: "GPKD-" + demo.user.toUpperCase(),
      taxCode: "MST-" + demo.user.toUpperCase(),
      bankAccount: "1234567890",
      bankName: "Vietcombank",
    });
    setAgreed(true);
    setFieldErrors({});
    setGlobalError("");
  }, []);

  /* ── Submit ── */
  const handleSubmit = async (event) => {
    event.preventDefault();
    setFieldErrors({});
    setGlobalError("");

    if (!agreed) {
      setGlobalError(
        "Vui lòng đồng ý với Điều khoản dịch vụ và Chính sách bán hàng",
      );
      return;
    }

    setLoading(true);

    const payload = {
      username: form.username.trim(),
      password: form.password,
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      isSeller: true,
      storeName: form.storeName.trim(),
      storeAddress: form.storeAddress.trim(),
    };

    if (form.phone.trim()) payload.phone = form.phone.trim();
    if (form.businessLicense.trim())
      payload.businessLicense = form.businessLicense.trim();
    if (form.taxCode.trim()) payload.taxCode = form.taxCode.trim();
    if (form.bankAccount.trim()) payload.bankAccount = form.bankAccount.trim();
    if (form.bankName.trim()) payload.bankName = form.bankName.trim();

    try {
      const result = await register(payload);

      toast.success(result?.message || "Đăng ký seller thành công!");

      // Auto-login: gọi login để lấy token
      if (result?.data?.token) {
        persistAuthResult(result);
        const session = result?.data;
        if (hasRole(session, "SELLER")) {
          // Upload logo + banner nếu có
          if (logoFile)
            await uploadStoreAsset("/auth/seller/store-logo", "logo", logoFile);
          if (bannerFile)
            await uploadStoreAsset(
              "/auth/seller/store-banner",
              "banner",
              bannerFile,
            );
          navigate("/seller", { replace: true });
        } else {
          navigate("/products", { replace: true });
        }
      } else {
        // Backend chỉ trả RegisterResponse (không token), cần login riêng
        toast("Vui lòng đăng nhập để tiếp tục", { icon: "🔐" });
        navigate("/login", {
          replace: true,
          state: { from: "seller-register" },
        });
      }
    } catch (err) {
      const body = err?.body || err?.response;
      const fieldErrs = extractFieldErrors(body);
      if (Object.keys(fieldErrs).length > 0) {
        setFieldErrors(fieldErrs);
        toast.error("Vui lòng kiểm tra lại thông tin");
      } else {
        const msg =
          body?.message || err?.message || "Đăng ký thất bại, vui lòng thử lại";
        setGlobalError(msg);
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  /* ── Upload helper (sau khi có token) ── */
  async function uploadStoreAsset(endpoint, fieldName, file) {
    try {
      const token = getStoredToken();
      if (!token || !file) return;
      const formData = new FormData();
      formData.append(fieldName, file);
      await fetch(buildUrl(endpoint), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
    } catch {
      // Logo/banner upload không chặn flow chính
    }
  }

  /* ── Render ── */
  return (
    <div className="min-h-screen bg-[linear-gradient(175deg,#fefcf6_0%,#faf7ed_30%,#f7f3e8_60%,#fefdfa_100%)] px-4 py-8 sm:px-6 lg:py-12">
      <div className="mx-auto max-w-6xl">
        {/* ── Page header ── */}
        <header className="mb-10 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-700">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Dành cho người bán
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            Tạo cửa hàng trên SplitGo
          </h1>
          <p className="mt-2.5 max-w-xl text-base text-stone-500 leading-relaxed">
            Tạo tài khoản seller để bắt đầu bán hàng. Cần cung cấp thông tin cửa
            hàng và tài liệu xác thực.
          </p>
        </header>

        {/* ── Global error ── */}
        {globalError && (
          <div
            className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-3.5 text-sm text-red-700 flex items-start gap-3"
            role="alert"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="shrink-0 mt-0.5"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{globalError}</span>
          </div>
        )}

        {/* ── Two-column grid ── */}
        <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr]">
          {/* ── LEFT: Form ── */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8 space-y-8">
              {/* ── Section: Tài khoản ── */}
              <fieldset>
                <legend className="mb-5 flex items-center gap-2 text-base font-semibold text-stone-800">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-xs font-bold text-amber-700">
                    1
                  </span>
                  Thông tin tài khoản
                </legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="username" required>
                      Tên đăng nhập
                    </Label>
                    <Input
                      id="username"
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      placeholder="Từ 3 đến 30 ký tự"
                      required
                      disabled={loading}
                      error={fieldErrors.username}
                      autoComplete="username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" required>
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="seller@example.com"
                      required
                      disabled={loading}
                      error={fieldErrors.email}
                      autoComplete="email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password" required>
                      Mật khẩu
                    </Label>
                    <PasswordInput
                      value={form.password}
                      onChange={handleChange}
                      error={fieldErrors.password}
                      disabled={loading}
                    />
                  </div>
                </div>
              </fieldset>

              {/* ── Section: Cá nhân ── */}
              <fieldset>
                <legend className="mb-5 flex items-center gap-2 text-base font-semibold text-stone-800">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-100 text-xs font-bold text-stone-600">
                    2
                  </span>
                  Thông tin cá nhân
                </legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="fullName" required>
                      Họ và tên
                    </Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      placeholder="Nguyễn Văn Bán"
                      required
                      disabled={loading}
                      error={fieldErrors.fullName}
                      autoComplete="name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="0912345678"
                      disabled={loading}
                      error={fieldErrors.phone}
                      autoComplete="tel"
                    />
                  </div>
                </div>
              </fieldset>

              {/* ── Section: Cửa hàng (highlight) ── */}
              <fieldset className="rounded-xl border-2 border-amber-200 bg-amber-50/40 p-5 sm:p-6">
                <legend className="mb-4 flex items-center gap-2 text-base font-semibold text-amber-800">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 text-xs font-bold text-white">
                    3
                  </span>
                  Thông tin cửa hàng
                </legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="storeName" required>
                      Tên cửa hàng
                    </Label>
                    <Input
                      id="storeName"
                      name="storeName"
                      value={form.storeName}
                      onChange={handleChange}
                      placeholder="Cửa hàng của bạn"
                      required
                      disabled={loading}
                      error={fieldErrors.storeName}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="storeAddress" required>
                      Địa chỉ cửa hàng
                    </Label>
                    <Input
                      id="storeAddress"
                      name="storeAddress"
                      value={form.storeAddress}
                      onChange={handleChange}
                      placeholder="123 Lê Lợi, Quận 1, TP.HCM"
                      required
                      disabled={loading}
                      error={fieldErrors.storeAddress}
                      autoComplete="street-address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessLicense">
                      Giấy phép kinh doanh
                    </Label>
                    <Input
                      id="businessLicense"
                      name="businessLicense"
                      value={form.businessLicense}
                      onChange={handleChange}
                      placeholder="Số GPKD (nếu có)"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="taxCode">Mã số thuế</Label>
                    <Input
                      id="taxCode"
                      name="taxCode"
                      value={form.taxCode}
                      onChange={handleChange}
                      placeholder="MST (nếu có)"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bankAccount">Số tài khoản ngân hàng</Label>
                    <Input
                      id="bankAccount"
                      name="bankAccount"
                      value={form.bankAccount}
                      onChange={handleChange}
                      placeholder="Số tài khoản (nếu có)"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bankName">Tên ngân hàng</Label>
                    <Input
                      id="bankName"
                      name="bankName"
                      value={form.bankName}
                      onChange={handleChange}
                      placeholder="VD: Vietcombank"
                      disabled={loading}
                    />
                  </div>
                </div>
              </fieldset>

              {/* ── Section: Hình ảnh ── */}
              <fieldset>
                <legend className="mb-5 flex items-center gap-2 text-base font-semibold text-stone-800">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-100 text-xs font-bold text-stone-600">
                    4
                  </span>
                  Hình ảnh cửa hàng
                </legend>
                <div className="grid gap-5 sm:grid-cols-2">
                  <ImageUpload
                    id="storeLogo"
                    label="Logo cửa hàng"
                    maxSize={MAX_LOGO_SIZE}
                    preview={logoPreview}
                    onSelect={handleLogoSelect}
                    onRemove={handleLogoRemove}
                    disabled={loading}
                  />
                  <ImageUpload
                    id="storeBanner"
                    label="Banner cửa hàng"
                    maxSize={MAX_BANNER_SIZE}
                    preview={bannerPreview}
                    onSelect={handleBannerSelect}
                    onRemove={handleBannerRemove}
                    disabled={loading}
                  />
                </div>
              </fieldset>

              {/* ── Agreement ── */}
              <div className="flex items-start gap-3">
                <input
                  id="agreement"
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => {
                    setAgreed(e.target.checked);
                    if (e.target.checked) setGlobalError("");
                  }}
                  disabled={loading}
                  className="mt-0.5 h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500 cursor-pointer disabled:cursor-not-allowed"
                />
                <label
                  htmlFor="agreement"
                  className="text-sm text-stone-600 leading-relaxed cursor-pointer"
                >
                  Tôi đồng ý với{" "}
                  <Link
                    to="/terms"
                    className="font-medium text-amber-700 hover:text-amber-800 underline underline-offset-2"
                  >
                    Điều khoản dịch vụ
                  </Link>{" "}
                  và{" "}
                  <Link
                    to="/privacy"
                    className="font-medium text-amber-700 hover:text-amber-800 underline underline-offset-2"
                  >
                    Chính sách bán hàng
                  </Link>
                </label>
              </div>

              {/* ── CTA ── */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition-all
                    hover:bg-amber-700 hover:shadow-md active:scale-[0.98]
                    disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-amber-600 disabled:active:scale-100"
                >
                  {loading ? (
                    <>
                      <svg
                        className="h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="3"
                          className="opacity-25"
                        />
                        <path
                          d="M4 12a8 8 0 0 1 8-8"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          className="opacity-75"
                        />
                      </svg>
                      Đang tạo tài khoản...
                    </>
                  ) : (
                    "Tạo tài khoản seller"
                  )}
                </button>
                <Link
                  to="/register"
                  className="text-sm text-stone-500 hover:text-stone-800 transition-colors text-center sm:text-right"
                >
                  Đăng ký buyer thay thế
                </Link>
              </div>
            </div>
          </form>

          {/* ── RIGHT: Preview + Benefits ── */}
          <aside className="space-y-6">
            {/* Store card preview */}
            <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
              <div className="px-6 pt-6 pb-4 border-b border-stone-100">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                  Xem trước cửa hàng
                </p>
              </div>

              {/* Banner preview */}
              <div className="h-32 bg-stone-100 relative overflow-hidden">
                {bannerPreview ? (
                  <img
                    src={bannerPreview}
                    alt="Banner preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,#fef3c7_0%,#fde68a_40%,#d97706_100%)] opacity-40" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 to-transparent" />
                {logoPreview && (
                  <div className="absolute bottom-3 left-5 h-14 w-14 rounded-2xl border-2 border-white/80 bg-white shadow-lg overflow-hidden">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className={`px-6 pb-6 ${logoPreview ? "pt-10" : "pt-5"}`}>
                <h3 className="text-lg font-bold text-stone-900">
                  {form.storeName || "Tên cửa hàng của bạn"}
                </h3>
                <p className="mt-1 text-sm text-stone-500 line-clamp-2">
                  {form.storeAddress || "Địa chỉ cửa hàng"}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    Mới
                  </span>
                  <span className="text-xs text-stone-400">
                    0 sản phẩm · 0 đánh giá
                  </span>
                </div>
              </div>
            </div>

            {/* Benefits checklist */}
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-stone-800 mb-4">
                Lợi ích khi bán hàng trên SplitGo
              </p>
              <ul className="space-y-3">
                {[
                  {
                    icon: "💰",
                    text: "Tiếp cận hàng nghìn khách hàng tiềm năng mỗi ngày",
                  },
                  {
                    icon: "📦",
                    text: "Quản lý sản phẩm, đơn hàng, tồn kho dễ dàng",
                  },
                  {
                    icon: "⭐",
                    text: "Xây dựng uy tín qua đánh giá từ người mua",
                  },
                  {
                    icon: "📊",
                    text: "Báo cáo doanh thu và thống kê chi tiết",
                  },
                  { icon: "🔒", text: "Thanh toán an toàn, bảo mật thông tin" },
                ].map((item) => (
                  <li
                    key={item.text}
                    className="flex items-start gap-3 text-sm text-stone-600 leading-relaxed"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-sm">
                      {item.icon}
                    </span>
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>

            {/* Info card */}
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
                Lưu ý
              </p>
              <p className="text-sm text-stone-500 leading-relaxed">
                Sau khi đăng ký, tài khoản seller của bạn sẽ được xét duyệt
                trong vòng 24h. Bạn có thể đăng nhập và quản lý cửa hàng ngay
                sau khi được duyệt.
              </p>
            </div>

            {/* Demo seller accounts */}
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">
                Điền nhanh dữ liệu mẫu
              </p>
              <div className="space-y-2.5">
                {[
                  {
                    label: "Thời trang",
                    store: "Lụa Là Studio",
                    user: "lualastudio",
                    email: "hello@lualastudio.vn",
                    address: "42 Nguyễn Huệ, Quận 1, TP.HCM",
                  },
                  {
                    label: "Điện tử",
                    store: "TechHub Việt Nam",
                    user: "techhubvn",
                    email: "sales@techhub.vn",
                    address: "15 Cầu Giấy, Hà Nội",
                  },
                  {
                    label: "Đồ uống",
                    store: "Cà Phê Nhà Lá",
                    user: "caphenhala",
                    email: "order@caphenhala.vn",
                    address: "88 Trần Phú, Đà Nẵng",
                  },
                ].map((demo) => (
                  <button
                    key={demo.label}
                    type="button"
                    onClick={() => fillDemoSeller(demo)}
                    disabled={loading}
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 p-3.5 text-left text-sm transition hover:border-amber-300 hover:bg-amber-50/50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-xs">
                        {demo.label === "Thời trang"
                          ? "👗"
                          : demo.label === "Điện tử"
                            ? "📱"
                            : "☕"}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                        {demo.label}
                      </span>
                    </div>
                    <p className="mt-1.5 font-semibold text-stone-800">
                      {demo.store}
                    </p>
                    <p className="text-xs text-stone-400 mt-0.5">
                      @{demo.user} · {demo.email}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* ── Bottom link ── */}
        <p className="mt-10 text-center text-sm text-stone-400">
          Đã có tài khoản seller?{" "}
          <Link
            to="/login"
            className="font-semibold text-amber-700 hover:text-amber-800 underline underline-offset-2 transition-colors"
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SellerRegisterPage;
