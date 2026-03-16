package com.example.backend.controller;

import com.example.backend.dto.respdto.UserResponse;
import com.example.backend.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/pending-vendors")
    public ResponseEntity<List<UserResponse>> getPendingVendors() {
        List<UserResponse> vendors = adminService.getPendingVendors();
        return ResponseEntity.ok(vendors);
    }

    @GetMapping("/vendors")
    public ResponseEntity<List<UserResponse>> getAllVendors() {
        List<UserResponse> vendors = adminService.getAllVendors();
        return ResponseEntity.ok(vendors);
    }

    @PostMapping("/add-vendor")
    public ResponseEntity<UserResponse> addVendor(@RequestBody com.example.backend.dto.requestdto.UserRegistrationRequest request) {
        UserResponse response = adminService.addVendor(request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/approve-vendor/{vendorId}")
    public ResponseEntity<String> approveVendor(@PathVariable Long vendorId) {
        adminService.approveVendor(vendorId);
        return ResponseEntity.ok("Vendor approved successfully");
    }

    @DeleteMapping("/user/{userId}")
    public ResponseEntity<String> deleteUser(@PathVariable Long userId) {
        adminService.deleteUser(userId);
        return ResponseEntity.ok("User deleted successfully");
    }
}