package com.duybao.SplitGo.Service;

import com.duybao.SplitGo.DTO.Response.ecommerce.ShippingResponse;
import com.duybao.SplitGo.DTO.request.ecommerce.CreateShippingRequest;
import com.duybao.SplitGo.DTO.request.ecommerce.UpdateShippingRequest;
import com.duybao.SplitGo.Enum.ShippingStatus;

public interface ShippingService {
    ShippingResponse createShipping(CreateShippingRequest request);

    ShippingResponse updateShipping(Long shippingId, UpdateShippingRequest request);

    ShippingResponse getShippingByOrderId(Long orderId);

    ShippingResponse getShippingByTrackingCode(String trackingCode);

    ShippingResponse updateShippingStatus(Long shippingId, ShippingStatus status);

    void markAsDelivered(Long shippingId);

    void markAsInTransit(Long shippingId);
}

