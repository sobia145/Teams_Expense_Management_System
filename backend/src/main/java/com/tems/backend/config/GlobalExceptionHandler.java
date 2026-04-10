package com.tems.backend.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.io.PrintWriter;
import java.io.StringWriter;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleException(Exception e) {
        // Extract the exact stack trace natively to show in the Response
        StringWriter sw = new StringWriter();
        PrintWriter pw = new PrintWriter(sw);
        e.printStackTrace(pw);
        
        System.err.println("\n🔥 SYSTEM ERROR INTERCEPTED 🔥\n" + sw.toString());
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body("CRITICAL ERROR IN BACKEND: " + e.getMessage() + "\n\nSTACK TRACE:\n" + sw.toString());
    }
}
