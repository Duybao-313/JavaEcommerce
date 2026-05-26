package com.duybao.SplitGo.DTO.request.ecommerce;

import com.duybao.SplitGo.Enum.AddressType;
import lombok.Data;

@Data
public class UpdateAddressRequest {
    private String recipientName;

    private String phone;

    private String detail;

    private String fullAddress;

    private String street;

    private String ward;

    private String district;

    private String city;

    private Double latitude;

    private Double longitude;

    private String placeId;

    private AddressType type;

    private Boolean isDefault;
}

