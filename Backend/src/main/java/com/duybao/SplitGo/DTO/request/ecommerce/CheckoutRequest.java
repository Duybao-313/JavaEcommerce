package com.duybao.SplitGo.DTO.request.ecommerce;

import com.duybao.SplitGo.Enum.PaymentMethod;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CheckoutRequest {
    @NotBlank
    private String shippingAddress;
    private String phoneNumber;
    private String recipientName;
    private BigDecimal shippingFee;
    private BigDecimal discount;
    private PaymentMethod paymentMethod;
    private String note;
    private String couponCode;
}

