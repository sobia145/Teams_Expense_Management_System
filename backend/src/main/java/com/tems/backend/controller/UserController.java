package com.tems.backend.controller;

import com.tems.backend.entity.User;
import com.tems.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.tems.backend.config.JwtUtil;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    // POST http://localhost:8080/api/users/register
    @PostMapping("/register")
    public ResponseEntity<User> registerUser(@RequestBody User user) {
        User savedUser = userService.createUser(user);
        return ResponseEntity.ok(savedUser);
    }

    // GET http://localhost:8080/api/users/all
    @GetMapping("/all")
    public ResponseEntity<java.util.List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // POST http://localhost:8080/api/users/login
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User user) {
        try {
            User loggedInUser = userService.login(user);
            String token = jwtUtil.generateToken(loggedInUser);
            return ResponseEntity.ok(new com.tems.backend.dto.AuthResponse(token, loggedInUser));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(new java.util.HashMap<String, String>() {{
                put("error", "Unauthorized");
                put("message", e.getMessage());
            }});
        }
    }
}
