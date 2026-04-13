package com.tems.backend.controller;

import com.tems.backend.service.ExpenseService;
import com.tems.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final ExpenseService expenseService;
    private final UserRepository userRepository;

    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<Map<String, Object>>> getGroupSpending(@PathVariable Integer groupId) {
        return ResponseEntity.ok(expenseService.getGroupSpendingByCategory(groupId));
    }

    @GetMapping("/my-spending/{groupId}")
    public ResponseEntity<?> getMySpending(
            @PathVariable Integer groupId,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        System.out.println("DEBUG: userDetails = " + userDetails);
        
        if (userDetails == null) {
            return ResponseEntity.status(401).body("No auth context");
        }
        
        // Secure identity lookup via JWT claims
        com.tems.backend.entity.User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Authenticated user context lost!"));
        
        Integer userId = user.getUserId();
        System.out.println("DEBUG: Analytics fetch - User: " + user.getName() + " (ID: " + userId + ") | Group: " + groupId);
        
        // Fix: Now pulling Actual Share (Debt) instead of Paid-By total
        return ResponseEntity.ok(expenseService.getMyShareByCategory(groupId, userId));
    }
}
