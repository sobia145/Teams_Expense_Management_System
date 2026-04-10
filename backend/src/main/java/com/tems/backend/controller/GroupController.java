package com.tems.backend.controller;

import com.tems.backend.entity.Group;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.tems.backend.service.GroupService;
import java.util.List;

@RestController
@RequestMapping("/api/groups")
public class GroupController {

    @Autowired
    private GroupService groupService;
    
    @Autowired
    private com.tems.backend.repository.GroupMemberRepository groupMemberRepository;

    // GET http://localhost:8080/api/groups/1/members
    @GetMapping("/{groupId}/members")
    public ResponseEntity<List<com.tems.backend.entity.User>> getGroupMembers(@PathVariable Integer groupId) {
        List<com.tems.backend.entity.User> members = groupMemberRepository.findByGroup_GroupId(groupId)
            .stream().map(com.tems.backend.entity.GroupMember::getUser).toList();
        return ResponseEntity.ok(members);
    }

    // GET http://localhost:8080/api/groups/user/1
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Group>> getUserGroups(@PathVariable Integer userId) {
        return ResponseEntity.ok(groupService.getGroupsForUser(userId));
    }
    
    // POST http://localhost:8080/api/groups/create/1
    @PostMapping("/create/{userId}")
    public ResponseEntity<Group> createGroup(@RequestBody com.tems.backend.dto.GroupRequest request, @PathVariable Integer userId) {
        return ResponseEntity.ok(groupService.createGroup(request, userId));
    }
    
    // GET http://localhost:8080/api/groups/admin
    @GetMapping("/admin")
    public ResponseEntity<List<Group>> getAllGroups() {
        // Automatically bypasses logical array intersections!
        return ResponseEntity.ok(groupService.getAllGroups());
    }
    
    // DELETE http://localhost:8080/api/groups/{groupId}
    @DeleteMapping("/{groupId}")
    public ResponseEntity<String> deleteGroup(@PathVariable Integer groupId, @RequestParam Integer userId) {
        groupService.deleteGroup(groupId, userId);
        return ResponseEntity.ok("Group logically deleted successfully");
    }

    // PUT http://localhost:8080/api/groups/{groupId}/lock
    @PutMapping("/{groupId}/lock")
    public ResponseEntity<Group> lockGroup(@PathVariable Integer groupId) {
        return ResponseEntity.ok(groupService.lockGroup(groupId));
    }
}
