package com.duybao.SplitGo.Controller;

import com.duybao.SplitGo.DTO.Response.ApiResponse;
import com.duybao.SplitGo.DTO.Response.ecommerce.OrderResponse;
import com.duybao.SplitGo.DTO.request.ecommerce.CheckoutRequest;
import com.duybao.SplitGo.DTO.request.ecommerce.UpdateOrderStatusRequest;
import com.duybao.SplitGo.Enum.Role;
import com.duybao.SplitGo.Model.User;
import com.duybao.SplitGo.Service.OrderService;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;

    @PostMapping("/orders/checkout")
    @PreAuthorize("hasRole('USER')")
    public ApiResponse<OrderResponse> checkout(
            @AuthenticationPrincipal User user, @RequestBody @Valid CheckoutRequest request) {
        return ApiResponse.<OrderResponse>builder()
                .success(true)
                .code(201)
                .message("Đặt hàng thành công")
                .data(orderService.checkout(user.getId(), request))
                .timestamp(LocalDateTime.now())
                .build();
    }

    @GetMapping("/orders/my")
    @PreAuthorize("hasRole('USER')")
    public ApiResponse<List<OrderResponse>> getMyOrders(@AuthenticationPrincipal User user) {
        return ApiResponse.<List<OrderResponse>>builder()
                .success(true)
                .code(200)
                .message("Lấy danh sách đơn hàng thành công")
                .data(orderService.getMyOrders(user.getId()))
                .timestamp(LocalDateTime.now())
                .build();
    }

    @GetMapping("/seller/orders")
    @PreAuthorize("hasRole('SELLER')")
    public ApiResponse<List<OrderResponse>> getSellerOrders(@AuthenticationPrincipal User user) {
        return ApiResponse.<List<OrderResponse>>builder()
                .success(true)
                .code(200)
                .message("Lấy đơn hàng của người bán thành công")
                .data(orderService.getSellerOrders(user.getId()))
                .timestamp(LocalDateTime.now())
                .build();
    }

    @GetMapping("/orders")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<OrderResponse>> getAllOrdersForAdmin() {
        return ApiResponse.<List<OrderResponse>>builder()
                .success(true)
                .code(200)
                .message("Lấy tất cả đơn hàng thành công")
                .data(orderService.getAllOrders())
                .timestamp(LocalDateTime.now())
                .build();
    }

    @PatchMapping("/seller/orders/{orderId}/status")
    @PreAuthorize("hasRole('SELLER')")
    public ApiResponse<OrderResponse> updateOrderStatus(
            @AuthenticationPrincipal User user,
            @PathVariable Long orderId,
            @RequestBody @Valid UpdateOrderStatusRequest request) {
        return updateOrderStatusInternal(user, orderId, request);
    }

    @PatchMapping("/orders/{orderId}/status")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ApiResponse<OrderResponse> updateOrderStatusByRole(
            @AuthenticationPrincipal User user,
            @PathVariable Long orderId,
            @RequestBody @Valid UpdateOrderStatusRequest request) {
        return updateOrderStatusInternal(user, orderId, request);
    }

    private ApiResponse<OrderResponse> updateOrderStatusInternal(
            User user,
            Long orderId,
            UpdateOrderStatusRequest request) {
        boolean isAdmin = user.getRole() == Role.ROLE_ADMIN;
        return ApiResponse.<OrderResponse>builder()
                .success(true)
                .code(200)
                .message("Cập nhật trạng thái đơn hàng thành công")
                .data(orderService.updateOrderStatus(user.getId(), isAdmin, orderId, request.getStatus()))
                .timestamp(LocalDateTime.now())
                .build();
    }
}

