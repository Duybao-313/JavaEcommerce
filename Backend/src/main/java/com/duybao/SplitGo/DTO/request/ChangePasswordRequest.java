package com.duybao.SplitGo.DTO.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import com.duybao.SplitGo.Validator.PassWordMin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChangePasswordRequest {
    @NotBlank(message = "PASSWORD_NOT_NULL")
    private String oldPass;

    @NotBlank(message = "PASSWORD_NOT_NULL")
    @PassWordMin(min = 6)
    @Size(max = 32, message = "PASSWORD_TOO_LONG")
    private String newPass1;

    @NotBlank(message = "PASSWORD_NOT_NULL")
    private String newPass2;
}
