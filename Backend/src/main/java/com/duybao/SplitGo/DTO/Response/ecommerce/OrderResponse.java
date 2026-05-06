package com.duybao.SplitGo.DTO.Response.ecommerce;

import com.duybao.SplitGo.Enum.OrderStatus;
import com.duybao.SplitGo.Enum.PaymentMethod;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrderResponse {
    private Long orderId;
    private String orderCode;
    private Long buyerId;
    private String buyerUsername;
    private OrderStatus status;
    private PaymentMethod paymentMethod;
    private String shippingAddress;
    private String phone;
    private String recipientName;
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private BigDecimal shippingFee;
    private BigDecimal finalAmount;
    private String note;
    private String couponCode;
    private List<OrderItemResponse> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime shippedAt;
    private LocalDateTime deliveredAt;
}

