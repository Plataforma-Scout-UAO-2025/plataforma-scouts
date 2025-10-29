package uao.edu.co.scouts_project.finanzas.reports.service;

import uao.edu.co.scouts_project.finanzas.reports.dto.FinancialReport;
import uao.edu.co.scouts_project.finanzas.reports.dto.GenerateFinancialReportRequest;

public interface ReportsService {
  FinancialReport generateFinancialReport(String tenantId, GenerateFinancialReportRequest req);
}
