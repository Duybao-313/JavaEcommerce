package com.duybao.SplitGo.Controller;

import com.duybao.SplitGo.DTO.Response.ApiResponse;
import com.duybao.SplitGo.DTO.Response.GooglePlaceAutocompleteResponse;
import com.duybao.SplitGo.DTO.Response.GooglePlaceDetailsResponse;
import com.duybao.SplitGo.Service.GoogleMapsService;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/maps")
public class GoogleMapsController {
    private final GoogleMapsService googleMapsService;

    @Value("${google.maps.api-key:}")
    private String apiKey;

    @GetMapping("/api-key")
    public ApiResponse<Map<String, String>> getApiKey() {
        return ApiResponse.<Map<String, String>>builder()
                .success(true)
                .code(200)
                .message("OK")
                .data(Map.of("apiKey", apiKey))
                .timestamp(LocalDateTime.now())
                .build();
    }

    @GetMapping("/autocomplete")
    public ApiResponse<List<GooglePlaceAutocompleteResponse>> autocomplete(@RequestParam String input) {
        return ApiResponse.<List<GooglePlaceAutocompleteResponse>>builder()
                .success(true)
                .code(200)
                .message("OK")
                .data(googleMapsService.autocomplete(input))
                .timestamp(LocalDateTime.now())
                .build();
    }

    @GetMapping("/place-details")
    public ApiResponse<GooglePlaceDetailsResponse> getPlaceDetails(@RequestParam String placeId) {
        return ApiResponse.<GooglePlaceDetailsResponse>builder()
                .success(true)
                .code(200)
                .message("OK")
                .data(googleMapsService.getPlaceDetails(placeId))
                .timestamp(LocalDateTime.now())
                .build();
    }
}
