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
    public void processApprovedExpense(Expense expense) {
        List<ExpenseSplit> splits = splitRepository.findByExpense_ExpenseId(expense.getExpenseId());
        User paidBy = expense.getPaidBy();
        Group group = expense.getGroup();

        for (ExpenseSplit split : splits) {
            User participant = split.getUser();
            
            // The person who paid doesn't owe themselves
            if (participant.getUserId().equals(paidBy.getUserId())) {
                continue;
            }

            BigDecimal share = split.getAmountOwed();

            // Net Balance Rule: Check if the creditor (paidBy) already owes the debtor (participant)
            Optional<Debt> existingReverseDebtOpt = debtRepository.findByGroupAndDebtorAndCreditor(group, paidBy, participant);

            if (existingReverseDebtOpt.isEmpty()) {
                // Case 1: No reverse debt exists. Check if a normal debt already exists to accumulate.
                Optional<Debt> existingNormalDebtOpt = debtRepository.findByGroupAndDebtorAndCreditor(group, participant, paidBy);
                if (existingNormalDebtOpt.isPresent()) {
                    Debt normalDebt = existingNormalDebtOpt.get();
                    normalDebt.setAmount(normalDebt.getAmount().add(share));
                    debtRepository.save(normalDebt);
                } else {
                    Debt newDebt = Debt.builder()
                            .group(group)
                            .debtor(participant)
                            .creditor(paidBy)
                            .amount(share)
                            .build();
                    debtRepository.save(newDebt);
                }
            } else {
                // Case 2: Reverse debt exists (paidBy owes participant)
                Debt reverseDebt = existingReverseDebtOpt.get();
                BigDecimal existingReverseAmount = reverseDebt.getAmount();
                BigDecimal net = share.subtract(existingReverseAmount);

                if (net.compareTo(BigDecimal.ZERO) > 0) {
                    // net > 0: participant now owes paidBy the remainder
                    debtRepository.delete(reverseDebt);
                    Debt newDebt = Debt.builder()
                            .group(group)
                            .debtor(participant)
                            .creditor(paidBy)
                            .amount(net)
                            .build();
                    debtRepository.save(newDebt);
                } else if (net.compareTo(BigDecimal.ZERO) < 0) {
                    // net < 0: paidBy still owes participant, but less
                    reverseDebt.setAmount(net.abs());
                    debtRepository.save(reverseDebt);
                } else {
                    // net == 0: Perfect balance!
                    debtRepository.delete(reverseDebt);
                }
            }
        }
    }
}
