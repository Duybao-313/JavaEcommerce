package com.duybao.SplitGo.DTO.request;

import com.duybao.SplitGo.Validator.PassWordMin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResetPasswordRequest {
    @NotBlank(message = "TOKEN_INVALID")
    private String token;

    @NotBlank(message = "PASSWORD_NOT_NULL")
    @PassWordMin(min = 6)
    @Size(max = 32, message = "PASSWORD_TOO_LONG")
    private String newPassword;

    @NotBlank(message = "PASSWORD_NOT_NULL")
    private String confirmPassword;
}
