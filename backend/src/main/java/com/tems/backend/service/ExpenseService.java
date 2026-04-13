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
    private final BudgetAlertRepository budgetAlertRepository;
    private final GroupMemberRepository groupMemberRepository;
    
    public List<Expense> getExpensesForUser(Integer userId) {
        return expenseRepository.findExpensesForUser(userId);
    }
    
    public List<Expense> getAllExpenses() {
        return expenseRepository.findAll();
    }

    public List<Expense> getExpensesForGroup(Integer groupId) {
        return expenseRepository.findByGroup_GroupId(groupId);
    }

    @Transactional
    public Expense addExpense(ExpenseRequest request) {
        System.out.println("DEBUG: Category received in Service -> " + request.getCategory());
        
        // STEP 0: SECURITY LOCKDOWN - VERIFY MEMBERSHIP
        if (!groupMemberRepository.existsByGroup_GroupIdAndUser_UserId(request.getGroupId(), request.getPaidBy())) {
            throw new IllegalStateException("SECURITY ALERT: Access Denied. User " + request.getPaidBy() + " is not an authorized member of group " + request.getGroupId());
        }

        // STEP 1: VALIDATE MATH (Prevents fraud calculations)
        BigDecimal totalSplits = request.getSplits().values().stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        if (totalSplits.compareTo(request.getTotalAmount()) != 0) {
            throw new IllegalArgumentException("CRITICAL ERROR: Splits sum does not match Total Amount!");
        }

        Group group = groupRepository.findById(request.getGroupId()).orElseThrow();
        
        if (Boolean.TRUE.equals(group.getIsLocked())) {
            throw new IllegalStateException("CONFLICT: This group is locked. No further expenses can be added.");
        }

        User payer = userRepository.findById(request.getPaidBy()).orElseThrow();

        // Fix 3: Backend Enforcement - Ensure authenticated user matches the payer
        Object principal = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof User) {
            User authUser = (User) principal;
            if (!authUser.getUserId().equals(payer.getUserId())) {
                throw new IllegalStateException("CONFLICT: You can only add expenses that YOU paid for.");
            }
        }

        // STEP 2: SAVE MAIN EXPENSE (Mandate Status = PENDING)
        Expense newExpense = Expense.builder()
                .group(group)
                .paidBy(payer)
                .categoryId(request.getCategoryId())
                .category(request.getCategory())
                .customCategory(request.getCustomCategory())
                .title(request.getTitle())
                .totalAmount(request.getTotalAmount())
                .expenseDate(request.getExpenseDate())
                .createdAt(java.time.LocalDateTime.now())
                .objectionDeadline(java.time.LocalDateTime.now().plusHours(24))
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

        // STEP 5: (Category-specific Budget Verification Trigger)
        budgetRepository.findByGroup_GroupId(request.getGroupId()).forEach(budget -> {
            boolean isMatch = false;
            BigDecimal currentCategoryTotal = BigDecimal.ZERO;

            if (budget.getCategoryId() != null && budget.getCategoryId().equals(request.getCategoryId())) {
                if (budget.getCategoryId() == 6) { // "Other"
                    if (budget.getCustomCategory() != null && budget.getCustomCategory().equalsIgnoreCase(request.getCustomCategory())) {
                        isMatch = true;
                        currentCategoryTotal = expenseRepository.sumTotalAmountByGroupIdAndCustomCategory(request.getGroupId(), request.getCustomCategory());
                    }
                } else {
                    isMatch = true;
                    currentCategoryTotal = expenseRepository.sumTotalAmountByGroupIdAndCategoryId(request.getGroupId(), request.getCategoryId());
                }
            }

            if (isMatch && currentCategoryTotal != null) {
                BigDecimal limit = budget.getLimitAmount();
                BigDecimal eightyPercent = limit.multiply(new BigDecimal("0.8"));
                
                // Check for 100% Exceeded
                if (currentCategoryTotal.compareTo(limit) > 0) {
                     BudgetAlert alert = BudgetAlert.builder()
                        .group(group)
                        .categoryId(budget.getCategoryId())
                        .customCategory(budget.getCustomCategory())
                        .exceededAmount(currentCategoryTotal.subtract(limit))
                        .thresholdType(100)
                        .build();
                    budgetAlertRepository.save(alert);
                    System.out.println("🚨 BUDGET CRITICAL: Category " + (budget.getCustomCategory() != null ? budget.getCustomCategory() : budget.getCategoryId()) + " exceeded limit!");
                    
                    // Fix 4: Log budget violation to HISTORY_LOG
                    HistoryLog budgetViolationLog = HistoryLog.builder()
                        .entityType("BUDGET_ALERT")
                        .groupId(request.getGroupId())
                        .groupName(group.getName())
                        .action("EXCEEDED")
                        .performedBy(payer.getUserId())
                        .performedByName(payer.getName())
                        .entityId(alert.getAlertId())
                        .newData("Category " + (budget.getCustomCategory() != null ? budget.getCustomCategory() : budget.getCategoryId()) + " exceeded by " + currentCategoryTotal.subtract(limit))
                        .build();
                    historyLogRepository.save(budgetViolationLog);
                } 
                // Check for 80% Warning
                else if (currentCategoryTotal.compareTo(eightyPercent) >= 0) {
                    BudgetAlert alert = BudgetAlert.builder()
                        .group(group)
                        .categoryId(budget.getCategoryId())
                        .customCategory(budget.getCustomCategory())
                        .exceededAmount(BigDecimal.ZERO)
                        .thresholdType(80)
                        .build();
                    budgetAlertRepository.save(alert);
                    System.out.println("⚠️ BUDGET WARNING: Category " + (budget.getCustomCategory() != null ? budget.getCustomCategory() : budget.getCategoryId()) + " reached 80% threshold.");
                }
            }
        });

        // STEP 6: IMMUTABLE AUDIT LOG
        HistoryLog log = HistoryLog.builder()
            .entityType("EXPENSE")
            .entityId(savedExpense.getExpenseId())
            .groupId(request.getGroupId())
            .groupName(group.getName())
            .action("CREATED")
            .performedBy(payer.getUserId())
            .performedByName(payer.getName())
            .newData("{\"title\":\"" + savedExpense.getTitle() + "\", \"amount\":" + savedExpense.getTotalAmount() + "}")
            .build();
        historyLogRepository.save(log);

        return savedExpense;
    }

    @Transactional
    public void deleteExpense(Integer expenseId) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new IllegalArgumentException("Expense not found with ID: " + expenseId));

        // Security Check: Only the payer can delete
        Object principal = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof User) {
            User authUser = (User) principal;
            if (!authUser.getUserId().equals(expense.getPaidBy().getUserId())) {
                throw new IllegalStateException("CONFLICT: Only the person who paid for this expense can delete it.");
            }
        }

        // STEP 1: Audit Log before deletion (while we still have data)
        HistoryLog log = HistoryLog.builder()
            .entityType("EXPENSE")
            .entityId(expenseId)
            .groupId(expense.getGroup().getGroupId())
            .groupName(expense.getGroup().getName())
            .action("DELETED")
            .performedBy(expense.getPaidBy().getUserId())
            .performedByName(expense.getPaidBy().getName())
            .newData("{\"title\":\"" + expense.getTitle() + "\", \"amount\":" + expense.getTotalAmount() + "}")
            .build();
        historyLogRepository.save(log);

        // STEP 2: Cascade Cleanup
        approvalRepository.deleteByExpense(expense);
        splitRepository.deleteByExpense(expense);

        // STEP 3: Final Removal
        expenseRepository.delete(expense);
    }

    public BigDecimal getCategorySpend(Integer groupId, Integer categoryId, String category, String customCategory) {
        if (categoryId != null && categoryId == 6 && (customCategory != null && !customCategory.isBlank())) {
            BigDecimal res = expenseRepository.sumApprovedByGroupAndCustomCategory(groupId, customCategory);
            return res != null ? res : BigDecimal.ZERO;
        } else if (category != null && !category.isBlank()) {
            BigDecimal res = expenseRepository.sumApprovedByGroupAndCategoryName(groupId, category);
            return res != null ? res : BigDecimal.ZERO;
        } else if (categoryId != null) {
            BigDecimal res = expenseRepository.sumApprovedByGroupAndCategory(groupId, categoryId);
            return res != null ? res : BigDecimal.ZERO;
        }
        return BigDecimal.ZERO;
    }

    public List<java.util.Map<String, Object>> getGroupSpendingByCategory(Integer groupId) {
        List<Object[]> results = expenseRepository.findGroupSpendingByCategory(groupId);
        return mapToAnalyticsData(results);
    }

    public List<java.util.Map<String, Object>> getMySpendingByCategory(Integer groupId, Integer userId) {
        List<Object[]> results = expenseRepository.findMySpendingByCategory(groupId, userId);
        return mapToAnalyticsData(results);
    }

    public List<java.util.Map<String, Object>> getMyShareByCategory(Integer groupId, Integer userId) {
        List<Object[]> results = expenseRepository.findMyShareByCategory(groupId, userId);
        return mapToAnalyticsData(results);
    }

    private List<java.util.Map<String, Object>> mapToAnalyticsData(List<Object[]> results) {
        List<java.util.Map<String, Object>> dataList = new java.util.ArrayList<>();
        for (Object[] row : results) {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("category", row[0] != null ? row[0].toString() : "General");
            map.put("value", row[1] != null ? (BigDecimal) row[1] : BigDecimal.ZERO);
            dataList.add(map);
        }
        return dataList;
    }
}
