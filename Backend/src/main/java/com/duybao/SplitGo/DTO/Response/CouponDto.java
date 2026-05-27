package com.duybao.SplitGo.DTO.Response;

import com.duybao.SplitGo.Enum.CouponScope;
import com.duybao.SplitGo.Enum.CouponType;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * CouponDto — public-safe representation. Usage counters are only included for admin context.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouponDto {

    private Long id;
    private String code;
    private String title;
    private String description;
    private CouponType type;
    private BigDecimal value;
    private BigDecimal maxDiscountAmount;
    private BigDecimal minOrderValue;
    private CouponScope scope;
    private List<Long> targetIds;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private Integer usageLimit;
    private Integer perUserLimit;
    private Integer usedCount;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Public-safe masking: strip admin-only fields for public endpoints
    public CouponDto maskForPublic() {
        this.usedCount = null;
        this.usageLimit = null;
        this.perUserLimit = null;
        this.createdBy = null;
        this.createdAt = null;
        this.updatedAt = null;
        return this;
    }

    // Transient, not exposed to JSON
    private transient Long createdBy;
}
