package com.tems.backend.repository;

import com.tems.backend.entity.Approval;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository 
public interface ApprovalRepository extends JpaRepository<Approval, Integer> {
    List<Approval> findByUser_UserIdAndStatus(Integer userId, String status);
    List<Approval> findByExpense_ExpenseId(Integer expenseId);
}
