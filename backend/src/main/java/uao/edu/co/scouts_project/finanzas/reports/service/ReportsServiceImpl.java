package uao.edu.co.scouts_project.finanzas.reports.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Optional;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import uao.edu.co.scouts_project.finanzas.reports.dto.FinancialReport;
import uao.edu.co.scouts_project.finanzas.reports.dto.GenerateFinancialReportRequest;
import uao.edu.co.scouts_project.finanzas.reports.dto.ReportPayments;
import uao.edu.co.scouts_project.finanzas.reports.dto.ReportSummary;
import uao.edu.co.scouts_project.finanzas.reports.model.enums.ReportScope;
import uao.edu.co.scouts_project.finanzas.reports.repository.ReportsReadRepository;

@Service
@RequiredArgsConstructor
public class ReportsServiceImpl implements ReportsService {

  private final ReportsReadRepository repo;

  @Override
  public FinancialReport generateFinancialReport(String tenantId, GenerateFinancialReportRequest req) {

    var scope = req.getGenerated_for().name();
    var id    = req.getId();

    // Payments
    var paymentRows = repo.findPayments(
        tenantId, req.getStart_date(), req.getEnd_date(), scope, id
    );

    var payments = paymentRows.stream()
        .map(r -> ReportPayments.builder()
            .payment_id(r.getPaymentId())
            .fisrt_name(r.getFirstName())
            .last_name(r.getLastName())
            .amount(r.getAmount() == null ? BigDecimal.ZERO : r.getAmount())
            .paid_at(r.getPaidAt())
            .build())
        .toList();

    // Summary
    var summaryRow = repo.summarizeByStatus(
        tenantId, req.getStart_date(), req.getEnd_date(), scope, id
    );

    var summary = ReportSummary.builder()
        .income(nz(summaryRow.getIncome()))
        .pending(nz(summaryRow.getPending()))
        .overdue(nz(summaryRow.getOverdue()))
        .build();

    // Members metrics (solo si scope != MEMBER)
    Integer membersOk = null, membersOverdue = null;
    BigDecimal percentage = null;

    if (req.getGenerated_for() != ReportScope.MEMBER) {
      var counts = repo.countMembersOverdue(
          tenantId, req.getStart_date(), req.getEnd_date(), scope, id
      );
      int total = Optional.ofNullable(counts.getTotalMembers()).orElse(0);
      int overdue = Optional.ofNullable(counts.getMembersOverdue()).orElse(0);
      int ok = Math.max(total - overdue, 0);

      membersOk = ok;
      membersOverdue = overdue;
      percentage = total == 0
          ? BigDecimal.ZERO
          : BigDecimal.valueOf(ok)
              .multiply(BigDecimal.valueOf(100))
              .divide(BigDecimal.valueOf(total), 2, RoundingMode.HALF_UP);
    }

    return FinancialReport.builder()
        .financial_summary(summary)
        .members_ok(membersOk)
        .members_overdue(membersOverdue)
        .percentage(percentage)
        .payments(payments)
        .build();
  }

  private static BigDecimal nz(BigDecimal v) { return v == null ? BigDecimal.ZERO : v; }
}