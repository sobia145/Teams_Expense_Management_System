package com.tems.backend.controller;

import com.tems.backend.dto.SettleRequest;
import com.tems.backend.dto.SettlementDTO;
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
    public ResponseEntity<List<SettlementDTO>> getBalances(@RequestParam Integer groupId) {
        return ResponseEntity.ok(settleService.getSettlementOverview(groupId));
    }

    // POST /api/settlePayment
    @PostMapping("/settlePayment")
    public ResponseEntity<String> settlePayment(@RequestBody SettleRequest request) {
        settleService.settlePayment(request);
        return ResponseEntity.ok("Payment settled successfully");
    }

    // DEBUG MASTER: Added as requested for deep-logging the settlement pipeline
    @GetMapping("/settlements/combined/{groupId}")
    public ResponseEntity<List<SettlementDTO>> getCombinedSettlements(@PathVariable Integer groupId) {
        System.out.println("--- DEEP SETTLEMENT DEBUG START (Group: " + groupId + ") ---");
        List<SettlementDTO> results = settleService.getSettlementOverview(groupId);
        if (results != null) {
            results.forEach(res -> {
                System.out.println(String.format("ID: %d | Status: %s | From: %d (%s) | To: %d (%s) | Amount: %s",
                    res.getId(), res.getStatus(), 
                    res.getFromUserId(), res.getFromUserName(),
                    res.getToUserId(), res.getToUserName(),
                    res.getAmount()));
            });
            System.out.println("Total records found: " + results.size());
        }
        System.out.println("--- DEEP SETTLEMENT DEBUG END ---");
        return ResponseEntity.ok(results);
    }

    @GetMapping("/settlements/user/{userId}")
    public ResponseEntity<List<SettlementDTO>> getSettlementsForUser(@PathVariable Integer userId) {
        return ResponseEntity.ok(settleService.getSettlementsForUser(userId));
    }

    // Compatibility path for frontend's current service
    @GetMapping({"/settlements/group/{groupId}", "/settlements/balances"})
    public ResponseEntity<List<SettlementDTO>> getBalancesLegacy(@PathVariable(required = false) Integer groupId, @RequestParam(required = false) Integer groupIdParam) {
        Integer id = groupId != null ? groupId : groupIdParam;
        return ResponseEntity.ok(settleService.getSettlementOverview(id));
    }
}
