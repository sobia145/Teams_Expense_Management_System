package com.tems.backend.controller;

import com.tems.backend.entity.Expense;
import com.tems.backend.dto.ExpenseRequest;
import com.tems.backend.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    // GET http://localhost:8080/api/expenses/user/1
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Expense>> getUserExpenses(@PathVariable Integer userId) {
        return ResponseEntity.ok(expenseService.getExpensesForUser(userId));
    }
    
    // GET http://localhost:8080/api/expenses/admin
    @GetMapping("/admin")
    public ResponseEntity<List<Expense>> getAllExpenses() {
        return ResponseEntity.ok(expenseService.getAllExpenses());
    }

    @PostMapping("/add")
    public ResponseEntity<Expense> addExpense(@RequestBody ExpenseRequest request) {
        System.out.println("DEBUG: Category received for " + request.getTitle() + " -> " + request.getCategory());
        Expense recordedExpense = expenseService.addExpense(request);
        return ResponseEntity.ok(recordedExpense);
    }

    // GET http://localhost:8080/api/expenses/group/1
    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<Expense>> getGroupExpenses(@PathVariable Integer groupId) {
        return ResponseEntity.ok(expenseService.getExpensesForGroup(groupId));
    }

    @GetMapping("/category-spend")
    public ResponseEntity<BigDecimal> getCategorySpend(
            @RequestParam Integer groupId,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String customCategory) {
        return ResponseEntity.ok(expenseService.getCategorySpend(groupId, categoryId, category, customCategory));
    }

    @DeleteMapping("/{expenseId}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Integer expenseId) {
        expenseService.deleteExpense(expenseId);
        return ResponseEntity.ok().build();
    }
}
