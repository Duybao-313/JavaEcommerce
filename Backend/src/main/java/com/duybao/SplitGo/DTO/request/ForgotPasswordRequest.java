package com.duybao.SplitGo.DTO.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ForgotPasswordRequest {
    @NotBlank(message = "EMAIL_NOT_NULL")
    @Email(message = "EMAIL_INVALID")
    private String email;
}
