package com.tems.backend.controller;

import com.tems.backend.dto.NotificationDTO;
import com.tems.backend.entity.Approval;
import com.tems.backend.entity.Expense;
import com.tems.backend.service.ApprovalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/approvals")
@RequiredArgsConstructor
public class ApprovalController {

    private final ApprovalService approvalService;

    // GET /api/approvals/user/{userId}/pending
    @GetMapping("/user/{userId}/pending")
    public ResponseEntity<List<NotificationDTO>> getPendingApprovals(@PathVariable Integer userId) {
        return ResponseEntity.ok(approvalService.getPendingApprovalsForUser(userId));
    }

    // POST /api/approvals/{expenseId}/status/{userId}/{status}
    @PostMapping("/{expenseId}/status/{userId}/{status}")
    public ResponseEntity<Expense> setApprovalStatus(
            @PathVariable Integer expenseId,
            @PathVariable Integer userId,
            @PathVariable String status,
            @RequestBody(required = false) Map<String, String> payload) {
        
        String reason = (payload != null) ? payload.get("reason") : null;
        return ResponseEntity.ok(approvalService.updateApprovalStatus(expenseId, userId, status, reason));
    }

    // Legacy handler for compatibility
    @PostMapping("/{expenseId}/status/{userId}")
    public ResponseEntity<Expense> setApprovalStatusLegacy(
            @PathVariable Integer expenseId,
            @PathVariable Integer userId,
            @RequestBody Map<String, String> payload) {
        
        String status = payload.get("status");
        if (status == null) {
            return ResponseEntity.badRequest().build();
        }
        
        return ResponseEntity.ok(approvalService.updateApprovalStatus(expenseId, userId, status));
    }
}
