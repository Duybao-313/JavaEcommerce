package com.duybao.SplitGo.Config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "sepay")
public class SePayConfig {
    private String merchantId;
    private String secretKey;
    private String baseUrl;
    private String successUrl;
    private String errorUrl;
    private String cancelUrl;
    private String ipnUrl;
}
