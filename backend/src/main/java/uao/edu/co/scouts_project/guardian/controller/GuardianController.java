package uao.edu.co.scouts_project.guardian.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import uao.edu.co.scouts_project.guardian.dto.in.GuardianCreateDTO;
import uao.edu.co.scouts_project.guardian.dto.shared.MemberDTO;
import uao.edu.co.scouts_project.guardian.service.GuardianService;

import java.util.List;

@RestController
@RequestMapping("/api/members")
public class GuardianController {
    private final GuardianService memberService;

    public GuardianController(GuardianService memberService) {
        this.memberService = memberService;
    }
    // ======= ENDPOINTS PARA MEMBER =======


    // Listar todos los guardians
    @GetMapping("/guardians/list")
    public ResponseEntity<List<GuardianCreateDTO>> getAllGuardians() {
        return ResponseEntity.ok(memberService.findAllGuardians());
    }

    // Listar guardian por id
    @GetMapping("/guardians/{id}")
    public ResponseEntity<GuardianCreateDTO> getGuardianById(@PathVariable String id) {
        GuardianCreateDTO guardian = memberService.findGuardianById(id);
        if (guardian != null) {
            return ResponseEntity.ok(guardian);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

    }

    // Listar guardians por estado
    @GetMapping("/guardians/by_status")
    public ResponseEntity<List<GuardianCreateDTO>> getGuardiansByStatus(@RequestParam boolean active) {
        return ResponseEntity.ok(memberService.findGuardiansByStatus(active));
    }

    // Crear un nuevo guardian
    @PostMapping("/guardians/create")
    public ResponseEntity<GuardianCreateDTO> createGuardian(@RequestBody GuardianCreateDTO guardianCreateDTO) {
        GuardianCreateDTO createdGuardian = memberService.saveGuardian(guardianCreateDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdGuardian);
    }

    // Actualizar guardian por id
    @PutMapping("/guardians/{id}")
    public ResponseEntity<GuardianCreateDTO> updateGuardian(@PathVariable String id, @RequestBody GuardianCreateDTO guardianCreateDTO) {
        GuardianCreateDTO updatedGuardian = memberService.updateGuardianById(id, guardianCreateDTO);
        if (updatedGuardian != null) {
            return ResponseEntity.ok(updatedGuardian);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

    }

    // Añadir miembro al guardian
    @PostMapping("/guardians/{guardianId}/add-member/{memberId}")
    public ResponseEntity<GuardianCreateDTO> addMemberToGuardian(@PathVariable String guardianId, @PathVariable String memberId) {
        GuardianCreateDTO updatedGuardian = memberService.addMemberToGuardian(guardianId, memberId);
        if (updatedGuardian != null) {
            return ResponseEntity.ok(updatedGuardian);
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
    }

    // Remover miembro del guardian
    @DeleteMapping("/guardians/{guardianId}/remove-member/{memberId}")
    public ResponseEntity<GuardianCreateDTO> removeMemberFromGuardian(@PathVariable String guardianId, @PathVariable String memberId) {
        GuardianCreateDTO updatedGuardian = memberService.removeMemberFromGuardian(guardianId, memberId);
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
    public ResponseEntity<List<MemberDTO>> getAvailableMembers() {
        return ResponseEntity.ok(memberService.findAvailableMembers());
    }
}