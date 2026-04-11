package com.tems.backend.repository;

import com.tems.backend.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;

@Repository 
public interface ExpenseRepository extends JpaRepository<Expense, Integer> {
    
    @Query("SELECT SUM(e.totalAmount) FROM Expense e WHERE e.group.groupId = :groupId AND e.isDeleted = false")
    BigDecimal sumTotalAmountByGroupId(@Param("groupId") Integer groupId);
    
    // 🔥 Core Shared Transparency Engine: Find ALL expenses logged natively inside groups I am actively a member of!
    @Query("SELECT e FROM Expense e WHERE e.group IN (SELECT gm.group FROM GroupMember gm WHERE gm.user.userId = :userId) AND e.isDeleted = false")
    List<Expense> findExpensesForUser(@Param("userId") Integer userId);
    
    @Query("SELECT e.categoryId, SUM(e.totalAmount) FROM Expense e WHERE e.isDeleted = false GROUP BY e.categoryId")
    List<Object[]> findCategoryWiseSpending();
    
    @Modifying
    @Query("UPDATE Expense e SET e.isDeleted = true WHERE e.group.groupId = :groupId")
    void softDeleteExpensesByGroupId(@Param("groupId") Integer groupId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Expense e WHERE e.group.groupId = :groupId")
    void deleteByGroupId(@Param("groupId") Integer groupId);

    List<Expense> findByGroup_GroupIdAndStatus(Integer groupId, String status);
    List<Expense> findByGroup_GroupId(Integer groupId);
}
