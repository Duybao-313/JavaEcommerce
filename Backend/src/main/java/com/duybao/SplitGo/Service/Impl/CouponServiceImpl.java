package com.duybao.SplitGo.Service.Impl;

import com.duybao.SplitGo.DTO.Response.CouponDto;
import com.duybao.SplitGo.DTO.Response.ValidateCouponResponse;
import com.duybao.SplitGo.DTO.request.CreateCouponRequest;
import com.duybao.SplitGo.DTO.request.UpdateCouponRequest;
import com.duybao.SplitGo.DTO.request.ValidateCouponRequest;
import com.duybao.SplitGo.Enum.CouponScope;
import com.duybao.SplitGo.Enum.CouponType;
import com.duybao.SplitGo.Exception.AppException;
import com.duybao.SplitGo.Exception.ErrorCode;
import com.duybao.SplitGo.Model.Coupon;
import com.duybao.SplitGo.Repository.CouponRepository;
import com.duybao.SplitGo.Service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CouponServiceImpl implements CouponService {

    private final CouponRepository couponRepository;

    // ── Mappers ────────────────────────────────────────────────────────

    private CouponDto toDto(Coupon c) {
        return CouponDto.builder()
                .id(c.getId())
                .code(c.getCode())
                .title(c.getTitle())
                .description(c.getDescription())
                .type(c.getType())
                .value(c.getValue())
                .maxDiscountAmount(c.getMaxDiscountAmount())
                .minOrderValue(c.getMinOrderValue())
                .scope(c.getScope())
                .targetIds(c.getTargetIds())
                .startAt(c.getStartAt())
                .endAt(c.getEndAt())
                .usageLimit(c.getUsageLimit())
                .perUserLimit(c.getPerUserLimit())
                .usedCount(c.getUsedCount())
                .isActive(c.getIsActive())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .createdBy(c.getCreatedBy())
                .build();
    }

    private void applyUpdate(Coupon entity, UpdateCouponRequest req) {
        if (req.getCode() != null) entity.setCode(req.getCode());
        if (req.getTitle() != null) entity.setTitle(req.getTitle());
        if (req.getDescription() != null) entity.setDescription(req.getDescription());
        if (req.getType() != null) entity.setType(req.getType());
        if (req.getValue() != null) entity.setValue(req.getValue());
        if (req.getMaxDiscountAmount() != null) entity.setMaxDiscountAmount(req.getMaxDiscountAmount());
        if (req.getMinOrderValue() != null) entity.setMinOrderValue(req.getMinOrderValue());
        if (req.getScope() != null) entity.setScope(req.getScope());
        if (req.getTargetIds() != null) entity.setTargetIds(req.getTargetIds());
        if (req.getStartAt() != null) entity.setStartAt(req.getStartAt());
        if (req.getEndAt() != null) entity.setEndAt(req.getEndAt());
        if (req.getUsageLimit() != null) entity.setUsageLimit(req.getUsageLimit());
        if (req.getPerUserLimit() != null) entity.setPerUserLimit(req.getPerUserLimit());
        if (req.getIsActive() != null) entity.setIsActive(req.getIsActive());
    }

    // ── Admin ──────────────────────────────────────────────────────────

    @Override
    public Page<CouponDto> listCoupons(String q, Boolean active, Pageable pageable) {
        return couponRepository.searchCoupons(q, active, pageable).map(this::toDto);
    }

    @Override
    public CouponDto getCoupon(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COUPON_NOT_FOUND));
        return toDto(coupon);
    }

    @Override
    @Transactional
    public CouponDto createCoupon(CreateCouponRequest req, Long adminUserId) {
        if (couponRepository.existsByCode(req.getCode())) {
            throw new AppException(ErrorCode.COUPON_CODE_EXISTS);
        }

        // Validate percent range
        if (req.getType() == CouponType.PERCENT) {
            BigDecimal val = req.getValue();
            if (val.compareTo(BigDecimal.ZERO) <= 0 || val.compareTo(new BigDecimal("100")) > 0) {
                throw new AppException(ErrorCode.INVALID_REQUEST,
                        "Phần trăm giảm giá phải từ 1 đến 100");
            }
        }

        // Validate time
        if (req.getStartAt() != null && req.getEndAt() != null
                && !req.getStartAt().isBefore(req.getEndAt())) {
            throw new AppException(ErrorCode.INVALID_REQUEST,
                    "Ngày kết thúc phải sau ngày bắt đầu");
        }

        Coupon coupon = Coupon.builder()
                .code(req.getCode().toUpperCase())
                .title(req.getTitle())
                .description(req.getDescription())
                .type(req.getType())
                .value(req.getValue())
                .maxDiscountAmount(req.getMaxDiscountAmount())
                .minOrderValue(req.getMinOrderValue())
                .scope(req.getScope() != null ? req.getScope() : CouponScope.ALL)
                .targetIds(req.getTargetIds())
                .startAt(req.getStartAt())
                .endAt(req.getEndAt())
                .usageLimit(req.getUsageLimit())
                .perUserLimit(req.getPerUserLimit())
                .isActive(req.getIsActive() != null ? req.getIsActive() : true)
                .createdBy(adminUserId)
                .build();

        coupon = couponRepository.save(coupon);
        return toDto(coupon);
    }

    @Override
    @Transactional
    public CouponDto updateCoupon(Long id, UpdateCouponRequest req) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COUPON_NOT_FOUND));

        // If code is being changed, check uniqueness
        if (req.getCode() != null && !req.getCode().equalsIgnoreCase(coupon.getCode())) {
            if (couponRepository.existsByCode(req.getCode())) {
                throw new AppException(ErrorCode.COUPON_CODE_EXISTS);
            }
            req.setCode(req.getCode().toUpperCase());
        }

        applyUpdate(coupon, req);
        coupon = couponRepository.save(coupon);
        return toDto(coupon);
    }

    @Override
    @Transactional
    public CouponDto patchCoupon(Long id, Map<String, Object> changes) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COUPON_NOT_FOUND));

        if (changes.containsKey("isActive")) {
            coupon.setIsActive((Boolean) changes.get("isActive"));
        }
        // Extensible: add other fields as needed

        coupon = couponRepository.save(coupon);
        return toDto(coupon);
    }

    @Override
    @Transactional
    public void softDeleteCoupon(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COUPON_NOT_FOUND));
        coupon.setIsActive(false);
        couponRepository.save(coupon);
    }

    // ── Public ─────────────────────────────────────────────────────────

    @Override
    public Page<CouponDto> listPublicCoupons(Pageable pageable) {
        LocalDateTime now = LocalDateTime.now();
        return couponRepository.findActivePublicCoupons(now, pageable)
                .map(c -> toDto(c).maskForPublic());
    }

    @Override
    public CouponDto findByCode(String code) {
        Coupon coupon = couponRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new AppException(ErrorCode.COUPON_NOT_FOUND));
        return toDto(coupon).maskForPublic();
    }

    @Override
    public ValidateCouponResponse validateCoupon(ValidateCouponRequest req) {
        return validateInternal(req.getCode(), req.getUserId(), req.getSubtotal(),
                req.getShippingFee(), req.getItems(), false);
    }

    @Override
    @Transactional
    public ValidateCouponResponse validateAndConsume(String code, Long userId,
                                                      BigDecimal subtotal,
                                                      BigDecimal shippingFee,
                                                      List<ValidateCouponRequest.CartItemRef> items) {
        return validateInternal(code, userId, subtotal, shippingFee, items, true);
    }

    // ── Core validation logic ──────────────────────────────────────────

    private ValidateCouponResponse validateInternal(String code, Long userId,
                                                     BigDecimal subtotal,
                                                     BigDecimal shippingFee,
                                                     List<ValidateCouponRequest.CartItemRef> items,
                                                     boolean consume) {
        String upperCode = code.toUpperCase();

        Coupon coupon;
        if (consume) {
            // Use pessimistic lock for atomic consumption
            coupon = couponRepository.findByCodeForUpdate(upperCode)
                    .orElseThrow(() -> new AppException(ErrorCode.COUPON_NOT_FOUND));
        } else {
            coupon = couponRepository.findByCode(upperCode)
                    .orElseThrow(() -> new AppException(ErrorCode.COUPON_NOT_FOUND));
        }

        // 1. Active check
        if (Boolean.FALSE.equals(coupon.getIsActive())) {
            return invalid("Coupon đã bị vô hiệu hoá");
        }

        // 2. Time window
        if (!coupon.isInTimeWindow()) {
            return invalid("Coupon đã hết hạn hoặc chưa đến thời gian áp dụng");
        }

        // 3. Usage limit
        if (!coupon.hasRemainingUsage()) {
            return invalid("Coupon đã hết lượt sử dụng");
        }

        // 4. Min order value
        if (coupon.getMinOrderValue() != null
                && subtotal.compareTo(coupon.getMinOrderValue()) < 0) {
            return invalid("Giá trị đơn hàng tối thiểu là "
                    + coupon.getMinOrderValue().toPlainString() + " VNĐ");
        }

        // 5. Scope validation
        if (!validateScope(coupon, userId, items)) {
            return invalid("Coupon không áp dụng cho sản phẩm trong giỏ hàng");
        }

        // 6. Compute discount
        BigDecimal discount = computeDiscount(coupon, subtotal, shippingFee);

        // 7. Atomic consume if requested
        if (consume) {
            if (!coupon.tryIncrementUsage()) {
                return invalid("Coupon đã hết lượt sử dụng");
            }
            couponRepository.save(coupon);
        }

        return ValidateCouponResponse.builder()
                .valid(true)
                .discountAmount(discount)
                .reason(null)
                .coupon(toDto(coupon).maskForPublic())
                .build();
    }

    private boolean validateScope(Coupon coupon, Long userId,
                                   List<ValidateCouponRequest.CartItemRef> items) {
        CouponScope scope = coupon.getScope();
        if (scope == null || scope == CouponScope.ALL) return true;

        List<Long> targetIds = coupon.getTargetIds();
        if (targetIds == null || targetIds.isEmpty()) return false;

        Set<Long> targetSet = Set.copyOf(targetIds);

        switch (scope) {
            case USER:
                return userId != null && targetSet.contains(userId);
            case PRODUCT:
                if (items == null || items.isEmpty()) return false;
                return items.stream().anyMatch(i -> targetSet.contains(i.getProductId()));
            case SELLER:
                if (items == null || items.isEmpty()) return false;
                return items.stream().anyMatch(i -> i.getSellerId() != null
                        && targetSet.contains(i.getSellerId()));
            case CATEGORY:
                // Category validation requires product-to-category mapping.
                // For MVP: return true and let the service consumer handle it,
                // or accept a pre-resolved list of category IDs.
                // Here we fall back to allowing — implement category lookup if needed.
                return true;
            default:
                return false;
        }
    }

    private BigDecimal computeDiscount(Coupon coupon, BigDecimal subtotal, BigDecimal shippingFee) {
        CouponType type = coupon.getType();
        BigDecimal value = coupon.getValue();

        if (value == null || subtotal == null) return BigDecimal.ZERO;

        switch (type) {
            case PERCENT: {
                BigDecimal pct = value.divide(new BigDecimal("100"), 8, RoundingMode.HALF_UP);
                BigDecimal discount = subtotal.multiply(pct).setScale(0, RoundingMode.DOWN);
                if (coupon.getMaxDiscountAmount() != null
                        && discount.compareTo(coupon.getMaxDiscountAmount()) > 0) {
                    discount = coupon.getMaxDiscountAmount();
                }
                // Cap at subtotal
                if (discount.compareTo(subtotal) > 0) discount = subtotal;
                return discount;
            }
            case FIXED: {
                BigDecimal discount = value.min(subtotal);
                return discount;
            }
            case FREE_SHIPPING: {
                BigDecimal ship = shippingFee != null ? shippingFee : BigDecimal.ZERO;
                BigDecimal discount = value.min(ship);
                return discount;
            }
            default:
                return BigDecimal.ZERO;
        }
    }

    private static ValidateCouponResponse invalid(String reason) {
        return ValidateCouponResponse.builder()
                .valid(false)
                .discountAmount(BigDecimal.ZERO)
                .reason(reason)
                .build();
    }
}
