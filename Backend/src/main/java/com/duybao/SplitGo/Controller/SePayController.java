package com.duybao.SplitGo.Controller;

import com.duybao.SplitGo.Config.SePayConfig;
import com.duybao.SplitGo.DTO.request.payment.SePayIpnRequest;
import com.duybao.SplitGo.Enum.PaymentMethod;
import com.duybao.SplitGo.Enum.OrderStatus;
import com.duybao.SplitGo.Enum.PaymentStatus;
import com.duybao.SplitGo.Exception.AppException;
import com.duybao.SplitGo.Exception.ErrorCode;
import com.duybao.SplitGo.Model.Order;
import com.duybao.SplitGo.Model.PaymentTransaction;
import com.duybao.SplitGo.Repository.OrderRepository;
import com.duybao.SplitGo.Repository.PaymentTransactionRepository;
import com.duybao.SplitGo.Service.SePayService;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/payments/sepay")
@RequiredArgsConstructor
@Slf4j
public class SePayController {

    private final SePayService sePayService;
    private final SePayConfig sePayConfig;
    private final OrderRepository orderRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;

    /**
     * IPN (Instant Payment Notification) webhook from SePay.
     * SePay POSTs payment result to this endpoint.
     * Public endpoint - no auth required, validated via X-Secret-Key header.
     */
    @PostMapping("/ipn")
    public ResponseEntity<Map<String, Object>> handleIpn(
            @RequestBody SePayIpnRequest request,
            @RequestHeader(value = "X-Secret-Key", required = false) String secretKey) {

        log.info("SePay IPN endpoint called");

        if (secretKey == null || !sePayService.verifyIpnSignature(request, secretKey)) {
            log.warn("SePay IPN: Invalid secret key");
            throw new AppException(ErrorCode.PAYMENT_SIGNATURE_INVALID);
        }

        sePayService.handleIpn(request);

        return ResponseEntity.ok(Map.of("success", true));
    }

    /**
     * Success callback - SePay redirects user here after successful payment.
     * Also updates order status since IPN may not reach localhost.
     */
    @GetMapping("/success")
    @Transactional
    public ResponseEntity<String> paymentSuccess(@RequestParam(required = false) String order_invoice_number) {
        log.info("SePay success callback for order: {}", order_invoice_number);

        Long orderId = null; // numeric ID for frontend redirect

        if (order_invoice_number != null) {
            Optional<Order> orderOpt = orderRepository.findByOrderCode(order_invoice_number);
            if (orderOpt.isPresent()) {
                Order order = orderOpt.get();
                orderId = order.getId(); // capture numeric ID for redirect

                // Only process SePay orders
                if (order.getPaymentMethod() != PaymentMethod.SEPAY) {
                    log.warn("SePay success callback: Order {} is not a SePay order (method={})",
                            order_invoice_number, order.getPaymentMethod());
                } else if (order.getStatus() == OrderStatus.PENDING_PAYMENT) {
                    // Transition: PENDING_PAYMENT → CONFIRMED
                    order.setStatus(OrderStatus.CONFIRMED);
                    orderRepository.saveAndFlush(order);
                    log.info("Order {} (id={}) status updated to CONFIRMED via success callback",
                            order_invoice_number, orderId);
                } else if (order.getStatus() == OrderStatus.CONFIRMED) {
                    log.info("Order {} (id={}) already CONFIRMED, skipping status update",
                            order_invoice_number, orderId);
                } else {
                    log.warn("SePay success callback: Order {} (id={}) has unexpected status {}",
                            order_invoice_number, orderId, order.getStatus());
                }

                // Update payment transaction regardless (safety net)
                paymentTransactionRepository.findByOrderId(orderId)
                        .stream().findFirst().ifPresent(tx -> {
                            if (tx.getStatus() != PaymentStatus.PAID) {
                                tx.setStatus(PaymentStatus.PAID);
                                tx.setPaidAt(LocalDateTime.now());
                                paymentTransactionRepository.saveAndFlush(tx);
                                log.info("Payment tx {} marked as PAID via success callback", tx.getId());
                            }
                        });
            } else {
                log.error("SePay success callback: Order not found for code: {}", order_invoice_number);
            }
        }

        // Redirect to frontend using numeric order ID (API expects Long, not order code string)
        String redirectParam = orderId != null ? String.valueOf(orderId) : "";
        String frontendUrl = "http://localhost:3000/orders/" + redirectParam + "?payment=success";
        return ResponseEntity.ok(
                "<html><body><script>" +
                "window.location.href = '" + frontendUrl + "';" +
                "</script></body></html>"
        );
    }

    /**
     * Error callback - SePay redirects user here after failed payment.
     */
    @GetMapping("/error")
    public ResponseEntity<String> paymentError(@RequestParam(required = false) String order_invoice_number) {
        log.warn("SePay error callback for order: {}", order_invoice_number);
        String frontendUrl = "http://localhost:3000/checkout?payment=error&order=" + 
                (order_invoice_number != null ? order_invoice_number : "");
        return ResponseEntity.ok(
                "<html><body><script>" +
                "window.location.href = '" + frontendUrl + "';" +
                "</script></body></html>"
        );
    }

    /**
     * Cancel callback - SePay redirects user here when payment is cancelled.
     */
    @GetMapping("/cancel")
    public ResponseEntity<String> paymentCancel(@RequestParam(required = false) String order_invoice_number) {
        log.info("SePay cancel callback for order: {}", order_invoice_number);
        String frontendUrl = "http://localhost:3000/checkout?payment=cancel&order=" + 
                (order_invoice_number != null ? order_invoice_number : "");
        return ResponseEntity.ok(
                "<html><body><script>" +
                "window.location.href = '" + frontendUrl + "';" +
                "</script></body></html>"
        );
    }
}
