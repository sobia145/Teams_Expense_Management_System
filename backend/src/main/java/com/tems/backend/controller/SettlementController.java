package com.tems.backend.controller;

import com.tems.backend.dto.SettleRequest;
import com.tems.backend.entity.Debt;
import com.tems.backend.repository.DebtRepository;
import com.tems.backend.service.SettleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SettlementController {

    private final DebtRepository debtRepository;
    private final SettleService settleService;

    // GET /api/getBalances?groupId=1
    @GetMapping("/getBalances")
    public ResponseEntity<List<Debt>> getBalances(@RequestParam Integer groupId) {
        return ResponseEntity.ok(debtRepository.findByGroup_GroupId(groupId));
    }

    // POST /api/settlePayment
    @PostMapping("/settlePayment")
    public ResponseEntity<String> settlePayment(@RequestBody SettleRequest request) {
        settleService.settlePayment(request);
        return ResponseEntity.ok("Payment settled successfully");
    }

    // Compatibility path for frontend's current service
    @GetMapping({"/settlements/group/{groupId}", "/settlements/balances"})
    public ResponseEntity<List<Debt>> getBalancesLegacy(@PathVariable(required = false) Integer groupId, @RequestParam(required = false) Integer groupIdParam) {
        Integer id = groupId != null ? groupId : groupIdParam;
        return ResponseEntity.ok(debtRepository.findByGroup_GroupId(id));
    }
}
