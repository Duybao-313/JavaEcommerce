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
    private Long sellerId;
    private String sellerUsername;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal lineTotal;
}

