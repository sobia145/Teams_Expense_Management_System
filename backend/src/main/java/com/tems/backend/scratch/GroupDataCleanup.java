package com.tems.backend.scratch;

import com.tems.backend.entity.Expense;
import com.tems.backend.entity.Group;
import com.tems.backend.entity.Debt;
import com.tems.backend.repository.ExpenseRepository;
import com.tems.backend.repository.GroupRepository;
import com.tems.backend.repository.GroupMemberRepository;
import com.tems.backend.repository.DebtRepository;
import com.tems.backend.repository.TransactionRepository;
import com.tems.backend.repository.ApprovalRepository;
import com.tems.backend.repository.ExpenseSplitRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Component
@RequiredArgsConstructor
public class GroupDataCleanup implements CommandLineRunner {

    private final ExpenseRepository expenseRepository;
    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final DebtRepository debtRepository;
    private final TransactionRepository transactionRepository;
    private final ApprovalRepository approvalRepository;
    private final ExpenseSplitRepository splitRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        System.out.println("🚀 [CLEANUP] Starting Targeted Data Purge...");
        try {
            // Find "mini project" - ensuring we have the right group
            List<Group> miniProjectList = groupRepository.findAll().stream()
                    .filter(g -> g.getName().equalsIgnoreCase("mini project"))
                    .toList();

            if (miniProjectList.isEmpty()) {
                System.out.println("❌ [CLEANUP] Group 'mini project' not found. Skipping.");
                return;
            }

            for (Group miniProj : miniProjectList) {
                Integer gid = miniProj.getGroupId();
                System.out.println("🔍 [CLEANUP] Auditing Group: " + miniProj.getName() + " (ID: " + gid + ")");

                // Find all expenses in this group
                List<Expense> expenses = expenseRepository.findByGroup_GroupId(gid);
                int deleteCount = 0;

                for (Expense e : expenses) {
                    // Check if payer is an actual member
                    boolean isMember = groupMemberRepository.existsByGroup_GroupIdAndUser_UserId(gid, e.getPaidBy().getUserId());

                    if (!isMember) {
                        System.out.println("🚨 [CLEANUP] Found Unauthorized Expense: '" + e.getTitle() + "' paid by " + e.getPaidBy().getName());
                        
                        // Cascade Delete sub-records
                        approvalRepository.deleteByExpense(e);
                        splitRepository.deleteByExpense(e);
                        
                        // Delete the expense itself
                        expenseRepository.delete(e);
                        deleteCount++;
                    }
                }
                
                // Also cleanup any debts where the non-member Rohi is involved in this group
                long debtPurge = debtRepository.findAll().stream()
                    .filter(d -> d.getGroup().getGroupId().equals(gid))
                    .filter(d -> !groupMemberRepository.existsByGroup_GroupIdAndUser_UserId(gid, d.getDebtor().getUserId()) ||
                                !groupMemberRepository.existsByGroup_GroupIdAndUser_UserId(gid, d.getCreditor().getUserId()))
                    .peek(d -> debtRepository.delete(d))
                    .count();

                System.out.println("✅ [CLEANUP] Removed " + deleteCount + " unauthorized expenses and " + debtPurge + " orphan debts.");
            }
        } catch (Exception e) {
            System.err.println("❌ [CLEANUP CRITICAL FAILURE] Purge halted: " + e.getMessage());
            e.printStackTrace();
        }
        
        System.out.println("🏁 [CLEANUP] Targeted Purge Process Handled.");
    }
}
