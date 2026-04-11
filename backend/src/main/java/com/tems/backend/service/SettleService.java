package com.tems.backend.service;

import com.tems.backend.dto.SettleRequest;
import com.tems.backend.entity.*;
import com.tems.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class SettleService {

    private final DebtRepository debtRepository;
    private final TransactionRepository transactionRepository;
    private final HistoryLogRepository historyLogRepository;
    private final GroupRepository groupRepository;
    private final UserRepository userRepository;

    @Transactional
    public void settlePayment(SettleRequest request) {
        Group group = groupRepository.findById(request.getGroupId()).orElseThrow();
        User fromUser = userRepository.findById(request.getFromUserId()).orElseThrow();
        User toUser = userRepository.findById(request.getToUserId()).orElseThrow();
        BigDecimal amount = request.getAmount();

        // 1. One-click Toggle: Remove the debt entirely from the live ledger
        Debt activeDebt = debtRepository.findByGroupAndDebtorAndCreditor(group, fromUser, toUser)
                .orElseThrow(() -> new IllegalArgumentException("No active debt found between these users in this group."));
        debtRepository.delete(activeDebt);

        // 2. Insert into TRANSACTIONS table
        Transaction tx = Transaction.builder()
                .group(group)
                .fromUser(fromUser)
                .toUser(toUser)
                .amount(amount)
                .build();
        transactionRepository.save(tx);

        // 3. Persistent Audit: Log history in the specific readable format for all group members
        HistoryLog log = HistoryLog.builder()
                .entityType("TRANSACTION")
                .entityId(tx.getTransactionId())
                .action("SETTLEMENT")
                .performedBy(fromUser.getUserId())
                .performedByName(fromUser.getName())
                .newData(fromUser.getName() + " paid ₹" + amount + " to " + toUser.getName())
                .groupId(group.getGroupId())
                .build();
        historyLogRepository.save(log);
    }
}
