package com.duybao.SplitGo.Service.Impl;

import java.text.ParseException;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.duybao.SplitGo.DTO.Response.AuthResponse;
import com.duybao.SplitGo.DTO.Response.RegisterResponse;
import com.duybao.SplitGo.DTO.Response.User.UserDTO;
import com.duybao.SplitGo.DTO.request.ChangePasswordRequest;
import com.duybao.SplitGo.DTO.request.ForgotPasswordRequest;
import com.duybao.SplitGo.DTO.request.LogoutRequest;
import com.duybao.SplitGo.DTO.request.ResetPasswordRequest;
import com.duybao.SplitGo.DTO.request.UserLoginRequest;
import com.duybao.SplitGo.DTO.request.UserRegisterRequest;
import com.duybao.SplitGo.Enum.Role;
import com.duybao.SplitGo.Enum.SellerVerificationStatus;
import com.duybao.SplitGo.Enum.StoreStatus;
import com.duybao.SplitGo.Exception.AppException;
import com.duybao.SplitGo.Exception.ErrorCode;
import com.duybao.SplitGo.Mappers.UserMapper;
import com.duybao.SplitGo.Model.InvalidatedToken;
import com.duybao.SplitGo.Model.User;
import com.duybao.SplitGo.Repository.InvalidatedTokenRepository;
import com.duybao.SplitGo.Repository.UserRepository;
import com.duybao.SplitGo.Service.AuthenticationService;
import com.duybao.SplitGo.Service.EmailService;
import com.duybao.SplitGo.Service.JwtService;
import com.nimbusds.jose.JOSEException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {
    @Value("${jwt.secret}")
    protected String SECRET_KEY;

    private final UserMapper userMapper;

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final InvalidatedTokenRepository invalidatedTokenRepository;
    private final EmailService emailService;

    @Override
    public RegisterResponse UserRegister(UserRegisterRequest a) {

        if (userRepository.findByEmail(a.getEmail()).isPresent()) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        // Seller-specific validation
        if (Boolean.TRUE.equals(a.getIsSeller())) {
            if (a.getStoreName() == null || a.getStoreName().isBlank()) {
                throw new AppException(ErrorCode.STORE_NAME_REQUIRED);
            }
            if (a.getStoreAddress() == null || a.getStoreAddress().isBlank()) {
                throw new AppException(ErrorCode.STORE_ADDRESS_REQUIRED);
            }
        }

        User user = new User();
        user = userMapper.toEntity(a);
        user.setPassword(passwordEncoder.encode(a.getPassword()));

        if (Boolean.TRUE.equals(a.getIsSeller())) {
            user.setRole(Role.ROLE_SELLER);
            user.setStoreName(a.getStoreName());
            user.setStoreAddress(a.getStoreAddress());
            user.setBusinessLicense(a.getBusinessLicense());
            user.setTaxCode(a.getTaxCode());
            user.setBankAccount(a.getBankAccount());
            user.setBankName(a.getBankName());
            user.setSellerVerified(SellerVerificationStatus.PENDING);
            user.setStoreStatus(StoreStatus.ACTIVE);
        } else {
            user.setRole(Role.ROLE_USER);
        }

        if (a.getPhone() != null && !a.getPhone().isBlank()) {
            user.setPhone(a.getPhone());
        }

        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        // Generate email verification token
        String verificationToken = UUID.randomUUID().toString();
        user.setVerificationToken(verificationToken);

        userRepository.save(user);

        // Send verification email (async, không block)
        emailService.sendVerificationEmail(user.getEmail(), user.getFullName(), verificationToken);

        return RegisterResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .build();
    }

    @Override
    public AuthResponse login(UserLoginRequest a) {
        try {
            UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken =
                    new UsernamePasswordAuthenticationToken(a.getUsername(), a.getPassword());
            Authentication authentication = authenticationManager.authenticate(usernamePasswordAuthenticationToken);
            SecurityContextHolder.getContext().setAuthentication(authentication);

            User user1 = (User) authentication.getPrincipal();
            user1.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user1);
            String token = jwtService.generateToken(user1).getToken();
            UserDTO userDTO = userMapper.toDTO(user1); //
            Role role = user1.getRole();
            return new AuthResponse(token, role, userDTO);
        } catch (BadCredentialsException e) {
            throw new AppException(ErrorCode.PASSWORD_INCORRECT);
        }
    }

    @Override
    public UserDTO getUser(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return userMapper.toDTO(user);
    }

    @Override
    public void Logout(LogoutRequest request) throws ParseException, JOSEException {
        try {
            var signToken = jwtService.VerifyToken(request.getToken(), true);
            String id = signToken.getJWTClaimsSet().getJWTID();
            Date dateExpiry = signToken.getJWTClaimsSet().getExpirationTime();
            InvalidatedToken invalidatedToken =
                    InvalidatedToken.builder().id(id).expiryTime(dateExpiry).build();
            invalidatedTokenRepository.save(invalidatedToken);
        } catch (AppException e) {
            log.info("token exp");
        }
    }

    @Override
    public boolean changePassword(ChangePasswordRequest request, Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        var oldPass = request.getOldPass();
        var newPass1 = request.getNewPass1();
        var newPass2 = request.getNewPass2();
        if (!passwordEncoder.matches(oldPass, user.getPassword())) throw new AppException(ErrorCode.PASSWORD_INCORRECT);
        if (!newPass1.equals(newPass2)) throw new AppException(ErrorCode.NEWPASS_NOT_SAME);
        if (newPass1.equals(oldPass)) throw new AppException(ErrorCode.SAME_PASSWORD);
        user.setPassword(passwordEncoder.encode(newPass1));
        userRepository.save(user);
        return true;
    }

    @Override
    public String forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.EMAIL_NOT_FOUND));

        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        // Send password reset email (async)
        String userName = user.getFullName() != null ? user.getFullName() : user.getUsername();
        emailService.sendPasswordResetEmail(user.getEmail(), userName, token);

        return token;
    }

    @Override
    public boolean resetPassword(ResetPasswordRequest request) {
        User user = userRepository
                .findByResetToken(request.getToken())
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_RESET_TOKEN));

        if (user.getResetTokenExpiry() == null
                || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.INVALID_RESET_TOKEN);
        }

        var newPass = request.getNewPassword();
        var confirmPass = request.getConfirmPassword();

        if (!newPass.equals(confirmPass)) {
            throw new AppException(ErrorCode.NEWPASS_NOT_SAME);
        }

        if (passwordEncoder.matches(newPass, user.getPassword())) {
            throw new AppException(ErrorCode.SAME_PASSWORD);
        }

        user.setPassword(passwordEncoder.encode(newPass));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);

        return true;
    }

    @Override
    public void verifyEmail(String token) {
        User user = userRepository
                .findByVerificationToken(token)
                .orElseThrow(() -> new AppException(ErrorCode.VERIFICATION_TOKEN_INVALID));

        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_VERIFIED);
        }

        user.setEmailVerified(true);
        user.setVerificationToken(null);
        userRepository.save(user);
    }

    @Override
    public void resendVerificationEmail(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_VERIFIED);
        }

        String token = UUID.randomUUID().toString();
        user.setVerificationToken(token);
        userRepository.save(user);

        String userName = user.getFullName() != null ? user.getFullName() : user.getUsername();
        emailService.sendVerificationEmail(user.getEmail(), userName, token);
    }
}
