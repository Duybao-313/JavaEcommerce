package com.duybao.SplitGo.Controller;

import com.duybao.SplitGo.DTO.Response.ApiResponse;
import com.duybao.SplitGo.DTO.Response.ecommerce.AddressResponse;
import com.duybao.SplitGo.DTO.request.ecommerce.CreateAddressRequest;
import com.duybao.SplitGo.DTO.request.ecommerce.UpdateAddressRequest;
import com.duybao.SplitGo.Model.User;
import com.duybao.SplitGo.Service.AddressService;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/addresses")
public class AddressController {
    private final AddressService addressService;

    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ApiResponse<List<AddressResponse>> getAddresses(@AuthenticationPrincipal User user) {
        return ApiResponse.<List<AddressResponse>>builder()
                .success(true)
                .code(200)
                .message("Lấy danh sách địa chỉ thành công")
                .data(addressService.getAddresses(user.getId()))
                .timestamp(LocalDateTime.now())
                .build();
    }

    @GetMapping("/default")
    @PreAuthorize("hasRole('USER')")
    public ApiResponse<AddressResponse> getDefaultAddress(@AuthenticationPrincipal User user) {
        return ApiResponse.<AddressResponse>builder()
                .success(true)
                .code(200)
                .message("Lấy địa chỉ mặc định thành công")
                .data(addressService.getDefaultAddress(user.getId()))
                .timestamp(LocalDateTime.now())
                .build();
    }

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ApiResponse<AddressResponse> createAddress(
            @AuthenticationPrincipal User user,
            @RequestBody @Valid CreateAddressRequest request) {
        return ApiResponse.<AddressResponse>builder()
                .success(true)
                .code(201)
                .message("Tạo địa chỉ thành công")
                .data(addressService.createAddress(user.getId(), request))
                .timestamp(LocalDateTime.now())
                .build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ApiResponse<AddressResponse> updateAddress(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @RequestBody UpdateAddressRequest request) {
        return ApiResponse.<AddressResponse>builder()
                .success(true)
                .code(200)
                .message("Cập nhật địa chỉ thành công")
                .data(addressService.updateAddress(user.getId(), id, request))
                .timestamp(LocalDateTime.now())
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ApiResponse<Void> deleteAddress(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        addressService.deleteAddress(user.getId(), id);
        return ApiResponse.<Void>builder()
                .success(true)
                .code(200)
                .message("Xóa địa chỉ thành công")
                .timestamp(LocalDateTime.now())
                .build();
    }

    @PutMapping("/{id}/default")
    @PreAuthorize("hasRole('USER')")
    public ApiResponse<AddressResponse> setDefaultAddress(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        return ApiResponse.<AddressResponse>builder()
                .success(true)
                .code(200)
                .message("Đặt địa chỉ mặc định thành công")
                .data(addressService.setDefaultAddress(user.getId(), id))
                .timestamp(LocalDateTime.now())
                .build();
    }
}
