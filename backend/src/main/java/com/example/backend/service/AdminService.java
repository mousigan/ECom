
package com.example.backend.service;

import java.util.List;

import com.example.backend.dto.respdto.UserResponse;

public interface AdminService {
    List<UserResponse> getPendingVendors();
    List<UserResponse> getAllVendors();
    UserResponse addVendor(com.example.backend.dto.requestdto.UserRegistrationRequest request);
    void approveVendor(Long vendorId);
    void deleteUser(Long userId);
}