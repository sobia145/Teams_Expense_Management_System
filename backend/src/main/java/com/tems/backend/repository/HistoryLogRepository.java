package com.tems.backend.repository;

import com.tems.backend.entity.HistoryLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository 
public interface HistoryLogRepository extends JpaRepository<HistoryLog, Integer> {
    java.util.List<HistoryLog> findAllByPerformedByNameOrderByCreatedAtDesc(String name);
    java.util.List<HistoryLog> findByGroupIdOrderByCreatedAtDesc(Integer groupId);

    @Query("SELECT h FROM HistoryLog h WHERE h.groupId IN (SELECT gm.group.groupId FROM GroupMember gm WHERE gm.user.userId = :userId) OR h.performedBy = :userId ORDER BY h.createdAt DESC")
    java.util.List<HistoryLog> findHistoryForUserGroups(@Param("userId") Integer userId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("DELETE FROM HistoryLog h WHERE h.groupId = ?1")
    void deleteByGroupId(Integer groupId);
}
