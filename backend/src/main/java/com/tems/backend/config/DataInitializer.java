package com.tems.backend.config;

import com.tems.backend.entity.*;
import com.tems.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final GroupRepository groupRepository;
    private final ExpenseRepository expenseRepository;
    private final HistoryLogRepository historyLogRepository;
    private final BudgetAlertRepository budgetAlertRepository;

    @Override
    public void run(String... args) throws Exception {
        // Bootstrapping the Admin
        if (!userRepository.existsByEmail("admin@tems.com")) {
            userRepository.save(User.builder()
                .name("Sobia Admin")
                .email("admin@tems.com")
                .passwordHash("password123")
                .role("ADMIN")
                .isDeleted(false)
                .build());
            System.out.println("\n🔥 SYSTEM BOOTSTRAP: Master Admin successfully injected -> admin@tems.com\n");
        }
        
        // Ensure User Test accounts exist as well with explicit non-null flags
        User u1 = userRepository.findByEmail("user@tems.com").orElseGet(() -> 
            userRepository.save(User.builder()
                .name("Nikitha User")
                .email("user@tems.com")
                .passwordHash("pwd123")
                .role("USER")
                .isDeleted(false)
                .build()));
            
        User u2 = userRepository.findByEmail("alice@tems.com").orElseGet(() ->
            userRepository.save(User.builder()
                .name("Alice Anderson")
                .email("alice@tems.com")
                .passwordHash("pwd123")
                .role("USER")
                .isDeleted(false)
                .build()));

        // Dummy Group
        if (expenseRepository.count() == 0) {
            System.out.println("\n🔥 SYSTEM BOOTSTRAP: Seeding Dummy Global Data for Admin Visualization!\n");
            
            Group g1 = groupRepository.save(Group.builder().name("Goa Trip 2026").currency("INR").createdBy(u1).isDeleted(false).build());
            Group g2 = groupRepository.save(Group.builder().name("Final Year Project Team").currency("INR").createdBy(u2).isDeleted(false).build());

            // Dummy Expenses
            expenseRepository.save(Expense.builder().group(g1).paidBy(u1).title("Resort Deposit").totalAmount(new BigDecimal("25000")).categoryId(3).status("APPROVED").createdAt(LocalDateTime.now().minusDays(5)).isDeleted(false).build());
            expenseRepository.save(Expense.builder().group(g1).paidBy(u2).title("Flight Tickets").totalAmount(new BigDecimal("12500")).categoryId(2).status("APPROVED").createdAt(LocalDateTime.now().minusDays(3)).isDeleted(false).build());
            expenseRepository.save(Expense.builder().group(g2).paidBy(u1).title("Microcontrollers").totalAmount(new BigDecimal("4200")).categoryId(4).status("PENDING").createdAt(LocalDateTime.now().minusDays(1)).isDeleted(false).build());
            expenseRepository.save(Expense.builder().group(g1).paidBy(u1).title("Beach Dinner").totalAmount(new BigDecimal("8500")).categoryId(1).status("APPROVED").createdAt(LocalDateTime.now()).isDeleted(false).build());

            com.tems.backend.entity.BudgetAlert alert = com.tems.backend.entity.BudgetAlert.builder()
                .group(g1)
                .categoryId(1) // Food
                .exceededAmount(new BigDecimal("1500"))
                .createdAt(LocalDateTime.now())
                .build();
            budgetAlertRepository.save(alert);

            // Dummy History Logs
            historyLogRepository.save(HistoryLog.builder().action("Platform Deployed").entityType("SYSTEM").newData("Initial observability matrix initialized.").performedBy(1).performedByName("System").build());
            historyLogRepository.save(HistoryLog.builder().action("Group Formatted").entityType("GROUP").newData("Sobia tracked the formation of Goa Trip 2026.").performedBy(u1.getUserId()).performedByName(u1.getName()).build());
            historyLogRepository.save(HistoryLog.builder().action("Financial Inject").entityType("EXPENSE").newData("Resort deposit was securely tracked.").performedBy(u1.getUserId()).performedByName(u1.getName()).build());
        }
    }
}
