package com.duybao.SplitGo.Service;

import java.util.List;

import com.duybao.SplitGo.DTO.Response.User.UserDTO;
import com.duybao.SplitGo.DTO.request.UpdateUserRequest;
import org.springframework.web.multipart.MultipartFile;

public interface UserService {
    public List<UserDTO> getAllUser();

    public UserDTO getUser(Long id);

    public UserDTO getUserById(Long id);

    public UserDTO updateUser(Long id, UpdateUserRequest userRequest);

    public UserDTO updateAvatar(Long id, MultipartFile file);

    public UserDTO updateStoreLogo(Long id, MultipartFile file);

    public UserDTO updateStoreBanner(Long id, MultipartFile file);
}
