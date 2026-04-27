import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getCategories } from '../services/categoryService'
import {
  deleteSellerProduct,
  getProductsBySeller,
  updateSellerProduct,
} from '../services/productService'
import { getAuthSession, isSellerSession } from '../services/sessionService'

function formatPrice(value) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value || 0)
}

function SellerProductsPage() {
  const navigate = useNavigate()
  const [session, setSession] = useState(() => getAuthSession())
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    status: 'ACTIVE',
    categoryId: '',
  })

  const sellerId = useMemo(
    () => session?.user?.id || session?.id || session?.sellerId || null,
    [session],
  )

  useEffect(() => {
    const current = getAuthSession()
    setSession(current)

    if (!current?.token) {
      navigate('/login', { replace: true })
      return
    }

    if (!isSellerSession(current)) {
      toast.error('Chỉ seller mới có quyền truy cập trang này')
      navigate('/products', { replace: true })
      return
    }

    if (!sellerId) {
      toast.error('Không tìm thấy thông tin seller trong phiên đăng nhập')
      navigate('/products', { replace: true })
      return
    }

    let cancelled = false

    async function loadData() {
      setLoading(true)
      try {
        const [sellerProducts, categoryList] = await Promise.all([
          getProductsBySeller(sellerId),
          getCategories().catch(() => []),
        ])

        if (!cancelled) {
          setProducts(sellerProducts)
          setCategories(categoryList)
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(error?.message || 'Không thể tải sản phẩm đã tạo')
          setProducts([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      cancelled = true
    }
  }, [navigate, sellerId])

  const startEdit = (product) => {
    setEditingId(product.id)
    setEditForm({
      name: product?.name || '',
      description: product?.description || '',
      price: String(product?.price ?? ''),
      stock: String(product?.stock ?? ''),
      status: product?.status || 'ACTIVE',
      categoryId: product?.categoryId ? String(product.categoryId) : '',
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({
      name: '',
      description: '',
      price: '',
      stock: '',
      status: 'ACTIVE',
      categoryId: '',
    })
  }

  const handleEditChange = (event) => {
    const { name, value } = event.target
    setEditForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleUpdate = async (productId) => {
    const payload = {
      name: editForm.name.trim(),
      description: editForm.description.trim(),
      price: Number(editForm.price),
      stock: Number(editForm.stock),
      status: editForm.status,
      categoryId: editForm.categoryId ? Number(editForm.categoryId) : null,
    }

    if (!payload.name || !Number.isFinite(payload.price) || payload.price <= 0) {
      toast.error('Vui lòng nhập tên và giá sản phẩm hợp lệ')
      return
    }

    if (!Number.isFinite(payload.stock) || payload.stock < 0) {
      toast.error('Tồn kho không hợp lệ')
      return
    }

    setSavingId(productId)
    try {
      const updated = await updateSellerProduct(productId, payload)
      setProducts((prev) =>
        prev.map((item) => (item.id === productId ? { ...item, ...updated } : item)),
      )
      toast.success('Cập nhật sản phẩm thành công')
      cancelEdit()
    } catch (error) {
      toast.error(error?.message || 'Không thể cập nhật sản phẩm')
    } finally {
      setSavingId(null)
    }
  }

  const handleDelete = async (productId) => {
    const confirmed = window.confirm('Bạn có chắc muốn xóa (ẩn) sản phẩm này?')
    if (!confirmed) return

    setSavingId(productId)
    try {
      await deleteSellerProduct(productId)
      setProducts((prev) => prev.filter((item) => item.id !== productId))
      toast.success('Xóa sản phẩm thành công')
    } catch (error) {
      toast.error(error?.message || 'Không thể xóa sản phẩm')
    } finally {
      setSavingId(null)
    }
  }

  if (!session?.token || !isSellerSession(session)) return null

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f7f4_0%,#f4f4ef_45%,#ffffff_100%)] px-6 py-10">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">SplitGo Seller</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">Sản phẩm đã tạo</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/products/create"
              className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-zinc-700"
            >
              Tạo sản phẩm
            </Link>
            <Link
              to="/products"
              className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-800 hover:border-zinc-900"
            >
              Về sản phẩm
            </Link>
          </div>
        </header>

        {loading && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600">
            Đang tải sản phẩm của bạn...
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600">
            Bạn chưa tạo sản phẩm nào.
          </div>
        )}

        {!loading && products.length > 0 && (
          <div className="space-y-4">
            {products.map((product) => {
              const isEditing = editingId === product.id
              const isSaving = savingId === product.id

              return (
                <article
                  key={product.id}
                  className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
                >
                  {!isEditing && (
                    <div>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                            {product.categoryName || 'Chưa có danh mục'}
                          </p>
                          <h2 className="mt-1 text-xl font-semibold text-zinc-900">{product.name}</h2>
                        </div>
                        <span className="rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-600">
                          {product.status}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-zinc-600">{product.description || '-'}</p>

                      <div className="mt-4 grid gap-2 text-sm text-zinc-700 md:grid-cols-2 lg:grid-cols-4">
                        <p>Giá: <span className="font-semibold text-zinc-900">{formatPrice(product.price)}</span></p>
                        <p>Tồn kho: <span className="font-semibold text-zinc-900">{product.stock}</span></p>
                        <p>Lượt xem: <span className="font-semibold text-zinc-900">{Number(product?.viewCount || 0).toLocaleString('vi-VN')}</span></p>
                        <p>ID: <span className="font-semibold text-zinc-900">#{product.id}</span></p>
                      </div>

                      <div className="mt-5 flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => startEdit(product)}
                          className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-800 hover:border-zinc-900"
                        >
                          Cập nhật
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={isSaving}
                          className="rounded-full border border-red-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-red-700 hover:border-red-500 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {isSaving ? 'Đang xóa...' : 'Xóa'}
                        </button>
                      </div>
                    </div>
                  )}

                  {isEditing && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Cập nhật sản phẩm #{product.id}</p>
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <label className="text-sm text-zinc-700">
                          Tên sản phẩm
                          <input
                            name="name"
                            value={editForm.name}
                            onChange={handleEditChange}
                            className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
                          />
                        </label>

                        <label className="text-sm text-zinc-700">
                          Giá
                          <input
                            type="number"
                            min="1"
                            name="price"
                            value={editForm.price}
                            onChange={handleEditChange}
                            className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
                          />
                        </label>

                        <label className="text-sm text-zinc-700">
                          Tồn kho
                          <input
                            type="number"
                            min="0"
                            name="stock"
                            value={editForm.stock}
                            onChange={handleEditChange}
                            className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
                          />
                        </label>

                        <label className="text-sm text-zinc-700">
                          Trạng thái
                          <select
                            name="status"
                            value={editForm.status}
                            onChange={handleEditChange}
                            className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
                          >
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="INACTIVE">INACTIVE</option>
                          </select>
                        </label>

                        <label className="text-sm text-zinc-700 md:col-span-2">
                          Danh mục
                          <select
                            name="categoryId"
                            value={editForm.categoryId}
                            onChange={handleEditChange}
                            className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
                          >
                            <option value="">Giữ nguyên danh mục hiện tại</option>
                            {categories.map((category) => (
                              <option key={category.id} value={String(category.id)}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="text-sm text-zinc-700 md:col-span-2">
                          Mô tả
                          <textarea
                            name="description"
                            rows={3}
                            value={editForm.description}
                            onChange={handleEditChange}
                            className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
                          />
                        </label>
                      </div>

                      <div className="mt-4 flex items-center gap-2">
                        <button
                          onClick={() => handleUpdate(product.id)}
                          disabled={isSaving}
                          className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {isSaving ? 'Đang lưu...' : 'Lưu cập nhật'}
                        </button>
                        <button
                          onClick={cancelEdit}
                          disabled={isSaving}
                          className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-800 hover:border-zinc-900 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default SellerProductsPage

