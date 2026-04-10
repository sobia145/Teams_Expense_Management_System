package com.tems.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name="budget_alerts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetAlert {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Integer alertId;
    
    @ManyToOne @JoinColumn(name="group_id")
    private Group group;
    
    @Column(name="category_id")
    private Integer categoryId;
    
    private BigDecimal exceededAmount;
    
    @Column(name="created_at", updatable=false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
