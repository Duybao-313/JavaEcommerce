package com.duybao.SplitGo.Controller;

import com.duybao.SplitGo.DTO.Response.ApiResponse;
import com.duybao.SplitGo.DTO.Response.CouponDto;
import com.duybao.SplitGo.DTO.request.CreateCouponRequest;
import com.duybao.SplitGo.DTO.request.UpdateCouponRequest;
import com.duybao.SplitGo.Model.User;
import com.duybao.SplitGo.Service.CouponService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/admin/coupons")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminCouponController {

    private final CouponService couponService;

    /**
     * GET /admin/coupons?page=0&size=12&q=&active=
     * List coupons with search and active filter (admin).
     */
    @GetMapping
    public ApiResponse<Page<CouponDto>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Boolean active) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<CouponDto> result = couponService.listCoupons(q, active, pageable);

        return ApiResponse.<Page<CouponDto>>builder()
                .success(true)
                .code(200)
                .message("Danh sách coupon")
                .data(result)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * POST /admin/coupons
     * Create a new coupon.
     */
    @PostMapping
    public ApiResponse<CouponDto> create(
            @Valid @RequestBody CreateCouponRequest req,
            @AuthenticationPrincipal User adminUser) {

        CouponDto coupon = couponService.createCoupon(req, adminUser.getId());

        return ApiResponse.<CouponDto>builder()
                .success(true)
                .code(200)
                .message("Tạo coupon thành công")
                .data(coupon)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * GET /admin/coupons/{id}
     * Get coupon detail.
     */
    @GetMapping("/{id}")
    public ApiResponse<CouponDto> get(@PathVariable Long id) {
        CouponDto coupon = couponService.getCoupon(id);

        return ApiResponse.<CouponDto>builder()
                .success(true)
                .code(200)
                .message("Chi tiết coupon")
                .data(coupon)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * PUT /admin/coupons/{id}
     * Full update of coupon.
     */
    @PutMapping("/{id}")
    public ApiResponse<CouponDto> update(
            @PathVariable Long id,
            @RequestBody UpdateCouponRequest req) {

        CouponDto coupon = couponService.updateCoupon(id, req);

        return ApiResponse.<CouponDto>builder()
                .success(true)
                .code(200)
                .message("Cập nhật coupon thành công")
                .data(coupon)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * PATCH /admin/coupons/{id}
     * Partial update (toggle active, etc.)
     * Body: { "isActive": false }
     */
    @PatchMapping("/{id}")
    public ApiResponse<CouponDto> patch(
            @PathVariable Long id,
            @RequestBody Map<String, Object> changes) {

        CouponDto coupon = couponService.patchCoupon(id, changes);

        return ApiResponse.<CouponDto>builder()
                .success(true)
                .code(200)
                .message("Cập nhật trạng thái coupon thành công")
                .data(coupon)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * DELETE /admin/coupons/{id}
     * Soft delete — sets isActive = false.
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        couponService.softDeleteCoupon(id);

        return ApiResponse.<Void>builder()
                .success(true)
                .code(200)
                .message("Đã vô hiệu hoá coupon")
                .timestamp(LocalDateTime.now())
                .build();
    }
}
