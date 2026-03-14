package com.example.backend.dto.requestdto;

public class UserRegistrationRequest {
    private String name;
    private String email;
    private String password;
    private String requestedRole;

    public UserRegistrationRequest() {
    }

    public UserRegistrationRequest(String name, String email, String password, String requestedRole) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.requestedRole = requestedRole;
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRequestedRole() {
        return requestedRole;
    }

    public void setRequestedRole(String requestedRole) {
        this.requestedRole = requestedRole;
    }
}