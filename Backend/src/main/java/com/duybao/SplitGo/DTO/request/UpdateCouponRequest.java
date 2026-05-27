package com.duybao.SplitGo.DTO.request;

import com.duybao.SplitGo.Enum.CouponScope;
import com.duybao.SplitGo.Enum.CouponType;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCouponRequest {
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
    private Boolean isActive;
}
