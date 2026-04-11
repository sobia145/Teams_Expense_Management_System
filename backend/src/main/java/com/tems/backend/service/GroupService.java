package com.tems.backend.service;

import com.tems.backend.entity.Group;
import com.tems.backend.repository.GroupRepository;
import com.tems.backend.repository.ExpenseRepository;
import com.tems.backend.repository.HistoryLogRepository;
import com.tems.backend.entity.HistoryLog;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class GroupService {
    @Autowired
    private GroupRepository groupRepository;
    
    @Autowired
    private com.tems.backend.repository.GroupMemberRepository groupMemberRepository;
    
    @Autowired
    private com.tems.backend.repository.UserRepository userRepository;
    
    @Autowired
    private HistoryLogRepository historyLogRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private com.tems.backend.repository.TransactionRepository transactionRepository;

    @Autowired
    private com.tems.backend.repository.DebtRepository debtRepository;

    @Autowired
    private com.tems.backend.repository.ApprovalRepository approvalRepository;

    @Autowired
    private com.tems.backend.repository.ExpenseSplitRepository expenseSplitRepository;

    @Autowired
    private com.tems.backend.repository.BudgetRepository budgetRepository;

    @Autowired
    private com.tems.backend.repository.BudgetAlertRepository budgetAlertRepository;

    public List<Group> getGroupsForUser(Integer userId) {
        return groupRepository.findActiveGroupsByUserId(userId);
    }
    
    // Core Engine hook for Global Admin transparency
    public List<Group> getAllGroups() {
        return groupRepository.findAll();
    }
    
    @Transactional
    public Group createGroup(com.tems.backend.dto.GroupRequest request, Integer creatorUserId) {
        com.tems.backend.entity.User creator = userRepository.findById(creatorUserId)
            .orElseThrow(() -> new IllegalArgumentException("Invalid internal UserId provided"));
            
        Group group = Group.builder()
            .name(request.getName())
            .currency(request.getCurrency())
            .isDeleted(request.getIsDeleted() != null ? request.getIsDeleted() : false)
            .createdBy(creator)
            .build();
            
        Group savedGroup = groupRepository.save(group);
        
        // Auto-inject the user who requested the creation directly into the Group Members table!
        com.tems.backend.entity.GroupMember adminMember = com.tems.backend.entity.GroupMember.builder()
            .group(savedGroup)
            .user(creator)
            .role("ADMIN")
            .build();
        groupMemberRepository.save(adminMember);
        
        // Batch map the specifically selected multi-checkbox team assignments!
        if (request.getMemberIds() != null) {
            for (Integer memberId : request.getMemberIds()) {
                if (!memberId.equals(creatorUserId)) {
                    com.tems.backend.entity.User exactMember = userRepository.findById(memberId).orElse(null);
                    if (exactMember != null) {
                        com.tems.backend.entity.GroupMember addition = com.tems.backend.entity.GroupMember.builder()
                            .group(savedGroup)
                            .user(exactMember)
                            .role("MEMBER")
                            .build();
                        groupMemberRepository.save(addition);
                    }
                }
            }
        }
            
        return savedGroup;
    }
    
    @Transactional
    public void deleteGroup(Integer groupId, Integer userId) {
        try {
            // 1. Capture Group metadata for the audit trail before it's gone
            Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));
            String capturedGroupName = group.getName();

            // --- Pre-fetch: Identify all records attached to this group ---
            List<Integer> expenseIds = expenseRepository.findByGroup_GroupId(groupId)
                .stream().map(com.tems.backend.entity.Expense::getExpenseId).toList();
            
            // 2. Atomic Sequential Cascade Deletion (Bottom-Up)
            
            // --- Phase A: Clear Leaf Nodes (Deep Children) ---
            if (!expenseIds.isEmpty()) {
                approvalRepository.deleteByExpenseIds(expenseIds);
                expenseSplitRepository.deleteByExpenseIds(expenseIds);
            }

            // --- Phase B: Clear Ledger ---
            transactionRepository.deleteByGroupId(groupId);
            debtRepository.deleteByGroupId(groupId);

            // --- Phase C: Clear Expenses ---
            expenseRepository.deleteByGroupId(groupId);

            // --- Phase D: Budget Cleanup ---
            budgetAlertRepository.deleteByGroupId(groupId);
            budgetRepository.deleteByGroupId(groupId);

            // --- Phase E: Clear Membership ---
            groupMemberRepository.deleteByGroupId(groupId);

            // --- Phase F: Physical Delete of the Group itself ---
            groupRepository.deleteById(groupId);
            
            // --- Audit Persistence ---
            com.tems.backend.entity.User actor = userRepository.findById(userId).orElse(null);
            String actorName = actor != null ? actor.getName() : "System";
            
            HistoryLog log = HistoryLog.builder()
                .entityType("GROUP")
                .entityId(groupId)
                .groupName(capturedGroupName)
                .action("PERMANENTLY_DELETED")
                .performedBy(userId)
                .performedByName(actorName)
                .newData("Successfully performed a complete hard-cascade deletion of Group '" + capturedGroupName + "' and all linked records.")
                .build();
            historyLogRepository.save(log);
        } catch (Exception e) {
            throw e;
        }
    }

    @Transactional
    public Group lockGroup(Integer groupId) {
        Group group = groupRepository.findById(groupId)
            .orElseThrow(() -> new IllegalArgumentException("Group not found"));
        group.setIsLocked(true);
        Group saved = groupRepository.save(group);

        HistoryLog log = HistoryLog.builder()
            .entityType("GROUP")
            .entityId(groupId)
            .action("LOCKED")
            .performedBy(null) // System action
            .performedByName("System")
            .newData("Trip Locked for Group: " + group.getName() + ". Modifications are now disabled.")
            .build();
        historyLogRepository.save(log);

        return saved;
    }
}
