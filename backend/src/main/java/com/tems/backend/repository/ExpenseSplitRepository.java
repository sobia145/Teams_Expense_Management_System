package com.tems.backend.repository;

import com.tems.backend.entity.ExpenseSplit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository 
public interface ExpenseSplitRepository extends JpaRepository<ExpenseSplit, Integer> {}
