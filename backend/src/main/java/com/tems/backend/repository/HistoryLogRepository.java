package com.tems.backend.repository;

import com.tems.backend.entity.HistoryLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository 
public interface HistoryLogRepository extends JpaRepository<HistoryLog, Integer> {
    java.util.List<HistoryLog> findAllByPerformedByNameOrderByCreatedAtDesc(String name);
    java.util.List<HistoryLog> findByGroupIdOrderByCreatedAtDesc(Integer groupId);
}
