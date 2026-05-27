import { useEffect, useState, useCallback, useMemo } from "react";
import {
  COUPON_TYPE_LABEL,
  COUPON_SCOPE_LABEL,
} from "../../../services/couponService";
import CouponTargetPicker from "./CouponTargetPicker";

const COUPON_TYPES = [
  { value: "PERCENT", label: "Phần trăm (%)" },
  { value: "FIXED", label: "Cố định (VNĐ)" },
  { value: "FREE_SHIPPING", label: "Miễn phí vận chuyển" },
];

const emptyForm = {
  code: "",
  title: "",
  description: "",
  type: "PERCENT",
  value: "",
  maxDiscountAmount: "",
  minOrderValue: "",
  scope: "ALL",
  targetIds: "",
  startAt: "",
  endAt: "",
  usageLimit: "",
  perUserLimit: "",
  isActive: true,
};

/**
 * CouponForm — Create / Edit coupon form with validation and error states.
 *
 * Props:
 *   initialData  (object|null)  — pre-populate for edit; null for create
 *   saving       (boolean)      — loading state for submit button
 *   serverError  (string|null)  — server-side error message
 *   onSubmit     (formData) => void
 *   onCancel     () => void
 *
 * Validation rules (inline):
 *   - code: required, uppercase auto-transform
 *   - type: required
 *   - value: PERCENT => 1-100, FIXED/FREE_SHIPPING => >0
 *   - startAt < endAt
 */
function CouponForm({
  initialData,
  saving = false,
  serverError = null,
  onSubmit,
  onCancel,
}) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  // Populate form when initialData changes
  useEffect(() => {
    if (initialData) {
      setForm({
        code: initialData.code || "",
        title: initialData.title || "",
        description: initialData.description || "",
        type: initialData.type || "PERCENT",
        value: initialData.value != null ? String(initialData.value) : "",
        maxDiscountAmount:
          initialData.maxDiscountAmount != null
            ? String(initialData.maxDiscountAmount)
            : "",
        minOrderValue:
          initialData.minOrderValue != null
            ? String(initialData.minOrderValue)
            : "",
        scope: initialData.scope || "ALL",
        targetIds: Array.isArray(initialData.targetIds)
          ? initialData.targetIds.join(", ")
          : initialData.targetIds || "",
        startAt: initialData.startAt ? initialData.startAt.slice(0, 16) : "",
        endAt: initialData.endAt ? initialData.endAt.slice(0, 16) : "",
        usageLimit:
          initialData.usageLimit != null ? String(initialData.usageLimit) : "",
        perUserLimit:
          initialData.perUserLimit != null
            ? String(initialData.perUserLimit)
            : "",
        isActive: initialData.isActive !== false,
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [initialData]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear field error on change
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const handleCodeChange = useCallback((e) => {
    // Auto uppercase
    const upper = e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, "");
    setForm((prev) => ({ ...prev, code: upper }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.code;
      return next;
    });
  }, []);

  const handleTargetScopeChange = useCallback((scope, targetIds) => {
    setForm((prev) => ({ ...prev, scope, targetIds }));
  }, []);

  // ── Validation ──────────────────────────────────────────────────────
  const validate = useCallback(() => {
    const errs = {};
    const code = form.code.trim();
    const title = form.title.trim();
    const val = Number(form.value);
    const start = form.startAt;
    const end = form.endAt;

    if (!code) errs.code = "Vui lòng nhập mã coupon";
    else if (code.length < 3) errs.code = "Mã coupon phải có ít nhất 3 ký tự";

    if (!title) errs.title = "Vui lòng nhập tiêu đề";

    if (form.value === "" || isNaN(val)) {
      errs.value = "Vui lòng nhập giá trị hợp lệ";
    } else if (form.type === "PERCENT" && (val <= 0 || val > 100)) {
      errs.value = "Phần trăm giảm giá phải từ 1 đến 100";
    } else if (
      (form.type === "FIXED" || form.type === "FREE_SHIPPING") &&
      val <= 0
    ) {
      errs.value = "Giá trị giảm giá phải lớn hơn 0";
    }

    if (form.maxDiscountAmount && form.type === "PERCENT") {
      const max = Number(form.maxDiscountAmount);
      if (isNaN(max) || max <= 0)
        errs.maxDiscountAmount = "Giá trị tối đa phải lớn hơn 0";
    }

    if (form.minOrderValue) {
      const min = Number(form.minOrderValue);
      if (isNaN(min) || min < 0)
        errs.minOrderValue = "Giá trị tối thiểu không được âm";
    }

    if (!start) errs.startAt = "Vui lòng chọn ngày bắt đầu";
    if (!end) errs.endAt = "Vui lòng chọn ngày kết thúc";
    if (start && end && start >= end)
      errs.endAt = "Ngày kết thúc phải sau ngày bắt đầu";

    if (form.usageLimit) {
      const limit = Number(form.usageLimit);
      if (isNaN(limit) || limit < 1)
        errs.usageLimit = "Giới hạn lượt dùng phải lớn hơn 0";
    }
    if (form.perUserLimit) {
      const limit = Number(form.perUserLimit);
      if (isNaN(limit) || limit < 1)
        errs.perUserLimit = "Giới hạn mỗi người phải lớn hơn 0";
    }
    if (
      form.usageLimit &&
      form.perUserLimit &&
      Number(form.perUserLimit) > Number(form.usageLimit)
    ) {
      errs.perUserLimit =
        "Giới hạn mỗi người không được vượt quá tổng lượt dùng";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [form]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!validate()) return;

      const payload = {
        code: form.code.trim(),
        title: form.title.trim(),
        description: form.description.trim() || null,
        type: form.type,
        value: Number(form.value),
        maxDiscountAmount: form.maxDiscountAmount
          ? Number(form.maxDiscountAmount)
          : null,
        minOrderValue: form.minOrderValue ? Number(form.minOrderValue) : null,
        scope: form.scope,
        targetIds:
          form.scope === "ALL"
            ? []
            : form.targetIds
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
                .map(Number)
                .filter((n) => !isNaN(n)),
        startAt: form.startAt ? `${form.startAt}:00` : null,
        endAt: form.endAt ? `${form.endAt}:00` : null,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        perUserLimit: form.perUserLimit ? Number(form.perUserLimit) : null,
        isActive: form.isActive,
      };

      onSubmit(payload);
    },
    [form, onSubmit, validate],
  );

  const isEdit = !!initialData;

  const valueHint = useMemo(() => {
    if (form.type === "PERCENT")
      return "Nhập số từ 1 đến 100 (vd: 20 = giảm 20%)";
    if (form.type === "FIXED") return "Số tiền giảm cố định (VNĐ)";
    if (form.type === "FREE_SHIPPING")
      return "Số tiền miễn phí vận chuyển tối đa (VNĐ)";
    return "";
  }, [form.type]);

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-zinc-900">
          {isEdit ? "Chỉnh sửa coupon" : "Tạo coupon mới"}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-500 transition-colors duration-180 ease-out-quart hover:bg-zinc-100 hover:text-zinc-700"
        >
          Đóng
        </button>
      </div>

      {/* Server error banner */}
      {serverError && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700"
        >
          {serverError}
        </div>
      )}

      {/* Grid: 2 columns on md+ */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Code */}
        <div>
          <label
            htmlFor="coupon-code"
            className="block text-sm font-medium text-zinc-700 mb-1"
          >
            Mã coupon <span className="text-red-500">*</span>
          </label>
          <input
            id="coupon-code"
            name="code"
            type="text"
            value={form.code}
            onChange={handleCodeChange}
            disabled={saving}
            placeholder="VD: SUMMER2026"
            maxLength={64}
            autoComplete="off"
            aria-required="true"
            aria-invalid={!!errors.code}
            aria-describedby={errors.code ? "coupon-code-error" : undefined}
            className={`w-full min-h-[40px] rounded-lg border bg-white px-3 py-2 text-sm outline-none transition-colors duration-180 ease-out-quart focus:ring-1 focus:ring-zinc-900/20 disabled:cursor-not-allowed disabled:bg-zinc-100 ${
              errors.code
                ? "border-red-400 focus:border-red-500"
                : "border-zinc-300 focus:border-zinc-900"
            }`}
          />
          {errors.code && (
            <p
              id="coupon-code-error"
              role="alert"
              className="mt-1 text-xs text-red-600"
            >
              {errors.code}
            </p>
          )}
        </div>

        {/* Type */}
        <div>
          <label
            htmlFor="coupon-type"
            className="block text-sm font-medium text-zinc-700 mb-1"
          >
            Loại coupon <span className="text-red-500">*</span>
          </label>
          <select
            id="coupon-type"
            name="type"
            value={form.type}
            onChange={handleChange}
            disabled={saving}
            aria-required="true"
            className="w-full min-h-[40px] rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition-colors duration-180 ease-out-quart focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/20 disabled:cursor-not-allowed disabled:bg-zinc-100"
          >
            {COUPON_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div className="md:col-span-2">
          <label
            htmlFor="coupon-title"
            className="block text-sm font-medium text-zinc-700 mb-1"
          >
            Tiêu đề <span className="text-red-500">*</span>
          </label>
          <input
            id="coupon-title"
            name="title"
            type="text"
            value={form.title}
            onChange={handleChange}
            disabled={saving}
            placeholder="VD: Giảm giá mùa hè 2026"
            maxLength={255}
            aria-required="true"
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? "coupon-title-error" : undefined}
            className={`w-full min-h-[40px] rounded-lg border bg-white px-3 py-2 text-sm outline-none transition-colors duration-180 ease-out-quart focus:ring-1 focus:ring-zinc-900/20 disabled:cursor-not-allowed disabled:bg-zinc-100 ${
              errors.title
                ? "border-red-400 focus:border-red-500"
                : "border-zinc-300 focus:border-zinc-900"
            }`}
          />
          {errors.title && (
            <p
              id="coupon-title-error"
              role="alert"
              className="mt-1 text-xs text-red-600"
            >
              {errors.title}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label
            htmlFor="coupon-desc"
            className="block text-sm font-medium text-zinc-700 mb-1"
          >
            Mô tả
          </label>
          <textarea
            id="coupon-desc"
            name="description"
            rows={2}
            value={form.description}
            onChange={handleChange}
            disabled={saving}
            placeholder="Mô tả ngắn gọn về coupon"
            className="w-full min-h-[40px] rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition-colors duration-180 ease-out-quart focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/20 disabled:cursor-not-allowed disabled:bg-zinc-100 resize-y"
          />
        </div>

        {/* Value */}
        <div>
          <label
            htmlFor="coupon-value"
            className="block text-sm font-medium text-zinc-700 mb-1"
          >
            Giá trị <span className="text-red-500">*</span>
          </label>
          <input
            id="coupon-value"
            name="value"
            type="number"
            min={form.type === "PERCENT" ? 1 : 0}
            max={form.type === "PERCENT" ? 100 : undefined}
            step="any"
            value={form.value}
            onChange={handleChange}
            disabled={saving}
            placeholder={form.type === "PERCENT" ? "20" : "50000"}
            aria-required="true"
            aria-invalid={!!errors.value}
            aria-describedby={
              errors.value ? "coupon-value-error" : "coupon-value-hint"
            }
            className={`w-full min-h-[40px] rounded-lg border bg-white px-3 py-2 text-sm outline-none transition-colors duration-180 ease-out-quart focus:ring-1 focus:ring-zinc-900/20 disabled:cursor-not-allowed disabled:bg-zinc-100 ${
              errors.value
                ? "border-red-400 focus:border-red-500"
                : "border-zinc-300 focus:border-zinc-900"
            }`}
          />
          <p id="coupon-value-hint" className="mt-1 text-xs text-zinc-400">
            {valueHint}
          </p>
          {errors.value && (
            <p
              id="coupon-value-error"
              role="alert"
              className="mt-1 text-xs text-red-600"
            >
              {errors.value}
            </p>
          )}
        </div>

        {/* Max discount amount (percent only) */}
        {form.type === "PERCENT" && (
          <div>
            <label
              htmlFor="coupon-max-discount"
              className="block text-sm font-medium text-zinc-700 mb-1"
            >
              Giảm tối đa (VNĐ)
            </label>
            <input
              id="coupon-max-discount"
              name="maxDiscountAmount"
              type="number"
              min="0"
              step="any"
              value={form.maxDiscountAmount}
              onChange={handleChange}
              disabled={saving}
              placeholder="VD: 200000"
              aria-invalid={!!errors.maxDiscountAmount}
              aria-describedby={
                errors.maxDiscountAmount
                  ? "coupon-max-error"
                  : "coupon-max-hint"
              }
              className={`w-full min-h-[40px] rounded-lg border bg-white px-3 py-2 text-sm outline-none transition-colors duration-180 ease-out-quart focus:ring-1 focus:ring-zinc-900/20 disabled:cursor-not-allowed disabled:bg-zinc-100 ${
                errors.maxDiscountAmount
                  ? "border-red-400 focus:border-red-500"
                  : "border-zinc-300 focus:border-zinc-900"
              }`}
            />
            <p id="coupon-max-hint" className="mt-1 text-xs text-zinc-400">
              Số tiền giảm tối đa khi dùng coupon phần trăm
            </p>
            {errors.maxDiscountAmount && (
              <p
                id="coupon-max-error"
                role="alert"
                className="mt-1 text-xs text-red-600"
              >
                {errors.maxDiscountAmount}
              </p>
            )}
          </div>
        )}

        {/* Min order value */}
        <div>
          <label
            htmlFor="coupon-min-order"
            className="block text-sm font-medium text-zinc-700 mb-1"
          >
            Giá trị đơn tối thiểu (VNĐ)
          </label>
          <input
            id="coupon-min-order"
            name="minOrderValue"
            type="number"
            min="0"
            step="any"
            value={form.minOrderValue}
            onChange={handleChange}
            disabled={saving}
            placeholder="VD: 100000"
            aria-invalid={!!errors.minOrderValue}
            className={`w-full min-h-[40px] rounded-lg border bg-white px-3 py-2 text-sm outline-none transition-colors duration-180 ease-out-quart focus:ring-1 focus:ring-zinc-900/20 disabled:cursor-not-allowed disabled:bg-zinc-100 ${
              errors.minOrderValue
                ? "border-red-400 focus:border-red-500"
                : "border-zinc-300 focus:border-zinc-900"
            }`}
          />
          {errors.minOrderValue && (
            <p role="alert" className="mt-1 text-xs text-red-600">
              {errors.minOrderValue}
            </p>
          )}
        </div>

        {/* Usage limit */}
        <div>
          <label
            htmlFor="coupon-usage-limit"
            className="block text-sm font-medium text-zinc-700 mb-1"
          >
            Tổng lượt dùng
          </label>
          <input
            id="coupon-usage-limit"
            name="usageLimit"
            type="number"
            min="1"
            value={form.usageLimit}
            onChange={handleChange}
            disabled={saving}
            placeholder="Để trống nếu không giới hạn"
            aria-invalid={!!errors.usageLimit}
            className={`w-full min-h-[40px] rounded-lg border bg-white px-3 py-2 text-sm outline-none transition-colors duration-180 ease-out-quart focus:ring-1 focus:ring-zinc-900/20 disabled:cursor-not-allowed disabled:bg-zinc-100 ${
              errors.usageLimit
                ? "border-red-400 focus:border-red-500"
                : "border-zinc-300 focus:border-zinc-900"
            }`}
          />
          {errors.usageLimit && (
            <p role="alert" className="mt-1 text-xs text-red-600">
              {errors.usageLimit}
            </p>
          )}
        </div>

        {/* Per user limit */}
        <div>
          <label
            htmlFor="coupon-per-user-limit"
            className="block text-sm font-medium text-zinc-700 mb-1"
          >
            Giới hạn mỗi người
          </label>
          <input
            id="coupon-per-user-limit"
            name="perUserLimit"
            type="number"
            min="1"
            value={form.perUserLimit}
            onChange={handleChange}
            disabled={saving}
            placeholder="Để trống nếu không giới hạn"
            aria-invalid={!!errors.perUserLimit}
            className={`w-full min-h-[40px] rounded-lg border bg-white px-3 py-2 text-sm outline-none transition-colors duration-180 ease-out-quart focus:ring-1 focus:ring-zinc-900/20 disabled:cursor-not-allowed disabled:bg-zinc-100 ${
              errors.perUserLimit
                ? "border-red-400 focus:border-red-500"
                : "border-zinc-300 focus:border-zinc-900"
            }`}
          />
          {errors.perUserLimit && (
            <p role="alert" className="mt-1 text-xs text-red-600">
              {errors.perUserLimit}
            </p>
          )}
        </div>

        {/* Start date */}
        <div>
          <label
            htmlFor="coupon-start"
            className="block text-sm font-medium text-zinc-700 mb-1"
          >
            Ngày bắt đầu <span className="text-red-500">*</span>
          </label>
          <input
            id="coupon-start"
            name="startAt"
            type="datetime-local"
            value={form.startAt}
            onChange={handleChange}
            disabled={saving}
            aria-required="true"
            aria-invalid={!!errors.startAt}
            className={`w-full min-h-[40px] rounded-lg border bg-white px-3 py-2 text-sm outline-none transition-colors duration-180 ease-out-quart focus:ring-1 focus:ring-zinc-900/20 disabled:cursor-not-allowed disabled:bg-zinc-100 ${
              errors.startAt
                ? "border-red-400 focus:border-red-500"
                : "border-zinc-300 focus:border-zinc-900"
            }`}
          />
          {errors.startAt && (
            <p role="alert" className="mt-1 text-xs text-red-600">
              {errors.startAt}
            </p>
          )}
        </div>

        {/* End date */}
        <div>
          <label
            htmlFor="coupon-end"
            className="block text-sm font-medium text-zinc-700 mb-1"
          >
            Ngày kết thúc <span className="text-red-500">*</span>
          </label>
          <input
            id="coupon-end"
            name="endAt"
            type="datetime-local"
            value={form.endAt}
            onChange={handleChange}
            disabled={saving}
            aria-required="true"
            aria-invalid={!!errors.endAt}
            className={`w-full min-h-[40px] rounded-lg border bg-white px-3 py-2 text-sm outline-none transition-colors duration-180 ease-out-quart focus:ring-1 focus:ring-zinc-900/20 disabled:cursor-not-allowed disabled:bg-zinc-100 ${
              errors.endAt
                ? "border-red-400 focus:border-red-500"
                : "border-zinc-300 focus:border-zinc-900"
            }`}
          />
          {errors.endAt && (
            <p role="alert" className="mt-1 text-xs text-red-600">
              {errors.endAt}
            </p>
          )}
        </div>
      </div>

      {/* Separator */}
      <hr className="border-zinc-200" />

      {/* Target Scope Picker */}
      <div>
        <CouponTargetPicker
          scope={form.scope}
          targetIds={form.targetIds}
          onChange={handleTargetScopeChange}
          disabled={saving}
        />
      </div>

      {/* Active toggle */}
      <div className="flex items-center gap-3">
        <label
          htmlFor="coupon-active"
          className="relative inline-flex cursor-pointer items-center"
        >
          <input
            id="coupon-active"
            name="isActive"
            type="checkbox"
            checked={form.isActive}
            onChange={handleChange}
            disabled={saving}
            className="peer sr-only"
          />
          <div className="h-5 w-9 rounded-full border border-zinc-300 bg-zinc-200 transition-colors duration-180 ease-out-quart peer-checked:border-zinc-900 peer-checked:bg-zinc-900 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-zinc-900 peer-disabled:cursor-not-allowed peer-disabled:opacity-60" />
          <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-180 ease-out-quart peer-checked:translate-x-4" />
        </label>
        <span className="text-sm font-medium text-zinc-700">Kích hoạt</span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 border-t border-zinc-100 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors duration-180 ease-out-quart hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Huỷ
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-zinc-900 px-5 py-2 text-sm font-semibold text-white transition-colors duration-180 ease-out-quart hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:cursor-not-allowed disabled:bg-zinc-400"
        >
          {saving ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo coupon"}
        </button>
      </div>
    </form>
  );
}

export default CouponForm;
