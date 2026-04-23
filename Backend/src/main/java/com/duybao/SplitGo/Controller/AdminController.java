package com.duybao.SplitGo.Controller;

import com.duybao.SplitGo.DTO.Response.ApiResponse;
import com.duybao.SplitGo.DTO.Response.User.UserDTO;
import com.duybao.SplitGo.DTO.request.admin.AssignRoleRequest;
import com.duybao.SplitGo.Service.AdminService;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final AdminService adminService;

    @PatchMapping("/users/{userId}/role")
    public ApiResponse<UserDTO> assignUserRole(
            @PathVariable Long userId, @RequestBody @Valid AssignRoleRequest request) {
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
}

