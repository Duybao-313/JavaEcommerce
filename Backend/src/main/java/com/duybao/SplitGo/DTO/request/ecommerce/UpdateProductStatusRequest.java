package com.duybao.SplitGo.DTO.request.ecommerce;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateProductStatusRequest {
    @NotBlank
    private String status;

    /** Lý do từ chối / yêu cầu chỉnh sửa. Bắt buộc khi status là REJECTED hoặc PENDING_CHANGES. */
    private String reason;
}
