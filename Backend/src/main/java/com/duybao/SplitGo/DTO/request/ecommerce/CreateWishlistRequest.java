package com.duybao.SplitGo.DTO.request.ecommerce;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateWishlistRequest {
    @NotNull
    private Long productId;
}

