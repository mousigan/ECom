package com.example.backend.service.serviceImpl;

import com.example.backend.dto.respdto.UserResponse;
import com.example.backend.entity.User;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.AdminService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AdminServiceImpl(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public List<UserResponse> getPendingVendors() {
        return userRepository.findByRole(User.Role.PENDING_VENDOR)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserResponse> getAllVendors() {
        return userRepository.findByRole(User.Role.VENDOR)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public UserResponse addVendor(com.yourname.ecommerce.dto.request.UserRegistrationRequest request) {
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setMobileNumber(request.getMobileNumber());
        user.setRole(User.Role.VENDOR); 
        
        userRepository.save(user);
        return mapToResponse(user);
    }

    @Override
    public void approveVendor(Long vendorId) {
        User user = userRepository.findById(vendorId)
                .orElseThrow(() -> new ResourceNotFoundException());

        if (user.getRole() == User.Role.PENDING_VENDOR) {
            user.setRole(User.Role.VENDOR);
            userRepository.save(user);
        }
    }

    @Override
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException());
        userRepository.delete(user);
    }

    private UserResponse mapToResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setMobileNumber(user.getMobileNumber());
        response.setRole(user.getRole() != null ? user.getRole().name() : "CUSTOMER");
        response.setCreditPoints(user.getCreditPoints() != null ? user.getCreditPoints() : 0);
        return response;
    }
}