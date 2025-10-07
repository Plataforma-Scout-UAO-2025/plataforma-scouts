package uao.edu.co.scouts_project.medical.record.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uao.edu.co.scouts_project.medical.record.dto.CreateMedicalRecordDTO;
import uao.edu.co.scouts_project.medical.record.dto.MedicalRecordDTO;
import uao.edu.co.scouts_project.medical.record.dto.UpdateMedicalRecordDTO;
import uao.edu.co.scouts_project.medical.record.service.IMedicalRecordService;

@Tag(name = "Medical - Record", description = "Gestión ficha médica 1:1 por tenant_id y member_id")
@RestController
@RequestMapping(path = "/api/medical_record", produces = MediaType.APPLICATION_JSON_VALUE)
public class MedicalRecordController {

    private final IMedicalRecordService service;

    public MedicalRecordController(IMedicalRecordService service) {
        this.service = service;
    }

    @Operation(
        summary = "Crear ficha médica del member_id dentro del tenant",
        description = "Requiere header X-Tenant-Id (string) y memberId en el path"
    )
    @PostMapping(path = "/create_record/{memberId}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<MedicalRecordDTO> create(
            @Parameter(name = "X-Tenant-Id", description = "Identificador del tenant (organizationId del token)", required = true, in = ParameterIn.HEADER)
            @RequestHeader("X-Tenant-Id") String tenantId,
            @PathVariable Long memberId,
            @RequestBody CreateMedicalRecordDTO dto
    ) {
        return ResponseEntity.ok(service.crear(tenantId, memberId, dto));
    }

    @Operation(
        summary = "Obtener ficha médica por tenant y member",
        description = "Requiere header X-Tenant-Id (string) y memberId en el path"
    )
    @GetMapping("/list_record/{memberId}")
    public ResponseEntity<MedicalRecordDTO> get(
            @Parameter(name = "X-Tenant-Id", description = "Identificador del tenant (organizationId del token)", required = true, in = ParameterIn.HEADER)
            @RequestHeader("X-Tenant-Id") String tenantId,
            @PathVariable Long memberId
    ) {
        return ResponseEntity.ok(service.obtenerPorMember(tenantId, memberId));
    }

    @Operation(
        summary = "Actualizar (reemplazo completo) la ficha del member_id dentro del tenant",
        description = "Requiere header X-Tenant-Id (string) y memberId en el path"
    )
    @PutMapping(path = "/update_record/{memberId}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<MedicalRecordDTO> update(
            @Parameter(name = "X-Tenant-Id", description = "Identificador del tenant (organizationId del token)", required = true, in = ParameterIn.HEADER)
            @RequestHeader("X-Tenant-Id") String tenantId,
            @PathVariable Long memberId,
            @RequestBody UpdateMedicalRecordDTO dto
    ) {
        return ResponseEntity.ok(service.actualizar(tenantId, memberId, dto));
    }
}
