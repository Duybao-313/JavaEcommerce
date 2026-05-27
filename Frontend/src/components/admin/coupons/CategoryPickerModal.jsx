import { useEffect, useState, useMemo, useCallback } from "react";
import { getCategories } from "../../../services/categoryService";
import toast from "react-hot-toast";

function normalize(s) {
  if (!s) return "";
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * CategoryPickerModal — Chọn danh mục cho coupon scope CATEGORY.
 *
 * Props:
 *   open          (boolean)
 *   selectedIds   (number[])  — pre-selected category IDs
 *   onClose       () => void
 *   onConfirm     (ids: number[]) => void
 *
 * Features:
 *   - Flat list grouped by parentId (parent → children)
 *   - Search by name (accent-insensitive)
 *   - Checkbox multi-select
 *   - Selected IDs box with comma-separated output + copy button
 */
function CategoryPickerModal({ open, selectedIds = [], onClose, onConfirm }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState(() => new Set(selectedIds));

  // Reset picked when modal opens with new selectedIds
  useEffect(() => {
    if (open) {
      setPicked(new Set(selectedIds));
    }
  }, [open, selectedIds]);

  // Fetch categories on open
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getCategories()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => toast.error("Không tải được danh mục"))
      .finally(() => setLoading(false));
  }, [open]);

  // Group categories: parent → children
  const grouped = useMemo(() => {
    const keyword = normalize(search);
    const filtered = keyword
      ? categories.filter((c) => normalize(c.name).includes(keyword))
      : categories;

    const roots = [];
    const childrenMap = {};

    filtered.forEach((c) => {
      if (c.parentId == null) {
        roots.push(c);
      } else {
        if (!childrenMap[c.parentId]) childrenMap[c.parentId] = [];
        childrenMap[c.parentId].push(c);
      }
    });

    // Also include parents of matched children that aren't in roots
    if (keyword) {
      filtered.forEach((c) => {
        if (c.parentId != null) {
          const parent = categories.find((p) => p.id === c.parentId);
          if (parent && !roots.find((r) => r.id === parent.id)) {
            roots.push(parent);
          }
        }
      });
    }

    return { roots, childrenMap };
  }, [categories, search]);

  const toggle = useCallback((id) => {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const pickedArray = useMemo(
    () => [...picked].sort((a, b) => a - b),
    [picked],
  );
  const pickedText = pickedArray.join(", ");

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(pickedText);
      toast.success("Đã sao chép");
    } catch {
      toast.error("Không thể sao chép");
    }
  }, [pickedText]);

  const handleConfirm = useCallback(() => {
    onConfirm(pickedArray);
    onClose();
  }, [pickedArray, onConfirm, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/50 p-4">
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl border border-zinc-200 bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3.5">
          <h3 className="text-base font-semibold text-zinc-900">
            Chọn danh mục
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 transition-colors duration-150 hover:bg-zinc-100 hover:text-zinc-600"
            aria-label="Đóng"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-zinc-100 px-5 py-3">
          <div className="relative">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
              />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm danh mục..."
              aria-label="Tìm danh mục"
              className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-9 pr-3 text-sm outline-none transition-colors duration-180 ease-out-quart focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/20"
            />
          </div>
        </div>

        {/* Category list */}
        <div className="flex-1 overflow-y-auto px-5 py-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
            </div>
          ) : grouped.roots.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-500">
              {search ? "Không tìm thấy danh mục" : "Chưa có danh mục nào"}
            </p>
          ) : (
            <div className="space-y-1">
              {grouped.roots.map((root) => {
                const children = grouped.childrenMap[root.id] || [];
                const rootChecked = picked.has(root.id);
                return (
                  <div key={root.id}>
                    {/* Root category */}
                    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 transition-colors duration-150 hover:bg-zinc-50">
                      <input
                        type="checkbox"
                        checked={rootChecked}
                        onChange={() => toggle(root.id)}
                        className="h-4 w-4 rounded border-zinc-300 text-zinc-900 accent-zinc-900"
                      />
                      <span className="text-sm font-semibold text-zinc-800">
                        {root.name}
                      </span>
                      {children.length > 0 && (
                        <span className="text-xs text-zinc-400">
                          ({children.length})
                        </span>
                      )}
                    </label>

                    {/* Children (indented) */}
                    {children.map((child) => {
                      const childChecked = picked.has(child.id);
                      return (
                        <label
                          key={child.id}
                          className="ml-6 flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors duration-150 hover:bg-zinc-50"
                        >
                          <input
                            type="checkbox"
                            checked={childChecked}
                            onChange={() => toggle(child.id)}
                            className="h-4 w-4 rounded border-zinc-300 text-zinc-900 accent-zinc-900"
                          />
                          <span className="text-sm text-zinc-700">
                            {child.name}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected IDs box + actions */}
        <div className="border-t border-zinc-200 px-5 py-3.5 space-y-3">
          {/* Selected output */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-zinc-500">
                Đã chọn {picked.size} danh mục
              </span>
              {picked.size > 0 && (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold text-zinc-600 transition-colors duration-150 hover:bg-zinc-100 hover:text-zinc-900"
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
                      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                    />
                  </svg>
                  Sao chép
                </button>
              )}
            </div>
            <div className="min-h-[38px] w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-mono text-zinc-700 break-all">
              {pickedText || (
                <span className="text-zinc-400">Chưa chọn danh mục nào</span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors duration-180 ease-out-quart hover:bg-zinc-50"
            >
              Huỷ
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="rounded-lg bg-zinc-900 px-5 py-2 text-sm font-semibold text-white transition-colors duration-180 ease-out-quart hover:bg-zinc-700"
            >
              Xác nhận ({picked.size})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CategoryPickerModal;
