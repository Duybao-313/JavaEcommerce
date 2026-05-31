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
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/addresses")
@PreAuthorize("hasRole('USER')")
public class AddressController {
    private final AddressService addressService;

    @GetMapping
    public ApiResponse<List<AddressResponse>> getMyAddresses(@AuthenticationPrincipal User user) {
        return ApiResponse.<List<AddressResponse>>builder()
                .success(true)
                .code(200)
                .message("Lấy danh sách địa chỉ thành công")
                .data(addressService.getMyAddresses(user.getId()))
                .timestamp(LocalDateTime.now())
                .build();
    }

    @PostMapping
    public ApiResponse<AddressResponse> createAddress(
            @AuthenticationPrincipal User user,
            @RequestBody @Valid CreateAddressRequest request) {
        return ApiResponse.<AddressResponse>builder()
                .success(true)
                .code(201)
                .message("Thêm địa chỉ thành công")
                .data(addressService.createAddress(user.getId(), request))
                .timestamp(LocalDateTime.now())
                .build();
    }

    @PutMapping("/{id}")
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
    public ApiResponse<Void> deleteAddress(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        addressService.deleteAddress(user.getId(), id);
        return ApiResponse.<Void>builder()
                .success(true)
                .code(200)
                .message("Xóa địa chỉ thành công")
                .data(null)
                .timestamp(LocalDateTime.now())
                .build();
    }

    @PatchMapping("/{id}/default")
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
