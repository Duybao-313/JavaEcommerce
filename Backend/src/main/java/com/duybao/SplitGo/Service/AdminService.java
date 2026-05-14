package com.duybao.SplitGo.Service;

import com.duybao.SplitGo.DTO.Response.User.UserDTO;
import com.duybao.SplitGo.DTO.request.UpdateUserRequest;
import com.duybao.SplitGo.Enum.Role;
import com.duybao.SplitGo.Enum.SellerVerificationStatus;
import com.duybao.SplitGo.Enum.StoreStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminService {
    // Role management
    UserDTO assignUserRole(Long userId, Role role);

    UserDTO removeUserRole(Long userId);

    // User listing & detail
    Page<UserDTO> getUsers(String keyword, Role role, Boolean isActive, Pageable pageable);

    UserDTO getUserDetail(Long userId);

    // User update
    UserDTO updateUser(Long userId, UpdateUserRequest request);

    // Seller management
    UserDTO verifySeller(Long userId, SellerVerificationStatus status);

    UserDTO updateStoreStatus(Long userId, StoreStatus status);

    // Account status
    UserDTO toggleUserActive(Long userId, Boolean isActive);

    // Delete
    void deleteUser(Long userId);
}

