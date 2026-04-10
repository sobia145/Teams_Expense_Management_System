package com.tems.backend.controller;

import com.tems.backend.entity.*;
import com.tems.backend.service.AdminService;
import com.tems.backend.dto.AnalyticsResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @GetMapping("/groups")
    public ResponseEntity<List<Group>> getAllGroups() {
        return ResponseEntity.ok(adminService.getAllGroups());
    }

    @GetMapping("/expenses")
    public ResponseEntity<List<Expense>> getAllExpenses() {
        return ResponseEntity.ok(adminService.getAllExpenses());
    }

    @GetMapping("/analytics")
    public ResponseEntity<AnalyticsResponse> getAnalytics() {
        return ResponseEntity.ok(adminService.getAnalytics());
    }

    @GetMapping("/budget-alerts")
    public ResponseEntity<List<BudgetAlert>> getBudgetAlerts() {
        return ResponseEntity.ok(adminService.getAllBudgetAlerts());
    }

    @GetMapping("/history")
    public ResponseEntity<List<HistoryLog>> getHistoryLogs() {
        return ResponseEntity.ok(adminService.getAllHistoryLogs());
    }
}
