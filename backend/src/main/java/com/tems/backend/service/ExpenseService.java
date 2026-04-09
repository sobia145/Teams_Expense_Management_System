package com.tems.backend.service;

import com.tems.backend.entity.*;
import com.tems.backend.repository.*;
import com.tems.backend.dto.ExpenseRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.Map;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    // These repositories would be auto-wired Spring Data interfaces
    private final ExpenseRepository expenseRepository;
    private final ExpenseSplitRepository splitRepository;
    private final ApprovalRepository approvalRepository;
    private final GroupRepository groupRepository;
    private final UserRepository userRepository;
    private final HistoryLogRepository historyLogRepository;
    private final BudgetRepository budgetRepository;
    
    public List<Expense> getExpensesForUser(Integer userId) {
        return expenseRepository.findExpensesForUser(userId);
    }
    
    public List<Expense> getAllExpenses() {
        return expenseRepository.findAll();
    }

    @Transactional
    public Expense addExpense(ExpenseRequest request) {
        
        // STEP 1: VALIDATE MATH (Prevents fraud calculations)
        BigDecimal totalSplits = request.getSplits().values().stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        if (totalSplits.compareTo(request.getTotalAmount()) != 0) {
            throw new IllegalArgumentException("CRITICAL ERROR: Splits sum does not match Total Amount!");
        }

        Group group = groupRepository.findById(request.getGroupId()).orElseThrow();
        User payer = userRepository.findById(request.getPaidBy()).orElseThrow();

        // STEP 2: SAVE MAIN EXPENSE (Mandate Status = PENDING)
        Expense newExpense = Expense.builder()
                .group(group)
                .paidBy(payer)
                .title(request.getTitle())
                .totalAmount(request.getTotalAmount())
                .expenseDate(request.getExpenseDate())
                .status("PENDING")
                .build();
        
        Expense savedExpense = expenseRepository.save(newExpense);

        // STEP 3 & 4: INSERT SPLITS & TRIGGER OBJECTIONS
        for (Map.Entry<Integer, BigDecimal> entry : request.getSplits().entrySet()) {
            User splitUser = userRepository.findById(entry.getKey()).orElseThrow();
            
            // Write to Expense_Splits table
            ExpenseSplit split = ExpenseSplit.builder()
                .expense(savedExpense)
                .user(splitUser)
                .amountOwed(entry.getValue())
                .build();
            splitRepository.save(split);

            // Trigger PENDING approval ticket for everyone EXCEPT the person who paid
            if (!splitUser.getUserId().equals(payer.getUserId())) {
                Approval approval = Approval.builder()
                    .expense(savedExpense)
                    .user(splitUser)
                    .status("PENDING")
                    .build();
                approvalRepository.save(approval);
            }
        }

        // STEP 5: (Group-Isolated Budget Verification Trigger)
        BigDecimal currentGroupTotal = expenseRepository.sumTotalAmountByGroupId(request.getGroupId());
        if (currentGroupTotal == null) currentGroupTotal = BigDecimal.ZERO;
        
        BigDecimal projectedGroupTotal = currentGroupTotal.add(request.getTotalAmount());
        
        budgetRepository.findByGroup_GroupId(request.getGroupId()).forEach(budget -> {
            if(projectedGroupTotal.compareTo(budget.getLimitAmount()) > 0) {
                System.out.println("⚠️ BUDGET ALERT: Group " + group.getName() + " exceeded limit by Rs. " + projectedGroupTotal.subtract(budget.getLimitAmount()));
                // TODO: Store this alert precisely into the `budget_alerts` MySQL table!
            }
        });

        // STEP 6: IMMUTABLE AUDIT LOG
        HistoryLog log = HistoryLog.builder()
            .entityType("EXPENSE")
            .entityId(savedExpense.getExpenseId())
            .action("CREATED")
            .performedBy(payer.getUserId())
            .newData("{\"title\":\"" + savedExpense.getTitle() + "\", \"amount\":" + savedExpense.getTotalAmount() + "}")
            .build();
        historyLogRepository.save(log);

        return savedExpense;
    }
}
