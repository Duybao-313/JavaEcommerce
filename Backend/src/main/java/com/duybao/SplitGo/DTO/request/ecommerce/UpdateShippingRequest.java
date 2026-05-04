package com.duybao.SplitGo.DTO.request.ecommerce;

import com.duybao.SplitGo.Enum.ShippingStatus;
import java.time.LocalDateTime;
import lombok.Data;

@Data
public class UpdateShippingRequest {
    private ShippingStatus status;

    private String trackingCode;

    private String carrierName;

    private LocalDateTime estimatedDelivery;

    private LocalDateTime actualDelivery;
}

