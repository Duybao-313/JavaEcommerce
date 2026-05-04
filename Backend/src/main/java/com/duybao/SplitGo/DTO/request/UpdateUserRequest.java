package com.duybao.SplitGo.DTO.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import lombok.Data;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UpdateUserRequest {
    @Size(max = 30, message = "NAME_TOO_LONG")
    private String fullName;

    @Email(message = "EMAIL_INVALID")
    private String email;

    @Pattern(regexp = "^(0)([35789])\\d{8}$", message = "PHONE_INVALID")
    private String phone;

    @Size(max = 60, message = "ADDRESS_TOO_LONG")
    private String address;

    private String avatarUrl;

    @Size(max = 255)
    private String storeName;

    @Size(max = 500)
    private String storeLogo;

    @Size(max = 500)
    private String storeBanner;

    @Size(max = 255)
    private String businessLicense;

    @Size(max = 255)
    private String taxCode;

    @Size(max = 500)
    private String storeAddress;

    @Size(max = 255)
    private String bankAccount;

    @Size(max = 255)
    private String bankName;
}
