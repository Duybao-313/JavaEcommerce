package com.duybao.SplitGo.DTO.Response.ecommerce;

import com.duybao.SplitGo.Enum.ProductStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private String imageUrl;
    private BigDecimal price;
    private BigDecimal salePrice;
    private BigDecimal weight;
    private String sku;
    private Boolean isFeatured;
    private Integer stock;
    private Long viewCount;
    private Long soldCount;
    private ProductStatus status;
    private Long sellerId;
    private String sellerUsername;
    private Long categoryId;
    private String categoryName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<ProductVariantResponse> variants;
}

