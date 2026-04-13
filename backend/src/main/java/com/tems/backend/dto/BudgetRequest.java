package com.tems.backend.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class BudgetRequest {
    private Integer groupId;
    private Integer categoryId;
    private String category;
    private String customCategory;
    private BigDecimal limitAmount;
}
