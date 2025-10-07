package uao.edu.co.scouts_project.finanzas.fees.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import uao.edu.co.scouts_project.finanzas.fees.dto.*;
import uao.edu.co.scouts_project.finanzas.fees.service.IFeeService;

@Tag(name = "Fees", description = "Crear, editar, borrar y consultar Concept/FeePlan por tenant")
@RestController
@RequestMapping("/api/v1/finanzas/fees")
@RequiredArgsConstructor
public class FeesController {

  private final IFeeService feeService;

  @Operation(summary = "Crear Concept, FeePlan y los installments necesarios segun la periodicidad elegida, para este calculo son obligatorios las fechas inical y final")
@PostMapping
public ResponseEntity<?> create(@RequestBody CreateCuotaDto body) {
    try {
        CuotaDto created = feeService.create(body);
        return ResponseEntity.status(201).body(created);
    } catch (IllegalArgumentException ex) {
        // Devolver el mensaje exacto del error al cliente
        return ResponseEntity.badRequest().body(Map.of(
            "error", "bad_request",
            "message", ex.getMessage()
        ));
    }
}

  // -------- LIST: cuotas por tenant (con associatedTo) ----------
  @Operation(summary = "Listar cuotas de un tenant")
  @GetMapping("/{tenantId}")
  public List<CuotaDto> listFeesByTenant(@PathVariable String tenantId) {
    return feeService.listFeesByTenant(tenantId);
  }

  // -------- LIST: miembros por tenant (con jerarquía) ----------
  @Operation(summary = "Listar miembros Scout de un tenant")
  @GetMapping("/members/{tenantId}")
  public List<MemberPaymentDto> listMembersByTenant(@PathVariable String tenantId) {
    return feeService.listMembersByTenant(tenantId);
  }

  // -------- LIST: secciones por tenant ----------

  @GetMapping("/sections/{tenantId}")
  public List<IdNameDto> listSections(@PathVariable String tenantId) {
    return feeService.listSectionsByTenant(tenantId);
  }

  // -------- LIST: subgrupos por tenant ----------

  @GetMapping("/subgroups/{tenantId}")
  public List<IdNameDto> listSubgroups(@PathVariable String tenantId) {
    return feeService.listSubgroupsByTenant(tenantId);
  }

  @Operation(summary = "Editar atrbutos no disruptivos, si se necesita editar periodicidad, scope o fechas, se debe crear un nuevo fee_plan")
  @PatchMapping("/{tenantId}/{feePlanId}")
  public ResponseEntity<CuotaDto> patch(
    @PathVariable String tenantId,
    @PathVariable Long feePlanId,
    @RequestBody CuotaDto patchDto) {
    return ResponseEntity.ok(feeService.patch(feePlanId, patchDto, tenantId));
  }

  @Operation(summary = "Eliminar FeePlan/Concept/installment a partir del fee_plan_id, se eliminan todas las entidades relacionadas a el fee_plan, usar con cuidado.")
  @DeleteMapping("/{tenantId}/{feePlanId}")
  public ResponseEntity<Void> delete(
    @PathVariable String tenantId,
    @PathVariable Long feePlanId) {
    feeService.deleteFeePlan(feePlanId, tenantId);
    return ResponseEntity.noContent().build();
  }

}
