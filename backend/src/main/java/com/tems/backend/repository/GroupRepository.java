package com.tems.backend.repository;

import com.tems.backend.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

@Repository 
public interface GroupRepository extends JpaRepository<Group, Integer> {
    
    @Query("SELECT gm.group FROM GroupMember gm WHERE gm.user.userId = :userId AND gm.group.isDeleted = false")
    List<Group> findActiveGroupsByUserId(@Param("userId") Integer userId);
}
