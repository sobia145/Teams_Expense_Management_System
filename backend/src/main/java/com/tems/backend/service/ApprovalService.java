package com.tems.backend.service;

import com.tems.backend.entity.Approval;
import com.tems.backend.entity.Expense;
import com.tems.backend.repository.ApprovalRepository;
import com.tems.backend.repository.ExpenseRepository;
import com.tems.backend.repository.HistoryLogRepository;
import com.tems.backend.entity.HistoryLog;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ApprovalService {

    private final ApprovalRepository approvalRepository;
    private final ExpenseRepository expenseRepository;
    private final HistoryLogRepository historyLogRepository;
    private final DebtService debtService;

    public List<Approval> getPendingApprovalsForUser(Integer userId) {
        // Self-Healing: Use a join query to ensure the group still exists for the related expense
        return approvalRepository.findActivePendingApprovalsByUser(userId, "PENDING");
    }

    @Transactional
    public Expense updateApprovalStatus(Integer expenseId, Integer userId, String status) {
        // Find all approvals for this expense
        List<Approval> approvals = approvalRepository.findByExpense_ExpenseId(expenseId);
        
        // Find the specific approval ticket that this user owns
        Approval targetApproval = null;
        for (Approval a : approvals) {
            if (a.getUser().getUserId().equals(userId)) {
                targetApproval = a;
                break;
            }
        }
        
        if (targetApproval == null) {
            throw new IllegalArgumentException("No approval ticket exists for this user on this expense.");
        }
        
        // Update their specific ticket
        targetApproval.setStatus(status);
        approvalRepository.save(targetApproval);

        // Core Audit: Log which specific user performed the approval/objection
        HistoryLog log = HistoryLog.builder()
            .entityType("APPROVAL")
            .entityId(expenseId)
            .action(status)
            .performedBy(userId)
            .performedByName(targetApproval.getUser().getName())
            .newData("User " + targetApproval.getUser().getName() + " updated approval status for expense #" + expenseId + " to " + status)
            .build();
        historyLogRepository.save(log);
        
        Expense expense = targetApproval.getExpense();

        if (status.equals("OBJECTED")) {
            // Instant failure propagation
            expense.setStatus("OBJECTED");
            return expenseRepository.save(expense);
        }

        if (status.equals("APPROVED")) {
            // Check if ALL tickets are now APPROVED
            boolean allApproved = true;
            for (Approval a : approvals) {
                // If it's the one we just updated, count it as APPROVED
                String currentStatus = a.getUser().getUserId().equals(userId) ? status : a.getStatus();
                if (!currentStatus.equals("APPROVED")) {
                    allApproved = false;
                    break;
                }
            }
            if (allApproved) {
                expense.setStatus("APPROVED");
                Expense saved = expenseRepository.save(expense);
                debtService.processApprovedExpense(saved);
                return saved;
            }
        }

        return expense;
    }
}
