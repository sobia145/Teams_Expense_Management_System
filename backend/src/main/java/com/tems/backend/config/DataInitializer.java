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
        // Bootstrapping the Admin so you don't have to use Postman manually
        if (!userRepository.existsByEmail("admin@tems.com")) {
            userRepository.save(User.builder().name("Sobia Admin").email("admin@tems.com").passwordHash("password123").role("ADMIN").build());
            System.out.println("\n🔥 SYSTEM BOOTSTRAP: Master Admin successfully injected -> admin@tems.com\n");
        }
        
        // Ensure User Test accounts exist as well
        User u1 = userRepository.existsByEmail("user@tems.com") ? userRepository.findByEmail("user@tems.com").get() 
            : userRepository.save(User.builder().name("Nikitha User").email("user@tems.com").passwordHash("pwd123").role("USER").build());
            
        User u2 = userRepository.existsByEmail("alice@tems.com") ? userRepository.findByEmail("alice@tems.com").get()
            : userRepository.save(User.builder().name("Alice Anderson").email("alice@tems.com").passwordHash("pwd123").role("USER").build());

        // Dummy Group
        if (expenseRepository.count() == 0) {
            System.out.println("\n🔥 SYSTEM BOOTSTRAP: Seeding Dummy Global Data for Admin Visualization!\n");
            
            Group g1 = groupRepository.save(Group.builder().name("Goa Trip 2026").currency("INR").createdBy(u1).build());
            Group g2 = groupRepository.save(Group.builder().name("Final Year Project Team").currency("INR").createdBy(u2).build());

            // Dummy Expenses
            expenseRepository.save(Expense.builder().group(g1).paidBy(u1).title("Resort Deposit").totalAmount(new BigDecimal("25000")).categoryId(3).status("APPROVED").createdAt(LocalDateTime.now().minusDays(5)).build());
            expenseRepository.save(Expense.builder().group(g1).paidBy(u2).title("Flight Tickets").totalAmount(new BigDecimal("12500")).categoryId(2).status("APPROVED").createdAt(LocalDateTime.now().minusDays(3)).build());
            expenseRepository.save(Expense.builder().group(g2).paidBy(u1).title("Microcontrollers").totalAmount(new BigDecimal("4200")).categoryId(4).status("PENDING").createdAt(LocalDateTime.now().minusDays(1)).build());
            expenseRepository.save(Expense.builder().group(g1).paidBy(u1).title("Beach Dinner").totalAmount(new BigDecimal("8500")).categoryId(1).status("APPROVED").createdAt(LocalDateTime.now()).build());

            com.tems.backend.entity.BudgetAlert alert = com.tems.backend.entity.BudgetAlert.builder()
                .group(g1)
                .categoryId(1) // Food
                .exceededAmount(new BigDecimal("1500"))
                .createdAt(LocalDateTime.now())
                .build();
            budgetAlertRepository.save(alert);

            // Dummy History Logs
            historyLogRepository.save(HistoryLog.builder().action("Platform Deployed").entityType("SYSTEM").newData("Initial observability matrix initialized.").performedBy(1).build());
            historyLogRepository.save(HistoryLog.builder().action("Group Formatted").entityType("GROUP").newData("Sobia tracked the formation of Goa Trip 2026.").performedBy(u1.getUserId()).build());
            historyLogRepository.save(HistoryLog.builder().action("Financial Inject").entityType("EXPENSE").newData("Resort deposit was securely tracked.").performedBy(u1.getUserId()).build());
        }
    }
}
