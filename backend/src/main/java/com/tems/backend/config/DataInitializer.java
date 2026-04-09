package com.tems.backend.config;

import com.tems.backend.entity.User;
import com.tems.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        // Bootstrapping the Admin so you don't have to use Postman manually
        if (!userRepository.existsByEmail("admin@tems.com")) {
            User adminUser = User.builder()
                .name("Sobia Admin")
                .email("admin@tems.com")
                .passwordHash("password123")
                .role("ADMIN")
                .build();
            userRepository.save(adminUser);
            System.out.println("\n🔥 SYSTEM BOOTSTRAP: Master Admin successfully injected -> admin@tems.com\n");
        }
        
        // Ensure User Test accounts exist as well
        if (!userRepository.existsByEmail("user@tems.com")) {
            userRepository.save(User.builder()
                    .name("Nikitha User")
                    .email("user@tems.com")
                    .passwordHash("password123")
                    .role("USER")
                    .build());
        }

        if (!userRepository.existsByEmail("alice@tems.com")) {
            userRepository.save(User.builder()
                    .name("Alice Anderson")
                    .email("alice@tems.com")
                    .passwordHash("password123")
                    .role("USER")
                    .build());
        }

        if (!userRepository.existsByEmail("bob@tems.com")) {
            userRepository.save(User.builder()
                    .name("Bob Builder")
                    .email("bob@tems.com")
                    .passwordHash("password123")
                    .role("USER")
                    .build());
        }
        
        if (!userRepository.existsByEmail("nikhil@tems.com")) {
            userRepository.save(User.builder()
                    .name("Nikhil Developer")
                    .email("nikhil@tems.com")
                    .passwordHash("password123")
                    .role("USER")
                    .build());
        }
    }
}
