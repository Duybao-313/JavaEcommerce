package com.duybao.SplitGo.DTO.Response.ecommerce;

import com.duybao.SplitGo.Enum.ShippingStatus;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ShippingResponse {
    private Long id;

    private Long orderId;

    private String trackingCode;

    private String carrierName;

    private ShippingStatus status;

    private LocalDateTime estimatedDelivery;

    private LocalDateTime actualDelivery;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}

