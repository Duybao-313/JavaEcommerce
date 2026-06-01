package com.duybao.SplitGo.DTO.request.payment;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.util.Map;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class SePayIpnRequest {

    private Long timestamp;

    @JsonProperty("notification_type")
    private String notificationType;

    private OrderInfo order;
    private TransactionInfo transaction;
    private CustomerInfo customer;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class OrderInfo {
        private String id;

        @JsonProperty("order_id")
        private String orderId;

        @JsonProperty("order_status")
        private String orderStatus;

        @JsonProperty("order_currency")
        private String orderCurrency;

        @JsonProperty("order_amount")
        private String orderAmount;

        @JsonProperty("order_invoice_number")
        private String orderInvoiceNumber;

        @JsonProperty("custom_data")
        private List<Map<String, String>> customData;

        @JsonProperty("user_agent")
        private String userAgent;

        @JsonProperty("ip_address")
        private String ipAddress;

        @JsonProperty("order_description")
        private String orderDescription;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TransactionInfo {
        private String id;

        @JsonProperty("payment_method")
        private String paymentMethod;

        @JsonProperty("transaction_id")
        private String transactionId;

        @JsonProperty("transaction_type")
        private String transactionType;

        @JsonProperty("transaction_date")
        private String transactionDate;

        @JsonProperty("transaction_status")
        private String transactionStatus;

        @JsonProperty("transaction_amount")
        private String transactionAmount;

        @JsonProperty("transaction_currency")
        private String transactionCurrency;

        @JsonProperty("authentication_status")
        private String authenticationStatus;

        @JsonProperty("card_number")
        private String cardNumber;

        @JsonProperty("card_holder_name")
        private String cardHolderName;

        @JsonProperty("card_expiry")
        private String cardExpiry;

        @JsonProperty("card_funding_method")
        private String cardFundingMethod;

        @JsonProperty("card_brand")
        private String cardBrand;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class CustomerInfo {
        private String id;

        @JsonProperty("customer_id")
        private String customerId;
    }
}
