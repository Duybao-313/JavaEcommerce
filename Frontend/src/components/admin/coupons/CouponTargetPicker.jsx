import { useState, useEffect, useCallback } from "react";
import { COUPON_SCOPE_LABEL } from "../../../services/couponService";
import CategoryPickerModal from "./CategoryPickerModal";

const SCOPE_OPTIONS = [
  { value: "ALL", label: "Toàn bộ" },
  { value: "PRODUCT", label: "Sản phẩm" },
  { value: "CATEGORY", label: "Danh mục" },
  { value: "SELLER", label: "Người bán" },
  { value: "USER", label: "Người dùng" },
];

/**
 * CouponTargetPicker — Scope selector + target ID(s) input.
 *
 * Props:
 *   scope       (string)   — current scope value
 *   targetIds   (string)   — comma-separated IDs or JSON array string
 *   onChange    (scope, targetIdsString) => void
 *   disabled    (boolean)
 *
 * When scope is "ALL", the target input is hidden.
 */
function CouponTargetPicker({
  scope = "ALL",
  targetIds = "",
  onChange,
  disabled = false,
}) {
  const [localScope, setLocalScope] = useState(scope);
  const [localIds, setLocalIds] = useState(targetIds);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    setLocalScope(scope);
  }, [scope]);

  useEffect(() => {
    setLocalIds(targetIds);
  }, [targetIds]);

  const handleScopeChange = useCallback(
    (e) => {
      const newScope = e.target.value;
      setLocalScope(newScope);
      if (onChange) {
        onChange(newScope, newScope === "ALL" ? "" : localIds);
      }
    },
    [localIds, onChange],
  );

  const handleIdsChange = useCallback(
    (e) => {
      const val = e.target.value;
      setLocalIds(val);
      if (onChange) {
        onChange(localScope, val);
      }
    },
    [localScope, onChange],
  );

  return (
    <div className="space-y-2">
      {/* Scope selector */}
      <label
        className="text-sm font-medium text-zinc-700"
        id="coupon-target-scope-label"
      >
        Phạm vi áp dụng
      </label>
      <div
        role="radiogroup"
        aria-labelledby="coupon-target-scope-label"
        className="flex flex-wrap gap-1.5"
      >
        {SCOPE_OPTIONS.map((opt) => {
          const isSelected = localScope === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              value={opt.value}
              onClick={() => {
                if (disabled) return;
                setLocalScope(opt.value);
                if (onChange) {
                  onChange(opt.value, opt.value === "ALL" ? "" : localIds);
                }
              }}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors duration-180 ease-out-quart focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 ${
                isSelected
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400"
              } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Target IDs input — hidden when scope is ALL */}
      {localScope !== "ALL" && (
        <div className="transition-all duration-200 ease-out-quart">
          {/* Category picker button — only for CATEGORY scope */}
          {localScope === "CATEGORY" && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => setPickerOpen(true)}
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 transition-colors duration-180 ease-out-quart hover:border-zinc-900 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Chọn danh mục
            </button>
          )}

          <label
            htmlFor="coupon-target-ids"
            className="block text-xs font-medium text-zinc-500 mt-2 mb-1"
          >
            ID {COUPON_SCOPE_LABEL[localScope] || "đối tượng"} (phân cách bằng
            dấu phẩy)
          </label>
          <input
            id="coupon-target-ids"
            type="text"
            value={localIds}
            onChange={handleIdsChange}
            disabled={disabled}
            placeholder={`VD: 1, 5, 12`}
            aria-describedby="target-ids-hint"
            className="w-full min-h-[40px] rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition-colors duration-180 ease-out-quart focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/20 disabled:cursor-not-allowed disabled:bg-zinc-100"
          />
          <p id="target-ids-hint" className="mt-1 text-xs text-zinc-400">
            Nhập danh sách ID đối tượng muốn áp dụng, cách nhau bằng dấu phẩy.
          </p>
        </div>
      )}

      {/* Category picker modal */}
      <CategoryPickerModal
        open={pickerOpen}
        selectedIds={
          localIds
            ? localIds
                .split(",")
                .map((s) => Number(s.trim()))
                .filter((n) => !isNaN(n))
            : []
        }
        onClose={() => setPickerOpen(false)}
        onConfirm={(ids) => {
          const idsStr = ids.join(", ");
          setLocalIds(idsStr);
          if (onChange) {
            onChange(localScope, idsStr);
          }
        }}
      />
    </div>
  );
}

export default CouponTargetPicker;
