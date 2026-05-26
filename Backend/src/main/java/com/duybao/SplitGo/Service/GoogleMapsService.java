package com.duybao.SplitGo.Service;

import com.duybao.SplitGo.DTO.Response.GooglePlaceAutocompleteResponse;
import com.duybao.SplitGo.DTO.Response.GooglePlaceDetailsResponse;
import java.util.List;

public interface GoogleMapsService {
    List<GooglePlaceAutocompleteResponse> autocomplete(String input);

    GooglePlaceDetailsResponse getPlaceDetails(String placeId);
}
