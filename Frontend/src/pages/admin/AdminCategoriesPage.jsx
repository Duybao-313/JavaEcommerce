import { useCallback, useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import CategoryTreeNode from "../../components/admin/CategoryTreeNode"
import CategoryFormModal from "../../components/admin/CategoryFormModal"
import ConfirmationModal from "../../components/admin/ConfirmationModal"
import {
  getCategoryTree,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../services/categoryService"

const ERROR_MESSAGES = {
  CATEGORY_NOT_FOUND: "Danh mục không tồn tại",
  CATEGORY_EXIST: "Tên danh mục đã tồn tại",
  CATEGORY_HAS_PRODUCTS:
    "⚠️ Không thể xóa danh mục có sản phẩm. Vui lòng xóa hoặc di chuyển hết sản phẩm trước.",
  CATEGORY_HAS_CHILDREN:
    "ℹ️ Danh mục này có danh mục con. Bạn có chắc chắn muốn xóa?",
}

function AdminCategoriesPage() {
  // ---- State ----
  const [tree, setTree] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all") // all | root | hasProducts | inactive

  // Modal states
  const [formOpen, setFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [addChildParentId, setAddChildParentId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // ---- Data Fetching ----
  const fetchTree = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getCategoryTree()
      setTree(data || [])
    } catch (err) {
      const msg =
        ERROR_MESSAGES[err?.body?.errorCode] ||
        err?.message ||
        "Lỗi kết nối. Vui lòng thử lại."
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTree()
  }, [fetchTree])

  // ---- Flatten tree for search/filter ----
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

  const filteredTree = useMemo(() => {
    const keyword = search.toLowerCase().trim()

    function filterNode(cat) {
      const matchesSearch =
        !keyword ||
        cat.name?.toLowerCase().includes(keyword) ||
        (cat.slug || "").toLowerCase().includes(keyword)

      const matchesFilter =
        filter === "all" ||
        (filter === "root" && !cat.parentId) ||
        (filter === "hasProducts" && (cat.totalProductCount ?? cat.productCount ?? 0) > 0) ||
        (filter === "inactive" && !cat.isActive)

      // Recursively filter children first
      const filteredChildren = cat.children
        ? cat.children.map(filterNode).filter(Boolean)
        : []

      const hasMatchingChildren = filteredChildren.length > 0

      // Show parent if it matches search+filter, OR if it has matching children
      if ((matchesSearch && matchesFilter) || hasMatchingChildren) {
        return { ...cat, children: filteredChildren }
      }

      return null
    }

    return tree.map(filterNode).filter(Boolean)
  }, [tree, search, filter])

  // ---- Stats ----
  const stats = useMemo(() => {
    const flat = flattenTree(tree)
    return {
      total: flat.length,
      root: flat.filter((c) => !c.parentId).length,
      withProducts: flat.filter((c) => (c.totalProductCount ?? c.productCount ?? 0) > 0).length,
      inactive: flat.filter((c) => !c.isActive).length,
    }
  }, [tree])

  // ---- Handlers ----
  function handleOpenCreate() {
    setEditingCategory(null)
    setAddChildParentId(null)
    setFormOpen(true)
  }

  function handleOpenEdit(category) {
    setEditingCategory(category)
    setAddChildParentId(null)
    setFormOpen(true)
  }

  function handleOpenAddChild(parentCategory) {
    setEditingCategory(null)
    setAddChildParentId(parentCategory.id)
    setFormOpen(true)
  }

  function handleCloseForm() {
    setFormOpen(false)
    setEditingCategory(null)
    setAddChildParentId(null)
  }

  async function handleFormSubmit(body) {
    setSaving(true)
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, body)
        toast.success("Cập nhật danh mục thành công")
      } else {
        await createCategory(body, addChildParentId)
        toast.success("Tạo danh mục thành công")
      }
      handleCloseForm()
      await fetchTree()
    } catch (err) {
      const errCode = err?.body?.errorCode || err?.body?.code
      const msg =
        ERROR_MESSAGES[errCode] || err?.message || "Lỗi kết nối. Vui lòng thử lại."
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  function handleOpenDelete(category) {
    setDeleteTarget(category)
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await deleteCategory(deleteTarget.id)
      toast.success(`Đã xóa danh mục "${deleteTarget.name}"`)
      setDeleteTarget(null)
      await fetchTree()
    } catch (err) {
      const errCode = err?.body?.errorCode || err?.body?.code
      const msg =
        ERROR_MESSAGES[errCode] || err?.message || "Lỗi kết nối. Vui lòng thử lại."
      toast.error(msg)
    } finally {
      setDeleteLoading(false)
    }
  }

  // ---- Flat all categories for parent dropdown ----
  const allCategoriesFlat = useMemo(() => flattenTree(tree), [tree])

  // ---- Tree node render helpers ----
  function renderTree(cats) {
    return cats.map((cat) => (
      <CategoryTreeNode
        key={cat.id}
        category={cat}
        depth={0}
        onEdit={handleOpenEdit}
        onAddChild={handleOpenAddChild}
        onDelete={handleOpenDelete}
      />
    ))
  }

  // ---- Skeleton ----
  function SkeletonRow() {
    return (
      <div className="flex animate-pulse items-center gap-3 px-4 py-3">
        <div className="h-6 w-6 rounded-md bg-zinc-200" />
        <div className="h-4 w-8 rounded bg-zinc-200" />
        <div className="h-4 flex-1 rounded bg-zinc-200" />
        <div className="h-5 w-16 rounded-full bg-zinc-200" />
        <div className="flex gap-1">
          <div className="h-8 w-8 rounded-lg bg-zinc-200" />
          <div className="h-8 w-8 rounded-lg bg-zinc-200" />
          <div className="h-8 w-8 rounded-lg bg-zinc-200" />
        </div>
      </div>
    )
  }

  // ---- Empty State ----
  function EmptyState() {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 text-6xl" aria-hidden="true">
          📂
        </div>
        <h3 className="text-lg font-semibold text-zinc-900">
          Chưa có danh mục nào
        </h3>
        <p className="mt-1 max-w-sm text-sm text-zinc-500">
          Tạo danh mục đầu tiên để bắt đầu tổ chức sản phẩm của bạn.
        </p>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="mt-5 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
        >
          + Tạo danh mục đầu tiên
        </button>
      </div>
    )
  }

  // ---- Render ----
  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Quản lý Danh mục</h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            Tổ chức cây danh mục sản phẩm
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm danh mục
        </button>
      </div>

      {/* Stats Bar */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Tổng", value: stats.total, color: "bg-zinc-100 text-zinc-700" },
          { label: "Danh mục gốc", value: stats.root, color: "bg-amber-50 text-amber-700" },
          { label: "Có sản phẩm", value: stats.withProducts, color: "bg-emerald-50 text-emerald-700" },
          { label: "Đang ẩn", value: stats.inactive, color: "bg-zinc-100 text-zinc-500" },
        ].map((s) => (
          <div
            key={s.label}
            className={`rounded-xl px-4 py-3 ${s.color}`}
          >
            <p className="text-xs font-medium uppercase tracking-wide opacity-70">
              {s.label}
            </p>
            <p className="mt-1 text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <svg
            className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm danh mục..."
            className="w-full rounded-xl border border-zinc-200 py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
          />
        </div>

        {/* Filter */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
        >
          <option value="all">Tất cả danh mục</option>
          <option value="root">Danh mục gốc</option>
          <option value="hasProducts">Có sản phẩm</option>
          <option value="inactive">Đang ẩn</option>
        </select>
      </div>

      {/* Tree / Content */}
      <div className="rounded-2xl border border-zinc-200 bg-white">
        {loading ? (
          <div className="divide-y divide-zinc-100">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : filteredTree.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="py-2" role="tree" aria-label="Cây danh mục">
            {renderTree(filteredTree)}
          </div>
        )}
      </div>

      {/* Form Modal */}
      <CategoryFormModal
        open={formOpen}
        category={editingCategory}
        parentId={addChildParentId}
        allCategories={allCategoriesFlat}
        loading={saving}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={!!deleteTarget}
        title="Xóa danh mục"
        message={
          deleteTarget
            ? (() => {
                const total = deleteTarget.totalProductCount ?? deleteTarget.productCount ?? 0
                const direct = deleteTarget.productCount ?? 0
                const children = deleteTarget.children?.length ?? 0
                let msg = `Bạn có chắc chắn muốn xóa danh mục "${deleteTarget.name}"? Hành động này không thể hoàn tác.`
                if (total > 0) {
                  msg += `\n\n⚠️ Danh mục này có ${total} sản phẩm${direct !== total ? ` (${direct} trực tiếp + ${total - direct} từ danh mục con)` : ""}.`
                }
                if (children > 0) {
                  msg += `\n\n📁 Có ${children} danh mục con cũng sẽ bị xóa.`
                }
                return msg
              })()
            : ""
        }
        confirmText="Xóa"
        cancelText="Hủy"
        danger
        loading={deleteLoading}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}

export default AdminCategoriesPage
