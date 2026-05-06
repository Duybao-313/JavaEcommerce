package com.duybao.SplitGo.Service.Impl;

import com.duybao.SplitGo.DTO.Response.ecommerce.ReviewResponse;
import com.duybao.SplitGo.DTO.request.ecommerce.CreateReviewRequest;
import com.duybao.SplitGo.Exception.AppException;
import com.duybao.SplitGo.Exception.ErrorCode;
import com.duybao.SplitGo.Model.Order;
import com.duybao.SplitGo.Model.Product;
import com.duybao.SplitGo.Model.Review;
import com.duybao.SplitGo.Model.User;
import com.duybao.SplitGo.Repository.OrderRepository;
import com.duybao.SplitGo.Repository.ProductRepository;
import com.duybao.SplitGo.Repository.ReviewRepository;
import com.duybao.SplitGo.Repository.UserRepository;
import com.duybao.SplitGo.Service.ReviewService;
import jakarta.transaction.Transactional;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ReviewServiceImpl implements ReviewService {
    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    public ReviewServiceImpl(
            ReviewRepository reviewRepository,
            ProductRepository productRepository,
            UserRepository userRepository,
            OrderRepository orderRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
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

        if (reviewRepository.existsByOrderIdAndReviewerId(request.getOrderId(), reviewerId)) {
            throw new AppException(ErrorCode.REVIEW_ALREADY_EXISTS);
        }

        Review review = Review.builder()
                .product(product)
                .reviewer(reviewer)
                .order(order)
                .rating(request.getRating())
                .title(request.getTitle())
                .comment(request.getComment())
                .images(request.getImages())
                .isApproved(false)
                .build();

        return toReviewResponse(reviewRepository.save(review));
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
        return reviewRepository.findByProductIdAndIsApprovedTrue(productId).stream()
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
    @Transactional
    public ReviewResponse approveReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));

        review.setIsApproved(true);
        return toReviewResponse(reviewRepository.save(review));
    }

    @Override
    @Transactional
    public ReviewResponse rejectReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));

        review.setIsApproved(false);
        return toReviewResponse(reviewRepository.save(review));
    }

    @Override
    @Transactional
    public void deleteReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));

        reviewRepository.delete(review);
    }

    @Override
    public boolean canUserReviewProduct(Long userId, Long orderId) {
        return reviewRepository.existsByOrderIdAndReviewerId(orderId, userId);
    }

    private ReviewResponse toReviewResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .productId(review.getProduct().getId())
                .productName(review.getProduct().getName())
                .reviewerId(review.getReviewer().getId())
                .reviewerName(review.getReviewer().getFullName())
                .orderId(review.getOrder().getId())
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

