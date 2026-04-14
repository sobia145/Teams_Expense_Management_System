package com.tems.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="approvals")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Approval { 
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) 
    private Integer approvalId; 
    
    @ManyToOne @JoinColumn(name="expense_id") 
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Expense expense; 
    
    @ManyToOne @JoinColumn(name="user_id") 
    private User user; 
    
    private String status; 
    
    @Column(length = 255)
    private String reason; // The 'why' behind an objection or approval
}
