package com.duybao.SplitGo.Service.Impl;

import com.duybao.SplitGo.DTO.Response.GooglePlaceAutocompleteResponse;
import com.duybao.SplitGo.DTO.Response.GooglePlaceDetailsResponse;
import com.duybao.SplitGo.Exception.AppException;
import com.duybao.SplitGo.Exception.ErrorCode;
import com.duybao.SplitGo.Service.GoogleMapsService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class GoogleMapsServiceImpl implements GoogleMapsService {

    private static final Logger log = LoggerFactory.getLogger(GoogleMapsServiceImpl.class);

    @Value("${google.maps.api-key:}")
    private String apiKey;

    private static final String AUTOCOMPLETE_URL = "https://maps.googleapis.com/maps/api/place/autocomplete/json";
    private static final String PLACE_DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json";

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public GoogleMapsServiceImpl() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public List<GooglePlaceAutocompleteResponse> autocomplete(String input) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("Google Maps API key is empty");
            return List.of();
        }

        log.info("Calling Google Autocomplete API with key: {}...", apiKey.substring(0, Math.min(8, apiKey.length())));

        String url = UriComponentsBuilder.fromUriString(AUTOCOMPLETE_URL)
                .queryParam("input", input)
                .queryParam("key", apiKey)
                .queryParam("language", "vi")
                .queryParam("components", "country:vn")
                .toUriString();

        try {
            String response = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(response);

            String status = root.get("status").asText();
            log.info("Google Autocomplete status: {}", status);
            if (!"OK".equals(status)) {
                String errorMsg = root.has("error_message") ? root.get("error_message").asText() : "unknown";
                log.warn("Google API error: {} - {}", status, errorMsg);
                return List.of();
            }

            List<GooglePlaceAutocompleteResponse> results = new ArrayList<>();
            for (JsonNode prediction : root.get("predictions")) {
                String description = prediction.get("description").asText();
                JsonNode terms = prediction.get("terms");
                String mainText = terms.size() > 0 ? terms.get(0).get("value").asText() : "";
                String secondaryText = description.replace(mainText, "").trim();
                if (secondaryText.startsWith(",")) {
                    secondaryText = secondaryText.substring(1).trim();
                }

                results.add(GooglePlaceAutocompleteResponse.builder()
                        .placeId(prediction.get("place_id").asText())
                        .mainText(mainText)
                        .secondaryText(secondaryText)
                        .description(description)
                        .build());
            }
            return results;

        } catch (Exception e) {
            throw new AppException(ErrorCode.INTERNAL_ERROR);
        }
    }

    @Override
    public GooglePlaceDetailsResponse getPlaceDetails(String placeId) {
        if (apiKey == null || apiKey.isBlank()) {
            return null;
        }

        String url = UriComponentsBuilder.fromUriString(PLACE_DETAILS_URL)
                .queryParam("place_id", placeId)
                .queryParam("key", apiKey)
                .queryParam("language", "vi")
                .toUriString();

        try {
            String response = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(response);

            if (!"OK".equals(root.get("status").asText())) {
                return null;
            }

            JsonNode result = root.get("result");
            Map<String, String> components = extractAddressComponents(result);

            return GooglePlaceDetailsResponse.builder()
                    .placeId(result.get("place_id").asText())
                    .formattedAddress(result.has("formatted_address") ? result.get("formatted_address").asText() : "")
                    .latitude(result.get("geometry").get("location").get("lat").asDouble())
                    .longitude(result.get("geometry").get("location").get("lng").asDouble())
                    .streetNumber(components.getOrDefault("street_number", ""))
                    .route(components.getOrDefault("route", ""))
                    .ward(components.getOrDefault("sublocality_level_1",
                            components.getOrDefault("administrative_area_level_3", "")))
                    .district(components.getOrDefault("administrative_area_level_2", ""))
                    .city(components.getOrDefault("administrative_area_level_1", ""))
                    .addressComponents(components)
                    .build();

        } catch (Exception e) {
            throw new AppException(ErrorCode.INTERNAL_ERROR);
        }
    }

    private Map<String, String> extractAddressComponents(JsonNode result) {
        Map<String, String> components = new LinkedHashMap<>();
        if (result.has("address_components")) {
            for (JsonNode component : result.get("address_components")) {
                String longName = component.get("long_name").asText();
                for (JsonNode type : component.get("types")) {
                    components.put(type.asText(), longName);
                }
            }
        }
        return components;
    }
}
