package com.duybao.SplitGo.Controller;

import com.duybao.SplitGo.DTO.Response.ApiResponse;
import com.duybao.SplitGo.DTO.Response.ecommerce.WishlistResponse;
import com.duybao.SplitGo.DTO.request.ecommerce.CreateWishlistRequest;
import com.duybao.SplitGo.Model.User;
import com.duybao.SplitGo.Service.WishlistService;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/wishlist")
@PreAuthorize("hasRole('USER')")
public class WishlistController {
    private final WishlistService wishlistService;

    @PostMapping
    public ApiResponse<WishlistResponse> addToWishlist(
            @AuthenticationPrincipal User user,
            @RequestBody @Valid CreateWishlistRequest request) {
        return ApiResponse.<WishlistResponse>builder()
                .success(true)
                .code(201)
                .message("Thêm vào danh sách yêu thích thành công")
                .data(wishlistService.addToWishlist(user.getId(), request))
                .timestamp(LocalDateTime.now())
                .build();
    }

    @DeleteMapping("/{productId}")
    public ApiResponse<WishlistResponse> removeFromWishlist(
            @AuthenticationPrincipal User user,
            @PathVariable Long productId) {
        return ApiResponse.<WishlistResponse>builder()
                .success(true)
                .code(200)
                .message("Xóa khỏi danh sách yêu thích thành công")
                .data(wishlistService.removeFromWishlist(user.getId(), productId))
                .timestamp(LocalDateTime.now())
                .build();
    }

    @GetMapping
    public ApiResponse<List<WishlistResponse>> getMyWishlist(@AuthenticationPrincipal User user) {
        return ApiResponse.<List<WishlistResponse>>builder()
                .success(true)
                .code(200)
                .message("Lấy danh sách yêu thích thành công")
                .data(wishlistService.getUserWishlist(user.getId()))
                .timestamp(LocalDateTime.now())
                .build();
    }

    @GetMapping("/check/{productId}")
    public ApiResponse<Boolean> isInWishlist(
            @AuthenticationPrincipal User user,
            @PathVariable Long productId) {
        return ApiResponse.<Boolean>builder()
                .success(true)
                .code(200)
                .message("Kiểm tra thành công")
                .data(wishlistService.isProductInWishlist(user.getId(), productId))
                .timestamp(LocalDateTime.now())
                .build();
    }
}


