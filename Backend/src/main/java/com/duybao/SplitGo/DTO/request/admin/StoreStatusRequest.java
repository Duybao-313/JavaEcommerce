package com.duybao.SplitGo.DTO.request.admin;

import com.duybao.SplitGo.Enum.StoreStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StoreStatusRequest {
    @NotNull
    private StoreStatus status;
}
