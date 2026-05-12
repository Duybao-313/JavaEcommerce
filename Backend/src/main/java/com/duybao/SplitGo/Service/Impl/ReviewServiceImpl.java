package com.duybao.SplitGo.Service.Impl;

import com.duybao.SplitGo.DTO.Response.ecommerce.ProductReviewSummaryResponse;
import com.duybao.SplitGo.DTO.Response.ecommerce.ReviewResponse;
import com.duybao.SplitGo.DTO.request.ecommerce.CreateReviewRequest;
import com.duybao.SplitGo.Exception.AppException;
import com.duybao.SplitGo.Exception.ErrorCode;
import com.duybao.SplitGo.Model.Order;
import com.duybao.SplitGo.Model.Product;
import com.duybao.SplitGo.Model.ProductVariant;
import com.duybao.SplitGo.Model.Review;
import com.duybao.SplitGo.Model.User;
import com.duybao.SplitGo.Repository.OrderRepository;
import com.duybao.SplitGo.Repository.ProductRepository;
import com.duybao.SplitGo.Repository.ProductVariantRepository;
import com.duybao.SplitGo.Repository.ReviewRepository;
import com.duybao.SplitGo.Repository.UserRepository;
import com.duybao.SplitGo.Service.ReviewService;
import jakarta.transaction.Transactional;
import java.util.List;
import java.math.BigDecimal;
import java.math.RoundingMode;
import org.springframework.stereotype.Service;

@Service
public class ReviewServiceImpl implements ReviewService {
    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final ProductVariantRepository variantRepository;

    public ReviewServiceImpl(
            ReviewRepository reviewRepository,
            ProductRepository productRepository,
            UserRepository userRepository,
            OrderRepository orderRepository,
            ProductVariantRepository variantRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.variantRepository = variantRepository;
    }

    @Override
    @Transactional
    public ReviewResponse createReview(Long reviewerId, CreateReviewRequest request) {
        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (!order.getBuyer().getId().equals(reviewerId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // Check duplicate per product+variant (not just per order)
        boolean alreadyReviewed;
        if (request.getVariantId() != null) {
            alreadyReviewed = reviewRepository.existsByOrderIdAndProductIdAndVariantIdAndReviewerId(
                    request.getOrderId(), request.getProductId(), request.getVariantId(), reviewerId);
        } else {
            alreadyReviewed = reviewRepository.existsByOrderIdAndProductIdAndReviewerId(
                    request.getOrderId(), request.getProductId(), reviewerId);
        }

        if (alreadyReviewed) {
            throw new AppException(ErrorCode.REVIEW_ALREADY_EXISTS);
        }

        Review.ReviewBuilder reviewBuilder = Review.builder()
                .product(product)
                .reviewer(reviewer)
                .order(order)
                .rating(request.getRating())
                .title(request.getTitle())
                .comment(request.getComment())
                .images(request.getImages())
                .isApproved(false);

        if (request.getVariantId() != null) {
            ProductVariant variant = variantRepository.findById(request.getVariantId())
                    .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND));
            reviewBuilder.variant(variant);
        }

        return toReviewResponse(reviewRepository.save(reviewBuilder.build()));
    }

    @Override
    public List<ReviewResponse> getAllReviews() {
        return reviewRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toReviewResponse)
                .toList();
    }

    @Override
    public List<ReviewResponse> getProductReviews(Long productId) {
        return reviewRepository.findByProductId(productId).stream()
                .map(this::toReviewResponse)
                .toList();
    }

    @Override
    public List<ReviewResponse> getProductApprovedReviews(Long productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId).stream()
                .map(this::toReviewResponse)
                .toList();
    }

    @Override
    public List<ReviewResponse> getUserReviews(Long userId) {
        return reviewRepository.findByReviewerId(userId).stream()
                .map(this::toReviewResponse)
                .toList();
    }

    @Override
    public ProductReviewSummaryResponse getProductReviewSummary(Long productId) {
        Double avgRating = reviewRepository.computeAvgRatingByProductId(productId);
        long count = reviewRepository.countByProductId(productId);

        // Get top 4 recent reviews
        List<ReviewResponse> recentReviews = reviewRepository
                .findByProductIdOrderByCreatedAtDesc(productId)
                .stream()
                .limit(4)
                .map(this::toReviewResponse)
                .toList();

        return ProductReviewSummaryResponse.builder()
                .productId(productId)
                .avgRating(avgRating)
                .reviewCount((int) count)
                .recentReviews(recentReviews)
                .build();
    }

    @Override
    @Transactional
    public void deleteReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));

        User seller = review.getProduct().getSeller();
        reviewRepository.delete(review);

        // Recalculate seller's storeRating after delete
        updateSellerStoreRating(seller.getId());
    }

    @Override
    public boolean canUserReviewProduct(Long userId, Long orderId) {
        return reviewRepository.existsByOrderIdAndReviewerId(orderId, userId);
    }

    private void updateSellerStoreRating(Long sellerId) {
        User seller = userRepository.findById(sellerId).orElse(null);
        if (seller == null) return;

        Double avgRating = reviewRepository.computeAvgRatingBySellerId(sellerId);
        seller.setStoreRating(avgRating != null ? BigDecimal.valueOf(avgRating).setScale(2, RoundingMode.HALF_UP) : null);
        userRepository.save(seller);
    }

    private ReviewResponse toReviewResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .productId(review.getProduct().getId())
                .productName(review.getProduct().getName())
                .reviewerId(review.getReviewer().getId())
                .reviewerName(review.getReviewer().getFullName())
                .orderId(review.getOrder().getId())
                .variantId(review.getVariant() != null ? review.getVariant().getId() : null)
                .rating(review.getRating())
                .title(review.getTitle())
                .comment(review.getComment())
                .images(review.getImages())
                .isApproved(review.getIsApproved())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
}

