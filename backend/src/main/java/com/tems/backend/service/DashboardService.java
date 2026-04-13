package com.tems.backend.service;

import com.tems.backend.dto.DashboardStatsDTO;
import com.tems.backend.repository.ApprovalRepository;
import com.tems.backend.repository.DebtRepository;
import com.tems.backend.repository.ExpenseRepository;
import com.tems.backend.repository.GroupMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ExpenseRepository expenseRepository;
    private final ApprovalRepository approvalRepository;
    private final DebtRepository debtRepository;
    private final GroupMemberRepository groupMemberRepository;

    public DashboardStatsDTO getUserDashboardStats(Integer userId) {
        BigDecimal approvedSpend = expenseRepository.sumApprovedAmountForUserGroups(userId);
        if (approvedSpend == null) {
            approvedSpend = BigDecimal.ZERO;
        }

        long pendingApprovals = approvalRepository.countByUser_UserIdAndStatus(userId, "PENDING");
        long pendingPayments = debtRepository.countByDebtor_UserId(userId);
        long totalGroups = groupMemberRepository.countByUser_UserId(userId);

        return DashboardStatsDTO.builder()
                .approvedSpend(approvedSpend)
                .pendingApprovalsCount(pendingApprovals)
                .pendingPaymentsCount(pendingPayments)
                .totalGroupsCount(totalGroups)
                .build();
    }
}
