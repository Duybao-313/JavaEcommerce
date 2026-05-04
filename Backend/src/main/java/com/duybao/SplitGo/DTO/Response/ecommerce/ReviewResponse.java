package com.duybao.SplitGo.DTO.Response.ecommerce;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReviewResponse {
    private Long id;

    private Long productId;

    private String productName;

    private Long reviewerId;

    private String reviewerName;

    private Long orderId;

    private Integer rating;

    private String title;

    private String comment;

    private String images;

    private Boolean isApproved;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}

