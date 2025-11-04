package uao.edu.co.scouts_project.finanzas.payments.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.Clock;
import java.time.Instant;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import uao.edu.co.scouts_project.finanzas.payments.dto.AppendPaymentDto;
import uao.edu.co.scouts_project.finanzas.payments.dto.EstadoCuentaDto;
import uao.edu.co.scouts_project.finanzas.payments.repository.IPaymentsReadRepository;
import uao.edu.co.scouts_project.finanzas.payments.repository.projection.InstallmentWithConceptAndMemberRow;
import uao.edu.co.scouts_project.finanzas.payments.repository.projection.InstallmentWithConceptRow;
import uao.edu.co.scouts_project.finanzas.payments.repository.projection.MemberWithGroupsRow;

@ExtendWith(MockitoExtension.class)
class PaymentsServiceTest {

    @Mock IPaymentsReadRepository repo;

    PaymentsService service;

    @org.junit.jupiter.api.BeforeEach
    void setup() {
        // Fixed clock matching the deterministic dates used in tests
        var fixedClock = Clock.fixed(Instant.parse("2025-11-15T00:00:00Z"), ZoneOffset.UTC);
        this.service = new PaymentsService(repo, null, fixedClock);
    }

    // ---- Helpers: implementaciones anónimas (sin Mockito) ----

    private MemberWithGroupsRow memberRow(long id, String fn, String ln,
                                          Integer age, Long subId, String subName,
                                          Long secId, String secName) {
        return new MemberWithGroupsRow() {
            public Long getMember_id()       { return id; }
            public String getFirst_name()    { return fn; }
            public String getLast_name()     { return ln; }
            public Integer getAge()          { return age; }
            public Long getSubgroup_id()     { return subId; }
            public String getSubgroup_name() { return subName; }
            public Long getSection_id()      { return secId; }
            public String getSection_name()  { return secName; }
        };
    }

    private InstallmentWithConceptRow instRow(Long id, LocalDate due, BigDecimal amount,
                                              String status, String cname, String cdesc,
                                              String payId, LocalDate paidAt, String method,
                                              String ref, Long payerId) {
        return new InstallmentWithConceptRow() {
            public Long getInstallment_id()     { return id; }
            public LocalDate getDue_date()      { return due; }
            public BigDecimal getAmount()       { return amount; }
            public String getStatus()           { return status; }
            public String getConcept_name()     { return cname; }
            public String getConcept_desc()     { return cdesc; }
            public String getPayment_id()       { return payId; }
            public LocalDate getPaid_at()       { return paidAt; }
            public String getMethod()           { return method; }
            public String getReference()        { return ref; }
            public Long getPayer_member_id()    { return payerId; }
        };
    }

    private InstallmentWithConceptAndMemberRow instMemberRow(
            Long instId, LocalDate due, BigDecimal amount, String status,
            String cname, String cdesc,
            String payId, LocalDate paidAt, String method, String ref, Long payerId,
            Long memberId, String fn, String ln,
            Long subgroupId, String subgroupName,
            Long sectionId, String sectionName
    ) {
        return new InstallmentWithConceptAndMemberRow() {
            public Long getInstallment_id()     { return instId; }
            public LocalDate getDue_date()      { return due; }
            public BigDecimal getAmount()       { return amount; }
            public String getStatus()           { return status; }
            public String getConcept_name()     { return cname; }
            public String getConcept_desc()     { return cdesc; }
            public String getPayment_id()       { return payId; }
            public LocalDate getPaid_at()       { return paidAt; }
            public String getMethod()           { return method; }
            public String getReference()        { return ref; }
            public Long getPayer_member_id()    { return payerId; }
            public Long getMember_id()          { return memberId; }
            public String getFirst_name()       { return fn; }
            public String getLast_name()        { return ln; }
            public Long getSubgroup_id()        { return subgroupId; }
            public String getSubgroup_name()    { return subgroupName; }
            public Long getSection_id()         { return sectionId; }
            public String getSection_name()     { return sectionName; }
        };
    }

    // ------------------ Tests ------------------

    @Test
    void listMembersWithInstallments_mapsFields() {
        when(repo.findScoutMembersWithInstallments("org_TENANT"))
                .thenReturn(List.of(
                        memberRow(45L, "Juan", "Pérez", 12, 6L, "Patrulla Tigres", 4L, "Webelos")
                ));

        var out = service.listMembersWithInstallments("org_TENANT");

        assertThat(out).hasSize(1);
        assertThat(out.get(0).getMember_id()).isEqualTo(45L);
        assertThat(out.get(0).getSubgroup().getName()).isEqualTo("Patrulla Tigres");
        assertThat(out.get(0).getSection().getId()).isEqualTo(4L);
        verify(repo).findScoutMembersWithInstallments("org_TENANT");
    }

    @Test
    void listInstallmentsByMember_mapsPaymentFields() {
        LocalDate d1 = LocalDate.of(2026, 1, 6);
        when(repo.findInstallmentsByMember("org_TENANT", 45L))
                .thenReturn(List.of(
                        instRow(3L, d1, new BigDecimal("15000"), "PAID",
                                "Sub", "Trimestral",
                                "p-1", LocalDate.of(2025,10,23), "PSE", "ref", 1L)
                ));

        var out = service.listInstallmentsByMember("org_TENANT", 45L);

        assertThat(out).hasSize(1);
        assertThat(out.get(0).getPayment_id()).isEqualTo("p-1");
        assertThat(out.get(0).getStatus()).isEqualTo("PAID");
        verify(repo).findInstallmentsByMember("org_TENANT", 45L);
    }

    @Test
    void appendPayment_success_returnsVoid() {
        var body = new AppendPaymentDto();
        body.setInstallment_id(3L);
        body.setPayment_id("p-1");
        body.setPayer_member_id(1L); // ← requerido ahora

        // El payer existe en el tenant
        when(repo.memberExistsInTenant("org_TENANT", 1L)).thenReturn(true);

        // El UPDATE JSONB afectó 1 fila
        when(repo.appendPayment("org_TENANT", 3L, "p-1", null, null, null, null, 1L))
                .thenReturn(1);

        service.appendPayment("org_TENANT", 3L, body);

        verify(repo).memberExistsInTenant("org_TENANT", 1L);
        verify(repo).appendPayment("org_TENANT", 3L, "p-1", null, null, null, null, 1L);
    }

    @Test
    void appendPayment_mismatch_throwsBadRequest() {
        var body = new AppendPaymentDto();
        body.setInstallment_id(99L); // distinto al del path

        var ex = assertThrows(ResponseStatusException.class,
                () -> service.appendPayment("org_TENANT", 3L, body));
        assertThat(ex.getStatusCode().value()).isEqualTo(400);
        assertThat(ex.getReason()).isEqualTo("installment_id mismatch");
        verify(repo, never()).appendPayment(any(), any(), any(), any(), any(), any(), any(), any());
    }

    @Test
    void appendPayment_updatedZero_throwsConflict() {
        var body = new AppendPaymentDto();
        body.setPayment_id("dup");
        body.setPayer_member_id(1L); // ← requerido ahora

        // El payer existe
        when(repo.memberExistsInTenant("org_TENANT", 1L)).thenReturn(true);

        // El UPDATE no afectó filas → conflicto (id duplicado o no existe installment)
        when(repo.appendPayment(eq("org_TENANT"), eq(3L), eq("dup"),
                any(), any(), any(), any(), eq(1L)))
            .thenReturn(0);

        var ex = assertThrows(ResponseStatusException.class,
                () -> service.appendPayment("org_TENANT", 3L, body));

        assertThat(ex.getStatusCode().value()).isEqualTo(409);

        verify(repo).memberExistsInTenant("org_TENANT", 1L);
        verify(repo).appendPayment(eq("org_TENANT"), eq(3L), eq("dup"),
                any(), any(), any(), any(), eq(1L));
    }

    @Test
    void listAccountStatusForTenant_buildsGlobalKpis() {
                        // Use fixed dates to avoid flakiness on month boundaries
                        LocalDate today = LocalDate.of(2025, 11, 15);
                        LocalDate yesterday = today.minusDays(1);
                        LocalDate twoMonthsAgo = today.minusMonths(2);

        when(repo.findAllInstallmentsForTenant("org_TENANT"))
                .thenReturn(List.of(
                        // PAID -> suma a totalPagado
                        instMemberRow(1L, today, new BigDecimal("100"), "PAID",
                                "C1","", "p1", today, "PSE", "", 1L,
                                45L, "Juan", "Pérez", 6L, "Patrulla Tigres", 4L, "Webelos"),
                        // PENDING en el mes actual y vencida (ayer)
                        instMemberRow(2L, yesterday, new BigDecimal("50"), "PENDING",
                                "C2","", null, null, null, null, null,
                                45L, "Juan", "Pérez", 6L, "Patrulla Tigres", 4L, "Webelos"),
                        // PENDING de hace 2 meses -> solo vencida
                        instMemberRow(3L, twoMonthsAgo, new BigDecimal("200"), "PENDING",
                                "C3","", null, null, null, null, null,
                                45L, "Juan", "Pérez", 6L, "Patrulla Tigres", 4L, "Webelos")
                ));

        var out = service.listAccountStatusForTenant("org_TENANT");

        assertThat(out).hasSize(1);
        EstadoCuentaDto e = out.get(0);
        assertThat(e.getKpis().getTotalPagado()).isEqualByComparingTo("100");
        assertThat(e.getKpis().getTotalPendiente()).isEqualByComparingTo("50");
        assertThat(e.getKpis().getCuotasVencidas()).isEqualTo(2);
        assertThat(e.getCuotas()).hasSize(3);
        assertThat(e.getMembers()).isNull();

        verify(repo).markOverdueForTenant("org_TENANT");
        verify(repo).markPaidWhereHasPayments("org_TENANT");
        verify(repo).findAllInstallmentsForTenant("org_TENANT");
    }

    @Test
    void listAccountStatusForGuardian_buildsKpis_andMembersArray() {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);

        when(repo.findAllInstallmentsForGuardian("org_TENANT", 1001L))
                .thenReturn(List.of(
                        instMemberRow(1L, today, new BigDecimal("10"), "PAID",
                                "C1","", "p1", today, "PSE", "", 1L,
                                77L, "Ana", "Ruiz", 3L, "Camada Luna", 2L, "Cachorros")
                ));

        var out = service.listAccountStatusForGuardian("org_TENANT", 1001L);

        assertThat(out).hasSize(1);
        var e = out.get(0);
        assertThat(e.getMembers()).isNotNull();
        assertThat(e.getMembers()).hasSize(1);
        assertThat(e.getMembers().get(0).getMember_id()).isEqualTo(77L);

        verify(repo).markPaidWhereHasPayments("org_TENANT");
        verify(repo).markOverdueForTenant("org_TENANT");
        verify(repo).findAllInstallmentsForGuardian("org_TENANT", 1001L);
    }

    @Test
    void appendPayment_payerNotFound_throws404() {
        var body = new AppendPaymentDto();
        body.setInstallment_id(3L);
        body.setPayment_id("p-404");
        body.setPayer_member_id(999L);

        when(repo.memberExistsInTenant("org_TENANT", 999L)).thenReturn(false);

        var ex = assertThrows(ResponseStatusException.class,
                () -> service.appendPayment("org_TENANT", 3L, body));

        assertThat(ex.getStatusCode().value()).isEqualTo(404);
        verify(repo, never()).appendPayment(any(), any(), any(), any(), any(), any(), any(), any());
    }
}
