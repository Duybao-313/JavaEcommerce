import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { getProducts } from '../services/productService'
import { getCategories } from '../services/categoryService'

const listVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: 'easeOut' },
  },
}

function formatPrice(value) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value || 0)
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function ProductSection() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [stockFilter, setStockFilter] = useState('all')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [priceSort, setPriceSort] = useState('default')
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadProducts() {
      setLoading(true)
      setError('')

      try {
        const items = await getProducts()

        if (!cancelled) {
          setProducts(items)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || 'Đã có lỗi khi tải sản phẩm')
          setProducts([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadProducts()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadCategories() {
      try {
        const items = await getCategories()
        if (!cancelled) {
          setCategories(items)
        }
      } catch {
        if (!cancelled) {
          setCategories([])
        }
      }
    }

    loadCategories()

    return () => {
      cancelled = true
    }
  }, [])

  const filteredProducts = useMemo(() => {
    const keyword = normalizeText(searchTerm)
    const min = Number(minPrice)
    const max = Number(maxPrice)
    const hasMin = Number.isFinite(min) && min > 0
    const hasMax = Number.isFinite(max) && max > 0

    const result = products.filter((product) => {
      const productName = normalizeText(product?.name)
      const matchName = !keyword || productName.includes(keyword)

      const categoryId = String(product?.categoryId || '')
      const matchCategory = selectedCategory === 'all' || categoryId === selectedCategory

      const stock = Number(product?.stock || 0)
      const matchStock =
        stockFilter === 'all' ||
        (stockFilter === 'inStock' && stock > 0) ||
        (stockFilter === 'outOfStock' && stock <= 0) ||
        (stockFilter === 'lowStock' && stock > 0 && stock <= 10)

      const price = Number(product?.price || 0)
      const matchMinPrice = !hasMin || price >= min
      const matchMaxPrice = !hasMax || price <= max

      return matchName && matchCategory && matchStock && matchMinPrice && matchMaxPrice
    })

    if (priceSort === 'asc') {
      result.sort((a, b) => Number(a?.price || 0) - Number(b?.price || 0))
    }

    if (priceSort === 'desc') {
      result.sort((a, b) => Number(b?.price || 0) - Number(a?.price || 0))
    }

    return result
  }, [products, searchTerm, selectedCategory, stockFilter, minPrice, maxPrice, priceSort])

  return (
    <section id="products" className="mt-14">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Sản phẩm</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">Danh sách sản phẩm mới nhất</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsFilterPanelOpen((prev) => !prev)}
            className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-800 hover:border-zinc-900"
          >
            {isFilterPanelOpen ? 'Ẩn bộ lọc' : 'Bộ lọc'}
          </button>
        </div>
      </div>

      {isFilterPanelOpen && (
      <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <div className="md:col-span-2 lg:col-span-3">
            <label htmlFor="product-search" className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Tìm kiếm theo tên sản phẩm
            </label>
            <input
              id="product-search"
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Nhập tên sản phẩm..."
              className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900"
            />
          </div>

          <div>
            <label htmlFor="category-filter" className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Danh mục
            </label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900"
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map((category) => (
                <option key={category.id} value={String(category.id)}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="stock-filter" className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Số lượng
            </label>
            <select
              id="stock-filter"
              value={stockFilter}
              onChange={(event) => setStockFilter(event.target.value)}
              className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900"
            >
              <option value="all">Tất cả</option>
              <option value="inStock">Còn hàng</option>
              <option value="outOfStock">Hết hàng</option>
              <option value="lowStock">Sắp hết (1-10)</option>
            </select>
          </div>

          <div>
            <label htmlFor="price-sort" className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Giá tiền
            </label>
            <select
              id="price-sort"
              value={priceSort}
              onChange={(event) => setPriceSort(event.target.value)}
              className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900"
            >
              <option value="default">Mặc định</option>
              <option value="asc">Thấp đến cao</option>
              <option value="desc">Cao đến thấp</option>
            </select>
          </div>

          <div>
            <label htmlFor="min-price" className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Giá từ
            </label>
            <input
              id="min-price"
              type="number"
              min="0"
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              placeholder="0"
              className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900"
            />
          </div>

          <div>
            <label htmlFor="max-price" className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Giá đến
            </label>
            <input
              id="max-price"
              type="number"
              min="0"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              placeholder="99999999"
              className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900"
            />
          </div>
        </div>
      </div>
      )}

      {loading && (
        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600">
          Đang tải sản phẩm...
        </div>
      )}

      {!loading && error && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Không thể tải sản phẩm: {error}
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600">
          Chưa có sản phẩm nào để hiển thị.
        </div>
      )}

      {!loading && !error && products.length > 0 && filteredProducts.length === 0 && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
          Không tìm thấy sản phẩm phù hợp với từ khóa "{searchTerm.trim()}".
        </div>
      )}

      {!loading && !error && filteredProducts.length > 0 && (
        <motion.div
          variants={listVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-6 grid gap-4 md:grid-cols-2"
        >
          {filteredProducts.map((product) => (
            <motion.article
              key={product.id}
              variants={itemVariants}
              className="overflow-hidden rounded-2xl border border-zinc-200 bg-white"
            >
              <div className="h-44 bg-zinc-100">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-200 to-zinc-100 text-sm font-semibold text-zinc-500">
                    Chưa có ảnh sản phẩm
                  </div>
                )}
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold text-zinc-900">{product.name}</h3>
                  <span className="rounded-full border border-zinc-200 bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-600">
                    {product.status}
                  </span>
                </div>

                <p className="mt-2 line-clamp-2 text-sm text-zinc-600">{product.description}</p>

                <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-zinc-600">
                  <p>Danh mục: <span className="font-medium text-zinc-900">{product.categoryName}</span></p>
                  <p>Kho: <span className="font-medium text-zinc-900">{product.stock}</span></p>
                  <p>Người bán: <span className="font-medium text-zinc-900">{product.sellerUsername}</span></p>
                  <p>ID: <span className="font-medium text-zinc-900">#{product.id}</span></p>
                </div>

                <div className="mt-5 flex items-center justify-between">
                   <p className="text-xl font-semibold text-zinc-900">{formatPrice(product.price)}</p>
                   <Link
                     to={`/products/${product.id}`}
                     className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-zinc-700"
                   >
                     Xem chi tiết
                   </Link>
                 </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      )}
    </section>
  )
}

export default ProductSection

