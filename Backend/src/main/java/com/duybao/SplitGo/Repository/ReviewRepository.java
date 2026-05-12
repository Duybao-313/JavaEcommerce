package com.duybao.SplitGo.Repository;

import com.duybao.SplitGo.Model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findAllByOrderByCreatedAtDesc();

    List<Review> findByProductId(Long productId);

    List<Review> findByProductIdAndIsApprovedTrue(Long productId);

    List<Review> findByProductIdAndIsApprovedTrueOrderByCreatedAtDesc(Long productId);

    List<Review> findByProductIdOrderByCreatedAtDesc(Long productId);

    List<Review> findByReviewerId(Long reviewerId);

    List<Review> findByOrderId(Long orderId);

    long countByProductId(Long productId);

    long countByProductIdAndIsApprovedTrue(Long productId);

    boolean existsByOrderIdAndReviewerId(Long orderId, Long reviewerId);

    boolean existsByOrderIdAndProductIdAndReviewerId(Long orderId, Long productId, Long reviewerId);

    boolean existsByOrderIdAndProductIdAndVariantIdAndReviewerId(Long orderId, Long productId, Long variantId, Long reviewerId);

    List<Review> findByOrderIdAndReviewerId(Long orderId, Long reviewerId);

    @Query("SELECT COALESCE(AVG(r.rating), 0.0) FROM Review r WHERE r.product.id = :productId")
    Double computeAvgRatingByProductId(@Param("productId") Long productId);

    @Query("SELECT COALESCE(AVG(r.rating), 0.0) FROM Review r WHERE r.product.seller.id = :sellerId")
    Double computeAvgRatingBySellerId(@Param("sellerId") Long sellerId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.product.seller.id = :sellerId")
    Long countApprovedBySellerId(@Param("sellerId") Long sellerId);
}

