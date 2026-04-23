package com.duybao.SplitGo.DTO.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import com.duybao.SplitGo.Validator.PassWordMin;
import com.duybao.SplitGo.Validator.UniqueUserName;

import lombok.Data;

@Data
public class UserRegisterRequest {
    @NotBlank(message = "USERNAME_NOT_NULL")
    @Size(min = 3, max = 30, message = "USERNAME_TOO_SHORT")
    @Pattern(regexp = "^[\\p{Alnum}_\\-\\s.]+$", message = "USERNAME_INVALID_CHARS")
    @UniqueUserName()
    private String username;

    @NotBlank(message = "NAME_NOT_NULL")
    private String fullName;

    @NotBlank(message = "PASSWORD_NOT_NULL")
    @PassWordMin(min = 6)
    private String password;

    @NotBlank(message = "EMAIL_NOT_NULL")
    @Email(message = "EMAIL_INVALID")
    private String email;
}
