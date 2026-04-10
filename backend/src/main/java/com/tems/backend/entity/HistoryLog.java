package com.tems.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="history_log")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HistoryLog { 
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) 
    private Integer logId; 
    
    private String entityType; 
    private Integer entityId; 
    private String action; 
    private Integer performedBy; 
    private String performedByName;
    private String newData; 
}
