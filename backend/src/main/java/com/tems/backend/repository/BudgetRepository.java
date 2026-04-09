package com.tems.backend.repository;

import com.tems.backend.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Integer> {
    
    // Explicitly fetching bounds EXCLUSIVELY for a specific Isolated Group ID
    List<Budget> findByGroup_GroupId(Integer groupId);
    
}
