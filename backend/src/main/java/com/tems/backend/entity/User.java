package com.tems.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
// Implementing Soft Deletion so references to older financial records do not break!
@SQLDelete(sql = "UPDATE users SET is_deleted = true WHERE user_id=?")
// @Where(clause =...) is deprecated in Spring Boot 3. Use @SQLRestriction("is_deleted = false") when ready.
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer userId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false, name="password_hash")
    private String passwordHash;

    @Builder.Default
    @Column(nullable = false, length = 50)
    private String role = "USER";

    @Column(length = 20)
    private String phone;

    @Builder.Default
    @Column(nullable = false, name="is_deleted")
    private Boolean isDeleted = false;

    @Column(updatable = false, name="created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
