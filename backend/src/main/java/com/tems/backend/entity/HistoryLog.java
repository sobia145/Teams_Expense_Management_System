package com.tems.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name="history_log")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HistoryLog { 
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) 
    private Integer logId; 
    
    @Column(name="entity_type")
    private String entityType; 
    
    @Column(name="entity_id")
    private Integer entityId; 
    
    @Column(name="action")
    private String action; 
    
    @Column(name="performed_by")
    private Integer performedBy; 
    
    @Column(name="performed_by_name")
    private String performedByName;
    
    @Column(name="new_data", length = 1000)
    private String newData; 

    @Column(name="group_id")
    private Integer groupId;

    @Column(name="group_name")
    private String groupName;
    
    @Column(name="created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
