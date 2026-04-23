package com.duybao.SplitGo.DTO.Response.ecommerce;

import java.math.BigDecimal;
import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CartResponse {
    private Long cartId;
    private Long buyerId;
    private List<CartItemResponse> items;
    private BigDecimal totalAmount;
}

