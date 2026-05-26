import { useState } from "react"

export default function CategoryTreeNode({
  category,
  depth = 0,
  onEdit,
  onAddChild,
  onDelete,
}) {
  const [collapsed, setCollapsed] = useState(true)
  const hasChildren = category.children && category.children.length > 0
  const totalProducts = category.totalProductCount ?? category.productCount ?? 0
  const directProducts = category.productCount ?? 0
  const canDelete = totalProducts === 0
  const childCount = category.children?.length ?? 0
  const hasChildrenProducts = totalProducts > directProducts

  return (
    <div className="select-none">
      {/* Node Row */}
      <div
        className={`group flex items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-zinc-50 ${
          depth > 0 ? "ml-8 border-l-2 border-zinc-100 pl-6" : ""
        }`}
        style={{ paddingLeft: depth > 0 ? `${24 + depth * 8}px` : undefined }}
        role="treeitem"
        aria-expanded={hasChildren ? !collapsed : undefined}
        aria-level={depth + 1}
      >
        {/* Collapse Toggle */}
        <button
          type="button"
          onClick={() => hasChildren && setCollapsed(!collapsed)}
          disabled={!hasChildren}
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors ${
            hasChildren
              ? "text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700"
              : "text-zinc-300"
          }`}
          aria-label={collapsed ? "Mở rộng" : "Thu gọn"}
        >
          <svg
            className={`h-4 w-4 transition-transform duration-200 ${
              collapsed ? "" : "rotate-90"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {/* Category Icon */}
        <span
          className={`shrink-0 text-lg ${hasChildren ? "text-amber-500" : "text-zinc-400"}`}
          aria-hidden="true"
        >
          {hasChildren ? "📁" : "📄"}
        </span>

        {/* Name & Slug */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-zinc-900">
              {category.name}
            </span>
            {!category.isActive && (
              <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                Ẩn
              </span>
            )}
          </div>
          {category.slug && (
            <p className="truncate text-xs text-zinc-400">/{category.slug}</p>
          )}
        </div>

        {/* Product Count Badge */}
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
            totalProducts > 0
              ? "bg-emerald-50 text-emerald-700"
              : "bg-zinc-100 text-zinc-500"
          }`}
          title={
            hasChildrenProducts
              ? `${directProducts} sp trực tiếp + ${totalProducts - directProducts} sp từ danh mục con = ${totalProducts} tổng`
              : `${totalProducts} sản phẩm trong danh mục này`
          }
        >
          📊 {totalProducts} sp
        </span>

        {/* Child Count */}
        {childCount > 0 && (
          <span className="shrink-0 text-xs text-zinc-400">
            {childCount} con
          </span>
        )}

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={() => onEdit(category)}
            className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-700"
            title="Chỉnh sửa danh mục"
            aria-label={`Chỉnh sửa ${category.name}`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => onAddChild(category)}
            className="rounded-lg p-1.5 text-emerald-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
            title="Thêm danh mục con"
            aria-label={`Thêm danh mục con cho ${category.name}`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          {canDelete ? (
            <button
              type="button"
              onClick={() => onDelete(category)}
              className="rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
              title="Xóa danh mục"
              aria-label={`Xóa ${category.name}`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          ) : (
            <span
              className="rounded-lg p-1.5 text-zinc-300"
              title={`Không thể xóa danh mục có ${totalProducts} sản phẩm (bao gồm danh mục con). Vui lòng xóa hoặc di chuyển hết sản phẩm trước.`}
              aria-label={`Không thể xóa ${category.name} vì có ${totalProducts} sản phẩm`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </span>
          )}
        </div>
      </div>

      {/* Children (recursive) */}
      {hasChildren && !collapsed && (
        <div role="group">
          {category.children.map((child) => (
            <CategoryTreeNode
              key={child.id}
              category={child}
              depth={depth + 1}
              onEdit={onEdit}
              onAddChild={onAddChild}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
