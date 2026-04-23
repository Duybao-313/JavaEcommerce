package com.duybao.SplitGo.Controller;

import com.duybao.SplitGo.DTO.Response.ApiResponse;
import com.duybao.SplitGo.DTO.Response.ecommerce.CartResponse;
import com.duybao.SplitGo.DTO.request.ecommerce.AddCartItemRequest;
import com.duybao.SplitGo.DTO.request.ecommerce.UpdateCartItemRequest;
import com.duybao.SplitGo.Model.User;
import com.duybao.SplitGo.Service.CartService;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/cart")
@PreAuthorize("hasRole('USER')")
public class CartController {
    private final CartService cartService;

    @GetMapping
    public ApiResponse<CartResponse> getCart(@AuthenticationPrincipal User user) {
        return ApiResponse.<CartResponse>builder()
                .success(true)
                .code(200)
                .message("Lấy giỏ hàng thành công")
                .data(cartService.getMyCart(user.getId()))
                .timestamp(LocalDateTime.now())
                .build();
    }

    @PostMapping("/items")
    public ApiResponse<CartResponse> addItem(
            @AuthenticationPrincipal User user, @RequestBody @Valid AddCartItemRequest request) {
        return ApiResponse.<CartResponse>builder()
                .success(true)
                .code(200)
                .message("Thêm sản phẩm vào giỏ thành công")
                .data(cartService.addItem(user.getId(), request))
                .timestamp(LocalDateTime.now())
                .build();
    }

    @PutMapping("/items/{cartItemId}")
    public ApiResponse<CartResponse> updateItem(
            @AuthenticationPrincipal User user,
            @PathVariable Long cartItemId,
            @RequestBody @Valid UpdateCartItemRequest request) {
        return ApiResponse.<CartResponse>builder()
                .success(true)
                .code(200)
                .message("Cập nhật giỏ hàng thành công")
                .data(cartService.updateItem(user.getId(), cartItemId, request))
                .timestamp(LocalDateTime.now())
                .build();
    }

    @DeleteMapping("/items/{cartItemId}")
    public ApiResponse<CartResponse> removeItem(@AuthenticationPrincipal User user, @PathVariable Long cartItemId) {
        return ApiResponse.<CartResponse>builder()
                .success(true)
                .code(200)
                .message("Xóa sản phẩm khỏi giỏ thành công")
                .data(cartService.removeItem(user.getId(), cartItemId))
                .timestamp(LocalDateTime.now())
                .build();
    }
}

