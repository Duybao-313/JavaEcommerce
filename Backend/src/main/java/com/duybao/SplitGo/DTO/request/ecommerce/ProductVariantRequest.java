package com.duybao.SplitGo.DTO.request.ecommerce;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.Map;
import lombok.Data;

@Data
public class ProductVariantRequest {

    private String sku;

    private Map<String, String> attributes;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal price;

    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal salePrice;

    @NotNull
    @Min(0)
    private Integer stock;

    private String imageUrl;

    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal weight;
}
