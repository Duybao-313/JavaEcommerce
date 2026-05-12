package com.duybao.SplitGo.DTO.Response.ecommerce;

import java.math.BigDecimal;
import java.util.Map;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CartItemResponse {
    private Long cartItemId;
    private Long productId;
    private Long variantId;
    private String productName;
    private String imageUrl;
    private Map<String, String> variantAttributes;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal lineTotal;
}

