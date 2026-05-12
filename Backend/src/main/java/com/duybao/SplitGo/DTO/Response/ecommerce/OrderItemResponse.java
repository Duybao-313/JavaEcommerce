package com.duybao.SplitGo.DTO.Response.ecommerce;

import java.math.BigDecimal;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrderItemResponse {
    private Long orderItemId;
    private Long productId;
    private String productName;
    private String productImageUrl;
    private Long sellerId;
    private String sellerUsername;
    private Long variantId;
    private String variantAttributes;
    private Integer quantity;
    private Boolean reviewed;
    private Boolean canReview;
    private BigDecimal unitPrice;
    private BigDecimal lineTotal;
}

