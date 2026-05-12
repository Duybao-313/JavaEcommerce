package com.duybao.SplitGo.Controller;

import com.duybao.SplitGo.DTO.Response.ApiResponse;
import com.duybao.SplitGo.DTO.Response.ecommerce.ProductReviewSummaryResponse;
import com.duybao.SplitGo.DTO.Response.ecommerce.ReviewResponse;
import com.duybao.SplitGo.DTO.request.ecommerce.CreateReviewRequest;
import com.duybao.SplitGo.Model.User;
import com.duybao.SplitGo.Service.ReviewService;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/reviews")
public class ReviewController {
    private final ReviewService reviewService;

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ApiResponse<ReviewResponse> createReview(
            @AuthenticationPrincipal User user,
            @RequestBody @Valid CreateReviewRequest request) {
        return ApiResponse.<ReviewResponse>builder()
                .success(true)
                .code(201)
                .message("Tạo đánh giá thành công")
                .data(reviewService.createReview(user.getId(), request))
                .timestamp(LocalDateTime.now())
                .build();
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<ReviewResponse>> getAllReviewsForAdmin() {
        return ApiResponse.<List<ReviewResponse>>builder()
                .success(true)
                .code(200)
                .message("Lấy danh sách review thành công")
                .data(reviewService.getAllReviews())
                .timestamp(LocalDateTime.now())
                .build();
    }

    @GetMapping("/product/{productId}")
    public ApiResponse<List<ReviewResponse>> getProductReviews(@PathVariable Long productId) {
        return ApiResponse.<List<ReviewResponse>>builder()
                .success(true)
                .code(200)
                .message("Lấy danh sách đánh giá thành công")
                .data(reviewService.getProductReviews(productId))
                .timestamp(LocalDateTime.now())
                .build();
    }

    @GetMapping("/product/{productId}/approved")
    public ApiResponse<List<ReviewResponse>> getApprovedProductReviews(@PathVariable Long productId) {
        return ApiResponse.<List<ReviewResponse>>builder()
                .success(true)
                .code(200)
                .message("Lấy danh sách đánh giá đã duyệt thành công")
                .data(reviewService.getProductApprovedReviews(productId))
                .timestamp(LocalDateTime.now())
                .build();
    }

    @GetMapping("/product/{productId}/summary")
    public ApiResponse<ProductReviewSummaryResponse> getProductReviewSummary(@PathVariable Long productId) {
        return ApiResponse.<ProductReviewSummaryResponse>builder()
                .success(true)
                .code(200)
                .message("Lấy tóm tắt đánh giá thành công")
                .data(reviewService.getProductReviewSummary(productId))
                .timestamp(LocalDateTime.now())
                .build();
    }

    @GetMapping("/user/{userId}")
    public ApiResponse<List<ReviewResponse>> getUserReviews(@PathVariable Long userId) {
        return ApiResponse.<List<ReviewResponse>>builder()
                .success(true)
                .code(200)
                .message("Lấy danh sách đánh giá của người dùng thành công")
                .data(reviewService.getUserReviews(userId))
                .timestamp(LocalDateTime.now())
                .build();
    }

    @DeleteMapping("/{reviewId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ApiResponse<String> deleteReview(@PathVariable Long reviewId) {
        reviewService.deleteReview(reviewId);
        return ApiResponse.<String>builder()
                .success(true)
                .code(200)
                .message("Xóa đánh giá thành công")
                .timestamp(LocalDateTime.now())
                .build();
    }

}

