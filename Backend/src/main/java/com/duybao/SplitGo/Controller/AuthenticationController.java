package com.duybao.SplitGo.Controller;

import java.text.ParseException;
import java.time.LocalDateTime;

import jakarta.validation.Valid;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;

import com.duybao.SplitGo.DTO.Response.ApiResponse;
import com.duybao.SplitGo.DTO.Response.AuthResponse;
import com.duybao.SplitGo.DTO.Response.RefreshToken;
import com.duybao.SplitGo.DTO.Response.RegisterResponse;
import com.duybao.SplitGo.DTO.Response.User.UserDTO;
import com.duybao.SplitGo.DTO.request.*;
import com.duybao.SplitGo.Enum.Role;
import com.duybao.SplitGo.Mappers.UserMapper;
import com.duybao.SplitGo.Model.User;
import com.duybao.SplitGo.Service.AuthenticationService;
import com.duybao.SplitGo.Service.JwtService;
import com.duybao.SplitGo.Service.UserService;
import com.nimbusds.jose.JOSEException;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthenticationController {

    private final AuthenticationService authenticationService;
    private final JwtService jwtService;
    private final UserMapper userMapper;
    private final UserService userService;

    @PostMapping("/register")
    public ApiResponse<RegisterResponse> register(@Valid @RequestBody UserRegisterRequest a) {

        return ApiResponse.<RegisterResponse>builder()
                .success(true)
                .message("Đăng ký thành công")
                .code(200)
                .data(authenticationService.UserRegister(a))
                .build();
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody UserLoginRequest a) {
        return ApiResponse.<AuthResponse>builder()
                .success(true)
                .code(200)
                .message("Đăng nhập thành công")
                .data(authenticationService.login(a))
                .build();
    }

    @GetMapping("/userdetail")
    public ApiResponse<UserDTO> getCurrentUser(@AuthenticationPrincipal User customUserDetail) {

        return ApiResponse.<UserDTO>builder()
                .data(authenticationService.getUser(customUserDetail.getId()))
                .success(true)
                .message("Lấy thông tin người dùng")
                .timestamp(LocalDateTime.now())
                .build();
    }

    @PutMapping("/userdetail")
    public ApiResponse<UserDTO> updateCurrentUser(
            @AuthenticationPrincipal User customUserDetail, @Valid @RequestBody UpdateUserRequest request) {

        return ApiResponse.<UserDTO>builder()
                .data(userService.updateUser(customUserDetail.getId(), request))
                .success(true)
                .message("Cập nhật thông tin người dùng thành công")
                .timestamp(LocalDateTime.now())
                .build();
    }

    @PostMapping("/logout")
    ApiResponse<Void> logout(@RequestBody LogoutRequest request) throws ParseException, JOSEException {
        authenticationService.Logout(request);
        return ApiResponse.<Void>builder()
                .success(true)
                .message("Đăng xuất thành công")
                .build();
    }

    @PostMapping("/refresh")
    ApiResponse<RefreshToken> logout(@RequestBody RefreshRequest request) throws ParseException, JOSEException {
        return ApiResponse.<RefreshToken>builder()
                .success(true)
                .data(jwtService.refreshToken(request.getToken()))
                .message("tao thanh cong")
                .build();
    }

    @PostMapping("/change-password")
    ApiResponse<Void> changePassword(
            @AuthenticationPrincipal User user, @RequestBody @Valid ChangePasswordRequest request) {
        var res = authenticationService.changePassword(request, user.getId());
        return ApiResponse.<Void>builder()
                .success(res)
                .message("Đổi mật khẩu thành công")
                .build();
    }

    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    ApiResponse<UserDTO> updateAvatar(
            @AuthenticationPrincipal User user, @RequestPart("avatar") MultipartFile avatar) {
        return ApiResponse.<UserDTO>builder()
                .success(true)
                .message("Cập nhật avatar thành công")
                .data(userService.updateAvatar(user.getId(), avatar))
                .timestamp(LocalDateTime.now())
                .build();
    }

    // ─── Seller Profile Endpoints ───

    @GetMapping("/seller/profile")
    public ApiResponse<UserDTO> getSellerProfile(@AuthenticationPrincipal User user) {
        UserDTO dto = userService.getUser(user.getId());
        return ApiResponse.<UserDTO>builder()
                .data(dto)
                .success(true)
                .message("Lấy thông tin seller")
                .timestamp(LocalDateTime.now())
                .build();
    }

    @PutMapping("/seller/profile")
    public ApiResponse<UserDTO> updateSellerProfile(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UpdateUserRequest request) {
        UserDTO updated = userService.updateUser(user.getId(), request);
        return ApiResponse.<UserDTO>builder()
                .data(updated)
                .success(true)
                .message("Cập nhật thông tin cửa hàng thành công")
                .timestamp(LocalDateTime.now())
                .build();
    }

    @PostMapping(value = "/seller/store-logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<UserDTO> uploadStoreLogo(
            @AuthenticationPrincipal User user,
            @RequestPart("logo") MultipartFile logo) {
        UserDTO updated = userService.updateStoreLogo(user.getId(), logo);
        return ApiResponse.<UserDTO>builder()
                .data(updated)
                .success(true)
                .message("Cập nhật logo cửa hàng thành công")
                .timestamp(LocalDateTime.now())
                .build();
    }

    @PostMapping(value = "/seller/store-banner", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<UserDTO> uploadStoreBanner(
            @AuthenticationPrincipal User user,
            @RequestPart("banner") MultipartFile banner) {
        UserDTO updated = userService.updateStoreBanner(user.getId(), banner);
        return ApiResponse.<UserDTO>builder()
                .data(updated)
                .success(true)
                .message("Cập nhật banner cửa hàng thành công")
                .timestamp(LocalDateTime.now())
                .build();
    }

    // ─── Public Store Endpoint ───

    @GetMapping("/sellers/{sellerId}")
    public ApiResponse<UserDTO> getPublicSellerProfile(@PathVariable Long sellerId) {
        UserDTO dto = userService.getUserById(sellerId);
        dto.maskSensitiveFields();
        return ApiResponse.<UserDTO>builder()
                .data(dto)
                .success(true)
                .message("Thông tin cửa hàng")
                .timestamp(LocalDateTime.now())
                .build();
    }
}
