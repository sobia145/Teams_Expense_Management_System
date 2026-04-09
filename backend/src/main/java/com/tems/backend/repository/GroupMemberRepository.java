package com.tems.backend.repository;

import com.tems.backend.entity.GroupMember;
import com.tems.backend.entity.Group;
import com.tems.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, Integer> {
    List<GroupMember> findByGroup_GroupId(Integer groupId);
}
