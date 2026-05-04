package com.duybao.SplitGo.DTO.request.ecommerce;

import com.duybao.SplitGo.Enum.ShippingStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import lombok.Data;

@Data
public class CreateShippingRequest {
    @NotNull
    private Long orderId;

    @NotBlank
    private String carrierName;

    @NotNull
    private LocalDateTime estimatedDelivery;

    private String trackingCode;
}

