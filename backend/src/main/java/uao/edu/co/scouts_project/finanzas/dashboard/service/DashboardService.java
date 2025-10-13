package uao.edu.co.scouts_project.finanzas.dashboard.service;

import uao.edu.co.scouts_project.finanzas.dashboard.dto.DashboardFinancieroDto;

public interface DashboardService {
    DashboardFinancieroDto getDashboardForTenant(String tenantId);
}
