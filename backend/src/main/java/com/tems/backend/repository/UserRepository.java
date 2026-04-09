package com.tems.backend.repository;

import com.tems.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    
    // Auto-generated JPA method to detect duplicates natively
    boolean existsByEmail(String email);

    // Mandated by mentor for Login Auth
    Optional<User> findByEmail(String email);
}
