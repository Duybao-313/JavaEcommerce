package com.duybao.SplitGo.Service;

import com.duybao.SplitGo.DTO.Response.ecommerce.OrderResponse;
import com.duybao.SplitGo.DTO.request.ecommerce.CheckoutRequest;
import com.duybao.SplitGo.Enum.OrderStatus;
import java.util.List;

public interface OrderService {
    OrderResponse checkout(Long buyerId, CheckoutRequest request);

    List<OrderResponse> getMyOrders(Long buyerId);

    OrderResponse getOrderById(Long buyerId, Long orderId);

    List<OrderResponse> getSellerOrders(Long sellerId);

    List<OrderResponse> getAllOrders();

    OrderResponse updateOrderStatus(Long actorId, boolean isAdmin, Long orderId, OrderStatus status);

    OrderResponse cancelOrder(Long buyerId, Long orderId);

    OrderResponse confirmDelivery(Long buyerId, Long orderId);

    OrderResponse cancelOrderBySeller(Long sellerId, Long orderId);
}

