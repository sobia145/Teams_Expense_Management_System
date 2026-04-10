package com.tems.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SettlementTransactionDTO {
    private Integer fromUserId;
    private String fromUserName;
    private Integer toUserId;
    private String toUserName;
    private BigDecimal amount;
}
