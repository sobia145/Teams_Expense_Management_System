package com.tems.backend.repository;

import com.tems.backend.entity.Approval;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;
import com.tems.backend.entity.Expense;

@Repository 
public interface ApprovalRepository extends JpaRepository<Approval, Integer> {
    List<Approval> findByUser_UserIdAndStatus(Integer userId, String status);

    @Query("SELECT COUNT(a) FROM Approval a WHERE a.user.userId = :userId AND a.status = :status AND a.expense.group.isDeleted = false")
    long countByUser_UserIdAndStatus(@Param("userId") Integer userId, @Param("status") String status);
    
    @Query("SELECT a FROM Approval a WHERE a.user.userId = :userId AND a.status = :status AND EXISTS (SELECT g FROM Group g WHERE g.groupId = a.expense.group.groupId AND g.isDeleted = false)")
    List<Approval> findActivePendingApprovalsByUser(@Param("userId") Integer userId, @Param("status") String status);

    List<Approval> findByExpense_ExpenseId(Integer expenseId);

    long countByExpense_Group_GroupIdAndStatus(Integer groupId, String status);

    @Modifying
    @Transactional
    @Query("DELETE FROM Approval a WHERE a.expense.expenseId IN (SELECT e.expenseId FROM Expense e WHERE e.group.groupId = :groupId)")
    void deleteByGroupId(@Param("groupId") Integer groupId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Approval a WHERE a.expense.expenseId IN :expenseIds")
    void deleteByExpenseIds(@Param("expenseIds") List<Integer> expenseIds);

    @Modifying
    @Transactional
    void deleteByExpense(Expense expense);
}
