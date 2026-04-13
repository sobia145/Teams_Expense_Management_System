package com.tems.backend.repository;

import com.tems.backend.entity.GroupMember;
import com.tems.backend.entity.Group;
import com.tems.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, Integer> {
    List<GroupMember> findByGroup_GroupId(Integer groupId);
    List<GroupMember> findByUser_UserId(Integer userId);
    boolean existsByGroup_GroupIdAndUser_UserId(Integer groupId, Integer userId);
    
    @Query("SELECT COUNT(gm) FROM GroupMember gm WHERE gm.user.userId = :userId AND gm.group.isDeleted = false")
    long countByUser_UserId(@Param("userId") Integer userId);

    @Modifying
    @Transactional
    @Query("DELETE FROM GroupMember gm WHERE gm.group.groupId = :groupId")
    void deleteByGroupId(@Param("groupId") Integer groupId);

    @Modifying
    @Transactional
    void deleteByGroup_GroupId(Integer groupId);
}
