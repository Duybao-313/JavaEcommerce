package com.duybao.SplitGo.DTO.Response.ecommerce;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CategoryResponse {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private String imageUrl;
    private Long parentId;
    private Boolean isActive;
    private LocalDateTime createdAt;
}

