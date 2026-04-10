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
    private ExpenseRepository expenseRepository;
    
    @Autowired
    private HistoryLogRepository historyLogRepository;

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
        Group group = groupRepository.findById(groupId)
            .orElseThrow(() -> new IllegalArgumentException("Group not found"));
            
        group.setIsDeleted(true);
        groupRepository.save(group);
        
        // Deep Cascade Delete globally hiding expenses
        expenseRepository.softDeleteExpensesByGroupId(groupId);
        
        // Find Executor
        com.tems.backend.entity.User actor = userRepository.findById(userId).orElse(null);
        String actorName = actor != null ? actor.getName() : "System";
        
        // Globally Audit the execution
        HistoryLog log = HistoryLog.builder()
            .entityType("GROUP")
            .entityId(groupId)
            .action("DELETED")
            .performedBy(userId)
            .performedByName(actorName)
            .newData("Securely soft-deleted Group: " + group.getName() + " and cascaded the deletion to all associated expenses.")
            .build();
        historyLogRepository.save(log);
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
