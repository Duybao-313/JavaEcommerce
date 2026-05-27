package com.duybao.SplitGo.Repository;

import com.duybao.SplitGo.Model.Coupon;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {

    Optional<Coupon> findByCode(String code);

    boolean existsByCode(String code);

    /**
     * Find active, non-expired coupons (public).
     * Null startAt/endAt means unbounded: null start = already started, null end = never expires.
     */
    @Query("SELECT c FROM Coupon c WHERE c.isActive = true "
            + "AND (c.startAt IS NULL OR c.startAt <= :now) "
            + "AND (c.endAt IS NULL OR c.endAt >= :now)")
    Page<Coupon> findActivePublicCoupons(@Param("now") LocalDateTime now, Pageable pageable);

    /**
     * Admin: search by code or title, optionally filter by active status.
     */
    @Query("SELECT c FROM Coupon c WHERE "
            + "(:q IS NULL OR LOWER(c.code) LIKE LOWER(CONCAT('%', :q, '%')) "
            + "OR LOWER(c.title) LIKE LOWER(CONCAT('%', :q, '%'))) "
            + "AND (:active IS NULL OR c.isActive = :active)")
    Page<Coupon> searchCoupons(@Param("q") String q,
                                @Param("active") Boolean active,
                                Pageable pageable);

    /**
     * Find a coupon with pessimistic write lock for atomic usage increment.
     */
    @Query("SELECT c FROM Coupon c WHERE c.code = :code")
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Coupon> findByCodeForUpdate(@Param("code") String code);
}
