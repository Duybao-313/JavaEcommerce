package com.duybao.SplitGo.DTO.request.ecommerce;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateProductStatusRequest {
    @NotBlank
    private String status;
}
