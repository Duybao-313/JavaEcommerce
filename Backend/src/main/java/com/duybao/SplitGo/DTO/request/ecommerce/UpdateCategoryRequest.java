package com.duybao.SplitGo.DTO.request.ecommerce;

import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class UpdateCategoryRequest {
    private String name;

    private String description;

    private Long parentId;

    private String imageUrl;

    @Min(0)
    private Integer sortOrder;

    private Boolean isActive;
}

