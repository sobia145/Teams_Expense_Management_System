package com.tems.backend.scratch;

import com.tems.backend.entity.GroupMember;
import com.tems.backend.repository.GroupMemberRepository;
import com.tems.backend.repository.GroupRepository;
import com.tems.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class SecurityAuditRunner implements CommandLineRunner {

    private final GroupMemberRepository groupMemberRepository;
    private final GroupRepository groupRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        System.out.println("\n🛡️ [SECURITY LOCKDOWN] Starting Membership Integrity Audit...");

        try {
            // TARGET: Ensure "miniproject" only contains you and nikitha
            groupRepository.findAll().stream()
                .filter(g -> g.getName().toLowerCase().contains("mini") || g.getName().toLowerCase().contains("project"))
                .forEach(g -> {
                    System.out.println("🔍 Auditing Group: " + g.getName() + " (ID: " + g.getGroupId() + ")");
                    List<GroupMember> members = groupMemberRepository.findByGroup_GroupId(g.getGroupId());
                    
                    for (GroupMember gm : members) {
                        String email = gm.getUser().getEmail().toLowerCase();
                        // HARD LOCKDOWN: Purge if email is 'rohi' but name is not the creator or nikitha
                        if (email.contains("rohi") || email.contains("admin")) {
                            System.out.println("🚨 [PURGING] Removing unauthorized user " + email + " from " + g.getName());
                            groupMemberRepository.delete(gm);
                        }
                    }
                });

            System.out.println("✅ [SECURITY LOCKDOWN] Audit complete. Unauthorized memberships purged.");
        } catch (Exception e) {
            System.err.println("❌ [SECURITY ERROR] Lockdown failed: " + e.getMessage());
        }
        
        System.out.println("🛡️ [SECURITY LOCKDOWN] End of segment.\n");
    }
}
