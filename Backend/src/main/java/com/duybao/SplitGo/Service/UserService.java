package com.duybao.SplitGo.Service;

import java.util.List;

import com.duybao.SplitGo.DTO.Response.User.UserDTO;
import com.duybao.SplitGo.DTO.request.UpdateUserRequest;

public interface UserService {
    public List<UserDTO> getAllUser();

    public UserDTO getUser(Long id);

    public UserDTO updateUser(Long id, UpdateUserRequest userRequest);
    //    public void setAvatar(MultipartFile file,Long id);
}
