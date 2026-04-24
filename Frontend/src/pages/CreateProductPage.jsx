import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getCategories } from '../services/categoryService'
import { createProductWithImage } from '../services/productService'
import { getAuthSession, isSellerSession } from '../services/sessionService'

const initialForm = {
  name: '',
  description: '',
  price: '',
  stock: '',
  categoryId: '',
  categoryName: '',
}

function CreateProductPage() {
  const navigate = useNavigate()
  const [session, setSession] = useState(() => getAuthSession())
  const [categories, setCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [form, setForm] = useState(initialForm)
  const [imageFile, setImageFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const isSeller = useMemo(() => isSellerSession(session), [session])
  const useCustomCategory = form.categoryId === 'custom'

  useEffect(() => {
    const nextSession = getAuthSession()
    setSession(nextSession)

    if (!nextSession?.token) {
      navigate('/login', { replace: true })
      return
    }

    if (!isSellerSession(nextSession)) {
      toast.error('Chỉ seller mới có quyền tạo sản phẩm')
      navigate('/products', { replace: true })
      return
    }

    let cancelled = false
    async function loadCategories() {
      setLoadingCategories(true)
      try {
        const items = await getCategories()
        if (!cancelled) setCategories(items)
      } catch (err) {
        if (!cancelled) {
          toast.error(err?.message || 'Không thể tải danh mục')
          setCategories([])
        }
      } finally {
        if (!cancelled) setLoadingCategories(false)
      }
    }

    loadCategories()

    return () => {
      cancelled = true
    }
  }, [navigate])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] || null
    setImageFile(file)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      categoryId: useCustomCategory ? null : Number(form.categoryId || 0),
      categoryName: useCustomCategory ? form.categoryName.trim() : '',
    }

    if (!payload.name || !Number.isFinite(payload.price) || payload.price <= 0 || !Number.isFinite(payload.stock) || payload.stock < 0) {
      toast.error('Vui lòng nhập đúng tên, giá và tồn kho')
      return
    }

    if (!useCustomCategory && !payload.categoryId) {
      toast.error('Vui lòng chọn danh mục')
      return
    }

    if (useCustomCategory && !payload.categoryName) {
      toast.error('Vui lòng nhập tên danh mục mới')
      return
    }

    setSubmitting(true)
    try {
      await createProductWithImage(payload, imageFile)
      toast.success('Tạo sản phẩm thành công')
      navigate('/products')
    } catch (err) {
      toast.error(err?.message || 'Không thể tạo sản phẩm')
    } finally {
      setSubmitting(false)
    }
  }

  if (!session?.token || !isSeller) return null

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f7f4_0%,#f4f4ef_45%,#ffffff_100%)] px-6 py-10">
      <div className="mx-auto w-full max-w-4xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">SplitGo Seller</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">Tạo sản phẩm mới</h1>
          </div>
          <Link to="/products" className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-800 hover:border-zinc-900">
            Quay lại sản phẩm
          </Link>
        </header>

        <form onSubmit={handleSubmit} className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-zinc-700">
              Tên sản phẩm
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
              />
            </label>

            <label className="text-sm text-zinc-700">
              Giá (VND)
              <input
                name="price"
                type="number"
                min="1"
                value={form.price}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
              />
            </label>

            <label className="text-sm text-zinc-700">
              Tồn kho
              <input
                name="stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
              />
            </label>

            <label className="text-sm text-zinc-700">
              Danh mục
              <select
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
                disabled={loadingCategories}
                className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
              >
                <option value="">Chọn danh mục</option>
                {categories.map((category) => (
                  <option key={category.id} value={String(category.id)}>
                    {category.name}
                  </option>
                ))}
                <option value="custom">Tự nhập danh mục mới</option>
              </select>
            </label>

            {useCustomCategory && (
              <label className="text-sm text-zinc-700 md:col-span-2">
                Danh mục mới
                <input
                  name="categoryName"
                  value={form.categoryName}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
                />
              </label>
            )}

            <label className="text-sm text-zinc-700 md:col-span-2">
              Mô tả
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
              />
            </label>

            <label className="text-sm text-zinc-700 md:col-span-2">
              Ảnh sản phẩm
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? 'Đang tạo...' : 'Tạo sản phẩm'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CreateProductPage

