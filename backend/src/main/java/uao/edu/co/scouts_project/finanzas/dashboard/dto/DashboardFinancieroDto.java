package uao.edu.co.scouts_project.finanzas.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import uao.edu.co.scouts_project.finanzas.dashboard.repository.projection.RecentPaymentProjection;
import uao.edu.co.scouts_project.finanzas.dashboard.repository.projection.TopDebtorProjection;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardFinancieroDto {

    private KpisDto kpis;
    private List<PorcentajeCumplimientoDto> porcentaje_cumplimiento;
    private List<RecentPaymentProjection> ultimos_pagos;
    private List<TopDebtorProjection> miembros_mora;
    private DistribucionPagosDto distribucion_pagos;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class KpisDto {
        private BigDecimal total_recaudado;
        private BigDecimal total_pendiente;
        private long pagos_vencidos;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PorcentajeCumplimientoDto {
        private String nombre;
        private double porcentaje;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DistribucionPagosDto {
        private double porcentaje_pagado;
        private double porcentaje_pendiente;
        private double porcentaje_vencido;
    }
}
