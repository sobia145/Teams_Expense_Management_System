package com.tems.backend.repository;

import com.tems.backend.entity.ExpenseSplit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import com.tems.backend.entity.Expense;
import java.util.List;

import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;

@Repository 
public interface ExpenseSplitRepository extends JpaRepository<ExpenseSplit, Integer> {
    java.util.List<ExpenseSplit> findByExpense_ExpenseId(Integer expenseId);

    @Modifying
    @Transactional
    @Query("DELETE FROM ExpenseSplit es WHERE es.expense.group.groupId = :groupId")
    void deleteByGroupId(@Param("groupId") Integer groupId);

    @Modifying
    @Transactional
    @Query("DELETE FROM ExpenseSplit es WHERE es.expense.expenseId IN :expenseIds")
    void deleteByExpenseIds(@Param("expenseIds") List<Integer> expenseIds);
}
