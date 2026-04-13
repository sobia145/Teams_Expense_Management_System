package com.tems.backend.repository;

import com.tems.backend.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Integer> {
    
    // Explicitly fetching bounds EXCLUSIVELY for a specific Isolated Group ID
    List<Budget> findByGroup_GroupId(Integer groupId);

    java.util.Optional<Budget> findByGroup_GroupIdAndCategoryIdAndPeriod(Integer groupId, Integer categoryId, String period);

    @Modifying
    @Transactional
    @Query("DELETE FROM Budget b WHERE b.group.groupId = :groupId")
    void deleteByGroupId(@Param("groupId") Integer groupId);

    void deleteByGroup(com.tems.backend.entity.Group group);
    
}
