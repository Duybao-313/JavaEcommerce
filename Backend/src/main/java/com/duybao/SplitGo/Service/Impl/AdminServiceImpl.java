package com.duybao.SplitGo.Service.Impl;

import com.duybao.SplitGo.DTO.Response.User.UserDTO;
import com.duybao.SplitGo.Enum.Role;
import com.duybao.SplitGo.Exception.AppException;
import com.duybao.SplitGo.Exception.ErrorCode;
import com.duybao.SplitGo.Mappers.UserMapper;
import com.duybao.SplitGo.Model.User;
import com.duybao.SplitGo.Repository.UserRepository;
import com.duybao.SplitGo.Service.AdminService;
import org.springframework.stereotype.Service;

@Service
public class AdminServiceImpl implements AdminService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public AdminServiceImpl(UserRepository userRepository, UserMapper userMapper) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
    }

    @Override
    public UserDTO assignUserRole(Long userId, Role role) {
        User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        user.setRole(role);
        return userMapper.toDTO(userRepository.save(user));
    }

    @Override
    public UserDTO removeUserRole(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        user.setRole(Role.ROLE_USER);
        return userMapper.toDTO(userRepository.save(user));
    }
}

