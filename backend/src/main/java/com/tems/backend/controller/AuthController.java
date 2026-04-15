package com.tems.backend.controller;

import com.tems.backend.entity.User;
import com.tems.backend.service.UserService;
import com.tems.backend.config.JwtUtil;
import com.tems.backend.dto.AuthResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            System.out.println("Processing registration request for: " + user.getEmail());
            
            user.setIsDeleted(false);
            user.setRole("USER");
            user.setCreatedAt(java.time.LocalDateTime.now());
            
            User savedUser = userService.createUser(user);
            return ResponseEntity.ok(savedUser);
        } catch (IllegalArgumentException e) {
            System.err.println("Registration Validation Failed: " + e.getMessage());
            HashMap<String, String> errorMap = new HashMap<>();
            errorMap.put("error", "Bad Request");
            errorMap.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorMap);
        } catch (Exception e) {
            System.err.println("CRITICAL REGISTRATION ERROR: " + e.getMessage());
            e.printStackTrace();
            HashMap<String, String> errorMap = new HashMap<>();
            errorMap.put("error", "Internal Server Error");
            errorMap.put("message", "Registration failed: " + e.getMessage());
            errorMap.put("cause", e.getCause() != null ? e.getCause().toString() : "Unknown");
            return ResponseEntity.status(500).body(errorMap);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        try {
            User loggedInUser = userService.login(user);
            String token = jwtUtil.generateToken(loggedInUser);
            return ResponseEntity.ok(new AuthResponse(token, loggedInUser));
        } catch (RuntimeException e) {
            HashMap<String, String> errorMap = new HashMap<>();
            errorMap.put("error", "Unauthorized");
            errorMap.put("message", e.getMessage());
            return ResponseEntity.status(401).body(errorMap);
        }
    }

    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("pong");
    }
}
