package com.duybao.SplitGo.DTO.Response.User;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.duybao.SplitGo.Enum.Role;
import com.duybao.SplitGo.Enum.SellerVerificationStatus;
import com.duybao.SplitGo.Enum.StoreStatus;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String phone;
    private String avatarUrl;
    private String address;
    private Role role;

    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime updatedAt;

    // --- Seller / Store Fields ---
    private String storeName;
    private String storeLogo;
    private String storeBanner;
    private String storeAddress;
    private String bankAccount;
    private String bankName;
    private SellerVerificationStatus sellerVerified;
    private BigDecimal storeRating;
    private Integer totalSales;
    private StoreStatus storeStatus;

    // --- Verification Flags ---
    private Boolean emailVerified;
    private Boolean phoneVerified;
    private Boolean isActive;

    /**
     * Mask bank account for non-owner views.
     * Call before returning to buyer/public roles.
     */
    public void maskSensitiveFields() {
        this.bankAccount = null;
        this.bankName = null;
        this.emailVerified = null;
        this.phoneVerified = null;
    }
}
