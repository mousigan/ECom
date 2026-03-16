package com.example.backend.config;

import com.example.backend.entity.User;
import com.example.backend.entity.Category;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Configuration
public class DataInitializer {

    @Value("${admin.email:admin@ecom.com}")
    private String adminEmail;

    @Value("${admin.password:admin123}")
    private String adminPassword;

    @Value("${astadmin.email:astadmin@ecom.com}")
    private String astAdminEmail;

    @Value("${astadmin.password:astadmin123}")
    private String astAdminPassword;

    @Bean
    public CommandLineRunner initData(UserRepository userRepository, 
                                    CategoryRepository categoryRepository,
                                    BCryptPasswordEncoder passwordEncoder) {
        return args -> {
            // Create main Admin if not exists
            if (userRepository.findByEmail(adminEmail).isEmpty()) {
                User admin = new User();
                admin.setName("admin");
                admin.setEmail(adminEmail);
                admin.setPassword(passwordEncoder.encode(adminPassword));
                admin.setRole(User.Role.ADMIN);
                userRepository.save(admin);
                System.out.println("✅ Admin created: " + adminEmail);
            }

            // Create Assistant Admin if not exists
            if (userRepository.findByEmail(astAdminEmail).isEmpty()) {
                User astAdmin = new User();
                astAdmin.setName("astadmin");
                astAdmin.setEmail(astAdminEmail);
                astAdmin.setPassword(passwordEncoder.encode(astAdminPassword));
                astAdmin.setRole(User.Role.ADMIN);
                userRepository.save(astAdmin);
                System.out.println("✅ Assistant Admin created: " + astAdminEmail);
            }

            // Define specific categories requested by user
            String[][] categories = {
                {"Mobiles", "mobiles"},
                {"Laptops", "laptops"},
                {"Sunglasses", "sunglasses"},
                {"Watches", "watches"},
                {"Men Shirts", "men-shirts"},
                {"Shoes", "shoes"},
                {"Handbags", "handbags"}
            };

            // Create categories if they don't exist
            for (String[] cat : categories) {
                if (categoryRepository.findBySlug(cat[1]).isEmpty()) {
                    categoryRepository.save(new Category(cat[0], cat[1]));
                    System.out.println("✅ Category created: " + cat[0]);
                }
            }
        };
    }
}
