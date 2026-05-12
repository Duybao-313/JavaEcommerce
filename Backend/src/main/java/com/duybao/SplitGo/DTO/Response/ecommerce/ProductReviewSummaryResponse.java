package com.duybao.SplitGo.DTO.Response.ecommerce;

import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProductReviewSummaryResponse {
    private Long productId;
    private Double avgRating;
    private Integer reviewCount;
    private List<ReviewResponse> recentReviews;  // top N recent approved reviews
}
