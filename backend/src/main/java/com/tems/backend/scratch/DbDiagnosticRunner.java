package com.tems.backend.scratch;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import java.util.List;

/**
 * Run this by including it in the component scan or manually checking logs.
 * We want to see if there are EXPENSES or APPROVALS with a GROUP_ID that no longer exists in GROUPS.
 */
@Component
public class DbDiagnosticRunner implements CommandLineRunner {

    @Autowired
    private EntityManager entityManager;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("--- DB DIAGNOSTIC START ---");
        
        // Check for Expenses with non-existent groups
        Query q1 = entityManager.createNativeQuery("SELECT count(*) FROM expenses WHERE group_id NOT IN (SELECT group_id FROM groups)");
        Object orphanedExpenses = q1.getSingleResult();
        System.out.println("Orphaned Expenses (no group match): " + orphanedExpenses);
        
        // Check for Approvals with non-existent groups
        Query q2 = entityManager.createNativeQuery("SELECT count(*) FROM approvals a JOIN expenses e ON a.expense_id = e.expense_id WHERE e.group_id NOT IN (SELECT group_id FROM groups)");
        Object orphanedApprovals = q2.getSingleResult();
        System.out.println("Orphaned Approvals (no group match): " + orphanedApprovals);

        // Check total count of groups
        Query q3 = entityManager.createNativeQuery("SELECT count(*) FROM groups");
        Object totalGroups = q3.getSingleResult();
        System.out.println("Total Groups in DB: " + totalGroups);

        System.out.println("--- DB DIAGNOSTIC END ---");
    }
}
