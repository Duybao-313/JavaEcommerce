package com.duybao.SplitGo.DTO.Response.ecommerce;

import com.duybao.SplitGo.Enum.OrderStatus;
import com.duybao.SplitGo.Enum.PaymentMethod;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrderResponse {
    private Long orderId;
    private String orderCode;
    private Long buyerId;
    private String buyerUsername;
    private Long sellerId;
    private SellerSummary seller;
    private OrderStatus status;
    private PaymentMethod paymentMethod;
    private String paymentStatus;
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

    // Payment gateway fields (only populated for online payment like SePay)
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Map<String, String> formFields;
    private String gatewayUrl;
    private boolean redirectToGateway;

    @Data
    @Builder
    public static class SellerSummary {
        private Long id;
        private String username;
        private String storeName;
    }
}

