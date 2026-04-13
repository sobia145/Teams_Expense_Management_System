package com.tems.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class DashboardStatsDTO {
    private BigDecimal approvedSpend;
    private long pendingApprovalsCount;
    private long pendingPaymentsCount;
    private long totalGroupsCount;
}
