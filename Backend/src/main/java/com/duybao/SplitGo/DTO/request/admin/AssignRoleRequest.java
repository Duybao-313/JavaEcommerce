package com.duybao.SplitGo.DTO.request.admin;

import com.duybao.SplitGo.Enum.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssignRoleRequest {
    @NotNull
    private Role role;
}

