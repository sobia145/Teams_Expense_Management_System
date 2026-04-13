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

    // GET http://localhost:8080/api/users/all
    @GetMapping("/all")
    public ResponseEntity<java.util.List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
}
