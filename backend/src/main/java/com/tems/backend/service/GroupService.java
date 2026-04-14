package com.tems.backend.service;

import com.tems.backend.entity.Group;
import com.tems.backend.entity.Debt;
import com.tems.backend.repository.GroupRepository;
import com.tems.backend.repository.ExpenseRepository;
import com.tems.backend.repository.HistoryLogRepository;
import com.tems.backend.entity.HistoryLog;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;

@Service
public class GroupService {
    @Autowired
    private GroupRepository groupRepository;

    @PersistenceContext
    private EntityManager entityManager;
    
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
        List<Group> activeGroups = groupRepository.findActiveGroupsByUserId(userId);
        for (Group g : activeGroups) {
            java.math.BigDecimal spent = expenseRepository.sumApprovedAmountByGroupId(g.getGroupId());
            Long pending = approvalRepository.countByExpense_Group_GroupIdAndStatus(g.getGroupId(), "PENDING");
            long mCount = groupMemberRepository.countByGroup_GroupId(g.getGroupId());
            
            // AUTO-REPAIR: If production data is inconsistent (0 members), re-inject the creator safely
            if (mCount == 0 && g.getCreatedBy() != null) {
                com.tems.backend.entity.GroupMember repair = com.tems.backend.entity.GroupMember.builder()
                    .group(g)
                    .user(g.getCreatedBy())
                    .role("ADMIN")
                    .build();
                groupMemberRepository.save(repair);
                mCount = 1;
                entityManager.flush();
            }

            g.setTotalSpent(spent != null ? spent : java.math.BigDecimal.ZERO);
            g.setPendingApprovals(pending != null ? pending : 0L);
            g.setMemberCount(mCount);
        }
        return activeGroups;
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

        // FORCE PERSISTENCE: Ensure membership link is solid before return
        entityManager.flush();

        // --- STABILIZATION: ADD TO HISTORY LOG ---
        HistoryLog groupLog = HistoryLog.builder()
            .entityType("GROUP")
            .entityId(savedGroup.getGroupId())
            .action("CREATED")
            .performedBy(creatorUserId)
            .performedByName(creator.getName())
            .newData("Trip formed: " + savedGroup.getName() + " (" + savedGroup.getCurrency() + ")")
            .groupId(savedGroup.getGroupId())
            .groupName(savedGroup.getName())
            .build();
        historyLogRepository.save(groupLog);
            
        return savedGroup;
    }
    
    @Transactional
    public void deleteGroup(Integer groupId, Integer userId) {
        Group group = groupRepository.findById(groupId)
            .orElseThrow(() -> new IllegalArgumentException("Group not found with ID: " + groupId));

        // SECURITY CHECK: Only the creator (or an admin) can delete a group
        if (!group.getCreatedBy().getUserId().equals(userId)) {
            throw new IllegalStateException("SECURITY VIOLATION: Access Denied. Only the group creator can delete this trip.");
        }

        // FINANCIAL INTERLOCK: Prevent deletion if unpaid debts exist
        List<Debt> activeDebts = debtRepository.findByGroup_GroupId(groupId);
        boolean hasUnpaid = activeDebts.stream()
            .anyMatch(d -> d.getAmount().compareTo(java.math.BigDecimal.ZERO) > 0);
            
        if (hasUnpaid) {
            throw new IllegalStateException("DELETION BLOCKED: This group cannot be deleted because there are still active unpaid debts. Please settle all payments first.");
        }

        System.out.println("🚀 [DELETION] Starting heavy-duty teardown for Group: " + group.getName() + " (ID: " + groupId + ")");

        try {
            // --- NEW: History Purge (Ensure audit trail doesn't block parent deletion) ---
            historyLogRepository.deleteByGroupId(groupId);

            // Standard JPA cascade removal (manually handling tables without full @OneToMany relationships)
            budgetAlertRepository.deleteByGroup(group);
            budgetRepository.deleteByGroup(group);
            
            transactionRepository.deleteByGroup_GroupId(groupId);
            debtRepository.deleteByGroup_GroupId(groupId);
            
            // Clean up expenses and their complex sub-mappings
            List<com.tems.backend.entity.Expense> groupExpenses = expenseRepository.findByGroup_GroupId(groupId);
            for (com.tems.backend.entity.Expense expense : groupExpenses) {
                approvalRepository.deleteByExpense(expense);
                expenseSplitRepository.deleteByExpense(expense);
            }
            expenseRepository.deleteByGroupId(groupId);
            
            // Final teardown
            groupMemberRepository.deleteByGroup_GroupId(groupId);
            groupRepository.deleteById(groupId);
            
            // FORCE FLUSH: Ensure the database transaction is synchronized immediately 
            entityManager.flush();
            entityManager.clear();
            
            System.out.println("✅ [DELETION] Successfully purged Group " + groupId);
            
        } catch (Exception e) {
            System.err.println("❌ [DELETION ERROR] Teardown failed: " + e.getMessage());
            e.printStackTrace();
            // Upgraded transparency: Return the REAL database message (e.g., FK Violation) to the UI
            throw new RuntimeException("Database error during group deletion: " + e.getMessage());
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
            .groupId(groupId)
            .groupName(group.getName())
            .build();
        historyLogRepository.save(log);

        return saved;
    }

    @Transactional(readOnly = true)
    public List<com.tems.backend.entity.User> getGroupMembers(Integer groupId) {
        return groupMemberRepository.findByGroup_GroupId(groupId)
            .stream()
            .map(com.tems.backend.entity.GroupMember::getUser)
            .toList();
    }
}
