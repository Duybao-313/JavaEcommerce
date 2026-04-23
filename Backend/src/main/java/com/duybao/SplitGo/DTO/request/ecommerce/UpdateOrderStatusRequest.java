package com.duybao.SplitGo.DTO.request.ecommerce;

import com.duybao.SplitGo.Enum.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateOrderStatusRequest {
    @NotNull
    private OrderStatus status;
}

