package com.example.backend.dto.respdto;

public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private String role;
    private String mobileNumber;
    private Integer creditPoints;

    public UserResponse() {
    }

    public UserResponse(Long id, String name, String email, String role, String mobileNumber, Integer creditPoints) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.mobileNumber = mobileNumber;
        this.creditPoints = creditPoints;
    }

    // Getters and Setter
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Integer getCreditPoints() {
        return creditPoints;
    }

    public void setCreditPoints(Integer creditPoints) {
        this.creditPoints = creditPoints;
    }

    public String getMobileNumber() {
        return mobileNumber;
    }

    public void setMobileNumber(String mobileNumber) {
        this.mobileNumber = mobileNumber;
    }
}