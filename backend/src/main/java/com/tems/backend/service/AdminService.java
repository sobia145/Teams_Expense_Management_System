package com.tems.backend.service;

import com.tems.backend.entity.*;
import com.tems.backend.repository.*;
import com.tems.backend.dto.AnalyticsResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {
    
    private final UserRepository userRepository;
    private final GroupRepository groupRepository;
    private final ExpenseRepository expenseRepository;
    private final BudgetAlertRepository budgetAlertRepository;
    private final HistoryLogRepository historyLogRepository;
    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    public List<Group> getAllGroups() {
        return groupRepository.findAll();
    }
    
    public List<Expense> getAllExpenses() {
        return expenseRepository.findAll();
    }
    
    public List<BudgetAlert> getAllBudgetAlerts() {
        return budgetAlertRepository.findAll();
    }
    
    public List<HistoryLog> getAllHistoryLogs() {
        return historyLogRepository.findAll();
    }
    
    public AnalyticsResponse getAnalytics() {
        long totalUsers = userRepository.count();
        long totalGroups = groupRepository.findAll().stream()
                .filter(g -> g.getIsDeleted() == null || !g.getIsDeleted())
                .count();
        
        // Sum total expenses safely handling null maps
        BigDecimal totalExpenses = expenseRepository.findAll()
            .stream()
            .map(e -> e.getTotalAmount() != null ? e.getTotalAmount() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
            
        List<Object[]> categoryData = expenseRepository.findCategoryWiseSpending();
        Map<Integer, BigDecimal> categoryWiseSpending = categoryData.stream()
            .filter(obj -> obj[0] != null) // Avoid null category IDs breaking map keys
            .collect(Collectors.toMap(
                obj -> (Integer) obj[0],
                obj -> (BigDecimal) obj[1],
                (v1, v2) -> v1.add(v2) // in case of duplicates merge them
            ));
            
        return AnalyticsResponse.builder()
            .totalUsers(totalUsers)
            .totalGroups(totalGroups)
            .totalExpenses(totalExpenses)
            .categoryWiseSpending(categoryWiseSpending)
            .build();
    }
}
