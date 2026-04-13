package com.tems.backend.service;

import com.tems.backend.entity.User;
import com.tems.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Transactional
    public User createUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("Cannot create: A user with this email already exists!");
        }

        // SECURITY CHECK: Minimum 6 characters for local passwords
        if (user.getPasswordHash() != null && user.getPasswordHash().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters long.");
        }

        // DATABASE INTEGRITY: Ensure mandatory defaults are set explicitly
        user.setIsDeleted(false);
        if (user.getRole() == null || user.getRole().trim().isEmpty()) {
            user.setRole("USER");
        }
        
        // HASHING MASTER: Encrypting password before saving to DB
        if (user.getPasswordHash() != null) {
            user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
        }
        
        return userRepository.save(user);
    }

    // New Global Sync for Frontend UI Lookups
    @Transactional(readOnly = true)
    public java.util.List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public User processSocialLogin(String email, String name) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = User.builder()
                    .email(email)
                    .name(name)
                    .role("USER")
                    .isDeleted(false)
                    .build();
            return userRepository.save(newUser);
        });
    }

    // New Login Engine!
    @Transactional(readOnly = true)
    public User login(User loginAttempt) {
        // Find User by email
        User existingUser = userRepository.findByEmail(loginAttempt.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid Credentials: User does not exist."));
        
        // BCRYPT VERIFICATION: Securely matching hashed passwords
        if (!passwordEncoder.matches(loginAttempt.getPasswordHash(), existingUser.getPasswordHash())) {
            throw new RuntimeException("Invalid Credentials: Password or Email is incorrect.");
        }
        
        return existingUser;
    }
}
