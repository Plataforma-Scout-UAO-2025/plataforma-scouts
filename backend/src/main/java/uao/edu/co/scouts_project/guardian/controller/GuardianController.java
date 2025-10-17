package uao.edu.co.scouts_project.guardian.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import uao.edu.co.scouts_project.guardian.dto.in.GuardianCreateDTO;
import uao.edu.co.scouts_project.guardian.dto.out.GuardianCreateResponse;
import uao.edu.co.scouts_project.guardian.dto.out.GuardianWithMembersDTO;
import uao.edu.co.scouts_project.guardian.dto.shared.MemberDTO;
import uao.edu.co.scouts_project.guardian.service.GuardianService;

import java.util.List;

@Tag(name = "Acudiente", description = "Endpoints para la gestión de acudientes (guardianes) y sus miembros.")
@RestController
@RequestMapping("/api/v1/guardian")
public class GuardianController {
    private final GuardianService guardianService;

    public GuardianController(GuardianService guardianService) {
        this.guardianService = guardianService;
    }

    @Operation(
        summary = "Obtener acudiente por ID",
        description = "Recupera un acudiente (guardian) por su identificador único."
    )
    @ApiResponse(responseCode = "200", description = "Acudiente encontrado y retornado.")
    @ApiResponse(responseCode = "404", description = "Acudiente no encontrado.")
    @GetMapping("/{id}")
    public ResponseEntity<GuardianCreateDTO> getGuardianById(
        @Parameter(description = "ID del acudiente", required = true)
        @PathVariable @NotNull Long id) {
        GuardianCreateDTO guardian = guardianService.findGuardianById(id);
        return ResponseEntity.ok(guardian);
    }

    @Operation(
        summary = "Obtener acudiente con miembros",
        description = "Recupera un acudiente y la lista de miembros (scouts) a su cargo."
    )
    @ApiResponse(responseCode = "200", description = "Acudiente y miembros encontrados y retornados.")
    @ApiResponse(responseCode = "404", description = "Acudiente no encontrado.")
    @GetMapping("/{id}/members")
    public ResponseEntity<GuardianWithMembersDTO> getGuardianWithMembers(
        @Parameter(description = "ID del acudiente", required = true)
        @PathVariable @NotNull Long id) {
        GuardianWithMembersDTO guardianWithMembers = guardianService.findGuardianWithMembers(id);
        return ResponseEntity.ok(guardianWithMembers);
    }

    @Operation(
        summary = "Obtener miembros a cargo del acudiente",
        description = "Recupera la lista de miembros (scouts) que están a cargo de un acudiente."
    )
    @ApiResponse(responseCode = "200", description = "Lista de miembros retornada.")
    @ApiResponse(responseCode = "404", description = "Acudiente no encontrado.")
    @GetMapping("/{guardianId}/members-list")
    public ResponseEntity<List<MemberDTO>> getMembersInChargeOf(
        @Parameter(description = "ID del acudiente", required = true)
        @PathVariable @NotNull Long guardianId) {
        List<MemberDTO> members = guardianService.findMembersInChargeOf(guardianId);
        return ResponseEntity.ok(members);
    }

    @Operation(
        summary = "Crear un nuevo acudiente",
        description = "Registra un nuevo acudiente (guardian) en el sistema."
    )
    @ApiResponse(responseCode = "201", description = "Acudiente creado exitosamente.")
    @PostMapping
    public ResponseEntity<GuardianCreateResponse> createGuardian(
            @RequestBody @Valid GuardianCreateDTO guardianCreateDTO) {
        GuardianCreateResponse response = guardianService.saveGuardian(guardianCreateDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(
        summary = "Actualizar acudiente",
        description = "Actualiza los datos de un acudiente (guardian) existente."
    )
    @ApiResponse(responseCode = "200", description = "Acudiente actualizado exitosamente.")
    @ApiResponse(responseCode = "404", description = "Acudiente no encontrado.")
    @PutMapping("/{id}")
    public ResponseEntity<Void> updateGuardian(@PathVariable Long id,
            @RequestBody GuardianCreateDTO guardianCreateDTO) {
        guardianService.updateGuardianById(id, guardianCreateDTO);
        return ResponseEntity.ok().build();
    }

    @Operation(
        summary = "Agregar miembro a acudiente",
        description = "Asigna un miembro (scout) existente a un acudiente."
    )
    @ApiResponse(responseCode = "200", description = "Miembro agregado al acudiente exitosamente.")
    @ApiResponse(responseCode = "404", description = "Acudiente o miembro no encontrado.")
    @PostMapping("/{guardianId}/members/{memberId}")
    public ResponseEntity<Void> addMemberToGuardian(@PathVariable @NotNull Long guardianId,
            @PathVariable @NotNull Long memberId) {
        guardianService.addMemberToGuardian(guardianId, memberId);
        return ResponseEntity.ok().build();
    }

    @Operation(
        summary = "Remover miembro de acudiente",
        description = "Elimina un miembro (scout) de la responsabilidad de un acudiente."
    )
    @ApiResponse(responseCode = "204", description = "Miembro removido del acudiente exitosamente.")
    @ApiResponse(responseCode = "404", description = "Acudiente o miembro no encontrado.")
    @DeleteMapping("/{guardianId}/members/{memberId}")
    public ResponseEntity<Void> removeMemberFromGuardian(@PathVariable @NotNull Long guardianId,
            @PathVariable @NotNull Long memberId) {
        guardianService.removeGuardianIdFromMember(guardianId, memberId);
        return ResponseEntity.noContent().build();
    }

    @Operation(
        summary = "Eliminar acudiente",
        description = "Elimina un acudiente (guardian) del sistema."
    )
    @ApiResponse(responseCode = "204", description = "Acudiente eliminado exitosamente.")
    @ApiResponse(responseCode = "404", description = "Acudiente no encontrado.")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGuardian(@PathVariable @NotNull Long id) {
        guardianService.deleteGuardianById(id);
        return ResponseEntity.noContent().build();
    }
}