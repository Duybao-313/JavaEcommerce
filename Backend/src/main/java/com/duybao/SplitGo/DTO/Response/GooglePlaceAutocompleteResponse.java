package com.duybao.SplitGo.DTO.Response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GooglePlaceAutocompleteResponse {
    private String placeId;
    private String mainText;
    private String secondaryText;
    private String description;
}
