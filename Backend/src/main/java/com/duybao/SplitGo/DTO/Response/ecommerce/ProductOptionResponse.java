package com.duybao.SplitGo.DTO.Response.ecommerce;

import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProductOptionResponse {
    private String name; // e.g., "color", "size"
    private List<String> values; // e.g., ["red","blue"]
    private boolean required;
}
