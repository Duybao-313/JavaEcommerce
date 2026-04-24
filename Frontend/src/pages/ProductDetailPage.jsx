import React, { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getProductDetail, addToCart, getAuthSession } from '../services/authApi'

function formatPrice(value) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value || 0)
}

function ProductDetailPage() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)

  const session = getAuthSession()

  useEffect(() => {
    async function loadProduct() {
      setLoading(true)
      setError('')

      try {
        const data = await getProductDetail(productId)
        if (!data) {
          throw new Error('Không thể tải thông tin sản phẩm')
        }
        setProduct(data)
        setQuantity(1)
      } catch (err) {
        setError(err?.message || 'Đã có lỗi khi tải sản phẩm')
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      loadProduct()
    }
  }, [productId])

  const handleQuantityChange = (newQuantity) => {
    const value = Math.max(1, Math.min(newQuantity, product?.stock || 1))
    setQuantity(value)
  }

  const handleAddToCart = async () => {
    if (!session?.token) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng')
      navigate('/login')
      return
    }

    if (!product || quantity < 1) {
      toast.error('Vui lòng chọn sản phẩm và số lượng hợp lệ')
      return
    }

    setAdding(true)

    try {
      const result = await addToCart(product.id, quantity)
      toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng`)
      setQuantity(1)
    } catch (err) {
      toast.error(err?.message || 'Không thể thêm vào giỏ hàng')
    } finally {
      setAdding(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#f7f7f4_0%,#f4f4ef_45%,#ffffff_100%)] px-6 py-10">
        <div className="mx-auto w-full max-w-5xl">
          <p className="text-center text-sm text-zinc-600">Đang tải chi tiết sản phẩm...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#f7f7f4_0%,#f4f4ef_45%,#ffffff_100%)] px-6 py-10">
        <div className="mx-auto w-full max-w-5xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-sm text-red-700">{error}</p>
            <Link
              to="/products"
              className="mt-4 inline-block rounded-full border border-red-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-red-700 hover:border-red-500"
            >
              Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#f7f7f4_0%,#f4f4ef_45%,#ffffff_100%)] px-6 py-10">
        <div className="mx-auto w-full max-w-5xl">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center">
            <p className="text-sm text-zinc-600">Không tìm thấy sản phẩm này</p>
            <Link
              to="/products"
              className="mt-4 inline-block rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-800 hover:border-zinc-900"
            >
              Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f7f4_0%,#f4f4ef_45%,#ffffff_100%)] px-6 py-10">
      <div className="mx-auto w-full max-w-6xl">
        <Link
          to="/products"
          className="mb-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-600 hover:text-zinc-900"
        >
          ← Quay lại
        </Link>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Image Section */}
          <div className="flex items-center justify-center rounded-2xl border border-zinc-200 bg-white">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-full w-full rounded-2xl object-cover"
              />
            ) : (
              <div className="flex h-96 w-full items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-200 to-zinc-100 text-sm font-semibold text-zinc-500">
                Chưa có ảnh sản phẩm
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-8">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  {product.categoryName || 'Danh mục'}
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
                  {product.name}
                </h1>
              </div>
              <span className="rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-600">
                {product.status}
              </span>
            </div>

            {product.description && (
              <p className="mt-4 text-base text-zinc-700 leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Product Info */}
            <div className="mt-6 space-y-3 border-t border-zinc-200 pt-6">
              <div className="flex justify-between">
                <span className="text-sm text-zinc-600">Người bán:</span>
                <span className="font-medium text-zinc-900">{product.sellerUsername}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-zinc-600">Tồn kho:</span>
                <span className="font-medium text-zinc-900">{product.stock} sản phẩm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-zinc-600">ID Sản phẩm:</span>
                <span className="font-medium text-zinc-900">#{product.id}</span>
              </div>
            </div>

            {/* Price */}
            <div className="mt-6 border-t border-zinc-200 pt-6">
              <p className="text-4xl font-bold text-zinc-900">
                {formatPrice(product.price)}
              </p>
            </div>

            {/* Quantity Selector */}
            <div className="mt-6 border-t border-zinc-200 pt-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Số lượng
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  className="h-10 w-10 rounded-full border border-zinc-300 bg-white hover:border-zinc-900 hover:bg-zinc-50 flex items-center justify-center font-semibold text-zinc-900"
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                  className="w-16 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-center font-medium text-zinc-900"
                  min="1"
                  max={product.stock}
                />
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  className="h-10 w-10 rounded-full border border-zinc-300 bg-white hover:border-zinc-900 hover:bg-zinc-50 flex items-center justify-center font-semibold text-zinc-900"
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={adding || product.stock === 0}
              className="mt-6 w-full rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white hover:bg-zinc-700 disabled:bg-zinc-400 disabled:cursor-not-allowed transition-colors"
            >
              {adding ? 'Đang thêm...' : product.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
            </button>

            {!session?.token && (
              <Link
                to="/login"
                className="mt-3 block w-full rounded-full border border-zinc-300 bg-white px-6 py-3 text-center text-sm font-semibold uppercase tracking-[0.14em] text-zinc-800 hover:border-zinc-900 hover:bg-zinc-50 transition-colors"
              >
                Đăng nhập để mua
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage