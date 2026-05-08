package com.duybao.SplitGo.Controller;

import com.duybao.SplitGo.DTO.Response.ApiResponse;
import com.duybao.SplitGo.DTO.Response.ecommerce.ShippingResponse;
import com.duybao.SplitGo.DTO.request.ecommerce.CreateShippingRequest;
import com.duybao.SplitGo.DTO.request.ecommerce.UpdateShippingRequest;
import com.duybao.SplitGo.Service.ShippingService;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/shippings")
public class ShippingController {
    private final ShippingService shippingService;

    @GetMapping
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ApiResponse<java.util.List<ShippingResponse>> getAllShippings() {
        return ApiResponse.<java.util.List<ShippingResponse>>builder()
                .success(true)
                .code(200)
                .message("Lấy danh sách vận chuyển thành công")
                .data(shippingService.getAllShippings())
                .timestamp(LocalDateTime.now())
                .build();
    }

    @PostMapping
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ApiResponse<ShippingResponse> createShipping(
            @RequestBody @Valid CreateShippingRequest request) {
        return ApiResponse.<ShippingResponse>builder()
                .success(true)
                .code(201)
                .message("Tạo thông tin vận chuyển thành công")
                .data(shippingService.createShipping(request))
                .timestamp(LocalDateTime.now())
                .build();
    }

    @PutMapping("/{shippingId}")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ApiResponse<ShippingResponse> updateShipping(
            @PathVariable Long shippingId,
            @RequestBody @Valid UpdateShippingRequest request) {
        return ApiResponse.<ShippingResponse>builder()
                .success(true)
                .code(200)
                .message("Cập nhật thông tin vận chuyển thành công")
                .data(shippingService.updateShipping(shippingId, request))
                .timestamp(LocalDateTime.now())
                .build();
    }

    @GetMapping("/order/{orderId}")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ApiResponse<ShippingResponse> getShippingByOrderId(@PathVariable Long orderId) {
        return ApiResponse.<ShippingResponse>builder()
                .success(true)
                .code(200)
                .message("Lấy thông tin vận chuyển thành công")
                .data(shippingService.getShippingByOrderId(orderId))
                .timestamp(LocalDateTime.now())
                .build();
    }

    @GetMapping("/track")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ApiResponse<ShippingResponse> trackShipping(@RequestParam String trackingCode) {
        return ApiResponse.<ShippingResponse>builder()
                .success(true)
                .code(200)
                .message("Lấy thông tin vận chuyển thành công")
                .data(shippingService.getShippingByTrackingCode(trackingCode))
                .timestamp(LocalDateTime.now())
                .build();
    }

    @PostMapping("/{shippingId}/mark-delivered")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ApiResponse<String> markAsDelivered(@PathVariable Long shippingId) {
        shippingService.markAsDelivered(shippingId);
        return ApiResponse.<String>builder()
                .success(true)
                .code(200)
                .message("Đánh dấu đã giao hàng thành công")
                .timestamp(LocalDateTime.now())
                .build();
    }

    @PostMapping("/{shippingId}/mark-in-transit")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ApiResponse<String> markAsInTransit(@PathVariable Long shippingId) {
        shippingService.markAsInTransit(shippingId);
        return ApiResponse.<String>builder()
                .success(true)
                .code(200)
                .message("Đánh dấu đang vận chuyển thành công")
                .timestamp(LocalDateTime.now())
                .build();
    }
}


