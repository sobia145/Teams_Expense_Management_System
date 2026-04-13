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
    
    @Modifying
    @Transactional
    @Query("UPDATE Expense e SET e.category = 'General' WHERE e.category IS NULL")
    int backfillCategories();

    @Query("SELECT SUM(e.totalAmount) FROM Expense e WHERE e.group.groupId = :groupId AND e.isDeleted = false")
    BigDecimal sumTotalAmountByGroupId(@Param("groupId") Integer groupId);

    @Query("SELECT SUM(e.totalAmount) FROM Expense e WHERE e.group.groupId = :groupId AND e.categoryId = :categoryId AND e.isDeleted = false")
    BigDecimal sumTotalAmountByGroupIdAndCategoryId(@Param("groupId") Integer groupId, @Param("categoryId") Integer categoryId);

    @Query("SELECT SUM(e.totalAmount) FROM Expense e WHERE e.group.groupId = :groupId AND e.customCategory = :customCategory AND e.isDeleted = false")
    BigDecimal sumTotalAmountByGroupIdAndCustomCategory(@Param("groupId") Integer groupId, @Param("customCategory") String customCategory);

    @Query("SELECT SUM(e.totalAmount) FROM Expense e WHERE e.group.groupId = :groupId AND e.categoryId = :categoryId AND e.status = 'APPROVED' AND e.isDeleted = false")
    BigDecimal sumApprovedByGroupAndCategory(@Param("groupId") Integer groupId, @Param("categoryId") Integer categoryId);

    @Query("SELECT SUM(e.totalAmount) FROM Expense e WHERE e.group.groupId = :groupId AND e.category = :categoryName AND e.status = 'APPROVED' AND e.isDeleted = false")
    BigDecimal sumApprovedByGroupAndCategoryName(@Param("groupId") Integer groupId, @Param("categoryName") String categoryName);

    @Query("SELECT SUM(e.totalAmount) FROM Expense e WHERE e.group.groupId = :groupId AND e.status = 'APPROVED' AND e.isDeleted = false")
    BigDecimal sumApprovedAmountByGroupId(@Param("groupId") Integer groupId);

    @Query("SELECT SUM(e.totalAmount) FROM Expense e WHERE e.group.groupId = :groupId AND e.customCategory = :customCategory AND e.status = 'APPROVED' AND e.isDeleted = false")
    BigDecimal sumApprovedByGroupAndCustomCategory(@Param("groupId") Integer groupId, @Param("customCategory") String customCategory);
    
    // 🔥 Core Shared Transparency Engine: Find ALL expenses logged natively inside groups I am actively a member of!
    @Query("SELECT e FROM Expense e WHERE e.group IN (SELECT gm.group FROM GroupMember gm WHERE gm.user.userId = :userId) AND e.isDeleted = false")
    List<Expense> findExpensesForUser(@Param("userId") Integer userId);

    @Query("SELECT SUM(e.totalAmount) FROM Expense e WHERE e.status = 'APPROVED' AND e.isDeleted = false AND e.group IN (SELECT gm.group FROM GroupMember gm WHERE gm.user.userId = :userId)")
    BigDecimal sumApprovedAmountForUserGroups(@Param("userId") Integer userId);
    
    @Query("SELECT (CASE WHEN e.category = 'Other' THEN e.customCategory ELSE e.category END), SUM(e.totalAmount) FROM Expense e WHERE e.group.groupId = :groupId AND e.status = 'APPROVED' AND e.isDeleted = false GROUP BY e.category, e.customCategory")
    List<Object[]> findGroupSpendingByCategory(@Param("groupId") Integer groupId);

    @Query("SELECT (CASE WHEN e.category = 'Other' THEN e.customCategory ELSE e.category END), SUM(e.totalAmount) FROM Expense e WHERE e.group.groupId = :groupId AND e.paidBy.userId = :userId AND e.status = 'APPROVED' AND e.isDeleted = false GROUP BY e.category, e.customCategory")
    List<Object[]> findMySpendingByCategory(@Param("groupId") Integer groupId, @Param("userId") Integer userId);

    @Query("SELECT (CASE WHEN e.category = 'Other' THEN e.customCategory ELSE e.category END), SUM(es.amountOwed) FROM ExpenseSplit es INNER JOIN es.expense e WHERE e.group.groupId = :groupId AND es.user.userId = :userId AND e.status = 'APPROVED' GROUP BY e.category, e.customCategory")
    List<Object[]> findMyShareByCategory(@Param("groupId") Integer groupId, @Param("userId") Integer userId);

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

    @Query("SELECT e FROM Expense e WHERE e.status = 'PENDING' AND e.objectionDeadline <= :now AND e.isDeleted = false")
    List<Expense> findExpiredPendingExpenses(@Param("now") java.time.LocalDateTime now);
}
