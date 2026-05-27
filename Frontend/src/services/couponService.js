import { parseApiResponse, request } from "./apiClient";
import { authFetch } from "./authService";

// ─── Admin Coupon CRUD ────────────────────────────────────────────────

export async function getAdminCoupons(params = {}) {
  const query = new URLSearchParams();
  if (params.page !== undefined && params.page !== null)
    query.set("page", String(params.page));
  if (params.size) query.set("size", String(params.size));
  if (params.q) query.set("q", params.q);
  if (params.active !== undefined && params.active !== null)
    query.set("active", String(params.active));

  const qs = query.toString();
  const response = await authFetch(`/admin/coupons${qs ? `?${qs}` : ""}`);
  const payload = await parseApiResponse(response);
  return (
    payload?.data || { content: [], totalElements: 0, totalPages: 0, page: 0 }
  );
}

export async function getAdminCouponDetail(couponId) {
  const response = await authFetch(`/admin/coupons/${couponId}`);
  const payload = await parseApiResponse(response);
  return payload?.data || null;
}

export async function createCouponAdmin(body) {
  const response = await authFetch("/admin/coupons", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await parseApiResponse(response);
  return payload?.data || null;
}

export async function updateCouponAdmin(couponId, body) {
  const response = await authFetch(`/admin/coupons/${couponId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await parseApiResponse(response);
  return payload?.data || null;
}

export async function patchCouponAdmin(couponId, changes) {
  const response = await authFetch(`/admin/coupons/${couponId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(changes),
  });
  const payload = await parseApiResponse(response);
  return payload?.data || null;
}

export async function deleteCouponAdmin(couponId) {
  const response = await authFetch(`/admin/coupons/${couponId}`, {
    method: "DELETE",
  });
  await parseApiResponse(response);
}

// ─── Public Coupon Endpoints ──────────────────────────────────────────

export async function getPublicCoupons(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const response = await request(`/coupons/public${qs ? `?${qs}` : ""}`);
  const payload = await parseApiResponse(response);
  return payload?.data || [];
}

export async function getCouponByCode(code) {
  const response = await request(`/coupons/code/${encodeURIComponent(code)}`);
  const payload = await parseApiResponse(response);
  return payload?.data || null;
}

export async function validateCouponForCart(body) {
  // body: { code, subtotal, shippingFee, items: [{productId, variantId, quantity, sellerId?}], userId? }
  const response = await request("/coupons/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await parseApiResponse(response);
  return payload?.data || null;
}

// ─── Helpers ──────────────────────────────────────────────────────────

export const COUPON_TYPE_LABEL = {
  PERCENT: "Phần trăm",
  FIXED: "Cố định",
  FREE_SHIPPING: "Miễn phí vận chuyển",
};

export const COUPON_SCOPE_LABEL = {
  ALL: "Toàn bộ",
  PRODUCT: "Sản phẩm",
  CATEGORY: "Danh mục",
  SELLER: "Người bán",
  USER: "Người dùng",
};

/**
 * Build a Vietnamese summary string for a coupon.
 * Example: "Giảm 20% (tối đa 200.000đ)"
 */
export function formatCouponLabel(coupon) {
  if (!coupon) return "Không dùng coupon";
  const type = coupon.type;
  const value = coupon.value;

  if (type === "PERCENT") {
    const pct = Number(value);
    const base = `Giảm ${pct}%`;
    if (coupon.maxDiscountAmount) {
      const max = Number(coupon.maxDiscountAmount).toLocaleString("vi-VN");
      return `${base} (tối đa ${max}đ)`;
    }
    return base;
  }
  if (type === "FIXED") {
    const vnd = Number(value).toLocaleString("vi-VN");
    return `Giảm ${vnd}đ`;
  }
  if (type === "FREE_SHIPPING") {
    const vnd = Number(value).toLocaleString("vi-VN");
    return `Miễn phí vận chuyển (${vnd}đ)`;
  }
  return coupon.title || coupon.code;
}
