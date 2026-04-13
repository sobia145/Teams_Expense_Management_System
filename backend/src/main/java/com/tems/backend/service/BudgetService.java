package com.tems.backend.service;

import com.tems.backend.dto.BudgetRequest;
import com.tems.backend.entity.Budget;
import com.tems.backend.entity.Group;
import com.tems.backend.repository.BudgetRepository;
import com.tems.backend.repository.GroupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final GroupRepository groupRepository;

    @Transactional
    public Budget saveBudget(BudgetRequest request) {
        Group group = groupRepository.findById(request.getGroupId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid group ID"));

        // IMPLEMENT UPSERT: If a budget already exists for this group/category/period, update it.
        // This prevents DataIntegrityViolation (500 error) on the unique constraint.
        java.util.Optional<Budget> existing = budgetRepository.findByGroup_GroupIdAndCategoryIdAndPeriod(
                request.getGroupId(), 
                request.getCategoryId(), 
                "TRIP"
        );

        if (existing.isPresent()) {
            Budget b = existing.get();
            b.setLimitAmount(request.getLimitAmount());
            b.setCategory(request.getCategory());
            b.setCustomCategory(request.getCustomCategory());
            return budgetRepository.save(b);
        }

        Budget budget = Budget.builder()
                .group(group)
                .categoryId(request.getCategoryId())
                .category(request.getCategory())
                .limitAmount(request.getLimitAmount())
                .customCategory(request.getCustomCategory())
                .period("TRIP")
                .build();

        return budgetRepository.save(budget);
    }

    public List<Budget> getBudgetsByGroup(Integer groupId) {
        return budgetRepository.findByGroup_GroupId(groupId);
    }
}
