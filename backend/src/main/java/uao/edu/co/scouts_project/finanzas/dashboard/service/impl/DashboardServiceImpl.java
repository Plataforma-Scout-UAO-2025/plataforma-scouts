package uao.edu.co.scouts_project.finanzas.dashboard.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uao.edu.co.scouts_project.finanzas.dashboard.dto.*;
import uao.edu.co.scouts_project.finanzas.dashboard.repository.projection.InstallmentStatusCount;
import uao.edu.co.scouts_project.finanzas.dashboard.service.DashboardService;
import uao.edu.co.scouts_project.finanzas.fees.repository.IInstallmentRepository;
import uao.edu.co.scouts_project.finanzas.payments.repository.IPaymentsReadRepository;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final IInstallmentRepository installmentRepo;
    private final IPaymentsReadRepository paymentRepo;

        @Transactional
        public void normalizeOverdues(String tenantId) {
        installmentRepo.markPastDueAsOverdue(tenantId);
        }

        @Transactional(readOnly = true)
        @Override
        public DashboardFinancieroDto getDashboardForTenant(String tenantId) {

        // === KPIs ===
        BigDecimal totalRecaudado = installmentRepo.sumTotalPagadoByTenant(tenantId);
        BigDecimal totalPendiente = installmentRepo.sumPendingByTenant(tenantId);
        long pagosVencidos = installmentRepo.countOverdueByTenant(tenantId);

        var kpis = DashboardFinancieroDto.KpisDto.builder()
                .total_recaudado(totalOrZero(totalRecaudado))
                .total_pendiente(totalOrZero(totalPendiente))
                .pagos_vencidos(pagosVencidos)
                .build();

        // === Distribución de pagos (porcentaje por estado) ===
        var counts = installmentRepo.countByStatusForTenant(tenantId);
        long total = counts.stream().mapToLong(InstallmentStatusCount::getCnt).sum();
        double pctPaid = 0, pctPending = 0, pctOverdue = 0;

        if (total > 0) {
                for (var row : counts) {
                switch (row.getStatus()) {
                        case "PAID"    -> pctPaid    = (row.getCnt() * 100.0) / total;
                        case "PENDING" -> pctPending = (row.getCnt() * 100.0) / total;
                        case "OVERDUE" -> pctOverdue = (row.getCnt() * 100.0) / total;
                        default -> { /* ignora otros estados si existieran */ }
                }
                }
        }

        var distribucion = DashboardFinancieroDto.DistribucionPagosDto.builder()
                .porcentaje_pagado(round2(pctPaid))
                .porcentaje_pendiente(round2(pctPending))
                .porcentaje_vencido(round2(pctOverdue))
                .build();

        // === Cumplimiento por subgrupo (Bottom-5) ===
        var bottom5 = installmentRepo.findBottom5SubgroupCompliance(tenantId);
        var cumplimiento = bottom5.stream()
                .map(r -> new DashboardFinancieroDto.PorcentajeCumplimientoDto(
                        r.getSubgroupName(), round2(r.getPct())))
                .toList();

        // === Miembros morosos ===
        var morosos = installmentRepo.findTopDebtorsByTenant(tenantId);

        // === Últimos pagos ===
        var ultimos = paymentRepo.findRecentPaymentsByTenant(tenantId);

        return DashboardFinancieroDto.builder()
                .kpis(kpis)
                .distribucion_pagos(distribucion)
                .porcentaje_cumplimiento(cumplimiento)
                .miembros_mora(morosos)
                .ultimos_pagos(ultimos)
                .build();
        }

        private static BigDecimal totalOrZero(BigDecimal v) {
        return v != null ? v : BigDecimal.ZERO;
        }

        private static double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
        }

}
