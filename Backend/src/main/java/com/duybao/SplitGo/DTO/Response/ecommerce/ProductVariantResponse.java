package com.duybao.SplitGo.DTO.Response.ecommerce;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.math.BigDecimal;
import java.util.Map;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProductVariantResponse {

    private Long id;
    private String sku;
    private Map<String, String> attributes;
    private BigDecimal price;
    private BigDecimal salePrice;
    private Integer stock;
    private String imageUrl;
    private BigDecimal weight;
}
