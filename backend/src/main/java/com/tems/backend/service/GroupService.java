package com.tems.backend.service;

import com.tems.backend.entity.Group;
import com.tems.backend.repository.GroupRepository;
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
}
