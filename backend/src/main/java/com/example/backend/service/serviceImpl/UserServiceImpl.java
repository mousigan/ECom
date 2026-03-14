
package com.example.backend.service.serviceImpl;

import com.example.backend.dto.requestdto.*;
import com.example.backend.dto.responsedto.UserResponse;
import com.example.backend.entity.User;
import com.example.backend.entity.PasswordResetOtp;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.PasswordResetOtpRepository;
import com.example.backend.service.UserService;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import jakarta.mail.internet.MimeMessage;
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

    public UserServiceImpl(UserRepository userRepository, 
                           PasswordResetOtpRepository otpRepository, 
                           JavaMailSender mailSender,
                           BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.otpRepository = otpRepository;
        this.mailSender = mailSender;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public UserResponse registerUser(UserRegistrationRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered: " + request.getEmail());
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
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
        String email = request.getEmail();
        String password = request.getPassword();

        // Hardcoded ADMIN login support (checks both name and email variants)
        if ((email.equalsIgnoreCase("admin") || email.equalsIgnoreCase("admin@ecom.com")) && password.equals("admin123")) {
            return getHardcodedAdmin("admin", "admin@ecom.com");
        }
        if ((email.equalsIgnoreCase("astadmin") || email.equalsIgnoreCase("astadmin@ecom.com")) && password.equals("astadmin123")) {
            return getHardcodedAdmin("astadmin", "astadmin@ecom.com");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));
        
        boolean matches = passwordEncoder.matches(password, user.getPassword()) || 
                         user.getPassword().equals(password);
        
        if (!matches) {
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
        return response;
    }
}