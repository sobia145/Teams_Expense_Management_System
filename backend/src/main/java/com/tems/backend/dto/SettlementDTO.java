package com.tems.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SettlementDTO {
    private Integer id;
    private Integer groupId;
    private String groupName;
    private Integer fromUserId;
    private String fromUserName;
    private Integer toUserId;
    private String toUserName;
    private BigDecimal amount;
    private String status; // "UNPAID" or "PAID"
    private LocalDateTime settledAt;
}
