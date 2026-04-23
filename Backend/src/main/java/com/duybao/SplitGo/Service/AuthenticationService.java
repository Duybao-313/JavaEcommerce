package com.duybao.SplitGo.Service;

import java.text.ParseException;

import com.duybao.SplitGo.DTO.Response.AuthResponse;
import com.duybao.SplitGo.DTO.Response.RegisterResponse;
import com.duybao.SplitGo.DTO.Response.User.UserDTO;
import com.duybao.SplitGo.DTO.request.ChangePasswordRequest;
import com.duybao.SplitGo.DTO.request.LogoutRequest;
import com.duybao.SplitGo.DTO.request.UserLoginRequest;
import com.duybao.SplitGo.DTO.request.UserRegisterRequest;
import com.nimbusds.jose.JOSEException;

public interface AuthenticationService {
    public RegisterResponse UserRegister(UserRegisterRequest a);

    public AuthResponse login(UserLoginRequest a);

    public UserDTO getUser(Long id);

    public void Logout(LogoutRequest request) throws ParseException, JOSEException;

    public boolean changePassword(ChangePasswordRequest request, Long id);
}
