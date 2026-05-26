package com.duybao.SplitGo.DTO.Response;

import lombok.Builder;
import lombok.Data;
import java.util.Map;

@Data
@Builder
public class GooglePlaceDetailsResponse {
    private String placeId;
    private String formattedAddress;
    private String streetNumber;
    private String route;
    private String ward;
    private String district;
    private String city;
    private Double latitude;
    private Double longitude;
    private Map<String, String> addressComponents;
}
