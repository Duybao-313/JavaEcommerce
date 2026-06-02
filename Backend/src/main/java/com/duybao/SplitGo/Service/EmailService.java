package com.duybao.SplitGo.Service;

public interface EmailService {
    void sendVerificationEmail(String to, String userName, String token);

    void sendPasswordResetEmail(String to, String userName, String token);
}
