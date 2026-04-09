package com.tems.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class GroupRequest {
    private String name;
    private String currency;
    private Boolean isDeleted = false;
    private List<Integer> memberIds;
}
