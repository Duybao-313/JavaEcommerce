package com.duybao.SplitGo.DTO.request.ecommerce;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateCategoryRequest {
    @NotBlank
    private String name;

    private String description;
}

