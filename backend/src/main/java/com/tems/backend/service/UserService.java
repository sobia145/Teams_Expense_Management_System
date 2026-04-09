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

    @Transactional
    public User createUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("Cannot create: A user with this email already exists!");
        }
        return userRepository.save(user);
    }

    // New Global Sync for Frontend UI Lookups
    @Transactional(readOnly = true)
    public java.util.List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // New Login Engine!
    @Transactional(readOnly = true)
    public User login(User loginAttempt) {
        // Find User by email
        User existingUser = userRepository.findByEmail(loginAttempt.getEmail())
                .orElseThrow(() -> new RuntimeException("ERROR: User not found in database."));
        
        // Simple string equivalence check (Will be upgraded to PasswordEncoder matches later)
        if (!existingUser.getPasswordHash().equals(loginAttempt.getPasswordHash())) {
            throw new RuntimeException("ERROR: Invalid Credentials.");
        }
        
        return existingUser;
    }
}
