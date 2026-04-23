package com.duybao.SplitGo.DTO.request.ecommerce;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import lombok.Data;

@Data
public class CreateProductRequest {
    @NotBlank
    private String name;

    private String description;
    private String imageUrl;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal price;
    @NotNull
    @Min(0)
    private Integer stock;

    private Long categoryId;

    private String categoryName;
}

