package com.duybao.SplitGo.Service;

import com.duybao.SplitGo.DTO.Response.ecommerce.ProductReviewSummaryResponse;
import com.duybao.SplitGo.DTO.Response.ecommerce.ReviewResponse;
import com.duybao.SplitGo.DTO.request.ecommerce.CreateReviewRequest;
import java.util.List;

public interface ReviewService {
    ReviewResponse createReview(Long reviewerId, CreateReviewRequest request);

    List<ReviewResponse> getAllReviews();

    List<ReviewResponse> getProductReviews(Long productId);

    List<ReviewResponse> getProductApprovedReviews(Long productId);

    List<ReviewResponse> getUserReviews(Long userId);

    ProductReviewSummaryResponse getProductReviewSummary(Long productId);

    void deleteReview(Long reviewId);

    boolean canUserReviewProduct(Long userId, Long orderId);
}

