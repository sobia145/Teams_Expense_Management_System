package com.tems.backend.controller;

import com.tems.backend.dto.BudgetRequest;
import com.tems.backend.entity.Budget;
import com.tems.backend.service.BudgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @PostMapping("/save")
    public ResponseEntity<Budget> saveBudget(@RequestBody BudgetRequest request) {
        return ResponseEntity.ok(budgetService.saveBudget(request));
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<Budget>> getBudgetsByGroup(@PathVariable Integer groupId) {
        return ResponseEntity.ok(budgetService.getBudgetsByGroup(groupId));
    }
}
