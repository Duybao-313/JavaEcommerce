package com.duybao.SplitGo.DTO.Response.ecommerce;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReviewableItemResponse {
    private Long productId;
    private Long variantId;
    private String productName;
    private String variantAttributes;
    private String productImageUrl;
    private boolean canReview;
    private boolean reviewed;
}
