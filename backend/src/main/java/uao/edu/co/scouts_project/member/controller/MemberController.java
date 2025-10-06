package uao.edu.co.scouts_project.member.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import uao.edu.co.scouts_project.member.dto.MemberCreateDTO;
import uao.edu.co.scouts_project.member.dto.MemberResponseDTO;
import uao.edu.co.scouts_project.member.dto.GuardianDTO;
import uao.edu.co.scouts_project.member.dto.GuardianCreateDTO;
import uao.edu.co.scouts_project.member.dto.MemberSummaryDTO;
import uao.edu.co.scouts_project.member.service.MemberService;

import java.util.List;

@RestController
@RequestMapping("/api/members")
public class MemberController {
    private final MemberService memberService;

    public MemberController(MemberService memberService) {
        this.memberService = memberService;
    }
    // ======= ENDPOINTS PARA MEMBER =======

    // Listar todos los miembros (excluyendo guardians)
    @GetMapping("/list_members")
    public ResponseEntity<List<MemberResponseDTO>> getAllMembers() {
        return ResponseEntity.ok(memberService.findAll());
    }

    // Listar miembro por id
    @GetMapping("/list_member_by_id/{id}")
    public ResponseEntity<MemberResponseDTO> getMemberById(@PathVariable String id) {
        MemberResponseDTO member = memberService.findMemberById(id);
        if (member != null) {
            return ResponseEntity.ok(member);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

    }

    // Listar miembros por estado (activo/inactivo)
    @GetMapping("/list_members_by_status")
    public ResponseEntity<List<MemberResponseDTO>> getMembersByStatus(@RequestParam boolean active) {
        return ResponseEntity.ok(memberService.findMemberByStatus(active));
    }

    // Crear un nuevo miembro
    @PostMapping("/create_member")
    public ResponseEntity<MemberResponseDTO> createMember(@RequestBody MemberCreateDTO memberCreateDTO) {
        MemberResponseDTO createdMember = memberService.saveMember(memberCreateDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdMember);
    }

    // Actualizar miembro por id
    @PutMapping("/update_member/{id}")
    public ResponseEntity<MemberResponseDTO> updateMember(@PathVariable String id, @RequestBody MemberCreateDTO memberCreateDTO) {
        MemberResponseDTO updatedMember = memberService.updateMemberById(id, memberCreateDTO);
        if (updatedMember != null) {
            return ResponseEntity.ok(updatedMember);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

    }

    // Actualizar estado del miembro (activo/inactivo)
    @PatchMapping("/update_member_status/{id}")
    public ResponseEntity<MemberResponseDTO> updateMemberStatus(@PathVariable String id, @RequestParam boolean active) {
        MemberResponseDTO updatedMember = memberService.updateMemberStatus(id, active);
        if (updatedMember != null) {
            return ResponseEntity.ok(updatedMember);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    // Actualizar rol del miembro
    @PatchMapping("/update_member_role/{id}")
    public ResponseEntity<MemberResponseDTO> updateMemberRole(@PathVariable String id, @RequestParam String newRole) {
        MemberResponseDTO updatedMember = memberService.updateMemberRole(id, newRole);
        if (updatedMember != null) {
            return ResponseEntity.ok(updatedMember);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

    }

    // Eliminar miembro
    @DeleteMapping("/delete_member/{id}")
    public ResponseEntity<Void> deleteMember(@PathVariable String id) {
        boolean deleted = memberService.deleteMemberById(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

    }

    // ======= ENDPOINTS PARA GUARDIAN =======

    // Listar todos los guardians
    @GetMapping("/guardians/list")
    public ResponseEntity<List<GuardianDTO>> getAllGuardians() {
        return ResponseEntity.ok(memberService.findAllGuardians());
    }

    // Listar guardian por id
    @GetMapping("/guardians/{id}")
    public ResponseEntity<GuardianDTO> getGuardianById(@PathVariable String id) {
        GuardianDTO guardian = memberService.findGuardianById(id);
        if (guardian != null) {
            return ResponseEntity.ok(guardian);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

    }

    // Listar guardians por estado
    @GetMapping("/guardians/by_status")
    public ResponseEntity<List<GuardianDTO>> getGuardiansByStatus(@RequestParam boolean active) {
        return ResponseEntity.ok(memberService.findGuardiansByStatus(active));
    }

    // Crear un nuevo guardian
    @PostMapping("/guardians/create")
    public ResponseEntity<GuardianDTO> createGuardian(@RequestBody GuardianCreateDTO guardianCreateDTO) {
        GuardianDTO createdGuardian = memberService.saveGuardian(guardianCreateDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdGuardian);
    }

    // Actualizar guardian por id
    @PutMapping("/guardians/{id}")
    public ResponseEntity<GuardianDTO> updateGuardian(@PathVariable String id, @RequestBody GuardianCreateDTO guardianCreateDTO) {
        GuardianDTO updatedGuardian = memberService.updateGuardianById(id, guardianCreateDTO);
        if (updatedGuardian != null) {
            return ResponseEntity.ok(updatedGuardian);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

    }

    // Añadir miembro al guardian
    @PostMapping("/guardians/{guardianId}/add-member/{memberId}")
    public ResponseEntity<GuardianDTO> addMemberToGuardian(@PathVariable String guardianId, @PathVariable String memberId) {
        GuardianDTO updatedGuardian = memberService.addMemberToGuardian(guardianId, memberId);
        if (updatedGuardian != null) {
            return ResponseEntity.ok(updatedGuardian);
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
    }

    // Remover miembro del guardian
    @DeleteMapping("/guardians/{guardianId}/remove-member/{memberId}")
    public ResponseEntity<GuardianDTO> removeMemberFromGuardian(@PathVariable String guardianId, @PathVariable String memberId) {
        GuardianDTO updatedGuardian = memberService.removeMemberFromGuardian(guardianId, memberId);
        if (updatedGuardian != null) {
            return ResponseEntity.ok(updatedGuardian);
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
    }

    // Eliminar guardian (con cascada)
    @DeleteMapping("/guardians/{id}")
    public ResponseEntity<Void> deleteGuardian(@PathVariable String id) {
        boolean deleted = memberService.deleteGuardianById(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    // Listar miembros disponibles para asignar a guardian
    @GetMapping("/available-for-guardian")
    public ResponseEntity<List<MemberSummaryDTO>> getAvailableMembers() {
        return ResponseEntity.ok(memberService.findAvailableMembers());
    }
}