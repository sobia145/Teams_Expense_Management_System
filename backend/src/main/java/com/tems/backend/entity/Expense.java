package com.tems.backend.entity;

import org.hibernate.annotations.CreationTimestamp;
import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonFormat;
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

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate expenseDate; 

    private String status; 
    
    private String category;

    @Column(name="custom_category")
    private String customCategory;
    
    @Builder.Default
    @Column(name="is_deleted")
    private Boolean isDeleted = false;
    
    @CreationTimestamp
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Column(name="created_at") 
    private LocalDateTime createdAt; 

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Column(name="objection_deadline")
    private LocalDateTime objectionDeadline;

    @OneToMany(mappedBy = "expense", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @Builder.Default
    private java.util.List<Approval> approvals = new java.util.ArrayList<>();
}
