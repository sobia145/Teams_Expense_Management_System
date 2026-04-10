package com.tems.backend.controller;

import com.tems.backend.dto.SettlementTransactionDTO;
import com.tems.backend.service.SettlementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/settlements")
@RequiredArgsConstructor
public class SettlementController {

    private final SettlementService settlementService;

    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<SettlementTransactionDTO>> getSettlements(@PathVariable Integer groupId) {
        return ResponseEntity.ok(settlementService.calculateSettlements(groupId));
    }
}
