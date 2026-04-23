package com.duybao.SplitGo.DTO.Response;

import com.duybao.SplitGo.DTO.Response.User.UserDTO;
import com.duybao.SplitGo.Enum.Role;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    String jwt;
    Role role;
    UserDTO a;
}
