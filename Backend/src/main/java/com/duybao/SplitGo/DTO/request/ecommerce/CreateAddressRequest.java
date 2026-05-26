package com.duybao.SplitGo.DTO.request.ecommerce;

import com.duybao.SplitGo.Enum.AddressType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class CreateAddressRequest {
    @NotBlank
    private String recipientName;

    @NotBlank
    @Pattern(regexp = "^[0-9]{10,11}$", message = "Phone must be 10-11 digits")
    private String phone;

    @NotBlank
    private String detail;

    private String fullAddress;

    private String street;

    private String ward;

    private String district;

    private String city;

    private Double latitude;

    private Double longitude;

    private String placeId;

    @NotNull
    private AddressType type;

    private Boolean isDefault = false;
}

