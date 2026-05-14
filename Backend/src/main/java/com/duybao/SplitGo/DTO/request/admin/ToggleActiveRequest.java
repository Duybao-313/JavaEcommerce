package com.duybao.SplitGo.DTO.request.admin;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ToggleActiveRequest {
    @NotNull
    private Boolean isActive;
}
