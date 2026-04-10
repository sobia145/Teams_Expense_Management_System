package com.tems.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name="expenses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Expense { 
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) 
    private Integer expenseId; 
    
    @ManyToOne @JoinColumn(name="group_id") 
    private Group group; 
    
    @ManyToOne @JoinColumn(name="paid_by") 
    private User paidBy; 
    
    private String title; 
    
    @Column(name="category_id")
    private Integer categoryId;
    
    private BigDecimal totalAmount; 
    private LocalDate expenseDate; 
    private String status; 
    
    @Builder.Default
    @Column(name="is_deleted")
    private Boolean isDeleted = false;
    
    @Column(name="created_at") 
    private LocalDateTime createdAt; 
}
