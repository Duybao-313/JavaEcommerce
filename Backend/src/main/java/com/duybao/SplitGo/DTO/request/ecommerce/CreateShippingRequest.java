package com.duybao.SplitGo.DTO.request.ecommerce;

import com.duybao.SplitGo.Enum.Carrier;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import lombok.Data;

@Data
public class CreateShippingRequest {
    @NotNull
    private Long orderId;

    @NotNull
    private Carrier carrier;

    @NotNull
    private LocalDateTime estimatedDelivery;

    private String trackingCode;
}

