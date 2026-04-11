package com.tems.backend.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SettleRequest {
    private Integer groupId;
    private Integer fromUserId;
    private Integer toUserId;
    private BigDecimal amount;
}
