package com.tems.backend.controller;

import com.tems.backend.entity.Expense;
import com.tems.backend.dto.ExpenseRequest;
import com.tems.backend.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

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

    // POST http://localhost:8080/api/expenses/add
    @PostMapping("/add")
    public ResponseEntity<Expense> addExpense(@RequestBody ExpenseRequest request) {
        Expense recordedExpense = expenseService.addExpense(request);
        return ResponseEntity.ok(recordedExpense);
    }
}
