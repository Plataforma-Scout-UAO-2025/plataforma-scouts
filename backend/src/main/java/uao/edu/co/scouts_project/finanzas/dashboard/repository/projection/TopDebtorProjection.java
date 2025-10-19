package uao.edu.co.scouts_project.finanzas.dashboard.repository.projection;

import java.math.BigDecimal;

/**
 * Proyección ligera para el top de deudores del dashboard.
 */
public interface TopDebtorProjection {
    Long getMemberId();
    String getFirstName();
    String getLastName();
    String getSubgroupName();  
    BigDecimal getAmountDebt();
}
