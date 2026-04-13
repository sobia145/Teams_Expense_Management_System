package com.tems.backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@Data
public class ExpenseRequest {
    private Integer groupId;
    private Integer paidBy;
    private Integer categoryId;
    private String category;
    private String customCategory;
    private String title;
    private BigDecimal totalAmount;
    private LocalDate expenseDate;
    
    // Maps each User ID to the exact decimal amount they owe for this expense!
    private Map<Integer, BigDecimal> splits; 
}
