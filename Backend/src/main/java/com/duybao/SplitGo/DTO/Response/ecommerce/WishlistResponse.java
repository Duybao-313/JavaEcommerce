package com.duybao.SplitGo.DTO.Response.ecommerce;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class WishlistResponse {
    private Long id;

    private Long userId;

    private Long productId;

    private String productName;

    private String productImage;

    private String productPrice;

    private LocalDateTime createdAt;
}

