package com.duybao.SplitGo.Service.Impl;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import com.duybao.SplitGo.Service.EmailService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;

    @Value("${app.base-url}")
    private String baseUrl;

    @Value("${spring.mail.username}")
    private String mailFrom;

    @Override
    @Async("emailExecutor")
    public void sendVerificationEmail(String to, String userName, String token) {
        try {
            Context context = new Context();
            String verifyLink = baseUrl + "/verify-email?token=" + token;
            context.setVariable("userName", userName);
            context.setVariable("verifyLink", verifyLink);

            String htmlContent = templateEngine.process("email/verify-email", context);
            sendHtmlEmail(to, "Xác thực email SplitGo", htmlContent);
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
            sendHtmlEmail(to, "Đặt lại mật khẩu SplitGo", htmlContent);
            log.info("Password reset email sent to {}", to);
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}: {}", to, e.getMessage());
        }
    }

    private void sendHtmlEmail(String to, String subject, String htmlContent) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);
        helper.setFrom(mailFrom);
        mailSender.send(message);
    }
}
