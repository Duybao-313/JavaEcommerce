package com.duybao.SplitGo.Service;

import com.duybao.SplitGo.DTO.Response.CouponDto;
import com.duybao.SplitGo.DTO.Response.ValidateCouponResponse;
import com.duybao.SplitGo.DTO.request.CreateCouponRequest;
import com.duybao.SplitGo.DTO.request.UpdateCouponRequest;
import com.duybao.SplitGo.DTO.request.ValidateCouponRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Map;

public interface CouponService {

    // ── Admin ──────────────────────────────────────────────────────────
    Page<CouponDto> listCoupons(String q, Boolean active, Pageable pageable);

    CouponDto getCoupon(Long id);

    CouponDto createCoupon(CreateCouponRequest request, Long adminUserId);

    CouponDto updateCoupon(Long id, UpdateCouponRequest request);

    CouponDto patchCoupon(Long id, Map<String, Object> changes);

    void softDeleteCoupon(Long id);

    // ── Public ─────────────────────────────────────────────────────────
    Page<CouponDto> listPublicCoupons(Pageable pageable);

    CouponDto findByCode(String code);

    ValidateCouponResponse validateCoupon(ValidateCouponRequest request);

    /**
     * Atomically validate and consume one usage of the coupon.
     * Used during checkout finalization. Returns the validated discount or throws.
     */
    ValidateCouponResponse validateAndConsume(String code, Long userId,
                                               java.math.BigDecimal subtotal,
                                               java.math.BigDecimal shippingFee,
                                               java.util.List<ValidateCouponRequest.CartItemRef> items);
}
