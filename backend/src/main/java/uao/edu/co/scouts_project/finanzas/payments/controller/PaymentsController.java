package uao.edu.co.scouts_project.finanzas.payments.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.web.bind.annotation.*; // incluye @RequestBody de Spring
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;

import uao.edu.co.scouts_project.finanzas.payments.dto.AppendPaymentDto;
import uao.edu.co.scouts_project.finanzas.payments.dto.EstadoCuentaDto;
import uao.edu.co.scouts_project.finanzas.payments.dto.InstallmentPaymentDto;
import uao.edu.co.scouts_project.finanzas.payments.dto.PaymentRecordDto;
import uao.edu.co.scouts_project.finanzas.payments.service.PaymentsService;

@Tag(name = "Payments", description = "Endpoints de pagos y estado de cuenta del módulo de finanzas")
@RestController
@RequestMapping("/api/v1/finanzas/payments")
public class PaymentsController {

    private final PaymentsService service;

    public PaymentsController(PaymentsService service) {
        this.service = service;
    }

    @Operation(
        summary = "Miembros SCOUT con ≥1 installment por tenant",
        description = "Retorna los miembros con rol SCOUT del tenant indicado que tienen al menos un installment, incluyendo subgroup y section."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "OK",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = PaymentRecordDto.class)))),
        @ApiResponse(responseCode = "500", description = "Error interno",
            content = @Content)
    })
    @GetMapping("/members/{tenantId}")
    public ResponseEntity<List<PaymentRecordDto>> getMembersByTenant(
            @Parameter(name = "tenantId", in = ParameterIn.PATH, example = "org_6B3k4dao2Wf6eGxa")
            @PathVariable("tenantId") String tenantId
    ) {
        var out = service.listMembersWithInstallments(tenantId);
        return ResponseEntity.ok(out);
    }

    @Operation(
        summary = "Installments por miembro y tenant",
        description = "Retorna los installments del miembro indicado dentro del tenant, con nombre y descripción del concepto y (si aplica) último pago."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "OK",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = InstallmentPaymentDto.class)))),
        @ApiResponse(responseCode = "500", description = "Error interno",
            content = @Content)
    })
    @GetMapping("/installments/{tenantId}/{member_id}")
    public ResponseEntity<List<InstallmentPaymentDto>> getInstallmentsByMemberAndTenant(
            @Parameter(name = "tenantId", in = ParameterIn.PATH, example = "org_6B3k4dao2Wf6eGxa")
            @PathVariable("tenantId") String tenantId,
            @Parameter(name = "member_id", in = ParameterIn.PATH, example = "45")
            @PathVariable("member_id") Long memberId
    ) {
        var out = service.listInstallmentsByMember(tenantId, memberId);
        return ResponseEntity.ok(out);
    }

    @Operation(
        summary = "Agregar pago a un installment",
        description = "Inserta un pago en el campo JSONB `payments` del installment. Si el `payment_id` ya existe o el installment no existe para el tenant, responde 409. "
                    + "Además, valida que `payer_member_id` exista en el mismo tenant."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Creado",
            content = @Content(schema = @Schema(implementation = AppendPaymentDto.class))),
        @ApiResponse(responseCode = "400", description = "Bad Request (por ejemplo, `installment_id` del body no coincide con el path o falta `payer_member_id`)"),
        @ApiResponse(responseCode = "404", description = "Payer member no existe en el tenant"),
        @ApiResponse(responseCode = "409", description = "Conflicto (installment inexistente en tenant o `payment_id` duplicado)"),
        @ApiResponse(responseCode = "500", description = "Error interno")
    })
    @PostMapping("/{tenantId}/installments/{installmentId}/payments")
    public ResponseEntity<AppendPaymentDto> appendPayment(
            @Parameter(name = "tenantId", in = ParameterIn.PATH, example = "org_6B3k4dao2Wf6eGxa")
            @PathVariable String tenantId,
            @Parameter(name = "installmentId", in = ParameterIn.PATH, example = "3")
            @PathVariable Long installmentId,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                required = true,
                description = "Payload del pago a registrar",
                content = @Content(
                    schema = @Schema(implementation = AppendPaymentDto.class),
                    examples = @ExampleObject(name = "payment",
                        value = """
                                {
                                  "payment_id": "0aa9698a-92c0-4fa7-955c-043690822ae9",
                                  "installment_id": 3,
                                  "amount": 60000,
                                  "paid_at": "2025-10-23",
                                  "method": "PSE",
                                  "reference": "TRX-123",
                                  "payer_member_id": 1
                                }
                                """
                    )
                )
            )
            @RequestBody AppendPaymentDto body
    ) {
        service.appendPayment(tenantId, installmentId, body);
        return ResponseEntity.status(201).body(body);
    }

    @Operation(
        summary = "Estado de cuenta (Tesorería)",
        description = "Caso 2 (tesorero): retorna un objeto global con KPIs del mes, listado de cuotas y `members = null`."
    )
    @ApiResponse(responseCode = "200", description = "OK",
        content = @Content(schema = @Schema(implementation = EstadoCuentaDto.class)))
    @GetMapping("/status/{tenantId}")
    public ResponseEntity<EstadoCuentaDto> getAccountStatusForTenant(
            @Parameter(name = "tenantId", in = ParameterIn.PATH, example = "org_6B3k4dao2Wf6eGxa")
            @PathVariable String tenantId
    ) {
        var list = service.listAccountStatusForTenant(tenantId); // siempre 1 elemento
        return ResponseEntity.ok(list.get(0));
    }

    @Operation(
        summary = "Estado de cuenta (Acudiente)",
        description = "Caso 1 (acudiente): retorna un objeto global con KPIs del mes, listado de cuotas y `members[]` de los hijos asociados."
    )
    @ApiResponse(responseCode = "200", description = "OK",
        content = @Content(schema = @Schema(implementation = EstadoCuentaDto.class)))
    @GetMapping("/status/guardian/{tenantId}")
    public ResponseEntity<EstadoCuentaDto> getAccountStatusForGuardian(
            @Parameter(name = "tenantId", in = ParameterIn.PATH, example = "org_6B3k4dao2Wf6eGxa")
            @PathVariable String tenantId
    ) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        Long guardianId = service.getGuardianIdFromUserId(userId);
        System.out.println("Current Member ID: " + guardianId);
        var list = service.listAccountStatusForGuardian(tenantId, guardianId);
        return ResponseEntity.ok(list.get(0));
    }

}
