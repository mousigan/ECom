package com.example.backend.exception;

public class DataNotFound extends RuntimeException {
    public DataNotFound(String message) {
        super(message);
    }
}
