package com.tems.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import java.time.LocalDateTime;

@Entity
@Table(name = "`groups`") // Enclosed in backticks because groups is a reserved keyword in SQL
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE `groups` SET is_deleted = true WHERE group_id=?")
// @Where(clause =...) is deprecated in Spring Boot 3. Use @SQLRestriction("is_deleted = false") when ready.
public class Group {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer groupId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "created_by", nullable = true)
    private User createdBy;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 10, nullable = false)
    private String currency = "INR";

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
