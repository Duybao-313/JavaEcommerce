package com.duybao.SplitGo.DTO.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidateCouponRequest {

    @NotBlank(message = "Mã coupon không được để trống")
    private String code;

    @Positive(message = "Tạm tính phải lớn hơn 0")
    private BigDecimal subtotal;

    private BigDecimal shippingFee;

    private Long userId;

    private List<CartItemRef> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CartItemRef {
        private Long productId;
        private Long variantId;
        private Long sellerId;
        private Integer quantity;
    }
}
