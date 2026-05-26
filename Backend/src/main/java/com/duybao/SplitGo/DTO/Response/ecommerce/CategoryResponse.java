package com.duybao.SplitGo.DTO.Response.ecommerce;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CategoryResponse {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private String imageUrl;
    private Long parentId;
    private Boolean isActive;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Tree & admin fields
    @Builder.Default
    private Long productCount = 0L;

    @Builder.Default
    private Long totalProductCount = 0L;

    private List<CategoryResponse> children;
}

