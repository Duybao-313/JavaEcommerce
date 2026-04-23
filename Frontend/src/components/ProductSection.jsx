import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'

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

function ProductSection() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const apiUrl = useMemo(() => '/api/products', [])

  useEffect(() => {
    let cancelled = false

    async function loadProducts() {
      setLoading(true)
      setError('')

      try {
        const response = await fetch(apiUrl)
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const payload = await response.json()
        const items = Array.isArray(payload?.data) ? payload.data : []

        if (!payload?.success) {
          throw new Error(payload?.message || 'Không thể lấy danh sách sản phẩm')
        }

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
  }, [apiUrl])

  return (
    <section id="products" className="mt-14">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Sản phẩm</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">Danh sách sản phẩm mới nhất</h2>
        </div>
        <p className="text-sm text-zinc-600">Nguồn dữ liệu từ API `localhost:8080/products`</p>
      </div>

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

      {!loading && !error && products.length > 0 && (
        <motion.div
          variants={listVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-6 grid gap-4 md:grid-cols-2"
        >
          {products.map((product) => (
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
                  <button className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-zinc-700">
                    Mua ngay
                  </button>
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

