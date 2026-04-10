package com.tems.backend.repository;

import com.tems.backend.entity.BudgetAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BudgetAlertRepository extends JpaRepository<BudgetAlert, Integer> {
}
