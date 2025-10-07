package uao.edu.co.scouts_project.finanzas.payments.repository.projection;

import java.math.BigDecimal;
import java.time.LocalDate;

public interface InstallmentWithConceptRow {
    Long getInstallment_id();
    LocalDate getDue_date();
    BigDecimal getAmount();
    String getStatus();
    String getConcept_name();
    String getConcept_desc();

    String getPayment_id();
    LocalDate getPaid_at();
    String getMethod();
    String getReference();
    Long getPayer_member_id();
}

