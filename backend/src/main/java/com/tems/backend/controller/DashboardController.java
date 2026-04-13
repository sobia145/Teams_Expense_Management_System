package com.tems.backend.controller;

import com.tems.backend.dto.DashboardStatsDTO;
import com.tems.backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats/{userId}")
    public ResponseEntity<DashboardStatsDTO> getUserStats(@PathVariable Integer userId) {
        return ResponseEntity.ok(dashboardService.getUserDashboardStats(userId));
    }
}
