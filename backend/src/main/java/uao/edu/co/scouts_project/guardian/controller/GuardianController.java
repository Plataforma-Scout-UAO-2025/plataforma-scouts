package uao.edu.co.scouts_project.guardian.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import uao.edu.co.scouts_project.guardian.dto.in.GuardianCreateDTO;
import uao.edu.co.scouts_project.guardian.dto.out.GuardianWithMembersDTO;
import uao.edu.co.scouts_project.guardian.dto.shared.MemberDTO;
import uao.edu.co.scouts_project.guardian.service.GuardianService;

import java.util.List;

@RestController
@RequestMapping("/guardian")
public class GuardianController {
    private final GuardianService guardianService;

    public GuardianController(GuardianService guardianService) {
        this.guardianService = guardianService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<GuardianCreateDTO> getGuardianById(@PathVariable Long id) {
        GuardianCreateDTO guardian = guardianService.findGuardianById(id);
        return ResponseEntity.ok(guardian);
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<GuardianWithMembersDTO> getGuardianWithMembers(@PathVariable Long id) {
        GuardianWithMembersDTO guardianWithMembers = guardianService.findGuardianWithMembers(id);
        return ResponseEntity.ok(guardianWithMembers);
    }

    @GetMapping("/{guardianId}/members-list")
    public ResponseEntity<List<MemberDTO>> getMembersInChargeOf(@PathVariable Long guardianId) {
        List<MemberDTO> members = guardianService.findMembersInChargeOf(guardianId);
        return ResponseEntity.ok(members);
    }

    @PostMapping
    public ResponseEntity<Void> createGuardian(@RequestBody GuardianCreateDTO guardianCreateDTO) {
        guardianService.saveGuardian(guardianCreateDTO);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateGuardian(@PathVariable Long id,
            @RequestBody GuardianCreateDTO guardianCreateDTO) {
        guardianService.updateGuardianById(id, guardianCreateDTO);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{guardianId}/members/{memberId}")
    public ResponseEntity<Void> addMemberToGuardian(@PathVariable Long guardianId, @PathVariable Long memberId) {
        guardianService.addMemberToGuardian(guardianId, memberId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{guardianId}/members/{memberId}")
    public ResponseEntity<Void> removeMemberFromGuardian(@PathVariable Long guardianId, @PathVariable Long memberId) {
        guardianService.removeGuardianIdFromMember(guardianId, memberId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGuardian(@PathVariable Long id) {
        guardianService.deleteGuardianById(id);
        return ResponseEntity.noContent().build();
    }
}