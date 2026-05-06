import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useCart } from "../context/CartContext";
import { getCurrentUserDetail } from "../services/authService";
import { checkout } from "../services/orderService";

const vouchers = [
  { code: "NONE", label: "Không dùng coupon", type: "none", value: 0 },
  {
    code: "SALE20",
    label: "Giảm 20% (tối đa 200.000đ)",
    type: "percent",
    value: 20,
    max: 200000,
  },
  {
    code: "FREESHIP",
    label: "Miễn phí vận chuyển (30.000đ)",
    type: "fixed",
    value: 30000,
  },
  {
    code: "SAVE50K",
    label: "Giảm 50.000đ đơn hàng",
    type: "fixed",
    value: 50000,
  },
];

function formatPrice(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, selectedItems, clearSelectedItems, refreshCart } = useCart();

  const [userInfo, setUserInfo] = useState(null);
  const [voucherCode, setVoucherCode] = useState("NONE");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    detail: "",
    note: "",
  });

  useEffect(() => {
    getCurrentUserDetail()
      .then((user) => {
        if (user) {
          setUserInfo(user);
          setAddress((prev) => ({
            ...prev,
            fullName: user.fullName || "",
            phone: user.phone || "",
            detail: user.address || "",
          }));
        }
      })
      .catch(() => {
        // Silent fail — user can still type manually
      });
  }, []);

  const selectedIdsFromRoute = useMemo(() => {
    const ids = location.state?.selectedIds;
    return Array.isArray(ids) ? ids : [];
  }, [location.state]);

  const checkoutItems = useMemo(() => {
    if (selectedIdsFromRoute.length === 0) {
      return selectedItems.length > 0 ? selectedItems : items;
    }

    const idSet = new Set(selectedIdsFromRoute);
    return items.filter((item) => idSet.has(item.cartItemId));
  }, [items, selectedItems, selectedIdsFromRoute]);

  const subtotal = useMemo(
    () =>
      checkoutItems.reduce(
        (sum, item) => sum + Number(item?.lineTotal || 0),
        0,
      ),
    [checkoutItems],
  );

  const shippingFee = subtotal > 0 ? 20000 : 0;

  const selectedVoucher = useMemo(
    () =>
      vouchers.find((voucher) => voucher.code === voucherCode) || vouchers[0],
    [voucherCode],
  );

  const discount = useMemo(() => {
    if (!selectedVoucher || selectedVoucher.type === "none") return 0;

    if (selectedVoucher.type === "fixed") {
      return Math.min(subtotal, selectedVoucher.value);
    }

    const percentValue = Math.floor((subtotal * selectedVoucher.value) / 100);
    if (selectedVoucher.max) {
      return Math.min(percentValue, selectedVoucher.max);
    }
    return percentValue;
  }, [selectedVoucher, subtotal]);

  const grandTotal = Math.max(0, subtotal + shippingFee - discount);

  const handleAddressChange = (event) => {
    const { name, value } = event.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handlePayment = async () => {
    if (
      !address.fullName.trim() ||
      !address.phone.trim() ||
      !address.detail.trim()
    ) {
      toast.error("Vui lòng nhập đầy đủ thông tin nhận hàng");
      return;
    }

    if (checkoutItems.length === 0) {
      toast.error("Không có sản phẩm để thanh toán");
      return;
    }

    setIsSubmitting(true);

    try {
      const checkoutRequest = {
        shippingAddress: address.detail.trim(),
        phoneNumber: address.phone.trim(),
        recipientName: address.fullName.trim(),
        shippingFee: shippingFee,
        discount: discount,
        paymentMethod: "COD",
        note: address.note?.trim() || "",
        couponCode: voucherCode !== "NONE" ? voucherCode : null,
      };

      const result = await checkout(checkoutRequest);

      if (result) {
        toast.success("Đặt hàng thành công!");
        clearSelectedItems();
        await refreshCart();
        navigate("/products");
      }
    } catch (error) {
      toast.error(error?.message || "Đặt hàng thất bại. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f7f4_0%,#f4f4ef_45%,#ffffff_100%)] px-6 py-10">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              SplitGo Checkout
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
              Thanh toán
            </h1>
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
            <h2 className="text-lg font-semibold text-zinc-900">
              Sản phẩm đã chọn
            </h2>

            {checkoutItems.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
                Chưa có sản phẩm nào được chọn.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {checkoutItems.map((item) => (
                  <article
                    key={item.cartItemId}
                    className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-zinc-900">
                        {item.productName}
                      </p>
                      <p className="text-sm font-semibold text-zinc-900">
                        {formatPrice(item.lineTotal)}
                      </p>
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
                Coupon
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
                Mã coupon
                <div className="mt-1 flex gap-2">
                  <input
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value)}
                    placeholder="Nhập mã coupon"
                    className="min-h-[44px] flex-1 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900"
                  />
                  <button
                    type="button"
                    disabled
                    className="min-h-[44px] cursor-not-allowed rounded-xl border border-zinc-200 bg-zinc-100 px-4 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400"
                  >
                    Áp dụng
                  </button>
                </div>
              </label>

              <label className="text-sm text-zinc-700">
                Số điện thoại
                <input
                  name="phone"
                  value={address.phone}
                  onChange={handleAddressChange}
                  className="mt-1 min-h-[44px] w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900"
                />
              </label>

              <label className="text-sm text-zinc-700">
                Người nhận
                <input
                  name="fullName"
                  value={address.fullName}
                  onChange={handleAddressChange}
                  className="mt-1 min-h-[44px] w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900"
                />
              </label>

              <label className="text-sm text-zinc-700 md:col-span-2">
                Địa chỉ nhận hàng
                <input
                  name="detail"
                  value={address.detail}
                  onChange={handleAddressChange}
                  className="mt-1 min-h-[44px] w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900"
                />
              </label>

              <label className="text-sm text-zinc-700 md:col-span-2">
                Ghi chú
                <textarea
                  name="note"
                  rows={3}
                  value={address.note}
                  onChange={handleAddressChange}
                  className="mt-1 min-h-[44px] w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900"
                />
              </label>
            </div>

            <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                Hình thức thanh toán
              </p>
              <div className="mt-3">
                <label className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    readOnly
                  />
                  Thanh toán khi nhận hàng (COD)
                </label>
              </div>
            </div>
          </section>

          <aside className="h-fit rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900">
              Tổng thanh toán
            </h2>

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
                <span className="text-xl font-semibold text-zinc-900">
                  {formatPrice(grandTotal)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePayment}
              disabled={checkoutItems.length === 0 || isSubmitting}
              className="mt-5 w-full rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-400"
            >
              {isSubmitting ? "Đang xử lý..." : "Thanh toán"}
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
