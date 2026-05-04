package com.duybao.SplitGo.Service.Impl;

import com.duybao.SplitGo.DTO.Response.ecommerce.ShippingResponse;
import com.duybao.SplitGo.DTO.request.ecommerce.CreateShippingRequest;
import com.duybao.SplitGo.DTO.request.ecommerce.UpdateShippingRequest;
import com.duybao.SplitGo.Enum.ShippingStatus;
import com.duybao.SplitGo.Exception.AppException;
import com.duybao.SplitGo.Exception.ErrorCode;
import com.duybao.SplitGo.Model.Order;
import com.duybao.SplitGo.Model.Shipping;
import com.duybao.SplitGo.Repository.OrderRepository;
import com.duybao.SplitGo.Repository.ShippingRepository;
import com.duybao.SplitGo.Service.ShippingService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

@Service
public class ShippingServiceImpl implements ShippingService {
    private final ShippingRepository shippingRepository;
    private final OrderRepository orderRepository;

    public ShippingServiceImpl(ShippingRepository shippingRepository, OrderRepository orderRepository) {
        this.shippingRepository = shippingRepository;
        this.orderRepository = orderRepository;
    }

    @Override
    @Transactional
    public ShippingResponse createShipping(CreateShippingRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (shippingRepository.findByOrderId(request.getOrderId()).isPresent()) {
            throw new AppException(ErrorCode.SHIPPING_ALREADY_EXISTS);
        }

        Shipping shipping = Shipping.builder()
                .order(order)
                .carrierName(request.getCarrierName())
                .trackingCode(request.getTrackingCode())
                .estimatedDelivery(request.getEstimatedDelivery())
                .status(ShippingStatus.PENDING)
                .build();

        return toShippingResponse(shippingRepository.save(shipping));
    }

    @Override
    @Transactional
    public ShippingResponse updateShipping(Long shippingId, UpdateShippingRequest request) {
        Shipping shipping = shippingRepository.findById(shippingId)
                .orElseThrow(() -> new AppException(ErrorCode.SHIPPING_NOT_FOUND));

        if (request.getCarrierName() != null) {
            shipping.setCarrierName(request.getCarrierName());
        }
        if (request.getTrackingCode() != null) {
            shipping.setTrackingCode(request.getTrackingCode());
        }
        if (request.getStatus() != null) {
            shipping.setStatus(request.getStatus());
        }
        if (request.getEstimatedDelivery() != null) {
            shipping.setEstimatedDelivery(request.getEstimatedDelivery());
        }
        if (request.getActualDelivery() != null) {
            shipping.setActualDelivery(request.getActualDelivery());
        }

        return toShippingResponse(shippingRepository.save(shipping));
    }

    @Override
    public ShippingResponse getShippingByOrderId(Long orderId) {
        Shipping shipping = shippingRepository.findByOrderId(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.SHIPPING_NOT_FOUND));

        return toShippingResponse(shipping);
    }

    @Override
    public ShippingResponse getShippingByTrackingCode(String trackingCode) {
        Shipping shipping = shippingRepository.findByTrackingCode(trackingCode)
                .orElseThrow(() -> new AppException(ErrorCode.SHIPPING_NOT_FOUND));

        return toShippingResponse(shipping);
    }

    @Override
    @Transactional
    public ShippingResponse updateShippingStatus(Long shippingId, ShippingStatus status) {
        Shipping shipping = shippingRepository.findById(shippingId)
                .orElseThrow(() -> new AppException(ErrorCode.SHIPPING_NOT_FOUND));

        shipping.setStatus(status);
        return toShippingResponse(shippingRepository.save(shipping));
    }

    @Override
    @Transactional
    public void markAsDelivered(Long shippingId) {
        Shipping shipping = shippingRepository.findById(shippingId)
                .orElseThrow(() -> new AppException(ErrorCode.SHIPPING_NOT_FOUND));

        shipping.setStatus(ShippingStatus.DELIVERED);
        shipping.setActualDelivery(java.time.LocalDateTime.now());
        shippingRepository.save(shipping);
    }

    @Override
    @Transactional
    public void markAsInTransit(Long shippingId) {
        Shipping shipping = shippingRepository.findById(shippingId)
                .orElseThrow(() -> new AppException(ErrorCode.SHIPPING_NOT_FOUND));

        shipping.setStatus(ShippingStatus.IN_TRANSIT);
        shippingRepository.save(shipping);
    }

    private ShippingResponse toShippingResponse(Shipping shipping) {
        return ShippingResponse.builder()
                .id(shipping.getId())
                .orderId(shipping.getOrder().getId())
                .trackingCode(shipping.getTrackingCode())
                .carrierName(shipping.getCarrierName())
                .status(shipping.getStatus())
                .estimatedDelivery(shipping.getEstimatedDelivery())
                .actualDelivery(shipping.getActualDelivery())
                .createdAt(shipping.getCreatedAt())
                .updatedAt(shipping.getUpdatedAt())
                .build();
    }
}

