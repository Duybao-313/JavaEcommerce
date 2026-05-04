package com.duybao.SplitGo.DTO.request.ecommerce;

import com.duybao.SplitGo.Enum.PaymentMethod;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CheckoutRequest {
    @NotBlank
    private String shippingAddress;

    private PaymentMethod paymentMethod;

    private String note;
}

