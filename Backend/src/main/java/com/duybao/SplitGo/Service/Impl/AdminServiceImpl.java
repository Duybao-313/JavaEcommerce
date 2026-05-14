package com.duybao.SplitGo.Service.Impl;

import com.duybao.SplitGo.DTO.Response.User.UserDTO;
import com.duybao.SplitGo.DTO.request.UpdateUserRequest;
import com.duybao.SplitGo.Enum.Role;
import com.duybao.SplitGo.Enum.SellerVerificationStatus;
import com.duybao.SplitGo.Enum.StoreStatus;
import com.duybao.SplitGo.Exception.AppException;
import com.duybao.SplitGo.Exception.ErrorCode;
import com.duybao.SplitGo.Mappers.UserMapper;
import com.duybao.SplitGo.Model.User;
import com.duybao.SplitGo.Repository.UserRepository;
import com.duybao.SplitGo.Service.AdminService;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminServiceImpl implements AdminService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public AdminServiceImpl(UserRepository userRepository, UserMapper userMapper) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
    }

    @Override
    @Transactional
    public UserDTO assignUserRole(Long userId, Role role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Protect: cannot downgrade another admin
        if (user.getRole() == Role.ROLE_ADMIN && role != Role.ROLE_ADMIN) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        Role oldRole = user.getRole();
        user.setRole(role);

        // When upgrading USER -> SELLER, initialize seller fields
        if (oldRole == Role.ROLE_USER && role == Role.ROLE_SELLER) {
            if (user.getStoreName() == null) {
                user.setStoreName(user.getUsername());
            }
            if (user.getSellerVerified() == null) {
                user.setSellerVerified(SellerVerificationStatus.PENDING);
            }
        }

        // When downgrading SELLER -> USER, suspend the store
        if (oldRole == Role.ROLE_SELLER && role == Role.ROLE_USER) {
            user.setStoreStatus(null);
        }

        user.setUpdatedAt(LocalDateTime.now());
        return userMapper.toDTO(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserDTO removeUserRole(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        user.setRole(Role.ROLE_USER);
        user.setStoreStatus(null);
        user.setUpdatedAt(LocalDateTime.now());
        return userMapper.toDTO(userRepository.save(user));
    }

    @Override
    public Page<UserDTO> getUsers(String keyword, Role role, Boolean isActive, Pageable pageable) {
        Page<User> userPage;
        if (keyword != null && !keyword.isBlank()) {
            String cleaned = keyword.trim();
            userPage = userRepository.findUsersWithFilters(cleaned, role, isActive, pageable);
        } else if (role != null || isActive != null) {
            userPage = userRepository.findUsersWithFilters(null, role, isActive, pageable);
        } else {
            userPage = userRepository.findAll(pageable);
        }
        return userPage.map(user -> {
            UserDTO dto = userMapper.toDTO(user);
            // Mask bank account in list view
            dto.maskSensitiveFields();
            return dto;
        });
    }

    @Override
    public UserDTO getUserDetail(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        // Admin sees everything - do NOT mask
        return userMapper.toDTO(user);
    }

    @Override
    @Transactional
    public UserDTO updateUser(Long userId, UpdateUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        userMapper.update(request, user);
        user.setUpdatedAt(LocalDateTime.now());
        return userMapper.toDTO(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserDTO verifySeller(Long userId, SellerVerificationStatus status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (user.getRole() != Role.ROLE_SELLER) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        user.setSellerVerified(status);
        user.setUpdatedAt(LocalDateTime.now());
        return userMapper.toDTO(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserDTO updateStoreStatus(Long userId, StoreStatus status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (user.getRole() != Role.ROLE_SELLER) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        user.setStoreStatus(status);
        user.setUpdatedAt(LocalDateTime.now());
        return userMapper.toDTO(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserDTO toggleUserActive(Long userId, Boolean isActive) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        user.setIsActive(isActive);
        user.setUpdatedAt(LocalDateTime.now());
        return userMapper.toDTO(userRepository.save(user));
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Protect admin accounts from deletion
        if (user.getRole() == Role.ROLE_ADMIN) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        userRepository.delete(user);
    }
}

