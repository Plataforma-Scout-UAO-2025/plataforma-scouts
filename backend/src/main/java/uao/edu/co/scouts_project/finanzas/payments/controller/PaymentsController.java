package uao.edu.co.scouts_project.finanzas.payments.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import uao.edu.co.scouts_project.finanzas.payments.dto.AppendPaymentDto;
import uao.edu.co.scouts_project.finanzas.payments.dto.EstadoCuentaDto;
import uao.edu.co.scouts_project.finanzas.payments.dto.InstallmentPaymentDto;
import uao.edu.co.scouts_project.finanzas.payments.dto.PaymentRecordDto;
import uao.edu.co.scouts_project.finanzas.payments.service.PaymentsService;

@RestController
@RequestMapping("/api/v1/finanzas/payments")
public class PaymentsController {

    private final PaymentsService service;

    public PaymentsController(PaymentsService service) {
        this.service = service;
    }

    // GET members by tenant (solo SCOUT con ≥1 installment)
    @GetMapping("/members/{tenantId}")
    public ResponseEntity<List<PaymentRecordDto>> getMembersByTenant(
            @PathVariable("tenantId") String tenantId
    ) {
        var out = service.listMembersWithInstallments(tenantId);
        return ResponseEntity.ok(out);
    }

    // GET installments by member & tenant (con concept name/desc)
    @GetMapping("/installments/{tenantId}/{member_id}")
    public ResponseEntity<List<InstallmentPaymentDto>> getInstallmentsByMemberAndTenant(
            @PathVariable("tenantId") String tenantId,
            @PathVariable("member_id") Long memberId
    ) {
        var out = service.listInstallmentsByMember(tenantId, memberId);
        return ResponseEntity.ok(out);
    }

        @PostMapping("/{tenantId}/installments/{installmentId}/payments")
    public ResponseEntity<AppendPaymentDto> appendPayment(
            @PathVariable String tenantId,
            @PathVariable Long installmentId,
            @RequestBody AppendPaymentDto body
    ) {
        service.appendPayment(tenantId, installmentId, body);
        return ResponseEntity.status(201).body(body); // devolvemos lo insertado
    }

    @GetMapping("/status/{tenantId}")
    public ResponseEntity<List<EstadoCuentaDto>> getAccountStatusForTenant(
            @PathVariable String tenantId
    ) {
        var out = service.listAccountStatusForTenant(tenantId);
        return ResponseEntity.ok(out);
    }

    @GetMapping("/status/{tenantId}/{guardianId}")
    public ResponseEntity<List<EstadoCuentaDto>> getAccountStatusForGuardian(
            @PathVariable String tenantId,
            @PathVariable Long guardianId
    ) {
        var out = service.listAccountStatusForGuardian(tenantId, guardianId);
        return ResponseEntity.ok(out);
    }

}
