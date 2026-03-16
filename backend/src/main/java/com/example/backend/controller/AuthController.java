package com.example.backend.controller;

import com.example.backend.dto.requestdto.UserRegistrationRequest;
import com.example.backend.dto.requestdto.LoginRequest;
import com.example.backend.dto.requestdto.ForgotPasswordRequest;
import com.example.backend.dto.requestdto.ResetPasswordRequest;
import com.example.backend.dto.respdto.UserResponse;
import com.example.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final UserService userService;
    private final com.example.backend.repository.AddressRepository addressRepository;

    public AuthController(UserService userService, com.example.backend.repository.AddressRepository addressRepository) {
        this.userService = userService;
        this.addressRepository = addressRepository;
    }

    @GetMapping("/{userId}/addresses")
    public ResponseEntity<java.util.List<com.example.backend.entity.Address>> getUserAddresses(@PathVariable Long userId) {
        return ResponseEntity.ok(addressRepository.findByUser_Id(userId));
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@RequestBody UserRegistrationRequest request) {
        UserResponse response = userService.registerUser(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<UserResponse> login(@RequestBody LoginRequest request) {
        UserResponse response = userService.loginUser(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        userService.forgotPassword(request);
        return ResponseEntity.ok("OTP sent to your email");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest request) {
        userService.resetPassword(request);
        return ResponseEntity.ok("Password reset successfully");
    }

    @DeleteMapping("/account/{userId}")
    public ResponseEntity<String> deleteAccount(@PathVariable Long userId) {
        userService.deleteAccount(userId);
        return ResponseEntity.ok("Account deleted successfully");
    }
}
