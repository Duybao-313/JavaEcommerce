package com.duybao.SplitGo.Model;

import com.duybao.SplitGo.Enum.CouponScope;
import com.duybao.SplitGo.Enum.CouponType;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "coupon", indexes = {
        @Index(columnList = "code", unique = true),
        @Index(columnList = "isActive"),
        @Index(columnList = "startAt, endAt")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    private String code;

    @Column(length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private CouponType type;

    @Column(precision = 19, scale = 2)
    private BigDecimal value;

    @Column(name = "max_discount_amount", precision = 19, scale = 2)
    private BigDecimal maxDiscountAmount;

    @Column(name = "min_order_value", precision = 19, scale = 2)
    private BigDecimal minOrderValue;

    @Enumerated(EnumType.STRING)
    @Column(length = 32)
    @Builder.Default
    private CouponScope scope = CouponScope.ALL;

    @Column(name = "target_ids_json", columnDefinition = "TEXT")
    @Convert(converter = JsonListConverter.class)
    private List<Long> targetIds;

    @Column(name = "start_at")
    private LocalDateTime startAt;

    @Column(name = "end_at")
    private LocalDateTime endAt;

    @Column(name = "usage_limit")
    private Integer usageLimit;

    @Column(name = "per_user_limit")
    private Integer perUserLimit;

    @Column(name = "used_count")
    @Builder.Default
    private Integer usedCount = 0;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "metadata", columnDefinition = "JSON")
    private String metadata;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Version
    private Long version;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (usedCount == null) usedCount = 0;
        if (isActive == null) isActive = true;
        if (scope == null) scope = CouponScope.ALL;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Returns whether the coupon is currently valid based on time window.
     */
    public boolean isInTimeWindow() {
        LocalDateTime now = LocalDateTime.now();
        return (startAt == null || !now.isBefore(startAt))
                && (endAt == null || !now.isAfter(endAt));
    }

    /**
     * Returns whether the coupon has remaining usage.
     */
    public boolean hasRemainingUsage() {
        return usageLimit == null || usedCount < usageLimit;
    }

    /**
     * Atomically increment usedCount if within limits.
     * Returns true if successful.
     */
    public boolean tryIncrementUsage() {
        if (!hasRemainingUsage()) return false;
        usedCount++;
        return true;
    }
}
