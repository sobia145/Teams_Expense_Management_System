package com.tems.backend.service;

import com.tems.backend.dto.SettlementTransactionDTO;
import com.tems.backend.entity.Expense;
import com.tems.backend.entity.ExpenseSplit;
import com.tems.backend.entity.User;
import com.tems.backend.repository.ExpenseRepository;
import com.tems.backend.repository.ExpenseSplitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SettlementService {

    private final ExpenseRepository expenseRepository;
    private final ExpenseSplitRepository splitRepository;

    public List<SettlementTransactionDTO> calculateSettlements(Integer groupId) {
        // 1. Get all approved expenses for the group
        List<Expense> approvedExpenses = expenseRepository.findByGroup_GroupIdAndStatus(groupId, "APPROVED");
        
        // 2. Map for net balances per User ID
        Map<Integer, BigDecimal> netBalances = new HashMap<>();
        Map<Integer, String> userNames = new HashMap<>();

        for (Expense expense : approvedExpenses) {
            Integer payerId = expense.getPaidBy().getUserId();
            userNames.put(payerId, expense.getPaidBy().getName());
            
            // Add to payer's credit
            netBalances.put(payerId, netBalances.getOrDefault(payerId, BigDecimal.ZERO).add(expense.getTotalAmount()));

            // Subtract from each person's debt in the splits
            List<ExpenseSplit> splits = splitRepository.findByExpense_ExpenseId(expense.getExpenseId());
            for (ExpenseSplit split : splits) {
                Integer debtorId = split.getUser().getUserId();
                userNames.put(debtorId, split.getUser().getName());
                netBalances.put(debtorId, netBalances.getOrDefault(debtorId, BigDecimal.ZERO).subtract(split.getAmountOwed()));
            }
        }

        // 3. Separate Debtors and Creditors
        List<UserBalance> debtors = new ArrayList<>();
        List<UserBalance> creditors = new ArrayList<>();

        for (Map.Entry<Integer, BigDecimal> entry : netBalances.entrySet()) {
            BigDecimal balance = entry.getValue();
            if (balance.compareTo(BigDecimal.ZERO) < 0) {
                debtors.add(new UserBalance(entry.getKey(), userNames.get(entry.getKey()), balance.abs()));
            } else if (balance.compareTo(BigDecimal.ZERO) > 0) {
                creditors.add(new UserBalance(entry.getKey(), userNames.get(entry.getKey()), balance));
            }
        }

        // 4. Greedy Optimization Algorithm (Min Cash Flow)
        List<SettlementTransactionDTO> transactions = new ArrayList<>();
        int d = 0, c = 0;
        
        while (d < debtors.size() && c < creditors.size()) {
            UserBalance debtor = debtors.get(d);
            UserBalance creditor = creditors.get(c);

            BigDecimal transferAmount = debtor.amount.min(creditor.amount);

            if (transferAmount.compareTo(BigDecimal.ZERO) > 0) {
                transactions.add(SettlementTransactionDTO.builder()
                        .fromUserId(debtor.userId)
                        .fromUserName(debtor.userName)
                        .toUserId(creditor.userId)
                        .toUserName(creditor.userName)
                        .amount(transferAmount)
                        .build());
            }

            debtor.amount = debtor.amount.subtract(transferAmount);
            creditor.amount = creditor.amount.subtract(transferAmount);

            if (debtor.amount.compareTo(BigDecimal.ZERO) == 0) d++;
            if (creditor.amount.compareTo(BigDecimal.ZERO) == 0) c++;
        }

        return transactions;
    }

    @RequiredArgsConstructor
    private static class UserBalance {
        final Integer userId;
        final String userName;
        BigDecimal amount;

        UserBalance(Integer userId, String userName, BigDecimal amount) {
            this.userId = userId;
            this.userName = userName;
            this.amount = amount;
        }
    }
}
