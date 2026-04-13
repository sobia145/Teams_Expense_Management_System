package com.tems.backend.controller;

import com.tems.backend.entity.HistoryLog;
import com.tems.backend.repository.HistoryLogRepository;
import com.tems.backend.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/history")
@RequiredArgsConstructor
public class HistoryController {

    private final HistoryLogRepository historyLogRepository;
    private final TransactionRepository transactionRepository;

    @GetMapping
    public ResponseEntity<List<HistoryLog>> getHistory(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer groupId,
            @RequestParam(required = false) Integer userId) {
        
        List<HistoryLog> logs;
        if (groupId != null) {
            // Priority: Group-wide activity feed
            logs = historyLogRepository.findByGroupIdOrderByCreatedAtDesc(groupId);
        } else if (userId != null) {
            // New: Universal Activity Feed (All groups I'm in)
            logs = historyLogRepository.findHistoryForUserGroups(userId);
        } else if (name != null && !name.isEmpty()) {
            // Fallback: Individual activity feed
            logs = historyLogRepository.findAllByPerformedByNameOrderByCreatedAtDesc(name);
        } else {
            // Admin/Global view
            logs = historyLogRepository.findAll();
        }

        // Transactions are now explicitly logged as HistoryLog entries in SettleService,
        // so we no longer need on-the-fly mapping here, avoiding duplication.

        // Sort if not already sorted by DB (for safety)
        logs.sort((a, b) -> {
            if (a.getCreatedAt() == null || b.getCreatedAt() == null) return 0;
            return b.getCreatedAt().compareTo(a.getCreatedAt());
        });

        return ResponseEntity.ok(logs);
    }

    @PostMapping("/add")
    public ResponseEntity<HistoryLog> addHistory(@RequestBody HistoryLog log) {
        // Ensure the log is saved to MySQL immediately
        return ResponseEntity.ok(historyLogRepository.save(log));
    }
}
