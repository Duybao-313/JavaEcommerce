package com.duybao.SplitGo.DTO.Response.ecommerce;

import com.duybao.SplitGo.Enum.AddressType;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AddressResponse {
    private Long id;

    private Long userId;

    private String recipientName;

    private String phone;

    private String detail;

    private AddressType type;

    private Boolean isDefault;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}

