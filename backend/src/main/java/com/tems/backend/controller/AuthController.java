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
            
            // EXPLICIT ATTRIBUTE INITIALIZATION: Ensuring mandatory fields are set
            user.setIsDeleted(false);
            user.setRole("USER");
            user.setCreatedAt(java.time.LocalDateTime.now());
            
            User savedUser = userService.createUser(user);
            return ResponseEntity.ok(savedUser);
        } catch (IllegalArgumentException e) {
            System.err.println("Registration Validation Failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(new HashMap<String, String>() {{
                put("error", "Bad Request");
                put("message", e.getMessage());
            }});
        } catch (Exception e) {
            System.err.println("CRITICAL REGISTRATION ERROR: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(new HashMap<String, String>() {{
                put("error", "Internal Server Error");
                put("message", "Registration failed: " + e.getMessage());
                put("cause", e.getCause() != null ? e.getCause().toString() : "Unknown");
            }});
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        try {
            User loggedInUser = userService.login(user);
            String token = jwtUtil.generateToken(loggedInUser);
            return ResponseEntity.ok(new AuthResponse(token, loggedInUser));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(new HashMap<String, String>() {{
                put("error", "Unauthorized");
                put("message", e.getMessage());
            }});
        }
    }

    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("pong");
    }
}
