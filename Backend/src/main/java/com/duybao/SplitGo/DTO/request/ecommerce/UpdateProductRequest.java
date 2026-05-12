package com.duybao.SplitGo.DTO.request.ecommerce;

import com.duybao.SplitGo.Enum.ProductStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import java.math.BigDecimal;
import java.util.List;
import lombok.Data;

@Data
public class UpdateProductRequest {
    private String name;
    private String description;

    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal price;

    @DecimalMin("0.0")
    private BigDecimal salePrice;

    @DecimalMin("0.0")
    private BigDecimal weight;

    private String sku;

    private Boolean isFeatured;

    @Min(0)
    private Integer stock;

    private ProductStatus status;
    private Long categoryId;

    private List<ProductOptionRequest> options;
    private List<ProductVariantRequest> variants;
}

