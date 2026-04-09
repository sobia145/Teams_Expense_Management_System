package com.tems.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name="expense_splits")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseSplit { 
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) 
    private Integer splitId; 
    
    @ManyToOne @JoinColumn(name="expense_id") 
    private Expense expense; 
    
    @ManyToOne @JoinColumn(name="user_id") 
    private User user; 
    
    private BigDecimal amountOwed; 
}
