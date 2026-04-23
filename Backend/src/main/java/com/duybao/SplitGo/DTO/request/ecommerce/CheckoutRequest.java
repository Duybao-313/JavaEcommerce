package com.duybao.SplitGo.DTO.request.ecommerce;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CheckoutRequest {
    @NotBlank
    private String shippingAddress;
}

