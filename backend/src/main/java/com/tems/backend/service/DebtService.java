package com.tems.backend.service;

import com.tems.backend.entity.*;
import com.tems.backend.repository.DebtRepository;
import com.tems.backend.repository.ExpenseSplitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DebtService {

    private final DebtRepository debtRepository;
    private final ExpenseSplitRepository splitRepository;

    @Transactional
    public void updateDebtsFromExpense(Expense expense) {
        System.out.println("DEBUG: updateDebtsFromExpense called for expense: " + expense.getExpenseId());
        List<ExpenseSplit> splits = splitRepository.findByExpense_ExpenseId(expense.getExpenseId());
        System.out.println("DEBUG: Found " + splits.size() + " splits");
        
        Integer creditorId = expense.getPaidBy().getUserId();
        User creditor = expense.getPaidBy();
        
        Integer groupId = expense.getGroup().getGroupId();
        Group group = expense.getGroup();
        
        for (ExpenseSplit split : splits) {
            Integer debtorId = split.getUser().getUserId();
            User debtor = split.getUser();

            // THE CORE FIX: Strict guard to prevent circular debt (Lender cannot owe themselves)
            if (debtorId == null || creditorId == null || String.valueOf(debtorId).equals(String.valueOf(creditorId))) {
                System.out.println("DEBUG: Skipping internal split for user: " + debtorId);
                continue; 
            }
            
            BigDecimal share = split.getAmountOwed();
            
            // Check if reverse debt exists (Creditor owes Debtor)
            Optional<Debt> reverseDebtOpt = debtRepository
                .findByDebtor_UserIdAndCreditor_UserIdAndGroup_GroupId(creditorId, debtorId, groupId);
            
            if (reverseDebtOpt.isPresent()) {
                Debt reverseDebt = reverseDebtOpt.get();
                BigDecimal net = share.subtract(reverseDebt.getAmount()).setScale(2, java.math.RoundingMode.HALF_UP);
                
                if (net.compareTo(BigDecimal.ZERO) > 0) {
                    // Current share is bigger than old debt: Switch direction
                    reverseDebt.setDebtor(debtor);
                    reverseDebt.setCreditor(creditor);
                    reverseDebt.setAmount(net);
                    debtRepository.save(reverseDebt);
                } else if (net.compareTo(BigDecimal.ZERO) < 0) {
                    // Old debt is bigger: Reduce the amount creditor owes
                    reverseDebt.setAmount(net.abs());
                    debtRepository.save(reverseDebt);
                } else {
                    // Perfect balance: Remove the record (Fix 2)
                    System.out.println("DEBUG: Perfect balance achieved. Deleting debt record.");
                    debtRepository.delete(reverseDebt);
                }
            } else {
                // Check if debt already exists same direction (Debtor owes Creditor)
                Optional<Debt> existingDebtOpt = debtRepository
                    .findByDebtor_UserIdAndCreditor_UserIdAndGroup_GroupId(debtorId, creditorId, groupId);
                
                if (existingDebtOpt.isPresent()) {
                    Debt existingDebt = existingDebtOpt.get();
                    existingDebt.setAmount(existingDebt.getAmount().add(share));
                    debtRepository.save(existingDebt);
                } else {
                    // Brand new debt entry
                    Debt newDebt = Debt.builder()
                        .group(group)
                        .debtor(debtor)
                        .creditor(creditor)
                        .amount(share)
                        .build();
                    debtRepository.save(newDebt);
                }
            }
        }
    }
}
