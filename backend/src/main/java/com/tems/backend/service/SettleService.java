package com.tems.backend.service;

import com.tems.backend.dto.SettleRequest;
import com.tems.backend.dto.SettlementDTO;
import com.tems.backend.entity.*;
import com.tems.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SettleService {

    private final DebtRepository debtRepository;
    private final TransactionRepository transactionRepository;
    private final HistoryLogRepository historyLogRepository;
    private final GroupRepository groupRepository;
    private final UserRepository userRepository;
    private final ExpenseSplitRepository splitRepository;
    private final GroupMemberRepository groupMemberRepository;

    @jakarta.annotation.PostConstruct
    public void cleanupCircularDebts() {
        System.out.println("--- SETTLEMENT SANITATION START ---");
        try {
            List<Debt> allDebts = debtRepository.findAll();
            int removedCount = 0;
            for (Debt d : allDebts) {
                if (d.getDebtor() == null || d.getCreditor() == null) {
                    System.out.println("ALERT: Removing orphan debt with missing user associations.");
                    debtRepository.delete(d);
                    removedCount++;
                    continue;
                }
                
                if (d.getDebtor().getUserId().equals(d.getCreditor().getUserId())) {
                    System.out.println("ALERT: Removing circular debt. User " + d.getDebtor().getName() + " (ID: " + d.getDebtor().getUserId() + ") owed themselves ₹" + d.getAmount());
                    debtRepository.delete(d);
                    removedCount++;
                }
            }
            if (removedCount > 0) {
                System.out.println("SANITATION COMPLETE: Removed " + removedCount + " corrupted records.");
            } else {
                System.out.println("SANITATION COMPLETE: No circular debts found.");
            }
        } catch (Exception e) {
            System.err.println("SANITATION FAILED BUT CONTINUING: " + e.getMessage());
        }
    }

    public List<SettlementDTO> getSettlementOverview(Integer groupId) {
        // 1. Fetch live UNPAID debts (filter out zero amounts as safety Fix 2)
        List<Debt> unpaid = debtRepository.findByGroup_GroupId(groupId);
        List<SettlementDTO> overview = unpaid.stream()
                .filter(d -> d.getAmount().compareTo(new java.math.BigDecimal("0.05")) > 0)
                .map(d -> SettlementDTO.builder()
                .id(d.getDebtId())
                .groupId(groupId)
                .fromUserId(d.getDebtor().getUserId())
                .fromUserName(d.getDebtor().getName())
                .toUserId(d.getCreditor().getUserId())
                .toUserName(d.getCreditor().getName())
                .amount(d.getAmount())
                .status("UNPAID")
                .build()
        ).collect(Collectors.toList());

        // 2. Fetch historical PAID transactions
        List<Transaction> paid = transactionRepository.findByGroup_GroupIdOrderBySettledAtDesc(groupId);
        overview.addAll(paid.stream().map(t -> SettlementDTO.builder()
                .id(t.getTransactionId())
                .groupId(groupId)
                .fromUserId(t.getFromUser().getUserId())
                .fromUserName(t.getFromUser().getName())
                .toUserId(t.getToUser().getUserId())
                .toUserName(t.getToUser().getName())
                .amount(t.getAmount())
                .status("PAID")
                .settledAt(t.getSettledAt())
                .build()
        ).collect(Collectors.toList()));

        return overview;
    }

    @Transactional
    public void settlePayment(SettleRequest request) {
        // STEP 0: SECURITY LOCKDOWN - VERIFY BOTH MEMBERSHIPS
        if (!groupMemberRepository.existsByGroup_GroupIdAndUser_UserId(request.getGroupId(), request.getFromUserId())) {
            throw new IllegalStateException("SECURITY ALERT: Settle sender is not a member of this group.");
        }
        if (!groupMemberRepository.existsByGroup_GroupIdAndUser_UserId(request.getGroupId(), request.getToUserId())) {
            throw new IllegalStateException("SECURITY ALERT: Settle receiver is not a member of this group.");
        }

        Group group = groupRepository.findById(request.getGroupId()).orElseThrow();
        User fromUser = userRepository.findById(request.getFromUserId()).orElseThrow();
        User toUser = userRepository.findById(request.getToUserId()).orElseThrow();
        BigDecimal amount = request.getAmount();

        // STEP 1: SECURITY ENFORCEMENT - Only the RECEIVER (Creditor) can mark as paid!
        Object principal = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof User) {
            User authUser = (User) principal;
            if (!authUser.getUserId().equals(toUser.getUserId())) {
                throw new IllegalStateException("SECURITY VIOLATION: Only the person receiving the money (the creditor) can mark this as paid.");
            }
        }

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

    public List<SettlementDTO> getSettlementsForUser(Integer userId) {
        // 1. Find all active groups for the user
        List<GroupMember> memberships = groupMemberRepository.findByUser_UserId(userId);
        List<Integer> groupIds = memberships.stream()
                .filter(gm -> !Boolean.TRUE.equals(gm.getGroup().getIsDeleted()))
                .map(gm -> gm.getGroup().getGroupId())
                .collect(Collectors.toList());

        if (groupIds.isEmpty()) return new ArrayList<>();

        // 2. Fetch all live UNPAID debts for these groups
        List<Debt> unpaid = debtRepository.findByGroup_GroupIdIn(groupIds);
        List<SettlementDTO> overview = unpaid.stream()
                .filter(d -> d.getAmount().compareTo(new java.math.BigDecimal("0.05")) > 0)
                .map(d -> SettlementDTO.builder()
                        .id(d.getDebtId())
                        .groupId(d.getGroup().getGroupId())
                        .groupName(d.getGroup().getName())
                        .fromUserId(d.getDebtor().getUserId())
                        .fromUserName(d.getDebtor().getName())
                        .toUserId(d.getCreditor().getUserId())
                        .toUserName(d.getCreditor().getName())
                        .amount(d.getAmount())
                        .status("UNPAID")
                        .build()
                ).collect(Collectors.toList());

        // 3. Fetch all historical PAID transactions
        List<Transaction> paid = transactionRepository.findByGroup_GroupIdInOrderBySettledAtDesc(groupIds);
        overview.addAll(paid.stream().map(t -> SettlementDTO.builder()
                .id(t.getTransactionId())
                .groupId(t.getGroup().getGroupId())
                .groupName(t.getGroup().getName())
                .fromUserId(t.getFromUser().getUserId())
                .fromUserName(t.getFromUser().getName())
                .toUserId(t.getToUser().getUserId())
                .toUserName(t.getToUser().getName())
                .amount(t.getAmount())
                .status("PAID")
                .settledAt(t.getSettledAt())
                .build()
        ).collect(Collectors.toList()));

        return overview;
    }
}
