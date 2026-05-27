package com.duybao.SplitGo.Controller;

import com.duybao.SplitGo.DTO.Response.ApiResponse;
import com.duybao.SplitGo.DTO.Response.CouponDto;
import com.duybao.SplitGo.DTO.Response.ValidateCouponResponse;
import com.duybao.SplitGo.DTO.request.ValidateCouponRequest;
import com.duybao.SplitGo.Service.CouponService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    /**
     * GET /coupons/public?active=true&page=0&size=20
     * Public list of active coupons (masked — no usage counters).
     */
    @GetMapping("/public")
    public ApiResponse<List<CouponDto>> publicList(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<CouponDto> result = couponService.listPublicCoupons(
                PageRequest.of(page, size));

        return ApiResponse.<List<CouponDto>>builder()
                .success(true)
                .code(200)
                .message("Danh sách coupon công khai")
                .data(result.getContent())
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * GET /coupons/code/{code}
     * Look up a coupon by code (masked for public).
     */
    @GetMapping("/code/{code}")
    public ApiResponse<CouponDto> findByCode(@PathVariable String code) {
        CouponDto coupon = couponService.findByCode(code);

        return ApiResponse.<CouponDto>builder()
                .success(true)
                .code(200)
                .message("Thông tin coupon")
                .data(coupon)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * POST /coupons/validate
     * Validate a coupon against a cart and compute discount.
     * Body: { code, subtotal, shippingFee, items: [{productId, variantId, quantity, sellerId?}], userId? }
     */
    @PostMapping("/validate")
    public ApiResponse<ValidateCouponResponse> validate(
            @Valid @RequestBody ValidateCouponRequest req) {

        ValidateCouponResponse result = couponService.validateCoupon(req);

        return ApiResponse.<ValidateCouponResponse>builder()
                .success(true)
                .code(200)
                .message(result.isValid() ? "Coupon hợp lệ" : "Coupon không hợp lệ")
                .data(result)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
