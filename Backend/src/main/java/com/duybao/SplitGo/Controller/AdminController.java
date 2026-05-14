package com.duybao.SplitGo.Controller;

import com.duybao.SplitGo.DTO.Response.ApiResponse;
import com.duybao.SplitGo.DTO.Response.User.UserDTO;
import com.duybao.SplitGo.DTO.request.UpdateUserRequest;
import com.duybao.SplitGo.DTO.request.admin.AssignRoleRequest;
import com.duybao.SplitGo.DTO.request.admin.StoreStatusRequest;
import com.duybao.SplitGo.DTO.request.admin.ToggleActiveRequest;
import com.duybao.SplitGo.DTO.request.admin.VerifySellerRequest;
import com.duybao.SplitGo.Enum.Role;
import com.duybao.SplitGo.Service.AdminService;
import jakarta.validation.Valid;

import java.time.LocalDateTime;
import java.util.Map;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final AdminService adminService;

    // ==================== User Listing ====================

    @GetMapping("/users")
    public ApiResponse<Map<String, Object>> getUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page - 1, size, sort);

        Page<UserDTO> userPage = adminService.getUsers(search, role, isActive, pageable);

        Map<String, Object> result = Map.of(
                "content", userPage.getContent(),
                "totalElements", userPage.getTotalElements(),
                "totalPages", userPage.getTotalPages(),
                "currentPage", userPage.getNumber() + 1,
                "pageSize", userPage.getSize());

        return ApiResponse.<Map<String, Object>>builder()
                .success(true)
                .code(200)
                .message("Lấy danh sách người dùng thành công")
                .data(result)
                .timestamp(LocalDateTime.now())
                .build();
    }

    // ==================== User Detail ====================

    @GetMapping("/users/{userId}")
    public ApiResponse<UserDTO> getUserDetail(@PathVariable Long userId) {
        return ApiResponse.<UserDTO>builder()
                .success(true)
                .code(200)
                .message("Lấy thông tin người dùng thành công")
                .data(adminService.getUserDetail(userId))
                .timestamp(LocalDateTime.now())
                .build();
    }

    // ==================== User Update ====================

    @PatchMapping("/users/{userId}")
    public ApiResponse<UserDTO> updateUser(
            @PathVariable Long userId,
            @RequestBody @Valid UpdateUserRequest request) {
        return ApiResponse.<UserDTO>builder()
                .success(true)
                .code(200)
                .message("Cập nhật người dùng thành công")
                .data(adminService.updateUser(userId, request))
                .timestamp(LocalDateTime.now())
                .build();
    }

    // ==================== Role Management ====================

    @PatchMapping("/users/{userId}/role")
    public ApiResponse<UserDTO> assignUserRole(
            @PathVariable Long userId,
            @RequestBody @Valid AssignRoleRequest request) {
        return ApiResponse.<UserDTO>builder()
                .success(true)
                .code(200)
                .message("Gán vai trò người dùng thành công")
                .data(adminService.assignUserRole(userId, request.getRole()))
                .timestamp(LocalDateTime.now())
                .build();
    }

    @PatchMapping("/users/{userId}/role/remove")
    public ApiResponse<UserDTO> removeUserRole(@PathVariable Long userId) {
        return ApiResponse.<UserDTO>builder()
                .success(true)
                .code(200)
                .message("Loại bỏ vai trò người dùng thành công")
                .data(adminService.removeUserRole(userId))
                .timestamp(LocalDateTime.now())
                .build();
    }

    // ==================== Seller Management ====================

    @PatchMapping("/users/{userId}/seller/verify")
    public ApiResponse<UserDTO> verifySeller(
            @PathVariable Long userId,
            @RequestBody @Valid VerifySellerRequest request) {
        return ApiResponse.<UserDTO>builder()
                .success(true)
                .code(200)
                .message("Cập nhật trạng thái xác thực người bán thành công")
                .data(adminService.verifySeller(userId, request.getStatus()))
                .timestamp(LocalDateTime.now())
                .build();
    }

    @PatchMapping("/users/{userId}/store/status")
    public ApiResponse<UserDTO> updateStoreStatus(
            @PathVariable Long userId,
            @RequestBody @Valid StoreStatusRequest request) {
        return ApiResponse.<UserDTO>builder()
                .success(true)
                .code(200)
                .message("Cập nhật trạng thái cửa hàng thành công")
                .data(adminService.updateStoreStatus(userId, request.getStatus()))
                .timestamp(LocalDateTime.now())
                .build();
    }

    // ==================== Account Status ====================

    @PatchMapping("/users/{userId}/active")
    public ApiResponse<UserDTO> toggleUserActive(
            @PathVariable Long userId,
            @RequestBody @Valid ToggleActiveRequest request) {
        return ApiResponse.<UserDTO>builder()
                .success(true)
                .code(200)
                .message("Cập nhật trạng thái kích hoạt thành công")
                .data(adminService.toggleUserActive(userId, request.getIsActive()))
                .timestamp(LocalDateTime.now())
                .build();
    }

    // ==================== Delete User ====================

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long userId) {
        adminService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }
}

