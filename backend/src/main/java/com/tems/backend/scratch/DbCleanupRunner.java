package com.tems.backend.scratch;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DbCleanupRunner implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("--- CRITICAL DB REMEDIATION START ---");
        
        try {
            // Step 1: Delete approvals associated with expenses in non-existent groups
            int approvalsDeleted = jdbcTemplate.update(
                "DELETE FROM approvals WHERE expense_id IN (SELECT expense_id FROM expenses WHERE group_id NOT IN (SELECT group_id FROM `groups`))"
            );
            System.out.println("Cleaned orphaned Approvals: " + approvalsDeleted);

            // Step 2: Delete expenses in non-existent groups
            int expensesDeleted = jdbcTemplate.update(
                "DELETE FROM expenses WHERE group_id NOT IN (SELECT group_id FROM `groups`)"
            );
            System.out.println("Cleaned orphaned Expenses: " + expensesDeleted);
            
        } catch (Exception e) {
            System.err.println("REMEDIATION FAILED: " + e.getMessage());
        }

        System.out.println("--- CRITICAL DB REMEDIATION COMPLETE ---");
    }
}
