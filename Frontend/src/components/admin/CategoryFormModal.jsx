import { useEffect, useState } from "react"

const emptyForm = {
  name: "",
  description: "",
  parentId: "",
  imageUrl: "",
  sortOrder: 0,
  isActive: true,
}

export default function CategoryFormModal({
  open,
  category = null,
  parentId = null,
  allCategories = [],
  loading = false,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})

  const isEdit = !!category

  useEffect(() => {
    if (open) {
      if (category) {
        setForm({
          name: category.name || "",
          description: category.description || "",
          parentId: category.parentId ? String(category.parentId) : "",
          imageUrl: category.imageUrl || "",
          sortOrder: category.sortOrder ?? 0,
          isActive: category.isActive ?? true,
        })
      } else {
        setForm({
          ...emptyForm,
          parentId: parentId ? String(parentId) : "",
        })
      }
      setErrors({})
    }
  }, [open, category, parentId])

  if (!open) return null

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  function validate() {
    const next = {}
    if (!form.name || !form.name.trim()) {
      next.name = "Tên danh mục không được để trống"
    }
    if (form.name && form.name.trim().length > 255) {
      next.name = "Tên danh mục quá dài (tối đa 255 ký tự)"
    }
    if (form.description && form.description.length > 512) {
      next.description = "Mô tả quá dài (tối đa 512 ký tự)"
    }
    if (form.sortOrder !== "" && (isNaN(Number(form.sortOrder)) || Number(form.sortOrder) < 0)) {
      next.sortOrder = "Thứ tự sắp xếp phải là số >= 0"
    }
    // Prevent self-parent
    if (isEdit && form.parentId && String(form.parentId) === String(category.id)) {
      next.parentId = "Không thể chọn chính danh mục này làm cha"
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return

    const body = {
      name: form.name.trim(),
      description: form.description?.trim() || null,
      parentId: form.parentId ? Number(form.parentId) : null,
      imageUrl: form.imageUrl?.trim() || null,
      sortOrder: form.sortOrder != null ? Number(form.sortOrder) : 0,
      isActive: form.isActive,
    }

    onSubmit(body)
  }

  // Filter out self + descendants from parent options
  function getDescendantIds(cat) {
    const ids = [cat.id]
    if (cat.children) {
      cat.children.forEach((c) => {
        ids.push(...getDescendantIds(c))
      })
    }
    return ids
  }

  const excludedIds = isEdit && category ? getDescendantIds(category) : []
  const parentOptions = allCategories.filter((c) => !excludedIds.includes(c.id))

  // Flatten tree for dropdown
  function flattenTree(cats, depth = 0) {
    const result = []
    cats.forEach((c) => {
      result.push({ ...c, _depth: depth })
      if (c.children) {
        result.push(...flattenTree(c.children, depth + 1))
      }
    })
    return result
  }

  const flatOptions = flattenTree(parentOptions)

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-zinc-900/50 p-4 pt-[10vh]">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
          <h2 className="text-lg font-bold text-zinc-900">
            {isEdit ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
            aria-label="Đóng"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {/* Name */}
          <div>
            <label htmlFor="cat-name" className="block text-sm font-semibold text-zinc-700 mb-1.5">
              Tên danh mục <span className="text-red-500">*</span>
            </label>
            <input
              id="cat-name"
              type="text"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Nhập tên danh mục"
              maxLength={255}
              className={`w-full rounded-xl border px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 ${
                errors.name ? "border-red-300 bg-red-50" : "border-zinc-200"
              }`}
              autoFocus
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="cat-desc" className="block text-sm font-semibold text-zinc-700 mb-1.5">
              Mô tả
            </label>
            <textarea
              id="cat-desc"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Mô tả ngắn về danh mục"
              rows={3}
              maxLength={512}
              className={`w-full rounded-xl border px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 resize-none ${
                errors.description ? "border-red-300 bg-red-50" : "border-zinc-200"
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Parent Category */}
          <div>
            <label htmlFor="cat-parent" className="block text-sm font-semibold text-zinc-700 mb-1.5">
              Danh mục cha
            </label>
            <select
              id="cat-parent"
              value={form.parentId}
              onChange={(e) => handleChange("parentId", e.target.value)}
              className={`w-full rounded-xl border px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 ${
                errors.parentId ? "border-red-300 bg-red-50" : "border-zinc-200"
              }`}
            >
              <option value="">-- Không có (Danh mục gốc) --</option>
              {flatOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {"\u00A0\u00A0".repeat(c._depth)}
                  {c._depth > 0 ? "└ " : ""}
                  {c.name}
                </option>
              ))}
            </select>
            {errors.parentId && (
              <p className="mt-1 text-xs text-red-600">{errors.parentId}</p>
            )}
          </div>

          {/* Image URL */}
          <div>
            <label htmlFor="cat-image" className="block text-sm font-semibold text-zinc-700 mb-1.5">
              URL Hình ảnh
            </label>
            <input
              id="cat-image"
              type="url"
              value={form.imageUrl}
              onChange={(e) => handleChange("imageUrl", e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
            />
          </div>

          {/* Sort Order & Active Toggle */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="cat-sort" className="block text-sm font-semibold text-zinc-700 mb-1.5">
                Thứ tự
              </label>
              <input
                id="cat-sort"
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(e) => handleChange("sortOrder", e.target.value)}
                className={`w-full rounded-xl border px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 ${
                  errors.sortOrder ? "border-red-300 bg-red-50" : "border-zinc-200"
                }`}
              />
              {errors.sortOrder && (
                <p className="mt-1 text-xs text-red-600">{errors.sortOrder}</p>
              )}
            </div>

            <div className="flex flex-col justify-end">
              <label className="relative inline-flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => handleChange("isActive", e.target.checked)}
                  className="peer sr-only"
                />
                <div className="h-6 w-11 rounded-full bg-zinc-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-all peer-checked:bg-emerald-600 peer-checked:after:translate-x-full" />
                <span className="text-sm font-semibold text-zinc-700">
                  {form.isActive ? "Đang hiển thị" : "Đang ẩn"}
                </span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t border-zinc-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-zinc-300 px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Đang xử lý...
                </span>
              ) : isEdit ? (
                "Cập nhật"
              ) : (
                "Tạo danh mục"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
