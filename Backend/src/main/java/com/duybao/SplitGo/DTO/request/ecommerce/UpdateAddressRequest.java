package com.duybao.SplitGo.DTO.request.ecommerce;

import com.duybao.SplitGo.Enum.AddressType;
import lombok.Data;

@Data
public class UpdateAddressRequest {
    private String recipientName;

    private String phone;

    private String detail;

    private AddressType type;

    private Boolean isDefault;
}

