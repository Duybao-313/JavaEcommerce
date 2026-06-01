package com.duybao.SplitGo.DTO.response.payment;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SePayPaymentResponse {
    private String gatewayUrl;
    private String orderCode;
    private boolean redirectToGateway;
    private String message;
    private Map<String, String> formFields;
}
