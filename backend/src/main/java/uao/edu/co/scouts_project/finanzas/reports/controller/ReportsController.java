package uao.edu.co.scouts_project.finanzas.reports.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import uao.edu.co.scouts_project.finanzas.reports.dto.FinancialReport;
import uao.edu.co.scouts_project.finanzas.reports.dto.GenerateFinancialReportRequest;
import uao.edu.co.scouts_project.finanzas.reports.service.ReportsService;

@RestController
@RequestMapping("/api/v1/finanzas/reports")
@RequiredArgsConstructor
public class ReportsController {

  private final ReportsService reportsService;

  @PostMapping("/{tenantId}")
  public FinancialReport generate(
      @PathVariable String tenantId,
      @RequestBody @Valid GenerateFinancialReportRequest req
  ) {
    if (req.getStart_date().isAfter(req.getEnd_date())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "start_date > end_date");
    }

    // pasa tenantId al servicio
    return reportsService.generateFinancialReport(tenantId, req);
  }
}
