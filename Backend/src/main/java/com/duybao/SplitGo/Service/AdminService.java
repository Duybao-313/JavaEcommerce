package com.duybao.SplitGo.Service;

import com.duybao.SplitGo.DTO.Response.User.UserDTO;
import com.duybao.SplitGo.Enum.Role;

public interface AdminService {
    UserDTO assignUserRole(Long userId, Role role);

    UserDTO removeUserRole(Long userId);
}

