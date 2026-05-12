package com.duybao.SplitGo.DTO.request.ecommerce;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import lombok.Data;

@Data
public class ProductOptionRequest {
    @NotBlank
    private String name; // "color" or "size" (option key)

    @NotEmpty
    private List<String> values; // ["red","blue"]

    private boolean required = true; // default: buyer must select
}
