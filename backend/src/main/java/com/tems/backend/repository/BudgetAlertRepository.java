package com.tems.backend.repository;

import com.tems.backend.entity.BudgetAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import com.tems.backend.entity.Budget;
import java.util.List;

import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;

@Repository
public interface BudgetAlertRepository extends JpaRepository<BudgetAlert, Integer> {
    java.util.List<BudgetAlert> findByGroup_GroupId(Integer groupId);

    @Modifying
    @Transactional
    @Query("DELETE FROM BudgetAlert ba WHERE ba.group.groupId = :groupId")
    void deleteByGroupId(@Param("groupId") Integer groupId);

    void deleteByGroup(com.tems.backend.entity.Group group);
}
