package com.tems.backend.repository;

import com.tems.backend.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Integer> {
    List<Transaction> findByGroup_GroupIdOrderBySettledAtDesc(Integer groupId);
    List<Transaction> findByGroup_GroupIdInOrderBySettledAtDesc(List<Integer> groupIds);
    List<Transaction> findByFromUser_NameOrToUser_NameOrderBySettledAtDesc(String fromName, String toName);

    @Modifying
    @Transactional
    @Query("DELETE FROM Transaction t WHERE t.group.groupId = :groupId")
    void deleteByGroupId(@Param("groupId") Integer groupId);

    @Modifying
    @Transactional
    void deleteByGroup_GroupId(Integer groupId);
}
