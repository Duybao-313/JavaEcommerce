package com.duybao.SplitGo.Repository;

import com.duybao.SplitGo.Model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findAllByOrderByCreatedAtDesc();

    List<Review> findByProductId(Long productId);

    List<Review> findByProductIdAndIsApprovedTrue(Long productId);

    List<Review> findByReviewerId(Long reviewerId);

    List<Review> findByOrderId(Long orderId);

    long countByProductIdAndIsApprovedTrue(Long productId);

    boolean existsByOrderIdAndReviewerId(Long orderId, Long reviewerId);

    boolean existsByOrderIdAndProductIdAndReviewerId(Long orderId, Long productId, Long reviewerId);

    boolean existsByOrderIdAndProductIdAndVariantIdAndReviewerId(Long orderId, Long productId, Long variantId, Long reviewerId);

    List<Review> findByOrderIdAndReviewerId(Long orderId, Long reviewerId);
}

