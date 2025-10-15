package uao.edu.co.scouts_project.finanzas.dashboard.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import uao.edu.co.scouts_project.finanzas.dashboard.dto.DashboardFinancieroDto;
import uao.edu.co.scouts_project.finanzas.dashboard.repository.projection.InstallmentStatusCount;
import uao.edu.co.scouts_project.finanzas.dashboard.repository.projection.SubgroupCompliance;
import uao.edu.co.scouts_project.finanzas.dashboard.service.impl.DashboardServiceImpl;
import uao.edu.co.scouts_project.finanzas.fees.repository.IInstallmentRepository;
import uao.edu.co.scouts_project.finanzas.payments.repository.IPaymentsReadRepository;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class DashboardServiceImplTest {

    private IInstallmentRepository installmentRepo;
    private IPaymentsReadRepository paymentRepo;
    private DashboardServiceImpl service;

    @BeforeEach
    void setUp() {
        installmentRepo = mock(IInstallmentRepository.class);
        paymentRepo     = mock(IPaymentsReadRepository.class);
        service = new DashboardServiceImpl(installmentRepo, paymentRepo);
    }

    @Test
    void getDashboardForTenant_happyPath() {
        String tenantId = "org_TEST";

        // KPIs
        when(installmentRepo.sumTotalPagadoByTenant(tenantId)).thenReturn(null); // totalOrZero -> 0
        when(installmentRepo.sumPendingByTenant(tenantId)).thenReturn(new BigDecimal("123456.78"));
        when(installmentRepo.countOverdueByTenant(tenantId)).thenReturn(7L);

        // Distribución: PAID=3, PENDING=1, OVERDUE=1 => 60/20/20
        var statusRows = List.of(
            isc("PAID", 3),
            isc("PENDING", 1),
            isc("OVERDUE", 1)
        );
        when(installmentRepo.countByStatusForTenant(tenantId)).thenReturn(statusRows);

        // Cumplimiento bottom-5: usar objetos que IMPLEMENTEN la interfaz SubgroupCompliance
        var compl = List.of(
            sc("Tropa", 88.444),
            sc("Manada", 95.0)
        );
        when(installmentRepo.findBottom5SubgroupCompliance(tenantId)).thenReturn(compl);

        // Morosos y últimos pagos (no usados en asserts, pero deben devolverse)
        when(installmentRepo.findTopDebtorsByTenant(tenantId)).thenReturn(List.of());
        when(paymentRepo.findRecentPaymentsByTenant(tenantId)).thenReturn(List.of());

        // Act
        DashboardFinancieroDto dto = service.getDashboardForTenant(tenantId);

        // Assert KPIs
        assertNotNull(dto);
        assertNotNull(dto.getKpis());
        assertEquals(new BigDecimal("0"), dto.getKpis().getTotal_recaudado());
        assertEquals(new BigDecimal("123456.78"), dto.getKpis().getTotal_pendiente());
        assertEquals(7L, dto.getKpis().getPagos_vencidos());

        // Assert Distribución
        assertNotNull(dto.getDistribucion_pagos());
        assertEquals(60.0, dto.getDistribucion_pagos().getPorcentaje_pagado(),    0.0001);
        assertEquals(20.0, dto.getDistribucion_pagos().getPorcentaje_pendiente(), 0.0001);
        assertEquals(20.0, dto.getDistribucion_pagos().getPorcentaje_vencido(),   0.0001);

        // Assert Cumplimiento (usar getters Lombok: getNombre(), getPorcentaje())
        assertNotNull(dto.getPorcentaje_cumplimiento());
        assertEquals(2, dto.getPorcentaje_cumplimiento().size());
        assertEquals("Tropa",  dto.getPorcentaje_cumplimiento().get(0).getNombre());
        assertEquals(88.44,    dto.getPorcentaje_cumplimiento().get(0).getPorcentaje(), 0.0001);
        assertEquals("Manada", dto.getPorcentaje_cumplimiento().get(1).getNombre());
        assertEquals(95.0,     dto.getPorcentaje_cumplimiento().get(1).getPorcentaje(), 0.0001);

        assertTrue(dto.getMiembros_mora().isEmpty());
        assertTrue(dto.getUltimos_pagos().isEmpty());

        // Verificar propagación de tenantId
        var cap = ArgumentCaptor.forClass(String.class);
        verify(installmentRepo).sumTotalPagadoByTenant(cap.capture());
        verify(installmentRepo).sumPendingByTenant(cap.capture());
        verify(installmentRepo).countOverdueByTenant(cap.capture());
        verify(installmentRepo).countByStatusForTenant(cap.capture());
        verify(installmentRepo).findBottom5SubgroupCompliance(cap.capture());
        verify(installmentRepo).findTopDebtorsByTenant(cap.capture());
        verify(paymentRepo).findRecentPaymentsByTenant(cap.capture());
        cap.getAllValues().forEach(v -> assertEquals(tenantId, v));

        verifyNoMoreInteractions(installmentRepo, paymentRepo);
    }

    // ===== Helpers =====

    private static InstallmentStatusCount isc(String status, long cnt) {
        return new InstallmentStatusCount() {
            @Override public String getStatus() { return status; }
            @Override public long getCnt() { return cnt; }
        };
    }

    private static SubgroupCompliance sc(String subgroupName, double pct) {
        // Retorna una implementación anónima de la interfaz de proyección
        return new SubgroupCompliance() {
            @Override public String getSubgroupName() { return subgroupName; }
            @Override public Double getPct() { return pct; }
        };
    }
}
