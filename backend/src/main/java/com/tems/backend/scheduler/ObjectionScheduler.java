package com.tems.backend.scheduler;

import com.tems.backend.entity.Expense;
import com.tems.backend.entity.HistoryLog;
import com.tems.backend.repository.ExpenseRepository;
import com.tems.backend.repository.HistoryLogRepository;
import com.tems.backend.service.DebtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ObjectionScheduler {

    private final ExpenseRepository expenseRepository;
    private final DebtService debtService;
    private final HistoryLogRepository historyLogRepository;

    /**
     * Heartbeat of the Objection Window system.
     * Every hour, it scans for expenses that have passed their 24h window without objection.
     * Auto-approves them and triggers the debt calculation engine.
     */
    @Scheduled(fixedRate = 3600000) // Runs every hour (3,600,000 ms)
    @Transactional
    public void processExpiredObjectionWindows() {
        LocalDateTime now = LocalDateTime.now();
        log.info("Starting auto-approval sweep at {}", now);

        List<Expense> expiredExpenses = expenseRepository.findExpiredPendingExpenses(now);
        
        if (expiredExpenses.isEmpty()) {
            return;
        }

        log.info("Found {} expenses ready for auto-approval.", expiredExpenses.size());

        for (Expense expense : expiredExpenses) {
            try {
                // Final check: Status is still PENDING (safety first)
                if (!"PENDING".equals(expense.getStatus())) continue;

                // 1. Auto-Approve the expense
                expense.setStatus("APPROVED");
                expenseRepository.save(expense);

                // 2. Trigger Debt Engine
                debtService.updateDebtsFromExpense(expense);

                // 3. Log to Audit Trail
                HistoryLog autoLog = HistoryLog.builder()
                        .entityType("ACTIVITY")
                        .entityId(expense.getExpenseId())
                        .action("AUTO_APPROVED")
                        .performedByName("TEMS System")
                        .newData(String.format("Expense '%s' (₹%s) auto-approved after 24h objection window expired.", 
                                expense.getTitle(), expense.getTotalAmount()))
                        .groupId(expense.getGroup().getGroupId())
                        .groupName(expense.getGroup().getName())
                        .build();
                historyLogRepository.save(autoLog);

                log.info("Successfully auto-approved expense #{}: {}", expense.getExpenseId(), expense.getTitle());

            } catch (Exception e) {
                log.error("Failed to auto-approve expense #{}: {}", expense.getExpenseId(), e.getMessage());
                // Continue to next expense to avoid blocking the whole batch
            }
        }
    }
}
