package com.duybao.SplitGo.DTO.Response;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidateCouponResponse {
    private boolean valid;
    private BigDecimal discountAmount;
    private String reason;
    private CouponDto coupon;
}
