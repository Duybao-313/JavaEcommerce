package com.duybao.SplitGo.DTO.request.admin;

import com.duybao.SplitGo.Enum.SellerVerificationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VerifySellerRequest {
    @NotNull
    private SellerVerificationStatus status;
}
