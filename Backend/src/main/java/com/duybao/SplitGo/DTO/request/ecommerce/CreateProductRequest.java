package com.duybao.SplitGo.DTO.request.ecommerce;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;
import lombok.Data;

@Data
public class CreateProductRequest {
    @NotBlank
    private String name;

    private String description;
    private String imageUrl;
    private Long ownerId;
    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal salePrice;

    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal weight;

    private String sku;

    private Boolean isFeatured;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal price;

    @Min(0)
    private Integer stock;

    private Long categoryId;

    private String categoryName;

    private List<ProductVariantRequest> variants;
}

