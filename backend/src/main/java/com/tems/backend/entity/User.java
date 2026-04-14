package com.tems.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
// Implementing Soft Deletion so references to older financial records do not break!
@SQLDelete(sql = "UPDATE users SET is_deleted = true WHERE user_id=?")
// @Where(clause =...) is deprecated in Spring Boot 3. Use @SQLRestriction("is_deleted = false") when ready.
public class User implements UserDetails {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer userId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = true, name="password_hash")
    private String passwordHash;

    @Builder.Default
    @Column(nullable = false, length = 50)
    private String role = "USER";
    
    // Explicit Database Safety Null-Bypass for the Admin UI layout rendering
    public String getRole() {
        return role != null && !role.trim().isEmpty() ? role : "USER";
    }

    @Builder.Default
    @Column(length = 20)
    private String phone = "";

    @Builder.Default
    @Column(nullable = false, name="is_deleted")
    private Boolean isDeleted = false;

    @Builder.Default
    @Column(updatable = false, name="created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @JsonIgnore
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        String effectiveRole = getRole();
        // Switching to literal authority to avoid ROLE_ prefix mismatch bugs
        return List.of(new SimpleGrantedAuthority(effectiveRole));
    }

    @JsonIgnore
    @Override
    public String getPassword() {
        return passwordHash;
    }

    @JsonIgnore
    @Override
    public String getUsername() {
        return email;
    }

    @JsonIgnore
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @JsonIgnore
    @Override
    public boolean isAccountNonLocked() {
        // Strict null safety for unboxing: Boolean.TRUE.equals or Boolean.FALSE.equals
        return !Boolean.TRUE.equals(isDeleted);
    }

    @JsonIgnore
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @JsonIgnore
    @Override
    public boolean isEnabled() {
        return !Boolean.TRUE.equals(isDeleted);
    }
}
