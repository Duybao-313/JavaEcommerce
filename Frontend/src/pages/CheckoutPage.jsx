import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useCart } from "../context/CartContext";
import { getCurrentUserDetail } from "../services/authService";
import { checkout } from "../services/orderService";
import {
  getPublicCoupons,
  validateCouponForCart,
  formatCouponLabel,
} from "../services/couponService";
import { getMyAddresses } from "../services/addressService";

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
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    detail: "",
    note: "",
  });

  // ── Saved addresses state ──────────────────────────────────────────
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");

  // ── Dynamic coupon state ────────────────────────────────────────────
  const [publicCoupons, setPublicCoupons] = useState([]);
  const [selectedCouponCode, setSelectedCouponCode] = useState("");
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponValidation, setCouponValidation] = useState({
    valid: false,
    discountAmount: 0,
    reason: null,
    coupon: null,
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

  // Load saved addresses for selection
  useEffect(() => {
    getMyAddresses()
      .then((list) => {
        setSavedAddresses(list);
        // Auto-select default address if no manual entry yet
        const defaultAddr = list.find((a) => a.isDefault);
        if (defaultAddr && !address.detail) {
          setSelectedAddressId(String(defaultAddr.id));
          setAddress((prev) => ({
            ...prev,
            fullName: defaultAddr.recipientName || prev.fullName,
            phone: defaultAddr.phone || prev.phone,
            detail: defaultAddr.detail || prev.detail,
          }));
        }
      })
      .catch(() => setSavedAddresses([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle saved address selection
  const handleSavedAddressSelect = (e) => {
    const id = e.target.value;
    setSelectedAddressId(id);
    if (!id) return;
    const addr = savedAddresses.find((a) => String(a.id) === id);
    if (addr) {
      setAddress((prev) => ({
        ...prev,
        fullName: addr.recipientName || "",
        phone: addr.phone || "",
        detail: addr.detail || "",
      }));
    }
  };

  // Load public coupons on mount
  useEffect(() => {
    getPublicCoupons({ active: true })
      .then(setPublicCoupons)
      .catch(() => setPublicCoupons([]));
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

  // ── Coupon validation handler ───────────────────────────────────────
  const handleApplyCoupon = useCallback(
    async (code) => {
      if (!code) {
        setSelectedCouponCode("");
        setCouponValidation({
          valid: false,
          discountAmount: 0,
          reason: null,
          coupon: null,
        });
        return;
      }

      setCouponLoading(true);
      setSelectedCouponCode(code);
      try {
        const req = {
          code,
          subtotal,
          shippingFee,
          items: checkoutItems.map((item) => ({
            productId: item.productId,
            variantId: item.variantId || null,
            quantity: item.quantity,
            sellerId: item.sellerId || null,
          })),
          userId: userInfo?.id || null,
        };
        const res = await validateCouponForCart(req);
        if (res?.valid) {
          setCouponValidation({
            valid: true,
            discountAmount: res.discountAmount || 0,
            reason: null,
            coupon: res.coupon || null,
          });
          toast.success("Áp dụng coupon thành công");
        } else {
          setCouponValidation({
            valid: false,
            discountAmount: 0,
            reason: res?.reason || "Coupon không hợp lệ",
            coupon: null,
          });
          toast.error(res?.reason || "Coupon không hợp lệ");
        }
      } catch (err) {
        setCouponValidation({
          valid: false,
          discountAmount: 0,
          reason: err?.message || "Không thể kiểm tra coupon",
          coupon: null,
        });
        toast.error(err?.message || "Không thể kiểm tra coupon");
      } finally {
        setCouponLoading(false);
      }
    },
    [subtotal, shippingFee, checkoutItems, userInfo],
  );

  // Handle dropdown selection
  const handleCouponSelect = useCallback(
    (e) => {
      const code = e.target.value;
      setCouponCodeInput("");
      handleApplyCoupon(code);
    },
    [handleApplyCoupon],
  );

  // Handle manual code entry
  const handleCouponCodeSubmit = useCallback(() => {
    const code = couponCodeInput.trim().toUpperCase();
    if (!code) return;
    handleApplyCoupon(code);
  }, [couponCodeInput, handleApplyCoupon]);

  // Clear coupon
  const handleClearCoupon = useCallback(() => {
    setSelectedCouponCode("");
    setCouponCodeInput("");
    setCouponValidation({
      valid: false,
      discountAmount: 0,
      reason: null,
      coupon: null,
    });
  }, []);

  // ── Derived values ──────────────────────────────────────────────────
  const discount = couponValidation.valid ? couponValidation.discountAmount : 0;
  const grandTotal = Math.max(0, subtotal + shippingFee - discount);

  // Build coupon dropdown options
  const couponOptions = useMemo(() => {
    return publicCoupons.map((c) => ({
      code: c.code,
      label: formatCouponLabel(c),
    }));
  }, [publicCoupons]);

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
        addressId: selectedAddressId ? Number(selectedAddressId) : null,
        phoneNumber: address.phone.trim(),
        recipientName: address.fullName.trim(),
        shippingFee: shippingFee,
        discount: discount,
        paymentMethod: "COD",
        note: address.note?.trim() || "",
        couponCode: couponValidation.valid ? selectedCouponCode : null,
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
          <div className="flex items-center gap-3">
            <Link
              to="/orders"
              className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-800 hover:border-zinc-900"
            >
              Đơn hàng
            </Link>
            <Link
              to="/products"
              className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-800 hover:border-zinc-900"
            >
              Quay lại sản phẩm
            </Link>
          </div>
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
                      <div>
                        <p className="font-semibold text-zinc-900">
                          {item.productName}
                        </p>
                        {item.variantAttributes &&
                          Object.keys(item.variantAttributes).length > 0 && (
                            <span className="mt-1 inline-block rounded-md border border-zinc-200 bg-white px-2 py-0.5 text-xs font-medium text-zinc-600">
                              {Object.entries(item.variantAttributes)
                                .map(([key, val]) => `${key}: ${val}`)
                                .join(", ")}
                            </span>
                          )}
                      </div>
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
              {/* ── Saved Address Selector ───────────────────────── */}
              {savedAddresses.length > 0 && (
                <label className="text-sm text-zinc-700 md:col-span-2">
                  <span className="inline-flex items-center gap-1">
                    Chọn địa chỉ đã lưu
                    <Link
                      to="/addresses"
                      className="ml-2 text-xs text-amber-600 hover:text-amber-700 underline underline-offset-2"
                    >
                      Quản lý sổ địa chỉ →
                    </Link>
                  </span>
                  <select
                    value={selectedAddressId}
                    onChange={handleSavedAddressSelect}
                    className="mt-1 min-h-[44px] w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900"
                  >
                    <option value="">Nhập thủ công...</option>
                    {savedAddresses.map((addr) => (
                      <option key={addr.id} value={String(addr.id)}>
                        {addr.isDefault ? "⭐ " : ""}
                        {addr.recipientName} — {addr.phone} — {addr.detail}
                        {addr.isDefault ? " (Mặc định)" : ""}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <label className="text-sm text-zinc-700">
                Coupon
                <select
                  value={selectedCouponCode}
                  onChange={handleCouponSelect}
                  className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900"
                >
                  <option value="">Không dùng coupon</option>
                  {couponOptions.map((opt) => (
                    <option key={opt.code} value={opt.code}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm text-zinc-700">
                Mã coupon
                <div className="mt-1 flex gap-2">
                  <input
                    value={couponCodeInput}
                    onChange={(e) =>
                      setCouponCodeInput(e.target.value.toUpperCase())
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCouponCodeSubmit();
                    }}
                    placeholder="Nhập mã coupon"
                    disabled={couponLoading}
                    className="min-h-[44px] flex-1 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900 disabled:bg-zinc-100 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={handleCouponCodeSubmit}
                    disabled={couponLoading || !couponCodeInput.trim()}
                    className="min-h-[44px] rounded-xl border border-zinc-300 bg-white px-4 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-800 transition-colors duration-180 ease-out-quart hover:border-zinc-900 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:text-zinc-400"
                  >
                    {couponLoading ? "Đang kiểm tra..." : "Áp dụng"}
                  </button>
                </div>
                {/* Coupon status feedback */}
                {selectedCouponCode && (
                  <div className="mt-1.5">
                    {couponValidation.valid ? (
                      <div className="flex items-center gap-2 text-xs text-emerald-700">
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>
                          Đã áp dụng: giảm{" "}
                          {formatPrice(couponValidation.discountAmount)}
                        </span>
                        <button
                          type="button"
                          onClick={handleClearCoupon}
                          className="ml-auto rounded px-1.5 py-0.5 text-zinc-500 hover:text-red-600 hover:bg-red-50 transition-colors duration-150"
                        >
                          Huỷ
                        </button>
                      </div>
                    ) : couponValidation.reason ? (
                      <p className="text-xs text-red-600">
                        {couponValidation.reason}
                      </p>
                    ) : null}
                  </div>
                )}
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
                <span>Giảm giá coupon</span>
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
