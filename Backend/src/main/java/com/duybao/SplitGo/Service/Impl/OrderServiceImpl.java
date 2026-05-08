package com.duybao.SplitGo.Service.Impl;

import com.duybao.SplitGo.DTO.Response.ecommerce.OrderItemResponse;
import com.duybao.SplitGo.DTO.Response.ecommerce.OrderResponse;
import com.duybao.SplitGo.DTO.request.ecommerce.CheckoutRequest;
import com.duybao.SplitGo.Enum.OrderStatus;
import com.duybao.SplitGo.Enum.PaymentMethod;
import com.duybao.SplitGo.Enum.PaymentStatus;
import com.duybao.SplitGo.Enum.ProductStatus;
import com.duybao.SplitGo.Enum.ShippingStatus;
import com.duybao.SplitGo.Exception.AppException;
import com.duybao.SplitGo.Exception.ErrorCode;
import com.duybao.SplitGo.Model.Cart;
import com.duybao.SplitGo.Model.CartItem;
import com.duybao.SplitGo.Model.Order;
import com.duybao.SplitGo.Model.OrderItem;
import com.duybao.SplitGo.Model.PaymentTransaction;
import com.duybao.SplitGo.Model.Product;
import com.duybao.SplitGo.Model.User;
import com.duybao.SplitGo.Repository.CartItemRepository;
import com.duybao.SplitGo.Repository.CartRepository;
import com.duybao.SplitGo.Repository.OrderItemRepository;
import com.duybao.SplitGo.Repository.OrderRepository;
import com.duybao.SplitGo.Repository.PaymentTransactionRepository;
import com.duybao.SplitGo.Repository.ProductRepository;
import com.duybao.SplitGo.Repository.ShippingRepository;
import com.duybao.SplitGo.Repository.UserRepository;
import com.duybao.SplitGo.Service.OrderService;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class OrderServiceImpl implements OrderService {
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ShippingRepository shippingRepository;

    public OrderServiceImpl(
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            PaymentTransactionRepository paymentTransactionRepository,
            ProductRepository productRepository,
            UserRepository userRepository,
            ShippingRepository shippingRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.paymentTransactionRepository = paymentTransactionRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.shippingRepository = shippingRepository;
    }

    @Override
    @Transactional
    public OrderResponse checkout(Long buyerId, CheckoutRequest request) {
        User buyer = userRepository.findById(buyerId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        Cart cart = cartRepository.findByUserId(buyerId).orElseThrow(() -> new AppException(ErrorCode.CART_EMPTY));

        if (cart.getItems().isEmpty()) {
            throw new AppException(ErrorCode.CART_EMPTY);
        }
        BigDecimal discount = request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO;
        Order order = Order.builder()
                .buyer(buyer)
                .status(OrderStatus.PENDING)
                .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : PaymentMethod.COD)
                .shippingAddress(request.getShippingAddress())
                .shippingFee(request.getShippingFee() != null ? request.getShippingFee() : BigDecimal.ZERO)
                .discountAmount(discount)
                .phone(request.getPhoneNumber())
                .recipientName(request.getRecipientName())
                .orderCode("ORD-" + System.currentTimeMillis())
                .note(request.getNote())
                .totalAmount(BigDecimal.ZERO)
                .build();

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (CartItem cartItem : cart.getItems()) {
            Product product = productRepository
                    .findById(cartItem.getProduct().getId())
                    .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

            if (product.getStatus() != ProductStatus.ACTIVE) {
                throw new AppException(ErrorCode.PRODUCT_NOT_AVAILABLE);
            }
            if (product.getStock() < cartItem.getQuantity()) {
                throw new AppException(ErrorCode.PRODUCT_OUT_OF_STOCK);
            }

            BigDecimal unitPrice = product.getPrice();
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity()));

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .seller(product.getSeller())
                    .productName(product.getName())
                    .unitPrice(unitPrice)
                    .quantity(cartItem.getQuantity())
                    .lineTotal(lineTotal)
                    .build();

            orderItems.add(orderItem);
            totalAmount = totalAmount.add(lineTotal);

            product.setStock(product.getStock() - cartItem.getQuantity());
            long currentSold = product.getSoldCount() == null ? 0L : product.getSoldCount();
            product.setSoldCount(currentSold + cartItem.getQuantity());
            productRepository.save(product);
        }

        order.setItems(orderItems);
        order.setTotalAmount(totalAmount);

        Order savedOrder = orderRepository.save(order);

        paymentTransactionRepository.save(PaymentTransaction.builder()
                .order(savedOrder)
                .method(PaymentMethod.COD)
                .status(PaymentStatus.PENDING)
                .amount(totalAmount)
                .build());

        // Clear cart items via orphanRemoval (Cart has @OneToMany cascade=ALL, orphanRemoval=true)
        // This is safer than derived deleteAllByCartId which may bypass persistence context
        cart.getItems().clear();
        return toOrderResponse(savedOrder);
    }

    @Override
    @Transactional
    public List<OrderResponse> getMyOrders(Long buyerId) {
        return orderRepository.findByBuyerIdOrderByCreatedAtDesc(buyerId).stream()
                .map(this::toOrderResponse)
                .toList();
    }

    @Override
    @Transactional
    public OrderResponse getOrderById(Long buyerId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (!order.getBuyer().getId().equals(buyerId)) {
            throw new AppException(ErrorCode.FORBIDDEN_RESOURCE);
        }

        return toOrderResponse(order);
    }

    @Override
    @Transactional
    public List<OrderResponse> getSellerOrders(Long sellerId) {
        return orderRepository.findOrdersBySellerId(sellerId).stream()
                .map(this::toOrderResponse)
                .toList();
    }

    @Override
    @Transactional
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toOrderResponse)
                .toList();
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(Long actorId, boolean isAdmin, Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (!isAdmin && !orderItemRepository.existsByOrderIdAndSellerId(orderId, actorId)) {
            throw new AppException(ErrorCode.FORBIDDEN_RESOURCE);
        }

        // Seller không được phép tự đánh dấu DELIVERED — chỉ buyer mới có quyền xác nhận đã nhận
        if (!isAdmin && status == OrderStatus.DELIVERED) {
            throw new AppException(ErrorCode.FORBIDDEN_RESOURCE);
        }

        validateStatusTransition(order.getStatus(), status);
        order.setStatus(status);

        Order saved = orderRepository.save(order);
        syncShippingStatus(saved.getId(), status);
        return toOrderResponse(saved);
    }

    @Override
    @Transactional
    public OrderResponse cancelOrder(Long buyerId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (!order.getBuyer().getId().equals(buyerId)) {
            throw new AppException(ErrorCode.FORBIDDEN_RESOURCE);
        }

        if (order.getStatus() == OrderStatus.DELIVERED || order.getStatus() == OrderStatus.CANCELLED) {
            throw new AppException(ErrorCode.INVALID_ORDER_STATUS_TRANSITION);
        }

        // Buyer chỉ được hủy đơn ở trạng thái PENDING hoặc CONFIRMED
        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.CONFIRMED) {
            throw new AppException(ErrorCode.INVALID_ORDER_STATUS_TRANSITION);
        }

        order.setStatus(OrderStatus.CANCELLED);
        Order saved = orderRepository.save(order);
        return toOrderResponse(saved);
    }

    @Override
    @Transactional
    public OrderResponse confirmDelivery(Long buyerId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (!order.getBuyer().getId().equals(buyerId)) {
            throw new AppException(ErrorCode.FORBIDDEN_RESOURCE);
        }

        if (order.getStatus() != OrderStatus.SHIPPING) {
            throw new AppException(ErrorCode.INVALID_ORDER_STATUS_TRANSITION);
        }

        order.setStatus(OrderStatus.DELIVERED);
        order.setDeliveredAt(java.time.LocalDateTime.now());
        Order saved = orderRepository.save(order);
        syncShippingStatus(saved.getId(), OrderStatus.DELIVERED);
        return toOrderResponse(saved);
    }

    @Override
    @Transactional
    public OrderResponse cancelOrderBySeller(Long sellerId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        // Seller phải có ít nhất 1 item trong đơn này
        if (!orderItemRepository.existsByOrderIdAndSellerId(orderId, sellerId)) {
            throw new AppException(ErrorCode.FORBIDDEN_RESOURCE);
        }

        if (order.getStatus() == OrderStatus.DELIVERED || order.getStatus() == OrderStatus.CANCELLED) {
            throw new AppException(ErrorCode.INVALID_ORDER_STATUS_TRANSITION);
        }

        order.setStatus(OrderStatus.CANCELLED);
        Order saved = orderRepository.save(order);
        return toOrderResponse(saved);
    }

    private void syncShippingStatus(Long orderId, OrderStatus status) {
        shippingRepository.findByOrderId(orderId).ifPresent(shipping -> {
            if (status == OrderStatus.DELIVERED) {
                shipping.setStatus(ShippingStatus.DELIVERED);
                shipping.setActualDelivery(java.time.LocalDateTime.now());
                shippingRepository.save(shipping);
            }
        });
    }

    private void validateStatusTransition(OrderStatus currentStatus, OrderStatus targetStatus) {
        if (currentStatus == targetStatus) {
            return;
        }
        if (currentStatus == OrderStatus.DELIVERED || currentStatus == OrderStatus.CANCELLED) {
            throw new AppException(ErrorCode.INVALID_ORDER_STATUS_TRANSITION);
        }
        if (targetStatus == OrderStatus.PENDING) {
            throw new AppException(ErrorCode.INVALID_ORDER_STATUS_TRANSITION);
        }
        if (targetStatus == OrderStatus.CANCELLED) {
            return;
        }
        if (targetStatus.ordinal() < currentStatus.ordinal()) {
            throw new AppException(ErrorCode.INVALID_ORDER_STATUS_TRANSITION);
        }
    }

    private OrderResponse toOrderResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(item -> OrderItemResponse.builder()
                        .orderItemId(item.getId())
                        .productId(item.getProduct().getId())
                        .productName(item.getProductName())
                        .productImageUrl(item.getProduct().getImageUrl())
                        .sellerId(item.getSeller().getId())
                        .sellerUsername(item.getSeller().getUsername())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .lineTotal(item.getLineTotal())
                        .build())
                .toList();

        BigDecimal finalAmount = order.getFinalAmount();
        if (finalAmount == null && order.getTotalAmount() != null) {
            finalAmount = order.getTotalAmount()
                    .subtract(order.getDiscountAmount() != null ? order.getDiscountAmount() : BigDecimal.ZERO)
                    .add(order.getShippingFee() != null ? order.getShippingFee() : BigDecimal.ZERO);
        }

        return OrderResponse.builder()
                .orderId(order.getId())
                .orderCode(order.getOrderCode())
                .buyerId(order.getBuyer().getId())
                .buyerUsername(order.getBuyer().getUsername())
                .status(order.getStatus())
                .paymentMethod(order.getPaymentMethod())
                .shippingAddress(order.getShippingAddress())
                .phone(order.getPhone())
                .recipientName(order.getRecipientName())
                .totalAmount(order.getTotalAmount())
                .discountAmount(order.getDiscountAmount())
                .shippingFee(order.getShippingFee())
                .finalAmount(finalAmount)
                .note(order.getNote())
                .items(itemResponses)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .shippedAt(order.getShippedAt())
                .deliveredAt(order.getDeliveredAt())
                .build();
    }
}


