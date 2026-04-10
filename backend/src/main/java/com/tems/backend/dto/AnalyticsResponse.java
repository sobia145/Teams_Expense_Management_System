package com.tems.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsResponse {
    private long totalUsers;
    private long totalGroups;
    private BigDecimal totalExpenses;
    private Map<Integer, BigDecimal> categoryWiseSpending;
}
