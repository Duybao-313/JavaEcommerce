package com.duybao.SplitGo.DTO.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.Data;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UpdateUserRequest {
    @NotBlank(message = "NAME_NOT_NULL")
    @Size(max = 30, message = "NAME_TOO_LONG")
    private String fullName;

    @Email(message = "EMAIL_INVALID")
    @NotBlank(message = "EMAIL_NOT_NULL")
    private String email;

    @Pattern(regexp = "^(0)([35789])\\d{8}$", message = "PHONE_INVALID")
    private String phone;

    @Size(max = 60, message = "ADDRESS_TOO_LONG")
    private String address;
}
