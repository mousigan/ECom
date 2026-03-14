
package com.example.backend.service;

import com.example.backend.dto.requestdto.LoginRequest;
import com.example.backend.dto.requestdto.UserRegistrationRequest;
import com.example.backend.dto.requestdto.ForgotPasswordRequest;
import com.example.backend.dto.requestdto.ResetPasswordRequest;
import com.example.backend.dto.respdto.UserResponse;
import java.util.List;

public interface UserService {
    UserResponse registerUser(UserRegistrationRequest request);
    UserResponse loginUser(LoginRequest request);
    UserResponse getUserProfile(Long userId);
    void forgotPassword(ForgotPasswordRequest request);
    void resetPassword(ResetPasswordRequest request);
}