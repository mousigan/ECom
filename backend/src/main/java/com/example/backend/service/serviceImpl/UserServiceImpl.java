package com.example.backend.service.serviceImpl;

import com.example.backend.dto.requestdto.*;
import com.example.backend.dto.respdto.UserResponse;
import com.example.backend.entity.Order;
import com.example.backend.entity.User;
import com.example.backend.entity.PasswordResetOtp;
import com.example.backend.repository.OrderRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.PasswordResetOtpRepository;
import com.example.backend.service.UserService;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.Random;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordResetOtpRepository otpRepository;
    private final JavaMailSender mailSender;
    private final BCryptPasswordEncoder passwordEncoder;
    private final OrderRepository orderRepository;

    @Value("${admin.email:admin@ecom.com}")
    private String adminEmail;

    @Value("${admin.password:admin123}")
    private String adminPassword;

    @Value("${astadmin.email:astadmin@ecom.com}")
    private String astAdminEmail;

    @Value("${astadmin.password:astadmin123}")
    private String astAdminPassword;

    public UserServiceImpl(UserRepository userRepository,
                           PasswordResetOtpRepository otpRepository,
                           JavaMailSender mailSender,
                           BCryptPasswordEncoder passwordEncoder,
                           OrderRepository orderRepository) {
        this.userRepository = userRepository;
        this.otpRepository = otpRepository;
        this.mailSender = mailSender;
        this.passwordEncoder = passwordEncoder;
        this.orderRepository = orderRepository;
    }

    @Override
    @Transactional
    public UserResponse registerUser(UserRegistrationRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already registered: " + email);
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        
        String requestedRole = request.getRequestedRole();
        if (requestedRole == null || requestedRole.isEmpty()) {
            user.setRole(User.Role.CUSTOMER);
        } else {
            try {
                User.Role role = User.Role.valueOf(requestedRole.toUpperCase());
                if (role == User.Role.VENDOR) {
                    user.setRole(User.Role.PENDING_VENDOR);
                } else if (role == User.Role.ADMIN) {
                    user.setRole(User.Role.CUSTOMER);
                } else {
                    user.setRole(role);
                }
            } catch (IllegalArgumentException e) {
                user.setRole(User.Role.CUSTOMER);
            }
        }

        User savedUser = userRepository.save(user);
        return mapToResponse(savedUser);
    }

    @Override
    public UserResponse loginUser(LoginRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        String password = request.getPassword();

        // ADMIN login support (reads credentials from environment)
        if ((email.equals("admin") || email.equals(adminEmail)) && password.equals(adminPassword)) {
            return getHardcodedAdmin("admin", adminEmail);
        }
        if ((email.equals("astadmin") || email.equals(astAdminEmail)) && password.equals(astAdminPassword)) {
            return getHardcodedAdmin("astadmin", astAdminEmail);
        }

        System.out.println("🔍 Login attempt for email: " + email);
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    System.out.println("❌ User not found in DB: " + email);
                    return null;
                });
        
        if (user == null) {
            throw new RuntimeException("Invalid email or password");
        }
        
        // Support both hashed (BCrypt) and legacy plaintext passwords
        boolean matches = false;
        try {
            matches = passwordEncoder.matches(password, user.getPassword());
        } catch (Exception e) {
            // If it's not a valid BCrypt hash, matches will be false
        }
        
        if (!matches && !password.equals(user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }
        
        return mapToResponse(user);
    }

    @Override
    public UserResponse getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        return mapToResponse(user);
    }

    @Override
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("No account found with this email"));

        String otp = String.format("%06d", new Random().nextInt(999999));
        otpRepository.deleteByEmail(user.getEmail());
        
        PasswordResetOtp resetOtp = new PasswordResetOtp();
        resetOtp.setEmail(user.getEmail());
        resetOtp.setOtp(otp);
        resetOtp.setExpiryTime(LocalDateTime.now().plusMinutes(5));
        otpRepository.save(resetOtp);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(user.getEmail());
            helper.setSubject("Password Reset OTP");
            helper.setText("Your OTP is: <strong>" + otp + "</strong>. It expires in 5 minutes.", true);
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send email: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetOtp otpRecord = otpRepository.findByEmailAndOtp(request.getEmail(), request.getOtp())
                .orElseThrow(() -> new RuntimeException("Invalid OTP"));

        if (otpRecord.getExpiryTime().isBefore(LocalDateTime.now())) {
            otpRepository.delete(otpRecord);
            throw new RuntimeException("OTP expired");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        otpRepository.delete(otpRecord);
    }

    @Override
    @Transactional
    public void deleteAccount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Delete related orders first
        java.util.List<Order> orders = orderRepository.findByUser_IdOrderByOrderDateDesc(userId);
        orderRepository.deleteAll(orders);

        // Delete OTPs
        otpRepository.deleteByEmail(user.getEmail());

        // Finally delete the user
        userRepository.delete(user);
        System.out.println("🗑️ Account deleted for user: " + user.getEmail());
    }

    private UserResponse getHardcodedAdmin(String name, String email) {
        UserResponse response = new UserResponse();
        response.setName(name);
        response.setEmail(email);
        response.setRole("ADMIN");
        response.setId(0L); 
        response.setCreditPoints(0);
        return response;
    }

    private UserResponse mapToResponse(User user) {
        if (user == null) return null;
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole() != null ? user.getRole().name() : "CUSTOMER");
        response.setCreditPoints(user.getCreditPoints() != null ? user.getCreditPoints() : 0);
        response.setMobileNumber(user.getMobileNumber());
        return response;
    }
}