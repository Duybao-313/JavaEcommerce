package com.duybao.SplitGo.DTO.Response.ecommerce;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.math.BigDecimal;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SellerSummary {
    private Long id;
    private String storeName;
    private String storeLogo;
    private Boolean sellerVerified;
    private BigDecimal storeRating;
    private Integer totalSales;
}
