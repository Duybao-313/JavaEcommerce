import React, { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useCart } from '../context/CartContext'

const vouchers = [
  { code: 'NONE', label: 'Không dùng voucher', type: 'none', value: 0 },
  { code: 'SALE10', label: 'Giảm 10% (tối đa 100.000đ)', type: 'percent', value: 10, max: 100000 },
  { code: 'SHIP30', label: 'Giảm 30.000đ', type: 'fixed', value: 30000 },
]

function formatPrice(value) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value || 0)
}

function CheckoutPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { items, selectedItems, clearSelectedItems } = useCart()

  const [voucherCode, setVoucherCode] = useState('NONE')
  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    detail: '',
    note: '',
  })

  const selectedIdsFromRoute = useMemo(() => {
    const ids = location.state?.selectedIds
    return Array.isArray(ids) ? ids : []
  }, [location.state])

  const checkoutItems = useMemo(() => {
    if (selectedIdsFromRoute.length === 0) {
      return selectedItems.length > 0 ? selectedItems : items
    }

    const idSet = new Set(selectedIdsFromRoute)
    return items.filter((item) => idSet.has(item.cartItemId))
  }, [items, selectedItems, selectedIdsFromRoute])

  const subtotal = useMemo(
    () => checkoutItems.reduce((sum, item) => sum + Number(item?.lineTotal || 0), 0),
    [checkoutItems],
  )

  const shippingFee = subtotal > 0 ? 20000 : 0

  const selectedVoucher = useMemo(
    () => vouchers.find((voucher) => voucher.code === voucherCode) || vouchers[0],
    [voucherCode],
  )

  const discount = useMemo(() => {
    if (!selectedVoucher || selectedVoucher.type === 'none') return 0

    if (selectedVoucher.type === 'fixed') {
      return Math.min(subtotal, selectedVoucher.value)
    }

    const percentValue = Math.floor((subtotal * selectedVoucher.value) / 100)
    if (selectedVoucher.max) {
      return Math.min(percentValue, selectedVoucher.max)
    }
    return percentValue
  }, [selectedVoucher, subtotal])

  const grandTotal = Math.max(0, subtotal + shippingFee - discount)

  const handleAddressChange = (event) => {
    const { name, value } = event.target
    setAddress((prev) => ({ ...prev, [name]: value }))
  }

  const handlePayment = () => {
    if (!address.fullName.trim() || !address.phone.trim() || !address.detail.trim()) {
      toast.error('Vui lòng nhập đầy đủ thông tin nhận hàng')
      return
    }

    if (checkoutItems.length === 0) {
      toast.error('Không có sản phẩm để thanh toán')
      return
    }

    toast.success('Đã tạo thanh toán mẫu thành công (chưa gọi API)')
    clearSelectedItems()
    navigate('/products')
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f7f4_0%,#f4f4ef_45%,#ffffff_100%)] px-6 py-10">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">SplitGo Checkout</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">Thanh toán</h1>
          </div>
          <Link
            to="/products"
            className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-800 hover:border-zinc-900"
          >
            Quay lại sản phẩm
          </Link>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900">Sản phẩm đã chọn</h2>

            {checkoutItems.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
                Chưa có sản phẩm nào được chọn.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {checkoutItems.map((item) => (
                  <article key={item.cartItemId} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-zinc-900">{item.productName}</p>
                      <p className="text-sm font-semibold text-zinc-900">{formatPrice(item.lineTotal)}</p>
                    </div>
                    <p className="mt-1 text-sm text-zinc-600">
                      {formatPrice(item.unitPrice)} x {item.quantity}
                    </p>
                  </article>
                ))}
              </div>
            )}

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="text-sm text-zinc-700">
                Voucher
                <select
                  value={voucherCode}
                  onChange={(event) => setVoucherCode(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900"
                >
                  {vouchers.map((voucher) => (
                    <option key={voucher.code} value={voucher.code}>
                      {voucher.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm text-zinc-700">
                Số điện thoại
                <input
                  name="phone"
                  value={address.phone}
                  onChange={handleAddressChange}
                  className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900"
                />
              </label>

              <label className="text-sm text-zinc-700">
                Người nhận
                <input
                  name="fullName"
                  value={address.fullName}
                  onChange={handleAddressChange}
                  className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900"
                />
              </label>

              <label className="text-sm text-zinc-700 md:col-span-2">
                Địa chỉ nhận hàng
                <input
                  name="detail"
                  value={address.detail}
                  onChange={handleAddressChange}
                  className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900"
                />
              </label>

              <label className="text-sm text-zinc-700 md:col-span-2">
                Ghi chú
                <textarea
                  name="note"
                  rows={3}
                  value={address.note}
                  onChange={handleAddressChange}
                  className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900"
                />
              </label>
            </div>

            <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Hình thức thanh toán</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {['COD', 'BANK_TRANSFER', 'E_WALLET'].map((method) => (
                  <label key={method} className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={(event) => setPaymentMethod(event.target.value)}
                    />
                    {method === 'COD' && 'COD'}
                    {method === 'BANK_TRANSFER' && 'Chuyển khoản'}
                    {method === 'E_WALLET' && 'Ví điện tử'}
                  </label>
                ))}
              </div>
            </div>
          </section>

          <aside className="h-fit rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900">Tổng thanh toán</h2>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between text-zinc-600">
                <span>Tạm tính</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-zinc-600">
                <span>Phí vận chuyển</span>
                <span>{formatPrice(shippingFee)}</span>
              </div>
              <div className="flex items-center justify-between text-emerald-700">
                <span>Giảm giá voucher</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            </div>

            <div className="mt-4 border-t border-zinc-200 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-600">Tổng cuối</span>
                <span className="text-xl font-semibold text-zinc-900">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePayment}
              disabled={checkoutItems.length === 0}
              className="mt-5 w-full rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-400"
            >
              Thanh toán
            </button>

            <p className="mt-3 text-xs text-zinc-500">
              Phần thanh toán hiện đang ở chế độ giao diện demo, chưa gọi API.
            </p>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage

