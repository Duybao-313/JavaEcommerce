package com.duybao.SplitGo.Service;

import java.nio.charset.StandardCharsets;
import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.duybao.SplitGo.DTO.Response.JwtToken;
import com.duybao.SplitGo.DTO.Response.RefreshToken;
import com.duybao.SplitGo.DTO.Response.TokenResponse;
import com.duybao.SplitGo.Exception.AppException;
import com.duybao.SplitGo.Exception.ErrorCode;
import com.duybao.SplitGo.Model.InvalidatedToken;
import com.duybao.SplitGo.Model.User;
import com.duybao.SplitGo.Repository.InvalidatedTokenRepository;
import com.duybao.SplitGo.Repository.UserRepository;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class JwtService {

    @Value("${jwt.secret}")
    protected String SECRET_KEY;

    @Value("${jwt.token-duration}")
    protected int tokenDuration;

    @Value("${jwt.refresh-duration}")
    protected int refreshDuration;

    private final UserRepository userRepository;
    private final InvalidatedTokenRepository invalidatedTokenRepository;

    public JwtToken generateToken(User user) {
        JWSHeader jwsHeader = new JWSHeader(JWSAlgorithm.HS512);
        Date date =
                new Date(Instant.now().plus(tokenDuration, ChronoUnit.SECONDS).toEpochMilli());

        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getUsername())
                .claim("role", user.getRole())
                .claim("userid", user.getId())
                .issueTime(new Date())
                .jwtID(UUID.randomUUID().toString())
                .expirationTime(date)
                .build();
        Payload payload = new Payload(jwtClaimsSet.toJSONObject());
        JWSObject jwsObject = new JWSObject(jwsHeader, payload);
        try {
            jwsObject.sign(new MACSigner(SECRET_KEY.getBytes(StandardCharsets.UTF_8)));
            log.info(SECRET_KEY);

        } catch (JOSEException e) {
            throw new RuntimeException(e);
        }
        return JwtToken.builder().token(jwsObject.serialize()).ExpiryDate(date).build();
    }

    public TokenResponse introspect(String token) throws ParseException, JOSEException {
        boolean valid = true;
        try {
            VerifyToken(token, false);
        } catch (AppException e) {
            valid = false;
        }

        return TokenResponse.builder().valid(valid).build();
    }
    ;

    public RefreshToken refreshToken(String token) throws ParseException, JOSEException {

        var signedJWT = VerifyToken(token, true);
        var jit = signedJWT.getJWTClaimsSet().getJWTID();
        Date expiration = signedJWT.getJWTClaimsSet().getExpirationTime();
        InvalidatedToken invalidatedToken =
                InvalidatedToken.builder().id(jit).expiryTime(expiration).build();
        invalidatedTokenRepository.save(invalidatedToken);
        var username = signedJWT.getJWTClaimsSet().getSubject();
        User user =
                userRepository.findByUsername(username).orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));
        var refreshToken = generateToken(user).getToken();
        return RefreshToken.builder().token(refreshToken).expiryDate(expiration).build();
    }

    public SignedJWT VerifyToken(String token, boolean isRefresh) throws JOSEException, ParseException {
        JWSVerifier verifier = new MACVerifier(SECRET_KEY.getBytes(StandardCharsets.UTF_8));
        log.info(SECRET_KEY);
        SignedJWT signedJWT = SignedJWT.parse(token);
        Date expiration = (isRefresh)
                ? new Date(signedJWT
                        .getJWTClaimsSet()
                        .getIssueTime()
                        .toInstant()
                        .plus(refreshDuration, ChronoUnit.SECONDS)
                        .toEpochMilli())
                : signedJWT.getJWTClaimsSet().getExpirationTime();
        var verified = signedJWT.verify(verifier);

        if (!(verified && expiration.after(new Date()))) {
            throw new AppException(ErrorCode.TOKEN_INVALID);
        }
        if (invalidatedTokenRepository.existsById(signedJWT.getJWTClaimsSet().getJWTID())) {
            throw new AppException(ErrorCode.TOKEN_INVALID);
        }
        return signedJWT;
    }
}
