package com.tems.backend.repository;

import com.tems.backend.entity.Debt;
import com.tems.backend.entity.Group;
import com.tems.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;

@Repository
public interface DebtRepository extends JpaRepository<Debt, Integer> {
    List<Debt> findByGroup_GroupId(Integer groupId);
    List<Debt> findByGroup_GroupIdIn(List<Integer> groupIds);
    Optional<Debt> findByGroupAndDebtorAndCreditor(Group group, User debtor, User creditor);
    Optional<Debt> findByDebtor_UserIdAndCreditor_UserIdAndGroup_GroupId(Integer debtorId, Integer creditorId, Integer groupId);
    
    long countByDebtor_UserId(Integer debtorId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Debt d WHERE d.group.groupId = :groupId")
    void deleteByGroupId(@Param("groupId") Integer groupId);

    @Modifying
    @Transactional
    void deleteByGroup_GroupId(Integer groupId);
}
