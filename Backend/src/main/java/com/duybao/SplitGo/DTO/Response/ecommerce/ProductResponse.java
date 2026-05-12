package com.duybao.SplitGo.DTO.Response.ecommerce;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProductResponse {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private String imageUrl;
    private List<String> gallery;
    private BigDecimal price;
    private BigDecimal salePrice;
    private BigDecimal weight;
    private String sku;
    private Boolean isFeatured;
    private Integer stock;
    private Long viewCount;
    private Long soldCount;
    private String status;
    private CategorySummary category;
    private SellerSummary seller;
    private List<ProductOptionResponse> options;
    private List<ProductVariantResponse> variants;
    private Double avgRating;
    private Integer reviewCount;
    private List<RelatedProductSummary> relatedProducts;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

