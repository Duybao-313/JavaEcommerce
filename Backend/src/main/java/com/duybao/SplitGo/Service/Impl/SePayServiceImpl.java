package com.duybao.SplitGo.Service.Impl;

import com.duybao.SplitGo.Config.SePayConfig;
import com.duybao.SplitGo.DTO.request.payment.SePayIpnRequest;
import com.duybao.SplitGo.DTO.response.payment.SePayPaymentResponse;
import com.duybao.SplitGo.Enum.OrderStatus;
import com.duybao.SplitGo.Enum.PaymentStatus;
import com.duybao.SplitGo.Exception.AppException;
import com.duybao.SplitGo.Exception.ErrorCode;
import com.duybao.SplitGo.Model.Order;
import com.duybao.SplitGo.Model.PaymentTransaction;
import com.duybao.SplitGo.Repository.OrderRepository;
import com.duybao.SplitGo.Repository.PaymentTransactionRepository;
import com.duybao.SplitGo.Service.SePayService;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class 
SePayServiceImpl implements SePayService {

    private final SePayConfig sePayConfig;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final OrderRepository orderRepository;

    /**
     * Allowed fields for SePay signature, in EXACT order required by SePay docs.
     */
    private static final String[] SIGNED_FIELDS = {
        "order_amount", "merchant", "currency", "operation",
        "order_description", "order_invoice_number", "customer_id",
        "payment_method", "success_url", "error_url", "cancel_url"
    };

    @Override
    public SePayPaymentResponse createPayment(Order order) {
        Map<String, String> formFields = buildFormFields(order);

        PaymentTransaction tx = paymentTransactionRepository
                .findByOrderId(order.getId())
                .stream()
                .findFirst()
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));

        String gatewayUrl = sePayConfig.getBaseUrl() + "/v1/checkout/init";
        tx.setGatewayUrl(gatewayUrl);
        paymentTransactionRepository.save(tx);

        return SePayPaymentResponse.builder()
                .formFields(formFields)
                .gatewayUrl(gatewayUrl)
                .orderCode(order.getOrderCode())
                .redirectToGateway(true)
                .message("Chuyển hướng đến cổng thanh toán SePay...")
                .build();
    }

    @Override
    public String getPaymentFormHtml(Order order) {
        Map<String, String> fields = buildFormFields(order);
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html><html><body>");
        html.append("<form id='sepay-form' action='").append(sePayConfig.getBaseUrl())
                .append("/v1/checkout/init' method='POST'>");
        for (Map.Entry<String, String> entry : fields.entrySet()) {
            html.append("<input type='hidden' name='").append(entry.getKey())
                    .append("' value='").append(escapeHtml(entry.getValue())).append("' />");
        }
        html.append("<input type='hidden' name='signature' value='").append(fields.get("signature")).append("' />");
        html.append("</form>");
        html.append("<script>document.getElementById('sepay-form').submit();</script>");
        html.append("</body></html>");
        return html.toString();
    }

    private Map<String, String> buildFormFields(Order order) {
        String orderInvoiceNumber = order.getOrderCode();
        
        // SePay requires amount as integer string (no decimals)
        BigDecimal amount = order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO;
        if (order.getDiscountAmount() != null) {
            amount = amount.subtract(order.getDiscountAmount());
        }
        if (order.getShippingFee() != null) {
            amount = amount.add(order.getShippingFee());
        }
        if (amount.compareTo(BigDecimal.ZERO) < 0) amount = BigDecimal.ZERO;
        String orderAmount = String.valueOf(amount.longValue());

        // Use LinkedHashMap to preserve insertion order for signature
        Map<String, String> fields = new LinkedHashMap<>();
        fields.put("order_amount", orderAmount);
        fields.put("merchant", sePayConfig.getMerchantId());
        fields.put("currency", "VND");
        fields.put("operation", "PURCHASE");
        fields.put("order_description", "Thanh toan don hang " + orderInvoiceNumber);
        fields.put("order_invoice_number", orderInvoiceNumber);
        fields.put("customer_id", order.getBuyer().getId().toString());
        fields.put("payment_method", "BANK_TRANSFER");
        // Callback URLs: append order_invoice_number so SePay redirect preserves it
        // (IPN is server-to-server, but success/error/cancel are browser-level redirects)
        String successUrl = sePayConfig.getSuccessUrl();
        String errorUrl = sePayConfig.getErrorUrl();
        String cancelUrl = sePayConfig.getCancelUrl();
        if (successUrl != null && !successUrl.isBlank()) {
            String connector = successUrl.contains("?") ? "&" : "?";
            fields.put("success_url", successUrl + connector + "order_invoice_number=" + orderInvoiceNumber);
            if (errorUrl != null && !errorUrl.isBlank()) {
                connector = errorUrl.contains("?") ? "&" : "?";
                fields.put("error_url", errorUrl + connector + "order_invoice_number=" + orderInvoiceNumber);
            }
            if (cancelUrl != null && !cancelUrl.isBlank()) {
                connector = cancelUrl.contains("?") ? "&" : "?";
                fields.put("cancel_url", cancelUrl + connector + "order_invoice_number=" + orderInvoiceNumber);
            }
        }

        String signature = signFields(fields, sePayConfig.getSecretKey());
        fields.put("signature", signature);

        return fields;
    }

    @Override
    public boolean verifyIpnSignature(SePayIpnRequest request, String receivedSignature) {
        // SePay IPN uses X-Secret-Key header for auth, not HMAC signature on body.
        // The secret key is verified by comparing X-Secret-Key header to configured secret key.
        return sePayConfig.getSecretKey().equals(receivedSignature);
    }

    @Override
    public void handleIpn(SePayIpnRequest request) {
        log.info("SePay IPN received: notificationType={}, invoiceNumber={}",
                request.getNotificationType(),
                request.getOrder() != null ? request.getOrder().getOrderInvoiceNumber() : "null");

        if (!"ORDER_PAID".equals(request.getNotificationType())) {
            log.info("SePay IPN: Ignoring non-payment notification: {}", request.getNotificationType());
            return;
        }

        if (request.getOrder() == null || request.getOrder().getOrderInvoiceNumber() == null) {
            log.error("SePay IPN: Missing order invoice number");
            return;
        }

        String orderCode = request.getOrder().getOrderInvoiceNumber();

        // Find order by orderCode (invoice_number maps to our orderCode)
        Optional<Order> orderOpt = orderRepository.findByOrderCode(orderCode);
        if (orderOpt.isEmpty()) {
            log.error("SePay IPN: Order not found for code: {}", orderCode);
            return;
        }

        Order order = orderOpt.get();

        // Update payment transaction
        PaymentTransaction tx = paymentTransactionRepository
                .findByOrderId(order.getId())
                .stream()
                .findFirst()
                .orElse(null);

        if (tx != null) {
            if (tx.getStatus() == PaymentStatus.PAID) {
                log.info("SePay IPN: Payment already marked as PAID for order: {}", orderCode);
                return;
            }
            tx.setStatus(PaymentStatus.PAID);
            tx.setPaidAt(LocalDateTime.now());
            if (request.getTransaction() != null) {
                tx.setGatewayRef(request.getTransaction().getTransactionId());
            }
            paymentTransactionRepository.save(tx);
        }

        // Update order status from PENDING_PAYMENT to CONFIRMED
        if (order.getStatus() == OrderStatus.PENDING_PAYMENT) {
            order.setStatus(OrderStatus.CONFIRMED);
            orderRepository.save(order);
            log.info("SePay IPN: Order {} status updated to CONFIRMED", orderCode);
        } else if (order.getStatus() == OrderStatus.CONFIRMED) {
            log.info("SePay IPN: Order {} already CONFIRMED", orderCode);
        } else {
            log.warn("SePay IPN: Order {} has unexpected status {}", orderCode, order.getStatus());
        }
    }

    /**
     * Creates HMAC-SHA256 signature exactly as SePay requires:
     * 1. Only sign fields that have values (skip empty/null)
     * 2. Build string: field1=value1,field2=value2,... (in SIGNED_FIELDS order)
     * 3. HMAC-SHA256 with secret key
     * 4. Base64 encode
     */
    private String signFields(Map<String, String> fields, String secretKey) {
        try {
            StringBuilder signData = new StringBuilder();
            boolean first = true;
            for (String field : SIGNED_FIELDS) {
                String value = fields.get(field);
                if (value == null || value.isEmpty()) continue;
                if (!first) signData.append(",");
                signData.append(field).append("=").append(value);
                first = false;
            }

            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(
                    secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(signData.toString().getBytes(StandardCharsets.UTF_8));

            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            throw new AppException(ErrorCode.PAYMENT_GATEWAY_ERROR);
        }
    }

    private String escapeHtml(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;")
                .replace("\"", "&quot;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("'", "&#39;");
    }
}
