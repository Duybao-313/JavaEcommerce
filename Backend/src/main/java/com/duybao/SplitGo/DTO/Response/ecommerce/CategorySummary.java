package com.duybao.SplitGo.DTO.Response.ecommerce;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CategorySummary {
    private Long id;
    private String name;
}
