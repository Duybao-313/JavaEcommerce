package com.duybao.SplitGo.Service.Impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.duybao.SplitGo.Config.SecurityConfigV2;
import com.duybao.SplitGo.DTO.Response.User.UserDTO;
import com.duybao.SplitGo.DTO.request.UpdateUserRequest;
import com.duybao.SplitGo.Exception.AppException;
import com.duybao.SplitGo.Exception.ErrorCode;
import com.duybao.SplitGo.Mappers.UserMapper;
import com.duybao.SplitGo.Model.User;
import com.duybao.SplitGo.Repository.UserRepository;
import com.duybao.SplitGo.Service.FileUploadService;
import com.duybao.SplitGo.Service.UserService;

import lombok.RequiredArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@RequiredArgsConstructor
@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    private final UserMapper userMapper;
    private final SecurityConfigV2 securityConfig;
    private final FileUploadService fileUploadService;

    @PreAuthorize("hasRole('ADMIN')")
    @Override
    public List<UserDTO> getAllUser() {
        return userMapper.toDTOs(userRepository.findAll());
    }

    @Override
    public UserDTO getUser(Long id) {
        var context = SecurityContextHolder.getContext().getAuthentication().getName();
        User user =
                userRepository.findByUsername(context).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        UserDTO userDTO = userMapper.toDTO(user);
        userDTO.setRole(user.getRole());
        return userDTO;
    }

    @Override
    public UserDTO updateUser(Long id, UpdateUserRequest userRequest) {
        User userStore = userRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        if (userRequest.getEmail() != null) {
            var existingUserByEmail = userRepository.findByEmail(userRequest.getEmail());
            if (existingUserByEmail.isPresent() && !existingUserByEmail.get().getId().equals(userStore.getId())) {
                throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
            }
        }
        userMapper.update(userRequest, userStore);
        userStore.setUpdatedAt(LocalDateTime.now());
        userRepository.save(userStore);
        return userMapper.toDTO(userStore);
    }

    @Override
    public UserDTO updateAvatar(Long id, MultipartFile file) {
        User userStore = userRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        String avatarUrl = fileUploadService.uploadUserAvatar(file);
        userStore.setAvatarUrl(avatarUrl);
        userStore.setUpdatedAt(LocalDateTime.now());
        userRepository.save(userStore);
        return userMapper.toDTO(userStore);
    }
}
