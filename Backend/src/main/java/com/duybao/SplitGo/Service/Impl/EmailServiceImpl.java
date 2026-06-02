package com.duybao.SplitGo.Service.Impl;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import com.duybao.SplitGo.Service.EmailService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class EmailServiceImpl implements EmailService {

    private final RestTemplate restTemplate;
    private final SpringTemplateEngine templateEngine;

    @Value("${app.base-url}")
    private String baseUrl;

    @Value("${brevo.sender-email}")
    private String senderEmail;

    @Value("${brevo.api-key}")
    private String brevoApiKey;

    public EmailServiceImpl(SpringTemplateEngine templateEngine) {
        this.templateEngine = templateEngine;
        this.restTemplate = new RestTemplate();
    }

    @Override
    @Async("emailExecutor")
    public void sendVerificationEmail(String to, String userName, String token) {
        try {
            Context context = new Context();
            String verifyLink = baseUrl + "/verify-email?token=" + token;
            context.setVariable("userName", userName);
            context.setVariable("verifyLink", verifyLink);

            String htmlContent = templateEngine.process("email/verify-email", context);
            sendViaBrevoApi(to, "Xác thực email SplitGo", htmlContent);
            log.info("Verification email sent to {}", to);
        } catch (Exception e) {
            log.error("Failed to send verification email to {}: {}", to, e.getMessage());
        }
    }

    @Override
    @Async("emailExecutor")
    public void sendPasswordResetEmail(String to, String userName, String token) {
        try {
            Context context = new Context();
            String resetLink = baseUrl + "/reset-password?token=" + token;
            context.setVariable("userName", userName);
            context.setVariable("resetLink", resetLink);
            context.setVariable("expiryMinutes", 15);

            String htmlContent = templateEngine.process("email/reset-password", context);
            sendViaBrevoApi(to, "Đặt lại mật khẩu SplitGo", htmlContent);
            log.info("Password reset email sent to {}", to);
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}: {}", to, e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    private void sendViaBrevoApi(String to, String subject, String htmlContent) {
        if (brevoApiKey == null || brevoApiKey.isBlank()) {
            log.warn("Brevo API key not set, skipping email to {}", to);
            return;
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("api-key", brevoApiKey);

        Map<String, Object> body = Map.of(
                "sender", Map.of("email", senderEmail, "name", "SplitGo"),
                "to", List.of(Map.of("email", to)),
                "subject", subject,
                "htmlContent", htmlContent);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            restTemplate.postForObject("https://api.brevo.com/v3/smtp/email", request, String.class);
        } catch (Exception e) {
            log.error("Brevo API error for {}: {}", to, e.getMessage());
        }
    }
}
