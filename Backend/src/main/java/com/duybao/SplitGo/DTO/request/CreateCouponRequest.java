package com.duybao.SplitGo.DTO.request;

import com.duybao.SplitGo.Enum.CouponScope;
import com.duybao.SplitGo.Enum.CouponType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateCouponRequest {

    @NotBlank(message = "Mã coupon không được để trống")
    @Size(min = 3, max = 64, message = "Mã coupon phải từ 3 đến 64 ký tự")
    private String code;

    @NotBlank(message = "Tiêu đề không được để trống")
    @Size(max = 255)
    private String title;

    private String description;

    @NotNull(message = "Loại coupon không được để trống")
    private CouponType type;

    @NotNull(message = "Giá trị không được để trống")
    @Positive(message = "Giá trị phải lớn hơn 0")
    private BigDecimal value;

    private BigDecimal maxDiscountAmount;
    private BigDecimal minOrderValue;

    private CouponScope scope;

    private List<Long> targetIds;

    private LocalDateTime startAt;
    private LocalDateTime endAt;

    private Integer usageLimit;
    private Integer perUserLimit;

    private Boolean isActive;
}
