package com.tems.backend.scratch;

import com.tems.backend.entity.Expense;
import com.tems.backend.entity.GroupMember;
import com.tems.backend.repository.ExpenseRepository;
import com.tems.backend.repository.GroupMemberRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DbDiagnosticRunner implements CommandLineRunner {

    private final ExpenseRepository expenseRepository;
    private final GroupMemberRepository groupMemberRepository;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("\n--- DATABASE DIAGNOSTIC START ---");
        try {
            System.out.println("\n[GROUP MEMBERSHIPS]");
            List<GroupMember> members = groupMemberRepository.findAll();
            for (GroupMember gm : members) {
                System.out.printf("Group: %s (ID: %d) | Member: %s (ID: %d)\n",
                    gm.getGroup().getName(), gm.getGroup().getGroupId(),
                    gm.getUser().getName(), gm.getUser().getUserId());
            }

            System.out.println("\n[EXPENSES MAPPING]");
            List<Expense> expenses = expenseRepository.findAll();
            for (Expense e : expenses) {
                System.out.printf("Expense: %s (ID: %d) | Group: %s (ID: %d) | Payer: %s (ID: %d) | Status: %s\n",
                    e.getTitle(), e.getExpenseId(),
                    e.getGroup().getName(), e.getGroup().getGroupId(),
                    e.getPaidBy().getName(), e.getPaidBy().getUserId(),
                    e.getStatus());
            }
        } catch (Exception e) {
            System.err.println("⚠️ [DIAGNOSTIC ERROR] Could not complete full audit: " + e.getMessage());
        }
        
        System.out.println("\n--- DATABASE DIAGNOSTIC END ---\n");
    }
}
