package com.duybao.SplitGo.DTO.request;

import jakarta.validation.constraints.NotBlank;

import lombok.Data;

@Data
public class UserLoginRequest {
    @NotBlank(message = "USERNAME_NOT_NULL")
    private String username;

    @NotBlank(message = "PASSWORD_NOT_NULL")
    private String password;
}
